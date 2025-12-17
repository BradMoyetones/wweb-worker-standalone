import { is } from '@electron-toolkit/utils';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath = is.dev
  ? path.join(__dirname, '../../src/renderer/public')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer');

const getMigrationsPath = () => {
  if (is.dev) {
    return path.join(__dirname, '../../drizzle/migrations');
  }

  return path.join(
    process.resourcesPath,
    'app.asar.unpacked',
    'out',
    'drizzle',
    'migrations'
  );
};

// Función para copiar archivos y carpetas de forma recursiva y forzada
const forceCopy = (source: string, destination: string) => {
  if (!fs.existsSync(source)) return;

  try {
    if (fs.lstatSync(source).isDirectory()) {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
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

const getStorePath = async (): Promise<string> => {
  const storePath = path.join(basePath, 'store');
  if (!fs.existsSync(storePath)) {
    fs.mkdirSync(storePath, { recursive: true });
  }
  return storePath;
};


export { 
  basePath,
  getMigrationsPath,
  forceCopy,
  forceDelete,
  getStorePath
};
