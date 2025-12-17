import { cn } from "@/lib/utils"
import { JSX } from "react"

interface TimelineStep {
    number: number
    description: JSX.Element
}

interface TimelineProps {
    steps: TimelineStep[]
    className?: string
}

export function Timeline({ steps, className }: TimelineProps) {
    return (
        <div className={cn("relative", className)}>
            {steps.map((step, index) => (
                <div key={step.number} className="relative flex items-start gap-4 pb-8 last:pb-0">
                    {/* Vertical line */}
                    {index < steps.length - 1 && <div className="absolute left-3.5 top-7 w-0.5 h-full bg-border" />}

                    {/* Step number circle */}
                    <div className="flex-shrink-0 size-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-lg z-10">
                        {step.number}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {step.description}
                    </div>
                </div>
            ))}
        </div>
    )
}
