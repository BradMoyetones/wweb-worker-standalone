import { useEffect, useState, useRef } from 'react';
import { Terminal, Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function ConsoleTerminal() {
    const [logs, setLogs] = useState<{ type: string; message: string; time: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        window.api.onLog((newLog) => {
            setLogs((prev) => [...prev, newLog].slice(-100)); // Guardar últimos 100 logs
        });
    }, []);

    // Auto-scroll al final cuando llega un log
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [logs]);

    return (
        !isOpen ? (
            <Button size={"icon-sm"} variant={"ghost"} onClick={() => setIsOpen(true)} className="hover:text-primary transition-colors text-muted-foreground fixed z-10000 bottom-4 right-4">
                <Terminal size={14} />
            </Button>
        ): (
            <div className="bg-background text-green-600 font-mono text-xs rounded-lg border border-border overflow-auto flex flex-col h-[300px] shadow-2xl fixed bottom-0 w-full z-10000">
                {/* Header de la Terminal */}
                <div className="bg-background/10 z-1 px-4 py-2 flex justify-between items-center border-b border-white/10 sticky top-0 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <TerminalIcon size={14} />
                        <span className="font-sans font-bold text-foreground uppercase tracking-tighter">System Output</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button size={"icon-sm"} variant={"ghost"} onClick={() => setLogs([])} className="hover:text-destructive transition-colors text-muted-foreground">
                            <Trash2 size={14} />
                        </Button>
                        <Button size={"icon-sm"} variant={"ghost"} onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors text-muted-foreground">
                            <Terminal size={14} />
                        </Button>
                    </div>
                </div>

                {/* Cuerpo de Logs */}
                <ScrollArea ref={scrollRef} className="flex-1 p-4">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 flex gap-2">
                            <span className="text-muted-foreground text-[10px] shrink-0">[{log.time}]</span>
                            <span className={cn('break-all', log.type === 'error' ? 'text-red-500' : 'text-foreground')}>
                                <span className="mr-1">{log.type === 'error' ? '✖' : '➜'}</span>
                                {log.message}
                            </span>
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-gray-600 italic">Esperando actividad del sistema...</div>}
                </ScrollArea>
            </div>
        )
    );
}
