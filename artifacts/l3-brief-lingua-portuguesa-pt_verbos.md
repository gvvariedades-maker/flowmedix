# Brief L3 — `pt_verbos` (ok_generico)

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Verbos — tempos, modos e vozes |
| `pacote_prefix` | `verbos-tempos-modos-e-vozes` |
| `branch_id` | `pt_verbos` |
| Decisão L3 | `ok_generico` |
| Famílias típicas | `certo_errado` · `conceito` · `vf` |
| Guideline | `lib/guidelines/linguaPortuguesa/verbos.ts` |
| Persona conteúdo | `professor-lingua-portuguesa-concurso` + M14 Elias (pergunta-teste tempo/modo) |

## Metáfora única 4/4

**Linha do tempo verbal** — o verbo na prova ocupa um ponto na linha: **quando** (tempo) × **atitude** (modo) × **voz** (ativa/passiva/reflexiva).

**Erro espacial (1 frase):** confundir tempo com modo ou aplicar regra de um tempo em outro contexto (ex.: imperfeito de fundo × perfeito pontual).

**Pergunta-teste M14:** Qual tempo/modo? A ação é anterior, simultânea ou posterior?

## Teste espacial 3/3

| # | Critério | Resultado |
|---|----------|-----------|
| 1 | Pegadinha é espacial (tempo/modo/voz)? | Sim — mas resolvível sem molde React |
| 2 | Genérico premium (`rows` + `tap` + `compare`) ensina? | **3/3** |
| 3 | Bespoke obrigatório? | **Não** |

## Pacote L3 (layouts automáticos — sem `layout_variant` no JSON)

| # player | `type` | Layout auto | Metáfora |
|---------:|--------|-------------|----------|
| 1 | `concept_map` | `morphological` | Núcleos tempo/modo/voz + pegadinha da questão |
| 2 | `logic_flow` | `vertical` + `reveal_mode: "tap"` | Pergunta-teste → eliminar → gabarito |
| 3 | `golden_rule` | `reference_table` (`rows`) | Decore: tempos, modos, vozes, locução, correlação |
| 4 | `danger_zone` | `compare` | Cada letra: erro × `correct` único |

## Slots por slide (handcraft Modo A)

### `concept_map`

| Slot | Papel | Exemplo |
|------|-------|---------|
| Tempo | quando na linha | Presente / pretérito / futuro |
| Modo | atitude | Indicativo / subjuntivo / imperativo |
| Voz | sujeito ativo ou paciente | Ativa / passiva / reflexiva |
| Pegadinha | erro da prova | Particípio irregular · correlação · locução |

Ícones: `Clock`, `Activity`, `Repeat`, `AlertTriangle`

### `logic_flow` (tap)

1. Ler comando — identifica tempo, modo ou voz cobrado
2. Aplicar pergunta-teste M14 na frase/enunciado
3. Eliminar letras que violam tempo/modo/voz
4. Gabarito letra X
5. Em similares: linha do tempo + modo antes de marcar

### `golden_rule` (`rows`)

Portar de `PT_VERBOS.entries` + caso da questão. Sem row "Gabarito letra X".

### `danger_zone` (`compare`)

Cada `items[].correct` explica **por que a alternativa seria certa** se o gabarito fosse outro — sem repetir texto entre letras.

## Retenção visual (checklist 4/4)

| Lei | Aplicação |
|-----|-----------|
| Erro espacial | Linha do tempo deixa óbvio imperfeito (fundo) vs perfeito (pontual) |
| Metáfora única | Mesma linha nos 4 slides |
| Chunking | ≤4 items concept_map · ≤5 rows golden_rule |
| Toque com significado | Cada tap do logic_flow muda eliminação |
| Contraste calibrado | danger_zone: quase-erro × regra |
| Transferência | footer_rule: "Tempo = quando · Modo = atitude" |

## Handoff

- **React bespoke:** dispensado (`ok_generico`)
- **Handcraft:** `verbos-tempos-modos-e-vozes-g01` … `g06`
- **Âncora:** `examples/questao-premium-vunesp-portugues-verbos-mais-que-perfeito-sjrp.json` ([READY] 2026-07-23 · tec 3789241 · gab. D · mais-que-perfeito composto↔simples)
- **Run-state:** `artifacts/pipeline-run-state-verbos-tempos-modos-e-vozes.json` → next=`handcraft_lote:g01`
