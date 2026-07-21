# Governança de skills Cursor (AVANT)

## Decisão (P0)

| Trilho | Onde editar (Git) | Runtime do agente | Quando |
|--------|-------------------|-------------------|--------|
| **Padrão** | `docs/skills/<nome>/SKILL.md` (+ `reference-*.md` se houver) | `.cursor/skills/<nome>/` | Todas as skills de um arquivo |
| **Exceção Elias** | `.cursor/skills/professor-elias-santana-metodo/**` | Mesmo path | Pacote multi-arquivo (`modules/`, referências) — já versionado no Git |

**Não** versionar todas as skills direto em `.cursor/skills/` (exceto Elias): a pasta `.cursor/` é majoritariamente local (rules, cache). O espelho em `docs/skills/` deixa o conteúdo visível no explorador e revisável em PR.

O script `sync:skills` copia `SKILL.md` e `reference-*.md` de cada pasta em `docs/skills/`.

## Fluxo

1. Editar `docs/skills/<nome>/SKILL.md` (ou Elias no path `.cursor/…`).
2. Sincronizar runtime: `npm run sync:skills`
3. Commitar `docs/skills/` (e Elias se alterado).

```bash
npm run sync:skills          # docs → .cursor (padrão)
npm run sync:skills -- --check   # falha se runtime divergir (CI)
```

## `classifyFamily` — fonte única

O funil de `meta.family` é implementado em **`lib/catalogMigration/classifyFamily.ts`** (testes em `__tests__/lib/catalogMigration/classifyFamily.test.ts`).

A skill `docs/skills/avant-classify-family/SKILL.md` documenta o funil para o agente; **não** duplicar regras divergentes. Se o funil mudar, altere o `.ts` primeiro e atualize a skill na mesma PR.

Gate de consistência: `audit:questao-readiness` emite `l2_family_mismatch` quando `meta.family` ≠ `classifyFamily()` (`warn`; `error` com `--strict-v2-pedagogy`).

Validação rápida antes do handcraft: `npm run classify:family -- --file=<path.json>` (`scripts/classify-family-cli.ts`).

## Inventário (skills de um arquivo)

| Skill | `docs/skills/` | Elias-style `.cursor/` |
|-------|----------------|-------------------------|
| avant-classify-family | sim | — |
| avant-golden-anchor-handcraft | sim | — |
| avant-golden-anchor-bootstrap | sim | — |
| professor-para-concurso | sim | — |
| avant-json-template | sim | — |
| avant-ui-visual | sim | — |
| avant-neuroslides-visual | sim | — |
| brief-enfermagem | sim | — |
| brief-lingua-portuguesa | sim | — |
| professor-lingua-portuguesa-concurso | sim | — |
| professor-elias-santana-metodo | — | sim (pacote completo) |

## Referências

- `docs/AVANT_AGENT_SOURCES.md` — índice agente
- `CLAUDE.md` — tabela de skills
- `.gitignore` — exceção `professor-elias-santana-metodo`
