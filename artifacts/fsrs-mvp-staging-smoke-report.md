# FSRS MVP — staging smoke report

**generated_at:** 2026-07-29T19:47:39.366Z
**mode:** live
**synthetic:** true
**beta_email:** fs***@avant.test
**user_id_prefix:** ee57513c
**subtopico:** Imunização
**review_unit_id:** `fsrs:v1:discipline=enfermagem:subtopico=imuniza%C3%A7%C3%A3o`
**question_slug:** `idecan-enfermagem-imunizacao-1777103277533-4`
**seed_attempt_id:** `5385701b-6aa7-4272-b938-a3c4e1714c06`
**journey_attempt_id:** `02f9f89c-6dc0-4a0c-91f2-b9520259ee85`
**deploy_url:** n/a

## Validação

| Campo | Valor |
|---|---|
| seed revision | 1 |
| after revision | 2 |
| due_at (seed) | 2026-07-29T19:46:32.144+00:00 |
| due_at (after journey) | 2026-07-31T19:47:37.379+00:00 |
| logs seed attempt | 1 |
| logs journey attempt | 1 |
| retry logs (idempotência) | 1 |

## Checks

- **rpc_seed_outcome:** created
- **one_log_per_seed_attempt:** true
- **retry_idempotent:** true
- **card_revision_seed_ge_1:** true
- **last_question_id_matches:** true
- **due_at_seed_in_past:** true
- **user_created_or_reused:** reused
- **inventory_source:** meta
- **journey_revision_incremented:** true
- **one_log_per_journey_attempt:** true
- **due_at_advanced_after_journey:** true
- **overall:** PASS

## Rollback

- Production: `FSRS_MVP_ENABLED` omitido/false
- Staging preview: `FSRS_MVP_ENABLED=false` se precisar desligar beta
- Dados sintéticos: filtrar por `synthetic: true` neste artefato / e-mail smoke

## Deploy staging

| Item | Status |
|------|--------|
| Alias staging atual | lowmedix-git-staging-... → deploy Ready de **50d** (pré-FSRS) |
| Deploys recentes (main/PR/CLI) | **ERROR** — OOM SIGKILL no 
ext build (container 8 GB) |
| Mitigações aplicadas | NODE_OPTIONS=5120, experimental.cpus=1, webpackMemoryOptimizations, ercel.json build env |
| CLI deploy com flags FSRS | tentado; build ainda OOM |
| Produção | permanece off (FSRS_MVP_ENABLED ausente) |

**Veredito técnico DB:** FSRS MVP 100% funcional no staging **banco** (RPC → card/log/revision/due_at).  
**Veredito UI staging host:** bloqueado por OOM de build Vercel (pré-existente; production também falhando). Redeploy staging requer build machine maior ou pipeline CI→prebuilt.

