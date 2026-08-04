# Prompt — Fábrica visual G2 (+ P1 shells)

Use em **conversa nova** (Agent mode) para elevar NeuroSlides à barra G2 **por subtópico**, ou para migrar `logic_tap` → shells.

> **Objetivo de produto:** máximo de **cobertura visual** G2 com o **mínimo** de variants React novas.  
> **Não** otimizar para “criar o máximo de modelos novos”.

**Decisão / barra / inventário:**

| Doc | Papel |
|-----|--------|
| [`DECISAO_NEUROSLIDES_GERACAO_2.md`](DECISAO_NEUROSLIDES_GERACAO_2.md) | ADR — 4 `type` intactos |
| [`NEUROSLIDES_VISUAL_BAR.md`](NEUROSLIDES_VISUAL_BAR.md) | Piso + ratchet |
| [`NEUROSLIDES_GERACAO_2_ROADMAP.md`](NEUROSLIDES_GERACAO_2_ROADMAP.md) | Fases 0–4 |
| [`NEUROSLIDES_VISUAL_STRATEGY.md`](NEUROSLIDES_VISUAL_STRATEGY.md) | Camada 7 DoD Fábrica |
| [`artifacts/neuroslides-g2-primitives-inventory.md`](../artifacts/neuroslides-g2-primitives-inventory.md) | Gap variants ↔ primitives |

**Legado Onda 3:** se existir `artifacts/p0-onda3-nota10-visual-prompt.md`, este arquivo **substitui** como prompt canônico G2 (mesma Camada 7 + inventário P0 fechado).

---

## Estratégia (2 tipos de conversa)

| Tipo | Trigger | Quando | ROI |
|------|---------|--------|-----|
| **A — P1 shells** | `P1 NeuroSlides G2:` / `Wrap logic_tap:` | Antes ou durante Fábrica | Alto — poucos arquivos, muitos slides |
| **B — Fábrica** | `Fábrica visual G2: SUBTÓPICO: …` | 1 pacote `production_ready` por chat | Médio/alto |

**Ordem Fábrica canônica:**  
Mulher → Processo de Enfermagem → Curativos e Manejo de Feridas → Imunização → Vias de Administração → Punção Venosa e Cuidados com Cateteres → Assistência Perioperatória (Inclui SRPA) → Enfermagem em Central de Material e Esterilização (CME) → Saúde Mental → Enfermagem do Trabalho.

**Fluxo recomendado**

```text
1. (Opcional / alto ROI) 1–N conversas P1: wrap logic_tap → shells (lotes 5–8)
2. Depois: 1 conversa Fábrica por subtópico na ordem acima
3. Em cada Fábrica: se inventário disser só wrap/polish → NÃO abrir Implementar molde:
```

---

## Como disparar

### B — Fábrica (1 subtópico)

```text
Fábrica visual G2: SUBTÓPICO: <Subtópico canônico>
```

### A — P1 shells

```text
P1 NeuroSlides G2: envolver logic_tap em shells
```

Ou lote explícito:

```text
Wrap logic_tap: lote de 5–8 (Focus | Rail | Isolate)
```

---

## Anexos recomendados

```text
@docs/PROMPT_FABRICA_VISUAL_G2.md
@docs/NEUROSLIDES_GERACAO_2_ROADMAP.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@docs/NEUROSLIDES_VISUAL_STRATEGY.md
@docs/VARIANT_MOLDS.md
@docs/PROMPT_VARIANTES_NEUROSLIDES.md
@artifacts/neuroslides-g2-primitives-inventory.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@.cursor/skills/brief-enfermagem/SKILL.md
@data/catalog-migration/handcraft-registry.json
```

Opcional por pacote:

```text
@artifacts/l3-brief-<pacote>-*.md
@artifacts/<pacote>-nota10-report.md
@artifacts/pre-onda3-print-to-primitives-catalog.md
```

---

## Prompt completo — Fábrica (copiar no chat)

Edite **só** a linha `SUBTÓPICO:`:

```text
Fábrica visual G2: SUBTÓPICO: <Subtópico canônico CLAUDE.md §9>

Modo: Agent · 1 pacote por conversa · nota-10 visual (não handcraft em massa)

Anexos obrigatórios:
@docs/PROMPT_FABRICA_VISUAL_G2.md
@docs/NEUROSLIDES_GERACAO_2_ROADMAP.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@docs/NEUROSLIDES_VISUAL_STRATEGY.md
@docs/VARIANT_MOLDS.md
@docs/PROMPT_VARIANTES_NEUROSLIDES.md
@artifacts/neuroslides-g2-primitives-inventory.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@.cursor/skills/brief-enfermagem/SKILL.md
@data/catalog-migration/handcraft-registry.json

Opcional (se existir):
@artifacts/l3-brief-<pacote>-*.md
@artifacts/<pacote>-nota10-report.md
@artifacts/pre-onda3-print-to-primitives-catalog.md

---

OBJETIVO
Elevar o estudo reverso de <Subtópico> à barra G2 (piso = artifacts/neuroslides-g2-demo.html + ratchet).
Maximizar cobertura visual; NÃO maximizar quantidade de arquivos React novos.

INVARIANTES
- Não alterar os 4 type (concept_map / logic_flow / golden_rule / danger_zone)
- Não re-handcraft em massa só por visual; sem ai:generate; sem apply/--promote sem pedido
- Compor components/slides/primitives/ (+ shells Focus/Rail/Isolate)
- 0 hardcode de gabarito/letra/prova no TSX
- Sem clone de Instagram/carrossel; gesto = decisão da prova
- visual_bar: pass no report; cada molde só pode melhorar (ratchet)

---

FASE 0 — Inventário do pacote (antes de codar)
1. Listar ramos L3 / layout_variant / variants React deste subtópico
2. Classificar cada um:
   - já em primitives/shell → polish leve ou ok
   - logic_tap fora de shell → candidata a wrap (Focus/Rail/Isolate)
   - arena/board ad-hoc → migrar para PolarityPanel / LabelBodyRow / PillarDeck / SoftLens se couber
   - gesto NOVO ou ≥5 questões sem board → candidata a Implementar molde
3. Tabela curta: | ramo | gesto | ação (reusar|wrap|polish|bespoke) | prioridade |
4. PARAR e propor plano — só implementar depois que eu confirmar OU se eu escrevi "pode implementar"

REGRA DE OURO
- Preferir wrap em shell / primitives a criar variant
- Criar React novo só com justificativa explícita (gesto novo OU ≥5 sem board)
- Se ok_generico resolve, NÃO inventar molde

---

FASE 1 — Execução (após ok)
Ordem por ramo forte:
1. Design visual: <ramo> (checklist retenção; sem React se só calibração)
2. Se falta brief 4/4 em ramo molde_redesign|inedito → Brief TE antes
3. Se wrap: migrar tap-flow → LogicFocusShell | LogicRailShell | LogicIsolateShell
4. Se bespoke: Implementar molde: <ramo> seguindo VARIANT_MOLDS (wire registry + affinity)
5. Registrar visual_bar: pass|fail + o que subiu vs. molde anterior

FASE 2 — Evidência
- Teste unitário do molde/shell tocado (se houver padrão no repo)
- Playwright do pacote OU capture âncora (visual_gallery) quando existir script
- Atualizar artifacts/<pacote_prefix>-nota10-report.md (barra visual)
- Atualizar inventário G2 se mudou tier A/B/C

PROIBIDO
- 1 React por print / por questão
- Trocar schema Zod / types
- Commit / apply Supabase sem pedido explícito
- Polish de vitrine/dashboard (isso é Visual: / avant-ui-visual)

Começar: inventário do pacote + tabela ação (Fase 0). Não abrir Implementar molde: em massa.
```

---

## Prompt completo — P1 shells (copiar no chat)

```text
P1 NeuroSlides G2: envolver logic_tap em shells

Anexos:
@docs/PROMPT_FABRICA_VISUAL_G2.md
@artifacts/neuroslides-g2-primitives-inventory.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@components/slides/logicFlowShells/

Objetivo: migrar logic_tap fora de shell → LogicFocusShell (funil) | LogicRailShell (protocolo) | LogicIsolateShell (EXCETO).
Sem criar variant nova. Sem mudar JSON em massa.
Entregar: lista dos arquivos migrados + testes logicFlowShells (+ genericSlidesPrimitives se tocado) + inventário atualizado.
Lote sugerido: 5–8 taps por conversa (não o catálogo inteiro de uma vez).

Heurística de shell:
- EXCETO / INCORRETA / isolar gabarito → LogicIsolateShell
- Protocolo sequencial (XABCDE, ADME, NSP, RCP) → LogicRailShell
- Funil / eliminação / genérico tap → LogicFocusShell

INVARIANTES: 4 type intactos; 0 hardcode gabarito; compose primitives; visual_bar ratchet; sem commit sem pedido.
```

---

## Checklist PASS (1 pacote / chat) — Camada 7

```text
□ 1 gesto nomeado por ramo forte (ou ok_generico no brief)
□ Tradução print → primitivo (Camada 2c ou catálogo pre-onda3)
□ ≤7 slots; orçamento de clique da família
□ 0 hardcode gabarito/letra no TSX
□ Skin editorial; sem feed chrome / 3D / watermark
□ Evidência: Playwright do pacote OU captures âncora
□ artifacts/<pacote_prefix>-nota10-report.md — barra visual verde
□ React novo só com Implementar molde: + justificativa
□ Sem ai:generate / sem promote rotineiro
□ visual_bar: pass + o que subiu vs. molde anterior (ratchet)
```

---

## Triggers relacionados

| Trigger | Doc / skill |
|---------|-------------|
| `Design visual: <ramo>` | skill `avant-neuroslides-visual` |
| `Brief TE: <Subtópico> — <ramo>` | skill `brief-enfermagem` |
| `Implementar molde:` | [`VARIANT_MOLDS.md`](VARIANT_MOLDS.md) |
| `Pipeline completo:` | handcraft + qualidade — **outro trilho** |
| `Visual:` / Polish vitrine | `avant-ui-visual` — **fora** deste prompt |

---

*Vigente desde 2026-08-04 — P0 G2 fechado (FocusShell + ConceptMap / GoldenRule / DangerZone genéricos).*
