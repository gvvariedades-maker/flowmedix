# AVANT

Plataforma de **estudo reverso** para **Técnicos de Enfermagem**: questões de concursos (EBSERH, prefeituras, bancas diversas) viram uma jornada guiada — enunciado → alternativas → **NeuroSlides** (4 telas didáticas) → registro de desempenho.

Documentação canônica para devs e agentes: [`CLAUDE.md`](CLAUDE.md).

## Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | **Next.js 16** App Router, **React 19** |
| Linguagem | TypeScript (strict), alias `@/*` → raiz |
| Estilo | **Tailwind CSS 4**, Radix/shadcn, Framer Motion |
| Dados / auth | **Supabase** (PostgreSQL, RLS, SSR cookies) |
| Pagamentos | Stripe |
| Validação | **Zod 4** |
| E-mail | Resend + React Email |
| IA (onde usado) | Google Gemini |
| Visual engine (legado/auxiliar) | `@xyflow/react` |
| Testes | Jest (`__tests__/`), Playwright (`e2e/`) |

Auth na borda: [`proxy.ts`](proxy.ts) (Next 16; substitui `middleware.ts`).

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Preencha as variáveis (mínimo):
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `GOOGLE_GEMINI_API_KEY`: Chave da API do Google Gemini

Valide o ambiente: `npm run validate:env` (roda também no `npm run build`).

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

## Comandos úteis

```bash
npm run dev           # servidor local
npm run validate:env  # valida .env
npm test              # Jest
npm run build         # validate:env + next build
npm run test:e2e      # Playwright
```

## Estrutura do Projeto

```
app/
  (dashboard)/          # Área logada: estudar, cadernos, analytics, material…
  (admin)/              # Admin: laboratório, concursos, convites, landings…
  api/                  # Route Handlers
  login, register, lp/, blog/, convite/…
components/
  slides/               # NeuroSlides (core/, variants/)
  lesson/               # AvantLessonPlayer
  dashboard/, admin/, ui/, landing/, …
lib/                    # cache, validations, supabase, stripe…
types/
docs/
examples/               # JSON golden (Laboratório)
__tests__/              # Jest
e2e/                    # Playwright
supabase/               # schema.sql, migrations/
proxy.ts                # Auth na borda (Next 16)
```

### Rotas-chave

| URL | Propósito |
|-----|-----------|
| `/estudar`, `/estudar/[slug]` | Vitrine e player de questão |
| `/admin/laboratorio` | Editor/import JSON de questões |
| `/api/validate-question` | Validação Zod (admin) |
| `/api/pagamentos/webhook` | Stripe |
| `/convite/[token]` | Resgate de convite |

## Checklists Operacionais

- Migrations (Supabase): `docs/MIGRATIONS_PR_CHECKLIST.md`
- Deploy geral: `DEPLOY_CHECKLIST.md`
- Onboarding completo: `CLAUDE.md`
