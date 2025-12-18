import { createContext, useEffect, useState } from 'react';
import { VersionContextType } from './VersionContext.types';

export const VersionContext = createContext<VersionContextType | undefined>(undefined);

export function VersionProvider({ children }: { children: React.ReactNode }) {
    const [appVersion, setAppVersion] = useState<string>("");

    const getAppVersion = async() => {
        setAppVersion(await window.api.getAppVersion())
    }
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getAppVersion()
    }, []);

    return (
        <VersionContext.Provider value={{ appVersion }}>
            {children}
        </VersionContext.Provider>
    );
}
