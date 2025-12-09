import { createContext, useEffect, useState } from 'react';
import { VersionInfo, YtDlpContextType } from './VersionContext.types';

export const VersionContext = createContext<YtDlpContextType | undefined>(undefined);

export function VersionProvider({ children }: { children: React.ReactNode }) {
    const [appVersion, setAppVersion] = useState<VersionInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const checkVersionApp = async () => {
        setLoading(true);
        const data = await window.api.verifyVersionApp();
        setAppVersion(data);
        setLoading(false);
    };

    const updateApp = async () => {
        setLoading(true);
        const data = await window.api.installLatestVersionApp();
        setAppVersion(data);
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkVersionApp();
        // Función para verificar la versión
        const intervalId = setInterval(() => {
            checkVersionApp();
        }, 300000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <VersionContext.Provider value={{ appVersion, loading, checkVersionApp, updateApp }}>
            {children}
        </VersionContext.Provider>
    );
}
