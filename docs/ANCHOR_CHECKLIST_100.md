# Checklist Âncoras 100% — gate executável + assinatura por risco

Torna o checklist prático de âncora **responsável pelo agente** sem auto-aprovação no mesmo turno de escrita.

Complementa: [`PROMPT_ANCORAS_100.md`](PROMPT_ANCORAS_100.md) · [`DECISAO_AUTO_APROVACAO_RISCO.md`](DECISAO_AUTO_APROVACAO_RISCO.md) · [`NEUROSLIDES_VISUAL_BAR.md`](NEUROSLIDES_VISUAL_BAR.md)

---

## Princípio

| Papel | Pode |
|-------|------|
| **Writer** | Editar JSON; rodar audit; **não** escrever `approval.status=pass` no chat |
| **Gates** | `READY` + spoiler + DZ + densidade (`lib/catalogMigration/anchorChecklist100.ts`) |
| **Revisor B** | Overlay LLM/humano (`--reviewer-file`) para `teach_once` / `gesture_g2` |
| **Assinatura** | `--sign-agent` só se `agent_may_sign`; `--sign-human=` se risco alto |

Artefato: `artifacts/anchor-checklist/<slug>.json`  
Meta opcional: `meta.anchor_100_approval` (`--write-meta`)

---

## Comando

```bash
npm run audit:anchor-100 -- --file=examples/questao-premium-<…>.json
npm run audit:anchor-100 -- --file=… --sign-agent
npm run audit:anchor-100 -- --file=… --sign-agent --write-meta
npm run audit:anchor-100 -- --file=… --require-visual
npm run audit:anchor-100 -- --file=… --reviewer-file=artifacts/anchor-reviewer-b-<slug>.json
npm run audit:anchor-100 -- --file=… --sign-human=PC --write-meta
```

| Flag | Efeito |
|------|--------|
| `--sign-agent` | Assina `agent:anchor-checklist-v1` se gates OK e risco ≠ alto |
| `--sign-human=Nome` | Assina humano (obrigatório em risco alto) |
| `--write-meta` | Grava `meta.anchor_100_approval` no JSON (só com status pass) |
| `--require-visual` | Exige `visual-anchors.json` ou `artifacts/questao-review/<slug>` |
| `--reviewer-file=` | Overlay Revisor B (`teach_once` / `gesture_g2`) |
| `--json` | Só imprime path do artefato |

**Exit codes:** `0` gates OK · `1` gates FAIL · `2` `human_required` (sem assinatura humana)

---

## Checks

| id | Source | Critério |
|----|--------|----------|
| `ready_strict` | gate | `auditQuestaoReadiness` strict-v2 → `ready_100` |
| `no_spoiler_cm_gr` | gate | `detectUnifiedPedagogy` + códigos spoiler readiness |
| `danger_zone_complete` | gate | cobertura letras / transferência / correct únicos |
| `density_one_idea` | gate + heuristic | `lintCardDensity` + duas sentenças no mesmo card |
| `teach_once` | heuristic ou llm/human | proxy READY+CM≥3+fixação; ou overlay Revisor B |
| `gesture_g2` | skipped / gate / llm | default skip; `--require-visual` ou overlay |

---

## Fluxo Agent (Âncoras 100%)

```text
1. Writer eleva a âncora (golden-anchor-handcraft)
2. npm run audit:anchor-100 -- --file=…          → gates
3. (opcional) Revisor B: --reviewer-file=…       → teach_once / gesture
4. Preview visual se ramo L3 (--require-visual quando fechar 100%)
5. Se agent_may_sign: --sign-agent [--write-meta]
   Se human_required: PARAR → humano --sign-human=… --write-meta
6. Próximo ramo só com approval.status=pass (artefato ou meta)
```

**Proibido:** Writer declarar “aprovado” no chat sem artefato `pass`.

---

## Prompt — Revisor B (segundo agente / segundo turno)

Copiar em turno **separado** do Writer. Só ler; preencher JSON overlay.

```text
Revisor B — checklist Âncoras 100% (NÃO editar o JSON da âncora)

Âncora: <path>
Artefato gates: artifacts/anchor-checklist/<slug>.json
Preview (se houver): /dev/slide-mold-review?branch=<branch_id>

Tarefa:
1. Ler só concept_map + logic_flow + golden_rule + danger_zone.
2. Julgar teach_once: após 1 leitura, um aluno explica o gabarito a um colega? (sim/não + trecho)
3. Julgar gesture_g2: o gesto do ramo é óbvio no preview / estrutura JSON? (sim/não)
4. Escrever artifacts/anchor-reviewer-b-<slug>.json:

{
  "teach_once": { "pass": true, "evidence": "…", "reviewer": "agent:reviewer-b" },
  "gesture_g2": { "pass": true, "evidence": "…", "reviewer": "agent:reviewer-b" }
}

5. Pedir ao Writer/ops: npm run audit:anchor-100 -- --file=… --reviewer-file=… --sign-agent
   (ou --sign-human= se risk alto)
```

---

## Relação com L6

| Ferramenta | Quando |
|------------|--------|
| `audit:anchor-100` | Elevação de âncoras da **base** (`examples/`) — pré-lote |
| `audit:anchor-review` + L6 | Segundo par de olhos na âncora do **lote gNN** pré-promote |

Não substituem um ao outro.
