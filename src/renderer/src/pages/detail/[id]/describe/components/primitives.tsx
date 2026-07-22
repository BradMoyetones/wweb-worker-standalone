import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export function SectionCard({
    title,
    icon,
    action,
    children,
    className,
}: {
    title: string
    icon?: ReactNode
    action?: ReactNode
    children: ReactNode
    className?: string
}) {
    return (
        <section
            className={cn(
                "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
                className,
            )}
        >
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    {icon ? <span className="text-muted-foreground [&_svg]:size-4">{icon}</span> : null}
                    <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                </div>
                {action}
            </header>
            <div className="p-5">{children}</div>
        </section>
    )
}

// ============================================
// Campo etiqueta / valor
// ============================================
export function InfoField({
    label,
    icon,
    children,
    mono,
}: {
    label: string
    icon?: ReactNode
    children: ReactNode
    mono?: boolean
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground [&_svg]:size-3.5">
                {icon}
                {label}
            </span>
            <span className={cn("text-sm text-foreground", mono && "font-mono")}>{children}</span>
        </div>
    )
}

// ============================================
// Badge de método HTTP (cva)
// ============================================
const methodBadgeVariants = cva(
    "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold uppercase",
    {
        variants: {
            method: {
                GET: "bg-info/10 text-info",
                POST: "bg-success/10 text-success",
                PUT: "bg-warning/10 text-warning",
                PATCH: "bg-warning/10 text-warning",
                DELETE: "bg-destructive/10 text-destructive",
                OTHER: "bg-muted text-muted-foreground",
            },
        },
        defaultVariants: { method: "OTHER" },
    },
)

export function MethodBadge({ method, className }: { method: string; className?: string }) {
    const key = (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
        ? method.toUpperCase()
        : "OTHER") as VariantProps<typeof methodBadgeVariants>["method"]
    return <span className={cn(methodBadgeVariants({ method: key }), className)}>{method}</span>
}

// ============================================
// Bloque de código / JSON
// ============================================
export function CodeBlock({ code, className }: { code: string; className?: string }) {
    return (
        <pre
            className={cn(
                "overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-foreground",
                className,
            )}
        >
            <code>{code}</code>
        </pre>
    )
}

// ============================================
// Chip simple (etiquetas)
// ============================================
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground [&_svg]:size-3",
                className,
            )}
        >
            {children}
        </span>
    )
}
