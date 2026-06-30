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

O trigger curto `Handcraft:` expande automaticamente o briefing completo via playbook (`lib/catalogMigration/handcraftPlaybook.ts`). Pré-visualizar:

```bash
npm run handcraft:brief -- --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)"
```

ou anexe este arquivo (`@docs/HANDCRAFT_CONVERSA.md`) após editar **só** a linha abaixo:

```text
SUBTÓPICO: Enfermagem em Central de Material e Esterilização (CME)
```

**Decisão de produto:** único trilho de produção = handcraft golden-v1 por slug. Ver [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md).

**Pré-requisito:** subtópico estável (taxonomia). Se o bucket ainda tem drift, use `Classify: <subtópico>` — [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md).

**Recomendado antes do 1º lote** (subtópico novo ou sem cluster/L3 audit): `Mapeamento L3: <subtópico>` — [`L3_MAPEAMENTO_CONVERSA.md`](L3_MAPEAMENTO_CONVERSA.md).

---

## Instruções para o agente (não pedir confirmação — executar)

O usuário informou o subtópico. **Modo fixo:** handcraft golden-v1 por slug.

### Proibido

- `npm run ai:generate`
- `npm run catalog:upgrade-premium`
- `catalog:apply-lote --apply` sem o usuário pedir explicitamente

### Resolver pacote

1. Ler [`data/catalog-migration/handcraft-registry.json`](../data/catalog-migration/handcraft-registry.json).
2. Match **exato** do subtópico (nome canônico `CLAUDE.md` §9).
3. Carregar **playbook** (`handcraft_playbook` ou `handcraft-playbooks/<pacote_prefix>.json`) — ver [`handcraft-playbooks/README.md`](../data/catalog-migration/handcraft-playbooks/README.md).
4. Se não existir pacote: seguir `fallback_novo_pacote` no registry (export + criar entrada + handcraft em lotes).

### Ler antes de handcraft

| Arquivo | Quando |
|---------|--------|
| [`docs/GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | Sempre |
| [`docs/GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) | Sempre |
| [`docs/MOLD_AFFINITY_RESOLVER.md`](MOLD_AFFINITY_RESOLVER.md) | Subtópico com ramos L3 (tabela P0–P2) |
| [`examples/_TEMPLATE-golden-v1.json`](../examples/_TEMPLATE-golden-v1.json) | Sempre |
| `readme` do pacote no registry | Se existir |
| `anchor_glob` do pacote (1–2 exemplos em `examples/`) | Estilo do ramo |
| `cluster_report` | Se existir — priorizar ramos `novo_ramo` |
| Último `lote-meta.json` com maior NN | Continuar de onde parou |

### Descobrir próximo lote

1. Listar `data/catalog-migration/<pacote_prefix>-g*/lote-meta.json` (ou `saude-mental-micro-*-goldens`).
2. Último com `status: applied` → próximo lote = NN+1.
3. Se nenhum lote: criar `<pacote_prefix>-g01` com primeiros N slugs do `manifest` (`lote_size` no registry).
4. Se pacote `status: applied`: perguntar se é reparo pontual ou novo subtópico.

### Pipeline por lote (repetir até esgotar manifest)

```bash
npm run catalog:export-lote -- --lote=<lote> --slugs=...
# handcraft: data/catalog-migration/<lote>/questions/<slug>.json
# Por slug: inferir ramo → declarar meta.pedagogical_branch → JSON A1+A2+A3 (ver skill avant-json-template § L2.5+L3)
npm run validate:goldens -- --lote=<lote> --strict
npm run audit:questao-readiness -- --lote=<lote>
npm run catalog:apply-lote -- --lote=<lote> --dry-run
# apply só quando usuário pedir:
npm run catalog:apply-lote -- --lote=<lote> --apply
```

Usar **`npm run`** no Windows (não `npx tsx`).

### Contrato JSON (resumo)

- `meta.content_standard: "golden-v1"` + `family` + `content_review` + `sources[]` (`year` numérico)
- **`meta.pedagogical_branch`** — obrigatório quando o subtópico tem ramos L3 (`BRANCH_DESIGN_MAP`); tabela completa na skill `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3
- 4 slides planos na **ordem canônica v2:** `concept_map` → `logic_flow` → `golden_rule` → `danger_zone` (ver [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md) §2)
- `concept_map`: sem gabarito/letra; `logic_flow`: eliminação + gabarito (`reveal_mode: "tap"`); `golden_rule`: decore sem row de gabarito
- sem `template` / `layout_variant`
- `danger_zone.items[].correct`: **distinto** por distrator; EXCETO/INCORRETA conforme regra do pacote premium
- Conteúdo alinhado ao **pacote L3 do ramo** (bespoke vs genérico) — não copiar moldes de outro cluster

### Handcraft por slug (A1+A2+A3 num prompt)

1. Ler export do slug (enunciado + gabarito reais).
2. Identificar **ramo** (`pedagogical_branch`) pelo cluster/enunciado.
3. Abrir golden âncora do mesmo ramo em `examples/`.
4. Gerar JSON com L1+L2+L3 declarados.
5. Validar:
   ```bash
   npm run audit:questao-readiness -- --file=data/catalog-migration/<lote>/questions/<slug>.json
   ```
6. Corrigir até `[READY]`; só então incluir no lote para `validate:goldens --strict`.

### Entregáveis por lote

- JSONs handcraft em `questions/` (cada um com `pedagogical_branch` quando aplicável)
- `lote-meta.json` (modelo: `cme-g01/lote-meta.json` ou `perioperatoria-g01/lote-meta.json`)
- `artifacts/<lote>-links.html` (opcional, para revisão no player)
- Resumo: slugs feitos, gabaritos, **audit:questao-readiness OK**, validate strict OK, dry-run OK

### Referência de pacote fechado

[`data/catalog-migration/perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md)

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
