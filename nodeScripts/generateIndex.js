import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig } from '../data/siteConfig.js';
import { data } from '../data/data.js';
import { generateSocialLinks } from './templateUtils.js';
import { computeIndexHash } from './templateUtils.js';
import { generateAllCards } from './templateUtils.js';
import { generateMapMarkers } from './templateUtils.js';
import { loadTemplates } from './templateUtils.js';
import { injectContent } from './templateUtils.js';
import { ensureGitignoreHas } from './templateUtils.js';
import { generateCopyright } from './templateUtils.js';
import { generateMenu } from './templateUtils.js';
import { generateFriendsLinks } from './templateUtils.js';

// Recogemos force
const force = process.argv.includes('force');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** TEMPLATES **/
const templates = loadTemplates(
  ['index.html', 'partials/header.html', 'partials/menu.html', 'partials/footer.html'],
  path.join(__dirname, '../templates')
);

const mainTemplate = templates['index.html'];
let header = templates['partials/header.html'];
let menu = templates['partials/menu.html'];
let footer = templates['partials/footer.html'];

/** Destination **/
const outputPath = path.join(__dirname, '../public/index.html');
/** Cache **/
const cachePath = path.join(__dirname, '../.cache/index.hash');


function main() {
  const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, val]) => Array.isArray(val.targetPage) && val.targetPage.includes('index') && !val.disableCollection
      )
    );

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

  const ogImage = siteConfig.ogUrl+siteConfig.ogImage;
  const replacements = {
    METATITLE: siteConfig.metaTitle,
    METADESCRIPTION: siteConfig.metaDescription,
    FAVICON: siteConfig.favicon,
    OGTITLE: siteConfig.ogTitle,
    OGDESCRIPTION: siteConfig.ogDescription,
    OGIMAGE: ogImage,
    OGURL: siteConfig.ogUrl,
    LOGO: siteConfig.logo,
    HOMEURL: 'index.html',
    HOMETITLE: siteConfig.title,
    SOCIALLINKS: generateSocialLinks(siteConfig.rrss),
    CARDS: generateAllCards(filteredData, siteConfig.collectionDaysNew, siteConfig.collectionsDaysUpdated),
    MAPMARKERS: generateMapMarkers(filteredData),
    TOP_BANNER: siteConfig.topBannerContent,
    COPYRIGHT: generateCopyright(siteConfig.footerCopyright),
    MENU: generateMenu(siteConfig.menu),
    OWN_SCRIPT_FOOTER: siteConfig.own_script,
    ANALYTICS_SCRIPT_FOOTER: siteConfig.analytics_script,
    FRIENDS: generateFriendsLinks(siteConfig.friends)
  };

  if (siteConfig.showMap !== true) {
    // Elimina el bloque de mapa
    template = template.replace(/<!--\s*MAP_START\s*-->[\s\S]*?<!--\s*MAP_END\s*-->/, '');
    template = template.replace(/<!--\s*MAP_SCRIPT_START\s*-->[\s\S]*?<!--\s*MAP_SCRIPT_END\s*-->/, '');
  }

  if (siteConfig.showShuffleCollections !== true) {
    template = template.replace(/<!--\s*SHUFFLE_START\s*-->[\s\S]*?<!--\s*SHUFFLE_END\s*-->/, '');
  }

  const html = injectContent(template, replacements);

  fs.writeFileSync(outputPath, html);
  ensureGitignoreHas(__dirname, `/public/index.html`);
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, currentHash);
  console.log('✅ index.html generado correctamente.');
}

main();
