import { getDb } from "@app/drizzle/client";
import { cronConfigs, cronWorkflowSteps } from "@app/drizzle/schema";
import { CreateCronInput, CronWithSteps, UpdateCronInput } from "@app/types/crone.types";
import { eq } from "drizzle-orm";
import { v4 as uuid } from 'uuid';

async function getAllCrones(): Promise<CronWithSteps[]> {
  const db = await getDb();

  const configs = await db.query.cronConfigs.findMany({
    with: {
      steps: true,
    },
  });

  return configs;
}

async function createCron(input: CreateCronInput): Promise<CronWithSteps> {
  const db = await getDb();

  // ID para el cron
  const cronId = uuid();

  // Insertar config
  await db.insert(cronConfigs).values({
    id: cronId,
    groupName: input.groupName,
    name: input.name,
    description: input.description ?? null,
    cronExpression: input.cronExpression,
    timezone: input.timezone,
    isActive: input.isActive ? 1 : 0,
  });

  // Insertar steps
  if (input.steps?.length) {
    const stepsToInsert = input.steps.map((step) => ({
      id: uuid(),
      cronConfigId: cronId,
      stepOrder: step.stepOrder,
      name: step.name,
      method: step.method,
      url: step.url,
      headers: step.headers ?? null,
      body: step.body ?? null,
      responseFormat: step.responseFormat,
      dataPath: step.dataPath ?? null,
    }));

    await db.insert(cronWorkflowSteps).values(stepsToInsert);
  }

  // Devolver todo el objeto creado
  const created = await db.query.cronConfigs.findFirst({
    where: (t, { eq }) => eq(t.id, cronId),
    with: { steps: true },
  });

  return created!;
}

async function findCronById(id: string): Promise<CronWithSteps | null> {
  const db = await getDb();

  const config = await db.query.cronConfigs.findFirst({
    where: (t, { eq }) => eq(t.id, id),
    with: {
      steps: true,
    },
  });

  return config ?? null;
}

async function updateCron(id: string, input: UpdateCronInput): Promise<CronWithSteps | null> {
  const db = await getDb();

  // Update cron_config
  await db
    .update(cronConfigs)
    .set({
      groupName: input.groupName,
      name: input.name,
      description: input.description ?? null,
      cronExpression: input.cronExpression,
      timezone: input.timezone,
      isActive: input.isActive ? 1 : 0,
      updatedAt: Date.now(),
    })
    .where(eq(cronConfigs.id, id));

  // Reemplazar steps completamente
  await db.delete(cronWorkflowSteps).where(eq(cronWorkflowSteps.cronConfigId, id));

  if (input.steps?.length) {
    const stepsToInsert = input.steps.map((step) => ({
      id: uuid(),
      cronConfigId: id,
      stepOrder: step.stepOrder,
      name: step.name,
      method: step.method,
      url: step.url,
      headers: step.headers ?? null,
      body: step.body ?? null,
      responseFormat: step.responseFormat,
      dataPath: step.dataPath ?? null,
    }));

    await db.insert(cronWorkflowSteps).values(stepsToInsert);
  }

  // Return updated object
  const updated = await db.query.cronConfigs.findFirst({
    where: (t, { eq }) => eq(t.id, id),
    with: { steps: true },
  });

  return updated ?? null;
}

async function deleteCron(id: string): Promise<{ success: boolean }> {
  const db = await getDb();

  await db.delete(cronConfigs).where(eq(cronConfigs.id, id));

  return { success: true };
}


export {
  getAllCrones,
  createCron,
  findCronById,
  updateCron,
  deleteCron
}