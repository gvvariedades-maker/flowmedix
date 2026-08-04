# Decisão — Evidence Engine FSRS/RCT experimental permanece adiado

**Data:** 2026-07-30  
**Status:** vigente — **não remover neste ciclo**  
**Escopo:** destino de `lib/evidence/fsrsSkill.ts`, `rct1.ts`, `rct2.ts`, `transferSelector.ts` e testes em `__tests__/lib/evidence/`.

Complementa: [`DECISAO_DESCONTINUACAO_REVISAO_INTELIGENTE.md`](DECISAO_DESCONTINUACAO_REVISAO_INTELIGENTE.md) §9 · [`DECISAO_EVIDENCE_ENGINE.md`](DECISAO_EVIDENCE_ENGINE.md)

---

## Decisão

1. O código experimental FSRS-like / RCT do Evidence Engine **não** entra nos lotes C2–C5.
2. **Não** remover `ConvictionSelector` nem seus consumidores reais (`AvantLessonPlayer`, `SimuladoRunnerClient`) por associação indevida com o EE.
3. Remoção ou reativação exigem **lote próprio** com autorização explícita, após o núcleo (questão → diagnóstico → NeuroSlides) estar estável pós-lançamento.

## Motivo

- Sem consumidor em `app/**` / `components/**` (só testes + acoplamento interno).
- Misturar com desmontagem do FSRS MVP de produto confunde dois trilhos (scheduler vendável vs. ciência adiada).
- `ConvictionSelector` já é UI ativa do player/simulados.

## Não fazer agora

- Apagar `fsrsSkill` / `rct1` / `rct2` / `transferSelector`
- Apagar testes EE relacionados
- Alterar gates `rct1UpliftConfirmed` no EE
