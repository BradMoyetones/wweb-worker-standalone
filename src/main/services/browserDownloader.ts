import { install, Browser, resolveBuildId, BrowserPlatform } from '@puppeteer/browsers';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export const getChromiumPath = async (onProgress: (percent: number) => void) => {
    const downloadPath = path.join(app.getPath('userData'), 'browser-bin');
    
    // 1. Detectar plataforma
    let platform: BrowserPlatform;
    if (process.platform === 'win32') {
        platform = BrowserPlatform.WIN64;
    } else if (process.platform === 'darwin') {
        platform = process.arch === 'arm64' ? BrowserPlatform.MAC_ARM : BrowserPlatform.MAC;
    } else {
        platform = BrowserPlatform.LINUX;
    }

    // 2. Resolver Build ID
    const buildId = await resolveBuildId(Browser.CHROMIUM, platform, 'latest');

    // 3. Definir rutas
    const executableName = process.platform === 'win32' ? 'chrome.exe' : 'Chromium';
    const installPath = path.join(downloadPath, Browser.CHROMIUM, `${platform}-${buildId}`);

    const possibleExecPath = process.platform === 'darwin'
        ? path.join(installPath, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium')
        : path.join(installPath, `chrome-${platform}`, executableName);

    // --- EL FIX RECURSIVO ---
    if (fs.existsSync(possibleExecPath)) {
        console.log('[BROWSER] Ejecutable verificado:', possibleExecPath);
        return possibleExecPath;
    } 
    
    // Si la carpeta existe pero llegamos aquí, es que el ejecutable NO está.
    // Limpiamos la carpeta corrupta para que `install` no se queje.
    if (fs.existsSync(installPath)) {
        console.log('[BROWSER] Carpeta corrupta detectada, limpiando...', installPath);
        try {
            fs.rmSync(installPath, { recursive: true, force: true });
        } catch (e) {
            console.error('[BROWSER] No se pudo limpiar la carpeta:', e);
        }
    }
    // ------------------------

    console.log('[BROWSER] Iniciando descarga limpia para plataforma:', platform);

    const result = await install({
        browser: Browser.CHROMIUM,
        buildId: buildId,
        platform: platform,
        cacheDir: downloadPath,
        unpack: true,
        downloadProgressCallback: (downloaded, total) => {
            const percentage = Math.round((downloaded / total) * 100);
            onProgress(percentage);
        },
    });

    return result.executablePath;
};