# A4 de produção — AMEOSC / EDUCA (2026-07-27)

> Gate de **aprovação para produção** dos dois slugs materializados no G0.4.  
> **Não** altera a baseline G0.4 (347 unresolved). **Não** resolve IDECAN. **Não** inicia UI/piloto/Supabase/Fase 0B.

Artefato canônico: [`decision-2026-07-27.json`](./decision-2026-07-27.json)

## Veredito

| Caso | Decisão | `production_approved` |
|------|---------|----------------------:|
| **AMEOSC** `ameosc-enfermagem-nocoes-de-fisiologia-1775448586547-7` | **PROMOVER** | `true` |
| **EDUCA** `educa-pb-enfermagem-nocoes-de-fisiologia-1775448599930-0` | **MANTER BLOQUEADO** | `false` |

## AMEOSC — promover

**Pendente A4:** validar valores de temperatura da coluna da prova.

**Evidência oficial**

1. Caderno TE/ESF Prova 1 (ZIP oficial AMEOSC) — coluna:
   - Febre (4): 38–39 °C
   - Estado febril (3): 37,8–38 °C
   - Febrícula (2): 37,5–37,7 °C
   - Normotermia (1): 36–37,4 °C
   - Alternativas idênticas ao JSON; **D = 4, 3, 2 e 1**
2. Gabarito definitivo 15/09/2025 — TE/ESF **Prova 1 Q04 = D**
3. Cruzamento dos 4 cadernos: a sequência 4-3-2-1 coincide com o gabarito do **número de questão** de cada matriz (embaralhamento de caderno, não inconsistência).

**Justificativa:** faixas térmicas e letra D estão fiéis à prova oficial (Prova 1). Liberado para aprovação de produção deste slug.

**Ainda fora:** `production_ready` do pacote, Supabase, piloto, Fase 0B. Não reduz unresolved.

## EDUCA — manter bloqueado

**Pendente A4:** decidir D (banca) × B (técnico) sem contaminar mastery/FSRS/métricas.

**Evidência oficial**

1. Prova TE Pedras de Fogo — Q34: II afirma FC 30–165; IV chama taquipneia de FR &lt;12; comando “Estão INCORRETOS”; D = “II e IV estão corretos”; B = “II e IV estão errados”.
2. Edital Normativo 014/2025 — TE **Q34 = D** (não nula).
3. POP HC-UFTM v6 — adulto FC 60–100; FR 12–20; bradipneia &lt;12; taquipneia &gt;20.

**Tratamento**

| Chave | Valor | Uso |
|-------|-------|-----|
| Oficial / banca | **D** | Preservada no conteúdo (`is_correct` + `exam_vs_current`) |
| Técnica | **B** | Documentada nos slides e em `exam_vs_current` |
| Produção | **bloqueada** | Sem contrato de exclusão de métricas |

**Por que não promover**

- Promover com D: aluno que marca B (clínica correta) vira erro → contamina mastery/FSRS/métricas.
- Virar B: quebra gabarito oficial → contamina métricas de modo prova.
- `exam_vs_current` documenta o conflito, mas **não** isola scoring.

**Desbloqueio exige:** contrato de item defeituoso unscored (`scoring_eligible=false` / exclusão mastery-FSRS) ou retirada do pool scored — fora desta rodada.

## Explicitamente não feito

Baseline G0.4 · IDECAN · UI · piloto · Supabase · Fase 0B · `production_ready` do pacote.
