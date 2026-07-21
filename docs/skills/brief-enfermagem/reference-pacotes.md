# Referência — Pacotes × briefs L3 (Enfermagem)

Complemento de `brief-enfermagem`.  
**Não** duplica metáforas — aponta playbook, registry e briefs já gravados.

Se divergir: **vence** `handcraft-registry.json` + playbook do pacote + relatório de Mapeamento L3.

---

## Como resolver um subtópico

1. Nome canônico (CLAUDE.md §9) → entrada em `data/catalog-migration/handcraft-registry.json`.
2. Ler `pacote_prefix`, `handcraft_playbook`, `l3_brief_index` (se houver).
3. Playbook: `pedagogical_branches[]` → `id`, `l3_decision`, `bespoke_target`, `mold`.
4. Briefs: `artifacts/l3-brief-<pacote_prefix>-*` e INDEX.
5. Modo B só se `molde_redesign` | `molde_inedito` (ou pedido `Brief TE:`).

```bash
npm run handcraft:brief -- --subtopico="<Nome canônico>"
npm run audit:l3-mold-gap -- --from-supabase --subtopico="<Nome canônico>"
```

---

## Playbooks no repo

| Playbook | Subtópico (típico) |
|----------|-------------------|
| `vias-de-administracao.json` | Vias de Administração |
| `imunizacao.json` | Imunização |
| `farmacodinamica-e-farmacocinetica.json` | Farmacodinâmica e Farmacocinética |
| `calculo-de-administracao-de-medicamentos-e-infusoes.json` | Cálculo de Administração… |
| `cuidados-na-administracao-de-medicamentos.json` | Cuidados na Administração… |
| `curativos-e-manejo-de-feridas.json` | Curativos e Manejo de Feridas |
| `puncao-venosa-e-cuidados-com-cateteres.json` | Punção Venosa e Cuidados com Cateteres |
| `sinais-vitais.json` | Verificação de Sinais Vitais |
| `urgencias-e-emergencias.json` | Urgências e Emergências |
| `processo-de-enfermagem.json` | Processo de Enfermagem |
| `perioperatoria.json` | Assistência Perioperatória… |
| `respiratorio-cronico.json` | Doenças Respiratórias Crônicas… |
| `saude-da-crianca.json` | Saúde da Criança |
| `saude-da-mulher.json` | Saúde da Mulher |
| `promocao-a-saude-e-prevencao-de-agravos.json` | Promoção à Saúde e Prevenção de Agravos |
| `_default.json` | Fallback se não houver playbook dedicado |

Path: `data/catalog-migration/handcraft-playbooks/`.

**Saúde do Adolescente** e outros pacotes podem estar só no registry (`readme` / `completo/`) — abrir a entrada do registry e o INDEX de briefs.

---

## Índices / briefs flagship (exemplos)

Paths podem variar (`INDEX` vs `index`). Confirmar no disco antes de editar.

| Pacote | Índice / docs úteis |
|--------|---------------------|
| **Calibração (3 briefs)** | [`artifacts/l3-brief-FLAGSHIP-INDEX.md`](../../../artifacts/l3-brief-FLAGSHIP-INDEX.md) |
| Saúde do Adolescente | `artifacts/l3-brief-saude-adolescente-INDEX.md` · brief ética/sigilo flagship |
| Farmacodinâmica | `artifacts/l3-brief-farmacodinamica-e-farmacocinetica-INDEX.md` · `artifacts/farmacodinamica-nota10-report.md` |
| Cálculo | `artifacts/l3-brief-calculo-de-administracao-de-medicamentos-e-infusoes-INDEX.md` |
| Respiratório crônico | `artifacts/l3-brief-respiratorio-cronico-INDEX.md` |
| História da Enfermagem | `artifacts/l3-brief-historia-enfermagem-INDEX.md` |
| Punção | README completo do pacote + briefs `puncao_*` |
| Vias | briefs + playbook; moldes absorption-speed-rail no código |
| Imunização | playbook `imunizacao.json` · moldes PNI wired · **applied 575/575** · **`production_ready`** |
| Promoção à Saúde | playbook `promocao-a-saude-e-prevencao-de-agravos.json` · `sus-art4-orbit` wired · **0/130** · `none` |

Arquivo por ramo:

```text
artifacts/l3-brief-<pacote_prefix>-<branch_id>.md
```

---

## Ramos Adolescente (referência rápida)

Fonte: `docs/MOLD_AFFINITY_RESOLVER.md` (pode evoluir).

| `branch_id` | Bespoke (exemplos) | Nota |
|-------------|-------------------|------|
| `adolescente_etica_sigilo` | `adolescent-privacy-curtain` · spectrum · vf-weave · consent-gate | bespoke forte |
| `adolescente_antropometria` | growth-z-rail · z-band · z-classify · z-threshold | só corpus escore Z |
| `adolescente_desenvolvimento` | genérico premium | ok_generico típico |
| `adolescente_saude_mental` | genérico premium | |
| `adolescente_violencia_protecao` | genérico premium | |
| `adolescente_generico` | genérico premium | |

Sempre confirmar no INDEX + playbook/registry antes do Modo B.

---

## Ramos Imunização (referência rápida)

Fonte: `handcraft-playbooks/imunizacao.json` + `lib/slides/pedagogicalBranch.ts`.

| `branch_id` | `l3_decision` | Bespoke / molde | Nota |
|-------------|---------------|-----------------|------|
| `imunizacao_vf_intervalos` | `molde_redesign` | `pni-rules-deck` · `pni-interval-matrix` · `pni-vf-juggle-tap` · `pni-trap-chips` | ~3% volume · âncora CPCON intervalos |
| `imunizacao_calendario` | `molde_redesign` | `vaccine-timeline` · `pni-calendar-board` · `pni-calendar-elimination-tap` | ~62% volume · Fundatec + ADM&TEC |
| `imunizacao_cadeia_frio` | `molde_redesign` | `cold-chain-hub` · `pni-temperature-rail` · `pni-cold-chain-tap` | ~12% · AMEOSC V/F + AVANÇASP |
| `imunizacao_exceto` | `ok_generico` | morphological · reference_table · tap · compare | EXCETO semântico · gate Agirh |
| `imunizacao_generico` | `cauda_longa` | genérico premium | técnica sala · C/E · tipos vacina |

**Status pacote:** `applied` 575/575 · **`production_ready`** (2026-07-19) · health: `audit:subtopico-health`.  
Briefs formais `artifacts/l3-brief-imunizacao-*` **não** existem — moldes já wired; Modo B só se redesign.

---

## Ramos Promoção à Saúde (referência rápida)

Fonte: `handcraft-playbooks/promocao-a-saude-e-prevencao-de-agravos.json` + `artifacts/l3-brief-promocao-a-saude-e-prevencao-de-agravos-INDEX.md`.

| `branch_id` | `l3_decision` | Bespoke / molde | Nota |
|-------------|---------------|-----------------|------|
| `promocao_art4_composicao` | `molde_redesign` | `sus-art4-orbit` · `center` · `cards` · `scope-trap` | Lei 8.080 Art. 4º · **React wired** · brief formal |
| `promocao_principios_direitos` | `ok_generico` | morphological · reference_table · tap · compare | CF / princípios SUS |
| `promocao_educacao_prevencao` | `ok_generico` | morphological · reference_table · tap · compare | educação em saúde · prevenção |
| `promocao_generico` | `cauda_longa` | genérico premium | fallback subtópico |

**Status pacote:** `none` · 8/110 handcraft · manifest `promocao-a-saude-e-prevencao-de-agravos-completo` · cluster 2026-07-20.

---

## Universos L3 × famílias de prova (atalho)

| `meta.family` | Reforço visual típico |
|---------------|----------------------|
| `protocolo` | rail / tap-flow / deck |
| `calc` | board numérico + unidade em destaque |
| `vf` | juggle-tap; julgar I/II/III antes de combinar |
| `certo_errado` / EXCETO | arena / spectrum / trap |
| `legis` | orbit / board de artigos |
| `conceito` | morphological + rows |
| `text_fragment` | âncora do caso no concept_map |

Detalhe de formatos: `@docs/PROMPT_VARIANTES_NEUROSLIDES.md`.

---

## Português

Não usar esta skill.  
→ `.cursor/skills/brief-lingua-portuguesa/`
