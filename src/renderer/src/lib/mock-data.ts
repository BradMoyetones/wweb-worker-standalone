import type { CronConfig, CronWorkflowStep } from '../../../types/zod.types';

export const mockCronConfigs: CronConfig[] = [
    {
        id: '1',
        groupName: 'PJD SERVICIO Y EVENTOS',
        name: 'Contador de Visitantes',
        description: 'Obtiene contador de visitantes y lo envía a WhatsApp',
        cronExpression: '0 */4 * * *',
        timezone: 'America/Bogota',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-09'),
    },
    {
        id: '2',
        groupName: 'PJD VENTAS',
        name: 'Reporte de Ventas',
        description: 'Reportes diarios de ventas',
        cronExpression: '0 0 * * *',
        timezone: 'America/Bogota',
        isActive: false,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-08'),
    },
    {
        id: '3',
        groupName: 'PJD REPORTES',
        name: 'Sincronización de Datos',
        description: 'Sincroniza datos entre servidores',
        cronExpression: '0 */2 * * *',
        timezone: 'America/Bogota',
        isActive: true,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-12-07'),
    },
];

export const mockCronWorkflowSteps: CronWorkflowStep[] = [
    // Steps para config 1 (PJD SERVICIO Y EVENTOS)
    {
        id: 's1',
        cronConfigId: '1',
        stepOrder: 1,
        name: 'Login',
        method: 'POST',
        url: 'https://secure.parquejaimeduque.com/login.asp',
        headers: JSON.stringify({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        body: JSON.stringify({ txtUsuario: 'brad.moyetones', txtClave: 'brad130403', hdnEnviado: 'S' }),
        responseFormat: 'text',
    },
    {
        id: 's2',
        cronConfigId: '1',
        stepOrder: 2,
        name: 'Fetch Visitantes',
        method: 'POST',
        url: 'https://secure.parquejaimeduque.com/consulta-total-ventas.asp',
        headers: JSON.stringify({ Cookie: '{{previousStep.data}}' }),
        body: JSON.stringify({}),
        responseFormat: 'text',
        dataPath: 'body.count',
    },
];

export const TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Bogota',
    'America/Argentina/Buenos_Aires',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Madrid',
    'Asia/Dubai',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Australia/Sydney',
];
