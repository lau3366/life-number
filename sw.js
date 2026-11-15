const CACHE = "life-number-v6";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png", "install.html"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// network first, and skip the browser's HTTP cache (GitHub Pages allows 10 minutes of reuse),
// so a new version shows up on the next launch; fall back to the saved copy when offline
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true })));
});
