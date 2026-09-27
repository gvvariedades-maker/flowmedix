# Staging target binding — harness EWU-SCALE-1K

Decisão **2026-09-27**: alvos versionados para pools e futura autorização de load test (ainda **sem** `LOAD_TEST_AUTHORIZATION`).

## Hosts canônicos

| Papel | Host | Git / infra |
| --- | --- | --- |
| **App staging** | `flowmedix-git-staging-gvvariedades-makers-projects.vercel.app` | Branch Git `staging` → Vercel Preview (alias estável) |
| **Supabase staging** | `higsjzfigprqvldpxfwj.supabase.co` | Projeto CAS/RC-004 (clone DR com schema AVANT) |
| **Local dev** | `127.0.0.1`, `localhost` | Pools locais / plano apenas |

**Excluído da allowlist:** `avant.enf.br`, `www.avant.enf.br`, `ozgouenqrofnvgrlgfwd.supabase.co` (Production).

Fonte versionada: [`data/scale-harness/staging-target.allowlist.json`](../data/scale-harness/staging-target.allowlist.json).

## Operações já feitas

1. `origin/staging` sincronizado com `main` (`d1fe4a28`) — deploy Vercel **READY** `dpl_J6XTemp4MA8RZ2xTsfTHyN4cvHEV` no alias acima. Antes de cada ensaio: confirmar que o alias ainda aponta para esse deployment e para o app SHA autorizado (evitar drift entre autorização e execução).
2. Vercel Preview **branch `staging`**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` apontando para `higsjz` (não ozgouen).

## Pendência manual (Owner / ops)

1. **`SUPABASE_SERVICE_ROLE_KEY`** — configurada na Vercel (Preview, branch `staging`) para o projeto `higsjzfigprqvldpxfwj` (2026-09-27; valor só na Vercel).
2. **Deployment Protection** na Vercel: o alias staging está protegido. O harness (`--execute`) lê **`VERCEL_AUTOMATION_BYPASS_SECRET`** (preferido) ou **`VERCEL_PROTECTION_BYPASS`** só em runtime/CLI e envia `x-vercel-protection-bypass` **apenas** em requests ao app Vercel (não em `supabase_url`/auth refresh). Sem secret, `--execute` contra o host `.vercel.app` canônico falha antes de HTTP.
3. **Supabase Branching** no projeto Production (`ozgouen`): plano atual retorna `402` (Pro). Até upgrade, o data plane de ensaio permanece o projeto CAS.

## Pool (gitignored)

Exemplo: [`examples/scale-harness-pool.example.json`](../examples/scale-harness-pool.example.json)

```text
base_url: https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app
supabase_url: https://higsjzfigprqvldpxfwj.supabase.co
```

Credenciais sintéticas: provisionar usuários de teste **somente** no projeto `higsjz`.

## Próximo gate

Digests canônicos (SHA-256 do blob Git no HEAD do harness com binding atual — recalcular após mudar envelope/allowlist):

| Artefato | SHA-256 |
| --- | --- |
| `data/scale-harness/staging-target.allowlist.json` | `088b5b0436d57affbee93d96009b6923df80ddb846fd2bb06a0860df9fabb93e` |
| `docs/scale-1k-workload-envelope.v1.json` | `07f7c3b34c29445b6c6b58b9bd73be646ae41123c07f3be0ff2018a846a85179` |

Futura env de escopo: `SCALE_HARNESS_AUTHORIZED_ALLOWLIST_SHA256`, `SCALE_HARNESS_AUTHORIZED_ENVELOPE_SHA256`, `APP_HOST`, `SUPABASE_HOST` alinhados ao commit autorizado.
