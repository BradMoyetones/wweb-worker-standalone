import { cronConfigs } from "@app/drizzle/schema";

export type CronConfig = typeof cronConfigs.$inferSelect;
export type NewCronConfig = typeof cronConfigs.$inferInsert;


