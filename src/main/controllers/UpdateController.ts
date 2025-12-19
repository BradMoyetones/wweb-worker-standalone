import { autoUpdater } from 'electron-updater';
import { EventEmitter } from '../services/EventEmitter';
import log from 'electron-log';
import { app, type WebContents } from 'electron';
import path from 'path';
import fs from 'fs';

log.transports.file.level = 'info';
autoUpdater.logger = log;

export class UpdateController extends EventEmitter {
    private updateCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.setupAutoUpdater();
    }

    private setupAutoUpdater(): void {
        autoUpdater.on('checking-for-update', () => {
            log.info('[Update] Checking for updates...');
        });

        autoUpdater.on('update-available', (info) => {
            log.info('[Update] Update available:', info);
            this.emit('update-available', info);
        });

        autoUpdater.on('download-progress', (progressObj) => {
            log.info(`[Update] Download progress: ${progressObj.percent}%`);
            this.emit('download-progress', progressObj);
        });

        autoUpdater.on('update-downloaded', (info) => {
            log.info('[Update] Update downloaded');
            this.emit('update-downloaded', info);
        });

        autoUpdater.on('error', (err) => {
            log.error('[Update] Error:', err);
            this.emit('update-error', err);
        });

        autoUpdater.on('update-not-available', () => {
            log.info('[Update] No updates available');
        });
    }

    startUpdateChecks(webContents: WebContents, delayMs = 10000): void {
        setTimeout(() => {
            autoUpdater.checkForUpdatesAndNotify();

            // Check every 2 hours
            this.updateCheckInterval = setInterval(
                () => {
                    autoUpdater.checkForUpdatesAndNotify();
                },
                2 * 60 * 60 * 1000
            );
        }, delayMs);
    }

    stopUpdateChecks(): void {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
            this.updateCheckInterval = null;
        }
    }

    quitAndInstall(): void {
        autoUpdater.quitAndInstall();
    }

    async getReleaseNotes(): Promise<string> {
        try {
            let notesPath: string;

            if (app.isPackaged) {
                // Ruta en producción (ajustada a tu estructura de asar.unpacked)
                notesPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'releases', 'notes', 'latest.md');
            } else {
                // Ruta en desarrollo (subiendo desde src/main/controllers a la raíz)
                notesPath = path.join(app.getAppPath(), 'releases', 'notes', 'latest.md');
            }

            if (fs.existsSync(notesPath)) {
                return fs.readFileSync(notesPath, 'utf-8');
            }

            return '# Sin notas disponibles\nNo se encontró el archivo de cambios para esta versión.';
        } catch (error) {
            console.error('Error leyendo release notes:', error);
            return 'Error al cargar las notas de la versión.';
        }
    }
}
