# F5 — Decisão de proveniência (unresolved + S3)

> **Status:** aguardando decisão do fundador · agente **não** materializa  
> **Medido em:** 2026-07-31 · `audit:neurocanvas-blockers` OK · `audit:neurocanvas-editorial-queue` exit 1 (drift vs baseline G0.4)  
> **Referências:** [`NEUROCANVAS_G04_BASELINE.md`](../docs/NEUROCANVAS_G04_BASELINE.md) · [`NEUROCANVAS_G03_EDITORIAL_AUTHORITY.md`](../docs/NEUROCANVAS_G03_EDITORIAL_AUTHORITY.md)

## Por que isto bloqueia a Fase 0B

Os **342 unresolved** estão fora da baseline canônica (`iterateCanonicalQuestions` só percorre `selections`). Construir cache/baseline (Fase 0B) antes de fechar proveniência paga duas vezes — e escolhe a cópia errada em silêncio nos casos S3.

## Snapshot atual vs baseline G0.4

| Métrica | G0.4 (2026-07-27) | Atual (2026-07-31) | Δ |
|---------|------------------:|-------------------:|--:|
| unresolved / total_cases | 339 | **342** | +3 |
| clusters | 104 | **106** | +2 |
| official lane | 11 | **14** | +3 |
| manifest_conflict | 0 | 0 | 0 |
| pedagogical (lane) | — | 92 | — |
| metadata S1 (lane) | 74 | 74 | 0 |

Partição **mutuamente exclusiva** (atual = G0.4 + 3 na official):

| Bucket | Contagem |
|--------|----------:|
| `official_lane` | **14** |
| `pedagogical_s2_slide` | 84 |
| `s2_non_slide_residual` | 170 |
| `metadata_s1` | 74 |
| **Total** | **342** |

Severidade (blockers): S1=74 · S2=262 · **S3=6** · S4=0.  
`has_answer_key_divergence`: **sim** (9 slugs; união com S3 = official lane 14).

### Causa-raiz única (100% dos 342)

```
resolution_reason: "slug sem cópia listada em manifest/registry/contrato documentado"
evidence_pattern (106 clusters): sem_manifest_documentado
```

Nenhum unresolved tem `documented_paths_count > 0`. Catálogo em disco: **5.651** slugs = **5.309** selections + **342** unresolved.

### Drift +3 (só official lane)

| slug | sev | pacote | nota |
|------|-----|--------|------|
| `idecan-enfermagem-coleta-de-exames-laboratoriais-1778712165781-7` | S2 | Coleta | **NOVO** vs G0.4 · answer divergence |
| `idecan-enfermagem-coleta-de-exames-laboratoriais-1778712165781-8` | S2 | Coleta | **NOVO** vs G0.4 · answer divergence |
| `fgv-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1779572159431-6` | S3 | ISTs | **NOVO** vs G0.4 · instruction diverge entre lote/repair |

Os demais buckets (84 / 170 / 74) estão **estáveis** desde a baseline G0.4.

---

## Official lane — 14 casos (decisão humana obrigatória)

Ações permitidas por caso (já na fila G0.3A):  
`choose_existing_candidate` · `official_source_review` · `reject_all_candidates` · `defer`

### S3 — divergência de enunciado (6)

| case_id | slug | pacote | cópias | hashes | gabarito diverge? |
|---------|------|--------|-------:|-------:|:-----------------:|
| `nc-g03-25206cad…` | cotec-fadenor-…-saude-da-mulher-…-1 | Saúde da Mulher | 3 | 2 | não |
| `nc-g03-59f85731…` | decorp-…-exames-laboratoriais-…-3 | Exames Lab. | 3 | 3 | não |
| `nc-g03-bb9561b3…` | fgv-…-ists-…-6 | ISTs | 2 | 2 | não · **NOVO** |
| `nc-g03-7df66747…` | igeduc-…-processo-…-1780011879977-3 | Sinais Vitais* | 4 | 2 | não |
| `nc-g03-d5010605…` | igeduc-…-urgencias-…-1 | Urgências | 3 | 2 | **sim** |
| `nc-g03-e2f9a0c3…` | instituto-darwin-…-medicamentos-…-7 | Vias | 4 | 2 | não |

\*meta/subtópico drift: slug “processo” vs pacote Sinais Vitais — taxonomia + conteúdo.

### S2 + answer divergence (8) — também exigem fonte oficial

| case_id | slug | status prévio |
|---------|------|---------------|
| `nc-g03-a88a4eb9…` | `vunesp-sjrp-crase-a-qual` | **defer** documentado (Jundiaí) |
| `nc-g03-bad3482b…` | `vunesp-sjrp-termos-folhetos-…` | **defer** documentado (QUADRIX) |
| `nc-g03-2a5a44fc…` | idecan-coleta-…-7 | **NOVO** |
| `nc-g03-6190f08e…` | idecan-coleta-…-8 | **NOVO** |
| `nc-g03-b42a80ad…` | fumarc-atencao-basica-…-5 | aberto desde G0.4 |
| `nc-g03-56ec4b6e…` | ieses-atencao-basica-…-3 | aberto desde G0.4 |
| `nc-g03-9bc30daf…` | igeduc-processo-…-1780011859940-3 | aberto desde G0.4 |
| `nc-g03-e8ac8186…` | instituto-ibed-processo-…-8 | aberto desde G0.4 |

---

## Massa residual (328) — não é S3, mas trava o zero

| Bucket | n | Contrato típico sugerido pelo audit |
|--------|--:|-------------------------------------|
| pedagogical_s2_slide | 84 | Alinhar NeuroSlides **ou** declarar 1 path em manifest |
| s2_non_slide_residual | 170 | Incluir slug em `manifest.slugs[]` do completo / parent no playbook |
| metadata_s1 | 74 | Consistir `meta.subtopico` / family / branch |

Top pacotes unresolved: Processo de Enfermagem **186** · Curativos **34** · Segurança do Paciente **21**.  
Estimativa do audit: **106 decisões de contrato** (1 por cluster), não 342 revisões manuais de conteúdo.

---

## Decisões pedidas ao fundador

Responda com a letra de cada item (pode misturar).

### D1 — Modelo de autoridade (como materializar escolhas)

| Opção | O quê | Risco |
|-------|-------|-------|
| **A** (recomendada no G0.3) | Decisão → PR em manifests/registry → `catalog:apply-lote` | Baixo drift |
| **B** | Overlay `editorial-decisions.json` (diário) → depois promove a A | Médio se não promover |
| **C** | Tabela Supabase | Alto · zona vermelha · **não recomendada** |

**Pergunta:** confirma **A** como único path de ship? **B** só como diário opcional?

### D2 — Política para os 6 S3

| Opção | Efeito |
|-------|--------|
| **S3-strict** | Sem PDF/gabarito tier A → só `defer`; zero `choose_existing` |
| **S3-pragmatic** | Se instruction diverge mas `options[].is_correct` idêntico → permitir `choose_existing` da cópia handcraft mais recente + registrar fonte |
| **S3-reject** | `reject_all` + re-handcraft nos 6 (custo alto) |

Nota: 5/6 S3 **não** têm `has_answer_divergence`; 1/6 (Urgências) tem. Strict vs pragmatic muda o esforço.

### D3 — Official lane não-S3 (8)

| Opção | Efeito |
|-------|--------|
| **Keep-defer-VUNESP** | Manter defer nos 2 VUNESP-SJRP (já documentado) |
| **IDECAN-batch** | Tratar os 2 IDECAN coleta NOVOS como lote de proveniência (não confundir com IDECAN UFBA já `official_provenance_confirmed`) |
| **Open-6-source** | Abrir `official_source_review` nos 6 restantes (FUMARC, IESES, IGEDUC×2, IBED + os 2 IDECAN se não em D3-IDECAN) |

### D4 — Massa 328 (sem_manifest)

| Opção | Efeito |
|-------|--------|
| **Contract-bulk** | Política: “cópias órfãs → path do `*-completo` vence se hash semântico único no completo; senão defer cluster” · ~106 PRs de contrato |
| **Cluster-top-first** | Só top clusters (≥15 slugs) primeiro (~5 clusters, ~87 slugs) |
| **Freeze-unresolved** | Aceitar baseline canônica = 5309; unresolved ficam fora de 0B **para sempre** até handcraft — **não** zera a fila |

### D5 — Baseline do validador

O gate `audit:neurocanvas-editorial-queue` falha porque espera 339/104/11.

| Opção | Efeito |
|-------|--------|
| **Bump-G04b** | Atualizar `EDITORIAL_QUEUE_BASELINE_G04` → 342/106/14/0 + doc (reconhecer drift) |
| **Investigate-first** | Antes de bump: explicar por que IDECAN×2 + FGV entraram (diff de catálogo local vs main@cf840997) |
| **Hold** | Deixar exit 1 até D2/D3 fecharem e a contagem estabilizar |

### D6 — Fase 0B

| Opção | Efeito |
|-------|--------|
| **Block-until-zero** | 0B só com unresolved=0 (plano original F5→F6) |
| **Block-until-official-clear** | 0B quando official=0 e S3=0; massa 328 pode ficar excluída da baseline |
| **Allow-partial-now** | 0B sobre os 5309 já selected **agora** · unresolved continuam fora (já é o comportamento do iterator) — risco: baseline de hash muda quando a fila fechar |

---

## Recomendação do agente (não executada)

1. **D1 = A** (já ADR).  
2. **D2 = S3-strict** no caso Urgências (gabarito diverge); **S3-pragmatic** nos outros 5 após diff humano de instruction.  
3. **D3 = Keep-defer-VUNESP + IDECAN-batch** (os 2 novos IDECAN não são o lote UFBA já fechado).  
4. **D4 = Cluster-top-first** enquanto pedagogia F2–F4 roda em paralelo.  
5. **D5 = Investigate-first** depois **Bump-G04b**.  
6. **D6 = Block-until-official-clear** (desbloqueia 0B sem esperar 328 contratos).

Nada abaixo é aplicado sem a resposta do fundador.

## Artefatos desta medição

| Arquivo | Uso |
|---------|-----|
| `artifacts/neurocanvas-blocker-clusters.{json,md}` | 342 blockers · 106 clusters · S3 |
| `artifacts/neurocanvas-blocker-samples-20.{json,md}` | Amostra estratificada |
| `artifacts/neurocanvas-editorial-queue.{json,md}` | Fila G0.3A (JSON local; validação falhou por drift) |
| `artifacts/neurocanvas-editorial-review-pack.{json,md}` | Pack humano 20 cases |
| Este arquivo | Decisão F5 |

## Explicitamente fora (inalterado)

UI · renderer · piloto · apply Supabase · `production_ready` · Fase 0B · repair pedagógico F3 · atualizar baseline no código sem D5.
