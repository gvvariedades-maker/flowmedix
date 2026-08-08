# Coleta de Exames Laboratoriais — handcraft

| Campo | Valor |
|-------|-------|
| Subtópico | Coleta de Exames Laboratoriais |
| pacote_prefix | `coleta-de-exames-laboratoriais` |
| total_slugs | 171 |
| lote_size | 8 |
| Ramos L3 | 7 (`coleta_*`) |
| Design | `COLETA_GENERIC_DESIGN` (teal) |

## Comandos

```bash
npm run cluster:coleta
npm run audit:taxonomy-gate -- --subtopico="Coleta de Exames Laboratoriais"
npm run audit:golden-anchor-gate -- --subtopico="Coleta de Exames Laboratoriais"
# lotes g01… após âncoras READY
npm run catalog:export-lote -- --lote=coleta-de-exames-laboratoriais-g01 --subtopico="Coleta de Exames Laboratoriais" --limit=8
```

Playbook: `data/catalog-migration/handcraft-playbooks/coleta-de-exames-laboratoriais.json`
