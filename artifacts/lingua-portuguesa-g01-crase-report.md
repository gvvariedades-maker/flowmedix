# Handcraft golden-v1 — lote lingua-portuguesa-g01 (Crase)

Data: 2026-07-18 · reviewer: agent:golden-v1-pt-crase · gate: audit:questao-readiness --strict-v2-pedagogy

## Resumo

- **Subtópico:** Crase (Língua Portuguesa)
- **pedagogical_branch:** pt_crase (moldes React pt-crase-funnel-*)
- **Total:** 8 questões
- **READY (A1+A2+A3):** 8/8 (100%)
- **Falhas:** A1=0, A2=0, A3=0
- **Apply Supabase:** NÃO executado (esperando "pode aplicar")

## Tabela por questão

| # | Slug | tec_id | Gab | Family | Banca | Status |
|---|------|--------|-----|--------|-------|--------|
| 1 | `vunesp-osasco-crase-serra-capivara` | 3607076 | C | conceito | VUNESP ACS Pref. Osasco 2025 | [READY] |
| 2 | `vunesp-sjrp-crase-a-qual` | 3789364 | E | conceito | VUNESP Ag Adm Pref. SJRP 2026 | [READY] |
| 3 | `caderno-pt-crase-premiacao-mundial-3839868` | 3839868 | E | conceito | Caderno PT (banca não identificada) | [READY] |
| 4 | `caderno-pt-crase-obedecer-ordem-3840782` | 3840782 | B | conceito | Caderno PT (banca não identificada) | [READY] |
| 5 | `vunesp-samu-osasco-crase-a-remo-incorreta` | 3558412 | D | conceito | VUNESP RO SAMU Osasco 2025 | [READY] |
| 6 | `caderno-pt-crase-pediu-a-todos-3665301` | 3665301 | E | conceito | Caderno PT (banca não identificada) | [READY] |
| 7 | `vunesp-sertaozinho-crase-vf-rodoviaria-carnaval` | 3354421 | C | vf | VUNESP An OP Sertãozinho 2025 | [READY] |
| 8 | `caderno-pt-crase-vf-a-ele-3353966` | 3353966 | D | vf | Caderno PT (banca não identificada) | [READY] |

## Estrutura de conteúdo

- Âncora golden replicada como gramática de slots: `examples/questao-premium-vunesp-portugues-crase-funil.json`
- **Metáfora L3:** funil (masculino → verbo → a + a); erro = «crase automática».
- Slides na ordem v2 render: concept_map → logic_flow → golden_rule → danger_zone.
- `logic_flow` sempre com `reveal_mode: "tap"` e último step "Em similares: …".
- `danger_zone` com 1 item por letra errada + 1 item de transferência ("Em outra banca…").
- `golden_rule` sem row "Gabarito letra X" (v2 spoiler-safe).
- Sem `template` / `layout_variant` (ramo pt_crase escolhe molde bespoke pt-crase-funnel).

## Ramos por família

- 6 questões `family: "conceito"` (assinale a alternativa correta/incorreta).
- 2 questões `family: "vf"` (I/II/III + combinação — Q7 e Q8).
- Todas `meta.pedagogical_branch: "pt_crase"` (funil aplicável em todas).
- Sem uso de `pt_exceto_incorreta` — ramo inexistente no repo; `pt_crase` cobre INCORRETA (Q5) e "incorreto apenas em" (Q6) mantendo funil.

## Fontes

- **Tier A:** `pt-crase-concursos` — Bechara / Cunha & Cintra (funil de 3 testes + teste ao).
- **Tier B:** `portugues-caderno-2025-2026-q401-600` — caderno interno AVANT (enunciado, alternativas, gabarito).

## Comando de auditoria

```bash
npm run audit:questao-readiness -- --lote=lingua-portuguesa-g01 --strict-v2-pedagogy
```

Saída:
```
[audit:questao-readiness] subtópico="Crase" ready=8/8 (100%)
[audit:questao-readiness] falhas por tier A1=0 A2=0 A3=0
```

Relatório JSON: `artifacts/questao-readiness-audit.json`.

## Próximos passos

1. Piloto humano (A4) em `/estudar/[slug]` para conferir molde pt-crase-funnel.
2. Só depois de "pode aplicar": `npm run catalog:apply-lote -- --lote=lingua-portuguesa-g01 --dry-run` → `--apply`.
3. Pacote Crase não está no registry como pacote de enfermagem — subtópico canônico PT ainda não catalogado no `handcraft-registry.json`; considerar adicionar entrada em pacote Língua Portuguesa quando o programa PT for aberto.
