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

  // Extrair cor do tema
  const glowColor = theme.glow;
  const borderColorClass = theme.borderColor;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-6 overflow-y-auto custom-scrollbar relative">
      {/* Background com tema */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
      
      {/* Grid CSS Fluido - Navegador calcula automaticamente */}
      <div 
        className="morph-grid-container w-full max-w-6xl relative z-10 my-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Conceito Central (Pai) - Ocupa mais espaço, glow mais intenso */}
        {centralConcept && (
          <div
            className="morph-central-card relative overflow-hidden rounded-[1.5rem] bg-slate-900/80 backdrop-blur-xl border-2 min-h-[280px] transition-all duration-200 hover:-translate-y-1"
            style={{
              gridColumn: detailConcepts.length > 0 ? 'span 2' : 'span 1',
              boxShadow: `0 0 40px ${glowColor}`,
              borderColor: borderColorClass.replace('border-', '').replace('/30', '').replace('/40', '').replace('/50', '') + '30',
              animation: 'morphReveal 0.4s ease-out',
            }}
          >
            <div className="relative z-10 flex flex-col gap-4 p-6 md:p-8">
              <div className={`w-16 h-16 rounded-2xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} shadow-lg`}>
                {React.createElement(getIcon(centralConcept.icon), { size: 32 })}
              </div>
              <div>
                <h3 className={`font-black ${theme.textPrimary} text-2xl md:text-3xl tracking-tight mb-3`}>
                  {centralConcept.title}
                </h3>
                <p className={`${theme.textSecondary} text-base md:text-lg leading-relaxed`}>
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
              className="morph-detail-card relative overflow-hidden rounded-[1.25rem] bg-slate-900/70 backdrop-blur-xl border min-h-[200px] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                boxShadow: `0 0 20px ${glowColor}40`,
                borderColor: borderColorClass.replace('border-', '').replace('/30', '').replace('/40', '').replace('/50', '') + '20',
                animation: `morphReveal 0.4s ease-out both`,
                animationDelay: `${0.1 * (index + 1)}s`,
              }}
            >
              <div className="relative z-10 flex flex-col gap-3 p-5 md:p-6">
                <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} shadow-md`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className={`font-black ${theme.textPrimary} text-lg md:text-xl tracking-tight mb-2`}>
                    {concept.title}
                  </h4>
                  <p className={`${theme.textSecondary} text-sm leading-relaxed`}>
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
