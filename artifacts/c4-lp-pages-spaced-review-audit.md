# Auditoria CMS `lp_pages` — promessa de revisão espaçada (C4)

**Data:** 2026-07-30  
**Ambiente:** banco primário AVANT (MCP workspace)  
**Modo:** somente leitura — nenhum `UPDATE`

## Resultado

| path | status | hits_spaced_promise | published_at (UTC) |
|------|--------|---------------------|--------------------|
| `avant-pro` | ativo | **sim** | 2026-05-22 |
| `campina-grande` | ativo | **sim** | 2026-05-22 |
| `goianinha` | arquivado | **sim** | 2026-05-22 |

Critério: `config` ou `seo` casam com revisão espaçada / plano diário / momento certo / revisão inteligente.

## Origem conhecida no repo

A migration `supabase/migrations/20260522075550_lp_avant_pro.sql` semeou copy com revisão espaçada / plano diário. **Não editar migration aplicada.** Corrigir via CMS (lote C4b).

Nota: `/lp/campina-grande` em produção pode ser servida pela rota estática do repo (`LPCampinaV2`) em vez do CMS — a row `campina-grande` ainda precisa limpeza se o CMS voltar a ser usado.

## Pendência C4b

Atualizar `config.copy` e `seo` das rows ativas (`avant-pro`, e `campina-grande` se aplicável) para a promessa vigente:

> Questão real → diagnóstico do erro → NeuroSlides que ensinam exatamente o que você errou.

Requer autorização explícita (toca produção). Sem `UPDATE` neste artefato.
