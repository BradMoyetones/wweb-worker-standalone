import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVersion } from '@/contexts';
import { NotebookText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
                <DialogContent className="max-w-4xl! max-h-[90vh] h-full w-full!">
                    <DialogHeader>
                        <DialogTitle>Release Notes - v{appVersion}</DialogTitle>
                        <DialogDescription>See what&apos;s new in this update</DialogDescription>
                    </DialogHeader>
                    {/* LA CLAVE: 
                      1. 'markdown-body' activa los estilos de GitHub.
                      2. Forzamos el modo dark/light de GitHub basado en tu tema.
                    */}
                    <ScrollArea
                        className={`
                            flex-1 
                            markdown-body 
                            bg-muted/30!
                        `}
                        style={{
                            backgroundColor: 'transparent', // Para que use el fondo de tu Dialog
                            minHeight: '100%',
                        }}
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
                        <ScrollBar orientation="vertical" />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
