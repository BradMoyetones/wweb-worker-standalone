'use client';

import type React from 'react';

import { mockCronWorkflowSteps } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Plus, Play, Pause, Trash2, ChevronRight, GitBranch } from 'lucide-react';
import { FormCronConfig } from '@app/types/crone.types';
import { useData } from '@/contexts';

interface CronListViewProps {
    onSelectCron: (id: string) => void;
    onCreateCron: () => void
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
};

export function CronListView({ onSelectCron, onCreateCron }: CronListViewProps) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const {data: crons} = useData()

    const activeCount = crons.filter((c) => c.isActive).length;
    const totalCount = crons.length;

    const getStepCount = (cronId: string) => {
        return mockCronWorkflowSteps.filter((s) => s.cronConfigId === cronId).length
    }

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
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4">
                    {crons.length > 0 ? crons.map((cron) => (
                        <motion.div key={cron.id} variants={itemVariants}>
                            <CronCard cron={cron} onSelect={onSelectCron} stepsCount={getStepCount(cron.id!)} />
                        </motion.div>
                    )): (
                        <Card className='p-4'>
                            <p className='text-center'>
                                No hay Crons aún.
                            </p>
                        </Card>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function CronCard({ cron, onSelect, stepsCount }: { cron: FormCronConfig; onSelect: (id: string) => void; stepsCount: number }) {
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{
                ease: "linear",
                duration: 0.1
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
                                {stepsCount} paso{stepsCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                        {cron.description && <p className="text-xs text-muted-foreground mt-1">{cron.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleToggle} className="hover:bg-muted/50">
                            {cron.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="hover:bg-red-500/10 hover:text-red-500"
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
