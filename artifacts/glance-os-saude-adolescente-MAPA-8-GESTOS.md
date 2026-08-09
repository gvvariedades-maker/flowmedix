# Mapa 8 gestos — Saúde do Adolescente

**Âncoras 100% — Fase 0a — 2026-08-05**  
**Pacote:** 16 slugs · `production_ready` · 6 ramos L3 (e2e `ADOLESCENTE_BRANCHES`)  
**Referência Glance OS:** Farmacodinâmica 3/3 · Sinais Vitais (mapa 8 gestos)  
**Playbook:** `data/catalog-migration/handcraft-playbooks/saude-adolescente.json`  
**Piso visual:** `docs/NEUROSLIDES_VISUAL_BAR.md` · `artifacts/neuroslides-g2-demo.html`  
**Briefs L3:** `artifacts/l3-brief-saude-adolescente-INDEX.md` (6/6)

---

## Os 8 gestos (catálogo nacional)

| # | Gesto | Banca testa |
|---|--------|-------------|
| 1 | EXCETO | achar a exceção / INCORRETA |
| 2 | CLASSIFICAR | categorias / famílias (faixa Z, zona de sigilo, rede) |
| 3 | JANELA | prazo / tempo (raro neste pacote) |
| 4 | TRILHO | ordem / jornada / reta espacial (Z-score) |
| 5 | NÚMERO | marco numérico / faixa (±DP, idade Tanner) |
| 6 | VF / I-II-III | julgar assertivas |
| 7 | PROTOCOLO | conduta clínica / checklist (acolher × afastar × notificar) |
| 8 | PEGADINHA | distrator × certo (sempre no danger) |

---

## Aplicação neste pacote

| Gesto | Status | Ramo / quando |
|-------|--------|---------------|
| EXCETO | **usa** | `adolescente_generico` (EXCETO/diretrizes MS); apoio em ética (isola conduta errada) |
| CLASSIFICAR | **usa** | `adolescente_antropometria` (faixas Z); apoio mental (risco × conduta) |
| JANELA | — | **fora** — não forçar DIU / puerpério Mulher / calendário vacinal Imunização |
| TRILHO | **usa** | `adolescente_antropometria` — reta Z OMS/Caderneta |
| NÚMERO | **usa** | faixas Z (±1, ±2, ±3); marcos puberais quando a prova cobra |
| VF / I-II-III | **usa** | `adolescente_etica_sigilo` (gravidez/sigilo/escuta); genérico com I/II/III |
| PROTOCOLO | **usa** | ética (escuta + sigilo ponderado); violência (rede/notificação); mental (acolher/encaminhar) |
| PEGADINHA | **usa** | danger de todos os ramos — preferir arena/compare aberto 0 taps (barra G2) |

### Anti-gesto errado (Saúde do Adolescente)

| Não fazer | Por quê |
|-----------|---------|
| Forçar **TRILHO ADME / EV / diluição** | É Farmacodinâmica — Adolescente não é PK/PD |
| Forçar **molde Z-rail** em obesidade/comorbidades **sem** escore Z | Drift → `adolescente_saude_mental` ou `adolescente_generico` |
| Forçar **cortina/weave/consent v1** em puberdade / Z / violência sem sigilo | Legado só galeria; mapa = pillars + speak-barrier + isolate + compare (v2) |
| Reciclar vocabulário **IPCS/CVC/bundle** | Fora do pacote |
| Colocar gabarito/letra em `concept_map` ou row "Gabarito letra X" / "I correta" em `golden_rule` | Spoiler antes do `logic_flow` |
| Tratar **violência** só como sigilo absoluto | Rede + notificação + não revitimizar — PROTOCOLO, não só ética de consulta |
| Misturar **Saúde Mental (adulto/RAPS)** com ramo adolescente | CAPS/RAPS adulto ≠ `adolescente_saude_mental` (imagem corporal / NSSI / TA) |

---

## Alvo Glance OS 4/4 por ramo

### Pacotes visuais no código (fonte: `pedagogicalBranch.ts`)

| Pacote | Variants 4/4 | Ramos no BRANCH_DESIGN_MAP hoje |
|--------|--------------|--------------------------------|
| **Ética glanceable v2** | `adolescent-care-pillars-deck` · `adolescent-speak-barrier-board` · `adolescent-exceto-isolate-board` · `adolescent-exceto-compare` | só `adolescente_etica_sigilo` |
| **Antropometria Z** | `adolescent-growth-z-rail` · `adolescent-z-band-board` · `adolescent-z-classify-tap` · `adolescent-z-threshold-trap` | `adolescente_antropometria` |
| **Genérico sky** | `morphological` · `reference_table` · `vertical` · `compare` | desenvolvimento · saúde_mental · violência · generico |

**Gap Onda 2 (docs vs código):** `l3-brief-saude-adolescente-INDEX.md` e `l3MoldGapCatalog` descrevem **reuso glanceable v2** nos 4 ramos acima; o `BRANCH_DESIGN_MAP` ainda aponta **GENERIC_DESIGN**. Affinity `ADOLESCENT_GLANCEABLE_BRANCHES` = só `etica_sigilo`.  
→ Antes de aprovar preview desses 4 ramos: ou (A) alinhar mapa → `ADOLESCENTE_GLANCEABLE_MOLD` + expandir affinity, ou (B) aceitar genérico sky se ≥ piso G2 na barra. Preferência desta conversa: **elevar molde (wrap)** se preview ficar abaixo do demo Glance OS.

### `adolescente_etica_sigilo` (forte — EXCETO/VF + PROTOCOLO sigilo)

| type | Molde atual | Alvo Glance OS | Cliques |
|------|-------------|----------------|---------|
| concept_map | `adolescent-care-pillars-deck` | Pilares acolher/articular/proteger/falar | preferir **0** |
| logic_flow | `adolescent-exceto-isolate-board` | Isolate keep×exception (board) | preferir **0** |
| golden_rule | `adolescent-speak-barrier-board` | Barreira de linguagem / falar claro | **0** |
| danger_zone | `adolescent-exceto-compare` | Pegadinha × conduta aberta | **0** |

**Brief:** `artifacts/l3-brief-saude-adolescente-adolescente_etica_sigilo.md` · v2 `…-etica-sigilo-v2.md`  
**Anti-spoiler:** golden sem "I correta" / "letra B".

### `adolescente_antropometria` (forte — TRILHO + NÚMERO + CLASSIFICAR)

| type | Molde | Alvo | Cliques |
|------|-------|------|---------|
| concept_map | `adolescent-growth-z-rail` | Reta Z tudo visível | preferir **0** |
| logic_flow | `adolescent-z-classify-tap` | Classificar no trilho (≤3 taps ou board 0) | preferir **0** |
| golden_rule | `adolescent-z-band-board` | Faixas Caderneta | **0** |
| danger_zone | `adolescent-z-threshold-trap` | Distrator 1 DP ao lado | **0** |

**Brief:** `artifacts/l3-brief-saude-adolescente-adolescente_antropometria.md`  
**Escopo:** só corpus com escore Z / Caderneta — **não** obesidade sem Z.

### `adolescente_violencia_protecao` (PROTOCOLO + PEGADINHA)

| type | Molde hoje | Alvo Onda 2 (docs) | Gap |
|------|------------|--------------------|-----|
| 4 tipos | GENERIC sky | glanceable v2 (reuso ética) | **wrap** BRANCH_DESIGN_MAP → glanceable **ou** validar genérico ≥ G2 |

**Brief:** `artifacts/l3-brief-saude-adolescente-adolescente_violencia_protecao.md`

### `adolescente_saude_mental` (PROTOCOLO + CLASSIFICAR risco)

| type | Molde hoje | Alvo Onda 2 | Gap |
|------|------------|-------------|-----|
| 4 tipos | GENERIC sky | glanceable v2 | idem wrap |

**Brief:** `artifacts/l3-brief-saude-adolescente-adolescente_saude_mental.md`  
**Anti-gesto:** não usar Z-rail sem escore Z no enunciado.

### `adolescente_desenvolvimento` (CLASSIFICAR / NÚMERO puberal)

| type | Molde hoje | Alvo Onda 2 | Gap |
|------|------------|-------------|-----|
| 4 tipos | GENERIC sky | glanceable v2 (pillars + isolate) | idem wrap |

**Brief:** `artifacts/l3-brief-saude-adolescente-adolescente_desenvolvimento.md`  
**Anti-gesto:** bloquear cortina/weave de sigilo em puberdade pura.

### `adolescente_generico` (EXCETO / VF / promoção — cauda)

| type | Molde hoje | Alvo Onda 2 | Gap |
|------|------------|-------------|-----|
| 4 tipos | GENERIC sky | glanceable v2 | idem wrap |

**Brief:** `artifacts/l3-brief-saude-adolescente-adolescente_generico.md`

---

## Gap audit (moldes vs Glance OS)

| Item | Situação | Ação Âncoras 100% |
|------|----------|-------------------|
| Ética v2 React | Implementado | Polish âncora + preview |
| Z-rail React | Implementado | Bootstrap `examples/` se faltando; polish |
| Onda 2 reuso glanceable (4 ramos) | Docs sim / mapa código **não** | Anotar; wrap molde **antes** de aprovar visual se preview genérico < piso |
| Affinity glanceable só etica | Bloqueia variants nos outros ramos | Expandir `ADOLESCENT_GLANCEABLE_BRANCHES` se wrap |
| Spoiler em golden gravidez VF | Rows com "I correta" | Corrigir na Fase 1 da âncora |
| `goldens_needed` cluster | `examples/…-escore-z.json` | Bootstrap Fase 0b/1 se path só em lote |

**Conteúdo nesta conversa:** elevar **âncoras** (JSON) + aprovação humana; **não** reescrever moldes React salvo preview < piso G2 → então sugerir `Fábrica visual G2:` / wrap BRANCH_DESIGN_MAP.

---

## Âncoras de referência (1 por ramo — inventário Fase 0b)

| branch_id | path canônico (playbook / visual-anchors) |
|-----------|-------------------------------------------|
| adolescente_etica_sigilo | `data/catalog-migration/saude-adolescente-g01/questions/idecan-enfermagem-saude-do-adolescente-1778712426701-6.json` (+ estilo `examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json` — realinhar branch no polish) |
| adolescente_antropometria | `data/catalog-migration/saude-adolescente-g02/questions/ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0.json` |
| adolescente_violencia_protecao | `data/catalog-migration/saude-adolescente-g01/questions/funcern-enfermagem-saude-do-adolescente-1777104229064-1.json` |
| adolescente_saude_mental | `data/catalog-migration/saude-adolescente-g02/questions/cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-1.json` |
| adolescente_desenvolvimento | `data/catalog-migration/saude-adolescente-g02/questions/nao-informado-geral-saude-do-adolescente-1777104229064-0.json` |
| adolescente_generico | `examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json` (**drift:** conteúdo ética/gravidez — avaliar mover para etica ou trocar âncora genérica EXCETO MS) |
