/**
 * Protocolo A4-mínimo — Punção Venosa e Cuidados com Cateteres
 *
 * **Objetivo:** reduzir revisão humana rotineira sem fingir “100% garantido”
 * em dose/conduta fora da whitelist. Ground-truth local + amostra + loop de erro.
 *
 * Complementa: [`DECISAO_AUTO_APROVACAO_RISCO.md`](DECISAO_AUTO_APROVACAO_RISCO.md) ·
 * [`QUALITY_LAYERS_MODEL.md`](QUALITY_LAYERS_MODEL.md)
 *
 * Código: [`lib/catalogMigration/puncaoA4Minimo.ts`](../lib/catalogMigration/puncaoA4Minimo.ts)  
 * Core: [`a4MinimoCore.ts`](../lib/catalogMigration/a4MinimoCore.ts) · [`PROTOCOLO_A4_MINIMO.md`](PROTOCOLO_A4_MINIMO.md)
 */

---

## Decisão

Para o pacote **Punção** (`production_ready`):

1. Todo claim sensível nos slides deve casar a **whitelist** (hub / curativo / flush / flebite…).
2. Fonte **tier A** com `covers` obrigatória.
3. Se whitelist PASS e o único motivo de `alto` era `protocolo`+número conhecido → risco desce para **`medio` / `auto_conditional`**.
4. Agente assina `a4_reviewer: "agent:puncao-a4-minimo-v1"` + `a4_checklist_passed`.
5. Amostra humana: **20%** dos `medio` (hash do slug) + **100%** se claim novo / forbid / calc / divergência real.

**Humano continua obrigatório quando:**

| Bloqueio | Motivo |
|----------|--------|
| `family=calc` | Resposta é número livre |
| Claim sensível fora da whitelist | Sem ground-truth |
| `forbid` hit | Ensino contradiz a whitelist |
| Fonte só tier B no número | Sem Anvisa/COFEN |
| Divergência real prova × guideline | Texto com “diverg/desatual/≠…” |
| Danger zone fina (&lt;3 itens) ou fluxo fraco | Pedagogia 10/10 falhou |

---

## Eixos de revisão (checklist mental)

| Eixo | Claim canônico (resumo) |
|------|-------------------------|
| **hub** | Álcool 70% com fricção a cada manipulação |
| **curativo** | Troca asséptica se sujo/solto — não “só se infectar” |
| **flush** | SF 0,9% contínuo — não só na inserção |
| **flebite** | Retirar dispositivo |
| **bundle** | Pacote IPCS; antibiótico não substitui |

Tabela normativa: `lib/guidelines/puncaoVenosa.ts` · whitelist: `PUNCAO_CLAIM_WHITELIST`.

---

## Fluxo operacional (agente)

```text
1. Handcraft golden-v1 (skills 10/10)
2. npm run audit:questao-readiness -- --file=... --strict-v2-pedagogy
   → checa A4 puncao_a4_minimo + risk_tier mitigado
3. Se PASS e medio/auto: stamp efficacy_contract (agent:puncao-a4-minimo-v1)
4. catalog:apply-lote --apply (riskApprovalGate quando pacote opt-in)
5. Amostra 20%: se sampled, pedir olho humano 30s (hub×curativo)
```

### Stamp do contrato

```ts
import { scoreQuestaoRisk } from '@/lib/catalogMigration/riskScoring';
import {
  auditPuncaoA4Minimo,
  applyPuncaoA4MinimoMitigation,
  buildPuncaoA4MinimoEfficacyContract,
} from '@/lib/catalogMigration/puncaoA4Minimo';

const base = scoreQuestaoRisk(payload, { productionReady: true });
const audit = auditPuncaoA4Minimo(payload);
const risk = applyPuncaoA4MinimoMitigation(base, audit);
const contract = buildPuncaoA4MinimoEfficacyContract(risk, audit);
// meta.efficacy_contract = contract
```

CLI: `npm run stamp:puncao-a4-minimo -- --file=...` ou `--lote=...`

---

## Expandir a whitelist

1. Adicionar entry em `PUNCAO_CATETER_ANVISA` (`lib/guidelines/puncaoVenosa.ts`).
2. Adicionar claim em `PUNCAO_CLAIM_WHITELIST` com `match` + `forbid` + `groundsNumeric`.
3. Teste Jest cobrindo o novo claim.
4. **Não** auto-expandir por IA sem revisão humana do claim.

---

## Kill-switch

- `auto_approval.enabled: false` no pacote Punção no registry.
- Report rate &gt; 2% → desligar auto (ops health).
- Claim com erro clínico → remover/ajustar whitelist + re-handcraft dos slugs afetados.

---

## O que isto NÃO é

- Garantia metafísica de 100% sem humano.
- Licença para auto-assinar Imunização/Urgências/Cálculo.
- Substituição de L6 âncora ou de `production_ready`.
