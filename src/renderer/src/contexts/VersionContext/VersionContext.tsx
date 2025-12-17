import { createContext, useEffect, useState } from 'react';
import { VersionContextType } from './VersionContext.types';
import { ProgressInfo, UpdateInfo } from 'electron-updater';
import { toast } from 'sonner';

export const VersionContext = createContext<VersionContextType | undefined>(undefined);

export function VersionProvider({ children }: { children: React.ReactNode }) {
    const [appVersion, setAppVersion] = useState<string>("");

    const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo>()
    const [downloadProgress, setDownloadProgress] = useState<ProgressInfo>()

    const getAppVersion = async() => {
        setAppVersion(await window.api.getAppVersion())
    }
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getAppVersion()

        // Escuchar si hay actualización
        window.api.onUpdateAvailable((info) => {
            setUpdateAvailable(info);
            toast.info('Nueva versión disponible. Descargando...');
        });

        // Escuchar progreso
        window.api.onDownloadProgress((progress) => {
            setDownloadProgress(progress);
            console.log(`Descargando: ${progress.percent}%`);
        });

        // Escuchar cuando termine
        window.api.onUpdateDownloaded(() => {
            toast.success('Actualización descargada', {
                action: {
                    label: 'Reiniciar',
                    onClick: () => window.api.restartApp(),
                },
                duration: Infinity, // Que se quede hasta que el usuario decida
            });
        });

        // Limpieza al desmontar
        return () => {
            window.api.removeAllUpdateListeners();
        };
    }, []);

    return (
        <VersionContext.Provider value={{ appVersion, updateAvailable, downloadProgress }}>
            {children}
        </VersionContext.Provider>
    );
}
