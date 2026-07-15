# Protocolo A4-mínimo — Segurança do Paciente (Onda paridade Adolescente + L3 bespoke)

Risco clínico **médio**: identificação segura, prevenção de quedas, eventos adversos, metas OMS/PNSP.

**Código:** [`lib/catalogMigration/segurancaPacienteA4Minimo.ts`](../lib/catalogMigration/segurancaPacienteA4Minimo.ts)  
**Guideline:** [`lib/guidelines/segurancaPaciente.ts`](../lib/guidelines/segurancaPaciente.ts)  
**Modelo:** [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)

---

## Decisão

1. Claims sensíveis (2 IDs, pulseira, Morse, evento adverso, PNSP, metas OMS) → whitelist.
2. Fonte tier A: PNSP / MS (`seguranca-paciente-pnsp`).
3. Agente: `agent:seguranca-paciente-a4-minimo-v1`.
4. Amostra humana **~20% do tier `medio`** (`shouldSampleForHumanReview`).

## Eixos

| Eixo | Exemplos |
|------|----------|
| identificacao | Dois identificadores, pulseira, paciente certo |
| quedas | Morse, grades, meta 6 OMS |
| eventos | Evento adverso, incidente sem dano, near miss |
| metas | Meta 1 (ID), meta 6 (quedas), higiene das mãos |
| notificacao | PNSP Portaria 529, cultura de segurança |
| pegadinha | Urgência dispensa ID, quarto como ID, grades sozinhas |

## CLI

```bash
npm run enrich:seguranca-paciente-guideline-meta -- --lote=seguranca-do-paciente-g01 --write
npx tsx scripts/patch-seguranca-a4-minimo.ts --write
npm run stamp:a4-minimo -- --lote=seguranca-do-paciente-g01 --approve-sampled
npm run stamp:a4-minimo -- --lote=seguranca-do-paciente-g02 --approve-sampled
npm run stamp:a4-minimo -- --lote=seguranca-do-paciente-g03 --approve-sampled
npm run stamp:a4-minimo -- --lote=seguranca-do-paciente-g04 --approve-sampled
npm run audit:subtopico-quality -- --subtopico="Segurança do Paciente"
npx playwright test e2e/visual-mold-regression.spec.ts --project=chromium --grep "Segurança do Paciente"
```

> Use lotes `g01…g04` (handcraft). O lote `seguranca-do-paciente-completo` é export legado do Supabase — **não** usar para stamp.

## Escala L6 humano (59 slugs)

- L6 agent em lotes `g01…g04`.
- **1 âncora visual humana por ramo forte** — ver `data/catalog-migration/visual-anchors.json`.

## Expandir whitelist

1. Entry em `SEGURANCA_PACIENTE_PNSP`
2. Claim em `SEGURANCA_PACIENTE_CLAIM_WHITELIST`
3. Teste Jest em `segurancaPacienteA4Minimo.test.ts`
4. Revisão humana do claim novo
