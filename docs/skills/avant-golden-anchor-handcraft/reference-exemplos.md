# Exemplos mini (calibragem)

**Não copiar** estes textos em handcraft. Use só a **estrutura**. Âncoras reais: `examples/questao-premium-*.json` (matriz em [`reference-ancoras.md`](reference-ancoras.md)).

---

## 1. VF (I–IV) — estrutura boa

Gabarito fictício: **E** = II e III apenas. I e IV falsas.

```json
{
  "meta": {
    "family": "vf",
    "content_standard": "golden-v1",
    "subtopico": "Vias de Administração"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Formato", "detail": "Quatro afirmativas I–IV; combine antes de marcar a letra.", "icon": "Target" },
        { "label": "Trilho I", "detail": "Banca inverte velocidade IM × SC — músculo é mais vascularizado.", "icon": "TrendingUp" },
        { "label": "Pegadinha-âncora", "detail": "IV cita nervo/vaso no ventroglúteo para desqualificar sítio seguro.", "icon": "AlertTriangle" },
        { "label": "II e III", "detail": "Palpar marcos + reduzir tensão muscular = técnica correta.", "icon": "CheckCircle" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Formato: julgar I→IV, depois achar a combinação na letra.",
        "I FALSA: IM absorve mais rápido que SC (mais vasos no músculo).",
        "II VERDADEIRA: palpar marcos ósseos e conhecer riscos do sítio.",
        "III VERDADEIRA: palpar endurecimento + posicionar + distrair = menos dor.",
        "IV FALSA: ventroglúteo é seguro — longe de nervos/vasos principais.",
        "Eliminar A/B/C/D: todas incluem I ou IV.",
        "Marcar E (II e III). Em similares: IM>SC em velocidade; ventroglúteo é sítio preferencial."
      ]
    },
    {
      "type": "golden_rule",
      "content": "IM — absorção e sítio",
      "rows": [
        { "label": "IM × SC", "value": "IM mais rápida (mais vascularização)" },
        { "label": "Ventroglúteo", "value": "Preferencial — longe de nervo ciático" },
        { "label": "Antes da IM", "value": "Palpar marcos + excluir endurecimento" }
      ]
    },
    {
      "type": "danger_zone",
      "content": "Combinações que a banca planta",
      "items": [
        {
          "label": "Marcar I verdadeira",
          "detail": "Confunde vascularização músculo × hipoderme",
          "correct": "I é falsa: IM é mais rápida que SC"
        },
        {
          "label": "Marcar IV verdadeira",
          "detail": "Acha que profundidade = risco de nervo",
          "correct": "IV é falsa: ventroglúteo é sítio seguro"
        },
        {
          "label": "Letra com I+II+III",
          "detail": "Quase certo — leva a I falsa junto",
          "correct": "Descarte qualquer combinação com I"
        },
        {
          "label": "Em outra banca",
          "detail": "Pode cobrar ângulo 90° ou volume por sítio",
          "correct": "Mesmo trilho: julgue item a item antes da letra"
        }
      ]
    }
  ]
}
```

**Sinais de qualidade VF**
- `concept_map` sem letra/combinação.
- Fluxo julga **cada romano** → só depois a letra.
- `danger_zone` ataca **combinações/itens falsos**, não “Letra B” forçada.
- Último step = fixação portátil (`Em similares:`).

---

## 2. EXCETO / INCORRETA — estrutura boa

Gabarito fictício: **A** = a única INCORRETA (inverte: mais sangue → absorção mais lenta).

```json
{
  "meta": {
    "family": "certo_errado",
    "content_standard": "golden-v1",
    "subtopico": "Vias de Administração"
  },
  "reverse_study_slides": [
    {
      "type": "concept_map",
      "items": [
        { "label": "Comando", "detail": "Assinale a INCORRETA — quatro vias/técnicas certas; uma inverte fisiologia.", "icon": "Target" },
        { "label": "Pegadinha-âncora", "detail": "Inverter relação suprimento sanguíneo × velocidade de absorção.", "icon": "AlertTriangle" },
        { "label": "EV irritante", "detail": "EV evita lesão tecidual de soluções irritantes (B correta).", "icon": "Syringe" },
        { "label": "SC proteico", "detail": "Proteínas SC porque VO destruiria no trato digestivo (D correta).", "icon": "Pill" }
      ]
    },
    {
      "type": "logic_flow",
      "reveal_mode": "tap",
      "steps": [
        "Comando INCORRETA: achar a única falsa; as outras são conduta/conceito certo.",
        "A inverte: mais sangue no músculo → absorção MAIS RÁPIDA, não mais lenta.",
        "B correta: EV para irritantes que lesariam SC/IM.",
        "C correta: intratecal = espaço ao redor da medula via vértebras.",
        "D correta: SC para muitos proteicos (VO destruiria).",
        "E correta: IM usa agulha mais longa (abaixo de pele/tecido adiposo).",
        "Marcar A. Em similares: no EXCETO, justifique por que cada distrator é certo."
      ]
    },
    {
      "type": "golden_rule",
      "content": "Absorção parenteral",
      "rows": [
        { "label": "Mais sangue", "value": "Absorção mais rápida" },
        { "label": "IM × SC", "value": "IM em geral mais rápida que SC" },
        { "label": "Comando EXCETO", "value": "4 certas + 1 invertida" }
      ]
    },
    {
      "type": "danger_zone",
      "content": "Distratores = conduta correta; só o gabarito é a falha",
      "items": [
        {
          "label": "Letra A — gabarito (INCORRETA)",
          "detail": "Afirma que mais sangue atrasa a absorção",
          "correct": "Falso: mais perfusão → absorção mais rápida"
        },
        {
          "label": "Letra B — EV irritante",
          "detail": "Parece agressivo demais",
          "correct": "É correto: EV evita lesão se irritante em SC/IM"
        },
        {
          "label": "Letra C — intratecal",
          "detail": "Anatomia parece exótica",
          "correct": "É correto: agulha no espaço peri-medular"
        },
        {
          "label": "Letra D — SC proteico",
          "detail": "Confunde com VO",
          "correct": "É correto: proteína VO seria destruída"
        },
        {
          "label": "Letra E — agulha IM longa",
          "detail": "Acha exagero de comprimento",
          "correct": "É correto: músculo está mais profundo"
        },
        {
          "label": "Em outra banca",
          "detail": "Comando vira CORRETA em vez de INCORRETA",
          "correct": "Inverta o alvo: agora a letra da falha vira distrator"
        }
      ]
    }
  ]
}
```

**Sinais de qualidade EXCETO**
- Cada letra errada (B–E) explica por que é **correta**.
- Só o card do gabarito (A) aponta a falha.
- Transferência separada (“Em outra banca…”).
- Sem frase-coringa tipo “errado porque não é a exceção”.

---

## 3. Anti-exemplos (rejeitar)

| Padrão | Por que falha |
|--------|----------------|
| `concept_map`: `"Gabarito letra E"` | Spoiler antes do fluxo |
| `logic_flow`: `"A diz que… B diz que…"` | Reciclagem de alternativas |
| EXCETO `correct` idêntico em B–E | Frase-coringa |
| VF `danger_zone` só com "Letra A/B/C" sem I–IV | Família VF cobrada por romano |
| Último step: `"Marcar E"` sem `Em similares:` | Sem fixação portátil |
| Copiar ≥8 palavras da âncora real | Imitar estrutura, não texto |

Voltar ao fluxo: [`SKILL.md`](SKILL.md).
