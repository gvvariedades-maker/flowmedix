# Envelope de workload — 1.000 DAU (AVANT)

Versão máquina: [`scale-1k-workload-envelope.v1.json`](./scale-1k-workload-envelope.v1.json) (v1.0.2, `proposed_repaired_final`)  
Work unit: [`EWU_SCALE_1K_READINESS_001.md`](./EWU_SCALE_1K_READINESS_001.md)

**Status:** hipótese operacional; **não** substitui medição. Owner sign-off pendente.

---

## 1. O que significa “1.000 usuários ativos”

| Termo | Definição |
| --- | --- |
| **DAU** | 1.000 usuários **autenticados** com ≥1 ação de estudo no dia. |
| **Não é** | 1.000 simultâneos; MAU; anônimos na landing. |

---

## 2. Concorrência no pico (tier)

| Tier | CCU no pico | Uso |
| --- | ---: | --- |
| **Conservative** (baseline / ramp) | **50** | Primeiro teste em staging. |
| **Nominal** | **100** | Meta “1k DAU”. |
| **Stress** | **150** | Pico atípico. |

RPS: `CCU × generator_target (6 req/min) / 60` → ~5 / ~10 / ~15 médio; rajada ~×2,5.

O **6 req/min** é alvo deliberado do instrumento de teste (`assumption_type: conservative_capacity_test_target`, `measured_from_real_usage: false`). Não representa tráfego médio medido em produção nem fecha com `session_model` (22 min × 12 questões × think time) sem um modelo HTTP explícito por questão.

---

## 3. Autenticação (harness)

| Superfície | Mecanismo |
| --- | --- |
| **API** (`/api/vitrine`, `/api/estudar/questao`, `/api/registrar-tentativa`, `/api/simulado/*`) | `Authorization: Bearer` |
| **RSC** (`/estudar/{slug}`, `/desempenho`, `/cadernos`) | Cookies + sessão SSR (`proxy.ts` / `getServerSession`) |

k6 puro cobre bem as APIs Bearer; RSC exige fluxo browser-like (ex. Playwright) ou login SSR com cookie jar.

---

## 4. Mix de jornada = mix de requests

Fonte de verdade: `journey_mix` (70 / 12 / 10 / 5 / 3). Cada fatia expande em HTTP conforme `journey_to_http_expansion` no JSON.

| Jornada | Peso | Passos HTTP (peso dentro da jornada) |
| --- | ---: | --- |
| Player `/estudar` | 70% | RSC slug 35% · GET questão 35% · POST registrar 30% |
| Vitrine | 12% | GET `/api/vitrine` |
| Simulado | 10% | GET sessions 30% · GET questão 40% · POST responder 30% |
| Desempenho + cadernos | 5% | RSC `/desempenho` 50% · RSC `/cadernos` 50% |
| Auth / refresh | 3% | refresh token |

**`application_data_operation_ratio` (derivado):** ~**76%** leitura · **24%** escrita (soma dos `request_weight` por `kind` = read|write no **data plane** do produto). Não confundir com proporção de métodos HTTP GET/POST (ex.: refresh de token costuma ser POST HTTP e ainda classifica-se como read). Não usar 82/18.

**NeuroSlides:** embutidos no payload da questão; **sem** request HTTP independente no mix.

---

## 5. Superfícies críticas

1. `POST /api/registrar-tentativa` — escrita, RLS, cache user  
2. `GET /api/estudar/questao` — leitura pesada (inclui slides no payload)  
3. `GET /api/vitrine`  
4. `GET /estudar/{slug}` — RSC  
5. Simulado (janela **medida**): `GET /api/simulado/sessions`, `GET /api/simulado/questao`, `POST /api/simulado/responder`  
6. Simulado (**setup**, fora da janela medida na baseline v1): `POST /api/simulado/sessions` (criação de sessão/fixture por usuário sintético; cenário futuro separado para criação concorrente sob carga)  
7. Auth refresh sob carga  

Data plane do app: **Supabase JS + Auth + PostgREST**. Pooler PostgreSQL direto = só tooling de **DR restore**, não evidência do caminho do aluno.

---

## 6. Onde rodar

Staging / branch Supabase / local controlado — **sim**. Production — **não** sem autorização explícita do Owner.

---

## 7. Histórico de reparo

**v1.0.1:** rota `POST /api/registrar-tentativa`; journey ↔ operations; ratio derivado; neuroslides embedded; auth API vs RSC; data plane vs DR pooler.

**v1.0.2:** gerador 6 req/min como hipótese conservadora (não média observada); fases setup/measured do simulado; semântica `application_data_operation_ratio`.

---

## 8. Aprovação

| Campo | Valor |
| --- | --- |
| Owner sign-off | Pendente (`owner_signoff_required: true`) |
