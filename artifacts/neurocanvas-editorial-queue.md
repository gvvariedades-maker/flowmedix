# NeuroCanvas — fila editorial G0.3A

Gate: **G0.3A** · schema v1 · dedupe v1

## Reconciliação

| Métrica | Valor |
|---------|------:|
| Casos (slugs unresolved) | 339 |
| Clusters | 104 |
| Todos pending | sim |
| Official lane | 11 |
| Manifest conflict lane | 0 |
| Pedagogical lane | 90 |
| Metadata lane | 74 |

Lanes são trilhos de revisão sobrepostos: um caso pode aparecer em official + pedagogical + metadata. A fila completa (339, baseline G0.4) é a união; lanes são filtros para lotes humanos.

## Trilhos de revisão

| lane | count | descrição |
|------|------:|-----------|
| official | 11 | S3 e/ou divergência de gabarito — exige fonte oficial; nenhuma recomendação automática de  |
| manifest_conflict | 0 | Múltiplos manifests documentados no mesmo tier com conteúdo divergente — decisão humana ob |
| pedagogical | 90 | S2 (NeuroSlides) — diff de items, steps, rows e content entre candidatos. |
| metadata | 74 | S1 — metadados pedagógicos; live match pode ser exibido como evidência operacional apenas. |

## Autoridade

Fila editorial = evidência + workflow. Autoridade canônica permanece em manifest.slugs[] + handcraft-registry.json. Decisões humanas futuras materializam via apply-lote/registry — não via silent overwrite do Supabase live.

Live artifact consumido: **não**

## Amostra estratificada (20 case_ids)

- `nc-g03-44c19caa03f144c6`
- `nc-g03-f66ddb42784d8412`
- `nc-g03-25206cad1fed2447`
- `nc-g03-d7c04f2d0208f7e6`
- `nc-g03-59f857310dc52834`
- `nc-g03-1b1d03c2bf43e03e`
- `nc-g03-0e075b5724ad178b`
- `nc-g03-bad3482bfe781e3d`
- `nc-g03-e9bd46bcb150f6f1`
- `nc-g03-9d4af41203ebf6ba`
- `nc-g03-be3f37e3db274355`
- `nc-g03-cac02f274e2b8aca`
- `nc-g03-2dbd18db70cbc456`
- `nc-g03-55a865a7cf3c68a4`
- `nc-g03-366f72b853e3ee43`
- `nc-g03-7e42721c14df950a`
- `nc-g03-2104245f0b5bbb1e`
- `nc-g03-e5703cd3ab41c17f`
- `nc-g03-f6d5a09d25cf0eb8`
- `nc-g03-ae1b4b5ae5e36872`

## Proibido nesta fase

- Nenhum candidato selecionado automaticamente
- Nenhuma alteração em manifests, registry ou JSON de questões
- Live = evidência operacional apenas
