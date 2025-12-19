import { EventEmitter } from '../services/EventEmitter';
import { getAllCrones, createCron, findCronById, updateCron, deleteCron } from '@app/main/models/crones';
import { scheduleCron, setCronExecutor, unscheduleCron } from '@app/lib/cronScheduler';
import type { CreateCronFormData, UpdateCronFormData, CronWithSteps } from '@app/types/crone.types';
import { CronExecutor } from '../services/CronExecutor';
import { dialog, WebContents } from 'electron';
import { mapCronToForm } from '@app/utils/helpers';
import fs from 'fs';

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

    /**
     * Exporta uno o varios crones a un archivo .json
     */
    async exportCrons(ids: string[]): Promise<{ success: boolean; message?: string }> {
        if (ids.length === 0) return { success: false, message: 'No hay crones seleccionados' };

        try {
            // 1. Obtener los datos de la DB
            const cronsToExport = await Promise.all(
                ids.map(async (id) => await findCronById(id))
            );

            // Filtramos por si algún ID no existía
            const validCrons = cronsToExport.filter((c) => c !== null);

            if (validCrons.length === 0) return { success: false, message: 'No se encontraron los registros' };

            // 2. Abrir diálogo de guardado
            const { canceled, filePath } = await dialog.showSaveDialog({
                title: 'Exportar Automatizaciones',
                defaultPath: `export-crones-${new Date().getTime()}.json`,
                filters: [{ name: 'JSON Files', extensions: ['json'] }],
            });

            if (canceled || !filePath) return { success: false };

            // 3. Escribir archivo
            fs.writeFileSync(filePath, JSON.stringify(validCrons, null, 2), 'utf-8');

            return { success: true, message: `${validCrons.length} crones exportados con éxito` };
        } catch (error: any) {
            console.error('[Database] Export error:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Importa crones desde un archivo .json y los registra en la DB
     */
    async importCrons(): Promise<{ success: boolean; imported: CronWithSteps[]; message?: string }> {
        try {
            // 1. Abrir diálogo de selección
            const { canceled, filePaths } = await dialog.showOpenDialog({
                title: 'Importar Automatizaciones',
                filters: [{ name: 'JSON Files', extensions: ['json'] }],
                properties: ['openFile']
            });

            if (canceled || !filePaths[0]) return { success: false, imported: [] };

            // 2. Leer y parsear
            const content = fs.readFileSync(filePaths[0], 'utf-8');
            const data = JSON.parse(content);

            // Normalizamos: si es un objeto único, lo volvemos array
            const cronsArray = Array.isArray(data) ? data : [data];
            const newlyCreated: CronWithSteps[] = [];

            // 3. Iterar e insertar
            for (const item of cronsArray) {
                // Usamos tu helper mapCronToForm para obtener solo la data necesaria para creación
                // Esto es vital para no intentar insertar IDs viejos o fechas de creación duplicadas
                const formData = mapCronToForm(item);
                
                if (formData) {
                    // Quitamos el estado activo por seguridad al importar (opcional)
                    const created = await this.createCron({
                        ...formData,
                        isActive: false // Recomendado: que el usuario los active manualmente tras importar
                    });
                    newlyCreated.push(created);
                }
            }

            return { 
                success: true, 
                imported: newlyCreated, 
                message: `${newlyCreated.length} crones importados correctamente` 
            };
        } catch (error: any) {
            console.error('[Database] Import error:', error);
            return { success: false, imported: [], message: 'El archivo no tiene un formato válido' };
        }
    }
}
