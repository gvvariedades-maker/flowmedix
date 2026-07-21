---
name: avant-classify-family
description: >-
  Classifica meta.family (vf|certo_errado|protocolo|calc|legis|conceito|text_fragment)
  a partir de instruction + options + text_fragment. Use no início de handcraft, reparo
  por slug, ou quando o usuário enviar Classify family:. Só decide família; não escreve slides.
---
> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com `npm run sync:skills`. Exceção Elias: versionada direto em `.cursor/skills/professor-elias-santana-metodo/`. Ver `docs/SKILLS_GOVERNANCE.md`.

# Classificar família de prova

**Saída obrigatória (só isto):**

```text
family: <id> — <motivo em ≤12 palavras>
```

Depois: skill `avant-golden-anchor-handcraft` (âncora → slots).
Não classifique `pedagogical_branch` aqui.

**Fonte única (automação + agente):** `classifyFamily()` em `lib/catalogMigration/classifyFamily.ts`. Alterações no funil entram no `.ts` e nesta skill na mesma PR (`docs/SKILLS_GOVERNANCE.md`).

---

## Validar antes de gravar (opcional)

```bash
npm run classify:family -- --file=<path.json>
```

Imprime `family`, golden de referência (`FAMILY_GOLDEN_FILE`) e aviso se `meta.family` declarada divergir do funil.

---

## Entrada

Ler **somente**:

1. `question_data.instruction`
2. `question_data.options` (quantidade + textos)
3. `question_data.text_fragment` (se existir)

Ignorar slides, `subtopico` e `pedagogical_branch`.

---

## Prioridade #1 — text_fragment

Se `text_fragment.trim().length > 80`, a família é **`text_fragment`** — **sempre**, mesmo que o enunciado pareça VF, calc ou protocolo. O funil para no passo 1. Limiar: `TEXT_FRAGMENT_MIN_CHARS` (80) em `classifyFamily.ts`.

---

## Exemplos (funil automático)

| Saída | Por quê |
|-------|---------|
| `family: text_fragment — caso clínico longo no fragment` | fragment > 80 chars |
| `family: vf — I–III com combinação V/F` | I/II/III + "é correto o que se afirma" |
| `family: certo_errado — comando INCORRETA` | EXCETO/INCORRETA vence lei no enunciado |
| `family: legis — lei 8.080 no enunciado` | "De acordo com a Lei nº 8.080…" (sem EXCETO) |
| `family: calc — pedido explícito de conta` | "Calcule quantos mL…" |
| `family: protocolo — parâmetro 30:2 sem conta` | RCP / SpO₂ / bpm sem "calcule" |
| `family: conceito — MCQ genérica` | fallback; I/II/III sem combinação V/F |

Casos-limite completos: `__tests__/lib/catalogMigration/classifyFamily.test.ts`.

---

## Funil (parar no primeiro SIM)

| # | Teste | → `family` |
|---|--------|------------|
| 1 | `text_fragment` trim > 80 chars | `text_fragment` |
| 2 | Romana I–III/IV **com** combinação **ou** ≥3 colunas `( )`/`(__)` com V/F + "sequência correta" / afirmativas | `vf` |
| 3 | Exatamente 2 opções: uma Certo + uma Errado | `certo_errado` |
| 4 | Comando **EXCETO** / **INCORRETA** / **INCORRETO** (qualquer nº de letras A–E) | `certo_errado` |
| 5 | Cobrança de lei, artigo, COFEN, **RDC**, **Anvisa**, decreto, resolução ("de acordo com a lei…") | `legis` |
| 6 | Pedido de **conta**: calcule, quantos mL, gts/min, diluição, regra de três, equivalência | `calc` |
| 7 | Sequência ou parâmetro numérico de conduta (RCP 30:2, SpO₂, FC/bpm, PA/mmHg, sinais vitais, protocolo/parâmetro) **sem** pedir conta | `protocolo` |
| 8 | Senão | `conceito` |

**Notas:**

- **VF parênteses:** exige contexto V/F (`marque V`, `verdadeiro/falso`, `registre V`). Associação ABC com `( )` **não** é `vf`.
- **Protocolo:** "urgência/emergência" sozinhos não bastam — precisa ancorar sequência (ex. 30:2) ou parâmetro mensurável.

---

## Desempates (só se dois testes quase empatam)

| Conflito | Vence | Por quê |
|----------|-------|---------|
| Lei citada + "assinale a correta sobre o conceito" | `legis` se o gabarito depende do dispositivo; senão `conceito` | prova do artigo vs definição |
| Número no enunciado + MCQ sem "calcule/quantos" | `protocolo` ou `conceito`, **nunca** `calc` | calc = operação |
| I/II/III sem comando de combinação V/F | `conceito` | romanos sozinhos ≠ família vf |
| EXCETO + tema legis/calc | `certo_errado` | formato do comando vence o tema |

Desempates finos (gabarito depende do artigo vs definição) podem divergir do funil automático — nesse caso, **documente o motivo** e reclassifique antes dos slides.

---

## Proibido

- Inventar 8ª família
- Usar `subtopico` / `pedagogical_branch` para escolher família
- Abrir Playbook ou escrever `logic_flow` nesta skill
- Trocar família depois de começar os slides sem reclassificar

---

## Encadeamento

```text
avant-classify-family → avant-golden-anchor-handcraft → professor-* / avant-json-template
```

Gates pós-handcraft:

- `audit:questao-readiness` → `l2_family_mismatch` quando `meta.family` ≠ funil (`warn`; `error` com `--strict-v2-pedagogy`)
- `audit:slug-alignment` → slides × família **declarada**

Helpers exportados (testes/scripts): `isVfFamily`, `isLegisFamily`, `isProtocoloFamily`, `inferFamilyMismatch`.
