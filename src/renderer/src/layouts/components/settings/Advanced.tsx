import { Card, CardContent } from "@/components/ui/card";
import { useVersion } from "@/contexts";

export default function Advanced() {
    const { appVersion } = useVersion();

    return (
        <div>
            <h1 className="text-2xl font-bold">Avanzado</h1>
            <div className="mt-4 border-l pl-4">
                <h2 className="text-base font-extrabold text-muted-foreground mb-4">Application version</h2>
                <div className="flex gap-4">
                    <Card className="w-full border-border">
                        <CardContent>
                            {/* <h3 className="flex items-center gap-2 mb-4">
                                {appVersion}
                            </h3> */}
                            <p className="text-muted-foreground">
                                <span>Current version: </span> {appVersion}
                            </p>
                            {/* <div className="flex gap-2">
                                <Button>
                                    Verify version
                                </Button>
                            </div> */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
