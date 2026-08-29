# AVANT — Backup Automation & Off-Site Operationalization Architecture (7F.3 / 7F.3.2 Hardened)

---

## 1. Reclassificação de Sensibilidade e Conjunto Canônico de Backup (`AVANT_BACKUP_SET`)

No AVANT, **todos os dados de banco de dados e aplicação são classificados como estritamente sensíveis** devido à presença de identificadores de usuários (`uuid`/`user_id`), histórico de estudos, matrículas em concursos, compras, preferências e telemetria analítica vinculável.

### Matriz do Conjunto Canônico de Backup

| Componente | Sensível? | Frequência | Formato | Criptografia Off-Site | Restore Tooling |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **A. Database / Public** (Schema + Data) | **Sim** | Diário (03:00 UTC) | SQL Dump | **Obrigatória (AES-256-GCM)** | `scripts/restore-from-baseline.ts` |
| **B. Auth Sensitive** (`auth.users`, `auth.identities`, `auth.mfa_factors`) | **Sim** | Diário (03:00 UTC) | JSON Stream | **Obrigatória (AES-256-GCM)** | `scripts/production-auth-backup-drill.ts` |
| **C. Storage Figures** (`questao-figures`) | **Sim** | Diário / Change-Aware | `AVANT_STORAGE_FIGURES_V1` (bytes + SHA-256; sem tar/ZIP plaintext em disco) | **Obrigatória (AES-256-GCM)** | Restore sintético via `restoreStorageFiguresBytes` |
| **D. Recovery Metadata** (Ledger, baseline, hashes) | **Sim** | Diário (03:00 UTC) | JSON | **Obrigatória (AES-256-GCM)** | `scripts/verify-baseline-integrity.ts` |

> [!IMPORTANT]
> **`FULL_OFFSITE_BACKUP_ENCRYPTION = PASS`:** Nenhum componente trafega ou repousa em texto claro no vault off-site. Todo o conjunto é unificado e selado no formato autenticado **`AVANT_DR_SNAPSHOT_V1`**.

---

## 2. Formato do Envelope `AVANT_DR_SNAPSHOT_V1` & Autenticidade do Manifesto

O formato de snapshot **`AVANT_DR_SNAPSHOT_V1`** encapsula o manifesto interno e todos os componentes dentro do payload autenticado e cifrado, impedindo ataques de substituição de payload e manifesto combinados.

```json
{
  "format_version": "AVANT_DR_SNAPSHOT_V1",
  "magic": "AVANT_DR_V1",
  "snapshot_id": "dr-production-daily-101-1787848000000",
  "sequence_id": 101,
  "created_at": "2026-08-27T03:00:00.000Z",
  "project_id": "ozgouenqrofnvgrlgfwd",
  "gfs_tier": "daily",
  "wrapped_dek": {
    "algorithm": "AES-256-GCM",
    "iv_hex": "...",
    "auth_tag_hex": "...",
    "ciphertext_hex": "..."
  },
  "payload_iv_hex": "...",
  "payload_auth_tag_hex": "...",
  "payload_ciphertext_base64": "...",
  "ciphertext_sha256": "..."
}
```

* **`MANIFEST_INSIDE_AUTHENTICATED_ENVELOPE = YES`** $\rightarrow$ **`MANIFEST_AUTHENTICITY = PASS`**.
* **Additional Authenticated Data (AAD):** O cabeçalho AAD vincula criptograficamente `magic:snapshot_id:sequence_id:gfs_tier:created_at:project_id` ao AuthTag do payload. Qualquer tentativa de adulterar o timestamp, sequência, tier GFS ou ID de projeto invalida imediatamente a decifração.

---

## 3. Hierarquia Criptográfica (KEK $\rightarrow$ Per-Snapshot DEK)

```text
[Master Passphrase / CSPRNG Key]
        │
        ▼ (Scrypt KDF: N=16384, r=8, p=1, salt='AVANT_BACKUP_KEK_SALT_V1')
[KEK (Key Encryption Key)] ────────── (Reside estritamente em GitHub Secrets + Offline Escrow)
        │
        ▼ (AES-256-GCM Wrap com AAD='AVANT_DEK_WRAP_AAD_V1')
[Wrapped DEK] ─── (Armazenada no envelope do snapshot)
        ▲
        │ (Chave aleatória de 256 bits gerada por CSPRNG a cada backup)
[Random Per-Snapshot DEK]
        │
        ▼ (AES-256-GCM Encrypt com AAD do Snapshot)
[AVANT_DR_SNAPSHOT_V1 (Manifesto + Database + Auth + Storage)]
```

* **`PER_SNAPSHOT_DEK = PASS`:** Cada snapshot possui uma DEK independente. O comprometimento de uma DEK não compromete snapshots anteriores ou posteriores.
* **`KEY_ROTATION_MODEL = PASS`:** A rotação da KEK gera uma nova KEK mestre sem exigir re-criptografia dos snapshots históricos armazenados.
* **`OLD_KEY_RECOVERY_MODEL = PASS`:** As KEKs históricas são mantidas no cofre offline de Disaster Recovery do operador até o término do ciclo de retenção dos snapshots correspondentes.
* **`KEY_LOSS_RUNBOOK = PASS`:** A KEK é mantida sob contingência em cofre seguro com acesso de emergência documentado.

---

## 4. Semântica de Purge, Crypto-Shredding e LGPD

* **`OBJECT_DELETE_PHYSICAL_ERASURE_GUARANTEE = NO`:** Provedores de object storage em nuvem (S3/R2) executam exclusão lógica de ponteiros e desreferenciação em sistemas de arquivos distribuídos; não há garantia de sobrescrita física imediata nos blocos magnéticos/flash.
* **`CRYPTO_SHREDDING_CAPABILITY = NOT_PROVEN`:** Embora cada snapshot possua uma DEK única de 256 bits, enquanto sua wrapped DEK permanecer arquivada junto ao objeto no envelope e a KEK mestre estiver disponível, não se alega crypto-shredding individual comprovado.
* **`CLIENT_SIDE_ENCRYPTION = LGPD_SECURITY_CONTROL`:** A cifragem client-side robusta em repouso e em trânsito antes do upload atua como o controle técnico primário de segurança para dados pessoais nos termos da LGPD.

---

## 5. Especificação de Infraestrutura Cloudflare R2 & Princípio do Menor Privilégio

### 5.1 Configuração Canônica do Bucket

* `BUCKET_NAME = avant-disaster-recovery-vault`
* `R2_LOCATION_MODE = Automatic`
* `R2_JURISDICTION = default`
* `R2_JURISDICTION_GUARANTEE = NONE` (Sem declaração de residência soberana em São Paulo/América do Sul, operando sob a rede Anycast Global da Cloudflare).
* `STORAGE_CLASS = Standard`
* `BUCKET_PRIVATE = YES`
* `PUBLIC_ACCESS = DISABLED`
* `R2_DEV_PUBLIC_ACCESS = DISABLED`
* `CUSTOM_PUBLIC_DOMAIN = NONE`

### 5.2 Regras Nativas de Bucket Lock (WORM) & Contrato de Prefixos GFS

O Cloudflare R2 suporta Bucket Lock nativo baseado em regras de retenção imutáveis aplicadas por prefixo de objeto:

```text
avant-disaster-recovery-vault/
├── daily/    --> Regra R2 Bucket Lock: retenção mínima de 14 dias
├── weekly/   --> Regra R2 Bucket Lock: retenção mínima de 35 dias
└── monthly/  --> Regra R2 Bucket Lock: retenção mínima de 370 dias
```

* **`R2_BUCKET_LOCK_CONFIGURED = PASS`**
* **`R2_BUCKET_LOCK_POLICY_MATCHES_GFS = PASS`**
* **Gestão de Lock:** As regras de Bucket Lock são configuradas estritamente com credenciais administrativas humanas fora do CI.

### 5.3 Token de API do CI Runner

* **Tipo de Token:** Cloudflare R2 Account API Token.
* **Permissão:** `Object Read & Write` estritamente restrita ao bucket `avant-disaster-recovery-vault`.
* `CI_TOKEN_BUCKET_SCOPED = PASS`
* `CI_TOKEN_CAN_EDIT_BUCKET_CONFIGURATION = NO`
* `CI_TOKEN_CAN_CREATE_DELETE_BUCKETS = NO`
* `BACKUP_JOB_LEAST_PRIVILEGE = PASS`

> [!NOTE]
> **7F.3B.0C.2 — evidência canônica:** esta secção é **especificação** do cofre e do token. Não prova I/O R2 em runtime. `REAL_R2_CLIENT_IMPLEMENTATION_FOUND = NO`. `CANONICAL_R2_UPLOAD = SIMULATED`. `CANONICAL_R2_READBACK = SIMULATED`. A existência administrativa do bucket **não** é negada.

---

## 6. Localização, Custos e Separação de Domínio de Falha

* **Separação de Domínio:**
  * **Supabase Production (`ozgouenqrofnvgrlgfwd`):** Hospedado em AWS us-east-1.
  * **Cloudflare R2:** Infraestrutura e plano de controle totalmente desacoplados da AWS.
* **Cloudflare R2 Pricing:**
  * Armazenamento: \$0.015 / GB-mês (primeiros 10 GB/mês são gratuitos).
  * Operações Classe A (Put/List): \$4.50 / milhão (primeiras 1.000.000/mês são gratuitas).
  * Operações Classe B (Get): \$0.36 / milhão (primeiras 10.000.000/mês são gratuitas).
  * Tráfego de Saída (Egress): **\$0.00 (Totalmente Gratuito)**.
* **`EXPECTED_USAGE_COST`**: **\$0.00 / mês** (Volume do AVANT < 1 GB).

---

## 7. Decisão sobre Segunda Cópia

* **`SECOND_COPY_DECISION`**: **`SECOND_COPY_DEFERRED_UNTIL_PRIMARY_R2_PROVEN = YES`**
* **Justificativa:** Priorizar a estabilização e validação ponta a ponta do cofre primário Cloudflare R2 com drills periódicos automatizados antes de introduzir a sobrecarga operacional e o risco de superfície de credenciais de um segundo provedor (AWS S3).

---

## 8. Anti-Rollback, Monotonicidade e Frescura

* **`STALE_VALID_SNAPSHOT_REPLAY_DETECTION = PASS`:** O sistema valida monotonicamente que cada novo snapshot possui `sequence_id > last_sequence_id` e `created_at > last_created_at`. A reapresentação de backups antigos válidos é rejeitada.
* **Freshness Update Protocol (especificação):** O indicador `LAST_SUCCESSFUL_BACKUP_AGE` deve ser atualizado **exclusivamente** após o ciclo completo:
  $$\text{Export} \longrightarrow \text{Encrypt} \longrightarrow \text{Upload} \longrightarrow \text{Remote Readback} \longrightarrow \text{SHA-256 Match} \longrightarrow \text{Auth Verify}$$
  Se qualquer etapa falhar, o status de frescura não é atualizado e o gate de 26h acusa falha.
* **7F.3B.0C.2:** este protocolo **não** está comprovado ponta a ponta com cliente R2 real. `R2_UPLOAD_REAL = NOT_PROVEN`. `R2_REMOTE_READBACK_REAL = NOT_PROVEN`. `R2_DOWNLOAD_REAL = NOT_PROVEN`. `FIRST_PRODUCTION_OFFSITE_BACKUP = NOT_PROVEN`.

---

## 9. Procedimento Operacional de Rollback

Em virtude das regras de Bucket Lock que impedem a deleção e o esvaziamento imediato do bucket, o procedimento operacional de rollback é:

1. **Revogação Imediata:** Revogar o token de API R2 do CI no painel Cloudflare.
2. **Desativação de Workflow:** Desabilitar execuções futuras no GitHub Actions.
3. **Bloqueio de Uploads:** Impedir novas tentativas de escrita.
4. **Remoção Administrativa Posterior:** A eventual deleção do bucket é executada como ação administrativa manual do operador após o término dos períodos de retenção vigentes.

---

## 10. Correção canônica de evidência (7F.3B.0C.2)

`SUPERSEDED_BY = 7F.3B.0C.1` para qualquer relato 7F.3A de upload/readback/download R2 **PASS** como prova operacional.

| Campo | CURRENT_RECONCILED_STATUS |
| :--- | :--- |
| `REAL_R2_CLIENT_IMPLEMENTATION_FOUND` | **NO** |
| `CANONICAL_R2_UPLOAD` | **SIMULATED** |
| `CANONICAL_R2_READBACK` | **SIMULATED** |
| `FIRST_PRODUCTION_OFFSITE_BACKUP` | **NOT_PROVEN** |
| `OFFSITE_BACKUP_RESTORE_VERIFICATION` | **NOT_PROVEN** |
| `STORAGE_METADATA_CAPTURE` | **PASS** |
| `STORAGE_OBJECT_BYTES_CAPTURE` | **NOT_PROVEN** |
| `OFFSITE_BACKUP_OPERATIONALIZATION` | **NOT_PROVEN** |
| `RPO_PROVEN` | **NO** |
| `PRODUCTION_RTO` | **NOT_PROVEN** |
| `BACKUP_AND_RESTORE_SECURITY_CLOSURE` | **NOT_CLOSED** |
| `AUTH_BACKUP_RECOVERY` | **PASS** (lote 7F.2A; não rebaixado) |

---

## 11. Integração do runner operacional (7F.3B.0D)

Arquitetura: `workflow_dispatch` → `scripts/dr-backup-runner.ts` → allowlists (`lib/disasterRecovery`) → `BackupEngine` canônico → `AVANT_DR_SNAPSHOT_V1`.

* `CANONICAL_CRYPTO_REPLACEMENT_ALLOWED = NO`
* `THIN_RUNNER = PASS` (somente `--synthetic` neste lote)
* `SYNTHETIC_USES_CANONICAL_BACKUP_ENGINE = YES`
* `CRYPTO_IMPLEMENTATION_DUPLICATION = NO`
* `PRODUCTION_SQL_ENDPOINT_ALLOWED_BY_NEW_RUNNER = READ_ONLY_ONLY` (`/database/query/read-only`; o path histórico `/database/query` **não** é autorizado pelo runner novo)
* `BUCKET_ALLOWLIST_SINGLE_SOURCE_OF_TRUTH = PASS` (`CANONICAL_ALLOWED_R2_BUCKETS` em `scripts/backup-automation.ts`)
* `REAL_R2_CLIENT_IMPLEMENTATION_FOUND = NO`
* `REAL_R2_UPLOAD_IMPLEMENTED_IN_THIS_LOT = NO`
* `STORAGE_OBJECT_BYTES_CAPTURE = NOT_PROVEN`
* `DAILY_CRON_ENABLED = NO` (workflow sem `schedule`)
* `GITHUB_SECRETS_CONFIGURED = NO`

---

## 12. Cliente R2 S3-compatible (7F.3B.0E)

Camada `lib/disasterRecovery/r2Client.ts`: `PutObject` / `HeadObject` / `GetObject` via `@aws-sdk/client-s3`, sender injetável.

* `R2_CLIENT_LIBRARY = @aws-sdk/client-s3`
* `R2_ENDPOINT_ALLOWLIST = PASS` (`https://<32-hex>.r2.cloudflarestorage.com`, `region = auto`)
* `R2_ALLOWED_OPERATIONS = PUT,HEAD,GET`
* `R2_DELETE_CAPABILITY_IN_RUNTIME = NO`
* `R2_BUCKET_ADMIN_CAPABILITY_IN_RUNTIME = NO`
* `OBJECT_KEY_CANONICAL_SOURCE = PASS` (`BackupEngine.resolveObjectKey`)
* `ETAG_USED_AS_CRYPTOGRAPHIC_HASH = NO`
* `HEAD_ONLY_IS_FULL_INTEGRITY_PROOF = NO`
* `REMOTE_READBACK_FULL_BODY_HASH_VERIFICATION = PASS` (SHA-256 dos bytes GET)
* `REAL_R2_CLIENT_IMPLEMENTATION_FOUND = YES`
* `R2_REAL_CONNECTIONS = 0` neste lote (somente fake/mock nos testes)
* `--synthetic` não envia ao R2; `--production` continua `PRODUCTION_NOT_AUTHORIZED`
* `R2_DEPENDENCY_LOCKFILE_RECONCILED = PASS` (`package-lock.json` inclui `@aws-sdk/client-s3@3.1121.0` e transitivas `@aws-sdk/*` / `@smithy/*`)
* `R2_REQUIRED_SCENARIOS = 18`
* `R2_REQUIRED_SCENARIOS_COVERED = 18`
* `R2_REQUIRED_SCENARIOS_MISSING = 0`

---

## 13. Captura de bytes Storage `questao-figures` (7F.3B.0F)

Contrato existente (`supabase/migrations/20260720120000_questao_figures_bucket.sql`):

* `QUESTAO_FIGURES_BUCKET_VISIBILITY = PUBLIC` (`storage.buckets.public = true`)
* `STORAGE_EXISTING_READ_POLICY = questao_figures_public_read` (SELECT em `storage.objects` para `bucket_id = questao-figures`)
* `CURRENT_STORAGE_AUTH_MODEL = PUBLIC_READ_SERVICE_ROLE_WRITE`
* Escrita: `service_role` (INSERT/UPDATE/DELETE). Leitura pública não exige `service_role`.

### Matriz de autoridade (bytes)

| STORAGE_OPERATION | REQUIRED_ENDPOINT | AUTHORITY_NEEDED | CURRENTLY_AVAILABLE | LEAST_PRIVILEGE_ASSESSMENT |
| :--- | :--- | :--- | :--- | :--- |
| Metadata `storage.objects` | Management SQL read-only | PAT Management (`SUPABASE_ACCESS_TOKEN`) | Drill histórico 7F.3A (metadata only) | PAT **não** implica acesso Storage HTTP |
| Download de bytes | `GET https://{ref}.supabase.co/storage/v1/object/public/questao-figures/{name}` | Nenhuma (bucket público) | URL canônica em `buildPublicQuestaoFigureUrl` / `buildCanonicalPublicStorageUrl` | **PASS** — não usar service_role para GET público |
| Upload/update/delete | Storage API autenticada | `service_role` | Políticas de escrita existentes | **Fora do runtime de backup** |

`STORAGE_LEAST_PRIVILEGE_AUTHORITY = PASS` para o desenho de leitura de bytes públicos. `SUPABASE_ACCESS_TOKEN` (Management API) **não** é credencial de `/storage/v1`.

* `STORAGE_ADAPTER_IMPLEMENTED = YES` (`lib/disasterRecovery/storageReader.ts`)
* `STORAGE_SYNTHETIC_BYTES_RECOVERY = PASS` (fixtures/fakes; SHA-256 recompute no restore)
* `STORAGE_PRODUCTION_BYTES_CAPTURE = NOT_PROVEN` (resultado sintético **não** promove captura de Production)
* `STORAGE_WRITE_CAPABILITY_IN_BACKUP_RUNTIME = NO`
* `STORAGE_BYTE_HASH_SOURCE = DOWNLOADED_BYTES`
* `STORAGE_BYTES_INCLUDED_BEFORE_SNAPSHOT_ENCRYPTION = YES`
* `CRYPTO_IMPLEMENTATION_DUPLICATION = NO` (AES/KEK/DEK permanece em `BackupEngine`)
* `PLAINTEXT_STORAGE_ARCHIVE_ON_DISK = 0`
* `STORAGE_LEAST_PRIVILEGE_AUTHORITY = PASS` (GET público; PAT Management **não** autoriza `/storage/v1`)
* `--synthetic` continua o único modo do runner; Production = `PRODUCTION_NOT_AUTHORIZED`
