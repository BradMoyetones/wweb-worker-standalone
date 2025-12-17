import { CronWithSteps } from "@app/types/crone.types";

export interface DataContextType {
    data: CronWithSteps[];
    setData: React.Dispatch<React.SetStateAction<CronWithSteps[]>>;
    loading: boolean;
}