# L3 Brief — Segurança do Paciente (INDEX)

**Subtópico:** Segurança do Paciente  
**Pacote:** seguranca-do-paciente · 59 slugs · applied 100%  
**Template:** amber  
**Modo:** bespoke_obrigatorio_ramoforte

## Ramos (5)

| branch_id | slugs (~) | molde | brief |
|-----------|-----------|-------|-------|
| sp_identificacao | ~10 | bespoke 4/4 | l3-brief-seguranca-do-paciente-sp_identificacao.md |
| sp_prevencao_quedas | ~12 | bespoke 4/4 | l3-brief-seguranca-do-paciente-sp_prevencao_quedas.md |
| sp_eventos_adversos | ~11 | bespoke 4/4 | l3-brief-seguranca-do-paciente-sp_eventos_adversos.md |
| sp_metas_internacionais | cauda | genérico | SP_GENERIC_MOLD |
| sp_generico | cauda | genérico | SP_GENERIC_MOLD |

## Pacote bespoke (7 variantes)

sp-id-verify-deck · sp-fall-risk-rail · sp-incident-taxonomy-deck · sp-nsp-reference-board · sp-vf-juggle-tap · sp-protocol-tap-flow · sp-safety-trap-arena

## Regressão

npx playwright test e2e/visual-mold-regression.spec.ts --grep "Segurança do Paciente"
