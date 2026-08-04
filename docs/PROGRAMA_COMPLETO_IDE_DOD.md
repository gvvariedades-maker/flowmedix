# Definition of Done — Programa completo IDE

Aceite executável para [`PROMPT_PROGRAMA_COMPLETO_IDE.md`](PROMPT_PROGRAMA_COMPLETO_IDE.md).  
Marcar ✅ só com **evidência** (comando PASS / path de artefato).  
Relatório final: `artifacts/<pacote_prefix>-nota10-report.md` (partir de [`docs/_TEMPLATE-nota10-report.md`](_TEMPLATE-nota10-report.md)).

**Ship = vendável** ≠ só `applied`. Ver [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md).

---

## 100% concluído (programa)

Tudo abaixo verdadeiro:

| # | Critério | Evidência |
|---|----------|-----------|
| 1 | `handcraft_applied === total_slugs` e `status=applied` | registry |
| 2 | `production_status=production_ready` | registry + `audit:subtopico-quality --promote` |
| 3 | Ramos fortes: bespoke React 4/4 **ou** `ok_generico` com teste espacial 3/3 no brief | mold-gap + briefs |
| 4 | Âncoras / gate golden-anchor PASS (ou âncoras READY no playbook) | `audit:golden-anchor-gate` |
| 5 | Conteúdo: readiness strict + validate + preflight em todos g* | logs |
| 6 | Visual: neuroslides-visual nos briefs fortes + Playwright moldes **ou** captures/galeria da âncora | briefs + e2e / `artifacts/questao-review/` |
| 7 | L6 + relatório nota-10 com tabela DoD verde | `artifacts/<prefix>-nota10-report.md` |
| 8 | Apply Supabase 100% (dry-run → apply autorizado) | migration logs |

Sem isso → **não** declarar “assunto 100% concluído” nem “altíssima qualidade”.

---

## Aceite por capítulo

### Cap 0 — `bootstrap`

```text
□ Pacote no handcraft-registry.json (pacote_prefix, manifest, playbook)
□ Taxonomy closed OU Classify/Taxonomy gate documentado
□ Manifest / export coerente com total_slugs
□ Run-state gravado
```

### Cap 1 — `l3_map`

```text
□ npm run pipeline:brief / handcraft:brief
□ cluster do pacote (se comando existir no playbook)
□ artifacts/l3-brief-<prefix>-INDEX.md (ou índice do playbook)
□ Brief 4/4 por ramo forte (PROMPT_VARIANTES_NEUROSLIDES)
□ APÓS cada brief forte: avant-neuroslides-visual (gesto/metáfora no brief)
□ npm run audit:l3-mold-gap → artifacts/l3-mold-gap-audit*
□ Tabela ramo × decisão: molde_redesign | molde_inedito | ok_generico | cauda_longa
□ Skills corretas: TE = brief-enfermagem; PT = brief-lingua-portuguesa (+ Elias no handcraft)
```

### Cap 2 — Âncoras

```text
□ npm run audit:golden-anchor-gate -- --subtopico="..." → pass (ou Criar âncoras → re-gate)
□ ≥1 golden READY por ramo que vai a handcraft (examples/…)
□ audit:questao-readiness --strict-v2-pedagogy → [READY] na âncora
□ Se playbook.estudo_ativo: Transferência classificável na âncora (não genérico)
□ Opcional A4 player: capture:questao-review na âncora piloto
```

### Cap 3 — `mold_branch` (só se decisão bespoke)

```text
□ 1 ramo por conversa
□ VARIANT_MOLDS: React + NeuroSlide + moldAffinity + catálogo
□ Playwright desktop + mobile-375 PASS no bloco do pacote
□ audit:l3-mold-gap → 0 pendências molde_* nesse ramo
□ Ramo ok_generico: NÃO implementar React; exigir teste espacial 3/3 no brief
```

### Cap 4 — `handcraft_lote`

```text
□ Política de tamanho respeitada (1 ou 2 gNN / chat)
□ meta.content_standard golden-v1 + subtopico canônico (+ pedagogical_branch)
□ Ordem v2: concept_map → logic_flow (reveal_mode tap) → golden_rule → danger_zone
□ concept_map sem gabarito; danger_zone.correct único; sem template/layout override
□ DNA do playbook (Elias/TE) + estudo_ativo se existir
□ npm run audit:questao-readiness -- --lote=<gNN> --strict-v2-pedagogy → [READY]
□ npm run validate:goldens -- --lote=<gNN> --strict
□ npm run catalog:preflight -- --lote=<gNN> --strict-v2-pedagogy
□ npm run catalog:apply-lote -- --lote=<gNN> --dry-run (100% OK)
□ Apply só com "pode aplicar" do usuário
□ Registry: handcraft_applied atualizado após apply
```

### Cap 5 — A4-mínimo (se pacote na onda)

```text
□ Pacote em a4MinimoRegistry / protocolo do pacote
□ stamp:a4-minimo 100% STAMPED (ou N/A documentado)
□ A4 humano só ADR (calc / divergência / blockers) — sem padding artificial
```

### Cap 6 — `ship`

```text
□ reconcile:handcraft-manifest
□ preflight todos g*
□ audit:handcraft-dod + slug-alignment --strict + numeric-factcheck
□ L6 anchor-review (+ captures conforme escala)
□ Playwright visual-mold-regression (grep do pacote) se houver moldes
□ audit:subtopico-quality -- --subtopico="..." --promote → production_ready
□ artifacts/<pacote_prefix>-nota10-report.md preenchido (template)
□ Tabela final na mensagem de fechamento
```

---

## Duas barras (conteúdo × visual)

| Barra | Gates mínimos |
|-------|----------------|
| **Conteúdo** | golden-v1, readiness strict, validate, slug-alignment, factcheck, L6, A4 |
| **Visual** | brief 4/4 + neuroslides-visual; Playwright 4/4 **ou** galeria/captures âncora + ok_generico 3/3 |

**Fábrica Onda 3 (já `production_ready`):** DoD Camada 7 em [`NEUROSLIDES_VISUAL_STRATEGY.md`](NEUROSLIDES_VISUAL_STRATEGY.md) + catálogo print→primitivo. **Não** confundir com Strategy Onda 3 (Imu EXCETO).

Declarar só uma barra → **não** é nota-10 deste programa.

---

## Tabela final (mensagem de ship)

```text
| applied | bespoke 4/4 | ok_generico 3/3 | A4 | Playwright | L6 | production_ready | conteúdo | visual | blockers |
```

Path: `artifacts/<pacote_prefix>-nota10-report.md`

---

## Referências de qualidade

| Pacote referência | O que copiar |
|-------------------|--------------|
| Saúde do Adolescente | Paridade A4 + L6 + relatório |
| Crase / Colocação (PT) | Elias + estudo_ativo + moldes / galeria |
| Vias / Imunização | Escala + moldes bespoke |

Anti-padrões: [`GOLDEN_CONTENT_STANDARD.md`](GOLDEN_CONTENT_STANDARD.md) · skill `avant-json-template`.
