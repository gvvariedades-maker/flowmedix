# NeuroVisual Engine — política de retrocompatibilidade

**Status:** proposta para aprovação antes de implementação

## 1. Invariante central

O NeuroVisual Engine é opt-in por questão. Ausência ou falha de plano preserva exatamente o caminho atual:

```text
runtime plan v1 válido
+ hashes e versões compatíveis
+ autorização server-side explícita vigente
→ renderer novo para os quatro slides

qualquer ausência ou falha → resolver legado para os quatro slides
```

## 2. O que permanece compatível

- os quatro tipos canônicos e sua ordem v2;
- `reverse_study_slides` como fonte principal;
- `study_slides` como compatibilidade legada;
- `layout_variant` explícito existente;
- `BRANCH_DESIGN_MAP`, afinidade, slot fit e family profiles no caminho legado;
- as 308 variants e registries;
- `ReverseStudyShell`, fullscreen, zoom, swipe e reduced motion;
- payloads sem `neuro_visual_plan`;
- conteúdo já vendável e seus hashes até um plano ser efetivamente persistido.

## 3. Validação antes da escolha de renderer

O runtime plan só vence quando todos os itens forem verdadeiros:

1. campo presente e parseável;
2. `schema_version`, `catalog_version` e `renderer_contract_version` compatíveis;
3. autorização server-side default-off está explicitamente ligada ao `plan_id`, hashes e versões;
4. slug, `content_hash` e `profile_hash` coincidem;
5. quatro entradas canônicas completas;
6. compositions, adapters, primitives e capabilities pertencem à allowlist;
7. bindings RFC 6901, roots, transforms e spoiler policies são válidos;
8. políticas mínimas de acessibilidade são suportadas.

`approved` no authoring sidecar não satisfaz o item 3. Falha em qualquer item seleciona o resolver legado antes de montar qualquer composição v1.

## 4. Política de erro

- a unidade atômica é a questão inteira, nunca um slide;
- nunca renderizar plano parcialmente válido;
- nunca misturar slides v1 e legado na mesma questão;
- `legacy_variant_id` é adapter do renderer v1 e não chamada ao resolver legado;
- nunca tentar reparar semanticamente o plano no runtime;
- nunca chamar analyzer, LLM ou rede externa;
- registrar razão de fallback sem incluir conteúdo sensível;
- binding obrigatório, capability ou policy inválida derruba os quatro slides para legado;
- erro do renderer novo deve ser capturado pelo boundary da questão e degradar os quatro slides para legado.

### 4.1 Error boundary e prevenção de loop

1. O modo `v1|legacy` é escolhido uma vez no boundary da questão.
2. O renderer v1 recebe uma única tentativa por ciclo de montagem daquela questão.
3. Se ocorrer `NV_RENDER_GUARD`, o boundary fixa `legacy` para o restante do ciclo.
4. O caminho legado não consulta novamente o rollout gate, não valida o plano e não reentra no renderer v1.
5. Navegar para outra questão ou carregar nova revisão cria um novo boundary; rerender interno não limpa o latch de fallback.

Isso impede alternância v1→legado→v1 e loops de error boundary.

### 4.2 Códigos mínimos

`NV_NO_PLAN`, `NV_ROLLOUT_OFF`, `NV_NOT_AUTHORIZED`, `NV_SCHEMA_UNSUPPORTED`, `NV_CONTENT_HASH_MISMATCH`, `NV_PROFILE_HASH_MISMATCH`, `NV_CATALOG_UNSUPPORTED`, `NV_RENDERER_UNSUPPORTED`, `NV_BINDING_INVALID`, `NV_SPOILER_POLICY_VIOLATION`, `NV_CAPABILITY_MISSING` e `NV_RENDER_GUARD` sempre resultam em legado integral. Definições normativas: [`NEUROVISUAL_CONTRACTS_V1.md`](NEUROVISUAL_CONTRACTS_V1.md) §8.

## 5. Versionamento

- plan schema, projeções de hash, catálogo e renderer contract são versionados independentemente;
- versões maiores são incompatíveis por padrão;
- versão desconhecida cai no legado;
- mudanças de catálogo/capability que invalidam planos exigem nova compatibilidade declarada;
- edição pedagógica muda `content_hash` e torna o plano `stale`;
- alteração de override efetivo muda `profile_hash` e torna o plano `stale`;
- plano stale não é atualizado automaticamente no runtime.

## 6. Rollout e rollback

| Fase | Caminho do aluno | Persistência |
|---|---|---|
| documental | legado | nenhuma |
| shadow | legado | sidecar local |
| preview interno | legado no produto; v1 em superfície isolada | sidecar |
| piloto aprovado, rollout off | legado | runtime plan pode existir, mas autorização ausente |
| piloto opt-in autorizado | v1 somente para plan IDs/hashes autorizados | runtime plan mínimo opcional no JSONB |
| rollback | legado por revogação server-side | plano pode permanecer ignorado |

Rollback não depende de reescrever os quatro slides nem remover variants.

## 7. Privacidade e minimização do payload

Somente `NeuroVisualRuntimePlan v1` pode acompanhar a questão. Authoring sidecar, profile completo, candidatos, scores, decision trace, justificativas, timestamps, evidências e IDs de revisores permanecem server-side/offline. O runtime plan não contém estado `approved` nem autorização de rollout.

## 8. Compatibilidade visual

Paridade pixel a pixel não é objetivo. O gate é funcional e pedagógico:

- nenhum conteúdo perdido;
- spoiler preservado;
- ordem de leitura correta;
- controles equivalentes;
- fallback disponível;
- mudança visual explicitamente aprovada.

## 9. Critérios para aposentar o resolver legado

Fora do escopo atual. Só pode ser discutido após:

- cobertura ampla baseada em coortes explícitas;
- período de operação sem fallbacks críticos;
- migração comprovada das capabilities das variants;
- ADR específico de descontinuação;
- plano de rollback independente do resolver antigo.
