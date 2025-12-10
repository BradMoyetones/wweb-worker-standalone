'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TIMEZONES } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface TimezoneSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = TIMEZONES.filter((tz) => tz.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="relative">
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Escribe o selecciona una zona horaria"
                    onFocus={() => setIsOpen(true)}
                    className="bg-muted/50 border-border/50 focus:border-primary"
                />
                <Button size="sm" variant="outline" onClick={() => setIsOpen(!isOpen)} className="px-3">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50"
                    >
                        <Card className="bg-background border-border p-0 max-h-64 overflow-y-auto gap-0">
                            <div className='p-2 bg-background/30 backdrop-blur-lg sticky top-0 rounded-xl border-b'>
                                <Input
                                    placeholder="Buscar zona horaria..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-8 text-xs bg-muted/50"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1 p-2">
                                {filtered.length === 0 ? (
                                    <p className="text-xs text-muted-foreground p-2">No hay resultados</p>
                                ) : (
                                    filtered.map((tz) => (
                                        <button
                                            key={tz}
                                            onClick={() => {
                                                onChange(tz);
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                            className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                                                value === tz
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted text-foreground'
                                            }`}
                                        >
                                            {tz}
                                        </button>
                                    ))
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
