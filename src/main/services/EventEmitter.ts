import type { WebContents } from 'electron';

export class EventEmitter {
    private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

    on(event: string, callback: (...args: any[]) => void): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    emit(event: string, ...args: any[]): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => callback(...args));
        }

        const lastArg = args[args.length - 1];
        if (lastArg && typeof lastArg === 'object' && 'send' in lastArg) {
            const webContents = lastArg as WebContents;
            const data = args.slice(0, -1);

            if (webContents && !webContents.isDestroyed()) {
                webContents.send(event, ...data);
            }
        }
    }

    removeAllListeners(event?: string): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}
