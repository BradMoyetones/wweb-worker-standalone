'use client';

import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AnimatePresence, motion } from 'motion/react';
import {
    ArrowLeft,
    Save,
    AlertCircle,
    ChevronDown,
    GitBranch,
    Trash2,
    Eye,
    Edit,
    X,
    Plus,
    MessageCircle,
    MessageCircleOff,
} from 'lucide-react';
import { TimezoneSelect } from './components/timezone-select';
import { UpdateCronFormData, updateCronSchema } from '@app/types/crone.types';
import { useData, useWhatsApp } from '@/contexts';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { KeyValueEditor } from './components/key-value-editor';
import { JsonEditor } from './components/json-editor';
import { mapCronToForm } from '@app/utils/helpers';
import { DateTimePicker } from './components/datetime-picker';
import { useNavigate, useParams } from 'react-router';
import { Spinner } from '@/components/ui/spinner';

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

export default function DetailPage() {
    const { data, setData } = useData();
    const { id: cronId } = useParams();
    const cron = data.find((c) => c.id === cronId);

    const [isSaving, setIsSaving] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
    const [expandedStep, setExpandedStep] = useState<number | null>(0);

    const [isFocused, setIsFocused] = useState(false);
    const searchBarRef = useRef<HTMLDivElement>(null); // Ref para el div que encierra el input de busqueda
    const { contacts } = useWhatsApp();
    const navigate = useNavigate()

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        // Listener para cuando se cliquee fuera del Historial al estar desplegado
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onBack = () => {
        navigate("/", { viewTransition: true });
    }

    if (!cron) {
        return (
            <div className="flex items-center justify-center h-full">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <GitBranch />
                        </EmptyMedia>
                        <EmptyTitle>Configuración no encontrada</EmptyTitle>
                        <EmptyDescription>
                            No se encontro la configuración que buscas.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="flex-row justify-center gap-2">
                        <Button onClick={onBack}>Volver</Button>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    const onSubmit = async (data: UpdateCronFormData) => {
        console.log("DATA ENVIADA AL BACKEND", data);

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
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const deleted = await window.api.deleteCron(cron);

            if (deleted.success) {
                setData((data) => data.filter((c) => c.id !== cron.id));
                toast.success('Cron eliminado éxitosamente');
            } else {
                toast.error('Error eliminado Cron');
            }
        } catch {
            toast.error('Error eliminado Cron');
        } finally {
        }
    };

    const toggleStep = (index: number) => {
        setExpandedSteps((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    };

    const steps = form.watch('steps') ?? [];



    return (
        <div>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between gap-4 mb-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft />
                        Volver
                    </Button>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="destructive" size={'icon'} onClick={handleDelete}>
                                <Trash2 />
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Información General</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="groupName"
                                        render={({ field }) => {
                                            const filteredContacts = contacts.filter((contact) =>
                                                contact.name?.toLowerCase().includes((field.value ?? '').toLowerCase())
                                            );

                                            return (
                                                <FormItem>
                                                    <FormLabel>Nombre del Grupo</FormLabel>
                                                    <FormControl>
                                                        <div ref={searchBarRef} className="relative flex-1">
                                                            <Input
                                                                onFocus={() => setIsFocused(true)}
                                                                placeholder="ej: PJD SERVICIO Y EVENTOS"
                                                                {...field}
                                                            />
                                                            {isFocused && (
                                                                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-y-auto z-9999 max-h-96">
                                                                    <div className="py-2">
                                                                        {filteredContacts.length === 0 ? (
                                                                            <p className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-3">
                                                                                <MessageCircleOff className="w-4 h-4 text-muted-foreground shrink-0" />
                                                                                No se encontraron grupos
                                                                            </p>
                                                                        ) : (
                                                                            filteredContacts.map((contact) => (
                                                                                <div
                                                                                    key={contact.id._serialized}
                                                                                    className="group relative hover:bg-accent hover:text-accent-foreground"
                                                                                >
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            field.onChange(contact.name);
                                                                                            setIsFocused(false);
                                                                                        }}
                                                                                        className="w-full px-4 py-2 text-left text-sm text-foreground cursor-pointer flex items-center justify-between group transition-colors"
                                                                                    >
                                                                                        <span className="flex items-center gap-3 line-clamp-1 truncate">
                                                                                            <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                                                                            {contact.name}
                                                                                        </span>
                                                                                    </button>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
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
                            </CardContent>
                        </Card>

                        {/* Schedule Configuration */}
                        <Card className="bg-card/30 backdrop-blur border-border/50 relative z-50 overflow-visible">
                            <CardHeader>
                                <CardTitle>Programación</CardTitle>
                            </CardHeader>
                            <CardContent>
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

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="startAt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <DateTimePicker
                                                            label="Inicio (Opcional)"
                                                            placeholder="Ejecutar desde..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="endAt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <DateTimePicker
                                                            label="Fin (Opcional)"
                                                            placeholder="Ejecutar hasta..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Deja vacío para ejecución inmediata (inicio) o indefinida (fin)
                                    </p>
                                </div>
                            </CardContent>
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
                                <Card className="bg-card/30 backdrop-blur border-border/50">
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                            <GitBranch className='size-4' />
                                            Pasos del Workflow
                                        </CardTitle>
                                        <CardAction>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    appendStep({
                                                        stepOrder: stepFields.length + 1,
                                                        name: '',
                                                        method: 'POST',
                                                        url: '',
                                                        headers: '{}',
                                                        bodyType: 'json',
                                                        body: '{}',
                                                        requestOptions: '',
                                                        responseFormat: 'text',
                                                        extract: '',
                                                    });
                                                    setExpandedStep(stepFields.length);
                                                }}
                                                className="gap-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Agregar Paso
                                            </Button>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
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
                                                                {step.requestOptions &&
                                                                    step.requestOptions !== '{}' && (
                                                                        <div>
                                                                            <p className="text-muted-foreground">
                                                                                Request Options
                                                                            </p>
                                                                            <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                                                                                {JSON.stringify(
                                                                                    JSON.parse(step.requestOptions),
                                                                                    null,
                                                                                    2
                                                                                )}
                                                                            </pre>
                                                                        </div>
                                                                    )}
                                                                {step.extract && step.extract !== '{}' && (
                                                                    <div>
                                                                        <p className="text-muted-foreground">Extract</p>
                                                                        <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                                                                            {JSON.stringify(
                                                                                JSON.parse(step.extract),
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
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="edit">
                                <Card className="bg-card/30 backdrop-blur border-border/50">
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <GitBranch />
                                                Pasos del Workflow
                                            </h3>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    appendStep({
                                                        stepOrder: stepFields.length + 1,
                                                        name: '',
                                                        method: 'POST',
                                                        url: '',
                                                        headers: '{}',
                                                        bodyType: 'json',
                                                        body: '{}',
                                                        requestOptions: '',
                                                        responseFormat: 'text',
                                                        extract: '',
                                                    });
                                                    setExpandedStep(stepFields.length);
                                                }}
                                                className="gap-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Agregar Paso
                                            </Button>
                                        </div>
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
                                                                        value={
                                                                            form.watch(`steps.${index}.headers`) || '{}'
                                                                        }
                                                                        onChange={(val) =>
                                                                            form.setValue(`steps.${index}.headers`, val)
                                                                        }
                                                                        placeholder="Agregar headers HTTP"
                                                                    />

                                                                    <div>
                                                                        <Label className="text-xs font-medium">
                                                                            Tipo de Body
                                                                        </Label>
                                                                        <select
                                                                            {...form.register(
                                                                                `steps.${index}.bodyType`
                                                                            )}
                                                                            className="w-full mt-2 h-8 rounded-md border border-border/50 bg-muted/50 text-sm px-2"
                                                                        >
                                                                            <option value="json">JSON</option>
                                                                            <option value="urlencoded">
                                                                                URL Encoded
                                                                            </option>
                                                                            <option value="form">Form Data</option>
                                                                            <option value="none">Sin Body</option>
                                                                        </select>
                                                                    </div>

                                                                    {form.watch(`steps.${index}.bodyType`) !==
                                                                        'none' && (
                                                                            <KeyValueEditor
                                                                                label="Body (Key-Value)"
                                                                                value={
                                                                                    form.watch(`steps.${index}.body`) ||
                                                                                    '{}'
                                                                                }
                                                                                onChange={(val) =>
                                                                                    form.setValue(
                                                                                        `steps.${index}.body`,
                                                                                        val
                                                                                    )
                                                                                }
                                                                                placeholder="Agregar parámetros del body"
                                                                            />
                                                                        )}

                                                                    <JsonEditor
                                                                        label="Request Options (Opcional)"
                                                                        value={
                                                                            form.watch(
                                                                                `steps.${index}.requestOptions`
                                                                            ) || ''
                                                                        }
                                                                        onChange={(val) =>
                                                                            form.setValue(
                                                                                `steps.${index}.requestOptions`,
                                                                                val
                                                                            )
                                                                        }
                                                                        placeholder='{ "redirect": "manual" }'
                                                                        rows={3}
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
                                                                    </div>

                                                                    <JsonEditor
                                                                        label="Extract (Opcional)"
                                                                        value={
                                                                            form.watch(`steps.${index}.extract`) || ''
                                                                        }
                                                                        onChange={(val) =>
                                                                            form.setValue(`steps.${index}.extract`, val)
                                                                        }
                                                                        placeholder='{ "cookies.session": { "from": "headers", "key": "set-cookie" } }'
                                                                        rows={4}
                                                                    />

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
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Status */}
                        <Card className="bg-card/30 border-border/50">
                            <CardContent>
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
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="flex gap-3"
                        >
                            <Button type="button" variant="outline" disabled={isSaving} onClick={onBack}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Spinner />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </Form>
            </motion.div>
        </div>
    );
}
