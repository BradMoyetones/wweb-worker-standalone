// =============================
// 1) TIPOS DE BASE DE DATOS (DRIZZLE)
// =============================

import type {
    cronConfigs,
    cronWorkflowSteps,
} from "@app/drizzle/schema";

export type DBCronConfig = typeof cronConfigs.$inferSelect;
export type DBCronConfigInsert = typeof cronConfigs.$inferInsert;

export type DBCronWorkflowStep = typeof cronWorkflowSteps.$inferSelect;
export type DBCronWorkflowStepInsert = typeof cronWorkflowSteps.$inferInsert;


// =============================
// 2) TIPOS DE FORMULARIO / VALIDACIÓN (ZOD)
// =============================

import {
    cronConfigSchema,
    cronWorkflowStepSchema,
} from "@app/types/zod.types";

export type FormCronConfig = z.infer<typeof cronConfigSchema>;
export type FormCronWorkflowStep = z.infer<typeof cronWorkflowStepSchema>;


// =============================
// 3) SCHEMA DE CREACIÓN
// (sin id, createdAt, updatedAt)
// =============================

import { z } from "zod";

export const createCronSchema = cronConfigSchema
    .omit({ id: true, createdAt: true, updatedAt: true })
    .extend({
        steps: z.array(
            cronWorkflowStepSchema.omit({
                id: true,
                cronConfigId: true,
                createdAt: true,
            })
        ),
    });

export const updateCronSchema = cronConfigSchema
    .extend({
        steps: z.array(
            cronWorkflowStepSchema
        ),
    });

export type CreateCronFormData = z.infer<typeof createCronSchema>;
export type UpdateCronFormData = z.infer<typeof updateCronSchema>;


// =============================
// 4) TIPOS PARA LA API / PRELOAD
// =============================

export type CronWithSteps = DBCronConfig & {
    steps: DBCronWorkflowStep[];
};

