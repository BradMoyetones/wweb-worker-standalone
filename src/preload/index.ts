import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Chat, ClientInfo, Contact, Message } from 'whatsapp-web.js';
import { CreateCronFormData, CronWithSteps, UpdateCronFormData } from '@app/types/crone.types';
import { ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater';

// Custom APIs for renderer
const api = {
  

  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.invoke("maximize"),
  isMaximized: () => ipcRenderer.invoke("isMaximized"),
  close: () => ipcRenderer.send("close"),
  onMaximizeChanged: (callback: (isMax: boolean) => void) => {
    ipcRenderer.on("maximize-changed", (_, value) => callback(value));
  },

  // DATABASE DATA
  getAllCrones: (): Promise<CronWithSteps[]> => ipcRenderer.invoke('getAllCrones'),
  createCron: (input: CreateCronFormData): Promise<CronWithSteps> => ipcRenderer.invoke('createCron', input),
  findCronById: (id: string): Promise<CronWithSteps | null> => ipcRenderer.invoke('findCronById', id),
  updateCron: (id: string, input: UpdateCronFormData): Promise<CronWithSteps | null> => ipcRenderer.invoke('updateCron', id, input),
  deleteCron: (cron: CronWithSteps): Promise<{ success: boolean }> => ipcRenderer.invoke('deleteCron', cron),

  // Eventos
  onCronUpdated: (callback: (cron: CronWithSteps) => void) => {
    ipcRenderer.on('cron-updated', (_e, cron) => callback(cron));
  },

  // ---------------------------------------------------
  // Updater
  // ---------------------------------------------------

  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),

  // Evento: Actualización disponible
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => 
    ipcRenderer.on('update-available', (_event, value) => callback(value)),

  // Evento: Progreso de descarga
  onDownloadProgress: (callback: (progress: ProgressInfo) => void) => 
    ipcRenderer.on('download-progress', (_event, value) => callback(value)),

  // Evento: Descarga lista
  onUpdateDownloaded: (callback: (info: UpdateDownloadedEvent) => void) => 
    ipcRenderer.on('update-downloaded', (_event, value) => callback(value)),

  // Evento: Error
  onUpdateError: (callback: (err: Error) => void) => 
    ipcRenderer.on('update-error', (_event, value) => callback(value)),

  // Acción: Reiniciar app
  restartApp: () => ipcRenderer.invoke('restart-app'),
  
  // Limpiar listeners (importante en React useEffect)
  removeAllUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available')
    ipcRenderer.removeAllListeners('download-progress')
    ipcRenderer.removeAllListeners('update-downloaded')
  }
}

const whatsappApi = {
  // Inicializa el cliente
  init: () => ipcRenderer.invoke('whatsapp-init'),
  
  // Escucha cambios de estado: qr, ready, loading, auth_failure, disconnected
  onStatus: (callback: (data: { status: string; qr?: string; error?: string, progress?: number }) => void) => {
    ipcRenderer.on('whatsapp-status', (_, data) => callback(data));
  },

  // Perfil del usuario actual
  onUser: (callback: (user: ClientInfo) => void) => {
    ipcRenderer.on('whatsapp-user', (_, user: ClientInfo) => callback(user));
  },

  // Chats iniciales
  onChats: (callback: (chats: Chat[]) => void) => {
    ipcRenderer.on('whatsapp-chats', (_, chats: Chat[]) => callback(chats));
  },

  // Contacts iniciales
  onContacts: (callback: (contacts: Contact[]) => void) => {
    ipcRenderer.on('whatsapp-contacts', (_, contacts: Contact[]) => callback(contacts));
  },

  // Mensajes entrantes
  onMessage: (callback: (msg: Message) => void) => {
    ipcRenderer.on('whatsapp-message', (_, msg: Message) => callback(msg));
  },

  getMessagesChat: (chatId: string) => ipcRenderer.invoke('whatsapp-get-messages', chatId),
  downloadMedia: (messageId: string, chatId: string) => ipcRenderer.invoke('whatsapp-download-media', messageId, chatId),
  sendMessage: (chatId: string, content: string, replyToId?: string | null) => ipcRenderer.invoke('whatsapp-send-message', chatId, content, replyToId),
};

export type Api = typeof api
export type WhatsappApi = typeof whatsappApi

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('whatsappApi', whatsappApi);
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.whatsappApi = whatsappApi
}
