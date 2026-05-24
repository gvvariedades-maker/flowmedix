# Vitrine — Fase 3: filtros e paginação no banco

Prompt/spec de engenharia para o Cursor implementar a otimização da vitrine (`/estudar`).  
**Contexto:** a Fase 1 otimizou o player (dots janelados). A vitrine ainda processa o catálogo inteiro em memória a cada request.

---

## Problema (confirmado no código)

Fluxo atual em `lib/vitrine/service.ts` → `getVitrinePage`:

```
getModulosEstudoVitrineForUserCached(userId)   // até 10k módulos
  → filterModulosLikeVitrine (JS)
  → getHistoricoQuestoesForSlugsCached (todos os slugs filtrados, chunks de 120)
  → buildVitrineGroups (JS, todos os assuntos)
  → paginateGroups (só então fatia 12 assuntos para a UI)
```

A UI já é paginada (`VITRINE_ASSUNTOS_POR_PAGINA = 12` em `lib/vitrine/constants.ts`), mas o servidor **sempre** agrega tudo antes de paginar. Tempo de resposta escala com o tamanho do catálogo.

**Sintoma do usuário:** `/estudar` demora na primeira carga e a cada troca de filtro.

---

## Objetivo

Reduzir `/api/vitrine` para tempo **quase constante** na página 1, independente de 100 ou 10.000 questões no pacote — sem quebrar entitlements, ordenação nem paridade com o player.

## Fora de escopo (nesta fase)

- Subir teto de catálogo além do já configurado em `SCALE_LIMITS.VITRINE_MODULOS`
- Refatorar player / dots (Fase 1 — feito)
- Mudar contrato visual do `VitrineClient` (cards, filtros, animações)
- Keyset pagination (page 50+) — opcional como follow-up

---

## Arquitetura alvo

### Antes

```
Supabase → N módulos (entitlements) → JS filtra → JS busca histórico em massa → JS agrupa → JS pagina → JSON
```

### Depois

```
Supabase (entitlements + filtros + agregação + paginação de GRUPOS) → JSON
Facets: query agregada cacheada separada (TTL maior)
```

### ⚠️ Armadilha a evitar

**Não** paginar linhas de `modulos_estudo` com `LIMIT 12`.

A vitrine pagina **grupos por `titulo_aula`** (12 assuntos por página). Cada grupo contém **todas** as questões daquele assunto. O banco deve:

1. Restringir ao pacote acessível do usuário (entitlements)
2. Aplicar filtros (`banca`, `assunto`, `q`)
3. Agregar por `titulo_aula` (stats + ordenação de grupos)
4. Paginar **grupos** (OFFSET/LIMIT ou equivalente)
5. Para os 12 assuntos da página, retornar questões nested ordenadas

---

## Fontes de verdade (reutilizar, não duplicar)

| Área | Arquivo |
|------|---------|
| API vitrine | `app/api/vitrine/route.ts` |
| Serviço atual | `lib/vitrine/service.ts` |
| Filtros JS (paridade) | `lib/vitrineFilters.ts` — `filterModulosLikeVitrine`, `attachHistoricoStats`, `orderedSlugsFromVitrineGrouping` |
| Agrupamento UI | `lib/vitrine/buildGroups.ts` — `buildVitrineGroups` |
| Ordenação curriculum | `lib/vitrineOrder.ts` — `compareModuloCurriculum` |
| Facets | `lib/vitrine/facets.ts` |
| Tipos resposta | `lib/vitrine/types.ts` — `VitrinePageResponse` |
| Entitlements + SQL parcial | `lib/concursos/entitlements.ts` — `fetchAccessibleModulosForNav`, `collectModulosFromMatriculatedConcursos` |
| Nav player (mesma ordem) | `lib/estudar/questaoNav.ts` |
| Client | `components/vitrine/VitrineClient.tsx` |
| Cache | `lib/cache.ts` |
| Limites escala | `lib/scale/constants.ts` |

O player **já** empurra `banca`/`assunto` para SQL via `vitrineFiltersToSqlNavFilters` + `fetchAccessibleModulosForNav`. A vitrine deve **convergir** com esse caminho, não inventar query paralela incompatível.

---

## Regras de negócio que o SQL/RPC deve preservar

### Entitlements

- Pacote = matrículas ativas → `concurso_modulos` → `modulos_estudo`
- Edital matriculado → só módulos desse pacote (`getAccessibleModulosForMatriculatedEditalPacote`)
- Sem edital → união acessível (`getAccessibleModulosForUser`)
- Respeitar `moduloPermitidoNoVinculoConcurso` (filtro por slug do concurso × banca)
- **Nunca** confiar só no client; service role / RPC com `auth.uid()` validado

### Filtros (`VitrineQuerySchema` / `filterModulosLikeVitrine`)

| Filtro | Comportamento atual |
|--------|---------------------|
| `banca` | igualdade exata em `modulos_estudo.banca` |
| `assunto` | igualdade exata em `modulos_estudo.titulo_aula` |
| `q` | OR em: `titulo_aula`, `modulo_nome`, `banca`, `modulo_slug` (ilike); `avant_codigo` numérico ou `q-{codigo}` |

`banca` + `assunto` já podem ir para PostgREST (`AccessibleModulosNavSqlFilters`).  
`q` provavelmente exige RPC ou view — difícil só com `.filter()` client-side removido.

### Stats e flags por questão (`attachHistoricoStats`)

Por `modulo_slug` a partir de `historico_questoes`:

- `acertos`, `total`, `percentual`
- `estudoReversoConcluido` = existe tentativa com `estudo_reverso_concluido = true`
- `priorityScore` (usado internamente; manter lógica se ainda consumida)

Preferir agregação SQL (`COUNT`, `BOOL_OR`, etc.) em vez de N linhas no Node.

### Ordenação de grupos (`buildVitrineGroups`)

Grupos (`titulo_aula`) ordenados por:

1. **Mais pendentes primeiro:** `(totalQuestoes - trabalhadas)` DESC  
   (`trabalhadas` = questões com estudo reverso concluído)
2. Desempate: `titulo_aula` localeCompare ASC

Dentro de cada grupo, questões por `compareModuloCurriculum` (`created_at` asc, fallback `avant_codigo`, `modulo_slug`).

### Paridade player ↔ vitrine

`orderedSlugsFromVitrineGrouping` + `getQuestaoNavList` devem produzir a **mesma ordem de slugs** que a vitrine filtrada para os mesmos filtros URL (`?banca=&assunto=&q=`).

**Critério de regressão:** teste golden comparando slug list da vitrine filtrada vs `getQuestaoNavList` para fixtures conhecidas.

---

## Plano de implementação (incremental)

### Passo A — Quick win (PR pequeno, pode ir antes da RPC)

Em `getVitrinePage`, quando `filters.banca` ou `filters.assunto` estiverem definidos:

- Trocar `getModulosEstudoVitrineForUserCached` por `fetchAccessibleModulosForNav(userId, sqlFilters)`
- Manter `q` filtrado em JS **somente** sobre o subconjunto já reduzido no SQL
- Histórico: continuar `getHistoricoQuestoesForSlugsCached`, mas com menos slugs

**Ganho:** filtros comuns (banca/assunto) deixam de carregar catálogo inteiro.  
**Não resolve:** abertura sem filtro com catálogo grande.

### Passo B — RPC Postgres `get_vitrine_page` (core da Fase 3)

Criar migration em `supabase/migrations/` com função `SECURITY DEFINER` ou invocação via service role que:

**Entrada:** `p_user_id uuid`, `p_page int`, `p_banca text`, `p_assunto text`, `p_q text`

**Saída JSON** compatível com `VitrinePageResponse`:

```typescript
{
  groups: VitrineGrupoSubtopico[];  // exatamente até 12 grupos da página
  pagination: { page, perPage, totalGroups, totalPages };
  totalModulosFiltrados: number;
  // facets omitidos aqui — endpoint separado (Passo C)
}
```

**Implementação sugerida (CTE pipeline):**

1. `accessible_modulos` — equivalente a entitlements (join matrícula → concurso_modulos → modulos_estudo, dedup por slug/id)
2. `filtered_modulos` — WHERE banca/assunto/q
3. `historico_agg` — LEFT JOIN historico_questoes ON user_id + modulo_slug, agregar acertos/total/estudada
4. `modulos_enriched` — juntar stats
5. `group_stats` — GROUP BY titulo_aula: totais, trabalhadas, percentual grupo, first_slug (primeira não estudada ou primeira da ordem)
6. `groups_ordered` — ORDER BY pendentes DESC, titulo_aula ASC
7. `groups_page` — LIMIT 12 OFFSET (page-1)*12
8. `questoes_nested` — json_agg das questões dos titulo_aula da página, ordenadas por compareModuloCurriculum

Replicar `compareModuloCurriculum` em SQL:

```sql
ORDER BY created_at ASC NULLS LAST, avant_codigo ASC NULLS LAST, modulo_slug ASC
```

**Node:** `lib/vitrine/service.ts` chama RPC; remove loop catálogo completo.

### Passo C — Facets cacheados (endpoint ou flag)

Separar facets de `getVitrinePage`:

- Nova função `getVitrineFacets(userId, { banca? })` → `{ bancas, assuntos }`
- Cache `unstable_cache` TTL **15 min** (`CACHE_CONFIG.STATIC`), tags `vitrine-facets`, `user-{id}`
- `assuntos` respeitam filtro `banca` (como `buildVitrineFacets` hoje)
- API: `GET /api/vitrine/facets?banca=` **ou** query param `?facets=0` na rota principal para skip

`VitrineClient` pode carregar facets uma vez no mount e só refetch ao mudar banca.

---

## Cache e invalidação

| Dado | TTL sugerido | Tags |
|------|--------------|------|
| Facets | 15 min | `vitrine-facets`, `user-{id}` |
| Página vitrine | 1–2 min ou no-store | `vitrine-page`, `user-{id}` |
| Invalidar | webhook existente | `historico` / `modulos-estudo` changes |

Manter `Cache-Control: private, no-store` na API se dados incluem progresso do aluno em tempo quase real.

---

## Testes obrigatórios

1. **`__tests__/lib/vitrine/service.test.ts`** — adaptar mocks para RPC ou novo data layer
2. **Novo:** paridade ordem — vitrine filtrada vs `orderedSlugsFromVitrineGrouping` / `getQuestaoNavList`
3. **Novo:** paginação — page 2 retorna grupos diferentes; `totalGroups` correto
4. **Novo:** filtros — banca, assunto, q (texto e Q-123 / avant_codigo)
5. **Novo:** grupo com muitas questões — todas vêm no JSON do grupo (não truncar questões por LIMIT global)
6. Smoke manual: abrir `/estudar`, filtrar, clicar questão, navegar anterior/próxima com query params preservados

Usar `npm test`; opcional `npm run scale:health` após deploy para P95.

---

## Critérios de aceite (mensuráveis)

- [ ] Com catálogo ≥ 5.000 módulos acessíveis, **page 1** de `/api/vitrine` (sem filtro) responde em **&lt; 800 ms P95** em staging (cache frio aceitável até ~1.5 s)
- [ ] Com `?banca=X`, payload processa **só** módulos da banca (verificar logs/contagem `totalModulosFiltrados`)
- [ ] Resposta mantém contrato `VitrinePageResponse` — **sem breaking change** no `VitrineClient`
- [ ] Ordem de slugs idêntica entre vitrine filtrada e player (`getQuestaoNavList`) para mesmos filtros
- [ ] Facets não recomputam catálogo completo a cada paginação
- [ ] Entitlements: usuário sem matrícula / outro pacote **não** vê módulos alheios
- [ ] Nenhum `console.log`; usar `logger`

---

## Riscos de regressão

| Risco | Mitigação |
|-------|-----------|
| Ordem de grupos diferente | Teste golden slug list; copiar sort de `buildVitrineGroups` |
| `q` divergente entre SQL e JS | Manter helper TS de normalização; testes com Q- e avant_codigo |
| RPC lenta por JOIN pesado | Índices: `historico_questoes(user_id, modulo_slug)`, `modulos_estudo(titulo_aula, banca)` (já parcialmente existem) |
| OFFSET alto lento | Documentar; keyset em fase futura |
| Duplicar lógica entitlements | Extrair CTE compartilhável ou chamar funções SQL já alinhadas a `entitlements.ts` |

---

## Prompt copy-paste para o Cursor (Agent)

```
Implemente a Fase 3 da vitrine AVANT conforme docs/VITRINE_FASE3_PROMPT.md.

Contexto: getVitrinePage (lib/vitrine/service.ts) carrega até 10k módulos + histórico de todos os slugs filtrados e só então pagina 12 ASSUNTOS (titulo_aula). Isso deixa /estudar lento.

Objetivo: empurrar entitlements, filtros, agregação de histórico, ordenação de grupos e paginação para SQL (RPC Supabase preferível). Facets em cache separado.

REGRAS OBRIGATÓRIAS:
1. Paginar GRUPOS (titulo_aula), não LIMIT 12 em modulos_estudo. Cada grupo retorna todas as questões daquele assunto na página.
2. Reutilizar lógica de entitlements existente (lib/concursos/entitlements.ts, fetchAccessibleModulosForNav). Não inventar catálogo paralelo.
3. Preservar ordenação: grupos por pendentes DESC (totalQuestoes - trabalhadas), depois titulo_aula; questões por compareModuloCurriculum (lib/vitrineOrder.ts).
4. Preservar filtros de filterModulosLikeVitrine (banca, assunto, q com avant_codigo).
5. Manter contrato VitrinePageResponse e VitrineClient sem breaking changes.
6. Paridade com player: mesma ordem de slugs que getQuestaoNavList / orderedSlugsFromVitrineGrouping para mesmos filtros URL.
7. Diff focado; logger em vez de console.log; testes Jest.

ENTREGA INCREMENTAL (preferir PRs nesta ordem):
A) Quick win: getVitrinePage usa fetchAccessibleModulosForNav quando banca/assunto presentes.
B) Migration RPC get_vitrine_page + service.ts chama RPC.
C) Facets separados com cache STATIC (15 min).

Testes: estender __tests__/lib/vitrine/service.test.ts + teste paridade ordem vitrine vs questaoNav.

Aceite: page 1 /api/vitrine < 800ms P95 com catálogo grande; facets não reprocessam catálogo a cada page change.
```

---

## Referências

- Plano avaliado (player Fase 1): dots janelados — `lib/estudar/dotsNavWindow.ts`
- Nav player sem catálogo completo: `lib/estudar/questaoNav.ts`
- Métricas escala: `docs/SCALE_HEALTH.md`, `npm run scale:health`
- Limites: `lib/scale/constants.ts` (`VITRINE_MODULOS: 10_000`)
