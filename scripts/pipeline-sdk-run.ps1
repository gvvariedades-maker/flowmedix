# Atalho Windows — pipeline orquestrador + SDK
# Uso:
#   .\scripts\pipeline-sdk-run.ps1 -Subtopico "Imunização" -DryRun
#   .\scripts\pipeline-sdk-run.ps1 -Subtopico "Imunização" -Sdk -Mode handcraft -Verify

param(
  [Parameter(Mandatory = $true)]
  [string]$Subtopico,

  [ValidateSet('full', 'handcraft', 'l3_bespoke', 'ship')]
  [string]$Mode = 'full',

  [int]$MaxUnits = 1,

  [switch]$DryRun,
  [switch]$Sdk,
  [switch]$Verify,
  [switch]$AutoApply,
  [switch]$PrintPrompt
)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

if ($PrintPrompt) {
  npm run pipeline:next-unit -- --subtopico="$Subtopico" --mode=$Mode --print-prompt
  exit $LASTEXITCODE
}

$args = @('run', 'pipeline:orchestrate', '--', "--subtopico=$Subtopico", "--mode=$Mode", "--max-units=$MaxUnits")

if ($DryRun) { $args += '--dry-run' }
elseif ($Sdk) { $args += '--sdk' }
else { $args += '--dry-run' }

if ($Verify) { $args += '--verify' }
if ($AutoApply) { $args += '--auto-apply' }

npm @args
exit $LASTEXITCODE
