# Revisão de guidelines — Onda 1 (2026-08)

**Escopo:** P1 crítico + divergências oficiais comprovadas.  
**Não cobre:** revalidação literal entry-a-entry dos 41 subtópicos.

## Resultado da cobertura (pré-onda)

| Métrica | Valor |
|---------|------:|
| Subtópicos canônicos com guideline | 41/41 |
| Tabelas / entries | 55 / ~1512 |
| Banda baixa/crítica (audit) | 0 |

## O que foi atualizado nesta onda

| Tabela | Mudança | Fonte |
|--------|---------|-------|
| `urgencias.ts` | Snapshot → AHA/ILCOR **2025**; engasgo adulto = tapas nas costas → Heimlich; naloxona no BLS | AHA Guidelines CPR/ECC 2025 |
| `urgenciasProtocolos.ts` | Snapshot/year → 2025 | idem |
| `pni.ts` / `pniCalendario.ts` | Snapshot/year → IN Calendário Nacional **2026**; entry **VPC20** transição; VPP23 atualizada | MS DPNI IN 2026 |
| `cme.ts` | Nota RDC **15/2012** vigente hospitalar × RDC **1002/2025** odontologia | Anvisa |

Ids de tabela (`pni-2025-intervalos`, `pni-calendario-2025`, `urgencias-rcp-sbv-ms`) **mantidos** para não quebrar `sourceId` nos goldens.

## O que foi verificado e **não** precisou reescrever números

| Tema | Motivo |
|------|--------|
| RCP 30:2, 100–120/min, 5–6 cm | Reafirmados na AHA 2025 |
| CME RDC 15/2012 | Ainda a norma hospitalar de referência |
| COFEN 358/2009, Lei 8.080/1990 | Normas estáveis (ano antigo ≠ desatualizado) |
| Caderno AB pré-natal 2012 | Ainda citado; revisão profunda = Onda 2 (Mulher) |

## Onda 2 sugerida (próxima conversa)

1. Saúde da Mulher — cadernos AB / INCA vigentes  
2. Sinais Vitais — diretriz PA SBC mais recente  
3. Vias / Cuidados medicamentos — COFEN + bulas/Anvisa  
4. Punção — bundle Anvisa + Potter (já enriquecido; spot-check)  
5. Spot-check PNI infantil completo vs calendário técnico 2026 PDF

## Comandos

```bash
npm run audit:guideline-coverage
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
```
