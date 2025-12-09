import { getDb } from "@core/drizzle/client";
import { workflows } from "@core/drizzle/schema";
import { Workflow } from "@core/types/data";
import { WorkflowInput, workflowSchema } from "@core/types/validator";
import { eq } from "drizzle-orm";


async function getAllWorkflows(): Promise<Workflow[]> {
  const db = await getDb();

  const allWorkflows = await db.select().from(workflows).all();
  
  return allWorkflows;
}

async function createWorkflow(input?: Partial<WorkflowInput>) {
  const db = await getDb();

  // merge con defaults del zod schema
  const parsed = workflowSchema.parse(input ?? {});

  const [inserted] = await db
    .insert(workflows)
    .values(parsed)
    .returning();

  return inserted;
}

async function findWorkflowById(id: string) {
  const db = await getDb();

  const [result] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id));

  return result ?? null; // null si no existe
}

export {
  getAllWorkflows,
  createWorkflow,
  findWorkflowById
}