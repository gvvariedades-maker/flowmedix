# Patch páginas do catálogo — medição final

Status: **DESEMPENHO_CATALOG_PAGES_GATE_DE_MEDICAO_OK**. Otimização estrutural parcial: PostgREST ~16,3 s → ~3 s. Hub real ainda ~15,8 s, agora dominado por `isTituloAulaVisibleInVitrine` em Node. Meta <5 s **não** atingida; o PR pode seguir com o próximo gargalo explícito.

Ambiente: `next build --webpack` + `next start`, sem `E2E_DASHBOARD_BYPASS`, sessão Pro, `localhost:3000`. Cold do hub = aba nova + wipe `.next/cache` + restart.

Fora deste PR: RPC slim, P4, dedupe auth/matrícula.

## Catálogo isolado (`getAccessibleModulosForUser`, sem Next cache)

| | 1 | 2 | 3 | média |
|---|---:|---:|---:|---:|
| Cold | 16491 | 14132 | 14096 | **14906 ms** |
| Warm | 14743 | 16257 | 14413 | **15138 ms** |

Contagem: **5476** (6 páginas de 1000). Meta: < 4000 ms.

Split: páginas embed ~2,9 s de parede (PostgREST paralelo); `getActiveMatriculatedConcursoIds` ~0,7 s; `filterModulosByVitrineQualityGate` / `isTituloAulaVisibleInVitrine` ~12,5 s.

## Clique → hub `/estudar` → `/desempenho`

| | 1 | 2 | 3 | média |
|---|---:|---:|---:|---:|
| Cold | 14732 | 15400 | 17155 | **15762 ms** |
| Warm | 1381 | 472 | 522 | **792 ms** |

Baseline cold: 15911 ms. Meta cold: < 5000 ms. Pending/skeleton: 0 ms (mesmo frame). TTFB RSC cold ~500 ms; duração do flight ~15–17 s.

## Paridade exata — 5476 módulos

Comparação live **sequencial (while antigo)** vs **paralelo (`getAccessibleModulosForUser`)** no mesmo usuário (6 páginas):

| Campo | Valor |
|---|---|
| count | 5476 = 5476 |
| ids SHA-256 | `23c9c434b7e957707ec17f413e78e028cf708ed2dc0f6a4453a9c546f9208968` |
| slugs SHA-256 | `dfca74d9121374f8aca1d72739440ad1c5c675c3fcbf2df6d313a2fe0d6bda68` |
| metadados SHA-256 (id, slug, nome, titulo_aula, banca, created_at, avant_codigo) | `e085b7a7160e4e3ff94be1e765334f45dfc3dedf082a501bb4714bed2a43daec` |
| ordenação | `created_at` desc, idêntica |
| mismatch | nenhum |

Jest: 5647 linhas / 6 páginas, mesmos IDs/slugs/metadados, range sempre 1000, inflight >1 e ≤4, erro em página restante rejeita.

## git diff --check

PASS (sem erros de whitespace nos 3 arquivos de código).

## Unexport `zerar-desempenho`

Constantes deixam de ser `export` para o typecheck do Next em `route.ts`. JSON de resposta inalterado: `scope: "estudo"`, `cleared: ["historico_questoes"]`, `preserved`. Nenhum import externo das constantes.

## Próximo gargalo

Índice/cache de `isTituloAulaVisibleInVitrine` (`loadHandcraftRegistry` + `findPacoteBySubtopico` por módulo). RPC slim sozinha não paga a meta: o I/O PostgREST já está ~3 s.
