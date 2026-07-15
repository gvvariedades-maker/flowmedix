# Doenças Bacterianas — relatório paridade Adolescente + L3 bespoke (nota-10)

**Data:** 2026-07-15 (fechamento)  
**Pacote:** `doencas-bacterianas` · **37 slugs** · `production_ready`  
**Barra:** paridade proporcional com saude-adolescente-nota10-report.md

---

## Tabela de paridade (modo +L3 bespoke)

| Critério | Saúde do Adolescente | Doenças Bacterianas | Paridade |
|----------|----------------------|---------------------|----------|
| Slugs handcraft applied | 16/16 | 37/37 | OK |
| production_ready | sim | sim | OK |
| Ramos L3 com >=1 slug | 6/6 | 3/3 | OK |
| bespoke 4/4 ramos fortes | 6 bespoke | 2/2 (agente_etiologico + tuberculose) | OK |
| ok_generico cauda | N/A | bacterianas_generico 19 slugs | OK |
| Playwright L3 PASS | 13/13 | summary.json doencas-bacterianas | OK |
| L6 anchor | g01+g02 | 5 lotes g* pass | OK |
| Apply Supabase | 16/16 | g01-g05 37/37 | OK |

---

## Ramos L3 (pós Fase 0b)

| Ramo | Slugs | Molde 4/4 |
|------|-------|-----------|
| bacterianas_agente_etiologico | 4 | etiology-* bespoke |
| bacterianas_tuberculose | 28 | tb-vigilance-rail / tb-precaution-board / tb-vf-elimination-tap / tb-transmission-trap |
| bacterianas_generico | 19 | molecular / minimal / cards / list |

---

## Fix L1 (esta sessão)

Slug grupo-talent-enfermagem-processo-de-enfermagem-1780009359555-2: Supabase tinha subtopico=Imunizacao + branch bacterianas_generico. Apply g02 corrigiu. handcraft-dod 37/37 PASS.

## Gates: L1-L6 PASS · technical_ready=true · production_ready=true
