# Decisão — Descontinuação do AVANT Memória e do Plano diário

**Data:** 2026-07-30  
**Status:** vigente — desmontagem pré-lançamento autorizada por lotes  
**Escopo:** descontinuação do FSRS MVP, do SM-2/Plano diário e das superfícies de revisão; preservação do núcleo de estudo reverso.

Substitui, para efeito de autorização:

- [`DECISAO_REVISAO_FSRS_MVP.md`](DECISAO_REVISAO_FSRS_MVP.md) — permanece como histórico arquitetural; não autoriza mais lotes
- [`PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md`](PLANO_IMPLEMENTACAO_REVISAO_FSRS_MVP.md) — idem
- `DECISAO_LANCAMENTO_AVANT_MEMORIA.md` — **não existe em `main`**; foi introduzido apenas pelo PR #74, fechado sem merge. Não recriado por este ADR.

Não altera:

- [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md) — o destino do Evidence Engine é decisão adiada (§9)

Este ADR é **documental**. Não remove código, não altera banco, não ativa nem desativa flag.

Leitura do status: "autorizada por lotes" descreve o **mecanismo** de desmontagem — ela só pode ocorrer em lotes, cada um com autorização própria. Não é uma autorização antecipada de C2–C5, que permanecem **não autorizados** por este documento (§6).

---

## 1. Contexto

O AVANT **ainda não foi lançado**. Não existem assinantes nem usuários pagantes dependentes da funcionalidade de revisão, o que torna a janela atual a de menor custo possível para descontinuar.

A revisão espaçada, somando FSRS MVP e o SM-2 herdado, acumulou uma superfície de manutenção desproporcional ao estágio do produto: rotas dedicadas, itens de menu, flags de ambiente e allowlist de beta, um job de CI próprio com stack Supabase local e Docker, tabelas e RPC com expectativas de RLS, e um contrato de suporte implícito ("sua revisão chega no dia certo") que exige operação contínua para não mentir ao aluno.

O FSRS foi **tecnicamente implementado e funciona**. A descontinuação é uma decisão de **foco de produto**, não uma reprovação técnica do FSRS nem do trabalho dos lotes R1–R6. O agendador resolvia um problema real; o problema é que resolvê-lo agora compete com o núcleo que ainda precisa provar valor.

---

## 2. Decisão

### 2.1 Descontinuar

- **AVANT Memória** (marca e superfície)
- **Revisões de hoje** (`/revisoes-hoje`)
- **Plano diário** (`/plano-diario`)
- **FSRS MVP** (`lib/fsrs/**`, `ts-fsrs`, tabelas e RPC)
- **SM-2 do produto** (`lib/spaced-repetition.ts` como funcionalidade voltada ao aluno)
- **Promessa comercial de "revisão no momento certo"** em qualquer copy, LP ou material

### 2.2 Preservar

- autenticação
- onboarding
- diagnóstico
- Vitrine
- player de questões
- gabarito
- NeuroSlides
- cadernos
- simulados
- `historico_questoes`
- dashboard de desempenho
- freemium e assinatura
- **seletor de convicção** (`ConvictionSelector`), atualmente utilizado tanto pelo player quanto pelos simulados, enquanto não houver decisão própria sobre ele

---

## 3. Nova promessa central

> **Questão real → diagnóstico do erro → NeuroSlides que ensinam exatamente o que você errou.**

Toda comunicação de produto passa a se ancorar nesta cadeia. Nada nela depende de agendador.

---

## 4. Estado técnico confirmado

Auditoria de 2026-07-30, sobre `origin/main` em `bdb53c71`:

| Fato | Estado |
|------|--------|
| PR #73 (`fix/fsrs-staging-beta-loop`) | **mergeado** — merge commit `bdb53c71` |
| PR #74 (`feat/avant-memoria-r6-1`) | **fechado sem merge** — `mergedAt` null; branch preservada |
| Runtime FSRS em `main` | **presente** — `lib/fsrs/**` importado por `app/api/registrar-tentativa/route.ts` |
| FSRS ativo para o aluno | **não** — desativado por flag `FSRS_MVP_ENABLED` (default off); ver §4.2, os dois gates têm alcance diferente |
| SM-2 / Plano diário | **ainda ativo**, sem gate de flag |
| Migration em `main` | **presente** — `supabase/migrations/20260728040000_spaced_review_fsrs_mvp.sql` |
| Banco principal | contém **1 card** e **2 logs**; migration `20260728040000` registrada no histórico |
| Eventual staging separado | **estado não comprovado** — nenhum ambiente distinto identificável pelos acessos configurados |

### 4.1 Acoplamento real do SM-2 (relevante para C3)

`lib/spaced-repetition.ts` tem estes consumidores em `main`:

| Consumidor | Tipo de acoplamento |
|------------|---------------------|
| `lib/fsrs/reviewsToday.ts` | **runtime** — importa `getTodayReviews`; é o fallback SM-2 de `/revisoes-hoje`, de `/api/analytics/reviews` e do player em `?from=revisoes`. É a ponte mais relevante para o sequenciamento |
| `lib/estudar/questaoPlayerPayload.ts` | **runtime** |
| `app/(dashboard)/(authenticated)/plano-diario/page.tsx` | **runtime** — superfície do aluno |
| `components/dashboard/daily-plan/topic-helpers.ts`, `types.ts` | **somente tipo** (`import type { ReviewItem }`) — sem dependência de runtime |

`lib/cache.ts` **não importa** `lib/spaced-repetition.ts`; a única menção ali é um comentário. O acoplamento real de `lib/cache.ts` é outro e precisa ser tratado explicitamente em C3: ele importa `isFsrsMvpEnabled` e `isFsrsMvpBetaEmail` de `lib/env` e **bifurca a chave de cache** por coorte (`fsrs` / `sm2` / `na`) quando `?from=revisoes`. `lib/cache.ts` é **zona vermelha** — exige revisão humana antes de ship.

### 4.2 Os dois gates não são equivalentes

"Desativado por flag" cobre dois caminhos com alcance diferente:

- **fila / UI:** exige `FSRS_MVP_ENABLED` **e** allowlist de beta por e-mail;
- **escrita em `registrar-tentativa`:** dispara com a flag **sozinha**, para qualquer usuário.

Hoje ambos estão inertes porque a flag está off. Mas se a flag fosse ligada, a escrita tem alcance maior que a coorte de beta. C2/C3 não devem tratar os dois como um gate único.

---

## 5. Invariantes de desmontagem

1. **Não** usar revert geral do PR #73.
2. **Preservar** a correção genérica de build/Vercel contida em `ecc83038` — somente as mudanças em `next.config.js` (Turbopack + file tracing), `vercel.json` e especificamente o script de build em `package.json`. Os hunks de `.gitignore` introduzidos por `ecc83038` são exclusivos dos artefatos FSRS e devem ser removidos no C3 junto com esses artefatos. Não preservar o commit inteiro; preservar apenas os hunks genéricos de build/tracing. Atenção: `ecc83038` **não é um commit puramente de build**. Os outros arquivos dele são FSRS (`lib/fsrs/inventory.ts`, `lib/fsrs/opsReport.ts`, `scripts/fsrs-mvp-ops-report.ts`, `scripts/fsrs-mvp-staging-smoke.ts`, dois testes, dois artifacts e os hunks de `.gitignore`). Preservar por *hunk*, nunca preservando o commit inteiro nem revertendo-o inteiro.
3. **Não** apagar `historico_questoes`.
4. **Não** modificar o comportamento central de registrar tentativa.
5. **Não** misturar UI/runtime e banco no mesmo PR.
6. **Não** remover migration enquanto o estado remoto não estiver resolvido.
7. **Não** executar `DROP` sem backup e autorização humana.
8. **Não** apagar branches históricas.
9. Manter **redirects temporários** para `/estudar`. Ordem obrigatória em C2: hoje `/revisoes-hoje` redireciona para `/plano-diario`, que o próprio C2 remove — o redirect precisa ser reapontado para `/estudar` **antes** ou no mesmo passo da remoção do `/plano-diario`, nunca depois.
10. Cada lote exige **revisão independente e CI verde**.
11. **Não** remover `ConvictionSelector` por associação indevida com Evidence Engine — ele tem consumidores reais em `components/lesson/AvantLessonPlayer.tsx` e `components/simulados/SimuladoRunnerClient.tsx`.
12. Código experimental sem consumidor deve ser tratado em **lote próprio** — `lib/evidence/fsrsSkill.ts`, `rct1.ts`, `rct2.ts` e `transferSelector.ts` não têm consumidor em `app/**` ou `components/**`. O lote é maior do que os quatro arquivos: os quatro têm testes Jest em `__tests__/lib/evidence/` e há acoplamento interno (`rct2.ts` importa de `rct1.ts` e de `fsrsSkill.ts`).

---

## 6. Roadmap

| Lote | Objetivo | Estado |
|------|----------|--------|
| **C1** | Decisão e encerramento do #74 | **este ADR** |
| **C2** | Desligamento da superfície: páginas de revisão (`/revisoes-hoje`, `/plano-diario`), menu e CTAs, redirects diretos para `/estudar`, conteúdo correspondente da Ajuda, e o endpoint `app/api/analytics/reviews/route.ts` (superfície da funcionalidade; importa `lib/fsrs/reviewsToday` e precisa sair **antes** de C3 remover `lib/fsrs/**`, para não quebrar typecheck/build) | não iniciado |
| **C3** | Remoção do runtime (`lib/fsrs/**`, SM-2, `ts-fsrs`, job de CI, flags) | não iniciado |
| **C4** | Comunicação e documentação (copy, LP, ADRs históricos) | não iniciado |
| **C5** | Banco isolado (tabelas, RPC, migration) | não iniciado — exige runbook próprio |

C2 a C5 **não** estão autorizados por este ADR. Cada um exige autorização explícita.

---

## 7. Plano de rollback

- **C2–C4:** revert individual do PR correspondente. Cada lote deve ser pequeno o bastante para que seu revert seja seguro isoladamente.
- **C5:** somente conforme backup e runbook próprio. Não há rollback trivial de perda de dados.
- **Branches históricas** (`feat/avant-memoria-r6-1`, `fix/fsrs-staging-beta-loop`, `feat/fsrs-mvp-r*`) são preservadas **para consulta**, não para reativação automática. Reativar exige nova decisão de produto, não um merge.

---

## 8. Banco

Registro explícito do estado remoto:

- existem **1 card** em `public.spaced_review_cards` e **2 logs** em `public.spaced_review_logs` no banco principal;
- a **natureza desses registros ainda será classificada** — presume-se resíduo do beta interno fechado pelo #73, mas isso não está comprovado;
- **nenhum `DROP` está autorizado por este ADR**;
- **C5 exige runbook e autorização separados**, incluindo backup verificado antes de qualquer DDL destrutiva;
- a migration `20260728040000_spaced_review_fsrs_mvp.sql` **permanece** no repositório até que o estado remoto esteja resolvido (invariante 6).

---

## 9. Decisões adiadas

Deliberadamente **não** decididas aqui:

- possibilidade de **reintroduzir revisão** após validação de demanda real;
- desenho de um **scheduler futuro**, se houver;
- **reaproveitamento do FSRS** já implementado (o código fica no histórico do git, recuperável);
- **destino definitivo do Evidence Engine experimental** (`fsrsSkill`, `rct1`, `rct2`, `transferSelector`);
- **prazo exato para retirada dos redirects** após o lançamento.

Nenhum item desta lista bloqueia C2–C4.
