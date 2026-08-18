# Onda 3 — nota-10 visual/L3 (10 pacotes)

**Data:** 2026-08-03  
**Modelo:** Cursor Grok 4.5  
**Ordem:** Mulher → Processo → Curativos → Imu → Vias → Punção → Peri → CME → Mental → Trabalho

| Pacote | named after | vf after | report |
|--------|------------:|---------:|--------|
| Saúde da Mulher | 0 | 0 | `saude-da-mulher-nota10-report.md` |
| Processo de Enfermagem | 0 | 0 | `processo-de-enfermagem-nota10-report.md` |
| Curativos e Manejo de Feridas | 0 | 0 | `curativos-e-manejo-de-feridas-nota10-report.md` |
| Imunização | 0 (letter FP 13) | 0 | `imunizacao-nota10-report.md` |
| Vias de Administração | 0 | 0 | `vias-de-administracao-nota10-report.md` |
| Punção Venosa e Cuidados com Cateteres | 0 | 0 | `puncao-venosa-e-cuidados-com-cateteres-nota10-report.md` |
| Assistência Perioperatória (Inclui SRPA) | 0 | 0 | `perioperatoria-nota10-report.md` |
| Enfermagem em Central de Material e Esterilização (CME) | 0 | 0 | `cme-nota10-report.md` |
| Saúde Mental | 0 | 0 | `saude-mental-nota10-report.md` |
| Enfermagem do Trabalho | 0 | 0 | `enfermagem-do-trabalho-nota10-report.md` |

## Feito nesta onda

- Letter strip + VF repair nos pacotes com residual
- Punção/Mental footers hand-fix
- Imunização: 13 letter classificados como FALSE_POSITIVE (`hepatite A/B é`)
- 10× `artifacts/<prefix>-nota10-report.md`
- Playbooks mínimos wired: CME, Saúde Mental, Enfermagem do Trabalho
- **Sem** 2º `--promote`; **sem** React novo (precisa `Implementar molde:`)

## Dry-run apply (flags P0-2)

| Lote | ok | failed | ready? |
|------|---:|-------:|--------|
| `processo-de-enfermagem-completo` | 15 | 271 | parcial (stubs SAE) |
| `imunizacao-completo` | 547 | 28 | parcial |
| `puncao-venosa-e-cuidados-com-cateteres-completo` | 108 | 0 | sim |
| `perioperatoria-completo` | 19 | 50 | parcial (rows moldes) |
| `cme-completo` | 35 | 1 | quase |
| `saude-mental-completo` | 36 | 1 | quase |
| `enfermagem-do-trabalho-completo` | 21 | 12 | parcial |

Detalhe: `artifacts/p0-onda3-dry-run-summary.json`

## Handoff

1. Digite **pode aplicar** para apply dos lotes OK (Punção 108/0; CME/Mental quase; Imu/Trabalho/Peri/Processo só slugs OK ou após fix gate) + Onda 2 residual se pendente.
2. Curativos/Onda 0 VF apply se ainda pendente no Supabase.
3. Backlog L3 React: Peri hotspots · CME autoclave · Mental RAPS — só com `Implementar molde:`.
4. Próxima: **Onda 4 ship Trilha A** (AB → Epi → Anatomia).
