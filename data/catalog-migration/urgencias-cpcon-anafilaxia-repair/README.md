# Urgências — repair CPCON anafilaxia

**Subtópico:** Urgências e Emergências  
**Ramo:** `urgencias_anafilaxia`  
**Status:** handcraft_ready → apply

## Questão

| Campo | Valor |
|-------|--------|
| Slug | `cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-3` |
| Golden | [`examples/questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json`](../../../examples/questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json) |
| Banca / ano | CPCON UEPB 2026 |
| Gabarito | **C** — I e II verdadeiras, II justifica I |
| Player | `/estudar/cpcon-uepb-enfermagem-processo-de-enfermagem-1780007246385-3` |

**Nota:** slug `fepese-…-1777103994618-1` do cluster report é drift (choque hipovolêmico no DB).

## Pipeline

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json
npm run audit:anchor-review -- --lote=urgencias-cpcon-anafilaxia-repair --record-pass --skip-capture
npm run catalog:apply-lote -- --lote=urgencias-cpcon-anafilaxia-repair --apply
```
