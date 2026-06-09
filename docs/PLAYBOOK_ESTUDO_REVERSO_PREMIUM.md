# Playbook — Estudo Reverso Ultra Premium (AVANT)

Leitura estimada: **~12 minutos**. Guia para produzir e refatorar `reverse_study_slides` em escala, com foco **100% aprovação em concurso** (não conduta de plantão).

**Público:** agentes de conteúdo, Laboratório, revisores humanos.

**Fontes complementares:** [`AGENT_AVANT_TEMPLATES_E_LAYOUT.md`](AGENT_AVANT_TEMPLATES_E_LAYOUT.md) (subtópicos e layouts), [`AVANT_AGENT_SOURCES.md`](AVANT_AGENT_SOURCES.md) (índice), [`lib/validations.ts`](../lib/validations.ts) (limites Zod).

---

## 1. North star do produto

| Princípio | Regra |
|-----------|--------|
| Objetivo | Aluno **entender a questão** e **não errar questões parecidas** em provas de concurso |
| Jornada | `pergunta` (prova real) → `gabarito` → `estudo reverso` (4 NeuroSlides) |
| Questão | Espelho fiel do caderno: `instruction` + `options` — **sem** cola legal/didática |
| `text_fragment` | Só se existir **literalmente** no PDF (texto base, caso do caderno) — **não** usar para Art./mnemônico |
| Fora de escopo | Plantão, conduta clínica, “onde o TEC atua na UBS” — outro produto |

Referências legais, tabelas e mnemônicos ficam **nos slides**, depois da tentativa.

---

## 2. Pacote fixo: 4 slides

Sempre um de cada tipo, nesta ordem narrativa no player:

| Ordem | `type` | Função (concurso) |
|-------|--------|-------------------|
| 1 | `concept_map` | Mapa do que **esta banca/tema** cobra na questão |
| 2 | `golden_rule` | O que **não esquecer na prova** (dispositivo, fórmula, mnemônico) |
| 3 | `logic_flow` | **Como chegar na letra certa** sozinho (estratégia reproduzível) |
| 4 | `danger_zone` | **Por que cada distrator erra** + erros que se repetem no **mesmo assunto** |

Formato **plano** (`items` / `content` / `steps` no mesmo nível que `type`). Ver [`avant-agent-json.mdc`](cursor/avant-agent-json.mdc).

---

## 3. Famílias pedagógicas (receitas)

**Família** = tipo de questão de prova (4–6 receitas). **Subtópico** = assunto no catálogo (41 nomes) → cor e layout automáticos. **Não** confundir: família manda **conteúdo**; subtópico manda **visual**.

### 3.1 Legislação / dispositivo legal

**Quando usar:** enunciado cita lei, artigo, “de acordo com…”, “constitui…”, COFEN, SUS, etc.

| Slide | Preencher |
|-------|-----------|
| `concept_map` | Lei, artigo central, termos obrigatórios do dispositivo, padrão da banca, “não confundir com lei X” |
| `golden_rule` | Preferir `rows` + `layout_variant: "reference_table"`; mnemônico dos blocos legais |
| `logic_flow` | Comando → identificar lei → artigo → blocos do dispositivo → testar A–E → marcar → fixação |
| `danger_zone` | Cada letra errada + 2–4 confusões **deste tema** (outra lei, princípio vs composição) |

**Golden:** [`examples/questao-premium-sus-lei-8080-cesgranrio.json`](../examples/questao-premium-sus-lei-8080-cesgranrio.json)

**Visual premium:** subtópicos “compact” (ex.: Promoção à Saúde) exigem override explícito: `morphological`, `reference_table`, `cards`, `compare`. Opcional `template: "t04"` (amber) no `golden_rule` para clima legislação.

---

### 3.2 Protocolo / parâmetro de prova

**Quando usar:** sequência de conduta, proporções, valores numéricos cobrados (RCP, SV, oxigenoterapia como **prova** cobra).

| Slide | Preencher |
|-------|-----------|
| `concept_map` | Etapas do protocolo, parâmetros numéricos, prioridades **literais de prova** |
| `golden_rule` | `rows` com números (30:2, 100–120/min…) ou frase-gatilho; `banner`/`reference_table` |
| `logic_flow` | Sequência de decisão **como a banca ordena** — `reveal_mode: "tap"` |
| `danger_zone` | O que a banca **inverte** (ordem, tempo, proporção, frequência) |

**Golden:** [`examples/questao-premium-urgencias-rcp.json`](../examples/questao-premium-urgencias-rcp.json)

**Visual:** subtópico Urgências já mapeia layouts fortes (`molecular`, `banner`, `cards`) — overrides opcionais.

---

### 3.3 Cálculo / dose / infusão

**Quando usar:** conta, conversão, gts/min, mg, diluição, regra de três.

| Slide | Preencher |
|-------|-----------|
| `concept_map` | Fórmula, grandezas, conversões, unidades |
| `golden_rule` | `rows`: fórmula + exemplo numérico tipo prova |
| `logic_flow` | Dados → conversão → conta → conferir unidade → alternativa |
| `danger_zone` | Casa decimal, divisor invertido, unidade errada, arredondamento |

**Subtópico canônico:** `Cálculo de Administração de Medicamentos e Infusões`

**Golden:** a criar em `examples/` quando houver questão referência validada.

---

### 3.4 Afirmativas I / II / III (V/F)

**Quando usar:** “É correto o que se afirma em…”, itens I, II, III no `instruction`.

| Slide | Preencher |
|-------|-----------|
| `concept_map` | Um item por afirmativa — V ou F + motivo curto |
| `golden_rule` | Regra que monta a combinação (“só I”, “I e II”, etc.) |
| `logic_flow` | Avaliar I → II → III → combinar → conferir letra |
| `danger_zone` | Pegadinha **por item** (ex.: III parece certa mas viola protocolo/leia) |

**Golden:** usar questões com I/II/III existentes no catálogo após refatoração premium.

---

### 3.5 Conceito / definição / comparação

**Quando usar:** “Assinale a alternativa correta sobre…”, anatomia, SAE, princípios, classificações.

| Slide | Preencher |
|-------|-----------|
| `concept_map` | 3–6 conceitos relacionados, hierarquia ou pares |
| `golden_rule` | Mnemônico único (`content`) ou `rows` curtos se houver lista fixa |
| `logic_flow` | Exclusão por termo-chave, definição vs exemplos |
| `danger_zone` | Termos parecidos, inversão, generalização indevida |

---

## 4. Fluxo de produção (por questão)

```
1. Classificar FAMÍLIA (§3)
2. Preencher meta.subtopico (nome exato — §6 de AGENT_AVANT_TEMPLATES_E_LAYOUT.md)
3. question_data = prova real (sem cola)
4. Escrever 4 slides (texto específico desta questão)
5. Se subtópico usa layouts "compact/grid/horizontal/list" → aplicar overrides premium (§5)
6. QuestaoCompletaSchema.safeParse + preview no Laboratório
7. Checklist anti-repetição (§7)
```

---

## 5. Visual ultra premium

### 5.1 Automático vs override

O mapa `SUBTOPIC_DESIGN_MAP` em [`themeGenerator.ts`](../components/slides/core/themeGenerator.ts) define cor + layout padrão. Subtópicos “compactos” **bloqueiam** auto-upgrade para `reference_table` e `compare` quando o mapa impõe `compact`.

**Solução:** declarar `layout_variant` explícito quando o objetivo é vitrine premium:

| Slide | Layout premium típico |
|-------|------------------------|
| `concept_map` | `morphological` (3+ itens) |
| `golden_rule` com `rows` | `reference_table` |
| `logic_flow` novo | `cards` + `reveal_mode: "tap"` |
| `danger_zone` com `correct` | `compare` + `bullet_style: "x_icon"` |

### 5.2 Campos que melhoram percepção (sem mudar código)

- `slide_title` — capa contextual do slide
- Ícones Lucide **distintos** e semânticos no `concept_map`
- `footer_rule` — mnemônico de uma linha (máx. 500 caracteres)
- Densidade equilibrada: `detail`/`step` até 500 chars; evitar parede de texto

### 5.3 Limites Zod (resumo)

| Campo | Máx. |
|-------|------|
| `concept_map` items | 20 |
| `logic_flow` steps | 15 |
| `golden_rule` rows | 12 |
| `danger_zone` items | 10 |
| `label` / `detail` / `step` | 200 / 500 / 500 |

---

## 6. Evidências e UX — por que o formato AVANT funciona

Não existe cor (emerald vs rose) **comprovada** para aumentar retenção. Existem **princípios** de design instrucional com evidência robusta ou moderada. A tabela liga **recurso do JSON/player** → **princípio** → **objetivo no concurso**.

| Recurso AVANT | Princípio (ciência da aprendizagem) | Efeito para o aluno |
|---------------|--------------------------------------|---------------------|
| Questão limpa, sem `text_fragment` didático | **Testing effect** (prática de recuperação) | Tentar antes de ver a explicação fixa melhor retenção |
| Fluxo pergunta → gabarito → estudo | **Feedback imediato** + orientação | Sabe se errou e **onde** ir aprender |
| 4 slides segmentados | **Segmentação** (Multimedia Learning, Mayer) | Pedaços digestíveis vs parede única |
| `logic_flow` + `reveal_mode: "tap"` | **Segmentação + interação** | Revela passo a passo; reduz sobrecarga |
| `prefers-reduced-motion` no player | **Acessibilidade** | Revela tudo de uma vez se o dispositivo pedir |
| Shell: chip + “Slide N de M” | **Sinalização** (signaling) | Orienta onde está na jornada |
| `slide_title`, labels curtos | **Sinalização** | Atenção no que importa |
| `concept_map` + ícones Lucide | **Codificação dupla** (texto + ícone semântico) | Fixa conceito se ícone for significativo (não decorativo) |
| `danger_zone` + `correct` + `compare` | **Contiguidade espacial** + discriminação | Errado e certo **lado a lado** — core de pegadinha de prova |
| `golden_rule` + `rows` | **Organização referencial** | Tabela rótulo × valor para decore de prova |
| Hierarquia visual (glass, hierarquia tipográfica) | **Coerência** + carga cognitiva extrínseca baixa | Menos ruído = mais foco no conteúdo |
| Toolbar A+/A− (mobile) | **Legibilidade** | Conforto de leitura ≠ decoração |
| Variedade por subtópico (41 temas) | **Variedade perceptiva** | Mesma estrutura, “cara” diferente — reduz fadiga |
| Foco concurso (sem plantão) | **Coerência de objetivo** | Alinhamento com meta do aluno (aprovação) |

### 6.1 O que **não** substitui conteúdo

- Tema `t04` ou animação Framer **motivam** e transmitem qualidade; **não** ensinam Art. 4º sozinhos.
- Gamificação pesada tem evidência **mista** — AVANT prioriza progresso real (concluir estudo, acertar similares) sobre confete.

### 6.2 Métricas sugeridas (produto)

Para validar se o premium “está funcionando”:

- Taxa de **conclusão** dos 4 slides
- **Retorno** ao mesmo subtópico
- Acerto em **questões similares** (mesmo assunto/banca) após estudo reverso

---

## 7. Anti-repetição (checklist de qualidade)

Estrutura **pode** repetir entre questões; **texto genérico** não.

Antes de publicar, responder:

1. **Este conteúdo só faz sentido nesta questão?** Se puder colar em qualquer questão da família sem editar → reescrever.
2. **`danger_zone` nomeia as letras erradas desta prova?** Mínimo: distractors A–E reais quando houver 5 alternativas.
3. **`logic_flow` menciona comando/enunciado ou alternativas concretas?** Passos genéricos (“elimine alternativas”) são fracos.
4. **`footer_rule` é mnemônico desta questão/tema**, não frase copiada do playbook?
5. **Ícones repetidos** (`BookOpen` × 4)? Trocar por ícones semânticos distintos.
6. **Transferência no danger:** no máximo 2–4 itens “de outras provas do mesmo tema” — não o mesmo kit em toda legislação.
7. **Questão sem cola:** nenhum dispositivo legal no `text_fragment` que não exista no PDF.

---

## 8. Exemplos golden (referência)

| Família | Arquivo |
|---------|---------|
| Legislação | [`questao-premium-sus-lei-8080-cesgranrio.json`](../examples/questao-premium-sus-lei-8080-cesgranrio.json) |
| Protocolo | [`questao-premium-urgencias-rcp.json`](../examples/questao-premium-urgencias-rcp.json) |
| Logic flow tap (mínimo) | [`questao-preview-logic-flow-tap.json`](../examples/questao-preview-logic-flow-tap.json) |

Cálculo, I/II/III e conceito: adicionar novos golden em `examples/` conforme questões forem refatoradas.

---

## 9. Checklist rápido (publicação)

- [ ] `meta`: banca, prova, orgao, ano, topico, **subtopico canônico**; `cargo_header` quando TEC
- [ ] `question_data`: instruction + options — **sem** cola didática; `text_fragment` só se no PDF
- [ ] 4 slides: `concept_map`, `golden_rule`, `logic_flow`, `danger_zone`
- [ ] Família correta (§3); conteúdo **específico** da questão
- [ ] `logic_flow`: `reveal_mode: "tap"`; `steps` = array de strings
- [ ] `danger_zone`: `content` + items com `label`, `detail`, **`correct`**
- [ ] `golden_rule`: `content` e/ou `rows`; `reference_table` quando tabela
- [ ] Overrides premium se subtópico compact (§5)
- [ ] `QuestaoCompletaSchema` OK
- [ ] Anti-repetição (§7)

---

## Referências externas (leitura opcional)

- Mayer, R. E. — *Multimedia Learning* (segmentação, sinalização, contiguidade, coerência)
- Sweller, J. — Cognitive Load Theory (carga intrínseca vs extrínseca)
- Roediger & Butler — testing effect (prática de recuperação)
- Kurosu & Kashimura — aesthetic-usability effect (percepção de qualidade)
