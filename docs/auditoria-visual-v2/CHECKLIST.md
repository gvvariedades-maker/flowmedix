# Checklist — auditoria visual pronta

Use antes de aprovar tokens e iniciar implementação em código.

---

## Captura

- [ ] **15 plataformas** do roster com T1 (landing) desktop + mobile
- [ ] **Mínimo 8 plataformas** com T2–T8 (área logada ou equivalente)
- [x] **AVANT D1** com T1–T11 (baseline Cyber Clinical — 2026-06-10; T4 embutido em T3; T10 runner omitido)
- [x] **AVANT D2** com T1–T11 (Editorial v2 — 2026-06-10; espelho D1)
- [x] Screenshots em `screenshots/` com convenção de nomes (ver `screenshots/README.md`)
- [ ] Conta gratuita no Gabarita (B0) para capturar dashboard e player

---

## Documentação

- [ ] Ficha preenchida por plataforma auditada (`plataformas/*.md`)
- [ ] `scores/scorecard.csv` com notas 1–5 nos 10 critérios
- [x] `relatorio/RELATORIO-EXECUTIVO.md` completo
- [ ] Mood board (Figma ou PDF) anexado ou linkado no relatório
- [ ] Parágrafo **“AVANT não é X porque…”** (exclusividade)

---

## Decisões de produto (seção final do relatório)

- [x] Tema padrão: claro (dashboard) / escuro (reverso + LP pendente)
- [x] CTA primário: verde logo AVANT
- [x] NeuroSlides: paleta por subtópico (shell escuro)
- [x] Landing: fase separada (Fase 8)

---

## Tokens

- [x] `tokens/AVANT-EDITORIAL-V2-DRAFT.md` revisado e **aprovado**
- [x] Contraste WCAG AA verificado (texto primário, CTA, erro/sucesso) — ver `tokens/WCAG-CONTRAST-EDITORIAL-V2.md`
- [x] Exceções documentadas (player reverso, acerto/erro, e-mails)

---

## Implementação (após checklist)

- [x] Tag Git `avant/editorial-v2` criada no commit de conclusão do rebrand dashboard
- [x] Fase 1: `app/globals.css` + `tailwind.config.ts`
- [ ] QA mobile: `docs/MOBILE_BOTTOM_NAV_QA.md`
- [ ] Rollback testado: `git checkout avant/cyber-clinical-v1 -- app/globals.css` (smoke)

---

## Critério de sucesso do rebrand visual

O aluno que conhece QConcursos ou Gabarita deve pensar:

> “Parece um produto sério de concurso, mas tem cara de AVANT.”

Não deve pensar:

> “É o QConcursos com outra logo” ou “É um template de IA genérico”.
