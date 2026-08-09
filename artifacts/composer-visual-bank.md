# Banco Composer visual — 8 gestos (fonte de verdade)

Índice canônico do **Composer visual** (Agent-first). Não é moodboard: máx. **1–2 âncoras ouro por gesto**, só paths do **player AVANT**.

| Doc / runtime | Papel |
|---------------|--------|
| [`docs/PROMPT_COMPOSER_VISUAL.md`](../docs/PROMPT_COMPOSER_VISUAL.md) | Trigger + pipeline |
| [`docs/NEUROSLIDES_ATELIER_KIT.md`](../docs/NEUROSLIDES_ATELIER_KIT.md) | 8 gestos + crítica glanceable |
| [`docs/PROMPT_ATELIER_VISUAL.md`](../docs/PROMPT_ATELIER_VISUAL.md) | Formato da crítica |
| [`artifacts/neuroslides-g2-demo.html`](neuroslides-g2-demo.html) | Piso vivo (abrir antes) |
| [`components/slides/primitives/index.ts`](../components/slides/primitives/index.ts) | Primitives canônicos |
| `components/slides/logicFlowShells` | `LogicIsolateShell` · `LogicRailShell` · `LogicFocusShell` |
| [`docs/design-refs/svg-models/diagrams/`](../docs/design-refs/svg-models/diagrams/) | Diagramas de gesto |

**Status por gesto**

| Status | Significado |
|--------|-------------|
| `gold` | ≥1 âncora player com `visual_gallery.status=ready` + primitive/shell reutilizável |
| `thin` | Primitive/shell ok, mas falta âncora player dedicada (ou só preview) — ação listada |
| `gap` | Falta primitive/shell canônico para o gesto |

**Regras do banco**

- Só `artifacts/questao-review/…` ou preview `/dev/slide-mold-review?branch=…`.
- Proibido PNG de feed / @marca / Instagram.
- Máx. 1–2 âncoras ouro por linha; se 3+, podar para as 2 melhores.
- Novo molde shipped → atualizar **no máximo 1** capture ouro do gesto (substituir se melhor).
- Gesto novo só entra após piloto `ATELIER_PASS` + primitive reutilizável.

---

## Tabela mestra (8/8)

| gesture_id | nome | erro espacial típico | preview / captures ouro (≤2) | primitives / shells preferidos | diagrams SVG | pacotes gallery `ready` | status | ação se thin/gap |
|------------|------|----------------------|------------------------------|--------------------------------|--------------|-------------------------|--------|------------------|
| `isolate` | Isolate (EXCETO) | Exceção some no meio da lista; aluno não vê o "pula" em 0 taps | Preview [`adolescente_etica_sigilo`](http://localhost:3000/dev/slide-mold-review?branch=adolescente_etica_sigilo) · `artifacts/questao-review/idecan-enfermagem-saude-do-adolescente-1778712426701-6` (layout `adolescent-exceto-isolate-board`) | `LogicIsolateShell` · `BoardChrome` · `AlertCallout` | `diagrams/isolate-focus.svg` | Saúde do Adolescente (`adolescente_etica_sigilo`) · PNI boards `pni-exceto-isolate-board` (Strategy; gallery por playbook Imu se existir) | **gold** | — |
| `compare` | Compare / arena | ✗×✔ empilhados ou `correct` repetido; sem arena lado a lado | Mesmo captures etica (`adolescent-exceto-compare`) · `artifacts/questao-review/questao-premium-vunesp-portugues-crase-funil` (`pt-crase-trap-arena`) | `TwoColumnBoard` · `PolarityPanel` · `BoardChrome` | `diagrams/compare-x-check.svg` · `diagrams/mal-mau-compare.svg` · `diagrams/adverb-compare-adj-adv.svg` | Adolescente (ética) · Língua Portuguesa (`pt_crase`) · Classes de palavras (adv×adj / conjunção quando trap) | **gold** | — |
| `deck` | Deck / pilares | Pilares viram lista vertical sem massa; spoiler de gabarito no concept | `artifacts/questao-review/idecan-enfermagem-saude-do-adolescente-1778712426701-6` (`adolescent-care-pillars-deck`) · opcional PT deck crase `pt-crase-funnel-deck` | `PillarDeck` · `CategoryStrip` · `BoardChrome` | `diagrams/adverb-types-strip.svg` (strip paralelo; não clonar tipografia) | Adolescente (ética) · PT crase (deck do funil) | **gold** | — |
| `chip_body` | Chip + corpo | Norma longa sem rótulo curto; chip vira badge decorativo | Mesmo etica (`adolescent-speak-barrier-board`) · Classes: `artifacts/questao-review/questao-premium-educa-pb-portugues-classes-adverbio-essencialmente` (quando LabelBody) | `LabelBodyRow` · `CategoryStrip` · `SoftRealIcon` | `diagrams/mal-mau-tip-banner.svg` · `diagrams/mal-mau-warn-pill.svg` · `diagrams/nao-erre-header-pointer.svg` | Adolescente (ética) · Classes de palavras (advérbio) · calendário PNI (chip+corpo na Strategy) | **gold** | — |
| `rail` | Rail / trilho | Ordem de prova vira cards soltos; passo sem número/posição | Preview [`adolescente_antropometria`](http://localhost:3000/dev/slide-mold-review?branch=adolescente_antropometria) · `artifacts/questao-review/ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0` (`adolescent-growth-z-rail`) · 2º: Fármaco ADME `artifacts/questao-review/funcamp-farmacodinamica-vf` (`adme-journey-rail`) | `ProtocolRailRow` · `LogicRailShell` · `BoardChrome` | `diagrams/decision-rail.svg` · `diagrams/adverb-arrow-rail.svg` · `diagrams/nao-erre-row-rail.svg` | Adolescente (antropometria) · Fármaco (`farmaco_pk_pd_vf` gallery ready) · Urgências `urgencias-xabcde-rail` · PT clitic (playbook) | **gold** | — |
| `funnel` | Funil | Estágios misturados com arena; >3 taps sem cortar chute | `artifacts/questao-review/questao-premium-vunesp-portugues-crase-funil` (`pt-crase-funnel-*`) · secondary lacunas no playbook | `PolarityPanel` · `LogicFocusShell` (tap ≤3) · `PillarDeck` (estágios) | `diagrams/funnel-rail.svg` | Língua Portuguesa (`pt_crase`) | **gold** | — |
| `critical_number` | Número crítico / limiar | Faixa Z/dose escondida em parágrafo; limiar sem herói tipográfico | `artifacts/questao-review/ibam-enfermagem-nutricao-aplicada-a-enfermagem-1777102845644-0` (`adolescent-z-band-board` · `adolescent-z-threshold-trap`) | `CriticalNumber` · `AlertCallout` · `LabelBodyRow` (pares ≠) | — (sem diagrama dedicado; usar tipografia + `CriticalNumber`) | Adolescente (antropometria) | **gold** | Opcional: SVG limiar em `diagrams/` se gesto reaparecer em dose/PNI |
| `focus` | Focus / núcleo | Muitos cards no tap; herói diluído; CTA "próximo" sem decisão | `artifacts/questao-review/questao-premium-vunesp-portugues-concordancia-nucleo-sjrp` (`pt-subject-focus-tap-flow` + `LogicFocusShell`) · preview [`pt_concordancia`](http://localhost:3000/dev/slide-mold-review?branch=pt_concordancia) | `LogicFocusShell` · `BoardChrome` | `diagrams/isolate-focus.svg` (núcleo; não confundir com EXCETO) | Língua Portuguesa (`pt_concordancia`) · shells em tap-flow (term-matrix / Lab SoftStack) | **gold** | — |

**DoD Fase 0:** 8/8 indexados — 8 `gold` — 0 `thin` — 0 `gap` (piloto Composer `pt_concordancia` elevou `focus`, 2026-08-08).

---

## Primitives canônicos (export)

De [`components/slides/primitives/index.ts`](../components/slides/primitives/index.ts):

`BoardChrome` · `PolarityPanel` · `LabelBodyRow` · `CategoryStrip` · `TwoColumnBoard` · `PillarDeck` · `ProtocolRailRow` · `AlertCallout` · `CriticalNumber` · `SoftRealIcon` · tokens `boardTokens`.

Shells de `logic_flow` (fora de `primitives/`, mas canônicos no Composer):

`LogicIsolateShell` · `LogicRailShell` · `LogicFocusShell`.

---

## Diagramas SVG × gesto

Paths sob `docs/design-refs/svg-models/diagrams/` — gramática de traço, **não** path literal em massa.

| SVG | Gestos |
|-----|--------|
| `isolate-focus.svg` | `isolate`, `focus` |
| `compare-x-check.svg` | `compare` |
| `mal-mau-compare.svg` | `compare` |
| `adverb-compare-adj-adv.svg` | `compare` |
| `funnel-rail.svg` | `funnel` |
| `decision-rail.svg` | `rail` |
| `adverb-arrow-rail.svg` | `rail` |
| `nao-erre-row-rail.svg` | `rail` |
| `adverb-types-strip.svg` | `deck` |
| `mal-mau-tip-banner.svg` / `mal-mau-warn-pill.svg` | `chip_body` |
| `nao-erre-header-pointer.svg` / `nao-erre-arrow-curve.svg` | `chip_body` / ênfase |
| `adverb-mnemonic-pme.svg` · `adverb-indicative-*.svg` · `adverb-radiate-marks.svg` | Classes PT (apoio; mapear ao gesto do ramo) |

---

## Pacotes com gallery `ready` (amostra flagship)

Usar como origem de âncoras — não listar todos os ramos aqui.

| Pacote | Índice / playbook | Gestos que tipicamente alimentam |
|--------|-------------------|----------------------------------|
| Saúde do Adolescente | `handcraft-playbooks/saude-adolescente.json` · `artifacts/l3-visual-gallery-saude-adolescente-index.md` | `isolate`, `compare`, `deck`, `chip_body`, `rail`, `critical_number` |
| Língua Portuguesa | `handcraft-playbooks/lingua-portuguesa.json` · `artifacts/l3-visual-gallery-lingua-portuguesa-index.md` | `funnel`, `rail`, `compare` |
| Classes de palavras | `handcraft-playbooks/classes-de-palavras.json` | `compare`, `chip_body`, `deck` |
| Saúde da Mulher | `handcraft-playbooks/saude-da-mulher.json` | (regression dir — validar âncora player antes de tratar como ouro Composer) |

---

## Como o Composer usa este arquivo

1. Abrir esta tabela → escolher **1** `gesture_id` (vizinho só se brief pedir).
2. Abrir **1–2** paths ouro da linha + demo G2.
3. Se o ramo tiver `visual_gallery` `pilot`/`ready`, abrir `captures_dir` do playbook.
4. Modo V → crítica atelier → handoff (Modo A / reuso / `Implementar molde:`).
5. Após elevate ouro: atualizar **só** a célula de captures/status desta linha (máx. 2 âncoras).

---

## Governança (anti-inchaco)

Espelho canônico: [docs/PROMPT_COMPOSER_VISUAL.md](../docs/PROMPT_COMPOSER_VISUAL.md) § Governança · [docs/NEUROSLIDES_ATELIER_KIT.md](../docs/NEUROSLIDES_ATELIER_KIT.md) § Governança.

**Hard caps:** ≤2 âncoras ouro por gesture_id · elevate no máx. 1 path por ship · só player (questao-review / slide-mold-review) · **sem feed** (Instagram/carrossel/@marca nunca viram path).

| Evento | Ação |
|--------|------|
| Novo molde shipped | Atualizar no máx. **1** capture ouro do gesto (substituir se melhor) |
| Print externo anexado | Extrair princípios; **nunca** path na gallery/banco |
| Gesto novo proposto | Entrar só após piloto ATELIER_PASS + primitive reutilizável |
| 3+ âncoras no mesmo gesto | **Podar** para as 2 melhores (herói 1s + mobile 375 + gallery 
eady) |
| Onda / semanal | Revisão humana do herói em 1s — gosto final humano (kit atelier) |

**Poda:** manter as 2 com melhor glanceable; remover o path mais fraco **desta célula** (não apagar captures do playbook sem pedido).

## Hook Fábrica (pré-passo)

Quando um pacote production_ready entra na ordem de [PROMPT_FABRICA_VISUAL_G2.md](../docs/PROMPT_FABRICA_VISUAL_G2.md):

| Gallery do ramo | Ação |
|-----------------|------|
| pending / 	hin / campo ausente | 1 chat `Composer visual: <ramo>` → `ATELIER_PASS` **antes** de variant nova / `Implementar molde:` |
| pilot / 
eady + gesto no banco + board existe | Polish + capture — **proibido** React novo |
| ok_generico | Pular Composer longo |

Após cada pacote Fábrica: atualizar no máx. 1 path ouro na linha do gesto tocado.

**Próximo pacote (hook validado 2026-08-08):** Processo de Enfermagem — ver [composer-fabrica-hook-processo-de-enfermagem.md](composer-fabrica-hook-processo-de-enfermagem.md) (3 ramos fortes pending implícito; boards SAE existem → reuso + gallery).

Última revisão banco: 2026-08-08 (Fábrica Farmacodinâmica — `rail` ADME gallery ready · ≤2 ouro: antropometria + FUNCAMP VF).
