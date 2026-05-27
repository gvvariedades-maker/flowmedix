# AVANT

Plataforma de estudo reverso exclusiva para Técnicos de Enfermagem. Prepare-se para concursos EBSERH, prefeituras e mais com fluxogramas interativos e simuladores de decisão.

## Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Database/Auth**: Supabase
- **Visual Engine**: React Flow (@xyflow/react)
- **AI Integration**: Google Gemini API
- **Validation**: Zod

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Preencha as variáveis:
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `GOOGLE_GEMINI_API_KEY`: Chave da API do Google Gemini

### Stripe (checkout de concursos)

No [Stripe Dashboard (modo teste)](https://dashboard.stripe.com/test/apikeys), copie a secret key (`sk_test_...`) para `STRIPE_SECRET_KEY`. Para o webhook local, use o [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/pagamentos/webhook
```

O comando exibe um signing secret (`whsec_...`) — use em `STRIPE_WEBHOOK_SECRET`. Em produção, cadastre o endpoint `/api/pagamentos/webhook` no painel Stripe e use o secret do endpoint.

### Cron de matrículas (Vercel)

Com checkout Stripe ativo, defina `CRON_SECRET` no projeto Vercel. O job em `vercel.json` chama `GET /api/admin/manutencao/expirar-matriculas` diariamente; a Vercel envia `Authorization: Bearer <CRON_SECRET>`. A mesma rota aceita `POST` manual com sessão admin ou o mesmo bearer.

3. Execute o schema SQL no Supabase:
```bash
# Execute o arquivo supabase/schema.sql no SQL Editor do Supabase
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
/app
  /(auth)          # Rotas de autenticação
  /(dashboard)     # Dashboard com sidebar
  /study           # Tela de estudo com React Flow
/components
  /flow            # Componentes customizados do React Flow
  /ui              # Componentes shadcn/ui
/lib               # Utilitários e clientes (Supabase, etc)
/types             # Definições TypeScript globais
/supabase          # Schema SQL e migrações
```

## Checklists Operacionais

- Migrations (Supabase): `docs/MIGRATIONS_PR_CHECKLIST.md`
- Deploy geral: `DEPLOY_CHECKLIST.md`

