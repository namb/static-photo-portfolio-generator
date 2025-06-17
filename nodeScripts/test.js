import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const testFolder = 'test';
const testImage = 'test.jpg';
const testCollectionPath = path.join('public', 'images', testFolder);
const testJsonPath = path.join('data', 'collections', `${testFolder}.json`);
const generatedHtml = path.join('public', 'collections', `${testFolder}.html`);
const cacheFile = path.join('.cache', 'collections.json');

const filesToBackup = {
    index: 'public/index.html',
    data: 'data/data.js',
    indexCache: '.cache/index.hash',
    collectionsCache: '.cache/collections.json'
};

const backups = {};

function runScript(script) {
    console.log(`🛠 Ejecutando: ${script}`);
    execSync(`node ${script}`, { stdio: 'inherit' });
}

function backupFiles() {
    for (const [key, filePath] of Object.entries(filesToBackup)) {
        if (fs.existsSync(filePath)) {
            backups[key] = fs.readFileSync(filePath);
        }
    }
}

function restoreFiles() {
    for (const [key, filePath] of Object.entries(filesToBackup)) {
        if (backups[key]) {
            fs.writeFileSync(filePath, backups[key]);
            console.log(`♻️ Restaurado: ${filePath}`);
        }
    }
}

function cleanCache() {
    if (!fs.existsSync(cacheFile)) {
        console.log('No existe el archivo de cache collections.json');
        process.exit(0);
      }
      
      const dataRaw = fs.readFileSync(cacheFile, 'utf-8');
      let data;
      
      try {
        data = JSON.parse(dataRaw);
      } catch (e) {
        console.error('Error al parsear collections.json:', e.message);
        process.exit(1);
      }
      
      if (data.test) {
        delete data.test;
        fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
        console.log('Hash de la colección "test" eliminado de .cache/collections.json');
      } else {
        console.log('No se encontró la colección "test" en el cache.');
      }
}
function cleanTestFiles() {
    //cleanCache();
    fs.rmSync(testCollectionPath, { recursive: true, force: true });
    fs.rmSync(generatedHtml, { force: true });
    fs.rmSync(testJsonPath, { force: true });
    
    console.log('🧹 Archivos temporales eliminados');
}

function verifyChanged(fileKey) {
    const filePath = filesToBackup[fileKey];
    if (!fs.existsSync(filePath)) throw new Error(`❌ ${filePath} no existe`);
    const current = fs.readFileSync(filePath);
    if (current.equals(backups[fileKey])) {
        throw new Error(`❌ ${filePath} no se modificó`);
    }
}

backupFiles(); // 🔐 Backup antes de cambios

try {
    // 🧪 Preparar entorno
    fs.mkdirSync(testCollectionPath, { recursive: true });
    fs.copyFileSync(`nodeScripts/tests/${testImage}`, path.join(testCollectionPath, testImage));
    fs.writeFileSync(testJsonPath, JSON.stringify({
        title: "Test Collection",
        date: "2025-01-01",
        camera: "Test Cam",
        description: "Colección de prueba para test automático",
        disableCollection: false,
        targetPage: ['index']
    }, null, 4));

    // ▶️ Ejecutar scripts
    runScript('nodeScripts/syncAll.js');
    runScript('nodeScripts/generateCollectionPages.js');
    runScript('nodeScripts/generateIndex.js');

    // ✅ Verificar resultados
    if (!fs.existsSync(generatedHtml)) throw new Error('❌ No se generó el HTML de la colección.');
    console.log('✅ HTML de colección generado correctamente.');

    verifyChanged('index');
    verifyChanged('data');

    console.log('✅ Archivos modificados correctamente.');

} catch (err) {
    console.error(err.message);
    restoreFiles();       // 🔁 Restaurar archivos originales
    cleanTestFiles();     // 🧹 Eliminar restos
    process.exit(1);
} finally {
    restoreFiles(); 
    cleanTestFiles();     // 🧹 Siempre limpiar imágenes y HTML generados
}
