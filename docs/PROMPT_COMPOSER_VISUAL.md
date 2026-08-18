# Prompt — Composer visual (NeuroSlides Agent-first)

Use em **conversa Agent** para orquestrar gesto → mapa 4/4 → crítica atelier → handoff (JSON ou molde), **só no player NeuroSlides**.

> **Banco curado:** [`artifacts/composer-visual-bank.md`](../artifacts/composer-visual-bank.md)  
> **Crítica:** [`PROMPT_ATELIER_VISUAL.md`](PROMPT_ATELIER_VISUAL.md) · kit [`NEUROSLIDES_ATELIER_KIT.md`](NEUROSLIDES_ATELIER_KIT.md)  
> **Skill:** [`.cursor/skills/avant-neuroslides-visual/SKILL.md`](../.cursor/skills/avant-neuroslides-visual/SKILL.md)  
> **Barra:** [`NEUROSLIDES_VISUAL_BAR.md`](NEUROSLIDES_VISUAL_BAR.md) · piso [`artifacts/neuroslides-g2-demo.html`](../artifacts/neuroslides-g2-demo.html)  
> **Fábrica (depois):** [`PROMPT_FABRICA_VISUAL_G2.md`](PROMPT_FABRICA_VISUAL_G2.md) — Composer **precede** a Fábrica quando gallery `pending`/`thin`.

**Escopo fechado:** saída = NeuroSlides no player (gesto → molde 4/4). Sem export HTML/PNG/ficha WhatsApp, sem carrossel/feed, sem product UI aluno/admin, sem 5º `type`.

**Papéis**

| Papel | Trigger / doc |
|-------|----------------|
| Orquestrador | **`Composer visual:`** (este prompt) |
| Crítica glanceable | `Crítica atelier:` / Fase 3 deste pipeline |
| Densidade JSON | Modo A / `Só Modo A` |
| React | Só `Implementar molde:` |
| Cobertura por pacote | `Fábrica visual G2:` após `ATELIER_PASS` |

---

## Como disparar

```text
Composer visual: <branch_id ou Subtópico + ramo>
```

### Variantes

| Trigger | Quando |
|---------|--------|
| `Composer visual: <ramo>` | Pipeline completo até handoff (sem React até pedido) |
| `Composer visual:` + `Só Modo A` | Após PASS: densificar JSON; sem React |
| `Crítica atelier:` | Só julgar proposta/PNG (ver `PROMPT_ATELIER_VISUAL`) |
| `Composer visual:` + encadear `Fábrica visual G2:` | Após PASS no pacote com gallery a elevar |

---

## Anexos recomendados

```text
@artifacts/composer-visual-bank.md
@docs/PROMPT_COMPOSER_VISUAL.md
@docs/NEUROSLIDES_ATELIER_KIT.md
@docs/PROMPT_ATELIER_VISUAL.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md
@artifacts/neuroslides-g2-demo.html
@artifacts/l3-brief-<pacote>-<ramo>.md
@<path-json-ancora>
```

Opcional: playbook do pacote · `visual_gallery` · índice L3 da galeria.

---

## Prompt completo (copiar)

Edite as linhas marcadas:

```text
Composer visual: RAMO: <branch_id>

Pacote: <Subtópico canônico>
Erro espacial (1 frase): <…>
Âncora: @<path.json>
Brief: @artifacts/l3-brief-….md (ou ok_generico)

Banco: @artifacts/composer-visual-bank.md
Piso: @artifacts/neuroslides-g2-demo.html
Kit: @docs/NEUROSLIDES_ATELIER_KIT.md
Skill: @.cursor/skills/avant-neuroslides-visual/SKILL.md
Barra: @docs/NEUROSLIDES_VISUAL_BAR.md

Modo: Agent
Objetivo: pacote 4/4 no piso G2 ou acima, ≤2 refs ouro do banco, sem feed, sem React espontâneo.
Proibido: Instagram/carrossel; hardcode de letra no TSX; re-handcraft em massa; React sem "Implementar molde:".

---

PIPELINE FIXO

1) BANCO + PISO
- Abrir composer-visual-bank.md → escolher 1 gesture_id (mesmo gesto do ramo ou vizinho justificado).
- Abrir demo G2 + 1–2 âncoras ouro da linha do gesto.
- Se visual_gallery do ramo = pilot/ready: abrir captures_dir do playbook.

2) MODO V (formato skill — sem React)
## Design visual — <ramo>
Gesto: <gesture_id + nome>
Erro espacial: …
4/4: concept=… | golden=… | logic=… | danger=…
Primitives preferidos (banco): …
Inspiração → AVANT: <3 bullets — princípios, não cópia>
Anti-padrões: …
Orçamento de clique (família): …
Handoff: brief | React: não (ainda)
DoD retenção: PASS | FAIL

3) AUTO-CRÍTICA ATELIER
- Checklist 8 itens do kit / PROMPT_ATELIER_VISUAL.
- Veredito: ATELIER_PASS | ATELIER_FAIL
- Se FAIL: reescrever Modo V uma vez — não implementar React.

4) HANDOFF (só após ATELIER_PASS)
- Gesto já no banco + board/variant existe → reuso + polish + Modo A JSON (proibido React novo).
- Gesto novo OU ≥5 questões sem board → pedir/aguardar `Implementar molde:` (compor primitives/shells).
- `Só Modo A` no trigger → só densificar slots JSON.

5) CAPTURE + BANCO
- capture:questao-review OU prints do player → visual_gallery ready (captures_dir, layouts, note).
- Se elevou o ouro do gesto: atualizar no máx. 1 path na linha do banco (≤2 âncoras/gesto).
- Report: visual_bar: pass | gesto: <id> | vs_anterior: … | anti_regressao: …

Ratchet: nada pior que a âncora ouro / molde anterior do mesmo gesture_id.
```

---

## Decisão React vs reuso

| Condição | Ação |
|----------|------|
| `gesture_id` no banco `gold`/`thin` + variant/board do ramo existe | Reuso + Modo A / polish — **sem** React novo |
| Gallery `pending`/`thin` no playbook | Composer **antes** de abrir variant nova na Fábrica |
| Gesto espacial **novo** ou ≥5 slugs sem board | `Implementar molde:` + primitives do banco |
| Pegadinha só textual / cauda | `ok_generico` — não Composer longo |

---

## Governança do banco (obrigatória)

Evitar banco inchado. Espelho no kit: [`NEUROSLIDES_ATELIER_KIT.md`](NEUROSLIDES_ATELIER_KIT.md) § Governança · tabela viva: [`composer-visual-bank.md`](../artifacts/composer-visual-bank.md).

**Hard caps**

- **≤2** âncoras ouro por `gesture_id` na coluna de captures do banco.  
- Por chat Composer: abrir **1–2** refs ouro do gesto (+ demo G2) — não moodboard.  
- Elevate pós-ship: no máx. **1** path ouro por gesto (substituir se melhor).  
- Paths só do **player** (`artifacts/questao-review/…` ou `/dev/slide-mold-review`).  
- **Sem feed:** Instagram / carrossel / @marca / poster externo → princípios em bullets; **nunca** path na gallery ou no banco.

| Evento | Ação |
|--------|------|
| Novo molde shipped | Atualizar no máx. **1** capture ouro do gesto (substituir se melhor) |
| Print externo anexado | Extrair princípios só; **nunca** path na gallery/banco |
| Gesto novo proposto | Entrar no banco só após piloto `ATELIER_PASS` + primitive reutilizável |
| 3+ âncoras no mesmo gesto | **Podar** para as 2 melhores (herói 1s + mobile + `ready`) |
| Onda / semanal | Revisão humana do herói em 1s — gosto final humano (kit atelier) |

**Poda:** se a linha tiver 3+ paths, manter as 2 com melhor glanceable em 375px e gallery `ready`; remover o mais fraco da célula do banco (não apagar captures do playbook sem pedido).

---

## Fora de escopo

- Export ficha/poster / WhatsApp  
- UI admin “gerar visual”  
- Imagen/diffusion one-shot  
- Schema novo / 5º tipo de slide  
- Re-handcraft em massa só por visual  
- Moodboard de feed  

---

## Encadeamento Fábrica

Composer não substitui a Fábrica — **precede** quando `visual_gallery` do ramo = `pending` / `thin` / ausente. Contrato canônico na Fábrica: [`PROMPT_FABRICA_VISUAL_G2.md`](PROMPT_FABRICA_VISUAL_G2.md) § Pré-passo Composer.

Após `ATELIER_PASS` no ramo/pacote:

```text
Fábrica visual G2: SUBTÓPICO: <Subtópico canônico>
```

Se o gesto já está no banco e o board/variant existe → Fábrica só polish + capture gallery (sem React novo). Ordem de pacotes e validação do hook: mesmo prompt Fábrica · [`artifacts/composer-fabrica-hook-processo-de-enfermagem.md`](../artifacts/composer-fabrica-hook-processo-de-enfermagem.md).

---

## Critério de sucesso

Com `Composer visual: <ramo>`, o agente produz de forma repetível um 4/4 no **piso G2 ou acima**, usando ≤2 refs ouro do banco, sem feed e sem React espontâneo — e o banco permanece ≤2 âncoras/gesto.
