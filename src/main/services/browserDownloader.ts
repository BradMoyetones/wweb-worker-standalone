import { install, Browser, resolveBuildId, BrowserPlatform } from '@puppeteer/browsers';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export const getChromiumPath = async (onProgress: (percent: number) => void) => {
    const downloadPath = path.join(app.getPath('userData'), 'browser-bin');
    const chromiumBaseDir = path.join(downloadPath, Browser.CHROMIUM); // Ruta: .../browser-bin/chromium
    
    // 1. Detectar plataforma
    let platform: BrowserPlatform;
    if (process.platform === 'win32') {
        platform = BrowserPlatform.WIN64;
    } else if (process.platform === 'darwin') {
        platform = process.arch === 'arm64' ? BrowserPlatform.MAC_ARM : BrowserPlatform.MAC;
    } else {
        platform = BrowserPlatform.LINUX;
    }

    // 2. Resolver Build ID más reciente
    const buildId = await resolveBuildId(Browser.CHROMIUM, platform, 'latest');
    const currentFolderName = `${platform}-${buildId}`;
    const installPath = path.join(chromiumBaseDir, currentFolderName);

    // --- CLEANUP: Borrar versiones obsoletas ---
    if (fs.existsSync(chromiumBaseDir)) {
        const existingVersions = fs.readdirSync(chromiumBaseDir);
        
        for (const folder of existingVersions) {
            if (folder !== currentFolderName) {
                const oldPath = path.join(chromiumBaseDir, folder);
                console.log(`[BROWSER] Limpiando versión antigua: ${folder}`);
                try {
                    // Borramos carpetas que no sean la actual
                    fs.rmSync(oldPath, { recursive: true, force: true });
                } catch (err) {
                    console.error(`[BROWSER] No se pudo borrar la versión antigua ${folder}:`, err);
                }
            }
        }
    }
    // --------------------------------------------

    // 3. Definir ruta del ejecutable
    const executableName = process.platform === 'win32' ? 'chrome.exe' : 'Chromium';

    const possibleExecPath = process.platform === 'darwin'
        ? path.join(installPath, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium')
        : path.join(installPath, `chrome-${platform}`, executableName);

    // Verificar si ya existe el actual
    if (fs.existsSync(possibleExecPath)) {
        console.log('[BROWSER] Ejecutable actual verificado:', possibleExecPath);
        return possibleExecPath;
    } 

    console.log('[BROWSER] Iniciando descarga limpia de la última versión:', currentFolderName);

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