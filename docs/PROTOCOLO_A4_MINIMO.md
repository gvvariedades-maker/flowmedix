/**
 * Protocolo A4-mínimo — modelo AVANT (genérico)
 *
 * **Objetivo:** reduzir revisão humana rotineira com ground-truth local (whitelist)
 * por pacote, sem fingir garantia clínica absoluta.
 *
 * Core: [`lib/catalogMigration/a4MinimoCore.ts`](../lib/catalogMigration/a4MinimoCore.ts)  
 * Registry: [`lib/catalogMigration/a4MinimoRegistry.ts`](../lib/catalogMigration/a4MinimoRegistry.ts)
 *
 * Complementa: [`DECISAO_AUTO_APROVACAO_RISCO.md`](DECISAO_AUTO_APROVACAO_RISCO.md)
 */

---

## Arquitetura

```text
a4MinimoCore (audit + mitigação + contract)
    ├── puncaoA4Minimo.ts      → agent:puncao-a4-minimo-v1
    ├── historiaA4Minimo.ts    → agent:historia-a4-minimo-v1
    ├── viasA4Minimo.ts        → agent:vias-a4-minimo-v1
    ├── adolescenteA4Minimo.ts → agent:adolescente-a4-minimo-v1
    └── (próximas ondas: sinais-vitais, CME, …)
```

Cada pacote pluga: `isApplicable`, `whitelist`, `sensitiveClaimHintRe`, `agentId`.

---

## Pré-requisitos por pacote

1. `production_status: production_ready`
2. Guideline table + whitelist revisada por humano
3. Entrada em `A4_MINIMO_PACKAGES`
4. `auto_approval.enabled: true` no registry
5. Testes Jest do pacote
6. Piloto 1 lote → amostra 20% → escala

---

## CLI

```bash
npm run stamp:a4-minimo -- --lote=<lote>
npm run stamp:a4-minimo -- --file=<path> --dry-run
npm run audit:questao-readiness -- --file=<path> --strict-v2-pedagogy
```

---

## Ondas

| Onda | Pacotes | Status |
|------|---------|--------|
| 0 | Punção | ✅ |
| 1 | História da Enfermagem | ✅ |
| 2 | Vias de Administração | ✅ |
| 3 | Saúde do Adolescente | ✅ |
| 4 | CME, Processamento, Sinais Vitais… | pendente |
| 5 | Imunização / Urgências / Cálculo | último |

Docs: `PROTOCOLO_A4_MINIMO_PUNCAO.md` · `HISTORIA` · `VIAS` · `ADOLESCENTE`

---

## Humano sempre

- `family=calc`
- Claim sensível fora da whitelist
- Forbid hit / fonte só tier B / divergência real
- Pacote sem `production_ready` ou P0 aberto
