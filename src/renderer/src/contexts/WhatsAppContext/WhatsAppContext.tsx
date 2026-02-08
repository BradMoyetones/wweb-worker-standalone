/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import type React from 'react';

import { createContext, useEffect, useState } from 'react';
import type { WhatsAppContextType, WhatsAppStatus } from './WhatsAppContext.types';
import QRCode from 'qrcode';
import type { Chat, ClientInfo, Contact, Message } from 'whatsapp-web.js';
import { WhatsAppStatusModal } from '@/components/WhatsAppStatusModal';

export const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<WhatsAppStatus>('idle');
    const [imgQr, setImgQr] = useState('');
    const [user, setUser] = useState<(ClientInfo & { profilePic: string | null }) | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [chatSelected, setChatSelected] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showOverlay, setShowOverlay] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        // Inicializa el cliente
        window.whatsappApi.init();

        window.whatsappApi.onStatus((data) => {
            setStatus(data.status as WhatsAppStatus);

            if (data.status === 'error' || data.status === 'auth_failure') {
                setErrorMessage(data.error || 'Error de autenticación');
            }

            // Capturar el progreso de descarga
            if (data.status === 'downloading-browser') {
                setDownloadProgress(data.downloadProgress || 0);
            }

            if (data.status === 'qr' && data.qr) {
                QRCode.toDataURL(data.qr).then((url) => setImgQr(url));
            }

            if (data.status === 'ready') {
                setImgQr('');
                setTimeout(() => setFadeOut(true), 1000);
            }
        });
    }, []);

    useEffect(() => {
        if (fadeOut) {
            const t = setTimeout(() => setShowOverlay(false), 500);
            return () => clearTimeout(t);
        }
        return;
    }, [fadeOut]);

    const handleNewMsg = (msg: Message) => {
        setChats((prevChats) => {
            return prevChats.map((chat) => {
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
        });
    };

    useEffect(() => {
        window.whatsappApi.onUser((user) => setUser(user as ClientInfo & { profilePic: string | null }));
        window.whatsappApi.onChats((chats) => setChats(chats));
        window.whatsappApi.onContacts((contacts) => setContacts(contacts));
        window.whatsappApi.onMessage((msg) => handleNewMsg(msg));
    }, []);

    useEffect(() => {
        // Si el estado vuelve a ser 'idle' o 'initializing',
        // reseteamos las variables visuales para mostrar la carga de nuevo
        if (status === 'idle' || status === 'initializing' || status === 'downloading-browser') {
            setFadeOut(false);
            setShowOverlay(true);
            setChats([]); // Limpiamos chats viejos
            setUser(null); // Limpiamos usuario viejo
        }
    }, [status]);

    const handleRetry = () => {
        setErrorMessage('');
        window.whatsappApi.init();
    };

    return (
        <WhatsAppContext.Provider
            value={{
                imgQr,
                status,
                user,
                chats,
                contacts,
                chatSelected,
                setChatSelected,
                downloadProgress, // Asegúrate de exportar estos para el modal
                errorMessage,
                handleRetry,
                showOverlay,
                fadeOut,
            }}
        >
            <WhatsAppStatusModal />
            {children}
        </WhatsAppContext.Provider>
    );
}
