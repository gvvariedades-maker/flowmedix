---
name: avant-golden-anchor-handcraft
description: >-
  Handcraft golden-v1: family → âncora → slots. Use SEMPRE ao escrever/editar
  reverse_study_slides (lote gNN, reparo, ou conteúdo de uma âncora de estilo).
  Ative após avant-classify-family. Para criar âncoras faltantes antes do g01
  (fila / gate), use avant-golden-anchor-bootstrap primeiro. Escreve logic_flow
  primeiro; barra 10/10; gate audit:questao-readiness --strict-v2-pedagogy.
  Encadeia professor-* + avant-json-template (+ brief-* se ramo L3 forte).
---
> **Fonte Git:** edite em `docs/skills/`; runtime via `npm run sync:skills`. Ver `docs/SKILLS_GOVERNANCE.md`.

# Âncora-Handcraft — executar, não ler como manual

**Missão:** cada slide = 1 fala de professor com função única. Aluno, após 1 leitura, explica o gabarito a um colega.

**Contrato de conteúdo:** `docs/GOLDEN_CONTENT_STANDARD.md` (não reescrever regras de lint aqui).  
**Proibido:** `ai:generate` · `catalog:upgrade-premium` · `content_standard: "golden-v2"` (v2 = só write-spec).

---

## HARD FAIL (reescrever antes de entregar)

| # | Falha | Correção |
|---|--------|----------|
| 1 | Gabarito/letra no `concept_map` ou row "Gabarito letra X" no `golden_rule` — em **qualquer** superfície (`label`, `detail`, `correct`, `footer_rule`, `exam_hint`) | Spoiler só no `logic_flow` + labels da `danger_zone` |
| 2 | `logic_flow` parafraseia alternativas (≥8 palavras de uma `option`) | Steps de **decisão**; último = `"Em similares: …"` |
| 3 | `danger_zone` com letra omitida, `correct` repetido, ou sem transferência | 1 item/letra errada + ≥1 transferência separada |
| 4 | EXCETO: distrator espelha o texto do gabarito | Distrator = por que é **correto**; só o gabarito = a exceção |
| 5 | Texto genérico da família / copiado da âncora | Vocabulário **desta** prova; imitar **estrutura**, não frase |
| 6 | Drift de ramo (ex. IPCS/CVC sem âncora no enunciado) | Só termos do enunciado + tema da questão |
| 7 | Card com 2 ideias / texto longo | Densidade §3b — 1 ideia/string |
| 8 | Entregar sem `[READY]` strict-v2 | Rodar gate § Ship |
| 9 | Enunciado cita figura/tirinha/charge sem `figures[]` nem `transcribed` | `figure_policy` + asset ou `text_fragment` — gate `l2_missing_figure` |

**Barra 10/10 ≠ mínimo do lint.** Metade dos distratores no lint base = incompleto. Handcraft novo = cobertura completa + strict-v2.

### Anti-spoiler — agora é gate, não recomendação (F4)

A camada **L2c** (`audit:subtopico-quality`) barra `production_ready` do pacote inteiro quando qualquer slug reprova. Dois leitores independentes:

| Sinal | O que pega |
|---|---|
| `detectUnifiedPedagogy` (regex) | letra citada (`"C erra…"`, `"letra C"`), veredito V/F abrindo o texto (`"FALSA."` com **qualquer** pontuação), rótulo `"Afirmativa II —"`, padding `Confirmar:`+`Marcar`, polaridade invertida em EXCETO, `logic_flow` sem gabarito |
| Portão do leitor cego (LLM) | spoiler **parafraseado**: o leitor recebe só o `concept_map` e, se acerta a letra citando um trecho literal, o slide reprova |

Escrever para o leitor cego: quem lê apenas o `concept_map` deve aprender o terreno e **não conseguir** apontar a alternativa. O lugar da resposta é o `logic_flow`.

O gate lê `detail`, `correct`, `footer_rule` e `exam_hint` — não só `label`. Foi exatamente aí que o defeito passou antes de existir verificação.

---

## Fluxo (ordem fixa — 1 questão)

```text
1. avant-classify-family          → meta.family
2. Ramo L3 (se BRANCH_DESIGN_MAP) → meta.pedagogical_branch (avant-json-template § L2.5+L3)
3. Resolver âncora (§ Âncora)     → abrir 1 JSON; ler GRAMÁTICA, não copiar texto
4. Escrever logic_flow PRIMEIRO   → ≥4 steps decisão + fixação "Em similares:"
5. concept_map → golden_rule → danger_zone  (sem repetir o eixo do fluxo)
6. Checklist 10/10 → audit:questao-readiness --strict-v2-pedagogy → [READY]
```

Render no player continua v2: `concept_map` → `logic_flow` → `golden_rule` → `danger_zone`. Autoria ≠ ordem do array.

### Skills junto

| Contexto | Tom | Forma |
|----------|-----|-------|
| TE (41 subtópicos) | `professor-para-concurso` | `avant-json-template` |
| PT geral | `professor-lingua-portuguesa-concurso` | `avant-json-template` |
| PT morfossintaxe | Elias **+** professor-lingua | json-template + `brief-lingua-portuguesa` se ramo forte |
| Ramo L3 forte | acima | `brief-enfermagem` ou `brief-lingua-portuguesa` |

---

## Âncora (resolver em 30s)

```text
1. handcraft-registry.json → subtópico → golden_anchors_registry ou anchor_glob
2. Registry: family + pedagogical_branch + command (EXCETO, PNI…)
3. Senão: matriz + “quando usar qual” em reference-ancoras.md
4. Fallback: FAMILY_GOLDEN_FILE[family] em classifyFamily.ts (último recurso)
5. Subtópico sem registry: ver lista dos 15 em reference-ancoras.md (matriz + `examples/questao-premium-*` por tema)
```

- EXCETO/INCORRETA → âncora EXCETO (mesmo se `family=certo_errado`).
- VF intervalos PNI → âncora de intervalos, não VF genérica.
- PT: `anchor_glob` do playbook (`*-portugues-*.json`) por tema.
- **Nunca** copiar ≥8 palavras da âncora.

Detalhe: [`reference-ancoras.md`](reference-ancoras.md) — matriz · disambiguação · subtópico→registry · fallback `FAMILY_GOLDEN_FILE`.

---

## 3. Contrato por slide

| Slide | Pergunta | Obrigatório | Proibido |
|-------|----------|-------------|----------|
| `logic_flow` | Como decido? | `reveal_mode:"tap"`; ≥4 steps; último `"Em similares: …"`; eliminar por letra | Listar alternativas |
| `concept_map` | Qual o terreno? | 3–6 items; 1 = pegadinha-âncora **sem letra**; ícones Lucide distintos | Gabarito / combinação |
| `golden_rule` | O que decoro? | Preferir `rows[]`; números com `sources[].covers` | Row "Gabarito letra X" |
| `danger_zone` | Onde caio? | 1 item/letra errada + ≥1 transferência; `correct` únicos | Letra omitida; `correct` clonado |

**Ênfase do fluxo por família** (núcleo dos steps):

| family | Núcleo |
|--------|--------|
| `vf` | I→II→III→IV → combinar → letra |
| `certo_errado` + EXCETO | Isolar exceção; distratores = conduta correta |
| `protocolo` | Parâmetro → sequência → letras |
| `calc` | Dados → fórmula → conta → unidade → letra |
| `legis` | Lei → artigo → direito/dever/proibição |
| `conceito` | Termo-chave → exclusão → letra |
| `text_fragment` | Ler caso → dado do fragmento → decisão |

**VF (I–IV):** cobertura por afirmativa no fluxo/`concept_map`; no `danger_zone` = combinações erradas + transferência (não forçar "Letra B" se a prova é por romanos).

**Antes de fechar MCQ:**

```text
Gabarito: ___
Letras erradas: [...]
Cada letra tem item "Letra X — …" + correct único?  S/N
Transferência separada?  S/N
EXCETO: distratores justificam conduta correta?  S/N
```

### 3b. Densidade (UI = card, não apostila)

| Campo | Alvo | Duro |
|-------|------|------|
| `concept_map.label` | ≤40 | ≤60 |
| `concept_map.detail` / `golden_rule.rows[].value` | ≤110 | ≤140 |
| `logic_flow.steps[]` | ≤110 | ≤160 |
| `danger_zone` detail/correct | ≤100 | ≤130 |
| `footer_rule` | ≤90 | ≤120 |

1 ideia por string. Preferir *"Eliminar B — manutenção reativa é tardia."* a parágrafo.

---

## Bom vs ruim (calibragem rápida)

Mini JSON completo (VF + EXCETO) + anti-exemplos: [`reference-exemplos.md`](reference-exemplos.md).

**`logic_flow` — RUIM** (reciclagem):
```text
"A afirma que o curativo é semanal — incorreto"
```
**BOM** (decisão):
```text
"Curativo CVC: troca por protocolo/sujo — não por calendário fixo inventado"
"Em similares: prazo de curativo ≠ prazo de flush"
```

**`danger_zone` EXCETO — RUIM**:
```json
{ "label": "Letra A", "correct": "Errado porque não é a exceção" }
```
**BOM**:
```json
{ "label": "Letra A — assepsia do hub", "detail": "Parece falha", "correct": "É conduta correta: desinfetar o hub antes do acesso" }
```

**`concept_map` — RUIM:** `"Gabarito: combinação V F V F"`  
**BOM:** `"Pegadinha: trocar intervalo de reforço pelo de primovacinação"`

---

## Meta (mínimo)

```jsonc
"meta": {
  "subtopico": "<canônico CLAUDE.md §9>",
  "content_standard": "golden-v1",
  "family": "<classify-family>",
  "pedagogical_branch": "<se BRANCH_DESIGN_MAP>",
  "content_review": { "reviewed_at": "AAAA-MM-DD", "guideline_snapshot": "<fonte+ano>", "exam_vs_current": "none" },
  "sources": [{ "id": "...", "tier": "A", "issuer": "...", "title": "...", "year": 2025, "covers": ["..."] }]
}
```

Sem `template` / `layout_variant`. Número normativo → `covers` ou risco sobe.

| Campo | Significado |
|-------|-------------|
| `content_standard: "golden-v1"` | Barra de **conteúdo** |
| write-spec `golden-v2` | Pipeline Zod — **não** vai em `content_standard` |
| `a4_reviewer: "agent:golden-v2"` | Quem fechou A4 — não é versão de conteúdo |

---

## Ship

### Checklist 10/10 (obrigatório mesmo com gate verde)

- [ ] Função única por slide
- [ ] Densidade respeitada
- [ ] `danger_zone`: todas letras erradas (ou VF por afirmativa) + transferência
- [ ] Último step = `"Em similares: …"`
- [ ] Vocabulário desta prova; sem drift
- [ ] EXCETO: sem espelho do gabarito nos distratores
- [ ] Protocolo/conduta: eixo mental nomeado quando couber

### Gate

```bash
npm run audit:questao-readiness -- --file=<caminho> --strict-v2-pedagogy
```

Ship = `[READY]` + `ready_100: true`.  
Risco `alto` (dose/conduta/divergência) → A4 humano. `baixo`/`medio` → agente pode fechar.

**Âncoras 100% (base):** após READY, fechar com `npm run audit:anchor-100 -- --file=…` e assinar (`--sign-agent` ou `--sign-human=`). Ver `docs/ANCHOR_CHECKLIST_100.md`.

O que o lint cobre vs o que não: [`reference-gates.md`](reference-gates.md).

---

## Referências

- `docs/GOLDEN_CONTENT_STANDARD.md` — contrato + lint
- `reference-ancoras.md` — matriz family → arquivo
- `reference-exemplos.md` — mini VF + EXCETO (estrutura, não copiar)
- `reference-gates.md` — lint vs humano
- `avant-classify-family` · `avant-json-template` · `professor-*` · `brief-*`
- `lib/catalogMigration/classifyFamily.ts` · `*-golden-anchors.json` · `handcraft-registry.json`
