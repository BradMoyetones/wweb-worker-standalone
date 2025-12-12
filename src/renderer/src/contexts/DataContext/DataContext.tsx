import { createContext, useEffect, useState } from 'react';
import { DataContextType } from './DataContext.types';
import { CronWithSteps } from '@app/types/crone.types';

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<CronWithSteps[]>([]);
    const [loading, setLoading] = useState(false);

     const fetchData = async() => {
        const data = await window.api.getAllCrones()
        setData(data)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData()
    }, [])

    return (
        <DataContext.Provider value={{ data, setData, loading }}>
            {children}
        </DataContext.Provider>
    );
}
