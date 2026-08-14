# Meu Desempenho — redesign TEC adaptado (spec mestre)

Fonte de verdade do redesign do hub `/desempenho`. Este arquivo é a **constituição** do trabalho: as conversas de execução (E1–E4) apontam para cá em vez de repetir o contrato.

> **Correções aplicadas ao prompt original** (review 2026-08-11):
>
> 1. Identidade visual = **Editorial v2 + tokens semânticos** (marca laranja `--color-brand`). O prompt original pedia "identidade verde canônica" — não existe canônico verde no código; verde é **success**.
> 2. **Cadernos sai do V1** e vira V1.1. Hoje não há integração `desempenho → cadernos`.
> 3. **Ship por delta**: Done = testes/E2E do hub + zero regressão introduzida. Falha preexistente entra no relatório como baseline, não é "consertada para ficar verde".
> 4. **Execução em 4 entregas** (E1–E4), uma conversa cada. Nunca monólito.
> 5. Leitura sob demanda por lote — não "ler `AGENTS.md`/`CLAUDE.md` inteiros" antes de editar.
> 6. Branch de trabalho: `feat/desempenho-tec-adaptado-v1`, criada a partir do HEAD atual do usuário (preserva WIP editorial), não de `origin/main`.
>
> **Pós-implementação:** auditoria pré-commit (duas fases, sem commit/deploy) → [`PROMPT_DESEMPENHO_AUDITORIA_PRE_COMMIT.md`](PROMPT_DESEMPENHO_AUDITORIA_PRE_COMMIT.md).

---

## 1. Contexto

AVANT é estudo reverso para Técnico em Enfermagem. Ciclo canônico:

```
questão real → diagnóstico do erro → 4 NeuroSlides → nova aplicação → revisão no momento certo
```

Hub atual:

| Rota | Aba | Papel |
|------|-----|-------|
| `/desempenho` | Estudo | visão principal de decisão |
| `/desempenho/simulados` | Simulados | desempenho em sessões |
| `/desempenho/atividade` | Atividade | hábito, sequência, privacidade |

Aproveitar do TEC Concursos: leitura rápida, filtros, hierarquia matéria/assunto, barras comparativas, expansão progressiva, diagnóstico → ação. **Não** copiar: visual administrativo, tabelas rígidas, excesso de botões, radar minúsculo, comparação com comunidade, exportação para planilha.

## 2. Resultado observável

Ao abrir "Meu Desempenho", o aluno entende rápido:

1. qual é a amostra analisada;
2. como está o desempenho no período;
3. qual é a próxima melhor ação;
4. quais áreas e assuntos merecem atenção;
5. quão confiável é cada diagnóstico;
6. como iniciar uma nova aplicação.

Na visão inicial ele **não** percorre a taxonomia inteira para achar a recomendação.

## 3. Matriz de risco

| Zona | Exemplos | Quem fecha |
|------|----------|------------|
| Verde | componentes, layout, microcopy, helpers puros, testes | agente + gates |
| Amarela | contrato de API autenticada, refactor de fluxo existente | agente entrega, humano amostra |
| Vermelha | `lib/cache.ts`, auth/sessão, RLS, migration, service role, escrita remota | humano aprova |

Em zona vermelha: pode preparar diff/teste local, **para antes de aplicar**. Nunca declarar seguro para produção.

## 4. Proibido

- trabalhar na `main`;
- commit, push, PR, merge, deploy;
- aplicar migration ou escrever no banco remoto;
- expor `.env`/secrets;
- rebrand global;
- IA no runtime do painel;
- comparação com comunidade / export planilha;
- incidência por banca/prova sem fonte auditável;
- consertar falha alheia ao escopo só para "ficar verde";
- apagar dados do Evidence Engine ou de Simulados para o reset parecer total.

## 5. Fonte de verdade visual

1. tokens semânticos de `app/globals.css` (`--color-brand`, `--color-success`, `--color-danger`, `--color-warning`);
2. dashboard/login = tema **editorial** → `--color-brand` = `#F26522`;
3. verde = **success**, nunca marca;
4. sem hex de marca espalhado em componente;
5. NeuroSlides não são tocados (sistema visual próprio).

## 6. Decisões funcionais obrigatórias

### 6.1 Reset

- nome: **"Zerar desempenho de estudo"**;
- remove apenas `historico_questoes` (área Estudo);
- diz explicitamente que **Simulados permanecem**;
- diálogo acessível: foco preso, `Escape`, retorno de foco, título e descrição associados;
- API retorna o escopo do que apagou.

### 6.2 Amostra e confiança

| Amostra | Rótulo | Uso |
|---------|--------|-----|
| 0 | Sem dados | não classificar |
| 1–2 | Dados iniciais | não concluir força/fraqueza |
| 3–4 | Tendência inicial · baixa confiança | linguagem cautelosa |
| 5–9 | Evidência moderada | pode ordenar, sempre exibir amostra |
| 10+ | Diagnóstico mais confiável | recomendação normal |

Regras:

- percentual sempre com fração: `71% · 30/42`;
- `100% em 1 questão` nunca equivale a `82% em 16`;
- abaixo de 5: sem vermelho/verde conclusivo, sem "ponto forte/fraco";
- recomendação de baixo acerto exige ≥ 5 questões;
- erro não revisado gera ação, descrito como **evento concreto**, não diagnóstico estatístico;
- função de confiança pura, centralizada, com testes de fronteira.

### 6.3 Prioridade de estudo (determinística e explicável)

1. erros atuais sem estudo reverso concluído, por quantidade de erros;
2. menor taxa de acerto com amostra ≥ 5 (desempate: maior amostra);
3. menor cobertura quando há ≥ 3 questões disponíveis;
4. prática mais antiga;
5. ordem alfabética estável.

Sem "importância em prova" / "alta incidência" sem fonte auditável. Cada recomendação informa motivo + amostra: `4 erros em 6 questões · evidência moderada`.

### 6.4 Vocabulário

| Ação | Texto |
|------|-------|
| principal após diagnóstico | Testar em outra questão |
| exploração | Ver assuntos / Ocultar assuntos |
| seleção (V1.1) | Selecionar assunto |
| caderno (V1.1) | Criar caderno dos selecionados |
| simulado | Iniciar simulado |

Nome longo do assunto fica no conteúdo do card, **nunca** dentro do botão.

## 7. Arquitetura de informação alvo

### 7.1 Shell compartilhado

Ordem no mobile: voltar/breadcrumb → título → navegação → resumo de filtros + "Filtrar" → primeiro KPI.

As três rotas são páginas: `<nav aria-label="Seções de desempenho">` + links com `aria-current="page"`. **Não** `role="tablist"`.

### 7.2 Aba Estudo — ordem obrigatória

1. filtros
2. resumo do período
3. próxima melhor ação
4. desempenho por área e assunto
5. evolução
6. questões praticadas recentemente

Hierarquia progressiva no lugar da tabela `min-w-[640px]`. Área fechada mostra nome, `% · fração`, respondidas, cobertura, confiança, barra comparável e "Ver assuntos". Expandida, cada assunto mostra nome completo, `% · fração`, acertos/erros, cobertura, última prática, confiança e uma ação contextual.

Estado inicial: áreas fechadas no mobile; até 5 prioridades antes da exploração; mapa completo a um toque.

Renomes: "Radar de prova" → **Panorama por áreas** (sem alegação de incidência); "Tentativas recentes" → **Questões praticadas recentemente**; "Evolução (ledger)" → **Evolução do desempenho**; "Acerto na 1ª tentativa" → **Acerto na primeira tentativa do período**; remover `upsert`, `ledger` e `Evidence Engine` da UI.

### 7.3 Filtros

Período, disciplina, área; banca só com valor real. URL é fonte de verdade. Mobile: botão "Filtrar" com contador + painel acessível + "Limpar filtros". Nenhum filtro aparece na URL e é ignorado pelos dados.

### 7.4 Aba Simulados

1. enviar todos os filtros exibidos/suportados;
2. remover da superfície filtro não implementado;
3. "Geral (histórico)" → **Últimos 12 meses**;
4. glossário define se média é por questão ou por sessão;
5. KPI principal = `total de acertos / total de questões`;
6. tempo médio = `tempo total / questões`;
7. teste com duas sessões de tamanhos muito diferentes;
8. `0%` não é positivo;
9. menos de 4 pontos → "Tendência ainda indisponível";
10. prioridades respeitam os limiares de amostra da aba Estudo;
11. loading/empty/error/data distintos;
12. erro tem "Tentar novamente";
13. `...` → skeleton acessível;
14. sem pulsação infinita (ou respeitar `prefers-reduced-motion`).

### 7.5 Aba Atividade

Hábito, sem competir com o diagnóstico: sequência, meta do dia, total, 30 dias. Célula de calendário informativa não parece botão; interativa tem ≥ 44 × 44 px. Reset limitado + diálogo acessível. Erro ≠ vazio. Datas em `America/Sao_Paulo`.

## 8. Contrato de métricas e datas

Documento canônico: [`DESEMPENHO_METRICAS.md`](DESEMPENHO_METRICAS.md). Para cada métrica: nome exibido, definição, fonte, unidade, fórmula, filtros, período, timezone, amostra mínima, estado sem dado, limite, limitações.

No código:

1. timezone do produto = `America/Sao_Paulo` (UTC−3 fixo, helper freemium);
2. períodos = intervalo semiaberto `[início, fim)`;
3. "7 dias" = hoje + 6 datas civis anteriores;
4. testar eventos antes/depois da meia-noite de Brasília;
5. nunca usar o fuso local do servidor como contrato;
6. ledger limitado: buscar **mais recentes primeiro**, reordenar em memória;
7. nenhum limite silencioso;
8. visão "Tudo" incompleta por teto → comunicar ou renomear;
9. sem RPC/migration/banco sem classificar zona vermelha;
10. falha de leitura → estado `error`, nunca dados zerados.

## 9. Estados obrigatórios

`loading` · `empty` · `error` · `data` · `partial/truncated` · `amostra insuficiente`.

Erro explica que os dados não carregaram, preserva navegação, oferece retry e não mostra KPI `0` como verdadeiro.

## 10. Responsividade e QA

Larguras: 320, 360, 375, 390, 412, 768, 1024, 1366/1440.

Em 320–412 px: `scrollWidth === clientWidth`; texto não invade selos; botão não extrapola card; nome longo acessível; alvo ≥ 44 × 44 px; foco visível não cortado.

---

## 11. Entregas

| Entrega | Conteúdo | Risco |
|---------|----------|-------|
| E1 | preflight, glossário, datas, amostra, erro≠vazio, reset honesto | verde/amarelo |
| E2 | shell, filtros, Estudo responsivo, hierarquia | verde |
| E3 | Simulados e Atividade | verde/amarelo |
| E4 | regressão, evidências, fechamento V1 | amarelo leve |
| V1.1 | seleção + Cadernos | amarelo |
| Ops | migration, RLS, deploy | vermelho (humano) |

### Prompt E1 — Honestidade de dados

```text
Feature: Meu Desempenho — Entrega 1 (honestidade de dados)
Anexo: @docs/PROMPT_DESEMPENHO_TEC_ADAPTADO.md

Escopo: glossário de métricas, confiança centralizada, timezone Brasília + intervalo
semiaberto, ordenação do ledger limitado, erro ≠ vazio, reset honesto (copy + API + testes),
renomes de microcopy. Sem redesign estrutural.

Done: testes unitários de confiança (0,1,2,3,4,5,9,10), 7 dias civis, meia-noite de Brasília,
ledger preserva eventos recentes, reset limitado. Não exige Playwright de overflow.
Pare e reporte ao fim.
```

### Prompt E2 — Shell + Estudo responsivo

```text
Feature: Meu Desempenho — Entrega 2 (shell + Estudo responsivo)
Anexo: @docs/PROMPT_DESEMPENHO_TEC_ADAPTADO.md

Escopo: shell compartilhado das 3 páginas, navegação por links com aria-current,
filtros desktop/mobile sem overflow, ordem resumo → ação → hierarquia → evolução → recentes,
hierarquia progressiva no lugar de DomainMapTable, CTA "Testar em outra questão",
estados loading/empty/error/partial.

Done: testes de componente + E2E de Estudo com scrollWidth === clientWidth em 320–412 px.
Marca: tokens editoriais. Pare e reporte ao fim.
```

### Prompt E3 — Simulados + Atividade

```text
Feature: Meu Desempenho — Entrega 3 (Simulados + Atividade)
Anexo: @docs/PROMPT_DESEMPENHO_TEC_ADAPTADO.md

Escopo: Simulados (filtros ponta a ponta, média ponderada por questões, tempo por questão,
tendência insuficiente, 0% neutro, skeleton + retry, limiares de amostra) e
Atividade (heatmap mobile, alvos de toque, diálogo de reset acessível, erro ≠ vazio, Brasília).

Done: testes de API/domínio de Simulados + componentes. Pare e reporte ao fim.
```

### Prompt E4 — Regressão e fechamento V1

```text
Feature: Meu Desempenho — Entrega 4 (regressão V1)
Anexo: @docs/PROMPT_DESEMPENHO_TEC_ADAPTADO.md

Escopo: testes direcionados, check:ship (delta vs baseline), build, Playwright desktop + Mobile
Chrome, capturas 390x844 e 1440x900 por rota nomeadas com SHA, relatório final.

Sem Cadernos. Sem migration/deploy. Reportar SKIPPED como SKIPPED.
```

---

## 12. Critérios de aceite V1

### Dados

- [ ] cada métrica com fórmula, fonte, unidade, timezone e amostra documentados
- [ ] erro nunca aparece como zero/vazio
- [ ] nenhum filtro exibido é ignorado
- [ ] "Últimos 12 meses" não é chamado de histórico total
- [ ] médias com unidade coerente + teste de amostras desiguais
- [ ] períodos em `America/Sao_Paulo`, intervalo semiaberto
- [ ] limites resolvidos ou comunicados

### UX

- [ ] resumo e próxima ação antes da taxonomia completa
- [ ] hierarquia substituiu a tabela horizontal no mobile
- [ ] cada resultado com percentual + fração + confiança
- [ ] uma questão não produz diagnóstico conclusivo
- [ ] CTA principal curto e contextual
- [ ] mapa completo a um toque
- [ ] sem `upsert` / `ledger` / `Evidence Engine` na UI
- [ ] reset promete exatamente o que apaga

### Responsividade e acessibilidade

- [ ] zero overflow do documento em 320–412 px
- [ ] zero colisão entre título, selo, métrica e CTA
- [ ] alvos ≥ 44 × 44 px
- [ ] navegação com semântica de links/páginas
- [ ] expansão por teclado, anunciando estado
- [ ] diálogo prende/devolve foco e fecha com `Escape`
- [ ] movimento respeita `prefers-reduced-motion`

### Visual

- [ ] tokens canônicos, sem hex de marca espalhado
- [ ] marca (laranja) não se confunde com success (verde)
- [ ] `0%` sem tom positivo
- [ ] vermelho não domina
- [ ] um CTA primário por viewport

### Engenharia

- [ ] WIP original preservado
- [ ] trabalho em branch isolada
- [ ] diff focado, sem conteúdo pedagógico alterado
- [ ] `check:ship` e `build` reportados por delta
- [ ] Playwright do hub PASS em desktop e mobile
- [ ] nenhuma migration/deploy/escrita remota executada

## 13. Relatório final (12 seções)

Veredito · Baseline · Resultado observável · Arquivos alterados · Contratos de métricas · Responsividade e acessibilidade · Testes executados · Gates não executados ou falhos · Zona de risco · Banco/produção · Evidências · Pendências.

Não declarar "pronto para produção" se: gate obrigatório falhar; migration necessária não comprovada; RLS apenas pulado; overflow entre 320–412 px; reset divergir da promessa; erro de backend parecer desempenho zero; recomendação conclusiva com uma única questão.
