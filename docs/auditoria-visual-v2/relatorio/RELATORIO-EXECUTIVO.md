# AVANT Visual Audit — Relatório Executivo

**Status:** concluído — migração Editorial v2 (dashboard)  
**Data:** 2026-06-10  
**Participantes:** engenharia AVANT + auditoria visual v2

---

## 1. Resumo (5 bullets)

1. **Rebrand concluído** no fluxo logado (auth → vitrine → player → simulados/cadernos/plano/conta/material/ajuda) com tema claro editorial ativado via `html[data-theme='editorial']`.
2. **CTA exclusivo** verde logo `#8fe020` substitui cyan `#00f2ff`; cards opacos (`.card-elevated`) substituem glassmorphism em massa.
3. **Exceções preservadas:** Estudo Reverso fullscreen e NeuroSlides overlay permanecem escuros (identidade do método); landing pública, admin e e-mails ainda Cyber.
4. **26 screenshots** editorial-v2 capturados (espelho D1 baseline) em `screenshots/avant-editorial-v2/`; rollback documentado via tag `avant/cyber-clinical-v1`.
5. **Contraste WCAG AA** validado nos pares de token principais (`scripts/wcag-editorial-contrast.mjs`); **build de produção OK** (`npm run build`); tag **`avant/editorial-v2`** no commit de entrega.

---

## 2. Top 3 por critério

| Critério | 1º | 2º | 3º |
|----------|----|----|-----|
| L — Legibilidade | Editorial v2 | QConcursos | Gabarita |
| H — Hierarquia | Editorial v2 | Estudei | Gabarita |
| D — Densidade | QConcursos | Editorial v2 | Gabarita |
| C — Confiança | QConcursos | Gabarita | Editorial v2 |
| M — Mobile | Editorial v2 | Estudei | Gabarita |
| I — Identidade | Cyber v1 (NeuroSlides) | Editorial v2 (verde) | Estudei |
| E — Emoção LP | Cyber v1 (atual LP) | Estudei | QConcursos |
| X — Exclusividade | Editorial v2 + NeuroSlides | Cyber v1 | Gabarita |

---

## 3. Padrões a adotar

1. Fundo app `#f8fafc`, cards brancos, bordas `slate-200`.
2. CTA primário `.btn-editorial-primary` (verde `#8fe020`, label escuro).
3. Nav ativo com barra/fundo brand verde, não violet/cyan.
4. Tokens semânticos success/danger/warning sem glow neon.
5. Raio 12–16px em cards; sombra sutil `rgba(15,23,42,0.08)`.

---

## 4. Padrões a evitar

1. Cyan `#00f2ff` como brand principal no dashboard.
2. `glass-panel` + `rounded-[2.5rem]` em telas de estudo diário.
3. Hardcodes `bg-[#010409]` fora de LP/admin/reverso escuro.

---

## 5. Posicionamento visual AVANT v2

Em três segundos, o aluno deve perceber um **produto sério de concurso** (clareza editorial, hierarquia legível, confiança institucional) com **assinatura AVANT**: verde-limão do logo no CTA e no momento Estudo Reverso. Não é QConcursos porque o acento é verde AVANT, não laranja; não é Gabarita porque evitamos âmbar genérico; não é Estudei porque mantemos NeuroSlides escuros e narrativa de estudo reverso como diferencial.

---

## 6. AVANT não é [X] porque…

| Concorrente | Por que AVANT é diferente (visual + produto) |
|-------------|-----------------------------------------------|
| QConcursos | CTA verde logo, não laranja; NeuroSlides + estudo reverso pós-questão |
| Gabarita Enfermagem | Paleta editorial sem âmbar dominante; player com jornada reverso |
| Estudei | Reverso escuro fullscreen; foco técnico enfermagem + bancas reais |
| Cyber Clinical v1 | v2 claro no dia a dia; v1 taggada para rollback (`avant/cyber-clinical-v1`) |

---

## 7. Decisões aprovadas

| Decisão | Escolha |
|---------|---------|
| Tema padrão (dashboard) | **Claro editorial** |
| CTA primário | **Verde logo `#8fe020`** |
| Fundo app | `#f8fafc` |
| NeuroSlides | **Paleta por subtópico** (glow suavizado); shell escuro |
| Landing | **Fase separada** (permanece Cyber) |
| Raio padrão card | **12px–16px** |
| Tipografia | system-ui / Inter existente |

---

## 8. Tokens finais

Ver arquivo aprovado: [`../tokens/AVANT-EDITORIAL-V2-DRAFT.md`](../tokens/AVANT-EDITORIAL-V2-DRAFT.md)  
Contraste WCAG: [`../tokens/WCAG-CONTRAST-EDITORIAL-V2.md`](../tokens/WCAG-CONTRAST-EDITORIAL-V2.md)

---

## 9. Exceções visuais

| Superfície | Tratamento especial |
|------------|---------------------|
| NeuroSlides | Overlay escuro; cores por subtópico (`themeGenerator.ts`) |
| Player Estudo Reverso | Fullscreen permanece escuro (`ReverseStudyShell`) |
| Feedback acerto/erro | Cards editorial verde/vermelho sem neon |
| E-mails transacionais | Cyber `#010409` — migrar depois |
| Admin / Laboratório | Cyber — fora do escopo v2 |

---

## 10. Plano de rollout (só visual)

| Fase | Escopo | Status |
|------|--------|--------|
| 0 | Design system (`globals.css`, select editorial) | ✅ |
| 1 | Auth + headers públicos logados | ✅ |
| 2 | Vitrine `/estudar` | ✅ |
| 3 | Cadernos, simulados, analytics, plano, ajuda, assinatura, material | ✅ |
| 4 | Player questão + modal + skeletons | ✅ |
| 5 | NeuroSlides (variants + shell reverso) | ✅ |
| 6 | Modais transversais + errors + loadings | ✅ |
| 7 | Screenshots, WCAG, build, tag `avant/editorial-v2` | ✅ |
| 8 | Landing + e-mails + admin | Pendente |

---

## 11. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Parecer clone QConcursos | Acento verde logo + NeuroSlides + estudo reverso |
| Perder identidade Cyber | Tag rollback `avant/cyber-clinical-v1` |
| Contraste insuficiente | Script WCAG + revisão CTA `#1a2e05` on `#8fe020` |
| Regressão mobile | Bottom nav editorial + QA `docs/MOBILE_BOTTOM_NAV_QA.md` |
| LP desalinhada com app | Fase 8 dedicada |

---

## Anexos

- Screenshots baseline: [`../screenshots/avant-baseline/`](../screenshots/avant-baseline/)
- Screenshots editorial v2: [`../screenshots/avant-editorial-v2/`](../screenshots/avant-editorial-v2/)
- Ficha D1: [`../plataformas/D1-avant-baseline.md`](../plataformas/D1-avant-baseline.md)
- Ficha D2: [`../plataformas/D2-avant-editorial-v2.md`](../plataformas/D2-avant-editorial-v2.md)
- E2E capture: `e2e/audit-visual-editorial-v2.spec.ts`
- Planilha scores: [`../scores/scorecard.csv`](../scores/scorecard.csv)
