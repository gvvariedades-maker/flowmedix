# Mapa 8 gestos — Verificação de Sinais Vitais

**Âncoras 100% — Fase 0a — 2026-08-04**  
**Pacote:** 354 slugs · `production_ready` · 8 ramos L3 (e2e `SINAIS_VITAIS_BRANCHES`)  
**Referência Glance OS:** Farmacodinâmica 3/3 (`artifacts/glance-os-piloto-farmacodinamica-MAPA-8-GESTOS.md`)  
**Playbook:** `data/catalog-migration/handcraft-playbooks/sinais-vitais.json`  
**Piso visual:** `docs/NEUROSLIDES_VISUAL_BAR.md` · `artifacts/neuroslides-g2-demo.html`

---

## Os 8 gestos (catálogo nacional)

| # | Gesto | Banca testa |
|---|--------|-------------|
| 1 | EXCETO | achar a exceção / INCORRETA |
| 2 | CLASSIFICAR | categorias / famílias (NORMAL × ALTERADO) |
| 3 | JANELA | prazo / tempo (ex. DIU pós-parto) |
| 4 | TRILHO | ordem / jornada / sequência |
| 5 | NÚMERO | dose / marco numérico / faixa (bpm, mmHg, irpm, °C) |
| 6 | VF / I-II-III | julgar assertivas |
| 7 | PROTOCOLO | conduta clínica / checklist de técnica |
| 8 | PEGADINHA | distrator ≠ certo (sempre no danger) |

---

## Aplicação neste pacote

| Gesto | Status | Ramo / quando |
|-------|--------|---------------|
| EXCETO | **usa** | `vitals_exceto_tecnica` — INCORRETA/EXCETO de técnica SV |
| CLASSIFICAR | **usa** | `vitals_interpretacao` — multi-SV NORMAL/ALTERADO; apoio em FC/FR/Temp |
| JANELA | — | **fora** — não forçar puerpério/DIU Mulher neste pacote |
| TRILHO | apoio | sequência Korotkoff / passos MS em `vitals_pa_tecnica` (não inventar ADME) |
| NÚMERO | **usa** | faixas FC/FR/PA/Temp em `vitals_fc_faixas`, `vitals_fr_faixas`, `vitals_temperatura`, `vitals_vf_faixas` |
| VF / I-II-III | **usa** | `vitals_vf_faixas` (+ V/F pré-PA em `vitals_pa_tecnica`) |
| PROTOCOLO | **usa** | `vitals_pa_tecnica` — manguito, posição, repouso, Korotkoff; conduta em interpretação |
| PEGADINHA | **usa** | danger de todos os ramos — preferir arena aberta 0 taps (barra G2) |

### Anti-gesto errado (Sinais Vitais)

| Não fazer | Por quê |
|-----------|---------|
| Forçar **TRILHO ADME / EV / diluição** | É Farmacodinâmica — SV não é PK/PD |
| Forçar **JANELA DIU / puerpério Mulher** | Fora do pacote |
| Reciclar **faixa adulto** em pediatria | `vitals_pediatrico_faixas` (P2) / MS–SBP — não misturar com adulto 60–100 |
| Tratar **só FC** como técnica PA / Korotkoff | Ramo `vitals_fc_faixas` ≠ `vitals_pa_tecnica` |
| Tratar **temperatura/FR** como PA | Ramos dedicados `vitals_temperatura` / `vitals_fr_faixas` |
| Colocar gabarito/letra em `concept_map` ou row "Gabarito letra X" em `golden_rule` | Spoiler antes do `logic_flow` |
| Forçar **Glasgow** como ramo próprio | Absorver em `vitals_generico` (cluster ~1%) |

---

## Alvo Glance OS 4/4 por ramo

Pacote visual compartilhado (SUBTOPIC_DESIGN_MAP):  
`vitals-panel` · `vitals-reference-board` · `vitals-translate-tap` · `vitals-classify-arena`  
Bespoke forte: `vitals_pa_tecnica`, `vitals_exceto_tecnica` (e2e `SINAIS_VITAIS_BESPOKE_BRANCHES`).

### `vitals_pa_tecnica` (forte · ~55% · PROTOCOLO + NÚMERO)

| type | Molde atual | Alvo Glance OS | Cliques |
|------|-------------|----------------|---------|
| concept_map | `vitals-panel` | Monitor SV **tudo visível** (slots PA/técnica) | preferir **0** |
| logic_flow | `vitals-translate-tap` | Board elimina / translate **0 taps** ou =3 com licença | preferir **0** |
| golden_rule | `vitals-reference-board` | Board faixas + regra manguito/Korotkoff | **0** |
| danger_zone | `vitals-classify-arena` | Arena NORMAL×ERRO aberta | **0** |

**Brief:** `artifacts/l3-brief-sinais-vitais-vitals_pa_tecnica.md`

### `vitals_fc_faixas` (forte · ~11% · NÚMERO + CLASSIFICAR)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| 4 tipos | mesmo pacote vitals-* | Destaque FC / 60–100 / C/E | preferir **0** |

**Brief:** `artifacts/l3-brief-sinais-vitals-vitals_fc_faixas.md`

### `vitals_interpretacao` (CLASSIFICAR + PROTOCOLO)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| 4 tipos | vitals-* | Painel multi-SV + conduta | preferir **0** |

**Brief:** gap — criar se polish da âncora exigir redesign de slots (hoje compartilhado).

### `vitals_vf_faixas` (VF / I–II–III + NÚMERO)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| 4 tipos | vitals-* | Juggle/board V/F de faixas | preferir **0** |

**Brief:** gap (molde compartilhado).

### `vitals_exceto_tecnica` (EXCETO · bespoke)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| concept_map | `vitals-panel` | Painel técnico | preferir **0** |
| logic_flow | `vitals-translate-tap` | Isolate keep×exception | preferir **0** |
| golden_rule | `vitals-reference-board` | Board técnica | **0** |
| danger_zone | `vitals-classify-arena` (compare semântico) | Polarity por letra aberto | **0** |

**Brief:** gap formal — gate `vitals_exceto_semantic` em `sinaisVitaisPedagogy.ts`.

### `vitals_temperatura` / `vitals_fr_faixas` (NÚMERO + CLASSIFICAR)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| 4 tipos | vitals-* (slots Temp ou FR) | Reference-board do parâmetro | preferir **0** |

**Brief:** gap (historicamente → generico; agora ramos L3 no e2e/visual-anchors).

### `vitals_generico` (fallback · PEGADINHA / EXCETO / cauda)

| type | Molde | Alvo |
|------|-------|------|
| 4 tipos | vitals-* / genéricos G2 | Piso demo — sem forçar PA/Korotkoff |

---

## Gap audit (moldes vs Glance OS)

| Variant | Interação hoje | Gap vs constituição Glance OS |
|---------|----------------|-------------------------------|
| `vitals-translate-tap` | tap translate / multi-step | Preferir board **0 taps** ou licença =3 |
| `vitals-classify-arena` | possível reveal cascata | Preferir arena aberta (demo COMPARE) |
| `vitals-panel` | expand card | OK se decisão visível sem aba escondendo herói |
| `vitals-reference-board` | rows + `sv_kind` | OK se chips monoespaçados e herói de faixa |

**Conteúdo nesta conversa:** elevar **âncoras** (JSON) + pedir aprovação humana; **não** reescrever moldes React salvo molde bloquear preview ≥ piso G2 → então anotar e sugerir `Fábrica visual G2:` em conversa futura.

---

## Âncoras de referência (1 por ramo — inventário Fase 0b)

| branch_id | path canônico (playbook / visual-anchors) |
|-----------|-------------------------------------------|
| vitals_pa_tecnica | `data/catalog-migration/sinais-vitais-g01/questions/ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-3.json` |
| vitals_fc_faixas | `examples/questao-premium-idecan-fc-radial-ce.json` |
| vitals_interpretacao | `examples/questao-premium-fepese-sv-interpretacao-valores.json` |
| vitals_vf_faixas | `data/catalog-migration/sinais-vitais-g36/questions/avancasp-enfermagem-verificacao-de-sinais-vitais-1778969729218-7.json` |
| vitals_exceto_tecnica | `examples/questao-premium-avancasp-sv-pa-incorreta-divergente.json` |
| vitals_temperatura | `data/catalog-migration/sinais-vitais-g39/questions/amauc-enfermagem-verificacao-de-sinais-vitais-1779344205200-1.json` |
| vitals_fr_faixas | `data/catalog-migration/sinais-vitais-g37/questions/adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-7.json` |
| vitals_generico | `data/catalog-migration/sinais-vitais-g48/questions/instituto-seletiva-enfermagem-verificacao-de-sinais-vitais-1779343865210-0.json` |

**P2 (fora do escopo 8 ramos e2e nesta onda):** `vitals_pediatrico_faixas` — brief em `artifacts/l3-brief-sinais-vitais-vitals_pediatrico_faixas.md`; não declarar 100% pediátrico sem ramo formal + âncora dedicada.
