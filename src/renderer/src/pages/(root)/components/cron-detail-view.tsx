'use client';

import { useState, useMemo } from 'react';
import { mockCronConfigs } from '@/lib/mock-data';
import { type CronConfig, cronConfigSchema } from '@/lib/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface CronDetailViewProps {
    cronId: string;
    onBack: () => void;
    onSave: () => void;
}

export function CronDetailView({ cronId, onBack, onSave }: CronDetailViewProps) {
    const cron = useMemo(() => mockCronConfigs.find((c) => c.id === cronId), [cronId]);

    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<CronConfig>({
        resolver: zodResolver(cronConfigSchema),
        defaultValues: cron || {
            id: Date.now().toString(),
            groupName: '',
            apiUrl: '',
            apiLoginUrl: '',
            timezone: 'America/Bogota',
            username: '',
            password: '',
            hiddenField: 'S',
            startAt: '10:00',
            intervalMinutes: 30,
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    const onSubmit = async (data: CronConfig) => {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log('Guardando configuración:', data);
        setIsSaving(false);
        onSave();
        onBack();
    };

    if (!cron) {
        return (
            <div className="min-h-screen bg-linear-to-b from-primary/15 via-transparent to-transparent flex items-center justify-center p-4 rounded-xl">
                <Card className="bg-card border-border p-6">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    <p className="text-center">Configuración no encontrada</p>
                    <Button onClick={onBack} className="mt-4 w-full">
                        Volver
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-primary/15 via-transparent to-transparent p-4 md:p-8 rounded-xl">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <Button variant="ghost" className="gap-2 mb-4" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{cron.groupName}</h1>
                    <p className="text-muted-foreground mt-2">
                        Última actualización: {cron.updatedAt.toLocaleDateString('es-ES')}
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Configuration */}
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Información General</h2>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="groupName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre del Grupo</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: PJD SERVICIO Y EVENTOS" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="timezone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Zona Horaria</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="America/Bogota" {...field} />
                                                </FormControl>
                                                <FormDescription>Zona horaria para ejecutar el cron</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* API Configuration */}
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Configuración de API</h2>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="apiUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL de API</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://example.com/api"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="apiLoginUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL de Login</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://example.com/login"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Credentials */}
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Credenciales</h2>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Usuario</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="usuario@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contraseña</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="hiddenField"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Campo Oculto</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="S" {...field} />
                                                </FormControl>
                                                <FormDescription>Valor del campo oculto del formulario</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Schedule Configuration */}
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Programación</h2>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="startAt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hora de Inicio (HH:MM)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="10:00" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Formato 24 horas (ej: 14:30 para 2:30 PM)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="intervalMinutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Intervalo (Minutos)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="30"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(Number.parseInt(e.target.value))
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>Minutos entre cada ejecución</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Status */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <FormLabel className="text-base">Estado</FormLabel>
                                        <FormDescription>
                                            {form.watch('isActive')
                                                ? 'Cron actualmente activo'
                                                : 'Cron actualmente inactivo'}
                                        </FormDescription>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="flex gap-3"
                            >
                                <Button variant="outline" onClick={onBack} disabled={isSaving}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSaving} className="gap-2">
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </Form>
                </motion.div>
            </div>
        </div>
    );
}
