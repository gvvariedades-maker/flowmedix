# Língua Portuguesa — método morfossintaxe (Elias Santana / Gran)

Documento **versionado** de onboarding para a persona `professor-elias-santana-metodo`.  
A skill completa vive em [`.cursor/skills/professor-elias-santana-metodo/`](../.cursor/skills/professor-elias-santana-metodo/SKILL.md) (versionada no git).

> **Escopo:** morfossintaxe de concurso (sintaxe, morfologia em contexto, crase, regência, pontuação estrutural, colocação, SE…). **Não** cobre interpretação pura, literatura ou coesão sem análise estrutural — use [`professor-lingua-portuguesa-concurso`](../.cursor/skills/professor-lingua-portuguesa-concurso/SKILL.md).

---

## Quando usar

| Situação | Skill |
|----------|--------|
| Handcraft PT padrão AVANT | `professor-lingua-portuguesa-concurso` |
| Usuário pede **método Elias / morfossintaxe Gran / pergunta-teste** | `professor-elias-santana-metodo` |
| Questão com classificação sintática, sujeito, crase, colocação etc. | Elias (se raciocínio estrutural) |

**Encadeamento handcraft:**

1. `professor-elias-santana-metodo` (ou PT genérico)
2. `avant-classify-family`
3. `avant-golden-anchor-handcraft`
4. `brief-lingua-portuguesa`
5. `avant-json-template`

---

## Índice mestre e módulos (M01–M16)

| Doc | Conteúdo |
|-----|----------|
| [`reference-mapeamento-curso-completo.md`](../.cursor/skills/professor-elias-santana-metodo/reference-mapeamento-curso-completo.md) | 81 videoaulas Gran + 5 PDFs; roteador assunto → módulo |
| [`modules/README.md`](../.cursor/skills/professor-elias-santana-metodo/modules/README.md) | **16 módulos enriquecidos** para handcraft |

| Módulo | Tema | Arquivo enriquecido |
|--------|------|---------------------|
| M01 | Ortografia e acentuação | [`M01-ortografia-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M01-ortografia-enriquecido.md) |
| M02 | Morfologia | [`M02-morfologia-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M02-morfologia-enriquecido.md) |
| M03 | Sujeito (PS) | [`M03-sujeito-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M03-sujeito-enriquecido.md) — piloto manual |
| M04 | Predicação verbal | [`M04-predicacao-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M04-predicacao-enriquecido.md) |
| M05 | Termos ligados ao nome | [`M05-termos-nome-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M05-termos-nome-enriquecido.md) |
| M06 | Demais funções PS | [`M06-funcoes-ps-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M06-funcoes-ps-enriquecido.md) |
| M07 | Período composto (incl. M07a–d) | [`M07-periodo-composto-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M07-periodo-composto-enriquecido.md) |
| M08 | Pontuação | [`M08-pontuacao-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M08-pontuacao-enriquecido.md) |
| M09 | Colocação pronominal | [`M09-colocacao-pronominal-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M09-colocacao-pronominal-enriquecido.md) |
| M10 | Vozes verbais e SE | [`M10-vozes-se-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M10-vozes-se-enriquecido.md) |
| M11 | Crase | [`M11-crase-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M11-crase-enriquecido.md) |
| M12 | Reescrita | [`M12-reescrita-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M12-reescrita-enriquecido.md) |
| M13 | Concordância especial | [`M13-concordancia-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M13-concordancia-enriquecido.md) |
| M14 | Verbos | [`M14-verbos-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M14-verbos-enriquecido.md) |
| M15 | Formação de palavras | [`M15-formacao-palavras-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M15-formacao-palavras-enriquecido.md) |
| M16 | Fonética e fonologia | [`M16-fonetica-enriquecido.md`](../.cursor/skills/professor-elias-santana-metodo/modules/M16-fonetica-enriquecido.md) |

**Pilotos golden:**

| Módulo | Âncora | Prompt conversa |
|--------|--------|-----------------|
| M03 Sujeito | [`questao-premium-epice-portugues-sujeito-eliptico.json`](../examples/questao-premium-epice-portugues-sujeito-eliptico.json) | trigger Handcraft + módulo M03 |
| M08 Pontuação | [`questao-premium-avancasp-portugues-pontuacao-vocativo-rita.json`](../examples/questao-premium-avancasp-portugues-pontuacao-vocativo-rita.json) (eliminação · vocativo) · [`questao-premium-cpcon-portugues-pontuacao-tirinha-vf.json`](../examples/questao-premium-cpcon-portugues-pontuacao-tirinha-vf.json) (VF I/II/III) | brief L3 `pt_pontuacao` · target `pt-comma-rail` |
| M11 Crase (Q506) | [`questao-premium-vunesp-portugues-crase-funil.json`](../examples/questao-premium-vunesp-portugues-crase-funil.json) | [`PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md`](PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md) |

---

## Fontes Gran (internas)

Degravações do curso logado **Essencial Temas Quentes** + outlines estruturais (sem prosa nos slides publicados):

| Pasta | Uso |
|-------|-----|
| [`data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/`](../data/sources/lingua-portuguesa/gran-elias-essencial-temas-quentes/README.md) | Catálogo, PDFs (gitignored), outlines JSON |
| `outlines/` | Headings, Obs., itens numerados — **não** copiar para JSON |
| `modules/` (skill) | Conteúdo operacional reescrito para handcraft |

**Regra:** PDF/degravação **não** vai para o player. Conteúdo publicado = golden-v1 bespoke por questão.

---

## Comandos

Requer sessão Gran ativa (`GRAN_COOKIE` ou `_gran-cookies.json` — não commitar):

```powershell
$env:GRAN_COOKIE='grancursosonline=...; cf_clearance=...'
npm run gran:elias-extract-outlines
npm run gran:elias-generate-modules
```

Scripts: [`scripts/tools/gran_elias_extract_outlines.py`](../scripts/tools/gran_elias_extract_outlines.py) · [`scripts/tools/gran_elias_generate_modules.py`](../scripts/tools/gran_elias_generate_modules.py)

---

## Trigger no Agent (Cursor)

```text
Handcraft: Língua Portuguesa — método morfossintaxe — lote g01

Anexos:
@.cursor/skills/professor-elias-santana-metodo/SKILL.md
@.cursor/skills/professor-elias-santana-metodo/modules/M03-sujeito-enriquecido.md
@docs/LINGUA_PORTUGUESA_ELIAS_METODO.md
@.cursor/skills/avant-classify-family/SKILL.md
@.cursor/skills/avant-golden-anchor-handcraft/SKILL.md
@.cursor/skills/brief-lingua-portuguesa/SKILL.md
@.cursor/skills/avant-json-template/SKILL.md
```

---

## Referências cruzadas

| Arquivo | Uso |
|---------|-----|
| [`docs/LINGUA_PORTUGUESA_CLASSIFICACAO.md`](LINGUA_PORTUGUESA_CLASSIFICACAO.md) | Cards vitrine (17) × cluster Tec |
| [`docs/LINGUA_PORTUGUESA_GUIDELINES.md`](LINGUA_PORTUGUESA_GUIDELINES.md) | Guidelines P0 (crase, colocação) |
| [`docs/PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md`](PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md) | Prompt conversa âncora Crase Q506 |
| [`data/sources/lingua-portuguesa/README.md`](../data/sources/lingua-portuguesa/README.md) | Caderno 671 questões + fontes |

---

## Atualização

| Data | Nota |
|------|------|
| 2026-07-19 | M01–M16 enriquecidos; 32 outlines Essencial; skill versionada no git |
| 2026-07-19 | Prompt âncora Q506 — [`PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md`](PROMPT_PIPELINE_ANCORA_PT_CRASE_Q506.md) |
| 2026-07-20 | M08 enriquecido + âncoras Pontuação (Rita + VF tirinha) + brief `pt_pontuacao` (`pt-comma-rail`) |
