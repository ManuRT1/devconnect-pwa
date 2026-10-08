// public/sw.js - Service Worker con Cache API

// 1. Nombre y versión de la caché estática
const CACHE_NAME = 'devconnect-shell-v1';

// 2. Recursos locales del App Shell (si alguno falla, la instalación falla)
const LOCAL_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './images/icon-192x192.png',
    './images/icon-512x512.png'
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

                // Locales: todo o nada
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

// FASE 3: FETCH - por ahora solo monitoreamos las peticiones
self.addEventListener('fetch', event => {
    console.log('SW pidiendo:', event.request.url);
});