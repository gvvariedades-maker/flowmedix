# NeuroVisual Lote 1B — revisão da amostra pré-natal

**Status:** `PRENATAL_EDITORIAL_FOUNDATION_READY_FOR_HUMAN_REVIEW`
**URL:** `http://127.0.0.1:3017/dev/neurovisual-shadow?anchor=cpcon-saude-mulher-pre-natal-vf`
**Run:** `shadow-v1b-ff3f92d9d824`
**Rollout:** off
**Player/Supabase:** não alterados

## Escopo efetivo

- reconstruídos: quatro slides de `cpcon-saude-mulher-pre-natal-vf`;
- preservado sem expansão: parto e as outras quatro âncoras;
- coorte de compilação: manifesto explícito de seis membros;
- coortes 246/268/244: não lidas;
- referências externas: nenhum asset copiado ou versionado;
- commit, push e PR: não realizados.

## Antes × depois

| slide | antes | Lote 1B |
|---|---|---|
| `concept_map` | quatro blocos semelhantes sobre um rail | manchete dominante, palavras-chave, marco de 1º trimestre, percurso com quatro estações e iconografia original |
| `logic_flow` | etapas verticais completas, ainda próximas de uma pilha | três julgamentos simultâneos convergindo visualmente para a alternativa B; oposição da assertiva III adjacente |
| `golden_rule` | frase-herói e blocos equivalentes | `1º`, `6+` e `24–28` organizam o canvas; condição, unidade e oposição estão separadas |
| `danger_zone` | quatro pares em caixas repetidas | tabela editorial compacta de letra → erro → correção, com `III É FALSA` como âncora |

## Contrato e runtime

- `neuro-editorial-synthesis-v1` separa headline, fato dominante, keywords, contrastes, warning, mnemônico e fatos atômicos;
- fatos atômicos admitem `label`, `value`, `unit`, `condition`, `opposition` e `exception`;
- toda string tem ponteiro RFC 6901 e derivação `verbatim`, `extractive` ou `manual_source_backed`;
- reticências e truncamento automático reprovam o plano;
- roots fora do slide reprovam o plano;
- 12 primitives formam allowlist fechada;
- o runtime não contém `reviewer_id`, scores, candidatos, justificativas ou decision trace;
- o authoring permanece `review_pending`; isso não aprova nem autoriza rollout.

## Primitives e SVGs

Primitives criadas: `EditorialCanvas`, `HeadlineLockup`, `KeywordRibbon`, `NumberHero`, `ContrastPair`, `WrongRightLockup`, `ArrowPath`, `TimelineSpine`, `CentralConceptOrbit`, `MnemonicStrip`, `IconFact` e `EditorialSticker`.

SVGs originais: pré-natal, calendário, ácido fólico, consulta, não fumar e certo/errado. Todos usam `currentColor`, traço uniforme e não incorporam imagens, paths ou marcas do ZIP.

## Referência visual → princípio → implementação original

| referências canônicas 91/91 | princípio | implementação AVANT |
|---|---|---|
| `ref-030`, `ref-046`, `ref-087` | percurso e dependência visíveis | trilho com estações clínicas e setas declarativas |
| `ref-002`, `ref-012`, `ref-065`, `ref-075` | erro e correção adjacentes | `WrongRightLockup` sem reveal |
| `ref-016`, `ref-022`, `ref-080` | unidade curta e fórmula visual | bindings atômicos e faixas mnemônicas |
| `ref-039`, `ref-054`, `ref-056` | hierarquia antes do detalhe | headline, herói numérico e fatos subordinados |
| `ref-049`, `ref-085` | tipografia sozinha não ensina | tipografia nunca substitui relação, contraste ou regra |
| `ref-062`, `ref-064`, `ref-074` | risco de conteúdo/peça insegura | descartadas; nenhum asset, personagem ou chrome comercial usado |

## Capturas

Diretório: `artifacts/neurovisual/saude-da-mulher-anchors-v1/shadow-v1b-ff3f92d9d824/captures/`.

- 12 comparações `legado × plano v1`: quatro slides × desktop/375/419;
- 12 canvases v1 isolados: quatro slides × desktop/375/419;
- reduced motion ativado durante captura;
- animações desabilitadas no screenshot;
- nenhuma rolagem interna.

## Testes funcionais

| gate | resultado |
|---|---|
| compilação explícita 6/6 | pass |
| escrita Lote 1B limitada a pré-natal | pass — `questions_written: 1` |
| planos válidos | 6/6; somente pré-natal recebe síntese editorial |
| contrato static complete | pass — 4/4 |
| ações internas | pass — 0/4 |
| conteúdo oculto | pass — false em 4/4 |
| fallback integral | pass |
| runtime sem authoring trace | pass |
| Jest focado | pass — 17/17 |
| typecheck | pass |
| lint focado | pass |
| Playwright desktop | pass |
| Playwright 375 px | pass |
| Playwright 419 px | pass |
| overflow do canvas e texto fora dos limites | pass nos três tamanhos |

Uma execução combinada sofreu timeout do servidor Next dev antes de montar a página de 375 px. Desktop já havia passado; 375 e 419 passaram em repetições isoladas com o mesmo código e o servidor respondeu 200 depois do evento. Classificação: infraestrutura dev transitória, não regressão visual.

## Revisões separadas

### Pedagógica

**Resultado do agente:** `candidate_pass_with_human_review_required`.

Os fatos clínicos e o gabarito permanecem ligados às fontes por ponteiros resolvíveis. As abreviações `6+`, headlines e mnemônicos são `manual_source_backed`; portanto, a equivalência pedagógica final exige revisor humano antes de `approved`.

### Estética

**Resultado do agente:** `candidate_pass`.

Os quatro tipos agora possuem silhuetas distintas, herói identificável em até dois segundos, ao menos três níveis tipográficos, cor semântica e relações espaciais. O resultado deixa de parecer dashboard e se aproxima de mini-infográfico sem copiar peças. Gosto final continua humano.

### Acessibilidade

**Resultado do agente:** `technical_pass`.

Conteúdo pedagógico usa 10 px ou mais no canvas de 375 px; microtexto menor está restrito a kicker/metadado editorial. Informação não depende somente de cor, ícones têm rótulo quando semânticos, os quatro slides são grupos estáticos e reduced motion preserva todo o conteúdo.

### Contrato de zero cliques

**Resultado:** `pass`.

Não existem botões, details, summary, reveal, expand, next step ou correção condicionada a interação dentro dos quatro canvases v1. A comparação legada conserva suas interações antigas apenas no painel vizinho.

## Capability gaps restantes

1. **Art direction ainda é authoring explícito.** O planner compila uma síntese manual; ele ainda não gera direção de arte reutilizável para conteúdo arbitrário.
2. **Revisão semântica não automatizável.** `manual_source_backed` precisa de aprovação pedagógica humana; validator prova origem, não equivalência clínica.
3. **Tipografia condensada dedicada não foi adicionada.** A fundação usa Plus Jakarta Sans com escala e tracking expressivos para evitar dependência externa prematura.
4. **Biblioteca clínica é mínima.** Os seis SVGs cobrem pré-natal; parto e outras áreas não foram desenhados nem autorizados.
5. **Primitives não pilotadas.** `CentralConceptOrbit` existe na allowlist, mas não foi validada por uma composição desta amostra.
6. **Gate estético permanece humano.** Playwright mede geometria e contrato, não força editorial nem semelhança responsável.
7. **Proporções são hipótese de piloto.** `3:4` mobile e `4:3` desktop passaram tecnicamente, mas ainda precisam de julgamento humano no contexto do futuro player.

## Decisão recomendada

Não aplicar ao parto ainda. Revisar visualmente as 12 capturas v1 e validar as abreviações pedagógicas. Somente após aprovação humana desta amostra deve-se decidir entre:

- corrigir a fundação de pré-natal; ou
- declarar o Lote 1B apto a uma segunda amostra em parto, ainda em shadow e rollout off.
