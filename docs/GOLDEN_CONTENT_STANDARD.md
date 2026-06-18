# GOLDEN Content Standard v1

Padrão canônico de **conteúdo pedagógico** para goldens (`examples/questao-premium-*.json`) e alinhamento dos **builders** em escala.

**Complementa (não substitui):**
- [`PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md`](PLAYBOOK_ESTUDO_REVERSO_PREMIUM.md) — famílias e anti-repetição
- [`PACOTE_PREMIUM_CHECKLIST.md`](PACOTE_PREMIUM_CHECKLIST.md) — moldes, builder, migração
- [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md) — visual automático por subtópico

**Implementação:** [`lib/goldenContentStandard.ts`](../lib/goldenContentStandard.ts) · [`lib/guidelines/`](../lib/guidelines/) · gate [`__tests__/golden-content-standard.test.ts`](../__tests__/golden-content-standard.test.ts)

---

## 1. North star

| Princípio | Regra |
|-----------|--------|
| Objetivo | Aluno **entender esta questão** e **não errar similares** em concurso |
| Prova primeiro | `question_data` = caderno fiel; cola didática **só** nos slides |
| Estrutura fixa | 4 slides (`concept_map` → `golden_rule` → `logic_flow` → `danger_zone`) |
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
| COMBINAÇÃO/GABARITO | Conjunto → letra |
| PEGADINHA-ÂNCORA | Erro que a banca induz **aqui** |
| PADRÃO DA BANCA (opcional) | Como esta banca costuma cobrar o tema |

Mínimo: **3** `items` com `label`, `detail`, `icon` Lucide.

### `golden_rule`

| Slot | Função |
|------|--------|
| REGRA-TÍTULO | `content` — mnemônico / título |
| REFERÊNCIA (rows) | Tabela decorável (rótulo × valor oficial) |
| LINHA-GABARITO | Última row com letra correta |

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
| Por DISTRATOR | 1 item por letra errada **desta prova** (quando houver) |
| CONFUSÃO DO TEMA | 2–4 pegadinhas que se repetem no **mesmo assunto** |

Obrigatório: `content`, cada item com `label`, `detail`, **`correct`**.

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

Detalhe por família: Playbook §3.

---

## 7. Anti-monotonia (obrigatório)

1. **Especificidade** — slides devem citar letra, romano I–IV ou termo do enunciado (lint `specificity`).
2. **Frases banidas** — mesmo conjunto de `GOLDEN_BANNED_PHRASES` + anti-stub (`premium-no-stub`).
3. **Função ≠ frase** — repetir o *tipo* de slot é OK; copiar o *mesmo texto* entre questões não.
4. **Visual** — subtópico + molde bespoke variam a experiência (independente deste doc).

---

## 8. Builders (escala)

| Aspecto | Golden manual | Builder |
|---------|---------------|---------|
| Gramática de slots | 100% | 100% |
| Fontes | `meta.sources[]` por revisão | Só `lib/guidelines/*` versionado |
| Especificidade | Total | Alternativas/romanos reais; 0 stub |
| `content_standard` | `golden-v1` no meta | **Não** obrigatório no v1 |
| Revisão | Item a item | Amostra ~5% + gates Zod/anti-stub |

Builders **não inventam** número normativo — consultam `GUIDELINE_TABLES` em [`lib/guidelines/index.ts`](../lib/guidelines/index.ts).

---

## 9. Gates de publicação

| Gate | O quê |
|------|--------|
| `QuestaoCompletaSchema` | Forma, limites, ícones |
| `premium-no-stub` | Sem hybrid genérico |
| `lintGoldenContent` | Quando `content_standard: golden-v1` |
| Revisão humana | Fonte + vigência assinada em `content_review` |

```bash
npm test -- __tests__/golden-content-standard.test.ts
```

---

## 10. Rollout

1. Novos goldens: copiar `_TEMPLATE-golden-v1.json`, preencher, validar no Laboratório.
2. Goldens legados: adicionar `content_standard` gradualmente (não bloqueia catálogo).
3. Builders: alinhar saída à gramática de slots; números só de `lib/guidelines/`.
4. Por subtópico: 1 golden por **ramo forte** (V/F, CE, interpretação…) — ver PACOTE_PREMIUM Fase 0.

---

## Referências cruzadas

- [`examples/questao-premium-cpcon-imunizacao-intervalos-vf.json`](../examples/questao-premium-cpcon-imunizacao-intervalos-vf.json) — piloto GOLDEN v1 completo
- [`lib/validations.ts`](../lib/validations.ts) — `ContentSourceSchema`, `ContentReviewSchema`
- [`.cursor/rules/avant-agent-json.mdc`](../.cursor/rules/avant-agent-json.mdc) — JSON para agentes
