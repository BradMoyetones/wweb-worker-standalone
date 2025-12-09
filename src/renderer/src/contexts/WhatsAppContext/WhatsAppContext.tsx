import { createContext, useEffect, useState } from "react";
import { WhatsAppContextType, WhatsAppStatus } from "./WhatsAppContext.types";
import QRCode from 'qrcode'
import { EllipsisVertical, Loader, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Timeline } from "@/components/timeline";
import { Badge } from "@/components/ui/badge";
import { Chat, ClientInfo, Contact, Message } from "whatsapp-web.js";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<WhatsAppStatus>('loading');
    const [imgQr, setImgQr] = useState("");
    const [user, setUser] = useState<ClientInfo & {profilePic: string | null} | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [chatSelected, setChatSelected] = useState("")

    const [showOverlay, setShowOverlay] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    const whatsappSteps = [
        {
            number: 1,
            description: <p className="text-lg">Abre WhatsApp en tu telefono 📲</p>,
        },
        {
            number: 2,
            description: <p className="text-lg flex">En Android, toca <strong>&nbsp;Menú</strong> <Badge variant={"secondary"} className="px-0.5 ml-2"><EllipsisVertical className="!size-4" /></Badge>. En iPhone, toca <strong>&nbsp;Ajustes</strong> <Badge variant={"secondary"} className="px-0.5 ml-2"><Settings className="!size-4" /></Badge>.</p>,
        },
        {
            number: 3,
            description: <p className="text-lg">Toca <strong>{" "}Dispositivos vinculados{" "}</strong> y, luego, <strong>{" "}Vincular dispositivo.</strong></p>,
        },
        {
            number: 4,
            description: <p className="text-lg">Escanea el código QR para confirmar.</p>,
        },
    ]

    useEffect(() => {
        // Inicializa el cliente
        window.whatsappApi.init();

        window.whatsappApi.onStatus((data) => {
            setStatus(data.status as WhatsAppStatus);

            if (data.status === 'qr' && data.qr) {
                QRCode.toDataURL(data.qr).then(url => setImgQr(url));
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
        return
    }, [fadeOut]);

    const handleNewMsg = (msg: Message) => {
        setChats((prevChats) => {
            return prevChats.map((chat) => {
                // si es un grupo -> siempre el chat del grupo (msg.to)
                if (chat.isGroup && chat.id._serialized === msg.to) {
                    return { ...chat, lastMessage: msg };
                }

                // si es privado y yo lo envié -> solo actualizar al destinatario
                if (msg.fromMe && chat.id._serialized === msg.to) {
                    return { ...chat, lastMessage: msg };
                }

                // si es privado y lo recibí -> solo actualizar al remitente
                if (!msg.fromMe && chat.id._serialized === msg.from) {
                    return { ...chat, lastMessage: msg };
                }

                return chat;
            });
        });
    };

    useEffect(() => {
        window.whatsappApi.onUser((user) => setUser(user as ClientInfo & {profilePic: string | null}));
        window.whatsappApi.onChats((chats) => setChats(chats));
        window.whatsappApi.onContacts((contacts) => setContacts(contacts));
        window.whatsappApi.onMessage((msg) => handleNewMsg(msg));
    }, []);

    return (
        <WhatsAppContext.Provider 
            value={{ 
                imgQr, 
                status,
                user,
                chats,
                contacts,
                chatSelected,
                setChatSelected
            }}
        >
            {(status === 'loading' || status === 'qr') && (
                <div className="bg-background fixed inset-0 z-50">
                    <div className="flex items-center justify-center h-full">
                        <Card className="max-w-4xl w-full">
                            <CardContent>
                                <div className="flex justify-between gap-6">
                                    <div>
                                        <h1 className="text-3xl font-bold">Pasos para iniciar sesión</h1>
                                        <div className="mt-10">
                                            <Timeline steps={whatsappSteps} />
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="aspect-square h-[284px] flex items-center justify-center bg-muted rounded-xl overflow-hidden my-auto">
                                            {status === 'loading' ? (
                                                <Loader className="animate-spin" />
                                            ) : (
                                                <img src={imgQr} alt="Escanea el QR" className="h-full w-full object-cover object-center" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {showOverlay && (status === 'init' || status === 'authenticated' || status === 'ready') && (
                <div
                    className={cn(
                        "bg-background fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500",
                        fadeOut ? "opacity-0" : "opacity-100"
                    )}
                >
                    <Card className="max-w-4xl w-full">
                        <CardContent>
                            <div className="flex flex-col items-center justify-center gap-6 text-center">
                                <h1 className="text-3xl font-bold">Cargando chats</h1>
                                <Progress value={status === "init" ? 20 : status === 'authenticated' ? 60 : 100} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {children}
        </WhatsAppContext.Provider>
    );
}

