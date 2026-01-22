import { getDb } from "@app/drizzle/client";
import { cronConfigs, cronWorkflowSteps } from "@app/drizzle/schema";
import { CreateCronFormData, CronWithSteps, UpdateCronFormData } from "@app/types/crone.types";
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

async function createCron(input: CreateCronFormData): Promise<CronWithSteps> {
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
      bodyType: step.bodyType ?? 'json',
      body: step.body ?? null,
      requestOptions: step.requestOptions ?? null,
      responseFormat: step.responseFormat,
      extract: step.extract ?? null,
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

async function updateCron(id: string, input: UpdateCronFormData): Promise<CronWithSteps | null> {
  const db = await getDb();
  console.log("INPUT EN DB", input);
  

  // Update cron_config
  await db
    .update(cronConfigs)
    .set({
      startAt: input.startAt,
      endAt: input.endAt,
      lastRunAt: input.lastRunAt,
      status: input.status,
      nextRunAt: input.nextRunAt,
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
      ...step,
      id: uuid(),
      cronConfigId: id,
      stepOrder: step.stepOrder,
      name: step.name,
      method: step.method,
      url: step.url,
      headers: step.headers ?? null,
      bodyType: step.bodyType ?? 'json',
      body: step.body ?? null,
      requestOptions: step.requestOptions ?? null,
      responseFormat: step.responseFormat,
      extract: step.extract ?? null,
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