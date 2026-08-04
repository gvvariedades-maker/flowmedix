# AVANT — Fábrica 20 TE (fila P0/P1)

**Gerado:** 2026-08-03  
**Fonte:** `npm run catalog:program-status` + amostragem `detectUnifiedPedagogy` em `*-completo` + registry (`updated_at` 2026-08-02)  
**Escopo:** 20 subtópicos TE — repair determinístico + fechar incompletos + nota-10 visual — **sem** NeuroCanvas novo, **sem** `ai:generate`, **sem** `pipeline:orchestrate --sdk`.  
**Execução:** 1A local IDE (`Programa completo IDE:` / `Continuar programa:`; 1 unidade/chat).  
**20º pacote:** **Enfermagem do Trabalho** (substitui Doenças Bacterianas).

**Norte de produto:** 4 telas glanceable (cada uma consumida 1×); tap interno só no `logic_flow` quando o gesto for eliminação/ordem (≤3 steps). Ver [`docs/NEUROSLIDES_VISUAL_STRATEGY.md`](../docs/NEUROSLIDES_VISUAL_STRATEGY.md).

**Já feito (não repetir letter strip):** P0 letra nomeada em **Vias** + **Imunização** + **Processo** + **Curativos** + **Mulher** — applied no Supabase. **Sinais** + **Urgências**: disk `named=0`, **apply Supabase pendente**. VF onda3 (Sinais/Vias/Curativos): disk limpo (1 residual Sinais), **apply pendente**.

---

## A) Scorecard agora

### Programa 41 (TE canônicos)

| Métrica | Valor |
|--------|------:|
| Canônicos | 41 |
| `production_ready` | **25** |
| `applied` sem vendável | **1** |
| `in_progress` | **3** |
| Sem pacote no registry | **12** |
| Gap até 41 vendáveis | **16** |

Fonte: `artifacts/catalog-program-status.json` (`generated_at` 2026-08-03T19:32:20.565Z).

### Fábrica 20 TE

| Métrica | Valor |
|--------|------:|
| Pacotes na fila | 20 |
| Já `production_ready` | **17** |
| `applied` | **17** |
| `in_progress` | **2** |
| `pending` | **1** |
| TE incompletos | **3** (AB, Epi, Anatomia) |

> Hipótese confirmada: só 3 TE incompletos. Flagships Trilha B já `applied` + `production_ready`. ROI imediato = apply P0 pendente + residual letter + fechar Trilha A.

### Tabela dos 20 (ROI)

| # | Subtópico | status | applied/total | production_status | Modo | named letter | vf | Gaps |
|---|-----------|--------|---------------|-------------------|------|-------------:|---:|------|
| 1 | Atenção Básica / Saúde da Família | in_progress | **96/171** | none | continuar | 296 | 25 | 75 rem; L1–L6 false; L3 ab_esf_composicao brief sem React; taxonomy closed |
| 2 | Epidemiologia e Vigilância Epidemiológica | pending | **0/218** | none | handcraft zero + L3 wire | 411 | 0 | taxonomy open; briefs 3 ramos; sem BRANCH_MAP wire completo; sem gNN |
| 3 | Verificação de Sinais Vitais | applied | **354/354** | production_ready | repair P0 → apply | 0 | 1 | disk letter ~0; apply Supabase pendente; VF onda3 residual 1 + apply |
| 4 | Urgências e Emergências | applied | **339/339** | production_ready | repair P0 → apply | 0 | 183 | disk letter ~0; apply Supabase pendente; VF ainda alto no disco (183) |
| 5 | Cálculo de Administração de Medicamentos e Infusões | applied | **85/85** | production_ready | repair P0 | 157 | 4 | maior residual named letter aberto |
| 6 | Cuidados na Administração de Medicamentos | applied | **123/123** | production_ready | repair P0 | 245 | 20 | residual named letter |
| 7 | Promoção à Saúde e Prevenção de Agravos | applied | **100/100** | production_ready | repair P0 | 190 | 5 | residual named letter |
| 8 | Noções de Anatomia | in_progress | **0/48** | none | handcraft zero | — | — | sem *-completo; sem playbook/guideline/âncoras; lote_size=50 → corrigir para 8 |
| 9 | Segurança do Paciente | applied | **59/59** | production_ready | repair P0 + playbook | 114 | 0 | residual named; sem playbook no registry |
| 10 | Saúde da Criança | applied | **62/62** | production_ready | repair P0 | 105 | 0 | residual named; A4 |
| 11 | Curativos e Manejo de Feridas | applied | **94/94** | production_ready | apply VF + visual | 0 | 0 | VF onda3 disk 0; apply pendente; nota-10 visual |
| 12 | Saúde da Mulher | applied | **246/246** | production_ready | nota-10 visual | 0 | 0 | P0-2 applied Supabase; polish glanceable |
| 13 | Processo de Enfermagem | applied | **51/51** | production_ready | nota-10 visual | 0 | 42 | P0-2 applied Supabase; polish glanceable |
| 14 | Imunização | applied | **575/575** | production_ready | nota-10 visual | 0 | 9 | letter clean (FP); glanceable/VF density |
| 15 | Vias de Administração | applied | **208/208** | production_ready | nota-10 visual | 0 | 0 | letter+VF disk clean; polish flagship |
| 16 | Punção Venosa e Cuidados com Cateteres | applied | **110/110** | production_ready | nota-10 / residual leve | 21 | 0 | named residual leve; A4 registry |
| 17 | Assistência Perioperatória (Inclui SRPA) | applied | **68/68** | production_ready | L3 bespoke + visual | 116 | 4 | hotspots inédito; named residual |
| 18 | Enfermagem em Central de Material e Esterilização (CME) | applied | **35/35** | production_ready | L3 + visual | 6 | 0 | autoclave; A4; named residual leve |
| 19 | Saúde Mental | applied | **37/37** | production_ready | L3 + visual | 3 | 1 | RAPS inédito; named residual leve |
| 20 | Enfermagem do Trabalho | applied | **33/33** | production_ready | nota-10 visual | 29 | 0 | guideline OK; L1–L6 true; polish glanceable + relatório; named residual no disco |

Amostra detector: `artifacts/_tmp-factory-queue-sample.json` (`2026-08-03T19:33:23.344Z`). Critério named = `letra [A-E]` em `concept_map`/`golden_rule`.

---

## B) Ondas (sequenciais, agente local)

| Onda | Foco | Ordem | Gate de saída |
|------|------|-------|---------------|
| **0** | P0 apply pendente | Sinais → Urgências → VF onda3 (Sinais/Vias/Curativos) | Letter no Supabase; VF applied ou skip |
| **1** | Trilha A | AB (gNN) → Epi (taxonomia→BRANCH→âncoras→mold→g01…) → Anatomia (playbook→L3→âncoras→lote_size=8→gNN) | AB applied↑; Epi closed+BRANCH+âncoras; Anatomia gNN |
| **2** | P0 residual letter | Cálculo → Cuidados → Promoção → Segurança → Criança | named ≈0 + 2ª passada 0 + dry-run |
| **3** | Nota-10 visual / L3 | Mulher → Processo → Curativos → Imu → Vias → Punção → Peri → CME → Mental → **Trabalho** | DoD visual + `*-nota10-report.md` |
| **4** | Ship Trilha A | AB → Epi → Anatomia | `production_ready` + relatório |

### Onda 0 — Apply pendente

| Lote | Disk named | Disk VF | Apply |
|------|------------:|--------:|-------|
| `sinais-vitais-completo` | 0 | 1 | **pendente** (letter + VF) |
| `urgencias-e-emergencias-completo` | 0 | 183 | **pendente** (letter; VF fora da onda3) |
| `vias-de-administracao-completo` | 0 | 0 | letter já live; VF onda3 dry-run |
| `curativos-e-manejo-de-feridas-completo` | 0 | 0 | letter live (P0-2); VF onda3 **pendente** |

```bash
npm run catalog:apply-lote -- --lote=sinais-vitais-completo --dry-run
npm run catalog:apply-lote -- --lote=urgencias-e-emergencias-completo --dry-run
npm run catalog:apply-lote -- --lote=curativos-e-manejo-de-feridas-completo --dry-run
# --apply SOMENTE após "pode aplicar"
```

### Onda 2 — Residual named letter (amostra 2026-08-03)

| Lote | named | letter_spoiler | vf |
|------|------:|---------------:|---:|
| `calculo-de-administracao-de-medicamentos-e-infusoes-completo` | **157** | 157 | 4 |
| `cuidados-na-administracao-de-medicamentos-completo` | **245** | 245 | 20 |
| `promocao-a-saude-e-prevencao-de-agravos-completo` | **190** | 190 | 5 |
| `seguranca-do-paciente-completo` | **114** | 114 | 0 |
| `saude-da-crianca-completo` | **105** | 105 | 0 |

Soma named residual Onda 2: **811**.

Repair padrão:

```text
âncoras → blind-reader dry-run
→ repair:pedagogy-gabarito-item [--lote=] [--write]
→ repair:pedagogy-truncagem [--lote=] [--write]
→ (se VF) repair:pedagogy-rotulos-vf [--lote=] [--write]
→ 2ª passada = 0 edits → classify FP → dry-run apply
```

---

## C) Trilha A (incompletos)

| Subtópico | status | applied/total | taxonomy | lote_size | Próximo |
|-----------|--------|---------------|----------|----------:|---------|
| Atenção Básica / Saúde da Família | in_progress | 96/171 | **closed** | 8 | `Continuar programa:` 1 gNN |
| Epidemiologia e Vigilância Epidemiológica | pending | 0/218 | **open** | 8 | `Fechar taxonomia:` → BRANCH → âncoras → mold → g01 |
| Noções de Anatomia | in_progress | 0/48 | — | **50→8** | playbook + L3 + âncoras; sem `*-completo` ainda |

---

## D) O que NÃO fazer

| Proibido | Por quê |
|----------|---------|
| NeuroCanvas / engine visual nova | Fora desta fábrica |
| `ai:generate` / `catalog:upgrade-premium` | Trilho único = handcraft |
| `pipeline:orchestrate --sdk` / Cloud Agents | Modo 1A local only |
| Dois chats no mesmo lote | 1 agent / unidade |
| Apply / commit / promote sem pedido | Gate humano |
| Segundo `--promote` após ready | Health, não re-promote |
| Confundir `applied` × `production_ready` | Ship = vendável |
| 20º = Doenças Bacterianas | **20º = Enfermagem do Trabalho** |

---

## E) Prompts copy-paste

### E0 — Onda 0 apply

```text
Onda 0 — dry-run Sinais + Urgências (+ VF onda3 Curativos/Sinais/Vias)
Sem --apply até eu colar "pode aplicar".
Entregar: dry-run 100% OK, failed=0, lista de slugs; smoke plan 3 slugs/pacote.
```

### E1 — AB continuar

```text
Continuar programa: Atenção Básica / Saúde da Família
@artifacts/pipeline-run-state-atencao-basica-saude-da-familia.json
Modo: handcraft_lote. max 1 gNN. Sem apply. Sem promote.
```

### E2 — Epi bootstrap

```text
Programa completo IDE: Epidemiologia e Vigilância Epidemiológica
Capítulos: Fechar taxonomia → BRANCH_DESIGN_MAP → âncoras → mold_branch ramos fortes
NÃO gNN em massa. Sem apply. Sem NeuroCanvas.
```

### E3 — Anatomia

```text
Mapeamento L3: Noções de Anatomia
Depois: playbook (modelo _default), lote_size=8 no registry, Criar âncoras.
Sem handcraft massa. Sem apply.
```

### E4 — Residual P0

```text
Continuar programa: <Subtópico>
Modo: repair P0. 1 unidade. Sem apply até "pode aplicar".
gabarito_item → truncagem → (VF) rotulos-vf → 2ª passada 0 → classify FP → dry-run
```

---

## Ordem operacional

```text
1) Onda 0 — dry-run/apply Sinais + Urgências (+ VF onda3)
2) Onda 1 — AB gNN → Epi bootstrap → Anatomia bootstrap (chats separados)
3) Onda 2 — residual letter Cálculo→…→Criança
4) Onda 3 — nota-10 visual até Enfermagem do Trabalho
5) Onda 4 — ship Trilha A (promote só se canPromoteToSell)
```

Artefato JSON: [`artifacts/avant-factory-queue-P0-P1.json`](./avant-factory-queue-P0-P1.json).
