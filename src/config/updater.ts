import { exec } from 'node:child_process'
import { promisify } from 'node:util';
import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from "electron-log";
import ProgressBar from "electron-progressbar";
import { platform } from 'node:os';

const execPromise = promisify(exec)
const repoOwner = "BradMoyetones"; // 🔹 Cambia esto por tu usuario o equipo de GitHub
const repoName = "wweb-worker-standalone"; // 🔹 Cambia esto por el nombre de tu repo

// Configurar electron-log correctamente
log.transports.file.level = "info";
autoUpdater.logger = log; // Asigna el logger sin modificarlo directamente

// Deshabilitar la descarga automática
autoUpdater.autoDownload = false;

async function releasesLatest() {
  try {
    const { stdout: latestVersionInfo } = await execPromise(
      `curl -s https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
    );

    const latestVersionData = JSON.parse(latestVersionInfo);
    
    return {
      data: latestVersionData
    }
  } catch (error) {
    console.error("Error get releasesLatest:", error);
    return {
      data: {}
    }
  }
}

export async function verifyVersionApp() {
  try {
    const currentVersion = app.getVersion().trim();

    // Obtener la última versión publicada en GitHub Releases
    const { stdout: latestVersionInfo } = await execPromise(
      `curl -s https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
    );

    // Limpiar espacios en blanco y extraer la versión correctamente
    const latestVersionData = JSON.parse(latestVersionInfo);
    const latestVersion = latestVersionData?.tag_name?.replace(/^v/, '') || null;

    return {
      currentVersion,
      newVersion: latestVersion && latestVersion !== currentVersion ? latestVersion : null,
      message:
        latestVersion && latestVersion !== currentVersion
          ? `New version available: ${latestVersion}`
          : "You have the latest version",
      latestVersionInfo,
    };
  } catch (error) {
    console.error("Error checking for updates:", error);
    return {
      currentVersion: null,
      newVersion: null,
      message: "Error checking for updates",
    };
  }
}

export async function installLatestVersionApp() {
  try {
    // Verificar si hay una nueva versión disponible
    const checkUpdate = await verifyVersionApp(); // Asegúrate de que esta función esté bien implementada

    // Si no hay nueva versión, retornamos la respuesta
    if (!checkUpdate.newVersion || checkUpdate.newVersion === checkUpdate.currentVersion) {
      return {
        currentVersion: checkUpdate.currentVersion,
        newVersion: null,
        message: "You already have the latest version.",
      };
    }

    // Mostrar un cuadro de mensaje preguntando si el usuario quiere actualizar
    const userResponse = await dialog.showMessageBox({
      type: "info",
      title: "Update Available",
      message: `A new version (${checkUpdate.newVersion}) is available. Do you want to update now?`,
      buttons: ["Update", "Cancel"],
    });

    if (userResponse.response !== 0) {
      return { currentVersion: checkUpdate.currentVersion, newVersion: checkUpdate.newVersion, message: "Update canceled." };
    }

    // Obtener los datos de la última versión desde GitHub
    const releaseData = await releasesLatest();

    // Verificamos si los datos son válidos y contienen "assets"
    if (!releaseData || !releaseData.data || !releaseData.data.assets || releaseData.data.assets.length === 0) {
      console.error('No valid assets found in release data:', releaseData); // Imprimir la respuesta completa
      throw new Error('Failed to fetch valid release data or assets.');
    }

    // Mostrar los assets para depuración
    console.log('Assets:', releaseData.data.assets);

    const currentOS = platform(); // Detectar el sistema operativo
    let downloadUrl = '';

    // Buscamos el archivo adecuado según el sistema operativo
    if (currentOS === 'darwin') {
      // Buscar archivo .dmg para macOS
      const macAsset = releaseData.data.assets.find((asset: any) => asset.name.endsWith('.dmg'));
      if (macAsset) {
        downloadUrl = macAsset.browser_download_url; // Utilizar browser_download_url directamente
      } else {
        throw new Error('No .dmg file found for macOS.');
      }
    } else if (currentOS === 'win32') {
      // Buscar archivo .exe para Windows
      const windowsAsset = releaseData.data.assets.find((asset: any) => asset.name.endsWith('.exe'));
      if (windowsAsset) {
        downloadUrl = windowsAsset.browser_download_url; // Utilizar browser_download_url directamente
      } else {
        throw new Error('No .exe file found for Windows.');
      }
    } else {
      throw new Error('Unsupported OS');
    }

    // Si no se encontró el enlace de descarga
    if (!downloadUrl) {
      throw new Error('No appropriate download asset found.');
    }

    // Verificar si hay una actualización disponible antes de proceder con la descarga
    const updateInfo = await autoUpdater.checkForUpdates();
    if (updateInfo?.updateInfo.version !== checkUpdate.newVersion) {
      throw new Error('Please check update first');
    }

    // Si es macOS, solo devolvemos el enlace para que el usuario lo descargue
    if (currentOS === 'darwin') {
      return {
        currentVersion: checkUpdate.newVersion,
        newVersion: null,
        message: `Download the latest version for macOS: ${downloadUrl}. Please drag the app to your Applications folder.`,
      };
    }

    let progressBar = new ProgressBar({
      indeterminate: false,
      text: "Downloading update...",
      detail: "Please wait...",
      abortOnError: true,
      closeOnComplete: false,
      browserWindow: { alwaysOnTop: true },
    });

    progressBar
      .on("completed", () => {
        progressBar.detail = "Update downloaded. Preparing installation...";
      })
      .on("progress", (value: number) => {
        progressBar.detail = `Downloaded ${value}%...`;
      });

    // Si es Windows, comenzamos la descarga utilizando el autoUpdater
    autoUpdater.setFeedURL({
      provider: 'generic',  // Usamos un servidor genérico
      url: downloadUrl      // El enlace de descarga (archivo .exe o .dmg)
    });

    // Descargar la actualización
    autoUpdater.downloadUpdate();

    // Progreso de la descarga
    autoUpdater.on('download-progress', (progressObj) => {
      progressBar.value = progressObj.percent;
      progressBar.detail = `Downloaded ${progressObj.transferred} of ${progressObj.total} bytes (${progressObj.percent}%)`;
    });

    // Esperamos a que se descargue la actualización
    return new Promise((resolve) => {
      autoUpdater.on('update-downloaded', async () => {
        progressBar.close();

        // Preguntar al usuario si desea reiniciar la aplicación para instalar
        const confirmRestart = await dialog.showMessageBox({
          type: "info",
          title: "Update Ready",
          message: "Update has been downloaded. Do you want to restart now?",
          buttons: ["Restart", "Later"],
        });

        if (confirmRestart.response === 0) {
          autoUpdater.quitAndInstall(false, true); // Reiniciar para instalar
        }

        resolve({
          currentVersion: checkUpdate.newVersion,
          newVersion: null,
          message: "Update downloaded. Restart required.",
        });
      });
    });

  } catch (error) {
    console.error("Error updating the app:", error);
    return {
      currentVersion: null,
      newVersion: null,
      message: "Error updating the app: "+error,
    };
  }
}