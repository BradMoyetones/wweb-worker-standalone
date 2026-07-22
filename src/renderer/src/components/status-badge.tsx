"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { STATUS_LABEL } from "@/lib/cron"
import { Status } from "@app/types/crone.types"

const statusBadgeVariants = cva(
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
    {
        variants: {
            status: {
                running: "border-success/30 bg-success/10 text-success",
                idle: "border-border bg-muted text-muted-foreground",
                error: "border-destructive/30 bg-destructive/10 text-destructive",
                paused: "border-warning/30 bg-warning/10 text-warning",
            },
        },
        defaultVariants: {
            status: "idle",
        },
    },
)

const dotVariants = cva("size-2 rounded-full", {
    variants: {
        status: {
            running: "bg-success",
            idle: "bg-muted-foreground",
            error: "bg-destructive",
            paused: "bg-warning",
        },
    },
    defaultVariants: {
        status: "idle",
    },
})

type StatusBadgeProps = {
    status: Status
    className?: string
} & VariantProps<typeof statusBadgeVariants>

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span className={cn(statusBadgeVariants({ status }), className)}>
            <span className="relative flex size-2 items-center justify-center">
                {status === "running" && (
                    <motion.span
                        className="absolute inset-0 rounded-full bg-success"
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{ opacity: 0, scale: 2.4 }}
                        transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                    />
                )}
                <span className={dotVariants({ status })} />
            </span>
            {STATUS_LABEL[status]}
        </span>
    )
}
