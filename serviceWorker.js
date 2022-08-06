const CACHE_NAME = 'version-1'
const urlsToCache = [
  '/index.html',
  '/javascript/game.js',
  '/manifest.json',
  'img/source.png',
  'audio/soundtrack.mp3',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/maskable.png',
  '/favicon.ico',
]

const self = this

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')

      return cache.addAll(urlsToCache)
    })
  )
})

// Listen for requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      } else {
        return fetch(event.request).catch(() => {
          return caches.match('/index.html')
        })
      }
    })
  )
})

// Activate the SW
self.addEventListener('activate', (event) => {
  const cacheWhitelist = []
  cacheWhitelist.push(CACHE_NAME)

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        })
      )
    )
  )
})
