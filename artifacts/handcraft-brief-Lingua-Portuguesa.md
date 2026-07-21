# Handcraft briefing — Língua Portuguesa

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `lingua-portuguesa-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `lingua-portuguesa` |
| status | source_only (0/671 slugs) |
| manifest | `data/sources/lingua-portuguesa/manifest.json` |
| lote_pattern | `lingua-portuguesa-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-portugues-*.json,examples/questao-oracao-subordinada-final.json` |
| guideline | `lib/guidelines/linguaPortuguesa/index.ts` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`
- `catalog:apply-lote --apply sem pedido explícito`
- `publicar referência TecConcursos no JSON`

## Ramos L3 (pedagogical_branch)

  - **pt_crase** — Uso de crase, a/à, testes de crase, locuções adverbiais femininas · morphological · reference_table (funil 3 testes) · tap · compare
    Âncoras: examples/questao-premium-vunesp-portugues-crase-funil.json, examples/questao-premium-vunesp-portugues-crase-lacunas-ioga.json
    Galeria visual: `ready` · `artifacts/questao-review/questao-premium-vunesp-portugues-crase-funil` · brief `artifacts/l3-brief-lingua-portuguesa-pt_crase.md`
  - **pt_pronomes_colocacao** — Próclise, ênclise, mesóclise, colocação pronominal, átonos · morphological · reference_table · tap · compare
  - **pt_pontuacao** — Vírgula, ponto, travessão, sujeito|verbo, aposto, oração restritiva · morphological · reference_table · tap · compare
  - **pt_termos_oracao** — Adjunto, complemento, aposto, vocativo, objeto, agente da passiva · bridge · reference_table · tap · compare
  - **pt_exceto_incorreta** — Comando EXCETO ou INCORRETA em qualquer eixo gramatical · morphological · reference_table · tap · compare
  - **pt_oracoes_subordinadas** — Coordenadas, subordinadas adjetivas/adverbiais/substantivas, reduzidas · morphological · reference_table · tap · compare
    Âncoras: examples/questao-oracao-subordinada-final.json
  - **pt_concordancia** — Concordância verbal e nominal, núcleo do sujeito, casos especiais · morphological · reference_table · tap · compare
  - **pt_regencia** — Regência verbal e nominal, preposição exigida, sentidos do verbo · morphological · reference_table · tap · compare
  - **pt_tipologia** — Gêneros textuais, tipologia, função do texto · morphological · reference_table · tap · compare
  - **pt_coesao_conectivos** — Coesão, coerência, anáfora, conectivos, pronomes relativos como elo · morphological · reference_table · tap · compare
  - **pt_classes_palavras** — Classes gramaticais, formação de palavras, artigo a numeral · morphological · reference_table · tap · compare
    Âncoras: examples/questao-formacao-palavras-siglas.json
  - **pt_verbos** — Tempos, modos, vozes, locução verbal, correlação · morphological · reference_table · tap · compare
  - **pt_sinonimos_polissemia** — Sinônimos, antônimos, polissemia, homônimos, parônimos · morphological · reference_table · tap · compare
  - **pt_denotacao_conotacao** — Denotação, conotação, figuras de linguagem · morphological · reference_table · tap · compare
  - **pt_vocabulo_que_se** — Vocábulo que, partícula se · morphological · reference_table · tap · compare
  - **pt_sintaxe_mesclada** — Questões mescladas de sintaxe — classificar pelo enunciado · morphological · reference_table · tap · compare

## Clusters

- Tipologia (57 · 8.5% — pt_tipologia)
- Coesão/conectivos (35 · 5.2% — pt_coesao_conectivos)
- Classes de palavras (93 · 13.9% — pt_classes_palavras · split no handcraft)
- Verbos (45 · 6.7% — pt_verbos)
- Pronomes+colocação (68 · 10.1% — pt_pronomes_colocacao · L3 P0)
- Sintaxe núcleo (4+14+31+38+8 — vários ramos · merges mescladas)
- Norma: concordância+regência+crase+pontuação (170 · 25.3%)
- Vocabulário (63+33+12 — sinônimos, denotação, que/se)

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`, `catalog:apply-lote --apply sem pedido explícito`, `publicar referência TecConcursos no JSON`.

```bash
npm run catalog:export-lote -- --lote=lingua-portuguesa-completo --subtopico="Língua Portuguesa" --limit=10000
# Handcraft → data/catalog-migration/lingua-portuguesa-g01/questions/*.json
npm run audit:questao-readiness -- --lote=lingua-portuguesa-g01 --strict-v2-pedagogy
npm run validate:goldens -- --lote=lingua-portuguesa-g01 --strict
npm run cluster:lingua-portuguesa
npm run catalog:apply-lote -- --lote=lingua-portuguesa-g01 --dry-run
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário
