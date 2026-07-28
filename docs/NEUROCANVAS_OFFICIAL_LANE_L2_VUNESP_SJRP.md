# NeuroCanvas — Official lane L2: VUNESP-SJRP (proposta)

> **Status:** proposta aprovada para PR · **sem materialização** no catálogo.  
> **Baseline G0.4 inalterada:** 339 / 104 / 11 / 0.

## Batch

| Campo | Valor |
|-------|--------|
| Lane | `official_lane_l2` |
| Banca hint | VUNESP-SJRP |
| Casos | 2 de 11 na official_lane |
| Fonte versionada | `lib/neurocanvas/officialLaneL2VunespSjrpProposal.ts` |
| Artifact espelho | `artifacts/neurocanvas-official-lane-l2-vunesp-sjrp-proposal.json` |

## Caderno oficial (tier A/B)

- Concurso Público **nº 01/2025** — Pref. São José do Rio Preto  
- Banca **VUNESP** `PMRP2501` · cargo **Agente Administrativo**  
- Prova **18/01/2026** · gabarito **20/01/2026** (DOM DHOJE nº 6669)  
- Portal: https://www.vunesp.com.br/PMRP2501  

**Gabarito PT — Ag Admin versão 1 (espelho tier B):** Q12 = **E** (parênteses); Q15 = **A** (lacunas crase).

## Decisões (ambos `defer`)

| case_id | slug | Motivo resumido |
|---------|------|-----------------|
| `nc-g03-a88a4eb9efa315db` | `vunesp-sjrp-crase-a-qual` | Enunciado tira/crase **não** na prova SJRP oficial; alias Jundiaí tec 3776323 |
| `nc-g03-bad3482bfe781e3d` | `vunesp-sjrp-termos-folhetos-enquanto-3789304` | Folhetos **não** na prova SJRP; dedupe QUADRIX 3779634; colisão tec 3789304 com Q12 |

Enquanto não houver mapping tier A (número de questão + gabarito definitivo) para estes enunciados em SJRP, **defer** é a decisão correta.

## Próximo (fora deste PR)

1. Proveniência **Jundiaí** — crase/tira (tec 3776323).  
2. Proveniência **QUADRIX SES SP** — termos/folhetos (tec 3779634).  
3. Nova proposta com caderno + gabarito + retificações → autorização explícita para materialização.

## Full-catalog guard

Auditorias `audit:neurocanvas-editorial-queue` e `audit:neurocanvas-blockers` exigem catálogo local (`lib/neurocanvas/fullCatalogGuard.ts`). CI sem catálogo: testes herméticos em `fullCatalogGuard.test.ts`; scripts de auditoria completa falham com exit 1.
