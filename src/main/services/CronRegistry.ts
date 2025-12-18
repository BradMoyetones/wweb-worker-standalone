import type { ScheduledTask } from 'node-cron';

class CronRegistry {
    private registry = new Map<string, ScheduledTask>();

    has(id: string): boolean {
        return this.registry.has(id);
    }

    register(id: string, task: ScheduledTask): void {
        if (this.registry.has(id)) {
            this.stop(id);
        }
        this.registry.set(id, task);
    }

    stop(id: string): void {
        const task = this.registry.get(id);
        if (task) {
            task.stop();
            this.registry.delete(id);
            console.log(`[CronRegistry] Stopped cron: ${id}`);
        }
    }

    stopAll(): void {
        for (const [id, task] of this.registry.entries()) {
            task.stop();
            console.log(`[CronRegistry] Stopped cron: ${id}`);
        }
        this.registry.clear();
    }

    getAll(): Map<string, ScheduledTask> {
        return this.registry;
    }
}

export const cronRegistry = new CronRegistry();
