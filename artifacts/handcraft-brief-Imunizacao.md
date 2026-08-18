# Handcraft briefing — Imunização

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `imunizacao-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `imunizacao` |
| status | applied (575/575 slugs) |
| manifest | `data/catalog-migration/imunizacao-completo/manifest.json` |
| lote_pattern | `imunizacao-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-imunizacao-*.json,examples/questao-premium-decorp-imunizacao-triplice-viral-via.json,examples/questao-premium-fundatec-meningococica-3meses.json,examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json,examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json,examples/questao-premium-avancasp-imunizacao-rede-frio-temperatura.json,examples/questao-premium-agirh-imunizacao-incorreta-antibiotico.json` |
| guideline | `lib/guidelines/pniCalendario.ts` |
| handcraft_meta | `data/catalog-migration/imunizacao-completo/handcraft-meta.json` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **imunizacao_vf_intervalos** — I/II/III/IV, intervalos entre doses, simultaneidade, grace period, reforço × intervalo mínimo · pni-rules-deck · pni-interval-matrix · pni-vf-juggle-tap · pni-trap-chips
    Âncoras: examples/questao-premium-cpcon-imunizacao-intervalos-vf.json
  - **imunizacao_calendario** — Marco idade × vacina, esquema infantil/adolescente/adulto/idoso, gestante/puérpera, HPV, campanha, dose de reforço por faixa etária · vaccine-timeline · pni-calendar-board · pni-calendar-elimination-tap · calendar-mismatch
    Âncoras: examples/questao-premium-fundatec-meningococica-3meses.json, examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json
  - **imunizacao_cadeia_frio** — Cadeia de frio, conservação, refrigeração/congelamento, validade, SI-PNI, caixa térmica, gelo, transporte de imunobiológico · cold-chain-hub · pni-temperature-rail · pni-cold-chain-tap · temperature-mismatch
    Âncoras: examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json, examples/questao-premium-avancasp-imunizacao-rede-frio-temperatura.json
  - **imunizacao_exceto** — Comando EXCETO ou INCORRETA — marcar afirmativa falsa entre condutas corretas · morphological · reference_table · tap · compare semântico
    Âncoras: examples/questao-premium-agirh-imunizacao-incorreta-antibiotico.json
  - **imunizacao_generico** — Técnica de sala/via (6 certos), certo ou errado isolado, tipos de vacina/imunobiológico, contraindicações — sem fit nos ramos acima · genérico morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-decorp-imunizacao-triplice-viral-via.json

## Clusters

- Calendário vacinal — adolescente/adulto/idoso (137 · 23,8% — âncora ADM&TEC cartão perdido)
- Calendário vacinal — infantil (135 · 23,5% — âncora Fundatec 3 meses)
- Cadeia de frio / conservação / SI-PNI (68 · 11,8% — ramo imunizacao_cadeia_frio · âncoras AMEOSC V/F + AVANÇASP 2–8 °C)
- HPV / campanhas e prevenção (46 · 8% — absorver em imunizacao_calendario)
- INCORRETA / EXCETO (42 · 7,3% — imunizacao_exceto · compare semântico · âncora Agirh P2)
- Default — sem âncora temática (41 · 7,1%)
- Gestante / puérpera — vacinação (40 · 7% — imunizacao_calendario)
- Certo ou errado (28 · 4,9% — imunizacao_generico)
- V/F — intervalos PNI I/II/III/IV (18 · 3,1% — âncora CPCON intervalos)
- Técnica de aplicação / sala de vacinação (11 · 1,9% — âncora DECORP SCR)
- Conceito — tipos de vacina / imunobiológicos (8 · 1,4%)
- Contraindicações / eventos adversos (1 · cauda longa)

## Gramática golden-v1 (4 slides)

- **concept_map:** Enquadramento da prova + erro reproduzível nomeado (não resumo PNI)
- **golden_rule:** Decore normativo — rows com faixas, intervalos, vias, marcos
- **logic_flow:** Único lugar com gabarito; reveal_mode tap
- **danger_zone:** Erro reproduzível × correção específica (espelha concept_map)
- Mapa de erros ROI: `data/catalog-migration/imunizacao-pedagogy-errors.json`

## Priorização ROI

| P | Ação | Por quê |
|---|------|---------|
| P0 | Fase 2 — reconcile:handcraft-manifest + catalog:preflight --strict-v2-pedagogy em g01–g83 | Handcraft applied 575/575; gate L1 antes do promote |
| P0 | audit:handcraft-dod + slug-alignment --strict + numeric-factcheck (subtópico inteiro) | L2 + L2b vendável |
| P1 | audit:anchor-review --record-pass em todos g* + L6 checklist | Âncoras P0 fechadas; escalar L6 por lote |
| P1 | test:e2e:visual-molds --grep="PNI Imunização" | 3 ramos bespoke wired (vf · calendário · cadeia frio) |
| P2 | Ramo imunizacao_exceto — gate compare semântico (Agirh) | 42 slugs ok_generico; validar danger_zone por letra |
| P2 | audit:subtopico-quality --promote | Fecha production_ready |

## Golden anchors

- Registry: `data/catalog-migration/imunizacao-golden-anchors.json`
- **imunizacao_vf_intervalos:** `examples/questao-premium-cpcon-imunizacao-intervalos-vf.json`
- **imunizacao_calendario:** `examples/questao-premium-fundatec-meningococica-3meses.json`
- **imunizacao_calendario:** `examples/questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json`
- **imunizacao_cadeia_frio:** `examples/questao-premium-ameosc-imunizacao-vf-cadeia-frio.json`
- **imunizacao_cadeia_frio:** `examples/questao-premium-avancasp-imunizacao-rede-frio-temperatura.json`
- **imunizacao_exceto:** `examples/questao-premium-agirh-imunizacao-incorreta-antibiotico.json`
- **imunizacao_generico:** `examples/questao-premium-decorp-imunizacao-triplice-viral-via.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=imunizacao-completo --subtopico="Imunização" --limit=10000
# Handcraft → data/catalog-migration/imunizacao-g01/questions/*.json
npm run validate:goldens -- --lote=imunizacao-g01 --strict
npm run audit:questao-readiness -- --lote=imunizacao-g01 --strict-v2-pedagogy
npm run audit:slug-alignment -- --lote=imunizacao-g01 --strict
npm run audit:numeric-factcheck -- --lote=imunizacao-g01
npm run catalog:patch-pedagogical-branch -- --lote=imunizacao-g01 --reconcile-branch --apply
npm run test:e2e:visual-molds -- --grep="PNI"
npm run capture:questao-review -- --lote=imunizacao-g01
npm run audit:anchor-review -- --lote=imunizacao-g01 --record-pass --reviewer=<revisor>
npm run catalog:apply-lote -- --lote=imunizacao-g01 --dry-run
# apply SOMENTE se usuário pedir:
npm run catalog:apply-lote -- --lote=imunizacao-g01 --apply
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Imunização" --only-premium --reconcile-branch --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário
