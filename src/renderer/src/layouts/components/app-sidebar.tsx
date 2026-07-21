import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "@/components/ui/sidebar";
import { WhatsAppStatusModal } from "@/components/WhatsAppStatusModal";
import { useData, useWhatsApp } from "@/contexts";
import { cn } from "@/lib/utils";
import { CreateCronModal } from "@/pages/(root)/components/create-cron-modal";
import { CronWithSteps } from "@app/types/crone.types";
import { mapCronToForm } from "@app/utils/helpers";
import { Download, GitBranch, Home, Pause, Play, Plus, Settings, Trash2, Upload, X } from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { useNavigate } from "react-router";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AppSidebar() {
    const { data: crons, setData } = useData();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const { status } = useWhatsApp();
    const [openModal, setOpenModal] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const navigate = useNavigate()

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

    const activeCount = useMemo(() => crons.filter((c) => c.isActive).length, [crons]);
    const totalCount = useMemo(() => crons.length, [crons]);

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <h1 className="text-2xl font-bold flex items-center gap-2">WWEBWorker</h1>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                onClick={() => navigate('/', { viewTransition: true })}
                            >
                                <Home />
                            </Button>
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                onClick={() => navigate('/settings', { viewTransition: true })}
                            >
                                <Settings />
                            </Button>
                        </div>
                    </div>
                    <Badge variant={"secondary"} onClick={() => setOpenModal(true)} className="cursor-pointer uppercase">{status}</Badge>
                    <div className="text-muted-foreground text-sm">
                        {activeCount} de {totalCount} crons activos
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size={"sm"} onClick={handleImport}>
                        <Upload />
                        Importar
                    </Button>
                    <Button size={"sm"} onClick={() => setIsCreateModalOpen(true)}>
                        <Plus />
                        Nuevo Crone
                    </Button>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2 overflow-y-auto space-y-2">
                {crons.length > 0 ? (
                    crons.map((cron) => (
                        <motion.div layout key={cron.id + '-list-item'} variants={itemVariants} initial="hidden" animate="visible">
                            <CronCard
                                cron={cron}
                                stepsCount={cron.steps.length}
                                isSelectionMode={isSelectionMode}
                                setIsSelectionMode={setIsSelectionMode}
                                isSelected={selectedIds.includes(cron.id)}
                                onToggleSelect={() => toggleSelection(cron.id)}
                            />
                        </motion.div>
                    ))
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <GitBranch />
                            </EmptyMedia>
                            <EmptyTitle>No se han creado Crons</EmptyTitle>
                            <EmptyDescription>
                                No se han creado crons, comienza creando uno nuevo o importando uno.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="flex-row justify-center gap-2">
                            <Button onClick={() => setIsCreateModalOpen(true)}>Crear Cron</Button>
                            <Button variant="outline" onClick={handleImport}>Importar</Button>
                        </EmptyContent>
                    </Empty>
                )}
            </SidebarContent>
            <SidebarFooter>
                <AnimatePresence>
                    {(isSelectionMode || selectedIds.length > 0) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
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

                                >
                                    <Download />
                                    Exportar Selección
                                </Button>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SidebarFooter>

            <WhatsAppStatusModal open={openModal} setOpen={setOpenModal} />
            <CreateCronModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

        </Sidebar>
    );
}


function CronCard({
    cron,
    stepsCount,
    isSelectionMode,
    setIsSelectionMode,
    isSelected,
    onToggleSelect
}: {
    cron: CronWithSteps;
    stepsCount: number;
    isSelectionMode: boolean;
    setIsSelectionMode: (v: boolean) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
}) {
    const { setData } = useData();
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate()

    const handleSingleExport = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await window.api.exportCrons([cron.id]);
        if (res.success) toast.success('Cron exportado correctamente');
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const wantToggle = confirm(`¿Estas seguro de ${cron.isActive ? 'Detener' : 'Activar'} este Cron?`)
        if (!wantToggle) return;

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
        if (!confirm("¿Estas seguro de eliminar este Cron?")) return;

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
            onClick={() => isSelectionMode ? onToggleSelect() : navigate(`/detail/${cron.id}`, { viewTransition: true })}
            className="cursor-pointer group"
        >
            <Card className={cn("transition-colors p-0", {
                'border-primary bg-primary/5': isSelected,
            })}>
                <CardContent className="p-2">
                    <div className="flex gap-2">
                        <div
                            className="cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSelectionMode(true);
                                onToggleSelect();
                            }}
                        >
                            <AnimatedCheckbox isSelected={isSelected} />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-4 flex-1">

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-md font-semibold">{cron.name}</h3>
                                        <div className={`w-2 h-2 rounded-full ${cron.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                        <span>{cron.groupName}</span>
                                        <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> {stepsCount} pasos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 justify-end">
                                <Button variant="ghost" size="icon" onClick={handleSingleExport} title="Exportar este cron">
                                    <Download />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleToggle} disabled={isSaving}>
                                    {cron.isActive ? <Pause /> : <Play />}
                                </Button>
                                <Button variant="destructive" size="icon" onClick={handleDelete}>
                                    <Trash2 />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>

            </Card>
        </motion.div>
    );
}

function AnimatedCheckbox({ isSelected }: { isSelected: boolean }) {
    return (
        <motion.div
            className={cn("w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors duration-300",
                {
                    'bg-primary border-primary text-primary-foreground': isSelected,
                    'border-muted-foreground/30 bg-background': !isSelected
                }
            )}
            animate={{
                scale: isSelected ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {isSelected && (
                <motion.svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.2 }}
                        d="M5 13l4 4L19 7"
                    />
                </motion.svg>
            )}
        </motion.div>
    );
}