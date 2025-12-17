import { useRouteError, isRouteErrorResponse } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const error = useRouteError();

    let message = "";

    if (isRouteErrorResponse(error)) {
        message += `🛑 Error de respuesta de ruta\n`;
        message += `Status: ${error.status} - ${error.statusText}\n`;

        if (error.data) {
            message += `\n📦 Data:\n`;
            message += typeof error.data === "string"
                ? error.data
                : JSON.stringify(error.data, null, 2);
        }

    } else if (error instanceof Error) {
        message += `💥 Error:\n${error.name}: ${error.message}\n`;

        if (error.stack) {
            message += `\n🧱 Stack trace:\n${error.stack}`;
        }

    } else if (typeof error === "string") {
        message += `📜 String error:\n${error}`;
    } else {
        message += `❓ Error desconocido:\n${JSON.stringify(error, null, 2)}`;
    }

    return (
        <div>
            <div className="max-w-6xl mx-auto min-h-[calc(100vh-61px-53px)] flex items-center justify-center flex-col gap-4 px-8">
                <h1 className="text-2xl max-w-96">
                    Al parecer te has encontrado con nuestra página de error <span className="font-bold">404</span>
                </h1>
                <p>Si tienes alguna duda comunícate con el administrador del sistema.</p>

                <pre className="bg-red-100 text-red-800 p-4 rounded text-xs font-mono leading-relaxed max-w-xl overflow-auto wrap-break-word whitespace-pre-wrap">
                    {message}
                </pre>

                <div className="flex flex-wrap gap-4">
                    <Button onClick={() => (window.location.href = "/")}>Inicio</Button>
                    <Button variant="outline" onClick={() => window.history.back()}>Volver</Button>
                </div>
            </div>
        </div>
    );
}