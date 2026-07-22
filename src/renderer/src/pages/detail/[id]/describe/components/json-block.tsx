"use client"

import { Streamdown } from "streamdown"
import { cn } from "@/lib/utils"
import { code as codePlugin } from '@streamdown/code';
import { mermaid } from '@streamdown/mermaid';
import { math } from '@streamdown/math';
import { cjk } from '@streamdown/cjk';
import 'katex/dist/katex.min.css';

/**
 * Renderiza una cadena (JSON, texto, etc.) con highlight de sintaxis usando
 * Streamdown. El contenido se envuelve en una valla de código markdown
 * (```lang) para que Shiki lo resalte automáticamente.
 */
export function JsonBlock({
    code,
    language = "json",
    className,
}: {
    code: string
    language?: string
    className?: string
}) {
    const markdown = "```" + language + "\n" + code + "\n```"

    return (
        <div
            className={cn(
                className,
            )}
        >
            <Streamdown
                parseIncompleteMarkdown={false}
                controls={{ code: { copy: false, download: false } }}
                plugins={{
                    code: codePlugin,
                    mermaid: mermaid,
                    math: math,
                    cjk: cjk,
                }}
                
            >
                {markdown}
            </Streamdown>
        </div>
    )
}
