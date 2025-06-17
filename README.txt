# 📸 static-photo-portfolio-generator

Generador estático de portafolios fotográficos. Crea una web ligera, rápida y completamente offline a partir de carpetas de imágenes y archivos JSON.

> ✨ Diseño adaptado a partir de la plantilla [HTML5 UP](https://html5up.net/).

![screenshot](https://www.sitiodebando.com/images/index.jpg)

---

## 🚀 Características

- Genera páginas HTML estáticas para tus colecciones de fotos.
- Index con miniaturas y ordenación (reciente, aleatorio).
- Tema claro/oscuro automático.
- Sin frameworks ni backend, ideal para Netlify o GitHub Pages.
- Flujo reproducible con un simple archivo JSON.
- Basado en Node.js – sin dependencias complejas.

---

## 🧰 Requisitos

- Node.js 18 o superior
- Git

---

## ⚙️ Instalación

```bash
git clone https://github.com/naamb/static-photo-portfolio-generator.git
cd static-photo-portfolio-generator
npm install

## 🏗️ Estructura del Proyecto

static-photo-portfolio-generator/
├── public/
│   └── images/
│       └── mi-coleccion/
├── data/
│   └── collections/
│       └── mi-coleccion.json
├── templates/
├── nodeScripts/
├── siteConfig.js
├── package.json

---

## 🔄 Flujo de uso
1. Crea una carpeta con tus imágenes en public/images/mi-coleccion/.

2. Añade los metadatos en un archivo JSON en data/collections/mi-coleccion.json.

3. Procesa las imágenes y actualiza los datos:

```bash
npm run collections:sync

También puedes renombrar automáticamente las imágenes:
```bash
npm run collections:sync:rename

4. Genera las páginas:

```bash
npm run build:site

5. Abre public/index.html para ver el resultado.

---

## 🧰 Scripts útiles


### 🖼️ Colecciones
npm run collections:sync         # Sincroniza las carpetas de imágenes con data.js
npm run collections:sync:rename  # Igual, pero renombrando carpetas si es necesario
npm run collections:generate     # Genera HTML de cada colección
npm run collections:build        # Sincroniza + genera

### 🗂️ Grupos
npm run groups:single     # Genera una página individual de grupo (requiere parámetros)
npm run groups:generate   # Genera todas las páginas de grupos
npm run groups:build      # Alias para generar todos los grupos

### 📄 Páginas estáticas e índice
npm run pages:static      # Genera páginas definidas como estáticas (por ejemplo: about.html)
npm run pages:index       # Genera el index.html desde la plantilla
npm run pages:sitemap     # Genera el sitemap.xml

### 🔧 Desarrollo
npm run css:dev          # Compila el SCSS sin minificar
npm run build:dev        # Genera sitio con estilos no minificados
npm run build:dev-force  # Fuerza la regeneración completa

### 🏗️ Producción
npm run css:build         # Compila y minifica el CSS
npm run build:site        # Genera todo menos CSS y sitemap
npm run build:site-force  # Igual que arriba, pero fuerza regeneración (ignora hashes)
npm run build             # Build completo + sitemap

---

## 🧾 Formato de metadatos (ejemplo de JSON para una colección)

{
  "title": "Valencia al atardecer",
  "subtitle": "Colores cálidos junto al mar",
  "date": "2024-09-10",
  "location": "Valencia, España",
  "camera": "Fujifilm X100V",
  "folder": "valencia",
  "images": ["001.jpg", "002.jpg", "003.jpg"]
}

---

## 🌐 Deploy recomendado
Puedes subir la carpeta public/ a servicios como:

- Netlify
- GitHub Pages
- Vercel (modo estático)

---

## 📈 Opcional: Analytics con Plausible.io
Crea una cuenta y dominio en Plausible.

Añade el script de seguimiento en templates/index.html antes de generar el sitio:
<script async defer data-domain="tu-dominio.com" src="https://plausible.io/js/script.js"></script>

---

## 📝 Licencia
MIT License © namb

---

## 🤝 Basado en diseño:
Plantilla original de HTML5 UP

Adaptada para uso sin frameworks

---

🎞️ Hecho con amor por fotógrafos que también escriben código.

---

### Configuración del sitio (/data/siteConfig.js)

metaTitle                   // <title> y Open Graph title por defecto
metaDescription             // <meta name="description"> y og:description
ogTitle                     // Título para redes sociales (Open Graph)
ogDescription               // Descripción para redes sociales (Open Graph)
ogUrl                       // URL base del sitio para og:url
ogImage                     // Imagen para compartir en redes sociales (og:image)
logo                        // Ruta al logo mostrado en la cabecera
favicon                     // Ruta al favicon
title                       // Título visible del sitio (cabecera)
showMap                     // Muestra/oculta el mapa interactivo en el index
showShuffleCollections      // Muestra opción de ordenar aleatoriamente las colecciones
showScrollToTop             // Muestra botón flotante para volver al inicio
ableDarkMode                // Activa/desactiva el modo oscuro
showTopBanner               // Muestra un banner informativo en la parte superior
topBannerContent            // HTML opcional para mostrar en el banner superior
rrss                        // Lista de redes sociales (nombre y URL)
staticPages                 // Páginas estáticas como "Sobre mí", etc.
showMenu                    // Muestra/oculta la navegación superior
menu                        // Ítems del menú (si `showMenu` está activo)
footerCopyright             // Listado enlaces en el footer
collectionDaysNew           // Días desde la creación para marcar una colección como "nueva"
collectionsDaysUpdated      // Días desde la última actualización para marcar como "actualizada"
own_script                  // Script adicional que se inyectará al final de cada página

### Configuración de una colección (data/collections/)
title                       // Título de la colección
subtitle                    // Subtítulo en la card (opcional)
description                 // Descripción en la página de colección (opcional)
address                     // Dirección o ubicación textual (opcional)
instagram                   // Usuario de Instagram (sin @)
camera                      // Información técnica (opcional)
date                        // Fecha en la que fueron tomadas las fotos
published                   // Fecha de publicación de la colección yyyy-mm-dd
updated                     // Fecha de actualización de la colección yyyy-mm-dd (opcional)
folder                      // Ruta a la carpeta de imágenes
thumbnail                   // Imagen para usar en la card. Si no se especifica se utiliza la primera de images (opcional)
images                      // Lista de imágenes de la colección
targetPage                  // Listado de páginas donde aparecerá la colección
coords                      // Coordenadas geográficas para insertar en el mapa (opcional)
disableCollection           // Si true, deshabilitar la publicación de la colección

### Configuración de una página de colecciones (data/collections)

title                       // Título de la página
coords                      // Coordenadas geográficas para insertar en el mapa (opcional)
subtitle                    // Subtítulo en la card (opcional)
published                   // Fecha de publicación yyyy-mm-dd
folder                      // Ruta a la carpeta de imágenes
thumbnail                   // Imagen para usar en la card
isPage                      // Indica si se trata de una página que agrupa colecciones
targetPage                  // Listado de páginas donde aparecerá esta página