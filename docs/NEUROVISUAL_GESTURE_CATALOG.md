# NeuroVisual Engine — catálogo formal de gestos v1

**Status:** proposta para shadow mode

**Fonte:** Banco Composer, Visual Bar, primitives existentes e princípios das referências. O catálogo não autoriza novos componentes.

## 1. Contrato de um gesto

Cada gesto deve declarar:

- `gesture_id` estável;
- intenção e erro espacial que resolve;
- relações mínimas exigidas;
- composições/primitives elegíveis;
- sinais positivos e contraindicações;
- política de interação;
- comportamento narrow/reduced-motion;
- fallback seguro;
- parâmetros experimentais;
- anchors player aprovadas.

## 2. Catálogo inicial

| ID | Resolve | Relação mínima | Capacidades atuais | Contraindicações | Fallback |
|---|---|---|---|---|---|
| `isolate` | exceção escondida numa lista | conjunto principal + exceção | `LogicIsolateShell`, `BoardChrome`, `AlertCallout` | ausência de contraste real; EXCETO apenas lexical | focus ou lista genérica |
| `compare` | confusão entre dois polos | polos nomeáveis e diferença relevante | `TwoColumnBoard`, `PolarityPanel` | mais de dois eixos ou falso certo×errado | matrix/deck ou danger compare legado |
| `deck` | pilares/fases viram parede textual | grupos paralelos ou camadas | `PillarDeck`, `CategoryStrip` | sequência rígida ou excesso de cartões | rail ou concept genérico |
| `chip_body` | norma longa sem rótulo escaneável | pares rótulo→regra | `LabelBodyRow`, `CategoryStrip` | rótulos artificiais/decorativos | rows/reference table |
| `rail` | ordem perde posição e dependência | sequência ordenada | `ProtocolRailRow`, `LogicRailShell` | elementos independentes | deck ou logic genérico |
| `funnel` | aluno precisa eliminar hipóteses | testes sucessivos que reduzem candidatos | `LogicFocusShell`, `PolarityPanel`, `PillarDeck` | sequência meramente narrativa | rail ou compare |
| `critical_number` | limiar se perde no texto | valor/intervalo com decisão associada | `CriticalNumber`, `AlertCallout`, `LabelBodyRow` | número incidental ou sem fonte | golden rows |
| `focus` | núcleo correto se dilui no ruído | núcleo + elementos periféricos | `LogicFocusShell`, `BoardChrome` | vários núcleos equivalentes | isolate/deck |

## 3. Relações ainda não promovidas a gestos próprios

Estas relações permanecem candidatas dentro dos oito gestos até o piloto provar lacuna:

| Relação | Tratamento inicial |
|---|---|
| timeline | variante temporal de `rail` |
| matrix | composição de `compare`/deck com dois eixos |
| classificação por cor | `deck` ou `compare` com semantic color |
| hierarquia/árvore | `deck` com níveis ou `focus` |
| seta causa→efeito | `rail` curto |
| arena certo×errado | `compare` |

Novo `gesture_id` exige ganho pedagógico distinto, piloto, primitive reutilizável e aprovação humana. Não nasce porque um print tem aparência nova.

## 4. Parâmetros experimentais

| Parâmetro | Default de partida | Regra do piloto |
|---|---|---|
| slots simultâneos | alvo 5–7 | medir legibilidade; não reprovar globalmente |
| cliques | o menor número que muda a decisão | variar por tarefa/família |
| continuidade 4/4 | preferida | contraste/progressão permitidos com justificativa |
| densidade textual | blocos curtos | testar por viewport e complexidade |
| ilustração | nenhuma por padrão | só quando codifica relação didática não resolvida por primitives |

## 5. Score conceitual do planner

O planner pode ordenar candidatos usando:

- correspondência entre intenção e gesto;
- cobertura das relações obrigatórias;
- bindings completos;
- custo de interação;
- densidade/viewport;
- coerência com a estratégia 4/4;
- reuso de capability aprovada;
- risco de spoiler;
- qualidade do fallback.

Não pode usar popularidade estética, aleatoriedade ou semelhança visual com material externo como sinal de qualidade.

## 6. Semantic color

Cor representa função, nunca decoração:

- sucesso/conduta válida;
- perigo/erro;
- alerta/limiar;
- informação/foco;
- categoria neutra.

Categorias clínicas ou temporais podem receber cores distintas apenas quando legenda, contraste e leitura sem cor permanecem válidos.
