# Brief L3 — pt_sinonimos_polissemia (ok_generico)

**Gerado:** 2026-07-23  
**Decisão L3:** ok_generico  
**Card:** Sinônimos, antônimos e polissemia  
**Família dominante:** conceito + 	ext_fragment  
**Âncora planejada:** tec 3951883 — APICE ACS-PR — «refletiu» (espelho × pensar)  
**Guideline:** PT_SINONIMOS_POLISSEMIA · lib/guidelines/linguaPortuguesa/sinonimosPolissemia.ts

---

## 0. Erro espacial (1 frase)

O aluno **troca no dicionário** sem testar a **frase** — ou confunde **polissemia** (mesma palavra, sentidos) com **parônimo/homônimo** (formas parecidas ou iguais, origens distintas).

---

## 1. Metáfora única 4/4

> **Lente contexto × dicionário:** cada slide contrasta o que o **dicionário permite** com o que o **enunciado exige** — campo semântico em cinza, escolha da prova em destaque cyan.

Universo visual: **diff de equivalência** (não funil, não trilho). Ícones: Languages, BookOpen, ArrowLeftRight, AlertTriangle.

---

## 2. Pacote genérico premium (4 slides — sem React bespoke)

| # | type | layout auto | Metáfora |
|---|------|-------------|----------|
| 1 | concept_map | morphological | Terreno: sinônimo · antônimo · polissemia · parônimo + pegadinha dicionário |
| 2 | logic_flow | ertical + 
eveal_mode: tap | Pergunta-teste → contexto → eliminar letras → gabarito |
| 3 | golden_rule | 
eference_table (
ows) | Tabela fenômeno × teste (contexto; forma igual; oposição) |
| 4 | danger_zone | compare (items[].correct) | Cada letra errada + **Transferência** |

**Proibido:** 	emplate / layout_variant no JSON de catálogo.

---

## 3. Slots por slide

### concept_map

| label | detail (≤110c) |
|-------|----------------|
| Pergunta-teste | Mesmo sentido na frase? Outro sentido possível? |
| Sinônimo | Aproximação **no contexto** — nem sempre intercambiável |
| Antônimo | Oposição de sentido na oração |
| Polissemia | Mesma forma, sentidos diferentes — contexto desambigua |
| Pegadinha | Sinônimo de dicionário que muda registro ou colocação |

**footer_rule:** «Sem testar a frase, a banca troca sinônimo por parônimo.»

### logic_flow (tap)

1. Comando pede **sinônimo**, **antônimo**, **polissemia** ou **parônimo**?  
2. Isolar o vocábulo no trecho — quantos sentidos cabem?  
3. Testar cada letra no **contexto** (não só no dicionário)  
4. Eliminar trocas de forma parecida sem equivalência  
5. Gabarito letra X  
6. Em similares: rode a pergunta-teste antes de marcar

### golden_rule (rows)

| label | value |
|-------|-------|
| Sinônimo | Sentido próximo **na frase** |
| Antônimo | Oposição ou contraste semântico |
| Polissemia | Mesma palavra, sentidos distintos |
| Homônimo | Mesma forma, origens diferentes |
| Parônimo | Forma parecida, sentido diferente |
| Pegadinha | Troca que quebra regência ou registro |

content opcional: «Contexto antes do dicionário»

### danger_zone

- 1 item por distrator com correct **único** (por que aquela letra cai)  
- Último item **Transferência**: Classifique: «frase nova» · correct = Polissemia: … / Sinônimo no contexto: … / Parônimo: … / Antônimo: … (não genérico)

---

## 4. Design visual (avant-neuroslides-visual — Modo V)

**Erro espacial calibrado:** painel esquerdo = dicionário; direito = uso no enunciado. Tap no logic_flow = **mudar de lente**, não decorar lista.

| Lei retenção | Aplicação |
|--------------|-----------|
| Contraste emocional | danger = «quase troquei no dicionário» — rose suave |
| Chunking | ≤5 itens concept_map; golden = 6 linhas visíveis |
| Transferência | Classifique: com fenômeno nomeado no correct |

**Wire ASCII (concept_map):**

`	ext
┌─────────────────────────────────────┐
│  DICIONÁRIO     │  NA FRASE        │
│  (permite…)     │  (a prova cobra) │
│  casa ≈ moradia │  «sua moradia» OK│
│  ≠ «seu lar»?   │  registro/tempo  │
└─────────────────────────────────────┘
`

**375px:** stack — dicionário acima, frase abaixo.  
**Reduced motion:** ambos painéis visíveis sem animação.

---

## 5. Teste espacial 3/3 (documentado)

| # | Resposta | Motivo |
|---|----------|--------|
| 1 | Sim | Não há funil sequencial obrigatório |
| 2 | Não | 63 slugs no card |
| 3 | Sim | compare + 
ows + tap resolve |

→ **ok_generico** — sem pt-* bespoke.

---

## 6. Estudo ativo (playbook — documentar na âncora)

- correct Transferência: prefixo Polissemia: · Sinônimo no contexto: · Antônimo: · Parônimo:  
- Exemplo: Polissemia: «refletiu» no espelho (imagem) × refletiu sobre o conselho (pensar).  
- Quiz UI futuro: **Sinônimo | Antônimo | Polissemia | Parônimo** (transfer_revealed até wiring no player)

---

## 7. Gate Fase 3b (ok_generico)

- [x] Metáfora única 4/4 documentada  
- [x] Teste 3/3 preenchido  
- [x] neuroslides-visual aplicado (§4)  
- [x] Contrato JSON + transferência  
- [ ] Âncora READY (próximo capítulo)  
- [ ] React — **N/A**

---

## 8. Handoff

Próximo: **Criar âncoras** — examples/questao-premium-apice-portugues-sinonimos-polissemia-refletiu.json  
Depois: sinonimos-antonimos-e-polissemia-g01 handcraft (DNA Elias + guideline sinonimosPolissemia.ts)
