import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader, UploadIcon } from "lucide-react";
import { useVersion } from "@/contexts";

export default function Advanced() {
    const { appVersion, loading, checkVersionApp, updateApp } = useVersion();

    return (
        <div>
            <h1 className="text-2xl font-bold">Avanzado</h1>
            <div className="mt-4 border-l pl-4">
                <h2 className="text-base font-extrabold text-muted-foreground mb-4">Application version</h2>
                <div className="flex gap-4">
                    <Card className="w-full border-border">
                        <CardContent>
                            <h3 className="flex items-center gap-2 mb-4">
                                <div className={`aspect-square h-4 w-4 rounded-full ${appVersion?.newVersion ? "bg-yellow-500" : "bg-green-500"} animate-pulse`} />
                                {appVersion?.message || "Check for updates"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                <span>Current version: </span> {appVersion?.currentVersion}
                            </p>
                            <div className="flex gap-2">
                                <Button onClick={checkVersionApp} disabled={loading} className={`${appVersion?.newVersion && "hidden"}`}>
                                    {loading ? <Loader className="animate-spin" /> : <Check />}
                                    Verify version
                                </Button>
                                {appVersion?.newVersion && (
                                    <Button onClick={updateApp} disabled={loading}>
                                        {loading ? <Loader className="animate-spin" /> : <UploadIcon />}
                                        {loading ? "Updating..." : "Update now"}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
