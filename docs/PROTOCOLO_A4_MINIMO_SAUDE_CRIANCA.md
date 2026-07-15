# Protocolo A4-mínimo — Saúde da Criança (paridade Adolescente)

Escuta pediátrica, AME, triagem neonatal, desidratação (Plano A/B/C), puericultura, APGAR.

Código: [`lib/catalogMigration/criancaA4Minimo.ts`](../lib/catalogMigration/criancaA4Minimo.ts)  
Guideline: [`lib/guidelines/saudeCrianca.ts`](../lib/guidelines/saudeCrianca.ts)  
Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)

---

## Decisão

1. Claims sensíveis (AME 6 meses, mel &lt;1 ano, pezinho, coraçãozinho SpO₂, Plano A/B/C, consultas puericultura) → whitelist.
2. Fonte tier A MS Caderneta da Criança (`saude-crianca-ms`).
3. Agente: `agent:crianca-a4-minimo-v1`.
4. Amostra humana 20% dos `medio`; **6 slugs `alto`** assinados `handcraft-qc` antes do apply.

## Eixos

| Eixo | Exemplos |
|------|----------|
| aleitamento | AME 6 meses, IA 6–24 meses, mel proibido &lt;1 ano |
| triagem_neonatal | Pezinho 3–5º dia, coraçãozinho SpO₂ |
| neonatologia | APGAR faixas, icterícia, banho RN |
| desidratacao | Plano A/B/C, sinais clínicos |
| puericultura | Calendário consultas, caderneta |
| desenvolvimento | M-CHAT, marcos, TEA |
| vacina | Calendário PNI infantil |
| violencia | Notificação, proteção |

## CLI

```bash
npm run stamp:a4-minimo -- --lote=saude-da-crianca-g01 --dry-run
npm run stamp:a4-minimo -- --lote=saude-da-crianca-g01
npm run stamp:crianca-a4-humano-qc
npm run audit:questao-readiness -- --file=examples/questao-premium-cpcon-saude-crianca-aleitamento-vf.json --strict-v2-pedagogy
```

## Humano sempre

- `family=calc` (doses, volumes Plano B/C)
- Claim fora da whitelist (ex.: pezinho fora da janela sem pegadinha explícita)
- Divergência real `exam_vs_current`
- Conduta neonatal de reanimação com número novo sem entry guideline
