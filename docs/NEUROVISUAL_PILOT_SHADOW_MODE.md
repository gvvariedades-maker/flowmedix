# NeuroVisual Engine — piloto e primeiro shadow mode

**Status:** proposta documental

**Coorte:** `saude-da-mulher-anchors-v1`

**Tamanho:** 6 questões; sem expansão automática

## 1. Manifest conceitual da coorte

| # | Ramo | Path canônico |
|---:|---|---|
| 1 | `mulher_prenatal` | `examples/questao-premium-cpcon-saude-mulher-pre-natal-vf.json` |
| 2 | `mulher_parto` | `examples/questao-premium-admtec-saude-mulher-parto-humanizado-vf.json` |
| 3 | `mulher_papanicolau` | `examples/questao-premium-vunesp-saude-mulher-papanicolau.json` |
| 4 | `mulher_mama` | `examples/questao-premium-vunesp-saude-mulher-mamografia.json` |
| 5 | `mulher_puerperio` | `examples/questao-premium-ms-saude-mulher-puerperio-consulta.json` |
| 6 | `mulher_planejamento` | `examples/questao-premium-cpcon-saude-mulher-planejamento-vf.json` |

Esta lista, seu `cohort_id` e o commit constituem a coorte. Descoberta por `meta.subtopico`, `titulo_aula`, glob ampliado, manifest de 246 ou filtro vivo de 268 é proibida.

## 2. Objetivo

Avaliar se um perfil semântico com overrides e um catálogo formal de gestos conseguem produzir planos explicáveis e renderizáveis para seis relações distintas, sem alterar o caminho do aluno e sem provar conclusões para o pacote inteiro.

## 3. Shadow mode

Para cada âncora, produzir fora do conteúdo:

1. snapshot da projeção `neuro-content-projection-v1` e hashes SHA-256/JCS;
2. sugestão determinística de `NeuroSemanticProfile`;
3. overrides humanos;
4. candidatos de gesto/composição;
5. authoring sidecar completo;
6. `NeuroVisualRuntimePlan v1` mínimo candidato;
7. validação de JSON Pointer, roots, transforms, spoiler e capabilities;
8. preview isolado e atômico desktop/mobile;
9. comparação com o resolver legado;
10. decisão humana `approve`, `revise` ou `reject` no sidecar.

Nenhum plano shadow será lido pelo player de produção, gravado no Supabase ou anexado aos seis JSONs. `approved` não ativa runtime e nenhuma autorização server-side será criada neste piloto documental.

### 3.1 Paths do piloto futuro

| Natureza | Path conceitual |
|---|---|
| manifest normativo | `data/neurovisual/cohorts/saude-da-mulher-anchors-v1/manifest.json` |
| authoring sidecar | `data/neurovisual/authoring/saude-da-mulher-anchors-v1/<slug>.authoring.json` |
| runtime plan candidato | `data/neurovisual/runtime-plans/saude-da-mulher-anchors-v1/<slug>.runtime-plan.json` |
| relatórios derivados | `artifacts/neurovisual/saude-da-mulher-anchors-v1/<run_id>/reports/` |
| captures derivados | `artifacts/neurovisual/saude-da-mulher-anchors-v1/<run_id>/captures/` |
| diffs derivados | `artifacts/neurovisual/saude-da-mulher-anchors-v1/<run_id>/diffs/` |

Os paths são normativos apenas como contrato documental; não foram criados nesta rodada. Artifacts são regeneráveis e não aprovam sidecar nem rollout.

## 4. Perguntas do piloto

- O analyzer reconhece corretamente sequência, espectro, comparação e número crítico?
- Quais campos precisam de override nas seis âncoras?
- Os oito gestos existentes cobrem os problemas sem gesto novo?
- Uma composição por primitives preserva todo o conteúdo das variants atuais?
- Quantos slots continuam legíveis em 375 px para cada caso?
- Quantos cliques são realmente úteis por tarefa?
- Continuidade 4/4 melhora o entendimento ou um contraste deliberado funciona melhor?
- O decision trace é compreensível por editor e designer?

## 5. Hipóteses testadas

| Hipótese | Como observar | Não transformar automaticamente em gate |
|---|---|---|
| 5–7 slots favorecem scan | comparar variantes narrow e stress | sim |
| gesture dominante é consensual | revisão cega por pelo menos dois avaliadores | sim |
| poucos cliques reduzem fricção | registrar passos necessários e conteúdo revelado | sim |
| concept/danger ganham com continuidade | comparar continuidade × contraste justificado | sim |

Não há meta fixa de 90% no primeiro piloto. O relatório deve apresentar concordância bruta, divergências e motivos.

## 6. Critérios de entrada

- os seis arquivos existem no commit da coorte;
- conteúdo e fontes foram considerados editorialmente aptos para o experimento;
- nenhum problema factual é atribuído ao engine;
- catálogo de gestos e contratos foram aprovados;
- avaliadores conhecem a distinção entre qualidade visual, cobertura e correção pedagógica;
- fontes necessárias ao screenshot carregam de forma determinística.

## 7. Critérios de sucesso do shadow mode

### Obrigatórios

- 6/6 planos reproduzíveis com os mesmos inputs/versões;
- 6/6 `content_hash` e `profile_hash` reproduzidos por SHA-256 + RFC 8785/JCS;
- 6/6 decision traces completos;
- 6/6 possuem fallback legado válido;
- 6/6 runtime plans mínimos não contêm trace, score, candidato, justificativa ou reviewer ID;
- 6/6 bindings usam JSON Pointer RFC 6901 e transforms allowlisted;
- zero texto pedagógico ou gabarito hardcoded no plano;
- zero binding de spoiler fora da policy do slide;
- zero perda de conteúdo obrigatório;
- zero overflow oculto em 375 px e viewport desktop escolhida;
- reduced motion mantém todo conteúdo acessível;
- todo override crítico aparece no trace;
- falha obrigatória em qualquer slide seleciona legado para a questão inteira;
- nenhuma execução toca nos 246/268 registros.

### Evidência, não gate global

- concordância dos revisores por campo;
- quantidade de overrides por âncora;
- slots visíveis por composição;
- interações necessárias;
- preferência entre plano e legado;
- pontos em que variant bespoke ainda supera composition grammar.

## 8. Critérios para sair do shadow mode

Um authoring sidecar individual pode chegar a `review_pending` somente após:

- validação técnica e visual da mesma versão;
- comparação documentada com o legado;
- confirmação no ambiente shadow de que o fallback projetado não altera conteúdo, resposta ou spoiler;
- relatório da mesma revisão com hashes, versões, captures e divergências.

A transição de `review_pending` para `approved|rejected` exige então revisão pedagógica e visual humana, com a independência de papéis definida para o piloto.

Aprovação de uma âncora não aprova seu ramo nem o pacote e não autoriza persistência, renderer ou runtime. Somente após o shadow consolidado uma etapa posterior pode decidir quais planos, se algum, avançam. Persistência, implementação do renderer e autorização server-side externa exigem gates próprios; a autorização nasce em `off` e deve ser vinculada a plan ID, hashes e versões.

## 9. Stop conditions

Parar e revisar o contrato se ocorrer:

- necessidade de copiar texto para o plano;
- gesto escolhido depender de regex frágil sem override;
- mais de um renderer por slide na mesma questão;
- tentativa de fallback parcial ou mistura v1/legado nos quatro slides;
- authoring sidecar, trace, score ou reviewer ID presente no payload/runtime plan;
- `approved` tratado como feature flag;
- hash calculado sobre payload inteiro ou incluindo `neuro_visual_plan`;
- pointer fora da allowlist ou transform arbitrário;
- fallback alterar resposta ou spoiler;
- expansão implícita da coorte;
- demanda por nova variant antes de testar primitives existentes;
- tentativa de usar os 91 prints como templates copiáveis.

## 10. Saída esperada do piloto futuro

Relatório por âncora e consolidado contendo:

- profile sugerido × efetivo;
- overrides;
- plano e trace;
- captura legado × shadow;
- resultados desktop/mobile/reduced-motion;
- avaliação pedagógica e visual separadas;
- decisão e próximos passos.

## 11. Máquina de estados aplicada ao piloto

O authoring sidecar do piloto pode percorrer `draft → analyzed → shadow_valid → review_pending → approved|rejected`. Drift de hash/versão leva a `stale`; correção de `rejected|stale` cria nova revisão e novo `plan_id`.

O Lote 1 shadow não cria autorização externa de rollout. Os estados `off|authorized|revoked|expired` pertencem a outro objeto e a lotes posteriores; `plan_rendered` e `legacy_*` são apenas resultados observados. Preview, teste ou runtime não alteram o authoring sidecar. Em qualquer adoção posterior, revogar rollout preserva `approved`.

Autoridades e transições completas: [`NEUROVISUAL_AUTHORITY_STATE_MATRIX.md`](NEUROVISUAL_AUTHORITY_STATE_MATRIX.md) §4.

## 12. Referências 1–91

O ZIP externo foi recebido, e 91/91 JPEGs foram inspecionados individualmente. [`NEUROVISUAL_REFERENCE_ANALYSIS.md`](NEUROVISUAL_REFERENCE_ANALYSIS.md) contém o apêndice concluído `ref-001`–`ref-091`, com nomes originais, SHA-256 de rastreabilidade, classificação individual, duplicatas/quase duplicatas e consolidação. O blocker 8 está encerrado.

Os assets foram usados apenas em extração temporária fora do worktree e depois descartados; nenhuma imagem virou asset, fixture, golden ou fonte de conteúdo. A análise permite testar somente princípios abstratos. Não autoriza copiar texto integral, personagem, figura, marca, logotipo, watermark, paleta ou composição e não cria, promove nem autoriza novos gestos. Qualquer hipótese de capability permanece sujeita ao shadow e às autoridades editoriais.
