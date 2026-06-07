'use client';

import React, { useMemo } from 'react';
import { ConceptMap } from '../variants/ConceptMap';
import { MorphologicalConceptMap } from '../variants/MorphologicalConceptMap';
import { GoldenRule } from '../variants/GoldenRule';
import { DangerZone } from '../variants/DangerZone';
import { LogicFlow } from '../variants/LogicFlow';
import { SyllableScanner } from '../variants/SyllableScanner';
import { VersusArena } from '../variants/VersusArena';
import { getThemeForSlide, calculateLayoutVariant } from './themeGenerator';
import { resolveDangerZoneLayoutVariant } from './dangerZoneLayout';
import { resolveGoldenRuleLayoutVariant } from './goldenRuleLayout';
import type { ThemeColors } from './themeGenerator';
import {
  isVersusArenaSideReady,
  normalizeLogicFlowSteps,
  normalizeReverseStudySlide,
} from '@/lib/reverseStudySlidesNormalize';
import { ReverseStudyShell } from './ReverseStudyShell';
import type { ReverseStudyShellContext } from '@/types/lesson';

// ============================================================================
// COMPONENTE ORQUESTRADOR (O HUB) COM TEMAS HÍBRIDOS
// ============================================================================
export const NeuroSlideHub = ({ 
  slide, 
  questionHash, 
  slideIndex 
}: { 
  slide: any; 
  questionHash: string;
  slideIndex?: number;
}) => {
  // Sistema híbrido: prioriza subject, fallback para hash com variações únicas
  const theme = getThemeForSlide(slide, questionHash, slideIndex);
  
  // Calcula layout_variant automaticamente se não fornecido (formato novo)
  const baseLayoutVariant = slide.layout_variant || calculateLayoutVariant(slide);
  const layoutVariant =
    slide.type === 'danger_zone'
      ? resolveDangerZoneLayoutVariant(slide, baseLayoutVariant)
      : slide.type === 'golden_rule'
        ? resolveGoldenRuleLayoutVariant(slide, baseLayoutVariant)
        : baseLayoutVariant;
  
  // Helper para mapear items para concepts quando necessário
  const getConcepts = () => {
    if (slide.concepts && Array.isArray(slide.concepts)) {
      return slide.concepts;
    }
    if (slide.items && Array.isArray(slide.items)) {
      return slide.items.map((item: any) => ({
        icon: item.icon || 'HelpCircle',
        title: item.label || item.title || '',
        description: item.detail || item.description || ''
      }));
    }
    return [];
  };
  
  switch (slide.type) {
    case 'concept_map':
      // Layout Morfológico se especificado, senão usa variante padrão
      if (layoutVariant === 'morphological') {
        return <MorphologicalConceptMap concepts={getConcepts()} theme={theme} />;
      }
      return <ConceptMap concepts={getConcepts()} theme={theme} layoutVariant={layoutVariant} />;
    case 'golden_rule':
      return (
        <GoldenRule
          content={slide.content || slide.main_text || ''}
          rows={slide.rows}
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
          bulletStyle={slide.bullet_style ?? 'numbered'}
        />
      );
    case 'logic_flow':
      return (
        <LogicFlow
          steps={normalizeLogicFlowSteps(slide.steps)}
          theme={theme}
          layoutVariant={layoutVariant}
          revealMode={slide.reveal_mode ?? 'auto'}
        />
      );
    case 'syllable_scanner':
      return <SyllableScanner word={slide.word} tonicIndex={slide.tonicIndex} rule={slide.rule} theme={theme} />;
    case 'versus_arena': {
      const conceptA = slide.concept_a;
      const conceptB = slide.concept_b;
      if (!isVersusArenaSideReady(conceptA) || !isVersusArenaSideReady(conceptB)) {
        return (
          <div className="flex w-full min-w-0 items-center justify-center rounded-xl bg-slate-800 p-6">
            <p className="text-base italic text-slate-400">
              Slide versus_arena incompleto: defina concept_a e concept_b com title e points.
            </p>
          </div>
        );
      }
      return <VersusArena concept_a={conceptA} concept_b={conceptB} theme={theme} />;
    }
    default:
      return (
        <div className="flex w-full min-w-0 items-center justify-center rounded-xl bg-slate-800 p-6">
          <p className="text-base italic text-slate-400">Layout padrão: {slide.content || slide.main_text || 'Sem conteúdo'}</p>
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
  slideIndex,
  shellContext,
  standalone = false,
}: {
  data: any;
  questionHash?: string;
  slideIndex?: number;
  shellContext?: ReverseStudyShellContext;
  /** Preview/material: shell com slide 1/1, sem badge de banca. */
  standalone?: boolean;
}) {
  const safeData = useMemo(() => normalizeReverseStudySlide(data ?? {}) as any, [data]);
  const hashSource = questionHash || safeData.id || JSON.stringify(safeData).substring(0, 50) || 'default';

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
        layout_variant: safeData.layout_variant || calculateLayoutVariant(safeData),
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
        layout_variant:
          criticalFields.layout_variant ||
          calculateLayoutVariant({
            type: criticalFields.type,
            items: criticalFields.items,
            concepts: mappedConcepts,
            steps: criticalFields.steps,
          }),
      };
    }

    return {
      ...safeData,
      meta: safeData.meta || {},
      layout_variant: safeData.layout_variant || calculateLayoutVariant(safeData),
    };
  }, [safeData]);

  const theme = useMemo(() => getThemeForSlide(normalizedData, hashSource, slideIndex), [normalizedData, hashSource, slideIndex]);

  if (!data) return null;

  let inner: React.ReactNode;

  // Se o slide tem o formato novo (com type), usa o Hub com sistema híbrido
  if (normalizedData.type) {
    inner = <NeuroSlideHub slide={normalizedData} questionHash={hashSource} slideIndex={slideIndex} />;
  } else {
    switch (normalizedData.layout_type) {
      case 'concept_map':
        if (normalizedData.items && Array.isArray(normalizedData.items)) {
          const concepts = normalizedData.items.map((item: any) => ({
            icon: item.icon || 'HelpCircle',
            title: item.label || item.title || '',
            description: item.detail || item.description || ''
          }));
          inner = <ConceptMap concepts={concepts} theme={theme} layoutVariant={normalizedData.layout_variant} />;
        } else {
          inner = <ConceptMap concepts={normalizedData.concepts || []} theme={theme} layoutVariant={normalizedData.layout_variant} />;
        }
        break;
      case 'golden_rule':
        inner = (
          <GoldenRule
            content={normalizedData.content || normalizedData.main_text || normalizedData.items?.[0]?.label || ''}
            rows={normalizedData.rows}
            theme={theme}
            layoutVariant={resolveGoldenRuleLayoutVariant(
              normalizedData,
              normalizedData.layout_variant,
            )}
            footerRule={normalizedData.footer_rule}
          />
        );
        break;
      case 'danger_zone':
        inner = (
          <DangerZone
            content={normalizedData.header?.title || normalizedData.footer_rule}
            theme={theme}
            layoutVariant={resolveDangerZoneLayoutVariant(
              normalizedData,
              normalizedData.layout_variant,
            )}
            items={normalizedData.items}
            footerRule={normalizedData.footer_rule}
            bulletStyle={normalizedData.bullet_style ?? 'numbered'}
          />
        );
        break;
      case 'logic_flow': {
        const normalizedLogicSteps = normalizeLogicFlowSteps(normalizedData.steps);
        inner = (
          <LogicFlow
            steps={normalizedLogicSteps}
            theme={theme}
            layoutVariant={normalizedData.layout_variant}
            revealMode={(normalizedData.reveal_mode as 'auto' | 'tap' | undefined) ?? 'auto'}
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
            <div className="flex w-full items-center justify-center rounded-xl bg-slate-800 p-6">
              <p className="text-base italic text-slate-400">
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
          <div className="flex w-full items-center justify-center rounded-xl bg-slate-800 p-6">
            <p className="text-base italic text-slate-400">Slide não reconhecido</p>
          </div>
        );
    }
  }

  const useShell = Boolean(shellContext) || standalone;
  const resolvedShell = shellContext ?? (standalone
    ? { slideIndex: 0, totalSlides: 1 }
    : null);

  const shellClass = useShell
    ? 'box-border flex h-full min-h-0 w-full min-w-0 flex-1 flex-col px-3 py-2 sm:px-4 md:px-6 md:py-3'
    : 'box-border flex w-full min-w-0 flex-col items-center px-3 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10';
  const slideType = normalizedData.type ?? normalizedData.layout_type;
  const chipLabel = normalizedData.chip_label as string | undefined;
  const slideTitle = normalizedData.slide_title as string | undefined;

  const body = useShell && resolvedShell ? (
    <ReverseStudyShell
      slideType={slideType}
      chipLabel={chipLabel}
      slideTitle={slideTitle}
      slideIndex={resolvedShell.slideIndex}
      totalSlides={resolvedShell.totalSlides}
      banca={resolvedShell.banca}
    >
      {inner}
    </ReverseStudyShell>
  ) : (
    inner
  );

  return <div className={shellClass}>{body}</div>;
}
