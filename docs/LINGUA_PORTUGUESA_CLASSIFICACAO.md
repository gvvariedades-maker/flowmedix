# Língua Portuguesa — classificação, vitrine e caderno

Documento de governança do pacote **Língua Portuguesa** (Técnico de Enfermagem).  
Consolida decisões da conversa de cluster (jul/2026) e aponta para artefatos executáveis.

> **Escopo:** disciplina transversal de **Conhecimentos Básicos** — **não** é um dos 41 subtópicos de Enfermagem em `CLAUDE.md` §9. O pacote tem taxonomia própria (`titulo_aula` por card de estudo).

---

## Fontes e volume

| Item | Valor |
|------|--------|
| PDFs | 4 volumes em `data/sources/lingua-portuguesa/` |
| Questões | **671** (200 + 200 + 200 + 71) |
| Ordenação no PDF | **Por Matéria e Assunto** (TecConcursos) |
| Rótulos Tec distintos | **45** (`source_assunto_tec`) |
| Cards de estudo AVANT | **17** (`titulo_aula`) |
| `modulo_nome` | **Língua Portuguesa** |
| Status | `source_only` — handcraft não iniciado |

Comando de recluster:

```bash
npm run cluster:lingua-portuguesa
```

Relatório: [`artifacts/lingua-portuguesa-topic-cluster-report.json`](../artifacts/lingua-portuguesa-topic-cluster-report.json)

---

## Três camadas de classificação

| Camada | Campo | Quem define | Uso |
|--------|--------|-------------|-----|
| **1 — Card de estudo** | `titulo_aula` (= `meta.subtopico` no JSON) | Mapa AVANT (17 cards) | Vitrine `/estudar`, wizard de caderno, filtro por assunto |
| **2 — Origem Tec** | `source_assunto_tec` (metadado interno) | Rótulo do PDF | Rastreio, auditoria, não aparece como card |
| **3 — Tema real** | Reclassificação no handcraft | Enunciado + gabarito | Prevalece quando rótulo Tec ou card inicial estiver errado |

### Regra “prova primeiro”

Seguir [`docs/TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md):

- Classificar pelo **conteúdo central** da questão, não por palavra solta nem só pelo rótulo Tec.
- O rótulo Tec **não** vira prateleira do produto — entra como metadado de origem.
- **Questões mescladas** (Sintaxe / Pronomes): ignorar o rótulo Tec e classificar pelo enunciado.

### Por que 17 cards (e não 45 Tec nem 12 macro)

| Abordagem | Problema |
|-----------|----------|
| Espelhar ~45 rótulos Tec | Cards fragmentados; cadernos pequenos; UX ruim |
| Só 12 eixos do manifest | Cards largos demais; mistura temas distintos na vitrine |
| **17 cards por jornada de estudo** | ~39 questões/card em média; nomes que o aluno reconhece; funde Tec correlatos |

Regras de tamanho (validadas no cluster):

- **Mínimo ~12** questões/card — senão fundir no handcraft
- **Máximo ~60** questões/card — senão dividir no handcraft

---

## Como a vitrine e o caderno usam isso

### Vitrine (`/estudar`)

- 1 **card** = 1 valor de `titulo_aula` com ≥1 questão publicada em `modulos_estudo`
- Gerado por [`lib/vitrine/buildGroups.ts`](../lib/vitrine/buildGroups.ts) — **não** há cards “à mão”
- **Sem questão no Supabase → sem card** na vitrine

### Caderno

- Wizard e filtros usam **`titulo_aula`** como “assunto” ([`lib/cadernos/templates.ts`](../lib/cadernos/templates.ts))
- O aluno monta lote por assunto canônico (ex.: Crase, Pontuação)

### Campos no JSON publicado

| Campo | Valor típico |
|-------|----------------|
| `meta.topico` | `Língua Portuguesa` |
| `meta.subtopico` | Card canônico (ex.: `Crase`) — repetir em cada slide |
| `modulo_nome` (apply) | `Língua Portuguesa` |
| `titulo_aula` (apply) | Mesmo que `meta.subtopico` |
| `source_assunto_tec` | Metadado interno opcional — rótulo exato do PDF |

**Proibido** publicar referência a TecConcursos no player (enunciado, slides, meta visível).

---

## Os 17 cards canônicos

Mapa completo Tec → card: `scripts/cluster-lingua-portuguesa-topics.py` (`TEC_TO_CARD`) e tabela em `artifacts/lingua-portuguesa-topic-cluster-report.md`.

| Eixo | `titulo_aula` | Qtd | Status cluster |
|------|---------------|-----|----------------|
| A — Texto | Tipologia e gêneros textuais | 57 | ok |
| A — Texto | Coesão, coerência e conectivos | 35 | ok |
| B — Morfologia | Classes de palavras | 93 | split_candidate |
| B — Morfologia | Verbos — tempos, modos e vozes | 45 | ok |
| B — Morfologia | Pronomes e colocação pronominal | 68 | split_candidate |
| C — Sintaxe | Frase, oração e período | 4 | merge_candidate |
| C — Sintaxe | Sujeito e predicado | 14 | ok |
| C — Sintaxe | Termos da oração | 31 | ok |
| C — Sintaxe | Orações coordenadas e subordinadas | 38 | ok |
| C — Sintaxe | Sintaxe — questões mescladas | 8 | merge_candidate |
| D — Norma | Concordância verbal e nominal | 45 | ok |
| D — Norma | Regência verbal e nominal | 32 | ok |
| D — Norma | Crase | 45 | ok |
| D — Norma | Pontuação | 48 | ok |
| E — Vocabulário | Sinônimos, antônimos e polissemia | 63 | split_candidate |
| E — Vocabulário | Denotação, conotação e figuras de linguagem | 33 | ok |
| E — Vocabulário | Vocábulo "que" e partícula "se" | 12 | ok |

### Ajustes previstos no handcraft

| Card | Ação sugerida |
|------|----------------|
| Classes de palavras (93) | Dividir ex.: nominais × funcionais/variáveis |
| Pronomes (68) | Separar colocação pronominal × pronomes (função/classe) |
| Sinônimos (63) | Monitorar; dividir se passar de 60 após reclassificação |
| Frase, oração e período (4) | Fundir com **Sujeito e predicado** |
| Sintaxe mescladas (8) | Classificar caso a caso pelo enunciado |

### Lacuna conhecida

- **Interpretação de texto** não tem rótulo Tec próprio no caderno — questões de leitura tendem a aparecer em **Tipologia** ou blocos com texto longo. No handcraft, reclassificar para card futuro `Interpretação e compreensão de texto` quando o enunciado for predominantemente interpretativo (hoje sem volume clusterizado).

---

## Relação com os 12 eixos do manifest

`data/sources/lingua-portuguesa/manifest.json` → `subtopicos_sugeridos` (12 macro) servem para:

- Skills Brief L3 (`brief-lingua-portuguesa`)
- Planejamento pedagógico macro

Os **17 cards** são a camada **produto** (vitrine + caderno). Não são espelho 1:1 dos 12 macro.

---

## Moldes L3 — prioridade

Índice: [`artifacts/l3-brief-lingua-portuguesa-index.md`](../artifacts/l3-brief-lingua-portuguesa-index.md)  
Playbook: [`data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json`](../data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json)  
Brief + metáforas: [`.cursor/skills/brief-lingua-portuguesa/`](../.cursor/skills/brief-lingua-portuguesa/SKILL.md) · [`reference-metaforas.md`](../.cursor/skills/brief-lingua-portuguesa/reference-metaforas.md) · [`reference-ramos.md`](../.cursor/skills/brief-lingua-portuguesa/reference-ramos.md)

### Guidelines P0 (já no código)

**Doc canônico:** [`docs/LINGUA_PORTUGUESA_GUIDELINES.md`](LINGUA_PORTUGUESA_GUIDELINES.md) — funil crase, colocação, uso no handcraft, roadmap P1.

| Card | Arquivo | Entries |
|------|---------|---------|
| Crase | [`lib/guidelines/linguaPortuguesa/crase.ts`](../lib/guidelines/linguaPortuguesa/crase.ts) | funil 3 testes + locuções + horas + pegadinhas |
| Pronomes e colocação pronominal | [`lib/guidelines/linguaPortuguesa/colocacaoPronominal.ts`](../lib/guidelines/linguaPortuguesa/colocacaoPronominal.ts) | próclise / ênclise / mesóclise + atrativos |

Índice: [`lib/guidelines/linguaPortuguesa/index.ts`](../lib/guidelines/linguaPortuguesa/index.ts) · mapeado em `SUBTOPICO_GUIDELINE_IDS` para `Língua Portuguesa`, `Crase`, `Pronomes e colocação pronominal`.

**Ramos fortes (molde bespoke candidato):**

1. **Crase** (45) — `pt-crase-funnel`
2. **Colocação pronominal** (31 no Tec; card Pronomes 68) — `pt-clitic-rail`
4. **Termos da oração** (31) — `pt-term-matrix`
5. **EXCETO/INCORRETA** (transversal) — `pt-exceto-arena`
6. **Tipologia** (57) — genérico premium inicial; bespoke se volume de `text_fragment` alto

Antes do 1º lote de handcraft em escala: `Mapeamento L3: Língua Portuguesa` — [`docs/L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md).

---

## Pipeline e triggers

| Trigger | Quando |
|---------|--------|
| `Mapeamento L3: Língua Portuguesa` | Antes do 1º lote — cluster já feito; falta audit L3 + brief 4/4 |
| `Handcraft: Língua Portuguesa` + lote gNN | Produção golden-v1 a partir dos PDFs |
| `Pipeline completo: Língua Portuguesa` | Handcraft + qualidade vendável (quando houver slugs) |

Skills obrigatórias: ver [`data/sources/lingua-portuguesa/README.md`](../data/sources/lingua-portuguesa/README.md).

Registry: [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json) → pacote `Língua Portuguesa`.

---

## O que ainda não existe (próximos passos)

- [x] Guideline P0 — Crase + Colocação (`lib/guidelines/linguaPortuguesa/`)
- [x] Guideline P1 — Pontuação, Concordância, Regência
- [x] Guideline P2 — Termos, Orações, Tipologia, Sujeito/predicado
- [x] Guideline P3 — Classes, formação, verbos, coesão, vocabulário, que/se
- [ ] `BRANCH_DESIGN_MAP` / `SUBTOPIC_DESIGN_MAP` para PT em código
- [x] Âncoras golden Crase + Colocação + Pontuação + Termos + Concordância
- [ ] Handcraft g01+ em escala para cards restantes
- [x] Brief 4/4 ramos fortes principais (`artifacts/l3-brief-lingua-portuguesa-*.md`)
- [ ] Brief 4/4 `pt_exceto_incorreta` e captures pendentes (concordância L3)

---

## Referências

| Arquivo | Uso |
|---------|-----|
| [`docs/LINGUA_PORTUGUESA_CLASSIFICACAO.md`](LINGUA_PORTUGUESA_CLASSIFICACAO.md) | Cards, vitrine, cluster |
| [`docs/LINGUA_PORTUGUESA_GUIDELINES.md`](LINGUA_PORTUGUESA_GUIDELINES.md) | Guidelines P0 (crase + colocação) |
| [`docs/LINGUA_PORTUGUESA_ELIAS_METODO.md`](LINGUA_PORTUGUESA_ELIAS_METODO.md) | Persona morfossintaxe Gran — M01–M16, fontes, scripts |
| [`data/sources/lingua-portuguesa/manifest.json`](../data/sources/lingua-portuguesa/manifest.json) | Fontes PDF, `titulo_aula_canonicos` |
| [`scripts/cluster-lingua-portuguesa-topics.py`](../scripts/cluster-lingua-portuguesa-topics.py) | Extração + mapa Tec → card |
| [`docs/TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md) | Prova primeiro |
| [`docs/GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | Runbook handcraft |
| [`docs/HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) | Trigger `Handcraft:` |
