# Checklist ship â€” SVG Quality

Marcar mentalmente. Qualquer FAIL â†’ corrigir antes de entregar.

## Estrutura

- [ ] `xmlns` presente
- [ ] `viewBox` canÃ´nico da famÃ­lia (Ã­cone AVANT: `0 0 24 24`)
- [ ] Sem crop content-tight que quebra o set
- [ ] `fill="none"` em outline; solid sÃ³ se famÃ­lia solid
- [ ] Cor via `currentColor` (ou token AVANT explÃ­cito no pedido)
- [ ] `aria-hidden="true"` **ou** `role="img"` + `<title>` / `aria-label`

## GramÃ¡tica visual

- [ ] Uma famÃ­lia sÃ³ (stroke/caps/joins consistentes)
- [ ] Stroke uniforme (Lucide: 2; Hero: 1.5)
- [ ] Padding â‰¥1px (Ã­cone 24)
- [ ] Gap entre elementos â‰¥ stroke
- [ ] Volume Ã³ptico â‰ˆ `circle`/`square` da mesma pasta
- [ ] Centro de gravidade visual centrado
- [ ] â‰¤6 shapes (Ã­cone) / â‰¤12 (diagrama)
- [ ] 1 metÃ¡fora; silhueta legÃ­vel em ~20px

## CÃ³digo

- [ ] SÃ³ elementos permitidos (path/circle/rect/line/polyline/polygon/ellipse)
- [ ] Sem `use`, filter, mask complexa, texto decorativo
- [ ] Sem transforms desnecessÃ¡rios
- [ ] Paths curtos / precisÃ£o razoÃ¡vel (evitar float lixo)
- [ ] Sem width/height obrigatÃ³rios em JSX (CSS controla)

## Produto AVANT

- [ ] NÃ£o reinventou Lucide/Health Icons existente
- [ ] Skin cyber/editorial respeitada (sem roxo genÃ©rico / glow)
- [ ] Se diagrama pedagÃ³gico: alinhado a `diagrams/*.svg` ou brief L3
- [ ] Refs usadas citadas no handoff

## CrÃ­tica rÃ¡pida (10s)

1. Blur mental: ainda lÃª a metÃ¡fora?
2. Ao lado de `lucide/circle.svg`: peso parecido?
3. Em fundo `#010409` com stroke claro: contraste ok?

