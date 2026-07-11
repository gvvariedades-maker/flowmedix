# BRIEF DE VARIANTES — Cuidados na Administração de Medicamentos / cam_generico

**Gerado:** 2026-07-10  
**Política:** `ok_generico` (cauda longa + clusters absorvidos — molde SUBTOPIC_DESIGN_MAP padrão)  
**Família:** `certo_errado` | `conceito` | `protocolo` (EXCETO, preparo, documentação, aprazamento)  
**Template:** `teal` (t10)  
**Âncora primária:** `examples/questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json`  
**Cluster:** INCORRETA / EXCETO + Default + absorvidos · ~60 slugs pós-curadoria · `sample_slugs[0]`: `avancasp-enfermagem-cuidados-na-administracao-de-medicamentos-1778969685650-2`

---

## 0. Questão âncora

| Campo | Valor |
|-------|-------|
| Banca / ano | AVANÇASP 2022 |
| Tipo | EXCETO — preparo de medicamentos na sala |
| Gabarito | A — administrar VO com solução fisiológica (incorreto) |

**Erro reproduzível (1 frase):** o aluno marca uma conduta correta de preparo (higienização, prescrição à mão, não misturar) em vez da exceção — ou confunde diluente parenteral (SF) com administração via oral.

**Por que âncora genérica (não bespoke L3):**

1. Volume fragmentado em clusters pequenos (documentação, aprazamento, vigilância) — absorver em `cam_generico`.
2. Molde genérico `bridge · center/reference_table · cards tap · compare` cobre EXCETO semântico.
3. Brief bespoke só se `audit:subtopico-quality` exigir após g03 (VARIANT_MOLDS §3).

---

## 1. Metáfora do pacote

**“Mapa do tema → tabela normativa → passos tap → compare por letra.”**

Universo visual: teal editorial — ícones `Target`, `FileText`, `Hand`, `Pill`; compare semântico com `correct` por distrator.

---

## 2. Pacote 4/4 (genérico)

| Slide | layout automático | Notas |
|-------|-------------------|-------|
| concept_map | `bridge` | 3–4 itens enquadramento + erro ROI |
| golden_rule | `center` ou `reference_table` com `rows` | Checklist preparo / 9 certos resumido |
| logic_flow | `cards` + `reveal_mode: tap` | Eliminar distratores; único com gabarito |
| danger_zone | `compare` + `bullet_style: x_icon` | Cada `correct` justifica a letra |

---

## 3. Contrato handcraft

- `meta.pedagogical_branch: "cam_generico"`
- EXCETO: distratores B–E = conduta correta; só gabarito aponta exceção
- Sem `template` / `layout_variant` explícitos — design por `subtopico`

---

## 4. Clusters absorvidos

Documentação/registro · Vigilância/reações · Preparo/sala · V/F protocolo MS · Horário/aprazamento · Prescrição dúvida · Certo ou errado · Orientação paciente · LASA

---

## 5. Validação

```bash
npm run audit:questao-readiness -- --file=examples/questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json --strict-v2-pedagogy
npm run validate:goldens -- --strict
```
