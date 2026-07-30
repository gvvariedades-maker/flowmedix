# Relatório Completo do Projeto AVANT

> **Objetivo deste documento:** Fornecer contexto completo para que outra LLM (ou desenvolvedor) compreenda a arquitetura, tecnologias, funcionalidades e convenções do projeto AVANT sem necessidade de explorar o código.

---

## 1. Visão Geral

**AVANT** é uma plataforma de **estudo reverso** exclusiva para **Técnicos de Enfermagem**. O método de estudo reverso consiste em: o aluno responde uma questão de concurso primeiro; em seguida, vê o gabarito e acessa slides de estudo neuro-cognitivos que explicam o conteúdo da questão. O foco é preparação para concursos EBSERH, prefeituras e demais órgãos.

**Público-alvo:** Técnicos de Enfermagem em preparação para concursos públicos.

---

## 2. Linguagem e Stack Tecnológica

### 2.1 Linguagem Principal
- **TypeScript** (strict mode)
- **Target:** ES2020
- **JSX:** react-jsx

### 2.2 Framework e Runtime
- **Next.js 16.1.6** (App Router, React Server Components)
- **React 19.2.4**
- **Node.js** (ambiente de execução)

### 2.3 Estilização
- **Tailwind CSS 4.2.1**
- **tailwindcss-animate**
- **class-variance-authority (cva)**
- **clsx** e **tailwind-merge** para composição de classes
- **Framer Motion 12** para animações

### 2.4 UI e Componentes
- **Radix UI** (Dialog, Dropdown, Label, Slot, Tabs)
- **Lucide React** para ícones
- **shadcn/ui** (componentes base: Button, Card, etc.)
- **@xyflow/react (React Flow)** para fluxogramas interativos

### 2.5 Backend e Dados
- **Supabase** (PostgreSQL, Auth, RLS)
  - `@supabase/supabase-js`
  - `@supabase/ssr` (Server-Side Rendering)
- **Zod** para validação de schemas

### 2.6 IA e Integrações
- **Google Generative AI (@google/generative-ai)** – Gemini API (opcional)

### 2.7 Ferramentas de Desenvolvimento
- **Jest** – testes unitários
- **Playwright** – testes E2E
- **ESLint** (eslint-config-next)
- **tsx** – execução de scripts TypeScript
- **PostCSS** e **Autoprefixer**

---

## 3. Estrutura de Diretórios

```
/app                    # App Router (Next.js)
  /(auth)               # Rotas de autenticação (login, register)
  /(dashboard)          # Dashboard com sidebar
    /estudar            # Vitrine de módulos/questões
    /estudar/[slug]     # Página de questão individual (estudo reverso)
    /analytics          # Dashboard de analytics do usuário
  /(admin)              # Área administrativa (restrita)
    /admin              # Painel admin (cidades, módulos)
    /admin/laboratorio  # Laboratório de criação/edição de questões
  /api                  # API Routes
    /validate-question  # Validação de questões (Zod)
    /analytics/*        # APIs de analytics
    /cache/revalidate   # Revalidação de cache
    /admin/*            # APIs admin
    /health             # Health check
    /metrics            # Métricas de performance
    /fluxogramas        # Fluxogramas
    /check-user         # Verificação de usuário

/components
  /admin                # Componentes do painel admin
  /analytics            # StatsCards, ProgressChart, Heatmap, etc.
  /flow                # Componentes React Flow
  /lesson               # AvantLessonPlayer (player principal)
  /slides               # Sistema de slides neuro-cognitivos
    /core               # NeuroSlide, themeGenerator
    /variants           # ConceptMap, LogicFlow, GoldenRule, DangerZone, etc.
  /ui                   # Componentes shadcn/ui
  /vitrine              # VitrineClient (lista de módulos)

/lib                    # Utilitários e clientes
  /analytics.ts         # Análise de dados
  /cache.ts             # Sistema de cache (unstable_cache)
  /recommendations.ts   # Algoritmo de recomendação
  /spaced-repetition.ts # Revisão espaçada (SM-2)
  /validations.ts       # Schemas Zod
  /supabase/            # Clientes Supabase (server, client)
  /metrics.ts           # Métricas
  /logger.ts            # Logger
  /env.ts               # Validação de variáveis de ambiente

/types                  # Definições TypeScript
  lesson.ts             # LessonData, ReverseStudySlide, etc.
  flow.ts
  database.ts

/supabase
  schema.sql            # Schema base
  migrations/           # Migrações SQL

/examples                # JSONs de exemplo de questões
/docs                   # Documentação interna
```

---

## 4. Banco de Dados (Supabase/PostgreSQL)

### 4.1 Tabelas Principais em Uso

#### `cidades`
- **Propósito:** Cidades onde concursos são realizados (verticalização por localidade)
- **Colunas:** id (uuid), nome, estado, slug, created_at
- **RLS:** Desabilitado
- **Relacionamento:** `modulos_estudo.cidade_id` → `cidades.id`

#### `modulos_estudo`
- **Propósito:** Módulos/aulas de estudo (questões de concurso)
- **Colunas:** id, cidade_id, modulo_nome, titulo_aula, modulo_slug (unique), banca, assunto, subtopico, conteudo_json (jsonb), content_hash, created_at
- **RLS:** Desabilitado
- **conteudo_json:** Contém o JSON completo da questão (meta, question_data, reverse_study_slides)

#### `historico_questoes`
- **Propósito:** Histórico de tentativas de questões por aluno
- **Colunas:** id, user_id (FK auth.users), modulo_slug, acertou (boolean), banca, topico, subtopico, created_at
- **RLS:** Habilitado (usuário vê apenas seus registros)

### 4.2 Tabelas do Schema Base (schema.sql)
- `profiles` – Dados estendidos do usuário
- `modules` – Categorias de estudo
- `flowcharts` – Diagramas interativos
- `user_progress` – Progresso por flowchart
- `study_plans`, `study_plan_items` – Planos de estudo
- `exams`, `exam_modules`, `exam_purchases` – Exames e verticalizações

---

## 5. Funcionalidades Principais

### 5.1 Fluxo do Usuário (Estudo Reverso)
1. **Login/Registro** – Autenticação via Supabase Auth
2. **Vitrine (`/estudar`)** – Lista de módulos/questões ordenados por prioridade (áreas fracas primeiro)
3. **Questão (`/estudar/[slug]`)** – Player em 3 etapas:
   - **Pergunta:** Exibe enunciado e alternativas
   - **Gabarito:** Mostra resposta correta e feedback
   - **Estudo:** Slides neuro-cognitivos (reverse_study_slides)
4. **Registro de tentativa** – Cada resposta é salva em `historico_questoes`

### 5.2 Sistema de Slides Neuro-Cognitivos
- **NeuroSlide:** Componente principal que renderiza slides conforme `type`
- **Tipos de slide:** `concept_map`, `logic_flow`, `golden_rule`, `danger_zone`, `syllable_scanner`, `versus_arena`
- **Templates visuais:** t01–t15 (temas: indigo, emerald, rose, violet, cyan, etc.)
- **Layout variants:** Por tipo (ex.: concept_map → morphological, grid, molecular, bridge)
- **Design:** Glassmorphism, neon glow, animações Framer Motion

### 5.3 Analytics e Recomendações
- **Dashboard `/analytics`:** Estatísticas, gráfico de progresso, heatmap, padrões de erro, recomendações
- **Algoritmo de recomendação:** Prioriza áreas fracas (< 70% acerto), questões não tentadas
- **Revisão espaçada (SM-2/FSRS):** descontinuada antes do lançamento — não é feature ativa. Ver [`docs/DECISAO_DESCONTINUACAO_REVISAO_INTELIGENTE.md`](docs/DECISAO_DESCONTINUACAO_REVISAO_INTELIGENTE.md)

### 5.4 Sistema de Cache
- **Next.js `unstable_cache`** com estratégias:
  - **STATIC (15 min):** Fluxogramas
  - **SEMI_STATIC (5 min):** Módulos, questões
  - **DYNAMIC (1 min):** Agregações
  - **USER (2 min):** Histórico por usuário
- **Revalidação:** API `/api/cache/revalidate` e webhooks Supabase

### 5.5 Área Admin
- **Acesso:** Restrito por `ADMIN_EMAIL` (constante em `lib/constants.ts`)
- **Funcionalidades:** CRUD de cidades, listagem de módulos, laboratório de questões
- **Laboratório:** Editor JSON com validação Zod, seletor de templates, preview, export/import

### 5.6 Validação de Questões
- **API:** `POST /api/validate-question`
- **Schema Zod:** `QuestaoCompletaSchema` em `lib/validations.ts`
- **Campos validados:** meta (banca, topico, subtopico), question_data (instruction, options), reverse_study_slides
- **Sanitização HTML:** Tags permitidas em text_fragment
- **Ícones:** Apenas Lucide válidos

---

## 6. Formato JSON das Questões

### 6.1 Estrutura Esperada

```json
{
  "meta": {
    "ano": "2024",
    "banca": "EBSERH",
    "orgao": "Hospital Universitário",
    "prova": "Técnico de Enfermagem",
    "topico": "Fundamentos de Enfermagem",
    "subtopico": "SAE"
  },
  "question_data": {
    "instruction": "Texto da instrução",
    "text_fragment": "<p>HTML permitido</p>",
    "options": [
      { "id": "A", "text": "Alternativa", "is_correct": true }
    ]
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "subject": "Enfermagem",
      "template": "t05",
      "items": [
        { "icon": "FileSearch", "label": "...", "detail": "..." }
      ],
      "footer_rule": "Regra de ouro"
    },
    {
      "type": "logic_flow",
      "steps": ["Passo 1", "Passo 2"]
    }
  ]
}
```

### 6.2 Convenções de Slides
- **template:** t01–t15 ou nome do tema (violet, cyan, etc.)
- **layout_variant:** Por tipo (ex.: logic_flow → vertical, horizontal, cards)
- **subject:** Usado para gerar tema visual automaticamente

---

## 7. APIs Principais

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/validate-question` | POST | Valida questão completa (Zod) |
| `/api/validate-question` | GET | Retorna schema de exemplo |
| `/api/analytics/summary` | GET | Resumo de analytics do usuário |
| `/api/analytics/recommendations` | GET | Recomendações personalizadas |
| `/api/analytics/reviews` | GET | Questões para revisão |
| `/api/cache/revalidate` | POST | Revalida cache (requer secret) |
| `/api/admin/revalidate-cache` | POST | Revalida cache (admin) |
| `/api/health` | GET | Health check |
| `/api/metrics` | GET | Métricas de performance |
| `/api/check-user` | GET | Verifica sessão do usuário |

---

## 8. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anônima Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave de serviço (admin) |
| `GOOGLE_API_KEY` | Não | API Gemini (funcionalidades IA) |
| `ADMIN_EMAIL` | Não | Email do admin (fallback: gvvariedades@gmail.com) |
| `WEBHOOK_SECRET` | Produção | Secret para webhooks |
| `METRICS_SECRET` | Produção | Secret para métricas |
| `NEXT_PUBLIC_BASE_URL` | Não | URL base (metadata, OG) |

---

## 9. Scripts NPM

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build (valida env antes) |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run test` | Jest |
| `npm run test:e2e` | Playwright E2E |
| `npm run validate:env` | Valida variáveis de ambiente |
| `npm run analyze:performance` | Análise de performance |

---

## 10. Segurança

- **Headers de segurança:** HSTS, X-Frame-Options, CSP, etc. (next.config.js)
- **CSP:** Restringe scripts, styles, imagens; connect-src para Supabase
- **RLS:** Habilitado em `historico_questoes` (usuário vê apenas seus dados)
- **Rate limiting:** `/api/validate-question` (20 req/10s)
- **Sanitização HTML:** Tags permitidas em text_fragment

---

## 11. Convenções e Padrões

- **Path alias:** `@/*` → raiz do projeto
- **Server Components:** Padrão; Client Components com `'use client'`
- **Fetch de dados:** Server Components com `await`; cache via `unstable_cache`
- **Logging:** `lib/logger.ts`
- **Validação:** Zod em todas as APIs de input
- **Templates de slide:** Sempre incluir `template` (t01–t15) em cada slide

---

## 12. Documentação Interna (docs/)

- `ANALYTICS_SYSTEM.md` – Sistema de analytics
- `SISTEMA_CACHE.md` – Cache estratégico
- `LOGIC_FLOW_PIPELINE.md` – Pipeline cognitivo (LogicFlow)
- `SISTEMA_TEMPLATES.md` – Templates de questões
- `VALIDACAO_ZOD.md` – Validação com Zod
- `DEPLOY.md`, `WEBHOOK_SETUP.md` – Deploy e webhooks

---

## 13. Resumo para LLM

Ao trabalhar neste projeto:
1. **Linguagem:** TypeScript strict, Next.js 16 App Router
2. **Dados:** Supabase (cidades, modulos_estudo, historico_questoes)
3. **Fluxo principal:** Login → Vitrine → Questão (pergunta → gabarito → slides)
4. **Slides:** JSON com `reverse_study_slides`; tipos: concept_map, logic_flow, golden_rule, danger_zone, etc.
5. **Validação:** Zod; sempre incluir `template` em slides
6. **Cache:** unstable_cache com tags e revalidate
7. **Admin:** Restrito por ADMIN_EMAIL; laboratório para criar/editar questões
