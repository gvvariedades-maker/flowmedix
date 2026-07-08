# BRIEF DE VARIANTES — Urgências e Emergências / urgencias_manchester_triagem

**Gerado:** 2026-07-08  
**Política:** `molde_implementado` (4× `layout_variant` bespoke já registrados · `logicFlow: cards` para eliminação MCQ)  
**Família:** `protocolo`  
**Template:** `rose` (t03)  
**Âncora:** `examples/questao-premium-ameosc-urgencias-triagem-etiquetas.json`  
**Cluster:** Manchester / triagem de vítimas múltiplas · **4 slugs (1,2%)** · `sample_slugs[0]`: `ameosc-enfermagem-processo-de-enfermagem-1780011967989-1`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | AMEOSC 2026 (Palma Sola) |
| Tipo | MCQ afirmativa correta sobre etiquetas coloridas |
| Gabarito (golden) | A — cor vermelha indica emergência no atendimento |

**Erro reproduzível (1 frase):** o aluno **inverte cores** — azul como instabilidade, amarelo sem monitoramento, verde como prioridade de transporte — ou confunde triagem de massa com Manchester de pronto-socorro.

**Por que bespoke (não `compare` / `reference_table` genérico):**

1. Erro **cromático semântico** — cada cor = prioridade + conduta; banca troca significado entre letras.
2. Cores pedem **espectro visual + board de referência** com badges por cor, não lista textual.
3. Pegadinhas recorrentes (`amarelo_monitor` · `azul_instabilidade` · `verde_transporte`) exigem trap dedicada.
4. Layout genérico não codifica hierarquia vermelho > amarelo > verde > azul.

---

## 1. Metáfora do pacote

**“Espectro cromático de triagem → board de cores decore → cards de eliminação → trap de inversão de cores.”**

Universo visual único: **faixa vermelho→amarelo→verde→azul** (rose/amber/lime/sky), chips de prioridade, ícones `Circle` · `Tags` · `Users` · `AlertTriangle`.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `urgencias-manchester-spectrum`
- **Metáfora visual:** espectro horizontal de cores — cada carta = cor ou princípio de triagem.
- **Componente:** `UrgenciasManchesterSpectrumConceptMap.tsx`

**Wire (375px):**

```text
┌ Vermelho ─ Amarelo ─ Verde ─ Azul ──┐
│ [Users] Princípio: salvar o máximo    │
│ [Circle] Vermelho = emergência imediata│
│ [Tags] Amarelo monitor · Verde leve   │
│ [AlertTriangle] Pegadinha: inversão   │
└───────────────────────────────────────┘
```

**Interação:**

| Gesto | Estado inicial | Estado final |
|-------|----------------|--------------|
| Toque no elo | `line-clamp-2` no `detail` | Expande (`aria-expanded`) |
| — | Badge cor inferida | vermelho=rose · amarelo=amber · verde=lime · azul=sky |

**Slots (`items[]`):**

| Slot | Papel | Exemplo label | Palavras-gatilho no `detail` |
|------|-------|---------------|--------------------------------|
| 1 | Comando | `Comando` | `vítimas múltiplas`, `etiquetas`, `CORRETO` |
| 2 | Princípio | `Princípio` | `salvar`, `gravidade`, `recursos limitados` |
| 3 | Vermelho | `Vermelho` | `imediato`, `emergência`, `risco de morte` |
| 4 | Demais cores | `Amarelo · Verde · Azul` | `monitorar`, `leve`, `não urgente` |
| 5 | Pegadinha | `Pegadinha` | `inverte`, `dispensa`, `instabilidade`, `transporte` |

**Ícones Lucide:** `Target`, `Users`, `Circle`, `Tags`, `AlertTriangle`

**Par com slide 4:** cores do espectro = slots trap (`amarelo_monitor` · `azul_instabilidade` · `verde_transporte`).

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `urgencias-manchester-board`
- **Metáfora visual:** board de cores — cada `row` = cor com badge de prioridade.
- **Componente:** `GoldenRuleUrgenciasManchesterBoard.tsx` (wrapper `SoftLensBoard` profile `urgencias`)

**Wire:**

```text
  ETIQUETAS — DECORE
┌──────────────────────────────────────────┐
│ Vermelho  [hot]  Imediato / emergência   │
│ Amarelo   [warn] Urgente — monitorar SSVV│
│ Verde     [ok]   Leve / pouco urgente    │
│ Azul      [info] Não urgente             │
│ Preto     [info] Óbito / expectante      │
│ Objetivo  [ok]   Máximo de vidas         │
└──────────────────────────────────────────┘
```

**Interação:** toque na lente → destaca `row`; swatches de cor à esquerda do label.

**Slots (`rows[]`):**

| Slot | `label` | `value` | `badge` |
|------|---------|---------|---------|
| 1 | `Vermelho` | Imediato / emergência — risco de morte | `hot` |
| 2 | `Amarelo` | Urgente / retardado — monitorar sinais | `warn` |
| 3 | `Verde` | Leve / ambulante — pouco urgente | `ok` |
| 4 | `Azul` | Não urgente (Manchester) — não é instabilidade | `info` |
| extra | `Preto` | Óbito ou expectante — triagem de massa | `info` |
| extra | `Objetivo` | Máximo de vidas com recursos limitados | `ok` |

**`content`:** mnemônico curto `ETIQUETAS — DECORE` (≤36 caracteres).

**Proibido:** row isolada “Gabarito letra A” sem contexto normativo.

**`footer_rule`:** `Vermelho primeiro · verde/azul esperam`

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `cards` (eliminação MCQ — padrão editorial)
- **`reveal_mode`:** `tap` (obrigatório)
- **Metáfora visual:** cards empilhados de eliminação — um critério por toque até a letra.

**Wire:**

```text
  [ TRIAGEM — ETIQUETAS ]
┌─────────────────────────────────────┐
│ 1. Princípio: gravidade × recursos  │
│         [ Próximo ▶ ]                 │
└─────────────────────────────────────┘
        … eliminar B · C · D …
┌─────────────────────────────────────┐
│ 8. Resta A — vermelho = emergência  │
└─────────────────────────────────────┘
```

**Interação:** toque avança passo; card de eliminação com badge warn; card final com badge ok.

**Passos típicos (`steps[]` strings):**

1. Formato: triagem de vítimas múltiplas — afirmativa CORRETA sobre etiquetas.
2. Mapa mental: vermelho = emergência; amarelo = urgente com monitoramento.
3. Eliminar B — amarelo dispensa monitoramento → falso.
4. Eliminar C — azul = instabilidade → falso (instabilidade = vermelho).
5. Eliminar D — verde = transporte rápido → falso (menor prioridade).
6. Resta A — vermelho = emergência no atendimento.
7. Marcar A + fixação (“vermelho é prioridade máxima”).

**Quantidade:** 6–10 passos.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `urgencias-manchester-trap`
- **`bullet_style`:** `x_icon`
- **Metáfora visual:** arena por inversão de cor — afirmativa errada × correção cromática.
- **Componente:** `DangerZoneUrgenciasManchesterTrap.tsx`

**Wire:**

```text
  PEGADINHAS — CORES DA TRIAGEM
┌─────────────────────────────────────┐
│ [amarelo] ✗ dispensa monitoramento  │
│      → correto: urgente + SSVV      │
├─────────────────────────────────────┤
│ [azul] ✗ instabilidade crítica      │
│      → correto: não urgente         │
├─────────────────────────────────────┤
│ [verde] ✗ transporte prioritário    │
│      → correto: leve / ambulante    │
└─────────────────────────────────────┘
```

**Interação:** toque no card → revela coluna `correct`; slot inferido via `inferUrgenciasManchesterTrapSlot`.

**Slots (`items[]`):**

| Slot | `label` | Pegadinha (`detail`) | `correct` único |
|------|---------|----------------------|-----------------|
| 1 | `amarelo_monitor` | Amarelo “menos grave” sem vigilância | Amarelo = urgente — monitorar e reavaliar SSVV |
| 2 | `azul_instabilidade` | Azul como paciente instável | Instabilidade = vermelho; azul = não urgente |
| 3 | `verde_transporte` | Verde = transporte rápido | Verde = leve/ambulante — menor prioridade imediata |
| 4 | `transferencia_ps` | Confundir triagem massa × PS Manchester | Mesma lógica: vermelho imediato; amarelo urgente |

**Par com slide 1:** cores do espectro = slots trap do manchester-trap.

---

## 6. Contrato de inferência

| Molde | Função / gatilhos |
|-------|-------------------|
| `urgencias-manchester-spectrum` | `inferTriageColor(title, detail)`: `vermelho` · `amarelo` · `verde` · `azul` · `preto` · `alerta` |
| `urgencias-manchester-board` | `SoftLensBoard` profile `urgencias`; swatch de cor por `label` |
| `cards` | Passos string; highlight passo com `eliminar`, `vermelho`, `marcar` |
| `urgencias-manchester-trap` | `inferUrgenciasManchesterTrapSlot(label, detail, correct)` → `amarelo_monitor` \| `azul_instabilidade` \| `verde_transporte` \| `transferencia_ps` |

**Wiring:** `BRANCH_DESIGN_MAP` → `urgencias_manchester_triagem` · `pedagogicalBranch.ts` · `lib/slides/urgenciasManchesterSlideUtils.ts`

---

## 7. Exemplo JSON mínimo

```json
{
  "meta": {
    "subtopico": "Urgências e Emergências",
    "pedagogical_branch": "urgencias_manchester_triagem",
    "family": "protocolo",
    "content_standard": "golden-v1"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Princípio", "detail": "Salvar o maior número — priorizar gravidade.", "icon": "Users" },
        { "label": "Vermelho", "detail": "Emergência imediata — risco de morte.", "icon": "Circle" },
        { "label": "Pegadinha", "detail": "Azul não é instabilidade; amarelo exige monitoramento.", "icon": "AlertTriangle" }
      ],
      "footer_rule": "Vermelho = emergência"
    },
    {
      "type": "golden_rule",
      "content": "ETIQUETAS — DECORE",
      "rows": [
        { "label": "Vermelho", "value": "Imediato / emergência", "badge": "hot" },
        { "label": "Amarelo", "value": "Urgente — monitorar sinais", "badge": "warn" },
        { "label": "Verde", "value": "Leve / pouco urgente", "badge": "ok" },
        { "label": "Azul", "value": "Não urgente", "badge": "info" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Formato: etiquetas coloridas — assinalar CORRETA.",
        "Eliminar B — amarelo sem monitorar → falso.",
        "Eliminar C — azul = instável → falso.",
        "Eliminar D — verde = transporte rápido → falso.",
        "Resta A — vermelho = emergência.",
        "Marcar A."
      ]
    },
    {
      "type": "danger_zone",
      "bullet_style": "x_icon",
      "content": "PEGADINHAS — CORES DA TRIAGEM",
      "items": [
        {
          "label": "Amarelo sem monitorar",
          "detail": "Parece que amarelo pode ficar sem vigilância.",
          "correct": "Amarelo = urgente — requer monitoramento de sinais."
        },
        {
          "label": "Azul = instável",
          "detail": "Confunde azul com vermelho.",
          "correct": "Instabilidade prioriza vermelho; azul é não urgente."
        }
      ]
    }
  ]
}
```

---

## 8. Anti-padrões

- Hardcodar gabarito “letra A” no componente React.
- Repetir o mesmo `correct` em dois `items` do danger_zone.
- Usar `compare` genérico sem swatches de cor após rollout do ramo.
- Confundir Manchester PS (tempos de espera) com triagem START/JumpSTART de massa sem adaptar `detail`.
- Colocar preto como “cor de emergência” — preto = óbito/expectante.

---

## 9. DoD (Definition of Done)

- [x] 375px: espectro e board legíveis sem scroll horizontal.
- [x] 0 hardcode de texto de prova específica nos componentes.
- [x] 4× `layout_variant` nomeados e registrados em `themeGenerator` / `BRANCH_DESIGN_MAP`.
- [x] Par conceito-perigo: cores slide 1 ↔ slots slide 4.
- [x] `inferUrgenciasManchesterTrapSlot` cobre ≥3 inversões com `correct` únicos.
- [x] `prefers-reduced-motion`: tap-flow revela todos os passos.
- [ ] Golden âncora renderiza 4/4 sem fallback genérico + handcraft dos 4 slugs restantes.

---

## 10. Handoff

Próximo trigger: **`Handcraft: Urgências e Emergências`** lote triagem (4 slugs `urgencias_manchester_triagem`) · validar com `npm run validate:urgencias-pilot`.
