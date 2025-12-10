import { CronConfig } from "@app/types/data";

export interface DataContextType {
    data: CronConfig[];
    setData: React.Dispatch<React.SetStateAction<CronConfig[]>>;
    loading: boolean;
}