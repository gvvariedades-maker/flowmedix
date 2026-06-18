# Pacote Premium — Checklist e Roadmap AVANT

Governança para questões com NeuroSlides de alta qualidade: **estrutura para todas**, **pacote completo por subtópico** em rollout.

Regra Cursor: [`.cursor/rules/avant-premium-pacote.mdc`](../.cursor/rules/avant-premium-pacote.mdc).  
Gate automatizado: [`__tests__/premium-no-stub.test.ts`](../__tests__/premium-no-stub.test.ts).  
Pacote de referência implementado: **Curativos e Manejo de Feridas**.

---

## Visão em duas camadas

```text
CAMADA 1 — Conteúdo pedagógico (JSON)
  upgradePremium<Pacote>.ts / golden manual
  → items, rows, steps, detail, correct, footer_rule

CAMADA 2 — Apresentação (player)
  SUBTOPIC_DESIGN_MAP + componentes React
  → layout_variant, tema, interação (tap, compare…)
```

**Co-design:** o molde visual define o contrato de dados; o builder ou golden deve entregá-lo.

---

## Contrato de dados por slide

| Slide | Contrato mínimo | Molde Curativos (exemplo) |
|-------|-----------------|---------------------------|
| `concept_map` | `items[]` (`label`, `detail`, `icon`) | `wound-stage-tissue-deck` |
| `golden_rule` | `rows[]` (`label`, `value`) ou `content` | `dressing-match-matrix` |
| `logic_flow` | `steps[]` + `reveal_mode` quando tap | `wound-prep-tap-flow` |
| `danger_zone` | `items[]` (`label`, `detail`, **`correct`**) | `dressing-choice-arena` |

---

## Definition of Done (DoD) mensurável

### Golden pronto

- [ ] Arquivo em `examples/questao-premium-*.json`
- [ ] `QuestaoCompletaSchema.safeParse` → sucesso
- [ ] 4 slides, formato plano, `meta.subtopico` canônico
- [ ] Sem TecConcursos; ícones Lucide válidos
- [ ] Revisão clínica humana
- [ ] Passa em `premium-no-stub` (sem `PREMIUM_STUB_MARKERS`)

### Molde visual pronto

- [ ] 4/4 `layout_variant` bespoke (não só `morphological` / `center` / `cards` / `list`)
- [ ] Entrada em `SUBTOPIC_DESIGN_MAP` (`themeGenerator.ts`)
- [ ] Wiring em `NeuroSlide.tsx` + listas de layout (`*Layout.ts`)
- [ ] Teste de presença (`slidePresentationSubtopicMold.test.ts` ou equivalente)
- [ ] Preview no player sem fallback genérico

### Builder de conteúdo pronto

- [ ] `lib/catalogMigration/upgradePremium<Pacote>.ts`
- [ ] Integrado em `upgradePremiumHybrid`
- [ ] Ramos V/F e múltipla escolha (quando aplicável)
- [ ] Testes Jest dedicados
- [ ] Lote piloto aplicado; ≥90% `zodValid`
- [ ] **0** marcadores stub nos slides do lote (`hasPremiumStubMarkers`)

---

## Fase 0 — Definição do pacote

- [ ] Subtópico canônico (CLAUDE.md §9)
- [ ] Template de cor (t01–t15)
- [ ] Famílias de questão no catálogo (V/F, múltipla escolha, certo/errado…)
- [ ] Golden(s) de referência planejados (1 por ramo forte)

## Fase 1 — Golden

- [ ] JSON em `examples/` validado no Laboratório
- [ ] 4 slides alinhados ao contrato dos moldes planejados
- [ ] Revisão clínica

## Fase 2 — Moldes visuais

- [ ] 4 componentes em `components/slides/variants/`
- [ ] `SUBTOPIC_DESIGN_MAP` + `NeuroSlide.tsx`
- [ ] Testes de presença do molde

## Fase 3 — Builder de conteúdo

- [ ] `upgradePremium<Pacote>.ts` + testes
- [ ] Integração em `upgradePremiumHybrid`
- [ ] Saída no formato do contrato (Fase 2)

## Fase 4 — Piloto

- [ ] 3–5 slugs: `catalog:export-lote` → `upgrade-premium --write --force` → `apply-lote --apply`
- [ ] Revisão no `/estudar/<slug>`

## Fase 5 — Lote em escala

- [ ] Lotes de 50 com `--exclude-manifest`
- [ ] Verificação final: export com todos os excludes → nenhum slug restante
- [ ] `lote-meta.json` com builder e contagem

## Fase 6 — Fechamento (/SHIP_IT)

- [ ] `npm test` + `npm run build`
- [ ] Amostra humana ~5%
- [ ] Commit quando solicitado

---

## Convenções de nomenclatura

| Artefato | Padrão |
|----------|--------|
| Golden | `questao-premium-<banca>-<subtopico>-<recorte>.json` |
| Builder | `lib/catalogMigration/upgradePremium<Pacote>.ts` |
| `layout_variant` | `<tema>-<conceito>-<formato>` (ex.: `wound-stage-tissue-deck`) |
| Lote | `data/catalog-migration/<pacote>-lote-NN/` |

---

## Matriz de prontidão (estado do repositório + catálogo)

**Auditoria Supabase** (`modulos_estudo`) — 2026-06-16.

### Resumo do catálogo

| Métrica | Qtd | % |
|---------|:---:|:---:|
| Total de questões | **5.180** | 100% |
| Com 4 NeuroSlides | **5.180** | 100% |
| Premium sem stub (`PREMIUM_STUB_MARKERS`) | **3.047** | **58,8%** |
| Com stub (hybrid genérico / transição) | **2.133** | 41,2% |
| Subtópicos distintos | **41** | — |

> **Stub** = slides com marcadores de hybrid genérico (`[IA]`, `conceito central`, `relacione o tema`, etc.).  
> Critério alinhado a `hasPremiumStubMarkers` / gate em `__tests__/premium-no-stub.test.ts`.

Legenda engenharia: ✅ · 🟡 parcial · ❌ ausente  
Moldes bespoke = variantes com componente React dedicado (não só `morphological`/`center`/`cards`/`list`).

### Por subtópico (produção)

| Subtópico | Total | Sem stub | % premium | Golden | Moldes | Builder | Prioridade |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|-----------|
| **Curativos e Manejo de Feridas** | 201 | 201 | **100%** | ✅ | ✅ 4/4 | ✅ | **Completo** |
| **Imunização** | **577** | **577** | **100%** | ✅ | ✅ 4/4 | ✅ | **Completo** |
| Coleta de Exames Laboratoriais | 244 | 243 | 99,6% | ✅ | ✅ 4/4 | ❌ | Consolidar builder |
| Epidemiologia e Vigilância Epidemiológica | 189 | 185 | 97,9% | ❌ | 🟡 | ❌ | Consolidar |
| Enfermagem em Centro Cirúrgico | 140 | 138 | 98,6% | ❌ | 🟡 | ❌ | Consolidar |
| Noções de Anatomia | 107 | 100 | 93,5% | ✅ | ❌ | ❌ | Moldes + builder |
| Saúde da Mulher | 225 | 199 | 88,4% | ❌ | ❌ | ❌ | Builder |
| Instalação e Manejo de Sondas | 191 | 167 | 87,4% | ✅ | 🟡 2/4 | ❌ | Builder |
| Punção Venosa e Cuidados com Cateteres | 144 | 118 | 81,9% | ✅ | ✅ 4/4 | ❌ | **Quick win** |
| Oxigenoterapia e Cuidados Respiratórios | 195 | 158 | 81,0% | ✅ | 🟡 3/4 | ❌ | Builder |
| Cálculo de Administração de Medicamentos e Infusões | 124 | 88 | 71,0% | ✅ | 🟡 3/4 | ❌ | Builder |
| Cuidados na Administração de Medicamentos | 267 | 167 | 62,5% | ✅ | ❌ | ❌ | Builder |
| Infecções Sexualmente Transmissíveis (ISTs) | 215 | 127 | 59,1% | ✅ | ❌ | ❌ | Pacote novo |
| Medidas de Prevenção e Precaução de Contato | 123 | 52 | 42,3% | ❌ | 🟡 | ❌ | Builder |
| Mobilização e Posicionamento do Paciente | 119 | 40 | 33,6% | ❌ | ❌ | ❌ | Builder |
| **Verificação de Sinais Vitais** | **654** | **171** | **26,1%** | ✅ | 🟡 2/4 | ❌ | **Alto impacto** |
| Urgências e Emergências | 283 | 48 | 17,0% | ✅ | 🟡 2/4 | ❌ | **Alto impacto** |
| Processo de Enfermagem | 34 | 5 | 14,7% | ✅ | 🟡 2/4 | ❌ | Builder SAE |
| **Vias de Administração** | **256** | **15** | **5,9%** | ✅ | 🟡 2/4 | ❌ | **Alto impacto** |
| Atenção Básica / Saúde da Família | 134 | 125 | 93,3% | ✅ | ❌ | ❌ | Consolidar |
| Doenças Virais de Interesse Epidemiológico | 103 | 95 | 92,2% | ❌ | 🟡 | ❌ | — |
| Noções de Fisiologia | 121 | 116 | 95,9% | ❌ | 🟡 | ❌ | — |
| Promoção à Saúde e Prevenção de Agravos | 63 | 55 | 87,3% | ❌ | 🟡 2/4 | ❌ | — |
| Segurança do Paciente | 67 | 53 | 79,1% | ❌ | ❌ | ❌ | — |
| Doenças Parasitárias e Zoonoses | 52 | 49 | 94,2% | ❌ | 🟡 | ❌ | — |
| Saúde da Criança | 45 | 31 | 68,9% | ❌ | ❌ | ❌ | — |
| Infecções no Contexto da Biossegurança | 38 | 35 | 92,1% | ❌ | 🟡 | ❌ | — |
| Procedimentos Diversos | 36 | 31 | 86,1% | ❌ | ❌ | ❌ | — |
| Outras Questões… Crônicas Não Transmissíveis | 36 | 23 | 63,9% | ❌ | ❌ | ❌ | — |
| Assistência Perioperatória (Inclui SRPA) | 31 | 28 | 90,3% | ✅ | 🟡 | ❌ | — |
| Enfermagem do Trabalho | 22 | 20 | 90,9% | ❌ | ❌ | ❌ | — |
| Saúde Mental | 21 | 16 | 76,2% | ❌ | ❌ | ❌ | — |
| História da Enfermagem | 20 | 19 | 95,0% | ❌ | 🟡 | ❌ | — |
| Doenças Bacterianas e Fúngicas | 19 | 14 | 73,7% | ❌ | 🟡 | ❌ | — |
| Feridas e Queimaduras | 12 | 9 | 75,0% | ❌ | 🟡 | ❌ | — |
| Saúde do Adolescente | 11 | 11 | 100% | ❌ | ❌ | ❌ | — |
| Processamento de Artigos e Produtos de Saúde | 9 | 5 | 55,6% | ❌ | 🟡 | ❌ | — |
| Farmacodinâmica e Farmacocinética | 6 | 4 | 66,7% | ❌ | 🟡 | ❌ | — |
| Doenças Respiratórias Crônicas (Asma, DPOC) | 2 | 2 | 100% | ❌ | 🟡 | ❌ | — |
| Outras Doenças… Transmissíveis | 1 | 1 | 100% | ❌ | ❌ | ❌ | — |
| Enfermagem em Central de Material e Esterilização (CME) | 43 | 17 | 39,5% | ❌ | 🟡 | ❌ | — |

> Atualizar esta matriz após cada pacote concluído ou nova auditoria Supabase.  
> **Imunização (2026-06-16):** pacote fechado no repo — moldes PNI 4/4, `upgradePremiumImunizacao.ts`, migração em lote (~577 slugs, 0 stub nos lotes builder); % premium da linha reflete apply concluído (re-auditar Supabase para métricas globais do catálogo).

---

## Roadmap priorizado

Ordem por **impacto** (volume × gap de stub), com dados de produção 2026-06-16.

### Onda 1 — Alto impacto (muitas questões, % premium baixo)

1. **Verificação de Sinais Vitais** — 654 questões, **26%** premium (golden ✅, moldes 🟡)  
2. **Vias de Administração** — 256 questões, **6%** premium  
3. **Urgências e Emergências** — 283 questões, **17%** premium  

> Somam ~**1.193 questões** com stub predominante — maior retorno de builders dedicados.

### Onda 2 — Quick wins (já >80% premium; falta builder para consolidar)

5. **Punção Venosa e Cuidados com Cateteres** — 144 questões, **82%** (golden + moldes 4/4)  
6. **Coleta de Exames Laboratoriais** — 244 questões, **99,6%** (golden + moldes 4/4)  
7. **Oxigenoterapia** — 195 questões, **81%** (completar 4º molde + builder)  

### Onda 3 — Pacotes com golden, moldes ou conteúdo a refinar

8. **ISTs** — 215 questões, 59% premium — golden `questao-premium-cpcon-ists-risco-transmissao-vf.json`  
9. **Cálculos de Medicamentos** — 124 questões, 71% premium  
10. **Processo de Enfermagem (SAE)** — 34 questões, 15% premium — golden `questao-premium-fepese-anotacao-enfermagem-sae.json`  

### Referência concluída

- **Curativos** — 201/201 (**100%** premium) — `upgradePremiumCurativos.ts` + moldes orange (`wound-stage-tissue-deck`, `dressing-match-matrix`, `wound-prep-tap-flow`, `dressing-choice-arena`)
- **Imunização** — 577/577 (**100%** premium pós-migração) — `upgradePremiumImunizacao.ts` + moldes PNI (`pni-rules-deck`, `pni-interval-matrix`, `pni-vf-juggle-tap`, `pni-trap-chips`); goldens `questao-premium-cpcon-imunizacao-intervalos-vf.json`, `questao-premium-fundatec-meningococica-3meses.json`

---

## Comandos de migração

```bash
npm run catalog:export-lote -- --lote=<pacote>-lote-01 --subtopico="<Subtópico>" --limit=50
npm run catalog:upgrade-premium -- --lote=<pacote>-lote-01 --write --force
npm run catalog:apply-lote -- --lote=<pacote>-lote-01 --apply
```

Lotes seguintes: adicionar `--exclude-manifest=artifacts/...` e `data/catalog-migration/.../manifest.json`.

---

## Gate anti-stub

Marcadores em `PREMIUM_STUB_MARKERS` (`upgradePremiumHybrid.ts`): placeholders `[IA]`, textos genéricos de hybrid, etc.

- Goldens em `examples/questao-premium-*.json` **devem** passar no teste.
- Conteúdo de produção premium **não** deve conter esses marcadores nos slides.
- Hybrid genérico é aceitável apenas como **transição** documentada até o builder dedicado existir.

---

## Referências cruzadas

- [`CLAUDE.md`](../CLAUDE.md) — §8 NeuroSlides, §9 subtópicos
- [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md) — layouts e mapa visual
- [`.cursor/rules/avant-agent-json.mdc`](../.cursor/rules/avant-agent-json.mdc) — JSON de questões
- [`examples/questao-premium-cpcon-curativos-lpp-prevencao-vf.json`](../examples/questao-premium-cpcon-curativos-lpp-prevencao-vf.json) — golden de referência
