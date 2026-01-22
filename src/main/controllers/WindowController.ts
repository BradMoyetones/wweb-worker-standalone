import { BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../../resources/logos/logo-worker-1.png?asset';

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
                devTools: true,
            },
        });

        this.setupWindowEvents();
        this.loadContent();
        this.hookLogs();

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

    // private loadContent(): void {
    //     if (!this.mainWindow) return;

    //     if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    //         this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    //     } else {
    //         this.mainWindow.loadFile(join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer', 'index.html'));
    //     }
    // }

    private loadContent(): void {
        if (!this.mainWindow) return;

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
        } else {
            // SOLUCIÓN: Usar join(__dirname, ...)
            // En producción, __dirname apunta a la carpeta 'out/main' dentro del ASAR
            // Por lo tanto, subimos un nivel y entramos a 'renderer'
            this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
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

    private hookLogs() {
        if (!this.mainWindow) return;

        const formatArgs = (args: any[]) => {
            return args
                .map((arg) => {
                    if (typeof arg === 'object' && arg !== null) {
                        try {
                            // El 2 añade indentación para que se vea bonito (opcional)
                            return JSON.stringify(arg, null, 2);
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (e) {
                            return '[Unserializable Object]';
                        }
                    }
                    return String(arg);
                })
                .join(' ');
        };

        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            originalLog(...args);
            this.sendMessageToRenderer('info', formatArgs(args));
        };

        console.error = (...args) => {
            originalError(...args);
            this.sendMessageToRenderer('error', formatArgs(args));
        };

        console.warn = (...args) => {
            originalWarn(...args);
            this.sendMessageToRenderer('warn', formatArgs(args));
        };
    }

    // Función auxiliar para limpiar el código
    private sendMessageToRenderer(type: string, message: string) {
        if (!this.mainWindow?.webContents.isDestroyed()) {
            this.mainWindow?.webContents.send('app-log', {
                type,
                message,
                time: new Date().toLocaleTimeString(),
            });
        }
    }
}
