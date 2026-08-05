# Mapa 8 gestos × Imunização (PNI)

**Âncoras 100% · Fase 0a · 2026-08-04**  
**Pacote:** 575 slugs · `production_ready` · 5 ramos L3  
**Referência Glance OS:** Farmacodinâmica 3/3 (`artifacts/glance-os-piloto-farmacodinamica-MAPA-8-GESTOS.md`)  
**Playbook:** `data/catalog-migration/handcraft-playbooks/imunizacao.json`  
**Piso visual:** `docs/NEUROSLIDES_VISUAL_BAR.md` · `artifacts/neuroslides-g2-demo.html`

---

## Os 8 gestos (catálogo nacional)

| # | Gesto | Banca testa |
|---|--------|-------------|
| 1 | EXCETO | achar a exceção / INCORRETA |
| 2 | CLASSIFICAR | categorias / famílias |
| 3 | JANELA | prazo / tempo (ex. DIU pós-parto) |
| 4 | TRILHO | ordem / jornada / linha do tempo |
| 5 | NÚMERO | dose / marco numérico / faixa °C |
| 6 | VF / I–II–III | julgar assertivas |
| 7 | PROTOCOLO | conduta clínica / estações de sala |
| 8 | PEGADINHA | distrator × certo (sempre no danger) |

---

## Aplicação neste pacote

| Gesto | Status | Ramo / quando |
|-------|--------|---------------|
| EXCETO | **usa** | `imunizacao_exceto` — INCORRETA/EXCETO (comando) |
| CLASSIFICAR | apoio | tipos de vacina / vivos×inativados → cauda `imunizacao_generico` (não forçar ramo novo) |
| JANELA | — | **fora** — não forçar “prazo pós-parto” Mulher neste pacote |
| TRILHO | **usa** | `imunizacao_calendario` — linha 0→2→3→4→6→12; `imunizacao_cadeia_frio` — hub frio → faixa |
| NÚMERO | **usa** | intervalos (4D/30D/8SEM), faixa **2–8 °C**, idade × dose |
| VF / I–II–III | **usa** | `imunizacao_vf_intervalos` + sub-padrão A de cadeia frio (AMEOSC) |
| PROTOCOLO | apoio | técnica de sala / via SCR → `imunizacao_generico` (não inventar “estação EV”) |
| PEGADINHA | **usa** | danger dos 5 ramos — preferir arena aberta 0 taps (barra G2) |

### Anti-gesto errado (PNI)

| Não fazer | Por quê |
|-----------|---------|
| Forçar **TRILHO ADME / EV / diluição** | É Farmacodinâmica — Imunização não é PK/PD |
| Forçar **JANELA DIU / puerpério Mulher** | Gestante no PNI = calendário (dTpa, influenza…), não gesto Mulher |
| Misturar **intervalo mínimo** com **marco idade×vacina** | VF intervalos ≠ calendário — ramos distintos |
| Tratar **via SCR** como calendário | Via/técnica → `imunizacao_generico` (âncora DECORP) |
| Colocar gabarito/letra em `concept_map` ou row “Gabarito letra X” em `golden_rule` | Spoiler antes do `logic_flow` |

---

## Alvo Glance OS 4/4 por ramo

### `imunizacao_vf_intervalos` (forte · molde_redesign)

| type | Molde atual | Alvo Glance OS | Cliques |
|------|-------------|----------------|---------|
| concept_map | `pni-rules-deck` | Deck regras **tudo visível** (expand opcional, não esconder decisão) | preferir **0** |
| logic_flow | `pni-vf-juggle-tap` | Board V/F glanceable **ou** juggle ≤3 com licença | preferir **0** |
| golden_rule | `pni-interval-matrix` | Matriz intervalos monoespaçada | **0** |
| danger_zone | `pni-trap-chips` | Arena chips aberta (sem cascata reveal) | **0** |

**Brief:** `artifacts/l3-brief-imunizacao-imunizacao_vf_intervalos.md`  
**Âncora:** `examples/questao-premium-cpcon-imunizacao-intervalos-vf.json`

### `imunizacao_calendario` (forte · molde_redesign · ~62%)

| type | Molde atual | Alvo | Cliques |
|------|-------------|------|---------|
| concept_map | `vaccine-timeline` | Timeline glanceable (meses × vacina) | preferir **0** |
| logic_flow | `pni-calendar-elimination-tap` | Eliminação board **ou** ≤3 taps | preferir **0** |
| golden_rule | `pni-calendar-board` | Board mês/badge (LabelBodyRow + strip) | **0** |
| danger_zone | `calendar-mismatch` | Mismatch aberto mês errado × certo | **0** |

**Brief:** `artifacts/l3-brief-imunizacao-imunizacao_calendario.md`  
**Âncoras:** Fundatec (marco 3m) + ADM&TEC (catch-up cartão perdido)

### `imunizacao_cadeia_frio` (forte · molde_redesign · ~12%)

| type | Molde atual | Alvo | Cliques |
|------|-------------|------|---------|
| concept_map | `cold-chain-hub` | Hub rede de frio glanceable | preferir **0** |
| logic_flow | `pni-cold-chain-tap` | Board 0 taps **ou** rail ≤3 | preferir **0** |
| golden_rule | `pni-temperature-rail` | Trilho **2–8 °C** contraste | **0** |
| danger_zone | `temperature-mismatch` | Faixa errada × certa aberta | **0** |

**Brief:** `artifacts/l3-brief-imunizacao-imunizacao_cadeia_frio.md`  
**Âncoras:** AMEOSC (V/F sala) + AVANÇASP (2–8 °C)

### `imunizacao_exceto` (EXCETO · moldes isolate/compare wired)

| type | Molde atual | Alvo | Cliques |
|------|-------------|------|---------|
| concept_map | `morphological` | Genérico G2 / PillarDeck | **0** |
| logic_flow | `pni-exceto-isolate-board` | Isolate keep × exception **0 taps** | **0** |
| golden_rule | `reference_table` | Board contraste | **0** |
| danger_zone | `pni-exceto-compare` | PolarityPanel por letra aberto | **0** |

**Brief:** `artifacts/l3-brief-imunizacao-imunizacao_exceto.md`  
**Âncora:** `examples/questao-premium-agirh-imunizacao-incorreta-antibiotico.json`  
**Nota playbook:** `l3_decision` histórico `ok_generico`; wiring React já tem isolate/compare — tratar como **gesto EXCETO Glance OS** (não reabrir bespoke sem pedido).

### `imunizacao_generico` (cauda · ok_generico)

| type | Molde | Alvo |
|------|-------|------|
| 4 tipos | morphological · reference_table · vertical · compare | Genéricos G2 no piso demo — sem forçar timeline/cadeia/intervalo |

**Âncora:** `examples/questao-premium-decorp-imunizacao-triplice-viral-via.json` (via SCR — **não** calendário)

---

## Gap visual vs barra G2 (anotação Fase 0a)

| Variant / pacote | Interação hoje | Gap vs Glance OS |
|------------------|----------------|------------------|
| `LogicFlowPniVfJuggleTap` | multi-tap juggle | Candidata wrap/board **0 taps** |
| `LogicFlowPniColdChainTap` / calendar elimination | tap serial | Preferir isolate/board 0 taps |
| `DangerZonePniTrapChips` | `useDangerZoneCompareReveal` | Preferir arena aberta (demo COMPARE) |
| `PniRulesDeck` / `VaccineTimeline` / `ColdChainHub` / calendar+temp boards | expand `useState` | OK se decisão principal visível sem tap; polish se conteúdo crítico atrás de expand |
| `LogicFlowPniExcetoIsolateBoard` + `DangerZonePniExcetoCompare` | BoardChrome | Mais próximo do piso G2 — referenciar na elevação da âncora EXCETO |

**Política nesta conversa:** anotar gap; **não** implementar molde React salvo bloqueio explícito do preview da âncora. Preferir elevar conteúdo da âncora; se molde impedir barra, pausar e pedir `Fábrica visual G2:` / `Implementar molde:`.

---

## Ordem de elevação (Fase 1)

1. `imunizacao_vf_intervalos` (CPCON)  
2. `imunizacao_calendario` (Fundatec → ADM&TEC)  
3. `imunizacao_cadeia_frio` (AMEOSC → AVANÇASP)  
4. `imunizacao_exceto` (Agirh)  
5. `imunizacao_generico` (DECORP — corrigir drift de ramo se necessário)

---

## Âncoras registradas (playbook + visual-anchors)

| branch_id | path |
|-----------|------|
| imunizacao_vf_intervalos | `examples/questao-premium-cpcon-imunizacao-intervalos-vf.json` |
| imunizacao_calendario | `examples/questao-premium-fundatec-meningococica-3meses.json` |
| imunizacao_calendario | `examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json` |
| imunizacao_cadeia_frio | `examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json` |
| imunizacao_cadeia_frio | `examples/questao-premium-avancasp-imunizacao-rede-frio-temperatura.json` |
| imunizacao_exceto | `examples/questao-premium-agirh-imunizacao-incorreta-antibiotico.json` |
| imunizacao_generico | `examples/questao-premium-decorp-imunizacao-triplice-viral-via.json` |
