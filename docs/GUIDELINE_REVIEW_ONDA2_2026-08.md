# Revisão de guidelines — Onda 2 (2026-08)

**Política:** só alterar com fonte oficial verificada (MS, INCA, Anvisa, COFEN, SBC).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA1_2026-08.md`](GUIDELINE_REVIEW_ONDA1_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `saudeMulher.ts` | Rastreio colo: DNA-HPV principal (25–64, 5 anos se negativo); citologia permanece onde HPV indisponível; pré-natal AB 32 mantido | INCA/MS Diretrizes 2025 · Caderno AB 32 |
| `sinaisVitais.ts` | Classificação PA DBHA **2025**: normal / pré-HA / estágios 1–3; meta &lt;130/80 | SBC/SBH/SBN DBHA 2025 |
| `viasAdministracao.ts` | Snapshot revisão 2026 (técnica estável) | COFEN / Potter (prática TE) |
| `cuidadosMedicamentos.ts` | Res. COFEN **801/2026** — prescrição enfermeiro × administração TE | COFEN Res. 801/2026 |
| `puncaoVenosa.ts` | Protocolo Anvisa IPCS / NT **11/2025**; clorexidina no CVC vs álcool 70 periférico (prova) | Anvisa Protocolo IPCS |

## Spot-check PNI (pós-Onda 1)

- IN Calendário Nacional **2026** já referenciada em `pni.ts` / `pniCalendario.ts`
- Transição **VPC20** documentada
- Esquemas infantis clássicos (penta, VIP, rota) mantidos — sem evidência de revogação na IN pública; revisão entry-a-entry do PDF completo fica para Onda 3 se necessário

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Caderno AB 32 (consultas 6×, periodicidade) | Ainda citado pelo MS / guias estaduais 2024 como base do pré-natal de risco habitual |
| Números de FC/FR/SpO₂ adulto | Consenso estável; sem diretriz MS nova conflitante nesta onda |

## Onda 3

Concluída em [`GUIDELINE_REVIEW_ONDA3_2026-08.md`](GUIDELINE_REVIEW_ONDA3_2026-08.md) (biossegurança RDC 222, HPV dose única, cadernetas, farmaco alta vigilância).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
