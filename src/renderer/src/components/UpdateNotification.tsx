'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { UpdateInfo, ProgressInfo } from 'electron-updater';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useTheme } from 'next-themes';

export function UpdateNotification() {
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<ProgressInfo | null>(null);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        window.api.onUpdateAvailable((info) => {
            console.log('[Update] Update available:', info);
            setUpdateInfo(info);
            setDismissed(false);
        });

        window.api.onDownloadProgress((progress) => {
            console.log('[Update] Download progress:', progress);
            setDownloadProgress(progress);
        });

        window.api.onUpdateDownloaded(() => {
            console.log('[Update] Update downloaded');
            setIsDownloaded(true);
            setDownloadProgress(null);
        });

        return () => {
            window.api.removeAllUpdateListeners();
        };
    }, []);

    const handleUpdateNow = () => {
        window.api.restartApp();
    };

    const handleLater = () => {
        setDismissed(true);
    };

    const handleShowReleaseNotes = () => {
        setShowReleaseNotes(true);
    };

    if (dismissed || !updateInfo) return null;

    return (
        <>
            <div className="fixed bottom-4 left-4 z-100 max-w-md w-full animate-in slide-in-from-bottom-5">
                <Card className="shadow-lg border-2 bg-card">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Download className="size-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">
                                        {isDownloaded ? 'Update Ready!' : 'New Update Available'}
                                    </CardTitle>
                                    <CardDescription className="text-xs">Version {updateInfo.version}</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="size-6 -mt-1 -mr-1" onClick={handleLater}>
                                <X className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {!isDownloaded && downloadProgress && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Downloading...</span>
                                    <span>{Math.round(downloadProgress.percent)}%</span>
                                </div>
                                <Progress value={downloadProgress.percent} className="h-2" />
                            </div>
                        )}

                        {isDownloaded && (
                            <p className="text-sm text-muted-foreground">
                                The app needs to restart to install the update.
                            </p>
                        )}

                        <div className="flex gap-2">
                            {isDownloaded ? (
                                <>
                                    <Button onClick={handleUpdateNow} size="sm" className="flex-1">
                                        Update Now
                                    </Button>
                                    <Button
                                        onClick={handleLater}
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 bg-transparent"
                                    >
                                        Later
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={handleLater}
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 bg-transparent"
                                >
                                    Dismiss
                                </Button>
                            )}
                            <Button onClick={handleShowReleaseNotes} size="sm" variant="ghost">
                                <FileText className="size-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showReleaseNotes} onOpenChange={setShowReleaseNotes}>
                <DialogContent className="max-w-4xl! max-h-[90vh] h-full w-full!">
                    <DialogHeader>
                        <DialogTitle>Release Notes - v{updateInfo.version}</DialogTitle>
                        <DialogDescription>See what&apos;s new in this update</DialogDescription>
                    </DialogHeader>
                    {/* LA CLAVE: 
                      1. 'markdown-body' activa los estilos de GitHub.
                      2. Forzamos el modo dark/light de GitHub basado en tu tema.
                    */}
                    <ScrollArea
                        className={`
                            flex-1 
                            markdown-body 
                            bg-muted/30!
                        `}
                        style={{
                            backgroundColor: 'transparent', // Para que use el fondo de tu Dialog
                            minHeight: '100%',
                        }}
                    >
                        <MarkdownPreview
                            source={updateInfo.releaseNotes as string}
                            wrapperElement={{
                                'data-color-mode': theme === 'dark' ? 'dark' : 'light',
                            }}
                            style={{
                                padding: '24px',
                                backgroundColor: 'transparent',
                            }}
                        />
                        <ScrollBar orientation="vertical" />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
