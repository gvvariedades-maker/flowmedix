# QConcursos A1 ↔ AVANT — funções e filtros

**Fonte:** `A1-qconcursos-funcional.md` + `A1-qconcursos-map.json` + player (captura 2026-06-10).

---

## Menu / hub

| QConcursos | Rota | AVANT equivalente | Notas rebrand |
|------------|------|-------------------|---------------|
| Novo início | `/usuario/novo-inicio` | home logada / `/estudar` | QC: feed + atalhos; AVANT: vitrine como hub |
| Questões | `/questoes-de-concursos/questoes` | `/estudar` | QC: filtros densos horizontais; AVANT: RPC vitrine + facets |
| Disciplinas | `/questoes-de-concursos/disciplinas` | assuntos no catálogo | Árvore por disciplina |
| Cadernos | `/usuario/questoes/cadernos` | `/cadernos` | QC: cadernos por tema; AVANT: cadernos + edital |
| Estatísticas | `/usuario/questoes/estatisticas` | `/analytics` | Desempenho por disciplina/banca |
| Simulados | `/usuario/simulados` | `/simulados` | Cronometrado + provas |
| Desempenho / mapa | `/usuario/desempenho` | `/analytics` | Gráficos de evolução |
| Guia de estudos | `/usuario/guia-de-estudos` | plano + edital | Trilha sugerida |
| Configurações | `/usuario/configuracoes` | `/conta` | Perfil e preferências |
| Assinatura | `/usuario/assinatura` | `/conta/assinatura` | Planos PRO |

---

## Vitrine (T3) — filtros QC

| Filtro QConcursos | AVANT vitrine |
|-------------------|---------------|
| Palavra-chave | Busca `q` (trgm) |
| Disciplina / Assunto | Tópico / subtópico |
| Banca | `meta.banca` |
| Instituição / Órgão | `meta.orgao` |
| Ano | `meta.ano` |
| Cargo / Nível | `cargo_header` / edital |
| Excluir já resolvidas | Histórico do usuário |
| Com comentário de professor | — (AVANT: NeuroSlides) |
| Salvar filtros / Meus filtros | — (caderno/edital) |
| Itens por página / Ordenar | Paginação API vitrine |

**Visual:** fundo branco, grid de dropdowns, CTA laranja `Filtrar` — AVANT: claro + CTA verde `#8fe020`.

---

## Player (T5/T6)

| Elemento QConcursos | AVANT (`AvantLessonPlayer`) |
|---------------------|-------------------------------|
| Lista + questão inline ou URL única | Rota `/estudar/[slug]` |
| Meta banca/ano/órgão/prova | `meta` + `questionHeader` |
| Alternativas A–E (radio) | `btn-option` |
| Responder → gabarito imediato | Confirmar → feedback → NeuroSlides |
| Comentários de professor | Estudo Reverso (4 slides) |
| A+/A−, modo noturno, imprimir | Zoom toolbar (ver `ZOOM_MOBILE_POLICY`) |
| Adicionar ao caderno | Cadernos / histórico |
| Próxima questão | Navegação vitrine preservando query |

**Rebrand:** legibilidade QC (card branco, denso) + momento exclusivo AVANT pós-resposta (NeuroSlides, verde).

---

## O que NÃO copiar

- Laranja `#FE6112` como brand
- Upsell ELITE em top-bar agressivo (AVANT: CTA editorial)
- Comentário professor como substituto do reverso

