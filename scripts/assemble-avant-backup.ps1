# Monta pasta de backup completa para Google Drive (NÃO commitar no Git).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/assemble-avant-backup.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $Root "package.json"))) {
    $Root = (Get-Location).Path
}

$Date = Get-Date -Format "yyyy-MM-dd"
$BackupName = "avant-snapshot-$Date"
$Out = Join-Path (Join-Path $Root "backups") $BackupName

Write-Host "AVANT backup -> $Out"

New-Item -ItemType Directory -Force -Path $Out | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Out "env") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Out "supabase-schema") | Out-Null

# --- Env (segredos — pasta privada no Drive) ---
$envFiles = @(
    ".env.local",
    ".env.staging.local",
    ".env.vercel.prod",
    ".env.vercel.preview"
)
foreach ($f in $envFiles) {
    $src = Join-Path $Root $f
    if (Test-Path $src) {
        Copy-Item $src (Join-Path (Join-Path $Out "env") $f) -Force
        Write-Host "  env: $f"
    }
}
Copy-Item (Join-Path $Root ".env.example") (Join-Path (Join-Path $Out "env") ".env.example") -Force

# --- Git (tag do snapshot de código) ---
Push-Location $Root
$gitCommit = git rev-parse HEAD 2>$null
$gitTag = git tag --points-at HEAD 2>$null | Select-Object -First 1
$gitBranch = git branch --show-current 2>$null
Pop-Location

@"
AVANT backup package
Data: $Date
Git commit: $gitCommit
Git branch: $gitBranch
Git tag (se no HEAD): $gitTag
Repo: https://github.com/gvvariedades-maker/flowmedix.git
Tag restauração: avant/cyber-clinical-v1

Restaurar código:
  git clone https://github.com/gvvariedades-maker/flowmedix.git
  git checkout avant/cyber-clinical-v1
"@ | Set-Content (Join-Path $Out "GIT-INFO.txt") -Encoding UTF8

# --- Design archive (logo) ---
$archiveSrc = Join-Path (Join-Path (Join-Path $Root "docs") "design-archive") "cyber-clinical-v1"
if (Test-Path $archiveSrc) {
    Copy-Item $archiveSrc (Join-Path $Out "design-archive-cyber-clinical-v1") -Recurse -Force
    Write-Host "  design-archive copiado"
}

# --- Schema Supabase (versionado no repo) ---
Copy-Item (Join-Path (Join-Path $Root "supabase") "migrations") (Join-Path (Join-Path $Out "supabase-schema") "migrations") -Recurse -Force
foreach ($sql in @("schema.sql", "remote_schema_dump.sql", "INVENTARIO_PUBLIC.md")) {
    $p = Join-Path (Join-Path $Root "supabase") $sql
    if (Test-Path $p) { Copy-Item $p (Join-Path (Join-Path $Out "supabase-schema") $sql) -Force }
}

# --- Dados Supabase (JSON via service role) ---
$dataDir = Join-Path $Out "supabase-data"
Write-Host "  exportando dados Supabase..."
Push-Location $Root
npx tsx scripts/export-supabase-backup.ts "--out=$dataDir"
if ($LASTEXITCODE -ne 0) { throw "export-supabase-backup falhou" }
Pop-Location

# --- LEIA-ME ---
@"
========================================
  BACKUP AVANT — $Date
========================================

CONFIDENCIAL: esta pasta contém senhas e chaves API.
Salve no Google Drive em pasta PRIVADA (só você).

O QUE TEM AQUI
--------------
env/              Variáveis (.env.local, Vercel, etc.)
supabase-data/    Dados do banco (JSON por tabela)
supabase-schema/  Migrations e schema SQL
design-archive-*  Logo e marca Cyber Clinical
GIT-INFO.txt      Commit e tag para restaurar o código

COMO RESTAURAR
--------------
1. Código: git checkout avant/cyber-clinical-v1 (ver GIT-INFO.txt)
2. Env: copie env/.env.local para a raiz do projeto
3. Banco: importe supabase-data/*.json ou use backup do Dashboard Supabase
   (auth.users não está no JSON — use Dashboard → Database → Backups)

ATUALIZAR ESTE BACKUP
---------------------
powershell -ExecutionPolicy Bypass -File scripts/assemble-avant-backup.ps1

"@ | Set-Content (Join-Path $Out "LEIA-ME.txt") -Encoding UTF8

Write-Host ""
Write-Host "Pronto. Envie esta pasta para o Google Drive:"
Write-Host "  $Out"
Write-Host ""
Write-Host "ATENCAO: nao commite 'backups/' no GitHub (contem segredos)."
