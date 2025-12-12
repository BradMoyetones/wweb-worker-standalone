'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChevronDown, Plus, X } from 'lucide-react';
import { TimezoneSelect } from './timezone-select';
import { KeyValueEditor } from './key-value-editor';
import { CreateCronFormData, createCronSchema } from '@app/types/crone.types';
import { toast } from 'sonner';
import { useData } from '@/contexts';

interface CreateCronModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateCronModal({ isOpen, onClose }: CreateCronModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedStep, setExpandedStep] = useState<number | null>(0);
    const {setData} = useData()

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
        reset,
        setValue,
    } = useForm<CreateCronFormData>({
        resolver: zodResolver(createCronSchema),
        defaultValues: {
            timezone: 'America/Bogota',
            isActive: false,
            steps: [
                {
                    stepOrder: 1,
                    name: '',
                    method: 'POST',
                    url: '',
                    headers: '{}',
                    body: '{}',
                    responseFormat: 'text',
                },
            ],
        },
    });

    const {
        fields: stepFields,
        append: appendStep,
        remove: removeStep,
    } = useFieldArray({
        control,
        name: 'steps',
    });

    const handleFormSubmit = async (data: CreateCronFormData) => {
        setIsSubmitting(true);
        toast.promise(window.api.createCron(data), {
            loading: 'Creando Cron...',
            success: (data) => {
                setData((prev) => [data, ...prev])

                return `Cron creado con éxito.`;
            },
            error: 'Error.',
        });
        reset();
        setIsSubmitting(false);
        onClose();
    };

    const timezone = watch('timezone');

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
                            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
                                {/* Nombre del Grupo */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    <h3 className="text-lg font-semibold mb-4">Información General</h3>

                                    <div className="space-y-4">
                                        <div>
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
                                        </div>

                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium">
                                                Nombre Descriptivo
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="ej: Contador de Visitantes"
                                                {...register('name')}
                                                className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-sm font-medium">
                                                Descripción (Opcional)
                                            </Label>
                                            <Input
                                                id="description"
                                                placeholder="¿Qué hace este workflow?"
                                                {...register('description')}
                                                className="mt-2 bg-muted/50 border-border/50 focus:border-primary"
                                            />
                                        </div>
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
                                        <div>
                                            <Label htmlFor="cronExpression" className="text-sm font-medium">
                                                Expresión Cron
                                            </Label>
                                            <Input
                                                id="cronExpression"
                                                placeholder="0 0 * * * (Medianoche diariamente)"
                                                {...register('cronExpression')}
                                                className="mt-2 bg-muted/50 border-border/50 focus:border-primary font-mono text-xs"
                                            />
                                            {errors.cronExpression && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.cronExpression.message}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Formato: minuto hora día mes día-semana
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Zona Horaria</Label>
                                            <TimezoneSelect
                                                value={timezone}
                                                onChange={(val) => setValue('timezone', val)}
                                            />
                                            {errors.timezone && (
                                                <p className="text-xs text-red-500 mt-1">{errors.timezone.message}</p>
                                            )}
                                        </div>
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
                                                    body: '{}',
                                                    responseFormat: 'text',
                                                });
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
                                                                {watch(`steps.${index}.name`) || 'Sin nombre'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {watch(`steps.${index}.method`)} •{' '}
                                                                {watch(`steps.${index}.url`)}
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
                                                                            {...register(`steps.${index}.name`)}
                                                                            className="mt-2 h-8 text-sm bg-muted/50"
                                                                        />
                                                                        {errors.steps?.[index]?.name && (
                                                                            <p className="text-xs text-red-500 mt-1">
                                                                                {errors.steps[index]?.name?.message}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <Label className="text-xs font-medium">
                                                                            Método HTTP
                                                                        </Label>
                                                                        <select
                                                                            {...register(`steps.${index}.method`)}
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
                                                                    <Label className="text-xs font-medium">URL</Label>
                                                                    <Input
                                                                        placeholder="https://api.example.com/endpoint"
                                                                        {...register(`steps.${index}.url`)}
                                                                        className="mt-2 h-8 text-sm bg-muted/50"
                                                                    />
                                                                    {errors.steps?.[index]?.url && (
                                                                        <p className="text-xs text-red-500 mt-1">
                                                                            {errors.steps[index]?.url?.message}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <KeyValueEditor
                                                                    label="Headers"
                                                                    value={watch(`steps.${index}.headers`)}
                                                                    onChange={(val) =>
                                                                        setValue(`steps.${index}.headers`, val)
                                                                    }
                                                                    placeholder="Agregar headers HTTP"
                                                                />

                                                                <KeyValueEditor
                                                                    label="Body (Key-Value)"
                                                                    value={watch(`steps.${index}.body`)}
                                                                    onChange={(val) =>
                                                                        setValue(`steps.${index}.body`, val)
                                                                    }
                                                                    placeholder="Agregar parámetros del body"
                                                                />

                                                                <div className="grid md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label className="text-xs font-medium">
                                                                            Formato de Respuesta
                                                                        </Label>
                                                                        <select
                                                                            {...register(
                                                                                `steps.${index}.responseFormat`
                                                                            )}
                                                                            className="w-full mt-2 h-8 rounded-md border border-border/50 bg-muted/50 text-sm px-2"
                                                                        >
                                                                            <option value="json">JSON</option>
                                                                            <option value="text">Texto Plano</option>
                                                                        </select>
                                                                    </div>

                                                                    <div>
                                                                        <Label className="text-xs font-medium">
                                                                            Data Path (Opcional)
                                                                        </Label>
                                                                        <Input
                                                                            placeholder="ej: data.count"
                                                                            {...register(`steps.${index}.dataPath`)}
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
                                </motion.div>
                            </form>
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
                                    onClick={handleSubmit(handleFormSubmit)}
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
