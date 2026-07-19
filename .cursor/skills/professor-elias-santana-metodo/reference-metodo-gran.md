# Referência — Método morfossintaxe (Gran / persona AVANT)

Documento de **engenharia reversa pedagógica** para handcraft. Não reproduz material autoral do Gran; descreve **estrutura observável** em syllabus público, degravações e padrão de aulas.

> **Índice mestre (81 aulas + módulos handcraft):** [`reference-mapeamento-curso-completo.md`](reference-mapeamento-curso-completo.md)  
> **Fonte pública:** [Gramática Completa — Elias Santana (Gran)](https://www.grancursosonline.com.br/cursos/por-materia/gramatica-para-concursos-publicos-professor-elias-santana)

---

## 1. Arquitetura do currículo (Gramática Completa — syllabus público)

### Trilho duplo

| Trilho | Função |
|--------|--------|
| **~81 videoaulas** | Teoria granular + aulas de exercícios por bloco |
| **5 PDFs morfossintaxe** | Período simples, período composto, pontuação, pronomes/SE, crase/acentuação — mapas + questões comentadas |

### Ordem macro (videoaulas)

1. Ortografia e acentuação (+ exercícios)  
2. Morfologia I–V (+ exercícios)  
3. Sintaxe do período simples → **Sujeito I–IV** (+ exercícios)  
4. Predicação verbal I–III (+ exercícios)  
5. Termos ligados ao nome (+ exercícios)  
6. Demais funções do PS  
7. Período composto (substantivas, adjetivas, adverbiais, coordenadas, reduzidas)  
8. Pontuação I–V (+ 2 exercícios)  
9. Pronomes e colocação (+ exercícios)  
10. Vozes verbais e SE (+ exercícios)  
11. Crase (+ exercícios)  
12. Reescrita, concordância especial, verbos, formação de palavras, fonética  

### Regra estrutural

**Cada bloco teórico** → **uma ou mais aulas de exercícios** com questões de banca comentadas.

No curso **Essencial — Temas Quentes** (30 aulas LP), a mesma lógica aparece comprimida (ex.: aulas 13–16 Sujeito, 17 Exercícios).

---

## 2. Os 7 pilares (expandido)

### Pilar A — Morfossintaxe integrada

- Morfologia = **preparo** para sintaxe, não fim em si.
- Período simples antes do composto.
- Classificação de palavra **na frase**, nunca em lista isolada.

### Pilar B — Pergunta-teste

Operacionaliza a análise. Se a pergunta não tem resposta clara, o termo **não é** aquela função.

**Ordem de ataque (período simples):**

```
1. Achar o VERBO (ou verbos principais)
2. Perguntar QUEM? → sujeito
3. Perguntar complementos (OD, OI, predicativo…)
4. O que sobra e modifica → adjuntos
5. Só então: morfologia das palavras relevantes
```

### Pilar C — Engenharia reversa

| Etapa | Pergunta do professor |
|-------|----------------------|
| Mapa | O que % das questões deste edital cobra neste tema? |
| Formato | VF, C/E, EXCETO, classificação, reescrita? |
| Pegadinha recorrente | Qual confusão a banca repete? |
| Decore | O que memorizar vs o que deduzir na hora |

### Pilar D — Taxonomia em camadas

Padrão observado na teoria de **Sujeito** (e replicável em outros temas):

```
NÍVEL 1 — Expresso | Não expresso | Inexistente
NÍVEL 2 — (ex.) Simples | Composto | Elíptico | Indeterminado
NÍVEL 3 — Anteposto | Posposto | Referente textual | Discurso 1ª/2ª/3ª pessoa
NÍVEL 4 — Exemplos numerados + contraexemplos
NÍVEL 5 — Obs. — distinção que cai em prova
```

### Pilar E — Par teoria / exercícios

| Teoria | Exercícios |
|--------|------------|
| Define e diferencia | Aplica em questão real |
| Poucos exemplos autorais | Muitas bancas |
| Sem “chute de letra” | Eliminação + gabarito |
| Mapa mental | Comentário linha a linha |

### Pilar F — Decore seletivo

**Memorizar (alta ROI em prova):**

- Conectivos e valores semânticos  
- Regências atípicas cobradas  
- Crase: funções que exigem / proíbem  
- Classes fechadas em contexto  
- SE (índice, partícula, pronome)  
- Listas fechadas de exceções **quando a banca repete**

**Deduzir (pergunta-teste):**

- Sujeito, OD, OI na maioria das questões  
- Classificação de orações com conectivo  

### Pilar G — Questão como fixação

Fechamento de toda unidade: **1 questão comentada** que usa só o que foi visto.

---

## 3. Distinções finas (alto valor em `danger_zone`)

| Confusão | Critério operacional |
|----------|----------------------|
| Elíptico × indeterminado | 3ª pl. **com** referente recuperável no texto → elíptico; **sem** referente → indeterminado |
| Sujeito × predicativo | Pergunta **Quem?** ao verbo vs **como é/fica** |
| Adjunto adnominal × complemento nominal | Modifica **nome** com/sem prep.; pergunta **de quê?** |
| Oração sem sujeito × indeterminado | Verbo **impessoal** (fenômenos, haver existencial, etc.) vs 3ª pl. sem referente |
| Anteposto × posposto | Posição **em relação ao verbo** — não muda o tipo de sujeito |
| Simples × composto | **Um** núcleo vs **dois ou mais** núcleos coordenados |

---

## 4. Mapa banca × método

| Banca | Como o método se adapta |
|-------|-------------------------|
| **FCC** | Gramática clássica; nomenclatura tradicional; pergunta-teste direta |
| **CEBRASPE** | C/E; literalidade; cuidado com “pode inferir-se” |
| **FGV** | Nuance semântica; conectivos; reescrita |
| **VUNESP** | Texto + morfologia/sintaxe no trecho |
| **IBFC / IADES / Quadrix** | EXCETO frequente; distrator “quase certo” |
| **CPCON / regionais** | Objetividade; decore seletivo |

No `logic_flow`: nomear o padrão **quando o `meta.banca` estiver preenchido**.

---

## 5. Mapa completo: camadas do método → NeuroSlides

### `concept_map` ← Teoria (camadas 1–3)

- `items[]`: 3–4 nós da taxonomia **do tema da questão**
- `footer_rule`: “Na prova, a banca confunde X com Y” (sem letra)
- Proibido: gabarito, eliminação de alternativas

**Exemplo (sujeito, conceito):**

| label | detail |
|-------|--------|
| Verbo primeiro | Ache o núcleo verbal antes de classificar |
| Quem? | Pergunta-teste do sujeito |
| Expresso × oculto | Visível na frase vs desinência/referente |
| Elíptico × indeterminado | Referente no texto: sim ou não? |

### `logic_flow` ← Exercícios / live

Steps típicos (`reveal_mode: "tap"`):

1. Comando — o que pede (CORRETA / EXCETO / classificação)  
2. Eixo — sujeito, regência, crase… em 1 frase  
3. Pergunta-teste aplicada ao enunciado  
4. Eliminar letra A — motivo específico  
5. Eliminar letra B — motivo específico  
6. …  
7. Gabarito — letra + prova em 1 frase  
8. Fixação — “Em similares: &lt;teste portátil&gt;”  

### `golden_rule` ← Teoria (decore / tabela)

- `rows[]` para taxonomias (tipos de sujeito, conectivos, crase)  
- `content` como título mnemônico opcional  
- Proibido: row “Gabarito letra X”

### `danger_zone` ← Distinções finas + exercícios

- 1 item por distrator errado  
- `correct` = por que a alternativa **parece** certa mas cai na distinção fina  
- `bullet_style: "x_icon"` quando comparar erro × certo  

---

## 6. Diferença: Gran teoria × YouTube live

| Aspecto | Gran (teoria) | YouTube / live banca |
|---------|---------------|----------------------|
| Ordem | Conceito → exemplo → questão | Questão → mapa da prova → conceito sob demanda |
| Ritmo | 25–45 min, slides | 50–60 min, oral |
| Fixação | Degravação + PDF módulo | Comentário ao vivo |
| Uso AVANT | `concept_map` + `golden_rule` | `logic_flow` + `danger_zone` |

**Persona unificada:** mesma pergunta-teste e mesma taxonomia; muda só a **ordem de revelação** nos slides (terreno antes vs eliminação primeiro).

---

## 7. Materiais de apoio (papéis)

| Material | Papel na persona |
|----------|------------------|
| **Degravação** | Roteiro textual da teoria; marcadores de tempo; exemplos numerados |
| **Slides do vídeo** | Mapa visual; tabelas |
| **PDF morfossintaxe** | Engenharia reversa + questões comentadas em bloco |
| **Caderno Gran Questões** | Banco para exercícios; filtro por assunto |
| **Lives** | Tom de eliminação e “achar gabarito antes de analisar tudo” |

**Proibido no AVANT:** colar parágrafos de degravação/PDF nos slides.

---

## 8. `meta` sugerido (handcraft PT método morfossintaxe)

```json
{
  "meta": {
    "topico": "Língua Portuguesa",
    "subtopico": "Sintaxe do período simples",
    "content_standard": "golden-v1",
    "family": "conceito",
    "pedagogical_branch": "pt_sintaxe_sujeito",
    "content_review": {
      "reviewed_at": "YYYY-MM-DD",
      "guideline_snapshot": "Gramática tradicional + pergunta-teste morfossintaxe",
      "exam_vs_current": "none"
    },
    "sources": [
      {
        "id": "bechara-ref",
        "tier": "B",
        "issuer": "Gramática tradicional",
        "title": "Nomenclatura escolar de referência em concurso",
        "covers": ["sintaxe"]
      }
    ]
  }
}
```

`pedagogical_branch` — usar quando o pacote PT tiver ramo em `BRANCH_DESIGN_MAP`; senão omitir.

---

## 9. Anti-padrões (não é o método)

- Classificar palavra fora de contexto  
- Dar 10 definições antes de 1 pergunta-teste  
- `danger_zone` com o mesmo `correct` em todos os itens  
- Aula sem fechar em questão  
- Nomenclatura alternativa sem avisar (elíptico = oculto = desinencial — **equivalentes didáticos**, avisar 1 vez)  
- Teoria de comunicação longa sem ligar à questão (discurso 1ª/2ª pessoa só quando o item exige)

---

## 10. Fontes públicas (formação e posicionamento)

- Licenciatura Letras — UnB  
- Mestrado: Gramática — Teoria e Análise — UnB  
- Gran: Gramática Completa (~81 aulas) + PDFs morfossintaxe  
- Mentoria “Português sem medo” — foco em clareza e o que cai em prova  

Uso interno AVANT: metodologia; **não** marca registrada do professor no player.
