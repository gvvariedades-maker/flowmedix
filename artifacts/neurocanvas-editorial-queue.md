# NeuroCanvas — fila editorial G0.3A

Gate: **G0.3A** · schema v1 · dedupe v1

## Reconciliação

| Métrica | Valor |
|---------|------:|
| Casos (slugs unresolved) | 676 |
| Clusters | 301 |
| Todos pending | sim |
| Official lane | 122 |
| Manifest conflict lane | 6 |
| Pedagogical lane | 256 |
| Metadata lane | 255 |

Lanes são trilhos de revisão sobrepostos: um caso pode aparecer em official + pedagogical + metadata. A fila completa (676) é a união; lanes são filtros para lotes humanos.

## Trilhos de revisão

| lane | count | descrição |
|------|------:|-----------|
| official | 122 | S3 e/ou divergência de gabarito — exige fonte oficial; nenhuma recomendação automática de  |
| manifest_conflict | 6 | Múltiplos manifests documentados no mesmo tier com conteúdo divergente — decisão humana ob |
| pedagogical | 256 | S2 (NeuroSlides) — diff de items, steps, rows e content entre candidatos. |
| metadata | 255 | S1 — metadados pedagógicos; live match pode ser exibido como evidência operacional apenas. |

## Autoridade

Fila editorial = evidência + workflow. Autoridade canônica permanece em manifest.slugs[] + handcraft-registry.json. Decisões humanas futuras materializam via apply-lote/registry — não via silent overwrite do Supabase live.

Live artifact consumido: **sim**

## Amostra estratificada (20 case_ids)

- `nc-g03-a8b52105cd662b75`
- `nc-g03-5a0eeafec2973e9b`
- `nc-g03-f56ed6e1e4a3c90b`
- `nc-g03-d3c8103e471efe41`
- `nc-g03-e5703cd3ab41c17f`
- `nc-g03-b9835d7b9fca7ec8`
- `nc-g03-2dbd18db70cbc456`
- `nc-g03-225887fc3e95248c`
- `nc-g03-366f72b853e3ee43`
- `nc-g03-f66ddb42784d8412`
- `nc-g03-ce2329e88109314f`
- `nc-g03-bad3482bfe781e3d`
- `nc-g03-2d894fa66001531b`
- `nc-g03-b904102251f6e4fe`
- `nc-g03-44c19caa03f144c6`
- `nc-g03-d7c04f2d0208f7e6`
- `nc-g03-e9bd46bcb150f6f1`
- `nc-g03-1b1d03c2bf43e03e`
- `nc-g03-9d4af41203ebf6ba`
- `nc-g03-be3f37e3db274355`

## Proibido nesta fase

- Nenhum candidato selecionado automaticamente
- Nenhuma alteração em manifests, registry ou JSON de questões
- Live = evidência operacional apenas
