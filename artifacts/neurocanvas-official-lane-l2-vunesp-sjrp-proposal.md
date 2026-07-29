# NeuroCanvas — Proposta official lane L2: VUNESP-SJRP (2 casos)

**Status:** proposta apenas — **sem materialização** até aprovação explícita.

**Baseline:** G0.4 @ `cf840997` · official_lane total = 11 · este batch = 2 casos.

---

## Caderno oficial

| Campo | Valor |
|-------|--------|
| Concurso | Público nº **01/2025** — Prefeitura de São José do Rio Preto |
| Banca | **VUNESP** (`PMRP2501`) |
| Cargo | **Agente Administrativo** |
| Prova objetiva | **18/01/2026** — 50 questões (PT 1–15) |
| Gabarito geral | **20/01/2026** — DOM DHOJE nº **6669** + portal VUNESP |
| Retificações | Recursos gabarito **21–22/01/2026**; resultado final previsto **10/02/2026** |
| Retificação de letras PT | Nenhuma identificada nesta pesquisa para Q12/Q15 V1 |

### URLs oficiais (autoridade)

| Tier | Fonte | URL |
|------|--------|-----|
| A | Portal VUNESP PMRP2501 | https://www.vunesp.com.br/PMRP2501 |
| A | Prefeitura — gabaritos | https://www.riopreto.sp.gov.br/noticias/gabaritos-oficiais-de-concursos-e-processo-seletivo-estao-disponiveis |
| A | Prefeitura — gabarito individual | https://www.riopreto.sp.gov.br/noticias/vunesp-libera-gabarito-individual-do-concurso-e-processo-seletivo |
| B | DOM gabarito (espelho) | https://www.passeidireto.com/arquivo/197279491/gabaritos-concurso-sao-jose |
| B | Prova Ag Admin V1 (espelho) | https://www.passeidireto.com/arquivo/197263752/prova-de-agente-administrativo |

### Gabarito Português — Agente Administrativo **versão 1** (tier B espelho DOM)

| Nº | Letra | Nota |
|----|-------|------|
| **12** | **E** | Parênteses — texto Lévi-Strauss (calorias) → slug local `vunesp-sjrp-termos-parenteses-acessoria-3789304` |
| **15** | **A** | Lacunas crase agricultura → slug local `vunesp-sjrp-crase-lacunas-agricultura-3789364` |

Versões 2–4: gabarito completo no DOM espelho (tier B); **não** contém os dois enunciados deste batch.

---

## Caso 1 — `nc-g03-a88a4eb9efa315db`

**Slug:** `vunesp-sjrp-crase-a-qual`  
**Enunciado:** crase correta na frase adaptada da **tira**.  
**Gabarito local (ambos candidatos):** **E** — «à qual».

### Mapping oficial SJRP

| Campo | Valor |
|-------|--------|
| Na prova oficial Ag Admin? | **Não** (pesquisa V1 + gabarito DOM) |
| Nº questão oficial | — |
| Página | — |
| Gabarito oficial | — |
| Match próximo | Q15 gab. **A** — outra questão de crase (lacunas) |

### Proveniência conflitante

- `lingua-portuguesa-g02/lote-meta.json`: alias `vunesp-jundiai-crase-tira-qual-3776323` → este slug.
- Handcraft g02: origem **VUNESP Jundiaí** tec **3776323** (tira).
- g01: tier B cita tec **3789364** (lacunas SJRP Q15) — fonte errada para esta questão.

### Comparação candidatos

| Lote | Path | semantic_sha256 | Meta | Tier B |
|------|------|-----------------|------|--------|
| g01 | `lingua-portuguesa-g01/.../vunesp-sjrp-crase-a-qual.json` | `8a01a818…` | VUNESP SJRP | caderno 3789364 (lacunas) |
| g02 | `lingua-portuguesa-g02/.../vunesp-sjrp-crase-a-qual.json` | `c53bff36…` | VUNESP SJRP | caderno 3776323 (Jundiaí tira) |

`question_data` idêntico; **40** paths divergentes só em `reverse_study_slides`.

### Decisão

**`defer`**

Não fechar official_lane SJRP sem questão oficial ou reparo de proveniência (mis-tag Jundiaí). Follow-up: confirmar prova Jundiaí + lote proveniência PT.

---

## Caso 2 — `nc-g03-bad3482bfe781e3d`

**Slug:** `vunesp-sjrp-termos-folhetos-enquanto-3789304`  
**Enunciado:** folhetos + «Enquanto isso» / câncer.  
**Gabarito local (ambos candidatos):** **E**.

### Mapping oficial SJRP

| Campo | Valor |
|-------|--------|
| Na prova oficial Ag Admin? | **Não** |
| Nº questão oficial | — |
| Colisão tec | tec **3789304** no caderno = também Q12 oficial (**parênteses**, gab. E) — outro enunciado |
| Dedupe interno | Conteúdo = QUADRIX SES SP tec **3779634** (`termos-oracao-g02` lote-meta) |

### Comparação candidatos

| Lote | Path | semantic_sha256 | Meta | Tier B |
|------|------|-----------------|------|--------|
| termos-anchor | `lingua-portuguesa-termos-anchor/...` | `3cc2976e…` | **VUNESP** SJRP | caderno Q326 / 3789304 |
| termos-oracao-g02 | `termos-oracao-g02/...` | `b6ce181a…` | **QUADRIX** SES SP | tec 3779634 |

`question_data` idêntico; diverge `meta.banca` + slides.

### Decisão

**`defer`**

Sem tier A para folhetos em SJRP. Condicional **após** aprovação humana (só dedupe local, não official_lane): `choose_existing_candidate` → **termos-anchor**; rejeitar **termos-oracao-g02**.

---

## Resumo do batch

| Decisão | Count |
|---------|------:|
| defer | 2 |
| choose_existing_candidate | 0 |
| create_corrected_candidate | 0 |

**Após aprovação explícita:** PR aplicador → auditoria com catálogo → PR baseline separado.

JSON espelho: `artifacts/neurocanvas-official-lane-l2-vunesp-sjrp-proposal.json`
