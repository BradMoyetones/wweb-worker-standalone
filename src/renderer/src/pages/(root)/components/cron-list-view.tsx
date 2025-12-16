'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, Variants } from 'motion/react';
import { Plus, Play, Pause, Trash2, ChevronRight, GitBranch } from 'lucide-react';
import { CronWithSteps, UpdateCronFormData } from '@app/types/crone.types';
import { useData } from '@/contexts';
import { toast } from 'sonner';
import { useState } from 'react';
import { mapCronToForm } from '@app/utils/helpers';

interface CronListViewProps {
    onSelectCron: (id: string) => void;
    onCreateCron: () => void;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
};

export function CronListView({ onSelectCron, onCreateCron }: CronListViewProps) {
    const { data: crons } = useData();

    const activeCount = crons.filter((c) => c.isActive).length;
    const totalCount = crons.length;

    return (
        <div className="min-h-screen bg-linear-to-b from-primary/15 via-transparent to-transparent p-4 md:p-8 rounded-xl">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Configuraciones de Crones</h1>
                            <p className="text-muted-foreground mt-2">
                                {activeCount} de {totalCount} crones activos
                            </p>
                        </div>
                        <Button size="lg" className="gap-2" onClick={onCreateCron}>
                            <Plus className="w-4 h-4" />
                            Nuevo Crone
                        </Button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    <Card className="p-4">
                        <div className="text-sm text-muted-foreground">Total de Crones</div>
                        <div className="text-2xl font-bold mt-1">{totalCount}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-muted-foreground">Activos</div>
                        <div className="text-2xl font-bold text-emerald-500 mt-1">{activeCount}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-muted-foreground">Inactivos</div>
                        <div className="text-2xl font-bold text-amber-500 mt-1">{totalCount - activeCount}</div>
                    </Card>
                </motion.div>

                {/* Cron List */}
                <div className="grid gap-4">
                    {crons.length > 0 ? (
                        crons.map((cron) => (
                            <motion.div
                                layout
                                key={cron.id + '-list-item'}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <CronCard cron={cron} onSelect={onSelectCron} stepsCount={cron.steps.length} />
                            </motion.div>
                        ))
                    ) : (
                        <Card className="p-4">
                            <p className="text-center">No hay Crons aún.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function CronCard({
    cron,
    onSelect,
    stepsCount,
}: {
    cron: CronWithSteps;
    onSelect: (id: string) => void;
    stepsCount: number;
}) {
    const { setData } = useData();
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const wantToggle = confirm(`¿Estas seguro de ${cron.isActive ? 'Detener' : 'Activar'} este Cron?`)

        if(!wantToggle) {
            toast.info('Operación cancelada')
            return
        }

        setIsSaving(true);
        // await new Promise((resolve) => setTimeout(resolve, 800));
        let parsedToForm = mapCronToForm(cron);
        if (!parsedToForm) {
            toast.error('Error al actualizar cron')
            return
        }

        parsedToForm = {
            ...parsedToForm,
            isActive: !cron.isActive,
        };

        toast.promise(window.api.updateCron(cron?.id ?? '', parsedToForm), {
            loading: `${cron.isActive ? 'Pausando' : 'Activando'} Cron...`,
            success: (data) => {
                if (!data) return 'Error: respuesta vacía';

                setData((prev) => prev.map((item) => (item.id === data.id ? data : item)));

                return `Cron ${cron.isActive ? 'Pausado' : 'Activado'} con éxito.`;
            },
            error: 'Error.',
        });
        console.log('Guardando configuración:', parsedToForm);
        setIsSaving(false);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const wantDelete = confirm("¿Estas seguro de eliminar este Cron?")

        if(!wantDelete) {
            toast.info('Operación cancelada')
            return
        }

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
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{
                ease: 'linear',
                duration: 0.1,
            }}
            onClick={() => onSelect(cron.id!)}
            className="cursor-pointer"
        >
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    cron.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
                                }`}
                            />
                            <h3 className="text-lg font-semibold">{cron.name}</h3>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                    cron.isActive
                                        ? 'bg-emerald-500/20 text-emerald-600'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {cron.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-3">
                            <span>Grupo: {cron.groupName}</span>
                            <span className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                {stepsCount} paso{stepsCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {cron.description && <p className="text-xs text-muted-foreground mt-1">{cron.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggle}
                            className="hover:bg-muted/50 cursor-pointer"
                            disabled={isSaving}
                        >
                            {cron.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDelete(e)}
                            className="hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                            disabled={isSaving}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
