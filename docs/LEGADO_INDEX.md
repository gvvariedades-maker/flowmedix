# Índice de documentação legada — AVANT

> **⚠️ NÃO USAR EM PRODUÇÃO NOVA**
>
> Os itens desta página são **referência histórica**, relatórios de implementação ou trilhos **substituídos**. Para handcraft, qualidade vendável e onboarding, use sempre os docs **canônicos** listados em [`CLAUDE.md`](../CLAUDE.md) §Referências.
>
> **Trilho único vigente (2026-06-27):** handcraft golden-v1 por slug — ADR [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md).

**Atualizado em:** 2026-07-20
**Conversa:** restructure-plan #3

---

## Onde começar (canônico — não é legado)

| Necessidade | Documento |
|-------------|-----------|
| Onboarding geral | [`CLAUDE.md`](../CLAUDE.md) |
| Handcraft por subtópico | [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) · [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) |
| Pipeline completo | [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) |
| Qualidade L1–L6 | [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) · [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md) |
| Conteúdo golden-v1 | [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) |
| JSON / slides | [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md) · [`JSON_FORMAT_SEMANTICO.md`](JSON_FORMAT_SEMANTICO.md) |
| Progresso catálogo | [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) |
| Coordenação entre conversas | [`artifacts/restructure-plan.md`](../artifacts/restructure-plan.md) |

---

## 1. Trilhos de produção obsoletos

**Não usar:** `catalog:upgrade-premium`, builders `upgradePremium*.ts`, hybrid genérico, `ai:generate` em lote.

| Documento | Por que é legado | Usar em vez disso |
|-----------|------------------|-------------------|
| [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) § *Runbook legado builder* (Fases 2–3) | Fluxo builder/hybrid pré–handcraft | [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) |
| [`FONTE_NORMATIVA_AVANT.md`](FONTE_NORMATIVA_AVANT.md) §4 | Matriz builder/hybrid | Mesmo doc §1–3 (handcraft × guideline) |
| [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) §8 | Builders legados | Handcraft golden-v1 + `validate:goldens --strict` |
| [`GOLDEN_ROLLOUT_CATALOGO.md`](GOLDEN_ROLLOUT_CATALOGO.md) | Fase “re-handcraft builder” — **concluída** nos 24 pacotes `production_ready` | Registry + `catalog:program-status` |
| Código `lib/catalogMigration/upgradePremium*.ts` | Permanece no repo; **não estender** | Scripts `handcraft-*-g*.ts` + `catalog:apply-lote` |

---

## 2. Regras e prompts desatualizados

| Arquivo | Problema | Substituto |
|---------|----------|------------|
| [`cursorrules`](../cursorrules) (raiz) | Next 14+, rotas e stack antigas | [`CLAUDE.md`](../CLAUDE.md) + `.cursor/rules/*.mdc` |
| [`RELATORIO_PROJETO_AVANT.md`](../RELATORIO_PROJETO_AVANT.md) | Relatório arquitetural extenso (snapshot antigo) | `CLAUDE.md` + docs ADR/runbook |
| [`PROMPT_META_AUDITORIA_AVANT.md`](PROMPT_META_AUDITORIA_AVANT.md) | Snapshot **2026-07-08** (15/41 PR; Urgências/Imunização “em progresso”) | `npm run catalog:program-status` + [`artifacts/restructure-plan.md`](../artifacts/restructure-plan.md) |

> **Nota:** [`PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md`](PROMPT_PIPELINE_REFERENCIA_VIAS_IMUNIZACAO.md) tem **nome legado**, mas o conteúdo é **canônico** (Vias + Imunização + Adolescente). Não mover para esta lista.

---

## 3. Relatórios de implementação (milestones)

Documentos de “✅ implementado em data X” — úteis para arqueologia, não para runbook atual.

| Documento | Tema |
|-----------|------|
| [`IMPLEMENTACAO_COMPLETA.md`](IMPLEMENTACAO_COMPLETA.md) | Cache + métricas (milestone) |
| [`LAYOUT_MORFOLOGICO_IMPLEMENTADO.md`](LAYOUT_MORFOLOGICO_IMPLEMENTADO.md) | MorphologicalConceptMap |
| [`TEMAS_UNICOS_IMPLEMENTACAO.md`](TEMAS_UNICOS_IMPLEMENTACAO.md) | themeGenerator / hash por questão |
| [`PIPELINE_COGNITIVO_UPDATE.md`](PIPELINE_COGNITIVO_UPDATE.md) | LogicFlow auto-reveal |
| [`LOGIC_FLOW_PIPELINE.md`](LOGIC_FLOW_PIPELINE.md) | Pipeline cognitivo (animação `auto`) |
| [`PERFORMANCE_OTIMIZACOES.md`](PERFORMANCE_OTIMIZACOES.md) | Otimizações pontuais (jan/2026) |
| [`PREVIEW_MELHORADO.md`](PREVIEW_MELHORADO.md) | Preview Laboratório |
| [`MELHORIAS_FUTURAS.md`](MELHORIAS_FUTURAS.md) | Backlog proposto (não priorizado) |
| [`EDITOR_AVANCADO_COMPLETO.md`](EDITOR_AVANCADO_COMPLETO.md) | Editor visual — checklist parcial |
| [`EDITOR_VISUAL_ERROS.md`](EDITOR_VISUAL_ERROS.md) | Erros visuais — backlog |

**Performance atual:** preferir [`PLANO_PERFORMANCE_INSTANTANEO.md`](PLANO_PERFORMANCE_INSTANTANEO.md) e [`OTIMIZACOES_PERFORMANCE_QUESTOES.md`](OTIMIZACOES_PERFORMANCE_QUESTOES.md) (este último declara descrever o estado atual do código).

---

## 4. Design e UI (arquivo morto)

| Caminho | Conteúdo |
|---------|----------|
| [`docs/design-archive/cyber-clinical-v1/`](design-archive/cyber-clinical-v1/README.md) | Mockups e ícones v1 — **não** é direção visual atual |
| [`COMPARATIVO_MOCKUP_SLIDES_VS_AVANT.md`](COMPARATIVO_MOCKUP_SLIDES_VS_AVANT.md) | Análise mockup × produto |
| [`ISSUES_PARIDADE_MOCKUP_SLIDES.md`](ISSUES_PARIDADE_MOCKUP_SLIDES.md) | Issues sugeridas a partir do comparativo |

**Direção visual atual:** [`DESIGNER_FRONT_AVANT.md`](DESIGNER_FRONT_AVANT.md) (hub) · [`design-system/AVANT-VISUAL-DIRECTION-v4.md`](design-system/AVANT-VISUAL-DIRECTION-v4.md) · [`DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md`](DECISAO_VISUAL_EDITORIAL_PREMIUM_V4.md) · skill `.cursor/skills/avant-ui-visual/` · histórico: [`AVANT-VISUAL-DIRECTION-v3.md`](auditoria-visual-v2/tokens/AVANT-VISUAL-DIRECTION-v3.md) (SUPERADO)

---

## 5. Prompts pontuais / sign-offs (one-shot)

Não são runbooks recorrentes.

| Documento | Contexto |
|-----------|----------|
| [`ESTUDAR_MODAL_FASE0_SIGNOFF.md`](ESTUDAR_MODAL_FASE0_SIGNOFF.md) | Sign-off modal `/estudar` |
| [`MODAL_ROUTE_STAGING_SIGNOFF.md`](MODAL_ROUTE_STAGING_SIGNOFF.md) | Staging de rotas modais |
| [`PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md`](PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md) | Âncora PT crase (slug específico) |
| [`VITRINE_FASE3_PROMPT.md`](VITRINE_FASE3_PROMPT.md) | RPC vitrine — consultar só se trabalhar em `/api/vitrine` |

---

## 6. Formatos e comportamentos legados (conteúdo JSON)

**Não gerar em produção nova:**

| Legado | Canônico |
|--------|----------|
| Slides aninhados (`concept_map: { items }`) | Formato plano — [`JSON_FORMAT_SEMANTICO.md`](JSON_FORMAT_SEMANTICO.md) |
| `logic_flow` sem `reveal_mode` (=`auto`) | `reveal_mode: "tap"` |
| `danger_zone` sem `items[].correct` | Layout `compare` com `correct` por distrator |
| `golden_rule` só com “Gabarito letra X” | `rows` normativos; gabarito só no `logic_flow` |
| `meta.content_standard` ausente / builder | `golden-v1` + handcraft |
| Referência TecConcursos no JSON | Bloqueado por validação |

Normalização de import: `lib/reverseStudySlidesNormalize.ts`

---

## 7. APIs e docs com drift conhecido

| Documento / API | Drift | Fonte de verdade |
|-----------------|-------|------------------|
| `getFluxogramaByAssuntoCached` / `getFluxogramasCached` | **Não existem** no código | [`lib/cache.ts`](../lib/cache.ts) · `CLAUDE.md` §5 |
| [`SISTEMA_CACHE.md`](SISTEMA_CACHE.md) | Pode citar APIs antigas | `CLAUDE.md` §5 + [`CACHE_QUICK_START.md`](CACHE_QUICK_START.md) |
| [`SISTEMA_TEMPLATES.md`](SISTEMA_TEMPLATES.md) | Sistema de templates do Laboratório (pré–golden-v1) | Skills `avant-json-template` + exemplos `examples/` |
| Rotas `(auth)` / `/study` | Nunca existiram no App Router atual | `/estudar`, `/login`, `/register` |

---

## 8. Decisões L3 históricas

| Termo | Status |
|-------|--------|
| `ok_existente` (mapeamento L3) | **Obsoleto** — tratar como `molde_redesign` | Ver [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) |

---

## 9. Código legado (referência — não refatorar nesta conversa)

Permanece no repositório para compatibilidade; **não é trilho de produção**:

- `lib/catalogMigration/upgradePremium*.ts`
- `lib/catalogMigration/upgradePremiumHybrid.ts`
- `lib/catalogMigration/upgradePremiumDedicatedRouter.ts`
- Listas `*-exclude-done.json` em `data/catalog-migration/` (migrações híbridas antigas)

---

## Manutenção deste índice

Ao adicionar doc novo:

1. Se substitui um runbook → mover o antigo para a seção adequada aqui.
2. Se é milestone “implementado em…” → seção 3.
3. Atualizar [`CLAUDE.md`](../CLAUDE.md) §Referências só para docs **canônicos**.

**Próxima conversa sugerida (restructure-plan #4):**
`Mapeamento L3: Promoção à Saúde e Prevenção de Agravos`
