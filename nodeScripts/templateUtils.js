import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
export function generateSocialLinks(rrss) {
    return rrss
      .map((r, i) => `
      <a href="${r.url}" class="text-decoration-none" target="_blank">
        <span class="font-weight-900">${r.name}</span>
      </a>${i < rrss.length - 1 ? '<span class="">·</span>' : ''}`)
      .join('');
  }

export function generateCopyright(footerCopyright) {
  return '<ul class="copyright">'+footerCopyright
    .map((r) => `
    <li>
      ${r}
    </li>`)
    .join('')+'</ul>';
}

export function generateMenu(menu) {
  return `
  <ul>`+menu
    .map((r) => `
    <li><a href="${r.link}">
      ${r.name}
    </a></li>`)
    .join('')+'</ul>';
} 

export function computePageHash(siteConfig, contentKey) {
    const relevantData = {
      configKey: contentKey,
      configValue: siteConfig[contentKey],
    };
    const json = JSON.stringify(relevantData);
    return crypto.createHash('sha256').update(json).digest('hex');
}

export function computeIndexHash(data, config) {
  const relevantData = {
    config,
    collections: Object.fromEntries(Object.entries(data).filter(([_, c]) => !c.disableCollection))
  };
  const json = JSON.stringify(relevantData);
  return crypto.createHash('sha256').update(json).digest('hex');
}

// Función para generar hash de un objeto (JSON)
export function hashObject(obj) {
  const json = JSON.stringify(obj);
  return crypto.createHash('sha256').update(json).digest('hex');
}

function generateCardHtml(key, collection, daysNew, daysUpdated) {
  if (collection.disableCollection) return '';
  let newPill = '';
  const DAYS_NEW = daysNew * 24 * 60 * 60 * 1000;
  const DAYS_UPDATED = daysUpdated * 24 * 60 * 60 * 1000; 
  const publishedTime = new Date(collection.published || 0).getTime();
  const updatedTime = new Date(collection.updated || 0).getTime();

  const newDaysAgo = Date.now() - DAYS_NEW;
  const updatedDaysAgo = Date.now() - DAYS_UPDATED;
  if(publishedTime >= newDaysAgo){
    newPill = "<span class='pill-new'>NEW</span>";
  } else if(updatedTime >= updatedDaysAgo) {
    newPill = "<span class='pill-new'>UPDATED</span>";
  }
  let image = '';
  let imageAlt = '';
  if(collection.thumbnail){
    image = collection.folder+collection.thumbnail;
    imageAlt = collection.title;
  } else {
    image = collection.folder+collection.images[0].src;
    imageAlt = collection.images[0]?.alt || collection.title || 'Imagen';
  }
  let targetUrl = '';
  if(collection.isPage){
    targetUrl = `${key}.html`;    
  } else {
    targetUrl = path.join('collections', `${key}.html`);
  }
  return `
    <div class="card" data-published="${collection.published}">
      <span class="image">
        <img src="${image}" alt="${imageAlt}" />
      </span>
      <a href="${targetUrl}">
        ${newPill}
        <h2>${collection.title}</h2>
        <div class="content">
          <p>${collection.subtitle}</p>
        </div>
      </a>
    </div>`;
}

export function generateAllCards(data, daysNew, daysUpdated) {
  const DAYS_NEW = daysNew * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const entries = Object.entries(data);

  const sorted = entries.sort(([keyA, a], [keyB, b]) => {
    const aPublished = new Date(a.published).getTime();
    const bPublished = new Date(b.published).getTime();

    const aIsNew = aPublished >= (now - DAYS_NEW);
    const bIsNew = bPublished >= (now - DAYS_NEW);

    // Ordena primero por "nuevo", luego por fecha descendente
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;
    return bPublished - aPublished;
  });

  return sorted
    .map(([key, val]) => generateCardHtml(key, val, daysNew, daysUpdated))
    .join('\n');
}

export function generateMapMarkers(data) {
  return Object.entries(data)
    .filter(([_, val]) => val.coords)
    .map(([key, val]) => {
      const url = val.isPage? `${key}.html` : `collections/${key}.html`;
      return `L.marker([${val.coords.lat}, ${val.coords.lng}])
        .addTo(map)
        .bindPopup('<a href="${url}">${val.title}</a>');`;
    }).join('\n');
}

export function loadTemplates(templateNames, baseDir = '../templates') {
  const templates = {};
  for (const name of templateNames) {
    templates[name] = fs.readFileSync(path.join(baseDir, name), 'utf-8');
  }
  return templates;
}

export function injectContent(template, replacements) {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`<!--\\s*${key}\\s*-->`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

export function getBreadcrumb({ collection, data }) {
  const basePath = collection.isPage ? './' : '../';
  const home = `<a href="${basePath}index.html"><i class="icon solid style1 fa-home"></i></a>`;
  let group = null;

  if (collection.breadcrumbParent && collection.breadcrumbParent !== 'index') {
    group = collection.breadcrumbParent;
  } else if (Array.isArray(collection.targetPage)) {
    group = collection.targetPage.find(p => p !== 'index') || null;
  } else if (collection.targetPage && collection.targetPage !== 'index') {
    group = collection.targetPage;
  }

  const groupTitle = group && data[group]?.title
    ? data[group].title
    : group;
  
  const groupLink = group 
    ? `<a href="${basePath}${group}.html">${groupTitle}</a>` 
    : null;
  
  const parts = [home];
  if (groupLink) parts.push(groupLink);
  parts.push(`<span>${collection.title}</span>`);

  return `<nav class="breadcrumb">${parts.join(' / ')}</nav>`;
}

export function ensureGitignoreHas(dirName, pathToIgnore) {
  const gitignorePath = path.join(dirName, '../.gitignore');
  if (!fs.existsSync(gitignorePath)) return;

  const content = fs.readFileSync(gitignorePath, 'utf-8');
  if (!content.includes(pathToIgnore)) {
    fs.appendFileSync(gitignorePath, `\n${pathToIgnore}`);
    console.log(`📝 Añadido '${pathToIgnore}' a .gitignore`);
  }
}
