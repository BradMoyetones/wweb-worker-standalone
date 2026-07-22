"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Code2, FileJson, Link2, ListChecks, Send, Settings2 } from "lucide-react"
import { prettyJson } from "@/lib/cron"
import { Chip, CodeBlock, MethodBadge } from "./primitives"
import { DBCronWorkflowStep } from "@app/types/crone.types"
import { JsonBlock } from "./json-block"

function StepDetailRow({
    icon,
    label,
    json,
    fallback,
}: {
    icon: React.ReactNode
    label: string
    json: string | null
    fallback?: string
}) {
    const pretty = prettyJson(json)
    if (!pretty && !fallback) return null
    return (
        <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground [&_svg]:size-3.5">
                {icon}
                {label}
            </span>
            {pretty ? (
                <JsonBlock code={pretty} />
            ) : (
                <span className="text-xs text-muted-foreground italic">{fallback}</span>
            )}
        </div>
    )
}

function StepCard({ step, index }: { step: DBCronWorkflowStep; index: number }) {
    const [open, setOpen] = useState(index === 0)

    const hasDetails =
        prettyJson(step.headers) ||
        prettyJson(step.body) ||
        prettyJson(step.requestOptions) ||
        prettyJson(step.extract)

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
            className="relative pl-10"
        >
            {/* Nodo del timeline */}
            <span className="absolute left-2.5 top-1.5 flex size-6 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-foreground shadow-sm">
                {step.stepOrder}
            </span>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                    aria-expanded={open}
                >
                    <MethodBadge method={step.method} />
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">{step.name}</span>
                        <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Link2 className="size-3 shrink-0" />
                            <span className="truncate">{step.url}</span>
                        </span>
                    </div>
                    {hasDetails ? (
                        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="size-4 text-muted-foreground" />
                        </motion.span>
                    ) : null}
                </button>

                <AnimatePresence initial={false}>
                    {open && hasDetails ? (
                        <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: "easeInOut" }}
                            className="overflow-hidden border-t border-border"
                        >
                            <div className="flex flex-col gap-4 p-4">
                                <div className="flex flex-wrap gap-2">
                                    {step.bodyType ? (
                                        <Chip>
                                            <Send /> body: {step.bodyType}
                                        </Chip>
                                    ) : null}
                                    {step.responseFormat ? (
                                        <Chip>
                                            <FileJson /> respuesta: {step.responseFormat}
                                        </Chip>
                                    ) : null}
                                </div>
                                <StepDetailRow icon={<Code2 />} label="Headers" json={step.headers} />
                                <StepDetailRow icon={<FileJson />} label="Body" json={step.body} />
                                <StepDetailRow icon={<Settings2 />} label="Request options" json={step.requestOptions} />
                                <StepDetailRow icon={<ListChecks />} label="Extracción" json={step.extract} />
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export function WorkflowSteps({ steps }: { steps: DBCronWorkflowStep[] }) {
    const ordered = [...steps].sort((a, b) => a.stepOrder - b.stepOrder)

    if (ordered.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Este cron no tiene pasos configurados.</p>
        )
    }

    return (
        <div className="relative flex flex-col gap-4">
            {/* Línea vertical del timeline */}
            <span
                aria-hidden
                className="absolute left-5.5 top-3 bottom-3 w-px bg-border"
            />
            {ordered.map((step, i) => (
                <StepCard key={step.id} step={step} index={i} />
            ))}
        </div>
    )
}
