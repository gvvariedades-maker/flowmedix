# Gabarita B0 ↔ AVANT — funções e filtros

**Fonte:** `B0-gabarita-funcional.md` + `B0-gabarita-map.json` (captura 2026-06-10, conta audit).

---

## Menu principal (sidebar)

| Gabarita | Rota | AVANT equivalente | Notas rebrand |
|----------|------|-------------------|---------------|
| Início | `/dashboard` | `/estudar` ou home logada | Gabarita: tarefas do dia + gráficos; AVANT: vitrine como hub |
| Resolver Questões | `/practice` | `/estudar` | Gabarita: disciplina → questão; AVANT: assunto/edital → slug |
| Caderno de Erros | `/error-log` | `/plano-diario` | SRS com abas Revisar Hoje / Próximas / Todos |
| Simulados | `/mock-exam` | `/simulados` | Gabarita free: paywall PRO na captura |
| Plano de Estudos | `/study-plan` | cadernos + edital matriculado | Gabarita: cronograma IA |
| Flashcards | `/flashcards` | — | AVANT: NeuroSlides no player |
| Resumos com IA | `/study-resources` | `/material/neuroslides` | Material estático vs reverso por questão |
| Prof. Rebeca IA | `/chat-ia` | — | Chat professor; AVANT não tem |
| Desempenho | `/performance` | `/analytics` | Reconstruir histórico no Gabarita |
| Perfil / Config | `/profile` | `/conta` | Assinatura, senha, zona de risco |
| Tutoriais | `/tutorials` | `/ajuda/estudo-reverso` | Onboarding |
| Ajuda | `/help` | FAQ / WhatsApp | |

**Rotas 404 na captura (não usar):** `/errors`, `/simulations`, `/settings` — equivalentes reais: `/error-log`, `/mock-exam`, `/profile`.

---

## Player de questão (T5) — captura 2026-06-10

Fluxo automatizado: `/practice` → disciplina **Legislação Pública** → questão.

Screenshots: `T5-player-desktop.png`, `T5-player-mobile.png`

| Elemento Gabarita | AVANT (`AvantLessonPlayer`) |
|-------------------|----------------------------|
| Barra superior (voltar, progresso) | Breadcrumb vitrine + Q-id |
| Enunciado + alternativas (radio) | Instruction + `btn-option` |
| Comentários IA por alternativa | NeuroSlides pós-resposta |
| Toggles Incluir IA / respondidas | Histórico + estudo reverso |
| Fundo claro, card branco | Cyber dark + glass (hoje) |

**Rebrand:** manter legibilidade do player Gabarita (claro, opções espaçadas); preservar fluxo reverso como overlay AVANT.

---

## `/practice` — filtros e fluxo (T3/T5)

### Estrutura

1. **Disciplina** — grid de cards com contagem de questões
2. **Filtro banca** — botão “Todas as bancas”
3. **Toggles (labels):**
   - **Incluir IA** — comentários IA nas alternativas
   - **Mostrar respondidas**
4. Onboarding: “Comece por Aqui!”

### Disciplinas mapeadas (amostra conta audit)

| Disciplina | Questões |
|------------|----------|
| Específica de Enfermagem | 7059 |
| HU Brasil/EBSERH | 66 |
| Informática | 504 |
| Legislação da EBSERH | 19 |
| Legislação do SUS | 855 |
| Legislação Pública | 6 |
| Português | 1030 |
| Raciocínio Lógico e Matemático | 179 |

### Nível tópico (após disciplina — T4)

- Barra âmbar com disciplina + **Voltar**
- Lista de tópicos (ex.: “Outros temas” · 6 questões)
- Filtros globais persistem: **Bancas** · **Temas** · **Subtemas** · **Incluir IA** · **Mostrar respondidas** · Limpar filtros

### Nível questão (T5)

- “Questão 1 de 6” + breadcrumb tema
- Tags: disciplina + banca (ex. IDECAN)
- Enunciado + alternativas A–E (radio)
- Fundo claro, card branco, sidebar fixa

### AVANT (`/estudar`)

| Gabarita | AVANT |
|----------|-------|
| Disciplina | Assunto / tópico (card na vitrine) |
| Tópico dentro da disciplina | Grupo na vitrine / paginação |
| Bancas / Temas / Subtemas (dropdown) | `banca` + busca + chips |
| Todas as bancas | Filtro `banca` + chips FGV etc. |
| Incluir IA | Estudo Reverso pós-resposta (não no filtro) |
| Mostrar respondidas | Histórico / estado “estudada” no player |
| Busca | Campo assunto, tópico, banca, slug |
| Questão N de M | “Questão X de Y” no player |

**Padrão a adotar:** filtro de banca visível + contagem no card. **Não copiar:** toggle “Incluir IA” genérico — AVANT vende **reverso**, não IA em tudo.

---

## `/error-log` — Caderno de Erros (T6 ↔ Plano Diário)

### Abas

- **Revisar Hoje** (contador)
- **Próximas Revisões**
- **Todos os Erros**

Estado vazio: “Parabéns! Nenhuma revisão pendente para hoje.”

### AVANT

| Gabarita | AVANT |
|----------|-------|
| Caderno de Erros SRS | `/plano-diario` |
| 3 abas de revisão | Lista de revisões do dia |
| Erro → fila SRS | Tentativa errada → plano diário |

**Padrão a adotar:** abas ou segmentação clara “hoje / depois / histórico”.

---

## `/dashboard` — início logado (T7)

### Blocos

- Saudação / nome usuário
- **Tarefas de Hoje**
- **Análise de Desempenho**
- **Seu Desempenho**
- **Revisão Pendente**

### AVANT

| Gabarita | AVANT |
|----------|-------|
| Dashboard analítico central | Vitrine + analytics separado |
| Tarefas do dia | Plano diário |
| Revisão pendente | Plano diário (badge/contador) |

**Padrão a adotar:** widget “revisões pendentes” no hub — AVANT pode destacar no shell ou plano diário.

---

## `/mock-exam` — Simulados (T10)

Na conta **free** da captura: paywall **“Recurso PRO”** + botão Assinar PRO.

AVANT: `/simulados` + `/simulados/novo` acessíveis no free (com limites Pro).

---

## `/chat-ia` — Prof. Rebeca

- Busca de conversas
- Sugestões de prompt (métodos de memorização, perfil de banca, diagramas)
- Input: “Digite sua dúvida…”

**AVANT:** sem equivalente — não criar paridade visual de chat no rebrand.

---

## `/study-plan` — Plano de Estudos IA

Paywall PRO na captura. LP promete upload de edital + cronograma IA.

**AVANT:** edital via matrícula/concurso + cadernos — narrativa diferente.

---

## Resumo para o visual AVANT v2

| Copiar estrutura | Não copiar |
|------------------|------------|
| Sidebar escaneável com ícones | Menu com 14 itens iguais ao Gabarita |
| Filtro banca + contagem em cards | Toggle “Incluir IA” em todo lugar |
| Abas no revisão espaçada | Paywall genérico em cada tela |
| Dashboard com “tarefas hoje” | Chat professor como item central |
| Cards disciplina com N questões | Grid de disciplinas genéricas sem edital |

---

## Artefatos

- Mapa completo: [`B0-gabarita-funcional.md`](./B0-gabarita-funcional.md)
- JSON: [`B0-gabarita-map.json`](./B0-gabarita-map.json)
- Screenshots: `screenshots/gabarita-enfermagem/` (`T3-practice-*`, `map-*-desktop.png`, …)
