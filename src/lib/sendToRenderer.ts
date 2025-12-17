import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow) {
    mainWindow = win;
}

export function sendToRenderer(channel: string, payload: any) {
    if (!mainWindow) return;
    mainWindow.webContents.send(channel, payload);
}
