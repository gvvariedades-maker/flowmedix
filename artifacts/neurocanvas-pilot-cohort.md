# NeuroCanvas — coorte piloto (Fase 0)

Gerado em: 2026-07-26T07:53:27.731Z

Pilotos: **41** · Controles: **41**

## Distribuição por tipo (pilotos)

- concept_map: 17
- golden_rule: 24

## Exclusões

- not_canonical: 0
- legacy_exception: 0
- content_only_ambiguous: 0
- not_generic: 7854
- not_readiness_a: 28
- divergent_slug: 11036

## Critérios

- decision === generic_semantic
- readiness === A
- exclui 66 legacy (danger sem correct + logic_flow sem tap)
- exclui content-only ambíguo
- exclui slugs divergentes
- balanceamento por type, subtopico, slot size, rows, correct, tap, texto longo

## Amostra (10 primeiros pilotos)

| slug | idx | type | subtopico | shape | layout |
|------|----:|------|-----------|-------|--------|
| adm-tec-enfermagem-atencao-basica-saude-da-familia-1778968077998-3 | 0 | concept_map | Atenção Básica / Saúde da Família | items | morphological |
| adm-tec-enfermagem-atencao-basica-saude-da-familia-1778968156152-1 | 0 | concept_map | Atenção Básica / Saúde da Família | items | morphological |
| adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-2 | 2 | golden_rule | Epidemiologia e Vigilância Epidemiológica | rows+content | reference_table |
| adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-3 | 2 | golden_rule | Epidemiologia e Vigilância Epidemiológica | rows+content | reference_table |
| adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-5 | 0 | concept_map | Epidemiologia e Vigilância Epidemiológica | items | morphological |
| adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-5 | 2 | golden_rule | Epidemiologia e Vigilância Epidemiológica | rows+content | reference_table |
| adm-tec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563778577-6 | 2 | golden_rule | Epidemiologia e Vigilância Epidemiológica | rows+content | reference_table |
| amauc-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563707368-5 | 2 | golden_rule | Auditoria e Gestão da Qualidade (Enfermagem) | rows+content | reference_table |
| amauc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-7 | 2 | golden_rule | Epidemiologia e Vigilância Epidemiológica | rows+content | reference_table |
| amauc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-3 | 2 | golden_rule | Epidemiologia e Vigilância Epidemiológica | rows+content | reference_table |

## Limitações

- Controle = slide não-genérico do mesmo slug quando disponível.
- Mobile não simulado — risco inferido por text_density > 800.
