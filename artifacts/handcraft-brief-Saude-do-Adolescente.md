# Handcraft briefing — Saúde do Adolescente

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `saude-adolescente-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `saude-adolescente` |
| status | applied (16/16 slugs) |
| manifest | `data/catalog-migration/saude-adolescente-completo/manifest.json` |
| lote_pattern | `saude-adolescente-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-saude-adolescente-*.json` |
| guideline | `lib/guidelines/saudeAdolescente.ts` |
| handcraft_meta | `data/catalog-migration/saude-adolescente-completo/handcraft-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **adolescente_etica_sigilo** — Escuta, sigilo, privacidade, gravidez na adolescência, pré-natal, autonomia progressiva, linguagem acessível · adolescent-care-pillars-deck · adolescent-speak-barrier-board · adolescent-exceto-isolate-board · adolescent-exceto-compare
    Âncoras: data/catalog-migration/saude-adolescente-g01/questions/idecan-enfermagem-saude-do-adolescente-1778712426701-6.json, examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json
  - **adolescente_antropometria** — Escore Z, Caderneta do Adolescente, classificação nutricional IMC/estatura, faixas ±1/±2/±3 DP · adolescent-growth-z-rail · adolescent-z-band-board · adolescent-z-classify-tap · adolescent-z-threshold-trap
    Âncoras: data/catalog-migration/saude-adolescente-g02/questions/ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0.json
  - **adolescente_violencia_protecao** — Violência sexual, rede de proteção, notificação compulsória, Conselho Tutelar, SINAN, não revitimizar · morphological · reference_table · vertical · compare (GENERIC hoje) — alvo Onda 2: glanceable v2
    Âncoras: data/catalog-migration/saude-adolescente-g01/questions/funcern-enfermagem-saude-do-adolescente-1777104229064-1.json
  - **adolescente_saude_mental** — Anorexia, bulimia, transtorno alimentar, imagem corporal, autolesão, ideação suicida, depressão/ansiedade na adolescência · morphological · reference_table · vertical · compare (GENERIC hoje) — alvo Onda 2: glanceable v2
    Âncoras: data/catalog-migration/saude-adolescente-g02/questions/cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-1.json
  - **adolescente_desenvolvimento** — Puberdade, Tanner, menarca, espermarquia, metamorfose física, atraso puberal · morphological · reference_table · vertical · compare (GENERIC hoje) — alvo Onda 2: glanceable v2
    Âncoras: data/catalog-migration/saude-adolescente-g02/questions/nao-informado-geral-saude-do-adolescente-1777104229064-0.json
  - **adolescente_generico** — EXCETO/diretrizes MS, promoção, saúde bucal, conceito sem fit nos ramos temáticos · morphological · reference_table · vertical · compare (GENERIC hoje) — alvo Onda 2: glanceable v2
    Âncoras: examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json

## Clusters

- EXCETO / diretrizes MS / promoção / bucal (6 · adolescente_generico)
- Saúde mental / transtornos alimentares (3 · adolescente_saude_mental)
- Gravidez / pré-natal / escuta e sigilo (2 · adolescente_etica_sigilo)
- Violência sexual / rede de proteção (2 · adolescente_violencia_protecao)
- Escore Z / Caderneta / obesidade (2 · adolescente_antropometria — só 1 com Z)
- Puberdade / desenvolvimento (1 · adolescente_desenvolvimento)

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=saude-adolescente-completo --subtopico="Saúde do Adolescente" --limit=10000
# Handcraft → data/catalog-migration/saude-adolescente-g01/questions/*.json
npm run validate:goldens -- --lote=saude-adolescente-g01 --strict
npm run audit:questao-readiness -- --lote=saude-adolescente-g01 --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=saude-adolescente-g01 --dry-run
# apply + patch branch só se o usuário pedir
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário
