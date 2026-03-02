# 📊 Guia de Configuração - Página de Desempenho

## ✅ O que é necessário para a página de desempenho funcionar

### 1. **Tabela no Banco de Dados**
A tabela `historico_questoes` precisa existir no Supabase. Execute o arquivo de migration:

```sql
-- Arquivo: supabase/migrations/create_historico_questoes.sql
```

**Como executar:**
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo `create_historico_questoes.sql`
4. Execute o script

### 2. **Autenticação do Usuário**
O aluno precisa estar **logado** no sistema para:
- Ver seus próprios dados de desempenho
- Ter suas tentativas registradas automaticamente

**Como funciona:**
- Quando o aluno responde uma questão em `/estudar/[slug]`, o sistema automaticamente registra a tentativa na tabela `historico_questoes`
- A página `/desempenho` busca todos os registros desse usuário e calcula as estatísticas

### 3. **Dados de Histórico**
Para ver dados na página de desempenho, o aluno precisa:
- Estar autenticado
- Ter respondido pelo menos uma questão em qualquer módulo

**Como gerar dados:**
1. Faça login no sistema
2. Acesse `/estudar` (Vitrine de Aulas)
3. Clique em qualquer módulo/aula
4. Responda a questão (escolha uma alternativa)
5. O sistema registra automaticamente:
   - Se acertou ou errou
   - O módulo respondido
   - O tópico/subtópico
   - A data/hora

### 4. **Estrutura de Dados Esperada**

A tabela `historico_questoes` armazena:
- `user_id`: ID do usuário (UUID)
- `modulo_slug`: Slug único do módulo/aula
- `topico`: Tópico principal da questão
- `subtopico`: Subtópico específico
- `banca`: Banca examinadora
- `acertou`: Boolean (true = acertou, false = errou)
- `created_at`: Data/hora da tentativa

### 5. **Permissões (RLS - Row Level Security)**

A tabela está configurada com RLS para garantir que:
- ✅ Usuários só veem seus próprios dados
- ✅ Usuários só podem inserir registros para si mesmos
- ✅ Usuários podem deletar seus próprios registros (se necessário)

## 🔍 Verificações de Troubleshooting

### Problema: Página mostra "Nenhum dado registrado ainda"
**Solução:**
1. Verifique se o usuário está logado
2. Verifique se respondeu pelo menos uma questão
3. Verifique se a tabela `historico_questoes` existe no banco
4. Verifique se os dados foram inseridos corretamente:
   ```sql
   SELECT * FROM historico_questoes WHERE user_id = 'SEU_USER_ID';
   ```

### Problema: Redireciona para login mesmo estando logado
**Solução:**
1. Verifique se os cookies do Supabase estão sendo salvos
2. Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configurados no `.env`
3. Verifique o console do navegador para erros de autenticação

### Problema: Erro ao inserir tentativa
**Solução:**
1. Verifique se a tabela existe
2. Verifique se o RLS está configurado corretamente
3. Verifique se o usuário está autenticado no momento da resposta
4. Verifique os logs do Supabase para erros específicos

## 📝 Checklist de Implementação

- [ ] Tabela `historico_questoes` criada no Supabase
- [ ] RLS configurado corretamente
- [ ] Índices criados para performance
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Usuário autenticado no sistema
- [ ] Pelo menos uma questão respondida
- [ ] Dados visíveis na página `/desempenho`

## 🎯 Fluxo Completo

1. **Aluno faz login** → Sessão criada no Supabase
2. **Aluno acessa `/estudar`** → Vê lista de módulos/aulas
3. **Aluno clica em um módulo** → Vai para `/estudar/[slug]`
4. **Aluno responde questão** → Sistema registra em `historico_questoes`
5. **Aluno acessa `/desempenho`** → Vê estatísticas calculadas:
   - Taxa geral de acerto
   - XP estimado
   - Acertos totais
   - Desempenho por assunto (módulo + tópico)
   - Badges de prioridade
   - Links para revisar assuntos

## 📊 Exemplo de Dados Esperados

Após responder algumas questões, a página mostrará cards como:

```
┌─────────────────────────────────────┐
│ Módulo: Português                   │
│ Tópico: Concordância Verbal        │
│                                     │
│ 75%                                 │
│ [████████░░░░░░░░]                 │
│                                     │
│ Acertos: 15  |  Erros: 5           │
│ Tentativas: 20                      │
│                                     │
│ [Badge: Na direção certa]          │
│ [Botão: Revisar assunto]           │
└─────────────────────────────────────┘
```

## 🚀 Próximos Passos

1. Execute a migration `create_historico_questoes.sql`
2. Faça login no sistema
3. Responda algumas questões
4. Acesse `/desempenho` para ver os resultados
