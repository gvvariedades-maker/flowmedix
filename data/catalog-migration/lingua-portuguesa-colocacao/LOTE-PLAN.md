# Plano de lotes — Colocação Pronominal (PT)

Card canônico: **Pronomes e colocação pronominal** · ramo L3: `pt_pronomes_colocacao` · molde: `pt-clitic-rail`

Cluster PDF (rótulo Tec): **Colocação Pronominal** — **31 questões** em ordem de caderno.

| Marco | Valor |
|-------|--------|
| g07 | 8/31 handcraft READY |
| g14–g16 | 23 pendentes |
| Fechamento cluster | 31/31 → depois `Qualidade vendável: Pronomes e colocação pronominal` |

Fonte máquina: `data/catalog-migration/lingua-portuguesa-colocacao/cluster-plan.json`

---

## Ordem PDF (31 tecs)

| # | tec | Lote | Status |
|---|-----|------|--------|
| 01 | 3727518 | **g14** | extraído |
| 02 | 3746604 | **g14** | extraído |
| 03–10 | 3835994…3336128 | g07 | ✅ handcraft |
| 11–16 | 3352589…3376869 | **g14** | extraído |
| 17–24 | 3385122…3583308 | **g15** | pendente |
| 25–31 | 3607134…3709831 | **g16** | pendente (7 slugs) |

---

## g14 — preview temático

| tec | Gab | Tema |
|-----|-----|------|
| 3727518 | E | Ênclise / sequência (Varginha) |
| 3746604 | A | Texto poético (EDUCA PB) |
| 3352589 | D | Bibliófilas (VUNESP Sertãozinho) |
| 3352965 | B | «Levou-me» — ênclise |
| 3353968 | D | «Quando se lembrou» — SE próclise |
| 3374794 | B | «fez-me essa pergunta» |
| 3375896 | D | Ênclise norma-padrão |
| 3376869 | A | Ênclise correta (Morungaba) |

---

## Próximo comando

```text
Handcraft: Língua Portuguesa — Colocação g14
```

```bash
python scripts/tools/extract_pt_colocacao_g14.py   # já rodado
npm run handcraft:lingua-portuguesa-g14            # após criar script
```
