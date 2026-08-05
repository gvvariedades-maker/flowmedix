# Mapa 8 gestos — Classes de palavras (Língua Portuguesa)

**Âncoras 100% — Fase 0a — 2026-08-05**  
**Pacote:** 93 slugs · `production_ready` / `applied` · **6 ramos L3** (split do card)  
**Política âncoras:** **2 por ramo** (= **12** goldens) — `anchor_styles` distintos (padrão crase/pontuação)  
**Referência Glance OS:** Farmacodinâmica 3/3 (`artifacts/glance-os-piloto-farmacodinamica-INDEX.md`)  
**Playbook:** `data/catalog-migration/handcraft-playbooks/classes-de-palavras.json`  
**Piso visual:** `docs/NEUROSLIDES_VISUAL_BAR.md` · `artifacts/neuroslides-g2-demo.html`  
**Pergunta-teste (Elias M02):** *O que a palavra faz na oração?*

---

## Os 8 gestos (catálogo nacional)

| # | Gesto | Banca testa |
|---|--------|-------------|
| 1 | EXCETO | achar a exceção / INCORRETA |
| 2 | CLASSIFICAR | categorias / famílias (classe morfológica × função) |
| 3 | JANELA | prazo / tempo |
| 4 | TRILHO | ordem / jornada / sequência |
| 5 | NÚMERO | dose / marco numérico / faixa |
| 6 | VF / I–II–III | julgar assertivas |
| 7 | PROTOCOLO | conduta / checklist clínico |
| 8 | PEGADINHA | distrator ≠ certo (sempre no danger) |

---

## Aplicação neste pacote

| Gesto | Status | Ramo / quando |
|-------|--------|---------------|
| EXCETO | **usa** | `pt_classes_exceto` — EXCETO / INCORRETA / «valor semântico INCORRETO» |
| CLASSIFICAR | **usa** | Núcleo do card — `pt_classes_nominais`, `pt_classes_adverbio`, `pt_classes_preposicao`, `pt_classes_conjuncao` |
| JANELA | — | **fora** — não forçar prazo/puerpério/DIU |
| TRILHO | — | **fora** — não forçar ADME / linha do tempo verbal (→ `pt_verbos`) nem período oracional (→ `pt_oracoes_subordinadas`) |
| NÚMERO | apoio | só se a peça for **numeral** (cardinal/ordinal) dentro de `pt_classes_nominais` — não inventar dose/faixa clínica |
| VF / I–II–III | **usa** | cauda `pt_classes_generico` (+ asserções I/II em nominais quando o comando for V/F) |
| PROTOCOLO | — | **fora** — não forçar conduta de enfermagem / EV / sala |
| PEGADINHA | **usa** | danger de todos os ramos — arena aberta preferir **0 taps** (barra G2) |

### Anti-gesto errado (Classes de palavras)

| Não fazer | Por quê |
|-----------|---------|
| Forçar **TRILHO ADME / EV / diluição** | É Farmacodinâmica — morfologia não é PK/PD |
| Forçar **pt-period-rail** (oração subordinada) | Se a prova pede só a **classe** do conectivo → `pt_classes_conjuncao`, não sintaxe do período |
| Forçar **pt-regency-arrow** (regência completa) | Prep cobrada como **classe/peça** → `pt_classes_preposicao`; regência verbal/nominal → card Regência |
| Forçar **pt-clitic-rail** (colocação) | Pronome átono / próclise → card Pronomes e colocação |
| Tratar **formação/siglas** como único ramo do card | Volume residual; legado em `pt_classes_generico` — não virar o pacote inteiro |
| Colocar gabarito/letra em `concept_map` ou row «Gabarito letra X» em `golden_rule` | Spoiler antes do `logic_flow` |
| Reciclar justificativa `danger_zone.correct` entre letras | Gate `detectDuplicateDangerJustifications` |

---

## Alvo Glance OS 4/4 por ramo

Pacote visual atual (ok_generico):  
`morphological` · `reference_table` · `tap` · `compare`  
**Gap comum:** wrap/polish G2 — boards **0 taps** (piso demo); bespoke só se humano pedir após preview.

Metáfora skill (`reference-metaforas.md`): **Peças** — radical · prefixo · sufixo · **classe na oração**.

### `pt_classes_conjuncao` (forte · ~30% · CLASSIFICAR)

| type | Molde atual | Alvo Glance OS | Cliques |
|------|-------------|----------------|---------|
| concept_map | morphological | Deck peça/conectivo + pergunta-teste **tudo visível** | preferir **0** |
| logic_flow | tap | Board elimina valor semântico **0 taps** (ou tap =3 com licença) | preferir **0** |
| golden_rule | reference_table | Board conectivo × valor (adversativa/causal/…) | **0** |
| danger_zone | compare | Arena valor errado × certo aberta | **0** |

**Brief L3:** dispensado (`ok_generico`) — criar só se preview exigir `molde_redesign`.

### `pt_classes_nominais` (forte · CLASSIFICAR)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| 4 tipos | morphological / rows / tap / compare | Peças nominais (artigo→substantivo→adj→numeral); substantivação com artigo | preferir **0** |

**Brief:** dispensado.

### `pt_classes_adverbio` (CLASSIFICAR + PEGADINHA)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| 4 tipos | idem | Board «modifica verbo/adj/adv»; arena adv×adj | preferir **0** |

**Brief:** dispensado.

### `pt_classes_preposicao` (CLASSIFICAR + PEGADINHA)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| 4 tipos | idem | Contraste prep × artigo / prep × conj — **sem** seta de regência completa | preferir **0** |

**Brief:** dispensado.

### `pt_classes_exceto` (EXCETO)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| concept_map | morphological | Command-hub EXCETO/INCORRETA | preferir **0** |
| logic_flow | tap | Isolate keep × exception | preferir **0** |
| golden_rule | reference_table | Regra da peça sob teste | **0** |
| danger_zone | compare | Polarity por letra aberta | **0** |

**Brief:** dispensado; alinhar visual ao padrão `imunizacao_exceto` / `pt-exceto-arena` se gap bloquear preview.

### `pt_classes_generico` (fallback · VF / formação / mesclado)

| type | Molde | Alvo |
|------|-------|------|
| 4 tipos | genéricos G2 | Piso demo — sem forçar conjunção/nominal |

**Legado:** `examples/questao-formacao-palavras-siglas.json` — `drift_ramo` + `below_bar` (elevar ou substituir na Fase 1).

---

## 2 âncoras por ramo (obrigatório)

| branch_id | estilo 01 | estilo 02 |
|-----------|-----------|-----------|
| `pt_classes_conjuncao` | `causal` | `adversativa` |
| `pt_classes_nominais` | `artigo` | `substantivacao` |
| `pt_classes_adverbio` | `modo_intensidade` | `adv_x_adj` |
| `pt_classes_preposicao` | `prep_x_artigo` | `locucao_prepositiva` |
| `pt_classes_exceto` | `exceto_classe` | `valor_incorreto` |
| `pt_classes_generico` | `vf_multiclasse` | `formacao_siglas` (legado → elevar) |

**DoD ramo:** 2/2 READY + aprovado_humano em ambas. Não fechar ramo com 1 só.

## Ordem de polish (Fase 1 sugerida)

1. `pt_classes_conjuncao` — causal → adversativa  
2. `pt_classes_nominais` — artigo → substantivação  
3. `pt_classes_adverbio` — modo/intensidade → adv×adj  
4. `pt_classes_preposicao` — prep×artigo → locução  
5. `pt_classes_exceto` — EXCETO → valor INCORRETO  
6. `pt_classes_generico` — VF multi-classe → formação/siglas  

---

## GATE 0a

- [x] Playbook dedicado com `pedagogical_branches[]` completos
- [x] Mapa de gestos + anti-gesto
- [x] Política **2 âncoras/ramo** (`anchors_per_branch: 2` · 12 no pacote)
- [x] Mold gaps anotados (wrap_polish_g2; sem brief molde_redesign obrigatório)
- [x] Humano OK GATE 0a → Fase 0b
- [x] Inventário 0b: 11 bootstrapped + 1 legado below_bar (`artifacts/classes-de-palavras-ancoras-0b-inventory.json`)
- [ ] Fase 1 — polish + aprovação humana âncora a âncora (2/ramo)

*Polish fino = Fase 1 (começar por `pt_classes_conjuncao` / causal).*
