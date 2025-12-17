import cron from 'node-cron';
import { registerCron, stopCron, hasCron } from './cronRegistry';
import { runCronJob } from './runCronJob';
import { CronWithSteps } from '@app/types/crone.types';
import { sendToRenderer } from './sendToRenderer';
import { mapCronToForm } from '@app/utils/helpers';
import { updateCron } from '@app/models/crones';

export function scheduleCron(cronConfig: CronWithSteps) {
    if (!cronConfig.isActive) return;
    if (hasCron(cronConfig.id)) return;

    const task = cron.schedule(
        cronConfig.cronExpression,
        async () => {
            const now = Date.now();
            // Todavía no empieza
            if (cronConfig.startAt && now < cronConfig.startAt) return;

            // Ya expiró
            if (cronConfig.endAt && now > cronConfig.endAt) {
                unscheduleCron(cronConfig.id);
                const parsedToForm = mapCronToForm(cronConfig)!;

                let updated = await updateCron(cronConfig.id, {
                    ...parsedToForm,
                    isActive: false,
                    status: 'stopped',
                });
                sendToRenderer('cron-updated', updated)
                
                return;
            }

            await runCronJob(cronConfig);
        },
        {
            timezone: cronConfig.timezone!,
        }
    );

    registerCron(cronConfig.id, task);

    console.log(`🟢 Cron registrado: ${cronConfig.name}`);
}

export function unscheduleCron(cronId: string) {
    stopCron(cronId);
    console.log(`🟡 Cron detenido: ${cronId}`);
}
