'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { 
    Plus, Play, Pause, Trash2, ChevronRight, GitBranch, 
    Download, Upload, FileJson, CheckSquare, Square, X 
} from 'lucide-react';
import { CronWithSteps } from '@app/types/crone.types';
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function CronListView({ onSelectCron, onCreateCron }: CronListViewProps) {
    const { data: crons, setData } = useData();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const activeCount = crons.filter((c) => c.isActive).length;
    const totalCount = crons.length;

    // Lógica de Importación
    const handleImport = async () => {
        toast.promise(window.api.importCrons(), {
            loading: 'Abriendo selector de archivos...',
            success: (res) => {
                if (res.success && res.imported.length > 0) {
                    // Insertamos los nuevos al principio como pediste
                    setData((prev) => [...res.imported, ...prev]);
                    return res.message;
                }
                if (res.success && res.imported.length === 0) return 'Importación cancelada';
                throw new Error(res.message);
            },
            error: (err) => `Error: ${err.message}`,
        });
    };

    // Lógica de Exportación Múltiple
    const handleExportSelected = async () => {
        if (selectedIds.length === 0) return;
        
        const res = await window.api.exportCrons(selectedIds);
        if (res.success) {
            toast.success(res.message);
            setSelectedIds([]);
            setIsSelectionMode(false);
        } else if (res.message) {
            toast.error(res.message);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-primary/15 via-transparent to-transparent p-4 md:p-8 rounded-xl">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Configuraciones de Crones</h1>
                            <p className="text-muted-foreground mt-2">
                                {activeCount} de {totalCount} crones activos
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="gap-2" onClick={handleImport}>
                                <Upload className="w-4 h-4" />
                                Importar
                            </Button>
                            <Button className="gap-2" onClick={onCreateCron}>
                                <Plus className="w-4 h-4" />
                                Nuevo Crone
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Toolbar de Selección */}
                <AnimatePresence>
                    {(isSelectionMode || selectedIds.length > 0) && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <Card className="p-3 bg-primary/5 border-primary/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedIds([]);
                                    }}>
                                        <X className="w-4 h-4 mr-2" /> Cancelar
                                    </Button>
                                    <span className="text-sm font-medium">
                                        {selectedIds.length} seleccionados
                                    </span>
                                </div>
                                <Button 
                                    size="sm" 
                                    disabled={selectedIds.length === 0}
                                    onClick={handleExportSelected}
                                    className="gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Exportar Selección
                                </Button>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Cron List */}
                <div className="grid gap-4">
                    {crons.length > 0 ? (
                        crons.map((cron) => (
                            <motion.div layout key={cron.id + '-list-item'} variants={itemVariants} initial="hidden" animate="visible">
                                <CronCard 
                                    cron={cron} 
                                    onSelect={onSelectCron} 
                                    stepsCount={cron.steps.length}
                                    isSelectionMode={isSelectionMode}
                                    setIsSelectionMode={setIsSelectionMode}
                                    isSelected={selectedIds.includes(cron.id)}
                                    onToggleSelect={() => toggleSelection(cron.id)}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <Card className="p-12 border-dashed flex flex-col items-center justify-center text-muted-foreground">
                            <FileJson className="w-12 h-12 mb-4 opacity-20" />
                            <p>No hay Crons aún. Empieza creando uno o importa un backup.</p>
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
    isSelectionMode,
    setIsSelectionMode,
    isSelected,
    onToggleSelect
}: {
    cron: CronWithSteps;
    onSelect: (id: string) => void;
    stepsCount: number;
    isSelectionMode: boolean;
    setIsSelectionMode: (v: boolean) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
}) {
    const { setData } = useData();
    const [isSaving, setIsSaving] = useState(false);

    const handleSingleExport = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await window.api.exportCrons([cron.id]);
        if (res.success) toast.success('Cron exportado correctamente');
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const wantToggle = confirm(`¿Estas seguro de ${cron.isActive ? 'Detener' : 'Activar'} este Cron?`)
        if(!wantToggle) return;

        setIsSaving(true);
        let parsedToForm = mapCronToForm(cron);
        if (!parsedToForm) return;

        parsedToForm = { ...parsedToForm, isActive: !cron.isActive };

        toast.promise(window.api.updateCron(cron?.id ?? '', parsedToForm), {
            loading: 'Actualizando...',
            success: (data) => {
                if (!data) return 'Error: respuesta vacía';

                setData((prev) => prev.map((item) => (item.id === data.id ? data : item)));
                return `Cron ${cron.isActive ? 'Pausado' : 'Activado'}.`;
            },
            error: 'Error al actualizar.',
        });
        setIsSaving(false);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("¿Estas seguro de eliminar este Cron?")) return;

        try {
            const deleted = await window.api.deleteCron(cron);
            if (deleted.success) {
                setData((data) => data.filter((c) => c.id !== cron.id));
                toast.success('Cron eliminado');
            }
        } catch { toast.error('Error'); }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => isSelectionMode ? onToggleSelect() : onSelect(cron.id!)}
            className="cursor-pointer group"
        >
            <Card className={`p-4 transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Checkbox de selección */}
                        <div 
                            className="cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSelectionMode(true);
                                onToggleSelect();
                            }}
                        >
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-primary" />
                            ) : (
                                <Square className="w-5 h-5 text-muted-foreground opacity-20 group-hover:opacity-100" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${cron.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                <h3 className="text-lg font-semibold">{cron.name}</h3>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                                <span>{cron.groupName}</span>
                                <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> {stepsCount} pasos</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={handleSingleExport} title="Exportar este cron">
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleToggle} disabled={isSaving}>
                            {cron.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}