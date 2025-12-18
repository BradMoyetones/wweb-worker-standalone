'use client';

import type React from 'react';

import { createContext, useEffect, useState } from 'react';
import type { WhatsAppContextType, WhatsAppStatus } from './WhatsAppContext.types';
import QRCode from 'qrcode';
import { EllipsisVertical, Loader, Settings, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Timeline } from '@/components/timeline';
import { Badge } from '@/components/ui/badge';
import type { Chat, ClientInfo, Contact, Message } from 'whatsapp-web.js';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

    const whatsappSteps = [
        {
            number: 1,
            description: <p className="text-lg">Abre WhatsApp en tu teléfono 📲</p>,
        },
        {
            number: 2,
            description: (
                <p className="text-lg flex">
                    En Android, toca <strong>&nbsp;Menú</strong>{' '}
                    <Badge variant={'secondary'} className="px-0.5 ml-2">
                        <EllipsisVertical className="!size-4" />
                    </Badge>
                    . En iPhone, toca <strong>&nbsp;Ajustes</strong>{' '}
                    <Badge variant={'secondary'} className="px-0.5 ml-2">
                        <Settings className="!size-4" />
                    </Badge>
                    .
                </p>
            ),
        },
        {
            number: 3,
            description: (
                <p className="text-lg">
                    Toca <strong> Dispositivos vinculados </strong> y, luego, <strong> Vincular dispositivo.</strong>
                </p>
            ),
        },
        {
            number: 4,
            description: <p className="text-lg">Escanea el código QR para confirmar.</p>,
        },
    ];

    useEffect(() => {
        // Inicializa el cliente
        window.whatsappApi.init();

        window.whatsappApi.onStatus((data) => {
            setStatus(data.status as WhatsAppStatus);

            if (data.status === 'error' || data.status === 'auth_failure') {
                setErrorMessage(data.message || 'Error de autenticación');
            }

            // Capturar el progreso de descarga
            if (data.status === 'downloading-browser') {
                setDownloadProgress(data.progress || 0);
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
            }}
        >
            {/* VISTA DE DESCARGA DE NAVEGADOR */}
            {status === 'downloading-browser' && (
                <div className="bg-background fixed inset-0 z-50 wavy-lines flex items-center justify-center">
                    <Card className="max-w-md w-full mx-4">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <Loader className="animate-spin text-primary size-8" />
                                </div>
                                <div className="space-y-2 w-full">
                                    <h1 className="text-2xl font-bold">Preparando entorno</h1>
                                    <p className="text-muted-foreground">
                                        Descargando componentes necesarios para WhatsApp ({downloadProgress}%)
                                    </p>
                                    <Progress value={downloadProgress} className="h-2 w-full" />
                                    <p className="text-xs text-muted-foreground italic">
                                        Esto solo ocurrirá la primera vez que inicies la app.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {(status === 'initializing' || status === 'qr') && (
                <div className="bg-background fixed inset-0 z-50 wavy-lines">
                    <div className="flex items-center justify-center h-full">
                        <Card className="max-w-4xl w-full mx-4">
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold">Pasos para iniciar sesión</h1>
                                        <div className="mt-10">
                                            <Timeline steps={whatsappSteps} />
                                        </div>
                                    </div>
                                    <div className="flex justify-center md:justify-end">
                                        <div className="aspect-square h-[284px] flex items-center justify-center bg-muted rounded-xl overflow-hidden my-auto">
                                            {status === 'initializing' ? (
                                                <Loader className="animate-spin size-8" />
                                            ) : (
                                                <img
                                                    src={imgQr || '/placeholder.svg'}
                                                    alt="Escanea el QR"
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {(status === 'auth_failure' || status === 'error' || status === 'disconnected') && (
                <div className="bg-background fixed inset-0 z-50 wavy-lines flex items-center justify-center">
                    <Card className="max-w-md w-full mx-4">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="p-3 bg-destructive/10 rounded-full">
                                    <AlertCircle className="text-destructive size-8" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold">
                                        {status === 'disconnected' ? 'Desconectado' : 'Error de autenticación'}
                                    </h1>
                                    <p className="text-muted-foreground">
                                        {errorMessage ||
                                            'No se pudo conectar con WhatsApp. Por favor, intenta nuevamente.'}
                                    </p>
                                </div>
                                <Button onClick={handleRetry} className="w-full">
                                    Reintentar conexión
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {showOverlay && (status === 'idle' || status === 'authenticated' || status === 'ready') && (
                <div
                    className={cn(
                        'bg-background fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 wavy-lines',
                        fadeOut ? 'opacity-0' : 'opacity-100'
                    )}
                >
                    <Card className="max-w-md w-full mx-4">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center gap-6 text-center">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <Loader className="animate-spin text-primary size-8" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold">
                                        {status === 'idle' && 'Iniciando WhatsApp...'}
                                        {status === 'authenticated' && 'Autenticado correctamente'}
                                        {status === 'ready' && 'Cargando chats'}
                                    </h1>
                                    <Progress
                                        value={status === 'idle' ? 20 : status === 'authenticated' ? 60 : 100}
                                        className="h-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {children}
        </WhatsAppContext.Provider>
    );
}
