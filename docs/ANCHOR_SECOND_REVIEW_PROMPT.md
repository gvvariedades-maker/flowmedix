# Segundo par de olhos — âncora do lote (L6)

Revisão obrigatória do `anchor_slug` de cada lote `g*` antes de promover o subtópico a `production_ready`.

Relacionado: [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md) · [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md)

---

## 1. Quando rodar

Após apply do lote e PASS em L1 (preflight + handcraft-dod no subtópico):

```bash
npm run audit:anchor-review -- --lote=<pacote>-gNN
```

O script:
1. Roda readiness + alignment + numeric (strict) no `anchor_slug`
2. Gera captures (`capture:questao-review`)
3. Emite checklist JSON em `artifacts/anchor-review/<lote>.json`

---

## 2. Campo em `lote-meta.json`

```json
"anchor_second_review": {
  "reviewed_at": null,
  "reviewer": null,
  "method": null,
  "status": "pending",
  "artifact": "artifacts/anchor-review/<lote>.json"
}
```

| `status` | Significado |
|----------|-------------|
| `pending` | Ainda não revisado |
| `pass` | Revisor B (e C se necessário) aprovou |
| `fail` | Bloqueia promoção; exige correção + nova revisão |

| `method` | `agent` \| `human` \| `both` |

**Gate:** subtópico não promove a `production_ready` se algum lote `g*` tiver `status !== "pass"`.

---

## 3. Revisores

| Papel | Quem | Obrigatório quando |
|-------|------|-------------------|
| **Revisor B** | Agente Cursor (prompt §5) | Sempre |
| **Revisor C** | Humano (~5 min player ou PNGs) | `fail` do agente **ou** subtópico flagship (CME, Saúde Mental, Sinais Vitais quando fechados) |

Default do programa: **agente primeiro**; humano confirma exceções.

---

## 4. Checklist — 15 itens

Preencher `true` / `false` + nota curta se `false`.

| # | Item | Critério |
|---|------|----------|
| 1 | **Enunciado fiel** | Slides não contradizem o enunciado nem omitem condição do comando (EXCETO, I/II/III, etc.) |
| 2 | **Gabarito explícito** | Alternativa correta identificável; `danger_zone` coerente com a letra certa |
| 3 | **Sem reciclagem** | `logic_flow` e `danger_zone` específicos desta prova (não texto de outro slug) |
| 4 | **danger_zone semântico** | Cada `items[].correct` distinto; distrator explica **por que é errado aqui** |
| 5 | **EXCETO/INCORRETA** | Só o card do gabarito aponta exceção; demais letras = conduta correta |
| 6 | **Termos do enunciado** | Vocabulário-chave do enunciado aparece nos slides |
| 7 | **Sem drift de tema** | Sem vocabulário de outro ramo (ex.: IPCS/CVC sem ancoragem no enunciado) |
| 8 | **golden_rule útil** | Tabela `rows` ou mnemônico aplicável à decisão da questão |
| 9 | **concept_map ≥3** | Itens com ícones Lucide válidos e detalhe específico |
| 10 | **logic_flow tap** | `reveal_mode: "tap"`; passos em ordem decisória (não lista de alternativas) |
| 11 | **Fontes plausíveis** | `sources[]` tier A/B coerentes com claims numéricos ou normativos |
| 12 | **family + branch** | `meta.family` e `meta.pedagogical_branch` (se houver) alinhados ao tipo da prova |
| 13 | **Cabeçalho meta** | `subtopico` canônico; sem duplicar banca/ano no `instruction` |
| 14 | **Visual OK** | Captures legíveis (desktop); sem overflow óbvio; chip/título coerentes |
| 15 | **Experiência piloto** | Fluxo enunciado → resposta → 4 slides sem fricção (tap avança, feedback claro) |

**Pass:** 15/15 ou 14/15 com única falha **cosmética** documentada (ex.: ícone subótimo) e sem impacto pedagógico.

**Fail:** qualquer falha em itens 1–7, 11 ou gabarito (item 2).

---

## 5. Prompt — Revisor B (agente)

Copiar em conversa Cursor nova. Anexar `artifacts/anchor-review/<lote>.json` e pasta `artifacts/questao-review/<anchor_slug>/`.

```text
Revisor B — âncora handcraft golden-v1 (L6)

Contexto: segundo par de olhos na questão âncora do lote <LOTE>.
Subtópico: <SUBTOPICO_CANONICO>
Anchor slug: <ANCHOR_SLUG>

Artefatos:
- artifacts/anchor-review/<lote>.json (audits L1/L2/L2b)
- artifacts/questao-review/<anchor_slug>/*.png (captures)
- data/catalog-migration/<lote>/questions/<anchor_slug>.json (se source=local)

Tarefa:
1. Ler o JSON da âncora e os captures.
2. Aplicar o checklist de 15 itens em docs/ANCHOR_SECOND_REVIEW_PROMPT.md §4.
3. Para cada item: pass | fail + evidência (1 frase).
4. Veredito final: pass | fail
5. Se fail: listar correções mínimas (arquivo + campo + texto sugerido).

Regras:
- Gabarito da prova prevalece nos slides (mesmo se guideline atual divergir — checar exam_vs_current).
- Não aprovar danger_zone com mesma justificativa em duas letras.
- Não aprovar logic_flow que só repete alternativas A–E.
- Cosmética pura não é fail se itens 1–7 e 11 passam.

Output JSON (gravar em artifacts/anchor-review/<lote>.json → checklist_results):

{
  "lote": "<lote>",
  "anchor_slug": "<anchor_slug>",
  "reviewer": "agent",
  "reviewed_at": "YYYY-MM-DD",
  "verdict": "pass|fail",
  "items": [
    { "id": 1, "pass": true, "note": "" }
  ],
  "blockers": [],
  "suggested_fixes": []
}
```

Após o agente, atualizar `lote-meta.json`:

```json
"anchor_second_review": {
  "reviewed_at": "2026-06-29",
  "reviewer": "agent:<session>",
  "method": "agent",
  "status": "pass",
  "artifact": "artifacts/anchor-review/cme-g01.json"
}
```

Se `fail`: corrigir JSON da âncora (e slugs irmãos se o erro for sistêmico), re-rodar preflight + apply + `audit:anchor-review`.

---

## 6. Revisor C (humano) — roteiro 5 min

1. Abrir `/estudar/<anchor_slug>` ou PNG `01-enunciado` … `06-slide4`.
2. Responder a questão de olho no gabarito conhecido.
3. Percorrer os 4 slides em modo tap.
4. Confirmar itens 1, 2, 4, 14, 15 do checklist.
5. Assinar no artifact: `"method": "both"`, `"reviewer": "agent:…; human:iniciais"`.

---

## 7. Integração com qualidade do pacote

`audit:subtopico-quality` verifica todos os lotes do `pacote_prefix`:

- Lista `data/catalog-migration/<prefix>-g*/lote-meta.json`
- Falha se qualquer `anchor_second_review.status !== "pass"`
- Emite blocker: `anchor_review_pending:<lote>`
