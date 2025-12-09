import { z } from 'zod';

export const cronConfigSchema = z.object({
    id: z.string(),
    groupName: z
        .string()
        .min(3, 'El nombre del grupo debe tener al menos 3 caracteres')
        .max(100, 'El nombre del grupo no puede exceder 100 caracteres'),
    apiUrl: z.string().url('Debe ser una URL válida'),
    apiLoginUrl: z.string().url('Debe ser una URL válida'),
    timezone: z.string().default('America/Bogota'),
    username: z.string().min(1, 'El usuario es requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    hiddenField: z.string().default('S'),
    startAt: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
    intervalMinutes: z
        .number()
        .min(1, 'El intervalo debe ser mayor a 0')
        .max(1440, 'El intervalo no puede ser mayor a 1440 minutos'),
    isActive: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type CronConfig = z.infer<typeof cronConfigSchema>;
