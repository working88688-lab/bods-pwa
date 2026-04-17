const CURRENT_VERSION = 'sf73.0.59' // 当前版本号

// 安装事件，缓存所需资源
self.addEventListener('install', (event) => {
  // self.skipWaiting(); // 立即跳过等待并激活新的 Service Worker
  event.waitUntil(
    caches
      .open(CURRENT_VERSION)
      .then((cache) => {
        return cache.addAll([
          '/index.html',
          '/logo.png',
          '/start.jpg',
          `/offline.html`,
        ])
      })
      .then(() => {
        // 只有在缓存完成后再调用 skipWaiting
        self.skipWaiting()
      })
  )
})

// 激活事件，清理旧缓存并通知客户端有新版本
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CURRENT_VERSION]
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim() // 立即控制所有客户端
      })
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // 检查 URL 是否包含下载路径，并且跳过 Service Worker 的处理
  if (
    url.pathname.includes('/front/cluser/c/ios/invite/file') ||
    url.pathname.includes('/filehome/emmav')
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 仅缓存 GET 请求的响应
        if (
          event.request.method === 'GET' &&
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const clonedResponse = networkResponse.clone()
          caches.open(CURRENT_VERSION).then((cache) => {
            // 缓存响应
            cache.put(event.request, clonedResponse)
          })
        }
        return networkResponse
      })
      .catch(async () => {
        // 网络请求失败时，尝试从缓存获取资源
        const cachedResponse = await caches.match(event.request)
        // 如果缓存中有资源，则返回缓存
        if (cachedResponse) {
          return cachedResponse
        }
        // 对于 HTML 页面，返回离线页面
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
        return new Response(
          'You are offline and this resource is not cached.',
          {
            status: 404,
            statusText: 'Not Found',
          }
        )
      })
  )
})
