# Plano de reestruturação AVANT — coordenação entre conversas

**Gerado em:** 2026-07-20  
**Baseline:** `npm run catalog:program-status` → [`catalog-program-status.json`](catalog-program-status.json)  
**Objetivo:** memória persistente **fora do chat** — cada conversa Agent lê este arquivo + registry; nenhuma conversa única reestrutura tudo.

> **Regra:** 1 escopo = 1 conversa. Ao terminar, atualizar a seção [Progresso](#progresso) e a [Fila](#fila-das-próximas-8-conversas).

---

## Princípio (contexto do Cursor)

| ❌ Não usar | ✅ Usar |
|-------------|---------|
| Chat longo como memória | Este arquivo + `handcraft-registry.json` + commits |
| Continuar sem anexos | Protocolo de handoff (abaixo) |
| Re-handcraft em `production_ready` | Health contínuo + repair pontual (`Slug:`) |

---

## Snapshot atual (2026-07-20)

Fonte: `artifacts/catalog-program-status.json`.

### Programa 41 subtópicos (Enfermagem)

| Métrica | Valor |
|---------|------:|
| `production_ready` (vendável) | **24 / 41** (58,5%) |
| `applied` não vendável | **0** |
| Em progresso | **1** |
| Sem pacote no registry | **16** |
| Legado builder pendente | **0** |

### Único pacote em progresso (P0 catálogo)

| Subtópico | Applied / Total | Status | Próximo trigger |
|-----------|----------------:|--------|-----------------|
| **Promoção à Saúde e Prevenção de Agravos** | 0 / 130 | `none` | `Mapeamento L3:` → `Pipeline completo: Promoção à Saúde e Prevenção de Agravos` |

### Trilho paralelo (fora dos 41 TE)

| Pacote | Registry | Nota |
|--------|----------|------|
| **Língua Portuguesa** | `lingua-portuguesa` | Fora do CLAUDE.md §9 TE; cluster Crase g01–g06 applied; ver nota no registry 2026-07-19 |

---

## O que NÃO tocar (lista fechada)

Pacotes **`production_ready`** — manutenção só via `audit:subtopico-health` ou repair pontual. **Proibido** re-handcraft em massa.

1. História da Enfermagem (20)
2. Processo de Enfermagem (51)
3. Farmacodinâmica e Farmacocinética (13)
4. Cálculo de Administração de Medicamentos e Infusões (85)
5. Vias de Administração (208)
6. Cuidados na Administração de Medicamentos (123)
7. Verificação de Sinais Vitais (354)
8. Curativos e Manejo de Feridas (94)
9. Punção Venosa e Cuidados com Cateteres (110)
10. Feridas e Queimaduras (8)
11. Processamento de Artigos e Produtos de Saúde (18)
12. Enfermagem em Central de Material e Esterilização (CME) (35)
13. Infecções no Contexto da Biossegurança (25)
14. Segurança do Paciente (59)
15. Imunização (575)
16. Doenças Bacterianas e Fúngicas (37)
17. Doenças Respiratórias Crônicas (9)
18. Assistência Perioperatória (Inclui SRPA) (68)
19. Urgências e Emergências (339)
20. Enfermagem do Trabalho (33)
21. Saúde Mental (37)
22. Saúde da Criança (62)
23. Saúde do Adolescente (16)
24. Saúde da Mulher (246)

**App estável:** `lib/validations.ts`, `lib/cache.ts`, `AvantLessonPlayer`, `proxy.ts`, gates `audit:*`, `validate:goldens`.

---

## Fila das próximas 8 conversas

| # | Status | Escopo | Trigger |
|---|--------|--------|---------|
| 1 | done | Atalhos CLAUDE.md + este plano | sessão 2026-07-20 |
| 2 | done | Alinhar README | Agent: README alinhado ao CLAUDE.md |
| 3 | done | LEGADO_INDEX.md | Criar índice docs legados |
| 4 | pending | Promoção à Saúde — L3 | `Mapeamento L3: Promoção à Saúde e Prevenção de Agravos` |
| 5 | pending | Promoção à Saúde — g01 | `Handcraft: Promoção à Saúde e Prevenção de Agravos g01` |
| 6 | pending | Health 24 PR | `npm run audit:subtopico-health -- --all-production-ready` |
| 7 | pending | Sondas Fase 0 | `Pipeline completo: Instalação e Manejo de Sondas` |
| 8 | pending | Oxigenoterapia Fase 0 | `Pipeline completo: Oxigenoterapia e Cuidados Respiratórios` |

### 16 subtópicos sem pacote (onda B)

Noções de Anatomia · Noções de Fisiologia · Instalação e Manejo de Sondas · Oxigenoterapia e Cuidados Respiratórios · Coleta de Exames Laboratoriais · Mobilização e Posicionamento do Paciente · Procedimentos Diversos · Medidas de Prevenção e Precaução de Contato · Epidemiologia e Vigilância Epidemiológica · Atenção Básica / Saúde da Família · ISTs · Doenças Virais · Doenças Parasitárias e Zoonoses · Outras Doenças Mescladas · Questões Mescladas Agudas · Enfermagem em Centro Cirúrgico

---

## Protocolo de handoff

```text
CONTEXTO:
@artifacts/restructure-plan.md
@artifacts/catalog-program-status.json
@data/catalog-migration/handcraft-registry.json

ESCOPO (1 linha da fila #N):
[...]

PROIBIDO:
- Pacotes da lista NÃO tocar (salvo Slug: repair)
- apply sem "pode aplicar"
- Refatorar fora do escopo

AO TERMINAR:
1. Atualizar Progresso neste arquivo
2. Resumo: feito | blockers | próxima conversa
3. Se catálogo mudou: npm run catalog:program-status
```

---

## Progresso

| # | Conversa | Status | Data | Notas |
|---|----------|--------|------|-------|
| 1 | Atalhos CLAUDE + restructure-plan | done | 2026-07-20 | |
| 2 | README alinhado | done | 2026-07-20 | Next 16, /estudar, NeuroSlides; removidos (auth) e /study |
| 3 | LEGADO_INDEX.md | done | 2026-07-20 | Índice + banner; link em CLAUDE.md §Referências |
| 4 | Promoção à Saúde L3 | pending | | |
| 5 | Promoção à Saúde g01 | pending | | |
| 6 | Health all PR | pending | | |
| 7 | Sondas Fase 0 | pending | | |
| 8 | Oxigenoterapia Fase 0 | pending | | |

---

## Referências

- [CLAUDE.md](../CLAUDE.md)
- [docs/PIPELINE_COMPLETO_CONVERSA.md](../docs/PIPELINE_COMPLETO_CONVERSA.md)
- [docs/PROMPT_META_AUDITORIA_AVANT.md](../docs/PROMPT_META_AUDITORIA_AVANT.md)
