# Brief L3 — Coleta de Exames Laboratoriais / coleta_jejum_preparo

| Campo | Valor |
|-------|-------|
| Subtópico canônico | Coleta de Exames Laboratoriais |
| `pacote_prefix` | coleta-de-exames-laboratoriais |
| `branch_id` | coleta_jejum_preparo |
| Família | `protocolo` · `conceito` |
| Decisão L3 | `ok_generico` |
| Âncora | jejum lipídios/glicemia, preparo paciente (cluster) |
| Erro espacial (1 frase) | Confunde **horas de jejum** entre lipídios, glicemia e exame geral |

**Metáfora (genérico premium):** Tabela de horas — `golden_rule.rows` porta o decore; `compare` para pegadinhas de tempo/alimentação.

> **Ship:** `COLETA_GENERIC_DESIGN` (teal). Brief curto — teste espacial 3/3: `reference_table` + tap ensina sem React.

---

## Slots resumidos (handcraft)

| Slide | Uso |
|-------|-----|
| `concept_map` | 3–4 itens: jejum absoluto, lipídios ~12h, glicemia, medicamentos |
| `logic_flow` | tap: qual exame → quantas horas → eliminar alternativa |
| `golden_rule` | `rows`: Lipídios · Glicemia · TSH/outros · Água permitida? |
| `danger_zone` | `correct` único: confundir 8h × 12h × 14h |

**Gatilhos:** jejum, lipídios, triglicerídeos, glicemia, café, água, preparo.

**Próximo passo:** `Handcraft:` lote jejum — sem `Implementar molde`.
