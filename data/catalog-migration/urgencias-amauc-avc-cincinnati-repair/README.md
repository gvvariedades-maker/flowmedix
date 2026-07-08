# Urgências — repair AMAUC Cincinnati / AVC

**Subtópico:** Urgências e Emergências  
**Modo:** Handcraft golden-v1 — repair pontual (1 slug)  
**Status:** **applied** (2026-07-08)

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `amauc-enfermagem-semiologia-em-enfermagem-1779563500147-9` |
| Golden | [`examples/questao-premium-amauc-urgencias-cincinnati-avc.json`](../../../examples/questao-premium-amauc-urgencias-cincinnati-avc.json) |
| Banca / ano | AMAUC 2025 |
| Gabarito | **A** — Face · braço · fala |
| Player | `/estudar/amauc-enfermagem-semiologia-em-enfermagem-1779563500147-9` |

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-amauc-urgencias-cincinnati-avc.json
npm run audit:anchor-review -- --lote=urgencias-amauc-avc-cincinnati-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-amauc-avc-cincinnati-repair --apply
```
