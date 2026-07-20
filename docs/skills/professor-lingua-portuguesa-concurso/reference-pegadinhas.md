# Referência — Pegadinhas por eixo (Língua Portuguesa)

Complemento da skill `professor-lingua-portuguesa-concurso`. Cada item deve virar conteúdo **bespoke** da questão — não copiar frases entre slugs.

---

## Interpretação de texto

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Extrapolação | Parece “óbvio” pelo senso comum | Voltar ao trecho; sublinhar verbos modais |
| Generalização | Um exemplo vira regra universal | “O texto fala de **caso** ou de **todos**?” |
| Opinião do candidato | Concordância ideológica com o autor | Separar fato do texto × julgamento pessoal |
| Paráfrase falsa | Sinônimo que muda causa/efeito | Comparar conectivos e tempo verbal |
| “Sempre/nunca” | Absolutos raramente estão no texto | Caçar quantificadores no original |

**Fixação portátil:** *Texto não diz = não marca.*

---

## Concordância

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Sujeito atrás do verbo | Concorda com o vizinho | Achar **núcleo** do sujeito |
| Sujeito composto pós-posto | “A maioria… concordam” | Núcleo + regra de partitivo/coletivo |
| “Um dos que…” | Plural na oração relativa | Analisar o antecedente de “que” |
| Pronome relativo | “Eu, que **foi**…” | Retomar o antecedente correto |
| **Haver** impessoal | “Haviam problemas” | Haver existencial = **haver** (singular) |
| Porcentagem | “50% dos alunos **fez**…” | Parte × todo (banca varia — provar na frase) |
| Sujeito oracional | “Fazer exercícios **é**…” / “**São**…” | Tratar oração como núcleo |

**`golden_rule` sugerido:** row com “Núcleo do sujeito = …” + exemplo da questão.

---

## Regência

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| **Assistir** (ver × prestar) | Mesmo verbo, regências opostas | Contexto: paciente × jogo |
| **Implicar** (acarretar × envolver) | Sentido muda a preposição | Substituir por sinônimo-teste |
| **Visar** (mirar × ter como fim) | Com ou sem “a” | Olhar o complemento |
| **Namorar / obedecer** | Verbo transitivo direto | Sem preposição |
| Regência nominal | “Acessível **a**” / “obediência **a**” | Nome + preposição fixa do dicionário de prova |
| Pronome relativo | “Cidade **que** precisamos **de**” | Retomar antecedente + regência do verbo |

**danger_zone:** cada letra errada = regência **correta** em outro contexto (EXCETO).

---

## Crase

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Antes de masculino | “A + o” → ao, não à | Masculino = **sem** crase |
| Antes de verbo | “Vou **a** fazer” | Verbo = **sem** crase (salvo locução feminina fixa) |
| Locução adverbial feminina | “Às vezes” × “a tempo” | Lista de locuções da prova |
| Pronome demonstrativo | “A **aquela** hora” | Pronome: em geral **sem** crase |
| Artigo facultativo | “Meia hora” / “à meia-noite” | Banca define — provar na frase |
| Paroxítona terminada em a | “Na porta” (sem crase) | Não confundir com “à porta” (sentido) |

**Teste portátil (golden_rule):** substituir por **à casa** — se soar mal, provavelmente sem crase.

**Guideline:** `lib/guidelines/linguaPortuguesa/crase.ts`

---

## Colocação pronominal

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Próclise no início | “Me diga” (fala) | Norma culta: ênclise se verbo inicia o período |
| Ênclise após negação | “Não diga-me” | Negação atrai → próclise |
| Mesóclise com atrativo | “Não dir-lhe-ei” | Atrativo + futuro → próclise |
| Ênclise no particípio | “entregue-me” no particípio | Particípio não admite ênclise |
| o/a após R/S/Z | “fazer-o” | Forma **lo/la** e cai a consonante (fazê-lo) |
| Imperativo negativo | “Não diga-me” | Imperativo negativo → próclise |

**Guideline:** `lib/guidelines/linguaPortuguesa/colocacaoPronominal.ts`

---

## Pontuação

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Vírgula sujeito–verbo | Pausa na fala | Sujeito **nunca** separado do verbo nuclear |
| Aposto × vocativo | Nomes próprios | Aposto explica; vocativo chama |
| Oração subordinada adverbial | Vírgula “opcional” muda sentido | Antes/depois do conectivo |
| “Que” relativo restritivo | Vírgula cria aposto | Restritivo: sem vírgula |
| Dois-pontos × ponto e vírgula | Lista × orações relacionadas | Função sintática de cada lado |

---

## Ortografia e AO1990

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Hífen em compostos | AO1990 simplificou casos | Verificar se é composto **claro** ou **não** |
| Acento em paroxítonas | Regra geral × exceção | Terminação da sílaba tônica |
| Homônimos | “Mas/mais”, “mal/mau” | Sentido na frase |
| “Por que / porque / porquê” | Função (interrogativo, causal, substantivo) | Substituir por “por qual motivo” / “o motivo” |
| Grafia antiga no texto | Prova antiga × AO1990 | Gabarito da prova + `exam_vs_current` |

---

## Sintaxe e orações

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Coordenada × subordinada | Conjunção “e” ambígua | Teste de dependência |
| Adverbial final × causal | “Porque” polissêmico | “Para quê?” vs “por qual motivo?” |
| Adjetiva restritiva × explicativa | Vírgula | Restritiva = essencial |
| Oração sem sujeito | “Choveu” | Sujeito indeterminado / inexistente |
| Predicativo × objeto | “Ele está **feliz**” | Ligado ao sujeito × verbo transitivo |

**Âncora legada:** `examples/questao-oracao-subordinada-final.json` (reescrever, não copiar).

---

## Morfologia e formação

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Prefixo × sufixo | “Re-escrever” | Processo de formação |
| Derivação × composição | “Guarda-chuva” | 1 ou 2 radicais |
| Estrangeirismo × neologismo | “Hashtag” | Empréstimo vs criação |
| Classe gramatical | “O **novo** plano” (adj × adv) | Função na oração, não só forma |

**Âncora legada:** `examples/questao-formacao-palavras-siglas.json`.

---

## Coesão e conectivos

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| “Mas” × “porém” | Mesma função, registro | Coerência com o parágrafo |
| Conectivo causal falso | “Logo” sem conclusão lógica | Relação real entre orações |
| Anáfora | “Isso” sem referente claro | Achar o antecedente |
| Repetição vs elipse | Economia textual | O que foi omitido? |

---

## Semântica e figuras

| Pegadinha | Por que atrai | Como desarmar |
|-----------|---------------|---------------|
| Sinonímia imperfeita | Palavras “parecidas” | Campo semântico + contexto |
| Polissemia | Mesma palavra, sentidos | Frase completa |
| Ironia | Sentido oposto ao literal | Tom do autor |
| Metáfora × comparação | Presença de “como” | Figura nomeada |

---

## EXCETO / INCORRETA — regra de ouro

1. Leia o comando **em voz alta** com a palavra-chave (EXCETO / INCORRETA).
2. Para **cada** letra que não é gabarito: explique **por que seria correta** em outro enunciado.
3. Só então marque a exceção com a **regra violada**.

Proibido: usar o texto do gabarito como `correct` em todos os itens da `danger_zone`.

---

## Densidade nos cards (lembrete)

| Campo | Alvo |
|-------|------|
| `detail` / `step` / `value` | ≤110 chars |
| 1 ideia por card | não misturar 2 eixos |

Ver `avant-golden-anchor-handcraft` §3b.
