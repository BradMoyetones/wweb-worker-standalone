import { Status } from "@app/types/crone.types"

// ============================================
// Helpers de estado
// ============================================
export function normalizeStatus(status: string): Status {
    if (status === "running" || status === "idle" || status === "error" || status === "paused") {
        return status
    }
    return "idle"
}

export const STATUS_LABEL: Record<Status, string> = {
    running: "En ejecución",
    idle: "Inactivo",
    error: "Con error",
    paused: "Pausado",
}

// ============================================
// Helpers de fechas
// ============================================
export function formatDateTime(ts: number | null): string {
    if (!ts) return "—"
    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(ts))
}

export function formatRelative(ts: number | null): string {
    if (!ts) return "—"
    const diff = ts - Date.now()
    const abs = Math.abs(diff)
    const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" })

    const minutes = 60 * 1000
    const hours = 60 * minutes
    const days = 24 * hours

    if (abs < hours) return rtf.format(Math.round(diff / minutes), "minute")
    if (abs < days) return rtf.format(Math.round(diff / hours), "hour")
    return rtf.format(Math.round(diff / days), "day")
}

// ============================================
// Humanizador de expresión cron
// ============================================
export function humanizeCron(expression: string): string {
    const parts = expression.trim().split(/\s+/)
    if (parts.length !== 5) return "Expresión personalizada"

    const [min, hour, dom, mon, dow] = parts

    if (min === "*" && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
        return "Cada minuto"
    }
    if (min.startsWith("*/")) {
        return `Cada ${min.slice(2)} minutos`
    }
    if (hour === "*" && min !== "*") {
        return `En el minuto ${min} de cada hora`
    }
    if (dom === "*" && mon === "*" && dow === "*" && min !== "*" && hour !== "*") {
        return `Todos los días a las ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`
    }
    return "Programación personalizada"
}

// ============================================
// Parseo seguro de campos JSON
// ============================================
export function safeParseJson(raw: string | null): Record<string, unknown> | null {
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed as Record<string, unknown>
        }
        return null
    } catch {
        return null
    }
}

export function prettyJson(raw: string | null): string | null {
    const parsed = safeParseJson(raw)
    if (!parsed) return null
    return JSON.stringify(parsed, null, 2)
}
