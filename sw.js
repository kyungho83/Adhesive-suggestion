// BOND MATCH - Service Worker
// 앱 껍데기(HTML/아이콘/매니페스트)만 캐싱합니다.
// 구글 시트 실시간 데이터(fetch API 호출)는 캐싱하지 않고 항상 네트워크로 보냅니다.

// 앱 내용을 업데이트할 때마다(index.html 등 수정 시) 아래 버전 숫자를 반드시 올려주세요.
// 그래야 이미 홈 화면에 설치해둔 사용자들에게도 새 버전이 강제로 반영됩니다.
const CACHE_NAME = 'bond-match-v3';
const ASSET_PATHS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSET_PATHS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAppShell = ASSET_PATHS.some((p) => url.pathname.endsWith(p.replace('./', '/')));

  // 구글 시트 API(다른 origin) 요청은 그대로 네트워크로 통과시킴 (캐시 안 함)
  if (!isSameOrigin || !isAppShell) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
