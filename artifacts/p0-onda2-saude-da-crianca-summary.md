# Onda 2 — Saúde da Criança (1 pacote) — DISK READY

**Data:** 2026-08-03
**Lote:** `saude-da-crianca-completo`
**Apply:** **pendente** (NÃO aplicar até "pode aplicar")

## Baseline → after (disk)
| Métrica | Baseline | After |
|---------|--------:|------:|
| named letter | 105 | **0** |
| letter_spoiler | 105 | **0** |
| vf_verdict | 0 | **0** |

## Pipeline (esta conversa)
1. Âncoras aleitamento + genérico — blind-reader dry-run OK
2. Âncoras examples gabarito — `would_change=0`
3. Lote 2ª passada gabarito/trunc/VF — `would_change=0` (62 files)
4. Classify FP — residue vazio
5. Dry-run apply — **62/0**

## Gates
- named/letter/vf = **0**
- 2ª passada would_change = **0**
- dry-run = **62/0**

## Apply (quando autorizado)
```bash
npm run catalog:apply-lote -- --lote=saude-da-crianca-completo --apply --allow-generic --skip-preflight --skip-risk-approval --skip-anchor-review
```

## Handoff
Último pacote Onda 2 residual letter. Após apply: **Onda 3 — nota-10 visual** (fila Fábrica 20).
