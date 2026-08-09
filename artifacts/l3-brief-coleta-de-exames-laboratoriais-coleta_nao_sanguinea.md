# Brief L3 — Coleta de Exames Laboratoriais / coleta_nao_sanguinea

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Coleta de Exames Laboratoriais |
| `pacote_prefix` | coleta-de-exames-laboratoriais |
| `branch_id` | coleta_nao_sanguinea |
| Família | `protocolo` · `vf` · `certo_errado` |
| Decisão L3 | `molde_redesign` (ship: `COLETA_GENERIC_DESIGN` até Implementar molde) |
| `bespoke_target` | `coleta-sample-matrix` |
| Âncora | g01 — urina EAS/urocultura/24h, fezes, escarro (cluster) |
| Erro espacial (1 frase) | Confunde **meio de coleta**, **recipiente** e **timing** entre urina, fezes e escarro |

**Metáfora única 4/4:** Matriz 2D **amostra × fase** — eixo horizontal (urina / fezes / escarro / swab) × eixo vertical (meio · recipiente · preservação · transporte).

> **Handcraft hoje:** JSON compatível com genérico premium teal; slots abaixo preenchem `morphological` + `reference_table` + tap + compare. React só após `Implementar molde: coleta_nao_sanguinea`.

---

## Pacote L3 (4× `layout_variant`)

| # player | `type` | `layout_variant` (futuro) | Metáfora (1 frase) |
|---------:|--------|------------------------------|---------------------|
| 1 | `concept_map` | `coleta-sample-matrix` | Grade amostra×fase — toque na célula certa |
| 2 | `logic_flow` | `coleta-sample-matrix-tap` | Eliminação por linha/coluna da matriz |
| 3 | `golden_rule` | `coleta-sample-reference-table` | Tabela normativa por tipo de amostra |
| 4 | `danger_zone` | `coleta-sample-trap-cells` | Célula errada (pegadinha) × célula correta |

---

## Slots por slide (resumo)

### 1 · `concept_map` — `coleta-sample-matrix`

| Slot | Papel | Exemplo `label` | Gatilhos em `detail` |
|------|-------|-------------------|------------------------|
| Urina EAS | meio | Jato médio | higiene, jato médio, frasco estéril |
| Urina 24h | timing | Refrigerar | preservante, ácido bórico, volume |
| Urocultura | recipiente | Assepsia perineal | estéril, imediato, temperatura |
| Fezes | preservação | Parasitológico | formalina, fresco, coproparasitológico |
| Escarro | qualidade | Amostra representativa | lavagem oral, muco, saliva |
| Swab | técnica | Secreção / ferida | transporte, meio de cultura |

**Gesto:** identificar **qual amostra** está no enunciado → **Estado final:** 3–5 pilares corretos daquela linha da matriz.

### 2 · `logic_flow` — `coleta-sample-matrix-tap`

`reveal_mode: "tap"` · 5–7 passos

| Passo | Decisão |
|-------|---------|
| 1 | Qual amostra? (urina / fezes / escarro / swab) |
| 2 | Meio correto? (jato médio, laxante, expectoração…) |
| 3 | Recipiente / preservante compatível? |
| 4 | Transporte / temperatura exigidos? |
| 5 | Eliminar alternativas que trocam **linha** da matriz |
| 6 | Gabarito + “Em similares: não trocar EAS × 24h × urocultura” |

### 3 · `golden_rule` — `coleta-sample-reference-table`

| `rows[].label` | `value` (≤110c) |
|----------------|-------------------|
| Urina EAS | Jato médio; frasco estéril; higiene perineal |
| Urina 24h | Refrigerar; preservante conforme protocolo |
| Urocultura | Assepsia; coleta estéril; processar rápido |
| Fezes parasito | Formalina + solução salina quando indicado |
| Escarro | Lavagem oral; amostra mucoide, não saliva |
| Transporte | Temperatura e prazo conforme manual do lab |

### 4 · `danger_zone` — `coleta-sample-trap-cells`

| `label` | Erro | `correct` (único) |
|---------|------|-------------------|
| Letra A | Troca jato médio por urina de sonda sem contexto | Conduta correta da alternativa A |
| Letra B | Mistura fezes com urina 24h | Conduta correta da alternativa B |
| Letra C | Escarro = saliva / sem lavagem | Conduta correta da alternativa C |
| Letra D | Gabarito (referência) | Conduta que fecha a matriz |
| Letra E | Preservante ou frasco errado | Conduta correta da alternativa E |

**Par concept_map ↔ danger_zone:** matriz no mapa; danger mostra **célula trocada** (pegadinha) vs **célula certa**.

---

## Contrato JSON (palavras-gatilho)

```text
concept_map.items[].detail: jato médio, urocultura, 24h, formalina, escarro, swab, refrigerar
logic_flow.steps: amostra → meio → recipiente → eliminar → gabarito
golden_rule.rows: protocolo por amostra — sem "Gabarito letra X"
danger_zone.items[].correct: 1 frase por distrator — sem repetir; sem trocar linhas da matriz
```

---

## Gate Fase 3b

- [x] Metáfora única 4/4 (matriz amostra×fase)
- [x] 4× `layout_variant` nomeados
- [x] Erro espacial em 1 frase
- [x] Contrato JSON + gatilhos por slot
- [x] Wire: gesto inicial → final (cada slide)
- [x] Par concept_map ↔ danger_zone
- [x] DoD: 375px legível · 0 hardcode de gabarito no React · ≤7 slots/tela
- [x] Path: `artifacts/l3-brief-coleta-de-exames-laboratoriais-coleta_nao_sanguinea.md`

**Próximo passo:** `Handcraft: Coleta de Exames Laboratoriais g01` **ou** `Implementar molde: coleta_nao_sanguinea` (só com pedido explícito).
