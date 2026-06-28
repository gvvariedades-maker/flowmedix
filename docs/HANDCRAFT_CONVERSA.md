# Handcraft golden-v1 — prompt de conversa

Use em **conversa nova** de uma destas formas:

```text
Handcraft: Enfermagem em Central de Material e Esterilização (CME)
```

ou anexe este arquivo (`@docs/HANDCRAFT_CONVERSA.md`) após editar **só** a linha abaixo:

```text
SUBTÓPICO: Enfermagem em Central de Material e Esterilização (CME)
```

**Decisão de produto:** único trilho de produção = handcraft golden-v1 por slug. Ver [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md).

**Pré-requisito:** subtópico estável (taxonomia). Se o bucket ainda tem drift, use `Classify: <subtópico>` — [`TAXONOMIA_CONVERSA.md`](TAXONOMIA_CONVERSA.md).

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
3. Se não existir: seguir `fallback_novo_pacote` no registry (export + criar entrada + handcraft em lotes).

### Ler antes de handcraft

| Arquivo | Quando |
|---------|--------|
| [`docs/GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) | Sempre |
| [`docs/GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) | Sempre |
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
npm run validate:goldens -- --lote=<lote> --strict
npm run catalog:apply-lote -- --lote=<lote> --dry-run
# apply só quando usuário pedir:
npm run catalog:apply-lote -- --lote=<lote> --apply
```

Usar **`npm run`** no Windows (não `npx tsx`).

### Contrato JSON (resumo)

- `meta.content_standard: "golden-v1"` + `family` + `content_review` + `sources[]` (`year` numérico)
- 4 slides planos; sem `template` / `layout_variant`
- `logic_flow`: `reveal_mode: "tap"`; V/F → “Julgar I, II, III…”
- `danger_zone.items[].correct`: **distinto** por distrator; EXCETO/INCORRETA conforme regra do pacote premium

### Entregáveis por lote

- JSONs handcraft em `questions/`
- `lote-meta.json` (modelo: `cme-g01/lote-meta.json` ou `perioperatoria-g01/lote-meta.json`)
- `artifacts/<lote>-links.html` (opcional, para revisão no player)
- Resumo: slugs feitos, gabaritos, validate strict OK, dry-run OK

### Referência de pacote fechado

[`data/catalog-migration/perioperatoria-completo/README.md`](../data/catalog-migration/perioperatoria-completo/README.md)
