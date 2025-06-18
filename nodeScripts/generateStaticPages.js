import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { siteConfig } from '../data/siteConfig.js';
import { generateSocialLinks } from './templateUtils.js';
import { computePageHash } from './templateUtils.js';
import { loadTemplates } from './templateUtils.js';
import { injectContent } from './templateUtils.js';
import { ensureGitignoreHas } from './templateUtils.js';
import { generateCopyright } from './templateUtils.js';
import { generateMenu } from './templateUtils.js';
import { generateFriendsLinks } from './templateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** TEMPLATES **/
const templates = loadTemplates(
  ['page.html', 'partials/header.html', 'partials/menu.html', 'partials/footer.html'],
  path.join(__dirname, '../templates')
);
const mainTemplate = templates['page.html'];
let header = templates['partials/header.html'];
let menu = templates['partials/menu.html'];
let footer = templates['partials/footer.html'];

async function generateStaticPages() {
  if (!siteConfig.staticPages || !Array.isArray(siteConfig.staticPages)) {
    console.error('❌ siteConfig.staticPages no está definido o no es un array.');
    process.exit(1);
  }

  for (const { key, file, content, metaDescription, metaTitle } of siteConfig.staticPages) {
    if (!key || !file || !content) {
      console.warn(`⚠️ Página omitida: falta 'key', 'file' o 'content'.`);
      continue;
    }

    const outputPath = path.join(__dirname, '../public', file);
    const cachePath = path.join(__dirname, '../.cache', `${key}.hash`);
    const currentHash = computePageHash(siteConfig.staticPages, key);
    let cachedHash = '';

    if (fs.existsSync(cachePath)) {
      cachedHash = fs.readFileSync(cachePath, 'utf-8');
    }

    if (currentHash === cachedHash && !process.argv.includes('force')) {
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
  
    const template = mainTemplate
      .replace('@@footer', footer)
      .replace('@@header', header)
      .replace('@@menu', menu);

    const ogImage = siteConfig.ogUrl+siteConfig.ogImage;

    const replacements = {
      METATITLE: metaTitle+' - '+siteConfig.metaTitle,
      METADESCRIPTION: metaDescription,
      FAVICON: siteConfig.favicon,
      OGTITLE: metaTitle+' - '+siteConfig.ogTitle,
      OGDESCRIPTION: metaDescription,
      OGIMAGE: ogImage,
      OGURL: siteConfig.ogUrl+file,
      LOGO: siteConfig.logo,
      HOMEURL: 'index.html',
      HOMETITLE: siteConfig.title,
      SOCIALLINKS: generateSocialLinks(siteConfig.rrss),
      HTMLSECTION: content,
      TOP_BANNER: siteConfig.topBannerContent,
      COPYRIGHT: generateCopyright(siteConfig.footerCopyright),
      MENU: generateMenu(siteConfig.menu),
      OWN_SCRIPT_FOOTER: siteConfig.own_script,
      ANALYTICS_SCRIPT_FOOTER: siteConfig.analytics_script,
      FRIENDS: generateFriendsLinks(siteConfig.friends)
    };

    const resultHtml = injectContent(template, replacements);
    fs.writeFileSync(outputPath, resultHtml);
    ensureGitignoreHas(__dirname, `/public/${file}`);

    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, currentHash);
    console.log(`✅ ${file} generado correctamente.`);
  }
}

generateStaticPages();
