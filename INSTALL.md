# Guia de Instalação - FlowMedix

## Passo a Passo para Inicializar o Projeto

### 1. Instalar Dependências

```bash
cd flowmedix
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e preencha com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
GOOGLE_GEMINI_API_KEY=sua_chave_gemini_aqui
```

### 3. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. No SQL Editor do Supabase, execute o conteúdo do arquivo `supabase/schema.sql`
3. Isso criará todas as tabelas necessárias:
   - `profiles` - Perfis de usuários
   - `modules` - Módulos de estudo
   - `flowcharts` - Fluxogramas interativos
   - `user_progress` - Progresso do usuário

### 4. Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

### 5. Testar a Aplicação

1. Acesse `/dashboard` para ver a lista de módulos
2. Clique em "Iniciar Estudo" em qualquer módulo
3. Você será redirecionado para `/study/[flowchartId]` onde verá o React Flow com dados mock

## Estrutura de Arquivos Criada

```
flowmedix/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Página de login
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Layout com sidebar
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard principal
│   ├── study/
│   │   └── [flowchartId]/
│   │       └── page.tsx          # Tela de estudo com React Flow
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Página inicial (redireciona)
├── components/
│   ├── flow/
│   │   ├── CustomNode.tsx        # Componente de nó customizado
│   │   └── StudyFlow.tsx         # Componente principal do React Flow
│   └── ui/
│       ├── button.tsx            # Componente Button (shadcn)
│       ├── card.tsx              # Componente Card (shadcn)
│       └── sidebar.tsx           # Sidebar de navegação
├── lib/
│   ├── supabase/
│   │   └── client.ts             # Cliente Supabase
│   └── utils.ts                  # Utilitários (cn function)
├── types/
│   ├── flow.ts                   # Tipos do React Flow
│   └── database.ts               # Tipos do banco de dados
├── supabase/
│   └── schema.sql                # Schema SQL do banco
└── [arquivos de configuração]
```

## Próximos Passos

1. **Autenticação**: Implementar autenticação completa com Supabase Auth
2. **Integração com Banco**: Conectar as páginas ao Supabase para buscar dados reais
3. **Google Gemini API**: Implementar a geração de fluxogramas via IA
4. **Editor de Fluxogramas**: Permitir que usuários editem fluxogramas
5. **Sistema de Progresso**: Implementar rastreamento de progresso do usuário

## Dependências Principais

- **Next.js 14+**: Framework React com App Router
- **@xyflow/react**: Biblioteca para criar fluxogramas interativos
- **@supabase/supabase-js**: Cliente JavaScript do Supabase
- **Tailwind CSS**: Framework de estilos utilitários
- **shadcn/ui**: Componentes UI reutilizáveis
- **Zod**: Validação de schemas TypeScript
- **Lucide React**: Ícones modernos

## Suporte

Para dúvidas ou problemas, consulte a documentação:
- [Next.js](https://nextjs.org/docs)
- [React Flow](https://reactflow.dev/)
- [Supabase](https://supabase.com/docs)

