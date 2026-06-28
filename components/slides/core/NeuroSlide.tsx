'use client';

import React, { useMemo } from 'react';
import { ConceptMap } from '../variants/ConceptMap';
import { MorphologicalConceptMap } from '../variants/MorphologicalConceptMap';
import { ProcedureProtocolConceptMap } from '../variants/ProcedureProtocolConceptMap';
import { VitalsPanelConceptMap } from '../variants/VitalsPanelConceptMap';
import { SurvivalChainConceptMap } from '../variants/SurvivalChainConceptMap';
import { VaccineTimelineConceptMap } from '../variants/VaccineTimelineConceptMap';
import { PniRulesDeckConceptMap } from '../variants/PniRulesDeckConceptMap';
import { SaeDocumentationConceptMap } from '../variants/SaeDocumentationConceptMap';
import { SaeResponsibilityMatrix } from '../variants/SaeResponsibilityMatrix';
import { SusLegalPillarsConceptMap } from '../variants/SusLegalPillarsConceptMap';
import { SusArt4OrbitConceptMap } from '../variants/SusArt4OrbitConceptMap';
import { AbsorptionSpeedRailConceptMap } from '../variants/AbsorptionSpeedRailConceptMap';
import { AdmeJourneyRailConceptMap } from '../variants/AdmeJourneyRailConceptMap';
import { DoseEquivalenceRailConceptMap } from '../variants/DoseEquivalenceRailConceptMap';
import { OxygenProtocolDeckConceptMap } from '../variants/OxygenProtocolDeckConceptMap';
import { IvCareOrbitConceptMap } from '../variants/IvCareOrbitConceptMap';
import { MorphingTimelineConceptMap } from '../variants/MorphingTimelineConceptMap';
import { LabSpecimenChainConceptMap } from '../variants/LabSpecimenChainConceptMap';
import { WoundStageTissueDeckConceptMap } from '../variants/WoundStageTissueDeckConceptMap';
import { BurnDepthLayerDeckConceptMap } from '../variants/BurnDepthLayerDeckConceptMap';
import { IstRiskRoutesDeckConceptMap } from '../variants/IstRiskRoutesDeckConceptMap';
import { AdolescentPrivacyCurtainConceptMap } from '../variants/AdolescentPrivacyCurtainConceptMap';
import { Nr32AnnexDeckConceptMap } from '../variants/Nr32AnnexDeckConceptMap';
import { RespiratorioAsmaDpocDuelDeckConceptMap } from '../variants/RespiratorioAsmaDpocDuelDeckConceptMap';
import { GoldenRule } from '../variants/GoldenRule';
import { DangerZone } from '../variants/DangerZone';
import { LogicFlow } from '../variants/LogicFlow';
import { SyllableScanner } from '../variants/SyllableScanner';
import { VersusArena } from '../variants/VersusArena';
import { getThemeForSlide } from './themeGenerator';
import { resolveSlidePresentation, enrichPresentationContext, type SlidePresentationContext } from './slidePresentation';
import type { FamilyId } from './questionFamily';
import type { ThemeColors } from './themeGenerator';
import {
  isVersusArenaSideReady,
  normalizeLogicFlowSteps,
  normalizeReverseStudySlide,
} from '@/lib/reverseStudySlidesNormalize';
import { ReverseStudyShell } from './ReverseStudyShell';
import { getSlideTypeBgClass, SLIDE_SHELL_CARD } from './slideSurface';
import type { ReverseStudyShellContext } from '@/types/lesson';

// ============================================================================
// COMPONENTE ORQUESTRADOR (O HUB) COM TEMAS HÍBRIDOS
// ============================================================================
export const NeuroSlideHub = ({
  slide,
  questionHash,
  questionSlug,
  slideIndex,
  jsonLayoutVariant,
  questionFamilyId,
  questionInstruction,
  questionSlides,
  questionMeta,
}: {
  slide: any;
  questionHash: string;
  questionSlug?: string;
  slideIndex?: number;
  jsonLayoutVariant?: string;
  questionFamilyId?: FamilyId;
  questionInstruction?: string;
  questionSlides?: unknown[];
  /** meta da questão — pedagogical_branch e subtopico canônico (L2.5). */
  questionMeta?: { subtopico?: string; pedagogical_branch?: string };
}) => {
  // Sistema híbrido: prioriza subject, fallback para hash com variações únicas
  const theme = getThemeForSlide(slide, questionHash, slideIndex);

  const presentationContext: SlidePresentationContext = enrichPresentationContext(
    {
      questionSlug: questionSlug ?? questionHash,
      slideIndex,
      jsonLayoutVariant,
      familyId: questionFamilyId,
    },
    slide.meta,
    questionInstruction,
    questionSlides as { type?: string; items?: unknown[]; meta?: { subtopico?: string } }[] | undefined,
    questionMeta,
  );

  const {
    layoutVariant,
    revealMode: logicRevealMode,
    dangerRevealMode,
    bulletStyle: dangerBulletStyle,
    rows: goldenRows,
  } = resolveSlidePresentation(slide, presentationContext);
  
  // Helper para mapear items para concepts quando necessário
  const getConcepts = () => {
    if (slide.concepts && Array.isArray(slide.concepts)) {
      return slide.concepts;
    }
    if (slide.items && Array.isArray(slide.items)) {
      return slide.items.map((item: any) => ({
        icon: item.icon || 'HelpCircle',
        title: item.label || item.title || '',
        description: item.detail || item.description || '',
        correct: typeof item.correct === 'string' ? item.correct.trim() : undefined,
      }));
    }
    return [];
  };
  
  switch (slide.type) {
    case 'concept_map':
      if (layoutVariant === 'morphological') {
        return <MorphologicalConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'procedure-protocol') {
        return <ProcedureProtocolConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'vitals-panel') {
        return <VitalsPanelConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'survival-chain') {
        return <SurvivalChainConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'vaccine-timeline') {
        return <VaccineTimelineConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'pni-rules-deck') {
        return <PniRulesDeckConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'sae-documentation') {
        return <SaeDocumentationConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'sae-responsibility-matrix') {
        return <SaeResponsibilityMatrix concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'sus-legal-pillars') {
        return <SusLegalPillarsConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'sus-art4-orbit') {
        return <SusArt4OrbitConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'absorption-speed-rail') {
        return <AbsorptionSpeedRailConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'adme-journey-rail') {
        return <AdmeJourneyRailConceptMap concepts={getConcepts()} theme={theme} footerRule={slide.footer_rule} />;
      }
      if (layoutVariant === 'dose-equivalence-rail') {
        return <DoseEquivalenceRailConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'oxygen-protocol-deck') {
        return (
          <OxygenProtocolDeckConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      if (layoutVariant === 'iv-care-orbit') {
        return (
          <IvCareOrbitConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      if (layoutVariant === 'morphing-timeline') {
        return (
          <MorphingTimelineConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      if (layoutVariant === 'lab-specimen-chain') {
        return (
          <LabSpecimenChainConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      if (layoutVariant === 'wound-stage-tissue-deck') {
        return (
          <WoundStageTissueDeckConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      if (layoutVariant === 'burn-depth-layer-deck') {
        return (
          <BurnDepthLayerDeckConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      if (layoutVariant === 'ist-risk-routes-deck') {
        return <IstRiskRoutesDeckConceptMap concepts={getConcepts()} theme={theme} />;
      }
      if (layoutVariant === 'adolescent-privacy-curtain') {
        return (
          <AdolescentPrivacyCurtainConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      if (layoutVariant === 'nr32-annex-deck') {
        return (
          <Nr32AnnexDeckConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      if (layoutVariant === 'respiratorio-asma-dpoc-duel-deck') {
        return (
          <RespiratorioAsmaDpocDuelDeckConceptMap
            concepts={getConcepts()}
            theme={theme}
            footerRule={slide.footer_rule}
          />
        );
      }
      return <ConceptMap concepts={getConcepts()} theme={theme} layoutVariant={layoutVariant} />;
    case 'golden_rule':
      return (
        <GoldenRule
          content={slide.content || slide.main_text || ''}
          rows={goldenRows}
          theme={theme}
          layoutVariant={layoutVariant}
          footerRule={slide.footer_rule}
        />
      );
    case 'danger_zone':
      // Resumo principal da pegadinha (prioriza content, depois main_text, depois header.title)
      const dangerContent = slide.content || slide.main_text || slide.header?.title || '';
      // Items específicos da pegadinha
      const dangerItems = slide.items && Array.isArray(slide.items) ? slide.items : undefined;
      // Footer rule como resumo final
      const dangerFooterRule = slide.footer_rule || slide.structure?.footer_rule;
      return (
        <DangerZone
          content={dangerContent}
          theme={theme}
          items={dangerItems}
          footerRule={dangerFooterRule}
          layoutVariant={layoutVariant}
          bulletStyle={dangerBulletStyle}
          compareRevealMode={dangerRevealMode}
        />
      );
    case 'logic_flow':
      return (
        <LogicFlow
          steps={normalizeLogicFlowSteps(slide.steps)}
          theme={theme}
          layoutVariant={layoutVariant}
          revealMode={logicRevealMode}
        />
      );
    case 'syllable_scanner':
      return <SyllableScanner word={slide.word} tonicIndex={slide.tonicIndex} rule={slide.rule} theme={theme} />;
    case 'versus_arena': {
      const conceptA = slide.concept_a;
      const conceptB = slide.concept_b;
      if (!isVersusArenaSideReady(conceptA) || !isVersusArenaSideReady(conceptB)) {
        return (
          <div className="flex w-full min-w-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-base italic text-slate-500">
              Slide versus_arena incompleto: defina concept_a e concept_b com title e points.
            </p>
          </div>
        );
      }
      return <VersusArena concept_a={conceptA} concept_b={conceptB} theme={theme} />;
    }
    default:
      return (
        <div className="flex w-full min-w-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-base italic text-slate-500">Layout padrão: {slide.content || slide.main_text || 'Sem conteúdo'}</p>
        </div>
      );
  }
};

// ============================================================================
// MAIN COMPONENT - COM SISTEMA DE TEMAS ÚNICOS
// ============================================================================
export default function NeuroSlide({
  data,
  questionHash,
  questionSlug,
  slideIndex,
  shellContext,
  standalone = false,
  questionFamilyId,
  questionInstruction,
  questionSlides,
  questionMeta,
}: {
  data: any;
  questionHash?: string;
  questionSlug?: string;
  slideIndex?: number;
  shellContext?: ReverseStudyShellContext;
  /** Preview/material: shell com slide 1/1, sem badge de banca. */
  standalone?: boolean;
  /** Família pedagógica (7 goldens) — âncora visual no player. */
  questionFamilyId?: FamilyId;
  /** Enunciado completo — inferência de ramo pedagógico L2.5. */
  questionInstruction?: string;
  /** Todos os slides da questão — inferência de ramo. */
  questionSlides?: unknown[];
  /** meta da questão — pedagogical_branch e subtopico canônico (L2.5). */
  questionMeta?: { subtopico?: string; pedagogical_branch?: string };
}) {
  const safeData = useMemo(() => normalizeReverseStudySlide(data ?? {}) as any, [data]);
  const hashSource = questionHash || safeData.id || JSON.stringify(safeData).substring(0, 50) || 'default';
  const slugSource = questionSlug || safeData.id || hashSource;

  const presentationContext: SlidePresentationContext = useMemo(
    () =>
      enrichPresentationContext(
        {
          questionSlug: slugSource,
          slideIndex,
          jsonLayoutVariant: safeData.layout_variant,
          familyId: questionFamilyId,
        },
        safeData.meta,
        questionInstruction,
        questionSlides as { type?: string; items?: unknown[]; meta?: { subtopico?: string } }[] | undefined,
        questionMeta,
      ),
    [
      slugSource,
      slideIndex,
      safeData.layout_variant,
      safeData.meta,
      questionFamilyId,
      questionInstruction,
      questionSlides,
      questionMeta,
    ],
  );

  const normalizedData = useMemo(() => {
    const pickNonEmptySteps = (top: unknown, nested: unknown) => {
      const a = Array.isArray(top) ? top : [];
      const b = Array.isArray(nested) ? nested : [];
      return a.length > 0 ? a : b;
    };

    const pickItems = (top: unknown, nested: unknown) => {
      const a = Array.isArray(top) ? top : [];
      const b = Array.isArray(nested) ? nested : [];
      return a.length > 0 ? top : b.length > 0 ? nested : top ?? nested;
    };

    const mapItemsToConcepts = (items: any[] | undefined) =>
      items?.map((item: any) => ({
        icon: item.icon || 'HelpCircle',
        title: item.label || item.title || '',
        description: item.detail || item.description || '',
      }));

    // FORMATO NOVO (Semântico), sem bloco structure: pass-through enxuto
    if (safeData.type && !safeData.structure) {
      return {
        ...safeData,
        meta: safeData.meta || {},
        steps: Array.isArray(safeData.steps) ? safeData.steps : [],
        layout_variant: safeData.layout_variant,
      };
    }

    /**
     * Híbrido / legado: muitos JSONs trazem `type` + `structure` ao mesmo tempo.
     * Antes só fazíamos `{ ...structure, ...criticalFields }` e perdíamos campos do topo
     * (`main_text`, `items`, `content`, etc.) — slides ficavam vazios no player.
     */
    if (safeData.structure && typeof safeData.structure === 'object') {
      const structure = safeData.structure as Record<string, any>;
      const itemsMerged = pickItems(safeData.items, structure.items);
      const stepsMerged = pickNonEmptySteps(safeData.steps, structure.steps);

      const criticalFields = {
        type: safeData.type || safeData.layout_type,
        steps: stepsMerged,
        content:
          safeData.content ||
          safeData.main_text ||
          structure.main_text ||
          structure.content,
        main_text: safeData.main_text || structure.main_text,
        concepts: safeData.concepts,
        layout_variant: safeData.layout_variant,
        word: safeData.word,
        tonicIndex: safeData.tonicIndex,
        rule: safeData.rule,
        concept_a: safeData.concept_a,
        concept_b: safeData.concept_b,
        items: itemsMerged,
        footer_rule: safeData.footer_rule || structure.footer_rule,
        chip_label: safeData.chip_label,
        slide_title: safeData.slide_title,
        bullet_style: safeData.bullet_style,
        reveal_mode: safeData.reveal_mode,
        rows: safeData.rows,
      };

      const mappedConcepts =
        criticalFields.concepts ||
        mapItemsToConcepts(Array.isArray(itemsMerged) ? itemsMerged : undefined);

      return {
        ...structure,
        ...safeData,
        ...criticalFields,
        concepts: mappedConcepts,
        layout_type: safeData.layout_type || safeData.type || 'concept_map',
        design_system: safeData.design_system,
        meta: safeData.meta || {},
        subject: safeData.subject,
        layout_variant: criticalFields.layout_variant,
      };
    }

    return {
      ...safeData,
      meta: safeData.meta || {},
      layout_variant: safeData.layout_variant,
    };
  }, [safeData]);

  const theme = useMemo(() => getThemeForSlide(normalizedData, hashSource, slideIndex), [normalizedData, hashSource, slideIndex]);

  if (!data) return null;

  let inner: React.ReactNode;

  // Se o slide tem o formato novo (com type), usa o Hub com sistema híbrido
  if (normalizedData.type) {
    inner = (
      <NeuroSlideHub
        slide={normalizedData}
        questionHash={hashSource}
        questionSlug={slugSource}
        slideIndex={slideIndex}
        jsonLayoutVariant={safeData.layout_variant}
        questionFamilyId={questionFamilyId}
        questionInstruction={questionInstruction}
        questionSlides={questionSlides}
        questionMeta={questionMeta}
      />
    );
  } else {
    const legacyPresentation = resolveSlidePresentation(
      {
        ...normalizedData,
        type: normalizedData.layout_type,
      },
      presentationContext,
    );
    switch (normalizedData.layout_type) {
      case 'concept_map': {
        const concepts =
          normalizedData.items && Array.isArray(normalizedData.items)
            ? normalizedData.items.map((item: any) => ({
                icon: item.icon || 'HelpCircle',
                title: item.label || item.title || '',
                description: item.detail || item.description || '',
                correct: typeof item.correct === 'string' ? item.correct.trim() : undefined,
              }))
            : normalizedData.concepts || [];
        if (legacyPresentation.layoutVariant === 'morphological') {
          inner = <MorphologicalConceptMap concepts={concepts} theme={theme} />;
        } else if (legacyPresentation.layoutVariant === 'procedure-protocol') {
          inner = <ProcedureProtocolConceptMap concepts={concepts} theme={theme} />;
        } else if (legacyPresentation.layoutVariant === 'vitals-panel') {
          inner = <VitalsPanelConceptMap concepts={concepts} theme={theme} />;
        } else {
          inner = (
            <ConceptMap
              concepts={concepts}
              theme={theme}
              layoutVariant={legacyPresentation.layoutVariant}
            />
          );
        }
        break;
      }
      case 'golden_rule':
        inner = (
          <GoldenRule
            content={normalizedData.content || normalizedData.main_text || normalizedData.items?.[0]?.label || ''}
            rows={legacyPresentation.rows}
            theme={theme}
            layoutVariant={legacyPresentation.layoutVariant}
            footerRule={normalizedData.footer_rule}
          />
        );
        break;
      case 'danger_zone':
        inner = (
          <DangerZone
            content={normalizedData.header?.title || normalizedData.footer_rule}
            theme={theme}
            layoutVariant={legacyPresentation.layoutVariant}
            items={normalizedData.items}
            footerRule={normalizedData.footer_rule}
            bulletStyle={legacyPresentation.bulletStyle}
            compareRevealMode={legacyPresentation.dangerRevealMode}
          />
        );
        break;
      case 'logic_flow': {
        const normalizedLogicSteps = normalizeLogicFlowSteps(normalizedData.steps);
        inner = (
          <LogicFlow
            steps={normalizedLogicSteps}
            theme={theme}
            layoutVariant={legacyPresentation.layoutVariant}
            revealMode={legacyPresentation.revealMode}
          />
        );
        break;
      }
      case 'syllable_scanner':
        inner = (
          <SyllableScanner
            word={normalizedData.word || ''}
            tonicIndex={normalizedData.tonicIndex ?? 0}
            rule={normalizedData.rule || normalizedData.footer_rule || ''}
            theme={theme}
          />
        );
        break;
      case 'versus_arena': {
        const conceptA = normalizedData.concept_a;
        const conceptB = normalizedData.concept_b;
        if (!isVersusArenaSideReady(conceptA) || !isVersusArenaSideReady(conceptB)) {
          inner = (
            <div className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-base italic text-slate-500">
                Slide versus_arena incompleto: defina concept_a e concept_b com title e points.
              </p>
            </div>
          );
        } else {
          inner = <VersusArena concept_a={conceptA} concept_b={conceptB} theme={theme} />;
        }
        break;
      }
      default:
        inner = (
          <div className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-base italic text-slate-500">Slide não reconhecido</p>
          </div>
        );
    }
  }

  const useShell = Boolean(shellContext) || standalone;
  const resolvedShell = shellContext ?? (standalone
    ? { slideIndex: 0, totalSlides: 1 }
    : null);

  const shellClass = useShell
    ? 'box-border flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto'
    : 'box-border flex w-full min-w-0 flex-col items-center px-3 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10';
  const slideType = normalizedData.type ?? normalizedData.layout_type;
  const chipLabel = normalizedData.chip_label as string | undefined;
  const presentation = resolveSlidePresentation(normalizedData, presentationContext);
  const slideTitle = presentation.slideTitle;

  const body = useShell && resolvedShell ? (
    <ReverseStudyShell
      slideType={slideType}
      chipLabel={chipLabel}
      slideTitle={slideTitle}
      slideIndex={resolvedShell.slideIndex}
      totalSlides={resolvedShell.totalSlides}
      banca={resolvedShell.banca}
      theme={theme}
    >
      {inner}
    </ReverseStudyShell>
  ) : (
    inner
  );

  if (useShell && resolvedShell) {
    return (
      <div className={shellClass}>
        <div
          className={[
            SLIDE_SHELL_CARD,
            getSlideTypeBgClass(slideType),
            'p-3 sm:p-4 md:p-5',
          ].join(' ')}
        >
          {body}
        </div>
      </div>
    );
  }

  return <div className={shellClass}>{body}</div>;
}
