import { sendToGroupByName } from './whatsappClient';
import { getCurrentTimeWithEmoji, mapCronToForm } from '@app/utils/helpers';
import { runWorkflow } from './workflows';
import { updateCron } from '@app/models/crones';
import { sendToRenderer } from './sendToRenderer';

export async function runCronJob(cron: any) {
    let updated: any
    try {
        console.log(`Ejecutando cron: ${cron.name}`);

        const parsedToForm = mapCronToForm(cron)!;

        updated = await updateCron(cron.id, {
            ...parsedToForm,
            status: 'running',
            lastRunAt: Date.now(),
        });

        sendToRenderer('cron-updated', updated)

        const ctx = await runWorkflow(cron.steps);

        // TOMAMOS EL ÚLTIMO STEP
        const lastStep = cron.steps[cron.steps.length - 1];
        const result = ctx.steps[lastStep.name]?.raw ?? '';

        const currentTime = getCurrentTimeWithEmoji();
        const message = `${currentTime} / *${String(result).trim()}*`;

        await sendToGroupByName(cron.groupName, message);

        updated = await updateCron(cron.id, {
            ...parsedToForm,
            status: 'idle',
        });

        sendToRenderer('cron-updated', updated)

        console.log(`Cron ${cron.name} ejecutado correctamente`);
    } catch (err) {
        const parsedToForm = mapCronToForm(cron)!;

        updated = await updateCron(cron.id, {
            ...parsedToForm,
            status: 'error',
        });
        sendToRenderer('cron-updated', updated)
        console.error(`Error en cron ${cron.name}`, err);
    }
}
