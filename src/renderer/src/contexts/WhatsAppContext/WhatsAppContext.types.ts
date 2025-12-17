import { Chat, ClientInfo, Contact } from "whatsapp-web.js";

export type WhatsAppStatus = 'init' | 'loading' | 'qr' | 'ready' | 'auth_failure' | 'disconnected' | 'authenticated';
export interface WhatsAppContextType {
    status: WhatsAppStatus;
    imgQr: string;
    user: ClientInfo & {profilePic: string | null} | null;
    chats: Chat[];
    contacts: Contact[];
    chatSelected: string;
    setChatSelected: React.Dispatch<React.SetStateAction<string>>
}