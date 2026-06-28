# Handcraft playbooks — trigger `Handcraft: <subtópico>`

Um **playbook** expande a mensagem curta `Handcraft: Nome Canônico` no briefing completo (escopo, ramos L3, âncoras, pipeline, comandos).

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
| `<pacote_prefix>.json` | Playbook por pacote (ex.: `respiratorio-cronico.json`) |
| `../handcraft-registry.json` | Campo opcional `handcraft_playbook` |

## Adicionar playbook a um subtópico

1. Criar `data/catalog-migration/handcraft-playbooks/<pacote_prefix>.json` (copiar `respiratorio-cronico.json` como molde).
2. Preencher:
   - `scope_default` — `subtopico_handcraft` | `subtopico_repair_l3` | …
   - `pedagogical_branches[]` — `id`, `when`, `mold`, `anchors`
   - `clusters`, `repair_lote_pattern` (se repair L3)
3. No registry, no pacote do subtópico:
   ```json
   "handcraft_playbook": "data/catalog-migration/handcraft-playbooks/<pacote_prefix>.json"
   ```
   (Opcional se o arquivo seguir o nome `<pacote_prefix>.json`.)
4. Testar: `npm run handcraft:brief -- --subtopico="Nome Exato"`

## Referências

- `docs/HANDCRAFT_CONVERSA.md` — runbook geral
- `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3 — tabela global de ramos
- `lib/catalogMigration/handcraftPlaybook.ts` — resolver
