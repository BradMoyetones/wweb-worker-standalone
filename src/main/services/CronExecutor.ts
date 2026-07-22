import { runWorkflow } from './WorkflowEngine';
import type { CronWithSteps } from '@app/types/crone.types';
import type { WebContents } from 'electron';
import { WhatsAppController } from '../controllers/WhatsAppController';

export type EmojisType = {
    [key: string]: string;
};

export class CronExecutor {
    constructor(
        private whatsappController: WhatsAppController,
        private updateCronFn: (id: string, updates: any) => Promise<any>
    ) {}

    async execute(cron: CronWithSteps, webContents?: WebContents): Promise<void> {
        console.log(`[CronExecutor] Executing: ${cron.name}`);

        try {
            await this.updateStatus(cron, 'running', webContents);

            const ctx = await runWorkflow(cron.steps);

            const lastStep = cron.steps[cron.steps.length - 1];
            const result = ctx.steps[lastStep.name]?.raw ?? '';

            const message = this.formatMessage(result);
            await this.whatsappController.sendToGroupByName(cron.groupName, message);

            await this.updateStatus(cron, 'idle', webContents);

            console.log(`[CronExecutor] Successfully executed: ${cron.name}`);
        } catch (error: any) {
            console.error(`[CronExecutor] Error executing ${cron.name}:`, error);
            await this.updateStatus(cron, 'error', webContents);
        }
    }

    private async updateStatus(cron: CronWithSteps, status: string, webContents?: WebContents): Promise<void> {
        const updates: any = {
            status,
            ...(status === 'running' ? { lastRunAt: Date.now() } : {}),
        };

        const updated = await this.updateCronFn(cron.id, updates);

        if (updated && webContents && !webContents.isDestroyed()) {
            webContents.send('cron-updated', updated);
        }
    }

    private formatMessage(result: string): string {
        const now = new Date();
        const hours = now.getHours()
        const minutes = now.getMinutes();
        const emoji = this.getHourEmoji();

        const ampm = hours >= 12 ? 'PM' : 'AM';

        // convertir a 12h
        let displayHour = hours % 12;
        displayHour = displayHour ? displayHour : 12;

        // formato HH:MM
        const formattedTime = `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        return `${formattedTime} ${emoji} / *${String(result).trim()}*`;
    }

    private getTimeEmoji(hour: number): string {
        if (hour >= 6 && hour < 12) return '🌅';
        if (hour >= 12 && hour < 18) return '☀️';
        if (hour >= 18 && hour < 21) return '🌆';
        return '🌙';
    }

    private getHourEmoji(): string {
        const now = new Date();

        let hours = now.getHours();
        let minutes = now.getMinutes();

        // convertir a 12h
        let displayHour = hours % 12;
        displayHour = displayHour ? displayHour : 12;

        // --- Mapeo de emojis ---
        const emojis: EmojisType = {
            '1:00': '🕐',
            '1:30': '🕜',
            '2:00': '🕑',
            '2:30': '🕝',
            '3:00': '🕒',
            '3:30': '🕞',
            '4:00': '🕓',
            '4:30': '🕟',
            '5:00': '🕔',
            '5:30': '🕠',
            '6:00': '🕕',
            '6:30': '🕡',
            '7:00': '🕖',
            '7:30': '🕢',
            '8:00': '🕗',
            '8:30': '🕣',
            '9:00': '🕘',
            '9:30': '🕤',
            '10:00': '🕙',
            '10:30': '🕥',
            '11:00': '🕚',
            '11:30': '🕦',
            '12:00': '🕛',
            '12:30': '🕧',
        };

        // decidir si redondear a la hora o media hora
        const closestMinutes = minutes < 30 ? '00' : '30';
        const key = `${displayHour}:${closestMinutes}`;
        const emoji = emojis[key];

        return `${emoji}`;
    }
}
