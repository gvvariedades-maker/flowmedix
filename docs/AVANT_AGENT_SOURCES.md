# Fontes para o Avant Agent

Lista de referências oficiais para gerar ou validar JSON de questões compatíveis com o Laboratório e a API admin.

**Agente externo (fora do repo / outro Cursor / GPT customizado):** use o arquivo **`docs/AVANT_AGENT_PROMPT_EXPORT.md`** — copie o conteúdo inteiro para o system prompt ou instruções do projeto. Atualize esse arquivo sempre que puxar mudanças do AVANT.

**Antes de usar os exemplos como referência definitiva:** validar uma vez no Laboratório (modo objeto único) com a versão atual do app.

---

## Código e schema (fonte da verdade)

- **`lib/validations.ts`** — principalmente `QuestaoCompletaSchema` e exports ligados: `QuestaoMetaSchema`, `QuestaoDataSchema`, `QuestaoOptionSchema`, slides flexíveis/rígidos (`FlexibleReverseStudySlideSchema`, `ReverseStudySlideSchema`, etc.) e schemas por tipo (`ConceptMapSlideSchema`, `LogicFlowSlideSchema`, `GoldenRuleSlideSchema`, `DangerZoneSlideSchema`, …). Em `meta`, campo opcional `header_line` (linha única de cabeçalho da prova).
- **`lib/questionHeader.ts`** — monta a linha de cabeçalho derivada e a linha de matéria no `AvantLessonPlayer`.
- **`lib/questionKind.ts`** — `isCertoErradoQuestion`: detecta duas opções “Certo”/“Errado” para layout em duas colunas no player.
- **Constantes/helpers** no mesmo arquivo (ou importados dele): `LIMITS`, lista/validação de ícones (`LUCIDE_ICONS` / `lucideIconValidator`), regras de HTML (`ALLOWED_HTML_TAGS`, `sanitizeHTML` ou equivalente).

## Regras pós-Zod no Laboratório

- **`app/(admin)/admin/laboratorio/page.tsx`** — o trecho que roda **depois** do `safeParse` (validação manual de slides: `type`/`layout_type`, `steps`, `content`, `items`/`concepts`, etc.).

## Convenções para o agente (prompt / subtópico / layout)

- **`.cursor/skills/avant-json-template/SKILL.md`** (geração de JSON; pasta `.cursor` pode estar no `.gitignore` — manter cópia ou sincronizar com o time).
- **`.cursor/rules/avant-agent-json.mdc`** — regra **alwaysApply** com `meta`, cabeçalho, `instruction` e slides. **Cópia versionada no Git:** `docs/cursor/avant-agent-json.mdc` (se a rule local sumir após clone, copiar esse arquivo para `.cursor/rules/`).
- **`docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md`**
- **`docs/PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`** — famílias pedagógicas (legislação, protocolo, cálculo, I/II/III, conceito), visual premium, evidências UX, anti-repetição e checklist de publicação
- **`docs/VARIANT_MOLDS.md`** — pipeline para moldes interativos bespoke (concept_map / danger_zone), contrato de conteúdo por molde, wiring no player e catálogo atual

## Migração de catálogo e visual

- **`lib/catalogMigration/upgradePremiumHybrid.ts`** — conteúdo pedagógico por família; **não** injeta `layout_variant` (visual no player).
- **`lib/catalogMigration/familyLayoutProfile.ts`** — golden visual por `FamilyId` (referência do player, não copiar para cada questão).
- **`lib/catalogMigration/stripLayoutVariant.ts`** — remove `layout_variant` de JSONs legados; CLI: `npm run catalog:strip-layout-variant`.

## Exemplos “golden”

- **`examples/questao-premium-urgencias-rcp.json`** — família **protocolo** (pedagógico + vitrine; `reveal_mode: "tap"`, `danger_zone` com `correct`, `golden_rule` com `rows`, `slide_title`)
- **`examples/questao-premium-sus-lei-8080-cesgranrio.json`** — família **legislação** + molde `sus-art4-orbit` / `scope-trap` (sem `layout_variant` no JSON — subtópico Promoção à Saúde)
- **`examples/questao-premium-vunesp-via-subcutanea.json`** — família **conceito** + molde `absorption-speed-rail` / `route-trap` (subtópico Vias de Administração)
- **`examples/questao-premium-idecan-calculo-equivalencias-gotas.json`** — família **calc** + molde `dose-equivalence-rail` / `dose-trap` (subtópico Cálculo de Medicamentos)
- **`examples/questao-preview-logic-flow-tap.json`** — preview mínimo só do `logic_flow` tap
- **`examples/questao-enfermagem-sae.json`**
- **`examples/questao-teste-simples.json`**
