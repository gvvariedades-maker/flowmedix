/**
 * Protocolo A4-mínimo — Saúde do Adolescente (Onda 3)
 *
 * Escuta, sigilo (ECA), HPV, gravidez, violência, saúde mental.
 *
 * Código: [`lib/catalogMigration/adolescenteA4Minimo.ts`](../lib/catalogMigration/adolescenteA4Minimo.ts)  
 * Guideline: [`lib/guidelines/saudeAdolescente.ts`](../lib/guidelines/saudeAdolescente.ts)  
 * Modelo: [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)
 */

---

## Decisão

1. Claims sensíveis (HPV doses, ≥12 anos, 60 min, Tanner) → whitelist.
2. Fonte tier A com `covers` (`saude-adolescente-ms`).
3. Agente: `agent:adolescente-a4-minimo-v1`.
4. Amostra humana 20% dos `medio`.

## Eixos

| Eixo | Exemplos |
|------|----------|
| escuta | Privacidade, autonomia progressiva |
| sigilo | Limites legais; pegadinha absoluto |
| gravidez | Pré-natal precoce, riscos |
| sexual | Contracepção, dupla proteção, IST |
| vacina | HPV 2 doses 9–14 anos |
| violencia | Sexual, bullying |
| saude_mental | Automutilação, ideação |
| desenvolvimento | Tanner, puberdade tardia |
| estilo_vida | 60 min/dia, álcool/drogas |

## CLI

```bash
npm run stamp:a4-minimo -- --lote=saude-adolescente-g01 --dry-run
npm run stamp:a4-minimo -- --lote=saude-adolescente-g01
npm run audit:questao-readiness -- --file=examples/questao-premium-cpcon-saude-adolescente-gravidez-vf.json --strict-v2-pedagogy
```

## Humano sempre

- `family=calc`
- Claim fora da whitelist (ex.: HPV 3 doses em &lt;15 sem contexto de pegadinha)
- Divergência real `exam_vs_current`
- Violência sexual / ideação com conduta numérica nova sem entry
