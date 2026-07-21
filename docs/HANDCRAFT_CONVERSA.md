# Handcraft golden-v1 — prompt de conversa

Use em **conversa nova** de uma destas formas:

```text
Handcraft: Enfermagem em Central de Material e Esterilização (CME)
```

**Uma questão** (reparo pontual):

```text
Handcraft: Doenças Respiratórias Crônicas (Asma, DPOC)
Slug: objetiva-concursos-enfermagem-semiologia-em-enfermagem-1779563549311-1
```

O trigger curto `Handcraft:` expande automaticamente o briefing completo via playbook (`lib/catalogMigration/handcraftPlaybook.ts`). O JSON do playbook define **comandos pós-handcraft** (`after_handcraft`), **primeiro lote** (`first_lote`), **validação** (`validation`) e **proibições** (`proibido`) — ver schema em [`handcraft-playbooks/README.md`](../data/catalog-migration/handcraft-playbooks/README.md#schema-operacional-renderizado-no-briefing).

**Passo 0 obrigatório (agente):** gerar e seguir o briefing antes de handcraft em massa:

```bash
npm run handcraft:brief -- --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)"
```

O bloco `## Pipeline (executar)` do briefing **substitui** o pipeline genérico deste doc quando o playbook define `after_handcraft`.

Ou anexe este arquivo (`@docs/HANDCRAFT_CONVERSA.md`) — equivalente a escrever `Handcraft: <subtópico>` — e edite **só** a linha abaixo:

```text
Handcraft: Enfermagem em Central de Material e Esterilização (CME)
```

**Decisão de produto:** único trilho de produção = handcraft golden-v1 por slug. Ver [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md).

### Variantes do trigger

| Trigger | Quando |
|---------|--------|
| `Handcraft: <subtópico>` | Pacote novo ou continuação de lotes gNN |
| `Handcraft: <subtópico>` + linha `Slug: …` | Reparo pontual de uma questão (`single_slug`) |
| Anexar `@docs/HANDCRAFT_CONVERSA.md` + subtópico na linha `Handcraft:` | Mesmo que trigger curto |
| `Pipeline completo: <subtópico>` + `Só handcraft` | Handcraft até `applied`; não promover vendável |

**Não suportado no parser:** `Handcraft: <subtópico> gNN` — o lote se descobre via registry / `lote-meta.json`, não no trigger. Modos repair (`subtopico_repair_l3`, etc.) vêm do `scope_default` do playbook ou `--mode=` no CLI.

Subtópicos em `legacy_builder_subtopicos` no registry exigem **re-handcraft** golden-v1 (não usar saída de builder).

**Pré-requisito (obrigatório):** antes do **1º lote** handcraft, rodar inventário + gate de taxonomia:

```bash
npm run audit:subtopico-inventory -- --subtopico="<Nome canônico exato>"
npm run audit:taxonomy-gate -- --subtopico="<Nome canônico exato>"
```

Só iniciar handcraft quando `audit:taxonomy-gate` retornar `gate=pass` ou `gate=warn` com `handcraft_allowed=true`. Se `gate=block`, use `Classify: <subtópico>` — [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md). Buckets catch-all: ver política A/B em [`TAXONOMIA_MODEL.md`](TAXONOMIA_MODEL.md) §6.

**Obrigatório antes do 1º lote** (subtópico novo ou re-handcraft): `Mapeamento L3: <subtópico>` com **Fase 3b** concluída — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md).

**GATE handcraft (ramos fortes):** para cada `pedagogical_branch` com volume ≥5 slugs ou ≥10%, deve existir `artifacts/l3-brief-<pacote>-<branch_id>.md` (brief 4/4 via [`PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md)). Calibração: [`artifacts/l3-brief-FLAGSHIP-INDEX.md`](../artifacts/l3-brief-FLAGSHIP-INDEX.md). Template mínimo: [`L3_BRIEF_TEMPLATE.md`](L3_BRIEF_TEMPLATE.md). **Cauda longa** (`ok_generico`) não exige brief. Quick ref: [`RAMO_FORTE_QUICK_REF.md`](RAMO_FORTE_QUICK_REF.md).

**GATE âncoras (antes do g01):** `npm run audit:golden-anchor-gate -- --subtopico="..."`. Se `gate=block` → `Criar âncoras: <subtópico>` (skill `avant-golden-anchor-bootstrap`) até `handcraft_allowed=true`. Ver [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) § Fase 1 — Golden âncora.

**Anexos recomendados (1º lote / ramo forte — TE):** `@docs/RAMO_FORTE_QUICK_REF.md` · `@docs/L3_MAPEAMENTO_CONVERSA.md` · `@data/catalog-migration/handcraft-registry.json` · `@.cursor/skills/brief-enfermagem/SKILL.md`

**Anexos recomendados (Língua Portuguesa):** `@.cursor/skills/brief-lingua-portuguesa/SKILL.md` · `@.cursor/skills/professor-elias-santana-metodo/SKILL.md` · `@docs/LINGUA_PORTUGUESA_ELIAS_METODO.md`

**Recomendado** se o subtópico já tem cluster/L3 audit antigo: re-rodar `Mapeamento L3:` para classificar moldes legados como `molde_redesign`.

---

## Instruções para o agente (não pedir confirmação — executar)

O usuário informou o subtópico. **Modo fixo:** handcraft golden-v1 por slug.

### Proibido

- `npm run ai:generate`
- `npm run catalog:upgrade-premium`
- `catalog:apply-lote --apply` sem o usuário escrever explicitamente **pode aplicar** (ou equivalente claro: “aplicar”, “apply no Supabase”)

Se o playbook do subtópico tiver `proibido[]`, o briefing (`handcraft:brief`) lista os mesmos itens — pode incluir entradas extras além desta lista global.

### Resolver pacote

1. Ler [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json).
2. Match **exato** do subtópico (nome canônico `CLAUDE.md` §9).
3. Carregar **playbook** (`handcraft_playbook` ou `handcraft-playbooks/<pacote_prefix>.json`) — ver [`handcraft-playbooks/README.md`](../data/catalog-migration/handcraft-playbooks/README.md).
4. Se não existir pacote: seguir `fallback_novo_pacote` no registry (export + criar entrada + handcraft em lotes).
5. **Executar o pipeline do briefing** — priorizar `modes[mode].after_handcraft`, `first_lote` e `validation` do playbook sobre comandos genéricos deste doc quando divergirem.

### Antes do g01 (Fase 0 — pacote novo)

Seguir [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) § Fase 0 + 1b:

```bash
npm run catalog:export-lote -- --lote=<pacote_prefix>-completo --subtopico="<Nome canônico exato>" --limit=10000
# Se cluster_command no registry:
npm run cluster:<pacote_prefix>
```

- Contar slugs em `data/catalog-migration/<pacote_prefix>-completo/manifest.json`.
- Ler `cluster_report` / `artifacts/<pacote>-topic-cluster-report.json` — priorizar ramos `novo_ramo` / `molde_redesign`.
- Criar entrada no registry se ausente (`lote_pattern`, `lote_size: 8`, `production_status: none`).

### Ler antes de handcraft

| Arquivo | Quando |
|---------|--------|
| [`docs/GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | Sempre |
| [`docs/GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) | Sempre |
| [`docs/MOLD_AFFINITY_RESOLVER.md`](MOLD_AFFINITY_RESOLVER.md) | Subtópico com ramos L3 (tabela P0–P2) |
| [`examples/_TEMPLATE-golden-v1.json`](../examples/_TEMPLATE-golden-v1.json) | Sempre |
| `readme` do pacote no registry | Se existir |
| `anchor_glob` + `golden_anchors_registry` do playbook | Estilo do ramo |
| `guideline` do playbook (`lib/guidelines/*.ts`) | Norma tier A do pacote |
| `playbook.validation` | Comandos por slug/lote (enrich, L2, L6, A4) |
| `handcraft_meta` do pacote | Progresso e decisões por cluster |
| [`docs/L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md) + `artifacts/l3-brief-*.md` | 1º lote — ramos fortes |
| [`docs/PROMPT_VARIANTES_NEUROSLIDES.md`](PROMPT_VARIANTES_NEUROSLIDES.md) | Se brief do ramo ainda não existe |
| `cluster_report` | Se existir — priorizar ramos `novo_ramo` / `molde_redesign` |
| Último `lote-meta.json` com maior NN | Continuar de onde parou |

### Ordem dos NeuroSlides (v2 — padrão handcraft novo)

| # | `type` | Papel |
|---|--------|--------|
| 1 | `concept_map` | Enquadramento — **sem** gabarito/letra |
| 2 | `logic_flow` | Eliminação + gabarito (`reveal_mode: "tap"`) |
| 3 | `golden_rule` | Decore/norma — **sem** row “Gabarito letra X” |
| 4 | `danger_zone` | Pegadinhas + transferência |

Detalhe: [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md) §2 · implementação [`lib/reverseStudySlideOrder.ts`](../lib/reverseStudySlideOrder.ts). Catálogo legado pode ter ordem antiga no JSON — o player normaliza; **conteúdo novo** grava na ordem v2.

### Descobrir próximo lote

1. Listar `data/catalog-migration/<pacote_prefix>-g*/lote-meta.json` (ou `saude-mental-micro-*-goldens`).
2. Último com `status: applied` → próximo lote = NN+1.
3. Lote em aberto (JSONs prontos, `status` ≠ `applied`) → continuar o mesmo `gNN`.
4. Se nenhum lote: criar `<pacote_prefix>-g01` com primeiros N slugs do `manifest` (`lote_size` no registry).
5. Se pacote `status: applied`: perguntar se é reparo pontual ou novo subtópico.

### Pipeline por lote (repetir até esgotar manifest)

> **Hierarquia:** (1) `npm run handcraft:brief` → bloco `## Pipeline (executar)`; (2) `playbook.validation` + `after_handcraft`; (3) fallback genérico abaixo.

```bash
npm run handcraft:brief -- --subtopico="<Nome canônico exato>"
# Executar literalmente o bash do briefing (after_handcraft do playbook)

# --- Fallback genérico (só se playbook sem after_handcraft) ---
npm run catalog:export-lote -- --lote=<lote> --slugs=...
# handcraft: data/catalog-migration/<lote>/questions/<slug>.json
# Por slug: avant-classify-family → avant-golden-anchor-handcraft + meta.pedagogical_branch (avant-json-template § L2.5+L3)
npm run validate:goldens -- --lote=<lote> --strict
npm run audit:questao-readiness -- --lote=<lote> --strict-v2-pedagogy
# Se enunciado referencia figura/tirinha/charge: inventário + upload/transcrição antes do apply
npm run figures:audit -- --subtopico="<Nome canônico>"   # 0 missing
npm run catalog:apply-lote -- --lote=<lote> --dry-run
# apply SOMENTE após o usuário escrever "pode aplicar":
npm run catalog:apply-lote -- --lote=<lote> --apply
```

Usar **`npm run`** no Windows (não `npx tsx`).

**Scripts `handcraft:<pacote>-gNN`:** se existir no `package.json` para o lote, pode ser referência ou seed — o padrão de produção é JSON golden-v1 em `data/catalog-migration/<lote>/questions/` validado com `audit:questao-readiness` → `[READY]`.

### Piloto no player (A4 — antes do apply)

Por lote, abrir **2–3 slugs** em `/estudar/[slug]` (ou `artifacts/<lote>-links.html`):

- Enunciado ↔ slides; gabarito ↔ `logic_flow` / `danger_zone.correct`
- Sem vocabulário de outro ramo (gate `detectSlideTopicDrift`)
- Se playbook tiver `a4_minimo` / `stamp:*-a4-minimo`, seguir protocolo do pacote

Ver [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) § Fase 4.

### Pós-apply (por lote)

Após `catalog:apply-lote --apply` bem-sucedido:

1. Atualizar `data/catalog-migration/<lote>/lote-meta.json` → `status: applied`
2. Incrementar `handcraft_applied` no pacote em `handcraft-registry.json`
3. Quando `handcraft_applied === total_slugs` → `status: applied` no registry
4. Relatório: `artifacts/catalog-migration-<lote>-applied.json`

### Contrato JSON (resumo)

- `meta.content_standard: "golden-v1"` + `family` + `content_review` + `sources[]` (`year` numérico)
- **`meta.pedagogical_branch`** — obrigatório quando o subtópico tem ramos L3 (`BRANCH_DESIGN_MAP`); tabela completa na skill `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3
- 4 slides planos na **ordem canônica v2** (tabela acima)
- `concept_map`: sem gabarito/letra; `logic_flow`: eliminação + gabarito (`reveal_mode: "tap"`); `golden_rule`: decore sem row de gabarito
- sem `template` / `layout_variant`
- `danger_zone.items[].correct`: **distinto** por distrator; EXCETO/INCORRETA conforme regra do pacote premium
- Conteúdo alinhado ao **pacote L3 do ramo** (bespoke vs genérico) — não copiar moldes de outro cluster

### Handcraft por slug (A1+A2+A3 num prompt)

1. Ler export do slug (enunciado + gabarito reais).
2. Classificar **família** — skill `.cursor/skills/avant-classify-family/SKILL.md` → gravar `meta.family`.
3. Identificar **ramo** (`pedagogical_branch`) pelo cluster/enunciado.
4. Abrir golden âncora da família/ramo em `examples/`, `golden_anchors_registry` ou `*-golden-anchors.json` — skill `.cursor/skills/avant-golden-anchor-handcraft/SKILL.md`.
5. Se playbook tiver `guideline`, alinhar doses/condutas à fonte tier A.
6. Gerar JSON com L1+L2+L3 declarados (`logic_flow` primeiro na autoria).
7. Validar:
   ```bash
   npm run audit:questao-readiness -- --file=data/catalog-migration/<lote>/questions/<slug>.json --strict-v2-pedagogy
   ```
8. Corrigir até `[READY]`; só então incluir no lote para `validate:goldens --strict`.

### Entregáveis por lote

- JSONs handcraft em `questions/` (cada um com `pedagogical_branch` quando aplicável)
- `lote-meta.json` (modelo: `cme-g01/lote-meta.json` ou `perioperatoria-g01/lote-meta.json`)
- `artifacts/<lote>-links.html` (opcional, para revisão no player)
- Resumo: slugs feitos, gabaritos, **audit:questao-readiness OK**, validate strict OK, dry-run OK, piloto A4 (se feito)

### Checkpoint por lote (reportar ao usuário)

| Campo | Esperado |
|-------|----------|
| Lote | `gNN` aplicado ou pronto para apply |
| Slugs no lote | N = `lote_size` (ou restante do manifest) |
| `[READY]` | 100% dos slugs do lote |
| `validate:goldens --strict` | PASS |
| `dry-run` | PASS |
| `handcraft_applied` / `total_slugs` | progresso no registry |
| Blockers | listar se algum gate falhou |

### Referência de pacote fechado

[`data/catalog-migration/perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md) — nota: JSON legado pode ter ordem de slides antiga; handcraft novo segue ordem v2.

### Próximo passo — vendável

Quando `handcraft_applied === total_slugs` e `status: applied`:

**Conversa nova (só qualidade):**

```text
Qualidade vendável: <mesmo subtópico canônico>
```

**Mesma conversa (handcraft + qualidade + promote):**

```text
Pipeline completo: <mesmo subtópico canônico>
```

Ver [`QUALITY_VENDAVEL_CONVERSA.md`](QUALITY_VENDAVEL_CONVERSA.md), [`PIPELINE_COMPLETO_CONVERSA.md`](PIPELINE_COMPLETO_CONVERSA.md) e ADR [`DECISAO_QUALITY_HIBRIDA.md`](DECISAO_QUALITY_HIBRIDA.md).
