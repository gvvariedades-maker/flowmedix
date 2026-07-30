# C4b — Runbook CMS `lp_pages` (produção)

**Status:** preparado e hardenizado; **escrita remota ainda NÃO autorizada**.
**Auditoria C4 (read-only):** `artifacts/c4-lp-pages-spaced-review-audit.md`

## Separação merge × execução (obrigatório)

| Ação | Autoriza escrita? |
|------|-------------------|
| Merge do PR #79 | **Não** — só versiona este runbook |
| Deploy / CI verde | **Não** |
| Aplicação no CMS / SQL Editor | **Somente** com autorização humana **separada**, após reauditoria |

Antes de qualquer escrita o operador deve confirmar:

1. projeto/ambiente Supabase (produção vs staging — tratar staging à parte);
2. que este runbook é o procedimento vigente;
3. que o backup local das 3 linhas está legível.

- **C5** (DROP `spaced_review_*`) **não depende** da execução deste CMS.
- **Nenhum DROP** faz parte do C4b.
- Não editar migrations já aplicadas (ex.: `20260522075550_lp_avant_pro.sql`).

---

## Schema confirmado no repositório

Fonte: `supabase/migrations/20260522064149_lp_pages.sql` + `types/database.supabase.snapshot.ts`.

Colunas de `public.lp_pages`:

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `path` | text UNIQUE NOT NULL | **chave canônica**; CHECK `^[a-z0-9]+(?:-[a-z0-9]+)*$` — **sem `/` inicial** |
| `template_id` | uuid NOT NULL | FK `lp_templates` |
| `status` | `lp_page_status` | `rascunho` \| `ativo` \| `arquivado` |
| `internal_name` | text NOT NULL | |
| `config` | jsonb NOT NULL | copy/oferta/concurso… |
| `seo` | jsonb NOT NULL | title/description/og* |
| `utm_campaign` | text | nullable |
| `published_at` | timestamptz | nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | existe — usar no UPDATE |

Paths exatos (sem slash):

- `avant-pro`
- `campina-grande`
- `goianinha`

URL pública = `/lp/{path}` (o slash **não** está na coluna `path`).

Campos tipicamente alterados neste lote: `config` (e `seo` **se** o pré-flight mostrar hit). Sempre tocar `updated_at`.

---

## Rows afetadas

| path | status esperado (auditoria) | ação |
|------|----------------------------|------|
| `avant-pro` | ativo | limpar promessa antiga em `config` (+ `seo` se hit) |
| `campina-grande` | ativo | idem (rota estática `LPCampinaV2` já reescrita no C4; row CMS ainda limpa) |
| `goianinha` | arquivado | idem, consistência |

---

## Promessa alvo (nova)

> Questão real → diagnóstico do erro → NeuroSlides que ensinam exatamente o que você errou.

### Regex da promessa antiga (detecção)

```text
revis[aã]o espa[cç]ada|plano di[aá]rio|momento certo|revis[aã]o inteligente
```

Aplicar a `config::text` **e** `seo::text`.

### Seed conhecido (`avant-pro`)

A migration `20260522075550_lp_avant_pro.sql` semeou em `config.copy`:

- `subtitulo` com “revisão espaçada e plano diário…”
- `listaBeneficios` com “Revisão espaçada automática…” e “Plano diário…”

O `seo` do seed **não** traz esses termos — mas produção pode divergir. O pré-flight decide se `seo` entra no UPDATE.

---

## 0. Pré-flight (somente leitura — obrigatório)

Executar **antes** de backup e de qualquer escrita. Não prosseguir se falhar.

```sql
-- A) Inventário + hits
SELECT
  path,
  status,
  id,
  updated_at,
  (config::text ~* 'revis[aã]o espa[cç]ada|plano di[aá]rio|momento certo|revis[aã]o inteligente') AS config_hits_old,
  (seo::text    ~* 'revis[aã]o espa[cç]ada|plano di[aá]rio|momento certo|revis[aã]o inteligente') AS seo_hits_old,
  (config::text ILIKE '%diagnóstico do erro%' AND config::text ILIKE '%NeuroSlides%') AS config_looks_new,
  (seo::text    ILIKE '%diagnóstico do erro%' AND seo::text    ILIKE '%NeuroSlides%') AS seo_looks_new,
  config -> 'copy' ->> 'subtitulo' AS copy_subtitulo,
  config -> 'copy' -> 'listaBeneficios' AS copy_lista_beneficios,
  seo ->> 'description' AS seo_description,
  seo ->> 'ogDescription' AS seo_og_description
FROM public.lp_pages
WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
ORDER BY path;

-- B) Asserts de cardinalidade (abortam se divergir)
DO $$
DECLARE
  total_count int;
  path_count int;
  p text;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM public.lp_pages
  WHERE path IN ('avant-pro', 'campina-grande', 'goianinha');

  IF total_count <> 3 THEN
    RAISE EXCEPTION 'pré-flight: esperado total=3, obtido=%', total_count;
  END IF;

  FOREACH p IN ARRAY ARRAY['avant-pro', 'campina-grande', 'goianinha']
  LOOP
    SELECT COUNT(*) INTO path_count FROM public.lp_pages WHERE path = p;
    IF path_count <> 1 THEN
      RAISE EXCEPTION 'pré-flight: path=% deve ter exatamente 1 linha, obtido=%', p, path_count;
    END IF;
  END LOOP;

  RAISE NOTICE 'pré-flight cardinalidade OK (3 paths × 1)';
END $$;
```

Regras:

- total exatamente **3**;
- cada path exatamente **1**;
- ausência ou duplicidade → **interromper**; **não** executar UPDATE.

### Decisão de idempotência (após SELECT A)

| Estado | Critério | Ação |
|--------|----------|------|
| **Ainda não aplicado** | algum `config_hits_old` ou `seo_hits_old` = true nos 3 paths | seguir (backup → bloco de escrita) |
| **Já aplicado** | nos 3 paths: old = false **e** promessa nova presente em `config` (e em `seo` se o path tiver seo comercial relevante) | **não escrever**; registrar “já aplicado” e encerrar |
| **Misto** | um path limpo e outro sujo, ou só metade dos campos | **parar** para investigação humana — **não** reparar parcialmente |

Se `seo_hits_old` = true em qualquer path, o bloco de escrita **deve** atualizar `seo` desse path na mesma transação. Se só `config` hit, documentar no registro do operador: “seo limpo no pré-flight; UPDATE só config”.

---

## 1. Backup / export (obrigatório — fora do Git)

Antes da transação de atualização:

1. Rodar o SELECT de backup abaixo.
2. No SQL Editor: exportar resultado como **CSV ou JSON**.
3. Salvar **fora do repositório**, com timestamp, ex.:
   `~/avant-backups/c4b-lp_pages-YYYYMMDD-HHMM-prod.json`
4. Registrar no log operacional: ambiente/projeto Supabase, data UTC, operador.
5. Conferir que o arquivo contém **exatamente 3** linhas/objetos.
6. **Não** commitar o backup no Git.
7. **Não** copiar secrets, tokens, service-role key nem dados de autenticação para o export/chat/PR.

```sql
-- Backup mínimo para restauração (colunas reais do schema)
SELECT
  id,
  path,
  template_id,
  status,
  internal_name,
  config,
  seo,
  utm_campaign,
  published_at,
  created_at,
  updated_at
FROM public.lp_pages
WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
ORDER BY path;
```

Sem backup legível de 3 linhas → **não prosseguir**.

---
## 2. Escrita atômica (recomendado no SQL Editor Supabase)

O SQL Editor costuma **não** preservar a mesma sessão entre abas/envios. Por isso o procedimento **primário** é **um único** bloco `DO $$ … $$;` colado de uma vez:

- roda em **uma** transação implícita;
- qualquer `RAISE EXCEPTION` faz **ROLLBACK** de tudo;
- sucesso = commit automático do statement (equivalente a COMMIT só se tudo passou).

**Não** enviar UPDATEs soltos um a um.

### 2.1 Conteúdo novo explícito (`config`)

Ajuste fino pode seguir o pré-flight; valores-alvo abaixo substituem a promessa antiga.

**avant-pro — `config.copy.subtitulo`:**

```text
Assinatura mensal para Técnico em Enfermagem: questões reais, diagnóstico do erro e NeuroSlides que ensinam exatamente o que você errou.
```

**avant-pro — `config.copy.listaBeneficios`:**

```json
[
  "Questões reais de EBSERH, prefeituras e bancas para Técnico em Enfermagem",
  "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
  "Diagnóstico imediato do erro — conceito, detalhe ou pegadinha de banca",
  "Questão real → diagnóstico → NeuroSlides sob medida para o erro",
  "Acesso completo à plataforma — todos os editais em destaque"
]
```

**campina-grande — `listaBeneficios`:**

```json
[
  "Questões reais de concursos IDECAN para Técnico em Enfermagem",
  "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
  "Diagnóstico imediato: erro de conceito, detalhe ou pegadinha de banca",
  "Questão real → diagnóstico → NeuroSlides sob medida para o erro",
  "Acesso completo à plataforma com assinatura AVANT Pro"
]
```

**goianinha — `listaBeneficios`:**

```json
[
  "Questões reais de concursos IDIB para Técnico em Enfermagem",
  "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
  "Diagnóstico imediato do erro",
  "Questão real → diagnóstico → NeuroSlides sob medida para o erro",
  "Acesso completo à plataforma com assinatura AVANT Pro"
]
```

### 2.2 `seo` (condicional)

Só se o pré-flight marcar `seo_hits_old` para aquele path. Exemplo de textos **novos** (não embutir valores de produção no Git):

| path | campo | valor sugerido |
|------|-------|----------------|
| `avant-pro` | `seo.description` | `Questão real → diagnóstico do erro → NeuroSlides que ensinam exatamente o que você errou. AVANT Pro para Técnico em Enfermagem.` |
| `avant-pro` | `seo.ogDescription` | idem ou variante curta com a mesma promessa |
| outros | conforme hit | reescrever **somente** campos que batem a regex antiga |

Se `seo` estiver limpo, **omitir** os `UPDATE` de `seo` no bloco (comentar as seções).

### 2.3 Bloco PL/pgSQL (colar inteiro)

```sql
DO $$
DECLARE
  n int;
  p text;
  cfg_old int;
  seo_old int;
  other_changed int;
BEGIN
  -- Lock das três linhas
  PERFORM 1
  FROM public.lp_pages
  WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
  ORDER BY path
  FOR UPDATE;

  SELECT COUNT(*) INTO n
  FROM public.lp_pages
  WHERE path IN ('avant-pro', 'campina-grande', 'goianinha');
  IF n <> 3 THEN
    RAISE EXCEPTION 'lock/assert: esperado 3 linhas, obtido %', n;
  END IF;

  FOREACH p IN ARRAY ARRAY['avant-pro', 'campina-grande', 'goianinha']
  LOOP
    SELECT COUNT(*) INTO n FROM public.lp_pages WHERE path = p;
    IF n <> 1 THEN
      RAISE EXCEPTION 'assert path=% count=% (esperado 1)', p, n;
    END IF;
  END LOOP;

  -- ——— avant-pro (config) ———
  UPDATE public.lp_pages
  SET
    config = jsonb_set(
      jsonb_set(
        config,
        '{copy,subtitulo}',
        to_jsonb(
          'Assinatura mensal para Técnico em Enfermagem: questões reais, diagnóstico do erro e NeuroSlides que ensinam exatamente o que você errou.'::text
        )
      ),
      '{copy,listaBeneficios}',
      '[
        "Questões reais de EBSERH, prefeituras e bancas para Técnico em Enfermagem",
        "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
        "Diagnóstico imediato do erro — conceito, detalhe ou pegadinha de banca",
        "Questão real → diagnóstico → NeuroSlides sob medida para o erro",
        "Acesso completo à plataforma — todos os editais em destaque"
      ]'::jsonb
    ),
    updated_at = now()
  WHERE path = 'avant-pro';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'UPDATE avant-pro config: row_count=% (esperado 1)', n;
  END IF;

  -- ——— avant-pro (seo) — DESCOMENTAR só se seo_hits_old = true no pré-flight ———
  -- UPDATE public.lp_pages
  -- SET
  --   seo = jsonb_set(
  --     jsonb_set(
  --       seo,
  --       '{description}',
  --       to_jsonb('Questão real → diagnóstico do erro → NeuroSlides que ensinam exatamente o que você errou. AVANT Pro para Técnico em Enfermagem.'::text)
  --     ),
  --     '{ogDescription}',
  --     to_jsonb('Questão real → diagnóstico do erro → NeuroSlides. Assinatura para Técnico em Enfermagem.'::text)
  --   ),
  --   updated_at = now()
  -- WHERE path = 'avant-pro';
  -- GET DIAGNOSTICS n = ROW_COUNT;
  -- IF n <> 1 THEN
  --   RAISE EXCEPTION 'UPDATE avant-pro seo: row_count=% (esperado 1)', n;
  -- END IF;

  -- ——— campina-grande (config) ———
  UPDATE public.lp_pages
  SET
    config = jsonb_set(
      config,
      '{copy,listaBeneficios}',
      '[
        "Questões reais de concursos IDECAN para Técnico em Enfermagem",
        "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
        "Diagnóstico imediato: erro de conceito, detalhe ou pegadinha de banca",
        "Questão real → diagnóstico → NeuroSlides sob medida para o erro",
        "Acesso completo à plataforma com assinatura AVANT Pro"
      ]'::jsonb
    ),
    updated_at = now()
  WHERE path = 'campina-grande';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'UPDATE campina-grande config: row_count=% (esperado 1)', n;
  END IF;

  -- ——— goianinha (config) ———
  UPDATE public.lp_pages
  SET
    config = jsonb_set(
      config,
      '{copy,listaBeneficios}',
      '[
        "Questões reais de concursos IDIB para Técnico em Enfermagem",
        "NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo",
        "Diagnóstico imediato do erro",
        "Questão real → diagnóstico → NeuroSlides sob medida para o erro",
        "Acesso completo à plataforma com assinatura AVANT Pro"
      ]'::jsonb
    ),
    updated_at = now()
  WHERE path = 'goianinha';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'UPDATE goianinha config: row_count=% (esperado 1)', n;
  END IF;

  -- Pós-UPDATE (ainda na mesma transação)
  SELECT COUNT(*) INTO cfg_old
  FROM public.lp_pages
  WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
    AND config::text ~* 'revis[aã]o espa[cç]ada|plano di[aá]rio|momento certo|revis[aã]o inteligente';

  SELECT COUNT(*) INTO seo_old
  FROM public.lp_pages
  WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
    AND seo::text ~* 'revis[aã]o espa[cç]ada|plano di[aá]rio|momento certo|revis[aã]o inteligente';

  IF cfg_old <> 0 THEN
    RAISE EXCEPTION 'pós-UPDATE: config ainda com promessa antiga em % path(s)', cfg_old;
  END IF;

  -- Se seo foi atualizado (ou já estava limpo), seo_old deve ser 0.
  -- Se você NÃO descomentou UPDATEs de seo e seo_old > 0, o bloco aborta de propósito:
  -- volte ao pré-flight, descomente seo e rode de novo (ou investigue).
  IF seo_old <> 0 THEN
    RAISE EXCEPTION 'pós-UPDATE: seo ainda com promessa antiga em % path(s) — habilite UPDATE seo ou investigue', seo_old;
  END IF;

  -- Presença da promessa nova (ainda na mesma transação)
  IF EXISTS (
    SELECT 1
    FROM public.lp_pages
    WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
      AND NOT (
        config::text ILIKE '%diagnóstico do erro%'
        AND config::text ILIKE '%NeuroSlides%'
      )
  ) THEN
    RAISE EXCEPTION 'pós-UPDATE: promessa nova ausente em config de pelo menos 1 path';
  END IF;

  -- Nenhuma outra landing alterada nesta sessão (sanity: só os 3 paths no escopo)
  SELECT COUNT(*) INTO other_changed
  FROM public.lp_pages
  WHERE path NOT IN ('avant-pro', 'campina-grande', 'goianinha')
    AND updated_at > now() - interval '1 minute';
  -- Nota: o filtro por updated_at é heurística; o invariante forte é WHERE path = ...
  -- em cada UPDATE. Se other_changed > 0, investigue antes de considerar sucesso.
  IF other_changed <> 0 THEN
    RAISE EXCEPTION 'pós-UPDATE: % landing(s) fora do escopo com updated_at recente — abort', other_changed;
  END IF;

  -- JSON válido: colunas jsonb já rejeitam JSON inválido no UPDATE.
  RAISE NOTICE 'C4b OK: 3 updates config; promessa antiga ausente em config/seo';
END $$;
```

Row count esperado: **1 + 1 + 1 = 3** (mais UPDATEs de `seo` se habilitados, cada um também = 1).
Qualquer `0` ou `>1` → exceção → **nada commitado**.

### 2.4 Alternativa com sessão explícita (psql / mesma conexão)

Só se a ferramenta **garantir** a mesma sessão:

```sql
BEGIN;
-- SELECT … FOR UPDATE + asserts + UPDATEs + GET DIAGNOSTICS + SELECT pós
-- Revisar o output na sessão.
-- Se OK:
COMMIT;
-- Se qualquer divergência:
-- ROLLBACK;
```

Não executar `COMMIT` no mesmo envio “cego” sem ler o resultado das verificações.
Se a UI auto-commit por statement, **prefira o bloco `DO $$` da §2.3**.

---
## 3. Verificação pós-escrita (confirmação)

Após sucesso do `DO $$` (ou após `COMMIT`):

```sql
SELECT
  path,
  status,
  (config::text ~* 'revis[aã]o espa[cç]ada|plano di[aá]rio|momento certo|revis[aã]o inteligente') AS config_still_old,
  (seo::text    ~* 'revis[aã]o espa[cç]ada|plano di[aá]rio|momento certo|revis[aã]o inteligente') AS seo_still_old,
  (config::text ILIKE '%diagnóstico do erro%') AS config_has_new_promise,
  updated_at
FROM public.lp_pages
WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
ORDER BY path;
```

**Esperado:** 3 linhas; `config_still_old` = false; `seo_still_old` = false; `config_has_new_promise` = true (pelo menos nos paths em que a lista/subtítulo foi reescrita).

---

## 4. Rollback documentado

### 4.1 Antes do COMMIT (sessão explícita)

```sql
ROLLBACK;
```

Confirmar com o SELECT da §3 (ou pré-flight) que os valores originais permanecem.

No fluxo `DO $$`, a exceção **já** desfaz tudo — não há COMMIT parcial.

### 4.2 Restauração após COMMIT (somente via backup local)

**Não** embutir no Git os `config`/`seo` reais de produção.
Preencher placeholders a partir do export da §1.

Mesmo padrão do apply (§2.3): **um único** `DO $$` no SQL Editor (transação implícita; `RAISE` = rollback total). Não abrir `BEGIN` numa aba e `COMMIT` noutra.

Substituir cada `<COLAR_…>` pelo JSON **exato** do backup antes de colar. Os placeholders **não** são JSON válido — se esquecer de preencher, o cast `::jsonb` falha e nada é commitado.

```sql
DO $$
DECLARE
  n int;
  p text;
BEGIN
  -- Lock + cardinalidade
  PERFORM 1
  FROM public.lp_pages
  WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
  ORDER BY path
  FOR UPDATE;

  SELECT COUNT(*) INTO n
  FROM public.lp_pages
  WHERE path IN ('avant-pro', 'campina-grande', 'goianinha');
  IF n <> 3 THEN
    RAISE EXCEPTION 'restore: esperado total=3, obtido=%', n;
  END IF;

  FOREACH p IN ARRAY ARRAY['avant-pro', 'campina-grande', 'goianinha']
  LOOP
    SELECT COUNT(*) INTO n FROM public.lp_pages WHERE path = p;
    IF n <> 1 THEN
      RAISE EXCEPTION 'restore: path=% count=% (esperado 1)', p, n;
    END IF;
  END LOOP;

  -- avant-pro
  UPDATE public.lp_pages
  SET
    config = '<COLAR_CONFIG_JSON_DO_BACKUP_AVANT_PRO>'::jsonb,
    seo = '<COLAR_SEO_JSON_DO_BACKUP_AVANT_PRO>'::jsonb,
    updated_at = now()
  WHERE path = 'avant-pro';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'restore avant-pro: row_count=% (esperado 1)', n;
  END IF;

  -- campina-grande
  UPDATE public.lp_pages
  SET
    config = '<COLAR_CONFIG_JSON_DO_BACKUP_CAMPINA>'::jsonb,
    seo = '<COLAR_SEO_JSON_DO_BACKUP_CAMPINA>'::jsonb,
    updated_at = now()
  WHERE path = 'campina-grande';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'restore campina-grande: row_count=% (esperado 1)', n;
  END IF;

  -- goianinha
  UPDATE public.lp_pages
  SET
    config = '<COLAR_CONFIG_JSON_DO_BACKUP_GOIANINHA>'::jsonb,
    seo = '<COLAR_SEO_JSON_DO_BACKUP_GOIANINHA>'::jsonb,
    updated_at = now()
  WHERE path = 'goianinha';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN
    RAISE EXCEPTION 'restore goianinha: row_count=% (esperado 1)', n;
  END IF;

  RAISE NOTICE 'restore C4b OK: 3 linhas restauradas do backup';
END $$;
```

Verificação imediata (read-only, após sucesso do `DO $$`):

```sql
SELECT path, status, updated_at,
  left(config::text, 120) AS config_prefix,
  left(seo::text, 120) AS seo_prefix
FROM public.lp_pages
WHERE path IN ('avant-pro', 'campina-grande', 'goianinha')
ORDER BY path;
```

Comparar com o arquivo de backup. Se divergir: **não** improvisar — repetir o `DO $$` de restore com os JSONs corretos do backup (ou investigar).

## 5. Alternativa `/admin/landings` (CMS UI)

O Admin **não** dispensa backup, escopo nem validação.

Gates obrigatórios (iguais ao SQL):

1. Backup/export das 3 linhas (§1) **antes**.
2. Editar **somente** `avant-pro`, `campina-grande`, `goianinha` — **sem** edição em massa.
3. Captura do “antes” (screenshot ou JSON) por path.
4. Alteração **individual** por landing.
5. Validação posterior (§3) via SQL read-only ou reabrir cada LP.
6. Plano de restauração (§4.2) pronto.
7. Se estado misto após editar um path — **parar**; não “consertar o resto no automático”.

---

## 6. Checklist do operador (resumo)

- [ ] Pré-flight SELECT + asserts (total 3, 1 por path)
- [ ] Idempotência classificada (não aplicado / já aplicado / misto)
- [ ] Decisão `seo`: atualizar ou omitir, com base no pré-flight
- [ ] Backup CSV/JSON fora do Git (3 linhas), sem secrets
- [ ] Um único `DO $$` (ou BEGIN…COMMIT na mesma sessão)
- [ ] ROW_COUNT = 1 por UPDATE; abort em divergência
- [ ] Pós-SELECT: old = false; nova promessa presente
- [ ] Registro: ambiente, data, operador, resultado
- [ ] **Sem** autorização explícita de escrita → **não executar**

---

## Proibições

- `UPDATE` sem `WHERE path = '…'`
- Atualizar todas as landings / confiar só em `internal_name` / título
- `COMMIT` antes de validar row count / pós-SELECT
- Commitar backup real, tokens ou service-role no repositório
- Tratar merge do #79 como “CMS corrigido”
- Qualquer `DROP` ou migration nova neste lote
