'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneBulletStyle } from '../core/dangerZoneLayout';
import { dangerZoneHasCompareItems } from '../core/dangerZoneLayout';

export interface DangerZoneItem {
  id?: string;
  label?: string;
  title?: string;
  detail?: string;
  description?: string;
  correct?: string;
}

interface DangerZoneProps {
  content: string;
  theme: ThemeColors;
  items?: DangerZoneItem[];
  footerRule?: string;
  layoutVariant?: string;
  bulletStyle?: DangerZoneBulletStyle;
}

function TrapBullet({
  bulletStyle,
  index,
  itemId,
}: {
  bulletStyle: DangerZoneBulletStyle;
  index: number;
  itemId?: string;
}) {
  if (bulletStyle === 'x_icon') {
    return (
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/20 ring-1 ring-red-500/40" aria-hidden>
        <X className="h-4 w-4 text-red-400" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="shrink-0 font-mono tabular-nums text-sm text-red-400 md:text-lg">
      {itemId || `${index + 1}.`}
    </span>
  );
}

function ItemContent({
  item,
  index,
  bulletStyle,
}: {
  item: DangerZoneItem;
  index: number;
  bulletStyle: DangerZoneBulletStyle;
}) {
  return (
    <motion.div layout className="flex items-start gap-3">
      <TrapBullet bulletStyle={bulletStyle} index={index} itemId={item.id} />
      <div className="min-w-0 flex-1">
        <h4 className="mb-2 font-display text-base font-bold text-red-300 md:text-lg">
          {item.label || item.title || 'Pegadinha'}
        </h4>
        <p className="font-body text-base leading-relaxed text-slate-200">
          {item.detail || item.description || ''}
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// DANGER ZONE: Pegadinhas — list | cards | compact | compare (trap × correct)
// layout_variant compare: automático quando ≥1 item tem `correct` (string)
// bullet_style: numbered (padrão) | x_icon
// ============================================================================
export const DangerZone = ({
  content,
  theme,
  items,
  footerRule,
  layoutVariant = 'list',
  bulletStyle = 'numbered',
}: DangerZoneProps) => {
  const explicitVariant = layoutVariant || 'list';
  const variant =
    explicitVariant === 'compare' || dangerZoneHasCompareItems(items)
      ? 'compare'
      : explicitVariant;

  // VARIANTE COMPARE — duas colunas: pegadinha × correto
  if (variant === 'compare') {
    return (
      <div className="relative flex min-h-full w-full min-w-0 flex-col items-center justify-start p-4 pb-8 md:p-6 md:pb-10 lg:p-8 lg:pb-12">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-slate-900/90 to-emerald-950/40"
          aria-hidden
        />
        <div
          className="relative z-10 mt-2 mb-6 w-full max-w-5xl rounded-2xl border border-red-500/30 p-4 backdrop-blur-xl md:mt-4 md:mb-10 md:rounded-3xl md:p-8 lg:p-10"
          style={{ boxShadow: '0 0 60px -15px rgba(239,68,68,0.35)' }}
        >
          {content ? (
            <motion.div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 p-5 md:p-6">
              <p className="font-body text-base leading-relaxed text-slate-100 md:text-xl">{content}</p>
            </motion.div>
          ) : null}

          {items && items.length > 0 ? (
            <div className="space-y-4">
              <motion.div
                className="hidden grid-cols-2 gap-3 px-1 font-mono text-[10px] uppercase tracking-widest md:grid"
                aria-hidden
              >
                <span className="text-red-400/90">Pegadinha</span>
                <span className="text-emerald-400/90">Correto</span>
              </motion.div>

              {items.map((item, index) => {
                const trapText = item.detail || item.description || '';
                const correctText =
                  typeof item.correct === 'string' ? item.correct.trim() : '';
                const label = item.label || item.title || `Ponto ${index + 1}`;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="grid grid-cols-1 gap-3 md:grid-cols-2"
                  >
                    <div className="rounded-xl border-l-4 border-red-500 bg-slate-900/70 p-4 md:p-5">
                      <div className="mb-2 flex items-center gap-2 md:hidden">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-red-400/90">
                          Pegadinha
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrapBullet bulletStyle={bulletStyle} index={index} itemId={item.id} />
                        <motion.div className="min-w-0 flex-1">
                          <h4 className="mb-1.5 font-display text-sm font-bold text-red-300 md:text-base">{label}</h4>
                          <p className="font-body text-sm leading-relaxed text-slate-300 md:text-base">{trapText}</p>
                        </motion.div>
                      </div>
                    </div>

                    <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-900/50 p-4 md:p-5">
                      <motion.div className="mb-2 flex items-center gap-2 md:hidden">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/90">
                          Correto
                        </span>
                      </motion.div>
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/35"
                          aria-hidden
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-1.5 font-display text-sm font-bold text-emerald-300 md:text-base">{label}</h4>
                          <p className="font-body text-sm leading-relaxed text-slate-200 md:text-base">
                            {correctText || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : null}

          {footerRule ? (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-900/30 p-4 md:p-5">
              <p className="font-body text-sm italic text-red-200 md:text-base">💡 {footerRule}</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // VARIANTE 1: LIST (padrão) - Lista com borda vermelha
  if (variant === 'list') {
    return (
      <motion.div layout className="relative flex min-h-full w-full min-w-0 flex-col items-center justify-start p-4 pb-8 md:p-6 md:pb-10 lg:p-8 lg:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-slate-900/90 to-red-950/90" />
        <div
          className="danger-zone-container relative z-10 mt-2 mb-6 w-full max-w-4xl rounded-2xl border-l-4 border-red-500 p-6 backdrop-blur-xl md:mt-4 md:mb-10 md:rounded-3xl md:border-l-8 md:p-8 lg:p-12"
          style={{ boxShadow: '0 0 60px -15px rgba(239,68,68,0.5)', minHeight: '200px' }}
        >
          <div className="danger-zone-alert-icon absolute top-6 right-6 opacity-20">
            <AlertTriangle size={140} className="text-red-500" />
          </div>
          <div className="relative z-10 space-y-6">
            <h3 className="danger-zone-title flex items-center gap-3 font-mono text-sm text-red-400 md:text-2xl">
              <AlertTriangle className="h-6 w-6 shrink-0 animate-pulse md:h-7 md:w-7" strokeWidth={2} /> CUIDADO COM A PEGADINHA
            </h3>
            {content && (
              <div className="danger-zone-content bg-red-950/40 rounded-xl p-6 border border-red-500/30">
                <p className="font-body text-base font-semibold leading-relaxed text-slate-100 md:text-2xl">{content}</p>
              </div>
            )}
            {items && items.length > 0 && (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="danger-zone-item bg-slate-900/60 rounded-xl p-5 border-l-4 border-red-500">
                    <ItemContent item={item} index={index} bulletStyle={bulletStyle} />
                  </div>
                ))}
              </div>
            )}
            {footerRule && (
              <div className="danger-zone-footer bg-red-900/30 rounded-xl p-5 border border-red-500/20">
                <p className="font-body text-sm italic text-red-200 md:text-base">💡 {footerRule}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // VARIANTE 2: CARDS - Itens em cards separados
  if (variant === 'cards') {
    return (
      <div className="w-full min-h-full min-w-0 flex items-center justify-center p-4 relative">
        <motion.div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-slate-900/90 to-red-950/80" aria-hidden />
        <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6 py-8">
          {content && (
            <div className="bg-red-950/50 rounded-2xl p-6 border-2 border-red-500/50">
              <p className="font-body text-lg font-semibold leading-relaxed text-slate-100 md:text-xl">{content}</p>
            </div>
          )}
          {items && items.length > 0 && (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-900/70 rounded-xl p-5 border-2 border-red-500/50 hover:border-red-500/80 transition-colors"
                >
                  <ItemContent item={item} index={index} bulletStyle={bulletStyle} />
                </motion.div>
              ))}
            </motion.div>
          )}
          {footerRule && (
            <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
              <p className="font-body text-sm italic text-red-200 md:text-sm">💡 {footerRule}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VARIANTE 3: COMPACT - Layout condensado
  if (variant === 'compact') {
    return (
      <div className="w-full min-h-full min-w-0 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-slate-900/95" />
        <motion.div className="relative z-10 w-full max-w-3xl space-y-4">
          <div className="flex items-center gap-2 font-mono text-sm text-red-400 md:text-lg">
            <ShieldAlert size={24} className="shrink-0" /> CUIDADO
          </div>
          {content && <p className="font-body text-base text-slate-200 md:text-lg">{content}</p>}
          {items && items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 border-b border-slate-700/50 py-2 last:border-0">
                  {bulletStyle === 'x_icon' ? (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" strokeWidth={3} aria-hidden />
                  ) : (
                    <span className="shrink-0 font-mono tabular-nums text-sm text-red-400 md:text-base">
                      {item.id || `${index + 1}.`}
                    </span>
                  )}
                  <div className="min-w-0 text-slate-300">
                    <span className="font-display text-base font-bold text-red-300">{item.label || item.title || 'Pegadinha'}: </span>
                    <span className="font-body text-base md:text-sm">{item.detail || item.description || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {footerRule && <p className="pt-2 font-body text-sm italic text-red-200">💡 {footerRule}</p>}
        </motion.div>
      </div>
    );
  }

  // Fallback: list
  return (
    <div className="relative flex min-h-full w-full min-w-0 flex-col items-center justify-start p-4 pb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-slate-900/90 to-red-950/90" />
      <div className="relative z-10 my-4 w-full max-w-4xl rounded-2xl border-l-4 border-red-500 p-6 backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 font-mono text-sm text-red-400 md:text-2xl">
          <AlertTriangle size={24} className="shrink-0" /> CUIDADO
        </h3>
        {content && <p className="mb-4 font-body text-base font-semibold text-slate-100 md:text-lg">{content}</p>}
        {items && items.length > 0 && items.map((item, index) => (
          <motion.div key={index} className="mb-2 rounded-lg border-l-4 border-red-500 bg-slate-900/60 p-4">
            <ItemContent item={item} index={index} bulletStyle={bulletStyle} />
          </motion.div>
        ))}
        {footerRule && <p className="mt-4 font-body text-sm italic text-red-200">💡 {footerRule}</p>}
      </div>
    </div>
  );
};
