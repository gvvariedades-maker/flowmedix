# P0 — Revisão pedagógica por evidência (conversa Agent)

Trigger: **`Revisão pedagógica P0: P0-01 P0-02`** (ou lista de IDs)

## Objetivo

Produzir artefatos **externos** para `EVIDENCE_GOVERNED_APPROVAL_V2` — não aprovação final do Project Owner.

## Fluxo (duas conversas por slug de alto risco)

1. **Primary agent** — `docs/schemas/p0-primary-agent-review.example.json`
2. **Adversarial agent** (conversa separada) — `docs/schemas/p0-adversarial-agent-review.example.json`
3. Manifest — `docs/schemas/p0-evidence-manifest.example.json`
4. **Owner** — decisão operacional separada; opcional escalonamento humano — `docs/schemas/p0-human-escalation-signoff.example.json`

## Proibido

- `--apply`, writes Production, denylist removal, RC004 binding
- Campos `evidence_approved` no JSON da questão
- Declarar `HUMAN_APPROVAL=YES` sem owner

## Comandos

```bash
npm run audit:questao-readiness -- --file=artifacts/.../P0-01_editorial_candidate.json --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=... --dry-run --risk-approval-gate --evidence-manifest=artifacts/evidence-reviews/manifest.json
```

## Preview player

`/dev/questao-review?source=p0-d3-fixture&p0_id=P0-01&slug=<slug>`

## Independência procedural

Adversarial em **conversa/agente separado**; veredito provisório antes de ler justificativa completa do primary.
