/* eslint-disable react-hooks/incompatible-library */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChevronDown, MessageCircle, MessageCircleOff, Plus, X } from 'lucide-react';
import { TimezoneSelect } from './timezone-select';
import { KeyValueEditor } from './key-value-editor';
import { CreateCronFormData, createCronSchema } from '@app/types/crone.types';
import { toast } from 'sonner';
import { useData, useWhatsApp } from '@/contexts';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { JsonEditor } from './json-editor';
import { DateTimePicker } from './datetime-picker';

interface CreateCronModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateCronModal({ isOpen, onClose }: CreateCronModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedStep, setExpandedStep] = useState<number | null>(0);
    const { setData } = useData();

    const [isFocused, setIsFocused] = useState(false);
    const searchBarRef = useRef<HTMLDivElement>(null); // Ref para el div que encierra el input de busqueda
    const { chats } = useWhatsApp();

    const form = useForm<CreateCronFormData>({
        resolver: zodResolver(createCronSchema),
        defaultValues: {
            timezone: 'America/Bogota',
            startAt: undefined,
            endAt: undefined,
            isActive: false,
            steps: [
                {
                    stepOrder: 1,
                    name: '',
                    method: 'POST',
                    url: '',
                    headers: '{}',
                    bodyType: 'json',
                    body: '{}',
                    requestOptions: '{}',
                    responseFormat: 'text',
                    extract: '{}',
                },
            ],
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

    const handleFormSubmit = async (data: CreateCronFormData) => {
        setIsSubmitting(true);
        toast.promise(window.api.createCron(data), {
            loading: 'Creando Cron...',
            success: (data) => {
                console.log('DATA CREADA', data);

                setData((prev) => [data, ...prev]);

                return `Cron creado con éxito.`;
            },
            error: 'Error.',
        });
        form.reset();
        setIsSubmitting(false);
        onClose();
    };

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
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-card wavy-lines">
                            {/* Header */}
                            <div className="sticky top-0 bg-background/10 backdrop-blur-md border-b border-border/50 p-6 flex items-center justify-between z-10">
                                <div>
                                    <h2 className="text-2xl font-bold">Crear Nueva Configuración</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Define los pasos del workflow y la programación del cron
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
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
                                    {/* Nombre del Grupo */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                    >
                                        <h3 className="text-lg font-semibold mb-4">Información General</h3>

                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="groupName"
                                                render={({ field }) => {
                                                    const filteredChats = chats.filter((chat) =>
                                                        chat.name
                                                            .toLowerCase()
                                                            .includes((field.value ?? '').toLowerCase())
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
                                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-y-auto z-50 max-h-96">
                                                                            <div className="py-2">
                                                                                {filteredChats.length === 0 ? (
                                                                                    <p className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-3">
                                                                                        <MessageCircleOff className="w-4 h-4 text-muted-foreground shrink-0" />
                                                                                        No se encontraron grupos
                                                                                    </p>
                                                                                ) : (
                                                                                    filteredChats.map((chat) => (
                                                                                        <div
                                                                                            key={chat.id._serialized}
                                                                                            className="group relative hover:bg-accent hover:text-accent-foreground"
                                                                                        >
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    field.onChange(
                                                                                                        chat.name
                                                                                                    );
                                                                                                    setIsFocused(false);
                                                                                                }}
                                                                                                className="w-full px-4 py-2 text-left text-sm text-foreground cursor-pointer flex items-center justify-between group transition-colors"
                                                                                            >
                                                                                                <span className="flex items-center gap-3 line-clamp-1 truncate">
                                                                                                    <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                                                                                    {chat.name}
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
                                                            <Input
                                                                placeholder="ej: Contador de Visitantes"
                                                                {...field}
                                                            />
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
                                                        <FormLabel>Descripción (Opcional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="¿Qué hace este workflow?" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Programación */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <h3 className="text-lg font-semibold mb-4">Programación</h3>
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="cronExpression"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Expresión Cron</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="0 0 * * * (Medianoche diariamente)"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Formato: minuto hora día mes día-semana
                                                        </FormDescription>
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
                                                            <TimezoneSelect {...field} />
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
                                    </motion.div>

                                    {/* Workflow Steps */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold">Pasos del Workflow</h3>
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
                                                                    {form.watch(`steps.${index}.bodyType`)} •{' '}
                                                                    {form.watch(`steps.${index}.url`) || 'No URL'}
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
                                    </motion.div>
                                </form>
                            </Form>
                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex gap-3 p-4 border-t border-border/50 sticky bottom-0 bg-background/10 backdrop-blur-md z-10"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    onClick={form.handleSubmit(handleFormSubmit)}
                                    className="flex-1"
                                >
                                    {isSubmitting ? 'Creando...' : 'Crear Configuración'}
                                </Button>
                            </motion.div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
