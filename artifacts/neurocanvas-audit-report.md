# Relatório consolidado — Auditoria NeuroCanvas (AVANT NeuroSlides)

**Gerado em:** 2026-07-26T06:59:46.751Z  
**Branch auditada:** `feat/cadernos-fase-1-wizard`  
**Commit:** `36d0cd35` (2026-07-24 14:35:36 -0300)  
**Modo:** read-only — nenhuma implementação NeuroCanvas; nenhuma alteração de comportamento do player.

---

## 1. Resumo executivo

| Indicador | Valor |
|-----------|-------|
| Questões únicas (slugs) | **5.651** |
| Slides totais | **22.604** |
| Pacote 4/4 | **100%** (5.651/5.651) |
| JSON aninhado (wrapper legado) | **0** |
| `layout_variant` explícito no JSON | **0** (0%) |
| `meta.subtopico` preenchido | **100%** |
| **Veredito** | **GO COM RESTRIÇÕES** |

### Conclusão técnica principal

O pipeline atual **já funciona como compilador determinístico retrocompatível**: `normalizeReverseStudySlide` → `enrichPresentationContext` → `resolveSlidePresentation` → `NeuroSlideHub` → variant, **sem reescrever** `reverse_study_slides`. O tipo `ResolvedSlidePresentation` é o proto–`NeuroVisualPlan`.

### Roteamento (por slide, catálogo completo)

| Camada | Slides | % |
|--------|-------:|--:|
| Bespoke com afinidade | 14.118 | **62,5%** |
| Perfil de família / rotação | 6.285 | **27,8%** |
| Genérico semântico | 2.197 | **9,7%** |
| **Roteamento não genérico** (bespoke + family) | 20.407 | **90,3%** |

> **Nota terminológica:** family + rotação **não** comprova interpretação profunda do conteúdo — apenas pool visual por `meta.family` + hash do slug. **Cobertura composicional/pedagógica inteligente: ainda não medida.**

### Risco pedagógico principal

**1.709** `golden_rule` content-only (7,6%) e **66** questões legado com `danger_zone` sem `items[].correct` + `logic_flow` sem `tap` — composição automática arriscaria spoiler ou perda de compare/tap.

### Primeiro corte recomendado

**Fase 0:** extrair `NeuroVisualPlan` (alias tipado de `ResolvedSlidePresentation`) + cache `questionHash:engineVersion`, reproduzindo **exatamente** as decisões atuais — zero diff visual.

---

## 2. Escopo e metodologia

### Fontes

| Fonte | Uso |
|-------|-----|
| `data/catalog-migration/**/questions/*.json` | Catálogo local exportado (5.651 slugs únicos) |
| `artifacts/neurocanvas-catalog-audit.json` | Estatísticas de shapes/meta |
| `artifacts/neurocanvas-resolver-audit-catalog-full.json` | Distribuição do resolver |
| `artifacts/neurocanvas-audit-report-data.json` | Cruzamentos, prontidão, concentração |
| Código: `lib/neurocanvas/*`, `components/slides/**`, `AvantLessonPlayer.tsx` | Call graph, insertion points |

### Comandos executados (validação final)

```bash
npm run audit:neurocanvas-catalog
npm run audit:resolve-slide-presentation -- --source=catalog
npm test -- --runInBand __tests__/lib/neurocanvas/audit.test.ts
npm run typecheck
npx eslint lib/neurocanvas scripts/audit-neurocanvas-catalog.ts scripts/audit-resolve-slide-presentation.ts scripts/generate-neurocanvas-audit-report-data.ts __tests__/lib/neurocanvas/audit.test.ts
git diff --check
```

### Deduplicação

- **Chave:** `modulo_slug` = nome do arquivo sem `.json`.
- **14.145** arquivos físicos → **5.651** slugs únicos.
- **8.493** arquivos ignorados como duplicata (mesmo slug em lotes/repairs/re-exports).
- **Vencedor:** **primeiro arquivo encontrado** na travessia depth-first de `data/catalog-migration` (ordem de diretório do filesystem).
- **Risco:** duplicatas podem divergir se lotes não foram reconciliados; a auditoria **não** comparou bytes entre cópias. Para análise de conteúdo crítico, preferir lotes `*-completo` ou manifest do handcraft.

### Limitações

- Catálogo local ≠ Supabase live (refresh: `npm run catalog:export-lote`).
- `family` / `pedagogical_branch` em apenas ~12% das questões — inferência domina o restante.
- Prontidão composicional (A/B/C) é heurística estrutural, não validação pedagógica humana.

---

## 3. Call graph e insertion points

### Fluxo real

```
reverse_study_slides (JSON, inalterado)
  → normalizeQuestaoSlideArrays (write/Zod) | normalizeReverseStudySlide (runtime)
  → sortReverseStudySlides (ordem v2)
  → AvantLessonPlayer (enrich meta, layers=full fetch)
  → NeuroSlide (core/NeuroSlide.tsx ~772)
       → normalizeReverseStudySlide (~803)
       → enrichPresentationContext (slidePresentation.ts ~307)
       → resolveSlidePresentation (~289)
       → getThemeForSlide (themeGenerator.ts ~841)
       → NeuroSlideHub (~104)
            → switch layoutVariant (~169–767 concept_map inline)
            → GoldenRule | LogicFlow | DangerZone | ConceptMap (routers tier-2)
       → ReverseStudyShell (~1053)
  → variant React (*.tsx em components/slides/variants/)
```

### Tabela de referência

| Etapa | Arquivo | Função | Linhas (aprox.) |
|-------|---------|--------|-----------------|
| Normalização | `lib/reverseStudySlidesNormalize.ts` | `normalizeReverseStudySlide` | 107–193 |
| Ordem v2 | `lib/reverseStudySlideOrder.ts` | `sortReverseStudySlides` | 53–60 |
| Strip gabarito | `lib/estudar/questionPayload.ts` | `stripQuestionAnswersForClient` | 61–71 |
| Player | `components/lesson/AvantLessonPlayer.tsx` | fetch `layers=full`, `<NeuroSlide>` | 593–638, 2229–2244 |
| Resolver | `components/slides/core/slidePresentation.ts` | `resolveSlidePresentation` | 289–304 |
| Branch L2.5 | `lib/slides/pedagogicalBranch.ts` | `resolvePedagogicalBranch` | 3232+ |
| Afinidade | `lib/slides/moldAffinity.ts` | `shouldApplySubtopicMold` | 2420+ |
| Slots 0/0 | `lib/slides/moldSlotFit.ts` | `bespokeMoldHasRenderableSlots` | — |
| Hub | `components/slides/core/NeuroSlide.tsx` | `NeuroSlideHub` | 104–767 |
| Shell | `components/slides/core/ReverseStudyShell.tsx` | chrome editorial | 133+ |

### Insertion points NeuroCanvas

| Abstração | Onde inserir | Notas |
|-----------|--------------|-------|
| **PedagogicalSceneGraph** | Entre `enrichPresentationContext` e `resolveCore` (`slidePresentation.ts`, linhas ~307–111) | DAG: branch + corpus + slides irmãos |
| **NeuroVisualPlan** | Saída de `resolveSlidePresentation`; entrada do Hub (~145) | Já ≈ `ResolvedSlidePresentation` |
| **VisualDNA** | Por questão, junto ao plano (hash de tema + family + branch) | Compartilhar entre 4 slides |
| **NeuroCanvasRenderer** | Substituir switch `NeuroSlideHub` + routers tier-2 | Registry `layoutVariant → component` |
| **LearnerLens** | `ReverseStudyShell` ou wrapper zoom/swipe | Só ênfase/revelação — ver §8 |
| **Telemetria/auditoria** | Pós-`resolveSlidePresentation`; log `engineVersion` | Baseline Fase 1 |

**Client/server:** player `ssr: false`; NeuroSlide `'use client'`; variants import estático (sem `dynamic()` em slides).

---

## 4. Catálogo real

### Questões e slides

| Métrica | Valor |
|---------|-------|
| Slugs únicos | 5.651 |
| Arquivos duplicados ignorados | 8.493 |
| Slides totais | 22.604 |
| ≠ 4 slides | 0 |
| Slides planos | 22.604 |
| Slides aninhados (wrapper) | 0 |

### Metadados (por questão)

| Campo | Count | % |
|-------|------:|--:|
| `subtopico` | 5.651 | 100,0% |
| `family` | 706 | 12,5% |
| `pedagogical_branch` | 690 | 12,2% |
| `golden-v1` | 650 | 11,5% |

### Shapes por slide

| Combo | Count | % |
|-------|------:|--:|
| `items` (concept_map) | 5.651 | 25,0% |
| `steps` (logic_flow) | 5.651 | 25,0% |
| `items+content` (danger_zone) | 5.651 | 25,0% |
| `rows+content` (golden_rule) | 3.942 | 17,4% |
| `content` only (golden_rule) | 1.709 | 7,6% |

### Slots (percentis)

| Slot | Slides com slot | Mediana | p90 | Máx |
|------|----------------:|--------:|----:|----:|
| items | 11.302 | **4** | **6** | 9 |
| steps | 5.651 | **9** | 9 | 13 |
| rows | 3.942 | **4** | 5 | 11 |

### Campos explícitos de apresentação

| Campo | Slides |
|-------|-------:|
| `layout_variant` | 0 |
| `template` | 10 |
| `theme_id` | 0 |

### Danger / logic_flow

| Métrica | Valor |
|---------|-------|
| danger_zone com `items[].correct` | **5.585** |
| danger_zone sem `correct` | **66** |
| logic_flow com `reveal_mode: tap` | **5.585** |
| logic_flow auto/omitido | **66** |

**Correlação danger ↔ logic_flow:** interseção **66/66** slugs (100% coincidentes). Detalhe: `artifacts/neurocanvas-audit-exceptions-66.json` e `artifacts/neurocanvas-audit-exceptions-66.md`.

---

## 5. Resolver atual

### Por slide (catálogo completo)

| Decisão | Count | % |
|---------|------:|--:|
| bespoke_affinity | 14.118 | 62,5% |
| family_rotation | 6.285 | 27,8% |
| generic_semantic | 2.197 | 9,7% |
| bespoke_zero_slots (rótulo auditoria) | 4 | ~0,02% |
| mold_fallback (flag runtime) | 0 | 0% |
| explicit_json | 0 | 0% |
| Variantes sem rota nos routers | 0 | — |

### Reconciliação: `bespoke_zero_slots` (4) vs `mold_fallback` (0)

| Conceito | O que mede |
|----------|------------|
| `mold_fallback` | Flag em `resolveSlidePresentation` quando o **primeiro** resolve escolhe um `layoutVariant` **bespoke** e `bespokeMoldHasRenderableSlots` falha → segunda passagem com `forceGenericMold: true`. |
| `bespoke_zero_slots` (auditoria) | Rótulo quando o **mapa de design** aponta molde bespoke (`subtopic_design_variant`) mas o conteúdo não preenche slots — **mesmo que o resolver nunca tenha selecionado esse bespoke**. |

**Os 4 casos:** `concept_map` de Saúde do Adolescente com ramo `adolescent-growth-z-rail` ou `adolescent-privacy-curtain`, mas corpus sem sinais Z/sigilo → `shouldApplySubtopicMold` / afinidade **rejeitam** o bespoke **antes** da seleção. O resolver retorna `bridge` ou `grid` (genérico) com `mold_fallback: false`.

| slug | branch | design variant | layout resolvido |
|------|--------|----------------|------------------|
| amauc-…-adolescente-…-5 | adolescente_antropometria | adolescent-growth-z-rail | bridge |
| cogeps-…-adolescente-…-7 | adolescente_etica_sigilo | adolescent-privacy-curtain | bridge |
| fau-…-adolescente-…-3 | adolescente_antropometria | adolescent-growth-z-rail | grid |
| idecan-…-adolescente-…-8 | adolescente_antropometria | adolescent-growth-z-rail | grid |

**Conclusão:** não há contradição — os 4 foram **desviados na camada de afinidade**, não reclassificados após `mold_fallback`.

### Por slide.type × decisão

| type | bespoke | family | generic | bespoke_zero_slots |
|------|--------:|-------:|--------:|-------------------:|
| concept_map | 3.717 | 1.074 | 856 | 4 |
| logic_flow | 3.569 | 2.082 | 0 | 0 |
| golden_rule | 3.480 | 830 | 1.341 | 0 |
| danger_zone | 3.352 | 2.299 | 0 | 0 |

### Por questão (perfil dos 4 slides)

| Perfil | Questões |
|--------|--------:|
| Quatro slides bespoke | 3.201 |
| Misto bespoke + family (sem genérico) | 277 |
| Misto family + genérico | 1.669 |
| Algum slide genérico | 1.670 |
| Quatro slides genéricos | 0 |

### Concentração de `layout_variant`

| Métrica | Valor |
|---------|-------|
| Variantes únicas observadas | **273** |
| Top 5 acumulado | **28,5%** |
| Top 10 acumulado | **41,9%** |
| Top 20 acumulado | **59,2%** |
| Variantes raras (≤5 usos) | **62** |

**Top 10:** compare (9,9%), reference_table (5,9%), cards (5,7%), morphological (3,9%), sae-decision-tap (3,1%), sae-reference-board (3,1%), norm-reveal (3,1%), sae-responsibility-matrix (2,7%), vertical (2,6%), molecular (2,0%).

**Variantes sem rota:** 0 (checagem em `NeuroSlide.tsx` + `ConceptMap`/`GoldenRule`/`LogicFlow`/`DangerZone`).

**Variantes resolvidas mas raras:** 62 variantes com ≤5 ocorrências — distintas de “sem rota”; têm componente mas baixa densidade no catálogo.

---

## 6. Prontidão para NeuroCanvas

Classificação estrutural (heurística A/B/C) — **não** inferir prontidão só pelo roteamento.

| Classe | Critério | Slides | % |
|--------|----------|-------:|--:|
| **A** — forte | rows, correct pairs, items estruturados, steps segmentados + tap | 20.387 | 90,2% |
| **B** — parcial | slots presentes, relações ambíguas | 459 | 2,0% |
| **C** — fraca | content-only, texto longo | 1.758 | 7,8% |

### Por tipo

| type | A | B | C |
|------|--:|--:|--:|
| concept_map | 5.501 | 129 | 21 |
| logic_flow | 5.557 | 66 | 28 |
| golden_rule | 3.942 | 0 | **1.709** |
| danger_zone | 5.387 | 264 | 0 |

### Focos de risco

- **2.197 slides genéricos semânticos** — candidatos Fase 2, após validação por tipo.
- **1.709 golden_rule content-only** — prontidão C; macros precisam de NLP/heurística ou permanecem banner/center.
- **Family rotation** — visualmente pode parecer genérico (`cards`, `morphological`) sem semântica extra.
- **66 questões legado** — fora do padrão compare/tap (apêndice).

---

## 7. Componentes e gramática visual

| Categoria | Quantidade |
|-----------|------------|
| Arquivos `variants/*.tsx` | **260** |
| Routers genéricos | 4 (`ConceptMap`, `GoldenRule`, `LogicFlow`, `DangerZone`) |
| Bespoke ~ConceptMap | ~72 |
| Bespoke ~GoldenRule | ~57 |
| Bespoke ~LogicFlow | ~57 |
| Bespoke ~DangerZone | ~57 |
| Extras (Syllabus, Versus, shared) | ~14 |

### Primitivas candidatas (8–15)

TapStepRail · CompareFlipCard · ReferenceTableBoard · MorphologicalGrid · DeckCarousel · OrbitRail · FunnelStack · IntruderChips · EliminationLadder · SoftStackVF · SpectrumBar · PhaseTimeline · TrapArenaShell · RevealFooter · EditorialSlideChrome

### Macros pedagógicas candidatas (8–15)

VF intervalos PNI · Calendário+mismatch · Cadeia frio · EXCETO intruso · Adolescente sigilo vs Z · RCP/XABCDE · Crase funil · Clítico/vírgula/termos PT · Dose equivalência · ITU bundle · Manchester · Sonda checklist · ADME journey · Mulher rastreamento · CME autoclave

### Permanecer bespoke

Ramos com `*_BESPOKE_BRANCHES` em `e2e/helpers/visualMoldE2e.ts` (PNI intervalos, Vias absorção, PT crase, Adolescente sigilo/Z, Urgências 13 ramos, etc.) — **soberania de afinidade alta**.

### Acoplamentos

- Import wall estático em `NeuroSlide.tsx` (~80 imports).
- `moldSlotFit` por variant (switch monolítico).
- `BRANCH_DESIGN_MAP` ~3.280 LOC.
- Framer Motion por componente.
- Resolução duplicada Hub + shell title.

### Riscos

- **Bundle:** chunk único grande; `dynamic()` por família de primitivas recomendado antes de expandir.
- **Segundo design system:** já existem Editorial (shell) + Cyber (variants) — primitivas devem usar `ThemeColors` / `slideSurface`, não tokens paralelos.

---

## 8. Contexto da tentativa e LearnerLens

Estado `estudo`: após confirmação e tela `gabarito` → “Ativar estudo reverso”.

| Sinal | Cliente em `estudo`? | Origem | Momento | Nova req.? | Risco spoiler |
|-------|------------------------|--------|---------|------------|---------------|
| selectedOption | Sim (`selecionada`) | state player | Desde pergunta | Não | Baixo |
| correctOption | Sim (`gabarito.opcaoCorretaId`) | API registrar-tentativa | Após confirmar | Não | Esperado pós-resposta |
| acertou/errou | Sim | idem | Após confirmar | Não | Esperado |
| conviction | Não na UI (`unknown`) | PassiveAttemptTracker | Freeze confirm | Não | — |
| attempt_id | Ref tracker (não no NeuroSlide) | EE Lote 7 | Confirm | Não | Baixo |
| questionVersion | Não no player | servidor ingest | POST tentativa | Já ocorreu | Não no client |
| skill_id | Não | — | — | — | — |
| misconception | Não | — | — | — | — |
| acquisition/retention/transfer | Não (reservados EE) | — | — | — | — |
| FSRS/mastery | Não no codebase | — | — | — | — |

### Política LearnerLens (futuro)

- **Não altera fatos** nem gabarito no JSON.
- **Não vaza** resposta antes do permitido.
- Adapta **ênfase, revelação, quantidade de suporte** apenas.
- Qualquer uso = **versionado + experimento** (Fase 5).

---

## 9. Performance, QA e invariantes

### Performance

| Tópico | Situação |
|--------|----------|
| Lazy `layers=full` | Slides buscados ao entrar em `estudo` (`AvantLessonPlayer.tsx`, linhas 593–638) |
| Chunks | Variants import estático — bundle client grande |
| Portal fullscreen | `EstudoReversoHost` → `createPortal(body)` após mount |
| Swipe / zoom | `EstudoReversoSlideSwipe`, `EstudoReversoSlideZoom` |
| Preview | `mode=preview` — sem strip parcial de gabarito em options |

### QA existente

| Área | Cobertura |
|------|-----------|
| Resolver unit | Forte (`slidePresentationSubtopicMold.test.ts`, ~100 casos) |
| Playwright L3 | 33 describes, viewport 375px |
| NeuroCanvas audit | `__tests__/lib/neurocanvas/audit.test.ts` |
| axe/a11y slides | **Lacuna** (axe no lockfile, sem e2e) |
| Storybook | **Ausente** — `/dev/slide-mold-review` |
| Overflow/texto longo | **Lacuna** e2e dedicada |
| reduced motion | Parcial (`useReducedMotion` em alguns variants) |

### Invariantes a preservar

Quatro slides · ordem v2 · formato plano · spoiler policy · correct único por distrator · subtopico canônico · bespoke soberano · fallback não bloqueante · preview/admin · simulado fora do fluxo canônico.

---

## 10. Veredito e roadmap

### Veredito: **GO COM RESTRIÇÕES**

| Dimensão | Avaliação |
|----------|-----------|
| Viabilidade técnica sem mudar JSON | **Alta** |
| Qualidade visual atual | **Alta** em flagship; legado residual (66+1709) |
| Segurança pedagógica | **Média** — texto nos slides pode conter gabarito |
| Cobertura de roteamento | **90,3% não genérico** (não confundir com semântica) |
| Prontidão composicional | **~90% A** estrutural; **~10%** B+C precisam regras ou bespoke |

### Roadmap

| Fase | Escopo |
|------|--------|
| **0** | NeuroVisualPlan interno, zero diff visual |
| **1** | Telemetria + fixtures de decisão |
| **2** | Primitivas nos **2.197** genéricos elegíveis, feature flag |
| **3** | VisualDNA compartilhado (4 slides), sem LearnerLens |
| **4** | Macros para padrões family repetidos |
| **5** | LearnerLens determinístico, experimento separado |
| **6** | Expansão após métricas de transferência + regressão visual |

---

## Apêndices

### A. Comandos reproduzíveis

```bash
npm run audit:neurocanvas-catalog
npm run audit:resolve-slide-presentation -- --source=catalog
npm run audit:resolve-slide-presentation -- --source=anchors
npx tsx scripts/generate-neurocanvas-audit-report-data.ts
npm test -- --runInBand __tests__/lib/neurocanvas/audit.test.ts
```

### B. Artifacts de origem

| Arquivo | Conteúdo |
|---------|----------|
| `artifacts/neurocanvas-catalog-audit.json` | Shapes, meta, slots |
| `artifacts/neurocanvas-resolver-audit-catalog-full.json` | 22.604 linhas de decisão |
| `artifacts/neurocanvas-audit-report-data.json` | Cruzamentos, prontidão |
| `artifacts/neurocanvas-audit-exceptions-66.json` | 66 slugs exceção |

### C. Blockers

1. Import wall sem registry/dynamic  
2. `moldSlotFit` acoplado por variant  
3. Sem sinais pedagógicos ricos no player para Lens  
4. 1.709 + 66 slides fora do padrão premium estrutural  
5. Duplicatas de lote não reconciliadas byte-a-byte  

### D. Perguntas abertas

1. NeuroCanvas substitui variants ou só compõe genéricos?  
2. VisualDNA por questão, slide ou ramo?  
3. LearnerLens pode reordenar steps?  
4. Quem faz bump de `engineVersion`?  
5. Bespoke vira DSL ou permanece React?  
6. Conviction UI (EE Fase 2) integra ao Lens?  

---

*Relatório gerado por auditoria read-only. Não implementa NeuroCanvas. Não altera comportamento do player.*
