# Comparativo LP — primeira captura (Firecrawl)

**Data:** 2026-06-10  
**Telha:** T1 landing (desktop full-page + mobile viewport)  
**Screenshots:** `screenshots/{gabarita-enfermagem,estudei,qconcursos}/`

---

## Tabela de tokens extraídos

| Token | Gabarita B0 | Estudei C1 | QConcursos A1 | AVANT v2 (proposta) |
|-------|-------------|------------|---------------|---------------------|
| Fundo | `#F3F3F2` | `#FFFFFF` | `#FFFFFF` | `#f8fafc` |
| Texto | `#1C1917` | `#00CDA0`* | `#000000` | `#0f172a` |
| Brand / CTA | `#F59B0A` âmbar | `#00CDA0` teal | `#FE6112` laranja | `#8fe020` verde AVANT |
| Secundário | `#16A249` verde | `#6735BC` roxo | `#1EB051` verde | `#2563eb` links |
| Fonte | Source Sans Pro | Neulis Neue | Open Sans / Inter | system-ui / Inter |
| Raio botão | 16px | 12px / pill | 8px | 10–12px |
| Raio base | 6px | 4px | 10px | 12px |
| Modo | claro | claro | claro | **claro** (validar) |
| Framework | Tailwind | WordPress custom | Tailwind | Tailwind 4 |

\* Estudei usa teal no texto de link em alguns elementos — headline usa escala grande (h2 64px).

---

## Scores preliminares T1 (LP)

Escala 1–5. _Subjetivo com base em branding + estrutura; revisar olhando screenshots._

| Critério | Gabarita | Estudei | QConcursos |
|----------|----------|---------|------------|
| L Legibilidade | 4 | 4 | 5 |
| H Hierarquia | 4 | 5 | 4 |
| D Densidade | 4 | 3 | 4 |
| C Confiança | 4 | 5 | 5 |
| M Mobile | 4 | 4 | 4 |
| I Identidade | 3 | 4 | 5 |
| A Acessibilidade | 4 | 3 | 4 |
| P Performance visual | 4 | 3 | 5 |
| E Emoção compra | 4 | 5 | 4 |
| X Exclusividade | 3 | 4 | 2 |

**Leituras rápidas:**

- **QConcursos:** referência de confiança e performance — laranja + verde, Open Sans, botões 8px. Risco de clone se AVANT copiar laranja.
- **Estudei:** melhor narrativa e emoção — roxo + teal, tipografia custom, fluxo 1-2-3-4, pricing cedo. LP mais “premium startup”.
- **Gabarita:** nicho saúde + âmbar/verde — parecido com infoproduto IA (Lovable/Tailwind). Menos exclusivo, mas bom grid de features e prova social.

---

## Padrões a adotar no AVANT v2

| Origem | Padrão |
|--------|--------|
| QConcursos | Fundo branco, cards opacos, densidade útil, CTA sólido sem glow |
| Estudei | Headline resultado, prova social com aprovações, passos numerados, FAQ |
| Gabarita | Métricas no hero, depoimentos com órgão, duplo CTA (grátis / pro) |
| AVANT logo | **Verde `#8fe020`** como único CTA primário — exclusividade vs laranja/teal/âmbar |

---

## O que evitar

- Laranja QConcursos (`#FE6112`) — conflito direto de marca
- Teal Estudei (`#00CDA0`) — parecer clone de organizador de estudos
- Âmbar Gabarita (`#F59B0A`) — tom “curso Hotmart genérico”
- Badge “IA” em todo bloco — commodity

---

## Screenshots locais

| Plataforma | Desktop | Mobile |
|------------|---------|--------|
| Gabarita | `screenshots/gabarita-enfermagem/T1-landing-desktop.png` | `T1-landing-mobile.png` |
| Estudei | `screenshots/estudei/T1-landing-desktop.png` | `T1-landing-mobile.png` |
| QConcursos | `screenshots/qconcursos/T1-landing-desktop.png` | `T1-landing-mobile.png` |

---

## Próximo passo

- [ ] Conta free Gabarita → T3–T7 (área logada)
- [ ] AVANT baseline screenshots (D1)
- [ ] Revisar scores olhando PNGs no IDE
- [ ] Atualizar `tokens/AVANT-EDITORIAL-V2-DRAFT.md` após aprovação
