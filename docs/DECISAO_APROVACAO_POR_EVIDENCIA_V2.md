# ADR — Aprovação por evidência v2 (EVIDENCE_GOVERNED_APPROVAL_V2)

**Data:** 2026-09-14
**Status:** vigente após merge/aprovação
**Escopo:** governança editorial de apply de conteúdo (alto risco) — **não** RC004 / runtime comercial

---

## Problema

- Assinatura humana isolada não é garantia de correção clínica.
- Conteúdo de alto risco precisa de trilho auditável, reproduzível e fail-closed.
- IA pode participar da **construção e auditoria editorial** (offline/CLI), **não** do runtime do produto.

## Decisão

Para `risk_tier=alto` com `auto_approval.enabled=true`:

| Modo | Semântica |
|------|-----------|
| `evidence_required` | Dupla revisão independente (procedural) + fontes + claims + gates determinísticos |
| Escalonamento | `human_required` ou `HUMAN_ESCALATION_REQUIRED` quando evidência insuficiente/conflito |
| Kill-switch | `auto_approval.enabled=false` → `human_required` (fail-closed) |
| Chokepoint apply | `evidence_required` / `human_required` **sempre** em `applyLoteToSupabase` — `riskApprovalGate` só controla `auto` / `auto_conditional` |

**EVIDENCE_REQUIRED ≠ auto approved.** Sem pacote válido → `BLOCKED`.

## Não-decisão

- Não altera RC004, `COMMERCIAL_RUNTIME_READINESS_GATE`, denylist P0, Production.
- `EVIDENCE_EDITORIAL_APPROVAL=PASS` **não** autoriza `approved_content_fingerprint` automaticamente.
- Project Owner (`PROJECT_OWNER_DECISION=PROCEED`) ≠ revisor clínico.

## Limitações

- Independência entre agentes é **procedural** (review_id, reviewer_id, hash de artefato distintos) — não criptográfica.
- Agentes podem errar de forma correlacionada.
- Fontes podem estar incompletas → escalonamento humano.

## Escalonamento humano

Dispara quando: disagreement, fonte insuficiente, guideline conflitante, ambiguidade, confiança baixa/média, evidência stale, caso extraordinário.

## Implementação

- `lib/catalogMigration/evidenceGovernedApproval.ts` — schemas, verifier, manifest
- `lib/catalogMigration/riskScoring.ts` — `evidence_required`, `assertApprovalGate`
- `catalog:apply-lote --evidence-manifest=<path>`
- Workflow: `Revisão pedagógica P0:` — `docs/P0_PEDAGOGICAL_REVIEW_CONVERSA.md`
