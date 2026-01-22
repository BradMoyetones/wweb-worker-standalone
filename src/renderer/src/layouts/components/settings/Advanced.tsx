import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVersion } from '@/contexts';
import { NotebookText, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useState } from 'react';
import { useTheme } from 'next-themes';

export default function Advanced() {
    const { appVersion } = useVersion();
    const { theme } = useTheme();
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);
    const [notes, setNotes] = useState('');

    const fetchNotes = async () => {
        if (notes) return;

        try {
            const res = await window.api.getReleaseNotes();
            setNotes(res);
        } catch {
            setNotes('# Error\nNo se pudieron cargar las notas.');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold">Avanzado</h1>
            <div className="mt-4 border-l pl-4">
                <h2 className="text-base font-extrabold text-muted-foreground mb-4">Application version</h2>
                <div className="flex gap-4">
                    <Card className="w-full border-border">
                        <CardContent>
                            <h3 className="flex items-center gap-2 mb-4">
                                <span>Current version: </span> <strong>v{appVersion}</strong>
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    size={'sm'}
                                    variant={'secondary'}
                                    onClick={() => {
                                        setShowReleaseNotes(true);
                                        fetchNotes();
                                    }}
                                >
                                    <NotebookText />
                                    Notas de la versión
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showReleaseNotes} onOpenChange={setShowReleaseNotes}>
                <DialogContent className="max-h-[90vh] h-full max-w-4xl! w-full p-0">
                    <div className="overflow-y-auto overscroll-x-none w-full bg-muted/30!">
                        <DialogHeader className='sticky top-0 z-10 bg-background p-4'>
                            <DialogTitle>Release Notes - v{appVersion}</DialogTitle>
                            <DialogDescription>See what&apos;s new in this update</DialogDescription>
                            <DialogClose className='fixed top-4 right-4'>
                                <Button variant="ghost" size="icon" className="size-6 -mt-1 -mr-1">
                                    <X />
                                </Button>
                            </DialogClose>
                        </DialogHeader>
                        {/* LA CLAVE: 
                        1. 'markdown-body' activa los estilos de GitHub.
                        2. Forzamos el modo dark/light de GitHub basado en tu tema.
                        */}
                        <div
                            className={`
                                flex-1 
                                markdown-body 
                            `}
                        >
                            <MarkdownPreview
                                source={notes}
                                wrapperElement={{
                                    'data-color-mode': theme === 'dark' ? 'dark' : 'light',
                                }}
                                style={{
                                    padding: '24px',
                                    backgroundColor: 'transparent',
                                }}
                            />

                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
