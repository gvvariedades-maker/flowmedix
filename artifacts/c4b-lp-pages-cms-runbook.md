# C4b — Runbook CMS `lp_pages` (produção)

**Status:** preparado; **UPDATE remoto bloqueado** nesta sessão (MCP Supabase em transação read-only).
**Auditoria C4:** `artifacts/c4-lp-pages-spaced-review-audit.md`

## Rows afetadas

| path | status | ação |
|------|--------|------|
| `avant-pro` | ativo | UPDATE copy |
| `campina-grande` | ativo | UPDATE copy (CMS; rota estática do repo já reescrita no C4) |
| `goianinha` | arquivado | UPDATE copy para consistência |

## Promessa alvo

> Questão real → diagnóstico do erro → NeuroSlides que ensinam exatamente o que você errou.

## SQL (aplicar com role de escrita / SQL Editor Supabase)

`sql
-- avant-pro
UPDATE public.lp_pages
SET
  config = jsonb_set(
    jsonb_set(
      config,
      '{copy,subtitulo}',
      to_jsonb('Assinatura mensal para Técnico em Enfermagem: questões reais, diagnóstico do erro e NeuroSlides que ensinam exatamente o que você errou.'::text)
    ),
    '{copy,listaBeneficios}',
    '[\"Questões reais de EBSERH, prefeituras e bancas para Técnico em Enfermagem\",\"NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo\",\"Diagnóstico imediato do erro — conceito, detalhe ou pegadinha de banca\",\"Questão real → diagnóstico → NeuroSlides sob medida para o erro\",\"Acesso completo à plataforma — todos os editais em destaque\"]'::jsonb
  ),
  updated_at = now()
WHERE path = 'avant-pro';

-- campina-grande
UPDATE public.lp_pages
SET
  config = jsonb_set(
    config,
    '{copy,listaBeneficios}',
    '[\"Questões reais de concursos IDECAN para Técnico em Enfermagem\",\"NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo\",\"Diagnóstico imediato: erro de conceito, detalhe ou pegadinha de banca\",\"Questão real → diagnóstico → NeuroSlides sob medida para o erro\",\"Acesso completo à plataforma com assinatura AVANT Pro\"]'::jsonb
  ),
  updated_at = now()
WHERE path = 'campina-grande';

-- goianinha (arquivado)
UPDATE public.lp_pages
SET
  config = jsonb_set(
    config,
    '{copy,listaBeneficios}',
    '[\"Questões reais de concursos IDIB para Técnico em Enfermagem\",\"NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo\",\"Diagnóstico imediato do erro\",\"Questão real → diagnóstico → NeuroSlides sob medida para o erro\",\"Acesso completo à plataforma com assinatura AVANT Pro\"]'::jsonb
  ),
  updated_at = now()
WHERE path = 'goianinha';
`

## Verificação pós-UPDATE

`sql
SELECT path,
  (config::text ~* 'revis[aã]o espa[cç]ada|plano di[aá]rio|momento certo') AS still_hits
FROM public.lp_pages
WHERE path IN ('avant-pro','campina-grande','goianinha');
`

Esperado: `still_hits = false` em todas.

## Alternativa

Editar em `/admin/landings` (CMS) sem SQL.
