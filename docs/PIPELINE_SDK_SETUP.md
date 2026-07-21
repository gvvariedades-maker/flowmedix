# Cursor SDK — setup rápido (AVANT)

Orquestrador: [`PIPELINE_ORCHESTRATOR.md`](PIPELINE_ORCHESTRATOR.md)

## 1. Instalar dependências

```bash
cd D:\AVANT
npm install
```

O pacote `@cursor/sdk` está em `devDependencies` — instala com o projeto.

## 2. API key

1. [cursor.com/dashboard](https://cursor.com/dashboard) → **Integrations** ou **API Keys**
2. Criar **User API Key** (`cursor_...`)
3. Copiar [`env.pipeline-sdk.example`](env.pipeline-sdk.example) → **`.env.local`** na raiz:

```env
CURSOR_API_KEY=cursor_SUA_CHAVE
CURSOR_ORCHESTRATOR_MODEL=composer-2.5
```

`.env.local` é carregado automaticamente pelos scripts `pipeline:*` (via `@next/env`).

**PowerShell (só esta sessão):**

```powershell
$env:CURSOR_API_KEY = "cursor_..."
```

## 3. Verificar

```bash
npm run pipeline:sdk-check
```

Deve mostrar `✅ @cursor/sdk` e `✅ CURSOR_API_KEY`.

## 4. Usar

```bash
# Sem IA — ver próxima unidade
npm run pipeline:next-unit -- --subtopico="Imunização" --print-prompt

# Dry-run — prompt worker
npm run pipeline:orchestrate -- --subtopico="Imunização" --dry-run

# SDK — 1 unidade (consome plano Cursor)
npm run pipeline:orchestrate -- --subtopico="Imunização" --sdk --max-units=1
```

**Windows (atalho):**

```powershell
.\scripts\pipeline-sdk-run.ps1 -Subtopico "Imunização" -Sdk
```

## Billing

Runs `--sdk` aparecem no dashboard Cursor (tag SDK), mesmo pool do Agent no IDE.
