# BRIEF DE VARIANTES — Urgências e Emergências / urgencias_vf_protocolo

**Gerado:** 2026-07-08  
**Política:** `molde_inedito` (layouts genéricos `morphological` · `reference_table` · `vertical` · `compare` hoje — **4× variantes bespoke a implementar**)  
**Família:** `vf` (I–IV combinatório) | sequência linha V,F,V,F  
**Template:** `rose` (t03)  
**Âncoras:** `examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json` · `examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json`  
**Cluster:** V/F protocolos I–IV · **8 slugs (2,4%)** · `sample_slugs[0]`: `ameosc-enfermagem-processo-de-enfermagem-1780011961798-5`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | AMEOSC 2026 (imobilização I–IV) · AMEOSC 2026 (RCP V/F sequência) |
| Tipo | V/F I–IV + combinação A–D · sequência V,F,V,F de cima para baixo |
| Gabarito (imobilização) | C — I e III, apenas (II capacete · IV prancha conforto = falsas) |
| Gabarito (RCP V/F) | A — V, F, V, F (100–120 · 30:2 adulto · DEA · pulso breve) |

**Erro reproduzível (1 frase):** o aluno **cruza letras antes de julgar cada item** — ou cai em pegadinhas de ordem (colar/prancha), absolutismo (capacete sempre sai) e troca pediátrico/adulto (15:2 · pulso prolongado).

**Por que bespoke (não `compare` / `reference_table` genérico):**

1. Erro **combinatório** — quatro julgamentos independentes → cruzamento A–D; genérico não separa slots I–IV.
2. Formato pede **deck de regras + tap-flow de julgamento item a item** antes da letra.
3. **8 questões** com padrão recorrente (imobilização · RCP · SBV) — ramo transversal a subtemas.
4. `compare` legado repete `correct` ou deriva todas as letras do gabarito — viola gate L2.

---

## 1. Metáfora do pacote

**“Deck de afirmativas I–IV → board de regras normativas → tap-flow julgar→cruzar→letra → arena de combinações erradas.”**

Universo visual único: **cards numerados I–IV** com chips V/F, badges rose/cyan, ícones `Shield` · `HardHat` · `Hand` · `Activity` · `Zap` · `CheckCircle` · `XCircle`.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `urgencias-protocol-rules-deck` *(a implementar)*
- **Metáfora visual:** deck de afirmativas — cada carta = item I–IV com status V/F inferido do `detail`.
- **Componente proposto:** `UrgenciasProtocolRulesDeckConceptMap.tsx`

**Wire (375px):**

```text
┌ Comando — julgar I–IV ────────────────┐
├ I  [V] Colar antes da prancha ────────┤
├ II [F] Capacete sempre removido ──────┤
├ III[V] Manual antes imobilização ─────┤
├ IV [F] Prancha = conforto prolongado ─┤
│ [AlertTriangle] Pegadinha combinatória│
└───────────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque no card | `line-clamp-2` no `detail` | Expande (`aria-expanded`) |
| — | Badge V/F inferido | V=emerald · F=rose · alerta=amber |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Comando | `Comando` | `julgue`, `I–IV`, `sequência`, `V/F` |
| 2–5 | I–IV | `Afirmativa I` … `Afirmativa IV` | `VERDADEIRA`, `FALSA`, conteúdo normativo |
| 6 | Pegadinha | `Pegadinha` | `combinat`, `15:2`, `capacete`, `prancha`, `pulso` |
| extra | Regra | `Regra de ouro` | `julgar item a item`, `antes das letras` |

**Ícones Lucide:** `Target`, `Shield`, `HardHat`, `Hand`, `Activity`, `Zap`, `AlertTriangle`, `CheckCircle`, `XCircle`

**Par com slide 4:** status V/F de I–IV = slots trap de combinações erradas (A–D) e transferências.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `urgencias-protocol-reference-board` *(a implementar)*
- **Metáfora visual:** board de regras normativas — cada `row` = regra de protocolo com badge ok/hot/warn.
- **Componente proposto:** `GoldenRuleUrgenciasProtocolReferenceBoard.tsx` (wrapper `SoftLensBoard` profile `urgencias`)

**Wire:**

```text
  TRAUMA CERVICAL — DECORE
┌──────────────────────────────────────────┐
│ Passo 1  [hot]  Manual linha neutra     │
│ Passo 2  [ok]   Colar cervical           │
│ Passo 3  [ok]   Prancha — transporte     │
│ Capacete [warn] Manter se VA pérvia      │
│ 15:2     [warn] Pediátrico — não adulto  │
│ Pulso    [warn] Breve · ~2 min RCP       │
└──────────────────────────────────────────┘
```

**Interação:** toque na lente → destaca `row`; chips `30:2` · `15:2` · `I→IV` em monoespaçado.

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` |
|------|---------|---------|---------|
| 1 | `Passo 1` | Estabilização manual em linha neutra | `hot` |
| 2 | `Passo 2` | Colar cervical | `ok` |
| 3 | `Passo 3` | Prancha longa — transporte | `ok` |
| 4 | `Capacete` | Manter se VA pérvia; remover só se necessário | `warn` |
| 5 | `Proporção adulto` | 30:2 (dois socorristas) | `ok` |
| 6 | `15:2` | Lactente/criança — pegadinha em V/F adulto | `warn` |
| extra | `Pulso` | Checagem breve; reavaliar ~a cada 2 min | `warn` |

**`content`:** mnemônico curto `Manual · colar · prancha` ou `30:2 · 100–120` (≤36 caracteres).

**Proibido:** row “Gabarito letra C” isolada — norma primeiro, letra só no logic_flow.

**`footer_rule`:** `Julgue I→IV antes das letras`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `urgencias-protocol-tap-flow` *(a implementar)*
- **`reveal_mode`:** `tap` (obrigatório)
- **Metáfora visual:** trilho de julgamento — um item V/F por toque, depois cruzamento e letra.
- **Componente proposto:** `LogicFlowUrgenciasProtocolTapFlow.tsx`

**Wire:**

```text
  [ V/F PROTOCOLO ]
┌─────────────────────────────────────┐
│ 1. Formato: julgar I–IV separado   │
│         [ Próximo ▶ ]                 │
└─────────────────────────────────────┘
        … I V · II F · III V · IV F …
┌─────────────────────────────────────┐
│ 7. Conjunto I+III → letra C         │
└─────────────────────────────────────┘
```

**Interação:** toque avança passo; badge V/F por passo; passo de combinação com badge ok.

**Passos típicos (`steps[]` strings):**

1. Formato V/F: julgar I–IV separadamente, depois cruzar com A–D.
2. I — colar antes da prancha? → verdadeiro.
3. II — capacete sempre removido? → falso.
4. III — manual antes de imobilização rígida? → verdadeiro.
5. IV — prancha para conforto prolongado? → falso.
6. Conjunto verdadeiro: apenas I e III (ou sequência V,F,V,F em formato linha).
7. Eliminar alternativas que incluem II ou IV como corretas.
8. Marcar C / A + fixação (“item a item antes das letras”).

**Quantidade:** 6–10 passos.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `urgencias-protocol-trap-arena` *(a implementar)*
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** arena de combinações erradas — distrator A–D × correção por item.
- **Componente proposto:** `DangerZoneUrgenciasProtocolTrapArena.tsx`

**Wire:**

```text
  PEGADINHAS — V/F COMBINATÓRIO
┌─────────────────────────────────────┐
│ [combo B] ✗ II e IV como corretas     │
│      → II F · IV F · gabarito C     │
├─────────────────────────────────────┤
│ [combo D] ✗ I e II (capacete)       │
│      → II F — capacete nem sempre sai │
├─────────────────────────────────────┤
│ [item II] ✗ 15:2 adulto (RCP)       │
│      → adulto = 30:2                  │
└─────────────────────────────────────┘
```

**Interação:** toque no card → revela coluna `correct`; slot inferido via `inferUrgenciasProtocolTrapSlot` *(a criar)*.

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| 1 | `combo_errada` | Alternativa que valida II ou IV falsos | Explicar quais itens são F e por quê (capacete · prancha) |
| 2 | `combo_parcial` | Acerta I mas inclui II falso | II F — capacete mantido se VA pérvia |
| 3 | `ordem_imobilizacao` | Prancha antes do colar | Manual → colar → prancha |
| 4 | `15:2_adulto` | 15:2 com dois socorristas no adulto | Adulto = 30:2; 15:2 = pediátrico |
| 5 | `pulso_prolongado` | Checar pulso por tempo longo / a cada ciclo | Pausa breve; reavaliar ~a cada 2 min |

**Par com slide 1:** status V/F do deck = itens referenciados nas traps de combinação.

---

## 6. Contrato de inferência

| Molde | Função / gatilhos |
|-------|-------------------|
| `urgencias-protocol-rules-deck` | `inferProtocolVfItem(title, detail)`: `i` \| `ii` \| `iii` \| `iv` \| `alerta` · `inferVfStatus(detail)`: `v` \| `f` |
| `urgencias-protocol-reference-board` | `SoftLensBoard` profile `urgencias`; badges via `badge: hot/warn/ok` |
| `urgencias-protocol-tap-flow` | Passos string; highlight passo com `I`, `II`, `verdadeiro`, `falso`, `marcar` |
| `urgencias-protocol-trap-arena` | `inferUrgenciasProtocolTrapSlot(label, detail, correct)` → `combo_errada` \| `combo_parcial` \| `ordem_imobilizacao` \| `15:2_adulto` \| `pulso_prolongado` \| `dea_atraso` |

**Wiring futuro:** substituir `URGENCIAS_GENERIC_MOLD` por `URGENCIAS_VF_PROTOCOL_MOLD` em `pedagogicalBranch.ts` · criar `lib/slides/urgenciasProtocolSlideUtils.ts`

---

## 7. Exemplo JSON mínimo

```json
{
  "meta": {
    "subtopico": "Urgências e Emergências",
    "pedagogical_branch": "urgencias_vf_protocolo",
    "family": "vf",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Comando", "detail": "Julgar I–IV sobre imobilização — cruzar com A–D.", "icon": "Target" },
        { "label": "Afirmativa I", "detail": "VERDADEIRA — colar cervical antes da prancha.", "icon": "Shield" },
        { "label": "Afirmativa II", "detail": "FALSA — capacete nem sempre removido.", "icon": "HardHat" },
        { "label": "Afirmativa III", "detail": "VERDADEIRA — manual antes de imobilização rígida.", "icon": "Hand" },
        { "label": "Afirmativa IV", "detail": "FALSA — prancha não é conforto prolongado.", "icon": "AlertTriangle" }
      ],
      "footer_rule": "Manual → colar → prancha"
    },
    {
      "type": "golden_rule",
      "content": "TRAUMA CERVICAL — DECORE",
      "rows": [
        { "label": "Passo 1", "value": "Estabilização manual linha neutra", "badge": "hot" },
        { "label": "Passo 2", "value": "Colar cervical", "badge": "ok" },
        { "label": "Passo 3", "value": "Prancha — transporte", "badge": "ok" },
        { "label": "Capacete", "value": "Manter se VA pérvia", "badge": "warn" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Formato V/F: julgar I–IV separadamente.",
        "I colar antes prancha → verdadeiro.",
        "II capacete sempre removido → falso.",
        "III manual antes imobilização → verdadeiro.",
        "IV prancha conforto → falso.",
        "Conjunto: I e III → letra C.",
        "Marcar C."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — IMOBILIZAÇÃO",
      "items": [
        {
          "label": "Letra B — II e IV",
          "detail": "Valida retirada obrigatória do capacete.",
          "correct": "II é FALSA (capacete nem sempre sai) e IV é FALSA."
        },
        {
          "label": "Confundir ordem",
          "detail": "Prancha antes do colar parece ganhar tempo.",
          "correct": "Colar cervical antes da prancha, com cabeça estabilizada manualmente."
        }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões

- Hardcodar gabarito “letra C” no componente React.
- Repetir o mesmo `correct` em dois `items` do danger_zone (gate `detectDuplicateDangerJustifications`).
- Derivar todas as letras A–D do texto do gabarito no danger_zone — cada distrator explica **por que a combinação está errada**.
- Usar `compare` genérico após implementação do ramo bespoke.
- Misturar ramo `urgencias_rcp_sbv` (72 slugs MCQ+tap dedicado) sem manter slots V/F distintos.

---

## 9. DoD (Definition of Done)

- [ ] 375px: deck I–IV e board legíveis sem scroll horizontal.
- [ ] 0 hardcode de texto de prova específica nos componentes.
- [ ] 4× `layout_variant` nomeados e registrados em `themeGenerator` / `BRANCH_DESIGN_MAP`.
- [ ] Par conceito-perigo: cards I–IV slide 1 ↔ traps combinatórias slide 4.
- [ ] `inferUrgenciasProtocolTrapSlot` cobre ≥4 pegadinhas com `correct` únicos.
- [ ] `prefers-reduced-motion`: tap-flow revela todos os passos.
- [ ] Golden âncoras imobilização + RCP V/F renderizam 4/4 sem fallback genérico.
- [ ] Substituir `URGENCIAS_GENERIC_MOLD` por pacote bespoke no `pedagogicalBranch.ts`.

---

## 10. Handoff

Próximo trigger: **`Implementar molde: urgencias_vf_protocolo`** ([`VARIANT_MOLDS.md`](../docs/VARIANT_MOLDS.md) §3) → wiring em `pedagogicalBranch.ts` → handcraft 8 slugs · validar com `npm run validate:urgencias-pilot`.
