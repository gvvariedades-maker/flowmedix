# Meta-auditoria AVANT — prompt operacional + fila priorizada

**Gerado em:** 2026-07-08  
**Baseline:** `npm run catalog:program-status` → [`artifacts/catalog-program-status.json`](../artifacts/catalog-program-status.json)  
**Objetivo:** coordenar auditoria profunda do AVANT em **3 trilhos** (catálogo, engenharia, operação contínua) — sem prometer “100% com uma LLM”, mas com gates determinísticos + conversas Agent por escopo.

> **Regra:** 1 subtópico = 1 conversa Agent. Meta-auditoria = **coordenação**; execução = prompts abaixo.

---

## 1. Snapshot atual (2026-07-08)

### 1.1 Catálogo (41 subtópicos)

| Métrica | Valor |
|---------|------:|
| `production_ready` (vendável) | **15 / 41** (36,6%) |
| `in_progress` | **2** (Urgências, Imunização) |
| `applied` não vendável | **0** |
| Sem pacote no registry | **24** |
| Legado builder pendente re-handcraft | **5** (3 sem pacote + 2 em progresso) |

### 1.2 Slugs (~5.180 no catálogo)

| Estado | Slugs | % aprox. |
|--------|------:|---------:|
| Vendáveis (`production_ready`) | **938** | 18,1% |
| Handcraft aplicado (em progresso) | **152** | 2,9% |
| Restante (sem handcraft golden-v1 completo) | **~4.090** | 79,0% |

### 1.3 Pacotes em progresso (prioridade imediata)

| Subtópico | Applied / Total | % | Lotes locais | Próximo passo |
|-----------|----------------:|--:|--------------|---------------|
| **Urgências e Emergências** | 93 / 340 | 27,4% | g01–g13 handcraft_complete | Continuar g14+ → apply → fechar applied → `--promote` |
| **Imunização** | 59 / 575 | 10,3% | g01–g83 (muitos lotes locais) | Reconciliar manifest vs applied; retomar apply em lotes prontos |

### 1.4 Engenharia (baseline desta sessão)

| Gate | Resultado |
|------|-----------|
| `npm test` | **265 suites, 2108 tests — PASS** |
| `npm run audit:subtopico-health --all-production-ready` | **15/15 PASS**, nenhum `blocked` |

### 1.5 Pacotes `production_ready` (health OK)

Assistência Perioperatória · CME · Saúde Mental · Saúde do Adolescente · História da Enfermagem · Processamento · Farmacodinâmica · Feridas e Queimaduras · Enfermagem do Trabalho · Doenças Bacterianas · Resp. Crônicas · Infecções Biossegurança · Segurança do Paciente · **Sinais Vitais (354)** · **Vias de Administração (208)**

---

## 2. Arquitetura da meta-auditoria

```text
┌─────────────────────────────────────────────────────────────┐
│ TRILHO A — Catálogo (L1–L6 por subtópico)                  │
│   catalog:program-status → Pipeline completo × N           │
│   Gate final: audit:subtopico-quality --promote            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ TRILHO B — Engenharia (código + infra)                     │
│   build + test + lint + e2e + Bugbot + Security Review     │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ TRILHO C — Operação contínua (pós-venda)                   │
│   audit:subtopico-health diário + triagem P0/P1            │
└─────────────────────────────────────────────────────────────┘
```

**Ordem de execução recomendada:** A (fechar Urgências + Imunização) → B (paralelo em PRs) → C (sempre ligado).

---

## 3. Fila priorizada (próximas 12 conversas)

### Prioridade P0 — retomar o que já começou

| # | Conversa | Trigger | LLM sugerida | Estimativa |
|---|----------|---------|--------------|------------|
| 1 | **Urgências g14+** | `Handcraft: Urgências e Emergências` + `g14` | Opus 4.8 thinking / GPT-5.3 Codex | ~31 lotes restantes |
| 2 | **Urgências fechar applied** | `Pipeline completo: Urgências e Emergências` + `Só qualidade` (quando 340/340) | Sonnet 5 thinking | 1 conversa |
| 3 | **Imunização reconcile + apply** | `Pipeline completo: Imunização` | Composer 2.5 Fast (scripts) + Opus (handcraft) | ~65 lotes restantes |

### Prioridade P1 — legado builder sem pacote (onda A)

| # | Subtópico | Pré-requisito | Trigger |
|---|-----------|---------------|---------|
| 4 | Processo de Enfermagem | Fase 0 export + registry | `Mapeamento L3:` → `Pipeline completo:` |
| 5 | Curativos e Manejo de Feridas | Fase 0 | idem |
| 6 | Punção Venosa e Cuidados com Cateteres | Fase 0 | idem |

### Prioridade P2 — novos pacotes (onda B, por volume)

Ordem sugerida (impacto × volume moderado):

1. Instalação e Manejo de Sondas  
2. Oxigenoterapia e Cuidados Respiratórios  
3. Coleta de Exames Laboratoriais  
4. Cálculo de Administração de Medicamentos e Infusões  
5. Cuidados na Administração de Medicamentos  
6. Noções de Anatomia / Noções de Fisiologia  

*(Demais 18 subtópicos sem pacote: ver matriz completa em `artifacts/catalog-program-status.json`.)*

---

## 4. Prompt meta-auditoria (coordenação — copiar no chat)

Use em **conversa nova** (Agent mode) para **planejar e auditar**, não para handcraft de 340 slugs de uma vez:

```text
Meta-auditoria AVANT — coordenação 2026-07-08

Anexos obrigatórios:
@docs/PROMPT_META_AUDITORIA_AVANT.md
@docs/QUALITY_LAYERS_MODEL.md
@docs/PROGRAMA_CATALOGO_41.md
@data/catalog-migration/handcraft-registry.json
@artifacts/catalog-program-status.json

Objetivo: produzir plano executável em 3 trilhos (catálogo, engenharia, contínuo).

---

TRILHO A — Catálogo
1. npm run catalog:program-status
2. Listar blockers por subtópico não production_ready
3. Para Urgências (93/340): mapear último lote applied vs handcraft_complete local (g01–g13)
4. Para Imunização (59/575): reconcile handcraft_applied vs lotes g* locais
5. Priorizar P0 → P1 → P2 conforme §3 deste doc
6. NÃO handcraft em massa nesta conversa — só fila + critérios de done

TRILHO B — Engenharia
1. npm run build && npm test && npm run lint
2. npm run test:e2e:visual-molds (se tocou slides)
3. Bugbot em diff da branch
4. Security Review em diff da branch
5. Checklist AUDITORIA_DEPLOY.md + AUDITORIA_MOBILE.md

TRILHO C — Contínuo
1. npm run audit:subtopico-health -- --all-production-ready
2. Listar pacotes blocked / P0 stale
3. Confirmar health_streak nos 15 production_ready

Entrega:
- Tabela | subtópico | status | blockers L1–L6 | próximo trigger | LLM |
- % slugs vendáveis vs total
- Riscos top 5 + mitigação
- NÃO commitar nem apply sem pedido explícito
```

---

## 5. Prompt Urgências (próxima conversa de execução)

Contexto: **93/340 applied**, lotes **g01–g13** com `handcraft_complete` local; g02–g04 iniciados nesta sessão de dev.

```text
Pipeline completo: Urgências e Emergências

Anexos:
@docs/PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@data/catalog-migration/handcraft-playbooks/urgencias-e-emergencias.json
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/avant-json-template/SKILL.md
@examples/questao-premium-urgencias-rcp.json

Estado atual (2026-07-08):
- handcraft_applied: 93 / total_slugs: 340 (27,4%)
- Lotes locais handcraft_complete: g01–g13
- Ramo piloto: urgencias_rcp_sbv (g01–g04 confirmados)
- production_status: none — NÃO promover até 340/340 applied

Modo:
1. Reconciliar: quais lotes g01–g13 já foram apply no Supabase vs só local
2. Apply pendentes (dry-run → aguardar "pode aplicar")
3. Continuar handcraft g14+ (lote_size=8) até applied=340
4. Fase 2: audit:subtopico-quality --promote

Por lote gNN:
- handcraft bespoke (scripts/handcraft-urgencias-g*.ts)
- audit:questao-readiness --strict-v2-pedagogy → [READY]
- validate:goldens --strict
- slug-alignment + numeric-factcheck + patch-pedagogical-branch

LLM: Claude Opus 4.8 thinking high (handcraft clínico RCP/protocolos)
Proibido: ai:generate, apply/commit sem pedido explícito

Começar: npm run handcraft:brief -- --subtopico="Urgências e Emergências"
```

---

## 6. Prompt Imunização (reconcile + retomada)

Contexto: **59/575 applied**, **83 lotes** locais (g01–g83) — gap grande entre lotes locais e applied no registry.

```text
Pipeline completo: Imunização

Anexos:
@docs/PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md
@docs/PIPELINE_COMPLETO_CONVERSA.md
@data/catalog-migration/handcraft-playbooks/imunizacao.json
@data/catalog-migration/handcraft-registry.json
@.cursor/skills/avant-json-template/SKILL.md

Estado atual (2026-07-08):
- handcraft_applied: 59 / total_slugs: 575 (10,3%)
- Lotes locais: g01–g83 (verificar quais handcraft_complete vs applied)
- legacy_builder: true — exige re-handcraft golden-v1 completo
- Guideline: lib/guidelines/pniCalendario.ts

Modo Fase 0 desta conversa (obrigatório antes de escalar):
1. npm run reconcile:handcraft-manifest -- --subtopico="Imunização"
2. Tabela | lote | handcraft_complete | applied_supabase | blockers |
3. Apply batch dos lotes prontos não aplicados (dry-run primeiro)
4. Retomar handcraft nos lotes incompletos
5. Só --promote quando 575/575 applied + L1–L6 PASS

LLM: Composer 2.5 Fast (reconcile/scripts) + Opus (handcraft PNI)
Modelo apply: apply:imunizacao-ready-batch (se existir e PASS preflight)
```

---

## 7. Prompt engenharia (Bugbot + Security)

Rodar **a cada PR** ou antes de deploy — **não** misturar com handcraft.

### Bugbot

```text
Full Repository Path: d:\AVANT
Diff: branch changes
Change Description: <resumo das mudanças>
Custom Instructions:
- Seguir .cursor/rules/avant-engineering.mdc
- Focar: lib/cache.ts, proxy.ts, lib/validations.ts, APIs admin, RLS patterns
- Verificar: unstable_cache sem cookies, getServerSession vs getUser no RSC
- Reportar: bugs, regressões, acoplamento, performance óbvia
```

### Security Review

```text
Full Repository Path: d:\AVANT
Diff: branch changes
Custom Instructions:
- Service role só server-side
- Zod em Route Handlers
- RLS Supabase como fonte de verdade
- Sem secrets em NEXT_PUBLIC_*
- Sanitização HTML em text_fragment
```

### Checklist local (sem LLM)

```bash
npm run validate:env
npm run build
npm test
npm run lint
npm run test:e2e:chromium          # smoke crítico
npm run test:e2e:visual-molds      # se tocou components/slides/**
```

---

## 8. Prompt operação contínua (diário / CI)

```text
Auditoria contínua AVANT — pós-venda

1. npm run audit:subtopico-health -- --all-production-ready
2. Triagem P0/P1 conforme docs/RUNBOOK_ERROR_REPORT_TRIAGE.md
3. Pacotes blocked: listar + owner + ETA repair
4. Após repair: audit:subtopico-health --recover

Não rodar audit:subtopico-quality --promote rotineiro pós production_ready.
```

Comando CI recomendado (nightly):

```bash
npm run audit:subtopico-health -- --all-production-ready
```

---

## 9. Qual LLM usar (matriz definitiva)

| Tarefa | Modelo | Por quê |
|--------|--------|---------|
| Meta-auditoria / planejamento | **Sonnet 5 thinking** ou **Gemini 3.1 Pro** | Síntese de artefatos + fila |
| Handcraft golden-v1 (Urgências, Imunização, clínica) | **Claude Opus 4.8 thinking high** ou **GPT-5.3 Codex** | Raciocínio clínico + gates L2 |
| Execução runbook (scripts, apply, reconcile) | **Composer 2.5 Fast** | Velocidade + seguir comandos |
| Review diff código | **Bugbot subagent** | Especializado |
| Review segurança | **Security Review subagent** | OWASP / Supabase / Next |
| Gates L1–L6 | **Nenhuma LLM** | Scripts determinísticos |

---

## 10. Definition of Done — “AVANT 100%”

Não existe audit único. **Done** = todos os critérios abaixo:

### Catálogo

- [ ] 41/41 subtópicos com `production_status: production_ready`
- [ ] ~5.180 slugs com `meta.content_standard: "golden-v1"`
- [ ] `handcraft_applied === total_slugs` em todos os pacotes
- [ ] Cada pacote passou `audit:subtopico-quality --promote` uma vez

### Engenharia

- [ ] CI verde: build + test + lint + e2e crítico
- [ ] Bugbot + Security Review em PRs principais
- [ ] `AUDITORIA_DEPLOY.md` checklist OK

### Operação

- [ ] `audit:subtopico-health --all-production-ready` diário
- [ ] P0 stale = 0
- [ ] Vitrine com `canSell()` (ou gate documentado)

---

## 11. Comandos de refresh deste documento

Regenerar snapshot antes de nova rodada de meta-auditoria:

```bash
npm run catalog:program-status
npm run audit:subtopico-health -- --all-production-ready --write-registry=false
```

Atualizar §1 manualmente ou pedir ao agente: *“Atualize PROMPT_META_AUDITORIA_AVANT.md com novo catalog:program-status”*.

---

## Referências

| Doc | Uso |
|-----|-----|
| [`PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md`](PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md) | Pipeline expandido flagship (Vias + Imunização + Adolescente) |
| [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) | Runbook canônico por subtópico |
| [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) | L1–L6 |
| [`CONTINUOUS_QUALITY_RUNBOOK.md`](CONTINUOUS_QUALITY_RUNBOOK.md) | Pós-venda |
| [`PROGRAMA_CATALOGO_41.md`](PROGRAMA_CATALOGO_41.md) | Programa 41 subtópicos |
| [`AUDITORIA_DEPLOY.md`](AUDITORIA_DEPLOY.md) | Infra/deploy |
| [`AUDITORIA_MOBILE.md`](AUDITORIA_MOBILE.md) | Mobile |
