/**
 * Service Worker AVANT — PWA installability + cache L0 de questões (fase 11.3).
 * Escopo explícito: GET /api/estudar/questao (TTL 120 s, máx. 20 entradas).
 * Respeita Vary: Authorization — respostas por usuário/sessão.
 */

const CACHE_NAME = 'avant-estudar-questao-l0-v1';
const QUESTAO_API_PATH = '/api/estudar/questao';
const TTL_MS = 120_000;
const MAX_ENTRIES = 20;
const CACHED_AT_HEADER = 'X-Avant-Cached-At';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('avant-estudar-questao-l0-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isQuestaoApiGet(request) {
  if (request.method !== 'GET') return false;
  try {
    const url = new URL(request.url);
    return url.pathname === QUESTAO_API_PATH;
  } catch {
    return false;
  }
}

function isFresh(response) {
  const cachedAt = Number(response.headers.get(CACHED_AT_HEADER) ?? 0);
  return cachedAt > 0 && Date.now() - cachedAt < TTL_MS;
}

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;

  const entries = await Promise.all(
    keys.map(async (request) => {
      const response = await cache.match(request);
      const cachedAt = Number(response?.headers.get(CACHED_AT_HEADER) ?? 0);
      return { request, cachedAt };
    }),
  );

  entries.sort((a, b) => a.cachedAt - b.cachedAt);
  const toDelete = entries.slice(0, entries.length - MAX_ENTRIES);
  await Promise.all(toDelete.map(({ request }) => cache.delete(request)));
}

async function storeQuestaoResponse(cache, request, response) {
  if (!response.ok || response.status !== 200) return;

  const headers = new Headers(response.headers);
  headers.set('Vary', 'Authorization');
  headers.set(CACHED_AT_HEADER, String(Date.now()));

  const body = await response.clone().arrayBuffer();
  const cachedResponse = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  await cache.put(request, cachedResponse);
  await trimCache(cache);
}

async function handleQuestaoFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached && isFresh(cached)) {
    void fetch(request)
      .then((response) => storeQuestaoResponse(cache, request, response))
      .catch(() => undefined);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      await storeQuestaoResponse(cache, request, response.clone());
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  if (!isQuestaoApiGet(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(handleQuestaoFetch(event.request));
});
