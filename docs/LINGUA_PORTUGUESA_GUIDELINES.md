# Língua Portuguesa — Guidelines (norma de concurso)

Referência estruturada para handcraft golden-v1 de **Língua Portuguesa** (Conhecimentos Básicos / Técnico de Enfermagem).

> **Não bloqueia handcraft.** Guideline é **auxiliar** — a verdade de cada slug continua no handcraft da questão. Ver [`FONTE_NORMATIVA_AVANT.md`](FONTE_NORMATIVA_AVANT.md).

Relacionados: [`LINGUA_PORTUGUESA_CLASSIFICACAO.md`](LINGUA_PORTUGUESA_CLASSIFICACAO.md) · playbook `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json`

---

## Guideline × Skill × Handcraft

| Camada | Onde | Função |
|--------|------|--------|
| **Skill** `professor-lingua-portuguesa-concurso` | `.cursor/skills/…` | Tom, método, bancas, pegadinhas em prosa |
| **Skill** `brief-lingua-portuguesa` | `.cursor/skills/…` | Brief L3 + metáfora visual, genérico vs bespoke |
| **Guideline** | `lib/guidelines/linguaPortuguesa/*.ts` | Regras portáteis **estruturadas** (label/value/detail) para agente e `meta.sources` |
| **Handcraft** | `data/catalog-migration/lingua-portuguesa-gNN/` | Conteúdo bespoke da **questão** (slides 4/4) |

A guideline responde: *qual regra mínima e portátil cobrar neste tipo de item?*  
O handcraft responde: *como ensinar **esta** prova, com **estas** alternativas?*

---

## Estrutura no código

```
lib/guidelines/linguaPortuguesa/
  crase.ts                 # PT_CRASE_CONCURSOS (P0)
  colocacaoPronominal.ts   # PT_COLOCACAO_PRONOMINAL (P0)
  pontuacao.ts             # PT_PONTUACAO (P1)
  concordancia.ts          # PT_CONCORDANCIA (P1)
  regencia.ts              # PT_REGENCIA (P1)
  termosOracao.ts          # PT_TERMOS_ORACAO (P2)
  oracoesSubordinadas.ts   # PT_ORACOES_SUBORDINADAS (P2)
  tipologia.ts             # PT_TIPOLOGIA (P2)
  sujeitoPredicado.ts      # PT_SUJEITO_PREDICADO (P2)
  classesPalavras.ts       # PT_CLASSES_PALAVRAS (P3)
  formacaoPalavras.ts      # PT_FORMACAO_PALAVRAS (P3)
  verbos.ts                # PT_VERBOS (P3)
  coesaoConectivos.ts      # PT_COESAO_CONECTIVOS (P3)
  sinonimosPolissemia.ts   # PT_SINONIMOS_POLISSEMIA (P3)
  denotacaoConotacao.ts    # PT_DENOTACAO_CONOTACAO (P3)
  vocabuloQueSe.ts         # PT_VOCABULO_QUE_SE (P3)
  index.ts                 # merge P0–P3 + getters
```

Registro global: [`lib/guidelines/index.ts`](../lib/guidelines/index.ts)

| Export | ID da tabela |
|--------|----------------|
| `PT_CRASE_CONCURSOS` | `pt-crase-concursos` |
| `PT_COLOCACAO_PRONOMINAL` | `pt-colocacao-pronominal` |
| `PT_PONTUACAO` | `pt-pontuacao-concursos` |
| `PT_CONCORDANCIA` | `pt-concordancia-concursos` |
| `PT_REGENCIA` | `pt-regencia-concursos` |
| `PT_TERMOS_ORACAO` | `pt-termos-oracao-concursos` |
| `PT_ORACOES_SUBORDINADAS` | `pt-oracoes-subordinadas-concursos` |
| `PT_TIPOLOGIA` | `pt-tipologia-concursos` |
| `PT_SUJEITO_PREDICADO` | `pt-sujeito-predicado-concursos` |
| `PT_CLASSES_PALAVRAS` | `pt-classes-palavras-concursos` |
| `PT_FORMACAO_PALAVRAS` | `pt-formacao-palavras-concursos` |
| `PT_VERBOS` | `pt-verbos-concursos` |
| `PT_COESAO_CONECTIVOS` | `pt-coesao-conectivos-concursos` |
| `PT_SINONIMOS_POLISSEMIA` | `pt-sinonimos-polissemia-concursos` |
| `PT_DENOTACAO_CONOTACAO` | `pt-denotacao-conotacao-concursos` |
| `PT_VOCABULO_QUE_SE` | `pt-vocabulo-que-se-concursos` |

### Mapeamento `SUBTOPICO_GUIDELINE_IDS`

| Chave | Tabelas |
|-------|---------|
| `Crase` | `pt-crase-concursos` |
| `Pronomes e colocação pronominal` | `pt-colocacao-pronominal` |
| `Pontuação` | `pt-pontuacao-concursos` |
| `Concordância verbal e nominal` | `pt-concordancia-concursos` |
| `Regência verbal e nominal` | `pt-regencia-concursos` |
| `Termos da oração` | `pt-termos-oracao-concursos` |
| `Orações coordenadas e subordinadas` | `pt-oracoes-subordinadas-concursos` |
| `Tipologia e gêneros textuais` | `pt-tipologia-concursos` |
| `Sujeito e predicado` / `Frase, oração e período` | `pt-sujeito-predicado-concursos` |
| `Classes de palavras` | `pt-classes-palavras` + `pt-formacao-palavras` |
| `Verbos — tempos, modos e vozes` | `pt-verbos-concursos` |
| `Coesão, coerência e conectivos` | `pt-coesao-conectivos-concursos` |
| `Sinônimos, antônimos e polissemia` | `pt-sinonimos-polissemia-concursos` |
| `Denotação, conotação e figuras de linguagem` | `pt-denotacao-conotacao-concursos` |
| `Vocábulo "que" e partícula "se"` | `pt-vocabulo-que-se-concursos` |
| `Sintaxe — questões mescladas` | merge sujeito + termos + orações |
| `Língua Portuguesa` | merge de todas as 16 tabelas |

Uso em código:

```typescript
import { getGuidelineForSubtopico } from '@/lib/guidelines';

const g = getGuidelineForSubtopico('Crase');
// ou getGuidelineForSubtopico('Pronomes e colocação pronominal')
```

---

## P0 — Crase (45 questões no cluster)

**Arquivo:** [`lib/guidelines/linguaPortuguesa/crase.ts`](../lib/guidelines/linguaPortuguesa/crase.ts)  
**Card vitrine:** `Crase`  
**Ramo L3:** `pt_crase` → molde alvo `pt-crase-funnel`

**Âncora golden (Q506):** [`PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md`](PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md) · JSON [`examples/questao-premium-vunesp-portugues-crase-funil.json`](../examples/questao-premium-vunesp-portugues-crase-funil.json)

### Funil de 3 testes (golden_rule)

| Ordem | Teste | Resultado típico |
|-------|--------|------------------|
| 1 | Substantivo **masculino**? | Sem crase |
| 2 | Palavra seguinte é **verbo**? | Sem crase |
| 3 | Prep. **a** + artigo **a** feminino? | **Com** crase (à / às) |

**Teste portátil:** substituir por **ao** (masculino) — se couber, no feminino tende a **à**.

### Entries principais

- Locuções adverbiais femininas (`às vezes`, `à noite`, `à toa`)
- Locuções prepositivas (`à frente de`, `à espera de`)
- Horas (`às 8h`, `à 1h`)
- Pronomes demonstrativos (`àquela` × `a esta`)
- Casa/terra/distância (própria × determinada)
- Pegadinha: crase “automática” antes de qualquer feminino

**Fonte tier A (metadado):** norma culta — Bechara / Cunha & Cintra; Academia Brasileira de Letras.

---

## P0 — Colocação pronominal (68 no card; 31 só Colocação Tec)

**Arquivo:** [`lib/guidelines/linguaPortuguesa/colocacaoPronominal.ts`](../lib/guidelines/linguaPortuguesa/colocacaoPronominal.ts)  
**Card vitrine:** `Pronomes e colocação pronominal`  
**Ramo L3:** `pt_pronomes_colocacao` → molde alvo `pt-clitic-rail`

### Três posições

| Posição | Exemplo | Quando (norma culta) |
|---------|---------|----------------------|
| **Próclise** | não **me** diga | Palavra **atrativa** antes do verbo |
| **Ênclise** | diga-**me** | Verbo inicia período; sem atrativo |
| **Mesóclise** | dir-**lhe**-ei | Futuro do presente/pretérito **sem** atrativo |

### Atrativos (próclise)

Negação (`não`, `nunca`), relativos (`que`, `quem`), indefinidos (`ninguém`, `tudo`), interrogativos, advérbios (`sempre`, `já`, `talvez`…).

### Regras de prova frequentes

- Imperativo **afirmativo** → ênclise; **negativo** → próclise
- Futuro + atrativo → próclise (não mesóclise)
- Particípio → não admite ênclise (ênclise no auxiliar)
- Após R/S/Z: `o/a` → `lo/la` (`fazê-lo`, `amá-la`)
- Pegadinha: próclise no início (“Me diga”) na norma culta de concurso

---

## Uso no handcraft (agente)

1. Abrir guideline do **card** (`meta.subtopico`), não só “Língua Portuguesa”.
2. Escolher 3–6 `entries` relevantes à **frase da prova**.
3. Espalhar em `golden_rule.rows` e passos do `logic_flow` (funil / atrativo).
4. Registrar em `meta.sources[]` (tier A/B) — issuer da tabela + gramática de prova.
5. Se gabarito da banca ≠ regra geral → `content_review.exam_vs_current`.

**Não** copiar todas as entries em todo slug. **Não** usar guideline como texto genérico no `danger_zone`.

### Exemplo `meta.sources` (interno)

```json
{
  "tier": "A",
  "label": "Norma culta — crase (funil 3 testes)",
  "url": "https://www.academia.org.br/",
  "guideline_snapshot": "pt-crase-concursos"
}
```

---

## Testes

```bash
npx jest __tests__/lib/guidelines/linguaPortuguesaP0.test.ts
```

Cobre: ≥10 entries por tabela, índice global, merge por `titulo_aula`.

---

## Roadmap P1–P3

| Prioridade | Card | Arquivo | Status |
|------------|------|---------|--------|
| P1 | Pontuação | `pontuacao.ts` | ✅ |
| P1 | Concordância verbal e nominal | `concordancia.ts` | ✅ |
| P1 | Regência verbal e nominal | `regencia.ts` | ✅ |
| P2 | Termos da oração | `termosOracao.ts` | ✅ |
| P2 | Orações coordenadas e subordinadas | `oracoesSubordinadas.ts` | ✅ |
| P2 | Tipologia / interpretação | `tipologia.ts` | ✅ |
| P2 | Sujeito e predicado / Frase, oração e período | `sujeitoPredicado.ts` | ✅ |
| P3 | Classes de palavras | `classesPalavras.ts` | ✅ |
| P3 | Formação de palavras | `formacaoPalavras.ts` | ✅ |
| P3 | Verbos | `verbos.ts` | ✅ |
| P3 | Coesão e conectivos | `coesaoConectivos.ts` | ✅ |
| P3 | Sinônimos e polissemia | `sinonimosPolissemia.ts` | ✅ |
| P3 | Denotação e figuras | `denotacaoConotacao.ts` | ✅ |
| P3 | Vocábulo que / partícula se | `vocabuloQueSe.ts` | ✅ |

Após cada arquivo novo:

1. Export em `linguaPortuguesa/index.ts`
2. Entrada em `GUIDELINE_TABLES` + `SUBTOPICO_GUIDELINE_IDS`
3. Teste em `linguaPortuguesaP0.test.ts` ou arquivo por fase
4. Atualizar esta doc e `reference-pegadinhas.md` se houver pegadinha nova

---

## Figuras no enunciado (tirinha, charge, HQ, cartaz)

Toda questão PT que referencia material visual **deve** ter asset ou transcrição antes do apply. Gate: `l2_missing_figure` com `--strict-v2-pedagogy`.

| Política | Quando | O que fazer |
|----------|--------|-------------|
| `required` | Charge/tirinha/HQ só legível em raster | `figures[]` + WebP no bucket `questao-figures/` |
| `transcribed` | Tipografia/cartaz legível no PDF | `text_fragment` fiel (≥ 20 chars) |

**Proibido em handcraft:** placeholders como `(HQ em quadrinhos — adaptado)` — o gate detecta e bloqueia.

### Pipeline por lote (obrigatório PT)

```bash
# Inventário do lote ou disciplina inteira
npm run figures:audit -- --lote=classes-de-palavras-g07
npm run figures:audit -- --disciplina=portugues

# Backfill raster (PDF → WebP → upload → patch JSON)
npm run figures:backfill-pt -- --write --slug=<slug>
npm run figures:backfill-pt -- --write --from-audit   # após audit disciplina=portugues

# Transcrição tipográfica (sem raster)
npm run figures:patch-classes -- --write   # legado Classes; copiar padrão para novos slugs
```

Ordem no player: `figures[]` → `text_fragment` → `instruction`. Ver [`DECISAO_QUESTAO_FIGURES.md`](DECISAO_QUESTAO_FIGURES.md).

---

## Referências cruzadas

| Artefato | Link |
|----------|------|
| Pegadinhas (prosa) | `.cursor/skills/professor-lingua-portuguesa-concurso/reference-pegadinhas.md` |
| Metáforas L3 + brief | `.cursor/skills/brief-lingua-portuguesa/` (`SKILL.md`, `reference-metaforas.md`, `reference-ramos.md`) |
| Cluster 671 PDFs | `artifacts/lingua-portuguesa-topic-cluster-report.json` |
| Playbook | `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json` |
| Prompt âncora Q506 | [`PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md`](PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md) |
| Registry | `handcraft-registry.json` → `Língua Portuguesa` |
