'use client';

import React, { useMemo } from 'react';
import { ConceptMap } from '../variants/ConceptMap';
import { GoldenRule } from '../variants/GoldenRule';
import { DangerZone } from '../variants/DangerZone';
import { LogicFlow } from '../variants/LogicFlow';
import { SyllableScanner } from '../variants/SyllableScanner';
import { getThemeForSlide } from './themeGenerator';
import type { ThemeColors } from './themeGenerator';

// ============================================================================
// COMPONENTE ORQUESTRADOR (O HUB) COM TEMAS HÍBRIDOS
// ============================================================================
export const NeuroSlideHub = ({ slide, questionHash }: { slide: any; questionHash: string }) => {
  // Sistema híbrido: prioriza subject, fallback para hash
  const theme = getThemeForSlide(slide, questionHash);
  
  switch (slide.type) {
    case 'concept_map':
      return <ConceptMap concepts={slide.concepts} theme={theme} layoutVariant={slide.layout_variant} />;
    case 'golden_rule':
      return <GoldenRule content={slide.content} theme={theme} />;
    case 'danger_zone':
      return <DangerZone content={slide.content} theme={theme} />;
    case 'logic_flow':
      return <LogicFlow steps={slide.steps} theme={theme} />;
    case 'syllable_scanner':
      return <SyllableScanner word={slide.word} tonicIndex={slide.tonicIndex} rule={slide.rule} theme={theme} />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center p-6 bg-slate-800 rounded-xl">
          <p className="text-slate-400 italic">Layout padrão: {slide.content}</p>
        </div>
      );
  }
};

// ============================================================================
// MAIN COMPONENT - COM SISTEMA DE TEMAS ÚNICOS
// ============================================================================
export default function NeuroSlide({ data, questionHash }: { data: any; questionHash?: string }) {
  if (!data) return null;

  // Gera hash da questão para fallback
  const hashSource = questionHash || data.id || JSON.stringify(data).substring(0, 50) || 'default';

  // Normalização: suporta tanto data direto quanto data.structure
  const normalizedData = data.structure 
    ? { 
        ...data.structure, 
        layout_type: data.layout_type || 'concept_map',
        design_system: data.design_system,
        meta: data.meta || {}
      }
    : { ...data, meta: data.meta || {} };

  // Se o slide tem o formato novo (com type), usa o Hub com sistema híbrido
  if (normalizedData.type) {
    return <NeuroSlideHub slide={normalizedData} questionHash={hashSource} />;
  }

  // Se tem layout_type, usa o sistema antigo (mantido para compatibilidade)
  // Gera tema usando sistema híbrido
  const theme = useMemo(() => getThemeForSlide(normalizedData, hashSource), [normalizedData, hashSource]);
  
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
      return <GoldenRule content={normalizedData.main_text || normalizedData.items?.[0]?.label || normalizedData.footer_rule} theme={theme} />;
    case 'danger_zone':
      return <DangerZone content={normalizedData.header?.title || normalizedData.footer_rule} theme={theme} />;
    case 'logic_flow':
      return <LogicFlow steps={normalizedData.steps || []} theme={theme} />;
    case 'syllable_scanner':
      return <SyllableScanner 
        word={normalizedData.word || ''} 
        tonicIndex={normalizedData.tonicIndex ?? 0} 
        rule={normalizedData.rule || normalizedData.footer_rule || ''} 
        theme={theme}
      />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center p-6 bg-slate-800 rounded-xl">
          <p className="text-slate-400 italic">Slide não reconhecido</p>
        </div>
      );
  }
}
