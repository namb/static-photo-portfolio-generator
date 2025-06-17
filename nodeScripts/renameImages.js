import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderName = process.argv[2];

if (!folderName) {
  console.error("❌ Debes pasar el nombre de la carpeta. Ej: node renameImages.js valencia");
  process.exit(1);
}

const folderPath = path.join(__dirname, '..', 'public', 'images', folderName);

if (!fs.existsSync(folderPath)) {
  console.error(`❌ La carpeta '/images/${folderName}' no existe.`);
  process.exit(1);
}

const imageFiles = fs.readdirSync(folderPath)
  .filter(file => /\.(jpe?g|png|webp|jfif)$/i.test(file));

let counter = 1;
const usedNumbers = new Set();

// Detectar cuáles ya están normalizados y cuál es el último índice usado
for (const file of imageFiles) {
  const base = path.basename(file, path.extname(file));
  const match = base.match(new RegExp(`^${folderName}(\\d+)$`));
  if (match) {
    usedNumbers.add(Number(match[1]));
  }
}
if (usedNumbers.size > 0) {
  counter = Math.max(...usedNumbers) + 1;
}

let renamedCount = 0;

// Renombrar solo las que no estén normalizadas
for (const file of imageFiles.sort()) {
  const ext = path.extname(file);
  const base = path.basename(file, ext);

  const match = base.match(new RegExp(`^${folderName}(\\d+)$`));
  if (match) continue; // ya está normalizado

  const newName = `${folderName}${counter}${ext}`;
  const oldPath = path.join(folderPath, file);
  const newPath = path.join(folderPath, newName);

  fs.renameSync(oldPath, newPath);
  console.log(`🔁 ${file} → ${newName}`);
  counter++;
  renamedCount++;
}

console.log(`✅ ${renamedCount} imagen${renamedCount === 1 ? '' : 'es'} renombrada${renamedCount === 1 ? '' : 's'} en /images/${folderName}`);
