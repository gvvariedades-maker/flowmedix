# Relatório de Arquivos e Pastas Órfãos - FlowMedix

**Data da Análise:** $(date)
**Analista:** Engenheiro de Software Sênior - Next.js App Router

---

## 📋 RESUMO EXECUTIVO

Este relatório identifica arquivos e pastas que não estão sendo utilizados no projeto FlowMedix, incluindo componentes órfãos, rotas vazias e estruturas antigas que podem ter sido substituídas pelas novas versões do AVANT Lab e Área do Aluno.

---

## 🗂️ PASTAS ÓRFÃS / VAZIAS

### 1. `app/(dashboard)/modules/`
**Status:** ⚠️ **PASTA VAZIA**

**Descrição:**
- Pasta completamente vazia dentro do Route Group `(dashboard)`
- Não possui `page.tsx` nem `route.tsx`
- Não serve como componente de suporte

**Razão para suspeita:**
- Route Groups (pastas entre parênteses) são usados para organização de layouts, mas esta pasta não contém nenhum arquivo
- Pode ter sido criada para uma funcionalidade futura que nunca foi implementada
- Não há referências a `/modules` em nenhum lugar do código

**Recomendação:** 
- Se não há planos de uso imediato, pode ser removida
- Se há planos futuros, manter mas documentar a intenção

---

## 🧩 COMPONENTES ÓRFÃOS

### 2. `components/BentoView.tsx`
**Status:** ❌ **NÃO ESTÁ SENDO IMPORTADO**

**Descrição:**
- Componente completo de visualização estilo "Bento Grid" para fluxogramas
- Exporta `BentoView` como default
- Usa `FlowNode[]` como prop

**Análise de Uso:**
- Busca por `BentoView` no código: **0 importações encontradas**
- Busca por `from.*BentoView`: **0 resultados**
- Busca por `import.*BentoView`: **0 resultados**

**Razão para suspeita:**
- Componente parece ser uma versão antiga de visualização de fluxogramas
- O projeto atual usa `Flowchart.tsx` e `FlowViewer.tsx` para renderizar fluxogramas
- Pode ter sido substituído pela nova arquitetura do AVANT Lab

**Recomendação:** 
- Verificar se há planos de usar este componente
- Se não, pode ser arquivado ou removido

---

### 3. `components/flow/InteractiveDeepDive.tsx`
**Status:** ❌ **NÃO ESTÁ SENDO IMPORTADO**

**Descrição:**
- Componente de modal interativo para exibir conteúdo detalhado em slides
- Usa `MenuContentItem[]` como prop
- Implementa navegação entre slides com animações

**Análise de Uso:**
- Busca por `InteractiveDeepDive`: **0 importações encontradas**
- Busca por `from.*InteractiveDeepDive`: **0 resultados**
- Busca por `import.*InteractiveDeepDive`: **0 resultados**

**Razão para suspeita:**
- Componente parece ser uma funcionalidade de "deep dive" que não foi integrada
- Pode ter sido planejado para uso nos fluxogramas mas nunca implementado
- Não há referências em nenhuma rota ou componente ativo

**Recomendação:** 
- Verificar se há planos de implementar esta funcionalidade
- Se não, pode ser removido ou movido para uma pasta de "componentes experimentais"

---

### 4. `components/flow/InteractiveFlowEngine.tsx`
**Status:** ❌ **NÃO ESTÁ SENDO IMPORTADO**

**Descrição:**
- Componente de motor de fluxo interativo com steps e opções
- Implementa lógica de navegação entre passos com feedback de sucesso/erro
- Usa `FlowStep[]` e `FlowOption[]` como tipos

**Análise de Uso:**
- Busca por `InteractiveFlowEngine`: **0 importações encontradas**
- Busca por `from.*InteractiveFlowEngine`: **0 resultados**
- Busca por `import.*InteractiveFlowEngine`: **0 resultados**

**Razão para suspeita:**
- Componente parece ser uma versão alternativa de simulador de decisões
- O projeto atual usa `DecisionSimulator.tsx` que tem funcionalidade similar mas diferente
- Pode ter sido substituído pelo `DecisionSimulator` que está sendo usado ativamente

**Recomendação:** 
- Comparar funcionalidades com `DecisionSimulator.tsx`
- Se `DecisionSimulator` cobre todas as necessidades, este pode ser removido
- Se há diferenças importantes, considerar integrar ou documentar quando usar cada um

---

### 5. `components/flow/StudyFlow.tsx`
**Status:** ❌ **NÃO ESTÁ SENDO IMPORTADO**

**Descrição:**
- Componente que usa ReactFlow para renderizar fluxogramas interativos
- Implementa `CustomNode` e usa `FlowchartContent` como tipo
- Tem dados mockados para demonstração

**Análise de Uso:**
- Busca por `StudyFlow`: **0 importações encontradas**
- Busca por `from.*StudyFlow`: **0 resultados**
- Busca por `import.*StudyFlow`: **0 resultados**

**Razão para suspeita:**
- Componente parece ser uma versão antiga do visualizador de fluxogramas
- O projeto atual usa `FlowViewer.tsx` dentro de `Flowchart.tsx` para renderizar fluxogramas
- `FlowViewer.tsx` tem funcionalidade similar mas está sendo usado ativamente

**Recomendação:** 
- Verificar se `FlowViewer.tsx` cobre todas as funcionalidades de `StudyFlow.tsx`
- Se sim, pode ser removido
- Se há diferenças importantes, considerar integrar funcionalidades úteis em `FlowViewer.tsx`

---

### 6. `components/admin/AdminOperationsPanel.tsx`
**Status:** ❌ **NÃO ESTÁ SENDO IMPORTADO**

**Descrição:**
- Componente completo de painel administrativo para gerenciar editais, tópicos e fluxogramas
- Implementa CRUD completo para exams, exam_topics e exam_contents
- Tem funcionalidade de matrícula de alunos

**Análise de Uso:**
- Busca por `AdminOperationsPanel`: **0 importações encontradas**
- Busca por `from.*AdminOperationsPanel`: **0 resultados**
- Busca por `import.*AdminOperationsPanel`: **0 resultados**

**Razão para suspeita:**
- Componente parece ser uma versão antiga do painel admin
- `app/(admin)/admin/page.tsx` tem sua própria implementação de gerenciamento (diferente estrutura de dados)
- `app/(admin)/admin/editais/page.tsx` também tem implementação própria
- Pode ter sido substituído pela nova arquitetura admin

**Recomendação:** 
- Verificar se `app/(admin)/admin/page.tsx` e `app/(admin)/admin/editais/page.tsx` cobrem todas as funcionalidades necessárias
- Se `AdminOperationsPanel` tem funcionalidades únicas, considerar integrar
- Se não, pode ser removido ou arquivado

---

### 7. `components/admin/AdminToolSwitcher.tsx`
**Status:** ❌ **NÃO ESTÁ SENDO IMPORTADO**

**Descrição:**
- Componente que alterna entre diferentes ferramentas admin
- Usa `SimulatorAdminPanel` e `VerticalExamBuilder` como ferramentas
- Implementa interface de tabs para alternar entre ferramentas

**Análise de Uso:**
- Busca por `AdminToolSwitcher`: **0 importações encontradas**
- Busca por `from.*AdminToolSwitcher`: **0 resultados**
- Busca por `import.*AdminToolSwitcher`: **0 resultados**

**Razão para suspeita:**
- Componente parece ser uma versão alternativa de organização do painel admin
- `app/(admin)/admin/page.tsx` tem sua própria implementação sem usar este componente
- `app/(admin)/admin/editais/page.tsx` também tem implementação própria
- Pode ter sido planejado mas nunca integrado

**Recomendação:** 
- Verificar se há planos de usar este componente para organizar as ferramentas admin
- Se não, pode ser removido (mas isso também afetaria `SimulatorAdminPanel` e `VerticalExamBuilder` se não estiverem sendo usados)
- **IMPORTANTE:** Verificar se `SimulatorAdminPanel` e `VerticalExamBuilder` estão sendo usados antes de remover este componente

---

## 📁 ROTAS E ESTRUTURAS

### 7. Estrutura de Rotas - Verificação

**Rotas Ativas Identificadas:**
- ✅ `app/(dashboard)/estudar/page.tsx` - **ATIVO**
- ✅ `app/(dashboard)/estudar/[slug]/page.tsx` - **ATIVO**
- ✅ `app/(dashboard)/estudar/reverso/page.tsx` - **ATIVO**
- ✅ `app/(dashboard)/matcher/page.tsx` - **ATIVO**
- ✅ `app/(dashboard)/modulos/page.tsx` - **ATIVO**
- ✅ `app/(dashboard)/simulador/[id]/page.tsx` - **ATIVO**
- ✅ `app/(dashboard)/study-plans/[planId]/page.tsx` - **ATIVO**
- ✅ `app/(dashboard)/treinamento/pcr/page.tsx` - **ATIVO**
- ✅ `app/(admin)/admin/page.tsx` - **ATIVO**
- ✅ `app/(admin)/admin/editais/page.tsx` - **ATIVO**
- ✅ `app/(admin)/editor/page.tsx` - **ATIVO**
- ✅ `app/laboratorio/page.tsx` - **ATIVO**
- ✅ `app/fluxograma/[slug]/page.tsx` - **ATIVO**
- ✅ `app/study/[flowchartId]/page.tsx` - **ATIVO**

**Observação:**
- Todas as rotas identificadas possuem `page.tsx` e estão estruturadas corretamente
- Não há rotas órfãs sem `page.tsx` ou `route.tsx`

---

## 🔍 COMPONENTES EM USO (Para Referência)

**Componentes Ativos Identificados:**
- ✅ `components/DecisionSimulator.tsx` - Usado em múltiplas rotas
- ✅ `components/ExamProgress.tsx` - Usado em `app/study/[flowchartId]/page.tsx`
- ✅ `components/Flowchart.tsx` - Usado em `app/fluxograma/[slug]/page.tsx`
- ✅ `components/flow/FlowViewer.tsx` - Usado por `Flowchart.tsx`
- ✅ `components/flow/CustomNode.tsx` - Usado por `FlowViewer.tsx`
- ✅ `components/ui/button.tsx` - Usado em múltiplos lugares
- ✅ `components/ui/card.tsx` - Usado em múltiplos lugares
- ⚠️ `components/admin/AdminToolSwitcher.tsx` - **NÃO ESTÁ SENDO USADO** (verificar se deve ser removido)
- ⚠️ `components/admin/SimulatorAdminPanel.tsx` - Usado apenas por `AdminToolSwitcher.tsx` (que não está sendo usado)
- ⚠️ `components/admin/VerticalExamBuilder.tsx` - Usado apenas por `AdminToolSwitcher.tsx` (que não está sendo usado)

---

## 📊 ESTATÍSTICAS

- **Pastas Vazias:** 1
- **Componentes Órfãos:** 7
- **Rotas Órfãs:** 0
- **Total de Arquivos Suspeitos:** 8

---

## ✅ RECOMENDAÇÕES FINAIS

### Ação Imediata (Baixo Risco)
1. **Remover `app/(dashboard)/modules/`** se não há planos de uso
2. **Arquivar ou remover `components/BentoView.tsx`** se não há planos de uso

### Ação com Verificação (Médio Risco)
3. **Verificar e possivelmente remover:**
   - `components/flow/InteractiveDeepDive.tsx`
   - `components/flow/InteractiveFlowEngine.tsx`
   - `components/flow/StudyFlow.tsx`
   - `components/admin/AdminOperationsPanel.tsx`
   - `components/admin/AdminToolSwitcher.tsx` (⚠️ **ATENÇÃO:** Usa `SimulatorAdminPanel` e `VerticalExamBuilder`)
   - `components/admin/SimulatorAdminPanel.tsx` (⚠️ **ATENÇÃO:** Usado apenas por `AdminToolSwitcher.tsx`)
   - `components/admin/VerticalExamBuilder.tsx` (⚠️ **ATENÇÃO:** Usado apenas por `AdminToolSwitcher.tsx`)

### Ação com Análise Profunda (Alto Risco)
4. **Antes de remover qualquer componente admin:**
   - Verificar se `app/(admin)/admin/page.tsx` cobre todas as funcionalidades de `AdminOperationsPanel.tsx`
   - Comparar estruturas de dados e funcionalidades
   - Considerar migração de funcionalidades úteis antes de remover

---

## 🔒 NOTA DE SEGURANÇA

**IMPORTANTE:** Este relatório identifica arquivos que **parecem** não estar em uso. Antes de deletar qualquer arquivo:

1. ✅ Verificar se há referências dinâmicas (strings, variáveis)
2. ✅ Verificar histórico do Git para entender contexto
3. ✅ Consultar equipe sobre funcionalidades planejadas
4. ✅ Fazer backup antes de remover
5. ✅ Testar aplicação após remoção

---

**Fim do Relatório**
