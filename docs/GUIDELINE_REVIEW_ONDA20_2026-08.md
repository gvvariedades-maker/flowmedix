# Revisão de guidelines — Onda 20 (2026-08)

**Política:** só alterar com fonte oficial verificada.  
**Precedente:** [`GUIDELINE_REVIEW_ONDA19_2026-08.md`](GUIDELINE_REVIEW_ONDA19_2026-08.md)  
**Índice:** [`GUIDELINE_REVIEW_INDEX_2026-08.md`](GUIDELINE_REVIEW_INDEX_2026-08.md)

## Escopo desta onda

| Tabela | Achado | Ação |
|--------|--------|------|
| `doencasVirais.ts` | Influenza 2026 sem janela Norte / esquema criança | Detalhar Dia D **28/03–30/05/2026** (NE/CO/S/SE); **Norte no 2º semestre**; esquema 1 vs 2 doses (6 m–8 a) |
| `cuidadosMedicamentos.ts` | COFEN 801 só contraste TE×enfermeiro | Novo ID com **elementos mínimos** do Art. 3º + DCB + Anexo II exemplificativo |
| `cme.ts` / RDC 1002/2025 | RDC 1002 é foco **odontologia ambulatorial** | Sem mudança hospitalar — CME permanece em RDC 15/2012 (+ nota já existente) |

## Fontes oficiais

- [Estratégia Influenza 2026 (MS)](https://www.gov.br/saude/pt-br/vacinacao/publicacoes/estrategia-de-vacinacao-contra-a-influenza-nas-regioes-nordeste-centro-oeste-sul-e-sudeste-2026)  
- [Res. COFEN 801/2026](https://www.cofen.gov.br/resolucao-cofen-no-801-de-14-de-janeiro-de-2026/)

## IDs estáveis

Mantidos: `influenza-vacina`, `prescricao-enfermeiro-res-801-2026`.  
Novos: `influenza-esquema-crianca`, `prescricao-801-elementos-minimos`.

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
