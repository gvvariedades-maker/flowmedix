# `lib/fsrs` — FSRS MVP (Lote R1.1)

Contratos **puros** do pivot de revisão espaçada (`docs/DECISAO_REVISAO_FSRS_MVP.md`).

## Isolamento

- Encapsula **`ts-fsrs@5.4.1`** (pin em `FSRS_MVP_PACKAGE_VERSION`) — o restante do AVANT não importa tipos internos da lib.
- **Não** confundir com `lib/evidence/fsrsSkill.ts` (stub FSRS-*like* do Evidence Engine, gated em RCT-1; origem em `origin/main`).
- **Não** importa `lib/evidence/*`.
- **Não** substitui `lib/spaced-repetition.ts` (SM-2 legado) neste lote.
- R1: contratos puros (sem I/O de produto).
- R2: persistência server-only (`persistence*`, `fingerprint`, migration + RPC) — **sem** rotas/UI/flag.
- R3 (integração) permanece **bloqueado** até autorização separada.

## R2 — persistência

- Único caminho de escrita: RPC `fsrs_persist_review` (card + log atômicos).
- Adapter: `createSupabaseFsrsPersistence` (`import 'server-only'`).
- Outcomes tipados com `writeStatus`; transporte ambíguo → `persistence_unknown`.
- Proibido importar `lib/evidence/**`.
- Spec: `docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md`.

## Unidade de memória (`review_unit_id`)

Formato versionado:

- `fsrs:v1:discipline=<nfc-escaped>:cluster=<nfc-escaped>`
- `fsrs:v1:discipline=<nfc-escaped>:subtopico=<nfc-escaped>`

- `knowledgeClusterId` é **input opcional futuro/offline** — **não** existe coluna no schema hoje.
- Cluster só entra se `clusterInventoryConfirmed === true` (caller confirma inventário; R1 não consulta DB).
- Não usar `pedagogical_branch`, `family`, cluster NeuroCanvas ou molde visual.

## Elegibilidade (`FsrsAttemptContext`)

Elegíveis: `cold_practice`, `scheduled_review`.  
Inelegíveis (fail-closed): demais + `unknown` + valor inválido.

`isReplay` de `historico_questoes` **não** faz parte do contrato — mapeamento produto → contexto = **R3**.

## API de baixo nível vs política

- `createFsrsScheduler().review()` é **API pura de baixo nível**: aplica Again/Good ao card com data injetada.
- **Não** decide elegibilidade; **não** conhece `FsrsAttemptContext`.
- Produção **não** poderá chamá-la diretamente sem passar por `planFsrsRating` (ou orquestrador equivalente).
- A garantia arquitetural desse wiring pertence ao **R3** (ainda não autorizado).
- R3 deverá incluir teste impedindo atualização FSRS para tentativas inelegíveis.

## Serialização

`FsrsMvpSerializedCard`: `schemaVersion: 1`, `algorithm: 'ts-fsrs'`, `algorithmVersion: '5.4.1'`, campos do Card (incl. `elapsedDays`).

Política **schemaVersion 1**:

- propriedades extras desconhecidas → **rejeição explícita** (não ignore silencioso);
- mudanças futuras exigem nova `schemaVersion` ou alteração deliberadamente compatível;
- payload parcial / NaN / Infinity / contadores não-inteiros / datas ou states inválidos → rejeição explícita.
