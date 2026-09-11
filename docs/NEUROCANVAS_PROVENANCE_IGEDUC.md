# NeuroCanvas — Proveniência IGEDUC (proposta)

> **Status:** proposta apenas · **2× `create_corrected_candidate` + 1× `defer`**  
> **Materialização:** proibida até autorização explícita (`pode materializar`) — só para os casos `create`.  
> **Baseline G0.4:** permanece **339 / 104 / 11 / 0** · Fase 0B bloqueada · casos VUNESP-SJRP na official lane.

## Resumo

| Caso | Slug atual | Oficial (tier A) | Decisão |
|------|------------|------------------|----------|
| `nc-g03-9bc30daff9fcfbc0` | `…processo-…1780011859940-3` | Pref. **Jati** Tec Enf · **Q38** · gab. **A** | **create** |
| `nc-g03-7df66747dffa2e92` | `…processo-…1780011879977-3` | **CISRP** Paulo Afonso Tec Enf · **Q48** · gab. **E** | **create** |
| `nc-g03-d501060585489ef9` | `…urgencias-…1777104031822-1` | Pref. **Triunfo** 2023 (tier B só) | **defer** |

## Jati — úlcera venosa / curativo (Q38)

| Campo | Status |
|-------|--------|
| Portal | https://www.igeduc.org.br/informacoes/136/ |
| Caderno Tec Enf | PDF anexos selecao.net (26/04/2026) — **obtido** |
| Gab. definitivo | PDF 11/05/2026 — Tec Enf **38: A** |
| Gaps locais | Instruction sem citação da prescrição; slug Processo |

**Decisão: `create_corrected_candidate`.** Subtópico canônico esperado: Curativos e Manejo de Feridas.

## CISRP — assistência à criança (Q48)

| Campo | Status |
|-------|--------|
| Portal | https://igeduc.org.br/informacoes/137/ |
| Caderno Tec Enf | PDF anexos selecao.net (26/04/2026) — **obtido** · p.16 |
| Gab. definitivo | PDF 08/05/2026 — Tec Enf **48: E** |
| Gaps locais | `I.` (oficial/Processo) vs `I-` (Sinais); meta.orgao "Enfermagem" |

**Decisão: `create_corrected_candidate`.** Subtópico canônico esperado: Verificação de Sinais Vitais.

## Triunfo — PrEP sob demanda

| Campo | Status |
|-------|--------|
| Atribuição local | Pref Triunfo / Tec 2023 · gab. A |
| Espelhos | PCI / Provas Brasil (tier B) |
| PDF oficial + Q# + gab | **não obtidos** |

**Decisão: `defer`.** Novo PR quando PDFs oficiais aparecerem.

## Regra dura

- Sem PDF + Q# + gabarito definitivo → **defer** (Triunfo).
- Com tier A e candidato incompleto → **create** (Jati, CISRP).
- Sem `pode materializar` → **não** abrir aplicador / baseline / apply.

## Artefatos

- Fonte: `lib/neurocanvas/officialLaneProvenanceIgeducProposal.ts`
- Espelho: `artifacts/neurocanvas-provenance-igeduc-proposal.{json,md}`
