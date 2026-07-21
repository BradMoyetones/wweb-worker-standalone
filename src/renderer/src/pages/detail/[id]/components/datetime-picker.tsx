'use client';

import type React from 'react';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateTimePickerProps {
    label: string;
    value: number | null | undefined; // timestamp
    onChange: (timestamp: number | null) => void;
    placeholder?: string;
}

export function DateTimePicker({ label, value, onChange, placeholder }: DateTimePickerProps) {
    // Convert timestamp to datetime-local format (YYYY-MM-DDTHH:MM)
    const timestampToDatetimeLocal = (ts: number | null | undefined): string => {
        if (!ts) return '';
        const date = new Date(ts);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Convert datetime-local to timestamp
    const datetimeLocalToTimestamp = (str: string): number | null => {
        if (!str) return null;
        return new Date(str).getTime();
    };

    const [localValue, setLocalValue] = useState<string>(timestampToDatetimeLocal(value));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        onChange(datetimeLocalToTimestamp(newValue));
    };

    const handleClear = () => {
        setLocalValue('');
        onChange(null);
    };

    return (
        <div>
            <Label className="text-sm font-medium mb-2 block">{label}</Label>
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                    type="datetime-local"
                    value={localValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
                />
                <AnimatePresence>
                    {localValue && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            type="button"
                            onClick={handleClear}
                            className="absolute inset-y-0 right-2 flex h-fit items-center hover:bg-muted rounded-md p-1 top-1.5 transition-colors"
                        >
                            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
                {value ? `Timestamp: ${value}` : placeholder || 'Selecciona fecha y hora'}
            </p>
        </div>
    );
}
