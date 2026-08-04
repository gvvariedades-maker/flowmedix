# Onda 2 — P0 residual letter (Calculo→Crianca)

**Data:** 2026-08-03  
**Modelo:** Cursor Grok 4.5  
**Gate:** named=0 · 2a passada would_change=0 · dry-run (--allow-generic)

| Lote | baseline named | after | 2a pass | dry-run ok/fail |
|------|---------------:|------:|--------:|-----------------|
| calculo-completo | 157 | **0** | 0 | 155/0 |
| cuidados-completo | 245 | **0** | 0 | 134/0 |
| promocao-completo | 190 | **0** | 0 | 109/2 (gabarito diverge) |
| seguranca-completo | 114 | **0** | 0 | 76/0 |
| saude-da-crianca-completo | 105 | **0** | 0 | 62/0 |

## Engine
- gabarito_item: aceita resto numerico curto (Letra C — 80. → 80.) + remove frase A letra X…
- Jest repairPedagogySignatures 34/34
- Playbook Seguranca criado + wired no registry

## Handoff
1. Digite **pode aplicar** para apply dos 5 lotes com flags P0-2.
2. Promocao: 2 slugs ficam de fora (gabarito diverge) ate revisao humana.
3. Proxima onda: **Onda 3 nota-10 visual**.
