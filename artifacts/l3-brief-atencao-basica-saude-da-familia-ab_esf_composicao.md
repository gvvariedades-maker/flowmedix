# Brief L3 — Atenção Básica / Saúde da Família — ab_esf_composicao

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Atenção Básica / Saúde da Família |
| `pacote_prefix` | `atencao-basica-saude-da-familia` |
| `branch_id` | `ab_esf_composicao` |
| Família dominante | `conceito` · `legis` · `vf` · `certo_errado` |
| Decisão L3 | `molde_inedito` |
| Volume | 18 / 171 (limiar 18) — ramo forte |
| Âncora | *pendente Fase 0.5* — escolher slug eSF (composição / 4.000 / ribeirinha) |
| Erro espacial (1 frase) | Aluno confunde **núcleo eSF** com **NASF/eMulti/apoio** ou inventa membro (motorista, especialista) como se fosse obrigatório no núcleo. |

**Metáfora única 4/4:** órbita da equipe — núcleo fixo no centro; anéis de apoio (NASF/eMulti, modalidades ribeirinha) fora do núcleo; trap = "puxar" alguém do anel para o centro.

Calibração: Art. 4º SUS orbit · Adolescente ética.

---

## Pacote L3 (4× layout_variant)

| # player | `type` | `layout_variant` | Metáfora (1 frase) |
|---------:|--------|------------------|---------------------|
| 1 | `concept_map` | `ab-esf-orbit-deck` | Núcleo eSF + anéis (apoio / modalidade) |
| 2 | `logic_flow` | `ab-esf-tap-flow` | Eliminar quem **não** é núcleo → confirmar carga/teto → gabarito |
| 3 | `golden_rule` | `ab-esf-reference-board` | Tabela: composição mínima · teto 4.000 · ribeirinha (dias/carga) |
| 4 | `danger_zone` | `ab-esf-scope-trap` | Pegadinha "membro fantasma" no núcleo × correto no anel |

---

## Slots por slide

### 1 · concept_map — ab-esf-orbit-deck

| Slot | Papel | Exemplo label | Gatilhos em detail |
|------|-------|---------------|-------------------|
| Centro | Núcleo mínimo | Médico · enfermeiro · TE/AE · ACS | PNAB / eSF |
| Anel 1 | Apoio | NASF / eMulti | matriciamento · não substitui núcleo |
| Anel 2 | Modalidade | Ribeirinha / fluvial | dias mensais · carga 8h |

**Gesto:** ver quem está no **centro** vs **órbita** → **Estado final:** núcleo fechado; apoio nomeado mas fora.

### 2 · logic_flow — ab-esf-tap-flow

`reveal_mode: "tap"` · 4–6 passos

| Passo | Decisão |
|-------|---------|
| 1 | A prova cobra **composição**, **carga** ou **modalidade**? |
| 2 | Eliminar quem é NASF/apoio/logística (não núcleo) |
| 3 | Checar número (teto pop. / dias ribeirinha) se houver |
| 4 | Confirmar gabarito |

### 3 · golden_rule — ab-esf-reference-board

| rows[].label | value (≤110c) |
|--------------|---------------|
| Núcleo eSF | Médico + enfermeiro + TE/AE + ACS (conforme PNAB cobrada) |
| Teto populacional | Até 4.000 pessoas / equipe (média recomendada na prova) |
| Ribeirinha | Atendimento mínimo em dias/mês + equivalência 8h/dia (texto da banca) |

Sem row "Gabarito letra X".

### 4 · danger_zone — ab-esf-scope-trap

| label | Erro | correct (único) |
|-------|------|-----------------|
| Letra distrator | Coloca NASF/motorista/especialista no **núcleo** | Esse profissional é **apoio/logística**, não composição mínima eSF |
| … | Troca teto/dias | Número da norma/prova (fonte em meta.sources) |

**Par concept_map ↔ danger_zone:** centro da órbita = quem **não** pode ser "inventado" no trap.

---

## Contrato JSON (palavras-gatilho)

```text
concept_map.items[].detail: núcleo, eSF, ACS, NASF, eMulti, ribeirinha, adscrição
logic_flow.steps: eliminar anel → checar número → gabarito
golden_rule.rows: PNAB / Portaria 2.436 / carga — sem "Gabarito letra X"
danger_zone.items[].correct: 1 frase por distrator — sem repetir entre letras
```

Fontes tier A: Portaria GM/MS 2.436/2017 (PNAB); consolidação APS quando a prova citar.

---

## Gate Fase 3b

- [x] Metáfora única 4/4 (órbita núcleo × anéis)
- [x] 4× layout_variant nomeados
- [x] Erro espacial em 1 frase
- [x] Contrato JSON + gatilhos
- [x] Wire gesto → estado final
- [x] Par concept_map ↔ danger_zone
- [ ] React: 375px · 0 hardcode gabarito · ≤7 slots — **após** `Implementar molde: ab_esf_composicao`
- [x] Path: `artifacts/l3-brief-atencao-basica-saude-da-familia-ab_esf_composicao.md`

**Handcraft:** pode usar layouts genéricos emerald + `meta.pedagogical_branch: "ab_esf_composicao"` até o React bespoke.

**Próximo:** `Criar âncoras:` (Fase 0.5) · depois `Handcraft: … g01`.
