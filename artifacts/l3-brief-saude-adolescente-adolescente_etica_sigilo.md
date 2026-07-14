# BRIEF DE VARIANTES — Saúde do Adolescente / adolescente_etica_sigilo

**Gerado:** 2026-07-13 (retroativo — componentes já em produção)  
**Política:** `molde_redesign` / `ok_existente`  
**Família:** `certo_errado` · `vf` · `protocolo` (escuta, sigilo, gravidez)  
**Template:** `sky` (t08)  
**Âncora:** `examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json`  
**Cluster:** Gravidez / pré-natal / escuta e sigilo — **2 slugs** (12,5%)

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Tipo | V/F ou múltipla — ética do cuidado, sigilo, escuta qualificada, gravidez na adolescência |
| Gabarito típico | Conduta que **protege** autonomia + sigilo, com exceções legais pontuais |

**Erro reproduzível (1 frase):** o aluno **confunde escuta com quebra de sigilo**, acha que responsável sempre entra na consulta, ou marca “sempre notificar” sem ponderar risco/violência.

**Por que bespoke:**

1. O erro é **de limiar** — quando proteger × quando quebrar sigilo — não cabe só em lista textual.
2. V/F em três afirmações (I/II/III) pede **tecelagem visual** dos julgamentos, não passos genéricos.
3. `danger_zone` EXCETO precisa mostrar **porta fechada (pegadinha) × corredor correto (conduta)**.

---

## 1. Metáfora do pacote

**“Consulta com cortinas de privacidade → espectro protegido / ponderar / quebrar → tear V/F I–II–III → portas de consentimento.”**

Universo visual: sky/indigo/cyan, **cortinas laterais** (escuta × sigilo), faixas de espectro, fios verticais I/II/III, portas que abrem para a conduta certa.

**Não aplicar** em: puberdade, escore Z, violência sem vocabulário de sigilo, EXCETO genérico MS.

---

## 2. Slide 1 — `concept_map`

- **`layout_variant`:** `adolescent-privacy-curtain`
- **Componente:** `AdolescentPrivacyCurtainConceptMap.tsx`
- **Metáfora:** cortinas sobre pilares do cuidado; toque abre cortina e revela `detail`.

**Slots (`inferAdolescentCurtain`):**

| Cortina | Gatilho no texto | Papel |
|---------|------------------|-------|
| `escuta` | escuta, acolhimento, privacidade | Ambiente seguro |
| `sigilo` | sigilo, confidencial | Limite ético |
| `acompanhamento` | responsável, acompanhante, autonomia | Quem entra |
| `prevencao` | contracepção, IST, gravidez, prevenção | Conduta preventiva |

**Interação:** Toque na aba da cortina → revela card; banner “Toque nas cortinas…”.

**Proibido:** gabarito/letra no concept_map; cortinas em questão de puberdade/Z.

---

## 3. Slide 2 — `golden_rule`

- **`layout_variant`:** `adolescent-sigilo-spectrum`
- **Componente:** `GoldenRuleAdolescentSigiloSpectrum.tsx`
- **Metáfora:** três zonas horizontais — **Protegido** · **Ponderar** · **Quebrar**.

**Slots (`inferSigiloSpectrumZone` em cada `row`):**

| Zona | Exemplos de conteúdo |
|------|---------------------|
| `protegido` | escuta, contracepção, orientação sexual |
| `ponderar` | risco grave, violência, notificação compulsória |
| `quebrar` | “sempre quebrar”, pegadinha absolutista |

**Interação:** Toque na `row` → destaca zona no espectro.

---

## 4. Slide 3 — `logic_flow`

- **`layout_variant`:** `adolescent-vf-weave-tap`
- **`reveal_mode`:** `tap`
- **Componente:** `LogicFlowAdolescentVfWeaveTap.tsx`
- **Metáfora:** três colunas I · II · III com fio vertical; cada passo julga V/F e preenche o fio (verde/vermelho).

**Parser:** `parseAdolescentVfWeaveStep` — `judgement` | `combine` | `fixation`.

**Interação:** Toque “Próximo” / banner de instrução; último passo combina afirmações → letra.

---

## 5. Slide 4 — `danger_zone`

- **`layout_variant`:** `adolescent-consent-gate`
- **Componente:** `DangerZoneAdolescentConsentGate.tsx`
- **Metáfora:** cada distrator = **porta fechada** (pegadinha); toque abre corredor com `correct`.

**Paths (`inferConsentGatePath`):** `acolher` · `proteger` · `vincular` · `orientar`

**Interação:** Toque na porta → revela conduta correta no corredor.

---

## 6. Anti-padrões

| Proibido | Motivo |
|----------|--------|
| Aplicar em puberdade/desenvolvimento | `mold_l3_zero_slots` |
| Aplicar em escore Z | Drift antropometria |
| Mesma frase `correct` em todos os itens | Gate anti-reciclagem |
| Row “Gabarito letra X” no golden_rule | Spoiler |

---

## 7. Critérios de aceite (DoD)

- [x] 4 variantes wired em `pedagogicalBranch.ts` + `NeuroSlide.tsx`
- [x] Guards `ADOLESCENT_VARIANTS` em `moldAffinity.ts`
- [x] e2e ramo ética/sigilo em `visual-mold-regression`
- [x] `moldSlotFit` — 0 slots sem vocabulário de sigilo/escuta

**Status:** implementado · produção (merge PR #23).
