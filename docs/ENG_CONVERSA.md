# Engenharia — prompt de conversa

Use em **conversa nova** de uma destas formas:

```text
Feature: badge de progresso na vitrine
```

```text
Bug: histórico não atualiza após tentativa
```

```text
API: POST /api/aluno/marcar-favorito
```

```text
Refactor: extrair helper de paginação da vitrine
```

Ou anexe este arquivo (`@docs/ENG_CONVERSA.md`) — equivalente a escrever o trigger — e edite **só** a linha do pedido.

**Princípio:** escopo fechado (trigger) + padrão local copiável (`examples/eng/`) + gate determinístico que **bloqueia** (`npm run check:ship`) + humano só no risco. Não misturar com handcraft/pipeline.

Rule: [`.cursor/rules/eng-feature.mdc`](../.cursor/rules/eng-feature.mdc) · Guardrails: [`.cursor/rules/avant-engineering.mdc`](../.cursor/rules/avant-engineering.mdc) · Índice: [`AGENTS.md`](../AGENTS.md)

Cópias versionadas no Git (se a rule local sumir após clone, copiar para `.cursor/rules/`): [`docs/cursor/eng-feature.mdc`](cursor/eng-feature.mdc) · [`docs/cursor/avant-engineering.mdc`](cursor/avant-engineering.mdc)

Auditoria **por risco** (o que o gate não cobre): [`ENG_AUDITORIA_POR_RISCO.md`](ENG_AUDITORIA_POR_RISCO.md) — não auditar “toda a estrutura” no dia a dia.  
**Hub segurança:** [`SECURITY_ENG_AVANT.md`](SECURITY_ENG_AVANT.md) · [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) · rituais [`SECURITY_RITUAIS.md`](SECURITY_RITUAIS.md).

---

## Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `Feature:` | Comportamento novo observável no app |
| `Bug:` | Comportamento incorreto com repro (passos / URL / esperado vs atual) |
| `API:` | Route Handler / contrato HTTP (Zod, auth, resposta) |
| `Refactor:` | Mudança interna sem alterar comportamento observável |
| Anexar `@docs/ENG_CONVERSA.md` + pedido na 1ª linha | Mesmo que o trigger curto |

### Fora de escopo (outra conversa)

| Tema | Use |
|------|-----|
| Handcraft / lotes / goldens de questão | `Handcraft:` · [`HANDCRAFT_CONVERSA.md`](HANDCRAFT_CONVERSA.md) |
| Pipeline / qualidade vendável | `Pipeline completo:` / `Qualidade vendável:` |
| Moldes L3 / brief NeuroSlides | `Mapeamento L3:` |
| Só craft visual (vitrine/player) | `Visual:` / `Polish vitrine` · skill `avant-ui-visual` |
| Taxonomia | `Classify:` · [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md) |

**Proibido na mesma conversa:** misturar `Handcraft:`, `Pipeline completo:`, `Qualidade vendável:`, `Mapeamento L3:`, apply de lotes, ou editar conteúdo pedagógico de `examples/questao-premium-*.json` / manifests — salvo fix de app explícito sem alterar slides.

---

## Anexos recomendados

| Situação | Anexar |
|----------|--------|
| Sempre | `@docs/ENG_CONVERSA.md` (este) · `@.cursor/rules/avant-engineering.mdc` |
| API admin | `@examples/eng/api-route-admin.example.ts` |
| RSC + catálogo/questão/histórico | `@examples/eng/rsc-page-cached.example.tsx` |
| Client chamando `/api` | `@examples/eng/client-component-fetch.example.tsx` |
| Nova função em `lib/cache.ts` | `@examples/eng/cache-fn.example.ts` (zona vermelha) |
| PR zona amarela/vermelha | `@docs/PROMPT_META_AUDITORIA_AVANT.md` (§7 Bugbot + Security) |

---

## Instruções para o agente (não pedir confirmação — executar)

### 1. Contrato de escopo (declarar antes de editar)

```text
Resultado observável: <1 frase — quando X, o usuário vê/recebe Y>
Arquivos permitidos:   <paths ou globs estreitos>
Não tocar:             <paths / áreas>
Done:                  npm run check:ship  (+ build/e2e se UI crítica)
Zona de risco:         verde | amarela | vermelha
```

Se o usuário não listar arquivos / “não tocar”, **inferir e declarar** no início da resposta.

### 2. Copiar o padrão (não inventar)

| Família | Golden |
|---------|--------|
| Route Handler admin | [`examples/eng/api-route-admin.example.ts`](../examples/eng/api-route-admin.example.ts) |
| RSC + cache | [`examples/eng/rsc-page-cached.example.tsx`](../examples/eng/rsc-page-cached.example.tsx) |
| Client + `fetchWithAuth` | [`examples/eng/client-component-fetch.example.tsx`](../examples/eng/client-component-fetch.example.tsx) |
| Função de cache | [`examples/eng/cache-fn.example.ts`](../examples/eng/cache-fn.example.ts) |

Fonte de verdade por área: tabela em [`avant-engineering.mdc`](../.cursor/rules/avant-engineering.mdc) · detalhe em [`CLAUDE.md`](../CLAUDE.md) §2–§7 e §10.

### 3. Matriz de risco

| Zona | Exemplos | Quem fecha |
|------|----------|------------|
| **Verde** | UI no design system; bug com teste; CRUD Zod; copy | Agente + `check:ship` |
| **Amarela** | Nova API com auth padrão; player/vitrine com e2e; refactor limitado | Agente entrega; humano amostra PR |
| **Vermelha** | `proxy.ts` / sessão; `lib/cache.ts`; RLS; Stripe/webhooks; migrations; service role novo | Agente implementa; **humano aprova** antes de ship |

Zona vermelha: implementar com diff mínimo, rodar gates, **não** declarar “seguro para prod” sem revisão do usuário. Handoff: [`PROMPT_META_AUDITORIA_AVANT.md`](PROMPT_META_AUDITORIA_AVANT.md) §7.

### 4. Gate Done (obrigatório)

```bash
npm run check:ship
```

Equivale a: `validate:env` && `typecheck` && `check:architecture` && `lint` && `test`.

**Extras condicionais** (não substituem `check:ship`):

- Tocou `app/` / `components/` de forma ampla, player ou slides de UI → considerar `npm run build` e Playwright relevante.
- PR zona vermelha → Bugbot + Security Review.

**Sem PASS de `check:ship` nesta conversa após as mudanças → não declarar pronto.**

### 5. Proibido

- Segundo `createBrowserClient` ou `process.env` fora de [`lib/env.ts`](../lib/env.ts)
- Supabase direto em RSC para módulos/questão/histórico (bypass de [`lib/cache.ts`](../lib/cache.ts))
- `getUser()` / refresh em RSC fora de [`proxy.ts`](../proxy.ts)
- Service role / `createServerSupabase` no client bundle
- `console.log` / `console.error` em `app/`, `components/`, `lib/` → use [`logger`](../lib/logger.ts)
- Refator amplo fora do escopo; commit/push/PR sem pedido explícito
- Misturar triggers de conteúdo nesta conversa

### 6. Encerramento

Reportar em poucas linhas: (1) resultado observável, (2) arquivos tocados, (3) `check:ship` PASS/falha, (4) se zona vermelha — o que o humano deve revisar.

---

## Loop de melhoria contínua (reincidência → gate)

A eficácia de engenharia sobe quando o **mesmo** anti-padrão deixa de ser “lembrar no doc” e passa a ser **bloqueado por script**. Espelho do modelo de conteúdo (`audit:questao-readiness --strict`): gate determinístico, não mais parágrafo.

### Regra operacional

| Contagem | Ação |
|----------|------|
| **1×** | Corrigir o código no PR/conversa; se útil, uma linha em “Proibido” / fonte de verdade — **sem** gate novo ainda. |
| **2×** (mesmo anti-padrão, conversas ou PRs distintos) | A correção vira **gate** em [`scripts/check-architecture-patterns.ts`](../scripts/check-architecture-patterns.ts) — **não** só mais um parágrafo em `CLAUDE.md` / rule. |

**Mesmo anti-padrão** = mesma violação de invariante (ex.: `console.log` em `app/`, segundo `createBrowserClient`, `process.env` fora de `lib/env.ts`), não “qualquer bug de UI”.

**Proibido no loop:** alongar docs como “solução” para reincidência; suíte de testes em massa só para o padrão; gate que quebra legado legítimo sem allowlist.

### Como promover reincidência a gate

1. **Nomear** o check (`kebab-case`, ex. `no-foo-in-bar`) alinhado aos `rule:` já emitidos pelo script.
2. **Implementar** em `scripts/check-architecture-patterns.ts`:
   - Escopo padrão: `app/`, `components/`, `lib/` (constante `ARCH_CHECK_SCOPES`).
   - Mensagem acionável (`file` + `rule` + `detail`).
   - Allowlist só para código legítimo existente (não para “desligar o gate”).
3. **Rodar** `npm run check:architecture` (e `npm run check:ship` se o gate entra no Done de eng).
4. **Registrar** na tabela abaixo (data, invariante em linguagem humana, id do `rule`).
5. **Opcional:** uma linha em “Proibido” desta conversa / `eng-feature.mdc` apontando o id do gate — a fonte que **bloqueia** é o script, não o markdown.

Quem dispara a promoção: agente (ao notar a 2ª ocorrência na mesma linha de trabalho) ou humano (“vira gate”). O commit do novo check segue as regras usuais (só se pedido / no PR de eng).

### Changelog de invariantes → gate

| Data | Invariante | Gate / check (`rule`) |
|------|------------|------------------------|
| baseline | Único `createBrowserClient` | `single-createBrowserClient` |
| baseline | RSC lê `modulos_estudo` via `lib/cache` | `rsc-modulos-estudo-via-cache` |
| baseline | Sem `console.*` em `app/` / `components/` / `lib/` | `no-console-in-app` |
| baseline | Sem service role / `createServerSupabase` no client | `no-service-role-in-client` |
| baseline | Sem `.auth.getUser()` em RSC além de allowlist | `no-getuser-in-rsc` |
| baseline | Env novo só via Zod em `lib/env.ts` | `no-new-env-without-zod` |
| 2026-07-31 | `concept_map` / `golden_rule` não entregam o gabarito antes do raciocínio | `L2c` em [`audit:subtopico-quality`](../scripts/audit-subtopico-quality.ts) ([`lib/catalogMigration/pedagogyGate.ts`](../lib/catalogMigration/pedagogyGate.ts)) |

Rodar: `npm run check:architecture` · agregador de Done: `npm run check:ship`.

Novas linhas entram **só** quando um check é adicionado ou renomeado no script — não registrar correções pontuais de código sem gate.

### Gates de conteúdo (mesmo loop, outro executor)

O invariante de conteúdo segue a mesma regra de reincidência, mas o executor não é `check-architecture-patterns.ts` — é o gate do pipeline que decide `production_ready`. Registrar aqui mesmo assim, para o loop ter uma tabela só.

O anti-spoiler é o caso fundador: a proibição existia em [`.cursor/rules/avant-agent-json.mdc`](../.cursor/rules/avant-agent-json.mdc) e nas skills de handcraft, sempre como instrução de **geração**, e foi violada em 3 de 4 goldens de referência — porque nada relia a saída. A correção foi verificação: detector determinístico (`detectUnifiedPedagogy`, cobrindo `detail`, `correct`, `footer_rule` e `exam_hint`, não só `label`) mais o portão do leitor cego (`audit:blind-reader`), agregados na camada `L2c`. Restrição em prompt vira reforço; quem segura é o gate.
