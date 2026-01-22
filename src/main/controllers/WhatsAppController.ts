import { Client, LocalAuth, type Chat, type ClientInfo, type Contact, type Message } from 'whatsapp-web.js';
import { app, type WebContents } from 'electron';
import path from 'path';
import fs from 'fs';
import { getChromiumPath } from '../services/browserDownloader';
import { EventEmitter } from '../services/EventEmitter';
import AdmZip from 'adm-zip';
import { dialog } from 'electron';

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
    private cachePath: string;
    private isInitializing = false;

    constructor() {
        super();
        const userDataPath = app.getPath('userData');
        this.sessionPath = path.join(userDataPath, 'wwebjs_auth');

        // Definimos la ruta de la caché dentro de userData
        this.cachePath = path.join(userDataPath, '.wwebjs_cache'); 
        
        // Crear la carpeta si no existe
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
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

        console.log("[WhatsApp] Session path:", this.sessionPath);
        console.log("[WhatsApp] Cache path:", this.cachePath);
        
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'wweb-worker',
                dataPath: this.sessionPath,
            }),
            webVersionCache: {
                type: "local",
                path: this.cachePath
            },
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

    // Hace cierre de sesion
    async resetSession(webContents: WebContents): Promise<void> {
        console.log('[WhatsApp] Full reset initiated...');

        // 1. Intentar Logout formal (si el cliente existe y está conectado)
        if (this.client) {
            try {
                // Verificamos si realmente hay una sesión activa para cerrar
                if (this.state.status === 'ready' || this.state.status === 'authenticated') {
                    console.log('[WhatsApp] Attempting server-side logout...');
                    await this.client.logout();
                }
                await this.client.destroy();
            } catch (err) {
                console.warn('[WhatsApp] Could not logout gracefully, forcing destroy...', err);
                await this.client.destroy();
            }
            this.client = null;
        }

        // 2. Limpieza absoluta de archivos
        try {
            if (fs.existsSync(this.sessionPath)) {
                // Borramos toda la carpeta de autenticación
                fs.rmSync(this.sessionPath, { recursive: true, force: true });
                console.log('[WhatsApp] Session files deleted.');
            }
        } catch (err) {
            console.error('[WhatsApp] Error deleting files:', err);
        }

        // 3. Resetear el estado interno
        this.updateState({
            status: 'idle',
            user: undefined,
            chats: [],
            contacts: [],
            qr: undefined,
        });

        // Notificamos al front que todo se limpió
        this.emit('whatsapp-status', this.state, webContents);
        this.isInitializing = false;

        // 4. Reiniciar el ciclo de vida (Esto mostrará el QR de nuevo automáticamente)
        console.log('[WhatsApp] Restarting for new connection...');
        await this.initialize(webContents);
    }

    /**
     * Cierra la sesión actual y destruye el cliente sin borrar los archivos,
     * permitiendo que el usuario vuelva a ver el QR.
     */
    async logout(webContents: WebContents): Promise<void> {
        if (this.client) {
            try {
                await this.client.logout();
                await this.client.destroy();
            } catch (err) {
                console.error('[WhatsApp] Logout error:', err);
            }
            this.client = null;
        }
        this.updateState({ status: 'idle', user: undefined, chats: [], qr: undefined });
        this.isInitializing = false;
        this.emit('whatsapp-status', this.state, webContents);
    }

    /**
     * Comprime la carpeta de sesión actual en un ZIP y permite guardarla.
     */
    async exportSession(): Promise<{ success: boolean; message?: string }> {
        const result = await dialog.showSaveDialog({
            title: 'Exportar Sesión de WhatsApp',
            defaultPath: path.join(app.getPath('downloads'), 'whatsapp-session.zip'),
            filters: [{ name: 'Zip Files', extensions: ['zip'] }],
        });

        if (result.canceled || !result.filePath) return { success: false };

        try {
            // Es vital que el cliente esté cerrado o los archivos de LevelDB estarán bloqueados
            if (this.client) await this.client.destroy();
            this.client = null;

            const zip = new AdmZip();
            // wwebjs_auth contiene la carpeta 'session-wweb-worker' (el clientId)
            if (fs.existsSync(this.sessionPath)) {
                zip.addLocalFolder(this.sessionPath);
                zip.writeZip(result.filePath);
                return { success: true, message: 'Sesión exportada correctamente' };
            } else {
                return { success: false, message: 'No existe una sesión activa para exportar' };
            }
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }

    /**
     * Importa un archivo ZIP y lo extrae en la carpeta de sesión.
     */
    async importSession(webContents: WebContents): Promise<{ success: boolean; message?: string }> {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Zip Files', extensions: ['zip'] }],
        });

        if (result.canceled || !result.filePaths[0]) return { success: false };

        try {
            if (this.client) {
                // Intentamos cerrar la sesión en el servidor para que el usuario anterior
                // vea en su móvil que la sesión se cerró.
                try {
                    // Solo si el cliente está 'ready' o 'authenticated' tiene sentido el logout
                    if (this.state.status === 'ready' || this.state.status === 'authenticated') {
                        await this.client.logout();
                    }
                    await this.client.destroy();
                } catch (logoutErr) {
                    console.warn('[WhatsApp] Logout failed or timed out, forcing destroy...', logoutErr);
                    await this.client.destroy();
                }
                this.client = null;
            }

            // Limpiar carpeta actual (Borra rastros del usuario anterior)
            if (fs.existsSync(this.sessionPath)) {
                fs.rmSync(this.sessionPath, { recursive: true, force: true });
            }

            // Extraer ZIP (La nueva sesión)
            const zip = new AdmZip(result.filePaths[0]);
            zip.extractAllTo(this.sessionPath, true);

            // Reiniciar el estado para que initialize no crea que sigue en la sesión vieja
            this.updateState({ status: 'idle', user: undefined, chats: [], qr: undefined });
            this.isInitializing = false;

            // Notificar al frontend el estado vacío inmediatamente
            this.syncState(webContents);

            // 4. Iniciar con los nuevos archivos
            setTimeout(async () => {
                await this.initialize(webContents);
            }, 1000);

            return { success: true, message: 'Sesión importada y anterior cerrada con éxito' };
        } catch (err: any) {
            console.error('[IPC] Error importing session:', err);
            return { success: false, message: err.message };
        }
    }
}
