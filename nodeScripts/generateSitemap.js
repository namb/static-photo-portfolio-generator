// generate-sitemap.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig } from '../data/siteConfig.js';
import { data } from '../data/data.js';
import { ensureGitignoreHas } from './templateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = siteConfig.ogUrl;

const pages = [''];

const staticPages = siteConfig.staticPages?.map(p => p.file) || [];

const collectionPages = Object.entries(data)
  .filter(([key, c]) => !c.disableCollection)
  .map(([key, c]) => `collections/${key}.html`);

  const urls = Object.entries(data)
  .filter(([key, c]) => !c.disableCollection)
  .map(([key, c]) => {
    const slug = `collections/${key}.html`;
    const lastmod = c.updated || c.published;
    return `  <url>
    <loc>${BASE_URL}${slug}</loc>${
        lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
    }
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);
ensureGitignoreHas(__dirname, `/public/sitemap.xml`);
console.log('✅ sitemap.xml generado en /public');

// --- Generar robots.txt ---
const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}sitemap.xml
`;

const robotsPath = path.join(__dirname, '../public/robots.txt');
fs.writeFileSync(robotsPath, robotsTxt);
ensureGitignoreHas(__dirname, '/public/robots.txt');
console.log('✅ robots.txt generado en /public');
