# Estudei — app logado (referência via tutorial)

| Campo | Valor |
|-------|-------|
| **ID roster** | C2 |
| **Fonte** | [04 - Como fazer o Planejamento Semanal no Estudei](https://www.youtube.com/watch?v=tdXhFchknNc) |
| **Canal** | [@estudei.oficial](https://www.youtube.com/@estudei.oficial) |
| **Data** | 2026-06-10 (frames enviados pelo time) |
| **Nota** | App real via vídeo tutorial — não é captura Playwright |

---

## Primeira impressão (3 palavras)

**Organizador · Teal · Wizard** — dashboard denso com widgets; fluxo guiado em 4 passos.

---

## Tokens visuais (app)

| Token | Valor observado |
|-------|-----------------|
| Sidebar | teal escuro `#0d4d4d` / verde petróleo |
| Fundo app | branco / cinza muito claro |
| CTA primário | verde/teal `#00CDA0` |
| Cards | brancos, sombra sutil, radius ~12px |
| Disciplinas no calendário | cores por matéria (azul, amarelo, laranja, cinza…) |
| Tipografia | sans-serif limpa, hierarquia forte |

---

## Menu lateral (app)

| Item | Função |
|------|--------|
| Início | Dashboard home |
| Planos | Planos de estudo |
| Disciplinas | Gestão de matérias |
| Edital | Edital verticalizado |
| **Planejamento** | Calendário semanal / ciclo |
| Revisões | Fila de revisão |
| Histórico | Registros de estudo |
| Estatísticas | Analytics |
| Simulados | Mock exams |

---

## Dashboard (Início)

Widgets observados nos frames:

| Widget | Conteúdo |
|--------|----------|
| KPIs topo | Tempo de estudo (62h43) · Desempenho 80% · Progresso edital 66% |
| Constância | Tracker diário (bolinhas verde/vermelho) |
| Painel | Tabela disciplinas + tempo + acertos/erros |
| Countdown | “Prova Polícia Federal” — dias restantes |
| Metas semanais | Barras Horas (57,5%) · Questões (100%) |

**AVANT equivalente:** `/analytics` + plano diário + vitrine — hoje mais fragmentado; rebrand pode unificar “hub do dia”.

---

## Wizard “Criar Planejamento” (4 passos)

| Passo | Tela | Campos / ações |
|-------|------|----------------|
| 0 | Escolha modo | “Quero Ajuda do Estudei” vs “Criar de Forma Manual” |
| 01 Organização | Tipo | **Ciclo de Estudos** (rotativo) vs **Planejamento Semanal** (dias fixos) |
| 02 Disciplinas | Multi-select | Grid de chips: Contabilidade, Direitos Humanos, Informática… |
| 03 Relevância | Sliders | Por disciplina: **Importância** (1–5) + **Conhecimento** (1–5) → peso % |
| 04 Horários | Agenda | Checkbox por dia (SEG–DOM) + horas/dia; total semanal; min/max por sessão |

Resultado: **quadro semanal** com blocos coloridos por disciplina (0h45 cada) + blocos “Revisão”.

Filtros laterais no calendário: REVISÕES · HISTÓRICO · PLANEJAMENTO (checkboxes).

Ações: **Replanejar** · **Remover**.

---

## Comparativo Estudei app ↔ AVANT

| Estudei | AVANT hoje | Rebrand |
|---------|------------|---------|
| Hub = planejamento + cronômetro | Hub = vitrine `/estudar` | Manter vitrine; widget “revisões hoje” |
| Wizard 4 passos para plano | Edital matriculado + cadernos | Não copiar wizard inteiro — AVANT é por questão |
| Calendário semanal colorido | Plano diário (lista SRS) | Inspirar clareza de “o que fazer hoje” |
| Sliders importância/conhecimento | — | Opcional futuro (analytics) |
| Progresso % edital | Progresso por assunto/histórico | Reforçar em analytics |
| Teal sidebar | Cyber dark sidebar | **Claro** + verde AVANT na nav ativa |

---

## O que extrair

1. **Dashboard com 3 KPIs** no topo (tempo, desempenho, progresso).
2. **Wizard curto** para onboarding complexo (AVANT: onboarding do método reverso).
3. **Calendário / lista do dia** com cores por assunto.
4. **Constância visual** (streak de dias).

## O que rejeitar

1. Sidebar com 9+ itens iguais ao Estudei.
2. Teal `#00CDA0` como brand.
3. Centro do produto = planejador (AVANT = questão + reverso).

---

## Frames (screenshots do tutorial)

Pasta: `screenshots/estudei/tutorial-planejamento/`

| Arquivo | Conteúdo |
|---------|----------|
| `frame-01.png` | Dashboard Início (KPIs + painel) |
| `frame-02.png` | Modal criar planejamento (ajuda vs manual) |
| `frame-03.png` | Passo Organização — Ciclo vs Semanal |
| `frame-04.png` | Passo Disciplinas — grid chips |
| `frame-05.png` | Passo Relevância — sliders + pesos % |
| `frame-06.png` | Passo Horários — dias + horas/semana |
| `frame-07.png` | Calendário semanal preenchido |
| `frame-08.png` | Calendário — detalhe terça-feira |

---

## Scores T7 app (preliminar, via tutorial)

| L | H | D | C | M | I | A | P | E | X |
|---|---|---|---|---|---|---|---|---|---|
| 4 | 5 | 4 | 5 | — | 4 | 4 | 4 | 3 | 3 |

_App denso mas legível; identidade teal forte (não exclusiva AVANT)._
