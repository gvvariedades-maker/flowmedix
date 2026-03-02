'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

interface DangerZoneProps {
  content: string;
  theme: ThemeColors;
  items?: Array<{ id?: string; label?: string; title?: string; detail?: string; description?: string }>;
  footerRule?: string;
  layoutVariant?: string;
}

// ============================================================================
// DANGER ZONE: Pegadinhas com tema dinâmico + variantes didáticas
// layout_variant: list | cards | compact
// ============================================================================
export const DangerZone = ({ content, theme, items, footerRule, layoutVariant = 'list' }: DangerZoneProps) => {
  const variant = layoutVariant || 'list';

  const ItemContent = ({ item, index }: { item: any; index: number }) => (
    <div className="flex items-start gap-3">
      <span className="text-red-400 font-black text-lg shrink-0">{item.id || `${index + 1}.`}</span>
      <div className="flex-1">
        <h4 className="text-red-300 font-bold text-base md:text-lg mb-2">{item.label || item.title || 'Pegadinha'}</h4>
        <p className="text-slate-200 text-sm md:text-base leading-relaxed">{item.detail || item.description || ''}</p>
      </div>
    </div>
  );

  // VARIANTE 1: LIST (padrão) - Lista com borda vermelha
  if (variant === 'list') {
    return (
      <div className="w-full h-full flex items-start justify-center p-4 md:p-6 lg:p-8 relative overflow-y-auto custom-scrollbar">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-slate-900/90 to-red-950/90" />
        <div className="danger-zone-container relative z-10 w-full max-w-4xl p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl border-l-4 md:border-l-8 border-red-500 backdrop-blur-xl my-4 md:my-8" style={{ boxShadow: '0 0 60px -15px rgba(239,68,68,0.5)', minHeight: '200px' }}>
          <div className="danger-zone-alert-icon absolute top-6 right-6 opacity-20">
            <AlertTriangle size={140} className="text-red-500" />
          </div>
          <div className="relative z-10 space-y-6">
            <h3 className="danger-zone-title text-red-400 font-black flex items-center gap-3 text-xl md:text-2xl">
              <AlertTriangle size={28} className="animate-pulse" /> CUIDADO COM A PEGADINHA
            </h3>
            {content && (
              <div className="danger-zone-content bg-red-950/40 rounded-xl p-6 border border-red-500/30">
                <p className="text-lg md:text-2xl text-slate-100 font-bold leading-relaxed">{content}</p>
              </div>
            )}
            {items && items.length > 0 && (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="danger-zone-item bg-slate-900/60 rounded-xl p-5 border-l-4 border-red-500">
                    <ItemContent item={item} index={index} />
                  </div>
                ))}
              </div>
            )}
            {footerRule && (
              <div className="danger-zone-footer bg-red-900/30 rounded-xl p-5 border border-red-500/20">
                <p className="text-red-200 font-semibold text-sm md:text-base italic">💡 {footerRule}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VARIANTE 2: CARDS - Itens em cards separados
  if (variant === 'cards') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto custom-scrollbar relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-slate-900/90 to-red-950/80" />
        <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6 py-8">
          {content && (
            <div className="bg-red-950/50 rounded-2xl p-6 border-2 border-red-500/50">
              <p className="text-lg md:text-xl text-slate-100 font-bold leading-relaxed">{content}</p>
            </div>
          )}
          {items && items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-900/70 rounded-xl p-5 border-2 border-red-500/50 hover:border-red-500/80 transition-colors"
                >
                  <ItemContent item={item} index={index} />
                </motion.div>
              ))}
            </div>
          )}
          {footerRule && (
            <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
              <p className="text-red-200 font-semibold text-sm italic">💡 {footerRule}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VARIANTE 3: COMPACT - Layout condensado
  if (variant === 'compact') {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 overflow-y-auto custom-scrollbar relative">
        <div className="absolute inset-0 bg-slate-900/95" />
        <div className="relative z-10 w-full max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-red-400 font-black">
            <ShieldAlert size={24} /> CUIDADO
          </div>
          {content && <p className="text-base md:text-lg text-slate-200 font-semibold">{content}</p>}
          {items && items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 py-2 border-b border-slate-700/50 last:border-0">
                  <span className="text-red-400 font-bold shrink-0">{item.id || `${index + 1}.`}</span>
                  <div>
                    <span className="text-red-300 font-bold">{item.label || item.title || 'Pegadinha'}: </span>
                    <span className="text-slate-300 text-sm">{item.detail || item.description || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {footerRule && <p className="text-red-200 text-sm italic pt-2">💡 {footerRule}</p>}
        </div>
      </div>
    );
  }

  // Fallback: list
  return (
    <div className="w-full h-full flex items-start justify-center p-4 overflow-y-auto custom-scrollbar relative">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-slate-900/90 to-red-950/90" />
      <div className="relative z-10 w-full max-w-4xl p-6 rounded-2xl border-l-4 border-red-500 backdrop-blur-xl my-4">
        <h3 className="text-red-400 font-black flex items-center gap-2 mb-4">
          <AlertTriangle size={24} /> CUIDADO
        </h3>
        {content && <p className="text-lg text-slate-100 font-bold mb-4">{content}</p>}
        {items && items.length > 0 && items.map((item, index) => (
          <div key={index} className="bg-slate-900/60 rounded-lg p-4 mb-2 border-l-4 border-red-500">
            <ItemContent item={item} index={index} />
          </div>
        ))}
        {footerRule && <p className="text-red-200 text-sm italic mt-4">💡 {footerRule}</p>}
      </div>
    </div>
  );
};
