import { is } from '@electron-toolkit/utils';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { app } from 'electron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath = is.dev
  ? path.join(__dirname, '../../src/renderer/public')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer');

// 2. RUTA DE LECTURA (Migraciones)
// Estas viven dentro del paquete, son de solo lectura.
const getMigrationsPath = () => {
  if (!app.isPackaged) {
    // Ajusta esta ruta a donde realmente están tus carpetas en desarrollo
    return path.join(app.getAppPath(), 'drizzle', 'migrations');
  }

  // En producción usamos asar.unpacked
  return path.join(
    process.resourcesPath,
    'app.asar.unpacked',
    'drizzle',
    'migrations' // Quitamos el 'out/renderer' porque esto es lógica de main
  );
};

// Función para copiar archivos y carpetas de forma recursiva y forzada
const forceCopy = (source: string, destination: string) => {
  if (!fs.existsSync(source)) return;

  try {
    if (fs.lstatSync(source).isDirectory()) {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true, });
      }

      const files = fs.readdirSync(source);
      files.forEach(file => {
        const srcPath = path.join(source, file);
        const destPath = path.join(destination, file);
        forceCopy(srcPath, destPath);
      });
    } else {
      fs.copyFileSync(source, destination);
    }
  } catch (error) {
    console.error(`Error copiando ${source}:`, error);
  }
};

// Función para eliminar archivos y carpetas de forma recursiva
const forceDelete = (target: string) => {
  if (!fs.existsSync(target)) return;

  try {
    if (fs.lstatSync(target).isDirectory()) {
      fs.readdirSync(target).forEach(file => {
        const filePath = path.join(target, file);
        forceDelete(filePath);
      });
      fs.rmdirSync(target);
    } else {
      fs.unlinkSync(target);
    }
  } catch (error) {
    console.error(`Error eliminando ${target}:`, error);
  }
};

// 1. RUTA DE ESCRITURA (Base de datos)
// En producción irá a: %APPDATA%/tu-app/wweb_store/
const getStorePath = async (): Promise<string> => {
  const isDev = !app.isPackaged;
  
  const storageDir = isDev
    ? path.join(app.getAppPath(), 'database') // En dev: carpeta local
    : path.join(app.getPath('userData'), 'database'); // En prod: carpeta de sistema segura

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  return storageDir;
};


export { 
  basePath,
  getMigrationsPath,
  forceCopy,
  forceDelete,
  getStorePath
};
