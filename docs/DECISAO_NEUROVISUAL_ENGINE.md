# ADR — NeuroVisual Engine v1

**Data:** 2026-08-21

**Status:** proposta — Lote 0 documental; implementação não autorizada

**Base auditada:** `origin/main` em `458fe5587a472b27bf5645ea11e2432fd9ff72d6`

**Escopo:** planejamento visual build-time dos quatro NeuroSlides; sem alterar conteúdo, player, renderer, Supabase ou catálogo

Complementa, sem substituir nesta fase:

- [`DECISAO_NEUROSLIDES_GERACAO_2.md`](DECISAO_NEUROSLIDES_GERACAO_2.md);
- [`NEUROCANVAS_PHASE_0A.md`](NEUROCANVAS_PHASE_0A.md);
- [`NEUROSLIDES_VISUAL_BAR.md`](NEUROSLIDES_VISUAL_BAR.md);
- [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md);
- [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md).

## 1. Contexto confirmado

O runtime atual escolhe apresentação em `resolveSlidePresentation`, combinando `layout_variant` explícito, ramo/subtópico, afinidade textual, fit de slots, perfil de família, rotação por slug e fallback genérico. O `NeuroVisualPlan v0` encapsula parte dessa decisão e preserva paridade, mas não é a autoridade geral do renderer.

A auditoria diferencial entre a pasta inicialmente examinada e o `origin/main` atualizado não encontrou mudanças nos arquivos arquiteturais de NeuroSlides. As diferenças são de dashboard, cadernos, simulados e vitrine. A análise anterior permanece tecnicamente aplicável, mas toda implementação futura deve partir deste worktree ou de outro descendente do `origin/main` atualizado.

## 2. Problema

O sistema personaliza por identidade editorial e heurísticas locais, não por um contrato único de intenção pedagógica. Gestos, briefs, visual gallery, primitives e decisão do runtime permanecem em autoridades diferentes. Isso dificulta explicar uma escolha, testar hipóteses e escalar sem criar novas variants.

## 3. Decisão

Adotar, em etapas, um **NeuroVisual Engine build-time, determinístico e explicável**, com dois contratos de autoria e uma projeção mínima de runtime:

1. `NeuroSemanticProfile`: descreve o problema pedagógico e admite overrides humanos nos campos críticos;
2. `NeuroVisualAuthoringSidecar v1`: guarda profile completo, overrides, candidatos, scores, decision trace, revisões e evidências;
3. `NeuroVisualRuntimePlan v1`: projeção mínima, sem dados de revisão, contendo somente o necessário para validar e renderizar.

O runtime não utilizará LLM, geração de imagem ou classificação semântica. A regra de transição é:

```text
runtime plan v1 válido
+ hashes compatíveis
+ versões compatíveis
+ autorização server-side explícita e vigente
→ renderer novo para a questão inteira

qualquer condição ausente ou falha → resolver legado para a questão inteira
```

O resolver atual não será removido no piloto e as 308 variants continuarão disponíveis.

## 4. Autoridade e precedência

1. O conteúdo factual e pedagógico continua sendo autoridade dos JSONs handcraft e dos gates vigentes.
2. Override humano vigente vence sugestão determinística do analyzer; ambos permanecem no authoring sidecar.
3. O planner apenas escolhe entre capacidades declaradas no catálogo de gestos/composições.
4. O plan validator pode declarar o sidecar tecnicamente válido, mas não autoriza rollout.
5. Revisores humanos podem declarar `approved`, mas `approved` não ativa runtime.
6. Somente uma autorização server-side, default off e vinculada a `plan_id` + hashes + versões, permite selecionar o renderer novo.
7. O renderer novo executa o runtime plan; não recebe nem reinterpreta o authoring sidecar.
8. O resolver legado é fallback obrigatório durante toda a adoção incremental.

Os overrides obrigatoriamente suportados são:

- intenção pedagógica;
- erro espacial;
- gesto dominante;
- momento do spoiler;
- número crítico;
- metáfora dos quatro slides.

Cada override deve registrar valor sugerido, valor efetivo, precedência, justificativa, autor, revisor e versão no authoring sidecar. Esses dados não podem ser persistidos no runtime plan nem chegar ao payload do aluno. Ausência de override não autoriza o analyzer a inventar confiança.

## 5. Coorte canônica e escopo

Nenhum pacote será compilado a partir de busca textual em `meta.subtopico` ou `titulo_aula`. Toda execução deve receber um `cohort_id` versionado e uma lista fechada de slugs/paths.

O primeiro piloto é `saude-da-mulher-anchors-v1`, com exatamente as seis âncoras enumeradas em [`NEUROVISUAL_PILOT_SHADOW_MODE.md`](NEUROVISUAL_PILOT_SHADOW_MODE.md). Os conjuntos 246, 268 e 244 não pertencem ao piloto.

## 6. Hashes, sidecars e persistência

### 6.1 Identidade criptográfica

`content_hash` e `profile_hash` usam SHA-256 sobre bytes UTF-8 de JSON canonicalizado conforme RFC 8785/JCS. Arrays preservam sua ordem. Strings não sofrem normalização Unicode implícita: os code points resultantes do parse são preservados; entrada inválida ou surrogate não pareado é rejeitada. Chaves seguem a ordenação e serialização do JCS.

Os hashes são calculados a partir de projeções positivas e versionadas, nunca por “clonar tudo e remover alguns campos”:

- `neuro-content-projection-v1`: campos pedagógicos allowlisted da questão e dos quatro slides;
- `neuro-profile-projection-v1`: valores semânticos efetivos que comandam o planner, ligados ao `content_hash`.

Ficam fora das duas projeções: `neuro_visual_plan`, authoring sidecar, timestamps, relatórios, scores, candidatos, decision trace, evidências, captures e identificadores de revisores. Assim, o próprio plano nunca participa do `content_hash` e hash recursivo é impossível por construção. A projeção detalhada está em [`NEUROVISUAL_CONTRACTS_V1.md`](NEUROVISUAL_CONTRACTS_V1.md).

### 6.2 Shadow mode

Durante o primeiro shadow mode, o authoring sidecar e o runtime plan candidato ficam em paths normativos separados, fora dos JSONs de questão e fora do Supabase. Relatórios e captures ficam em `artifacts/` e são descartáveis. Isso impede que um experimento documental altere o catálogo vendável ou o payload do aluno.

### 6.3 Após aprovação do piloto

Somente o `NeuroVisualRuntimePlan v1` mínimo poderá ser persistido como campo opcional de primeiro nível em `modulos_estudo.conteudo_json`, ao lado de `reverse_study_slides`, com nome conceitual `neuro_visual_plan`. O authoring sidecar completo nunca entra no JSONB nem no payload do aluno.

Motivos:

- mantém questão, slides e plano atomicamente versionados;
- aproveita o loader existente, sem nova query ou join;
- permite validação por hash contra o conteúdo;
- evita tabela nova, migration e política RLS no primeiro rollout;
- mantém ausência do campo como retrocompatibilidade natural.

Não será usado `meta` para armazenar o plano: `meta` descreve a questão e não deve carregar uma árvore de apresentação. Não será criada tabela separada no primeiro rollout. Essa decisão deve ser revisitada somente se tamanho, histórico de versões ou reutilização entre questões comprovarem a necessidade.

### 6.4 Atomicidade

A seleção é feita uma vez no boundary da questão: todos os quatro slides usam v1 ou todos usam o resolver legado. `legacy_variant_id` dentro de um runtime plan é um adapter executado pelo renderer v1 e não autoriza misturar pipelines. Qualquer binding obrigatório, capability, hash, versão ou render guard que falhar derruba a questão inteira para legado.

O error boundary pode tentar v1 no máximo uma vez por ciclo de montagem. Depois da falha, fixa `legacy` para aquela questão/renderização; o caminho legado não reentra no validator ou no renderer v1. Isso previne loops de fallback.

### 6.5 Rollout separado de aprovação

`approved` significa que o authoring sidecar passou pelas revisões exigidas. Não é feature flag nem autorização de produto. O servidor só seleciona v1 quando existe autorização explícita, vigente, default-off e vinculada a `plan_id`, `content_hash`, `profile_hash`, `catalog_version` e `renderer_contract_version`. Essa autorização não é enviada ao aluno.

## 7. Hipóteses, não invariantes

Os itens abaixo são parâmetros de experimento e não podem virar gates globais no Lote 0:

- até sete slots visíveis;
- concordância humana de 90%;
- orçamento único de cliques;
- mesma metáfora obrigatória entre `concept_map` e `danger_zone`.

O plano deve registrar os valores aplicados por composição, mas o piloto decidirá limites por viewport, família e tarefa. Coerência 4/4 pode ser continuidade, contraste deliberado ou progressão — desde que justificada.

## 8. Não objetivos

- compilar os 246 ou 268 registros;
- reconciliar taxonomia de Saúde da Mulher;
- alterar player, `NeuroSlide`, resolver, schemas Zod executáveis ou registries;
- criar variants ou primitives;
- reescrever as seis âncoras;
- aplicar ou promover conteúdo;
- introduzir IA no runtime;
- copiar personagens, figuras, marcas, logotipos ou peças das referências.

## 9. Consequências

### Positivas

- decisão visual explicável e reproduzível;
- overrides humanos formais;
- rollout reversível por questão;
- separação entre planejamento editorial e rendering;
- possibilidade de compor primitives antes de criar novas variants.

### Custos

- dois caminhos de runtime durante a migração;
- versionamento e validação de plano;
- necessidade de inventariar capabilities reais das variants;
- revisão humana continua necessária para qualidade glanceable.

## 10. Gates por etapa

### 10.A Gates para implementar o Lote 1 shadow

Estes gates autorizam somente a implementação e execução isolada do shadow mode, sem persistência em conteúdo/Supabase, sem integração ao player ou renderer de produção e sem autorização de rollout:

1. aprovação humana deste ADR, dos contratos conceituais e da matriz de autoridades;
2. coorte `saude-da-mulher-anchors-v1` congelada nos seis paths canônicos;
3. critérios de entrada, sucesso, parada e saída do shadow mode aprovados;
4. máquina do authoring sidecar separada da autorização externa de rollout e dos resultados observados;
5. allowlists conceituais de bindings, transforms e capabilities aprovadas;
6. análise das 91 referências concluída, com assets externos descartados e sem promoção automática de gesto;
7. nenhum blocker editorial das próprias âncoras confundido com problema do engine;
8. resolver legado preservado como baseline comparável;
9. autorização server-side mantida em `off` e nenhuma integração de produção criada pelo lote shadow.

Cumprir 10.A não escolhe planos para persistência e não autoriza renderer ou rollout.

### 10.B Gates posteriores para persistência, renderer e rollout

Somente depois de o shadow mode estar concluído e revisado podem ser avaliados, em lotes posteriores e com autorização própria:

1. relatório final do shadow para 6/6 âncoras, incluindo falhas e divergências;
2. decisão humana explícita e individual sobre quais planos, se algum, podem avançar; essa escolha é obrigatoriamente posterior ao shadow;
3. authoring sidecar do plano candidato em `approved`, com hashes e versões ainda vigentes;
4. revisão específica da persistência do runtime plan mínimo, sem authoring sidecar no JSONB ou payload do aluno;
5. renderer/adapter v1 implementado e testado separadamente, com atomicidade por questão, error boundary e fallback legado;
6. observabilidade dos resultados `plan_rendered` e `legacy_*`, sem mutação do authoring sidecar pelo runtime;
7. autorização server-side externa criada em `off`, vinculada ao plano, hashes e versões exatos;
8. decisão de rollout separada que pode mover essa autorização para `authorized`, com expiração e rollback definidos;
9. revisão de segurança/engenharia correspondente à zona de risco antes de qualquer produção.

Persistência, renderer e rollout são decisões independentes: aprovação editorial não implica nenhuma delas.

## 11. Auditoria diferencial curta

| Verificação | Resultado |
|---|---|
| `git fetch origin main` | concluído em 2026-08-21 |
| `origin/main` | `458fe5587a472b27bf5645ea11e2432fd9ff72d6` |
| Arquivos de contratos/resolver/player/NeuroCanvas diferentes da branch auditada | nenhum |
| Mudanças remotas não relacionadas | dashboard, cadernos, simulados e vitrine |
| Implementação pode partir de `D:\AVANT` | não |
| Worktree autorizado para Lote 0 | `D:\AVANT-worktrees\neurovisual-lote0` |

## 12. Documentos normativos do Lote 0

| Documento | Responsabilidade |
|---|---|
| Este ADR | decisão, escopo, persistência e precedência |
| [`NEUROVISUAL_CONTRACTS_V1.md`](NEUROVISUAL_CONTRACTS_V1.md) | schemas conceituais |
| [`NEUROVISUAL_GESTURE_CATALOG.md`](NEUROVISUAL_GESTURE_CATALOG.md) | catálogo formal de gestos |
| [`NEUROVISUAL_AUTHORITY_STATE_MATRIX.md`](NEUROVISUAL_AUTHORITY_STATE_MATRIX.md) | autoridades e estados |
| [`NEUROVISUAL_RETROCOMPATIBILITY.md`](NEUROVISUAL_RETROCOMPATIBILITY.md) | política de compatibilidade e rollback |
| [`NEUROVISUAL_PILOT_SHADOW_MODE.md`](NEUROVISUAL_PILOT_SHADOW_MODE.md) | coorte e primeiro shadow mode |
| [`NEUROVISUAL_REFERENCE_ANALYSIS.md`](NEUROVISUAL_REFERENCE_ANALYSIS.md) | inspeção individual 91/91, apêndice rastreável, consolidação de princípios e descartes |

O ZIP externo foi recebido e os 91 JPEGs foram inspecionados individualmente. O apêndice `ref-001`–`ref-091` está concluído com nome original, SHA-256, relação pedagógica, princípio, erro espacial, gesto/capability candidata, valor didático, risco e decisão. A extração temporária foi removida e nenhum asset externo foi incorporado ao repositório ou ao produto.

A análise autoriza somente o uso de princípios abstratos. Não autoriza copiar imagem, texto integral, personagem, figura, marca, logotipo, watermark, paleta ou composição; também não cria nem autoriza novos gestos.

## 13. Status documental do Lote 0

`NEUROVISUAL_LOTE_0_COMPLETO_PENDENTE_REVISAO_DO_ZIP_FINAL`.

O ZIP foi recebido, 91/91 referências foram inspecionadas e o apêndice individual foi concluído. O blocker 8 está encerrado. Os assets externos e a extração temporária foram descartados; somente abstrações documentais permanecem. Esse encerramento não autoriza cópia, novo gesto, implementação do Lote 1, persistência, renderer, rollout, commit ou PR. A revisão independente do ZIP documental final permanece como verificação externa do conjunto.

## 14. Matriz da revisão corretiva

| Blocker | Correção normativa | Documento/seção principal |
|---:|---|---|
| 1 | SHA-256 + RFC 8785/JCS, projeções positivas versionadas, ordem de arrays, Unicode estrito e exclusões anti-recursão | [`NEUROVISUAL_CONTRACTS_V1.md`](NEUROVISUAL_CONTRACTS_V1.md) §2 |
| 2 | authoring sidecar completo separado do runtime plan mínimo; dados de decisão/revisão não chegam ao aluno | `NEUROVISUAL_CONTRACTS_V1.md` §§1, 5 e 6 |
| 3 | `approved` separado da autorização externa (`off|authorized|revoked|expired`); runtime registra resultado, não estado editorial | Este ADR §§4, 6.5 e 10; matriz §§4 e 5 |
| 4 | JSON Pointer RFC 6901, roots por slide, spoiler gate, transforms fechados e catálogo allowlisted | `NEUROVISUAL_CONTRACTS_V1.md` §7 |
| 5 | escolha atômica por questão, adapter v1 para legacy variant, fallback integral e latch anti-loop | Este ADR §6.4; [`NEUROVISUAL_RETROCOMPATIBILITY.md`](NEUROVISUAL_RETROCOMPATIBILITY.md) §4 |
| 6 | paths separados para coorte, autoria, runtime plan, autorização e artifacts regeneráveis | [`NEUROVISUAL_AUTHORITY_STATE_MATRIX.md`](NEUROVISUAL_AUTHORITY_STATE_MATRIX.md) §7 |
| 7 | três domínios separados: authoring sidecar, autorização externa de rollout e resultados observados; runtime não muta sidecar e revogação não remove `approved` | `NEUROVISUAL_AUTHORITY_STATE_MATRIX.md` §§4, 5 e 9 |
| 8 | ZIP recebido, 91/91 inspecionadas, apêndice `ref-001`–`ref-091` concluído, assets descartados e blocker encerrado sem autorizar cópia ou novos gestos | [`NEUROVISUAL_REFERENCE_ANALYSIS.md`](NEUROVISUAL_REFERENCE_ANALYSIS.md) §§1–8; este ADR §§12–14; piloto §12 |
