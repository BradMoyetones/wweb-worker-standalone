import Versions from "@/components/Versions";
import Advanced from "./components/Advanced";
import Me from "./components/Me";
import Theming from "./components/Theming";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-4 mt-4">
            <div className="columns-1 md:columns-2 space-x-4 space-y-4 [&>div]:break-inside-avoid-column">
                {/* Settings Section */}
                <Me />

                <Theming />

                <Advanced />

                <Versions></Versions>
            </div>

            {/* Spacer */}
            <div className="flex-1" />
        </div>
    )
}
