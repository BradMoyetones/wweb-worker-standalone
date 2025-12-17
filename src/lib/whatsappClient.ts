import { Chat, Client, ClientInfo, Contact, LocalAuth } from 'whatsapp-web.js';
import path from 'path';
import fs from 'fs';
import { app, WebContents } from 'electron'; // Importa 'app' para acceder a rutas del sistema
import { initCrons } from './initCrons';

let client: Client | null = null;
let activeWebContents: WebContents | null = null;

// Snapshot de estado actual
let userInfo: ClientInfo | null = null;
let chats: Chat[] = [];
let contacts: Contact[] = []
let lastStatus: { status: string; qr?: string; error?: string } = { status: 'init' };

// Obtén el path para guardar los archivos de sesión
// Utiliza una ubicación segura y persistente en el sistema del usuario
const userDataPath = app.getPath('userData');
const sessionPath = path.join(userDataPath, 'wwebjs_auth');

console.log(userDataPath);

const BOOT_TIMEOUT = 25000; // 25 segundos

let booted = false; // se pone en true cuando cualquier evento real ocurre

const bootTimeout = setTimeout(() => {
    if (!booted) {
        console.log("[WATCHDOG] WhatsApp se quedó pegado. Reseteando sesión...");

        try {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        } catch (err) {
            console.error("Error borrando sesión corrupta:", err);
        }

        // Mata la app
        app.relaunch();
        app.exit(0);
    }
}, BOOT_TIMEOUT);

// Marcar cuando la app realmente avanza
function markBooted() {
    if (!booted) {
        booted = true;
        clearTimeout(bootTimeout);
    }
}


function sendToRenderer(channel: string, payload: any) {
    if (activeWebContents && !activeWebContents.isDestroyed()) {
        activeWebContents.send(channel, payload);
    } else {
        console.log(`[WARN] Tried to send to renderer but no activeWebContents. channel=${channel}`);
    }
}

export const initializeClient = (webContents: Electron.WebContents) => {
    return new Promise((resolve, reject) => {
        activeWebContents = webContents;

        if (client) {
            console.log('Client already initialized.');

            // 🔄 Re-sincronizar estado
            if (userInfo) sendToRenderer('whatsapp-user', userInfo);
            if (chats.length > 0) sendToRenderer('whatsapp-chats', chats);
            if (contacts.length > 0) sendToRenderer('whatsapp-contacts', contacts);
            if (lastStatus) sendToRenderer('whatsapp-status', lastStatus);

            resolve(client);
            return;
        }

        console.log('Initializing WhatsApp client...');
        client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'wweb-worker',
                dataPath: sessionPath, // Ruta donde se guardarán los datos de la sesión
            }),
            puppeteer: {
                headless: true, // `true` para no mostrar el navegador, `false` para depurar
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
            }
        });

        // Escuchadores de eventos
        client.on('qr', (qr) => {
            markBooted()
            console.log('QR RECEIVED', qr);
            lastStatus = { status: 'qr', qr };
            sendToRenderer('whatsapp-status', lastStatus);
        });

        client.on('ready', async() => {
            markBooted()
            if(!client) return
            console.log('Client is ready!');

            userInfo = client.info;

            let profilePic: string | null = null;
            try {
                profilePic = await client.getProfilePicUrl(userInfo.wid._serialized);
            } catch (err) {
                console.log("No se pudo obtener tu foto de perfil", err);
            }

            const enrichedUser = {
                ...userInfo,
                profilePic,
            };

            userInfo = enrichedUser
            chats = await client.getChats();
            lastStatus = { status: 'ready' };
            
            sendToRenderer('whatsapp-user', enrichedUser);
            sendToRenderer('whatsapp-chats', chats);
            sendToRenderer('whatsapp-contacts', contacts);
            sendToRenderer('whatsapp-status', lastStatus);

            // Si inicializan los crons de db al estar el cliente de WhatsApp totalmente cargado
            await initCrons()
            resolve(client);
        });

        // Nuevo mensaje
        client.on('message_create', (msg) => {

            chats = chats.map((chat) => {
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
            
            sendToRenderer('whatsapp-message', msg);
        });

        client.on('chat_removed', (chat) => {
            console.log('Chat eliminado:', chat.id._serialized);

            // actualizas tu snapshot global
            chats = chats.filter(c => c.id._serialized !== chat.id._serialized);

            // reenvías la data al renderer
            sendToRenderer('whatsapp-chats', chats);
        });

        client.on('chat_archived', async(chat) => {
            if(!client) return
            console.log('Chat archivado:', chat.id._serialized);
            chats = await client.getChats();
            // reenvías la data al renderer
            sendToRenderer('whatsapp-chats', chats);
        });

        client.on('authenticated', (session) => {
            markBooted()
            console.log('AUTHENTICATED', session);
            lastStatus = { status: 'authenticated' };
            sendToRenderer('whatsapp-status', lastStatus);
        });

        client.on('auth_failure', msg => {
            markBooted()
            console.error('AUTHENTICATION FAILURE', msg);
            lastStatus = { status: 'auth_failure', error: msg };
            sendToRenderer('whatsapp-status', lastStatus);
            reject(new Error(msg));
        });

        client.on('disconnected', (reason) => {
            console.log('Client disconnected', reason);
            lastStatus = { status: 'disconnected', error: reason };
            sendToRenderer('whatsapp-status', lastStatus);
        });
        // ------

        client.initialize().catch(err => {
            console.error('Initialization failed:', err);
            reject(err);
        });
    });
};

// --- Utilidad: buscar ID de grupo por nombre ---
export async function getGroupIdByName(name: string) {
    const chats = await client?.getChats();
    const group = chats?.find(c => c.isGroup && c.name === name);
    if (!group) throw new Error(`No encontré el grupo con nombre: ${name}`);
    return group.id._serialized; // p.ej. "123456789@g.us"
}

// --- Utilidad: enviar mensaje a grupo por nombre ---
export async function sendToGroupByName(groupName: string, message: string) {
    const chatId = await getGroupIdByName(groupName);
    return client?.sendMessage(chatId, message);
}