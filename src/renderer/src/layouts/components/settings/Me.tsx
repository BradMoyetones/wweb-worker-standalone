import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WhatsAppStatusModal } from '@/components/WhatsAppStatusModal';
import { useWhatsApp } from '@/contexts';
import { CirclePower, Download, LogOut, MessageCircle, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Me() {
    const { user, chats, status } = useWhatsApp();
    const [openModal, setOpenModal] = useState(false);
    
    return (
        <div>
            <h1 className="text-2xl font-bold">Mi Cuenta</h1>
            <div className="mt-4 border-l pl-4">
                <Card>
                    <CardContent>
                        <article className="flex gap-2 items-center">
                            <img
                                src={user?.profilePic || '/logo-worker-1.png'}
                                alt={`Perfil de ${user?.pushname}`}
                                className="size-20 rounded-full"
                            />
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {user?.pushname || (
                                        <>
                                            {status === 'qr' && 'Vincular WhatsApp'}
                                            {status === 'downloading-browser' && 'Preparando Entorno'}
                                            {(status === 'error' || status === 'auth_failure') && 'Error de Conexión'}
                                            {status === 'initializing' && 'Iniciando Sesión'}
                                        </>
                                    )}
                                </h1>
                                <p className="opacity-70">+{user?.wid.user || 'No logueado'}</p>
                            </div>
                        </article>
                        <div className="mt-4 space-y-4">
                            <Button
                                variant={'outline'}
                                className="font-medium uppercase text-xs cursor-pointer"
                                onClick={() => setOpenModal(true)}
                            >
                                {status === 'qr' && 'Vincular WhatsApp'}
                                {status === 'downloading-browser' && 'Preparando Entorno'}
                                {(status === 'error' || status === 'auth_failure') && 'Error de Conexión'}
                                {status === 'initializing' && 'Iniciando Sesión'}
                            </Button>
                            <WhatsAppStatusModal open={openModal} setOpen={setOpenModal} />
                            
                            <div className="flex justify-between">
                                <h1 className="flex items-center gap-2 [&>svg]:size-5 [&>svg]:text-muted-foreground">
                                    <MessageCircle /> Chats activos
                                </h1>{' '}
                                <Badge>{chats.length}</Badge>
                            </div>

                            <div className="flex justify-between">
                                <h1 className="flex items-center gap-2 [&>svg]:size-5 [&>svg]:text-muted-foreground">
                                    <CirclePower /> Estado
                                </h1>{' '}
                                <Badge>{status === 'ready' ? 'Activo' : 'Desconectado'}</Badge>
                            </div>
                        </div>
                        <div className="mt-4 space-x-4 space-y-2">
                            <Button
                                size={'sm'}
                                onClick={async () => {
                                    const data = await window.whatsappApi.exportSession();

                                    console.log(data);

                                    if (data.success && data.message) {
                                        toast.success(data.message);
                                    }

                                    if (!data.success && data.message) {
                                        toast.error(data.message);
                                    }
                                }}
                            >
                                <Download /> Exportar
                            </Button>
                            <Button
                                variant={'outline'}
                                size={'sm'}
                                onClick={async () => {
                                    const confirm = window.confirm(
                                        'Esto reemplazará la sesión actual y reiniciará la aplicación. ¿Continuar?'
                                    );
                                    if (!confirm) return;

                                    const toastId = toast.loading('Importando sesión y reiniciando...');
                                    const data = await window.whatsappApi.importSession();

                                    if (data.success) {
                                        toast.success(data.message, { id: toastId });
                                    } else {
                                        toast.error(data.message || 'Error al importar', { id: toastId });
                                    }
                                }}
                            >
                                <Upload /> Importar
                            </Button>
                            <Button
                                variant={'destructive'}
                                size={'sm'}
                                onClick={async () => {
                                    const confirm = window.confirm(
                                        'Esto cerrará la sesión actual y tendrá que escanear nuevamente el código QR. ¿Continuar?'
                                    );
                                    if (!confirm) return;

                                    await window.whatsappApi.resetSession();
                                }}
                            >
                                <LogOut /> Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
