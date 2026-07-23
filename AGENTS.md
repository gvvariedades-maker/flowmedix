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
| Review de PR (zona amarela/vermelha) | Bugbot + Security Review | [`docs/PROMPT_META_AUDITORIA_AVANT.md`](docs/PROMPT_META_AUDITORIA_AVANT.md) §7 |

Goldens copiáveis: `examples/eng/api-route-admin.example.ts` · `rsc-page-cached.example.tsx` · `client-component-fetch.example.tsx` · `cache-fn.example.ts`.

---

## Conteúdo / catálogo (handcraft + qualidade)

| Tarefa | Trigger | Rule / doc |
|--------|---------|------------|
| Subtópico novo ou lotes até vendável | `Pipeline completo: <Subtópico canônico>` | [`.cursor/rules/pipeline-completo.mdc`](.cursor/rules/pipeline-completo.mdc) · [`docs/PIPELINE_COMPLETO_CONVERSA.md`](docs/PIPELINE_COMPLETO_CONVERSA.md) |
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

## UI / visual

| Tarefa | Trigger | Rule / skill |
|--------|---------|--------------|
| Polish vitrine / player / dashboard | `Visual:` · `Polish vitrine` · `Polish player` · `craft UI` | [`.cursor/rules/avant-ui-visual.mdc`](.cursor/rules/avant-ui-visual.mdc) · [`.cursor/skills/avant-ui-visual/SKILL.md`](.cursor/skills/avant-ui-visual/SKILL.md) |
| Design visual de NeuroSlides (molde/retenção) | `Design visual:` · `Molde visual:` | [`.cursor/skills/avant-neuroslides-visual/SKILL.md`](.cursor/skills/avant-neuroslides-visual/SKILL.md) |

Para **feature/bug de app** (comportamento + código), use `Feature:` / `Bug:` — não o trigger de handcraft. Para **só aparência** no design system existente, use `Visual:` / `Polish …`.

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

| Zona | Fecha quem |
|------|------------|
| Verde (UI DS, bug+teste, CRUD Zod) | Agente + `check:ship` |
| Amarela (API nova, player/vitrine) | Agente + humano amostra PR |
| Vermelha (`proxy.ts`, `lib/cache.ts`, RLS, Stripe, migrations) | Humano aprova antes de ship |

Detalhe: [`docs/ENG_CONVERSA.md`](docs/ENG_CONVERSA.md) · matriz em [`avant-engineering.mdc`](.cursor/rules/avant-engineering.mdc) · cópia [`docs/cursor/avant-engineering.mdc`](docs/cursor/avant-engineering.mdc).

Auditoria humana por domínio (auth / cache / RLS / Stripe / player): [`docs/ENG_AUDITORIA_POR_RISCO.md`](docs/ENG_AUDITORIA_POR_RISCO.md).

**Loop:** mesmo anti-padrão **2×** → novo gate em `scripts/check-architecture-patterns.ts` + registro no changelog de [`ENG_CONVERSA.md`](docs/ENG_CONVERSA.md) (§ Loop de melhoria contínua).
