import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVersion } from '@/contexts';
import { NotebookText } from 'lucide-react';
import { useState } from 'react';
import ReleaseNotesModal from '@/components/ReleaseNotesModal';

export default function Advanced() {
    const { appVersion } = useVersion();
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

            <ReleaseNotesModal notes={notes} open={showReleaseNotes} setOpen={setShowReleaseNotes} version={appVersion} />
        </div>
    );
}
