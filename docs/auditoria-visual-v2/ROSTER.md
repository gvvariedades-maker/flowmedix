# Roster — plataformas da auditoria

15 referências + baseline AVANT. Objetivo: extrair **padrões**, não copiar pixels.

---

## Camada A — Gigantes (confiança de mercado)

| ID | Plataforma | URL | Ficha |
|----|------------|-----|-------|
| A1 | QConcursos | https://www.qconcursos.com | `plataformas/A1-qconcursos.md` |
| A2 | Gran Questões | https://questoes.grancursosonline.com.br | `plataformas/A2-gran-questoes.md` |
| A3 | TecConcursos | https://www.tecconcursos.com.br | `plataformas/A3-tecconcursos.md` |
| A4 | Estratégia Concursos | https://www.estrategiaconcursos.com.br | `plataformas/A4-estrategia.md` |

---

## Camada B — Enfermagem / nicho

| ID | Plataforma | URL | Ficha | Notas |
|----|------------|-----|-------|-------|
| **B0** | **Gabarita Enfermagem** | https://gabaritaenfermagem.com.br/ | [`B0-gabarita-enfermagem.md`](./plataformas/B0-gabarita-enfermagem.md) | **Prioridade alta** — IA + saúde, overlap com AVANT |
| B1 | Gabaritando Enfermagem | https://gabaritandoenfermagem.com.br | `plataformas/B1-gabaritando-enfermagem.md` | Curso infoproduto (Michele Bastos) |
| B2 | Gabarite | https://gabarite.com.br | `plataformas/B2-gabarite.md` | Questões + simulados enfermagem |
| B3 | GabariteIA | https://www.gabariteia.com.br | `plataformas/B3-gabariteia.md` | Edital + IA |
| B4 | ENFrente Enfermagem Continuada | https://enfrenteenfermagem.com.br | [`B4-enfrente.md`](./plataformas/B4-enfrente.md) | Infoproduto cursos/e-books — contraste negativo LP |
| B5 | Mapas da Lulu | https://mapasdalulu.com.br | `plataformas/B5-mapas-da-lulu.md` | Material visual de revisão |

---

## Camada C — Inspiração cruzada

| ID | Plataforma | URL | Ficha | Notas |
|----|------------|-----|-------|-------|
| C1 | Estudei | https://estudei.com.br | [`C1-estudei.md`](./plataformas/C1-estudei.md) | **LP referência** — organização, prova social |
| C2 | Estudei (app) | App Store + login | `plataformas/C2-estudei-app.md` | Dashboard, claro/escuro |
| C4 | Notion | https://www.notion.so | `plataformas/C4-notion.md` | Densidade útil, tipografia |
| C5 | Linear | https://linear.app | `plataformas/C5-linear.md` | SaaS premium |

---

## Camada D — AVANT (controle)

| ID | Referência | Onde | Ficha |
|----|------------|------|-------|
| D1 | AVANT Cyber Clinical v1 | app local / tag `avant/cyber-clinical-v1` | [`D1-avant-baseline.md`](./plataformas/D1-avant-baseline.md) |

Rotas AVANT para captura: `/`, `/login`, `/estudar`, `/estudar/[slug]`, `/simulados`, `/cadernos`, `/plano-diario`, `/material`, `/ajuda/estudo-reverso`.

---

## Matriz AVANT vs Gabarita (referência B0)

| Capacidade | Gabarita Enfermagem | AVANT |
|------------|---------------------|-------|
| Banco de questões | ✓ comentários IA | ✓ + meta banca/edital |
| Simulados | ✓ cronometrados | ✓ |
| Revisão espaçada | ✓ SRS caderno erros | ✓ Plano Diário |
| Plano por edital | ✓ upload + IA | ✓ cadernos + edital matriculado |
| Slides didáticos | Resumos / mapas | **NeuroSlides (Estudo Reverso)** |
| Chat professor | Prof. Rebeca IA | — |
| Diferencial visual | IA + enfermeiro | **Reverso + técnico enfermagem** |

---

## Status da auditoria

Marque na planilha `scores/scorecard.csv` ou aqui:

| ID | LP (T1) | App (T2–T8) | Ficha | Screenshots |
|----|---------|-------------|-------|-------------|
| B0 | ☑ | ☑ parcial | ✓ + mapa funcional | ☑ app logado |
| C1 | ☑ | ☐ | ✓ tokens + scores | ☑ |
| C2 | — | ☑ ref vídeo | ✓ C2-estudei-app-ui.md | ☑ 8 frames tutorial |
| D1 | ☑ | ☑ | ✓ baseline completo | ☑ 26 PNG |
| A1 | ☑ | ☑ mapa + player | ✓ A1 + funcional + player + comparativo | ☑ 30+ PNG logado |
| B4 | ☑ | — | ✓ B4-enfrente.md | ☑ T1 |
| … | | | | |
