import { useData } from "@/contexts";
import { CronWithSteps } from "@app/types/crone.types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CronDetailView } from "./components/cron-detail-view";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function DescribePage() {
    const { data, setData, loading } = useData();
    const { id: cronId } = useParams();
    const [cron, setCron] = useState<CronWithSteps | undefined>();
    const navigate = useNavigate()

    useEffect(() => {
        if (!cronId) return;
        const foundCron = data.find((c) => c.id === cronId);
        setCron(foundCron);
    }, [data, cronId]);

    if (!cron) {
        return (
            <div className="flex items-center justify-center h-full">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            {loading ? <Spinner /> : <GitBranch />}
                        </EmptyMedia>
                        <EmptyTitle>
                            {loading ? "Cargando..." : "Configuración no encontrada"}
                        </EmptyTitle>
                        <EmptyDescription>
                            {loading ? "Cargando configuraciones..." : "No se encontro la configuración que buscas."}
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="flex-row justify-center gap-2">
                        <Button onClick={() => navigate('/', { viewTransition: true })}>Volver</Button>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    return (
        <div>
            <CronDetailView cron={cron} />
        </div>
    );
}
