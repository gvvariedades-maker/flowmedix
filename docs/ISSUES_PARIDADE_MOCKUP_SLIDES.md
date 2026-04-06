# Issues — paridade visual slides (mockup × Avant)

Use este documento para abrir issues no GitHub: cada bloco está pronto para **título + corpo** (copiar/colar).  
Referência analítica: [`COMPARATIVO_MOCKUP_SLIDES_VS_AVANT.md`](./COMPARATIVO_MOCKUP_SLIDES_VS_AVANT.md).

**Labels sugeridas (criar no repositório se não existirem):** `enhancement`, `ui`, `slides`, `content`, `low-effort` / `medium-effort`.

---

## Issue 1 — Chip de tipo de slide (marca / didática)

**Título:** `feat(slides): chip reutilizável com rótulo do tipo de slide (mapa, regra, etc.)`

**Corpo:**
```markdown
## Contexto
Alinhar a UI ao material de marketing: cada modelo de slide deve exibir um chip explícito (ex.: "MAPA DE CONCEITOS", "REGRA DE OURO").

## Escopo
- Helper ou componente leve (ex.: `SlideTypeChip`) que recebe `type` do slide (`concept_map`, `golden_rule`, …) e opcionalmente `label` override via JSON.
- Integrar nos variantes em `components/slides/variants/` onde fizer sentido (topo do conteúdo, acima do título principal).
- Mapeamento padrão PT-BR tipo → texto do chip; permitir override no JSON para edge cases.

## Critérios de aceite
- [ ] Chip visível em pelo menos um fluxo completo de estudo reverso (4 slides).
- [ ] Textos padrão documentados em `docs/AGENT_AVANT_TEMPLATES_E_LAYOUT.md` ou no próprio componente.
- [ ] Acessível: elemento semântico ou `aria-label` coerente.

## Esforço
Baixo
```

---

## Issue 2 — Golden Rule: modo tabela (pares label / value)

**Título:** `feat(slides): GoldenRule com dados estruturados para tabelas de referência`

**Corpo:**
```markdown
## Contexto
Mockup mostra "Regra de ouro" com colunas duas (ex.: parâmetro | valor). Hoje só existe `content` string.

## Escopo
- Estender schema do slide `golden_rule` (ex.: `rows: { label: string; value: string }[]`) com fallback para `content` atual.
- Nova `layout_variant` (ex.: `reference_table`) ou detecção automática quando `rows` existir.
- Layout responsivo (mobile: empilhado ou scroll horizontal leve).

## Critérios de aceite
- [ ] Questões antigas continuam renderizando sem alteração.
- [ ] Exemplo de JSON no skill ou doc do agent.
- [ ] Contraste e tipografia alinhados ao tema existente (`theme`).

## Esforço
Médio
```

---

## Issue 3 — Danger Zone: copy e bullets estilo mockup

**Título:** `ui(slides): DangerZone — título configurável e bullets opcionais estilo "X"`

**Corpo:**
```markdown
## Contexto
Título fixo "CUIDADO COM A PEGADINHA" difere do mockup "ZONA DE PERIGO". Bullets com ícone X vermelho são opcionais no material.

## Escopo
- Prop opcional `headerTitle` (ou i18n key) com default atual para não quebrar conteúdo.
- Prop opcional `bulletStyle`: `numbered` | `x_icon` (ou similar) nos itens.
- Manter acessibilidade (lista semântica, ícones decorativos com `aria-hidden`).

## Critérios de aceite
- [ ] JSON existente sem novos campos continua igual visualmente (ou com título default documentado).
- [ ] Documentar chaves no doc de templates.

## Esforço
Baixo a médio
```

---

## Issue 4 — Logic Flow: rótulo "Fluxo lógico" configurável

**Título:** `feat(slides): LogicFlow — chip superior configurável ("Pipeline" vs "Fluxo lógico")`

**Corpo:**
```markdown
## Contexto
Chip interno fixo "Pipeline Cognitivo" difere do mockup "FLUXO LÓGICO".

## Escopo
- Prop opcional `pipelineLabel` no slide ou uso de `meta` / `header.subtitle`.
- Default atual: manter "Pipeline Cognitivo" OU alinhar default para "Fluxo lógico" (decisão de produto — documentar breaking change se mudar texto padrão).

## Critérios de aceite
- [ ] Slides antigos sem campo extra mantêm comportamento documentado.
- [ ] Doc do agent atualizada.

## Esforço
Baixo
```

---

## Issue 5 — Conteúdo tipo "scanner" genérico (níveis, seções)

**Título:** `rfc(slides): novo layout ou tipo para blocos verticais (ex.: níveis de prevenção)`

**Corpo:**
```markdown
## Contexto
`SyllableScanner` é específico para acentuação/sílabas. O mockup usou o rótulo "SCANNER SILÁBICO" para conteúdo que na prática são **seções com título forte + texto** (não sílabas).

## Escopo (RFC — definir antes de codar)
- Opção A: novo `type` (ex.: `section_stack`) com `sections: { title: string; body: string }[]`.
- Opção B: `layout_variant` em `concept_map` ou `golden_rule`.
- Alinhar nome público ("Seções", "Blocos", etc.) para não conflitar com `syllable_scanner`.

## Critérios de aceite
- [ ] Decisão registrada neste repo (ADR curto ou seção no doc comparativo).
- [ ] Implementação só após fechar RFC (issue pode ficar em duas fases: RFC + dev).

## Esforço
Médio a alto (depende da opção)
```

---

## Checklist rápido (roadmap)

| # | Issue | Prioridade sugerida |
|---|--------|---------------------|
| 1 | Chip de tipo | P0 |
| 4 | LogicFlow label | P1 |
| 3 | DangerZone | P1 |
| 2 | GoldenRule tabela | P2 |
| 5 | RFC seções genéricas | P3 |

Ao abrir no GitHub, associe milestones (ex.: `v1.x-slides`) se o projeto usar.
