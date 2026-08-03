# Cloud Agent — secrets Supabase (AVANT)

O catálogo (`modulos_estudo`) só é legível com **`SUPABASE_SERVICE_ROLE_KEY`** (RLS `enrolled_only`). Anon/authenticated sem matrícula retornam 0 linhas.

## Caminhos (escolha 1)

### A — Cursor Runtime Secrets (durável)

1. Abra [Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents)
2. Adicione como **Runtime Secret**:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ozgouenqrofnvgrlgfwd.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Vercel Production ou Supabase → Settings → API → `anon` `public`)
   - `SUPABASE_SERVICE_ROLE_KEY` = (Supabase → Settings → API → `service_role` · **secret**)
   - `NEXT_PUBLIC_APP_URL` = `https://www.avant.enf.br`
3. Salve o Environment / inicie **novo** Cloud Agent (secrets não entram em VM já bootada sem refresh).

### B — Puxar da Vercel (esta VM)

```bash
# Token: https://vercel.com/account/tokens (scope do time gvvariedades-makers-projects)
VERCEL_TOKEN=... npm run cloud:pull-env
npm run cloud:env-check
```

### C — Colar no chat (rápido nesta conversa)

Envie no chat (o agente grava só em `.env.local`, gitignored):

```text
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Opcional: `VERCEL_TOKEN=...` se preferir o caminho B.

## Verificar

```bash
npm run cloud:env-check
```

Deve imprimir `OK — Noções de Anatomia count=…`.

## Depois

```text
Continuar programa: Noções de Anatomia
@artifacts/pipeline-run-state-nocoes-de-anatomia.json
```
