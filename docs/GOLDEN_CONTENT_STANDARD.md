# GOLDEN Content Standard v1

Padrão canônico de **conteúdo pedagógico** para handcraft golden-v1 (`examples/` e `data/catalog-migration/`).

**Complementa (não substitui):**
- [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md) — decisão de produto
- [`PREMIUM_QUESTAO.md`](PREMIUM_QUESTAO.md) — definição canônica L1/L2/L3
- [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md) — famílias e anti-repetição
- [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md) — runbook operacional handcraft
- [`GOLDEN_ROLLOUT_CATALOGO.md`](GOLDEN_ROLLOUT_CATALOGO.md) — programa catálogo inteiro
- [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md) — visual automático por subtópico

**Implementação:** [`lib/goldenContentStandard.ts`](../lib/goldenContentStandard.ts) · [`lib/guidelines/`](../lib/guidelines/) · gate [`__tests__/golden-content-standard.test.ts`](../__tests__/golden-content-standard.test.ts)

> **Agente (handcraft / âncora):** este arquivo é o **contrato** do que conta como conteúdo alto nível (slots, fontes, lints). **Não** é o manual completo de autoria.
>
> 1. Classificar família → [`.cursor/skills/avant-classify-family/SKILL.md`](../.cursor/skills/avant-classify-family/SKILL.md)
> 2. Escrever slides → [`.cursor/skills/avant-golden-anchor-handcraft/SKILL.md`](../.cursor/skills/avant-golden-anchor-handcraft/SKILL.md) (`logic_flow` primeiro; HARD FAIL + checklist 10/10)
> 3. Forma / L3 → [`.cursor/skills/avant-json-template/SKILL.md`](../.cursor/skills/avant-json-template/SKILL.md)
> 4. Gate de ship → `npm run audit:questao-readiness -- --file=<path> --strict-v2-pedagogy` → `[READY]`
>
> **Barra 10/10 ≠ mínimo do lint.** Passar em `lintGoldenContent` (ex.: metade dos distratores em `conceito`/`legis`) **não** fecha handcraft novo. Exija cobertura completa de letras erradas + transferência + fixação portátil (skill §3 / strict-v2). Não altere `content_standard` para `"golden-v2"` — v2 é só o write-spec em §11.

---

## 1. North star

| Princípio | Regra |
|-----------|--------|
| Objetivo | Aluno **entender esta questão** e **não errar similares** em concurso |
| Prova primeiro | `question_data` = caderno fiel; cola didática **só** nos slides |
| Estrutura fixa | 4 slides (`concept_map` → `logic_flow` → `golden_rule` → `danger_zone`) — ordem canônica v2 |
| Conteúdo variável | Texto **específico** da questão — nunca frase copiável entre questões |
| Fontes | Afirmações normativas/numéricas críticas com base **oficial e vigente** |
| Metadados internos | `sources`, `content_review` em `meta` — **não** renderizados no player |

---

## 2. Três eixos independentes

| Eixo | Controla | Onde |
|------|----------|------|
| **Subtópico** (41) | Visual (cor, molde bespoke) | `meta.subtopico` → `SUBTOPIC_DESIGN_MAP` |
| **Família** (6+1) | Gramática de slots do conteúdo | `meta.family` + Playbook §3 |
| **Fonte** (tier A/B) | Veracidade e vigência | `meta.sources` + `lib/guidelines/` |

---

## 3. Ativação no JSON

Declare no `meta` da questão:

```json
"content_standard": "golden-v1",
"family": "vf",
"content_review": {
  "reviewed_at": "2026-06-18",
  "guideline_snapshot": "PNI 2025",
  "exam_vs_current": "none"
},
"sources": [
  {
    "id": "pni-2025-intervalos",
    "tier": "A",
    "issuer": "Ministério da Saúde",
    "title": "Manual de Vacinação — intervalos",
    "year": 2025,
    "url": "https://www.gov.br/saude/..."
  }
]
```

Questões **sem** `content_standard` permanecem válidas (retrocompatível). O lint só exige o pacote completo quando `content_standard === "golden-v1"`.

**Template:** [`examples/_TEMPLATE-golden-v1.json`](../examples/_TEMPLATE-golden-v1.json)  
**Piloto:** [`examples/questao-premium-cpcon-imunizacao-intervalos-vf.json`](../examples/questao-premium-cpcon-imunizacao-intervalos-vf.json)

---

## 4. Política de fontes

| Tier | Aceito | Exemplos |
|------|--------|----------|
| **A** | Governo / norma legal | MS/PNI, COFEN, Anvisa/RDC, leis 8.080/8.142, Cadernos AB |
| **B** | Sociedade quando a prova cobra | SBC, SBIM, ILCOR (RCP) — não contradizer tier A |

**Proibido:** blog, cursinho, “segundo especialistas”, valor sem `source_id` (golden) ou sem entrada em `lib/guidelines/` (builder).

### Conflito prova × guideline atual

- Slides ensinam **o que marcar** (gabarito da questão).
- `content_review.exam_vs_current`: `"none"` ou texto curto interno (ex.: `"prova 2018 usa X; PNI 2025: Y"`).
- Opcional no `footer_rule` visível: nota de divergência **quando mapeada** no builder.

---

## 5. Gramática de slots (todos os subtópicos)

Cada slide preenche **funções**, não texto livre:

### `concept_map`

| Slot | Função |
|------|--------|
| ENQUADRAMENTO | O que esta questão testa |
| NÚCLEO (1–n) | Afirmativas, parâmetros, conceitos do caso |
| PEGADINHA-ÂNCORA | Erro que a banca induz **aqui** (sem revelar letra) |
| PADRÃO DA BANCA (opcional) | Como esta banca costuma cobrar o tema |

> **v2:** COMBINAÇÃO/GABARITO (letra) **não** fica no `concept_map` — só no `logic_flow`.

Mínimo: **3** `items` com `label`, `detail`, `icon` Lucide.

### `golden_rule`

| Slot | Função |
|------|--------|
| REGRA-TÍTULO | `content` — mnemônico / título |
| REFERÊNCIA (rows) | Tabela decorável (rótulo × valor oficial) |

> **v2 (padrão):** **sem** row "Gabarito letra X" / "Combinação" — gabarito fica no `logic_flow`. Lint: `golden_rule_gabarito_spoiler` (error com `--strict-v2-pedagogy`).

**Exceção — Sinais Vitais (`vitals-reference-board`):** row `Gabarito`/`Conclusão` com `sv_kind: "meta"`; C/E com máx. 4 rows — lint em [`lib/slides/vitalsGoldenLint.ts`](../lib/slides/vitalsGoldenLint.ts).

### `logic_flow`

| Slot | Função |
|------|--------|
| IDENTIFICAR FORMATO | Tipo de questão (V/F, CE, cálculo…) |
| PROCESSAR (1–n) | Um passo por afirmativa / etapa / dado |
| MONTAR | Resposta combinada |
| LOCALIZAR | Letra correta |
| ELIMINAR | Distratores **por letra** |
| FIXAÇÃO | Regra reproduzível para similares |

Obrigatório: `reveal_mode: "tap"`, ≥3 `steps` (strings).

### `danger_zone`

| Slot | Função |
|------|--------|
| Por DISTRATOR | **1 item por cada letra errada** desta prova (barra handcraft 10/10) |
| TRANSFERÊNCIA | ≥1 item “Em outra banca…” / “Se o comando mudar…” (separado) |
| CONFUSÃO DO TEMA | pegadinhas que se repetem no **mesmo assunto** |

Obrigatório: `content`, cada item com `label`, `detail`, **`correct`** (únicos entre itens).

> **Barra 10/10 (autoria) ≠ gate mínimo (lint).**  
> - **Ship handcraft:** 1 item por **cada** letra errada + ≥1 transferência separada (skill `avant-golden-anchor-handcraft`).  
> - **Lint `danger_distractors_coverage`:** hoje só exige **metade** em `conceito`/`legis` (VF por romanos). Fechar no mínimo do lint = conteúdo incompleto.  
> - Com `--strict-v2-pedagogy`: `danger_zone_letter_coverage` + `danger_zone_transfer_missing` elevam a barra automática — use sempre em handcraft novo.

### 5c. Recortes de comando: EXCETO e VF

Comandos que mudam a **gramática** dos slides (não só `meta.family`):

#### EXCETO / INCORRETA / INCORRETO

- `meta.family` costuma ser `certo_errado`, mas o formato é **MCQ A–E com uma exceção**.
- **`logic_flow`:** identificar o comando → tratar cada distrator como conduta **correta** → isolar a única incorreta.
- **`danger_zone`:** em cada letra **errada** (distrator), `correct` explica por que aquela alternativa é **certa** na prática; só o card do **gabarito** aponta a falha.
- **Proibido:** frase-coringa (“errado porque não é a exceção”) ou mesmo `correct` em todos os distratores.

#### VF (afirmativas I–IV)

- Julgar **cada romano** no `logic_flow` e no `concept_map` (1 item por afirmativa quando couber).
- **Combinar** só depois de I→II→III→IV; letra correta no fluxo.
- **`danger_zone`:** combinações erradas frequentes + transferência — **não** forçar cards “Letra B/C/D” se a prova é por itens I–IV.
- Lint `danger_distractors_coverage` em VF checa **afirmativas**, não letras A–E.

**Exemplos mini (estrutura, não copiar texto):** [`reference-exemplos.md`](../docs/skills/avant-golden-anchor-handcraft/reference-exemplos.md).

### Densidade de card (UI)

Alvo de autoria (player / estudo reverso). Tabela **resumida** aqui; limites por campo (incl. `label`, `correct`, steps) na skill `avant-golden-anchor-handcraft` (seção Densidade) — prevalece a skill em caso de divergência.

| Campo | Alvo | Duro |
|-------|------|------|
| `detail` / `steps[]` / `rows[].value` | ≤110 chars | ≤140 |
| `footer_rule` | ≤90 chars | ≤120 |

1 ideia por string; preferir conduta portátil a “decorar letra”. Limites **duros** viram `card_density_*` com `--strict-v2-pedagogy`.

---

## 6. Família × slots (resumo)

| `meta.family` | Núcleo do `concept_map` | `logic_flow` foco |
|---------------|-------------------------|-------------------|
| `vf` | 1 item por afirmativa I–IV | Julgar I→…→IV → combinar |
| `certo_errado` | critério + faixa oficial | Parâmetro → norma → C/E |
| `protocolo` | etapas + números | Sequência como a banca ordena |
| `calc` | fórmula + unidades | Dados → conta → unidade |
| `legis` | lei + artigo + termos | Lei → artigo → testar letras |
| `conceito` | 3–6 conceitos | Exclusão por termo-chave |
| `text_fragment` | caso + dados do fragmento | Ler caso → decisão |

**Exemplos mini por recorte (VF + EXCETO):** [`reference-exemplos.md`](../docs/skills/avant-golden-anchor-handcraft/reference-exemplos.md).  
Detalhe por família: [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md) §3.

---

## 7. Anti-monotonia (obrigatório)

1. **Especificidade** — slides devem citar letra, romano I–IV ou termo do enunciado (lint `specificity`).
2. **Frases banidas** — mesmo conjunto de `GOLDEN_BANNED_PHRASES` + anti-stub (`premium-no-stub`).
3. **Função ≠ frase** — repetir o *tipo* de slot é OK; copiar o *mesmo texto* entre questões não.
4. **Visual** — subtópico + molde bespoke variam a experiência (independente deste doc).

---

## 7b. Corretude (lint reforçado)

Além da estrutura, o lint golden-v1 verifica **corretude pedagógica** — defeitos que passam no Zod mas ensinam errado:

| Regra | Código | O que reprova |
|-------|--------|---------------|
| **Consistência de gabarito** | `gabarito_mismatch` | Letra de gabarito citada nos slides (`danger_zone.correct` "Gabarito letra X", `golden_rule.rows` / `concept_map.items` com label de gabarito/combinação) **diferente** da `is_correct`. Evita o pior defeito: ensinar o gabarito errado. |
| **Anti-reciclagem de `logic_flow`** | `logic_flow_recycled` | `logic_flow` que **lista as alternativas** em vez de ensinar a estratégia — reprova quando a maioria dos `steps` copia ≥8 palavras contíguas do texto de uma `option`. |
| **Especificidade semântica** | `specificity_semantic` | Slides citam menos de **3 termos** do vocabulário da questão (enunciado **+ alternativa correta**). Mata o "genérico que ecoa 1 palavra". Limiar adaptativo para enunciados curtos. |
| **Cobertura de distratores** | `danger_distractors_coverage` | Em `conceito`/`legis`, menos da **metade** das letras erradas é ensinada. (Em `vf` a checagem é por afirmativa I–IV, não por letra.) |
| **Claim↔source binding** | `numeric_claim_unsourced` | Slides afirmam número normativo (dose/intervalo/%/escore) sem ao menos uma `source` substantiva (com `covers`). Vincula o número a uma fonte — não verifica veracidade. |
| **Pedagogia v2 (opt-in strict)** | `slide_layer_redundancy_*`, `golden_rule_gabarito_spoiler`, `card_density_*`, `danger_zone_letter_coverage`, `danger_zone_transfer_missing`, `logic_flow_fixation_missing` | Redundância entre camadas; spoiler no `golden_rule`; densidade §3b (limites duros); cobertura completa de letras no `danger_zone` compare + transferência; fixação portátil no último step MCQ — **error** com `audit:questao-readiness --strict-v2-pedagogy`. |

A extração de gabarito lê **campos estruturados** (não JSON concatenado), evitando que o `"…gabarito."` de um item case com o `"Letra X"` do distrator seguinte. A especificidade e o claim‑source leem apenas os **valores string** dos slides (ignoram chaves do JSON). Implementação: `lintGabaritoConsistency`, `lintLogicFlowRecycling`, `lintClaimSourceBinding` + checagens em `lintSlidePackage` ([`lib/goldenContentStandard.ts`](../lib/goldenContentStandard.ts)).

> **Limite honesto:** o lint cobre o **automatizável** (gabarito, reciclagem, estrutura, fontes, frases). **Corretude clínica factual** (o número/conduta estar certo) continua exigindo revisão humana + fonte tier A/B — nenhum gate substitui isso.

---

## 7c. Figuras no enunciado

Quando o caderno traz tirinha, charge, cartaz ou figura tipográfica:

| Caminho | JSON | Gate |
|---------|------|------|
| **Raster** | `figure_policy: "required"` + `figures[]` (WebP, bucket `questao-figures`) | `l2_missing_figure` se URL inválida |
| **Transcrição** | `figure_policy: "transcribed"` + `text_fragment` fiel (≥20 chars) | `l2_missing_figure` se fragmento vazio |
| **Sem visual** | Omitir `figure_policy` | — |

- **Proibido:** publicar “figura/tirinha acima” sem asset nem transcrição.
- **Player:** `figures[]` → `text_fragment` → `instruction` (não misturar figura em `text_fragment` como `<img>`).
- CLI: `npm run figures:upload`, `figures:audit`.
- ADR: [`DECISAO_QUESTAO_FIGURES.md`](DECISAO_QUESTAO_FIGURES.md).

---

## 8. Legado (builder)

Produção atual = **handcraft golden-v1 por slug** — ver [`DECISAO_TRILHO_A_UNICO.md`](DECISAO_TRILHO_A_UNICO.md) e runbook [`GOLDEN_HANDCRAFT_MODEL.md`](GOLDEN_HANDCRAFT_MODEL.md). Builder/hybrid (`catalog:upgrade-premium`, `ai:generate`) **não** entram em conteúdo novo; subtópicos legados exigem re-handcraft. Handcraft **não inventa** número normativo — exige `meta.sources` tier A/B com `covers` adequado.

---

## 9. Gates de publicação

### Ship handcraft novo (obrigatório)

```bash
npm run audit:questao-readiness -- --file=<path> --strict-v2-pedagogy
```

Critério: **`[READY]`** + `ready_100: true`. Este é o gate de **conteúdo pedagógico** para handcraft e âncoras novas.

### Camadas (ordem)

| Camada | Gate | Bloqueia ship? |
|--------|------|----------------|
| L1 forma | `QuestaoCompletaSchema` | Sim |
| L1 premium | `premium-no-stub` / `premiumGate` | Sim (Laboratório / apply) |
| L2 conteúdo (base) | `lintGoldenContent` | Avisos por padrão; não substitui strict-v2 |
| **L2 conteúdo (ship)** | `audit:questao-readiness --strict-v2-pedagogy` | **Sim** — eleva §7b a **error** |
| SV bespoke | `lintVitalsGoldenContent` | Sim quando molde SV |
| Revisão humana | `content_review` + A4 se `risk: alto` | Sim em dose/conduta/divergência |

### Lint base vs strict-v2 (resumo)

| Regra | Só `lintGoldenContent` | Com `--strict-v2-pedagogy` |
|-------|------------------------|----------------------------|
| `danger_distractors_coverage` | Metade das letras (`conceito`/`legis`) | + cobertura completa (`danger_zone_letter_coverage`) |
| Transferência no `danger_zone` | Não exige | `danger_zone_transfer_missing` → error |
| Fixação portátil (`Em similares:`) | Não exige | `logic_flow_fixation_missing` → error |
| Spoiler no `golden_rule` | Warn | `golden_rule_gabarito_spoiler` → error |
| Densidade §5 | Soft | `card_density_*` → error (limites duros) |

Tabela completa lint vs humano: [`reference-gates.md`](../docs/skills/avant-golden-anchor-handcraft/reference-gates.md).

### Comandos complementares

```bash
npm run validate:goldens -- --lote=<lote> --strict   # lote / examples
npm test -- __tests__/golden-content-standard.test.ts
```

---

## 10. Rollout

1. Novos goldens: copiar `_TEMPLATE-golden-v1.json`, preencher, validar no Laboratório.
2. Goldens legados: adicionar `content_standard` gradualmente (não bloqueia catálogo).
3. Builders: alinhar saída à gramática de slots; números só de `lib/guidelines/`.
4. Por subtópico: 1 golden por **ramo forte** (V/F, CE, interpretação…) — ver PACOTE_PREMIUM Fase 0.

---

## 11. Nota: write-spec `golden-v2` (≠ conteúdo)

**Não confundir** com `meta.content_standard: "golden-v1"` (este doc).

| Camada | O que é |
|--------|---------|
| **golden-v1** | Barra de **conteúdo** pedagógico (família, fontes, slots, lint §7b) |
| **golden-v2** | Pipeline **técnico** de escrita (Zod + premium gate + risk score) — **não** alterar `content_standard` |

Implementação: [`lib/questaoSpec/validateQuestaoForWrite.ts`](../lib/questaoSpec/validateQuestaoForWrite.ts) · risco/A4: [`DECISAO_AUTO_APROVACAO_RISCO.md`](DECISAO_AUTO_APROVACAO_RISCO.md) · testes: [`__tests__/lib/questaoSpec/`](../__tests__/lib/questaoSpec/).

---

## Referências cruzadas

- [`examples/questao-premium-cpcon-imunizacao-intervalos-vf.json`](../examples/questao-premium-cpcon-imunizacao-intervalos-vf.json) — piloto GOLDEN v1 completo
- [`lib/validations.ts`](../lib/validations.ts) — `ContentSourceSchema`, `ContentReviewSchema`
- [`.cursor/rules/avant-agent-json.mdc`](../.cursor/rules/avant-agent-json.mdc) — JSON para agentes
- [`.cursor/skills/avant-golden-anchor-handcraft/SKILL.md`](../.cursor/skills/avant-golden-anchor-handcraft/SKILL.md) — autoria (family → âncora → slots; barra 10/10)
- [`docs/skills/avant-golden-anchor-handcraft/reference-exemplos.md`](../docs/skills/avant-golden-anchor-handcraft/reference-exemplos.md) — mini VF + EXCETO
- [`.cursor/skills/avant-classify-family/SKILL.md`](../.cursor/skills/avant-classify-family/SKILL.md) — funil `meta.family` antes de escrever slides
