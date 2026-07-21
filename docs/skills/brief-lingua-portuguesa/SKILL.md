---
name: brief-lingua-portuguesa
description: >-
  Brief L3 + metáfora visual para Língua Portuguesa no AVANT. Orquestra decisão
  ok_generico vs molde_redesign, gera brief 4/4 (Fase 3b) em artifacts/l3-brief-*,
  preenche slots JSON com gesto espacial e alinha handcraft ao funil/trilho/arena.
  Use com Brief PT:, Mapeamento L3 PT, handcraft Português, pt_crase, pt-crase-funnel,
  slides ultra-premium de Português ou quando o usuário pedir brief de ramo PT.
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# Brief — Língua Portuguesa (AVANT)

Skill **orquestradora** de L3 para Português: decisão → metáfora → brief formal (se ramo forte) → slots no handcraft.

**Não** substitui:
- `professor-lingua-portuguesa-concurso` (conteúdo / bancas)
- `avant-golden-anchor-handcraft` (family → slots / densidade)
- `avant-json-template` (forma JSON)
- `avant-neuroslides-visual` (barra de retenção pós-brief — encadear, não duplicar)
- React (`VARIANT_MOLDS` — só com pedido explícito)

**Enfermagem (41 subtópicos):** use `brief-enfermagem` — não esta skill.

---

## Triggers

| Usuário diz / contexto | Modo |
|------------------------|------|
| `Brief PT: <ramo>` / `Brief: Língua Portuguesa — pt_crase` | **B** — brief 4/4 formal |
| `Mapeamento L3: Língua Portuguesa` (+ Fase 3b) | **B** por ramo forte |
| Handcraft PT / lote gNN / “slides ultra-premium” | **A** — metáfora + slots no JSON |
| `Implementar molde: pt_*` | Ler brief existente → handoff `VARIANT_MOLDS` (não codar sem autorização) |

---

## Encadeamento

| Ordem | Skill / doc | Papel |
|------:|-------------|--------|
| 1 | `professor-lingua-portuguesa-concurso` | O que ensinar |
| 2 | `avant-golden-anchor-handcraft` | Family → logic_flow primeiro |
| 3 | **`brief-lingua-portuguesa` (esta)** | Metáfora · decisão L3 · brief 4/4 |
| 4 | `avant-json-template` | Forma JSON / meta |
| 5 | `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` | Corpo do brief formal (versão completa) |
| 6 | `avant-neuroslides-visual` | Barra de retenção / Design visual (pós-brief; sem React) |
| 7 | `@docs/VARIANT_MOLDS.md` | Só se usuário pedir React |

Refs locais: [`reference-metaforas.md`](reference-metaforas.md) · [`reference-ramos.md`](reference-ramos.md)  
Playbook: `data/catalog-migration/handcraft-playbooks/lingua-portuguesa.json`  
Guideline: `docs/LINGUA_PORTUGUESA_GUIDELINES.md`

Corpo do brief (taxonomia `*-funnel`/trilhos PT, contrato `correct`/EXCETO, densidade, handoff): `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` — **linkar**, não copiar.

---

## Dois modos (eficiência)

### Modo A — Handcraft (toda questão)

1. Classificar eixo (`meta.subtopico`) + família + ramo `pt_*` ([`reference-ramos.md`](reference-ramos.md)).
2. Abrir linha em [`reference-metaforas.md`](reference-metaforas.md).
3. Nomear erro espacial em 1 frase **ou** “não espacial → ok_generico”.
4. Aplicar metáfora **única** nos 4 slides (genérico premium).
5. Saída curta após o JSON (ver § Saída).

**Não** gravar `artifacts/l3-brief-*.md` no Modo A, salvo pedido explícito.

### Modo B — Brief 4/4 formal (ramo forte)

Só se decisão = `molde_redesign` | `molde_inedito` (ou usuário pediu `Brief PT:`).

1. Inputs obrigatórios (§ Inputs).
2. Teste espacial 3/3 (§ Decisão) — se 3× sim → `ok_generico` e **parar** (sem arquivo).
3. Invocar `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` **versão completa**.
4. Salvar:
   ```text
   artifacts/l3-brief-lingua-portuguesa-<branch_id>.md
   ```
5. Atualizar índice `artifacts/l3-brief-lingua-portuguesa-index.md` (se existir / pedido).
6. **GATE** (§ Gate Fase 3b) antes de handcraft em massa ou React.
7. **Proibido** implementar React no brief — só handoff.

---

## Inputs obrigatórios (Modo B)

Antes de escrever o brief, coletar:

| Campo | Exemplo |
|-------|---------|
| Subtópico / card | `Crase` |
| `branch_id` | `pt_crase` |
| Família | `certo_errado` |
| Âncora | path `examples/…` **ou** enunciado + gabarito |
| Erro espacial (1 frase) | Crase automática sem funil |
| Decisão | `molde_redesign` |
| `bespoke_target` | `pt-crase-funnel` |

Se faltar âncora: pedir — **não** inventar questão.

---

## Decisão rápida (árvore)

```text
Pegadinha = só texto × texto E compare/rows/tap bastam?
  SIM → ok_generico  (Modo A; sem artifacts/l3-brief-*)
  NÃO ↓
Ramo ≥5 slugs OU ≥10% do pacote?  (playbook / cluster)
  NÃO → ok_generico (cauda longa)
  SIM ↓
Erro espacial / sequencial / categorial?
  NÃO → ok_generico com teste 3/3 documentado
  SIM → molde_redesign | molde_inedito → Modo B
```

**Teste espacial 3/3** (para rebaixar ramo forte a genérico — documentar):

1. Pegadinha **não** é espacial?
2. Padrão em &lt;5 questões **e** &lt;10%?
3. `compare` + `correct` já ensina sem UI bespoke?

Se **todas** sim → `ok_generico`.

Tabela canônica ramo × decisão: [`reference-ramos.md`](reference-ramos.md).

---

## Layouts genéricos premium (Modo A e fallback)

| Slide | Preferência |
|-------|-------------|
| `concept_map` | `morphological` (3+) ou `bridge` (2 pólos) |
| `golden_rule` | `rows[]` → `reference_table` |
| `logic_flow` | `reveal_mode: "tap"` |
| `danger_zone` | `items[].correct` → `compare` |

**Não** enviar `template` / `layout_variant` no JSON até o molde estar wired — slots devem ser **compatíveis** com o brief futuro.

---

## Metáfora única 4/4

| Universo | Quando |
|----------|--------|
| Zonas do texto | Interpretação / inferência |
| Funil de testes | Crase / ortografia pontual |
| Trilho do período | Sintaxe / orações |
| Núcleo em foco | Concordância |
| Seta da regência | Regência |
| Arena EXCETO | INCORRETA / EXCETO |
| Diff de reescrita | Sem prejuízo de sentido |
| Painel de conectivos | Coesão / pontuação / tipologia |

Detalhe + ícones: [`reference-metaforas.md`](reference-metaforas.md).

### Contrato por slide (resumo)

| Slide | Função | Proibido |
|-------|--------|----------|
| `concept_map` | Terreno + pegadinha-âncora | Gabarito / letra |
| `logic_flow` | Decisões + gabarito + “Em similares…” | Só paráfrase de option |
| `golden_rule` | `rows` portátil | Row “Gabarito letra X” |
| `danger_zone` | 1 card/letra errada + transferência | `correct` repetido; frase-coringa EXCETO |

Densidade alvo ≤110 chars (`detail` / `step` / `value`). Taxonomia kebab completa: `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` § taxonomia.

---

## Bespoke targets (kebab)

| `layout_variant` / pacote | Uso |
|---------------------------|-----|
| `pt-text-zones` | Dito / inferido / extrapolado |
| `pt-crase-funnel` | Funil 3 testes (crase a/à) |
| `pt-clitic-rail` | Próclise / ênclise / mesóclise |
| `pt-comma-rail` | Vírgula — o que isola; S\|V livre; vocativo |
| `pt-period-rail` | Período → oração → tipo |
| `pt-subject-focus` | Núcleo do sujeito |
| `pt-regency-arrow` | Regente → prep → complemento |
| `pt-term-matrix` | Termos da oração |
| `pt-exceto-arena` | 4 corretas × 1 intrusa |
| `pt-rewrite-diff` | Reescrita semântica |

Prioridade React sugerida: crase / colocação / pontuação → EXCETO → período / núcleos → text-zones.

---

## Gate Fase 3b (Modo B — obrigatório)

Antes de declarar brief OK:

- [ ] Metáfora **única** 4/4
- [ ] 4× `layout_variant` nomeados (`pt-…-formato`)
- [ ] Erro espacial em 1 frase
- [ ] Contrato JSON + palavras-gatilho por slot
- [ ] Wire: gesto, estado inicial → final (cada slide)
- [ ] Par concept_map ↔ danger_zone
- [ ] DoD: 375px legível, 0 hardcode de gabarito no componente, ≤7 slots/tela, slots ≤110c
- [ ] Path salvo: `artifacts/l3-brief-lingua-portuguesa-<branch_id>.md`
- [ ] Barra TE: tap = decisão; vontade de estudar
- [ ] (Flagship) opcional: `Design visual: <ramo>` via `avant-neuroslides-visual` antes de React

Falha → reescrever brief; **não** escalar handcraft do ramo nem React.

---

## Invocação rápida (copiar)

```text
@docs/RAMO_FORTE_QUICK_REF.md
@docs/L3_MAPEAMENTO_CONVERSA.md
@docs/L3_BRIEF_TEMPLATE.md
@artifacts/l3-brief-FLAGSHIP-INDEX.md
@docs/PROMPT_VARIANTES_NEUROSLIDES.md
@.cursor/skills/brief-lingua-portuguesa/SKILL.md
@.cursor/skills/brief-lingua-portuguesa/reference-metaforas.md
@.cursor/skills/brief-lingua-portuguesa/reference-ramos.md

Brief PT: pt_crase
Subtópico: Crase
Família: certo_errado
Âncora: <path ou enunciado+gabarito>
Erro espacial: crase automática sem funil masculino→verbo→a+a
Decisão: molde_redesign
Target: pt-crase-funnel

Gere brief 4/4 completo (versão completa do prompt).
Salvar em artifacts/l3-brief-lingua-portuguesa-pt_crase.md
```

---

## Saída

### Após cada questão (Modo A)

```text
Eixo: Crase | Ramo: pt_crase | Metáfora: funil 3 testes
L3: ok_generico | molde_redesign | molde_inedito — <motivo 1 frase>
Brief: <path> | n/a (genérico)
```

### Após Modo B

1. Arquivo `artifacts/l3-brief-lingua-portuguesa-<branch_id>.md`
2. Checklist Gate 3b marcado
3. (Opcional flagship) `Design visual: <ramo>` — `avant-neuroslides-visual`
4. Próximo passo: `Handcraft:` âncora **ou** `Implementar molde: <ramo>` (só se usuário pedir)
5. Se React: `@docs/VARIANT_MOLDS.md` §3 + gates pacote — `audit:l3-mold-gap` · `e2e/visual-mold-regression` · `capture:questao-review` (ver `@docs/PROMPT_VARIANTES_NEUROSLIDES.md` §5)

**Wiring:** brief **nomeia** `layout_variant`; JSON handcraft **omite** — player resolve via mapa do ramo/subtópico.

---

## Barra TE (obrigatória)

Visual puxa **ação**:

| Slide | Sensação |
|-------|----------|
| `concept_map` | “É **isso** que a banca testa” (≤5s) |
| `logic_flow` | “Eu **decido** sozinho” (tap = progresso) |
| `golden_rule` | “Levo **isto**” (tabela/funil) |
| `danger_zone` | “Quase caí nisso” (compare) |

Proibido: apostila, ícone decorativo, animação sem significado.

---

## Anti-padrões

- Brief formal para ramo `ok_generico` sem pedido
- Escalar handcraft de ramo forte **sem** `artifacts/l3-brief-*` aprovado
- Declarar bespoke e entregar só genérico **sem** brief
- Implementar React no mesmo passo do brief
- Misturar eixos no mesmo card (crase + concordância)
- Reciclar `danger_zone.correct`
- Inventar âncora / gabarito
- Duplicar o texto inteiro de `PROMPT_VARIANTES` nesta skill — **linkar**, não copiar

---

## Frase norte

> Brief PT alinha o **gesto** (funil, trilho, arena) ao JSON e ao molde futuro — o aluno vê o teste da banca e quer a próxima questão.
