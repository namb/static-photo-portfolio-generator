import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { data } from '../data/data.js';
import { siteConfig } from '../data/siteConfig.js';
import { generateSocialLinks } from './templateUtils.js';
import { hashObject } from './templateUtils.js';
import { loadTemplates } from './templateUtils.js';
import { injectContent } from './templateUtils.js';
import { getBreadcrumb } from './templateUtils.js';
import { ensureGitignoreHas } from './templateUtils.js';
import { generateCopyright } from './templateUtils.js';
import { generateMenu } from './templateUtils.js';
import { generateFriendsLinks } from './templateUtils.js';

// Recogemos force
const force = process.argv.includes('force');

// Resolver __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** TEMPLATES **/
const templates = loadTemplates(
  ['collection.html', 'partials/header.html', 'partials/menu.html', 'partials/footer.html'],
  path.join(__dirname, '../templates')
);
const mainTemplate = templates['collection.html'];
let header = templates['partials/header.html'];
let menu = templates['partials/menu.html'];
let footer = templates['partials/footer.html'];

/** Destination **/
const outputDir = path.join(__dirname, '../public/collections');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Funciones auxiliares para HTML (igual que antes)
function generateGalleryHtml(images, folder, galleryName) {
  return images.map(img => `
    <div class="masonry-item${img.wide? ' wide' : ''}">
      <a href="${folder}${img.src}" data-lightbox="${galleryName}" data-title="${img.alt || ''}">
        <img src="${folder}${img.src}" alt="${img.alt || ''}">
      </a>
    </div>
  `).join('\n');
}

function generateIconsHtml(collection) {
  function iconDiv(text, icon, iconType = 'solid', href = null) {
    if (href) {
      return `<div>
        <a class="icon flex gap-10 justify-content-center align-items-center " href="${href}" target="_blank">
          <i class="icon ${iconType} style1 color-pink ${icon} fs-10"></i>
          <p class="m-0 fs-10">${text}</p>
        </a>
      </div>`;
    } else {
      return `<div class="flex gap-10 justify-content-center align-items-center ">
        <i class="icon ${iconType} style1 color-pink ${icon} fs-10"></i>
        <p class="m-0  fs-10">${text}</p>
      </div>`;
    }
  }

  let icons = '<div class="header-icons">';
  if (collection.camera) icons += iconDiv(collection.camera, 'fa-camera-retro');
  if (collection.date) icons += iconDiv(collection.date, 'fa-calendar-alt');
  icons += '</div>';
  let icons2 = '';
  if(collection.address || collection.instagram) {
    icons2 = '<div class="header-icons mr-20">';
    if (collection.instagram) icons2 += iconDiv(collection.instagram, 'fa-instagram', 'brands', `https://www.instagram.com/${collection.instagram}`);
    if (collection.address) icons2 += iconDiv(collection.address, 'fa-map-marker');    
    icons2 += '</div>';
  }
  return '<div class="header-icons-group">'+icons2+icons+'</div>';
}

// Ruta para guardar hashes
const hashesFile = path.join(outputDir, '../../.cache/collections.json');
let savedHashes = {};
if (fs.existsSync(hashesFile)) {
  savedHashes = JSON.parse(fs.readFileSync(hashesFile, 'utf-8'));
}

// Procesar colecciones
const existingFiles = new Set(Object.keys(data));
let hashesUpdated = false;

for (const [key, collection] of Object.entries(data)) {
  if (collection.disableCollection || collection.isPage || !Array.isArray(collection.images) || collection.images.length === 0) continue;

  const currentHash = hashObject(collection);

  const outputFile = path.join(outputDir, `${key}.html`);
  const outputFileExists = fs.existsSync(outputFile);

  // Solo generar si ha cambiado o si el archivo ha sido eliminado
  if (savedHashes[key] === currentHash && outputFileExists && !force) {
    continue;
  }

  if (siteConfig.showMenu !== true) {
    // Elimina el bloque de navegación dentro del header
    header = header.replace(/<!--\s*MENU_NAV_START\s*-->[\s\S]*?<!--\s*MENU_NAV_END\s*-->/, '');
  }
  
  if (siteConfig.showTopBanner !== true) {
    // Elimina el banner en el top
    header = header.replace(/<!--\s*TOP_BANNER_START\s*-->[\s\S]*?<!--\s*TOP_BANNER_END\s*-->/, '');
  }
  if (siteConfig.showScrollToTop !== true) {
    // Elimina el botón scroll to top
    footer = footer.replace(/<!--\s*SCROLL_TOP_START\s*-->[\s\S]*?<!--\s*SCROLL_TOP_END\s*-->/, '');
  }

  if (siteConfig.showFriends !== true) {
    // Elimina el botón scroll to top
    footer = footer.replace(/<!--\s*FRIENDS_START\s*-->[\s\S]*?<!--\s*FRIENDS_END\s*-->/, '');
  }  
  if (siteConfig.ableDarkMode !== true) {
    // Deshabilita dark mode
    header = header.replace(/<!--\s*DARK_MODE_START\s*-->[\s\S]*?<!--\s*DARK_MODE_END\s*-->/, '');
  }

  let template = mainTemplate
    .replace('@@footer', footer)
    .replace('@@header', header)
    .replace('@@menu', menu);
  
  // Generar html
  const galleryHtml = generateGalleryHtml(collection.images, '../' + collection.folder, key);
  const iconsHtml = generateIconsHtml(collection);
  const descriptionHtml = collection.description ? `<p>${collection.description}</p>` : '';
  const metaDescription = collection.description || collection.subtitle || siteConfig.metaDescription || '';
  const ogImage = siteConfig.ogUrl+'images/'+key+'.jpg';

  const replacements = {
    METATITLE: `${collection.title} - ${siteConfig.metaTitle}`,
    METADESCRIPTION: metaDescription,
    FAVICON: '../' + siteConfig.favicon,
    OGTITLE: `${collection.title} - ${siteConfig.metaTitle}`,
    OGDESCRIPTION: metaDescription,
    OGIMAGE: ogImage,
    OGURL: siteConfig.ogUrl+'collections/'+key+'.html',
    LOGO: '../' + siteConfig.logo,
    HOMEURL: '../' + 'index.html',
    HOMETITLE: siteConfig.title,
    SOCIALLINKS: generateSocialLinks(siteConfig.rrss),
    TITLE: collection.title,
    DESCRIPTION: descriptionHtml,
    ICONS: iconsHtml,
    GALLERY: galleryHtml,
    BREADCRUMB: getBreadcrumb({collection, data}),
    TOP_BANNER: siteConfig.topBannerContent,
    COPYRIGHT: generateCopyright(siteConfig.footerCopyright),
    MENU: generateMenu(siteConfig.menu),
    OWN_SCRIPT_FOOTER: siteConfig.own_script,
    ANALYTICS_SCRIPT_FOOTER: siteConfig.analytics_script,    
    FRIENDS: generateFriendsLinks(siteConfig.friends)
  };

  const html = injectContent(template, replacements);

  fs.writeFileSync(path.join(outputDir, `${key}.html`), html);
  ensureGitignoreHas(__dirname, `/public/collections/${key}.html`);
  console.log(`✅ Página generada: collections/${key}.html`);

  // Guardar hash
  savedHashes[key] = currentHash;
  hashesUpdated = true;
}

// Limpiar archivos antiguos (sin colección en data.js)
fs.readdirSync(outputDir).forEach(file => {
  if (file.endsWith('.html')) {
    const name = path.basename(file, '.html');
    if (!existingFiles.has(name)) {
      fs.unlinkSync(path.join(outputDir, file));
      console.log(`🗑️  Eliminado archivo antiguo: ${file}`);
      // También borrar hash si existiera
      if (savedHashes[name]) {
        delete savedHashes[name];
        hashesUpdated = true;
      }
    }
  }
});

// Guardar hashes actualizados
if (hashesUpdated) {
  fs.writeFileSync(hashesFile, JSON.stringify(savedHashes, null, 2));
  console.log('🔄 Hashes actualizados.');
}
