# Handcraft briefing — Urgências e Emergências

**Modo automático** (trigger `Handcraft:`). Executar sem pedir confirmação de modo.

## Escopo

- **Subtópico inteiro** — handcraft golden-v1 A1+A2+A3
- **Primeiro lote:** `urgencias-g01`

## Pacote (registry)

| Campo | Valor |
|-------|-------|
| pacote_prefix | `urgencias-e-emergencias` |
| status | in_progress (16/340 slugs) |
| manifest | `data/catalog-migration/urgencias-e-emergencias-completo/manifest.json` |
| lote_pattern | `urgencias-e-emergencias-g{NN}` |
| lote_size | 8 |
| anchor_glob | `examples/questao-premium-*-urgencias-*.json` |
| guideline | `lib/guidelines/urgencias.ts` |

## Proibido (playbook)

- `ai:generate`
- `catalog:upgrade-premium`

## Ramos L3 (pedagogical_branch)

  - **urgencias_rcp_sbv** — RCP adulto, SBV, DEA, parâmetros AHA (30:2 · 100–120 · 5–6 cm · pulso ~2 min), V/F I–III, sequência V/F linha · urgencias-rcp-chain-deck · urgencias-rcp-params-board · urgencias-rcp-tap-flow · urgencias-rcp-trap-arena (brief L3 pronto — molde_redesign)
    Âncoras: examples/questao-premium-admtec-urgencias-rcp-30-2-aha2020.json, examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json, examples/questao-premium-urgencias-rcp.json
  - **urgencias_exceto_conduta** — Comando EXCETO ou INCORRETA — cada distrator explica conduta correta; só gabarito aponta exceção · morphological · reference_table · tap · compare semântico
    Âncoras: examples/questao-premium-admtec-urgencias-fratura-exposta-imobilizacao.json
  - **urgencias_avc_iam** — Cincinnati/FAST, face·braço·fala, acionar 192; pegadinhas Glasgow, IAM, SSVV, meníngea · morphological · reference_table · tap · compare (genérico até brief bespoke)
    Âncoras: examples/questao-premium-amauc-urgencias-cincinnati-avc.json
  - **urgencias_xabcde_trauma** — XABCDE, hemorragia, torniquete, imobilização, queimadura no trauma, BT16 esmagamento · urgencias-xabcde-rail · urgencias-trauma-reference-board · urgencias-xabcde-tap-flow · urgencias-trauma-trap-arena (proposto)
    Âncoras: examples/questao-premium-ameosc-urgencias-trauma-queimadura.json, examples/questao-premium-selecon-urgencias-bt16-esmagamento.json, examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json
  - **urgencias_choque** — Choque elétrico (segurança cena), hipovolêmico/cardiogênico/distributivo, hipoperfusão · morphological · reference_table · tap · compare (genérico)
    Âncoras: examples/questao-premium-admtec-urgencias-choque-eletrico.json, examples/questao-premium-fepese-urgencias-choque-hipovolemico.json
  - **urgencias_engasgo** — Sinal universal, Heimlich consciente, OVACE, lactente/criança/adulto · morphological · reference_table · tap · compare (genérico)
    Âncoras: examples/questao-premium-fau-unicentro-urgencias-engasgo-sinal-universal.json
  - **urgencias_rcp_pediatrico** — RCP pediátrica 15:2, profundidade ~⅓ AP, causas respiratória/choque, não lógica cardíaca do adulto · morphological · reference_table · tap · compare (genérico)
    Âncoras: examples/questao-premium-access-urgencias-rcp-pediatrica-15-2.json, examples/questao-premium-consulpam-urgencias-pcr-pediatrica-conceito.json
  - **urgencias_vf_protocolo** — V/F I–IV combinatório, sequência linha V,F,V,F, julgar itens antes de cruzar A–D · morphological · reference_table · tap · compare (genérico)
    Âncoras: examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json, examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json
  - **urgencias_convulsao** — Crise epiléptica — proteger cabeça, não objetos na boca, não imobilizar, PLS após · morphological · reference_table · tap · compare (genérico)
    Âncoras: examples/questao-premium-admtec-urgencias-convulsao-crise.json
  - **urgencias_manchester_triagem** — Etiquetas coloridas, Manchester, vermelho=emergência, inversão azul×instabilidade · urgencias-manchester-spectrum · urgencias-manchester-board · cards · urgencias-manchester-trap (proposto)
    Âncoras: examples/questao-premium-ameosc-urgencias-triagem-etiquetas.json
  - **urgencias_anafilaxia** — Anafilaxia — epinefrina IM coxa imediata; IV só PCR/choque refratário; asserções CPCON I/II · morphological · reference_table · tap · compare (genérico)
    Âncoras: examples/questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json
  - **urgencias_queimadura** — Primeiro socorro queimadura — água corrente; vetar pasta/manteiga/gelo; V/F primeiros socorros · morphological · reference_table · tap · compare (genérico)
    Âncoras: examples/questao-premium-ameosc-urgencias-queimadura-vf-primeiros-socorros.json
  - **urgencias_generico** — Default, conceito geral, certo/errado, drift residual — sem fit nos ramos acima; sem vazar IPCS/CVC sem âncora · genérico morphological · reference_table · tap · compare
    Âncoras: examples/questao-premium-admtec-urgencias-rcp-30-2-aha2020.json, examples/questao-premium-amauc-urgencias-cincinnati-avc.json

## Clusters

- RCP / SBV adulto (V/F ou protocolo) (68 · 20% — ramo urgencias_rcp_sbv · âncoras ADM&TEC AHA MCQ + AMEOSC V/F + CPCON I–III)
- Default — sem âncora temática (63 · 18,5% — absorver em urgencias_generico)
- Urgências — conceito geral (45 · 13,2% — urgencias_generico)
- Certo ou errado (32 · 9,4% — urgencias_generico)
- AVC / IAM — reconhecimento (23 · 6,8% — urgencias_avc_iam · âncora AMAUC Cincinnati)
- EXCETO / INCORRETA — conduta (22 · 6,5% — urgencias_exceto_conduta · âncora ADM&TEC fratura exposta)
- XABCDE / trauma e hemorragia (22 · 6,5% — urgencias_xabcde_trauma · âncoras AMEOSC MCQ + BT16 + V/F imobilização)
- Choque / hipoperfusão (18 · 5,3% — urgencias_choque · âncoras elétrico + FEPESE hipovolêmico)
- Engasgo / obstrução de via aérea (12 · 3,5% — urgencias_engasgo · âncora FAU sinal universal)
- RCP pediátrica / lactente (9 · 2,6% — urgencias_rcp_pediatrico · âncoras Access 15:2 + Consulpam conceito)
- V/F — protocolos I/II/III (8 · 2,4% — urgencias_vf_protocolo · âncora AMEOSC I–IV)
- Convulsão / crise epiléptica (7 · 2,1% — urgencias_convulsao · âncora ADM&TEC)
- Drift taxonômico — reclassificar (5 · 1,5% — Classify antes de handcraft)
- Manchester / triagem de risco (4 · 1,2% — urgencias_manchester_triagem · âncora AMEOSC etiquetas)
- Anafilaxia / epinefrina (1 · 0,3% — urgencias_anafilaxia · âncora CPCON UEPB IM — slug cluster era drift)
- Queimadura — primeiro socorro (1 · 0,3% — urgencias_queimadura · âncora AMEOSC V/F — slug cluster era drift)

## Gramática golden-v1 (4 slides)

- **concept_map:** Enquadramento da prova + erro reproduzível nomeado (não resumo SBV genérico); sem letra gabarito
- **golden_rule:** Decore normativo — rows com parâmetros RCP, XABCDE, faixas; sem row Gabarito letra X
- **logic_flow:** Único lugar com gabarito; reveal_mode tap; estratégia — não copiar texto das alternativas
- **danger_zone:** Pegadinha × correção por letra (compare); EXCETO: distratores = conduta correta; sem duplicar justificativa
- Mapa de erros ROI: `data/catalog-migration/urgencias-pedagogy-errors.json`

## Priorização ROI

| P | Ação | Por quê |
|---|------|---------|
| P0 | Handcraft urgencias-g01+ ramo urgencias_rcp_sbv (68 slugs) | 20% do volume; brief L3 molde_redesign pronto; maior ROI |
| P0 | audit:slug-alignment --strict + urgenciasPedagogy em todo lote | Evita reciclagem, drift de ramo e compare vazio |
| P0 | audit:numeric-factcheck — evitar literais não cobertos pela guideline (ex. 5 min, 20 min) | L2b MS/SAMU; pegadinha numérica #1 em RCP e queimadura |
| P1 | Lotes urgencias_exceto_conduta + urgencias_avc_iam + urgencias_xabcde_trauma | ~20% combinado; âncoras READY aplicadas |
| P1 | Brief L3 4/4 faltantes (exceto RCP): xabcde, manchester, vf_protocolo | Moldes ainda propostos — implementar antes de escalar player |
| P2 | Cauda urgencias_generico (145 slugs) com regra de absorção por família | 43% do catálogo — handcraft após ramos fortes |
| P2 | Classify: drift taxonômico (5 slugs) + test:e2e:visual-molds Urgencias + audit:subtopico-quality --promote | Fecha vendável L3–L6 |

## Golden anchors

- Registry: `data/catalog-migration/urgencias-golden-anchors.json`
- **urgencias_rcp_sbv:** `examples/questao-premium-admtec-urgencias-rcp-30-2-aha2020.json`
- **urgencias_rcp_sbv:** `examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json`
- **urgencias_rcp_sbv:** `examples/questao-premium-urgencias-rcp.json`
- **urgencias_exceto_conduta:** `examples/questao-premium-admtec-urgencias-fratura-exposta-imobilizacao.json`
- **urgencias_avc_iam:** `examples/questao-premium-amauc-urgencias-cincinnati-avc.json`
- **urgencias_xabcde_trauma:** `examples/questao-premium-ameosc-urgencias-trauma-queimadura.json`
- **urgencias_xabcde_trauma:** `examples/questao-premium-selecon-urgencias-bt16-esmagamento.json`
- **urgencias_xabcde_trauma:** `examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json`
- **urgencias_choque:** `examples/questao-premium-admtec-urgencias-choque-eletrico.json`
- **urgencias_choque:** `examples/questao-premium-fepese-urgencias-choque-hipovolemico.json`
- **urgencias_engasgo:** `examples/questao-premium-fau-unicentro-urgencias-engasgo-sinal-universal.json`
- **urgencias_rcp_pediatrico:** `examples/questao-premium-access-urgencias-rcp-pediatrica-15-2.json`
- **urgencias_rcp_pediatrico:** `examples/questao-premium-consulpam-urgencias-pcr-pediatrica-conceito.json`
- **urgencias_vf_protocolo:** `examples/questao-premium-ameosc-urgencias-trauma-imobilizacao-vf.json`
- **urgencias_vf_protocolo:** `examples/questao-premium-ameosc-urgencias-rcp-vf-adulto.json`
- **urgencias_convulsao:** `examples/questao-premium-admtec-urgencias-convulsao-crise.json`
- **urgencias_manchester_triagem:** `examples/questao-premium-ameosc-urgencias-triagem-etiquetas.json`
- **urgencias_anafilaxia:** `examples/questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json`
- **urgencias_queimadura:** `examples/questao-premium-ameosc-urgencias-queimadura-vf-primeiros-socorros.json`
- **urgencias_generico:** `examples/questao-premium-admtec-urgencias-rcp-30-2-aha2020.json`
- **urgencias_generico:** `examples/questao-premium-amauc-urgencias-cincinnati-avc.json`

## Pipeline (executar)

1. Ler `docs/HANDCRAFT_CONVERSA.md`, `docs/GOLDEN_HANDCRAFT_MODEL.md`, skill `avant-json-template` § L2.5+L3.
2. Ler `handcraft_meta` e 1–2 âncoras do ramo de cada slug.
3. Handcraft: `meta.content_standard: golden-v1` + `family` + `pedagogical_branch` + 4 slides planos.
4. **Proibido:** `ai:generate`, `catalog:upgrade-premium`.

```bash
npm run catalog:export-lote -- --lote=urgencias-e-emergencias-completo --subtopico="Urgências e Emergências" --limit=10000
# Handcraft → data/catalog-migration/urgencias-g01/questions/*.json
npm run validate:goldens -- --lote=urgencias-g01 --strict
npm run audit:questao-readiness -- --lote=urgencias-g01 --strict-v2-pedagogy
npm run audit:slug-alignment -- --lote=urgencias-g01 --strict
npm run audit:numeric-factcheck -- --lote=urgencias-g01
npm run catalog:patch-pedagogical-branch -- --lote=urgencias-g01 --reconcile-branch --apply
npm run capture:questao-review -- --lote=urgencias-g01
npm run audit:anchor-review -- --lote=urgencias-g01 --record-pass --reviewer=<revisor>
npm run catalog:apply-lote -- --lote=urgencias-g01 --dry-run
# apply SOMENTE se usuário pedir:
npm run catalog:apply-lote -- --lote=urgencias-g01 --apply
npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico="Urgências e Emergências" --only-premium --reconcile-branch --apply
```

## Critério de pronto (automático)

- `audit:questao-readiness` → `[READY]` por slug (strict-v2-pedagogy obrigatório)
- A4 (piloto `/estudar/[slug]`) — usuário
