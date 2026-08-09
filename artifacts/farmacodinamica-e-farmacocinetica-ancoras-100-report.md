# Âncoras 100% — Farmacodinâmica e Farmacocinética

**Fechamento:** 2026-08-08 via `npm run audit:anchor-100` (`approval.status=pass` + `--require-visual`)  
**Subtópico:** Farmacodinâmica e Farmacocinética — 13 slugs — `production_ready` — 3 ramos L3  
**Mapa gestos:** [`artifacts/glance-os-farmacodinamica-e-farmacocinetica-MAPA-8-GESTOS.md`](glance-os-farmacodinamica-e-farmacocinetica-MAPA-8-GESTOS.md)  
**Playbook:** `data/catalog-migration/handcraft-playbooks/farmacodinamica-e-farmacocinetica.json`  
**Política:** âncoras first — **sem** handcraft em massa / gNN / apply / `--promote` nesta conversa

---

## Tabela final

| branch_id | path | gates | visual (`--require-visual`) | approval | risk | signed_by |
|-----------|------|-------|------------------------------|----------|------|-----------|
| `farmaco_pk_pd_vf` | `examples/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json` | PASS | PASS (`visual-anchors`) | **pass** | medio | `agent:anchor-checklist-v1` |
| `farmaco_clinico_protocolo` | `examples/questao-premium-idecan-omeprazol-ev-ulcera.json` | PASS | PASS (`visual-anchors`) | **pass** | medio | `agent:anchor-checklist-v1` |
| `farmaco_generico` | `examples/questao-premium-aocp-farmacodinamica-isossorbida-angina.json` | PASS | PASS (`visual-anchors`) | **pass** | medio | `agent:anchor-checklist-v1` |

**DoD subtópico:** 3/3 âncoras com `approval.status=pass` — report este arquivo — base liberada para handcraft em massa em **nova** conversa.

---

## Revalidação (esta conversa — 2026-08-08)

| Passo | Resultado |
|-------|-----------|
| Fase 0a | Playbook 3 ramos + mapa 8 gestos + briefs L3 3/3 + cruzamento Composer (`rail` gold; ADME gallery TBD Fábrica) |
| Fase 0b | 3/3 paths presentes; zero `missing` |
| Fase 1 VF | gates PASS + `--require-visual` + `--sign-agent --write-meta` (sem polish — já golden-v1) |
| Fase 1 Clínico | idem |
| Fase 1 Genérico | idem |
| Composer | **não** aberto — moldes `ok_react` / `ok_generico_semantic`; `gesture_g2` PASS via `visual-anchors`; preview localhost indisponível; gallery PNG = Fábrica (banco Composer) |
| Handcraft gNN | **não** iniciado |

### Artefatos de checklist

- `artifacts/anchor-checklist/questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json`
- `artifacts/anchor-checklist/questao-premium-idecan-omeprazol-ev-ulcera.json`
- `artifacts/anchor-checklist/questao-premium-aocp-farmacodinamica-isossorbida-angina.json`

---

## Previews

| Ramo | URL |
|------|-----|
| VF | http://localhost:3000/dev/slide-mold-review?branch=farmaco_pk_pd_vf |
| Clínico | http://localhost:3000/dev/slide-mold-review?branch=farmaco_clinico_protocolo |
| Genérico | http://localhost:3000/dev/slide-mold-review?branch=farmaco_generico |

---

## Próximo passo (nova conversa)

```text
Handcraft: Farmacodinâmica e Farmacocinética
```

ou, se elevar gallery ADME no banco:

```text
Fábrica visual G2: SUBTÓPICO: Farmacodinâmica e Farmacocinética
```

**Não** iniciar gNN neste trilho de âncoras.
