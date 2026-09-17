# P0 — Revisão pedagógica por evidência (conversa Agent)

Trigger: **`Revisão pedagógica P0: P0-01 P0-02`** (ou lista de IDs)

## Objetivo

Produzir artefatos **externos** para `EVIDENCE_GOVERNED_APPROVAL_V2` — não aprovação final do Project Owner.

## Candidate freeze e `candidate_sha256` — regra canônica

O `candidate_sha256` de `EVIDENCE_GOVERNED_APPROVAL_V2` **não** é o SHA-256 dos bytes do JSON editorial bruto.

Existem dois hashes distintos:

### 1. `candidate_file_sha256`

Hash dos **bytes** do JSON editorial em disco.

Uso:

- integridade do arquivo de origem;
- detectar alteração byte a byte;
- rastreabilidade editorial.

**Não** deve ser usado como `candidate_sha256` dos reviews.

### 2. `candidate_sha256`

Hash canônico do objeto que efetivamente entra no gate editorial do apply.

Domínio obrigatório:

```text
raw JSON
  → validateAndNormalizeQuestao(slug, raw, { mandatoryEditorialGate: false })
  → stripCommercialApprovalBinding(validated.data)   # mesmo ordem do applyLote
  → computeCandidateSha256(...)
```

Esse hash deve ser calculado **antes** de Primary/Adversarial.

O objeto correspondente deve ser congelado como `candidate-normalized.json` (review subject).

Primary review, Adversarial review e manifest **devem** usar exatamente esse mesmo `candidate_sha256`.

### Prova de equivalência (re-bind ou legado)

Quando reviews foram produzidos antes do domínio final do apply, executar **uma vez**:

```bash
npm run p0:normalization-proof -- \
  --p0=P0-02 \
  --slug=<slug> \
  --raw=<path-do-json-bruto> \
  --out=artifacts/evidence-reviews/p0-02 \
  --write-source-copy
```

Artefatos:

| Arquivo | Função |
|---------|--------|
| `candidate-source.json` | Cópia opcional do bruto |
| `candidate-normalized.json` | Objeto exato revisável/aplicável |
| `normalization-diff.json` | Diferenças bruto → normalizado |
| `candidate-freeze.json` | Registro de freeze + hashes |

`normalization-diff.json` classifica cada diferença:

- `NON_SEMANTIC_OR_PIPELINE_NORMALIZATION` — wrappers achatados, ordem canônica, defaults estruturais, strip comercial;
- `SEMANTIC_CHANGE` — texto, gabarito, alternativas, claims, NeuroSlides, fontes.

**Re-bind sem nova revisão** só é aceitável se `semantic_change_count=0`.

### Regra de imutabilidade

Depois do freeze:

- não modificar `candidate-normalized.json`;
- não recalcular/re-bindar hash silenciosamente;
- qualquer alteração semântica gera STALE e exige novas revisões;
- mudanças apenas no arquivo bruto que não alterem o objeto normalizado podem preservar o evidence package, desde que a equivalência seja demonstrada deterministicamente (`p0:normalization-proof`).

### Ordem obrigatória para novos P0

1. congelar arquivo editorial bruto;
2. executar `validateAndNormalizeQuestao` + strip comercial (domínio do apply);
3. congelar `candidate-normalized.json`;
4. calcular `candidate_sha256`;
5. criar `candidate-freeze.json`;
6. Primary review;
7. Adversarial review independente;
8. manifest;
9. `resolveTrustedEvidenceForSlug`;
10. positive-path dry-run;
11. somente após autorização explícita, considerar apply.

**Nunca** produzir os reviews primeiro e corrigir `candidate_sha256` depois.

### Checks futuros (automatizar)

```text
REVIEW_SUBJECT_FILE_PRESENT=YES
FREEZE_HASH == computeCandidateSha256(candidate-normalized.json)
MANIFEST_HASH == FREEZE_HASH
PRIMARY_HASH == FREEZE_HASH
ADVERSARIAL_HASH == FREEZE_HASH
```

Implementação: `npm run p0:normalization-proof` + teste `p0CandidateNormalizationProof.test.ts`.

---

## Fluxo (duas conversas por slug de alto risco)

1. **Freeze + normalization proof** — `candidate-normalized.json` + `candidate-freeze.json`
2. **Primary agent** — `docs/schemas/p0-primary-agent-review.example.json`
3. **Adversarial agent** (conversa separada) — `docs/schemas/p0-adversarial-agent-review.example.json`
4. Manifest — `docs/schemas/p0-evidence-manifest.example.json`
5. **Owner** — decisão operacional separada; opcional escalonamento humano — `docs/schemas/p0-human-escalation-signoff.example.json`

## Proibido

- `--apply`, writes Production, denylist removal, RC004 binding
- Campos `evidence_approved` no JSON da questão
- Declarar `HUMAN_APPROVAL=YES` sem owner

## Comandos

```bash
npm run audit:questao-readiness -- --file=artifacts/.../P0-01_editorial_candidate.json --strict-v2-pedagogy
npm run catalog:apply-lote -- --lote=... --dry-run --risk-approval-gate --evidence-manifest=artifacts/evidence-reviews/manifest.json
```

## Preview player

`/dev/questao-review?source=p0-d3-fixture&p0_id=P0-01&slug=<slug>`

## Independência procedural

Adversarial em **conversa/agente separado**; veredito provisório antes de ler justificativa completa do primary.
