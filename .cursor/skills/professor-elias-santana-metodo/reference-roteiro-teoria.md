# Roteiro — Aula teórica (DNA Gran → NeuroSlides)

Micro-roteiro para handcraft quando a questão exige **enquadramento conceitual** (classificação, definição, distinção fina). Baseado na estrutura observável em degravações de sintaxe (ex.: Sujeito II).

---

## Macro-estrutura (25–45 min → 4 slides)

| Fase da aula | Minutos típicos | Slide AVANT |
|--------------|-----------------|-------------|
| Abertura + mapa | 0–5 | `concept_map` (itens 1–2) |
| Definições operacionais | 5–15 | `concept_map` (itens 3–4) + início `golden_rule` |
| Exemplos comentados | 15–30 | `golden_rule` `rows` + pistas para `danger_zone` |
| Distinção fina + Obs. | 30–40 | `danger_zone` (sem gabarito ainda) |
| Ponte para questão | 40–45 | último `concept_map` footer / fixação no fluxo depois |

---

## Micro-roteiro (passo a passo)

### Bloco 1 — Abertura (concept_map)

**Fala-tipo (reescrever, não copiar):**

1. “Hoje é ** [eixo] ** — um dos temas que mais aparecem em ** [tipo de prova] **.”
2. “Antes de decorar nome, você precisa do **mapa**.”
3. Apresentar **árvore nível 1** (2–3 ramos principais).

**No JSON:**

```json
{
  "type": "concept_map",
  "slide_title": "Terreno: tipos de sujeito",
  "items": [
    { "label": "Expresso", "detail": "Quem? visível na frase — simples ou composto", "icon": "Eye" },
    { "label": "Não expresso", "detail": "Oculto na forma — elíptico ou indeterminado", "icon": "HelpCircle" },
    { "label": "Sem sujeito", "detail": "Verbo impessoal — não exige Quem?", "icon": "Ban" }
  ],
  "footer_rule": "Na prova: confundem elíptico (tem referente) com indeterminado (não tem)."
}
```

### Bloco 2 — Definição operacional (golden_rule)

**Fala-tipo:**

1. “Não decore definição de manual. Decore a **pergunta**.”
2. Enunciar pergunta-teste.
3. Tabela curta (tipos / critérios / exemplos mínimos).

**No JSON:**

```json
{
  "type": "golden_rule",
  "content": "Pergunta-teste do sujeito",
  "rows": [
    { "label": "Sujeito", "value": "Quem? / O quê? — concorda com o verbo" },
    { "label": "Simples", "value": "Um núcleo só" },
    { "label": "Composto", "value": "Dois+ núcleos (A e B)" },
    { "label": "Anteposto / posposto", "value": "Antes ou depois do verbo — não muda o tipo" }
  ]
}
```

### Bloco 3 — Exemplos comentados (oral → steps do logic_flow depois)

**Padrão de comentário (cada exemplo):**

1. Ler a frase.
2. **“Onde está o verbo?”**
3. **“Quem pratica?”** → sujeito.
4. Classificar: expresso/oculto; simples/composto; anteposto/posposto.
5. Se oculto: **referente no texto?** → elíptico vs indeterminado.

**Exemplo de par didático (distinção fina):**

| Frase | Análise |
|-------|---------|
| “Ouvi os poetas. Disseram palavras de amor.” | “Disseram” → referente **poetas** → elíptico |
| “Disseram palavras de amor.” (isolada) | 3ª pl. **sem** referente → indeterminado |

Isso vira `danger_zone` na questão — não repetir texto integral da degravação.

### Bloco 4 — Obs. (pegadinha nomeada)

**Fala-tipo:**

- “**Obs.:** a banca adora quando você…”
- Nomear **um** erro clássico.
- Contrastar com regra portátil.

**No concept_map footer ou danger_zone content:**

> “3ª pessoa do plural sem referente no texto ≠ sujeito elíptico.”

### Bloco 5 — Fechamento teórico

**Fala-tipo:**

1. Recapitular mapa em **15 segundos**.
2. “Isso você leva para **qualquer** questão de [eixo].”
3. Ponte: “na aula de exercícios / na questão X, vamos eliminar letra por letra.”

No AVANT o fechamento vira **último step** do `logic_flow`: “Em similares: …”

---

## Marcadores da degravação (sinal de estrutura)

Degravações Gran costumam trazer:

- Título do tópico + subtópico  
- Seções em caps (TIPOS DE SUJEITO)  
- Exemplos numerados  
- **Obs.** para pegadinhas  
- Marcadores `5m`, `10m`… (sincronia com vídeo) — **não** usar no JSON; só indicam densidade por bloco  

---

## Checklist teoria → slides

- [ ] `concept_map` tem taxonomia em **camadas**, não definição única?  
- [ ] `golden_rule` tem pergunta-teste ou tabela **seletiva**?  
- [ ] Exemplos da teoria viraram **decisões** no `logic_flow`, não parágrafo no `concept_map`?  
- [ ] Distinção fina está na `danger_zone` com `correct` únicos?  
- [ ] Nenhum trecho copiado da degravação?
