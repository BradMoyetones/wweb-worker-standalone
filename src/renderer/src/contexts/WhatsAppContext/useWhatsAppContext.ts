import { useContext } from "react";
import { WhatsAppContext } from "./WhatsAppContext";

export function useWhatsApp() {
    const context = useContext(WhatsAppContext);
    if (!context) {
        throw new Error("useVersion must be used within a VersionProvider");
    }
    return context;
}
