# Checklist de PR para Migrations (Supabase)

Use este checklist em todo PR que adiciona ou altera migrations.

## 1) Naming e estrutura

- [ ] Arquivo em `supabase/migrations/`
- [ ] Nome no padrão: `<timestamp>_descricao_em_snake_case.sql`
- [ ] Sem arquivo novo fora do padrão dentro de `supabase/migrations/`
- [ ] SQL idempotente quando aplicável (`IF NOT EXISTS`, `CREATE OR REPLACE`, etc.)

## 2) Segurança e impacto

- [ ] Sem uso de segredo/chave no SQL
- [ ] Sem relaxar políticas de segurança (RLS/GRANT) sem justificativa explícita
- [ ] Mudança é focada no escopo do PR (sem refatoração paralela)

## 3) Validação local (obrigatória)

- [ ] `npm run migration:list` (local/remoto consistente)
- [ ] `npm run check:architecture` (padrões cache/Supabase — também no CI)
- [ ] `npm run db:push` sem erro
- [ ] Se houver mudança de query crítica: executar `EXPLAIN (ANALYZE, BUFFERS)` em ambiente apropriado

## 4) Validação funcional

- [ ] Rotas/fluxos impactados testados manualmente
- [ ] Testes automatizados relevantes atualizados (quando existir cobertura equivalente)
- [ ] Sem regressão óbvia de performance no caminho crítico alterado

## 5) Staging (obrigatório antes de produção)

- [ ] Migration aplicada em staging
- [ ] `npm run migration:list` alinhado em staging
- [ ] `npm run check:db-types` (ou `--update` se migration alterou schema)
- [ ] `npm run scale:health -- --json` coletado quando a mudança afeta escala/performance
- [ ] Evidência de baseline/performance anexada quando aplicável

## 6) Documentação

- [ ] Documento técnico atualizado (ex.: `docs/SCALE_HEALTH.md`, `docs/SUPABASE_MAX_ROWS.md`)
- [ ] Notas de operação/rollback registradas no PR

## Comandos rápidos

```bash
npm run migration:list
npm run check:architecture
npm run check:db-types
npm run db:push
npm run scale:health -- --json
```
