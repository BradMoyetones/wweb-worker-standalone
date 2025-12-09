export interface VersionInfo {
    currentVersion: string;
    newVersion: string | null;
    message: string;
}

export interface YtDlpContextType {
    appVersion: VersionInfo | null;
    loading: boolean;
    checkVersionApp: () => Promise<void>;
    updateApp: () => Promise<void>;
}