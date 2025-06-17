import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lee el nombre de la carpeta desde los argumentos
const folderName = process.argv[2];

if (!folderName) {
  console.error("❌ Debes pasar el nombre de la carpeta. Ej: node getImages.js procida");
  process.exit(1);
}

const folderPath = path.join(__dirname, '..', 'public', 'images', folderName);

if (!fs.existsSync(folderPath)) {
  console.error(`❌ La carpeta '/images/${folderName}' no existe.`);
  process.exit(1);
}

// Filtra solo archivos de imagen y los ordena
const imageFiles = fs.readdirSync(folderPath)
  .filter(file => /\.(jpe?g|png|webp|jfif)$/i.test(file) && !/^thumbnail\./i.test(file))
  .sort()
  .map(file => ({ src: file, alt: "" }));

// Genera salida con objetos en una sola línea
const output = '[\n  ' + imageFiles.map(img => JSON.stringify(img)).join(',\n  ') + '\n]';

console.log(output);
