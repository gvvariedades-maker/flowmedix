# dtrans-mescladas — Outras Doenças… Transmissíveis

Pacote handcraft golden-v1 com **16 slugs** (`dtrans-mescladas-g01` + `g02`).

## Taxonomia (modo A — fechado)

O bucket catch-all **"Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis"** está **vazio no Supabase**. As 16 questões foram **reclassificadas** para subtópicos canônicos (Virais, ISTs, Parasitárias, Imunização, Curativos, Mobilização…).

```bash
npm run audit:taxonomy-gate -- "--subtopico=Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis"
```

Gate esperado: `pass` · `manifest.reclassified=true` · `promote_requires_infer=false`.

## Vitrine vs pacote handcraft

| Camada | Comportamento |
|--------|----------------|
| **URL / slug** | Legado `…-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-…` |
| **Vitrine** | Agrupa por `titulo_aula` **canônico** — cards aparecem em Virais, ISTs, etc. |
| **Handcraft local** | JSON em `dtrans-mescladas-g01/g02/questions/` permanece válido após `apply-lote` |
| **`meta.subtopico`** | Deve refletir o destino canônico no player (não o catch-all) |

## Antes de `--promote`

1. `validate:goldens --strict` nos lotes g01/g02  
2. L3 + anchor-review se escalar qualidade vendável  
3. **Não** exige novo `infer-subtopico` — reclassificação já aplicada no DB  
4. `--promote` avalia o **pacote** `dtrans-mescladas`; vitrine não lista esse catch-all

## Lotes

| Lote | Slugs | Âncora |
|------|-------|--------|
| g01 | 6 | FCM dengue grupos A/B/C/D |
| g02 | 10 | VUNESP raiva profilaxia |
