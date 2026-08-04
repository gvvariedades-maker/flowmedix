---
name: brief-enfermagem
description: >-
  Brief L3 orquestrador para os 41 subtópicos de enfermagem no AVANT. Decide
  ok_generico vs molde_redesign/inedito, gera brief 4/4 (Fase 3b) em
  artifacts/l3-brief-*, alinha handcraft aos slots e handoff VARIANT_MOLDS.
  Use com Brief TE:, Brief: <Subtópico> — <ramo>, Mapeamento L3 enfermagem,
  Pipeline completo, paridade Adolescente, ou quando pedir brief de molde
  NeuroSlides de Técnico de Enfermagem.
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# Brief — Enfermagem / Técnico de Enfermagem (AVANT)

Skill **orquestradora** de L3 para os **41 subtópicos canônicos** (CLAUDE.md §9).

Fluxo: decisão → brief formal (ramo forte) → contrato de slots no handcraft → React só com autorização.

**Não** substitui:
- `professor-para-concurso` (conteúdo / fontes Tier A/B)
- `avant-golden-anchor-handcraft` (family → slots / densidade)
- `avant-json-template` (forma JSON)
- `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` (corpo do brief 4/4 — **linkar, não copiar**)
- `avant-neuroslides-visual` (retenção visual pós-brief — encadear)
- React (`VARIANT_MOLDS` — só com `Implementar molde: …`)

**Não** é skill de Português — use `brief-lingua-portuguesa` para Língua Portuguesa.

**Não** lista metáfora dos 41 pacotes aqui — ver playbook + briefs existentes ([`reference-pacotes.md`](reference-pacotes.md)).

**Mapeamento L3:** Modo **B** obrigatório por ramo forte (`molde_redesign` / `molde_inedito`). Com **>3 ramos fortes**, usar `artifacts/l3-brief-<pacote>-INDEX.md` + um brief por `branch_id` — ver [`docs/L3_MAPEAMENTO_CONVERSA.md`](../../../docs/L3_MAPEAMENTO_CONVERSA.md).

---

## Triggers

| Usuário diz / contexto | Modo |
|------------------------|------|
| `Brief TE: <ramo>` / `Brief: <Subtópico> — <branch_id>` | **B** — brief 4/4 formal |
| `Mapeamento L3: <Subtópico>` (+ Fase 3b) | **B** por ramo forte — **obrigatório** nesta conversa |
| `Pipeline completo:` / `Paridade Adolescente:` / `+ L3 bespoke` | Resolver briefs pendentes (**B**) antes de escalar |
| Handcraft / lote gNN / estudo reverso TE | **A** — metáfora + slots no JSON |
| `Implementar molde: <ramo>` | Ler brief existente → `@docs/VARIANT_MOLDS.md` (não codar sem pedido) |

---

## Encadeamento

| Ordem | Skill / doc | Papel |
|------:|-------------|--------|
| 1 | `professor-para-concurso` | O que ensinar (prova + guideline) |
| 2 | `avant-golden-anchor-handcraft` | Family → logic_flow primeiro |
| 3 | **`brief-enfermagem` (esta)** | Decisão L3 · brief 4/4 · contrato visual |
| 4 | `avant-json-template` | Forma JSON / `meta.subtopico` / L3 |
| 5 | `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` | Corpo do brief (versão **completa**) |
| 6 | `@docs/L3_MAPEAMENTO_CONVERSA.md` | Cluster + auditoria + quem exige Fase 3b |
| 7 | `avant-neuroslides-visual` | Barra de retenção / Design visual (pós-brief; sem React) |
| 8 | `@docs/VARIANT_MOLDS.md` | Só se usuário pedir React |
| 9 | `avant-ui-visual` | Só se mexer em CSS/componente do app (não molde de aula) |

Resolver pacote: `data/catalog-migration/handcraft-registry.json`  
Playbook: `data/catalog-migration/handcraft-playbooks/<pacote_prefix>.json` ou `_default.json`  
Índice de briefs: [`reference-pacotes.md`](reference-pacotes.md)

Corpo do brief (taxonomia, contrato `correct`/EXCETO, densidade, handoff gates): `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` — **linkar**, não copiar nesta skill.

---

## Dois modos (eficiência)

### Modo A — Handcraft (toda questão)

1. `meta.subtopico` canônico + `meta.family` + `meta.pedagogical_branch` (se `BRANCH_DESIGN_MAP`).
2. Abrir playbook do pacote → linha do ramo (`mold`, `l3_decision`, `bespoke_target`).
3. Se brief do ramo já existe em `artifacts/l3-brief-*`: **respeitar** metáfora e contrato de slots.
4. Nomear erro espacial em 1 frase **ou** “não espacial → ok_generico”.
5. Metáfora **única** nos 4 slides (genérico premium se sem bespoke wired).
6. Saída curta após o JSON (§ Saída).

**Não** gravar novo `artifacts/l3-brief-*.md` no Modo A, salvo pedido explícito.

### Modo B — Brief 4/4 formal (ramo forte)

Só se decisão = `molde_redesign` | `molde_inedito` (ou usuário pediu `Brief TE:` / `Brief:`).

1. Inputs obrigatórios (§ Inputs).
2. Teste espacial 3/3 (§ Decisão) — se 3× sim → `ok_generico` e **parar** (sem arquivo).
3. Invocar `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` **versão completa**.
4. Salvar:
   ```text
   artifacts/l3-brief-<pacote_prefix>-<branch_id>.md
   ```
5. Atualizar `artifacts/l3-brief-<pacote_prefix>-INDEX.md` (ou `…-index.md`) se existir / pedido.
6. **GATE** (§ Gate Fase 3b) antes de handcraft em massa ou React.
7. **Proibido** implementar React no brief — só handoff.

---

## Inputs obrigatórios (Modo B)

| Campo | Exemplo |
|-------|---------|
| Subtópico canônico | `Saúde do Adolescente` |
| `pacote_prefix` | `saude-adolescente` |
| `branch_id` | `adolescente_etica_sigilo` |
| Família | `vf` \| `certo_errado` \| `protocolo` \| `calc` \| `legis` \| `conceito` \| `text_fragment` |
| Âncora | `examples/questao-premium-…json` **ou** enunciado + gabarito |
| Erro espacial (1 frase) | Confunde sigilo com “sempre contar aos pais” |
| Decisão | `molde_redesign` \| `molde_inedito` |
| `bespoke_target` (se houver) | `adolescent-exceto-isolate-board` |

Faltar âncora → pedir. **Não** inventar questão nem gabarito.  
Nome canônico do subtópico: CLAUDE.md §9 (exato).

---

## Decisão rápida (árvore)

```text
Pegadinha = só texto × texto E compare/rows/tap bastam?
  SIM → ok_generico  (Modo A; sem artifacts/l3-brief-* novo)
  NÃO ↓
Ramo ≥5 slugs OU ≥10% do subtópico?  (cluster / playbook)
  NÃO → ok_generico (cauda longa)
  SIM ↓
Erro espacial / sequencial / categorial / numérico estruturado?
  NÃO → ok_generico com teste 3/3 documentado
  SIM → molde_redesign | molde_inedito → Modo B
```

**Teste espacial 3/3** (rebaixar ramo forte a genérico — documentar no relatório):

1. Pegadinha **não** é espacial?
2. Padrão em &lt;5 questões **e** &lt;10%?
3. `compare` + `correct` (e `rows` / tap) já ensina sem UI bespoke?

Se **todas** sim → `ok_generico`.

Fonte normativa da decisão: `@docs/L3_MAPEAMENTO_CONVERSA.md` + `@docs/VARIANT_MOLDS.md` §2.

---

## Layouts genéricos premium (Modo A e fallback)

| Slide | Preferência |
|-------|-------------|
| `concept_map` | `morphological` (3+) ou `bridge` (2 pólos) |
| `golden_rule` | `rows[]` → `reference_table` (doses, intervalos, leis) |
| `logic_flow` | `reveal_mode: "tap"` |
| `danger_zone` | `items[].correct` → `compare` |

**Não** enviar `template` / `layout_variant` no JSON até o molde estar wired — slots **compatíveis** com o brief futuro.

Densidade: alvo ≤110 chars em `detail` / `step` / `value` (âncora-handcraft §3b).

---

## Metáforas clínicas (universos — escolher 1 por ramo)

Não inventar universo novo se o brief/playbook já nomeou um.

| Universo | Quando (exemplos TE) |
|----------|----------------------|
| Trilho / rail | Absorção de vias, ADME, cadeia de sobrevida |
| Timeline / calendário | PNI, intervalos vacinais, prazos |
| Matriz 2D | Intervalo vacina×vacina, curativo×ferida, responsabilidade |
| Deck / camadas | Estágios de ferida, fases de protocolo |
| Arena / trap | EXCETO, via errada, dose/unidade |
| Painel / board | Tabela normativa PK/PD, sinais vitais |
| Cortina / espectro | Sigilo / ética adolescente |
| Z-rail / limiares | Antropometria / escore Z |
| Orbit / blocos | Lei (ex. Art. 4º SUS), composição normativa |
| Juggle V/F | Afirmativas I–II–III |

Formatos kebab (`*-rail`, `*-matrix`, `*-arena`…): `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` § taxonomia.

### Contrato por slide (resumo)

| Slide | Função | Proibido |
|-------|--------|----------|
| `concept_map` | Terreno + pegadinha-âncora | Gabarito / letra |
| `logic_flow` | Decisões + gabarito + “Em similares…” | Só paráfrase de option |
| `golden_rule` | `rows` portátil + fonte | Row “Gabarito letra X” |
| `danger_zone` | 1 card/letra errada + transferência | `correct` repetido; frase-coringa EXCETO |

---

## Gate Fase 3b (Modo B — obrigatório)

- [ ] Metáfora **única** 4/4
- [ ] 4× `layout_variant` nomeados (`<tema>-<conceito>-<formato>`)
- [ ] Erro espacial em 1 frase
- [ ] Contrato JSON + palavras-gatilho por slot
- [ ] Wire: gesto, estado inicial → final (cada slide)
- [ ] Par concept_map ↔ danger_zone
- [ ] DoD: 375px legível, 0 hardcode de gabarito no componente, ≤7 slots/tela, slots ≤110c (`detail`/`step`/`value`)
- [ ] Path: `artifacts/l3-brief-<pacote_prefix>-<branch_id>.md`
- [ ] Números/doses com fonte Tier A/B no contrato (quando aplicável)
- [ ] Barra TE: tap = decisão; vontade de estudar
- [ ] (Flagship) opcional: `Design visual: <ramo>` via `avant-neuroslides-visual` antes de React

Falha → reescrever; **não** escalar handcraft do ramo nem React.

---

## Invocação rápida (copiar)

```text
@docs/RAMO_FORTE_QUICK_REF.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@docs/L3_BRIEF_TEMPLATE.md
@artifacts/l3-brief-FLAGSHIP-INDEX.md
@docs/PROMPT_VARIANTES_NEUROSLIDES.md
@.cursor/skills/brief-enfermagem/SKILL.md
@.cursor/skills/brief-enfermagem/reference-pacotes.md
@data/catalog-migration/handcraft-registry.json

Brief TE: adolescente_etica_sigilo
Subtópico: Saúde do Adolescente
pacote_prefix: saude-adolescente
Família: certo_errado
Âncora: <path examples/ ou enunciado+gabarito>
Erro espacial: …
Decisão: molde_redesign
Target: <bespoke_target do playbook/brief INDEX>

Gere brief 4/4 completo (versão completa do prompt).
Salvar em artifacts/l3-brief-saude-adolescente-adolescente_etica_sigilo.md
```

Pré-visualizar escopo do pacote:

```bash
npm run handcraft:brief -- --subtopico="<Subtópico canônico>"
```

---

## Saída

### Após cada questão (Modo A)

```text
Subtópico: … | Ramo: <branch_id> | Metáfora: <1 frase>
L3: ok_generico | molde_redesign | molde_inedito — <motivo>
Brief: <path> | n/a (genérico)
```

### Após Modo B

1. `artifacts/l3-brief-<pacote_prefix>-<branch_id>.md`
2. Gate 3b marcado
3. (Opcional flagship) `Design visual: <ramo>` — `avant-neuroslides-visual`
4. Próximo: `Handcraft:` âncora **ou** `Implementar molde: <ramo>` (só se usuário pedir)
5. Se React: `@docs/VARIANT_MOLDS.md` §3 + gates pacote — `audit:l3-mold-gap` · `e2e/visual-mold-regression` · `capture:questao-review` (ver `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` §5)

**Wiring:** brief **nomeia** `layout_variant`; JSON handcraft **omite** — player resolve via mapa do ramo/subtópico.

---

## Barra TE (obrigatória)

| Slide | Sensação |
|-------|----------|
| `concept_map` | “É **isso** que a banca testa” (≤5s) |
| `logic_flow` | “Eu **decido** sozinho” (tap = progresso) |
| `golden_rule` | “Levo **isto** pra prova” (tabela/norma) |
| `danger_zone` | “Quase caí nisso” (compare) |

Proibido: apostila, ícone decorativo, animação sem significado, inventar dose/intervalo sem fonte.

---

## Anti-padrões

- Brief formal para `ok_generico` / cauda longa sem pedido
- Escalar handcraft de ramo forte **sem** `artifacts/l3-brief-*` aprovado
- Declarar bespoke e entregar só genérico **sem** brief
- Implementar React no mesmo passo do brief
- Misturar ramos no mesmo card (ex. IPCS/CVC em questão sem âncora)
- Reciclar `danger_zone.correct` / frase-coringa em EXCETO
- Inventar âncora, gabarito ou número normativo
- Duplicar `PROMPT_VARIANTES` nesta skill — **linkar**
- Usar esta skill para **Língua Portuguesa** (usar `brief-lingua-portuguesa`)
- Criar 41 skills de brief — um orquestrador + playbooks basta

---

## Frase norte

> Brief TE alinha o **gesto clínico da prova** (trilho, matriz, timeline, arena) ao JSON e ao molde futuro — o técnico vê o erro da banca e quer a próxima questão.
