# Inventário — schema `public` (AVANT)

Última verificação lógica: tabelas usadas no código e tabelas presentes no Supabase do projeto de produção.

## Tabelas em `public` (dados do app)

| Tabela                 | Uso no AVANT |
|------------------------|--------------|
| `modulos_estudo`       | Sim — catálogo de questões, admin, cache |
| `historico_questoes`   | Sim — tentativas, desempenho, plano de revisão |
| `study_notebooks`      | Sim — cadernos do aluno |
| `study_notebook_items` | Sim — itens dos cadernos |

Não remova estas tabelas: são o núcleo do produto.

## Tabelas referenciadas no código, mas opcionais / outro ambiente

Algumas rotas e caches ainda falam com tabelas que **podem não existir** em um projeto mínimo (ex.: `flowcharts`, `exam_contents`, `enrollments`, `exams`, `modules`). Nesse caso a API trata como recurso não configurado ou o cache retorna vazio.

## O que **não** apagar

- Schema **`auth.*`**: gerenciado pelo Supabase Auth.
- Schema **`storage.*`**: arquivos.
- **`net.*`**, **`realtime.*`**, **`extensions`**, **`vault`**, etc.: infraestrutura do Supabase.

Remover tabelas de sistema quebra o projeto.
