# Comparativo: mockup de slides (grade 2×3) × implementação atual no Avant

Referência: grade de marketing com seis modelos (mapa, regra de ouro, zona de perigo, fluxo lógico, arena versus, scanner silábico).  
Código analisado: `components/slides/variants/*.tsx` e `components/slides/core/NeuroSlide.tsx`.

---

## Resumo executivo

| Modelo (mockup) | Já existe no Avant? | Alinhamento visual com o mockup |
|-----------------|---------------------|-----------------------------------|
| Mapa de conceitos | Sim — `concept_map` (`ConceptMap`, `MorphologicalConceptMap`) | **Médio** — estrutura parecida; falta chip de tipo + título de “capa” unificado |
| Regra de ouro | Sim — `golden_rule` | **Médio-baixo** — um bloco de texto; mockup sugere **tabela duas colunas** (rótulo \| valor) |
| Zona de perigo | Sim — `danger_zone` | **Alto** — alerta vermelho e lista; copy e bullets diferem (X vs número) |
| Fluxo lógico | Sim — `logic_flow` | **Alto** — pipeline vertical numerado; texto do chip difere |
| Arena versus | Sim — `versus_arena` | **Alto** — split + VS central |
| Scanner silábico | Sim — `syllable_scanner` | **Baixo para o mesmo conteúdo do mockup** — hoje é **acentuação/sílabas**, não “blocos temáticos” genéricos (ex.: níveis de prevenção) |

**Conclusão:** Vale a pena **continuar usando** estes tipos no produto; o que falta para ficar “igual ao mockup” é sobretudo **camada de marca** (chips com nomes fixos), **um layout tabular na Regra de ouro** quando o conteúdo for lista de pares, e **opcionalmente** um modo ou novo tipo para “blocos verticais” além do scanner de sílabas.

---

## 1. Mapa de conceitos

**Mockup:** chip “MAPA DE CONCEITOS”, título forte do tema (ex.: vias de administração), grade 2×2 com ícone + rótulo por célula.

**Avant (`ConceptMap` / `MorphologicalConceptMap`):**
- Grade responsiva de cards com ícone (Lucide), título e descrição por conceito — **equivalente funcional**.
- **Não há** faixa superior fixa com o texto “MAPA DE CONCEITOS”.
- O “título da matéria” costuma vir **do primeiro conceito** (morfológico) ou ser distribuído nos cards, não como **cabeçalho único** estilo capa.

**Lacunas objetivas:**
- Chip / label do **tipo de slide** (branding consistente com o material de divulgação).
- Opcional: área de **título global** do slide (uma string) separada dos itens — hoje depende do JSON preencher bem os `concepts`.

---

## 2. Regra de ouro

**Mockup:** chip “REGRA DE OURO”, título, layout **estilo tabela** (duas colunas: nome do parâmetro \| valor).

**Avant (`GoldenRule`):**
- Um único campo `content` (string) renderizado em variantes `center` | `compact` | `minimal` | `banner`.
- **compact** aproxima-se de “card com ícone + texto”, mas **não** modela colunas PA / FC / FR como estrutura de dados.

**Lacunas objetivas:**
- Sem tipo JSON dedicado a **pares chave–valor** ou markdown de tabela.
- Sem chip “REGRA DE OURO” explícito (há ícones Sparkles/Lightbulb/Zap conforme variante).

**Quando faria diferença implementar:** questões de sinais vitais, doses, escores — qualquer coisa que no mockup apareça como **lista tabular**.

---

## 3. Zona de perigo

**Mockup:** chip “ZONA DE PERIGO”, título, lista com **ícones de X** vermelhos.

**Avant (`DangerZone`):**
- Título fixo interno **“CUIDADO COM A PEGADINHA”** (não “ZONA DE PERIGO”).
- Itens com numeração/estrutura `label` + `detail`; ícone de alerta grande decorativo, não bullet em forma de X por item.

**Lacunas objetivas:**
- **Copy** do cabeçalho diferente do mockup (fácil alinhar por prop ou i18n).
- Bullets com **X** como no print: hoje não é o padrão do `ItemContent`.

---

## 4. Fluxo lógico

**Mockup:** chip “FLUXO LÓGICO”, passos 1…n em faixas/pills roxas.

**Avant (`LogicFlow` — variante vertical):**
- Chip interno **“Pipeline Cognitivo”** + ícone Sparkles (não “FLUXO LÓGICO”).
- Passos em cards numerados, revelação sequencial — **muito próximo** do mockup em intenção.

**Lacunas objetivas:**
- Apenas **nomenclatura** do chip (marca/idioma didático).

---

## 5. Arena versus

**Mockup:** chip “ARENA VERSUS”, dois painéis lado a lado com cores distintas (ex.: azul vs rosa).

**Avant (`VersusArena`):**
- Dois lados + **VS** central animado; listas com bullets; tema via `theme` (gradiente unificado + laterais).
- **Estrutura alinhada** ao mockup; contraste forte **por lado** depende do tema escolhido no `themeGenerator`, não de cores fixas azul/rosa.

**Lacunas objetivas:**
- Chip superior “ARENA VERSUS” **não existe** no componente.
- Opcional: realçar mais **diferença cromática** entre lado A e B (hoje mais simétrico).

---

## 6. Scanner silábico

**Mockup (imagem):** chip “SCANNER SILÁBICO”, blocos verticais com títulos em destaque (ex.: níveis de prevenção).

**Avant (`SyllableScanner`):**
- Focado em **palavra com sílabas separadas**, sílaba tônica e **regra de acentuação** (“Scanner de Acentuação”).
- **Não é** um layout genérico de “três seções com título + texto” para qualquer tema de saúde.

**Lacunas objetivas:**
- Para conteúdo como **níveis de prevenção**, o tipo certo hoje seria outro (`concept_map`, `logic_flow` ou um **novo tipo** “section_stack”) — o nome “scanner silábico” no mockup foi usado como **rótulo visual**, não como o componente atual de acentuação.

---

## Priorização sugerida (se for investir em paridade com o mockup)

1. **Baixo esforço, alto impacto de marca:** componente ou helper de **chip de tipo** (texto configurável por `type` / prop), reutilizado em todos os variantes.
2. **Médio esforço:** `GoldenRule` ou variante nova com **dados estruturados** (array de `{ label, value }`) para tabelas de referência.
3. **Copy / DangerZone:** alinhar título e opcionalmente ícone de bullet ao estilo do mockup.
4. **LogicFlow:** renomear chip “Pipeline Cognitivo” → “Fluxo lógico” (ou tornar configurável).
5. **Conteúdo “scanner” genérico:** avaliar novo `layout_variant` ou tipo; **não** forçar o `SyllableScanner` atual para textos que não são separação silábica.

**Issues prontas para o GitHub:** ver [`ISSUES_PARIDADE_MOCKUP_SLIDES.md`](./ISSUES_PARIDADE_MOCKUP_SLIDES.md) (títulos, corpos em markdown, critérios de aceite e roadmap P0–P3).

---

*Documento gerado para apoiar decisão de produto e roadmap de UI; não substitui testes visuais em dispositivos reais.*
