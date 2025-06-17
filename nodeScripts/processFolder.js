import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Adaptar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lee el nombre de la carpeta como argumento
const folder = process.argv[2];

if (!folder) {
  console.error("❌ Debes pasar el nombre de la carpeta. Ej: node processFolder.js valencia");
  process.exit(1);
}

try {
  console.log(`📁 Renombrando imágenes en ${folder}...`);
  execSync(`node ./nodeScripts/renameImages.js ${folder}`, { stdio: 'inherit' });

  console.log(`📝 Generando listado JSON...`);
  execSync(`node ./nodeScripts/getImages.js ${folder}`, { stdio: 'inherit' });
} catch (error) {
  console.error("❌ Error durante el proceso:", error.message);
}
