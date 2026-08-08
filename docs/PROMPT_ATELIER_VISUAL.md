# Prompt — Atelier visual NeuroSlides (crítica + elevação)

Use em **conversa Agent** para **crítica glanceable** e elevação: proposta → `ATELIER_PASS`/`FAIL` → só então código.

> **Composer = orquestrador** (entrada preferida para pipeline completo): [`PROMPT_COMPOSER_VISUAL.md`](PROMPT_COMPOSER_VISUAL.md) · banco [`artifacts/composer-visual-bank.md`](../artifacts/composer-visual-bank.md).  
> **Atelier = crítica** (este prompt + kit). Não substitui o Composer.

Kit de referências: [`NEUROSLIDES_ATELIER_KIT.md`](NEUROSLIDES_ATELIER_KIT.md).

---

## Como disparar

```text
Atelier visual: <branch_id ou Subtópico + ramo>
```

Para orquestração completa (banco → Modo V → crítica → handoff), preferir:

```text
Composer visual: <branch_id>
```

Variantes:

| Trigger | Quando |
|---------|--------|
| `Composer visual: <ramo>` | Pipeline completo — ver `PROMPT_COMPOSER_VISUAL` |
| `Atelier visual: <ramo>` | Ciclo proposta + crítica (sem orquestrador completo) |
| `Crítica atelier:` + anexar PNG / path | Só julgar (PASS/FAIL) sem redesenhar ainda |
| `Atelier visual:` + `Só Modo A` | Densidade JSON; sem React |
| `Atelier visual:` + prints anexados + `Salvar visual_gallery` | Persistir PNG do player no playbook |

---

## Anexos recomendados

```text
@artifacts/composer-visual-bank.md
@docs/NEUROSLIDES_ATELIER_KIT.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@docs/NEUROSLIDES_VISUAL_STRATEGY.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@artifacts/neuroslides-g2-demo.html
@artifacts/l3-brief-<pacote>-<ramo>.md
@<path-json-ancora>
```

Opcional: playbook do pacote · `visual_gallery` · índice PT · `@docs/PROMPT_COMPOSER_VISUAL.md`.

---

## Prompt completo (copiar)

Edite as linhas marcadas:

```text
Atelier visual: RAMO: <branch_id>

Erro espacial (1 frase): <…>
Pacote: <Subtópico canônico>
Âncora: @<path.json>
Brief: @artifacts/l3-brief-….md (ou ok_generico)

Gestos ouro a abrir antes de propor (nº do kit): <ex. 1 e 2>
Piso: @artifacts/neuroslides-g2-demo.html
Kit: @docs/NEUROSLIDES_ATELIER_KIT.md
Skill: @.cursor/skills/avant-neuroslides-visual/SKILL.md
Barra: @docs/NEUROSLIDES_VISUAL_BAR.md

Modo: Agent
Objetivo: elevar glanceable + orçamento de clique + mobile ao nível especialista.
Proibido: feed/Instagram; hardcode de letra no TSX; re-handcraft em massa; React sem "Implementar molde:".

---

FASE 1 — CALIBRAGEM (obrigatória)
1. Abrir banco Composer (`composer-visual-bank.md`) + demo G2 + 1–2 âncoras ouro do gesture_id (preview /dev/slide-mold-review ou captures_dir).
2. Nomear gesto único do ramo (1 frase) coerente com brief e com o gesture_id do banco.
3. Listar 3 anti-padrões deste ramo.

FASE 2 — PROPOSTA (Modo V — sem React)
Saída no formato skill:
## Design visual — <ramo>
Gesto: …
Erro espacial: …
4/4: concept=… | golden=… | logic=… | danger=…
Inspiração → AVANT: <3 bullets — princípios, não cópia>
Anti-padrões: …
Orçamento de clique (família): …
Handoff: brief | React: não
DoD retenção: PASS | FAIL

FASE 3 — CRÍTICA ATELIER (auto-crítica antes de pedir OK humano)
Julgar a proposta (e PNGs se anexados) com checklist 8 itens do kit.
Para cada FAIL: 1 correção concreta (hierarquia / corte / tap / tipografia).
Veredito: ATELIER_PASS | ATELIER_FAIL
Se FAIL: reescrever Fase 2 uma vez — não implementar React.

FASE 4 — SÓ APÓS ATELIER_PASS + OK humano (se pedido)
- Modo A: densificar slots JSON se necessário
- Implementar molde: somente se gesto novo ou ≥5 questões sem board
- P1 shells se for logic_tap genérico
- capture:questao-review OU salvar prints anexados em artifacts/questao-review/<slug>/
- Atualizar visual_gallery (captures_dir, status ready, note)
- Report: visual_bar: pass | vs_anterior: …

Ratchet: nada pode ficar pior que o gesto ouro / molde anterior do mesmo gesto.
```

---

## Saída da crítica isolada (`Crítica atelier:`)

```text
## Crítica atelier — <ramo ou slug>
Glanceable 1–8: pass/fail por item
Herói em 1s: sim | não — <o quê apontar>
Taps: N (orçamento família: …) — OK | FAIL
Mobile 375: OK | FAIL — <motivo>
Cor = decisão: OK | FAIL
Ratchet vs ouro #<n>: melhor | igual | pior
Veredito: ATELIER_PASS | ATELIER_FAIL
Próximo passo: <1 linha>
```

---

## Salvar prints do player

```text
Salvar na visual_gallery do ramo <branch_id> (pacote <Subtópico>).
Prints anexados = player AVANT da âncora <slug>.
Path: artifacts/questao-review/<slug>/
Atualizar playbook + índice se existir.
status: ready
```

---

## Não fazer

- Começar no React  
- Usar print de feed como referência de galeria  
- Declarar nota-10 visual sem checklist 8 ou sem evidência (preview/capture)  
- Misturar `Visual:` (vitrine) com atelier de molde  
- Acumular âncoras no banco Composer além de **≤2** por gesto (podar; ver kit § Governança + `PROMPT_COMPOSER_VISUAL`)  
