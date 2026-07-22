"use client"

import { motion } from "framer-motion"
import {
    CalendarClock,
    CalendarPlus,
    CheckCircle2,
    Clock,
    FolderTree,
    Globe,
    History,
    Hourglass,
    Layers,
    Pencil,
    Play,
    Power,
    Repeat,
    Timer,
} from "lucide-react"
import {
    formatDateTime,
    formatRelative,
    humanizeCron,
    normalizeStatus,
} from "@/lib/cron"
import { StatusBadge } from "@/components/status-badge"
import { WorkflowSteps } from "./workflow-steps"
import { Chip, InfoField, SectionCard } from "./primitives"
import { CronWithSteps } from "@app/types/crone.types"

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
}

function TimelineItem({
    icon,
    label,
    value,
    hint,
    emphasis,
}: {
    icon: React.ReactNode
    label: string
    value: string
    hint?: string
    emphasis?: boolean
}) {
    return (
        <div className="flex items-start gap-3">
            <span
                className={
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border [&_svg]:size-4 " +
                    (emphasis ? "bg-info/10 text-info" : "bg-muted/50 text-muted-foreground")
                }
            >
                {icon}
            </span>
            <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground">{value}</span>
                {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
            </div>
        </div>
    )
}

export function CronDetailView({ cron }: { cron: CronWithSteps }) {
    const status = normalizeStatus(cron.status)
    const isActive = cron.isActive === 1

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            {/* ============ Encabezado ============ */}
            <motion.header
                {...fadeUp}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Chip>
                                <FolderTree />
                                {cron.groupName}
                            </Chip>
                            <Chip>
                                <Layers />
                                {cron.steps.length} {cron.steps.length === 1 ? "paso" : "pasos"}
                            </Chip>
                        </div>
                        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
                            {cron.name}
                        </h1>
                        {cron.description ? (
                            <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                                {cron.description}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={status} />
                        <span
                            className={
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium [&_svg]:size-3.5 " +
                                (isActive
                                    ? "border-success/30 bg-success/10 text-success"
                                    : "border-border bg-muted text-muted-foreground")
                            }
                        >
                            <Power />
                            {isActive ? "Activo" : "Desactivado"}
                        </span>
                    </div>
                </div>

                {/* Resumen de programación */}
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-3">
                    <InfoField label="Expresión cron" icon={<Repeat />} mono>
                        {cron.cronExpression}
                    </InfoField>
                    <InfoField label="Frecuencia" icon={<Timer />}>
                        {humanizeCron(cron.cronExpression)}
                    </InfoField>
                    <InfoField label="Zona horaria" icon={<Globe />}>
                        {cron.timezone ?? "—"}
                    </InfoField>
                </div>
            </motion.header>

            {/* ============ Ventana de ejecución + tiempos ============ */}
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}>
                <SectionCard title="Ventana y tiempos de ejecución" icon={<CalendarClock />}>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <TimelineItem
                            icon={<Play />}
                            label="Inicio de ventana (startAt)"
                            value={cron.startAt ? formatDateTime(cron.startAt) : "Inmediato"}
                            hint={cron.startAt ? formatRelative(cron.startAt) : "Sin retraso configurado"}
                        />
                        <TimelineItem
                            icon={<Hourglass />}
                            label="Fin de ventana (endAt)"
                            value={cron.endAt ? formatDateTime(cron.endAt) : "Sin límite"}
                            hint={cron.endAt ? formatRelative(cron.endAt) : "Se ejecuta indefinidamente"}
                        />
                        <TimelineItem
                            icon={<History />}
                            label="Última ejecución (lastRunAt)"
                            value={formatDateTime(cron.lastRunAt)}
                            hint={cron.lastRunAt ? formatRelative(cron.lastRunAt) : "Aún no se ha ejecutado"}
                        />
                        <TimelineItem
                            icon={<Clock />}
                            label="Próxima ejecución (nextRunAt)"
                            value={cron.nextRunAt ? formatDateTime(cron.nextRunAt) : "No programada"}
                            hint={cron.nextRunAt ? formatRelative(cron.nextRunAt) : "Pausado o sin planificar"}
                            emphasis={Boolean(cron.nextRunAt)}
                        />
                    </div>
                </SectionCard>
            </motion.div>

            {/* ============ Workflow ============ */}
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}>
                <SectionCard title="Flujo de trabajo (steps)" icon={<Layers />}>
                    <WorkflowSteps steps={cron.steps} />
                </SectionCard>
            </motion.div>

            {/* ============ Auditoría ============ */}
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.24, ease: "easeOut" }}>
                <SectionCard title="Auditoría" icon={<CheckCircle2 />}>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <TimelineItem
                            icon={<CalendarPlus />}
                            label="Creado (createdAt)"
                            value={formatDateTime(cron.createdAt)}
                            hint={formatRelative(cron.createdAt)}
                        />
                        <TimelineItem
                            icon={<Pencil />}
                            label="Actualizado (updatedAt)"
                            value={formatDateTime(cron.updatedAt)}
                            hint={formatRelative(cron.updatedAt)}
                        />
                    </div>
                    <p className="mt-5 flex items-center gap-1.5 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
                        ID: {cron.id}
                    </p>
                </SectionCard>
            </motion.div>
        </div>
    )
}
