# Guia de deploy — AVANT

**Última atualização:** 2026-03-31

Este guia é o ponto de entrada operacional: checklist, Vercel, variáveis e verificação pós-deploy. Para o inventário técnico (o que já existe no código vs. melhorias opcionais), use [`AUDITORIA_DEPLOY.md`](./AUDITORIA_DEPLOY.md).

---

## O que significa “deploy de qualidade” neste projeto

1. **Build de produção verde** — `npm run build` passa com as mesmas variáveis que o ambiente de produção usará (ou equivalentes).
2. **Dados e auth** — Supabase com migrações aplicadas, RLS revisado para o que for exposto ao cliente.
3. **Smoke test** — login, rota principal do aluno e uma API crítica respondendo após o deploy.
4. **Observabilidade mínima** — health check, logs no painel do host; Sentry/analytics são opcionais.

Performance (LCP, INP, CLS) depende de medir em produção (Vercel Analytics, Web Vitals, ou ferramentas similares), não só de Lighthouse local.

---

## Checklist pré-deploy

### 1. Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | Ambiente | Obrigatória |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Production (rotas/API server que usam admin) | Recomendada |
| `NEXT_PUBLIC_BASE_URL` | Production | Recomendada (metadata / Open Graph) |
| `ADMIN_EMAIL` | Production | Opcional (fallback no código) |
| `GOOGLE_API_KEY` | Production | Opcional (recursos de IA) |
| `WEBHOOK_SECRET` | Production | Se usar webhooks de cache/invalidação |
| `METRICS_SECRET` | Production | Se usar endpoint de métricas protegido |

**Não** commite segredos. `NEXT_PUBLIC_*` são expostas ao browser — apenas chaves públicas.

O projeto valida env no startup (`lib/env.ts`) e roda `validate:env` antes do build (`package.json` → script `build`).

### 2. Validação local (recomendado antes de merge na branch de produção)

```bash
npm run validate:env
npm run build
npm run test
npm run lint
```

Testes E2E (opcional antes de cada deploy, útil em releases maiores):

```bash
npm run test:e2e
```

### 3. Banco de dados (Supabase)

1. Schema base: `supabase/schema.sql` (se aplicável ao seu fluxo).
2. Migrações incrementais em `supabase/migrations/` — aplicar na ordem correta no SQL Editor ou via CLI do Supabase, conforme o seu processo.

Consulte `supabase/migrations/README.md` se existir.

### 4. Painel Supabase (produção)

- **Authentication → URL configuration:** Site URL e redirect URLs alinhados ao domínio real (Vercel preview vs. produção).
- **RLS:** políticas revisadas para tabelas usadas pelo app.

---

## Deploy na Vercel

1. Importar o repositório e escolher o framework **Next.js**.
2. **Build Command:** `npm run build` (já inclui validação de env).
3. **Install:** `npm ci` ou `npm install` (CI costuma usar `npm ci`).
4. Configurar variáveis de ambiente para **Production** e, se desejado, **Preview**.
5. Após o deploy, executar as [verificações pós-deploy](#verificações-pós-deploy).

### Domínio e HTTPS

A Vercel fornece HTTPS. Após apontar domínio customizado, atualize `NEXT_PUBLIC_BASE_URL` e as URLs no Supabase.

---

## CI/CD (GitHub Actions)

O workflow em `.github/workflows/test.yml` inclui:

1. **Job `build`** — `npm ci` + `npm run build` (mesmo fluxo da Vercel: `validate:env` + `next build`). Usa variáveis **placeholder** para Supabase, suficientes para passar `lib/env.ts` sem apontar para um projeto real.
2. **Jobs de teste** — unitários (Jest) e E2E (Playwright).

**Opcional:** se quiser que o CI use o mesmo projeto Supabase da Vercel (por exemplo para detectar falhas só em dados reais), altere o job `build` no workflow e injete `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` via [secrets do repositório](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).

---

## Verificações pós-deploy

- [ ] `GET /api/health` retorna `200` com `database: ok` (ou diagnóstico esperado).
- [ ] Página inicial e login funcionam.
- [ ] Fluxo principal do aluno (ex.: vitrine / estudar) carrega.
- [ ] Logs do deployment na Vercel sem erros de runtime óbvios.

Exemplo (substitua pela URL do projeto):

```bash
curl -sS "https://SEU-DOMINIO.vercel.app/api/health"
```

---

## Monitoramento e rollback

- **Logs:** Vercel → Deployments → deployment → Logs.
- **Health:** monitorar `/api/health` (UptimeRobot, cron, etc.) se fizer sentido.
- **Sentry / analytics:** opcionais; ver `AUDITORIA_DEPLOY.md`.

**Rollback:** Vercel → Deployments → deployment anterior estável → **Promote to Production**.

---

## Troubleshooting

| Sintoma | O que verificar |
|--------|------------------|
| Build falha na Vercel | Rodar `npm run build` localmente; logs de build na Vercel; variáveis ausentes. |
| “Missing required environment variables” | Todas as obrigatórias no painel da Vercel para o ambiente correto. |
| Erro de banco / RLS | URL e anon key; políticas RLS; tabelas existentes. |
| Cookies / login em produção | Domínio e URLs no Supabase; HTTPS. |

---

## Documentação relacionada

- [`AUDITORIA_DEPLOY.md`](./AUDITORIA_DEPLOY.md) — inventário técnico e melhorias opcionais.
- [`.env.example`](../.env.example) — lista de variáveis com comentários.

---

*Deploy contínuo: você pode publicar uma versão estável e seguir desenvolvendo; cada merge pode gerar um novo deploy quando o pipeline e a Vercel estiverem configurados.*
