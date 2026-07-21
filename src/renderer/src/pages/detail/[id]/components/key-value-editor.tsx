'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

interface KeyValuePair {
    key: string;
    value: string;
}

interface KeyValueEditorProps {
    label: string;
    value: string | undefined; // JSON stringificado
    onChange: (value: string) => void;
    placeholder?: string;
}

export function KeyValueEditor({ label, value, onChange, placeholder = 'Agregar clave-valor' }: KeyValueEditorProps) {
    const [pairs, setPairs] = useState<KeyValuePair[]>(() => {
        if (!value) return [];
        try {
            const parsed = JSON.parse(value);
            return Object.entries(parsed).map(([key, val]) => ({
                key,
                value: String(val),
            }));
        } catch {
            return [];
        }
    });

    const updatePairs = (newPairs: KeyValuePair[]) => {
        setPairs(newPairs);
        const obj = newPairs.reduce(
            (acc, pair) => {
                if (pair.key) acc[pair.key] = pair.value;
                return acc;
            },
            {} as Record<string, string>
        );
        onChange(JSON.stringify(obj));
    };

    const addPair = () => {
        updatePairs([...pairs, { key: '', value: '' }]);
    };

    const removePair = (index: number) => {
        updatePairs(pairs.filter((_, i) => i !== index));
    };

    const updatePair = (index: number, key: keyof KeyValuePair, val: string) => {
        const newPairs = [...pairs];
        newPairs[index][key] = val;
        updatePairs(newPairs);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{label}</label>
                <Button type='button' size="sm" variant="outline" onClick={addPair} className="gap-1 bg-transparent">
                    <Plus className="w-3 h-3" />
                    Agregar
                </Button>
            </div>

            <AnimatePresence mode="popLayout">
                {pairs.length === 0 ? (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-muted-foreground py-2"
                    >
                        {placeholder}
                    </motion.p>
                ) : (
                    <Card className="bg-muted/30 p-3 space-y-2">
                        {pairs.map((pair, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex gap-2 items-end"
                            >
                                <Input
                                    placeholder="Clave"
                                    value={pair.key}
                                    onChange={(e) => updatePair(index, 'key', e.target.value)}
                                    className="flex-1 h-8 text-xs bg-background/50"
                                />
                                <Input
                                    placeholder="Valor"
                                    value={pair.value}
                                    onChange={(e) => updatePair(index, 'value', e.target.value)}
                                    className="flex-1 h-8 text-xs bg-background/50"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    type='button'
                                    onClick={() => removePair(index)}
                                    className="h-8 px-2 hover:bg-red-500/10 hover:text-red-500"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </motion.div>
                        ))}
                    </Card>
                )}
            </AnimatePresence>
        </div>
    );
}
