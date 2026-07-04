# imunizacao-g59 — handcraft golden-v1

**Subtópico:** Imunização · **Ramo:** mixed P1/P2 · **Status:** `handcraft_ready` (8/8)

## Slugs

| # | Slug | Tema | Ramo |
|---|------|------|------|
| 1 | `cpcon-uepb-enfermagem-imunizacao-1779564035545-7` | Gestante SBIm — dTpa, hep B, influenza | `imunizacao_calendario` |
| 2 | `cpcon-uepb-enfermagem-imunizacao-1779564040128-1` | Resíduos infectantes — perfurocortante | `imunizacao_cadeia_frio` |
| 3 | `cpcon-uepb-enfermagem-imunizacao-1779564040128-2` | Administração — assepsia (gabarito prova) | `imunizacao_exceto` |
| 4 | `cpcon-uepb-enfermagem-imunizacao-1779564044052-2` | Remoção ampola de vidro — sequência PNI | `imunizacao_cadeia_frio` |
| 5 | `com-exam-pref-bauru-enfermagem-imunizacao-1779564053668-0` | INCORRETA — intervalos SP <7 anos | `imunizacao_calendario` |
| 6 | `copese-ufpi-enfermagem-imunizacao-1779564079834-5` | EXCETO ACS — RN 28 dias | `imunizacao_exceto` |
| 7 | `fau-unicentro-enfermagem-imunizacao-1779572180830-4` | V/F poliomielite VIP/VOP | `imunizacao_vf_intervalos` |
| 8 | `cebraspe-cespe-enfermagem-imunizacao-1777103238173-0` | C/E — vacinas vivas atenuadas | `imunizacao_generico` |

## Validação (2026-07-03)

- `audit:questao-readiness --strict-v2-pedagogy` → 8/8 [READY]
- `validate:goldens --strict` → 8/8
- `audit:slug-alignment --strict` → 8/8
- `audit:numeric-factcheck` → 8/8

**Pendente:** `catalog:apply-lote --apply` (somente se solicitado).
