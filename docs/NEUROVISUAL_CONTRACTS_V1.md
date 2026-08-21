# NeuroVisual Engine — contratos conceituais v1

**Status:** proposta documental

**Natureza:** modelo conceitual; não é Zod, TypeScript, migration ou autorização de implementação

## 1. Separação obrigatória de artefatos

| Artefato | Conteúdo | Pode chegar ao aluno? |
|---|---|---:|
| `NeuroSemanticProfile` | estado semântico efetivo usado pelo planner | não diretamente |
| `NeuroVisualAuthoringSidecar v1` | profile, overrides, candidatos, scores, trace, revisões e evidências | não |
| `NeuroVisualRuntimePlan v1` | projeção mínima para validação e rendering | sim, somente após autorização server-side |
| artifacts derivados | relatórios, diffs, captures e métricas | não |

O runtime plan não contém decision trace, scores, candidatos, justificativas livres, timestamps, evidências ou identificadores de autores/revisores. O servidor não deve anexar o authoring sidecar ao payload da questão.

## 2. Hashing normativo

### 2.1 Algoritmo e serialização

`content_hash` e `profile_hash` são representados como `sha256:<64 hex lowercase>` e calculados assim:

1. construir a projeção positiva indicada pela versão;
2. validar que a projeção contém somente tipos JSON;
3. canonicalizar conforme RFC 8785 — JSON Canonicalization Scheme (JCS);
4. codificar o JSON canônico em UTF-8 sem BOM;
5. calcular SHA-256 sobre esses bytes;
6. serializar em hexadecimal minúsculo com prefixo `sha256:`.

Arrays preservam ordem e nunca são ordenados para hashing. Objetos seguem a ordenação de propriedades definida pelo JCS. Números seguem a serialização JCS; valores não representáveis em JSON, como `NaN` ou infinito, são inválidos.

### 2.2 Unicode

- decodificação de entrada é UTF-8 estrita;
- strings são preservadas nos code points resultantes do parse;
- não há normalização automática NFC, NFD, NFKC ou NFKD;
- escapes JSON equivalentes produzem a mesma string após parse e, portanto, o mesmo JCS;
- surrogate não pareado ou sequência Unicode inválida reprova a projeção;
- mudança real de code point, inclusive forma composta × decomposta, muda o hash.

### 2.3 `neuro-content-projection-v1`

A projeção é construída por allowlist a partir da questão normalizada em ordem v2. Não se obtém a projeção copiando o payload inteiro e removendo campos.

Inclui:

- identidade: `question_slug`;
- `meta`: `family`, `subtopico`, `pedagogical_branch`, `content_standard`;
- `question_data`: `instruction`, alternativas em ordem, identificadores/letras, texto, resposta correta e explicação quando existirem;
- exatamente quatro `reverse_study_slides` normalizados, em ordem, com seus campos pedagógicos semânticos: tipo, títulos/chips editoriais, content, items/concepts, rows, steps, footer, reveal/bullet semanticamente declarados e campos de correção dos distractors.

Exclui, em qualquer nível:

- `neuro_visual_plan`;
- authoring sidecar e profiles anexados por ferramenta;
- `layout_variant`, tema, IDs de composition/primitive e estado de UI;
- timestamps e datas operacionais;
- relatórios, auditorias, scores e candidatos;
- evidências, screenshots, captures e paths de gallery;
- IDs, nomes ou e-mails de autores/revisores;
- hashes pré-existentes do plano/profile.

Como somente campos allowlisted são projetados, `neuro_visual_plan` não pode entrar no próprio hash. Hash recursivo é impossível por construção.

### 2.4 `neuro-profile-projection-v1`

Inclui somente:

- `schema_version` do profile;
- `content_hash`;
- valores efetivos de família, subtópico e ramo;
- intenção dominante/secundárias efetivas;
- erro espacial efetivo;
- gesto dominante efetivo;
- política efetiva de spoiler;
- números críticos efetivos, em ordem;
- estratégia/metáfora 4/4 efetiva;
- relações, eixos, polos, ordenação e necessidade de interação efetivos;
- `decision_source` por campo (`deterministic` ou `human_override`).

Exclui sugestão descartada, confidence, scores, candidatos, justificativas livres, IDs de pessoas, timestamps, revisões e evidências. Assim, mudança no valor ou na precedência efetiva muda `profile_hash`; mudança apenas em comentário/revisor não muda o runtime plan.

## 3. `NeuroSemanticProfile`

| Campo | Obrigatório | Regra |
|---|---:|---|
| `schema_version` | sim | `neuro-semantic-profile-v1` |
| `projection_version` | sim | `neuro-profile-projection-v1` |
| `question_slug` | sim | identidade exata |
| `cohort_id` | sim | coorte versionada |
| `content_hash` | sim | conforme §2 |
| `profile_hash` | sim | conforme §2 |
| `analyzer_version` | sim | versão das regras determinísticas |
| `source_mode` | sim | `manual`, `deterministic` ou `hybrid` |

Campos semânticos controlados:

- `family`, `subtopic`, `pedagogical_branch`;
- `learning_intent` dominante e secundárias;
- `spatial_error`;
- `dominant_gesture`;
- `spoiler_timing`;
- `critical_numbers`;
- `four_slide_strategy` e metáfora;
- relações, polos, eixos, ordenação, densidade observada e necessidade de interação.

## 4. Overrides humanos

Cada campo crítico no authoring sidecar contém:

| Campo | Descrição |
|---|---|
| `suggested_value` | sugestão preservada do analyzer |
| `effective_value` | valor obrigatório para o planner |
| `decision_source` | `deterministic` ou `human_override` |
| `precedence` | `human_override` vence `deterministic`; sem outras precedências implícitas |
| `reason` | justificativa editorial |
| `author_id` | autor do override |
| `reviewer_id` | revisor que confirmou |
| `revision` | revisão monotônica do sidecar |
| `decided_at` | timestamp normativo de auditoria, excluído dos hashes |

Analyzer ou compiler nunca sobrescrevem override vigente. Alterar `effective_value` exige nova revisão e produz novo `profile_hash`. O runtime plan recebe apenas o efeito dessa decisão, nunca sua proveniência humana.

## 5. `NeuroVisualAuthoringSidecar v1`

Envelope completo:

- schema/revision;
- question slug, cohort e hashes;
- `NeuroSemanticProfile`;
- sugestões e overrides;
- catálogo, analyzer, planner e compiler versions;
- candidatos, constraints, scores e eliminações;
- decision trace e rationale;
- runtime plan candidato;
- validações e códigos de falha;
- revisões pedagógica, visual e técnica;
- referências às evidências derivadas;
- estado da máquina documental.

É a fonte normativa de autoria do plano, mas não é fonte de conteúdo factual e não é consumido pelo player.

## 6. `NeuroVisualRuntimePlan v1`

Envelope mínimo:

| Campo | Obrigatório | Descrição |
|---|---:|---|
| `schema_version` | sim | `neuro-visual-runtime-plan-v1` |
| `plan_id` | sim | identidade imutável da revisão compilada |
| `question_slug` | sim | vínculo exato |
| `content_hash` | sim | ligação ao conteúdo |
| `profile_hash` | sim | ligação ao estado semântico efetivo |
| `catalog_version` | sim | allowlist/capabilities usada |
| `renderer_contract_version` | sim | contrato mínimo exigido do renderer |
| `slides` | sim | quatro entradas canônicas |

Não contém `status` ou `approved`. Aprovação e rollout são estados server-side externos ao payload.

Cada slide contém somente:

- `slide_type`;
- exatamente um `composition_id` ou `legacy_variant_id` allowlisted;
- `slot_bindings`;
- semantic color roles;
- spoiler/interaction/responsive/accessibility policies em enums fechados;
- IDs de fallback declarativos quando necessários ao adapter, nunca uma segunda estratégia de renderer.

`legacy_variant_id` é adapter dentro do renderer v1. Não seleciona o resolver legado e não permite mesclar v1/legado entre slides.

## 7. Bindings normativos

### 7.1 Endereçamento

`source_pointer` é JSON Pointer RFC 6901 absoluto sobre a questão normalizada usada no `content_hash`. Escapes `~0` e `~1` seguem a RFC. Pointer relativo, JSONPath, selector textual, wildcard e busca por chave são proibidos.

### 7.2 Allowlist por slide

A ordem v2 fixa os roots:

| Slide | Roots/leafs permitidos |
|---|---|
| concept | `/reverse_study_slides/0` — títulos/chip/footer e `items|concepts/{n}/label|detail|icon`; nunca `correct` |
| logic | `/reverse_study_slides/1` — títulos/chip/footer, `steps/{n}` e reveal policy; resposta apenas conforme spoiler policy após raciocínio |
| golden | `/reverse_study_slides/2` — títulos/chip/footer, `content`, `rows/{n}/label|value|emphasis|badge|sv_kind|exam_hint|fixation`; nunca campo de gabarito direto |
| danger | `/reverse_study_slides/3` — títulos/chip/footer, `content`, `items/{n}/label|detail|correct`; `correct` somente em slot/policy pós-raciocínio |
| contexto restrito | `/question_data/instruction` e `/question_data/options/{n}/label|text` apenas para compositions que declarem capability específica; resposta correta nunca é binding visual direto |

O validator confirma que o tipo presente em cada índice corresponde ao root. Pointer para outro slide, `meta`, `neuro_visual_plan`, explicação geral ou resposta correta fora das exceções acima reprova o plano.

### 7.3 Proteção de spoiler

- concept e golden não podem bindar leaf `correct`, resposta correta, letra do gabarito ou explicação resolutiva;
- logic só pode revelar solução no estado permitido por sua spoiler policy;
- danger pode usar `items[].correct` somente depois do raciocínio e com slot de correção declarado;
- o validator analisa pointer, role do slot e política; nenhum deles isoladamente autoriza o dado;
- os gates pedagógicos atuais continuam obrigatórios e não são substituídos pelo binding validator.

### 7.4 Transforms

A allowlist v1 é fechada e versionada:

| Transform | Efeito permitido |
|---|---|
| `identity@1` | entrega o valor sem alteração |
| `array_items@1` | entrega itens na ordem original |
| `object_fields@1` | projeta uma lista fixa e allowlisted de fields sem renomear texto |
| `collect_ordered@1` | reúne pointers explicitamente enumerados preservando ordem |

São proibidos:

- código, expressão, callback ou script;
- templates ou interpolação arbitrária;
- regex de substituição;
- concatenação com conteúdo inventado;
- tradução, paráfrase ou resumo;
- truncamento, ellipsis ou corte silencioso;
- reorder, sort ou deduplicação;
- acesso fora da allowlist.

Ênfase, cor e papel visual são metadados de slot e nunca transformação textual.

### 7.5 Allowlists de composition, variant e primitive

- `composition_id`, `legacy_variant_id` e primitive IDs pertencem a um catálogo fechado identificado por `catalog_version`;
- o runtime plan referencia IDs, nunca module path, nome de componente arbitrário ou import dinâmico fornecido pelo conteúdo;
- cada composition declara previamente os primitives que pode compor e os slots/capabilities aceitos;
- `legacy_variant_id` precisa existir no registry compatível e estar explicitamente admitido pelo catálogo v1 como adapter;
- primitive desconhecido, composition fora do catálogo ou capability não declarada produz `NV_CAPABILITY_MISSING`;
- atualizar a allowlist exige nova `catalog_version` e declaração explícita de compatibilidade com planos anteriores.

## 8. Validade e códigos de falha

| Código | Condição | Resultado |
|---|---|---|
| `NV_NO_PLAN` | campo ausente | legado integral |
| `NV_ROLLOUT_OFF` | autorização default off | legado integral |
| `NV_NOT_AUTHORIZED` | plan/hashes/versions fora da autorização | legado integral |
| `NV_SCHEMA_UNSUPPORTED` | schema desconhecido | legado integral |
| `NV_CONTENT_HASH_MISMATCH` | conteúdo divergente | legado integral + stale documental |
| `NV_PROFILE_HASH_MISMATCH` | profile divergente | legado integral + stale documental |
| `NV_CATALOG_UNSUPPORTED` | catálogo/capability incompatível | legado integral |
| `NV_RENDERER_UNSUPPORTED` | renderer contract incompatível | legado integral |
| `NV_BINDING_INVALID` | pointer/root/transform/slot inválido | legado integral |
| `NV_SPOILER_POLICY_VIOLATION` | binding expõe resposta indevidamente | legado integral; blocker de aprovação |
| `NV_CAPABILITY_MISSING` | composition/variant/primitive ausente | legado integral |
| `NV_RENDER_GUARD` | exceção durante montagem v1 | legado integral sem nova tentativa |

Não existe fallback parcial por slide.

## 9. Versionamento independente

- `schema_version`: formato do runtime plan;
- `projection_version`: conteúdo exato dos hashes;
- `catalog_version`: IDs e capabilities allowlisted;
- `renderer_contract_version`: recursos mínimos suportados;
- analyzer/planner/compiler versions: somente authoring sidecar.

Compatibilidade deve ser declarada, nunca inferida por comparação lexical de versões.
