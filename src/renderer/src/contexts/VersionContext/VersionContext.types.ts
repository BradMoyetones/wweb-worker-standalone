import { ProgressInfo, UpdateInfo } from "electron-updater";

export interface VersionContextType {
    appVersion: string;
    updateAvailable?: UpdateInfo;
    downloadProgress?: ProgressInfo;
}