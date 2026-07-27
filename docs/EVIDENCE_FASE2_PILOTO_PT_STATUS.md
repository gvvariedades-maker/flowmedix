# Evidence Fase 2 — Piloto PT (anotação humana)

**Status (2026-07-27):** inventário estrutural **aprovado**; `evidence_ready=false` em todos os slots fictícios.

## Decisão

| Item | Status |
|---|---|
| Taxonomia crase / colocação / vocativo | Aprovada |
| Misconceptions por skill | Aprovadas |
| Questões reais do catálogo mapeadas | **Pendente** |
| `evidence_ready=true` | **Bloqueado** até slugs reais + revisão golden-v1 |
| Ligar T1 / RCT no produto | **Proibido** até inventário real `evidence_ready` |

## Próximo passo humano de conteúdo

1. Escolher ≥3 questões reais por skill (mãe + T1 + holdout potencial).
2. Preencher `question_version` SHA real, `surface_template_id`, dificuldade, misconceptions por distrator.
3. Marcar `evidence_ready=true` só após revisão humana por slug.
4. Só então habilitar TransferCTA / RCT-1 no produto.

Arquivo: `data/evidence/pilot-pt-crase-colocacao-vocativo.json`