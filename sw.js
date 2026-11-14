// Offline support: app files are network-first (so updates arrive), falling back to cache
// when there is no signal; cover images are cache-first.
const C = "dw-shell-v2";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const put = r => { if (r.ok) { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); } return r; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request)));
  } else if (u.hostname === "covers.openlibrary.org") {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(put)));
  }
});
