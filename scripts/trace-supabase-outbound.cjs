'use strict';

/**
 * Preload para `next start`: conta fetch outbound de Auth e matrícula.
 * Uso: NODE_OPTIONS=--require=./scripts/trace-supabase-outbound.cjs
 */
const fs = require('fs');

const outFile = process.env.AVANT_FETCH_TRACE_FILE;
if (!outFile || typeof globalThis.fetch !== 'function') {
  module.exports = {};
} else {
  const orig = globalThis.fetch.bind(globalThis);
  const counts = {
    authUser: 0,
    concursoMatriculas: 0,
    urls: [],
  };

  function classify(url) {
    const bare = String(url).split('?')[0];
    if (bare.includes('/auth/v1/user')) counts.authUser += 1;
    if (bare.includes('/rest/v1/concurso_matriculas') || bare.includes('concurso_matriculas')) {
      counts.concursoMatriculas += 1;
    }
    counts.urls.push(bare);
  }

  globalThis.fetch = async (input, init) => {
    try {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input && typeof input === 'object' && 'url' in input
              ? String(input.url)
              : '';
      if (url) classify(url);
    } catch {
      /* ignore */
    }
    return orig(input, init);
  };

  function flush() {
    try {
      fs.writeFileSync(
        outFile,
        JSON.stringify(
          {
            authUser: counts.authUser,
            concursoMatriculas: counts.concursoMatriculas,
            urls: counts.urls,
          },
          null,
          2,
        ),
      );
    } catch {
      /* ignore */
    }
  }

  setInterval(flush, 250).unref();
  process.on('exit', flush);
  process.on('SIGINT', () => {
    flush();
    process.exit(0);
  });

  module.exports = { flush };
}
