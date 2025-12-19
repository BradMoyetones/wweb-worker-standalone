import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { WindowController } from './controllers/WindowController';
import { WhatsAppController } from './controllers/WhatsAppController';
import { UpdateController } from './controllers/UpdateController';
import { DatabaseController } from './controllers/DatabaseController';
import { registerIpcHandlers } from './handlers/ipcHandlers';

const windowController = new WindowController();
const whatsappController = new WhatsAppController();
const updateController = new UpdateController();
const databaseController = new DatabaseController(whatsappController);

function setupControllers(): void {
    whatsappController.on('whatsapp-ready', () => {
        console.log('[Main] WhatsApp is ready, initializing crons...');
        const window = windowController.getWindow();
        if (window && !window.isDestroyed()) {
            databaseController.initializeCrons(window?.webContents);
        }
    });

    updateController.on('update-available', (info) => {
        const window = windowController.getWindow();
        if (window && !window.isDestroyed()) {
            window.webContents.send('update-available', info);
        }
    });

    updateController.on('download-progress', (progress) => {
        const window = windowController.getWindow();
        if (window && !window.isDestroyed()) {
            window.webContents.send('download-progress', progress);
        }
    });

    updateController.on('update-downloaded', (info) => {
        const window = windowController.getWindow();
        if (window && !window.isDestroyed()) {
            window.webContents.send('update-downloaded', info);
        }
    });

    updateController.on('update-error', (err) => {
        const window = windowController.getWindow();
        if (window && !window.isDestroyed()) {
            window.webContents.send('update-error', err);
        }
    });
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron');

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    setupControllers();
    registerIpcHandlers(windowController, whatsappController, updateController, databaseController);

    const mainWindow = windowController.createWindow();

    mainWindow.webContents.once('did-finish-load', () => {
        console.log('[Main] Renderer loaded, starting update checks...');
        updateController.startUpdateChecks(mainWindow.webContents);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            windowController.createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        updateController.stopUpdateChecks();
        app.quit();
    }
});
