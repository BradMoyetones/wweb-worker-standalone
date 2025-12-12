'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'motion/react';
import { ArrowLeft, Save, AlertCircle, ChevronDown, GitBranch } from 'lucide-react';
import { TimezoneSelect } from './timezone-select';
import { cronConfigSchema } from '@app/types/zod.types';
import { CronWithSteps, FormCronConfig, UpdateCronInput } from '@app/types/crone.types';
import { useData } from '@/contexts';
import { toast } from 'sonner';

interface CronDetailViewProps {
    cronId: string;
    onBack: () => void;
}

function mapCronToForm(cron?: CronWithSteps): FormCronConfig | undefined {
    if (!cron) return undefined;

    return {
        id: cron.id,
        groupName: cron.groupName ?? '',
        name: cron.name ?? '',
        description: cron.description ?? '',
        cronExpression: cron.cronExpression ?? '',
        timezone: cron.timezone ?? 'America/Bogota',
        isActive: cron.isActive ? true : false,
        createdAt: cron.createdAt ? Number(cron.createdAt) : undefined,
        updatedAt: cron.updatedAt ? Number(cron.updatedAt) : undefined,
    };
}

export function CronDetailView({ cronId, onBack }: CronDetailViewProps) {
    const { data, setData } = useData();
    const cron = data.find((c) => c.id === cronId);

    const steps = cron?.steps ?? [];

    const [isSaving, setIsSaving] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

    const form = useForm<FormCronConfig>({
        resolver: zodResolver(cronConfigSchema),
        defaultValues: mapCronToForm(cron) || {
            groupName: '',
            name: '',
            timezone: 'America/Bogota',
            cronExpression: '',
            isActive: false,
        },
    });

    const onSubmit = async (data: UpdateCronInput) => {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.promise(window.api.updateCron(cron?.id ?? '', data), {
            loading: 'Creando Cron...',
            success: (data) => {
                if (!data) return 'Error: respuesta vacía';

                setData((prev) => prev.map((item) => (item.id === data.id ? data : item)));

                return `Cron actualizado con éxito.`;
            },
            error: 'Error.',
        });
        console.log('Guardando configuración:', data);
        setIsSaving(false);
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

    const toggleStep = (index: number) => {
        setExpandedSteps((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    };

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
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{cron.name}</h1>
                    <p className="text-muted-foreground mt-2">
                        {cron.groupName} • Última actualización:{' '}
                        {new Date(cron.updatedAt)?.toLocaleDateString('es-ES') ?? 'No actualizado'}
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
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre Descriptivo</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: Contador de Visitantes" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descripción</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Descripción del workflow" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Schedule Configuration */}
                            <Card className="bg-card/30 backdrop-blur border-border/50 p-6">
                                <h2 className="text-lg font-semibold mb-4">Programación</h2>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="cronExpression"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expresión Cron</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="0 0 * * *"
                                                        {...field}
                                                        className="font-mono text-xs"
                                                    />
                                                </FormControl>
                                                <FormDescription>Minuto Hora Día Mes Día-semana</FormDescription>
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
                                                    <TimezoneSelect value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Workflow Steps */}
                            {steps.length > 0 && (
                                <Card className="bg-card/30 backdrop-blur border-border/50 p-6">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <GitBranch className="w-4 h-4" />
                                        Pasos del Workflow
                                    </h2>
                                    <div className="space-y-2">
                                        {steps.map((step, index) => (
                                            <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <Card className="bg-muted/30 border-border/50 overflow-hidden p-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleStep(index)}
                                                        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="text-left">
                                                            <p className="font-medium text-sm">
                                                                Paso {step.stepOrder}: {step.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {step.method} • {step.url}
                                                            </p>
                                                        </div>
                                                        <ChevronDown
                                                            className={`w-4 h-4 transition-transform ${expandedSteps.includes(index) ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>

                                                    {expandedSteps.includes(index) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="border-t border-border/50 p-3 bg-background/50 space-y-2 text-xs"
                                                        >
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <p className="text-muted-foreground">Formato</p>
                                                                    <p className="font-mono">{step.responseFormat}</p>
                                                                </div>
                                                                {step.dataPath && (
                                                                    <div>
                                                                        <p className="text-muted-foreground">
                                                                            Data Path
                                                                        </p>
                                                                        <p className="font-mono">{step.dataPath}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {step.headers && step.headers !== '{}' && (
                                                                <div>
                                                                    <p className="text-muted-foreground">Headers</p>
                                                                    <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                                                                        {JSON.stringify(
                                                                            JSON.parse(step.headers),
                                                                            null,
                                                                            2
                                                                        )}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {step.body && step.body !== '{}' && (
                                                                <div>
                                                                    <p className="text-muted-foreground">Body</p>
                                                                    <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                                                                        {JSON.stringify(JSON.parse(step.body), null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Status */}
                            <Card className="bg-card/30 backdrop-blur border-border/50 p-6">
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
