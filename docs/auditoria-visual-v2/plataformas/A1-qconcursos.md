# QConcursos

| Campo | Valor |
|-------|-------|
| **ID roster** | A1 |
| **URL** | https://www.qconcursos.com/ |
| **Categoria** | Gigante — padrão de mercado |
| **Data da captura** | 2026-06-10 |
| **Auditor** | Firecrawl + agente AVANT |

---

## Primeira impressão (3 palavras)

**Institucional · Laranja · Denso** — branco limpo, laranja `#FE6112`, tipografia Open Sans legível.

---

## Tokens observados

Fonte: [`../branding/A1-qconcursos.json`](../branding/A1-qconcursos.json)

| Token | Hex / valor |
|-------|-------------|
| Fundo | `#FFFFFF` |
| Texto primário | `#000000` |
| Link | `#111827` |
| Brand / CTA primário | `#FE6112` (laranja) |
| CTA secundário | `#1EB051` (verde) |
| CTA primário label | “Comece a estudar de graça” |
| CTA sec. label | “VER PREÇOS E PLANOS” |
| Raio botão | 8px |
| Raio base | 10px |
| Fonte | **Open Sans** / Inter (heading stack) |
| h1 / h2 / body | 48px / 24px / 12px |
| Framework | Tailwind |
| Personalidade | profissional, energia média |

---

## Telhas

| ID | Desktop | Mobile | Notas |
|----|---------|--------|-------|
| T1 Landing | ☑ | ☑ | `screenshots/qconcursos/T1-landing-*.png` |
| T2 Login | ☑ | ☑ | `T2-login-*.png` — script público |
| T3 Vitrine | ☑ | ☑ | `T3-vitrine-visitante-*` (público) + `T3-vitrine-*` / `T3-vitrine-enfermagem-*` (logado) |
| T4 Card questão | ☑ | ☐ | inline na vitrine (mesma URL) |
| T5 Player | ☑ | ☐ | `T5-player-desktop.png` |
| T6 Feedback | ☑ | ☐ | capturado no mesmo frame (resposta + gabarito) |
| T7–T8 | ☐ | ☐ | Mesa de Estudos (`app.qconcursos.com`) — fora do escopo web |

**Mapa funcional completo:** [`A1-qconcursos-funcional.md`](./A1-qconcursos-funcional.md) · [`A1-qconcursos-map.json`](./A1-qconcursos-map.json) · **Player:** [`A1-qconcursos-player.md`](./A1-qconcursos-player.md) · **Comparativo AVANT:** [`A1-qconcursos-comparativo-funcional.md`](./A1-qconcursos-comparativo-funcional.md)

---

## O que extrair

1. Fundo branco + cards sem glass
2. Hierarquia conservadora — confiança
3. Botões sólidos, raio moderado (8px)
4. Densidade de informação na vitrine (auditar T3 depois)

## O que REJEITAR para AVANT

1. Cor laranja `#FE6112` — não usar como brand (conflito QConcursos)
2. Genericidade — maior risco de parecer “mais um QC”

---

## Scores T1 (preliminar)

| L | H | D | C | M | I | A | P | E | X |
|---|---|---|---|---|---|---|---|---|---|
| 5 | 4 | 4 | 5 | 4 | 5 | 4 | 5 | 4 | 2 |

---

## Notas

QConcursos é a **referência de confiança**, não de exclusividade. AVANT deve pegar estrutura e legibilidade, não a paleta laranja.

### Captura automatizada (Playwright)

**Público (sem conta):** T2 login + T3 vitrine visitante

```bash
PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/audit-visual-external.spec.ts -g "QConcursos.*público" --project=chromium --workers=1
```

**Logado (conta free em `.env.local` — não commitar):**

```
QCONCURSOS_AUDIT_EMAIL=seu@email.com
QCONCURSOS_AUDIT_PASSWORD=***
```

```bash
PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/audit-visual-external.spec.ts -g "QConcursos" --project=chromium --workers=1
```

Rotas capturadas:

| Arquivo | URL |
|---------|-----|
| `T3-vitrine` | `/questoes-de-concursos/questoes` |
| `T3-vitrine-enfermagem` | `?discipline_ids[]=172&job_ids[]=393` |
| `T4-question-card` | primeira questão da lista enfermagem |

Sessão cacheada em `e2e/.auth/qconcursos-storage.json` (gitignored).

### O que extrair do T3 (vitrine)

1. Sidebar de filtros denso (Disciplina, Banca, Ano, Cargo…)
2. Contagem “Foram encontradas N questões” — hierarquia clara
3. Cards de questão com meta banca/ano/órgão em linha compacta
4. Botões sólidos laranja só em CTA — fundo branco dominante
5. **Rejeitar** copiar laranja; AVANT usa verde `#8fe020` no mesmo papel de CTA primário
