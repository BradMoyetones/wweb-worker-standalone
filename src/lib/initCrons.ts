import { getAllCrones } from '@app/models/crones';
import { scheduleCron } from './cronScheduler';

export async function initCrons() {
    const crons = await getAllCrones();

    for (const cron of crons) {
        if (cron.isActive) {
            scheduleCron(cron);
        }
    }

    console.log(`🚀 ${crons.length} crons cargados`);
}
