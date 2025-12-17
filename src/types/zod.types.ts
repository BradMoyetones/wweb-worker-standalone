import { z } from 'zod';

export const cronConfigSchema = z.object({
    id: z.string().uuid().optional(),
    groupName: z
        .string()
        .min(3, 'El nombre del grupo debe tener al menos 3 caracteres')
        .max(100, 'El nombre del grupo no puede exceder 100 caracteres'),
    name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    description: z.string().optional(),
    cronExpression: z
        .string()
        .regex(
            /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
            "Expresión cron inválida (ej: '0 0 * * *')"
        ),
    timezone: z.string().min(1, 'Zona horaria requerida'),
    startAt: z.number().optional(), // timestamp - null = inmediato
    endAt: z.number().optional(), // timestamp - null = infinito
    isActive: z.boolean(),
    status: z.string().optional(),

    lastRunAt: z.number('last_run_at').optional(),
    nextRunAt: z.number('next_run_at').optional(),

    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
});

export const cronWorkflowStepSchema = z.object({
    id: z.string().uuid().optional(),
    cronConfigId: z.string().uuid().optional(),
    stepOrder: z.number().min(1, 'Orden debe ser >= 1'),
    name: z.string().min(1, 'Nombre del paso requerido'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    url: z.string().url('URL inválida'),
    headers: z.string().optional(), // JSON.stringify
    bodyType: z.enum(['json', 'urlencoded', 'form', 'none']),
    body: z.string().optional(), // JSON.stringify
    requestOptions: z.string().optional(), // JSON: { "redirect": "manual" }
    responseFormat: z.enum(['json', 'text']),
    extract: z.string().optional(), // JSON para extraer valores de response
    createdAt: z.number().optional(),
});
