# Referência — Retenção visual (NeuroSlides)

Complemento de `avant-neuroslides-visual`. Usar **depois** de nomear o ramo e o erro espacial.

**Política de prints externos:** extrair **princípios**; nunca indexar PNG de feed na `visual_gallery` do playbook.

---

## Banco Composer

Índice canônico dos **8 gestos ouro** (gesto × âncoras player × primitives × gallery ready):

| Artefato | Uso |
|----------|-----|
| [`artifacts/composer-visual-bank.md`](../../../artifacts/composer-visual-bank.md) | Fonte de verdade — máx. 1–2 âncoras ouro por `gesture_id`; status `gold` \| `thin` \| `gap` |
| [`docs/PROMPT_COMPOSER_VISUAL.md`](../../PROMPT_COMPOSER_VISUAL.md) | Trigger `Composer visual:` — orquestrador (precede Fábrica se gallery `pending`/`thin`) |
| [`docs/NEUROSLIDES_ATELIER_KIT.md`](../../NEUROSLIDES_ATELIER_KIT.md) | Crítica glanceable (Composer orquestra; Atelier julga) |

**No Modo V / Composer:** abrir o banco → escolher `gesture_id` alinhado ao erro espacial → carregar **só** 1–2 paths ouro da linha (não moodboard). Proibido PNG de feed. Após capture que eleva o ouro: atualizar no máx. 1 path na linha do gesto.

Mapeamento gesto → formato tipico da tabela §1 abaixo continua válido; o banco amarra cada gesto a primitive/shell e pacotes com gallery `ready`.

---

## 1. Gesto → retenção

| Gesto | Quando o aluno grava | Formatos típicos |
|-------|----------------------|------------------|
| **Funil** | Ordem de testes (corta o chute) | `*-funnel-*`, `*-tap-flow`, board de testes |
| **Trilho / rail** | Sequência (XABCDE, ADME, período) | `*-rail`, `*-tap-flow` |
| **Linha do tempo** | Ano/marco → fato (história, calendário) | `*-timeline`, `*-rail` |
| **Arena / compare** | Errado × certo lado a lado | `*-arena`, `*-trap`, `compare` |
| **Matriz** | Cruzamento 2 eixos | `*-matrix`, `reference_table` |
| **Deck / camadas** | Fases / regras empilhadas | `*-deck` |
| **Zonas** | Dito × inferido × extrapolado | text-zones / morphological |
| **Núcleo em foco** | Sujeito / dose / item certo no meio do ruído | `*-focus`, highlight |
| **Seta** | Regente → prep → complemento; CAPÍTULO → título | `*-arrow`, list + arrow |
| **Chip + corpo** | Rótulo curto (Art. 6º / COREN) + texto | `rows` com `badge`, morphological |
| **Três pilares** | 3 eixos paralelos (ex.: fundamentos × objetivos × princípios) | `bridge` / 3 cards `concept_map` |

Uma metáfora por pacote 4/4. Trocar gesto = novo brief.

---

## 2. Inspiração pedagógica → AVANT

Princípios extraídos de mapas/infográficos de estudo (não layouts para clonar):

| Princípio visto em material de estudo | Tradução NeuroSlides |
|---------------------------------------|----------------------|
| Faixa etária / categoria colorida | Slot + `emphasis` / badge; cor semântica do tema |
| Cabeçalho de grupo + linha “quando” × “o quê” | 2 pólos `bridge` ou rows (idade \| vacinas) |
| ✗ coluna × ✔ coluna (vocativo, compare) | `danger_zone` compare + `correct` único |
| Destaque tipográfico no trecho certo (vírgula, vocativo) | Palavra-chave no `correct` / `value`; não hardcode no TSX |
| Macete curto (BB, 4P’s) | `golden_rule.content` ≤36c + `rows` |
| Capítulos / árvore “aplica-se a” | `concept_map` items (≤5–7) |
| Decreto: definição → finalidade → processo | `logic_flow` tap (3+ passos) ou deck de fases |
| Lista I–V com ícone por item | `concept_map` / rows; 1 tela ≤5–7; resto no próximo slide |
| Número crítico em destaque (90 dias, 30 anos, DUAS) | `emphasis: alert` / badge — não parede de texto |
| Chave agrupa autoridade (COREN vs COFEN) | `footer_rule` ou item “grupo”; não chrome de marca |
| Protocolo letra em círculo + 1 linha | rail + tap; letra no JSON |
| Símbolo grande (vírgula, ponto) + função em 1 frase | `golden_rule` row: símbolo = label, função = value |
| Card “nome → microdefinição → exemplo” | 1 regra por card; grade 8–18 → **partir em slides** |
| Timeline ANO \| FATO + negrito em nomes | `*-timeline`; `detail` com nomes-chave curtos |
| Colunas paralelas CF (art. 1 / 3 / 4) | 3 items `concept_map` ou 3 rows; macete (“verbo no infinitivo”) no `content` |

**Proibido importar:** ilustrações 3D de terceiros, handle social, ícones de engajamento, watermark, carrossel N/M como chrome do player, conteúdo clínico/legal **errado** só porque o print é bonito.

---

## 2b. Lote curado (inspiração — jul/2026)

Análise de prints de estudo (feed). **Salvos = princípios abaixo.** PNG externos **não** vão para `visual_gallery`.

### Manter (padrão de retenção)

| Padrão | Por que retém | Uso AVANT |
|--------|---------------|-----------|
| Timeline ANO → FATO | Ordem temporal + scan | `*-timeline` / rail; negrito só no JSON |
| Letra/círculo + 1 conduta | Chunking de protocolo | XABCDE rail já no produto — gesto, não copiar arte |
| Compare ✗/✔ (vocativo) | Contraste imediato | `danger_zone` compare |
| Chip Art./rótulo + corpo | Legis escaneável | `rows` + `badge` |
| Fluxo Estado → Município → CIT | Processo em 3 taps | `logic_flow` |
| I–V serviços mínimos + ícone | Lista normativa | concept_map / rows (≤7) |
| Número crítico destacado | Fixação de prova | `emphasis: alert` |
| Grade “regra + exemplo” (vírgula / figuras) | Transferência | 1–2 regras/slide; nunca 18 cards numa tela |
| Três pilares + macete de prova | Estrutura CF | 3 cards + `content` mnemônico |
| Grupo por autoridade (chave) | Hierarquia COREN/COFEN | item de grupo + rows |

### Descartar / não salvar como modelo

| Print / padrão | Motivo |
|----------------|--------|
| Várias telas só de calendário PNI pastel | Redundante — princípio “categoria × lista” já coberto |
| Carrossel 2/6–4/6 / likes / @marca | Chrome de feed — proibido |
| XABCDE com letra/conduta trocada no print | Gesto útil; **conteúdo** não — prova e guideline mandam |
| Poster 10–18 cards numa arte | Estoura ≤7 slots; partir |
| Mapa mental só com mascote/cartoon | Estética; sem gesto novo |
| Duplicatas do mesmo decreto SUS | Mesmo princípio de chunking legis |

---

## 2c. Lote TE enfermagem (ago/2026 — Pré-Onda 3 Fábrica)

Catálogo completo: [`artifacts/pre-onda3-print-to-primitives-catalog.md`](../../../artifacts/pre-onda3-print-to-primitives-catalog.md).
Runbook: [`docs/NEUROSLIDES_VISUAL_STRATEGY.md`](../../../docs/NEUROSLIDES_VISUAL_STRATEGY.md) Camadas 2b–2c + **7** (DoD Fábrica).

**Glossário:** *Strategy Onda 3* = Imu EXCETO (já entregue). *Fábrica Onda 3* = nota-10 visual dos 10 pacotes TE.

### Manter (traduzir para primitives — não clonar)

| Família de print | Gesto | Primário AVANT | Slide |
|------------------|-------|----------------|-------|
| XABCDE / ADPIE / vigilância 1–N | Trilho | `ProtocolRailRow` / `LogicRailShell` | concept / logic ≤3 |
| Calendário PNI / Pneumo idade×dose | Chip + corpo | `LabelBodyRow` + `CategoryStrip` | golden_rule |
| Manchester / risco por cor | Cor = categoria | `CategoryStrip` + `PolarityPanel` | concept / danger |
| Mapa mental / NIC–NOC / pilares / RAPS lista | Deck / núcleo+lista | `PillarDeck` / `concept_map` ≤7 | concept_map |
| Protocolo empilhado + Atenção + dose / tabela gravidade | Callout + número + rows | `AlertCallout` + `CriticalNumber` + SoftLens/`rows` | golden_rule |
| Fluxo RN / zigzag | Funil | `LogicFocusShell` ≤3 ou `LogicIsolateShell` | logic_flow |
| Sinais vitais grade / multi-card patologia | Deck / rows | `PillarDeck` / `LabelBodyRow` | concept + golden |
| Glossário onda→nome→def / pontuação PT | Chip + corpo | `LabelBodyRow` | golden_rule |

### Reusar vs `Implementar molde:`

| Situação | Ação |
|----------|------|
| Gesto na tabela + molde/primitivo já no ramo | Reusar + Modo A/V |
| Pacote já `production_ready` — polish glanceable | Captures/galeria; sem React novo |
| Gesto espacial **novo** ou ≥5 questões sem board | Brief → Design visual → `Implementar molde:` |
| Pegadinha só textual / cauda | `ok_generico` 3/3 |

### Descartar (mesmo lote)

3D/mascote, ranking comercial com chevron de marketing, poster 10–18 cards, pastel no shell Cyber, 1 variant por print.

---

## 3. Densidade e mobile

| Regra | Valor |
|-------|--------|
| Slots visíveis / tela | ≤ 5–7 |
| `detail` / `step` / `value` | alvo ≤110 caracteres |
| Toque | ≥ 44×44 px |
| Preview | 375 px legível |
| Motion | preferir tap; reduced-motion = tudo visível |

Calendário / lista longa / grade de 8+ regras → **vários slides** ou tabs do molde — nunca um poster único.

---

## 4. Skin Cyber (NeuroSlides)

| Semântica | Uso |
|-----------|-----|
| Shell | `#010409` / glass |
| Sucesso | verde (`--color-success`) |
| Perigo | rose (`--color-danger`) |
| Alerta / número crítico | âmbar (`--color-warning`) |
| Info / foco | cyan (`--color-brand`) |
| Conteúdo | cards claros sobre shell escuro |

Harmonizar com `template` / `meta.subtopico` (`themeGenerator`) — não inventar pastel de feed.

---

## 5. Par concept ↔ danger (retenção)

| Slide 1 mostra | Slide 4 instancia |
|----------------|-------------------|
| Pegadinha-âncora (nome do erro) | Um card por letra/distrator com o mesmo erro |
| Terreno do teste | Contraste “parecia certo” × “funil/regra barra” |

Se o danger não ecoa o concept, a metáfora quebrou.

---

## 6. Quando genérico premium basta

`morphological` + `reference_table` + `tap` + `compare` **já retêm** se:

- pegadinha é texto×texto (não espacial), **ou**
- ramo é cauda longa / `ok_generico`

Não forçar bespoke por estética. Bespoke quando o erro é **espacial/sequencial/categorial** e o volume do ramo justifica (brief Fase 3b).

---

## 7. DoD visual (espelho rápido)

- [ ] Gesto nomeado
- [ ] 4/4 mesma metáfora
- [ ] ≤7 slots
- [ ] 0 hardcode de gabarito no UI
- [ ] footer / transferência
- [ ] 375 px OK
- [ ] Inspiração = princípio, não clone

### 7b. DoD Onda 3 Fábrica (pacote já vendável)

Espelho da Camada 7 em `NEUROSLIDES_VISUAL_STRATEGY.md`:

- [ ] Gesto por ramo forte **ou** ok_generico
- [ ] Print → primitivo (tabela §2c)
- [ ] Playwright **ou** captures âncora
- [ ] `artifacts/<prefix>-nota10-report.md` barra visual verde
- [ ] React novo só com `Implementar molde:`

---

## 8. Galeria visual (playbook)

Se o ramo tiver `visual_gallery` no playbook:

| status | Ação |
|--------|------|
| `pending` / `thin` / ausente | **Pré-passo Fábrica:** `Composer visual: <ramo>` → `ATELIER_PASS` antes de variant nova; brief + JSON + gestos ouro do banco |
| `pilot` / `ready` | Abrir `captures_dir` (player AVANT) antes de redesenhar; Composer opcional se só polish |

Índice PT: `artifacts/l3-visual-gallery-lingua-portuguesa-index.md`.
**Banco Composer (gesto × capture ouro):** [`artifacts/composer-visual-bank.md`](../../../artifacts/composer-visual-bank.md).
**Composer (orquestrador)** · **Atelier (crítica):** [`PROMPT_COMPOSER_VISUAL`](../../PROMPT_COMPOSER_VISUAL.md) · [`NEUROSLIDES_ATELIER_KIT`](../../NEUROSLIDES_ATELIER_KIT.md) · [`PROMPT_ATELIER_VISUAL`](../../PROMPT_ATELIER_VISUAL.md).
Preencher após `capture:questao-review` ou prints do player anexados na conversa — **nunca** indexar posters externos (lote de inspiração de feed **não** entra na galeria). Se elevou o ouro do gesto, atualizar a linha do banco (≤2 âncoras).
