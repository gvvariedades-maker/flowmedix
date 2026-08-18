# Revisão de guidelines — Onda 16 (2026-08)

**Política:** só alterar com fonte oficial verificada (MS, Anvisa, COFEN).  
**Precedente:** [`GUIDELINE_REVIEW_ONDA15_2026-08.md`](GUIDELINE_REVIEW_ONDA15_2026-08.md)  
**Índice:** [`GUIDELINE_REVIEW_INDEX_2026-08.md`](GUIDELINE_REVIEW_INDEX_2026-08.md)

## Atualizado nesta onda

| Tabela | Mudança | Fonte oficial |
|--------|---------|---------------|
| `saudeCrianca.ts` | Caderneta = **6ª ed. 2024** (não 7ª); pezinho **48 h–5º dia**; caderneta digital; leite ≤12 h (RDC 918/2024) | [Caderneta](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/caderneta) · [PNTN FAQ pezinho](https://www.gov.br/saude/pt-br/composicao/saes/triagem-neonatal/perguntas-frequentes-faq/quando-deve-ser-realizada-a-coleta-do-teste-do-pezinho) · RDC 918/2024 |
| `tuberculose.ts` | TRM-TB = **método de escolha** casos novos; entry ILTB/TPT (NI 2024–2025) | Manual TB 2ª ed. · portal MS TRM-TB · NI ILTB |
| `viasAdministracao.ts` | URL → Res. COFEN **801/2026** | [COFEN 801/2026](https://www.cofen.gov.br/resolucao-cofen-no-801-de-14-de-janeiro-de-2026/) |

## exam_vs_current

| Tema | Vigente | Prova antiga |
|------|---------|--------------|
| Teste do pezinho | **48 h** após nascimento até **5º dia** | “3º ao 5º dia” |
| Caderneta edição | **6ª** (2024) | “7ª ed.” (erro interno corrigido) |

## Onda 17

Concluída em [`GUIDELINE_REVIEW_ONDA17_2026-08.md`](GUIDELINE_REVIEW_ONDA17_2026-08.md) — spot-check residual; ciclo em **modo delta**.

## Gates

```bash
npx jest __tests__/lib/guidelines/guidelineCoverage.test.ts
npm run audit:guideline-coverage
```
