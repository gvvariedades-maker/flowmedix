# Handcraft briefing — Promoção à Saúde e Prevenção de Agravos

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `promocao-a-saude-e-prevencao-de-agravos-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `promocao-a-saude-e-prevencao-de-agravos` |
| status | none (0/110 slugs) |
| manifest | `data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/manifest.json` |
| lote_pattern | `promocao-a-saude-e-prevencao-de-agravos-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-sus-lei-8080-cesgranrio.json,examples/questao-premium-*-sus-*.json` |
| guideline | `lib/guidelines/promocaoSaude.ts` |
| handcraft_meta | `data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-completo/handcraft-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **promocao_art4_composicao** — Lei 8.080 Art. 4º — composição do SUS; ações e serviços; esferas; direta/indireta; fundações · sus-art4-orbit · center · cards · scope-trap
    Âncoras: examples/questao-premium-sus-lei-8080-cesgranrio.json, cesgranrio-saude-publica-promocao-a-saude-e-prevencao-de-agravos-premium-pilot
  - **promocao_principios_direitos** — Princípios do SUS, direito à saúde CF, universalidade, integralidade, equidade — sem Art. 4º literal · morphological · reference_table · tap · compare
  - **promocao_educacao_prevencao** — Educação em saúde, prevenção de agravos, determinantes, promoção comunitária, políticas públicas · morphological · reference_table · tap · compare
  - **promocao_generico** — Demais — sem fit claro nos ramos acima · genérico premium (SUBTOPIC_DESIGN_MAP sus-art4-orbit como fallback visual)

## Clusters

- Lei 8.080 — Art. 4º composição do SUS
- Princípios e direitos (CF Art. 196, universalidade, integralidade)
- Promoção × prevenção × proteção × recuperação
- Atenção básica e educação em saúde
- Determinantes sociais e políticas públicas
- Lei 8.142 — controle social / CNS
- EXCETO / INCORRETA sobre SUS
- V/F I–II–III sobre legislação sanitária

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=promocao-a-saude-e-prevencao-de-agravos-completo --subtopico="Promoção à Saúde e Prevenção de Agravos" --limit=10000
# Handcraft → data/catalog-migration/promocao-a-saude-e-prevencao-de-agravos-g01/questions/*.json
npm run audit:questao-readiness -- --lote=promocao-a-saude-e-prevencao-de-agravos-g01 --strict-v2-pedagogy
npm run validate:goldens -- --lote=promocao-a-saude-e-prevencao-de-agravos-g01 --strict
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Promoção à Saúde e Prevenção de Agravos" --only-premium --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário
