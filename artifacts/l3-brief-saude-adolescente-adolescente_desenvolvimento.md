# BRIEF DE VARIANTES — Saúde do Adolescente / adolescente_desenvolvimento

**Gerado:** 2026-07-13  
**Política:** `ok_generico` (volume 1 slug — 6,25%)  
**Família:** `conceito` · `certo_errado`  
**Template:** `sky` (t08)  
**Âncora amostra:** `nao-informado-geral-saude-do-adolescente-1777104229064-0` (puberdade / desenvolvimento)  
**Pacote atual:** `ADOLESCENTE_GENERIC_DESIGN`

---

## 0. Erro pedagógico típico

Confundir **estágios de Tanner/puberdade**, inverter ordem de eventos (crescimento × caracteres sexuais secundários), ou misturar faixa etária com marco de desenvolvimento.

**Decisão L3:** genérico premium **suficiente** hoje — erro é conceitual/sequencial, não espacial como escore Z.

---

## 1. Pacote atual (implementado)

| Slide | Layout | Função semântica |
|-------|--------|------------------|
| `concept_map` | `morphological` | Pilares do desenvolvimento (ícone + label + detail) |
| `golden_rule` | `reference_table` (`rows[]`) | Tabela de marcos / estágios / idades |
| `logic_flow` | `vertical` + `reveal_mode: tap` | Eliminação + gabarito passo a passo |
| `danger_zone` | `compare` + `items[].correct` | Pegadinha × conduta correta por distrator |

**Guards:** **não** usar `adolescent-privacy-curtain` nem trilho Z — inferência deve cair em `adolescente_desenvolvimento` sem vocabulário de sigilo/Z.

---

## 2. Metáfora genérica (conteúdo no JSON)

- **concept_map:** nós de “crescimento”, “puberdade”, “autonomia”, “saúde reprodutiva” — sem spoiler.
- **golden_rule:** `rows` com marcos (ex. idade média menarca, G2 Tanner) — `content` opcional como título.
- **logic_flow:** passos que eliminam afirmações invertidas; último passo marca letra.
- **danger_zone:** cada `correct` explica **por que** a alternativa errada parece certa.

---

## 3. Bespoke futuro (condicional)

**Trigger:** ≥5 slugs no cluster puberdade/Tanner **e** erro espacial recorrente (trocar estágio vizinho na linha).

**Metáfora proposta:** `adolescent-puberty-timeline` — linha do tempo horizontal com estações G1–G5 / eventos; concept_map acende marcos; logic_flow posiciona alternativas no eixo.

**Até lá:** manter genérico; declarar `meta.pedagogical_branch: adolescente_desenvolvimento` no handcraft.

---

## 4. Anti-padrões

| Proibido | Motivo |
|----------|--------|
| Moldes `adolescent-*` de sigilo | Ramo ≠ ética |
| Trilho Z | Sem escore Z no enunciado |
| Spoiler de letra nos slides 1–2 | Estudo reverso |

---

## 5. DoD (genérico)

- [x] `BRANCH_DESIGN_MAP.adolescente_desenvolvimento` → `ADOLESCENTE_GENERIC_DESIGN`
- [x] Inferência em `pedagogicalBranch.ts` (puberdade, Tanner, desenvolvimento)
- [ ] Brief bespoke + React — **somente** se volume ≥5

**Status:** genérico premium em produção.
