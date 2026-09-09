/* Multipuls v3.2. Bump VERSION and script/style URL versions for every release. */
"use strict";
const VERSION = "v3.2";
const BASE = self.registration.scope;
const PREFIX = "multipuls:" + new URL(BASE).pathname + ":";
const CACHE = PREFIX + VERSION;
const ENTRY = new URL("./index.html", BASE).href;
const ROOT = new URL("./", BASE).href;
const ASSETS = [
  "./index.html", "./styles.css?v=3.2", "./storage.js?v=3.2", "./app.js?v=3.2",
  "./share.js?v=3.2", "./pwa.js?v=3.2", "./manifest.webmanifest?v=3.2",
  "./assets/header-x-192.png", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"
].map(path => new URL(path, BASE).href);
const STATIC_PATHS = new Set(ASSETS.filter(url => url !== ENTRY).map(url => new URL(url).pathname));

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(ASSETS.map(url => new Request(url, {cache: "reload"}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

function save(event, cache, key, response) {
  event.waitUntil(cache.put(key, response.clone()).catch(() => {}));
}
async function navigation(event) {
  const cache = await caches.open(CACHE);
  let response;
  try {
    response = await fetch(event.request, {cache: "no-store"});
    if (response.ok) { save(event, cache, ENTRY, response); return response; }
  } catch (error) { /* Use the last successful page when the network is unavailable. */ }
  return await cache.match(ENTRY) || response || new Response("Multipuls is offline. Connect once to download the app.", {
    status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}
  });
}
async function asset(event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  if (response.ok) save(event, cache, event.request, response);
  return response;
}
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== new URL(BASE).origin || !url.href.startsWith(BASE)) return;
  if (event.request.mode === "navigate") {
    if (url.pathname === new URL(ROOT).pathname || url.pathname === new URL(ENTRY).pathname) event.respondWith(navigation(event));
  } else if (STATIC_PATHS.has(url.pathname)) {
    event.respondWith(asset(event));
  }
});
