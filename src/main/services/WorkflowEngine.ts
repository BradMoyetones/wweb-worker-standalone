import { DBCronWorkflowStep } from "@app/types/crone.types";

export interface WorkflowContext {
    cookies: Record<string, string>;
    steps: Record<string, any>;
}

function resolveTemplate(value: string, ctx: WorkflowContext): string {
    if (typeof value !== 'string') return value as any;

    return value.replace(/\{\{(.*?)\}\}/g, (_, path) => {
        const keys = path.trim().split('.');
        let current: any = ctx;

        for (const key of keys) {
            current = current?.[key];
            if (current === undefined || current === null) return '';
        }

        return String(current);
    });
}

function buildBody(step: any, ctx: WorkflowContext): string | undefined {
    if (!step.body || step.bodyType === 'none') return undefined;

    const raw = JSON.parse(step.body);
    const resolved: Record<string, string> = {};

    for (const key in raw) {
        resolved[key] = resolveTemplate(raw[key], ctx);
    }

    if (step.bodyType === 'urlencoded') {
        return new URLSearchParams(resolved).toString();
    }

    if (step.bodyType === 'json') {
        return JSON.stringify(resolved);
    }

    return undefined;
}

function buildHeaders(step: any, ctx: WorkflowContext): Record<string, string> {
    if (!step.headers) return {};

    const raw = JSON.parse(step.headers);
    const resolved: Record<string, string> = {};

    for (const key in raw) {
        resolved[key] = resolveTemplate(raw[key], ctx);
    }

    return resolved;
}

function applyExtractors(
    extract: any,
    response: {
        status: number;
        headers: Headers;
        raw: string;
    },
    ctx: WorkflowContext
): void {
    if (!extract) return;

    for (const target in extract) {
        const rule = extract[target];
        let value: any = null;

        if (rule.from === 'headers') {
            value = response.headers.get(rule.key);
        }

        if (!value) continue;

        if (rule.transform === 'split:semicolon') {
            value = value.split(';')[0];
        }

        const path = target.split('.');
        let current: any = ctx;

        for (let i = 0; i < path.length - 1; i++) {
            current[path[i]] ??= {};
            current = current[path[i]];
        }

        current[path[path.length - 1]] = value;
    }
}

export async function runWorkflow(steps: DBCronWorkflowStep[]): Promise<WorkflowContext> {
    const ctx: WorkflowContext = {
        cookies: {},
        steps: {},
    };

    const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

    for (const step of sortedSteps) {
        console.log(`[Workflow] Executing step ${step.stepOrder}: ${step.name}`);

        const headers = buildHeaders(step, ctx);
        const body = buildBody(step, ctx);

        const res = await fetch(step.url, {
            method: step.method,
            headers,
            body,
            ...(step.requestOptions ? JSON.parse(step.requestOptions) : {}),
        });

        const raw = await res.text();

        ctx.steps[step.name] = {
            status: res.status,
            raw,
        };

        applyExtractors(
            step.extract ? JSON.parse(step.extract) : null,
            {
                status: res.status,
                headers: res.headers,
                raw,
            },
            ctx
        );
        // const allowedStatus: number[] =
        //     step.allowedStatus ?? [200, 201, 204];

        const allowedStatus: number[] = [200, 201, 204, 302];

        if (!allowedStatus.includes(res.status)) {
            throw new Error(`Step "${step.name}" failed with status ${res.status}`);
        }
    }

    return ctx;
}
