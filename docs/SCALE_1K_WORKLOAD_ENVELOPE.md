# Envelope de workload — 1.000 DAU (AVANT)

Versão máquina: [`scale-1k-workload-envelope.v1.json`](./scale-1k-workload-envelope.v1.json)  
Work unit: [`EWU_SCALE_1K_READINESS_001.md`](./EWU_SCALE_1K_READINESS_001.md)

**Status:** `proposed` — números derivados de heurística de produto edtech + superfícies do app; **não** substituem medição. Owner pode ajustar antes do primeiro teste.

---

## 1. O que significa “1.000 usuários ativos”

| Termo | Definição |
| --- | --- |
| **DAU** | 1.000 usuários **autenticados** com ≥1 ação de estudo no dia (tentativa em questão, resposta em simulado ou sessão de simulado iniciada). |
| **Não é** | 1.000 simultâneos; MAU; visitantes anônimos na landing. |

---

## 2. Concorrência no pico (tier)

Horário de referência: **19h–22h** (America/Sao_Paulo), ~35% das ações do dia na hora mais forte.

| Tier | Usuários simultâneos no pico | Uso |
| --- | ---: | --- |
| **Conservative** | **50** | Primeiro teste em staging; margem de segurança. |
| **Nominal** | **100** | Meta principal para “suportar 1k DAU”. |
| **Stress** | **150** | Promo, live, dia de prova; não é SLA cotidiano. |

Heurística: **5–15% do DAU** online ao mesmo tempo no pico para app de estudo assíncrono. Para 1.000 DAU → 50–150 CCU.

---

## 3. Sessão e ritmo

| Parâmetro | Valor |
| --- | ---: |
| Sessão média | 22 min |
| Questões / sessão (média) | 12 |
| Tempo de raciocínio / questão (média) | 90 s |
| Requisições HTTP “úteis” / min / usuário ativo | ~6 |

**RPS médio no pico (fórmula):**  
`CCU × 6 / 60`

| Tier | CCU | RPS médio | Rajada ~30s (×2,5) |
| --- | ---: | ---: | ---: |
| Conservative | 50 | ~5 | ~12 |
| Nominal | 100 | ~10 | ~25 |
| Stress | 150 | ~15 | ~40 |

Leitura **~82%** / escrita **~18%** (tentativa, simulado, histórico).

---

## 4. Mix de jornada (autenticado)

| Jornada | Peso |
| --- | ---: |
| Player `/estudar` (questão + slides + registrar) | 70% |
| Vitrine / navegação catálogo | 12% |
| Simulado (sessão, questão, responder) | 10% |
| Desempenho / cadernos | 5% |
| Auth / refresh / misc | 3% |

O `perf-smoke` atual **não** cobre este mix — só `401` em APIs sem token. O harness de capacidade deve usar **Bearer/cookie** e as operações listadas no JSON (`authenticated_operations`).

---

## 5. Superfícies críticas (ordem de prioridade no teste)

1. `POST /api/aluno/registrar-tentativa` — escrita + RLS + cache user  
2. `GET /api/estudar/questao` — leitura pesada (payload questão)  
3. `GET /api/vitrine` — paginação + entitlements  
4. `GET /estudar/[slug]` — RSC (latência percebida)  
5. `POST /api/simulado/responder` + leituras de sessão  
6. Supabase Auth (refresh sob carga)

Complementar com `npm run scale:health -- --json` no ambiente alvo (tetos 10k módulos, histórico 5k/usuário).

---

## 6. Onde rodar o teste

| Ambiente | Permitido |
| --- | --- |
| Staging / branch Supabase dedicado / local + Supabase real controlado | Sim |
| **Production (`avant.enf.br`)** | **Não** sem autorização explícita do Owner |

---

## 7. Próximo passo técnico (EWU fase 2)

1. Owner **aprovar ou editar** tiers CCU/RPS (comentário no JSON ou issue).  
2. Implementar **um** script de carga autenticado (k6 ou extensão do harness) usando fixtures tipo `smoke:rls-auth` / contas de teste — **fora de Production**.  
3. Medir p95 e taxa de erro; **só então** preencher `acceptance_placeholders` no JSON.  
4. Opcional: promover gate formal **G-CAPACITY-1K** com limiares aprovados.

---

## 8. Aprovação

| Campo | Valor |
| --- | --- |
| Proposto por | Agente (EWU-SCALE-1K-READINESS-001) |
| Data | 2026-09-26 |
| Owner sign-off | Pendente |
