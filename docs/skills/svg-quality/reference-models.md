# Modelos SVG de referÃªncia (pesquisa + pacote local)

Curadoria 2026-08-07. Arquivos em [`docs/design-refs/svg-models/`](../../design-refs/svg-models/README.md).

## Por que estes sets

| Set | Por que Ã© â€œmodelo ouroâ€ | Quando espelhar |
|-----|-------------------------|-----------------|
| **Lucide** | Guia pÃºblico rÃ­gido (24 grid, stroke 2, round caps, volume Ã³ptico). JÃ¡ Ã© o padrÃ£o do AVANT (`lucide-react`). | Default Ã­cones UI / chips / NeuroSlides leves |
| **Heroicons** | Outline 24 stroke 1.5, paths limpos (Tailwind Labs). Excelente densidade â€œprodutoâ€. | Quando o brief pede traÃ§o mais fino |
| **Tabler** | Biblioteca enorme, outline 24 consistente, Ã³timo para metÃ¡foras clÃ­nicas leves (`vaccine`, `pill`). | Ãcones de domÃ­nio com Lucide incompleto |
| **Phosphor** | Regular bem construÃ­do; bom peso Ã³ptico â€œsoftâ€. | Pictogramas um pouco mais cheios (ainda mono) |
| **Health Icons** | Set clÃ­nico profissional (MIT/CC0) jÃ¡ no repo. | Qualquer glifo de saÃºde â€” **preferir a inventar** |
| **AVANT diagrams** | Gestos pedagÃ³gicos (compare, funil, trilho, isolate) alinhados Ã  barra NeuroSlides. | Diagramas de retenÃ§Ã£o / handoff de molde |

Fontes de guidelines usadas na skill:

- Lucide Icon Design Guide â€” https://lucide.dev/contribute/icon-design-guide
- GitHub Primer (Octicons) â€” optical volume / stroke 1.5
- Material / design systems â€” live area ~20 dentro de 24; keylines circle vs square
- ViewBox como contrato de set â€” grid fixo, nÃ£o crop content-tight

## Mapa de arquivos locais (abrir no chat)

### Lucide (default)

`docs/design-refs/svg-models/lucide/`

| Arquivo | Papel |
|---------|--------|
| `circle.svg` / `square.svg` | Ã‚ncora de volume Ã³ptico |
| `check.svg` / `x.svg` / `ban.svg` | Compare / negar |
| `triangle-alert.svg` / `info.svg` | Alerta / info |
| `syringe.svg` / `pill.svg` / `stethoscope.svg` / `thermometer.svg` | MetÃ¡foras clÃ­nicas leves |
| `funnel.svg` / `git-branch.svg` / `list-checks.svg` / `layers.svg` / `target.svg` | Gestos de prova / fluxo |
| `heart.svg` / `activity.svg` / `shield-check.svg` / `arrow-right.svg` | UI comum |

### Heroicons outline

`docs/design-refs/svg-models/heroicons-outline/` â€” `heart`, `check`, `x-mark`, `exclamation-triangle`, `shield-check`, `arrow-right`, `funnel`, `clipboard-document-check`

### Tabler

`docs/design-refs/svg-models/tabler/` â€” `heart`, `check`, `x`, `alert-triangle`, `vaccine`, `pill`, `activity`, `shield-check`, `arrow-right`, `filter`

### Phosphor regular

`docs/design-refs/svg-models/phosphor-regular/` â€” `heart`, `check`, `x`, `warning`, `syringe`, `pill`, `heartbeat`, `shield-check`, `arrow-right`, `funnel`

### Health Icons (amostra)

`docs/design-refs/svg-models/healthicons-outline/` â€” `pharmacy`, `virus`, `syringe`, `syringe-vaccine`, `ppe-mask`, `health-worker`  
Set completo: `public/icons/healthicons/svg/outline/` (e filled / 24px).

### Diagramas AVANT (gesto)

`docs/design-refs/svg-models/diagrams/`

| Arquivo | Gesto |
|---------|--------|
| `compare-x-check.svg` | Arena âœ— vs âœ“ |
| `funnel-rail.svg` | Funil de eliminaÃ§Ã£o |
| `decision-rail.svg` | Trilho logic_flow |
| `isolate-focus.svg` | NÃºcleo em foco |

## Como â€œlerâ€ um modelo (30s)

1. `viewBox` + `stroke-width` + `stroke-linecap/join`
2. Quantos nÃ³s / paths? (densidade alvo)
3. Padding real atÃ© a borda do canvas
4. Cantos: radius ~2 no 24
5. MetÃ¡fora: 1 ideia, silhueta legÃ­vel a 16â€“24px

## Atualizar o pacote

```bash
# Exemplos (versÃµes pinadas no README da pasta)
# Lucide: cdn.jsdelivr.net/npm/lucide-static@<ver>/icons/<name>.svg
# Heroicons: .../npm/heroicons@<ver>/24/outline/<name>.svg
# Tabler: .../npm/@tabler/icons@<ver>/icons/outline/<name>.svg
# Phosphor: .../npm/@phosphor-icons/core@<ver>/assets/regular/<name>.svg
```

Ao atualizar versÃµes, editar a tabela de `docs/design-refs/svg-models/README.md`.

