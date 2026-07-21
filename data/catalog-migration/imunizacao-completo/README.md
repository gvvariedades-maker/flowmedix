# Imunização — handcraft golden-v1

**Subtópico:** Imunização  
**Modo:** Handcraft golden-v1 (legacy builder → re-handcraft)  
**Status:** **`production_ready`** — **575/575** handcraft · lotes **g01–g83** · vendável desde **2026-07-19**

Runbook: [`docs/GOLDEN_HANDCRAFT_MODEL.md`](../../docs/GOLDEN_HANDCRAFT_MODEL.md) · [`docs/HANDCRAFT_CONVERSA.md`](../../docs/HANDCRAFT_CONVERSA.md) · [`docs/QUALITY_VENDAVEL_CONVERSA.md`](../../docs/QUALITY_VENDAVEL_CONVERSA.md)

## Catálogo

| Item | Valor |
|------|--------|
| Slugs no manifest | 575 (`imunizacao-completo/manifest.json`) |
| Handcraft aplicado | **575/575** (`handcraft-meta.json` · 2026-07-03) |
| `production_status` | **`production_ready`** (2026-07-19) |
| Ramos L3 | `imunizacao_vf_intervalos` · `imunizacao_calendario` · `imunizacao_cadeia_frio` · `imunizacao_exceto` · `imunizacao_generico` |
| Playbook | [`handcraft-playbooks/imunizacao.json`](../handcraft-playbooks/imunizacao.json) |
| Moldes bespoke wired | PNI vf · calendário · cadeia frio (`lib/slides/pedagogicalBranch.ts`) |
| Próximo passo | Monitoramento: `audit:subtopico-health -- --subtopico="Imunização"` |
| **Não usar** | `ai:generate` · `catalog:upgrade-premium` |

## Disparar qualidade vendável

```text
Qualidade vendável: Imunização
```

```bash
npm run reconcile:handcraft-manifest -- --subtopico="Imunização"
npm run audit:handcraft-dod -- --subtopico="Imunização"
npm run audit:subtopico-quality -- --subtopico="Imunização" --promote
```

---
## imunizacao-g69 (exported — handcraft pendente)

| Slug | Banca | Cluster | Ramo | Gabarito |
|------|-------|---------|------|----------|
| `inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-6` | INAZ Pará | Cadeia frio I–III | cadeia_frio | B (I+III) |
| `instituto-consulpam-enfermagem-processo-de-enfermagem-1780005320352-7` | Consulpam | Sítio alternativo | calendario | D |
| `legalle-enfermagem-processo-de-enfermagem-1780010585356-6` | Legalle | Via endovenosa | generico | C |
| `legalle-enfermagem-processo-de-enfermagem-1780011879977-9` | Legalle | Volume intradérmica | generico | A (0,1 mL) |
| `instituto-consulplan-enfermagem-imunizacao-1779572198133-7` | Consulplan | EXCETO BCG | exceto | B |
| `legalle-enfermagem-imunizacao-1779572166628-3` | Legalle | EXCETO equipe móvel | exceto | D |
| `idecan-enfermagem-imunizacao-1778712281975-8` | IDECAN | Certo/errado pneumo idoso | exceto | B (Errado) |
| `igeduc-enfermagem-imunizacao-1779564035545-0` | Igeduc | Certo/errado tétano | calendario | B (Errado) |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` **8/8 [READY]**.

## imunizacao-g73 (exported — handcraft pendente)

## imunizacao-g74 (handcraft_ready — P1 pós g73)

| Slug | Banca | Cluster | Ramo | Gabarito |
|------|-------|---------|------|----------|
| `fcpc-enfermagem-processo-de-enfermagem-1780004628956-7` | FCPC | Cadeia de frio | cadeia_frio | C (2–8 °C) |
| `fundatec-enfermagem-processo-de-enfermagem-1780006954613-5` | Fundatec | Cadeia de frio / sala | cadeia_frio | A (luvas não rotina) |
| `ibade-enfermagem-processo-de-enfermagem-1780005137458-4` | IBADE | Cálculo + influenza | cadeia_frio | A (5 mL + 125 mL/h) |
| `idecan-enfermagem-imunizacao-1778712281975-1` | IDECAN | Multidose DTP | cadeia_frio | B (bula pós-abertura) |
| `instituto-consulplan-enfermagem-imunizacao-1779564053668-2` | Consulplan | EXCETO IST | exceto | B (hepatite C sem vacina) |
| `instituto-consulplan-enfermagem-imunizacao-1779564085730-9` | Consulplan | FA gestante | exceto | A (vírus atenuado) |
| `cebraspe-cespe-enfermagem-imunizacao-1779572171486-8` | CEBRASPE | C/E gestante | calendario | B (Errado — SCR na gestação) |
| `cebraspe-cespe-enfermagem-processo-de-enfermagem-1780001790945-3` | CEBRASPE | C/E calendário | calendario | A (Certo — todas as idades) |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` **8/8 [READY]** · **8** arquivos em `imunizacao-g74/questions/`.

## imunizacao-g75 (handcraft_ready — P1 pós g74)

| Slug | Banca | Cluster | Ramo | Gabarito |
|------|-------|---------|------|----------|
| `igeduc-enfermagem-imunizacao-1779563986606-8` | Igeduc | Cadeia frio | cadeia_frio | A (evento 9 °C — isolar/notificar) |
| `instituto-consulplan-enfermagem-imunizacao-1779564085730-1` | Consulplan | Cadeia frio | cadeia_frio | B (frigobar proibido) |
| `legalle-enfermagem-imunizacao-1779572166628-2` | Legalle | Rede serviços I–IV | vf_intervalos | E (todas corretas) |
| `sc-treinamentos-enfermagem-imunizacao-1779564071106-2` | Sc Treinamentos | Rede frios V/F | cadeia_frio | B (I, III, IV, V) |
| `unifil-enfermagem-imunizacao-1779564031957-2` | Unifil | EXCETO idoso | exceto | A (febre amarela) |
| `unifil-enfermagem-imunizacao-1779572220683-3` | Unifil | EXCETO pentavalente EA | exceto | D (paralisia) |
| `idecan-enfermagem-imunizacao-1778712281975-7` | IDECAN | Certo/errado | calendario | A (Hep B ao nascer) |
| `igeduc-enfermagem-imunizacao-1779564048247-0` | Igeduc | Certo/errado HPV×SCR | exceto | B (Errado) |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` **8/8 [READY]** · **8** ficheiros em `imunizacao-g75/questions/`.

## Cauda final g76–g83 (handcraft_ready — 2026-07-03)

Últimos **64** slugs do manifest `imunizacao-completo`. Exportados de Supabase, handcraft golden-v1 substituindo builder legado.

| Lote | Foco | Ramo predominante |
|------|------|-------------------|
| **g76** | VUNESP cadeia frio / bloqueio SCR / EXCETO gestante / V/F tipos vacina | `cadeia_frio` · `calendario` · `exceto` · `vf_intervalos` |
| **g77** | Calendário infantil + adolescente (cartão perdido) | `calendario` |
| **g78** | Calendário adulto/idoso + BCG + contraindicação | `calendario` |
| **g79** | Gestante/puerpera + calendário adulto | `calendario` |
| **g80** | HPV campanhas + Igeduc C/E | `calendario` · `generico` |
| **g81** | Igeduc/Quadrix C/E + Moderna Covid + VCV + recusa vacinal | `generico` |
| **g82** | Mix EXCETO / V/F / SCR via / varíola / antirrábica / auditoria sala | ramo por enunciado |
| **g83** | Raiva · janela imunológica · rede frio gestão (Univali) · misc AB/ISTS | `generico` · `cadeia_frio` |

Validação por lote: `audit:questao-readiness --strict-v2-pedagogy` · `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` → **8/8 [READY]** em todos.

Âncoras: `avancasp-rede-frio-temperatura` · `fundatec-meningococica` · `agirh-incorreta` · `cpcon-intervalos-vf` · `decorp-triplice-viral-via`.

## imunizacao-g62 (handcraft_ready — P1 cadeia frio + EXCETO + V/F)

| Slug | Banca | Cluster | Ramo | Gabarito |
|------|-------|---------|------|----------|
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-7` | CPCON UEPB | Calendário gestante | calendario | E (dTpa, Hep B, influenza) |
| `cpcon-uepb-enfermagem-imunizacao-1779564040128-1` | CPCON UEPB | Cadeia frio | cadeia_frio | C (resíduos perfurocortantes) |
| `cpcon-uepb-enfermagem-imunizacao-1779564040128-2` | CPCON UEPB | Cadeia frio | cadeia_frio | E (assepsia só com sujidade) |
| `cpcon-uepb-enfermagem-imunizacao-1779564044052-2` | CPCON UEPB | Cadeia frio | cadeia_frio | D (ampola de vidro) |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-8` | CPCON UEPB | EXCETO | exceto | D (seringas pré-preenchidas) |
| `cpcon-uepb-enfermagem-imunizacao-1779564040128-0` | CPCON UEPB | EXCETO | exceto | D (assepsia rotineira) |
| `fauel-enfermagem-imunizacao-1777103251447-4` | Fauel | V/F intervalos | vf_intervalos | A (Qdenga I+II) |
| `cebraspe-cespe-enfermagem-imunizacao-1777103238173-1` | CEBRASPE | Certo/errado | calendario | B (raiva aguda, não crônica) |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g72 (exported — handcraft pendente)

| Slug | Banca | Cluster | Ramo | Gabarito |
|------|-------|---------|------|----------|
| `unifil-enfermagem-imunizacao-1779572220683-1` | Unifil | Cadeia de frio | cadeia_frio | C |
| `unifil-enfermagem-imunizacao-1779572220683-2` | Unifil | Cadeia de frio | generico | A |
| `unifil-enfermagem-imunizacao-1779572220683-9` | Unifil | Cadeia de frio | cadeia_frio | E |
| `unifil-enfermagem-imunizacao-1779572227744-2` | Unifil | Cadeia de frio | calendario | B |
| `ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-5` | MS Sarmento | EXCETO | exceto | C |
| `reis-e-reis-enfermagem-imunizacao-1777103182944-2` | Reis E Reis | EXCETO | exceto | C |
| `igeduc-enfermagem-imunizacao-1779564040128-4` | Igeduc | Certo ou errado | cadeia_frio | B |
| `igeduc-enfermagem-imunizacao-1779564040128-5` | Igeduc | Certo ou errado | calendario | B |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g71 (exported — handcraft pendente)

| Slug | Banca | Cluster | Ramo | Gabarito |
|------|-------|---------|------|----------|
| `unifil-enfermagem-imunizacao-1779572227744-3` | Unifil | Cadeia de frio | calendario | D (rotavírus oral) |
| `unifil-enfermagem-imunizacao-1779572227744-5` | Unifil | Cadeia de frio | calendario | A (busca ativa) |
| `unifil-enfermagem-processo-de-enfermagem-1780003645544-6` | Unifil | Cadeia de frio | calendario | D (vias lacunas) |
| `unifil-enfermagem-processo-de-enfermagem-1780004452857-6` | Unifil | Cadeia de frio | cadeia_frio | A (V/F rede frios) |
| `ufmt-enfermagem-imunizacao-1777103251447-3` | Ufmt | EXCETO | exceto | C (SCR ≠ coqueluche) |
| `unesc-enfermagem-imunizacao-1780001148264-0` | Unesc | EXCETO | calendario | A (influenza inativada) |
| `igeduc-enfermagem-imunizacao-1779564044052-6` | Igeduc | Certo ou errado | exceto | A (pentavalente) |
| `igeduc-enfermagem-imunizacao-1779564044052-7` | Igeduc | Certo ou errado | exceto | B (SCR trabalhador) |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g70 (handcraft_ready — P1 cadeia frio + EXCETO + certo/errado)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `selecon-enfermagem-imunizacao-1779564001927-5` | Selecon | Faixa térmica 2–8 °C | A |
| `selecon-enfermagem-imunizacao-1779564001927-6` | Selecon | Contraindicação vivo atenuado | C |
| `unesc-enfermagem-imunizacao-1779563975447-3` | Unesc | V/F cadeia de frio I–III | E |
| `unifil-enfermagem-imunizacao-1779564006577-9` | Unifil | Organização geladeira PNI | D |
| `legalle-enfermagem-processo-de-enfermagem-1780010579953-8` | Legalle | EXCETO — 10 passos cobertura | A |
| `legalle-enfermagem-processo-de-enfermagem-1780010917301-1` | Legalle | INCORRETA — BCG contraindicação | B |
| `igeduc-enfermagem-imunizacao-1779564035545-1` | Igeduc | Soro antidiftérico | Certo |
| `igeduc-enfermagem-imunizacao-1779564035545-2` | Igeduc | VOP rotina 4a11m29d | Certo |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g58 (handcraft_ready)

P1 pós-calendário (g42) — 4 cadeia frio · 2 EXCETO · 1 V/F · 1 C/E HPV.

| Slug | Banca | Cluster | Ramo |
|------|-------|---------|------|
| `fepese-enfermagem-imunizacao-1777103270218-0` | FEPESE | Cadeia frio | cadeia_frio |
| `fgv-enfermagem-imunizacao-1779563992006-8` | FGV | Cadeia frio | cadeia_frio |
| `fumarc-enfermagem-imunizacao-1779564006577-8` | FUMARC | Cadeia frio | cadeia_frio |
| `idecan-enfermagem-imunizacao-1777103277533-5` | IDECAN | Cadeia frio | cadeia_frio |
| `idecan-enfermagem-imunizacao-1777103277533-4` | IDECAN | EXCETO | exceto |
| `idecan-enfermagem-imunizacao-1778712281975-0` | IDECAN | EXCETO | exceto |
| `ms-sarmento-enfermagem-imunizacao-1777103244679-7` | MS Sarmento | V/F intervalos | vf_intervalos |
| `cebraspe-cespe-enfermagem-imunizacao-1779572166628-1` | CEBRASPE | Certo/errado | calendario |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g57 (handcraft_ready)

2º lote P1 pós-calendário (g42). **Manifest idêntico ao g60** — não aplicar os dois.

| Slug | Banca | Cluster | Ramo | Gabarito |
|------|-------|---------|------|----------|
| `cpcon-uepb-enfermagem-imunizacao-1779564001927-7` | CPCON UEPB | Cadeia frio | cadeia_frio | C |
| `cpcon-uepb-enfermagem-imunizacao-1779564011849-3` | CPCON UEPB | Cadeia frio | cadeia_frio | D |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-3` | CPCON UEPB | Cadeia frio | generico | E |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-4` | CPCON UEPB | Cadeia frio | cadeia_frio | C |
| `com-exam-pref-bauru-enfermagem-imunizacao-1779564053668-0` | Com Exam Bauru | EXCETO | vf_intervalos | D |
| `copese-ufpi-enfermagem-imunizacao-1779564079834-5` | Copese UFPI | EXCETO | exceto | C |
| `fau-unicentro-enfermagem-imunizacao-1779572180830-4` | FAU Unicentro | V/F intervalos | vf_intervalos | D |
| `cebraspe-cespe-enfermagem-imunizacao-1777103238173-0` | CEBRASPE | Certo/errado | generico | B |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g60 (handcraft_ready)

| Slug | Banca | Cluster | Tema | Gabarito |
|------|-------|---------|------|----------|
| `cpcon-uepb-enfermagem-imunizacao-1779564001927-7` | CPCON UEPB | Cadeia frio | Falta de energia — transferência | C |
| `cpcon-uepb-enfermagem-imunizacao-1779564011849-3` | CPCON UEPB | Cadeia frio | Limpeza refrigerador — início da semana | D |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-3` | CPCON UEPB | Cadeia frio | Resíduos sala — perfurocortante | E |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-4` | CPCON UEPB | Cadeia frio | NÃO — câmara junto à janela/sol | C |
| `com-exam-pref-bauru-enfermagem-imunizacao-1779564053668-0` | Com Exam Bauru | EXCETO | Intervalos SP — rotavírus idade máxima | D |
| `copese-ufpi-enfermagem-imunizacao-1779564079834-5` | Copese UFPI | EXCETO | ACS RN — tetravalente ao nascer | C |
| `fau-unicentro-enfermagem-imunizacao-1779572180830-4` | FAU Unicentro | V/F intervalos | Polio VIP/VOP — assertivas II e III | D |
| `cebraspe-cespe-enfermagem-imunizacao-1777103238173-0` | CEBRASPE | Certo/errado | Vacinas precisam ser mortas — atenuadas existem | B |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g65 (handcraft_ready)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `fau-unicentro-enfermagem-imunizacao-1779564085730-8` | FAU Unicentro | Hepatite B — faixa 2–8 °C | E |
| `fau-unicentro-enfermagem-imunizacao-1779572180830-3` | FAU Unicentro | Rede de Frio V/F I–IV | B |
| `fau-unicentro-geral-imunizacao-1777103238173-4` | FAU Unicentro | dTpa — composição D+T+coqueluche | D |
| `fcm-enfermagem-imunizacao-1779564096589-1` | FCM | Equipamentos cadeia de frio | C |
| `idecan-enfermagem-imunizacao-1780066977710-7` | IDECAN | EXCETO influenza grupos risco 2016 | A |
| `inaz-do-para-enfermagem-imunizacao-1777103277533-7` | INAZ do Pará | INCORRETA — vacinas 100% eficazes | D |
| `univida-enfermagem-imunizacao-1777103204932-2` | Univida | V/F calendário adulto dTpa/FA/SCR | D |
| `cebraspe-cespe-enfermagem-imunizacao-1779572171486-8` | CEBRASPE | C/E gestante — SCR na gravidez | B |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g67 (handcraft_ready)

| Slug | Banca | Cluster | Tema | Gabarito |
|------|-------|---------|------|----------|
| `selecon-enfermagem-imunizacao-1779564001927-5` | Selecon | Cadeia frio | Temperatura positiva 2–8 °C | A |
| `selecon-enfermagem-imunizacao-1779564001927-6` | Selecon | Cadeia frio | Contraindicação vivo atenuado — imunodeficiência | C |
| `unesc-enfermagem-imunizacao-1779563975447-3` | Unesc | Cadeia frio | V/F I/II/III — freezer universal falso | E |
| `unifil-enfermagem-imunizacao-1779564006577-9` | Unifil | Cadeia frio | Organização refrigerador doméstico PNI | D |
| `instituto-consulplan-enfermagem-imunizacao-1779564090395-2` | Consulplan | EXCETO | Calendário — BCG revacinação sem cicatriz | C |
| `instituto-consulplan-enfermagem-imunizacao-1779564113760-1` | Consulplan | EXCETO | Influenza LAIV — gestante é exceção | D |
| `idecan-enfermagem-imunizacao-1778712281975-8` | IDECAN | Certo/errado | Pneumo idoso institucionalizado — reforço fixo | B |
| `igeduc-enfermagem-imunizacao-1779564035545-0` | Igeduc | Certo/errado | Imunidade antitetânica — doença não imuniza | B |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g63 (exported — handcraft pendente)

3/8 slugs overlap **g68** (educa/epl/facape). Sem `questions/` — reexecutar handcraft dos 5 slugs únicos.

| Slug | Banca | Cluster | Tema | Gabarito |
|------|-------|---------|------|----------|
| `educa-pb-enfermagem-imunizacao-1779564011849-4` | Educa PB | Cadeia frio | Imunidade ativa × passiva — orientação | B |
| `epl-concursos-enfermagem-imunizacao-1779572236985-4` | EPL | Cadeia frio | Abertura sala — mapa de temperatura | A |
| `facape-enfermagem-imunizacao-1779563986606-1` | Facape | Cadeia frio | Erro vacinal — notificar SI-PNI | D |
| `facet-enfermagem-imunizacao-1779564006577-5` | Facet | Cadeia frio | Frasco multidose — seringa individual | E |
| `cpcon-uepb-enfermagem-imunizacao-1779564044052-1` | CPCON | EXCETO | INCORRETA — faixa −2 a +8 °C | B |
| `fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-3` | Fênix | EXCETO | INCORRETA — dispensar preventivo pós-diagnóstico | D |
| `fauel-enfermagem-imunizacao-1777103264001-1` | Fauel | V/F intervalos | HPV4 — afirmativas II e III | C |
| `cebraspe-cespe-enfermagem-imunizacao-1777103238173-2` | CEBRASPE | Certo/errado | Via subcutânea (hipodérmica) — definição | A |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g61 (handcraft_ready)

| Slug | Banca | Cluster | Tema | Gabarito |
|------|-------|---------|------|----------|
| `ameosc-enfermagem-processo-de-enfermagem-1780005791580-3` | AMEOSC | Cadeia frio | V/F BCG · cadeia · penta · técnico | C |
| `cogeps-unioeste-enfermagem-imunizacao-1779572207173-0` | Cogeps Unioeste | Cadeia frio | Caixa térmica — sol e calor | C |
| `cotec-fadenor-enfermagem-imunizacao-1777103264001-2` | Cotec Fadenor | Genérico | Objetivo da imunização — prevenção | B |
| `cotec-fadenor-enfermagem-imunizacao-1779572215875-7` | Cotec Fadenor | Cadeia frio | Rede de frio × cadeia de frio | A |
| `avancasp-enfermagem-imunizacao-1779564129617-0` | AVANÇASP | EXCETO | Atenuadas — exceção febre amarela | D |
| `cogeps-unioeste-enfermagem-imunizacao-1779564119665-6` | Cogeps Unioeste | Calendário | Sarampo — trabalhador saúde 2 doses | D |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-6` | CPCON UEPB | Cadeia frio | I/II/III sustentabilidade PNI | B |
| `cebraspe-cespe-enfermagem-imunizacao-1777103230085-8` | CEBRASPE | Certo/errado | Imunidade — defesa contra microrganismos | A |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g68 (handcraft_ready)

| Slug | Banca | Cluster | Tema | Gabarito |
|------|-------|---------|------|----------|
| `educa-pb-enfermagem-imunizacao-1779564011849-4` | Educa PB | Cadeia frio | Imunidade ativa × passiva — orientação APS | B |
| `epl-concursos-enfermagem-imunizacao-1779572236985-4` | EPL | Cadeia frio | Abertura sala — mapa de temperatura | A |
| `facape-enfermagem-imunizacao-1779563986606-1` | Facape | Cadeia frio | Erro vacinal — notificar SI-PNI | D |
| `fafipa-enfermagem-processo-de-enfermagem-1780009386446-2` | Fafipa | Cadeia frio | Caixa térmica — Produto Termolábil | B |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-8` | CPCON | EXCETO | INCORRETA — seringa na caixa térmica | D |
| `cpcon-uepb-enfermagem-imunizacao-1779564040128-0` | CPCON | EXCETO | EXCETO — assepsia água/sabão | D |
| `fauel-enfermagem-imunizacao-1777103251447-4` | Fauel | V/F intervalos | Qdenga — I e II corretas | A |
| `cebraspe-cespe-enfermagem-imunizacao-1777103238173-1` | CEBRASPE | Certo/errado | Raiva aguda — não crônica | B |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g50 (handcraft_ready — reatribuição g46)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `copese-ufpi-geral-imunizacao-1779564079834-8` | Copese UFPI | Ao nascer — BCG + Hep B | B |
| `fafipa-enfermagem-processo-de-enfermagem-1780009386446-8` | Fafipa | 2 meses — VIP no bloco | D |
| `fau-unicentro-enfermagem-processo-de-enfermagem-1780002217274-7` | FAU Unicentro | NÃO corresponde — VEPIS inventado | E |
| `cpcon-uepb-enfermagem-processo-de-enfermagem-1780003654722-3` | CPCON UEPB | Idoso ≥60a — Hep B, dT, influenza, COVID | B |
| `avancasp-enfermagem-processo-de-enfermagem-1780006456417-4` | AVANÇASP | Hep B profissional — 0-30-60 dias | C |
| `cpcon-uepb-enfermagem-processo-de-enfermagem-1780007238824-0` | CPCON UEPB | Catch-up 5m7d — vacinas pendentes | E |
| `amauc-enfermagem-vias-de-administracao-1776056374837-2` | Amauc | Pentavalente 4m — via IM vasto lateral | E |
| `cev-urca-enfermagem-vias-de-administracao-1776056427936-7` | CEV URCA | Pentavalente — IM vasto lateral | E |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g53 (exported — handcraft pendente)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `fumarc-enfermagem-vias-de-administracao-1776056383154-0` | Fumarc | Tetraviral 15m — via SC | D |
| `fepese-enfermagem-saude-da-mulher-1777104323066-5` | FEPESE | HPV dose única 2024 (9–14 anos) | E |
| `fundatec-enfermagem-processo-de-enfermagem-1780001903454-1` | Fundatec | Idoso ≥60 — febre amarela com risco | C |
| `fundatec-enfermagem-processo-de-enfermagem-1780006947080-2` | Fundatec | VSR gestante — 28 semanas | D |
| `idib-enfermagem-nocoes-de-fisiologia-1778934957741-1` | Idib | BCG — peso, via ID, HIV exposto | D |
| `furb-enfermagem-processo-de-enfermagem-1780011908736-7` | Furb | V/F I+III — Covid 6m, HPV, VSR gestante | E |
| `instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-5` | AOCP | Spikevax 6m — 2×0,25 mL IM | D |
| `idecan-enfermagem-saude-do-idoso-1778712437306-7` | IDECAN | Idoso — farmacovigilância | C |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g56 (exported — handcraft pendente)

1º lote P1; 4 slugs overlap g51 (superseded). Sem `questions/` — reexecutar handcraft.

## imunizacao-g64 (exported — handcraft pendente)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `facet-enfermagem-imunizacao-1779564006577-5` | Facet | Frasco multidose VV — seringa individual | E |
| `fau-unicentro-enfermagem-imunizacao-1779563992006-4` | Fau Unicentro | Influenza tetravalente = 4 cepas | D |
| `fau-unicentro-enfermagem-imunizacao-1779564071106-0` | Fau Unicentro | SCR — agente etiológico viral | B |
| `fau-unicentro-enfermagem-imunizacao-1779564085730-6` | Fau Unicentro | Definição Rede de Frio PNI | D |
| `fumarc-enfermagem-imunizacao-1777103251447-2` | Fumarc | EXCETO SCR — VV na gestação | A |
| `ibfc-enfermagem-imunizacao-1779564063274-4` | IBFC | EXCETO adiar VV — doença leve sem febre | D |
| `ms-sarmento-enfermagem-imunizacao-1777103230085-7` | MS Sarmento | V/F calendário infantil I–V | D |
| `cebraspe-cespe-enfermagem-imunizacao-1779572166628-0` | Cebraspe | C/E BCG faixa etária errada | B |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## Lotes superseded

| Lote | Canônico | Motivo |
|------|----------|--------|
| `g43` | `g42` | manifest idêntico (8 slugs VUNESP calendário) |
| `g44` | `g42` | manifest idêntico |
| `g49` | `g42` | manifest idêntico; sem `questions/` handcraftadas |
| `g46` | `g50` | slugs calendário reatribuídos (paths processo/vias/geral) |

## imunizacao-g51 (exported — handcraft pendente)

Manifest P1 cadeia de frio exportado (8 slugs abaixo); **sem** `questions/` — reexecutar handcraft+validação.

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `cogeps-unioeste-enfermagem-imunizacao-1779572207173-0` | Cogeps Unioeste | Caixa térmica — sol e calor | C |
| `cotec-fadenor-enfermagem-imunizacao-1777103264001-2` | Cotec Fadenor | Objetivo da imunização — prevenção | B |
| `cotec-fadenor-enfermagem-imunizacao-1779572215875-7` | Cotec Fadenor | Rede de frio × cadeia de frio | A |
| `cpcon-uepb-enfermagem-imunizacao-1779563996663-7` | CPCON UEPB | Frasco multidose — solução no frasco | A |
| `cpcon-uepb-enfermagem-imunizacao-1779564001927-7` | CPCON UEPB | Falta de energia — transferência | C |
| `cpcon-uepb-enfermagem-imunizacao-1779564011849-3` | CPCON UEPB | Limpeza refrigerador — estoque reduzido | D |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-3` | CPCON UEPB | Resíduos sala — perfurocortante | E |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-4` | CPCON UEPB | NÃO — câmara junto à janela/sol | C |

## imunizacao-g55 (handcraft_ready — tail P0-adjacent + P1)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `legalle-enfermagem-imunizacao-1779572166628-4` | Legalle | RH sala vacinação — I/II/III | C |
| `omni-enfermagem-imunizacao-1779572171486-6` | Omni | Via IM tetravalente por idade | B |
| `quadrix-enfermagem-imunizacao-1779563961175-3` | Quadrix | Rotavírus oral + higiene fralda | A |
| `unifil-enfermagem-imunizacao-1779572220683-0` | Unifil | BCG intradérmica — tuberculose | D |
| `unifil-enfermagem-imunizacao-1779572220683-5` | Unifil | Hep B — HBsAg recombinante | B |
| `vunesp-enfermagem-imunizacao-1779564090395-3` | VUNESP | Imunidade passiva | A |
| `vunesp-enfermagem-imunizacao-1779564125198-4` | VUNESP | Planejamento — rede frio + doses | E |
| `cpcon-uepb-enfermagem-imunizacao-1779564035545-5` | CPCON UEPB | EXCETO — reencapar agulha | D |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g54 (handcraft_ready)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `cetrede-enfermagem-imunizacao-1777103215560-0` | Cetrede | Hep B dose única ao nascer | E |
| `funcern-enfermagem-imunizacao-1777103238173-5` | FUNCERN | Soro antirrábico — imunodeprimidos | A |
| `funcern-enfermagem-imunizacao-1777103244679-4` | FUNCERN | Pneumo 10 — dose e via IM | A |
| `furb-enfermagem-imunizacao-1779564071106-8` | Furb | Imunidade passiva natural (IgG/IgA) | C |
| `ibade-enfermagem-imunizacao-1777103230085-3` | Ibade | Tetraviral — dose e via SC | C |
| `ibade-enfermagem-imunizacao-1777103270218-2` | Ibade | Tétano ferimento — última dose >5 anos | D |
| `ibgp-enfermagem-imunizacao-1779572166628-9` | Ibgp | Ig/sangue — adiar vivas atenuadas | B |
| `idcap-enfermagem-imunizacao-1779564096589-3` | Idcap | Tipos de vacina — rubéola atenuada | B |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g52 (handcraft_ready)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-3` | FAU Unicentro | Pentavalente = 5 doenças | E |
| `fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-0` | FAU Unicentro | Penta — esquema básico 3 doses | C |
| `fcpc-enfermagem-processo-de-enfermagem-1780004628956-8` | FCPC | Rotavírus catch-up 3m5d | C |
| `fau-unicentro-enfermagem-processo-de-enfermagem-1780009379028-1` | FAU Unicentro | dT gestante — volume padrão | A |
| `fepese-enfermagem-processo-de-enfermagem-1780002217274-0` | FEPESE | BCG — via intradérmica | E |
| `fcm-geral-imunizacao-1779564090395-8` | FCM | V/F febre amarela calendário 2020 | A |
| `fepese-enfermagem-vias-de-administracao-1776056383154-5` | FEPESE | Vias BCG/VIP/VFA/rotavírus | B |
| `fepese-enfermagem-processo-de-enfermagem-1780008232871-9` | FEPESE | Influenza puérpera — prazo pós-parto | E |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## imunizacao-g42 (canônico — tail P0 VUNESP)

| Slug | Banca | Tema | Gabarito |
|------|-------|------|----------|
| `vunesp-enfermagem-imunizacao-1779563992006-3` | Vunesp | UCIN — dTpa + varicela suscetível | D |
| `vunesp-enfermagem-imunizacao-1779563996663-1` | Vunesp | HPV — faixa 9–14 anos | A |
| `vunesp-enfermagem-imunizacao-1779564001927-1` | Vunesp | 15 meses — DTP + VIP + Hep A + tetraviral | A |
| `vunesp-enfermagem-imunizacao-1779564059030-3` | Vunesp | Gestante — dTpa nova gestação | E |
| `vunesp-enfermagem-imunizacao-1779564090395-4` | Vunesp | Prevenção colo — HPV + papanicolau | C |
| `vunesp-enfermagem-imunizacao-1779564096589-4` | Vunesp | Influenza ocupacional — via IM | E |
| `vunesp-enfermagem-imunizacao-1779564096589-6` | Vunesp | Tipos de vacina — HPV inativado | E |
| `vunesp-enfermagem-imunizacao-1779572207173-4` | Vunesp | Rotavírus — limite 3m15d 1ª dose | D |

Validação: `validate:goldens --strict` · `slug-alignment --strict` · `numeric-factcheck` · `audit:questao-readiness` 8/8 [READY].

## Primeiro slug handcraft (referência)

| Slug | Gabarito | Ramo |
|------|----------|------|
| `decorp-enfermagem-vias-de-administracao-1776056357082-0` | A | `imunizacao_generico` |

## Próximo passo

1. Apply lotes `handcraft_ready` (`catalog:apply-lote --apply` por lote)
2. Planejar **g62** — P1 cadeia de frio / EXCETO
3. Apply **`g61`** quando aprovado (`catalog:apply-lote --apply`)
