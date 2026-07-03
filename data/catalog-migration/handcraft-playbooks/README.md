# Handcraft playbooks — trigger `Handcraft: <subtópico>`

Um **playbook** expande a mensagem curta `Handcraft: Nome Canônico` no briefing completo (escopo, ramos L3, âncoras, pipeline, comandos).

O renderer é `lib/catalogMigration/handcraftPlaybook.ts` → `buildHandcraftBrief()`. Campos operacionais do JSON (`proibido`, `first_lote`, `after_handcraft`) **entram no Markdown** — não são só notas para humanos.

## Pré-requisito L3 (handcraft)

Antes do **1º lote** de handcraft em subtópico novo ou re-handcraft:

1. `Mapeamento L3: <subtópico>` — [`docs/L3_MAPEAMENTO_CONVERSA.md`](../../docs/L3_MAPEAMENTO_CONVERSA.md)
2. **Fase 3b:** brief 4/4 por ramo forte → `artifacts/l3-brief-<pacote>-<branch_id>.md`
3. Cauda longa (`ok_generico` no relatório L3): **sem** brief — layouts genéricos no handcraft

O playbook lista `pedagogical_branches[].mold` como **referência**; moldes legados exigem `molde_redesign` no mapeamento L3.

## Uso (conversa Cursor)

```text
Handcraft: Doenças Respiratórias Crônicas (Asma, DPOC)
```

Opcional — uma questão:

```text
Handcraft: Doenças Respiratórias Crônicas (Asma, DPOC)
Slug: objetiva-concursos-enfermagem-semiologia-em-enfermagem-1779563549311-1
```

A rule `.cursor/rules/handcraft-golden-v1.mdc` instrui o agente a:

1. Resolver pacote em `handcraft-registry.json`
2. Carregar playbook (`handcraft_playbook` ou `<pacote_prefix>.json`)
3. Executar o briefing (`lib/catalogMigration/handcraftPlaybook.ts`)

## Pré-visualizar briefing (CLI)

```bash
npm run handcraft:brief -- --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)"
npm run handcraft:brief -- --subtopico="Doenças Respiratórias Crônicas (Asma, DPOC)" --slug=objetiva-concursos-...
```

## Arquivos

| Arquivo | Função |
|---------|--------|
| `_default.json` | Fallback — subtópicos sem playbook dedicado |
| `vias-de-administracao.json` | Vias de Administração — absorção / técnica / indicação |
| `farmacodinamica-e-farmacocinetica.json` | Farmacodinâmica — PK/PD V/F e clínico EV (omeprazol) |
| `<pacote_prefix>.json` | Playbook por pacote (ex.: `respiratorio-cronico.json`) |
| `../handcraft-registry.json` | Campo opcional `handcraft_playbook` |

## Adicionar playbook a um subtópico

1. Criar `data/catalog-migration/handcraft-playbooks/<pacote_prefix>.json` (copiar `respiratorio-cronico.json` como molde).
2. Preencher:
   - `scope_default` — `subtopico_handcraft` | `subtopico_repair_l3` | `subtopico_repair_clinical_v3` | …
   - `pedagogical_branches[]` — `id`, `when`, `mold`, `anchors`
   - `clusters`, `repair_lote_pattern` (se repair)
   - `proibido[]` (opcional — reforça proibições no briefing)
   - `modes.<modo>.first_lote` e `modes.<modo>.after_handcraft` (comandos pós-handcraft; ver § Schema operacional)
3. No registry, no pacote do subtópico:
   ```json
   "handcraft_playbook": "data/catalog-migration/handcraft-playbooks/<pacote_prefix>.json"
   ```
   (Opcional se o arquivo seguir o nome `<pacote_prefix>.json`.)
4. Testar: `npm run handcraft:brief -- --subtopico="Nome Exato"`

## Schema operacional (renderizado no briefing)

Campos que `buildHandcraftBrief()` lê e imprime no Markdown gerado por `npm run handcraft:brief`.

### `proibido` (raiz do playbook)

Lista de comandos **não** executar em produção handcraft.

```json
"proibido": ["ai:generate", "catalog:upgrade-premium"]
```

- Aparece no passo 4 da seção **Pipeline (executar)**.
- Se ausente, usa fallback: `ai:generate`, `catalog:upgrade-premium`.
- Quando definido no JSON, também gera seção **Proibido (playbook)** com lista em bullets.

### `modes.<modo>.first_lote`

Nome do **primeiro lote** a usar no modo ativo (ex.: repair L3 já iniciado em g01).

```json
"modes": {
  "subtopico_repair_l3": {
    "first_lote": "respiratorio-cronico-repair-l3-g01"
  }
}
```

- Aparece em **Escopo** como `Primeiro lote: \`...\``.
- Prioridade: `modes[mode].first_lote` → `repair_lote_pattern` com `{NN}`→`01` (modos `subtopico_repair_*`) → `lote_pattern` do registry com `01` → `<pacote_prefix>-g01`.
- Helper exportado: `resolveFirstLote(playbook, pkg, mode)`.

### `modes.<modo>.after_handcraft`

Comandos **pós-handcraft** no bloco `bash` do briefing. Substituem o pipeline genérico quando presentes.

```json
"modes": {
  "subtopico_repair_l3": {
    "after_handcraft": [
      "npm run audit:questao-readiness -- --lote=<lote>",
      "npm run catalog:patch-pedagogical-branch -- --from-supabase --subtopico=\"<canônico>\" --only-premium --apply"
    ]
  },
  "single_slug": {
    "lote_dir": "data/catalog-migration/respiratorio-cronico-repair-l3-g01/questions",
    "after_handcraft": [
      "npm run audit:questao-readiness -- --file=data/catalog-migration/<lote>/questions/<slug>.json"
    ]
  }
}
```

**Placeholders** (expandidos por `substitutePlaybookPlaceholders`):

| Token | Valor |
|-------|--------|
| `<lote>` | Nome do lote (`first_lote` ou derivado) |
| `<slug>` | Slug da questão (modo `single_slug`) |
| `<canônico>` / `<canonico>` | Nome exato do subtópico |
| `<pacote>` | `pacote_prefix` do registry |

**Fallback** (playbook sem `after_handcraft`):

- Subtópico: `validate:goldens --strict` → `audit:questao-readiness` → `catalog:apply-lote --dry-run`
- `single_slug`: `audit:questao-readiness --file=...`

O bloco `bash` sempre inclui, antes dos `after_handcraft`:

- Subtópico: `catalog:export-lote` + comentário `# Handcraft → data/catalog-migration/<lote>/questions/*.json`
- `single_slug`: comentários de busca no Supabase e caminho de salvamento (`lote_dir` se definido)

### `modes.<modo>.label`

Rótulo humano do modo repair (ex.: `subtopico_repair_clinical_v3` na perioperatória). Aparece na linha de escopo do briefing.

### Modos reconhecidos

| `scope_default` / `--mode` | Uso típico |
|----------------------------|------------|
| `subtopico_handcraft` | 1º handcraft ou continuação de lotes gNN |
| `subtopico_repair_l3` | Reparo `pedagogical_branch` + audit FAIL |
| `subtopico_repair_clinical_v3` | Reparo clinical-depth v3 (perioperatória) |
| `single_slug` | Trigger com `Slug:` na mensagem |

Modos cujo nome começa com `subtopico_repair` usam `repair_lote_pattern` e exibem seleção de slugs (`slug_selection`).

### Exemplo mínimo (repair L3)

Ver `respiratorio-cronico.json`:

- `first_lote` fixo em g01
- `after_handcraft` com `patch-pedagogical-branch` (não está no fallback genérico)
- Sem `proibido` na raiz → fallback padrão no briefing

### Exemplo com `proibido` explícito

Ver `farmacodinamica-e-farmacocinetica.json` e `vias-de-administracao.json`.

## Mapeamento L3 (antes do 1º lote — recomendado)

Subtópico novo ou sem cluster / auditoria L3:

```text
Mapeamento L3: Punção Venosa e Cuidados com Cateteres
```

Rule: `.cursor/rules/l3-mapeamento.mdc`  
Doc: `docs/L3_MAPEAMENTO_CONVERSA.md`

## Qualidade vendável (após handcraft fechado)

Quando `status: applied` e o objetivo é **vender** o pacote (L1–L6):

```text
Qualidade vendável: Enfermagem em Central de Material e Esterilização (CME)
```

**Pipeline completo** (handcraft + qualidade + `--promote` na mesma conversa):

```text
Pipeline completo: Enfermagem em Central de Material e Esterilização (CME)
```

Rules: `.cursor/rules/quality-vendavel.mdc` · `.cursor/rules/pipeline-completo.mdc`  
Docs: `docs/QUALITY_VENDAVEL_CONVERSA.md` · `docs/PIPELINE_COMPLETO_CONVERSA.md`

## Referências

- `docs/HANDCRAFT_CONVERSA.md` — runbook handcraft
- `docs/QUALITY_VENDAVEL_CONVERSA.md` — runbook vendável
- `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3 — tabela global de ramos
- `lib/catalogMigration/handcraftPlaybook.ts` — `buildHandcraftBrief`, `resolveFirstLote`, `formatProibidoList`, `substitutePlaybookPlaceholders`
- `__tests__/lib/catalogMigration/handcraftPlaybook.test.ts` — contrato de renderização
