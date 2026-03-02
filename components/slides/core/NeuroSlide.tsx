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
import type { ThemeColors } from './themeGenerator';

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
  const layoutVariant = slide.layout_variant || calculateLayoutVariant(slide);
  
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
      return <GoldenRule content={slide.content || slide.main_text || ''} theme={theme} layoutVariant={layoutVariant} />;
    case 'danger_zone':
      // Resumo principal da pegadinha (prioriza content, depois main_text, depois header.title)
      const dangerContent = slide.content || slide.main_text || slide.header?.title || '';
      // Items específicos da pegadinha
      const dangerItems = slide.items && Array.isArray(slide.items) ? slide.items : undefined;
      // Footer rule como resumo final
      const dangerFooterRule = slide.footer_rule || slide.structure?.footer_rule;
      return <DangerZone 
        content={dangerContent} 
        theme={theme} 
        items={dangerItems}
        footerRule={dangerFooterRule}
        layoutVariant={layoutVariant}
      />;
    case 'logic_flow':
      return <LogicFlow steps={slide.steps || []} theme={theme} layoutVariant={layoutVariant} />;
    case 'syllable_scanner':
      return <SyllableScanner word={slide.word} tonicIndex={slide.tonicIndex} rule={slide.rule} theme={theme} />;
    case 'versus_arena':
      return <VersusArena concept_a={slide.concept_a} concept_b={slide.concept_b} theme={theme} />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center p-6 bg-slate-800 rounded-xl">
          <p className="text-slate-400 italic">Layout padrão: {slide.content || slide.main_text || 'Sem conteúdo'}</p>
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
  slideIndex 
}: { 
  data: any; 
  questionHash?: string;
  slideIndex?: number;
}) {
  const safeData = useMemo(() => data ?? {}, [data]);
  const hashSource = questionHash || safeData.id || JSON.stringify(safeData).substring(0, 50) || 'default';

  const normalizedData = useMemo(() => {
    // FORMATO NOVO (Semântico): Se tem 'type' no nível superior, usa diretamente
    if (safeData.type && !safeData.structure) {
      return {
        ...safeData,
        meta: safeData.meta || {},
        // Garante que steps é sempre um array válido
        steps: Array.isArray(safeData.steps) ? safeData.steps : [],
        // Calcula layout_variant automaticamente se não fornecido
        layout_variant: safeData.layout_variant || calculateLayoutVariant(safeData),
      };
    }

    // FORMATO ANTIGO (Com structure): Normaliza para compatibilidade
    if (safeData.structure) {
      const structure = safeData.structure;
      const criticalFields = {
        type: safeData.type || safeData.layout_type,
        steps: safeData.steps || structure.steps || [],
        content: safeData.content || structure.main_text || structure.content,
        concepts: safeData.concepts,
        layout_variant: safeData.layout_variant,
        word: safeData.word,
        tonicIndex: safeData.tonicIndex,
        rule: safeData.rule,
        concept_a: safeData.concept_a,
        concept_b: safeData.concept_b,
        items: safeData.items || structure.items,
        footer_rule: safeData.footer_rule || structure.footer_rule,
      };

      // Extrai concepts de items se necessário
      const mappedConcepts = criticalFields.concepts || 
        (structure.items && structure.items.length > 0 ? structure.items.map((item: any) => ({
          icon: item.icon || 'HelpCircle',
          title: item.label || item.title || '',
          description: item.detail || item.description || ''
        })) : undefined);

      return {
        ...structure,
        ...criticalFields,
        concepts: mappedConcepts,
        layout_type: safeData.layout_type || safeData.type || 'concept_map',
        design_system: safeData.design_system, // Mantém para compatibilidade
        meta: safeData.meta || {},
        subject: safeData.subject,
        // Calcula layout_variant se não fornecido
        layout_variant: criticalFields.layout_variant || calculateLayoutVariant({
          type: criticalFields.type,
          items: criticalFields.items,
          concepts: mappedConcepts,
        }),
      };
    }

    // Fallback: retorna dados como estão
    return { 
      ...safeData, 
      meta: safeData.meta || {},
      layout_variant: safeData.layout_variant || calculateLayoutVariant(safeData),
    };
  }, [safeData]);

  const theme = useMemo(() => getThemeForSlide(normalizedData, hashSource, slideIndex), [normalizedData, hashSource, slideIndex]);

  if (!data) return null;

  // Se o slide tem o formato novo (com type), usa o Hub com sistema híbrido
  if (normalizedData.type) {
    return (
      <div className="w-full h-full overflow-hidden">
        <NeuroSlideHub slide={normalizedData} questionHash={hashSource} slideIndex={slideIndex} />
      </div>
    );
  }
  
  switch (normalizedData.layout_type) {
    case 'concept_map':
      if (normalizedData.items && Array.isArray(normalizedData.items)) {
        const concepts = normalizedData.items.map((item: any) => ({
          icon: item.icon || 'HelpCircle',
          title: item.label || item.title || '',
          description: item.detail || item.description || ''
        }));
        return <ConceptMap concepts={concepts} theme={theme} layoutVariant={normalizedData.layout_variant} />;
      }
      return <ConceptMap concepts={normalizedData.concepts || []} theme={theme} layoutVariant={normalizedData.layout_variant} />;
    case 'golden_rule':
      return <GoldenRule content={normalizedData.main_text || normalizedData.items?.[0]?.label || normalizedData.footer_rule} theme={theme} layoutVariant={normalizedData.layout_variant} />;
    case 'danger_zone':
      return <DangerZone content={normalizedData.header?.title || normalizedData.footer_rule} theme={theme} layoutVariant={normalizedData.layout_variant} items={normalizedData.items} footerRule={normalizedData.footer_rule} />;
    case 'logic_flow':
      // Garante que steps é sempre um array válido e não vazio
      const normalizedLogicSteps = Array.isArray(normalizedData.steps) && normalizedData.steps.length > 0 
        ? normalizedData.steps 
        : [];
      // Tema já foi calculado com slideIndex acima
      return <LogicFlow steps={normalizedLogicSteps} theme={theme} layoutVariant={normalizedData.layout_variant} />;
    case 'syllable_scanner':
      return <SyllableScanner 
        word={normalizedData.word || ''} 
        tonicIndex={normalizedData.tonicIndex ?? 0} 
        rule={normalizedData.rule || normalizedData.footer_rule || ''} 
        theme={theme}
      />;
    case 'versus_arena':
      return <VersusArena concept_a={normalizedData.concept_a} concept_b={normalizedData.concept_b} theme={theme} />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center p-6 bg-slate-800 rounded-xl">
          <p className="text-slate-400 italic">Slide não reconhecido</p>
        </div>
      );
  }
}
