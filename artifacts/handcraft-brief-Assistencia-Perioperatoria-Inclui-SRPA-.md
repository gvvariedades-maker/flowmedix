# Handcraft briefing — Assistência Perioperatória (Inclui SRPA)

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — Repair clinical-depth-v3 — slugs do cluster pós-operatório e âncoras pré-v3
- Seleção: Cluster pós-operatório/EXCETO sem v3; audit --strict-v2-pedagogy com warn/error; ou Slug: explícito do usuário
- **Primeiro lote:** `perioperatoria-repair-v3-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `perioperatoria` |
| status | applied (68/68 slugs) |
| manifest | `data/catalog-migration/perioperatoria-completo/manifest.json` |
| lote_pattern | `perioperatoria-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-perioperatoria-*.json` |
| guideline | `—` |
| handcraft_meta | `data/catalog-migration/perioperatoria-completo/handcraft-meta.json` |

**Padrão de lotes repair:** `perioperatoria-repair-v3-g{NN}` · 1º lote: `perioperatoria-repair-v3-g01`

## Ramos L3 (pedagogical_branch)

  - **perioperatorio_pos_operatorio** — Pós-operatório, SRPA, anestesia regional, bloqueio, EXCETO de conduta, analgesia, retenção urinária · genérico morphological · reference_table · vertical · compare
    Âncoras: examples/questao-premium-fundatec-perioperatoria-anestesia-regional-exceto.json, examples/questao-premium-consulplan-perioperatoria-srpa-monitorizacao.json
  - **perioperatorio_pre_operatorio** — Pré-operatório, preparo, jejum, tricotomia, orientação · genérico
    Âncoras: examples/questao-premium-avancasp-perioperatoria-pre-operatorio.json
  - **perioperatorio_protocolo** — Protocolo, sequência, checklist, cirurgia segura, CDC · genérico
    Âncoras: examples/questao-premium-cogeps-perioperatoria-cirurgia-segura-cdc.json
  - **perioperatorio_isc** — ISC, infecção de sítio cirúrgico, classificação de ferida · genérico
    Âncoras: examples/questao-premium-furb-perioperatoria-isc-classificacao.json
  - **perioperatorio_vf** — Certo ou errado, I/II/III, assertivas C/E · genérico
    Âncoras: examples/questao-premium-idecan-srpa-curativo-cpd-ce.json
  - **perioperatorio_generico** — Demais — sem fit claro · genérico
    Âncoras: examples/questao-premium-idecan-perioperatoria-aldrete-srpa.json

## Clusters

- Pré-operatório / preparo
- Pós-operatório / cuidados (âncora v3 Fundatec EXCETO)
- Protocolo / sequência
- Certo ou errado
- ISC / classificação e prevenção
- SRPA / atribuição do técnico
- SRPA / Aldrete e alta
- Cirurgia segura / classificação ferida CDC

## Clinical-depth v3

- Registry: `data/catalog-migration/clinical-depth-v3-anchors.json`
- EXCETO pós-op: `examples/questao-premium-fundatec-perioperatoria-anestesia-regional-exceto.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=perioperatoria-completo --subtopico="Assistência Perioperatória (Inclui SRPA)" --limit=10000
# Handcraft → data/catalog-migration/perioperatoria-repair-v3-g01/questions/*.json
npm run audit:questao-readiness -- --lote=perioperatoria-repair-v3-g01 --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=perioperatoria-repair-v3-g01 --dry-run
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário
