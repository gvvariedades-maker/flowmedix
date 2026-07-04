# imunizacao-g34 — handcraft golden-v1

**Subtópico:** Imunização · **Ramo:** `imunizacao_calendario` (6×) + `imunizacao_vf_intervalos` (2×) · **Status:** `handcraft_ready` (8/8)

## Slugs

| # | Slug | Banca | Tema | Gabarito |
|---|------|-------|------|----------|
| 1 | `imparh-enfermagem-imunizacao-1779564067000-5` | Imparh | Pentavalente — esquema 2·4·6 | A |
| 2 | `instituto-aocp-enfermagem-imunizacao-1777103257434-0` | AOCP | Men ACWY adolescente 11–14 anos | B |
| 3 | `instituto-aocp-enfermagem-imunizacao-1777103257434-1` | AOCP | Calendário adulto/idoso — febre amarela | B |
| 4 | `instituto-consulpam-enfermagem-imunizacao-1779564067000-8` | Consulpam | V/F HPV · penta · BCG · Hep B | D |
| 5 | `instituto-consulpam-enfermagem-imunizacao-1779564109452-4` | Consulpam | Hep B idoso ≥60 anos — 3 doses | A |
| 6 | `instituto-consulplan-enfermagem-imunizacao-1777103222102-3` | Consulplan | DTP reforços 15m / 4a IM | D |
| 7 | `instituto-consulplan-enfermagem-imunizacao-1777103230085-1` | Consulplan | VIP — via intramuscular | D |
| 8 | `instituto-consulplan-enfermagem-imunizacao-1777103230085-2` | Consulplan | I/II/III — penta · rotavírus × polio · HPV | D |

## Validação (2026-07-03)

- `audit:questao-readiness --strict-v2-pedagogy` → 8/8 [READY]
- `validate:goldens --strict` → 8/8
- `audit:slug-alignment --strict` → 8/8
- `audit:numeric-factcheck` → 8/8

**Pendente:** `catalog:apply-lote --apply` (somente se solicitado).
