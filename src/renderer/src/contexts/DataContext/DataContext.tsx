import { createContext, useEffect, useState } from 'react';
import { DataContextType } from './DataContext.types';
import { CronConfig } from '@app/types/data';

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<CronConfig[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        
    }, [])

    return (
        <DataContext.Provider value={{ data, setData, loading }}>
            {children}
        </DataContext.Provider>
    );
}
