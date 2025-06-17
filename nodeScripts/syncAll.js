import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesBasePath = path.join(__dirname, '..', 'public', 'images');
const collectionsBasePath = path.join(__dirname, '..', 'data', 'collections');
const dataFilePath = path.join(__dirname, '..', 'data', 'data.js');

const renameImages = process.argv.includes('--rename');

function loadDataObject() {
    const content = fs.readFileSync(dataFilePath, 'utf-8');
    const match = content.match(/export const data = (\{[\s\S]*\});?/);
    if (!match) throw new Error('No se pudo encontrar "export const data =" en data.js');
    return {
        raw: content,
        object: eval('(' + match[1] + ')')
    };
}

function saveDataObject(dataObj) {
    const newDataString = JSON.stringify(dataObj, null, 4);
    const newContent = `export const data = ${newDataString};\n`;
    fs.writeFileSync(dataFilePath, newContent, 'utf-8');
}

function getNewImages(folderName) {
    if (renameImages) {
        execSync(`node ./nodeScripts/renameImages.js ${folderName}`, { stdio: 'inherit' });
    }
    const output = execSync(`node ./nodeScripts/getImages.js ${folderName}`, { encoding: 'utf-8' });
    return JSON.parse(output);
}

function isEqualIgnoringKeys(obj1, obj2, excludeKeys = []) {
    const filtered1 = {};
    const filtered2 = {};
    for (const key in obj1) {
        if (!excludeKeys.includes(key)) filtered1[key] = obj1[key];
    }
    for (const key in obj2) {
        if (!excludeKeys.includes(key)) filtered2[key] = obj2[key];
    }
    return JSON.stringify(filtered1) === JSON.stringify(filtered2);
}

const folders = fs.readdirSync(imagesBasePath).filter(name =>
    fs.statSync(path.join(imagesBasePath, name)).isDirectory()
);

let { raw: originalContent, object: data } = loadDataObject();
let updated = false;

for (const folder of folders) {
    const jsonPath = path.join(collectionsBasePath, `${folder}.json`);
    if (!fs.existsSync(jsonPath)) {
        console.log(`📁 [${folder}] No se encontró ${folder}.json, saltando...`);
        continue;
    }

    try {
        const jsonRaw = fs.readFileSync(jsonPath, 'utf-8');
        const meta = JSON.parse(jsonRaw);

        if (meta.isPage) {
            console.log(`⚠️ [${folder}] groupPage → no se genera array de imágenes.`);
            data[folder] = {
                ...meta,
                folder: `images/${folder}/`
            };
            continue;
        }

        let originalImages = Array.isArray(meta.images) ? meta.images : [];
        const originalFilenames = new Set(originalImages.map(img => path.basename(img.src)));

        const folderImages = getNewImages(folder).filter(img => !/^thumbnail/i.test(img.src));
        const newImages = folderImages
            .filter(img => !originalFilenames.has(path.basename(img.src)))
            .map(img => ({
                src: path.basename(img.src),
                alt: ''
            }));

        if (newImages.length > 0) {
            console.log(`➕ [${folder}] Añadidas ${newImages.length} imágenes nuevas.`);
            originalImages.push(...newImages);
            meta.images = originalImages;
            fs.writeFileSync(jsonPath, JSON.stringify(meta, null, 4), 'utf-8');
        }

        const newCollection = {
            ...meta,
            folder: `images/${folder}/`,
            images: meta.images
        };

        const oldCollection = data[folder];
        if (!oldCollection || !isEqualIgnoringKeys(oldCollection, newCollection, ['images', 'folder']) ||
            JSON.stringify(oldCollection.images) !== JSON.stringify(newCollection.images)) {
            data[folder] = newCollection;
            updated = true;
            console.log(`🔄 data.js actualizado para colección: ${folder}`);
        }

    } catch (err) {
        console.error(`❌ Error procesando ${folder}:`, err.message);
    }
}

if (updated) {
    saveDataObject(data);
    console.log('\n💾 data.js guardado con éxito.');
} else {
    console.log('\n✅ Nada que actualizar.');
}
