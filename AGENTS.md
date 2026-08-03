# AGENTS.md — índice de tarefas (AVANT)

Uma tela: **tarefa → o que escrever no chat → rule / doc**. Onboarding longo: [`CLAUDE.md`](CLAUDE.md). Não misture famílias na mesma conversa (conteúdo ≠ engenharia ≠ polish UI).

---

## Engenharia (app / API / bug)

| Tarefa | Trigger | Rule / doc |
|--------|---------|------------|
| Feature observável no app | `Feature: <resultado>` | [`.cursor/rules/eng-feature.mdc`](.cursor/rules/eng-feature.mdc) · [`docs/ENG_CONVERSA.md`](docs/ENG_CONVERSA.md) · cópia [`docs/cursor/eng-feature.mdc`](docs/cursor/eng-feature.mdc) |
| Bug com repro | `Bug: <sintoma>` | idem |
| Route Handler / contrato HTTP | `API: <método + path>` | idem · golden [`examples/eng/`](examples/eng/) |
| Refactor sem mudar comportamento | `Refactor: <escopo>` | idem |
| Guardrails permanentes (sempre) | — | [`.cursor/rules/avant-engineering.mdc`](.cursor/rules/avant-engineering.mdc) · cópia [`docs/cursor/avant-engineering.mdc`](docs/cursor/avant-engineering.mdc) |
| Done / ship-gate | `npm run check:ship` | `validate:env` + `typecheck` + `check:architecture` + `lint` + `test` |
| Review de PR (zona amarela/vermelha) | Bugbot + Security Review | [`docs/SECURITY_ENG_AVANT.md`](docs/SECURITY_ENG_AVANT.md) · [`docs/PROMPT_META_AUDITORIA_AVANT.md`](docs/PROMPT_META_AUDITORIA_AVANT.md) §7 |

Goldens copiáveis: `examples/eng/api-route-admin.example.ts` · `rsc-page-cached.example.tsx` · `client-component-fetch.example.tsx` · `cache-fn.example.ts`.

---

## Conteúdo / catálogo (handcraft + qualidade)

| Tarefa | Trigger | Rule / doc |
|--------|---------|------------|
| Subtópico novo ou lotes até vendável | `Pipeline completo: <Subtópico canônico>` | [`.cursor/rules/pipeline-completo.mdc`](.cursor/rules/pipeline-completo.mdc) · [`docs/PIPELINE_COMPLETO_CONVERSA.md`](docs/PIPELINE_COMPLETO_CONVERSA.md) |
| Zero → nota-10 no IDE (sem SDK) | `Programa completo IDE: <Subtópico>` · `Continuar programa:` | [`.cursor/rules/programa-completo-ide.mdc`](.cursor/rules/programa-completo-ide.mdc) · [`docs/PROMPT_PROGRAMA_COMPLETO_IDE.md`](docs/PROMPT_PROGRAMA_COMPLETO_IDE.md) · DoD [`docs/PROGRAMA_COMPLETO_IDE_DOD.md`](docs/PROGRAMA_COMPLETO_IDE_DOD.md) |
| Só handcraft (parar em `applied`) | `Pipeline completo: …` + `Só handcraft` **ou** `Handcraft: <Subtópico>` | [`.cursor/rules/handcraft-golden-v1.mdc`](.cursor/rules/handcraft-golden-v1.mdc) · [`docs/HANDCRAFT_CONVERSA.md`](docs/HANDCRAFT_CONVERSA.md) |
| Uma questão (slug) | `Handcraft: <Subtópico>` + `Slug: …` | idem |
| Só qualidade (já `applied` 100%) | `Qualidade vendável: <Subtópico>` | [`.cursor/rules/quality-vendavel.mdc`](.cursor/rules/quality-vendavel.mdc) · [`docs/QUALITY_VENDAVEL_CONVERSA.md`](docs/QUALITY_VENDAVEL_CONVERSA.md) |
| Moldes antes do 1º lote | `Mapeamento L3: <Subtópico>` | [`.cursor/rules/l3-mapeamento.mdc`](.cursor/rules/l3-mapeamento.mdc) · [`docs/L3_MAPEAMENTO_CONVERSA.md`](docs/L3_MAPEAMENTO_CONVERSA.md) |
| Drift de taxonomia | `Classify:` / `Taxonomy gate:` / `Fechar taxonomia:` | [`.cursor/rules/taxonomy-classify.mdc`](.cursor/rules/taxonomy-classify.mdc) · [`docs/TAXONOMIA_CONVERSA.md`](docs/TAXONOMIA_CONVERSA.md) |
| Paridade pedagógica Adolescente | `Paridade Adolescente: <Subtópico>` | [`.cursor/rules/paridade-adolescente.mdc`](.cursor/rules/paridade-adolescente.mdc) · [`docs/PROMPT_PARIDADE_ADOLESCENTE.md`](docs/PROMPT_PARIDADE_ADOLESCENTE.md) |
| Programa completo (paridade + L3 + SDK) | `Pipeline + paridade Adolescente + L3 bespoke + orquestrador: SUBTÓPICO: …` | [`.cursor/rules/pipeline-paridade-orquestrador.mdc`](.cursor/rules/pipeline-paridade-orquestrador.mdc) · [`docs/PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md`](docs/PROMPT_PIPELINE_PARIDADE_ORQUESTRADOR.md) |
| Continuar 1 unidade (run-state) | `Continuar pipeline: <Subtópico>` + `@artifacts/pipeline-run-state-*.json` | [`.cursor/rules/pipeline-orchestrator.mdc`](.cursor/rules/pipeline-orchestrator.mdc) |
| Âncoras faltantes (pré-g01) | `Criar âncoras: <Subtópico>` | skill `avant-golden-anchor-bootstrap` |
| Progresso por pacote | — | [`data/catalog-migration/handcraft-registry.json`](data/catalog-migration/handcraft-registry.json) |

**Nunca confundir** `applied` (handcraft no DB) com `production_ready` (vendável).

---

## UI / visual / LP

**Onboarding designer:** [`docs/DESIGNER_FRONT_AVANT.md`](docs/DESIGNER_FRONT_AVANT.md) (App UI vs NeuroSlides vs Landing/LP).

| Tarefa | Trigger | Rule / skill |
|--------|---------|--------------|
| Polish vitrine / player / dashboard | `Visual:` · `Polish vitrine` · `Polish player` · `craft UI` | [`.cursor/rules/avant-ui-visual.mdc`](.cursor/rules/avant-ui-visual.mdc) · [`.cursor/skills/avant-ui-visual/SKILL.md`](.cursor/skills/avant-ui-visual/SKILL.md) |
| Design visual de NeuroSlides (molde/retenção) | `Design visual:` · `Molde visual:` | [`.cursor/skills/avant-neuroslides-visual/SKILL.md`](.cursor/skills/avant-neuroslides-visual/SKILL.md) |
| LP alto impacto (copy + design + conversão) | `LP: home` · `LP: <path>` · `LP: polish visual` | [`.cursor/rules/lp-conversa.mdc`](.cursor/rules/lp-conversa.mdc) · [`docs/LP_CONVERSA.md`](docs/LP_CONVERSA.md) · pesquisa [`docs/LP_RESEARCH_CAPABILITY_MAP.md`](docs/LP_RESEARCH_CAPABILITY_MAP.md) |

Para **feature/bug de app** (comportamento + código), use `Feature:` / `Bug:` — não o trigger de handcraft. Para **só aparência** no design system existente, use `Visual:` / `Polish …`. Para **landing/LP com CRO**, use `LP:` — não `Visual:`.

---

## Skills de conteúdo (quando o trigger já ativou handcraft)

| Uso | Skill |
|-----|-------|
| JSON / schema / slides | [`.cursor/skills/avant-json-template/SKILL.md`](.cursor/skills/avant-json-template/SKILL.md) |
| Classificar `meta.family` | [`.cursor/skills/avant-classify-family/SKILL.md`](.cursor/skills/avant-classify-family/SKILL.md) |
| Escrever slides golden-v1 | [`.cursor/skills/avant-golden-anchor-handcraft/SKILL.md`](.cursor/skills/avant-golden-anchor-handcraft/SKILL.md) |
| Brief L3 enfermagem | [`.cursor/skills/brief-enfermagem/SKILL.md`](.cursor/skills/brief-enfermagem/SKILL.md) |
| Tom professor (TE) | [`.cursor/skills/professor-para-concurso/SKILL.md`](.cursor/skills/professor-para-concurso/SKILL.md) |
| Português / método Elias | skills `professor-lingua-portuguesa-*` / `professor-elias-santana-metodo` · [`docs/LINGUA_PORTUGUESA_ELIAS_METODO.md`](docs/LINGUA_PORTUGUESA_ELIAS_METODO.md) |

---

## Comandos rápidos (engenharia)

```bash
npm run check:ship          # gate Done de Feature/Bug/API/Refactor
npm run typecheck           # tsc --noEmit
npm run check:architecture  # invariantes CLAUDE.md §10
npm run validate:env
npm run lint
npm test
npm run build               # quando tocou app/ UI crítica (além do ship)
```

---

## Zona de risco (engenharia)

**Onboarding segurança:** [`docs/SECURITY_ENG_AVANT.md`](docs/SECURITY_ENG_AVANT.md) (código/PR · ops · Além do gate). Barra: [`docs/SECURITY_SCORECARD.md`](docs/SECURITY_SCORECARD.md).

| Zona | Fecha quem |
|------|------------|
| Verde (UI DS, bug+teste, CRUD Zod) | Agente + `check:ship` |
| Amarela (API nova, player/vitrine) | Agente + humano amostra PR |
| Vermelha (`proxy.ts`, `lib/cache.ts`, RLS, Stripe, migrations) | Humano aprova antes de ship |

Detalhe: [`docs/ENG_CONVERSA.md`](docs/ENG_CONVERSA.md) · matriz em [`avant-engineering.mdc`](.cursor/rules/avant-engineering.mdc) · cópia [`docs/cursor/avant-engineering.mdc`](docs/cursor/avant-engineering.mdc).

Além do gate — por domínio (auth / cache / RLS / Stripe / player): [`docs/ENG_AUDITORIA_POR_RISCO.md`](docs/ENG_AUDITORIA_POR_RISCO.md) · IR: [`docs/SECURITY_INCIDENT_RUNBOOK.md`](docs/SECURITY_INCIDENT_RUNBOOK.md) · rituais + pentest: [`docs/SECURITY_RITUAIS.md`](docs/SECURITY_RITUAIS.md).

**Loop:** mesmo anti-padrão **2×** → novo gate em `scripts/check-architecture-patterns.ts` + registro no changelog de [`ENG_CONVERSA.md`](docs/ENG_CONVERSA.md) (§ Loop de melhoria contínua).

---

## Cursor Cloud specific instructions

Contexto durável para agentes rodando no ambiente cloud. Dependências já são instaladas no boot pelo update script (`npm install`). Comandos padrão de lint/test/build/dev estão em `package.json` e em [`CLAUDE.md`](CLAUDE.md) (§ Comandos rápidos); não duplicar aqui.

**Stack em uma linha:** Next.js 16 (App Router) + Supabase (auth + Postgres). Sem segredos de Supabase/Stripe injetados por padrão neste ambiente.

**Precisa de `.env.local` (gitignored) para `build`/`dev`.** `npm run validate:env` (roda no `build`) exige: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_WEBHOOK_SECRET` (≥16 chars), `NEXT_PUBLIC_APP_URL`. `lint`/`test` não precisam (Jest injeta defaults em `jest.setup.js`).

**Backend local (Supabase) para rodar de ponta a ponta** — a CLI `supabase` é devDependency; exige Docker (não vem pré-instalado):
- Instalar Docker, subir `dockerd` e liberar o socket (`sudo chmod 666 /var/run/docker.sock`) para usar a CLI sem `sudo`.
- **`npx supabase start` falha aplicando as migrations do zero**: as migrations assumem um schema base pré-existente (ex.: `public.concursos`, `modulos_estudo`) que **não tem CREATE TABLE commitado** (nem em `supabase/schema.sql`, que está desatualizado, nem em `migrations-legacy`). O repo é feito para conectar a um projeto Supabase já existente, não para reconstruir o DB do zero.
- Workaround para subir a stack (auth + schema `public` vazio): mover `supabase/migrations` para o lado temporariamente, `npx supabase start`, depois **restaurar a pasta** (mantém o repo limpo). Chaves locais são as demo padrão; `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`.

**CSP bloqueia auth do browser contra Supabase local.** O `connect-src` da app só permite `https://*.supabase.co`, então login/cadastro pela UI falham (`Failed to fetch`) quando apontando para `http://127.0.0.1:54321`. A auth funciona na camada de API (verificado: `POST /auth/v1/signup` → 200, usuário criado em `auth.users`). Não "consertar" editando a CSP (`next.config.js` é zona vermelha) sem pedido explícito.

**Demo do fluxo core (estudo reverso) sem catálogo semeado:** rode o dev server com `E2E_DASHBOARD_BYPASS=true`. A app serve, via código (`lib/e2e/*`), uma vitrine + questão + 4 NeuroSlides nos slugs `questao-e2e-estudar-1`/`-2` (ex.: `/estudar/questao-e2e-estudar-1`), pulando auth e DB. É o seam oficial de E2E do projeto.

**DB vazio:** algumas queries de freemium/entitlement logam warnings (ex.: "Não foi possível verificar seu plano gratuito") mas degradam sem quebrar a página.
