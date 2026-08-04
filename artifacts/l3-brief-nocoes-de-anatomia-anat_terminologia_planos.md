# L3 Brief 4/4 — Noções de Anatomia · `anat_terminologia_planos`

**Decisão:** molde_inedito  
**Pacote:** nocoes-de-anatomia  
**Família típica:** conceito / certo_errado  
**Âncora de estilo:** `examples/questao-premium-fepese-anatomia-anterior-ventral.json`  
**React:** **não** implementar sem `Implementar molde: anat_terminologia_planos`  
**Enquanto React pendente:** handcraft usa `ANAT_GENERIC_DESIGN` (rose) + layouts genéricos (`morphological` / `reference_table` / `tap` / `compare`).

---

## Metáfora espacial (única)

**Eixo-corpo / Axis deck** — o aluno “encaixa” o termo no eixo certo (frente↔trás, cabeça↔pés, medial↔lateral, proximal↔distal) como peças de um tabuleiro 3D.  
Erro espacial: **inverter o par** (ex. medial=afastado; posterior=cranial).

### Teste espacial 3/3
1. O erro da prova é espacial? **Sim** — troca de eixos/sinônimos.  
2. O gesto fixa a decisão? **Sim** — pairing no eixo.  
3. Genérico já resolve sem perda? **Não** — pares sinônimos pedem tabuleiro próprio → **molde_inedito**.

---

## Contrato 4/4 (player v2)

| Slide | Layout alvo | Gesto / slot |
|-------|-------------|--------------|
| `concept_map` | axis-deck (hoje: morphological) | 4 cards: eixos + PEGADINHA-ÂNCORA (sem letra) |
| `logic_flow` | tap | Isolar termo → par clássico → excluir oposto invertido → gabarito |
| `golden_rule` | reference_table | Tabela de pares (Anterior↔Ventral …) — sem row “Gabarito letra X” |
| `danger_zone` | compare | Cada distrator = inversão de eixo; `correct` distinto |

### Anti-spoiler
- Sem letra/gabarito em `concept_map` / `golden_rule`
- `danger_zone.items[].correct` únicos
- Vocabulário só de posição/planos (sem drift IPCS/CVC)

---

## Handoff

- **Handcraft:** slots acima + guideline `ANATOMIA_TERMINOLOGIA`
- **Visual:** `avant-neuroslides-visual` opcional pós-brief
- **React:** `VARIANT_MOLDS` só com `Implementar molde: anat_terminologia_planos` (candidatos: anat-axis-deck / anat-axis-board / anat-axis-tap / anat-axis-trap)

## Gate

- [x] Brief 4/4 escrito
- [ ] Molde React (pendente autorização)
- [ ] Regressão visual após React
