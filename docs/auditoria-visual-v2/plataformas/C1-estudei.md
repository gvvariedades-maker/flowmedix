# Estudei

| Campo | Valor |
|-------|-------|
| **ID roster** | C1 |
| **URL** | https://estudei.com.br/ |
| **Categoria** | Inspiração cruzada — **referência de LP** |
| **Data da captura** | 2026-06-10 |
| **Auditor** | Firecrawl + agente AVANT |
| **Conta usada** | LP: visitante · App: _opcional_ |

> Não é enfermagem. Incluído porque a **landing** foi aprovada como referência de alta qualidade (copy, prova social, clareza, pricing).

---

## Primeira impressão (3 palavras)

_Organizado · Aprovados · Método_

---

## Estrutura da LP (pré-análise)

Fonte: [estudei.com.br](https://estudei.com.br/)

### Hero

- Credencial: *“Criada por aprovados na Sefaz SC e GO, Polícia Federal e ISS Guarulhos”*
- Headline: *“A plataforma que transforma horas de estudo em progresso real.”*
- Sub: edital → plano completo, semana organizada, revisões automáticas, progresso por matéria
- CTA: **“Quero começar agora”**
- Pricing no hero: *“Plano anual por R$ 19,80/mês. Acesso imediato.”*

### Prova em vídeo

- Bloco “Da bagunça à organização” — vídeo explicativo

### Segmentos (Feito sob medida)

- Concurseiros · Vestibulandos · Residentes · Universitários — cards com CTA “Começar +”

### Método (storytelling)

- *“Um método que nasceu da experiência real”* — 3 pilares: planejamento, execução, acompanhamento

### Como funciona (1-2-3-4)

1. Escolha edital ou plano
2. Planejamento inteligente (rotina + dificuldades)
3. Registre estudos (cronômetro horas líquidas)
4. Acompanhe e ajuste

### Features listadas

- Planejamento automático, revisões, estatísticas, cronômetro, simulados, +3500 editais verticalizados, biblioteca e-books…

### Prova social

- *“+ de 1.000 provas reais”* (screenshots de depoimentos)
- Fundadores: **Laura Amorim** (Mapas da Lulu) + **Renan CristoforI** (Planilha do Aprovado)

### Pricing — [`#assineja`](https://estudei.com.br/#assineja)

- Headline: *“Foque no que importa: estudar. Todo o resto fica por conta do Estudei.”*
- Sub: *“Veja tudo o que está incluso no seu plano anual”*
- **12× R$ 19,80** ou à vista **R$ 197,90**
- CTA: **“Assinar agora”** (teal)
- Lista longa de inclusões (bullets com check):
  - Planejamento semanal automático
  - Desempenho por assunto do edital
  - Metas e constância
  - Revisões programadas
  - Relatórios e estatísticas
  - Cronômetro horas líquidas
  - Simulados e provas
  - Quadro semanal tarefas/revisões
  - +3500 editais verticalizados
  - Datas de provas
  - Biblioteca e-books
- Screenshots: `T1-assineja-desktop.png`, `T1-assineja-mobile.png`

### App preview — “Agora veja o Estudei por dentro”

Mockups do dashboard na LP (fundo teal `#00CDA0`):

| Painel (carrossel) | Função mostrada |
|--------------------|-----------------|
| Visão geral do avanço por matéria | Tabela tópicos + % acerto + último estudo |
| Acompanhe as metas | Horas e questões vs meta |
| Seu progresso geral | Tempo total + distribuição por matéria |
| Histórico de estudos | Registros recentes |
| Lembrete | Central de lembretes |
| Planejamento em foco | Tarefas do dia + revisões |

Screenshots: `T1-app-preview-desktop.png`, `T1-app-preview-mobile.png` (+ slides se carrossel avançar)

**Padrão AVANT:** usar mockups reais do `/estudar`, `/analytics`, `/plano-diario` na LP — não ilustração genérica.

### FAQ extenso

- Reduz objeção; tom acolhedor

---

## O que extrair para AVANT (LP)

1. **Headline orientada a resultado**, não a feature (“horas → progresso”).
2. **Credencial de aprovação** no topo (adaptar: bancas, alunos, questões AVANT).
3. **Fluxo numerado simples** (4 passos) — espelha bem o Ciclo AVANT de Aprovação.
4. **Pricing transparente** cedo no scroll.
5. **Fundadores / método** — humaniza sem depender de uma única professora.
6. **FAQ longo** — confiança para assinatura.

## O que NÃO transplantar

1. Posicionamento “só organização” — AVANT vende **questão + reverso**.
2. Tom genérico multi-prova — AVANT é nicho técnico enfermagem.
3. Layout copy-paste — usar estrutura, não pixels.

---

## Tokens observados

Fonte: [`../branding/C1-estudei.json`](../branding/C1-estudei.json)

| Token | Hex / valor |
|-------|-------------|
| Fundo | `#FFFFFF` |
| Primária (roxo) | `#6735BC` |
| Accent / CTA | `#00CDA0` (teal) |
| Secundário highlight | `#66F5D5` (mint) |
| CTA primário | `#00CDA0` · radius 12px · “Comece agora” |
| CTA secundário | `#6735BC` · radius 100px (pill) · “ASSINE JÁ” |
| Fonte | **Neulis Neue** (custom) |
| h2 hero | 64px |
| body | 20px |
| Raio base | 4px |
| Personalidade | moderno, energia alta |

---

## Telhas

| ID | Desktop | Mobile | Notas |
|----|---------|--------|-------|
| T1 Landing | ☑ | ☑ | `T1-landing-*.png` (full page) |
| T1 Pricing | ☑ | ☑ | `T1-assineja-*.png` — anchor `#assineja` |
| T1 App preview | ☑ | ☑ | `T1-app-preview-*.png` — “por dentro” |
| T2 Login | ☐ | ☐ | — |
| T7 Dashboard / planejamento | ☑ | — | Tutorial vídeo → [`C2-estudei-app-ui.md`](./C2-estudei-app-ui.md) |

Screenshots: `screenshots/estudei/`

---

## Comparativo LP: Estudei vs Gabarita vs AVANT

| Elemento | Estudei | Gabarita | AVANT (hoje) |
|----------|---------|----------|--------------|
| Hook | Aprovados famosos | IA + saúde | Cyber + Estudo Reverso |
| Métricas hero | Preço | +8k questões | _varia por LP_ |
| Autoridade | 2 fundadores | 1 professora | Método / neurociência |
| Trial | Implícito no FAQ | 3 dias grátis | Freemium/Pro Stripe |

---

## Scores T1 (preliminar)

| L | H | D | C | M | I | A | P | E | X |
|---|---|---|---|---|---|---|---|---|---|
| 4 | 5 | 3 | 5 | 4 | 4 | 3 | 3 | 5 | 4 |

Ver também `scores/scorecard.csv` e [`COMPARATIVO-LP.md`](../COMPARATIVO-LP.md).
