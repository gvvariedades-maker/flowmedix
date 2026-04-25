# Importação e publicação no Laboratório AVANT

## Fluxo padrão (JSON no admin)

- **Rota:** `/admin/laboratorio`
- **API:** `POST /api/admin/questions` (corpo: uma questão ou **array** de questões, conforme o schema `QuestaoCompletaSchema` / laboratório).
- O corpo do JSON contém a **questão** (`question_data`, `meta`, `reverse_study_slides`, etc.). **Não** inclui `cidade_id` — isso **não** faz parte do contrato de publicação.

## Cidade do aluno (missão / convite)

- A “cidade” exibida no dashboard (ex. “Missão: Caicó - RN”) vem do **parâmetro de URL** `?cidade=…` em rotas como `/estudar`, login e registro, **não** de uma coluna fixa em cada questão inserida pelo laboratório.

## Tabela `modulos_estudo` e a coluna `cidade_id`

- Em limpezas de schema antigas, a coluna `cidade_id` foi **removida** e, para compat com **imports** (SQL, CSV, Table Editor, backups) que ainda referenciam o campo, pode existir migration que recria `cidade_id` como **UUID nulo, sem FK** (a tabela `cidades` não é mais usada no produto).
- **Publicação pelo laboratório/API admin** grava em `modulos_estudo` apenas campos como `modulo_nome`, `titulo_aula`, `modulo_slug`, `conteudo_json`, `banca`, `content_hash` (não depende de `cidade_id`).
- Se você importar dados e o PostgREST reclamar de `cidade_id` inexistente no schema, ou aplique a migration de restauração **ou** deixe de enviar a coluna no import.

## Erro comum

```text
Could not find the 'cidade_id' column of 'modulos_estudo' in the schema cache
```

- Significa: o **request** ainda manda `cidade_id`, mas a coluna não existia (ou o cache de schema ainda não atualizou). Ajuste o import (remova a coluna) ou alinhe o banco com a migration que adiciona a coluna nullable.

## Referência rápida

| Origem            | Inclui `cidade_id`? |
| ----------------- | -------------------- |
| Laboratório / API | Não (não usado)      |
| CSV/SQL legado    | Opcional; pode null  |
| Cidade do aluno   | `?cidade=` na URL    |
