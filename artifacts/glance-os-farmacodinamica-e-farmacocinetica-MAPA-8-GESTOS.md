# Mapa 8 gestos — Farmacodinâmica e Farmacocinética

**Âncoras 100% — Fase 0a — 2026-08-07**  
**Pacote:** 13 slugs · `production_ready` · 3 ramos L3  
**Referência Glance OS:** piloto 3/3 (VF + clínico + genérico) · atelier 8 gestos ouro  
**Playbook:** `data/catalog-migration/handcraft-playbooks/farmacodinamica-e-farmacocinetica.json`  
**Piso visual:** `docs/NEUROSLIDES_VISUAL_BAR.md` · `artifacts/neuroslides-g2-demo.html`  
**Briefs L3:** `artifacts/l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md` (3/3)

---

## Os 8 gestos (catálogo nacional)

| # | Gesto | Banca testa |
|---|--------|-------------|
| 1 | EXCETO | achar a exceção / INCORRETA |
| 2 | CLASSIFICAR | categorias / famílias (cinética × dinâmica; classe farmacológica) |
| 3 | JANELA | prazo / tempo (raro — meia-vida é NÚMERO, não janela clínica) |
| 4 | TRILHO | ordem / jornada espacial (ADME; estações de infusão EV) |
| 5 | NÚMERO | marco numérico (meia-vida = 50%; dose/diluição quando a prova ancora) |
| 6 | VF / I–II–III | julgar assertivas (PK/PD clássico) |
| 7 | PROTOCOLO | conduta clínica / checklist (IBP EV, monitorização, via) |
| 8 | PEGADINHA | distrator × certo (sempre no danger) |

---

## Aplicação neste pacote

| Gesto | Status | Ramo / quando |
|-------|--------|---------------|
| EXCETO | apoio | cauda `farmaco_generico` quando comando EXCETO/INCORRETA sem fit VF/clínico |
| CLASSIFICAR | apoio | cinética × dinâmica; classes sem protocolo EV → genérico ou VF |
| JANELA | — | **fora** — não forçar DIU/puerpério Mulher nem calendário PNI |
| TRILHO | **usa** | `farmaco_pk_pd_vf` (ADME journey) · `farmaco_clinico_protocolo` (estações EV) |
| NÚMERO | **usa** | meia-vida 50% vs 100%; diluição/via quando bula ancora |
| VF / I–II–III | **usa** | `farmaco_pk_pd_vf` (âncora FUNCAMP) |
| PROTOCOLO | **usa** | `farmaco_clinico_protocolo` (omeprazol EV / infusão monitorada) |
| PEGADINHA | **usa** | danger dos 3 ramos — preferir arena/compare aberto (barra G2) |

### Anti-gesto errado (Farmacodinâmica)

| Não fazer | Por quê |
|-----------|---------|
| Forçar **rail ADME** em questão de **infusão EV / diluição / pH** | Drift → `farmaco_clinico_protocolo` |
| Forçar **estações EV / bólus / subcutâneo** em V/F de definições | Drift → `farmaco_pk_pd_vf` |
| Forçar **calendário vacinal / 2–8 °C / via SCR** | É Imunização / Vias — fora do pacote |
| Forçar **escore Z / sigilo adolescente** | É Saúde do Adolescente |
| Reciclar vocabulário **IPCS/CVC/bundle** | Fora do pacote |
| Colocar gabarito/letra em `concept_map` ou row "Gabarito letra X" / "I correta" em `golden_rule` | Spoiler antes do `logic_flow` |
| Tratar **meia-vida = eliminar 100%** como verdade | Pegadinha clássica — NÚMERO 50% |
| Usar âncora VF como estilo do ramo **genérico** sem declarar reuso | Preferir âncora própria do ramo (bootstrap se `missing`) |

---

## Alvo Glance OS 4/4 por ramo

### Pacotes visuais no código (`pedagogicalBranch.ts`)

| Pacote | Variants 4/4 | Ramo |
|--------|--------------|------|
| **PK/PD VF** | `adme-journey-rail` · `pk-pd-reference-board` · `farmaco-vf-juggle-tap` · `farmaco-trap` | `farmaco_pk_pd_vf` |
| **Clínico protocolo** | `infusao-ev-station-deck` · `farmaco-clinico-reference-board` · `farmaco-protocol-tap-flow` · `farmaco-clinico-trap` | `farmaco_clinico_protocolo` |
| **Genérico purple** | `morphological` · `center`/`reference_table` · `vertical` · `compare` | `farmaco_generico` |

### `farmaco_pk_pd_vf` (forte — VF + TRILHO ADME + NÚMERO)

| type | Molde atual | Alvo Glance OS | Cliques |
|------|-------------|----------------|---------|
| concept_map | `adme-journey-rail` | Trilho A→D→M→E glanceable | preferir **0** |
| logic_flow | `farmaco-vf-juggle-tap` | Juggle I/II/III ≤3 taps **ou** board 0 | ≤**3** |
| golden_rule | `pk-pd-reference-board` | Cinética × dinâmica + meia-vida 50% | **0** |
| danger_zone | `farmaco-trap` | Arena/compare aberto por letra | **0** |

**Brief:** `artifacts/l3-brief-farmacodinamica-e-farmacocinetica-farmaco_pk_pd_vf.md`  
**Âncora:** `examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json`  
**Preview:** `/dev/slide-mold-review?branch=farmaco_pk_pd_vf`

### `farmaco_clinico_protocolo` (forte — PROTOCOLO + TRILHO EV)

| type | Molde atual | Alvo Glance OS | Cliques |
|------|-------------|----------------|---------|
| concept_map | `infusao-ev-station-deck` | Deck estações diluir→infundir→monitorar | preferir **0** |
| logic_flow | `farmaco-protocol-tap-flow` | Protocolo tap ≤3 | ≤**3** |
| golden_rule | `farmaco-clinico-reference-board` | Norma portátil (via/diluição/monitor) | **0** |
| danger_zone | `farmaco-clinico-trap` | Trap EV aberto (bólus, SC, antiácido…) | **0** |

**Brief:** `artifacts/l3-brief-farmacodinamica-e-farmacocinetica-farmaco_clinico_protocolo.md`  
**Âncora:** `examples/questao-premium-idecan-omeprazol-ev-ulcera.json`  
**Preview:** `/dev/slide-mold-review?branch=farmaco_clinico_protocolo`

### `farmaco_generico` (cauda — `ok_generico`)

| type | Molde atual | Alvo Glance OS | Cliques |
|------|-------------|----------------|---------|
| concept_map | `morphological` | Pilares do tema (sem rail ADME se não couber) | **0** |
| logic_flow | `vertical` + `tap` | Eliminação MCQ ≤3 | ≤**3** |
| golden_rule | `center` / `rows` → `reference_table` | Decore portátil | **0** |
| danger_zone | `compare` + `correct[]` | Pegadinha por letra aberta | **0** |

**Brief:** `artifacts/l3-brief-farmacodinamica-e-farmacocinetica-farmaco_generico.md`  
**Gap 0b:** `visual-anchors` hoje reusa a âncora VF — **precisa âncora própria** (bootstrap) antes de assinar 100% deste ramo.  
**Preview:** `/dev/slide-mold-review?branch=farmaco_generico`

---

## Atelier (cruzamento com 8 gestos ouro)

| Gesto ouro atelier | Uso no pacote |
|--------------------|---------------|
| Rail / trilho | ADME + estações EV |
| Compare / arena | `farmaco-trap` / `farmaco-clinico-trap` / `compare` |
| Chip + corpo | boards de referência PK/PD e clínico |
| Número crítico | meia-vida 50% |
| Focus / núcleo | genérico tap pós-P1 |
| Isolate (EXCETO) | só se cauda EXCETO — não forçar nos ramos VF/clínico |
| Funil / Deck | apoio; não inventar funil PT nem pilares ética adolescente |

---

## GATE 0a

- [x] Playbook com 3 ramos L3
- [x] Briefs 4/4 existentes (INDEX 3/3)
- [x] Moldes React ship (VF + clínico + genérico)
- [x] Este mapa criado
- [ ] Fase 0b inventário no chat → só então polish/assinatura por âncora
