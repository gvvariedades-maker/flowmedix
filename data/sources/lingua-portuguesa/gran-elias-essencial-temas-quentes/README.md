# Gran — Elias Santana (Essencial Temas Quentes)

Fonte **interna** para enriquecer a persona `professor-elias-santana-metodo`.  
Curso logado: **Curso Gratuito Essencial para Concursos — Temas Quentes** (Língua Portuguesa / Elias Santana).

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `degravacoes/MNN-*/` | PDFs de degravação (gitignored — não commitar) |
| `outlines/` | Índices estruturais extraídos (headings, Obs., exemplos numerados) — **sem prosa longa** |
| `../../.cursor/skills/professor-elias-santana-metodo/modules/` | Módulos enriquecidos para handcraft |

## Extrair outlines (sessão Gran ativa)

```powershell
# Cookies da sessão (Playwright / browser logado) — NÃO commitar
$env:GRAN_COOKIE='grancursosonline=...; cf_clearance=...'

npm run gran:elias-extract-outlines
npm run gran:elias-generate-modules
```

Ou com arquivo JSON exportado do Playwright:

```powershell
npm run gran:elias-extract-outlines -- data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/_gran-cookies.json
```

## Gerar módulos enriquecidos (M01–M16)

```powershell
npm run gran:elias-generate-modules
```

Índice: `.cursor/skills/professor-elias-santana-metodo/modules/README.md` · doc repo: [`docs/LINGUA_PORTUGUESA_ELIAS_METODO.md`](../../../docs/LINGUA_PORTUGUESA_ELIAS_METODO.md)

## Crosswalk — Essencial × Gramática Completa

| Essencial (Temas Quentes) | Gramática Completa (81 aulas) | Módulo AVANT |
|----------------------------|-------------------------------|--------------|
| 5 Ortografia (exercícios) | 1–6 | **M01** |
| 6–10 Morfologia I–IV + Exercícios | 7–12 | **M02** |
| 11–17 Intro Sintaxe + Sujeito I–V + Exercícios | 13–18 | **M03** |
| 18–22 Predicação I–IV + Exercícios | 19–22 | **M04** |
| 23–25 Termos ligados ao nome | 23–25 | **M05** |
| 26 Demais funções PS | 26 | **M06** |
| 27 Intro PC + 28–30 Substantivas | 27–30 | **M07** / **M07a** |
| — (só Gramática Completa) | 31–41 adjetivas, adverbiais, reduzidas | **M07b–d** |
| — | 42–48 | **M08** |
| Colocação I–III | 49–53 | **M09** |
| — | 54–57 | **M10** |
| Crase I–III | 58–62 | **M11** |
| — | 63–81 | **M12–M16** |

**32 degravações** extraídas do Essencial (jul/2026). M08, M10, M12–M16 usam conteúdo operacional do syllabus público.

## Regras

- PDF/degravação **não** vai para o player nem para slides copiados.
- Outlines servem só para **sequência didática** e **pegadinhas** — conteúdo publicado é reescrito (golden-v1).
- Atualizar `outlines/M03-manifest.json` após novo extract.

## Handcraft

```text
@.cursor/skills/professor-elias-santana-metodo/modules/M03-sujeito-enriquecido.md
@data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/outlines/aula-13-sujeito-ii.json
```
