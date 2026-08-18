# Handcraft briefing — Atenção Básica / Saúde da Família

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `atencao-basica-saude-da-familia-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `atencao-basica-saude-da-familia` |
| status | pending (0/171 slugs) |
| manifest | `data/catalog-migration/atencao-basica-saude-da-familia-completo/manifest.json` |
| lote_pattern | `atencao-basica-saude-da-familia-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-atencao-basica*.json,examples/questao-premium-*-saude-familia*.json,examples/questao-premium-*-esf-*.json` |
| guideline | `lib/guidelines/atencaoBasica.ts` |
| handcraft_meta | `data/catalog-migration/atencao-basica-saude-da-familia-completo/handcraft-meta.json` |

## Ramos L3 (pedagogical_branch)

  - **ab_acs_territorio** — ACS, visita domiciliar, microárea, adscrição, cadastro familiar · morphological · reference_table · tap · compare
  - **ab_esf_composicao** — Composição/núcleo eSF, NASF/eMulti, ribeirinha, carga horária, teto 4.000 · ab-esf-orbit-deck · ab-esf-reference-board · ab-esf-tap-flow · ab-esf-scope-trap
  - **ab_pnab_principios** — PNAB, Portaria 2.436, atributos APS, longitudinalidade, coordenação do cuidado · morphological · reference_table · tap · compare
  - **ab_te_aps** — Atribuições do TE/AE na UBS/eSF sem ACS/eSF como eixo dominante · morphological · reference_table · tap · compare
  - **ab_vigilancia_ads** — ACE, endemias, notificação e vigilância no território da AB · morphological · reference_table · tap · compare
  - **ab_generico** — Demais — sem fit claro nos ramos acima · genérico premium emerald (SUBTOPIC_DESIGN_MAP)

## Clusters

- ACS — atribuições, visita e território
- eSF — composição, carga e modalidades
- PNAB / princípios e atributos da APS
- Técnico de enfermagem na AB
- Vigilância / ACE no território
- Atenção Básica — conceito geral

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=atencao-basica-saude-da-familia-completo --subtopico="Atenção Básica / Saúde da Família" --limit=10000
# Handcraft → data/catalog-migration/atencao-basica-saude-da-familia-g01/questions/*.json
npm run audit:questao-readiness -- --lote=atencao-basica-saude-da-familia-g01 --strict-v2-pedagogy
npm run validate:goldens -- --lote=atencao-basica-saude-da-familia-g01 --strict
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Atenção Básica / Saúde da Família" --only-premium --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug
- A4 (piloto `/estudar/[slug]`) — usuário
