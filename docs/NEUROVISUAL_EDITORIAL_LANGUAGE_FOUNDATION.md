# NeuroVisual Lote 1B — Editorial Language Foundation

**Status:** fundação editorial de pré-natal aprovada e generalizada para parto humanizado em shadow
**Escopo:** `cpcon-saude-mulher-pre-natal-vf` e `admtec-saude-mulher-parto-humanizado-vf`
**Fora de escopo:** outras quatro âncoras, player, Supabase, rollout e coortes 246/268/244

## 1. Decisão

O Lote 1B introduz a etapa intermediária:

```text
conteúdo canônico
  → síntese editorial source-backed
  → direção de arte declarativa
  → primitives allowlisted
  → canvas infográfico fechado
```

O renderer não corta frases, não executa templates e não infere fatos clínicos. Toda redação abreviada é um átomo editorial com proveniência RFC 6901 e permanece em `review_pending` até revisão humana.

## 2. Autoridade e separação

| Objeto | Path | Autoridade | Pode conter |
|---|---|---|---|
| síntese authoring | `data/neurovisual/editorial-synthesis/saude-da-mulher-anchors-v1/<slug>.editorial-synthesis.json` | editorial humana | estado, revisão, método, proveniência e projeção candidata |
| runtime plan derivado | `data/neurovisual/runtime-plans/saude-da-mulher-anchors-v1/<slug>.runtime-plan.json` | compilador shadow | apenas texto exibível, ligações de origem e direção de arte mínima |
| sidecar derivado | `data/neurovisual/authoring/saude-da-mulher-anchors-v1/<slug>.authoring.json` | compilador shadow | síntese authoring completa, perfil, decisões, validação e evidências |
| capturas/relatórios | `artifacts/neurovisual/saude-da-mulher-anchors-v1/shadow-v1b-*/` | QA | evidência descartável; nunca payload do aluno |

`reviewer_id`, scores, candidatos, justificativas e traces não entram no runtime plan. O estado `review_pending` não equivale a aprovação nem autoriza rollout.

## 3. Contrato de síntese editorial v1

Cada slide declara:

- `headline`;
- `dominant_fact`, quando houver;
- `keywords`;
- `contrast_pairs`;
- `warning` e `mnemonic`, quando houver;
- `facts`, entre 1 e 7 no piloto;
- `art_direction` com herói, direção, densidade e sequência de primitives.

Cada átomo de texto contém:

```json
{
  "text": "6+",
  "source_pointers": ["/reverse_study_slides/2/rows/2/value"],
  "derivation": "manual_source_backed"
}
```

Derivações fechadas:

| derivação | regra |
|---|---|
| `verbatim` | igualdade exata com o valor fonte |
| `extractive` | trecho contido na fonte após normalização NFC, caixa e espaços |
| `manual_source_backed` | síntese humana ligada a uma ou mais fontes resolvíveis; exige revisão pedagógica |

Reticências e truncamento automático são proibidos.

## 4. Bindings atômicos

Um fato pode declarar separadamente:

- `label`: o que o fato nomeia;
- `value`: valor decisivo;
- `unit`: unidade inseparável do valor;
- `condition`: quando a regra vale;
- `opposition`: erro ou polo contrastante;
- `exception`: limite ou ressalva.

O problema `critical-number-atomic-bindings` só é encerrado quando valor, unidade e condição estão presentes e validados; uma frase inteira em um slot não satisfaz o contrato.

## 5. Allowlist editorial v1

O runtime aceita somente:

1. `EditorialCanvas`;
2. `HeadlineLockup`;
3. `KeywordRibbon`;
4. `NumberHero`;
5. `ContrastPair`;
6. `WrongRightLockup`;
7. `ArrowPath`;
8. `TimelineSpine`;
9. `CentralConceptOrbit`;
10. `MnemonicStrip`;
11. `IconFact`;
12. `EditorialSticker`.
13. `DecisionFunnel`;
14. `EditorialDeck`.

Código, HTML, CSS, templates livres e nomes fora da allowlist reprovam a síntese.

## 6. Tipografia e canvas

- display: Plus Jakarta Sans 800, já carregada pelo AVANT;
- corpo: DM Sans;
- metadado: JetBrains Mono;
- escala: no mínimo três níveis perceptíveis;
- caixa-alta: seletiva para headline, rótulo e número;
- cor: papel semântico, nunca decoração isolada;
- canvas: `3:4` abaixo de 620 px e `4:3` a partir de 620 px;
- overflow interno: proibido;
- conteúdo oculto: proibido;
- metadados técnicos: fora de `[data-editorial-canvas]`.

## 7. Iconografia original

A biblioteca do piloto contém onze SVGs AVANT desenhados para este corte: pré-natal, calendário, ácido fólico, consulta, não fumar, certo/errado, alívio em água, acompanhante, mobilidade, clampeamento e monitorização fetal. Eles usam `currentColor`, `viewBox 0 0 64 64`, traço uniforme e sem assets externos. Os modelos locais serviram apenas como referência de densidade e acabamento; nenhum path do ZIP ou de marcas externas foi copiado.

## 8. Gate humano de linguagem editorial

Para cada slide, registrar separadamente:

| pergunta | resultado permitido |
|---|---|
| parece mini-infográfico, não dashboard? | pass/fail |
| a ideia dominante aparece em até dois segundos? | pass/fail |
| há pelo menos três níveis tipográficos? | pass/fail |
| a cor codifica decisão ou relação? | pass/fail |
| a relação espacial precede a leitura detalhada? | pass/fail |
| há variação de escala e forma sem decoração vazia? | pass/fail |
| o conteúdo e o gabarito permanecem fiéis às fontes? | pass/fail pedagógico |
| aproxima a linguagem das referências sem copiar peças? | pass/fail |

Falha em dois itens visuais ou em qualquer item pedagógico bloqueia a expansão além de pré-natal e parto humanizado.

## 9. Referências → princípios → implementação original

| referências | princípio extraído | implementação AVANT |
|---|---|---|
| `ref-030`, `ref-046`, `ref-087` | percurso, dependência e direção explícitos | `TimelineSpine` e `ArrowPath`, com ícones originais de pré-natal |
| `ref-002`, `ref-012`, `ref-065`, `ref-075` | erro e correção adjacentes | `WrongRightLockup`, quatro alternativas simultâneas |
| `ref-016`, `ref-022`, `ref-080` | decomposição curta e fórmula visual | bindings atômicos e `MnemonicStrip` |
| `ref-039`, `ref-054`, `ref-056` | hierarquia percebida antes do detalhe | headline dominante, fatos subordinados e conectores |
| `ref-049`, `ref-085` | tipografia isolada não basta | descartadas como direção completa; só hierarquia tipográfica aproveitada |

As 91 referências permanecem evidência externa temporária. O Lote 1B não autoriza copiar ilustrações, personagens, marcas, textos ou composições integrais e não cria novos gestos.
