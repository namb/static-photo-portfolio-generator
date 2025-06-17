# 📸 Static Portfolio Generator

Este proyecto genera un portafolio web estático a partir de metadatos definidos en archivos JavaScript (`data.js` y `siteConfig.js`).

## 🏗️ Estructura del Proyecto

/data
├─ /collections
    ├─ configuración de las colecciones
├─ data.js # Colecciones de imágenes (No tocar: se genera y actualiza automáticamente)
└─ siteConfig.js # Configuración del sitio

/nodeScripts
├─ generateIndex.js
├─ generateStaticPages.js
├─ generateCollectionPages.js
├─ generateAllGroupPages.js
├─ generateGroupPage.js
├─ generateSitemap.js
├─ syncAll.js
└─ templateUtils.js

/public
└─ (salida generada automáticamente)
└─ /images # Carpetas de colecciones

/template
└─ index.html # Plantilla base
└─ collection.html # Plantilla de Colecciones
└─ page.html # Plantilla para páginas estáticas
└─ groupPage.html # Plantilla para grupos de Colecciones
└─ /partials
    └─ footer.html
    └─ header.html
    └─ menu.html
/assets
└─ sass/ # Estilos SCSS

---

## 🚀 Comandos disponibles


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

🌐 Publicación
El contenido generado en public/ está listo para ser desplegado en cualquier hosting estático (GitHub Pages, Netlify, Vercel, etc.).

📦 Requisitos
Node.js >= 16
npm
Un IDE, tipo VSC
No es imprescindible, pero una cuenta en github donde poder subir los cambios a un repositorio privado que esté conectado a Netlify facilita mucho la vida.

Instala dependencias: npm install

📝 Licencia
MIT. Usa, adapta y mejora este proyecto libremente.

🎞️ Hecho con amor por fotógrafos que también escriben código.

### Primeros pasos
1. Ejecuta **npm install** para instalar las dependencias
2. Ejecuta **npm run build:dev** para generar los html de test
3. **Abre** public/index.html en tu navegador para ver los cambios

### 🖼️ Cómo agregar tu primera colección de imágenes

1. **Crea una carpeta** dentro de public/images/ con todas las imágenes que formarán parte de la colección. Por ejemplo: public/images/valencia
2. **Copia el fichero de ejemplo** desde data/collections/example.json y pégalo en data/collections/, renombrándolo con el mismo nombre que la carpeta. Por ejemplo: valencia.json.
3. **Rellena los metadatos** en ese archivo (title, description, coords, etc.). Este archivo define el contenido de la página de la colección.
4. (Opcional) Si quieres renombrar las imágenes como valencia1.jpg, valencia2.jpg, etc., ejecuta: npm run collections:sync:rename
5. **Genera el sitio** con: npm run build:dev Esto creará o actualizará el archivo index.html y la página HTML de la colección.
6. **Abre** public/index.html en tu navegador para ver los cambios
7. Puedes crear un repositorio en github, subir el código y conectarlo con netlify para que la carpeta /public se despliegue en tu sitio.

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