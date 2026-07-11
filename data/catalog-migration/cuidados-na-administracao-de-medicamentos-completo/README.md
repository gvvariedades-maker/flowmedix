# Cuidados na Administração de Medicamentos — handcraft golden-v1 (bootstrap)

**Subtópico:** Cuidados na Administração de Medicamentos  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **in_progress** — 0/123 slugs handcraft · export **curado** (drift excluído)

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../docs/HANDCRAFT_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs no manifest (curado) | 123 (`cuidados-na-administracao-de-medicamentos-completo/manifest.json`) |
| Drift excluído | 61 → [`cuidados-na-administracao-de-medicamentos-exclude-drift.json`](../cuidados-na-administracao-de-medicamentos-exclude-drift.json) |
| Handcraft aplicado | 0 |
| Ramos L3 | `cam_certos_vf_caso` · `cam_alto_risco` · `cam_generico` |
| Âncora 9 certos V/F | [`examples/questao-premium-fepese-cuidados-administracao-medicamentos.json`](../../examples/questao-premium-fepese-cuidados-administracao-medicamentos.json) |
| Âncora alto risco insulina | [`examples/questao-premium-fepese-cuidados-insulina-alto-risco.json`](../../examples/questao-premium-fepese-cuidados-insulina-alto-risco.json) |
| Âncora genérico EXCETO | [`examples/questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json`](../../examples/questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json) |
| Registry âncoras | [`cuidados-na-administracao-de-medicamentos-golden-anchors.json`](../cuidados-na-administracao-de-medicamentos-golden-anchors.json) |
| Playbook | [`handcraft-playbooks/cuidados-na-administracao-de-medicamentos.json`](../handcraft-playbooks/cuidados-na-administracao-de-medicamentos.json) |
| Guideline | [`lib/guidelines/cuidadosMedicamentos.ts`](../../lib/guidelines/cuidadosMedicamentos.ts) |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Clusters P0 (handcraft)

| Cluster | Slugs | Ramo | Primeiro lote sugerido |
|---------|-------|------|------------------------|
| Alto risco / conferência dupla | 19 | `cam_alto_risco` | `cuidados-na-administracao-de-medicamentos-g01` |
| V/F — 9 certos em caso clínico | 18 | `cam_certos_vf_caso` | `g02` |
| Default + absorvidos | ~60 | `cam_generico` | `g03+` |

## Comandos

```bash
npm run cluster:cuidados-na-administracao-de-medicamentos
npm run curate:cuidados-na-administracao-de-medicamentos   # re-aplicar filtro drift
npm run handcraft:brief -- --subtopico="Cuidados na Administração de Medicamentos"
npm run validate:goldens -- --strict
```

## Próximo passo

```text
Handcraft: Cuidados na Administração de Medicamentos
```

Handcraft `g01` — cluster alto risco (8 slugs) usando âncora FEPESE insulina.
