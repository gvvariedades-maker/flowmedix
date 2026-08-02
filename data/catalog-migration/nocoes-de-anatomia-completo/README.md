# Noções de Anatomia — pacote completo

**Subtópico canônico:** Noções de Anatomia  
**Prefixo:** `nocoes-de-anatomia`  
**Autoridade:** 48 slugs (bootstrap G0.4 Fênix) — ver `manifest.json`

## Estado

| Campo | Valor |
|-------|-------|
| Handcraft golden-v1 | **0/48** |
| `production_status` | `none` |
| Playbook | [`../handcraft-playbooks/nocoes-de-anatomia.json`](../handcraft-playbooks/nocoes-de-anatomia.json) |
| Guideline | [`../../../lib/guidelines/anatomiaBasica.ts`](../../../lib/guidelines/anatomiaBasica.ts) |
| Âncora | [`../../../examples/questao-premium-fepese-anatomia-anterior-ventral.json`](../../../examples/questao-premium-fepese-anatomia-anterior-ventral.json) |

## Pipeline (ordem)

```bash
# 1. Credenciais Supabase no .env.local
npm run audit:subtopico-inventory -- --subtopico="Noções de Anatomia"
npm run audit:taxonomy-gate -- --subtopico="Noções de Anatomia"

# 2. Export + cluster + L3
npm run catalog:export-lote -- --lote=nocoes-de-anatomia-completo --from-manifest=data/catalog-migration/nocoes-de-anatomia-completo/manifest.json
npm run cluster:nocoes-de-anatomia
# Mapeamento L3: Noções de Anatomia  → artifacts/l3-brief-nocoes-de-anatomia-INDEX.md

# 3. Gate âncoras + g01 (8 slugs)
npm run audit:golden-anchor-gate -- --subtopico="Noções de Anatomia"
# Handcraft: Noções de Anatomia  (1 gNN por conversa — pacote ≥41)
```

## Exclusões de autoridade

- `fau-unicentro-enfermagem-nocoes-de-anatomia-1775447762008-2` → Saúde da Mulher  
- `ibfc-enfermagem-nocoes-de-anatomia-1775448458316-0` → Urgências e Emergências  

Legado builder (`nocoes-de-anatomia-lote-01/02`, ~100 slugs em `exclude-done`) **não** é trilho de produção — só handcraft golden-v1.
