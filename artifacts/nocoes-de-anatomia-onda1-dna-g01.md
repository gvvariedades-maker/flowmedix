# Onda 1 Anatomia — playbook + L3 + âncoras + g01

**Data:** 2026-08-03  
**Modelo:** Cursor Grok 4.5  
**Subtópico:** Noções de Anatomia  
**Authority:** 46 slugs · lote_size=8 · g01–g06

## Entregue

| Item | Status |
|------|--------|
| Playbook + registry lote_size=8 | OK |
| Taxonomia closed | OK (mismatch=0) |
| BRANCH + inferAnatBranch | OK (rose) |
| Cluster + L3 INDEX + brief terminologia | OK (molde_inedito; React pendente) |
| Âncoras golden 4/4 | gate=pass |
| g01 handcraft | 8/8 READY |
| validate:goldens --strict | 0 falhas |
| preflight strict-v2 | 8/8 |
| dry-run apply | failed=0 |

## Âncoras

| Cluster | examples/ |
|---------|-----------|
| Terminologia | questao-premium-fepese-anatomia-anterior-ventral.json |
| Esqueleto | questao-premium-ameosc-nocoes-de-anatomia-anat_esqueleto.json |
| Conceito geral | questao-premium-avancasp-nocoes-de-anatomia-anat_generico.json |
| Cardiovascular | questao-premium-cebraspe-nocoes-de-anatomia-anat_cardiovascular.json |

## Handoff

1. Digite **pode aplicar** para `catalog:apply-lote --lote=nocoes-de-anatomia-g01 --apply`
2. Depois: `Continuar programa: Noções de Anatomia` → g02
