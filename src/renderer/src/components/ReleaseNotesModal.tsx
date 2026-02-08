import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useTheme } from 'next-themes';

type ModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    version: string;
    notes: string;
}
export default function ReleaseNotesModal({open, setOpen, version, notes}: ModalProps) {
    const { resolvedTheme } = useTheme();
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] h-full max-w-4xl! w-full p-0">
                <div className="overflow-y-auto overscroll-x-none w-full bg-muted/30!">
                    <DialogHeader className="sticky top-0 z-10 bg-background p-4">
                        <DialogTitle>Release Notes - v{version}</DialogTitle>
                        <DialogDescription>See what&apos;s new in this update</DialogDescription>
                        <DialogClose className="fixed top-4 right-4">
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
                                'data-color-mode': resolvedTheme === 'dark' ? 'dark' : 'light',
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
    );
}
