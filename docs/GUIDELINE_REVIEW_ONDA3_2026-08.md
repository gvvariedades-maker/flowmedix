# Revisão de guidelines — Onda 3 (2026-08)

**Política:** só alterar com fonte oficial verificada (MS, Anvisa, CNV/PNI).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA2_2026-08.md`](GUIDELINE_REVIEW_ONDA2_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `biosseguranca.ts` | Snapshot Protocolo 5 + NT **11/2025**; precauções padrão × transmissão; **correção RDC 222** (A–E); NT 05/2024 HH; entry protocolos IRAS mínimos | Anvisa Protocolo 5 · NT GVIMS 11/2025 · RDC 222/2018 |
| `farmacodinamica.ts` | URL/ano Protocolo MS/Anvisa medicamentos; entries alta vigilância + biodisponibilidade | Protocolo Segurança Prescrição/Uso/Admin (MS página atualizada 2026) |
| `saudeAdolescente.ts` | Caderneta **4ª ed. 2024**; faixa 10–19; **HPV dose única** CNV 2026 | MS Cadernetas · Calendário Nacional 2026 |
| `saudeCrianca.ts` | Caderneta **7ª ed.** (2024/2025 revisada); URL portal MS | MS Caderneta da Criança |
| `pniCalendario.ts` / `pni.ts` | Alinha HPV rotina = **1 dose** 9–14; pegadinha 2/3 doses marcada como prova antiga | IN / Calendário Nacional Vacinação **2026** |

## Correção crítica (RDC 222/2018)

A tabela tinha letras trocadas. Correto:

| Grupo | Conteúdo |
|-------|----------|
| A | Infectantes |
| B | Químicos |
| C | Radioativos |
| D | Comuns |
| E | Perfurocortantes |

IDs de entry preservados (`residuos-grupo-b-comum`, `residuos-grupo-d-radioativo`) — só valores/labels corrigidos.

## Mantido de propósito

| Tema | Motivo |
|------|--------|
| Conceitos ADME / agonista-antagonista | Estáveis; sem norma nova conflitante |
| AME até 6 meses / prolongado 2 anos | Caderneta vigente mantém |
| Protocolo medicamentos 2013 (texto) | Ainda publicado como protocolo oficial MS/Anvisa (página atualizada 2026) |

## Onda 4

Concluída em [`GUIDELINE_REVIEW_ONDA4_2026-08.md`](GUIDELINE_REVIEW_ONDA4_2026-08.md) (PNSP, TB, Saúde Mental).

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
