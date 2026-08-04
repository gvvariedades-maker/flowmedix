# Decisão — Lançamento do AVANT Memória

**Data:** 2026-07-29  
**Status:** aprovada em 2026-07-29 (ver §14) — **R6.1 autorizado**; AVANT Memória **não ativado**  
**Escopo:** lançamento nativo do FSRS, experiência pública e gates de ativação

**ADR normativo:** [`DECISAO_REVISAO_FSRS_MVP.md`](DECISAO_REVISAO_FSRS_MVP.md)  
**Plano de implementação:** [`PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md`](PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md)  
**Runbook R2 (persistência):** [`R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md`](R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md)

> Esta decisão **não** autoriza ativação de flag, deploy, alteração de variável de produção, execução de banco nem exclusão de dados. Com a aprovação registrada em §14, **somente o R6.1** está autorizado — integralmente atrás da flag e sem ativação pública. **R6.2–R6.5** seguem dependendo de autorização humana explícita, em PRs dedicados.

---

## 0. Procedência e pré-checagem

| Item | Resultado |
|------|-----------|
| `docs/DECISAO_CUTOVER_FSRS_MVP.md` | **Não existe** — nenhum documento concorrente de cutover; este arquivo é a única fonte da decisão de lançamento |
| Worktree R2–R5 | Intacta — esta tarefa não altera código, migration, UI, flag, script ou teste |
| Estado técnico verificado | R2–R5 já mergeados (PRs #69, #70, #71 e fixes posteriores); ADR/plano ainda podem dizer “não autorizado” — **estado real de código prevalece** sobre cabeçalhos legados desses docs |
| Relatório R5 | Executável via `npm run fsrs:ops-report` (`scripts/fsrs-mvp-ops-report.ts`); `artifacts/fsrs-mvp-ops-template.md` **não** existe no repo (só allowlist no `.gitignore`) |

---

## 1. Contexto decisivo

O AVANT **ainda não foi lançado** para usuários reais.

Portanto, **não existe** base de produção que precise passar por cutover SM-2 → FSRS.

A estratégia anterior de:

- backfill do SM-2;
- período de transição;
- aviso de recalibração;
- convivência temporária entre filas;
- preservação de agendamentos legados de usuários reais;

**não deve ser implementada no lançamento.**

O AVANT será lançado com o FSRS como scheduler nativo da primeira versão pública, sob a marca de produto **AVANT Memória**.

### Cutover vs lançamento nativo

| Aspecto | Cutover (estratégia descartada) | Lançamento nativo (esta decisão) |
|---------|----------------------------------|----------------------------------|
| Premissa | Usuários reais já usam SM-2 | Nenhum usuário público ainda |
| Dados | Migrar / preservar agendamentos | Produção começa vazia de cards FSRS |
| Filas | Transição ou convivência | Uma superfície desde o dia 1 |
| Copy | Aviso de recalibração | Sem recalibração — não há migração |
| Backfill pedagógico | Necessário ou desejável | **Proibido** no lançamento |
| SM-2 na UI | Pode reaparecer no rollback | **Nunca** exposto na experiência pública |

---

## 2. Arquitetura de lançamento

Decisões fixas:

1. **FSRS é o único scheduler público** do AVANT desde o primeiro usuário.
2. **SM-2 não será exposto** na experiência pública.
3. É **proibido** atualizar SM-2 e FSRS na mesma tentativa.
4. **Não haverá** conversão de estados SM-2 para FSRS.
5. **Não haverá** backfill pedagógico de histórico de produção.
6. O card FSRS **nasce** na primeira tentativa elegível do usuário.
7. Somente `cold_practice` e `scheduled_review` atualizam o scheduler.
8. Pós-explicação, retry técnico, resposta revelada e contextos desconhecidos continuam **inelegíveis**.
9. A **Vitrine** permanece livre e separada da fila de revisão.
10. O código legado SM-2 poderá permanecer temporariamente como **rollback técnico**, mas ficará **invisível** ao usuário.

---

## 3. Dados de teste e métricas limpas

| Regra | Detalhe |
|-------|---------|
| Contas internas, E2E, QA e demonstração | **Não entram** nas métricas do lançamento |
| Dados de desenvolvimento | Não devem ser tratados como histórico real |
| Antes do lançamento | Executar procedimento **aprovado** para limpar ou excluir dados técnicos das métricas |
| Sem inventário e autorização humana | **Não** apagar dados |
| Produção | Começa **sem** backfill SM-2 |
| Eventos artificiais | **Proibidos** para fingir retenção ou volume |

A **execução** da limpeza fica **fora** desta tarefa documental (requer inventário + autorização humana em lote operacional separado).

---

## 4. Rotas e navegação

| Decisão | Valor |
|---------|-------|
| Rota pública canônica | `/revisoes-hoje` |
| Label do menu | “Revisões de hoje” |
| `/plano-diario` | **Não** apresentado na navegação pública |
| Links antigos / internos para `/plano-diario` | Devem **redirecionar** para `/revisoes-hoje` quando o AVANT Memória estiver ativo |
| Duas filas | **Nunca** para o mesmo usuário |

### Rollback com flag desligada (`FSRS_MVP_ENABLED` off)

Decisão de produto (mantenedor, 2026-07-29):

- `/revisoes-hoje` **permanece** a rota pública.
- A UI exibe estado **degradado** (revisões temporariamente indisponíveis) — ver copy §6.
- SM-2 **continua invisível** (não redirecionar para `/plano-diario` como superfície de revisão).
- Cards e logs FSRS **não** são apagados.
- Rollback é evento **técnico**; **não** muda a marca AVANT Memória nem reintroduz segunda fila.

> **Divergência com o código atual (não corrigida aqui):** hoje `/revisoes-hoje` redireciona não-beta para `/plano-diario`, e o Plano diário ainda serve SM-2 com CTA FSRS paralelo. Alvo: R6.1 / R6.2.

> **R6.1 permanece atrás da flag:** todas as alterações de menu, rota e redirect do R6.1 permanecem atrás da flag. R6.1 não poderá tornar a superfície pública antes da conclusão e validação do anti dual-write do R6.2.

---

## 5. Nome comercial (três camadas)

| Camada | Nome |
|--------|------|
| Produto / marketing | **AVANT Memória** |
| Menu / interface | **Revisões de hoje** |
| Engenharia | **FSRS MVP** |

**Descrição comercial:**  
Revisão inteligente no ritmo da sua memória.

**Frase principal:**  
Você estuda. O AVANT lembra quando é hora de revisar.

**Frase de campanha:**  
Questão hoje. Memória na prova.

### Proibido na comunicação

- FSRS beta  
- algoritmo FSRS  
- inteligência artificial (se não houver IA no fluxo)  
- garantia de aprovação  
- garantia de retenção  
- “momento perfeito”  
- “você dominou” sem evidência  
- “100% eficiente”  

> **“Beta” apenas interno:** a proibição de “FSRS” e “beta” aplica-se à comunicação destinada ao aluno. Scripts, relatórios e artefatos operacionais internos podem manter nomenclatura técnica, desde que ela não seja exibida na interface pública.

---

## 6. Copy da interface (canônica)

| Situação | Texto |
|----------|-------|
| Título | Revisões de hoje |
| Descrição | Estas questões foram selecionadas para reforçar o que você já estudou. |
| Questão alternativa (outro enunciado do tema) | Para testar sua memória, poderá aparecer outra questão do mesmo tema. |
| Fila vazia (em dia) | Você está em dia. Continue estudando para criar novas revisões. |
| Falha não bloqueante do scheduler | Não foi possível atualizar sua revisão agora. Sua resposta foi registrada normalmente. |
| Primeiro acesso sem cards | Responda questões normalmente. Suas revisões aparecerão aqui conforme você avançar. |
| Rollback / flag off (estado degradado) | Revisões temporariamente indisponíveis. Sua resposta nas questões continua sendo registrada normalmente. |

**Não** mostrar aviso de “recalibração” — não existe migração de usuários reais.

---

## 7. Flags e ativação

| Regra | Detalhe |
|-------|---------|
| `FSRS_MVP_ENABLED` | Fail-closed; **desligada por padrão** no código |
| Ativação | Exige configuração **explícita** no ambiente |
| Ordem | 1) equipe interna → 2) QA e usuários beta → 3) lançamento público |
| Rollback | Desliga a superfície (estado degradado em `/revisoes-hoje`); **não** apaga cards nem logs |
| Merge | **Nenhuma** variável ligada automaticamente pelo merge |
| PR | **Nenhum** PR autoriza deploy ou alteração de variável de produção |

---

## 8. Gate pré-lançamento

Critérios técnicos que precisam estar concluídos **antes do primeiro usuário público**.  
Qualquer falha em **atomicidade**, **RLS**, **registro da resposta** ou **scheduler duplo** = **NO-GO**.

### 8.1 Banco

- [ ] Migration aplicada em ambiente de staging aprovado  
- [ ] RPC real testada  
- [ ] Concorrência do primeiro card testada  
- [ ] Retry com mesmo `attempt_id` testado  
- [ ] Conflito de `revision` testado  
- [ ] RLS real testada  
- [ ] Zero cenário card sem log ou log sem card  
- [ ] Rollback da migration documentado  

### 8.2 Runtime

- [ ] Falha FSRS nunca bloqueia a resposta  
- [ ] Gabarito calculado no servidor  
- [ ] Context calculado no servidor  
- [ ] Nenhuma chamada duplicada cria duas revisões  
- [ ] Flags desligadas: legado técnico funcional, **sem** exposição pública do SM-2 (ver §4 rollback)  
- [ ] Nenhum dual-write SM-2 + FSRS  

### 8.3 Produto

- [ ] `/revisoes-hoje` funcional em mobile e desktop  
- [ ] Fila vazia  
- [ ] Fila com cards vencidos  
- [ ] Questão removida / inválida  
- [ ] Inventário insuficiente  
- [ ] Same-stem fallback  
- [ ] Navegação e retorno ao player  
- [ ] Ajuda e Progresso atualizados  
- [ ] Acessibilidade básica validada  

### 8.4 Operação

- [ ] Relatório R5 executável (`npm run fsrs:ops-report`)  
- [ ] Métricas excluem contas internas / sintéticos  
- [ ] Alerta para `persistence_unknown`  
- [ ] Procedimento de rollback testado (estado degradado, SM-2 invisível)  
- [ ] Responsável pelo go/no-go identificado  

---

## 9. Métricas pós-lançamento

**Não** bloquear o lançamento por não haver ainda 14 dias de usuários reais.

### 9.1 Gate de lançamento

Baseado em **segurança**, **integridade**, **testes** e **QA** (§8).

> O veredito `defaultOn` de `lib/fsrs/opsReport.ts` (volume, D+7/D+14) é ferramenta de **avaliação observacional / default-on gradual**, **não** substitui o gate de lançamento desta seção.

### 9.2 Avaliação após lançamento

Depois de pelo menos:

- 14 dias;  
- 200 revisões elegíveis;  
- volume real suficiente para análise honesta.

Medir:

1. Acerto em revisão D+7  
2. Conclusão da fila  
3. Fallback para mesmo enunciado (`same_stem_fallback`)  
4. Inventário insuficiente  
5. `persistence_unknown`  
6. `revision_conflict`  
7. Fila vazia indevida  
8. Retorno do usuário às revisões  

Classificar resultados como **observacionais**, não RCT.  
**Não** afirmar eficácia causal sem experimento controlado.

---

## 10. Sequência posterior (R6) — somente após aprovação deste documento

Propor em **PRs separados** (não misturar migration com UI):

| Lote | Escopo |
|------|--------|
| **R6.1** | Nomenclatura, menu, rota canônica e redirects (`/plano-diario` → `/revisoes-hoje` quando ativo) |
| **R6.2** | Remoção da exposição pública do SM-2 e proteção contra scheduler duplo |
| **R6.3** | Copy, Ajuda e Progresso (textos §5–§6) |
| **R6.4** | QA de lançamento, flags e runbook de ativação (inclui estado degradado no rollback) |
| **R6.5** | Relatório pós-lançamento de 14/30 dias |

**Autorização vigente (2026-07-29):** somente **R6.1**, integralmente atrás da flag e sem ativação pública. **R6.2–R6.5 não estão autorizados** até aprovação humana explícita em PRs dedicados. A ativação pública continua condicionada ao anti dual-write do R6.2 concluído e validado (§4) e ao gate §8.

---

## 11. Fora do escopo

- Backfill SM-2  
- Aviso de recalibração  
- Evidence Engine  
- Convicção  
- Transferência T1  
- `measurement_pool`  
- RCT  
- Bandit  
- LLM / API em runtime  
- Ativação global nesta tarefa  
- Execução de banco  
- Deploy  
- Exclusão de dados  
- Redesign completo do player  

---

## 12. Divergências conhecidas (decisão × código atual)

Registro para R6 — **não** corrigidas nesta tarefa:

| Divergência | Onde | Alvo |
|-------------|------|------|
| Dupla fila (SM-2 + CTA FSRS) | `PlanoDiarioView`, `plano-diario/page.tsx` | R6.2 |
| Redirect invertido (não-beta → `/plano-diario`) | `revisoes-hoje/page.tsx` | R6.1 |
| Jargão “Fila FSRS” / “FSRS beta” na UI | `revisoes-hoje`, CTA do Plano | R6.3 |
| Menu “Plano diário” | `lib/layout/dashboardNav.ts` | R6.1 |
| Ajuda passo 08 e Progresso → `/plano-diario` | `ajuda/page.tsx`, `MeuDesempenhoDashboard` | R6.1 / R6.3 |
| Player `from=plano` usa `getTodayReviews` (SM-2) | `questaoPlayerPayload.ts` | R6.2 |
| Cabeçalhos ADR/plano desatualizados (“R2/R3 não autorizados”) | docs R1–R5 | Fora deste doc (não editar nestes lotes) |
| `defaultOn` NO-GO por volume/janela | `opsReport.ts` | Separar conceitos; R6.4 / R6.5 |

| Tema | Estado atual | Decisão |
|---|---|---|
| Contextos pedagógicos no runtime | `FsrsAttemptContext` (`lib/fsrs/types.ts`) e o gate de elegibilidade (`lib/fsrs/eligibility.ts`) aceitam/rejeitam corretamente os 8 contextos, incluindo os ricos (`post_explanation`, `immediate_transfer`, `answer_revealed`, `technical_retry`, `invalid_question`, `unknown`) de forma fail-closed. Porém o mapeamento runtime atual em `lib/fsrs/applyReview.ts` (`mapAttemptContext`) é **binário**: produz somente `cold_practice` ou `scheduled_review`. O player atual (`AvantLessonPlayer.tsx`) faz uma **única** chamada a `registrar-tentativa` por tentativa — não existe hoje uma segunda chamada pós-explicação, retry técnico ou resposta revelada. | Não descrever os contextos inelegíveis como fluxos runtime já exercitados — eles existem no contrato e no gate, mas não são produzidos hoje. Isso **não é um defeito explorável** no lançamento porque não existe segunda chamada no fluxo atual. Se R6 ou uma mudança futura do player introduzir retry, nova tentativa pós-explicação ou resposta revelada, o contexto correspondente deverá ser **derivado no servidor** (nunca no client), permanecer **fail-closed** e receber **testes específicos** antes de qualquer ativação — `isReplay` de `historico_questoes` **não** deve ser usado como substituto semântico desses contextos. Gate obrigatório de R6.2 / R6.4. |

---

## 13. Trechos do plano anterior que se tornam desnecessários no lançamento

Com lançamento nativo (sem usuários reais prévios), deixam de ser requisitos de produto:

- Backfill / conversão SM-2 → FSRS  
- Período de convivência de filas SM-2 + FSRS para o mesmo usuário  
- Aviso de “recalibração” de revisões  
- Preservação de agendamentos legados de produção  
- Cutover gradual “SM-2 permanece até migrar a base” como caminho feliz  

Permanecem válidos: atomicidade RPC, RLS, fail-closed de flags, elegibilidade, Vitrine livre, métricas R5 como **avaliação** (não como bloqueio artificial do primeiro dia público se o gate §8 estiver verde).

---

## 14. Aprovação

| Papel | Assinatura | Data |
|-------|------------|------|
| Produto / mantenedor | **Aprovado** — registro em conversa: “Aprovo a Decisão de Lançamento do AVANT Memória. Pode iniciar exclusivamente o R6.1, integralmente atrás da flag e sem ativação pública.” | 2026-07-29 |
| Engenharia | _aguarda_ (revisão do PR R6.1) | |

**Escopo liberado pela aprovação:** apenas **R6.1** (nomenclatura, menu, rota canônica, redirects e o estado degradado necessário à segurança do roteamento), integralmente atrás da flag, **sem ativação pública**. R6.2–R6.5 permanecem não autorizados (§10).

**Ativação:** somente após gate §8 GO + configuração explícita de ambiente + responsável identificado (§8.4). A aprovação acima **não** liga nenhuma variável e **não** torna a superfície pública.

---

*Documento criado em 2026-07-29. Status: aprovado (§14) com R6.1 autorizado. AVANT Memória ainda não ativado.*
