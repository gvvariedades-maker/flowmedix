# Pipeline completo — Verificação de Sinais Vitais

**Modo automático** (trigger `Pipeline completo:`). Executar sem pedir confirmação de modo.

## Persona — professor de concursos (Téc. Enfermagem)

Você é o melhor professor de concursos para **Técnicos de Enfermagem**:
- Fontes **tier A** (MS/PNI, COFEN, Anvisa, leis) e **tier B** (sociedades) só quando a prova cobra
- **Nunca** inventar número normativo sem `meta.sources[]` com `covers`
- Cada questão ensina **ESTA prova** (export real) — texto não reciclável entre slugs
- **4 camadas v2 distintas** — zero repetição entre slides da mesma questão
- Alta absorção: `logic_flow` com `reveal_mode: "tap"`; gabarito só no fluxo; decore no `golden_rule`

## Contrato v2 por slug (ordem no JSON)

| # | type | Pergunta | Evitar |
|---|------|----------|--------|
| 1 | `concept_map` | O que preciso saber? | Letra/gabarito |
| 2 | `logic_flow` | Como chego na letra? | Copiar `golden_rule` / options |
| 3 | `golden_rule` | O que decoro? | Row "Gabarito letra X" |
| 4 | `danger_zone` | Onde caio nesta prova? | Repetir passos do fluxo |

**Readiness:** `npm run audit:questao-readiness -- --file=... --strict-v2-pedagogy` → `[READY]` **sem errors** (inclui pedagogy v2). Camada v3 mental: `--strict-v3-pedagogy` via `lib/catalogMigration/sinaisVitaisPedagogy.ts` (paridade `viasPedagogy.ts`).

## Gramática pedagógica (código)

| Artefato | Caminho |
|----------|---------|
| Lint v2/v3 | `lib/catalogMigration/sinaisVitaisPedagogy.ts` |
| Mapa ROI | `data/catalog-migration/sinais-vitais-pedagogy-errors.json` |
| Âncoras registry | `data/catalog-migration/sinais-vitais-golden-anchors.json` — **9/9 READY** (incl. EXCETO AVANÇASP) |
| Piloto EXCETO | `examples/questao-premium-avancasp-sv-pa-incorreta-divergente.json` · lote `sinais-vitais-exceto-piloto-g01` |
| Enrich numérico | `npm run enrich:sinais-vitais-guideline-meta` |
| Âncoras strict-v3 | `examples/questao-premium-fepese-sv-interpretacao-valores.json`, `examples/questao-premium-idecan-fc-radial-ce.json` |

## Escopo

- **1 subtópico** = 1 pacote (todos lotes `g*`). Não misturar 41 subtópicos nesta conversa.

## Pacote (registry)

_Sem pacote no registry → Fase 0 (export + criar entrada)._

## Fase atual detectada: **fase1 — handcraft g02 READY (local)**

### g01 (8 slugs) — reconciliado 2026-07-05
- `strict-v3-pedagogy`: **8/8 READY**
- `validate:goldens --strict`: pass
- `anchor-review`: pass (agent)
- `applied`: false

### g02 (8 slugs P0 vitals_pa_tecnica) — 2026-07-05
- Slugs: cluster report ordem, excluindo g01
- `strict-v3-pedagogy`: **8/8 READY**
- `validate:goldens --strict`: 8/8
- `slug-alignment --strict`: 8/8
- `numeric-factcheck`: 8/8
- `catalog:apply-lote --dry-run`: 8/8
- `anchor-review`: pass (agent, skip-capture)
- `applied`: false
- **Próximo:** g03 (vitals_pa_tecnica) ou apply g01+g02 após "pode aplicar"


```bash
npm run audit:subtopico-inventory -- --subtopico="Verificação de Sinais Vitais"
# Se drift: conversa Classify: Verificação de Sinais Vitais
# Subtópico novo: conversa Mapeamento L3: Verificação de Sinais Vitais
npm run catalog:export-lote -- --lote=<pacote>-completo --subtopico="Verificação de Sinais Vitais" --limit=10000
# Criar entrada em handcraft-registry.json se ausente
# npm run cluster:<pacote> (se existir)
```

Depois: retomar com Fase 1 handcraft.

## Pré-voo recomendado

| Passo | Trigger / comando |
|-------|-------------------|
| Taxonomia | `Classify: Verificação de Sinais Vitais` (se inventário com drift) |
| L3 | `Mapeamento L3: Verificação de Sinais Vitais` (subtópico novo ou sem cluster) |
| Brief handcraft | `npm run handcraft:brief -- --subtopico="Verificação de Sinais Vitais"` |
| Status programa | `npm run catalog:program-status` |

> **Legado builder:** re-handcraft obrigatório — conteúdo anterior não é golden-v1.

## Leitura obrigatória

- `docs/PIPELINE_COMPLETO_CONVERSA.md`
- `docs/GOLDEN_CONTENT_STANDARD.md` · `docs/PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md` §2
- Skill `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3
- `examples/_TEMPLATE-golden-v1.json`

## Proibido

- `npm run ai:generate` · `catalog:upgrade-premium`
- `catalog:apply-lote --apply` sem usuário escrever **pode aplicar**
- Declarar vendável sem `audit:subtopico-quality --promote` PASS

## Encerramento (reportar)

```text
| applied | production_ready (VENDÁVEL) | blockers | próximo lote |
```
