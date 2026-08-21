# NeuroVisual Engine — matriz de autoridades e estados

**Status:** proposta documental

**Objetivo:** impedir que manifest, filtro vivo, readiness, cobertura e qualidade visual sejam tratados como a mesma verdade.

## 1. Autoridade por decisão

| Decisão | Autoridade atual | Autoridade futura | Não é autoridade |
|---|---|---|---|
| conteúdo factual | JSON handcraft + fonte/guideline + revisão | igual | renderer, print externo |
| estrutura válida | Zod + write validator | igual + plan validator para plano | registry comercial |
| quatro slides premium | premium/golden gates | igual | schema base isolado |
| família/subtópico/ramo | meta validada + taxonomia | coorte + meta + override | `titulo_aula` fuzzy |
| intenção/erro espacial | brief/revisor | `NeuroSemanticProfile` efetivo | regex isolada |
| gesto | Composer/brief | catálogo + planner + override | rotação por slug |
| composição | resolver runtime | runtime plan compilado de sidecar aprovado | visual gallery isolada |
| execução sem plano | resolver atual | resolver legado | analyzer |
| execução com plano | inexistente | renderer novo após autorização server-side | `approved` isolado, LLM/runtime NLP |
| autoria do plano | inexistente | authoring sidecar normativo | runtime plan mínimo |
| persistência editorial | `modulos_estudo.conteudo_json` | mesmo JSONB, somente runtime plan opcional | sidecar/artifact shadow |
| autorização de rollout | inexistente | política server-side default off | status dentro do payload |
| venda | handcraft registry + ship gate | igual, com validade temporal explícita | `applied` |
| aprovação visual | Visual Bar + humano + captures | evidência ligada ao plan hash | Playwright verde sozinho |

## 2. Universos de dados

| Universo | Definição | Uso permitido |
|---|---|---|
| manifest histórico | união versionada dos lotes | provar escopo aplicado daquele manifest |
| filtro vivo | consulta datada por meta/título | descoberta e reconciliação, nunca coorte implícita |
| interseção | membros comuns entre dois snapshots | análise de drift |
| coorte versionada | lista fechada de slugs/paths + versão | única entrada permitida ao engine/piloto |

Para Saúde da Mulher:

- 246 = manifest histórico;
- 268 = filtro vivo fuzzy;
- 244 = interseção dos snapshots observados;
- 6 = coorte piloto explícita `saude-da-mulher-anchors-v1`.

Nenhuma relação de inclusão é inferida entre o piloto e os outros conjuntos além dos seis paths declarados.

## 3. Estados editoriais e comerciais

| Estado | Significado | Quem calcula/grava | Validade |
|---|---|---|---|
| `golden-v1` | padrão de conteúdo declarado | editorial/write pipeline | por versão do conteúdo |
| `premium_gate_ok` | gate premium sem erros naquela auditoria | auditoria | snapshot, não selo eterno |
| `applied` | conteúdo gravado no Supabase | apply/registry | até reconciliação provar drift |
| `technical_ready` | L1 + L2 + L2b | ship gate | por relatório/coorte |
| `production_ready` | promoção comercial vigente | registry/ship gate | deve carregar data e universo |
| `can_sell` | derivado de `production_status` | runtime/vitrine | não prova qualidade visual atual |

## 4. Máquinas normativas separadas

O authoring sidecar e a autorização de rollout são objetos normativos independentes. Resultado de runtime é observação, não terceiro estado persistido dentro de nenhum deles.

### 4.A Authoring sidecar

#### 4.A.1 Estados

| Estado | Significado | Autoridade que entra no estado |
|---|---|---|
| `draft` | sidecar criado para membro da coorte | autor/editor ou analyzer autorizado |
| `analyzed` | profile sugerido e hashes calculados | analyzer determinístico |
| `shadow_valid` | schema, hashes, bindings e preview shadow passaram | validator técnico |
| `review_pending` | pacote está pronto para revisão humana | coordenador do piloto |
| `approved` | revisões pedagógica, visual e técnica aprovaram aquela revisão | autoridades humanas designadas |
| `rejected` | revisão humana recusou aquela revisão | revisor autorizado |
| `stale` | identidade/compatibilidade deixou de coincidir ou a revisão foi formalmente invalidada por nova evidência | validator/reconciliação ou revisor autorizado |

`approved` é estado editorial do sidecar. Não é feature flag, resultado de runtime nem autorização de produto.

#### 4.A.2 Transições permitidas

| De | Para | Gate |
|---|---|---|
| `draft` | `analyzed` | projeções e hashes válidos |
| `analyzed` | `shadow_valid` | validator + preview técnico sem fallback |
| `shadow_valid` | `review_pending` | pacote de revisão completo |
| `review_pending` | `approved` | revisões exigidas e separação de papéis |
| `review_pending` | `rejected` | decisão humana justificada |
| `draft`, `analyzed`, `shadow_valid`, `review_pending` ou `approved` | `stale` | drift de conteúdo/profile/catálogo/contrato ou invalidação editorial formal |
| `rejected` ou `stale` | `draft` | nova revisão e novo `plan_id`; a revisão anterior não é ressuscitada |

#### 4.A.3 Transições proibidas

- analyzer, compiler, renderer, runtime ou teste emitirem `approved` ou `rejected`;
- runtime alterar qualquer campo ou estado do authoring sidecar;
- `rejected|stale → approved` na mesma revisão;
- sidecar transicionar para `off`, `authorized`, `revoked`, `expired`, `plan_rendered` ou qualquer `legacy_*`;
- autoaprovação pelo mesmo papel quando revisão independente for gate.

### 4.B Autorização externa de rollout

A autorização é server-only, separada do sidecar e vinculada a `plan_id`, `content_hash`, `profile_hash`, `catalog_version` e `renderer_contract_version` exatos.

#### 4.B.1 Estados

| Estado | Significado | Autoridade que entra no estado |
|---|---|---|
| `off` | default; nenhuma seleção de v1 é permitida por essa autorização | configuração inicial/responsável de rollout |
| `authorized` | autorização explícita e vigente para a identidade exata | responsável de rollout/produto |
| `revoked` | autorização retirada antes do vencimento | responsável de rollout/incidente |
| `expired` | autorização perdeu validade temporal ou de política | servidor/política de expiração |

Emitir, revogar ou expirar autorização não altera o authoring sidecar. Em particular, `authorized → revoked` preserva `approved`; eventual invalidação editorial exige transição própria e autoridade própria.

#### 4.B.2 Transições permitidas

| De | Para | Gate |
|---|---|---|
| `off` | `authorized` | sidecar `approved`, hashes/versões compatíveis e decisão explícita posterior ao shadow |
| `authorized` | `revoked` | rollback, incidente ou decisão de produto |
| `authorized` | `expired` | prazo ou política de validade atingido |

`revoked` e `expired` são terminais para aquele registro de autorização. Nova tentativa começa em novo registro/versionamento no estado `off`; não ressuscita a autorização anterior.

#### 4.B.3 Transições proibidas

- sidecar `approved` causar `authorized` automaticamente;
- `off → authorized` por coorte fuzzy, ramo ou pacote sem identidade exata;
- `revoked|expired → authorized` no mesmo registro;
- runtime, renderer, analyzer, compiler ou teste emitirem autorização;
- alteração de rollout remover ou rebaixar `approved`;
- autorização ser serializada no runtime plan ou payload do aluno.

## 5. Resultados observados de runtime

| Resultado | Motivo |
|---|---|
| `plan_rendered` | plano válido + autorização `authorized` + hashes/versões compatíveis |
| `legacy_no_plan` | questão não possui plano |
| `legacy_rollout_off` | autorização ausente ou em `off` |
| `legacy_not_authorized` | autorização `revoked`, `expired` ou não correspondente ao plano |
| `legacy_invalid_plan` | schema/binding/spoiler/capability inválido |
| `legacy_hash_mismatch` | plano/sidecar stale ou hash incompatível |
| `legacy_unsupported_version` | versão não suportada |
| `legacy_runtime_guard` | falha segura inesperada antes do render |

`plan_rendered` e `legacy_*` são eventos/resultados de uma tentativa de renderização. Não são estados do authoring sidecar nem da autorização. O runtime pode emiti-los para observabilidade, mas não pode modificar `draft|analyzed|shadow_valid|review_pending|approved|rejected|stale` nem `off|authorized|revoked|expired`.

Nenhum fallback pode ser silencioso em QA. No produto, a experiência permanece funcional sem expor erro técnico ao aluno.

## 6. Cobertura versus qualidade

| Evidência | Prova | Não prova |
|---|---|---|
| quatro slides presentes | cobertura estrutural | correção pedagógica |
| variant registrada | capacidade de carregar componente | fit com conteúdo |
| slot fit | dados mínimos renderizáveis | boa hierarquia |
| Playwright PASS | fluxo/captura sem falha definida | glanceable ou fonte correta |
| gallery `ready` | evidência registrada | superioridade sobre fallback |
| Visual Bar humano | qualidade na amostra/versão | generalização para pacote |
| `production_ready` | ship gate registrado | ausência futura de drift |

## 7. Paths normativos e artifacts derivados

Os paths abaixo são contrato documental para implementação futura; nenhum arquivo executável ou diretório de dados foi criado neste Lote 0.

| Path conceitual | Responsável | Natureza | Pode ir ao aluno? |
|---|---|---|---:|
| `data/neurovisual/cohorts/<cohort_id>/manifest.json` | curador da coorte | normativo, membros fechados | não |
| `data/neurovisual/authoring/<cohort_id>/<slug>.authoring.json` | editor + revisores | authoring sidecar normativo | não |
| `data/neurovisual/runtime-plans/<cohort_id>/<slug>.runtime-plan.json` | compiler + validator | runtime plan mínimo normativo antes da persistência | somente projeção persistida |
| `data/neurovisual/rollout/authorizations.json` | responsável de rollout | autorização server-side, default off | não |
| `artifacts/neurovisual/<cohort_id>/<run_id>/reports/**` | auditoria | derivado e regenerável | não |
| `artifacts/neurovisual/<cohort_id>/<run_id>/captures/**` | QA visual | derivado e regenerável | não |
| `artifacts/neurovisual/<cohort_id>/<run_id>/diffs/**` | QA/paridade | derivado e regenerável | não |

Artifacts nunca são autoridade para conteúdo, coorte, aprovação ou rollout. Exclusão/reexecução de artifacts não muda hashes normativos.

O path de autorização é conceitualmente server-only: não pode ser importado por client bundle, persistido dentro do runtime plan ou serializado no payload. Sua futura forma física exige revisão de engenharia própria; este Lote 0 não cria nem altera registry.

## 8. Regra de freshness

Todo relatório futuro deve declarar:

- `cohort_id` e versão;
- origem dos membros;
- commit e data;
- hash do conteúdo;
- versão dos gates/engine;
- se consultou local, Supabase ou ambos;
- validade/expiração definida pela equipe.

## 9. Autoridade para invalidar

| Motivo | Autoridade | Efeito no sidecar | Efeito na autorização | Resultado runtime esperado |
|---|---|---|---|---|
| content/profile hash mudou | validator/reconciliação | `stale` | registro anterior não corresponde à nova identidade; não é reescrito pelo runtime | `legacy_hash_mismatch` |
| catálogo/renderer incompatível | validator técnico | `stale` | nenhuma mutação automática; nova autorização exigirá versões compatíveis | `legacy_unsupported_version` ou fallback compatível |
| problema pedagógico/visual | revisor responsável | `review_pending → rejected` ou revisão vigente → `stale`, conforme o momento | permanece independente; revogação, se necessária, é decisão separada | `legacy_not_authorized` após o gate editorial falhar |
| incidente/risco de produto | responsável de rollout | `approved` permanece, salvo invalidação editorial separada | `authorized → revoked` | `legacy_not_authorized` |
| validade temporal/política terminou | servidor/política | `approved` permanece | `authorized → expired` | `legacy_not_authorized` |

Nenhuma linha autoriza o runtime a escrever em sidecar ou autorização. Revogação e expiração controlam execução; não apagam a decisão editorial `approved`.
