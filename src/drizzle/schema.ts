// drizzle/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

export const cronConfigs = sqliteTable('cron_configs', {
    // Identificadores
    id: text('id')
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    groupName: text('group_name').notNull(),

    // Información básica
    name: text('name').notNull(),
    description: text('description'),

    // Configuración del cron
    cronExpression: text('cron_expression').notNull(), // ej: "0 0 * * *"

    // Webhook/API
    webhookUrl: text('webhook_url').notNull(),
    method: text('method').notNull().default('POST'), // GET, POST, PUT, DELETE
    headers: text('headers'), // JSON.stringify({...})
    body: text('body'), // JSON.stringify({...})

    // Estado
    isActive: integer('is_active').notNull().default(1), // 0 = false, 1 = true

    // Auditoría
    createdAt: integer('created_at')
        .notNull()
        .$defaultFn(() => Date.now()),
    updatedAt: integer('updated_at')
        .notNull()
        .$defaultFn(() => Date.now()),
});
