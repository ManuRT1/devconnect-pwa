// public/sw.js - Service Worker con precaché y estrategia Cache First

// 1. Nombre y versión de la caché estática
const CACHE_NAME = 'devconnect-shell-v1';

// 2. Recursos del App Shell (locales + fuentes de Font Awesome).
//    Si alguno falla, la instalación falla.
const LOCAL_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './images/icon-192x192.png',
    './images/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2'
];

// 3. Recursos externos (CDN): se guardan aparte porque no todos permiten CORS
const EXTERNAL_ASSETS = [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// FASE 1: INSTALACIÓN - guardar recursos estáticos
self.addEventListener('install', event => {
    console.log('SW: Guardando recursos estáticos en la caché...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                console.log('SW: Caché abierta con éxito:', CACHE_NAME);

                // Locales y fuentes: todo o nada
                await cache.addAll(LOCAL_ASSETS);

                // Externos: petición no-cors + cache.put (acepta respuestas opacas)
                await Promise.all(EXTERNAL_ASSETS.map(async url => {
                    try {
                        const response = await fetch(new Request(url, { mode: 'no-cors' }));
                        await cache.put(url, response);
                        console.log('SW: Recurso externo guardado ->', url);
                    } catch (err) {
                        console.warn('SW: No se pudo guardar el recurso externo ->', url, err);
                    }
                }));

                console.log('SW: Todos los archivos del App Shell fueron almacenados.');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('SW: Falló el almacenamiento en caché del App Shell:', err);
            })
    );
});

// FASE 2: ACTIVACIÓN
self.addEventListener('activate', event => {
    console.log('SW: Activado y listo.');
    event.waitUntil(self.clients.claim());
});

// FASE 3: FETCH - Estrategia Cache First (caché primero, red como respaldo)
self.addEventListener('fetch', event => {
    // Ignoramos lo que no sea GET http/https (por ejemplo, extensiones del navegador)
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request, { ignoreVary: true })
            .then(responseInCache => {
                // Si está en caché, la devolvemos sin usar la red
                if (responseInCache) {
                    console.log('SW: Sirviendo desde Caché ->', event.request.url);
                    return responseInCache;
                }

                // Si no está, la pedimos a la red
                console.log('SW: No está en caché. Buscando en Red ->', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('SW: Error en fetch y recurso no disponible en caché:', error);
            })
    );
});