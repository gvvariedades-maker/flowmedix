# NeuroVisual Engine — análise das 91 referências visuais

**Status:** inspeção individual concluída; evidência externa temporária, não incorporada ao produto

**Política:** inspiração ≠ cópia

## 1. Escopo, método e rastreabilidade

Foram inspecionados individualmente os 91 JPEGs do ZIP externo fornecido pelo usuário. Os arquivos foram extraídos somente em diretório temporário fora do worktree, não foram copiados para o repositório e não constituem assets, fixtures, goldens ou fontes de conteúdo do AVANT.

Os `reference_id` foram atribuídos por ordenação natural, case-insensitive, do nome original dentro do ZIP. Cada SHA-256 identifica os bytes recebidos e serve apenas para rastreabilidade; não concede licença nem autoriza reprodução. Não houve importação de texto ou imagem. A análise abstrai relações pedagógicas, erros espaciais e capabilities; marca, logotipo, watermark, personagens, figuras, paleta e composição integral foram deliberadamente excluídos.

O conteúdo linguístico externo não foi adotado como verdade editorial. Qualquer regra ou exemplo que um dia inspire conteúdo AVANT continua sujeito às autoridades pedagógicas e às skills do domínio, inclusive `professor-elias-santana-metodo` quando aplicável.

### 1.1 Legenda de risco de cópia

- `R1`: marca, logotipo, watermark, @handle ou chrome de plataforma de terceiro;
- `R2`: personagem, figura ou ilustração distintiva de terceiro;
- `R3`: composição integral, iconografia, paleta ou acabamento distintivo;
- `R4`: conteúdo/representação inadequada para reaproveitamento, como estereótipo, humor ambíguo ou chamada comercial.

Todo uso permitido é reconstrução AVANT a partir do princípio abstrato, nunca adaptação do asset.

## 2. Resultado consolidado

### 2.1 Decisões

| Decisão | Quantidade | Interpretação |
|---|---:|---|
| `principle_useful` | 67 | relação ou solução espacial aproveitável sem copiar a peça |
| `redundant` | 19 | princípio e conteúdo visual já representados por outra referência |
| `aesthetic_only` | 2 | ganho dependente de aparência/ornamento, não de estrutura didática |
| `unsafe_content` | 3 | chrome comercial, estereótipo ou humor/representação incompatível |
| **Total** | **91** | uma decisão por arquivo |

### 2.2 Distribuição pelo gesto candidato existente

Esta distribuição mede o melhor encaixe inicial, não qualidade visual nem necessidade de variants.

| Gesto v1 | Referências | Leitura |
|---|---:|---|
| `compare` | 40 | contrastes certo×errado, formas confundíveis e condições paralelas |
| `deck` | 19 | taxonomias, classes e grupos paralelos |
| `chip_body` | 18 | rótulo→regra, forma→função ou termo→definição |
| `isolate` | 6 | regra com exceção, proibição ou alternativa válida |
| `focus` | 5 | regra/núcleo dominante com apoio periférico |
| `rail` | 3 | conversão, transformação ou dependência direcional |
| `funnel` | 0 | nenhuma eliminação sucessiva de hipóteses claramente demonstrada |
| `critical_number` | 0 | nenhum número associado a decisão/limiar pedagógico |
| **Total** | **91** | inclui redundantes e descartadas |

### 2.3 Princípios mais recorrentes

1. contraste binário com polos explicitamente nomeados;
2. palavra-chave ampliada e cor usada como função semântica;
3. rótulo curto seguido de regra ou exemplo;
4. categorias paralelas com repetição estrutural;
5. correção próxima ao erro;
6. setas ou conectores para tornar dependência visível;
7. uma ideia dominante e blocos curtos;
8. ilustração apenas quando distingue sentido, posição, agente ou tempo.

Anti-padrões recorrentes: excesso de caixas, texto pequeno, dependência de vermelho/verde, sombras decorativas, personagens sem função, marca intrusiva e taxonomia inteira em uma tela.

## 3. Duplicatas e quase duplicatas

Não há arquivos com SHA-256 idêntico. A inspeção visual e a comparação perceptual encontraram recortes, reexportações ou repetições substanciais nestes grupos:

- `ref-003`/`ref-009`;
- `ref-004`/`ref-037`;
- `ref-005`/`ref-043`/`ref-086`;
- `ref-006`/`ref-034`;
- `ref-008`/`ref-071`;
- `ref-010`/`ref-060`;
- `ref-013`/`ref-072`;
- `ref-014`/`ref-020`/`ref-076`;
- `ref-016`/`ref-021`/`ref-038`/`ref-053`;
- `ref-019`/`ref-055`;
- `ref-022`/`ref-088`;
- `ref-025`/`ref-058`;
- `ref-028`/`ref-084`;
- `ref-035`/`ref-068`;
- `ref-054`/`ref-057`.

Referências apenas próximas por acabamento, mas com relações diferentes, não foram tratadas como duplicatas. Cada arquivo permanece no apêndice.

## 4. Lacunas perante os oito gestos

| Lacuna observada | Evidência | Tratamento no v1 | Experimento futuro? |
|---|---|---|---|
| hierarquia/ramificação real | `ref-039`, `ref-045`, `ref-054`, `ref-056` | `deck` com níveis | sim, se houver perda de ancestralidade em mobile; testar capability de árvore antes de novo gesto |
| correspondência/transformação | `ref-046`, `ref-069`, `ref-073`, `ref-087` | `rail` ou `compare` com conectores | sim, como capability de mapping determinístico; não promover automaticamente a gesto |
| referência espacial/perspectiva | `ref-048`, `ref-052`, `ref-067` | `compare` com polos e legenda | sim, com desenho AVANT original e comparação contra versão textual |
| grade bidimensional | `ref-015`, `ref-030`, `ref-036`, `ref-041` | `deck`/`rail` com grupos | talvez; testar narrow e progressive disclosure antes de matrix formal |
| pronúncia | `ref-003`, `ref-009` | `compare` estático | não como gesto visual; áudio acessível seria capability separada |
| respostas válidas condicionais | `ref-040`, `ref-082`, `ref-083`, `ref-091` | `isolate`/`compare` | não inicialmente; condição e exceção cabem em bindings explícitos |

Árvore/hierarquia, mapping determinístico e perspectiva espacial justificam piloto. Matrix permanece hipótese de responsividade. Pronúncia não justifica novo gesto visual.

## 5. Referências a descartar

- `unsafe_content`: `ref-062`, `ref-064`, `ref-074`;
- `aesthetic_only`: `ref-049`, `ref-085`;
- `redundant`: as 19 linhas marcadas no apêndice.

Mesmo as 67 `principle_useful` têm o asset descartado; conserva-se somente a abstração registrada.

## 6. Implicações para as seis âncoras do piloto

As referências são de Língua Portuguesa e não fornecem conteúdo clínico. Sua implicação para `saude-da-mulher-anchors-v1` limita-se a estrutura visual:

| Âncora | Hipótese visual específica | Referências estruturais | Guardrail |
|---|---|---|---|
| `mulher_prenatal` | `rail` para acompanhamento; `critical_number` só quando número aciona conduta | `ref-030`, `ref-046`, `ref-087` | não inventar calendário ou limiar |
| `mulher_parto` | `compare` para condutas; `isolate` para exceção/alerta | `ref-002`, `ref-012`, `ref-044`, `ref-065` | não reduzir decisão a vermelho×verde nem antecipar gabarito |
| `mulher_papanicolau` | `rail` para periodicidade; `chip_body` para condição→regra | `ref-017`, `ref-030`, `ref-073` | periodicidade/elegibilidade vêm do conteúdo aprovado |
| `mulher_mama` | `compare`/`deck` para exame, rastreio e categorias | `ref-039`, `ref-050`, `ref-056` | evitar taxonomia inteira e ilustração sem valor didático |
| `mulher_puerperio` | `rail` para evolução; `isolate` para sinal de alerta | `ref-033`, `ref-044`, `ref-087` | alerta respeita o momento do spoiler |
| `mulher_planejamento` | `deck` para classes; `compare` para critérios/contraindicações | `ref-015`, `ref-041`, `ref-054` | grupos semânticos, narrow e sem depender só de cor |

O shadow mode deve medir leitura mobile, hierarquia e associação entre regra e evidência. Esta análise não autoriza renderer, componente, gesto, alteração das questões ou rollout.

## 7. Apêndice 1–91

| ID | Nome original | SHA-256 | Relação pedagógica | Princípio aproveitável | Erro espacial resolvido | Gesto | Primitive/capability | Valor didático | Risco | Decisão |
|---|---|---|---|---|---|---|---|---|---|---|
| ref-001 | WhatsApp Image 2026-08-11 at 12.31.00.jpeg | bd135000ade26334daefdba530f30c6cb192eb7af565cfc9d0338d398982a490 | símbolo→funções | token + rótulo/regra/exemplo | homófonos misturados | `chip_body` | `LabelBodyRow` + cor semântica | alto — liga forma, classe e uso | R1+R3 | `principle_useful` |
| ref-002 | WhatsApp Image 2026-08-11 at 12.31.01 (1).jpeg | 7f91c3f749c287a153ea0286401620998237d8757f6e529391faa2bbde1e1929 | errado×correto | correção adjacente | formas distantes | `compare` | `PolarityPanel` | alto — contraste muda decisão | R1+R3 | `principle_useful` |
| ref-003 | WhatsApp Image 2026-08-11 at 12.31.01 (2).jpeg | 931fc700e224518d158dd27acd9fec680f79e7f4e9fd1f0205ca9fad258c927e | pronúncia errada×correta | tônica destacada | acento não localizável | `compare` | `TwoColumnBoard` + ênfase | médio — estático não prova som | R1+R3 | `principle_useful` |
| ref-004 | WhatsApp Image 2026-08-11 at 12.31.01.jpeg | 04ab77a694a36151e8488ee8753a7e95912c1f1fa2653a8eb274ca2087ac5cef | classe→definição→exemplo | linha por categoria | pares se cruzam | `deck` | `CategoryStrip` + `LabelBodyRow` | alto — estrutura completa | R1+R3 | `principle_useful` |
| ref-005 | WhatsApp Image 2026-08-11 at 12.31.02 (1).jpeg | 8d6c452096c2fb5301e47dd0c4c3a476d709301932e909dd4316c7f3120f7a10 | pares confundíveis | termo + significado mínimo | formas se fundem | `compare` | `TwoColumnBoard` | alto — diferença escaneável | R1+R3 | `principle_useful` |
| ref-006 | WhatsApp Image 2026-08-11 at 12.31.02 (2).jpeg | 766109bae0fce0e8a255ad45a434054c0b4500a1f649842e59ffcc31c25ac4c3 | forma×função | polos simétricos | diacrítico desacoplado | `compare` | `PolarityPanel` | alto — vínculo explícito | R1+R3 | `principle_useful` |
| ref-007 | WhatsApp Image 2026-08-11 at 12.31.02 (3).jpeg | 86e97292c5b6b02261fe2fec16c1782d2cf706937c8c97acbff4f6cc8839edba | três formas→usos | três colunas | distinção ternária ambígua | `deck` | `PillarDeck` | alto — condições separadas | R1+R3 | `principle_useful` |
| ref-008 | WhatsApp Image 2026-08-11 at 12.31.02.jpeg | c6f3be1346fba8e857834373ece95f80dd1f26fc5ccd37cb2d2794dea81a2855 | forma similar→sentido distinto | pares com ≠ | contraste oculto | `compare` | `TwoColumnBoard` | alto — critério explícito | R1+R3 | `principle_useful` |
| ref-009 | WhatsApp Image 2026-08-11 at 12.31.03 (1).jpeg | 75ece16678b44e9d88fc98ea1022c4d4c99267243cdf2d649edfb80acf05fac8 | pronúncia errada×correta | repete ref-003 | mesmo erro | `compare` | `TwoColumnBoard` + ênfase | baixo — reexportação | R1+R3; quase ref-003 | `redundant` |
| ref-010 | WhatsApp Image 2026-08-11 at 12.31.03 (2).jpeg | d3d04d20b9084a51b758f475ff0747388b84312c4ba09fcedf4496f13d1eccee | regra→exemplos | regra isolada | condição se perde | `isolate` | `LogicIsolateShell` + rows | médio — personagem dispensável | R1+R2+R3 | `principle_useful` |
| ref-011 | WhatsApp Image 2026-08-11 at 12.31.03 (3).jpeg | b21936884f535d3eeae9784752b62bae9312f1fab394262718cf0e9840e1e6d9 | categoria→exemplos | faixas nomeadas | classes misturadas | `deck` | `CategoryStrip` | médio — classificação simples | R1+R3 | `principle_useful` |
| ref-012 | WhatsApp Image 2026-08-11 at 12.31.03.jpeg | 3b3a23e69fab320d771c1172d5011e84d9b9b0e4cc3434ab0cafe153959fc949 | errado×correto | correção sob erro | regra distante | `compare` | `PolarityPanel` | alto — feedback adjacente | R1+R3 | `principle_useful` |
| ref-013 | WhatsApp Image 2026-08-11 at 12.31.04 (1).jpeg | 5673deec58d861ca1dbdd1b4ce81f6e522efd644ac9810602620f82ecb32b5fd | rejeitada×aceita | trecho variável destacado | palavra passa despercebida | `compare` | `PolarityPanel` + ênfase | alto — contraste localizado | R1+R3 | `principle_useful` |
| ref-014 | WhatsApp Image 2026-08-11 at 12.31.04 (2).jpeg | 4948bd70f32d917e82f1c2d7873ffe137866a6e842830c634bd3497545c6fb8a | condição→alternativas | casos paralelos | válidas parecem conflitantes | `compare` | `TwoColumnBoard` + rows | alto — condição distingue | R1+R3 | `principle_useful` |
| ref-015 | WhatsApp Image 2026-08-11 at 12.31.04 (3).jpeg | aa346f50598a08069759e8b582dd4073fb6863f41e7f0f9c3b91e53ada45c63b | taxonomia→exemplo | grade repetível | agrupamento perdido | `deck` | `PillarDeck`/`CategoryStrip` | médio — muito densa | R1+R3 | `principle_useful` |
| ref-016 | WhatsApp Image 2026-08-11 at 12.31.04.jpeg | 9ad3c25a933a0048c4a78fdd84e1c5f2105e4bceffe6b068570cceec84f8501a | forma→número→exemplo | três slots | exemplo desacoplado | `chip_body` | `LabelBodyRow` | alto — mapping direto | R1+R3 | `principle_useful` |
| ref-017 | WhatsApp Image 2026-08-11 at 12.31.05 (1).jpeg | fbdeb152f918caeb807369b505f32b894c94bd3251b4a62f817c430c1ebd7c41 | quatro formas→função | rótulos + regra | homófonos confundidos | `deck` | `PillarDeck` + rows | alto — taxonomia acionável | R1+R3 | `principle_useful` |
| ref-018 | WhatsApp Image 2026-08-11 at 12.31.05 (2).jpeg | 1a4047dc183e100fc6fd91f5c57575addeed65598b69da113a776861a0c5a477 | símbolo→função | símbolo como âncora | sinal separado da finalidade | `deck` | `CategoryStrip` | alto — busca rápida | R1+R3 | `principle_useful` |
| ref-019 | WhatsApp Image 2026-08-11 at 12.31.05 (3).jpeg | 077f14dedf9545233ec4f603b10cbe81d2cee656738dc3d12731ab7fc1cbbf68 | função→exemplo | grade de usos | enumeração plana | `deck` | `PillarDeck` | alto — evidência próxima | R1+R3 | `principle_useful` |
| ref-020 | WhatsApp Image 2026-08-11 at 12.31.05 (4).jpeg | 988770d20e41ccfc71fd8697866ee9b17ebfa775d373f6e751ab718ea0820ae8 | condição→colocação | repete ref-014 | mesma distinção | `compare` | `TwoColumnBoard` | baixo — recorte | R1+R3; quase ref-014 | `redundant` |
| ref-021 | WhatsApp Image 2026-08-11 at 12.31.05.jpeg | 9e795013be714970be4dee279f2ec897cfafc65780000c7a95e4faebc85a070b | forma→número→exemplo | repete ref-016 | mesmo mapping | `chip_body` | `LabelBodyRow` | baixo — reexportação | R1+R3; quase ref-016 | `redundant` |
| ref-022 | WhatsApp Image 2026-08-11 at 12.31.06 (1).jpeg | ff27b56f9ad0e08d8ffa2d2a3801724fefe3a62b79bbf46d5b57af5a2efb5342 | condição composta→resultado | fórmula visual | escopo se perde | `chip_body` | rows + conectores | alto — composição explícita | R1+R3 | `principle_useful` |
| ref-023 | WhatsApp Image 2026-08-11 at 12.31.06 (2).jpeg | 5211ac2af45c292d78e5db813ff0e89ee7c38558424ac5f37e205ec67caaaa5b | rejeitada×aceita + sentido | correção + definição | significado separado | `compare` | `PolarityPanel` | médio — personagem não agrega | R1+R2+R3 | `principle_useful` |
| ref-024 | WhatsApp Image 2026-08-11 at 12.31.06 (3).jpeg | 0a12c26f0468a01aab8ee1b1d23771e6a578e1a861d33a5aba84fc24eba63190 | termos→definições | rótulo + glosa | formas se confundem | `chip_body` | `LabelBodyRow` | médio — glossário sem aplicação | R1+R3 | `principle_useful` |
| ref-025 | WhatsApp Image 2026-08-11 at 12.31.06.jpeg | 17b730285b4779f09e4d68f84544cd5479dcacf1a7235693769a1785899b8e79 | função→exemplo | um uso por card | funções concorrentes | `deck` | `PillarDeck` | alto — varredura rápida | R1+R3 | `principle_useful` |
| ref-026 | WhatsApp Image 2026-08-11 at 12.31.07 (1).jpeg | 191dd13e06eb07ef8afc7e2d996728522249b8a54314591e0d1c90511be7691f | pontuação→sentido | pares mínimos | marca pequena invisível | `compare` | `TwoColumnBoard` + ênfase | alto — consequência clara | R1+R3 | `principle_useful` |
| ref-027 | WhatsApp Image 2026-08-11 at 12.31.07 (2).jpeg | 99941f6c4b609ed4aef56909f220ee948b37ff6cd4309f382cbb7a70625a0e45 | composto×locução | sentidos separados | classe/forma confundidas | `compare` | `TwoColumnBoard` | médio — figura copiável | R1+R2+R3 | `principle_useful` |
| ref-028 | WhatsApp Image 2026-08-11 at 12.31.07 (3).jpeg | 526b178da21912385e03b2fc655da08aa183aeb14a56f53d54e354d8b7d72bef | verbo→flexão | pares alinhados | transformação implícita | `chip_body` | `LabelBodyRow` | alto — mapping compacto | R1+R3 | `principle_useful` |
| ref-029 | WhatsApp Image 2026-08-11 at 12.31.07.jpeg | 9f7904e673c586db609bdaf865e51b9a304a871bdb44cfc2b87645ab5331481d | errado×correto | variável destacada | preposição se perde | `compare` | `PolarityPanel` | alto — correção localizada | R1+R2+R3 | `principle_useful` |
| ref-030 | WhatsApp Image 2026-08-11 at 12.31.08 (1).jpeg | 85c28e828d89e624b5a299cd88f083a4a4eb3f046587b60d1f91aa651ee79c1e | escala→conversão | trilhas + fator | ordem/fator perdidos | `rail` | `ProtocolRailRow` + conectores | alto — sequência numérica | R1+R3 | `principle_useful` |
| ref-031 | WhatsApp Image 2026-08-11 at 12.31.08 (2).jpeg | 9dd9493b3914bb5ce9802de1140456285f411f5ffe49183bca3500eff3fb233d | termos próximos→uso | oposição vertical | diferença oculta | `compare` | `TwoColumnBoard` | alto — contraste direto | R1+R3 | `principle_useful` |
| ref-032 | WhatsApp Image 2026-08-11 at 12.31.08 (3).jpeg | d21d74776f984fafe4c658f53c94ff8f7517884a777635bae879fddde861c4d3 | preferida→aceita | regra + nuance | aceitação parece binária | `focus` | `LogicFocusShell` + callout | médio — personagem decorativo | R1+R2+R3 | `principle_useful` |
| ref-033 | WhatsApp Image 2026-08-11 at 12.31.08.jpeg | d5b063698ac50218363ba6f4e41de69347fda70805468f0f2fc9980fa7c5d7ad | proibição→alternativas | negativo + casos | exceções dispersas | `isolate` | `LogicIsolateShell` + rows | alto — separa estados | R1+R3 | `principle_useful` |
| ref-034 | WhatsApp Image 2026-08-11 at 12.31.09 (1).jpeg | 69f8959305aab3a8ee2dda29d9447e9fd48d7abb98fba86afd2de6f024e84c72 | forma×função | repete ref-006 | mesmo contraste | `compare` | `PolarityPanel` | baixo — recorte | R1+R3; quase ref-006 | `redundant` |
| ref-035 | WhatsApp Image 2026-08-11 at 12.31.09 (2).jpeg | 860e9ba9e9cffd16211791e3ab25840f070a6251bf4510caefc140e62df201d1 | regra→exemplos | uma frase por linha | exemplos desligados | `chip_body` | `LabelBodyRow` | alto — repetição escaneável | R1+R3 | `principle_useful` |
| ref-036 | WhatsApp Image 2026-08-11 at 12.31.09 (3).jpeg | 0735dbae6e83f972bf698217f163675316d09c5cc3b55908f1363c9c7529583a | classe→definição→exemplo | grade estável | categorias cruzadas | `deck` | `CategoryStrip` | médio — densa | R1+R3 | `principle_useful` |
| ref-037 | WhatsApp Image 2026-08-11 at 12.31.09 (4).jpeg | f87d62472c54e08f47e4f9165ec07ebeb5c50dd8612cc34c148ef77d7fc640f6 | classe→definição→exemplo | repete ref-004 | mesma associação | `deck` | `CategoryStrip` + rows | baixo — recorte | R1+R3; quase ref-004 | `redundant` |
| ref-038 | WhatsApp Image 2026-08-11 at 12.31.09.jpeg | 1d63bd2bf61994418dd865615b44d469df97b5c6276234756436b29c22f0a35f | forma→número→exemplo | repete ref-016 | mesmo mapping | `chip_body` | `LabelBodyRow` | baixo — reexportação | R1+R3; quase ref-016 | `redundant` |
| ref-039 | WhatsApp Image 2026-08-11 at 12.31.10 (1).jpeg | c9e499fbbea0457b1c1854fd6341a00fa022936532cfa4d08b1dc0f3bb5c1a70 | categoria→subtipos | ramificação por níveis | ancestralidade perdida | `deck` | `PillarDeck` + conectores | alto — filiação explícita | R1+R3 | `principle_useful` |
| ref-040 | WhatsApp Image 2026-08-11 at 12.31.10 (2).jpeg | 5661282d2d601b619fdf95d1aa55908557a75aaca6a328c490bf7ef7728b4b56 | auxiliar→forma válida | condições paralelas | variantes parecem livres | `compare` | `TwoColumnBoard` | alto — condição governa polo | R1+R2+R3 | `principle_useful` |
| ref-041 | WhatsApp Image 2026-08-11 at 12.31.10 (3).jpeg | a618fd80d2fd6db74d2c326ad3685e97b6520484ac0cabb0dc0d7e415fd21021 | taxonomia→exemplos | grupos nomeados | parede textual | `deck` | `CategoryStrip`/`PillarDeck` | médio — relação boa, densa | R1+R3 | `principle_useful` |
| ref-042 | WhatsApp Image 2026-08-11 at 12.31.10.jpeg | 40a8c01382c5093c7a6a55d3f9ca930546dc5066fffc56fd443074a781351d68 | forma→três sentidos | rótulo + glosa + exemplo | sentidos misturados | `chip_body` | `LabelBodyRow` | alto — significado próximo | R1+R2+R3 | `principle_useful` |
| ref-043 | WhatsApp Image 2026-08-11 at 12.31.11 (1).jpeg | 537c1c5e5d0b232ee79527c0cdf2c69dde02ce095b5f48a15ab687f44f546312 | pares confundíveis | repete ref-005 | mesmo contraste | `compare` | `TwoColumnBoard` | baixo — recorte | R1+R3; quase ref-005 | `redundant` |
| ref-044 | WhatsApp Image 2026-08-11 at 12.31.11 (2).jpeg | 7c889b306e8ef795fc8c214f1b854a7a0172f993aadf85617a91a7931b061cfe | proibição→alternativas | erro + opções + regra | núcleo diluído | `isolate` | `LogicIsolateShell` + callout | alto — alternativas separadas | R1+R3 | `principle_useful` |
| ref-045 | WhatsApp Image 2026-08-11 at 12.31.11 (3).jpeg | ca0a097931591a2b145d40592cc3b2384dafc3ca7e648edf03e65682b4d7a48d | tempo→subtipo→forma | ramos por nível | ancestralidade perdida | `deck` | `PillarDeck` + conectores | alto — árvore clara | R1+R3 | `principle_useful` |
| ref-046 | WhatsApp Image 2026-08-11 at 12.31.11.jpeg | 9c4dcd5f0922b952fea4cd99995a6e2e6b80dffedeab8cf5e8af2f98b5ea3cda | correção→concordância | passos + dependência | antecedente desconectado | `rail` | `LogicRailShell` + conectores | alto — transformação visível | R3 | `principle_useful` |
| ref-047 | WhatsApp Image 2026-08-11 at 12.31.12 (1).jpeg | 05dc1818e07e7c8670d9dc1cf99aa798a0ad2bf7f628779cc777e6cc06158cd0 | termo→definição | pares curtos | glosa perde vínculo | `chip_body` | `LabelBodyRow` | médio — referência, pouca decisão | R1+R3 | `principle_useful` |
| ref-048 | WhatsApp Image 2026-08-11 at 12.31.12 (2).jpeg | ccfef88b55d33090a721a3ed8f7aadfa8c4e201c4b0a90ee98ce877d0b85158d | lugar fixo×movimento | polos + pergunta/imagem | direção parece arbitrária | `compare` | `TwoColumnBoard` + espaço | alto — imagem codifica movimento | R1+R2+R3 | `principle_useful` |
| ref-049 | WhatsApp Image 2026-08-11 at 12.31.12 (3).jpeg | 10f07664a34ec241f8ecf71cd7a87febc88d80e20fc8b7eff62dec762c8cc937 | pergunta→alternativas | questão focal | só cartaz, sem explicação | `focus` | `BoardChrome` | baixo — ornamento domina | R1+R2+R3 | `aesthetic_only` |
| ref-050 | WhatsApp Image 2026-08-11 at 12.31.12 (4).jpeg | 7d405a740ff2e5900d05598747f406e38ff9bb29624769600d33e784726f5165 | condição→forma | dois polos | contexto muda grafia | `compare` | `TwoColumnBoard` | alto — condição próxima | R1+R2+R3 | `principle_useful` |
| ref-051 | WhatsApp Image 2026-08-11 at 12.31.12.jpeg | 66041e72d16ddab4030c3663743a7d5dfa1af805617ee074aa9f56b9dc409c13 | singular→plural | pares com seta | irregularidade vira lista | `chip_body` | rows + conector | alto — mapping direto | R1+R3 | `principle_useful` |
| ref-052 | WhatsApp Image 2026-08-11 at 12.31.13 (1).jpeg | d8ecdad14fb4f0ab80aef72f7bb35a787dc142449175971fa2cf318abeb2bffe | dêixis→distância | faixas por proximidade | ponto de vista invisível | `compare` | `PillarDeck` + perspectiva | alto — espaço codifica regra | R1+R2+R3 | `principle_useful` |
| ref-053 | WhatsApp Image 2026-08-11 at 12.31.13 (2).jpeg | 2c434b754abba4d77e8d65086a4e35b86c17d01b5dbdca184782849fb6d8afe6 | forma→número | subconjunto ref-016 | repete singular/plural | `chip_body` | `LabelBodyRow` | baixo — menor cobertura | R1+R3; quase ref-016 | `redundant` |
| ref-054 | WhatsApp Image 2026-08-11 at 12.31.13 (3).jpeg | e95854bf0ed7af0bb19519768429c4d6c06ba6686941e36f7e9ca0e67d02c651 | classe→subtipo | níveis e ramos | subtipos ficam planos | `deck` | `PillarDeck` + conectores | alto — preserva hierarquia | R1+R3 | `principle_useful` |
| ref-055 | WhatsApp Image 2026-08-11 at 12.31.13.jpeg | c0d22a38b1a89f60aa89ea9b6c8056f9e5b2266784546a38d5bbd95faaf9658c | função→exemplo | repete ref-019 | mesma grade | `deck` | `PillarDeck` | baixo — reexportação | R1+R3; quase ref-019 | `redundant` |
| ref-056 | WhatsApp Image 2026-08-11 at 12.31.14 (1).jpeg | 30cfde93efdb3872961c6cdade132f6c400003be9fd9470f1dcc9e704e6741eb | taxonomia→subclasses | níveis agrupados | níveis se misturam | `deck` | `PillarDeck` + conectores | alto — filiação clara | R1+R3 | `principle_useful` |
| ref-057 | WhatsApp Image 2026-08-11 at 12.31.14 (2).jpeg | 5c6b1e27f544b1013bf436be3cc384e9aa8fa7820006e1b3945e06bc62f8a51a | classe→subtipo | repete ref-054 | mesma hierarquia | `deck` | `PillarDeck` + conectores | baixo — versão equivalente | R1+R3; quase ref-054 | `redundant` |
| ref-058 | WhatsApp Image 2026-08-11 at 12.31.14 (3).jpeg | 3a26b048f9d064ce9d5adfa308ab9e6d62170d7089d282084872ef791cec1aae | função→exemplo | recorte ref-025 | repete usos | `deck` | `PillarDeck` | baixo — recorte parcial | R1+R3; quase ref-025 | `redundant` |
| ref-059 | WhatsApp Image 2026-08-11 at 12.31.14.jpeg | 082e612bc8ea6399d386752a23e38d047b08238e82050fd215c0e074d145b978 | pares→sentidos | pares horizontais | grafia mascara sentido | `compare` | `TwoColumnBoard` | médio — pouco contexto | R1+R3 | `principle_useful` |
| ref-060 | WhatsApp Image 2026-08-11 at 12.31.15 (1).jpeg | b90b452822dfdd487c91c3e8a82859e6b8325776f49d3b4f3f49f239585136f9 | regra→exemplos | recorte ref-010 | mesma regra | `isolate` | `LogicIsolateShell` | baixo — subconjunto | R1+R3; quase ref-010 | `redundant` |
| ref-061 | WhatsApp Image 2026-08-11 at 12.31.15 (2).jpeg | b878317355f929c5faff2ef2c7b017c08fc6fa0ab0304ec952a8a9b1becd5e68 | forma→plural | associação concreta | sem âncora mnemônica | `focus` | `LogicFocusShell` | médio — imagem deve ser original | R1+R2+R3 | `principle_useful` |
| ref-062 | WhatsApp Image 2026-08-11 at 12.31.15 (3).jpeg | a981f2c130921ce51aa1f814b97f927593f8454697ec646f635b092b666cd167 | pares lexicais | oposição repetida | figuras introduzem ruído | `compare` | `TwoColumnBoard` | baixo — estereótipos anulam ganho | R1+R2+R3+R4 | `unsafe_content` |
| ref-063 | WhatsApp Image 2026-08-11 at 12.31.15 (4).jpeg | 6c465bce29d6624a1f23c365337971ec65fccef14bbbebe73f6217e3163b04e0 | mesma expressão→referentes | polos + definição | hífen parece livre | `compare` | `TwoColumnBoard` | alto — referente explícito | R1+R3 | `principle_useful` |
| ref-064 | WhatsApp Image 2026-08-11 at 12.31.15.jpeg | dc71329e9faa122800194228ec4377572f6bfe45f4511d890ca3718a64a87f71 | conteúdo em feed comercial | nenhuma relação adicional | UI/CTA competem | `focus` | nenhuma; descartar asset | baixo — chrome comercial | R1+R2+R3+R4 | `unsafe_content` |
| ref-065 | WhatsApp Image 2026-08-11 at 12.31.16 (1).jpeg | 55d713ecb3d9e7e043531f73da17a5b2c0c31926dbad45d4b0bff52c7780aadf | erro→correção | pares item a item | correções dispersas | `compare` | `PolarityPanel` | alto — feedback local | R1+R3 | `principle_useful` |
| ref-066 | WhatsApp Image 2026-08-11 at 12.31.16 (2).jpeg | e2aae70c9eb927045618e418056c319bcac250336007219e948b068ccea9a97b | paradigma→forma | analogia em blocos | derivação arbitrária | `compare` | `TwoColumnBoard` | médio — personagem dispensável | R1+R2+R3 | `principle_useful` |
| ref-067 | WhatsApp Image 2026-08-11 at 12.31.16 (3).jpeg | 40c1f1608cc444c55cddcef3f2321ebcff96dbacdda172fc077929e1d214ba21 | preposição→papel | agente/objeto separados | papel sem pista espacial | `compare` | `TwoColumnBoard` + espaço | alto — papel visível | R1+R2+R3 | `principle_useful` |
| ref-068 | WhatsApp Image 2026-08-11 at 12.31.16.jpeg | e4d2a5d2488d3769a4a82701af1e975170afdac65434eb02f95811b07c61b668 | regra→exemplos | repete ref-035 | mesma regra | `chip_body` | `LabelBodyRow` | baixo — reexportação | R1+R3; quase ref-035 | `redundant` |
| ref-069 | WhatsApp Image 2026-08-11 at 12.31.17 (1).jpeg | 0bb76f1fca39fe009a6422f759349301bedbe7d1594633e69a82ed5fe47fe909 | alvo→concordância | setas direcionais | alvo ambíguo | `compare` | board + conectores | alto — dependência explícita | R1+R3 | `principle_useful` |
| ref-070 | WhatsApp Image 2026-08-11 at 12.31.17 (2).jpeg | b23d81a01da492d536a93c33cb64a334beeedef0be3c7bb21083da540a5cd920 | três formas→sentidos | colunas com condição | formas misturadas | `deck` | `PillarDeck` | alto — separação ternária | R1+R2+R3 | `principle_useful` |
| ref-071 | WhatsApp Image 2026-08-11 at 12.31.17 (3).jpeg | 91df472f8c00b4678d62dde256b44dc750e5f961dce598e499f07a58c36f242f | similares→distintos | subconjunto ref-008 | repete contraste | `compare` | `TwoColumnBoard` | baixo — menos abrangente | R1+R3; quase ref-008 | `redundant` |
| ref-072 | WhatsApp Image 2026-08-11 at 12.31.17.jpeg | e4dcea25d90df5b78505bb6c75f05401d278c1f97601053e2e1844db7505e2e2 | rejeitada×aceita | repete ref-013 | mesma correção | `compare` | `PolarityPanel` | baixo — recorte | R1+R3; quase ref-013 | `redundant` |
| ref-073 | WhatsApp Image 2026-08-11 at 12.31.18 (1).jpeg | dc995be25711d05b6286708e8ef589839b1091f5fe38f3e733c02619c160cccb | regra morfológica→exemplos | base→forma | padrão invisível | `chip_body` | rows + ênfase | alto — transformação emerge | R1+R3 | `principle_useful` |
| ref-074 | WhatsApp Image 2026-08-11 at 12.31.18 (2).jpeg | 19d28a7820d811bf8cfdc837d014d1c9c3838a4ab6fc3e72c1b68f9a74c5ab10 | preposição→sentido | níveis paralelos | humor ambíguo | `compare` | `TwoColumnBoard` | baixo — representação imprópria | R1+R2+R3+R4 | `unsafe_content` |
| ref-075 | WhatsApp Image 2026-08-11 at 12.31.18 (3).jpeg | a0217f09b93a20aa7f578359642cb806f7afb3b702f2a871b365134620160faf | errado×correto | token variável | erro curto invisível | `compare` | `PolarityPanel` + ênfase | alto — diferença localizada | R1+R3 | `principle_useful` |
| ref-076 | WhatsApp Image 2026-08-11 at 12.31.18.jpeg | 587715ef5fe26f6d2d8f029f28c1a3a1bda53d8b13af5dca662951eebc4e816c | condição→colocação | recorte ref-014 | repete alternativas | `compare` | `TwoColumnBoard` | baixo — subconjunto | R1+R3; quase ref-014 | `redundant` |
| ref-077 | WhatsApp Image 2026-08-11 at 12.31.19 (1).jpeg | 17178a0f8edb9907a482cae4096f71142484bcab85d7a1f42875f0deea32937f | vocábulo→sinônimo | pares em linhas | glosa perde vínculo | `chip_body` | `LabelBodyRow` | médio — personagem decorativo | R1+R2+R3 | `principle_useful` |
| ref-078 | WhatsApp Image 2026-08-11 at 12.31.19 (2).jpeg | b5159cf5152ba3d2d9f58c98cd6313548166ec3d6ed32a8347d749ac04b64956 | três formas→sentidos | glosa + exemplo | homófonos confundidos | `compare` | `PillarDeck` | alto — sentido próximo | R1+R3 | `principle_useful` |
| ref-079 | WhatsApp Image 2026-08-11 at 12.31.19 (3).jpeg | b2365010a72cf269b41a38d08e11327b4441199ddbae600a8046814f2aa4c0f4 | sufixo→tempo | polos temporais | letra não sinaliza tempo | `compare` | `TwoColumnBoard` | alto — forma/tempo ligados | R1+R2+R3 | `principle_useful` |
| ref-080 | WhatsApp Image 2026-08-11 at 12.31.19 (4).jpeg | c698699cc016f36fc2908e0142d7b026586b785e52ce4c62dd8741d496a72ff8 | verbos→mesma flexão | pares + conclusão | padrão oculto | `chip_body` | rows + callout | alto — regra emerge | R1+R3 | `principle_useful` |
| ref-081 | WhatsApp Image 2026-08-11 at 12.31.19.jpeg | 8cd43c918ee3fbff7880892b4ddf67095bc9a178b77980f0bee06faa4f460956 | homófonos→sentidos | palavra + contexto | som mascara sentido | `compare` | `TwoColumnBoard` | alto — contexto desambigua | R1+R2+R3 | `principle_useful` |
| ref-082 | WhatsApp Image 2026-08-11 at 12.31.20 (1).jpeg | e73873b2e3f7836ada13eefaf38247ffbb88397fe6114e26e7c332bba7962985 | regra→facultativos | núcleo + casos | facultativo parece geral | `isolate` | `LogicIsolateShell` + rows | alto — escopo visível | R1+R2+R3 | `principle_useful` |
| ref-083 | WhatsApp Image 2026-08-11 at 12.31.20 (2).jpeg | 647aefb7158037a15c18b78e76ba3944ec88206b46ae15c2974f563ebc487b9a | duas válidas→análises | alternativas justificadas | validade parece contradição | `compare` | `TwoColumnBoard` | alto — condição explica | R1+R2+R3 | `principle_useful` |
| ref-084 | WhatsApp Image 2026-08-11 at 12.31.20 (3).jpeg | 19576244482da88388177357ebe0c8998e7e08e4d6c6781590e600456eb13f7f | verbo→flexão | repete ref-028 | mesmo mapping | `chip_body` | `LabelBodyRow` | baixo — reexportação | R1+R3; quase ref-028 | `redundant` |
| ref-085 | WhatsApp Image 2026-08-11 at 12.31.20.jpeg | 480014a4a87fc3206b0511a28aea334cd236232ebd79bf7636e8d090e40f2ee1 | definição→exemplos ausentes | título + definição | recorte incompleto | `focus` | `BoardChrome` | baixo — sobretudo tipográfica | R1+R3 | `aesthetic_only` |
| ref-086 | WhatsApp Image 2026-08-11 at 12.31.21 (1).jpeg | 4aa05327ff7d12f632151cdd1bedf56e2d814f176e9274bb098331c6f4b1b7d3 | pares confundíveis | repete ref-005 | mesmo contraste | `compare` | `TwoColumnBoard` | baixo — reexportação | R1+R3; quase ref-005 | `redundant` |
| ref-087 | WhatsApp Image 2026-08-11 at 12.31.21 (2).jpeg | 7752f8247acb8c54cb35c27ceb00a38020cc9ae06b2a08ce5cca2d0cbec146f3 | direção referencial→forma | setas de retomada/antecipação | direção abstrata | `rail` | `LogicRailShell` + conectores | alto — dependência visível | R1+R3 | `principle_useful` |
| ref-088 | WhatsApp Image 2026-08-11 at 12.31.21 (3).jpeg | d15fb9fe91e48e9af833af38097856c36a1c277f4f3e4a0b08be9af579a8a9eb | condição composta→resultado | repete ref-022 | mesma regra | `chip_body` | rows + conectores | baixo — recorte | R1+R3; quase ref-022 | `redundant` |
| ref-089 | WhatsApp Image 2026-08-11 at 12.31.21 (4).jpeg | 890526021c0ff2c106de31a28eb3ec674db9b5a6e65f8bacf7fd6b1eeee6224c | gênero→sentido | polos + setas | artigo desacoplado | `compare` | board + conectores | alto — mudança explícita | R1+R3 | `principle_useful` |
| ref-090 | WhatsApp Image 2026-08-11 at 12.31.21.jpeg | 7b7533e099c10b2d9cc79b4c0db50ea018a1e3412634313f8368429b7e63e0c8 | regra→exceções | núcleo + classes | escopo misturado | `isolate` | `LogicIsolateShell` + rows | alto — delimita regra | R1+R2+R3 | `principle_useful` |
| ref-091 | WhatsApp Image 2026-08-11 at 12.31.22.jpeg | e88cc8336cb7888167aaf53d5ced6af0259a75355400584c5113f2d3682c8a5a | erro×correto×facultativo | comparação + nuance | regra/ opção colidem | `compare` | `PolarityPanel` + callout | alto — separa três estados | R1+R3 | `principle_useful` |

## 8. Decisão final sobre as referências

As 91 imagens permanecem evidência externa temporária e devem ser removidas do diretório temporário ao fim da revisão local. Nenhuma imagem, personagem, figura, marca, logotipo, watermark, texto integral ou composição passa a integrar o NeuroVisual Engine. O catálogo continua com oito gestos; as referências geram somente hipóteses de capability e critérios de experimento descritos neste documento.
