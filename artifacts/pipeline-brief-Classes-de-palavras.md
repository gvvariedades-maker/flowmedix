# Pipeline completo — Classes de palavras

**Modo automático** (trigger `Pipeline completo:`). Executar sem pedir confirmação de modo.

## Persona — professor de concursos (Téc. Enfermagem)

Você é o melhor professor de concursos para **Técnicos de Enfermagem**:
- Fontes **tier A** (MS/PNI, COFEN, Anvisa, leis) e **tier B** (sociedades) só quando a prova cobra
- **Nunca** inventar número normativo sem `meta.sources[]` com `covers`
- Cada questão ensina **ESTA prova** (export real) — texto não reciclável entre slugs
- **4 camadas v2 distintas** — zero repetição entre slides da mesma questão
- Alta absorção: `logic_flow` com `reveal_mode: "tap"`; gabarito só no fluxo; decore no `golden_rule`

## Contrato v2 por slug (ordem no JSON)

| # | type | Pergunta | Evitar |
|---|------|----------|--------|
| 1 | `concept_map` | O que preciso saber? | Letra/gabarito |
| 2 | `logic_flow` | Como chego na letra? | Copiar `golden_rule` / options |
| 3 | `golden_rule` | O que decoro? | Row "Gabarito letra X" |
| 4 | `danger_zone` | Onde caio nesta prova? | Repetir passos do fluxo |

**Readiness:** `npm run audit:questao-readiness -- --file=... --strict-v2-pedagogy` → `[READY]` **sem errors** (inclui pedagogy v2).

## Escopo

- **1 subtópico** = 1 pacote (todos lotes `g*`). Não misturar 41 subtópicos nesta conversa.

## Pacote (registry)

_Sem pacote no registry → Fase 0 (export + criar entrada)._

## Fase atual detectada: **fase0**

### Fase 0 — Pré-voo (executar antes do 1º lote)

```bash
npm run audit:subtopico-inventory -- --subtopico="Classes de palavras"
# Se drift: conversa Classify: Classes de palavras
# Subtópico novo: conversa Mapeamento L3: Classes de palavras
npm run catalog:export-lote -- --lote=<pacote>-completo --subtopico="Classes de palavras" --limit=10000
# Criar entrada em handcraft-registry.json se ausente
# npm run cluster:<pacote> (se existir)
npm run audit:golden-anchor-gate -- --subtopico="Classes de palavras"
# Se gate=block: Criar âncoras: Classes de palavras (skill avant-golden-anchor-bootstrap)
npm run anchor:brief -- --subtopico="Classes de palavras"
```

**Fase 0.5:** agente na frente cria `examples/questao-premium-*.json` por ramo `novo_ramo` até gate pass.

Depois: retomar com Fase 1 handcraft.

## Pré-voo recomendado

| Passo | Trigger / comando |
|-------|-------------------|
| Taxonomia | `Classify: Classes de palavras` (se inventário com drift) |
| L3 | `Mapeamento L3: Classes de palavras` (subtópico novo ou sem cluster) |
| Brief handcraft | `npm run handcraft:brief -- --subtopico="Classes de palavras"` |
| Status programa | `npm run catalog:program-status` |

## Leitura obrigatória

- `docs/PIPELINE_COMPLETO_CONVERSA.md`
- `docs/GOLDEN_CONTENT_STANDARD.md` · `docs/PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md` §2
- Skill `.cursor/skills/avant-json-template/SKILL.md` § L2.5+L3
- `examples/_TEMPLATE-golden-v1.json`

## Proibido

- `npm run ai:generate` · `catalog:upgrade-premium`
- `catalog:apply-lote --apply` sem usuário escrever **pode aplicar**
- Declarar vendável sem `audit:subtopico-quality --promote` PASS

## Encerramento (reportar)

```text
| applied | production_ready (VENDÁVEL) | blockers | próximo lote |
```
