import { BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../../resources/icon.png?asset';

export class WindowController {
    private mainWindow: BrowserWindow | null = null;

    createWindow(): BrowserWindow {
        this.mainWindow = new BrowserWindow({
            width: 900,
            height: 670,
            minWidth: 800,
            minHeight: 600,
            show: false,
            autoHideMenuBar: true,
            ...(process.platform === 'linux' ? { icon } : {}),
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false,
                contextIsolation: true,
                nodeIntegration: false,
                devTools: is.dev,
            },
        });

        this.setupWindowEvents();
        this.loadContent();

        return this.mainWindow;
    }

    private setupWindowEvents(): void {
        if (!this.mainWindow) return;

        this.mainWindow.on('ready-to-show', () => {
            this.mainWindow?.show();
        });

        this.mainWindow.webContents.setWindowOpenHandler((details) => {
            shell.openExternal(details.url);
            return { action: 'deny' };
        });

        this.mainWindow.on('maximize', () => {
            this.mainWindow?.webContents.send('maximize-changed', true);
        });

        this.mainWindow.on('unmaximize', () => {
            this.mainWindow?.webContents.send('maximize-changed', false);
        });
    }

    private loadContent(): void {
        if (!this.mainWindow) return;

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
        } else {
            this.mainWindow.loadFile(join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer', 'index.html'));
        }
    }

    getWindow(): BrowserWindow | null {
        return this.mainWindow;
    }

    minimize(): void {
        this.mainWindow?.minimize();
    }

    toggleMaximize(): boolean {
        if (!this.mainWindow) return false;

        if (this.mainWindow.isMaximized()) {
            this.mainWindow.unmaximize();
            return false;
        } else {
            this.mainWindow.maximize();
            return true;
        }
    }

    isMaximized(): boolean {
        return this.mainWindow?.isMaximized() ?? false;
    }

    close(): void {
        this.mainWindow?.close();
    }
}
