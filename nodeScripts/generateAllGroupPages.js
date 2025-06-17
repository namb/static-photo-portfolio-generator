import { data } from '../data/data.js';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Recoge el parámetro opcional `force`
const force = process.argv.includes('force');

// Extrae todos los `targetPage` únicos, ignorando "index"
const uniquePages = new Set();

for (const [key, val] of Object.entries(data)) {
  if (val.isPage) {
    uniquePages.add(key);
  }
}

// Ejecuta el script principal para cada página
for (const page of uniquePages) {
  const args = ['generateGroupPage.js', page];
  if (force) args.push('force');

  const result = spawnSync('node', args, {
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });

  if (result.error) {
    console.error(`❌ Error generando ${page}:`, result.error);
  }
}
