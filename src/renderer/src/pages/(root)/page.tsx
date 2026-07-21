import { ArrowUpRightIcon, Folder } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { CreateCronModal } from "./components/create-cron-modal"
import { useState } from "react";
import { toast } from "sonner";
import { useData } from "@/contexts";

export default function RootPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { setData } = useData();

    const handleImport = async () => {
        toast.promise(window.api.importCrons(), {
            loading: 'Abriendo selector de archivos...',
            success: (res) => {
                if (res.success && res.imported.length > 0) {
                    // Insertamos los nuevos al principio como pediste
                    setData((prev) => [...res.imported, ...prev]);
                    return res.message;
                }
                if (res.success && res.imported.length === 0) return 'Importación cancelada';
                throw new Error(res.message);
            },
            error: (err) => `Error: ${err.message}`,
        });
    };

    return (
        <div className="flex flex-col justify-center items-center h-full">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Folder />
                    </EmptyMedia>
                    <EmptyTitle>
                        Selecciona una configuración o crea una nueva para comenzar.
                    </EmptyTitle>
                    <EmptyDescription>
                        Aquí puedes gestionar tus configuraciones de Crones. Puedes crear nuevas configuraciones, importar configuraciones existentes o seleccionar una configuración existente para editar.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button onClick={() => setIsModalOpen(true)}>Crear una nueva configuración</Button>
                    <Button variant="outline" onClick={handleImport}>Importar configuraciones existentes</Button>
                </EmptyContent>
            </Empty>
            <CreateCronModal isOpen={isModalOpen} onClose={setIsModalOpen} />
        </div>
    )
}
