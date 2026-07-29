# NeuroCanvas — Proveniência Jundiaí + QUADRIX (proposta)

> **Status:** proposta apenas · **ambos os casos: `defer`**  
> **Materialização:** proibida até cadeia tier A completa + autorização explícita (`pode materializar`).  
> **Baseline G0.4:** permanece **339 / 104 / 11 / 0**.

Relacionado: [NEUROCANVAS_OFFICIAL_LANE_L2_VUNESP_SJRP.md](./NEUROCANVAS_OFFICIAL_LANE_L2_VUNESP_SJRP.md) (PR #64).

## Resumo

Os 2 slugs official-lane VUNESP-SJRP são **mis-tags**. A pesquisa confirma a origem atribuída localmente (Tec + handcraft), mas **não** fecha mapping oficial (PDF + nº + gabarito definitivo).

| Caso | Slug atual | Origem correta (tier B) | Decisão |
|------|------------|-------------------------|----------|
| `nc-g03-a88a4eb9…` | `vunesp-sjrp-crase-a-qual` | VUNESP ACS Pref. Jundiaí 2026 · tec **3776323** · gab. E | **defer** |
| `nc-g03-bad3482b…` | `vunesp-sjrp-termos-folhetos-enquanto-3789304` | QUADRIX Tec Enf SES-SP 2026 · tec **3779634** · gab. E | **defer** |

## Jundiaí — crase/tira (tec 3776323)

| Campo | Status |
|-------|--------|
| Portal candidato | https://www.vunesp.com.br/PMJU2504 (ACS Vila Rio Branco) — tier A portal |
| Tec caderno | `portugues-caderno-2025-2026-q401-600.pdf` p.31 — header VUNESP ACS Jundiaí |
| PDF oficial prova | **não obtido** |
| Nº questão oficial | **null** |
| Gabarito definitivo | **não obtido** |

**Decisão: `defer`.** Quando tier A fechar → esperado `create_corrected_candidate` com meta Jundiaí.

## QUADRIX — folhetos (tec 3779634)

| Campo | Status |
|-------|--------|
| Portal | https://quadrix.org.br/informacoes/13/ — Edital 40/2025 |
| Gab. preliminar | Edital **013/2026** (20/01/2026) — espelho PDF Editora Solução; Tec Enf PT 01–10 com **05-E** etc. |
| Recursos / definitivo | Editais **014** e **015/2026** listados no portal (10/02/2026) — **conteúdo PDF não obtido** |
| Provas aplicadas | Entrada portal 20/01/2026 — **PDF não obtido** |
| QConcursos | Q3843566 atribui Quadrix SES-SP Tec Enf 2026 (tier B) |
| Colisão | tec **3789304** = parênteses SJRP (outra questão) |

**Decisão: `defer`.** Quando tier A fechar → `choose_existing` do path Quadrix ou `create_corrected` alinhando cópias SJRP-named.

## Regra dura

Sem PDF oficial + nº questão + gabarito definitivo → **não** abrir PR aplicador.

## Artefatos

- Fonte: `lib/neurocanvas/officialLaneProvenanceJundiaiQuadrixProposal.ts`
- Espelho: `artifacts/neurocanvas-provenance-jundiai-quadrix-proposal.{json,md}`
