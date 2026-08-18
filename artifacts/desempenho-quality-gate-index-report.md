# #110 — índice do quality-gate (medição)

Base: `main` em `657335ef` (merge do #109). PR empilhado: não.

## Camadas (não misturar)

| Camada | Resultado |
|---|---|
| PostgREST (6×1000, conc. 4) | ~3 s (já no #109) |
| Catálogo Node isolado (`getAccessibleModulosForUser`, 5476) | cold **4011 ms** / warm **2938 ms** |
| Clique → hub autenticado (`next build` + `next start`) | cold **4493 ms** / warm **631 ms** |

## Clique → hub (3+3)

Protocolo: produção local, sessão Pro, prefetch de `/desempenho` pendurado, cold = restart + wipe `.next/cache` + aba nova.

| | 1 | 2 | 3 | média |
|---|---:|---:|---:|---:|
| Cold | 4461 | 4970 | 4049 | **4493 ms** |
| Warm | 848 | 544 | 502 | **631 ms** |

Amostra inválida descartada: 808 ms (prefetch concluiu antes do hang).

Os três cold autenticados ficaram abaixo de 5 s.

## Paridade visível/oculto

5476 módulos gated, 171 ocultos, **mismatch 0** vs `findPacoteBySubtopico` + `canSell`. Hash dos ids gated: `99125dd9…14d331`.

## TTL

Jest cobre reuso < 60 s, reload após 60 s, e falha que não envenena o cache.

## Fora de escopo

RPC slim, P4/`evidence_attempt_events`, dedupe de auth/matrícula.
