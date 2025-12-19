import { EventEmitter } from '../services/EventEmitter';
import { getAllCrones, createCron, findCronById, updateCron, deleteCron } from '@app/main/models/crones';
import { scheduleCron, setCronExecutor, unscheduleCron } from '@app/lib/cronScheduler';
import type { CreateCronFormData, UpdateCronFormData, CronWithSteps } from '@app/types/crone.types';
import { CronExecutor } from '../services/CronExecutor';
import { WebContents } from 'electron';
import { mapCronToForm } from '@app/utils/helpers';

export class DatabaseController extends EventEmitter {
    private cronExecutor: CronExecutor | null = null;
    private webContents: WebContents | null = null;

    constructor(private whatsappController: any) {
        super();
    }

    async initializeCrons(webContents: WebContents): Promise<void> {
        console.log('[Database] Initializing crons...');
        this.webContents = webContents;

        this.cronExecutor = new CronExecutor(this.whatsappController, async (id, updates) => {
            const cron = await findCronById(id);
            if (!cron) return null;
            return await updateCron(id, { ...mapCronToForm(cron), ...updates });
        });

        setCronExecutor(this.cronExecutor);

        const crones = await getAllCrones();

        for (const cron of crones) {
            if (cron.isActive) {
                scheduleCron(cron);
            }
        }

        console.log(`[Database] ${crones.length} crons loaded`);
    }

    async getAllCrones(): Promise<CronWithSteps[]> {
        return await getAllCrones();
    }

    async createCron(input: CreateCronFormData): Promise<CronWithSteps> {
        const created = await createCron(input);

        if (created.isActive) {
            scheduleCron(created);
        }

        return created;
    }

    async findCronById(id: string): Promise<CronWithSteps | null> {
        return await findCronById(id);
    }

    async updateCron(id: string, input: UpdateCronFormData): Promise<CronWithSteps | null> {
        const updated = await updateCron(id, input);

        if (!updated) return null;

        if (updated.isActive) {
            scheduleCron(updated);
        } else {
            unscheduleCron(updated.id);
        }

        if (this.webContents && !this.webContents.isDestroyed()) {
            this.webContents.send('cron-updated', updated);
        }

        return updated;
    }

    async toggleCron(id: string, isActive: boolean): Promise<CronWithSteps | null> {
        const cron = await findCronById(id);
        if (!cron) return null;

        const updated = await updateCron(id, {
            ...mapCronToForm(cron)!,
            isActive: isActive,
        });

        if (!updated) return null;

        if (updated.isActive) {
            scheduleCron(updated);
        } else {
            unscheduleCron(updated.id);
        }

        if (this.webContents && !this.webContents.isDestroyed()) {
            this.webContents.send('cron-updated', updated);
        }

        return updated;
    }

    async deleteCron(cron: CronWithSteps): Promise<{ success: boolean }> {
        if (!cron) return { success: false };

        unscheduleCron(cron.id);
        const deleted = await deleteCron(cron.id);

        if (deleted && this.webContents && !this.webContents.isDestroyed()) {
            this.webContents.send('cron-deleted', cron.id);
        }

        return deleted;
    }

    getCronExecutor(): CronExecutor | null {
        return this.cronExecutor;
    }
}
