'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader, EllipsisVertical, Settings, AlertCircle } from 'lucide-react';
import { Timeline } from '@/components/timeline';
import { WhatsAppContext } from '@/contexts';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { useContext } from 'react';

// Pasos para el QR (los saqué de tu código original)
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
                    <EllipsisVertical className="size-4!" />
                </Badge>
                . En iPhone, toca <strong>&nbsp;Ajustes</strong>{' '}
                <Badge variant={'secondary'} className="px-0.5 ml-2">
                    <Settings className="size-4!" />
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

interface WhatsAppStatusModalProps {
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function WhatsAppStatusModal({ open, setOpen }: WhatsAppStatusModalProps) {
    const context = useContext(WhatsAppContext); // Ajusta según tu exportación
    if (!context) return null;
    const { status, imgQr, downloadProgress, errorMessage, handleRetry, showOverlay, fadeOut } = context;

    // Lógica para decidir si el modal está abierto
    const isOpen = ['downloading-browser', 'initializing', 'qr', 'auth_failure', 'error', 'disconnected', 'idle'].includes(
        status
    );

    return (
        <Dialog defaultOpen={isOpen} open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[1000px]! w-full! overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        {status === 'qr' && 'Vincular WhatsApp'}
                        {status === 'downloading-browser' && 'Preparando Entorno'}
                        {(status === 'error' || status === 'auth_failure') && 'Error de Conexión'}
                        {status === 'initializing' && 'Iniciando Sesión'}
                    </DialogTitle>
                    <DialogDescription>
                        Estado actual: <span className="font-medium text-primary uppercase text-xs">{status}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* ESTADO: DESCARGA DE NAVEGADOR */}
                    {status === 'downloading-browser' && (
                        <div className="bg-background z-50 wavy-lines flex items-center justify-center">
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
                        <div className="bg-background z-50 wavy-lines">
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
                        <div className="bg-background z-50 wavy-lines flex items-center justify-center">
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
                                'bg-background z-50 flex items-center justify-center transition-opacity duration-500 wavy-lines',
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
