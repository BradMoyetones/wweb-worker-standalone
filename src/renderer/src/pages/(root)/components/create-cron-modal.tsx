'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { cronConfigSchema, type CronConfig } from '@/lib/schemas';

// Schema para creación (sin id, createdAt, updatedAt)
export const createCronSchema = cronConfigSchema.omit({
    id: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
});

type CreateCronFormData = z.infer<typeof createCronSchema>;

interface CreateCronModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<CronConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function CreateCronModal({ isOpen, onClose, onSubmit }: CreateCronModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateCronFormData>({
        resolver: zodResolver(createCronSchema),
        defaultValues: {
            timezone: 'America/Bogota',
            hiddenField: 'S',
            intervalMinutes: 5,
            startAt: '09:00',
        },
    });

    const handleFormSubmit = async (data: CreateCronFormData) => {
        setIsSubmitting(true);
        const newCron = {
            ...data,
            isActive: false,
        };

        console.log('[v0] Nueva configuración de crone creada:', newCron);
        onSubmit(newCron as Omit<CronConfig, 'id' | 'createdAt' | 'updatedAt'>);

        reset();
        setIsSubmitting(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                            {/* Header */}
                            <div className="sticky top-0 bg-background border-b border-border/50 p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Crear Nueva Configuración</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Completa los datos para crear una nueva configuración de crone
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 pt-6 space-y-6">
                                {/* Nombre del Grupo */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    <Label htmlFor="groupName" className="text-sm font-medium">
                                        Nombre del Grupo
                                    </Label>
                                    <Input
                                        id="groupName"
                                        placeholder="ej: Workers WhatsApp Prod"
                                        {...register('groupName')}
                                        className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                    />
                                    {errors.groupName && (
                                        <p className="text-xs text-red-500 mt-1">{errors.groupName.message}</p>
                                    )}
                                </motion.div>

                                {/* URLs */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <Label htmlFor="apiUrl" className="text-sm font-medium">
                                            API URL
                                        </Label>
                                        <Input
                                            id="apiUrl"
                                            placeholder="https://api.example.com"
                                            {...register('apiUrl')}
                                            className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                        />
                                        {errors.apiUrl && (
                                            <p className="text-xs text-red-500 mt-1">{errors.apiUrl.message}</p>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <Label htmlFor="apiLoginUrl" className="text-sm font-medium">
                                            API Login URL
                                        </Label>
                                        <Input
                                            id="apiLoginUrl"
                                            placeholder="https://api.example.com/login"
                                            {...register('apiLoginUrl')}
                                            className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                        />
                                        {errors.apiLoginUrl && (
                                            <p className="text-xs text-red-500 mt-1">{errors.apiLoginUrl.message}</p>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Credenciales */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label htmlFor="username" className="text-sm font-medium">
                                            Usuario
                                        </Label>
                                        <Input
                                            id="username"
                                            placeholder="usuario@example.com"
                                            {...register('username')}
                                            className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                        />
                                        {errors.username && (
                                            <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Contraseña
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...register('password')}
                                            className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                        />
                                        {errors.password && (
                                            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Configuración de Tiempo */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Label htmlFor="startAt" className="text-sm font-medium">
                                            Inicia A
                                        </Label>
                                        <Input
                                            id="startAt"
                                            placeholder="HH:MM"
                                            {...register('startAt')}
                                            className="mt-2 bg-muted/50 border-border/50 focus:border-primary font-mono"
                                        />
                                        {errors.startAt && (
                                            <p className="text-xs text-red-500 mt-1">{errors.startAt.message}</p>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <Label htmlFor="intervalMinutes" className="text-sm font-medium">
                                            Intervalo (minutos)
                                        </Label>
                                        <Input
                                            id="intervalMinutes"
                                            type="number"
                                            min="1"
                                            max="1440"
                                            {...register('intervalMinutes', { valueAsNumber: true })}
                                            className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                        />
                                        {errors.intervalMinutes && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.intervalMinutes.message}
                                            </p>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Label htmlFor="timezone" className="text-sm font-medium">
                                            Zona Horaria
                                        </Label>
                                        <Input
                                            id="timezone"
                                            placeholder="America/Bogota"
                                            {...register('timezone')}
                                            className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                        />
                                        {errors.timezone && (
                                            <p className="text-xs text-red-500 mt-1">{errors.timezone.message}</p>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Campo Oculto */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                >
                                    <Label htmlFor="hiddenField" className="text-sm font-medium">
                                        Campo Oculto
                                    </Label>
                                    <Input
                                        id="hiddenField"
                                        placeholder="S"
                                        {...register('hiddenField')}
                                        className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                    />
                                    {errors.hiddenField && (
                                        <p className="text-xs text-red-500 mt-1">{errors.hiddenField.message}</p>
                                    )}
                                </motion.div>

                                {/* Actions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex gap-3 py-4 border-t border-border/50 sticky bottom-0 bg-card"
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-transparent"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                                        {isSubmitting ? 'Creando...' : 'Crear Configuración'}
                                    </Button>
                                </motion.div>
                            </form>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
