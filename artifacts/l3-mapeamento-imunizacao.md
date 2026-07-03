# Mapeamento L3 — Imunização

**Gerado:** 2026-07-02  
**Subtópico:** Imunização (canônico)  
**Pacote:** `imunizacao` · **575 slugs**  
**Fontes:** `artifacts/imunizacao-topic-cluster-report.json` · `artifacts/l3-mold-gap-audit.md` (se existir) · `handcraft-playbooks/imunizacao.json`

---

## Fase 0 — Escopo

| Campo | Valor |
|-------|-------|
| `pacote_prefix` | `imunizacao` |
| `total_slugs` | 575 |
| Cluster script | `npm run cluster:imunizacao` |
| `drift_total` | 0 |
| Goldens em `examples/` | 6 âncoras P0 (playbook + AVANÇASP cadeia frio B) |

---

## Fase 3 — Decisão por ramo

| Ramo (`pedagogical_branch`) | Slugs | % | Decisão L3 | Pacote atual | Pacote ideal | Brief 4/4 | Próximo passo |
|-----------------------------|-------|---|------------|--------------|--------------|-----------|---------------|
| `imunizacao_calendario` | ~356 | 62% | `molde_redesign` | bespoke 4/4 implementado | `vaccine-timeline` · `pni-calendar-board` · `pni-calendar-elimination-tap` · `calendar-mismatch` | **Feito** → [`l3-brief-imunizacao-imunizacao_calendario.md`](l3-brief-imunizacao-imunizacao_calendario.md) | Handcraft lotes calendário |
| `imunizacao_cadeia_frio` | ~68 | 12% | `molde_redesign` | bespoke 4/4 implementado | `cold-chain-hub` · `pni-temperature-rail` · `pni-cold-chain-tap` · `temperature-mismatch` | **Feito** → [`l3-brief-imunizacao-imunizacao_cadeia_frio.md`](l3-brief-imunizacao-imunizacao_cadeia_frio.md) | Handcraft lotes g02+ (cadeia frio) |
| `imunizacao_vf_intervalos` | 18 | 3,1% | `molde_redesign` | pni-rules-deck · pni-interval-matrix · pni-vf-juggle-tap · pni-trap-chips | mesmo pacote (contrato formalizado) | **Feito** → [`l3-brief-imunizacao-imunizacao_vf_intervalos.md`](l3-brief-imunizacao-imunizacao_vf_intervalos.md) | Handcraft slugs V/F |
| `imunizacao_generico` | ~133 | 23% | `ok_generico` | compare · tap · reference_table | genérico | — | Handcraft com compare semântico |

### Cauda longa (`ok_generico`)

| Cluster | Slugs | Motivo |
|---------|-------|--------|
| Contraindicações / eventos adversos | 1 | volume &lt;5 |
| Técnica sala (absorvido) | 11 | absorver em `imunizacao_generico` |
| Tipos de vacina / imunobiológicos | 8 | &lt;10% — cauda longa |

### Goldens âncora recomendados

| Ramo | Slug amostra | Arquivo `examples/` |
|------|--------------|------------------------|
| `imunizacao_vf_intervalos` | `cpcon-uepb-enfermagem-imunizacao-1779563975447-5` | `questao-premium-cpcon-imunizacao-intervalos-vf.json` |
| `imunizacao_calendario` (infantil) | `adm-tec-enfermagem-atencao-basica-saude-da-familia-1778968156152-4` | `questao-premium-fundatec-meningococica-3meses.json` |
| `imunizacao_calendario` (adolescente) | `adm-tec-enfermagem-imunizacao-1779563986606-5` | `questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json` |
| `imunizacao_cadeia_frio` (V/F sala) | `ameosc-enfermagem-processo-de-enfermagem-1780005791580-3` | `questao-premium-ameosc-imunizacao-vf-cadeia-frio.json` |
| `imunizacao_cadeia_frio` (faixa 2–8 °C) | `avancasp-enfermagem-processo-de-enfermagem-1780011872350-6` | `questao-premium-avancasp-imunizacao-rede-frio-temperatura.json` |
| `imunizacao_generico` | `ameosc-enfermagem-imunizacao-1779572207173-9` | `questao-premium-decorp-imunizacao-triplice-viral-via.json` |

---

## Ordem sugerida de execução

1. ~~`imunizacao_vf_intervalos` — brief 4/4~~ ✅
2. ~~`imunizacao_calendario` — brief 4/4 + React~~ ✅
3. ~~`imunizacao_cadeia_frio` — brief 4/4 + React~~ ✅
4. Handcraft lotes `imunizacao-g02+` (cadeia frio) e `imunizacao-g07+` (calendário)
5. `imunizacao_generico` + cauda longa — handcraft genérico sem brief

---

## Riscos

- `contract_fail_total`: 522 — handcraft deve corrigir L2, não só L3
- Ramo calendário muito amplo — pode subdividir em infantil × adolescente na Fase 3b
- Moldes PNI atuais no `SUBTOPIC_DESIGN_MAP` global de Imunização — ramos fortes devem usar `BRANCH_DESIGN_MAP`, não só fallback do subtópico

---

*Próximo passo:* handcraft lotes `imunizacao-g02+` (cadeia frio) · piloto player: [`artifacts/spot-check-imunizacao-cadeia-frio.html`](spot-check-imunizacao-cadeia-frio.html)
