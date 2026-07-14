# BRIEF DE VARIANTES — Saúde do Adolescente / adolescente_violencia_protecao

**Gerado:** 2026-07-13  
**Política:** `ok_generico` (2 slugs — 12,5%)  
**Família:** `protocolo` · `legis` · `certo_errado`  
**Template:** `sky` (t08)  
**Âncoras amostra:** `funcern-…9064-1` · `cpcon-uepb-…7068-6`  
**Pacote atual:** `ADOLESCENTE_GENERIC_DESIGN`

---

## 0. Erro pedagógico típico

Violência sexual / indicadores / rede de proteção: confundir **notificação compulsória** com quebra de sigilo arbitrária, ou omitir acolhimento e encaminhamento à rede (Conselho Tutelar, CVV, serviço especializado).

**Decisão L3:** layouts genéricos com `compare` — erro é **fluxo normativo + EXCETO**, não geometria de faixas.

**Nota:** overlap parcial com `adolescente_etica_sigilo` quando o enunciado ancora sigilo; inferência prioriza **violência/indicadores** → este ramo.

---

## 1. Pacote atual (implementado)

| Slide | Layout | Função semântica |
|-------|--------|------------------|
| `concept_map` | `morphological` | Atores da rede (CT, CREAS, saúde, escola) |
| `golden_rule` | `reference_table` | Prazos, leis, fluxo SINAN / ECA |
| `logic_flow` | `vertical` + `tap` | Sequência acolher → proteger → notificar |
| `danger_zone` | `compare` | Pegadinhas de omissão ou notificação errada |

**Propositalmente sem** moldes `adolescent-consent-gate` — volume baixo; genérico compare já ensina distrator × correto.

---

## 2. Conteúdo handcraft (L2)

- Enfatizar **acolhimento sem revitimização** no concept_map.
- `golden_rule.rows`: lei/fluxo em tabela (ECA, SINAN, PNAISN).
- `logic_flow`: passos que separam “escuta” de “ação obrigatória de proteção”.
- `danger_zone`: cada item com `correct` distinto (não colar texto do gabarito em todas as letras).

---

## 3. Bespoke futuro (condicional)

**Trigger:** ≥5 slugs e erro espacial em **ordem do fluxo** (pular etapa na cadeia de proteção).

**Metáfora proposta:** `adolescent-protection-network` — grafo/nós da rede (saúde → CT → judiciário); logic_flow ilumina caminho; danger_zone marca nó errado.

**Até lá:** genérico premium.

---

## 4. Anti-padrões

| Proibido | Motivo |
|----------|--------|
| Forçar pacote ética `adolescent-*` em todo violência | Só quando corpus = escuta/sigilo consultório |
| Trilho Z / PNI / outros ramos | `detectSlideTopicDrift` |
| Gabarito nos slides 1–2 | Spoiler |

---

## 5. DoD

- [x] Ramo + inferência violência/indicadores
- [x] 2/2 slugs no cluster
- [ ] Bespoke rede — aguardar volume ≥5

**Status:** genérico premium em produção.
