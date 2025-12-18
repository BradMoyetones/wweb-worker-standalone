import type React from 'react';
import type { Chat, ClientInfo, Contact } from 'whatsapp-web.js';

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

export interface WhatsAppContextType {
    status: WhatsAppStatus;
    imgQr: string;
    user: (ClientInfo & { profilePic: string | null }) | null;
    chats: Chat[];
    contacts: Contact[];
    chatSelected: string;
    setChatSelected: React.Dispatch<React.SetStateAction<string>>;
}
