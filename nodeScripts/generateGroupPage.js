import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig } from '../data/siteConfig.js';
import { data } from '../data/data.js';
import { generateSocialLinks } from './templateUtils.js';
import { computeIndexHash } from './templateUtils.js';
import { generateAllCards } from './templateUtils.js';
import { loadTemplates } from './templateUtils.js';
import { injectContent } from './templateUtils.js';
import { getBreadcrumb } from './templateUtils.js';
import { ensureGitignoreHas } from './templateUtils.js';
import { generateCopyright } from './templateUtils.js';
import { generateMenu } from './templateUtils.js';
import { generateFriendsLinks } from './templateUtils.js';

// Recogemos force
const force = process.argv.includes('force');
// Lee el nombre de la carpeta desde los argumentos
const pageName = process.argv[2];

if (!pageName) {
  console.error("❌ Debes pasar el nombre de la colección que quieres convertir en página");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** TEMPLATES **/
const templates = loadTemplates(
  ['groupPage.html', 'partials/header.html', 'partials/menu.html', 'partials/footer.html'],
  path.join(__dirname, '../templates')
);
const mainTemplate = templates['groupPage.html'];
let header = templates['partials/header.html'];
let menu = templates['partials/menu.html'];
let footer = templates['partials/footer.html'];

/** Destination **/
const outputDir = path.join(__dirname, '../public/');

const outputPath = path.join(__dirname, '../public/'+pageName+'.html');
/** Cache **/
const cachePath = path.join(__dirname, '../.cache/'+pageName+'.hash');

function main() {
  const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, val]) => Array.isArray(val.targetPage) && val.targetPage.includes(pageName) && !val.disableCollection
      )
    );
  const collection = data[pageName];

  if (!collection) {
    console.error(`❌ La colección "${pageName}" no está definida en data.js`);
    process.exit(1);
  }
  
  const currentHash = computeIndexHash(filteredData, siteConfig);
  let cachedHash = '';

  if (fs.existsSync(cachePath)) {
    cachedHash = fs.readFileSync(cachePath, 'utf-8');
  }

  if (currentHash === cachedHash && !force) {
    return;
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

  const descriptionHtml = collection.description ? `<p>${collection.description}</p>` : '';
  const ogImage = siteConfig.ogUrl+'images/'+pageName+'.jpg';
  const metaDescription = collection.description || collection.subtitle || siteConfig.metaDescription || '';

  const replacements = {
    METATITLE: `${collection.title} - ${siteConfig.metaTitle}`,
    HOMETITLE: siteConfig.title,
    METADESCRIPTION: metaDescription,
    FAVICON: siteConfig.favicon,
    OGTITLE: `${collection.title} - ${siteConfig.metaTitle}`,
    OGDESCRIPTION: metaDescription,
    OGIMAGE: ogImage,
    OGURL: siteConfig.ogUrl+pageName+'.html',
    LOGO: siteConfig.logo,
    HOMEURL: 'index.html',
    PAGETITLE: collection.title,
    DESCRIPTION: descriptionHtml,
    SOCIALLINKS: generateSocialLinks(siteConfig.rrss),
    CARDS: generateAllCards(filteredData, siteConfig.collectionDaysNew, siteConfig.collectionsDaysUpdated),
    BREADCRUMB: getBreadcrumb({collection, data}),
    TOP_BANNER: siteConfig.topBannerContent,
    COPYRIGHT: generateCopyright(siteConfig.footerCopyright),
    MENU: generateMenu(siteConfig.menu),
    OWN_SCRIPT_FOOTER: siteConfig.own_script,
    ANALYTICS_SCRIPT_FOOTER: siteConfig.analytics_script,    
    FRIENDS: generateFriendsLinks(siteConfig.friends)
  };

  const resultHtml = injectContent(template, replacements);
  fs.writeFileSync(path.join(outputDir, `${pageName}.html`), resultHtml);
  ensureGitignoreHas(__dirname, `/public/${pageName}.html`);
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, currentHash);
  console.log('✅ '+pageName+'.html generado correctamente.');
}

main();
