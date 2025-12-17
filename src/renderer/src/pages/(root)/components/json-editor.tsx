'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

interface JsonEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

export function JsonEditor({ label, value, onChange, placeholder = '{}', rows = 4 }: JsonEditorProps) {
    const [isValid, setIsValid] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (newValue: string) => {
        onChange(newValue);

        // Validar JSON si no está vacío
        if (newValue.trim() === '') {
            setIsValid(true);
            setError(null);
            return;
        }

        try {
            JSON.parse(newValue);
            setIsValid(true);
            setError(null);
        } catch {
            setIsValid(false);
            setError('JSON inválido');
        }
    };

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(value || '{}');
            const formatted = JSON.stringify(parsed, null, 2);
            onChange(formatted);
            setIsValid(true);
            setError(null);
        } catch {
            setError('No se puede formatear: JSON inválido');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">{label}</Label>
                <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                        {isValid ? (
                            <motion.div
                                key="valid"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="flex items-center gap-1 text-green-500"
                            >
                                <Check className="w-3 h-3" />
                                <span className="text-xs">Válido</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="invalid"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="flex items-center gap-1 text-red-500"
                            >
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-xs">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <Button type="button" size="sm" variant="ghost" onClick={handleFormat} className="h-6 px-2 text-xs">
                        Formatear
                    </Button>
                </div>
            </div>
            <Textarea
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={`${
                    !isValid && 'focus:ring-destructive/40!'
                }`}
            />
        </div>
    );
}
