# Kit atelier — NeuroSlides (nível especialista)

**Objetivo:** dar ao agente Cursor o mesmo *atelier* de um designer profissional de retenção: referências ouro AVANT + restrições duras + loop de crítica — sem moodboard de feed.

**Papéis (não confundir)**

| Papel | Trigger / doc | Função |
|-------|---------------|--------|
| **Composer** (orquestrador) | `Composer visual:` · [`PROMPT_COMPOSER_VISUAL.md`](PROMPT_COMPOSER_VISUAL.md) · banco [`composer-visual-bank.md`](../artifacts/composer-visual-bank.md) | Banco → Modo V → crítica → handoff; entrada preferida |
| **Atelier** (este kit) | `Atelier visual:` / `Crítica atelier:` · [`PROMPT_ATELIER_VISUAL.md`](PROMPT_ATELIER_VISUAL.md) | Crítica glanceable `ATELIER_PASS` \| `FAIL` |
| Skill retenção | [`avant-neuroslides-visual`](../.cursor/skills/avant-neuroslides-visual/SKILL.md) | Formato Modo V / Modo A |

**Usar com:** prompt atelier · skill · barra [`NEUROSLIDES_VISUAL_BAR.md`](NEUROSLIDES_VISUAL_BAR.md) · banco Composer (índice mestre dos 8 gestos).

**Piso vivo:** abrir [`artifacts/neuroslides-g2-demo.html`](../artifacts/neuroslides-g2-demo.html) antes de qualquer redesign.

**Política:** só referências do **player AVANT** (preview `/dev/slide-mold-review` ou PNG em `artifacts/questao-review/<slug>/`). Proibido indexar Instagram/carrossel na `visual_gallery`. Âncoras ouro canônicas: banco Composer (≤2 por gesto).

---

## Como o atelier funciona

Preferir disparar via **Composer** (orquestra o loop abaixo). `Atelier visual:` / `Crítica atelier:` = crítica isolada ou ciclo sem pipeline completo.

```text
1. Abrir banco Composer + 1–2 gestos ouro (mesmo gesture_id do ramo ou vizinho)
2. Design visual / Modo V: <ramo>  (+ erro espacial + anti-padrões)
3. Crítica atelier (PROMPT_ATELIER_VISUAL) — PASS/FAIL glanceable
4. Só então Implementar molde: / polish React / Modo A JSON
5. Capture ou prints do player → visual_gallery ready (+ linha do banco se elevou ouro)
6. Report: visual_bar: pass | o que subiu (ratchet)
```

| Papel | Quem |
|-------|------|
| Orquestração completa | `Composer visual:` |
| Gosto final (herói em 1s) | Humano |
| Proposta + handoff | Agente (Modo V / skill) |
| Crítica glanceable | Atelier (este kit) |
| React | Só com `Implementar molde:` |
| Conteúdo clínico | Handcraft / professor — **fora** deste kit |

---

## 8 gestos ouro (referência canônica)

**Índice operacional (gesto × capture × primitive):** [`artifacts/composer-visual-bank.md`](../artifacts/composer-visual-bank.md).  
Tabela abaixo = modelo mental pedagógico; o banco amarra paths ouro e status `gold`/`thin`/`gap`.

Abrir o **preview** (dev server) ou, se existir, o `captures_dir` do playbook. Cada linha = um *modelo mental* + âncora de produto — não clonar pixels.

| # | Gesto | O que o aluno deve gravar em 1s | Referência AVANT (preview) | Layouts / boards |
|---|-------|--------------------------------|----------------------------|------------------|
| 1 | **Isolate (EXCETO)** | A exceção pula do fundo — 0 taps | [`adolescente_etica_sigilo`](http://localhost:3000/dev/slide-mold-review?branch=adolescente_etica_sigilo) | `adolescent-exceto-isolate-board` · shells `LogicIsolateShell` · PNI `pni-exceto-isolate-board` |
| 2 | **Compare / arena** | ✗×✔ lado a lado; `correct` único | Mesmo branch ética (danger) · PT trap | `adolescent-exceto-compare` · `*-trap-arena` · `TwoColumnBoard` |
| 3 | **Deck / pilares** | 3 eixos paralelos, sem spoiler | Ética — concept | `adolescent-care-pillars-deck` · `PillarDeck` |
| 4 | **Chip + corpo** | Rótulo curto + norma portátil | Ética — golden speak-barrier | `adolescent-speak-barrier-board` · `LabelBodyRow` |
| 5 | **Rail / trilho** | Ordem de prova (XABCDE, ADME, Z) | [`adolescente_antropometria`](http://localhost:3000/dev/slide-mold-review?branch=adolescente_antropometria) · Urgências / Fármaco | `adolescent-growth-z-rail` · `urgencias-xabcde-rail` · `adme-journey-rail` · `LogicRailShell` |
| 6 | **Funil** | Cada estágio corta o chute | PT crase (galeria playbook) | `pt-crase-funnel-*` · `PolarityPanel` · tap ≤3 |
| 7 | **Número crítico / limiar** | Faixa ou dose que muda a letra | Antropometria Z · traps de limiar | `adolescent-z-band-board` · `CriticalNumber` · `*-threshold-trap` |
| 8 | **Focus / núcleo** | 1 card + decisão; tap só se muda decisão | Genéricos tap pós-P1 | `LogicFocusShell` · `*-focus` · budget ≤3 |

### Pacotes flagship (onde estudar o 4/4 completo)

| Pacote | Por que é ouro | Entrada |
|--------|----------------|---------|
| Saúde do Adolescente | Boards glanceable + EXCETO 0-tap | playbook `saude-adolescente.json` · mapa gestos `artifacts/glance-os-saude-adolescente-MAPA-8-GESTOS.md` |
| Farmacodinâmica | Journey rail ADME | `visual-anchors` ramos `farmaco_*` |
| Imunização (EXCETO + calendário) | Isolate + LabelBodyRow | Strategy Onda 3 / `pni-exceto-*` |
| Língua Portuguesa (crase / trilho) | Funil + arena com `visual_gallery` ready | `artifacts/l3-visual-gallery-lingua-portuguesa-index.md` |
| Urgências (amostra) | Rail XABCDE + tap budget | `urgencias-xabcde-rail` |

---

## Checklist glanceable (1 segundo no mobile)

Cópia operacional da barra — falha em **≥2** = FAIL atelier:

1. Herói único apontável  
2. Cards com massa (não branco sumido)  
3. Cor = decisão (keep / exception / trap)  
4. Tipografia legível (sem display ultra-largo)  
5. Âncora tipográfica (`NÃO`, `EXCETO`, `✓`/`✗`) sem poluir  
6. Footer de transferência  
7. JSON alimenta tudo (0 hardcode de letra no TSX)  
8. Responsivo fullscreen / coluna legível  

---

## Orçamento de clique (não negociar no atelier)

| Família | logic_flow | Outros |
|---------|------------|--------|
| EXCETO / INCORRETA | board **0 taps** | compare aberto |
| Protocolo sequencial | tap **≤3** | rail no concept |
| Funil | tap por estágio **≤3** | deck |
| Norma / calendário / tabela | board ou vertical | golden rows |

Pacote EXCETO 4/4 com **>10 taps** no total → FAIL densidade.

---

## Galeria (`visual_gallery`)

Quando o humano envia prints do player **depois** dos slides prontos:

```text
Salvar na visual_gallery do ramo <branch_id> (pacote <Subtópico>).
Prints = player AVANT · âncora <slug>.
Path: artifacts/questao-review/<slug>/
Playbook: captures_dir + status ready + note + layouts.
Atualizar l3_visual_gallery_index se existir.
```

Preferível: `npm run capture:questao-review -- --slug=<slug>`.

Status: `pending` → sem PNG · `pilot` → capturas parciais · `ready` → âncora + moldes alinhados.

---

## Ratchet (obrigatório no report)

```text
visual_bar: pass | fail
gesto: <nome>
vs_anterior: <o que ficou mais claro / menos taps / melhor mobile>
anti_regressao: nenhum item da barra piorou
```

Melhorar ≠ mais neon. Preferir: herói mais óbvio, menos ruído, menos taps, melhor 375px, primitivo reutilizável.

---

## Anti-padrões do atelier

- Moodboard externo na galeria  
- “Seja criativo” sem erro espacial / gesto  
- React no mesmo passo do primeiro Design visual sem pedido  
- Misturar funil + arena + timeline no mesmo 4/4 sem brief  
- Re-handcraft em massa só por visual  
- Trocar os 4 `type` do schema  
- Acumular 3+ âncoras ouro no mesmo `gesture_id` sem podar  
- Indexar PNG de feed / @marca / Instagram no banco ou em `visual_gallery`  

---

## Governança do banco Composer (anti-inchaco)

Fonte operacional: [`artifacts/composer-visual-bank.md`](../artifacts/composer-visual-bank.md) · contrato no [`PROMPT_COMPOSER_VISUAL.md`](PROMPT_COMPOSER_VISUAL.md) § Governança.

**Hard caps (não negociar)**

| Cap | Regra |
|-----|--------|
| Âncoras ouro / gesto | **≤2** paths na coluna de captures do banco |
| Refs por conversa Composer | Abrir **1–2** âncoras do mesmo `gesture_id` (+ demo G2) |
| Elevate após ship | No máx. **1** path ouro atualizado por gesto (substituir se melhor) |
| Origem do path | Só player: `artifacts/questao-review/…` ou preview `/dev/slide-mold-review` |
| Feed / carrossel / @marca | **Proibido** como path no banco ou na `visual_gallery` — princípios só |

**Eventos → ação**

| Evento | Ação |
|--------|------|
| Novo molde shipped | Atualizar no máx. **1** capture ouro do gesto (substituir se melhor que a âncora atual) |
| Print externo anexado | Extrair princípios em 2–3 bullets; **nunca** path na gallery/banco |
| Gesto novo proposto | Entrar no banco só após piloto `ATELIER_PASS` + primitive/shell reutilizável |
| 3+ âncoras no mesmo gesto | **Podar** para as 2 melhores (herói 1s + mobile + ratchet) |
| Onda / semanal | Revisão humana do herói em 1s no mobile — gosto final continua humano |

**Poda (quando a linha passar de 2)**

1. Manter a âncora com melhor glanceable (checklist 8) no mobile 375.  
2. Preferir `visual_gallery.status=ready` + layout/board canônico do gesto.  
3. Remover o path mais fraco da célula do banco (não apagar captures do playbook sem pedido).  
4. Se empatar: ficar com a flagship mais estável (Adolescente / PT) e a do pacote em ratchet.

Composer e Atelier **não** incham o banco: elevate só quando o ouro do gesto realmente subiu.

---

## Invocação rápida

**Preferido (orquestrador + crítica):**

```text
@artifacts/composer-visual-bank.md
@docs/PROMPT_COMPOSER_VISUAL.md
@docs/NEUROSLIDES_ATELIER_KIT.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md

Composer visual: <ramo>
Erro espacial: <1 frase>
```

**Só crítica / atelier isolado:**

```text
@docs/NEUROSLIDES_ATELIER_KIT.md
@docs/PROMPT_ATELIER_VISUAL.md
@docs/NEUROSLIDES_VISUAL_BAR.md
@artifacts/composer-visual-bank.md
@.cursor/skills/avant-neuroslides-visual/SKILL.md

Atelier visual: <ramo>
Erro espacial: <1 frase>
Gestos ouro a abrir: <nº da tabela, ex. 1 e 2>
```

Detalhe: [`PROMPT_COMPOSER_VISUAL.md`](PROMPT_COMPOSER_VISUAL.md) (orquestrador) · [`PROMPT_ATELIER_VISUAL.md`](PROMPT_ATELIER_VISUAL.md) (crítica).

**Fábrica G2:** se `visual_gallery` do ramo = `pending`/`thin`/ausente, rodar Composer (PASS) **antes** de `Fábrica visual G2:` / `Implementar molde:`. Ver [`PROMPT_FABRICA_VISUAL_G2.md`](PROMPT_FABRICA_VISUAL_G2.md) § Pré-passo Composer.
