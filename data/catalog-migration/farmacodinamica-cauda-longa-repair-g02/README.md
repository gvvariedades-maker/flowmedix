# Farmacodinâmica — repair cauda longa g02 (7 slugs)

**Subtópico:** Farmacodinâmica e Farmacocinética  
**Modo:** Handcraft golden-v1 — elevação premium cauda longa  
**Status:** **applied** (2026-07-01)

## Slugs

| Slug | Cluster | Ramo |
|------|---------|------|
| cetrede…7293-3 | Meia-vida / biodisponibilidade | `farmaco_pk_pd_vf` |
| fundatec…6256-8 | Default / anestésicos NÃO local | `farmaco_generico` |
| idcap…3568-4 | ADME V/F | `farmaco_pk_pd_vf` |
| aocp…0945-2 | Default / isossorbida | `farmaco_generico` |
| objetiva…3014-1 | ADME / farmacovigilância | `farmaco_generico` |
| quadrix…8962-1 | Protocolo / insulinas | `farmaco_clinico_protocolo` |
| quadrix…7780-3 | Protocolo / insulinas (dup) | `farmaco_clinico_protocolo` |

## Pipeline

```bash
npm run audit:questao-readiness -- --lote=farmacodinamica-cauda-longa-repair-g02
npm run validate:goldens -- --lote=farmacodinamica-cauda-longa-repair-g02 --strict
npm run catalog:apply-lote -- --lote=farmacodinamica-cauda-longa-repair-g02 --apply
```
