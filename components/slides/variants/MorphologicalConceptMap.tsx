'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

// ============================================================================
// LAYOUT MORFOLÓGICO: Grid CSS Fluido + Conexão Implícita + Zero Layout Shift
// ============================================================================

export interface Concept {
  icon: string;
  title: string;
  description: string;
}

interface MorphologicalConceptMapProps {
  concepts: Concept[];
  theme: ThemeColors;
}

export const MorphologicalConceptMap = ({ concepts, theme }: MorphologicalConceptMapProps) => {
  // Helper para obter ícone
  const getIcon = (iconName: string) => {
    const IconName = iconName as keyof typeof LucideIcons;
    const IconComponent = LucideIcons[IconName];
    return (IconComponent && typeof IconComponent === 'function') 
      ? (IconComponent as React.ComponentType<{ size?: number }>)
      : HelpCircle;
  };

  // Identificar conceito central (primeiro ou maior)
  const centralConcept = concepts[0];
  const detailConcepts = concepts.slice(1);

  const borderColorClass = theme.borderColor;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col p-3 md:p-4">
      {/* Background com tema */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />
      
      {/* Grid CSS Fluido - preenche área disponível */}
      <div 
        className="morph-grid-container relative z-10 grid w-full flex-1 grid-cols-1 gap-4 md:gap-5 sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]"
      >
        {/* Conceito Central (Pai) - Ocupa mais espaço, glow mais intenso */}
        {centralConcept && (
          <div
            className={`morph-central-card relative overflow-hidden rounded-[1.5rem] border-2 border-slate-200 bg-white shadow-sm min-h-[180px] sm:min-h-[220px] transition-all duration-200 hover:-translate-y-0.5 ${detailConcepts.length > 0 ? 'col-span-1 sm:col-span-2' : 'col-span-1'}`}
            style={{
              borderColor: borderColorClass.replace('border-', '').replace('/30', '').replace('/40', '').replace('/50', '') + '35',
              animation: 'morphReveal 0.4s ease-out',
            }}
          >
            <div className="relative z-10 flex flex-col gap-3 p-5 md:p-7">
              <div className={`w-16 h-16 rounded-2xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} shadow-lg`}>
                {React.createElement(getIcon(centralConcept.icon), { size: 32 })}
              </div>
              <div>
                <h3 className={`font-body font-bold tracking-normal ${theme.textPrimary} text-xl mb-3 md:text-3xl`}>
                  {centralConcept.title}
                </h3>
                <p className={`font-body leading-relaxed ${theme.textSecondary} text-base md:text-lg`}>
                  {centralConcept.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detalhes (Filhos) - Conexão implícita através de proximidade e cores */}
        {detailConcepts.map((concept, index) => {
          const Icon = getIcon(concept.icon);
          
          return (
            <div
              key={index}
              className="morph-detail-card relative overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm min-h-[160px] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: borderColorClass.replace('border-', '').replace('/30', '').replace('/40', '').replace('/50', '') + '25',
                animation: `morphReveal 0.4s ease-out both`,
                animationDelay: `${0.1 * (index + 1)}s`,
              }}
            >
              <div className="relative z-10 flex flex-col gap-2 md:gap-3 p-4 md:p-5">
                <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} shadow-md`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className={`font-body font-bold tracking-normal ${theme.textPrimary} text-xl mb-2`}>
                    {concept.title}
                  </h4>
                  <p className={`font-body leading-relaxed ${theme.textSecondary} text-base md:text-sm`}>
                    {concept.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
