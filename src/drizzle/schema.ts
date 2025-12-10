// drizzle/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TABLA PRINCIPAL: Configuraciones de Cron
// ============================================
export const cronConfigs = sqliteTable('cron_configs', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    groupName: text('group_name').notNull(), // "visitors", "stats", etc - se usa con sendToGroupByName()
    name: text('name').notNull(),
    description: text('description'),

    // SCHEDULING
    cronExpression: text('cron_expression').notNull(),
    timezone: text('timezone').default('America/New_York'),

    // ESTADO
    isActive: integer('is_active').notNull().default(0),

    // AUDITORÍA
    createdAt: integer('created_at')
        .notNull()
        .$defaultFn(() => Date.now()),
    updatedAt: integer('updated_at')
        .notNull()
        .$defaultFn(() => Date.now()),
});

// ============================================
// TABLA: Pasos del Workflow (múltiples requests)
// ============================================
export const cronWorkflowSteps = sqliteTable('cron_workflow_steps', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    cronConfigId: text('cron_config_id')
        .notNull()
        .references(() => cronConfigs.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),

    stepOrder: integer('step_order').notNull(), // 1, 2, 3... orden de ejecución
    name: text('name').notNull(), // "Login", "Fetch visitantes", "Parse response"

    // REQUEST CONFIG
    method: text('method').notNull().default('POST'),
    url: text('url').notNull(),
    headers: text('headers'), // JSON.stringify({...})
    body: text('body'), // JSON.stringify({...}) - puede usar {{previousStep.data}}

    // PROCESAMIENTO DE RESPUESTA
    responseFormat: text('response_format').default('text'), // json, text
    dataPath: text('data_path'), // ej: "data.count" - qué extraer del response

    createdAt: integer('created_at')
        .notNull()
        .$defaultFn(() => Date.now()),
});

// ============================================
// RELACIONES
// ============================================
export const cronConfigsRelations = relations(cronConfigs, ({ many }) => ({
    steps: many(cronWorkflowSteps),
}));

export const cronWorkflowStepsRelations = relations(cronWorkflowSteps, ({ one }) => ({
    cronConfig: one(cronConfigs, {
        fields: [cronWorkflowSteps.cronConfigId],
        references: [cronConfigs.id],
    }),
}));

export type CronConfig = typeof cronConfigs.$inferSelect;
export type CronWorkflowStep = typeof cronWorkflowSteps.$inferSelect;
