# Gabarita Enfermagem

| Campo | Valor |
|-------|-------|
| **ID roster** | B0 |
| **URL** | https://gabaritaenfermagem.com.br/ |
| **Categoria** | Nicho saúde + IA — **prioridade alta** |
| **Data da captura** | 2026-06-10 |
| **Auditor** | Firecrawl + agente AVANT |
| **Conta usada** | LP: visitante · App: _criar conta free_ |

> Concorrente mais próximo do AVANT em escopo (questões, simulados, SRS, dashboard, IA). Público declarado: **enfermeiros**; AVANT: **técnico de enfermagem**.

---

## Primeira impressão (3 palavras)

**Profissional · Âmbar · IA** — fundo cinza-quente, CTA laranja/âmbar, acentos verdes saúde.

---

## Estrutura da LP (pré-análise de conteúdo)

Fonte: [gabaritaenfermagem.com.br](https://gabaritaenfermagem.com.br/) — capturada em jun/2026.

### Hero

- Eyebrow: **“Potencializado por Inteligência Artificial”**
- Headline: *“Sua aprovação em Concursos de Saúde começa aqui”*
- Sub: plataforma completa, +8.000 questões, comentários IA, plano personalizado
- CTAs: **“Entrar como PRO”** + **“Começar Gratuitamente”**
- Fricção baixa: *“Sem cartão de crédito • 3 dias grátis ao indicar amigos”*

### Barra de métricas

| Métrica | Valor |
|---------|-------|
| Questões | +8.000 |
| Bancas | 15+ |
| Satisfação | 98% |
| Usuários | 12k+ |

### Grid de features (12 itens)

1. Plano de Estudos IA (upload edital)
2. +8.000 Questões Reais (comentários IA por alternativa)
3. Caderno de Erros SRS
4. Dashboard Analítico
5. Simulados Cronometrados
6. Flashcards Inteligentes
7. Prof. Rebeca IA (chat)
8. Resumos com IA
9. Mapas Mentais
10. Correção de Redação IA
11. Perfil por Banca
12. Lembretes de Estudo

### Autoridade — “Sua Professora”

- **Rebeca Rocha** — infectologista, 21 anos, 1º lugar HULW/EBSERH, 20 mil+ alunos
- Métricas: 20mil+ alunos · 1º Lugar EBSERH · 21 anos experiência

### Pricing

| Plano | Preço | Destaques |
|-------|-------|-----------|
| Gratuito | R$ 0 (3 dias) | 100 questões, 50 flashcards, 3 resumos IA |
| PRO | R$ 58,30/mês ou R$ 567/ano | tudo + simulados, SRS, chat, redação… |
| Badge | “Mais Popular” no PRO | Toggle Mensal/Anual (-50% anual) |

Garantia: 3 dias trial, cancele quando quiser.

### Depoimentos

- Ana Paula Silva — Aprovada EBSERH 2023
- Carlos Eduardo — Enfermeiro ESF
- Mariana Costa — Aprovada SMS-SP 2024

### CTA final

*“Pronto para garantir sua aprovação?”* → Começar Agora - É Grátis

---

## Modo de cor

- [x] Claro
- [ ] Escuro
- [ ] Ambos

## Tokens observados

Fonte: Firecrawl `branding` — ver [`../branding/B0-gabarita-enfermagem.json`](../branding/B0-gabarita-enfermagem.json)

| Token | Hex / valor |
|-------|-------------|
| Fundo app | `#F3F3F2` |
| Fundo card / secondary | `#FFFBEB` (creme) |
| Borda botão sec. | `#D3D1CF` |
| Texto primário | `#1C1917` |
| Texto secundário | _inferir ~stone-500_ |
| Cor primária / brand | `#F59B0A` (âmbar) |
| CTA primário | `#F59B0A` bg · `#FFFFFF` text · radius 16px |
| CTA secundário | `#F3F3F2` bg · “Começar Grátis” |
| Link / accent | `#16A249` (verde) |
| Sucesso | `#16A249` (accent) |
| Erro | _não capturado na LP_ |
| Raio base | 6px |
| Raio botão | 16px |
| Sombra botão | `0 1px 3px rgba(0,0,0,.1)` |
| Fonte | **Source Sans Pro** (body + heading) |
| h1 / h2 / body | 72px / 36px / 20px |
| Densidade | média-alta |
| Framework | Tailwind |
| Personalidade | profissional, energia média |

---

## Telhas obrigatórias (prioridade B0)

| ID | Desktop | Mobile | Notas |
|----|---------|--------|-------|
| T1 Landing | ☑ | ☑ | `screenshots/gabarita-enfermagem/T1-landing-*.png` |
| T2 Login | ☑ | ☑ | `/auth` — `T2-login-*.png` |
| T3 Vitrine / banco | ☑ | ☑ | `/practice` — disciplinas + banca |
| T4 Card questão | ☑ | ☑ | `T4-discipline-list-*.png` (pós-disciplina) |
| T5 Player + IA | ☑ | ☑ | `T5-player-*.png` — Legislação Pública |
| T6 Caderno erros / SRS | ☑ | ☑ | `/error-log` — abas Revisar Hoje |
| T7 Dashboard | ☑ | ☑ | `/dashboard` |
| T8 Conta | ☑ | ☑ | `/profile` |
| T10 Simulado | ☑ | ☑ | `/mock-exam` (paywall PRO na conta audit) |

Screenshots: `screenshots/gabarita-enfermagem/`

---

## O que extrair como PADRÃO

1. **Métricas no hero** — números grandes geram confiança rápida (+8k questões, 12k usuários).
2. **Grid de benefícios escaneável** — ícone + título + uma linha (não parede de texto).
3. **Figura da especialista** — credenciais + foto humanizam IA.
4. **Freemium explícito** — limites claros no plano grátis vs PRO.
5. **Depoimentos com aprovação + órgão** — prova social específica (EBSERH, SMS-SP).
6. **Duplo CTA** — PRO para quem já conhece; Grátis para topo de funil.

## O que REJEITAR / não copiar

1. Excesso de selos “IA” em todo elemento — risco de parecer commodity 2024–2026.
2. Lista de 12 features espelhada — AVANT deve destacar **Estudo Reverso**, não checklist genérica.
3. Posicionamento só “enfermeiro” — AVANT é **técnico**; adaptar copy, não layout.
4. Chat professor como centro — AVANT não tem equivalente; não criar falsa paridade visual.

---

## Comparativo com AVANT

| Aspecto | Gabarita | AVANT hoje |
|---------|----------|------------|
| Proposta central | IA + questões + SRS | **Estudo Reverso** + NeuroSlides |
| Tom visual | _a confirmar_ | Cyber Clinical (dark neon) |
| Slides didáticos | Resumos / mapas IA | 4 NeuroSlides por questão |
| Revisão | Caderno erros SRS | Plano Diário |
| Simulados | ✓ | ✓ |
| Professor | Chat Rebeca IA | — |
| Público | Enfermeiro | Técnico enfermagem |

**Pergunta da auditoria:** o visual do Gabarita transmite *confiança clínica + modernidade* sem template de startup? Esse é o equilíbrio alvo do AVANT v2.

---

## Scores T1 (preliminar — ver `COMPARATIVO-LP.md`)

| L | H | D | C | M | I | A | P | E | X |
|---|---|---|---|---|---|---|---|---|---|
| 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 |

---

## T2 Login (2026-06-10)

- URL: `https://gabaritaenfermagem.com.br/auth`
- Layout: split — painel esquerdo branding + painel direito formulário
- CTA: âmbar “Entrar” + Google OAuth
- Mantém tokens LP (fundo creme `#F3F3F2`, Source Sans)

**Área logada (T3–T10):** rotas protegidas (ex.: [`/practice`](https://gabaritaenfermagem.com.br/practice), [`/dashboard`](https://gabaritaenfermagem.com.br/dashboard)) — sem login mostram formulário “Entrar”.

### Captura automatizada (Playwright)

1. Conta free em `.env.local` (não commitar):
   ```
   GABARITA_AUDIT_EMAIL=seu@email.com
   GABARITA_AUDIT_PASSWORD=***
   ```
2. Executar:
   ```bash
   PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/audit-visual-external.spec.ts -g "Gabarita.*logad" --project=chromium --workers=1
   ```
3. Saída: `T3-practice-*.png`, `T7-dashboard-*.png`, etc. em `screenshots/gabarita-enfermagem/`
4. Sessão cacheada em `e2e/.auth/gabarita-storage.json` (gitignored)

### Mapa funcional (funções + filtros)

- [`B0-gabarita-funcional.md`](./B0-gabarita-funcional.md) — inventário por rota (gerado automaticamente)
- [`B0-gabarita-comparativo-funcional.md`](./B0-gabarita-comparativo-funcional.md) — **Gabarita ↔ AVANT**
- [`B0-gabarita-map.json`](./B0-gabarita-map.json) — JSON bruto para diff

---

## Notas livres

_Completar T3–T10 após signup free. Comparar player de questão lado a lado com `/estudar/[slug]` no AVANT._
