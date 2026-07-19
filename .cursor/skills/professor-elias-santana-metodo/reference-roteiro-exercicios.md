# Roteiro — Aula de exercícios / live (DNA Gran → NeuroSlides)

Micro-roteiro para `logic_flow` + `danger_zone`. Baseado no padrão **Sujeito - Exercícios** (Gran) e lives por banca (FCC, IBFC).

---

## Diferença em relação à teoria

| Teoria | Exercícios |
|--------|------------|
| Mapa → definição → exemplo | Questão → eliminação → gabarito |
| Ritmo lento | Ritmo de prova |
| Poucas bancas citadas | Banca explícita por item |
| Sem spoiler de letra até o fim | Gabarito no meio/fim do comentário |

---

## Macro-estrutura (aula de exercícios ~30–60 min)

1. Retomada **30s** do mapa (não repetir aula inteira)  
2. Questão 1 — comentário completo  
3. Questão 2…N — mesmo padrão  
4. Fechamento — “o que mais caiu” + decore seletivo  

No AVANT: **1 questão = 1 JSON**; o roteiro abaixo é por questão.

---

## Micro-roteiro por questão (logic_flow)

### Step 0 — Comando (P0)

**Fala-tipo:**

- “Lê o comando **duas vezes**. EXCETO = as outras estão certas.”
- “INCORRETA = só uma errada.”

**Step:**

```text
Comando: [CORRETA / EXCETO / …] — o que a banca quer que você julgue?
```

### Step 1 — Eixo em 10s

**Fala-tipo:**

- “Isso aqui é ** [eixo] **, não é interpretação solta.”
- “Antes de olhar as letras: **onde está o verbo?**”

**Step:**

```text
Eixo: [sujeito / crase / regência…] — pergunta-teste: [Quem? / Por quê crase?…]
```

### Step 2 — Ataque (eliminar impossíveis)

**Fala-tipo (live):**

- “Se eu fosse fazer na prova, **já eliminava** B e D porque…”
- “Não precisa analisar a frase inteira para matar duas letras.”

**Steps (1 por letra eliminada):**

```text
Letra A: elimina — [motivo específico, não paráfrase]
Letra C: elimina — [motivo específico]
```

**Regra AVANT:** nunca copiar ≥8 palavras contíguas da `option`.

### Step 3 — Gabarito provado

**Fala-tipo:**

- “Sobra ** [letra] ** porque…”
- Aplicar pergunta-teste **na frase do gabarito**.

**Step:**

```text
Gabarito: letra [X] — [prova em 1 frase com pergunta-teste]
```

### Step 4 — Análise completa (opcional no oral; compacta no slide)

Se sobrar espaço em 1 step:

```text
Morfossintaxe: verbo […] → sujeito […] → [função que fecha o item]
```

### Step 5 — Fixação portátil (obrigatório)

**Fala-tipo:**

- “Na próxima questão parecida, você faz **o mesmo teste**.”
- “Leva isso: ** [regra de bolso] **.”

**Step:**

```text
Em similares: [pergunta-teste + critério único]
```

---

## danger_zone — padrão exercícios

Cada distrator = **por que o aluno marca** + **por que está errado**.

### EXCETO / INCORRETA

| Tipo de card | detail | correct |
|--------------|--------|---------|
| Distrator “quase certo” | Parece certo porque… | Texto da conduta **correta** que a letra descreve |
| Gabarito (exceção) | A banca marca porque… | Única que **viola** a regra / é a exceção |

**Proibido:** usar o texto do gabarito como `correct` em todas as letras.

### Classificação / CORRETA

| Card | detail | correct |
|------|--------|---------|
| Letra errada | Confunde X com Y | Classificação / trecho **certo** que a questão pedia |

### VF / C-E (CEBRASPE)

- `logic_flow`: julgar item I, II, III em steps separados antes de combinar.
- `danger_zone`: pegadinha por **item**, não por letra A–E genérica.

---

## Padrão live YouTube (banca específica)

Ordem observada em lives FCC / IBFC:

1. **Mapa da prova** — quantas questões de gramática, quais eixos  
2. **Questão 1** sem teoria longa — eliminação primeiro  
3. Teoria **só** do ponto que a questão exigiu  
4. Próxima questão — repetir  

**No AVANT:** o `concept_map` pode ser mais curto se a questão for “pura exercício”; compensar com `logic_flow` mais denso.

---

## Exemplo compacto (logic_flow steps — sujeito)

```json
{
  "type": "logic_flow",
  "reveal_mode": "tap",
  "steps": [
    "Comando: assinale a alternativa CORRETA sobre o sujeito.",
    "Eixo: sujeito — pergunta Quem? ao verbo principal.",
    "Letra B: elimina — 3ª pl. sem referente no texto = indeterminado, não elíptico.",
    "Letra D: elimina — núcleo único; sujeito simples, não composto.",
    "Gabarito: letra A — sujeito posposto, simples, expresso ('aprovação').",
    "Em similares: verbo primeiro → Quem? → referente textual? → elíptico ou indeterminado."
  ]
}
```

---

## Checklist exercícios → slides

- [ ] Comando lido **duas vezes** no step 1?  
- [ ] Eliminação **antes** de análise morfossintática longa?  
- [ ] Cada step = **1 decisão** (≤110 chars alvo)?  
- [ ] Gabarito só no `logic_flow`?  
- [ ] `danger_zone` com distinção fina do tema (não genérico)?  
- [ ] Último step = fixação “Em similares”?  
- [ ] Padrão da banca citado se `meta.banca` preenchido?
