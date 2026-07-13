/**
 * Protocolo A4-mínimo — Vias de Administração (Onda 2)
 *
 * Absorção IM×SC×IV, 1ª passagem hepática, técnica e sítios de punção.
 *
 * Código: [`lib/catalogMigration/viasA4Minimo.ts`](../lib/catalogMigration/viasA4Minimo.ts)  
 * Guideline: [`lib/guidelines/viasAdministracao.ts`](../lib/guidelines/viasAdministracao.ts)  
 * Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)
 */

---

## Decisão

1. Claims sensíveis (absorção, ângulo, volume mL, sítios IM) → whitelist.
2. Fonte tier A com `covers` (`vias-administracao-cofen`).
3. Agente: `agent:vias-a4-minimo-v1`.
4. Amostra humana 20% dos `medio`.

## Eixos

| Eixo | Exemplos |
|------|----------|
| absorcao | Trilho IV>IM>SC; pegadinha IM lenta |
| primeira_passagem | Sublingual, retal |
| vo | Delgado, jejum |
| parenteral | Lista clássica IV/IM/SC/ID |
| tecnica_im | Palpar, marcos ósseos, conforto |
| sitio_im | Ventroglúteo, vasto lateral |
| volume_angulo | 90° IM, SC mL, deltoide 2 mL |
| outras_vias | ID teste, inalatória, tópica |

## CLI

```bash
npm run stamp:a4-minimo -- --lote=vias-de-administracao-g01 --dry-run
npm run stamp:a4-minimo -- --file=examples/questao-premium-consulpam-vias-absorcao-oral.json
npm run audit:questao-readiness -- --file=examples/questao-premium-cpcon-vias-im-vf.json --strict-v2-pedagogy
```

## Expandir whitelist

1. Entry em `VIAS_ADMINISTRACAO_COFEN`
2. Claim em `VIAS_CLAIM_WHITELIST`
3. Teste Jest
4. Revisão humana do claim novo

## Humano sempre

- `family=calc` (doses/infusões)
- Volume/ângulo fora da whitelist
- Afirmar IM<SC ou ventroglúteo inseguro sem contexto de eliminação
- Divergência real `exam_vs_current`
