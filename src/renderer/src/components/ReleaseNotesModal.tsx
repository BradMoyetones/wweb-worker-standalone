import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { mermaid } from '@streamdown/mermaid';
import { math } from '@streamdown/math';
import { cjk } from '@streamdown/cjk';
import 'katex/dist/katex.min.css';

type ModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    version: string;
    notes: string;
}
export default function ReleaseNotesModal({ open, setOpen, version, notes }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl! w-full">
                <DialogHeader className="sticky top-0 z-10">
                    <DialogTitle>Release Notes - v{version}</DialogTitle>
                    <DialogDescription>See what&apos;s new in this update</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto bg-muted rounded-lg max-h-[calc(100vh-16rem)] p-4 no-scrollbar scroll-fade">
                    <Streamdown
                        plugins={{
                            code: code,
                            mermaid: mermaid,
                            math: math,
                            cjk: cjk,
                        }}
                    >{notes}</Streamdown>
                </div>
            </DialogContent>
        </Dialog>
    );
}
