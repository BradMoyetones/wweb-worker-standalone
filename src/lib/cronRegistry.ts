import { ScheduledTask } from 'node-cron';

const cronRegistry = new Map<string, ScheduledTask>();

export function hasCron(id: string) {
    return cronRegistry.has(id);
}

export function registerCron(id: string, task: ScheduledTask) {
    cronRegistry.set(id, task);
}

export function stopCron(id: string) {
    const task = cronRegistry.get(id);
    if (task) {
        task.stop();
        cronRegistry.delete(id);
    }
}
