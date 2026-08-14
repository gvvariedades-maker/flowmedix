# Auditoria final pré-commit — Meu Desempenho TEC adaptado (V1 + V1.1)

Prompt mestre **corrigido** para disparar no Cursor (Agent). Não é a spec de produto — a constituição continua em [`PROMPT_DESEMPENHO_TEC_ADAPTADO.md`](PROMPT_DESEMPENHO_TEC_ADAPTADO.md).

> **Alterações vs. o rascunho monolítico (review 2026-08-12):**
>
> 1. **Marca:** hipótese “verde canônico” **não** é autoridade. Dashboard/hub = Editorial + `--color-brand` (laranja). Verde = success. Sem `docs/design-system/README.md` no repo.
> 2. **Leitura fechada** — sem “ler AGENTS/CLAUDE/arquitetura inteiros”.
> 3. **Duas conversas** (Fase A → pare e reporte → Fase B) + budget anti-estouro.
> 4. E2E do wizard estrito: se não houver auth de teste segura, **não** bloqueia `APROVADO_PARA_COMMIT` se Jest cobrir o contrato.
> 5. Gates = scripts reais do `package.json` (`check:ship` já inclui typecheck + architecture + lint + test). Não existe `security-audit` canônico — usar revisão manual do reset + `check:architecture`.
> 6. Worktree: se já estiver em `feat/desempenho-tec-adaptado-v1` com dirty tree auditável, **não** criar worktree nova.

---

## Como disparar

### Conversa 1 — só Fase A

```text
Auditoria pré-commit Desempenho — Fase A (somente leitura)

Anexo: @docs/PROMPT_DESEMPENHO_AUDITORIA_PRE_COMMIT.md
@docs/PROMPT_DESEMPENHO_TEC_ADAPTADO.md
@docs/DESEMPENHO_METRICAS.md
@docs/DESEMPENHO_TEC_ADAPTADO_V1_RELATORIO.md
@docs/DESEMPENHO_V1_OPS_HANDOFF.md

Escopo: inventário Git + diff + achados preliminares. NÃO editar. Pare e reporte ao fim da Fase A.
```

### Conversa 2 — Fase B

```text
Auditoria pré-commit Desempenho — Fase B

Anexo: @docs/PROMPT_DESEMPENHO_AUDITORIA_PRE_COMMIT.md
+ relatório curto da Fase A desta conversa / thread anterior

Escopo: corrigir P0/P1 do delta, reconciliar docs, gates, evidências, relatório final.
Sem commit / push / PR / deploy / migration / escrita no banco.
```

**Budget:** se o contexto estourar na Fase A, termine o inventário + top achados e pare. Não comece a Fase B na mesma mensagem.

---

## Papel

Você atua como auditor sênior independente. Trabalhe no repositório já aberto.

Missão:

1. Comprovar o estado real da branch e do delta contra a base.
2. Auditar código, contratos, métricas, UX, a11y, segurança, testes e evidências.
3. Corrigir **somente** (Fase B) defeitos P0/P1 introduzidos ou expostos por este delta + inconsistências documentais do escopo.
4. Repetir gates afetados.
5. Entregar relatório rastreável, sem alegação não comprovada.

Não declare aprovação porque o código compila ou porque um relatório anterior diz PASS.

---

## 1. Contexto do produto (resumo)

AVANT enf: estudo reverso para Técnico de Enfermagem.

Ciclo: questão → diagnóstico → 4 NeuroSlides → nova aplicação → revisão.

Stack: Next.js App Router, TypeScript, Supabase+RLS, Zod, Jest, Playwright, Vercel.

`/desempenho` inspira-se funcionalmente no TEC; **não** copia a aparência. Deve ficar mobile-first, acessível e coerente com o design system **Editorial** da área logada.

---

## 2. Estado reportado — hipótese a verificar

Branch: `feat/desempenho-tec-adaptado-v1`

Docs: os quatro anexados acima.

Relato (não é prova):

- E1–E4 + V1.1 Cadernos estrito concluídos
- `check:ship` ~381 suítes / 3442 testes / 3 skipped
- build PASS; E2E hub PASS chromium + Mobile Chrome
- capturas em `artifacts/desempenho-v1/f5ee914e/`
- Firefox/WebKit não instalados; smoke RLS SKIPPED
- commit/PR/deploy não feitos
- `respondida` + RPC `get_vitrine_page` teriam sido confirmadas por SELECT no projeto `ozgouenqrofnvgrlgfwd`
- docs em disco ainda podem afirmar “não comprovado”
- modo estrito: `sessionStorage` + filtro por `titulo_aula`
- marca do hub: laranja via token Editorial

Confira cada item no estado real.

---

## 3. Resultado esperado

Com evidências, responder:

- Delta dentro do escopo?
- Métricas honestas (amostra, período, TZ)?
- V1.1 sem assunto não selecionado? Risco de título homônimo tratado com honestidade?
- Bloqueios sem chamada de API?
- Reset só estudo do usuário autenticado?
- Overflow / sobreposição 320–412?
- Design system canônico (Editorial) respeitado?
- Testes/capturas batem com o delta auditado?
- O que pode ir a commit/PR e o que fica proibido para deploy?

---

## 4. Restrições operacionais

### 4.1 Proibido

Não execute: commit, push, PR, merge/rebase, deploy, migration, qualquer escrita no banco (INSERT/UPDATE/DELETE/ALTER/…), mudança de RLS/Stripe/secrets/`.env*`, limpeza destrutiva do working tree (`reset --hard`, `clean`, `checkout --` em arquivos alheios), instalação ampla de deps, correções fora do delta.

Nunca imprima tokens, chaves, cookies, senhas ou conteúdo de `.env*`.

### 4.2 Permitido

Inspecionar repo; Git **somente leitura**; testes/lint/typecheck/build/architecture/Playwright locais; SELECT de metadados/agregados **só** se o projeto for inequivocamente `ozgouenqrofnvgrlgfwd` e sem dump pessoal; editar **depois** da Fase A; corrigir P0/P1 do delta + docs; gerar evidências locais.

Se a branch estiver em outra worktree ou o WIP for alheio: `git worktree list`. **Não** troque branch sobre working tree sujo. Se já estiver na branch correta com dirty tree auditável, continue ali — **não** crie worktree nova só por formalidade.

Sem `git fetch` / `pull` / `rebase` / rede Git sem necessidade. Se a base remota não puder ser atualizada, registre a referência **local** usada.

---

## 5. Duas fases

### Fase A — só leitura

Antes de qualquer edição:

1. Leitura **fechada** (não além disto sem necessidade pontual):
   - este prompt + os 4 docs de desempenho anexados
   - `CLAUDE.md` §3 (design) e §10 (nunca fazer) — trechos, não arquivo inteiro
   - `AGENTS.md` — só a tabela de engenharia / zona de risco
   - `package.json` (scripts de gate)
   - skill `.cursor/skills/avant-ui-visual/SKILL.md` **se** o achado for visual
   - `docs/SECURITY_ENG_AVANT.md` **só** se auditar reset/API destrutiva
2. Confirme raiz, branch, worktree, HEAD, base, `git status --short`
3. Inventarie staged / unstaged / untracked
4. Diff completo vs base + arquivos afetados
5. Auditoria técnica/visual descrita abaixo
6. Achados preliminares por severidade + evidência

**Pare e reporte.** Não edite na Fase A.

### Fase B — correções + revalidação

Somente após a Fase A:

- corrigir P0/P1 do delta; testes do escopo; docs desatualizados
- sem redesign / refactor amplo
- P2 e dívida preexistente: só recomendar
- se exigir migration, RLS, API destrutiva nova ou **recoloração contra a autoridade Editorial**: **não** implemente — `BLOQUEADO_POR_DECISAO_HUMANA`
- repetir gates afetados

---

## 6. Inspeção Git obrigatória

Registre:

```bash
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git worktree list
git log -1 --oneline --decorate
```

Base: `main` local ou `origin/main` se disponível e pertinente. Registre:

```bash
git merge-base <base> HEAD
git diff --stat <base>
git diff --name-status <base>
git diff --check <base>
git diff --cached --stat
```

Audite: commits exclusivos da branch + staged + unstaged + untracked + artefatos + renomes + lockfile + qualquer arquivo fora de desempenho / Cadernos V1.1 / testes / docs / tooling relacionado.

Tabela no relatório: Arquivo | Status Git | Entrega/justificativa | Dentro do escopo? | Risco  
Sem justificativa → `FORA_DO_ESCOPO_PENDENTE`.

---

## 7. Áreas a rastrear

Não presuma paths exatos; localize com busca. Prioridade:

**Domínio:** `lib/desempenho/{confidence,periodo,filtersHref,studyPerformance,attemptSeries,types}.ts`, `lib/simulado/analyticsSummary.ts`, `app/api/zerar-desempenho/route.ts`

**UI:** `DesempenhoHubShell`, `DesempenhoNav`, `AreaHierarchy`, `DesempenhoFiltros`, `DesempenhoSelecaoBar`, `SimuladosAnalyticsDashboard`, `zerar-desempenho-dialog`, `contribution-heatmap`, dashboards Estudo/Atividade

**Cadernos V1.1:** `lib/cadernos/desempenhoSelecao.ts`, `lib/cadernos/templates.ts`, `NovoCadernoClient.tsx`, `cadernos/novo/page.tsx`

**Rotas:** `/desempenho`, `/desempenho/simulados`, `/desempenho/atividade`, `/cadernos/novo?wizard=1&origem=desempenho`

Inclua Zod, queries Supabase, testes, scripts de captura e estilos tocados pelo delta.

---

## 8. Métricas e função

### 8.1 Confiança

Contrato único + testes de fronteira 0, 1, 2, 3, 4, 5, 9, 10:

| Amostra | Interpretação |
|---------|----------------|
| 0 | sem dados |
| 1–2 | dados iniciais |
| 3–4 | tendência baixa confiança |
| 5–9 | evidência moderada |
| 10+ | diagnóstico mais confiável |

&lt; 5: sem rótulo conclusivo / ranking; `100% · 1/1` ≠ `82% · 82/100`; zero questões ≠ `0%` de sucesso; percentual com fração.

### 8.2 Período / TZ

Dia civil `America/Sao_Paulo`; intervalos `[início, fim)`; `7d` = hoje + 6 dias civis; virada mês/ano; 00:00 UTC vs Brasília; URL e query no mesmo intervalo; sem TZ da máquina.

### 8.3 Placar / focos

Deduplicação; `respondida=false` se o código já usa a coluna; focos: erro sem reverso → acerto baixo (amostra ok) → cobertura baixa; desempates estáveis; truncamento explícito; filtros ponta a ponta.

### 8.4 Simulados

Média e tempo **ponderados por questões**; tendência ≥ 4 pontos; “Últimos 12 meses” se for o período real; chips, loading, erro≠vazio; filtro UI = backend.

### 8.5 Atividade

Heatmap por dia civil Brasília; células não fingem botão; a11y do calendário; reset copy honesta.

---

## 9. V1.1 Cadernos (crítico)

**Invariante:** o lote nunca inclui assunto que o aluno não selecionou.

### 9.1 Identidade

`titulo_aula` em `sessionStorage` é risco. Procure ID/slug estável já existente.

- Se houver ID estável e a troca for local/retrocompatível **sem** migration → corrija + testes.
- Se não houver sem expansão arquitetural → mantenha bloqueio seguro e classifique como risco; **não** alegue integridade forte; **não** invente ID.

### 9.2 Modo estrito (comprovar por teste)

Só assuntos selecionados no pool; filtro antes de shuffle/fill/fallback; sem completar lote; vazia/perdida/inválida → CTA off + **zero** fetch; sem questões → CTA off; 7º checkbox bloqueado (sem truncar em silêncio); limpar storage **só** após sucesso; falha de API preserva seleção; URL direta / nova aba / storage limpo explícitos; caderno comum não herda seleção.

### 9.3 E2E wizard

Jest não substitui o caminho real, mas **não há bypass seguro** em `/cadernos/novo` no estado reportado.

- Se existir auth de teste **já segura** no repo → adicione E2E mínimo (seleção → barra → wizard → bloqueios → limpeza).
- Se não → registre `E2E_WIZARD_BLOQUEADO_POR_AUTENTICACAO`, fortaleça Jest/integração, e **não** use isso sozinho para negar `APROVADO_PARA_COMMIT`, desde que o contrato estrito + API-zero nos bloqueios estejam cobertos.

Não introduza bypass inseguro.

---

## 10. Reset

Contrato: apaga só `historico_questoes` do usuário autenticado; preserva simulados; payload `cleared`/`preserved`; UI “Zerar desempenho de estudo”.

Audite: auth; sem `user_id` arbitrário do client; client coerente com RLS (sem service role desnecessária); dialog a11y; sem sucesso falso se o servidor falhar.

Não delete em produção — mocks / fixtures.

---

## 11. Banco / RLS

### 11.1 SELECT permitido

Não reaplique migration. Não escreva.

Se MCP/SQL apontar para `ozgouenqrofnvgrlgfwd` sem imprimir secrets:

- metadados de `historico_questoes.respondida`
- contagens agregadas `respondida` true/false (sem linhas pessoais)
- se a definição de `get_vitrine_page` filtra `respondida`

Registre: data/hora, projeto, objetivo, resultado resumido, “nenhuma escrita”.

### 11.2 Smoke RLS

Leia `scripts/rls-performance-smoke.ts` / `npm run smoke:rls` **antes**. Se tocar produção, service role sem cleanup seguro ou alvo ambíguo → **não rode**.  
`SKIPPED` ≠ PASS.

### 11.3 Docs divergentes

Reconcilie `DESEMPENHO_TEC_ADAPTADO_V1_RELATORIO.md` e `DESEMPENHO_V1_OPS_HANDOFF.md` com uma formulação:

- `COMPROVADO NESTA AUDITORIA POR SELECT DE METADADOS`
- `REPORTADO POR INSPEÇÃO EXTERNA ANTERIOR, NÃO REEXECUTADO NESTA AUDITORIA`
- `NÃO COMPROVADO`

Sem duas seções incompatíveis no mesmo doc.

---

## 12. Design system e marca — gate obrigatório

**Autoridade candidata (ordem):**

1. Plano / spec desta feature: [`PROMPT_DESEMPENHO_TEC_ADAPTADO.md`](PROMPT_DESEMPENHO_TEC_ADAPTADO.md) — Editorial + tokens; verde = success
2. `CLAUDE.md` §3 — Editorial v2.1 (`#F26522`), Cyber = cyan no reverso
3. `docs/DESIGNER_FRONT_AVANT.md` — área logada Editorial slate + `#F26522`
4. Tokens reais em `app/globals.css` / tema editorial usados pelo hub

**Não existe** `docs/design-system/README.md` neste repo — não invente esse path como autoridade.

Regras:

- Se o hub usa `--color-brand` / classes editoriais alinhadas ao canônico → **aprovado** (laranja no dashboard não é regressão).
- Se o delta espalhou hex hardcoded onde há token → corrigir para token.
- Success/erro/alerta ≠ marca.
- **Não** recolorir o hub para “verde de marca” com base em prompt antigo TEC — isso seria `BLOQUEADO_POR_DECISAO_HUMANA` se alguém pedir, ou rejeição do achado se for falso positivo.
- Conclusão explícita no relatório: `MARCA_EDITORIAL_LARANJA_CANONICA` ou bloqueio real com evidência.

---

## 13. Visual / a11y / responsivo

Viewports mínimos: 320×800, 360×800, 390×844, 412×915, 768×1024, 1440×900.

Nas 3 abas (+ fluxo V1.1 se autenticável): `scrollWidth <= clientWidth`; CTA/títulos sem overflow; filtros mobile; hierarquia sem tabela larga; barra de seleção acima da bottom nav; targets ≥ 44px; foco visível; contraste; reduced-motion; nav com `aria-current` (não tablist falso); dialog teclado completo.

Ordem Estudo: filtros → placar → próximos focos → panoramas → evolução → recentes.  
CTA “Testar em outra questão”; sem jargão EE/ledger/upsert na UI.

Use Playwright/a11y já no repo. Sem dependência grande nova.

---

## 14. Rastreabilidade das capturas

`artifacts/desempenho-v1/f5ee914e/` sozinho não prova WIP atual.

Audite HEAD, dirty tree, script, rotas, viewport, fixture.

Novas evidências pré-commit:

```text
precommit-<HEAD8>-<DIFF8>
```

`DIFF8` = digest determinístico do delta relevante (staged+unstaged+manifesto untracked). Sem secrets/`.env`.

Manifesto: base ref/SHA, HEAD, digest, `working_tree_dirty`, timestamp ISO, script, browser, viewport, rota, fixture, overflow check.

Não chame de “captura por SHA” se o código não está commitado.

---

## 15. Gates

Scripts reais:

```bash
npm run typecheck
npm run lint
npm run check:architecture
npm test   # ou subset afetado + depois check:ship
npm run check:ship   # validate:env + typecheck + architecture + lint + test
npm run build
npx playwright test e2e/desempenho.spec.ts --project=chromium --project="Mobile Chrome"
# opcional: npm run capture:desempenho-hub com pasta precommit-*
```

Não existe `npm run security-audit` canônico. Equivalente: revisão do reset (§10) + `check:architecture` + ausência de secrets no diff.

Não use `--updateSnapshot` para esconder falha visual.

### 15.2 Três skipped

Nomeie arquivo + teste + motivo + se é do delta + risco + como remover. Skip do novo escopo que esconde falha → impede aprovação até cobrir.

### 15.3 Firefox/WebKit

Não instalar browsers automaticamente. `NÃO EXECUTADO — browser indisponível` ≠ PASS ≠ falha do produto.

### 15.4 Flaky simulados runner

Comparar com baseline; se fora do delta, registrar; se o delta piora, é regressão.

---

## 16. Segurança

Reset; authz; RLS/client; URL/presets Cadernos; `sessionStorage` mínimo; IDOR; erros verbosos; logs PII; boundaries RSC; lockfile; HTML sanitizado.

---

## 17. Correções permitidas (Fase B)

Permitido se comprovado e no delta: cálculo/TZ/filtro/confiança; overflow/a11y; ID estável **já existente** no estrito; API em bloqueio; limpeza storage; teto 6 + singular/plural; testes faltantes; manifesto capturas; docs; token de marca mal usado (alinhar ao Editorial).

Proibido: ampliar V1; nova taxonomia; IA runtime; NeuroSlides fora do necessário; banco/RLS/cache global/Stripe/deploy/CI remoto; sanear preexistente; transformar risco aberto em “aprovado” no texto.

Após correção: teste que falharia antes, quando viável.

---

## 18. Critérios de aceite

### 18.1 `APROVADO_PARA_COMMIT_E_PR`

Todos verdadeiros: branch/base IDs; inventário Git completo; sem arquivo sem justificativa; zero P0/P1 aberto no delta; métricas com fronteiras; filtros E2E; estrito ok; risco de título resolvido por ID **ou** bloqueado e **não** alegado como integridade forte; bloqueios sem API; reset escopo ok; marca Editorial resolvida; overflow/a11y ok; gates locais PASS; Playwright hub chromium+Mobile Chrome PASS; skips do escopo cobertos; capturas com digest; docs coerentes.

Você **recomenda** commit/PR — **não** executa.

### 18.2 Deploy

Sempre proibido nesta execução. Com RLS SKIPPED:

`APROVADO_PARA_COMMIT_E_PR — NÃO APROVADO PARA DEPLOY`

### 18.3 Vereditos (um só)

- `APROVADO_PARA_COMMIT_E_PR — NÃO APROVADO PARA DEPLOY`
- `APROVADO_PARA_COMMIT_E_PR — GATE OPERACIONAL DE RLS PENDENTE`
- `CORRECAO_NECESSARIA`
- `BLOQUEADO_POR_DECISAO_HUMANA`
- `REPROVADO`

---

## 19. Entregáveis

Atualizar se necessário:

- `docs/DESEMPENHO_TEC_ADAPTADO_V1_RELATORIO.md`
- `docs/DESEMPENHO_V1_OPS_HANDOFF.md`

Criar:

- `docs/DESEMPENHO_TEC_ADAPTADO_V1_AUDITORIA_PRE_COMMIT.md`
- evidências `artifacts/desempenho-v1/precommit-<HEAD8>-<DIFF8>/` (+ manifesto)

---

## 20. Formato do relatório final

PT-BR, seções 1–12:

1. Veredito  
2. Contexto Git  
3. Escopo real  
4. Achados (P0/P1/P2; CORRIGIDO com teste)  
5. Métricas  
6. V1.1 Cadernos  
7. Segurança / banco / RLS  
8. Design system e UX (`MARCA_EDITORIAL_LARANJA_CANONICA` ou bloqueio)  
9. Alterações desta auditoria  
10. Gates (+ 3 skipped nomeados)  
11. Pendências (bloqueia commit vs deploy vs dívida vs humano)  
12. Próximo passo operacional **sem** executar commit/push/PR/deploy  

---

## 21. Mensagem final no chat

Curta: veredito; branch/base/HEAD/digest; arquivos auditados/alterados; P0/P1 abertos e corrigidos; gates; smoke RLS; marca; paths do relatório/evidências; e a frase literal:

`Nenhum commit, push, PR, deploy, migration ou escrita no banco foi realizado.`

---

## Começar

**Conversa Fase A:** inventário + achados. Zero edições. Pare e reporte.  
**Conversa Fase B:** só depois do ok humano / handoff da A.
