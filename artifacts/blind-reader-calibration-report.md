# F2c — Calibração do leitor cego (âncoras `examples/`)

> **Status:** calibrado · **gate vinculado a `production_ready`:** não (fica para F4)
> Gerado em: 2026-08-01 · artefatos: `blind-reader-gate.json` · `blind-reader-calibration-report.json`

## Princípio

O portão entrega só o `concept_map` a um LLM em contexto limpo. Leitura invertida:

| Resposta do leitor | Veredito |
|---|---|
| Acertou a letra **com** citação literal | `fail_leak` — **bloqueia** |
| Acertou a letra **sem** citação literal | `warn_unsupported_hit` — revisar à mão |
| `indeterminavel` | `pass_indeterminate` |
| Errou a letra | `pass_wrong_letter` |

F2c = rodar o corpus de âncoras + calibrar ~20 à mão **antes** de barrar lote de ninguém.

## Corrida completa (âncoras)

| Métrica | Valor |
|---|---|
| Âncoras percorridas | **165** |
| Com `concept_map` + gabarito | **164** |
| `fail_leak` | **52** (31,7% das julgadas) |
| `warn_unsupported_hit` | **1** |
| `pass_indeterminate` | **111** |
| `pass_wrong_letter` | **0** |
| `skip_no_concept_map` | **1** (`questao-teste-simples`) |
| Modelo | `gemini-2.5-flash` |
| Comando | `npm run audit:blind-reader` |

Detector unificado (F2a) na mesma corrida, via `pedagogical_notes`: fail 107 / warn 10 / pass 48 (média 56,4). O leitor cego é **mais estreito** (só vazamento de letra no slide 1) e **complementar** (pega paráfrase / "gabarito B" que o regex perde).

## Amostra de calibração (n=20)

Estratificada: 8 com assinatura regex de spoiler + 12 "limpas" por família (`vf`, `conceito`, `protocolo`, `text_fragment`).

Julgamento humano = "dá para ler a **letra do gabarito** só com o `concept_map`?" (não = polaridade V/F sem letra).

### Matriz de confusão (humano × `fail_leak`)

|  | LLM bloqueia | LLM não bloqueia |
|---|---|---|
| Humano: há leak de letra | **TP 4** | **FN 0** |
| Humano: sem leak de letra | **FP 0** | **TN 16** |

**Concordância: 20/20 (100%).**

### Verdadeiros positivos (confirma o bloqueio)

| Slug | Letra | Evidência humana |
|---|---|---|
| `questao-premium-admtec-oxigenoterapia-dispositivos` | A | "Núcleo da letra A" / gabarito explícito |
| `questao-premium-admtec-puncao-venosa-cateteres` | B | Letras A/B amarradas às alternativas |
| `questao-premium-ameosc-cme-metodos-incorreta` | D | "Gabarito \| Letra D" |
| `questao-premium-educa-pb-portugues-sinonimos-iniludivel` | B | "gabarito B" no `detail` — **regex não pegou; leitor cego sim** |

### Casos que o regex marca spoiler mas o portão passa (esperado)

Polaridade V/F ou menção a distrator **não** revela a letra A–E:

- `questao-premium-amauc-imunizacao-bcg-dose-a4` — FALSA/VERDADEIRA por afirmativa; combo da letra C indeterminável
- `questao-premium-ameosc-imunizacao-vf-cadeia-frio` — idem
- `questao-premium-admtec-urgencias-rcp-30-2-aha2020` — cita letra A como pegadinha; gabarito D não aparece
- `questao-formacao-palavras-siglas` / `…-cartao-perdido` — falso positivo provável do regex (sigla "DDA", etc.)

F2a continua responsável por veredito V/F e spoiler de polaridade; o leitor cego responde só "qual letra?".

### Aviso fora da amostra (não bloqueante)

`questao-premium-cetrede-vias-injetaveis-incorreta` → `warn_unsupported_hit` (acertou A; checagem de literalidade falhou por formatação da citação multi-linha, embora o texto cite "letra A"). Manter na fila de revisão; **não** tratar `warn` como bloqueio automático.

`pass_wrong_letter = 0` no corpus: o modelo prefere `indeterminavel` quando incerto — conservador, desejável para um portão.

## Decisão F2c

| Pergunta | Resposta |
|---|---|
| Rodar nas ~155+ âncoras? | **Feito** (165) |
| Calibrar ~20 à mão? | **Feito** (20/20, 0 FP / 0 FN) |
| Vincular a `production_ready` / barrar lote? | **Não nesta tarefa** — é F4 |
| Pronto para F3 (repair) usando a fila `fail_leak`? | **Sim** — 52 âncoras com vazamento confirmável |
| Pronto para F4 (vincular gate)? | **Sim, com ressalva** — `warn` continua revisão humana; recalibrar se o modelo mudar |

## Como reproduzir

```bash
npm run audit:blind-reader -- --dry-run          # prompts sem API
npm run audit:blind-reader                       # corrida completa (Gemini)
npm run audit:blind-reader -- --limit=20         # recorte
npx tsx scripts/_blind-reader-pick-calibration.ts
npx tsx scripts/_blind-reader-dump-calibration-views.ts
```

Artefatos:

- `artifacts/blind-reader-gate.json` / `.md` — corrida completa
- `artifacts/blind-reader-calibration-sample.json` — amostra estratificada
- `artifacts/blind-reader-calibration-views.json` — textos redigidos das 20
- `artifacts/blind-reader-calibration-report.json` — julgamentos + matriz
- este arquivo — narrativa da calibração
