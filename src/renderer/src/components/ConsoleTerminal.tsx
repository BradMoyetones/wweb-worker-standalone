import { useEffect, useState, useRef, useCallback } from 'react';
import { Terminal, Terminal as TerminalIcon, Trash2, GripHorizontal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function ConsoleTerminal() {
    const [logs, setLogs] = useState<{ type: string; message: string; time: string }[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState(300); // Altura inicial
    const scrollRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);

    // --- Lógica de Resizing ---
    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'row-resize'; // Cambia el cursor global
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
        
        // Calculamos la nueva altura basándonos en la posición del mouse
        // Como la terminal está pegada al fondo (bottom: 0), 
        // la altura es la ventana total menos la posición Y del mouse.
        const newHeight = window.innerHeight - e.clientY;
        
        // Ponemos límites (mínimo 100px, máximo 90% de la pantalla)
        if (newHeight > 100 && newHeight < window.innerHeight * 0.9) {
            setHeight(newHeight);
        }
    }, []);

    // --- Efectos existentes ---
    useEffect(() => {
        window.api.onLog((newLog) => {
            setLogs((prev) => [...prev, newLog].slice(-100));
        });
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }
    }, [logs]); // También scrollear si cambia la altura

    return (
        !isOpen ? (
            <Button size={"icon-sm"} variant={"ghost"} onClick={() => setIsOpen(true)} className="hover:text-primary transition-colors text-muted-foreground fixed z-10000 bottom-4 right-4">
                <Terminal size={14} />
            </Button>
        ) : (
            <div 
                style={{ height: `${height}px` }} 
                className="bg-background text-green-600 font-mono text-xs border-t border-border flex flex-col shadow-2xl sticky bottom-0 left-0 w-full z-10000 transition-[height] duration-75 ease-out"
            >
                {/* HANDLE PARA ARRASTRAR (Invisible pero con área de click) */}
                <div 
                    onMouseDown={startResizing}
                    className="absolute -top-1 left-0 w-full h-2 cursor-row-resize z-10001 hover:bg-primary/30 transition-colors"
                />

                {/* Header de la Terminal */}
                <div className="bg-background/10 z-1 px-4 py-2 flex justify-between items-center border-b border-white/10 sticky top-0 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-2 select-none">
                        <GripHorizontal size={14} className="text-muted-foreground cursor-row-resize" onMouseDown={startResizing} />
                        <TerminalIcon size={14} />
                        <span className="font-sans font-bold text-foreground uppercase tracking-tighter">System Output</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button size={"icon-sm"} variant={"ghost"} onClick={() => setLogs([])} title="Limpiar Consola" className="hover:text-destructive transition-colors text-muted-foreground">
                            <Trash2 size={14} />
                        </Button>
                        <Button size={"icon-sm"} variant={"ghost"} onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors text-muted-foreground">
                            <Terminal size={14} />
                        </Button>
                    </div>
                </div>

                {/* Cuerpo de Logs */}
                <ScrollArea ref={scrollRef} className="flex-1 overflow-auto">
                    <div className="p-4">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 flex gap-2">
                                <span className="text-muted-foreground text-[10px] shrink-0">[{log.time}]</span>
                                <span className={cn('break-all whitespace-pre-wrap', log.type === 'error' ? 'text-red-500' : 'text-foreground')}>
                                    <span className="mr-1">{log.type === 'error' ? '✖' : '➜'}</span>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-gray-600 italic">Esperando actividad del sistema...</div>}
                    </div>
                </ScrollArea>
            </div>
        )
    );
}