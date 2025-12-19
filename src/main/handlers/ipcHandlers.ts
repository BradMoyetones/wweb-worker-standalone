import { ipcMain, app } from 'electron';
import type { WindowController } from '../controllers/WindowController';
import type { WhatsAppController } from '../controllers/WhatsAppController';
import type { UpdateController } from '../controllers/UpdateController';
import type { DatabaseController } from '../controllers/DatabaseController';

export function registerIpcHandlers(
    windowController: WindowController,
    whatsappController: WhatsAppController,
    updateController: UpdateController,
    databaseController: DatabaseController
): void {
    // Window handlers
    ipcMain.on('minimize', () => windowController.minimize());

    ipcMain.handle('maximize', () => windowController.toggleMaximize());

    ipcMain.handle('isMaximized', () => windowController.isMaximized());

    ipcMain.on('close', () => app.quit());

    // App info handlers
    ipcMain.handle('get-app-version', () => app.getVersion());

    ipcMain.handle('get-platform', () => process.platform);

    ipcMain.handle('get-release-notes', async () => {
        return await updateController.getReleaseNotes();
    });

    // WhatsApp handlers
    ipcMain.handle('whatsapp-init', async (event) => {
        try {
            await whatsappController.initialize(event.sender);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle('whatsapp-get-messages', async (event, chatId: string) => {
        try {
            const client = whatsappController.getClient();
            if (!client) return [];

            const chat = await client.getChatById(chatId);
            const messages = await chat.fetchMessages({ limit: 100 });
            return messages;
        } catch (err) {
            console.error('[IPC] Error fetching messages:', err);
            return [];
        }
    });

    ipcMain.handle('whatsapp-download-media', async (event, messageId: string, chatId: string) => {
        try {
            const client = whatsappController.getClient();
            if (!client) return null;

            const chat = await client.getChatById(chatId);
            const messages = await chat.fetchMessages({ limit: 50 });
            const message = messages.find((m) => m.id._serialized === messageId);

            if (!message || !message.hasMedia) {
                return { error: 'No media in message' };
            }

            const media = await message.downloadMedia();
            return media || { error: 'Failed to download media' };
        } catch (err: any) {
            console.error('[IPC] Error downloading media:', err);
            return { error: err.message };
        }
    });

    ipcMain.handle(
        'whatsapp-send-message',
        async (event, chatId: string, content: string, replyToId?: string | null) => {
            try {
                const client = whatsappController.getClient();
                if (!client) return { error: 'No client initialized' };

                const chat = await client.getChatById(chatId);
                if (!chat) return { error: 'Chat not found' };

                if (replyToId) {
                    const messages = await chat.fetchMessages({ limit: 100 });
                    const msgToReply = messages.find((m) => m.id._serialized === replyToId);

                    if (!msgToReply) {
                        return { error: 'Message to reply not found' };
                    }

                    await msgToReply.reply(content, chatId);
                    return { success: true, replied: true };
                } else {
                    await client.sendMessage(chatId, content);
                    return { success: true, replied: false };
                }
            } catch (err: any) {
                console.error('[IPC] Error sending message:', err);
                return { error: err.message };
            }
        }
    );

    ipcMain.handle('whatsapp-reset-session', async (event) => {
        try {
            await whatsappController.resetSession(event.sender);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    });

    // WhatsApp Logout
    ipcMain.handle('whatsapp-logout', async (event) => {
        try {
            await whatsappController.logout(event.sender);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    });

    // Exportar sesión (ZIP)
    ipcMain.handle('whatsapp-export-session', async () => {
        return await whatsappController.exportSession();
    });

    // Importar sesión (ZIP)
    ipcMain.handle('whatsapp-import-session', async (event) => {
        return await whatsappController.importSession(event.sender);
    });

    // Database handlers
    ipcMain.handle('getAllCrones', async () => {
        return await databaseController.getAllCrones();
    });

    ipcMain.handle('createCron', async (event, id, input) => {
        return await databaseController.createCron(input);
    });

    ipcMain.handle('updateCron', async (event, id, input) => {
        return await databaseController.updateCron(id, input);
    });

    ipcMain.handle('deleteCron', async (event, cron) => {
        return await databaseController.deleteCron(cron);
    });

    // Cron control handlers
    ipcMain.handle('toggleCron', async (event, id: string, isActive: boolean) => {
        return await databaseController.toggleCron(id, isActive);
    });

    ipcMain.handle('executeCronNow', async (event, cronId: string) => {
        const crones = await databaseController.getAllCrones();
        const cron = crones.find((c) => c.id === cronId);
        if (!cron) return { success: false, error: 'Cron not found' };

        try {
            const window = windowController.getWindow();
            if (window && !window.isDestroyed()) {
                // Execute immediately
                await databaseController['cronExecutor']?.execute(cron, window.webContents);
            }
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle('exportCrons', async (event, ids: string[]) => {
        return await databaseController.exportCrons(ids);
    });

    ipcMain.handle('importCrons', async () => {
        return await databaseController.importCrons();
    });

    // Update handlers
    ipcMain.handle('restart-app', () => {
        updateController.quitAndInstall();
    });
}
