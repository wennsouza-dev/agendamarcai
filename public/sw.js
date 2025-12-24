const CACHE_NAME = 'marcai-cache-v3';

// Only cache specific static assets, not dynamic content
const urlsToCache = [
    '/manifest.json'
];

self.addEventListener('install', event => {
    // Skip waiting to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(err => console.log('Cache addAll failed:', err))
    );
});

self.addEventListener('activate', event => {
    // Clean up old caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Only intercept GET requests for same-origin resources
    if (event.request.method !== 'GET') return;

    // Skip caching for development resources and API calls
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/@') ||
        url.pathname.startsWith('/node_modules') ||
        url.pathname.includes('.tsx') ||
        url.pathname.includes('.ts') ||
        url.hostname !== location.hostname) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Only cache successful responses
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // If fetch fails, try cache
                return caches.match(event.request);
            })
    );
});

// Handle Push Notifications
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Novo Agendamento! 🚀';
    const options = {
        body: data.body || 'Um cliente acaba de marcar um horário com você.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
