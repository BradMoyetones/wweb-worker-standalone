import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Chat, ClientInfo, Contact, Message } from 'whatsapp-web.js';
import { CreateCronFormData, CronWithSteps, UpdateCronFormData } from '@app/types/crone.types';

// Custom APIs for renderer
const api = {
  verifyVersionApp: () => ipcRenderer.invoke('verifyVersionApp'),
  installLatestVersionApp: () => ipcRenderer.invoke('installLatestVersionApp'),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),

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
  deleteCron: (id: string): Promise<{ success: boolean }> => ipcRenderer.invoke('deleteCron', id)
}

const whatsappApi = {
  // Inicializa el cliente
  init: () => ipcRenderer.invoke('whatsapp-init'),
  
  // Escucha cambios de estado: qr, ready, loading, auth_failure, disconnected
  onStatus: (callback: (data: { status: string; qr?: string; error?: string }) => void) => {
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
  sendMessage: (chatId: string, content: string, replyToId?: string | null) => ipcRenderer.invoke('whatsapp-send-message', chatId, content, replyToId)
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
