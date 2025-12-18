import { Client, LocalAuth, type Chat, type ClientInfo, type Contact, type Message } from 'whatsapp-web.js';
import { app, type WebContents } from 'electron';
import path from 'path';
import fs from 'fs';
import { getChromiumPath } from '../services/browserDownloader';
import { EventEmitter } from '../services/EventEmitter';

export type WhatsAppStatus =
    | 'idle'
    | 'downloading-browser'
    | 'initializing'
    | 'qr'
    | 'authenticated'
    | 'ready'
    | 'auth_failure'
    | 'disconnected'
    | 'error';

interface WhatsAppState {
    status: WhatsAppStatus;
    qr?: string;
    user?: ClientInfo & { profilePic: string | null };
    chats: Chat[];
    contacts: Contact[];
    error?: string;
    downloadProgress?: number;
}

export class WhatsAppController extends EventEmitter {
    private client: Client | null = null;
    private state: WhatsAppState = {
        status: 'idle',
        chats: [],
        contacts: [],
    };
    private sessionPath: string;
    private isInitializing = false;

    constructor() {
        super();
        const userDataPath = app.getPath('userData');
        this.sessionPath = path.join(userDataPath, 'wwebjs_auth');
    }

    async initialize(webContents: WebContents): Promise<void> {
        if (this.isInitializing) {
            console.log('[WhatsApp] Already initializing, skipping...');
            this.syncState(webContents);
            return;
        }

        if (this.client && this.state.status === 'ready') {
            console.log('[WhatsApp] Client already ready, syncing state...');
            this.syncState(webContents);
            return;
        }

        this.isInitializing = true;

        try {
            await this.downloadBrowser(webContents);
            await this.createClient(webContents);
        } catch (error: any) {
            console.error('[WhatsApp] Initialization failed:', error);
            this.updateState({ status: 'error', error: error.message });
            this.emit('whatsapp-status', this.state, webContents);
            this.isInitializing = false;
        }
    }

    private async downloadBrowser(webContents: WebContents): Promise<string> {
        this.updateState({ status: 'downloading-browser', downloadProgress: 0 });
        this.emit('whatsapp-status', this.state, webContents);

        const execPath = await getChromiumPath((progress) => {
            this.updateState({ downloadProgress: progress });
            this.emit('whatsapp-status', this.state, webContents);
        });

        console.log('[WhatsApp] Browser ready at:', execPath);
        return execPath;
    }

    private async createClient(webContents: WebContents): Promise<void> {
        this.updateState({ status: 'initializing' });
        this.emit('whatsapp-status', this.state, webContents);

        const execPath = await getChromiumPath(() => {});

        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'wweb-worker',
                dataPath: this.sessionPath,
            }),
            puppeteer: {
                executablePath: execPath,
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });

        this.setupClientEvents(webContents);
        await this.client.initialize();
    }

    private setupClientEvents(webContents: WebContents): void {
        if (!this.client) return;

        this.client.on('qr', (qr) => {
            console.log('[WhatsApp] QR received');
            this.updateState({ status: 'qr', qr });
            this.emit('whatsapp-status', this.state, webContents);
        });

        this.client.on('authenticated', () => {
            console.log('[WhatsApp] Authenticated');
            this.updateState({ status: 'authenticated' });
            this.emit('whatsapp-status', this.state, webContents);
        });

        this.client.on('ready', async () => {
            console.log('[WhatsApp] Client ready');
            await this.loadClientData(webContents);
            this.isInitializing = false;
        });

        this.client.on('message_create', (msg) => {
            this.handleNewMessage(msg, webContents);
        });

        this.client.on('chat_removed', (chat) => {
            this.state.chats = this.state.chats.filter((c) => c.id._serialized !== chat.id._serialized);
            this.emit('whatsapp-chats', this.state.chats, webContents);
        });

        this.client.on('chat_archived', async () => {
            if (!this.client) return;
            this.state.chats = await this.client.getChats();
            this.emit('whatsapp-chats', this.state.chats, webContents);
        });

        this.client.on('auth_failure', (msg) => {
            console.error('[WhatsApp] Auth failure:', msg);
            this.updateState({ status: 'auth_failure', error: msg });
            this.emit('whatsapp-status', this.state, webContents);
            this.isInitializing = false;
        });

        this.client.on('disconnected', (reason) => {
            console.log('[WhatsApp] Disconnected:', reason);
            this.updateState({ status: 'disconnected', error: reason });
            this.emit('whatsapp-status', this.state, webContents);
        });
    }

    private async loadClientData(webContents: WebContents): Promise<void> {
        if (!this.client) return;

        const userInfo = this.client.info;
        let profilePic: string | null = null;

        try {
            profilePic = await this.client.getProfilePicUrl(userInfo.wid._serialized);
        } catch (err) {
            console.log('[WhatsApp] Could not get profile picture');
        }

        const user = { ...userInfo, profilePic };
        const chats = await this.client.getChats();
        // const contacts = await this.client.getContacts();

        this.updateState({
            status: 'ready',
            user,
            chats,
            // contacts,
        });

        this.emit('whatsapp-user', user, webContents);
        this.emit('whatsapp-chats', chats, webContents);
        // this.emit('whatsapp-contacts', contacts, webContents);
        this.emit('whatsapp-status', this.state, webContents);

        this.emit('whatsapp-ready');
    }

    private handleNewMessage(msg: Message, webContents: WebContents): void {
        this.state.chats = this.state.chats.map((chat) => {
            if (chat.isGroup && chat.id._serialized === msg.to) {
                return { ...chat, lastMessage: msg };
            }
            if (msg.fromMe && chat.id._serialized === msg.to) {
                return { ...chat, lastMessage: msg };
            }
            if (!msg.fromMe && chat.id._serialized === msg.from) {
                return { ...chat, lastMessage: msg };
            }
            return chat;
        });

        this.emit('whatsapp-message', msg, webContents);
    }

    private updateState(updates: Partial<WhatsAppState>): void {
        this.state = { ...this.state, ...updates };
    }

    private syncState(webContents: WebContents): void {
        if (this.state.user) {
            this.emit('whatsapp-user', this.state.user, webContents);
        }
        if (this.state.chats.length > 0) {
            this.emit('whatsapp-chats', this.state.chats, webContents);
        }
        if (this.state.contacts.length > 0) {
            this.emit('whatsapp-contacts', this.state.contacts, webContents);
        }
        this.emit('whatsapp-status', this.state, webContents);
    }

    getClient(): Client | null {
        return this.client;
    }

    getState(): WhatsAppState {
        return this.state;
    }

    async getGroupIdByName(name: string): Promise<string> {
        if (!this.client) {
            throw new Error('WhatsApp client is not initialized');
        }

        const chats = await this.client.getChats();
        const group = chats.find((c) => c.isGroup && c.name === name);

        if (!group) {
            throw new Error(`Group not found: ${name}`);
        }

        return group.id._serialized;
    }

    async sendToGroupByName(groupName: string, message: string): Promise<void> {
        if (!this.client) {
            throw new Error('WhatsApp client is not initialized');
        }

        const chatId = await this.getGroupIdByName(groupName);
        await this.client.sendMessage(chatId, message);
    }

    async resetSession(): Promise<void> {
        console.log('[WhatsApp] Resetting session...');

        if (this.client) {
            try {
                await this.client.destroy();
            } catch (err) {
                console.error('[WhatsApp] Error destroying client:', err);
            }
            this.client = null;
        }

        try {
            fs.rmSync(this.sessionPath, { recursive: true, force: true });
        } catch (err) {
            console.error('[WhatsApp] Error removing session:', err);
        }

        this.state = {
            status: 'idle',
            chats: [],
            contacts: [],
        };
        this.isInitializing = false;
    }
}
