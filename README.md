# FlowMedix

Plataforma de estudo para Técnicos de Enfermagem que transforma textos complexos em Fluxogramas Interativos.

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

