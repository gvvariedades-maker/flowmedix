# JSON de Teste - Pipeline Cognitivo

## Arquivo: `questao-teste-pipeline.json`

Este JSON está pronto para testar o **Pipeline Cognitivo** implementado no AVANT.

## Como Usar

### 1. No Admin Lab (`/admin/laboratorio`)

1. Acesse `/admin/laboratorio`
2. Cole o conteúdo do arquivo `questao-teste-pipeline.json` no editor JSON
3. Clique em "Validar"
4. Se tudo estiver correto, clique em "Salvar"
5. Use o Preview para ver o Pipeline Cognitivo em ação

### 2. Testando o Pipeline Cognitivo

O slide `logic_flow` (segundo slide) contém **6 passos** que serão revelados sequencialmente:

1. ✅ Leia cuidadosamente o trecho destacado
2. ✅ Identifique o conectivo "para" seguido de verbo no infinitivo
3. ✅ Pergunte-se mentalmente: "Para quê?"
4. ✅ Confirme que a oração responde à pergunta sobre propósito
5. ✅ Classifique como oração subordinada adverbial final
6. ✅ Selecione a alternativa C

**O que observar:**
- ✨ Cada step revela após 600ms do anterior
- ✨ Linha animada conecta os steps
- ✨ CheckCircle2 aparece quando step é revelado
- ✨ Step ativo pulsa com glow do tema
- ✨ Contador no footer atualiza progresso
- ✨ Badge "Pipeline Cognitivo" no topo

### 3. Estrutura Completa

O JSON inclui **4 slides** para testar todo o sistema:

1. **concept_map** - Mapa de conceitos com ícones
2. **logic_flow** - Pipeline Cognitivo (6 passos) ⭐
3. **golden_rule** - Regra de ouro
4. **danger_zone** - Zona de perigo com itens

### 4. Validação

Este JSON passa em todas as validações Zod:
- ✅ Meta completa
- ✅ Question data válida
- ✅ Options corretas
- ✅ Slides no formato semântico
- ✅ Steps válidos (mínimo 1, máximo 15)
- ✅ Todos os campos dentro dos limites

### 5. Testando Navegação

1. Responda a questão
2. Veja o gabarito
3. Clique em "Ativar Estudo Reverso"
4. Navegue entre os slides usando as setas
5. Volte para o slide `logic_flow` (slide 2)
6. **O Pipeline deve reiniciar automaticamente**

## Características do Pipeline

- **Tema Automático**: Baseado em "Fundamentos de Enfermagem" → Tema Indigo/Violet
- **Responsivo**: Funciona em mobile, tablet e desktop
- **Acessível**: Contraste adequado, indicadores visuais claros
- **Performance**: Animações otimizadas com Framer Motion

## Próximos Testes

Após testar este JSON, experimente:

1. **Mais passos**: Adicione até 15 passos no `logic_flow`
2. **Menos passos**: Teste com apenas 2-3 passos
3. **Formato antigo**: Teste com `structure.steps` para compatibilidade
4. **Diferentes temas**: Mude o `subject` para ver temas diferentes

## Troubleshooting

**Pipeline não aparece?**
- Verifique se `type: "logic_flow"` está correto
- Confirme que `steps` é um array válido
- Veja o console do navegador para erros

**Animações não funcionam?**
- Verifique se Framer Motion está instalado
- Confirme que está em modo Client Component (`'use client'`)

**Steps não revelam?**
- Verifique se há pelo menos 1 step no array
- Confirme que não há erros no console
- Teste em modo incógnito (sem extensões)

## Suporte

Se encontrar problemas, verifique:
- `docs/LOGIC_FLOW_PIPELINE.md` - Documentação completa
- `docs/PIPELINE_COGNITIVO_UPDATE.md` - Changelog das atualizações
- Console do navegador para erros específicos
