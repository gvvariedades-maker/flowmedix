# NeuroCanvas — phase readiness (G0.2)

Gerado em: 2026-07-26T09:52:51.213Z

Unresolved blockers: **676**
Live access: **sim**

## Fases

### Fase 0A — NeuroVisualPlan wrapper

**Veredito: READY**

- NeuroVisualPlan wrapper interno sem cache persistente e sem diferença visual.
- Pode consumir input efetivo em runtime — não depende de escolha entre arquivos locais.

Sem blockers.

### Fase 0B — Cache questionHash + baseline

**Veredito: NOT READY**

- Cache por questionHash + baseline completa + testes de catálogo.
- Depende de fonte canônica reprodutível (manifest/registry).

Blockers:

- 676 slugs unresolved — fonte canônica editorial não reprodutível.
- baseline_materially_affected=true — catálogo parcial.

### Fase 2 — Composições visuais piloto

**Veredito: NOT READY**

- Novas composições visuais no piloto.
- Exclui unresolved, S3 e divergentes até decisão editorial.

Blockers:

- Excluir 676 unresolved do piloto visual.
- 75 blockers S3 exigem revisão oficial antes de composições visuais.
- 237 slugs live sem match local.


## Coorte (fixture técnica)

Pilotos: 41 · Controles: 41

Fixture técnica (41 pilotos + 41 controles) — não é coorte experimental representativa do catálogo nem dos 676 blockers.

Genéricos grade A: **1907**

### Por tipo

- concept_map: 751
- golden_rule: 1156

### Top subtópicos

- Epidemiologia e Vigilância Epidemiológica: 381
- Urgências e Emergências: 165
- Atenção Básica / Saúde da Família: 136
- Curativos e Manejo de Feridas: 126
- Imunização: 100
- Classes de palavras: 93
- Noções de Anatomia: 88
- Segurança do Paciente: 79
- Promoção à Saúde e Prevenção de Agravos: 77
- Vias de Administração: 66
- Sinônimos, antônimos e polissemia: 63
- Enfermagem em Central de Material e Esterilização (CME): 54
- Verbos — tempos, modos e vozes: 45
- Enfermagem do Trabalho: 43
- Saúde da Mulher: 39

Match operacional live (genéricos A): Não avaliado no G0.2 — os 1.907 genéricos grade A pertencem à baseline canônica (4.975 slugs), fora do escopo da consulta live dos 676 blockers.
Canônico editorial documentado (genéricos A): 939

## Confirmações

- Nenhuma escrita Supabase
- Nenhuma alteração em manifests, registry, JSONs, player, resolver ou runtime
- Nenhum commit, push, PR ou deploy
