const CACHE = "learning-zone-v109";
const FILES = ["./", "./index.html", "./rebound-rescue.js", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./ananse-lion.png", "./assets/ui/lion-mechanic.webp", "./assets/vendor/fonts/Fredoka.woff2", "./assets/cars/red5.webp", "./assets/cars/silver5.webp", "./assets/cars/white5.webp", "./assets/cars/rally5.webp", "./assets/cars/muscle5.webp", "./assets/cars/kei5.webp", "./assets/world/sky.webp", "./assets/world/sky_dusk.webp", "./assets/world/trees.webp", "./assets/world/smoke.webp", "./assets/world/petal.webp", "./assets/world/fx.webp", "./assets/world/title.webp", "./assets/world/hero_arrow.webp", "./assets/world/hero_shogun.webp", "./assets/world/hero_rally.webp", "./assets/world/hero_kumasi.webp", "./assets/world/hero_kei.webp", "./assets/world/props.webp", "./assets/world/rail.webp", "./assets/world/road.webp", "./assets/world/speedo.webp", "./assets/world/logo.webp", "./assets/world/hero.webp", "./assets/world/card.webp", "./assets/world/flame.webp", "./assets/world/gantry.webp", "./assets/world/pits.webp", "./assets/world/stand.webp", "./assets/world/crowd.webp", "./assets/world/kerb.webp", "./assets/world/boards.webp", "./assets/world/podium.webp", "./assets/s4/apple.webp", "./assets/s4/basket.webp", "./assets/s4/bolt.webp", "./assets/s4/cherries.webp", "./assets/s4/coin.webp", "./assets/s4/cookie.webp", "./assets/s4/hand.webp", "./assets/s4/hands10.webp", "./assets/s4/n0.webp", "./assets/s4/n1.webp", "./assets/s4/n10.webp", "./assets/s4/n22.webp", "./assets/s4/n4.webp", "./assets/s4/n5.webp", "./assets/s4/sneakers.webp", "./assets/s4/star.webp", "./assets/s4/times.webp", "./assets/s4/x0.webp", "./assets/s4/x10.webp", "./assets/s4/x2.webp", "./assets/s4/x5.webp", "./assets/s4/x8.webp"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith("learning-zone-")).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* The app shell (index.html) is fetched network-first so every update shows on
   the very next open; the cache is only the offline fallback. Voice clips and
   images are immutable, so they stay cache-first. A failed request never falls
   back to index.html unless it was a page navigation. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Race a friend: live game traffic must never be answered from a cache.
  if (/\.(firebaseio\.com|firebasedatabase\.app|googleapis\.com)$/.test(url.hostname)) return;
  // The tutor address changes; never serve it from cache.
  if (/\/(tutor|focus|flashcards)\.json$/.test(url.pathname)) return;   // focus.json = school focus, always fresh
  // Videos stream straight from the network (Safari needs real 206 range replies, and the
  // 1.5 MB racer intro should never sit in the app cache). Car pictures are cached on first use.
  if (/\.(mp4|webm|m4v)$/.test(url.pathname)) return;
  const isShell = req.mode === "navigate" || /\/(index\.html)?$/.test(url.pathname) || /\.(js|webmanifest)$/.test(url.pathname) || /\/voice\/manifest\.json$/.test(url.pathname);   // the voice manifest lists new clips: never stale
  if (isShell) {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return resp;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(resp => {
    if (resp.ok) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return resp;
  })));
});
