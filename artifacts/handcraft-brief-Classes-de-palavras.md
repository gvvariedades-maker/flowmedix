# Handcraft briefing — Classes de palavras

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `classes-de-palavras-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `classes-de-palavras` |
| status | applied (93/93 slugs) |
| manifest | `data/catalog-migration/classes-de-palavras-completo/manifest.json` |
| lote_pattern | `classes-de-palavras-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-portugues-classes-*.json,examples/questao-formacao-palavras-siglas.json` |
| guideline | `lib/guidelines/linguaPortuguesa/classesPalavras.ts` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`
- `catalog:apply-lote --apply sem pedido explícito`
- `publicar referência TecConcursos no JSON`
- `handcraft em massa / gNN nesta conversa Âncoras 100%`
- `forçar ADME/EV/regência completa/pt-period-rail quando a prova pede só classe morfológica`
- `fechar ramo com só 1 âncora (política anchors_per_branch=2)`

## Ramos L3 (pedagogical_branch)

  - **pt_classes_conjuncao** — Conjunção coordenativa/subordinativa; valor semântico do conectivo como CLASSE (adversativa, causal, concessiva, conclusiva, proporcional, condicional); reescrita mas→porém; oposição Todavia/Entretanto · morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-vunesp-portugues-classes-conjuncao-causal.json, examples/questao-premium-quadrix-portugues-classes-conjuncao-adversativa.json
  - **pt_classes_nominais** — Artigo (definido/indefinido); substantivo (comum/próprio/coletivo/abstrato); substantivação (artigo+cor/qualidade); adjetivo (grau, flexão, função adjetiva); numeral (cardinal/ordinal); adj×substantivo · morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-avancasp-portugues-classes-artigo-definido.json, examples/questao-premium-avancasp-portugues-classes-substantivacao-cinza.json
  - **pt_classes_adverbio** — Advérbio (modo, tempo, lugar, intensidade); locução adverbial; palavra de forma adjetiva com função adverbial (alto, rápido); adv×adj · morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-educa-pb-portugues-classes-adverbio-essencialmente.json, examples/questao-premium-avancasp-portugues-classes-adv-x-adj-alto.json
  - **pt_classes_preposicao** — Preposição essencial; locução prepositiva; «a» prep × artigo; prep × conjunção; valor da preposição (causa, finalidade) quando a prova cobra CLASSE/função da peça — não regência completa (→ pt_regencia) · morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-avancasp-portugues-classes-prep-x-artigo.json, examples/questao-premium-apice-portugues-classes-locucao-prepositiva.json
  - **pt_classes_exceto** — Comando EXCETO ou INCORRETA (ou «valor semântico INCORRETO») no eixo classes de palavras / conectivo como classe · morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-avancasp-portugues-classes-exceto-adverbio.json, examples/questao-premium-aocp-portugues-classes-valor-incorreto-como.json
  - **pt_classes_generico** — VF / I–II–III multi-classe; dupla classe da mesma forma; formação/siglas residual neste card; classificação mesclada sem fit nos ramos acima; umbrella legado `pt_classes_palavras` · morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-avancasp-portugues-classes-vf-tirinha-multiclasse.json, examples/questao-formacao-palavras-siglas.json

## Clusters

- Conjunção / valor semântico do conectivo como classe (~28–35 · ~30% — pt_classes_conjuncao · 2 âncoras: causal + adversativa)
- Nominais — artigo · substantivo · substantivação · adjetivo · numeral (~15–25 · pt_classes_nominais · 2: artigo + substantivação)
- Advérbio / locução adverbial / adv×adj (~14 · pt_classes_adverbio · 2: modo/intensidade + adv×adj)
- Preposição / loc. prepositiva / prep×artigo (~7 · pt_classes_preposicao · 2: prep×artigo + locução)
- EXCETO / INCORRETA no eixo classes (~5 · pt_classes_exceto · 2: EXCETO classe + valor INCORRETO)
- Cauda — VF multi-classe · formação residual (pt_classes_generico · 2: VF multi-classe + formação/siglas)

## Gramática golden-v1 (4 slides)

- **concept_map:** Pergunta-teste M02 + classe em disputa — SEM gabarito/letra
- **golden_rule:** rows: peça × teste portátil — SEM row «Gabarito letra X»
- **logic_flow:** Único lugar com eliminação + gabarito; reveal_mode tap (ou board 0 taps Glance OS)
- **danger_zone:** correct único por item; ≥1 transferência «Em outra banca…»

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`, `catalog:apply-lote --apply sem pedido explícito`, `publicar referência TecConcursos no JSON`, `handcraft em massa / gNN nesta conversa Âncoras 100%`, `forçar ADME/EV/regência completa/pt-period-rail quando a prova pede só classe morfológica`, `fechar ramo com só 1 âncora (política anchors_per_branch=2)`.

```bash
npm run catalog:export-lote -- --lote=classes-de-palavras-completo --subtopico="Classes de palavras" --limit=10000
# Handcraft → data/catalog-migration/classes-de-palavras-g01/questions/*.json
npm run validate:goldens -- --lote=classes-de-palavras-g01 --strict
npm run audit:questao-readiness -- --lote=classes-de-palavras-g01 --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=classes-de-palavras-g01 --dry-run
# apply SOMENTE se usuário pedir:
npm run catalog:apply-lote -- --lote=classes-de-palavras-g01 --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário
