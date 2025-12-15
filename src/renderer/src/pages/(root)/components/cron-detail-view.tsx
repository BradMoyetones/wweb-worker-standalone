'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Save, AlertCircle, ChevronDown, GitBranch, Trash2, Eye, Edit, X } from 'lucide-react';
import { TimezoneSelect } from './timezone-select';
import { CronWithSteps, UpdateCronFormData, updateCronSchema } from '@app/types/crone.types';
import { useData } from '@/contexts';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { KeyValueEditor } from './key-value-editor';

interface CronDetailViewProps {
    cronId: string;
    onBack: () => void;
}

function mapCronToForm(cron?: CronWithSteps): UpdateCronFormData | undefined {
    if (!cron) return undefined;

    return {
        id: cron.id,
        groupName: cron.groupName ?? '',
        name: cron.name ?? '',
        description: cron.description ?? '',
        cronExpression: cron.cronExpression ?? '',
        timezone: cron.timezone ?? 'America/Bogota',
        isActive: cron.isActive ? true : false,
        steps: cron.steps as any,
        createdAt: cron.createdAt ? Number(cron.createdAt) : undefined,
        updatedAt: cron.updatedAt ? Number(cron.updatedAt) : undefined,
    };
}

export function CronDetailView({ cronId, onBack }: CronDetailViewProps) {
    const { data, setData } = useData();
    const cron = data.find((c) => c.id === cronId);

    const [isSaving, setIsSaving] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
    const [expandedStep, setExpandedStep] = useState<number | null>(0);

    const form = useForm<UpdateCronFormData>({
        resolver: zodResolver(updateCronSchema),
        defaultValues: mapCronToForm(cron) || {
            groupName: '',
            name: '',
            timezone: 'America/Bogota',
            cronExpression: '',
            isActive: false,
        },
    });

    const {
        fields: stepFields,
        append: appendStep,
        remove: removeStep,
    } = useFieldArray({
        control: form.control,
        name: 'steps',
    });

    const onSubmit = async (data: UpdateCronFormData) => {
        setIsSaving(true);
        // await new Promise((resolve) => setTimeout(resolve, 800));
        toast.promise(window.api.updateCron(cron?.id ?? '', data), {
            loading: 'Actualizando Cron...',
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

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const deleted = await window.api.deleteCron(id);

            if (deleted.success) {
                setData((data) => data.filter((cron) => cron.id !== id));
                toast.success('Cron eliminado éxitosamente');
            } else {
                toast.error('Error eliminado Cron');
            }
        } catch {
            toast.error('Error eliminado Cron');
        } finally {
            onBack();
        }
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

    const steps = form.watch('steps') ?? [];

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
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <Button variant="ghost" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </Button>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="destructive" size={'icon'} onClick={(e) => handleDelete(e, cronId)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
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
                            <Card className="bg-card/30 backdrop-blur border-border/50 p-6 relative z-50">
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
                            <Tabs defaultValue="view">
                                <TabsList>
                                    <TabsTrigger value="view">
                                        <Eye />
                                    </TabsTrigger>
                                    <TabsTrigger value="edit">
                                        <Edit />
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="view">
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
                                                    <Card className="bg-muted/30 border-border/50 overflow-hidden p-0 gap-0">
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
                                                                        <p className="font-mono">
                                                                            {step.responseFormat}
                                                                        </p>
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
                                                                            {JSON.stringify(
                                                                                JSON.parse(step.body),
                                                                                null,
                                                                                2
                                                                            )}
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
                                </TabsContent>
                                <TabsContent value="edit">
                                    <Card className="bg-card/30 backdrop-blur border-border/50 p-6">
                                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <GitBranch className="w-4 h-4" />
                                            Pasos del Workflow
                                        </h2>
                                        <div className="space-y-2">
                                            {stepFields.map((field, index) => (
                                                <motion.div
                                                    key={field.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <Card className="bg-muted/30 border-border/50 overflow-hidden p-0 gap-0">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedStep(expandedStep === index ? null : index)
                                                            }
                                                            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="text-left">
                                                                <p className="font-medium text-sm">
                                                                    Paso {index + 1}:{' '}
                                                                    {form.watch(`steps.${index}.name`) || 'Sin nombre'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {form.watch(`steps.${index}.method`)} •{' '}
                                                                    {form.watch(`steps.${index}.url`)}
                                                                </p>
                                                            </div>
                                                            <ChevronDown
                                                                className={`w-4 h-4 transition-transform ${expandedStep === index ? 'rotate-180' : ''}`}
                                                            />
                                                        </button>

                                                        <AnimatePresence>
                                                            {expandedStep === index && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="border-t border-border/50 p-4 bg-background/50 space-y-4"
                                                                >
                                                                    <div className="grid md:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <Label className="text-xs font-medium">
                                                                                Nombre del Paso
                                                                            </Label>
                                                                            <Input
                                                                                placeholder="ej: Login"
                                                                                {...form.register(
                                                                                    `steps.${index}.name`
                                                                                )}
                                                                                className="mt-2 h-8 text-sm bg-muted/50"
                                                                            />
                                                                            {form.formState.errors.steps?.[index]
                                                                                ?.name && (
                                                                                <p className="text-xs text-red-500 mt-1">
                                                                                    {
                                                                                        form.formState.errors.steps[
                                                                                            index
                                                                                        ]?.name?.message
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <Label className="text-xs font-medium">
                                                                                Método HTTP
                                                                            </Label>
                                                                            <select
                                                                                {...form.register(
                                                                                    `steps.${index}.method`
                                                                                )}
                                                                                className="w-full mt-2 h-8 rounded-md border border-border/50 bg-muted/50 text-sm px-2"
                                                                            >
                                                                                <option value="GET">GET</option>
                                                                                <option value="POST">POST</option>
                                                                                <option value="PUT">PUT</option>
                                                                                <option value="DELETE">DELETE</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <Label className="text-xs font-medium">
                                                                            URL
                                                                        </Label>
                                                                        <Input
                                                                            placeholder="https://api.example.com/endpoint"
                                                                            {...form.register(`steps.${index}.url`)}
                                                                            className="mt-2 h-8 text-sm bg-muted/50"
                                                                        />
                                                                        {form.formState.errors.steps?.[index]?.url && (
                                                                            <p className="text-xs text-red-500 mt-1">
                                                                                {
                                                                                    form.formState.errors.steps[index]
                                                                                        ?.url?.message
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <KeyValueEditor
                                                                        label="Headers"
                                                                        value={form.watch(`steps.${index}.headers`)}
                                                                        onChange={(val) =>
                                                                            form.setValue(`steps.${index}.headers`, val)
                                                                        }
                                                                        placeholder="Agregar headers HTTP"
                                                                    />

                                                                    <KeyValueEditor
                                                                        label="Body (Key-Value)"
                                                                        value={form.watch(`steps.${index}.body`)}
                                                                        onChange={(val) =>
                                                                            form.setValue(`steps.${index}.body`, val)
                                                                        }
                                                                        placeholder="Agregar parámetros del body"
                                                                    />

                                                                    <div className="grid md:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <Label className="text-xs font-medium">
                                                                                Formato de Respuesta
                                                                            </Label>
                                                                            <select
                                                                                {...form.register(
                                                                                    `steps.${index}.responseFormat`
                                                                                )}
                                                                                className="w-full mt-2 h-8 rounded-md border border-border/50 bg-muted/50 text-sm px-2"
                                                                            >
                                                                                <option value="json">JSON</option>
                                                                                <option value="text">
                                                                                    Texto Plano
                                                                                </option>
                                                                            </select>
                                                                        </div>

                                                                        <div>
                                                                            <Label className="text-xs font-medium">
                                                                                Data Path (Opcional)
                                                                            </Label>
                                                                            <Input
                                                                                placeholder="ej: data.count"
                                                                                {...form.register(
                                                                                    `steps.${index}.dataPath`
                                                                                )}
                                                                                className="mt-2 h-8 text-sm bg-muted/50"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {stepFields.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => removeStep(index)}
                                                                            className="w-full gap-2"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                            Eliminar Paso
                                                                        </Button>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            {/* Status */}
                            <Card className="bg-card/30 border-border/50 p-6">
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
                                <Button type="button" variant="outline" onClick={onBack} disabled={isSaving}>
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
