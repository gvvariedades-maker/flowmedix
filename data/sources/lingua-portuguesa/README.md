# Fontes — Língua Portuguesa

Cadernos PDF usados como **fonte interna** para handcraft golden-v1 (estudo reverso).

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `portugues-caderno-2025-2026.pdf` | Caderno Português 2025–2026 — questões **1–200** |
| `portugues-caderno-2025-2026-q201-400.pdf` | Continuação — questões **201–400** |
| `portugues-caderno-2025-2026-q401-600.pdf` | Continuação — questões **401–600** |
| `portugues-caderno-2025-2026-q601-671.pdf` | Volume final — questões **601–671** |
| `manifest.json` | Metadados, regras de publicação e índice de lotes |

**Total do caderno:** 671 questões (4 volumes).

**Barra de produto:** estudo reverso sob medida para **Técnico de Enfermagem** — estrategicamente simples, com vontade de continuar. Ver § Barra TE em `@.cursor/skills/professor-lingua-portuguesa-concurso/SKILL.md`.

## Uso no Agent (Cursor)

**Skills obrigatórias (handcraft PT):**

```text
@.cursor/skills/professor-lingua-portuguesa-concurso/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md
@.cursor/skills/brief-lingua-portuguesa/SKILL.md
@.cursor/skills/avant-json-template/SKILL.md
```

**Variante morfossintaxe (Gran / Elias):** troque a persona por `@.cursor/skills/professor-elias-santana-metodo/SKILL.md` + módulo M01–M16 em [`modules/README.md`](../../.cursor/skills/professor-elias-santana-metodo/modules/README.md). Doc versionada: [`docs/LINGUA_PORTUGUESA_ELIAS_METODO.md`](../../../docs/LINGUA_PORTUGUESA_ELIAS_METODO.md).

```text
Handcraft: Língua Portuguesa — lote g01

Fonte: @data/sources/lingua-portuguesa/portugues-caderno-2025-2026.pdf
Processar questões 1–8 do PDF (manifest: @data/sources/lingua-portuguesa/manifest.json)

# Ou, a partir da questão 201:
Fonte: @data/sources/lingua-portuguesa/portugues-caderno-2025-2026-q201-400.pdf
Processar questões 201–208 do PDF

# Ou, a partir da questão 401:
Fonte: @data/sources/lingua-portuguesa/portugues-caderno-2025-2026-q401-600.pdf
Processar questões 401–408 do PDF

# Ou, volume final (questão 601+):
Fonte: @data/sources/lingua-portuguesa/portugues-caderno-2025-2026-q601-671.pdf
Processar questões 601–608 do PDF
```

- **1 conversa = 1 lote** (4–8 questões).
- Saída: `data/catalog-migration/lingua-portuguesa-gNN/questions/*.json`
- Gates: `audit:questao-readiness --strict-v2-pedagogy` → `[READY]`
- Publicação no banco: somente após validação e pedido explícito (`pode aplicar`).

## Fontes Gran (degravações — uso interno)

Curso logado **Essencial Temas Quentes** (Elias Santana) + outlines estruturais.  
**Doc canônico:** [`docs/LINGUA_PORTUGUESA_ELIAS_METODO.md`](../../../docs/LINGUA_PORTUGUESA_ELIAS_METODO.md)

```text
@docs/LINGUA_PORTUGUESA_ELIAS_METODO.md
@.cursor/skills/professor-elias-santana-metodo/SKILL.md
@.cursor/skills/professor-elias-santana-metodo/modules/README.md
@data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/README.md
```

| Comando | Função |
|---------|--------|
| `npm run gran:elias-extract-outlines` | Baixa degravações + gera outlines JSON (`GRAN_COOKIE` obrigatório) |
| `npm run gran:elias-generate-modules` | Regenera `modules/M01`–`M16` enriquecidos na skill |

Detalhe: [`gran-elias-essencial-temas-quentes/README.md`](gran-elias-essencial-temas-quentes/README.md)

## Regras

- PDF é **fonte de trabalho** — não vai para o player.
- Conteúdo publicado: sem marca TecConcursos; enunciado limpo conforme `lib/questionHeader.ts`.
- Atualizar `questoes_indexadas` no manifest conforme lotes forem concluídos.

## Classificação (vitrine + caderno)

**Doc canônico:** [`docs/LINGUA_PORTUGUESA_CLASSIFICACAO.md`](../../../docs/LINGUA_PORTUGUESA_CLASSIFICACAO.md)

Cluster auditado nos 671 PDFs — ver `artifacts/lingua-portuguesa-topic-cluster-report.json`:

- **45** rótulos TecConcursos (`source_assunto_tec`)
- **17** cards de estudo (`titulo_aula` / `modulo_nome: Língua Portuguesa`)
- Comando: `npm run cluster:lingua-portuguesa`
- Playbook: `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json`
- Registry: `handcraft-registry.json` → pacote `Língua Portuguesa`
- L3 index: `artifacts/l3-brief-lingua-portuguesa-index.md`

Regra: no handcraft, `meta.subtopico` = card canônico; rótulo Tec fica em metadado interno; tema real prevalece em divergências.

**Trigger handcraft:** `Handcraft: Língua Portuguesa` — ver [`docs/HANDCRAFT_CONVERSA.md`](../../../docs/HANDCRAFT_CONVERSA.md).

## Guidelines (norma de concurso)

**Doc canônico:** [`docs/LINGUA_PORTUGUESA_GUIDELINES.md`](../../../docs/LINGUA_PORTUGUESA_GUIDELINES.md)

P0 implementado (não bloqueia handcraft):

| Card | Arquivo |
|------|---------|
| Crase | `lib/guidelines/linguaPortuguesa/crase.ts` |
| Pronomes e colocação pronominal | `lib/guidelines/linguaPortuguesa/colocacaoPronominal.ts` |

Índice: `lib/guidelines/linguaPortuguesa/index.ts`
