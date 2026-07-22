/**
 * GOLDEN — Client Component com fetch autenticado
 *
 * Canônico: CLAUDE.md §2 (Chamada autenticada a `/api` no client)
 * Rule: .cursor/rules/eng-feature.mdc §3–§4
 * Guardrails: .cursor/rules/avant-engineering.mdc (fetchWithAuth; browser client único)
 *
 * Copie este padrão em componentes `'use client'` que chamam rotas `/api/*`.
 * NÃO importe este arquivo em runtime — é referência para o agente.
 *
 * Invariantes:
 * - `'use client'` só quando há hooks, eventos ou APIs do browser
 * - Chamadas autenticadas: `fetchWithAuth` (Bearer) — não `fetch` solto sem token
 * - Browser Supabase: único singleton em `lib/supabase/client.ts` (já usado por fetchWithAuth)
 * - Sem `createServerSupabase` / `SUPABASE_SERVICE_ROLE_KEY` no client
 * - Sem `console.log` — feedback via UI (toast/state) ou deixa o Route Handler logar no server
 */

'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

type ExampleActionProps = {
  /** Slug da questão / recurso alvo da API. */
  slug: string;
};

type ApiOk = { ok: true };
type ApiErr = { error?: string };

/**
 * Exemplo mínimo: botão que POST em uma rota `/api` autenticada.
 * Em produção, alinhar path/body ao schema Zod do Route Handler correspondente.
 */
export function ExampleAuthenticatedAction({ slug }: ExampleActionProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setMessage(null);

    try {
      const res = await fetchWithAuth('/api/registrar-tentativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Campos ilustrativos — use o schema real da rota ao copiar.
          modulo_slug: slug,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as ApiOk & ApiErr;

      if (!res.ok) {
        const fallback =
          res.status === 401
            ? 'Sessão expirada. Faça login novamente.'
            : 'Não foi possível concluir a ação.';
        setMessage(data.error?.trim() || fallback);
        return;
      }

      setMessage('Ação registrada.');
    } catch {
      setMessage('Falha de rede. Tente de novo.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          void handleClick();
        }}
        className="btn-editorial-primary px-4 py-2 text-sm disabled:opacity-50"
      >
        {pending ? 'Enviando…' : 'Registrar tentativa'}
      </button>
      {message ? (
        <p className="text-sm text-[var(--color-text-secondary)]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Anti-padrões (NÃO fazer):
 * - `fetch('/api/...')` sem Bearer quando a rota exige sessão
 * - Novo `createBrowserClient(...)` (sempre `import { supabase } from '@/lib/supabase/client'`)
 * - Importar `createServerSupabase` ou service role no client bundle
 * - Colocar lógica de admin/service role no browser — admin fica em `app/api/admin/*`
 * - `console.error` para falhas — use state/toast; log detalhado no Route Handler
 */
