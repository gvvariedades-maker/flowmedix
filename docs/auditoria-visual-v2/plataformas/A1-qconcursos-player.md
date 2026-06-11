# QConcursos — player de questão (mapeamento)

**Captura:** 2026-06-10 · conta free · filtro Enfermagem + Técnico de Enfermagem  
**Screenshot:** `screenshots/qconcursos/T5-player-desktop.png`  
**JSON:** [`A1-qconcursos-map.json`](./A1-qconcursos-map.json) → bloco `player`

---

## Modelo de UI

O QC **não abre player em rota separada** na vitrine filtrada: a questão renderiza **inline** na mesma página (`/questoes-de-concursos/questoes?...`), abaixo dos filtros e da contagem.

```
[Filtros horizontais + checkboxes]
[Contagem + toolbar: A+/A-, imprimir, ordenar, itens/página]
[Card questão Q4045368]
  ├── Meta: Ano · Banca · Órgão · Prova (links laranja)
  ├── Breadcrumb disciplina › assunto
  ├── Enunciado
  ├── Alternativas (A)–(D) clicáveis
  ├── Botão "Responder"
  └── Links: Gabarito Comentado · Comentários · Estatísticas · Cadernos
```

---

## Toolbar da vitrine/player

| Controle | Função |
|----------|--------|
| **Gerar simulado** | Cria simulado a partir dos filtros ativos |
| **Meus Filtros** | Filtros salvos |
| **Desempenho** | Atalho estatísticas |
| **A+ / A−** | Escala tipográfica |
| **Por página** | Paginação (ex.: 5 itens) |
| **Ordenar por** | Ordenação da lista |
| **Imprimir** | Impressão da página |

---

## Filtros (vitrine)

### Dropdowns (grid 2×6)

Palavra-chave · Disciplina · Assunto · Banca · Instituição · Ano · Cargo · Nível · Área de Formação · Área de Atuação · Modalidade · Dificuldade

### Checkboxes — excluir

- Questões em meus cadernos / simulados
- Inéditas · Anuladas · Desatualizadas

### Checkboxes — conteúdo

- Com gabarito comentado · Comentários · Meus comentários · Videoaulas · Minhas anotações

### Filtro rápido “Minhas Questões”

Todas · Resolvidas · Não resolvidas · Acertei · Errei

### Ações

**Salvar Filtros** · **Limpar** · **Filtrar** (CTA laranja)

---

## Fluxo do player

1. Aplicar filtros (ex.: Disciplina Enfermagem + Cargo Técnico)
2. Lista paginada com cards; primeira questão visível (ex. **Q4045368**)
3. Clicar alternativa `(A)`–`(D)`
4. **Responder** → feedback imediato:
   - *Incorreta. Gabarito oficial da banca:* + CTA *Criar simulado*
   - ou *Parabéns! Você acertou!* + *Criar simulado*
5. Pós-resposta: **Gabarito Comentado**, **Comentários (N)**, **Estatísticas**, **Adicionar a um caderno**

**Limite free:** modal *Limite de 10 questões por dia atingido!* (observado na sessão).

---

## Menu usuário logado (descoberto)

| Item | Rota |
|------|------|
| Timeline / Início | `/usuario/novo-inicio` |
| Mesa de Estudos | `app.qconcursos.com` |
| Meu Painel | `/usuario` |
| Minha Assinatura | `app.qconcursos.com/minha-assinatura` |
| Configurações | `/usuario/configuracoes/perfil` |
| Minhas Estatísticas | `/usuario/estatisticas/{bancas,disciplinas,assuntos}` |
| Minhas Questões | `/usuario/questoes` |
| Meus simulados | `/usuario/simulados` |
| Meus cadernos | `/usuario/cadernos` |
| Meus guias | `/usuario/guias` |
| Indique e Ganhe | `/usuario/indique-e-ganhe` |

---

## QConcursos ↔ AVANT (player)

| QConcursos | AVANT |
|------------|-------|
| Questão inline na vitrine | Rota dedicada `/estudar/[slug]` |
| Meta banca/ano/órgão/prova em links | `meta` + `questionHeader` |
| Alternativas `(A)` radio | `btn-option` |
| Responder → gabarito + comentário professor | Confirmar → NeuroSlides (4 telas) |
| Comentários / Gabarito Comentado | Estudo Reverso |
| Cadernos QC | `/cadernos` |
| Limite 10 questões/dia (free) | Freemium Pro |
| Upsell modal + footer plano | CTA editorial verde (rebrand) |

**Rebrand:** copiar **legibilidade** (fundo claro, card branco, meta em linha); **não** copiar laranja nem fluxo de comentário como substituto do reverso.
