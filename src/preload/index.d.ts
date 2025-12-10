import { ElectronAPI } from '@electron-toolkit/preload'
import { Api, WhatsappApi } from './'

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
    whatsappApi: WhatsappApi
  }
}
