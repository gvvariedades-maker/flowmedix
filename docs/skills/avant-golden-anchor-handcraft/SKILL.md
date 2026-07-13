---
name: avant-golden-anchor-handcraft
description: Ponte family → âncora golden → slots por slide para handcraft golden-v1/v2 no AVANT. Use SEMPRE ao escrever ou editar reverse_study_slides de uma questão (handcraft, lote gNN, reparo por slug, âncora nova). Classifica a família de prova, abre a âncora de referência da gramática, escreve o logic_flow primeiro e preenche cada slide com sua função única (sem spoiler, com transferência e fixação portátil). Encadeia a persona professor-para-concurso para o tom.
---

> **Cópia versionada** para edição no explorador. Runtime do agente: `.cursor/skills/avant-golden-anchor-handcraft/SKILL.md` (pasta `.cursor/` está no `.gitignore` e pode ficar oculta no IDE).

# Âncora-Handcraft — family → âncora → slots

Objetivo: cada slide vira **uma fala de professor** com função única — não "preencher schema".
Complementa (não substitui): skill `avant-json-template` (forma/L3) e `professor-para-concurso` (tom).

> Trilho único: handcraft golden-v1 por slug. **Proibido** `ai:generate` / `catalog:upgrade-premium`.
> Fonte de verdade de conteúdo: `docs/GOLDEN_CONTENT_STANDARD.md`. Contrato de escrita: `lib/questaoSpec/validateQuestaoForWrite.ts`.

---

## 0. Ativação e ordem de trabalho

Ative junto com `professor-para-concurso` (tom) e `avant-json-template` (forma).

Fluxo fixo por questão:

1. **Classificar família** (§1) a partir do `instruction` + `options`.
2. **Abrir a âncora** da família/ramo (§2) — ler os 4 slides dela como gramática, não como texto a copiar.
3. **Escrever `logic_flow` PRIMEIRO** (§3) — é o esqueleto do raciocínio.
4. Preencher `concept_map`, `golden_rule`, `danger_zone` (§3) sem repetir o eixo do fluxo.
5. **Autoauditar** (§5) → `audit:questao-readiness --strict-v2-pedagogy`.

Regra de ouro (herdada do professor): *após ler uma vez, o aluno explica o gabarito para um colega.*

> **Nota:** `logic_flow` primeiro é regra de **autoria**. No JSON, a ordem de render continua v2 (`concept_map` → `logic_flow` → `golden_rule` → `danger_zone`); o player reordena por `type`.

---

## 1. Classificar a família de prova

| `meta.family` | Gatilho no enunciado |
|---------------|----------------------|
| `vf` | I, II, III + "É correto o que se afirma em" |
| `certo_errado` | 2 opções Certo/Errado, ou EXCETO/INCORRETA com afirmativas |
| `protocolo` | sequência de conduta, números (RCP 30:2, SpO₂, doses, tempo) |
| `calc` | conta: mL, gts/min, regra de três, diluição |
| `legis` | lei, artigo, COFEN, 8.080/7.498, "de acordo com" |
| `conceito` | "assinale a correta sobre…", definição/comparação |
| `text_fragment` | caso clínico literal do caderno (>80 chars de base) |

Referência de código: `classifyFamily()` e `FAMILY_GOLDEN_FILE` em `lib/catalogMigration/classifyFamily.ts`.

---

## 2. Matriz family → âncora (copie a GRAMÁTICA, nunca o texto)

Abra a âncora do ramo, entenda **como** ela ensina, e escreva conteúdo bespoke DA SUA questão.

| Família / recorte | Âncora de referência (`examples/`) | O que imitar |
|-------------------|-------------------------------------|--------------|
| `vf` (afirmativas I–IV) | `questao-premium-cpcon-vias-im-vf.json` | julgar item a item; combinação só no fluxo |
| `vf` (intervalos/normas PNI) | `questao-premium-cpcon-imunizacao-intervalos-vf.json` | pegadinha-âncora nomeada; padrão da banca |
| `certo_errado` (C/E) | `questao-premium-cpcon-poliomielite-pfa-vf.json` | critério + faixa oficial |
| `certo_errado` / **EXCETO / INCORRETA** | `questao-premium-cetrede-vias-injetaveis-incorreta.json` · `questao-premium-idib-umirim-itu-cateter-exceto.json` · `questao-premium-agirh-imunizacao-incorreta-antibiotico.json` | distratores = por que é CORRETO; só o gabarito = a exceção |
| `protocolo` (parâmetros) | `questao-premium-urgencias-rcp.json` · `questao-premium-cpcon-urgencias-anafilaxia-epinefrina-im.json` | `rows` com números + fonte; pegadinha de inversão |
| `calc` | `questao-premium-idecan-calculo-equivalencias-gotas.json` | dados → fórmula → resultado; unidade |
| `legis` | `questao-premium-sus-lei-8080-cesgranrio.json` | lei/artigo; direito × dever × proibição |
| `conceito` | `questao-premium-fundatec-meningococica-3meses.json` · `questao-premium-consulpam-vias-absorcao-oral.json` | 3–6 conceitos; exclusão por termo-chave |
| `text_fragment` | `questao-premium-fepese-anotacao-enfermagem-sae.json` | ler caso → decisão ancorada no fragmento |

Se o subtópico tiver `*-golden-anchors.json` no registry, ele **vence** esta tabela (âncora por ramo local).

---

## 3. Contrato por slide (uma pergunta cada)

### `logic_flow` — "Como decido?" (escrever PRIMEIRO)

- `reveal_mode: "tap"`, ≥4 steps de **decisão** (não paráfrase de alternativa).
- Ordem: identificar formato → julgar item/letra a letra → montar → localizar letra → **eliminar por letra** → **fixação portátil**.
- **Último step = fixação transferível:** "Em similares: <regra do tema>".
- Nunca copiar ≥8 palavras contíguas de uma `option` (gate `logic_flow_recycled`).

### `concept_map` — "Qual o terreno?"

- 3–6 `items` (`label`, `detail`, `icon` Lucide distinto e semântico).
- 1 item = **pegadinha-âncora** (o erro que a banca induz), **sem revelar letra**.
- **Proibido:** "gabarito", "letra X", "combinação correta = …".

### `golden_rule` — "O que decoro?"

- Preferir `rows[]` (rótulo × valor oficial); `content` = mnemônico/título curto.
- Cada número com fonte em `meta.sources[].covers`.
- **Proibido:** row "Gabarito letra X" (fica no fluxo); resumir o que já está no concept_map.

### `danger_zone` — "Onde caio na próxima?"

- 1 item por letra errada desta prova + **≥1 item de transferência** ("em outra banca trocam X por Y").
- Cada `items[].correct` **único** e ligado à alternativa daquele card.
- EXCETO/INCORRETA: distrator = por que é conduta correta; só o gabarito = a exceção.

---

## 4. Meta obrigatória (golden-v1/v2)

```jsonc
"meta": {
  "subtopico": "<canônico — CLAUDE.md §9>",
  "content_standard": "golden-v1",     // ou "golden-v2" quando aplicável
  "family": "<§1>",
  "pedagogical_branch": "<ramo se subtópico em BRANCH_DESIGN_MAP>",
  "content_review": { "reviewed_at": "AAAA-MM-DD", "guideline_snapshot": "<fonte+ano>", "exam_vs_current": "none" },
  "sources": [ { "id": "...", "tier": "A", "issuer": "...", "title": "...", "year": 2025, "covers": ["dose", "via", "..."] } ]
}
```

Números normativos exigem `sources[].covers` — senão o risco sobe (ver `docs/DECISAO_AUTO_APROVACAO_RISCO.md`).
Não enviar `template` / `layout_variant` — o app resolve por subtópico/ramo.

---

## 5. Autoauditar antes de entregar

```bash
npm run audit:questao-readiness -- --file=<caminho> --strict-v2-pedagogy
```

Critério: `[READY]` + `ready_100: true`. O relatório também traz `risk` (baixo/medio/alto):

- `alto` (dose/conduta/protocolo/divergência) → **exige revisão humana** (`meta.efficacy_contract.a4_reviewer` humano).
- `baixo`/`medio` → agente pode fechar A4 (`a4_reviewer: "agent:golden-v2"`).

Ver `lib/catalogMigration/riskScoring.ts`.

---

## 6. Anti-padrões (rejeitar e reescrever)

- Slide que serve para qualquer questão da família (genérico) → reescrever com vocabulário DESTA prova.
- Gabarito/letra no `concept_map` ou `golden_rule` → spoiler (v2 error).
- `logic_flow` que lista as alternativas em vez de ensinar estratégia.
- `danger_zone` sem transferência ou com `correct` repetido.
- EXCETO derivado do texto do gabarito em todas as letras.
- Molde/vocabulário de outro ramo sem âncora no enunciado (drift).

---

## 7. Referências

- `docs/GOLDEN_CONTENT_STANDARD.md` — slots, fontes, lint golden-v1
- `docs/PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md` §3 — famílias
- `.cursor/skills/professor-para-concurso/SKILL.md` — tom e método em camadas
- `.cursor/skills/avant-json-template/SKILL.md` — forma, L3, cabeçalho
- `lib/catalogMigration/classifyFamily.ts` — `FAMILY_GOLDEN_FILE`
- `data/catalog-migration/*-golden-anchors.json` — âncoras por ramo
