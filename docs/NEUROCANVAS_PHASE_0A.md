# NeuroCanvas — Fase 0A (NeuroVisualPlan v0)

Encapsulamento tipado e determinístico das decisões visuais que o AVANT **já toma hoje**, sem alterar renderização em produção.

## Objetivo

Introduzir `NeuroVisualPlanV0` como representação interna serializável de:

- saída de `resolveSlidePresentation` (`ResolvedSlidePresentation`);
- saída de `getThemeForSlide` (`ThemeColors`), quando solicitado;
- metadados mínimos (`schema_version`, `slide_type`).

**Shadow mode:** comparação por testes herméticos + CLI `audit:neurovisual-plan-v0-parity`. O player e o `NeuroSlideHub` **não** consomem o plano.

## Call graph confirmado (runtime atual)

```
AvantLessonPlayer
  └─ NeuroSlide (NeuroSlide.tsx)
       ├─ normalizeReverseStudySlide (lib/reverseStudySlidesNormalize.ts)
       ├─ enrichPresentationContext (slidePresentation.ts)
       │    └─ resolvePedagogicalBranch (lib/slides/pedagogicalBranch.ts)
       ├─ resolveSlidePresentation (slidePresentation.ts)  ← autoridade de layout/interação
       │    ├─ shouldApplySubtopicMold / isBespokeLayoutVariant (lib/slides/moldAffinity.ts)
       │    ├─ bespokeMoldHasRenderableSlots (lib/slides/moldSlotFit.ts)
       │    ├─ getLayoutVariantForBranch / getPresentationDesign (pedagogicalBranch.ts)
       │    ├─ getLayoutVariantBySubtopic / calculateLayoutVariantFromType (themeGenerator.ts)
       │    ├─ resolveConceptMapLayoutVariant / goldenRule / logicFlow / dangerZone (*Layout.ts)
       │    ├─ resolveLogicFlowRevealMode / resolveDangerZoneRevealMode
       │    ├─ enhanceGoldenRuleRows / resolveSlideTitle
       │    └─ mold fallback (segunda passagem forceGenericMold)
       ├─ getThemeForSlide (themeGenerator.ts)  ← autoridade de tema/cores
       └─ NeuroSlideHub → variantes React + ReverseStudyShell (shell apenas UI)
```

Auditoria G0.2 (`lib/neurocanvas/resolverAudit.ts`) replica o mesmo fluxo de contexto + `resolveSlidePresentation` sobre a baseline canônica (`lib/neurocanvas/canonicalCatalog.ts`).

## Schema real (`NeuroVisualPlanV0`)

Definido em `lib/neurocanvas/neuroVisualPlanV0.ts`:

```typescript
type NeuroVisualPlanSlideType = NonNullable<NeuroVisualPlanSlideInput['type']> | 'unknown';

type NeuroVisualPlanV0 = {
  schema_version: 'neurovisual-plan-v0';
  slide_type: NeuroVisualPlanSlideType;
  presentation: ResolvedSlidePresentation;
  /** Omitido somente quando `includeTheme: false`; padrão sempre inclui ThemeColors. */
  theme?: ThemeColors;
};

type ResolvedSlidePresentation = {
  layoutVariant: string;
  revealMode: LogicFlowRevealMode;
  dangerRevealMode: LogicFlowRevealMode;
  bulletStyle: DangerZoneBulletStyle;
  slideTitle?: string;
  rows?: GoldenRuleRow[];
  moldFallback?: boolean;
};
```

`buildNeuroVisualPlanV0()` chama **somente** `enrichPresentationContext`, `resolveSlidePresentation` e `getThemeForSlide` — sem reimplementar regras.

## Autoridade do resolver atual

| Decisão | Autoridade | Plano v0 |
|---------|------------|----------|
| layout, reveal, bullet, rows, título | `resolveSlidePresentation` | `presentation` (cópia do retorno) |
| tema/cores | `getThemeForSlide` | `theme` (cópia do retorno) |
| Renderização | `NeuroSlideHub` + variantes | **não alterado** |

## Invariantes (Fase 0A)

- Sem timestamp, random, rede, LLM, confidence ou reasons inferidos.
- Sem reclassificar conteúdo nem modificar texto JSON.
- Sem duplicar algoritmos — resolvers existentes são a fonte de verdade.
- Sem `as any` / `as never` / double cast.
- Sem alteração em player, Hub, variantes ou JSON de questões.

## Testes herméticos vs paridade pesada

| Camada | Onde | Catálogo | CI |
|--------|------|----------|-----|
| **Hermético** | `__tests__/lib/neurocanvas/neuroVisualPlanV0.test.ts` | Fixtures em memória / tmpdir | Sim (`npm test`) |
| **Paridade pesada** | `npm run audit:neurovisual-plan-v0-parity` | Baseline canônica local (`data/catalog-migration`) | Não |

Paridade pesada: preflight → `buildCanonicalCatalog` → por slide compara `canonicalJson` integral de `presentation` + `ThemeColors` × `buildNeuroVisualPlanV0`. Campos divergentes no relatório são derivados dinamicamente da união de chaves — qualquer campo futuro em `ResolvedSlidePresentation` entra automaticamente na comparação. Exit ≠ 0 se houver divergência.

## Baseline editorial e gate G0.2

- **676 slugs** permanecem **editorialmente unresolved** (conteúdo divergente sem evidência documentada única).
- Esses slugs estão **fora da baseline canônica** (`iterateCanonicalQuestions` só percorre `selections`, não `unresolved_slugs`).
- Paridade Fase 0A cobre **4.975 questões / 19.900 slides** da baseline canônica atual — não o catálogo bruto inteiro.
- **Fase 0B** e composições visuais permanecem **NOT READY** até resolver o gate editorial dos 676 unresolved.
- **Próximo passo após merge do PR #48:** resolver o gate editorial G0.2 (dedupe/unresolved) — **não** iniciar Fase 0B automaticamente.

## Não objetivos (Fase 0A)

- Cache por `questionHash`, Supabase, migrations.
- `PedagogicalSceneGraph`, `VisualDNA`, `LearnerLens`, compositor de primitivas.
- Heurísticas semânticas novas, layouts ou temas novos.
- Feature flag runtime, wiring no player, screenshots.

## Critérios para Fase 0B

- Paridade local 100% (zero divergências) estável em snapshots G0.2.
- Gates verdes: typecheck, architecture-check, testes herméticos.
- Documentação de campos opcionais futuros (ex.: telemetria `engineVersion`) sem acoplar ao renderer.
- Plano aprovado para integração opt-in (ainda não autoridade de render).

## Comandos

```bash
# Testes herméticos (incluídos em npm test)
npx jest __tests__/lib/neurocanvas/neuroVisualPlanV0.test.ts --runInBand

# Paridade completa (requer catálogo local exportado)
npm run audit:neurovisual-plan-v0-parity
```

Artifact opcional: `artifacts/neurovisual-plan-v0-parity.json` (amostra limitada de divergências).
