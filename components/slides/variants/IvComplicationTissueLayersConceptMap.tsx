'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers3 } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import {
  inferIvComplicationSlot,
  ivComplicationSlotLabel,
  type IvComplicationSlot,
} from '@/lib/slides/puncaoFlebiteSlideUtils';

export interface IvComplicationTissueConcept {
  icon: string;
  title: string;
  description: string;
}

type TissueLayer = 'pele' | 'subcutaneo' | 'veia' | 'alerta';

const LAYER_META: Record<
  TissueLayer,
  {
    label: string;
    hint: string;
    bar: string;
    border: string;
    chip: string;
    chipActive: string;
    panel: string;
    accent: string;
    title: string;
    body: string;
    badge: string;
  }
> = {
  pele: {
    label: 'Pele',
    hint: 'Contexto do enunciado',
    bar: 'from-slate-300 to-slate-100',
    border: 'border-slate-200/90',
    chip: 'border-slate-200 bg-white hover:bg-slate-50',
    chipActive: 'border-slate-300 bg-slate-50 ring-2 ring-slate-300/60',
    panel: 'border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100',
    accent: 'text-slate-700',
    title: 'text-slate-900',
    body: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
  },
  subcutaneo: {
    label: 'Subcutâneo',
    hint: 'Líquido ou sangue fora do vaso',
    bar: 'from-sky-400 to-sky-100',
    border: 'border-sky-200/90',
    chip: 'border-sky-200 bg-white hover:bg-sky-50/80',
    chipActive: 'border-sky-300 bg-sky-50 ring-2 ring-sky-300/60',
    panel: 'border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50',
    accent: 'text-sky-800',
    title: 'text-sky-950',
    body: 'text-slate-600',
    badge: 'bg-sky-100 text-sky-800',
  },
  veia: {
    label: 'Parede venosa',
    hint: 'Inflamação ou lesão no cateter',
    bar: 'from-rose-400 to-rose-100',
    border: 'border-rose-200/90',
    chip: 'border-rose-200 bg-white hover:bg-rose-50/80',
    chipActive: 'border-rose-300 bg-rose-50 ring-2 ring-rose-300/60',
    panel: 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50',
    accent: 'text-rose-800',
    title: 'text-rose-950',
    body: 'text-slate-600',
    badge: 'bg-rose-100 text-rose-800',
  },
  alerta: {
    label: 'Pegadinha',
    hint: 'Troca de rótulo em prova',
    bar: 'from-amber-400 to-amber-100',
    border: 'border-amber-200/90',
    chip: 'border-amber-200 bg-white hover:bg-amber-50/80',
    chipActive: 'border-amber-300 bg-amber-50 ring-2 ring-amber-300/60',
    panel: 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50',
    accent: 'text-amber-900',
    title: 'text-amber-950',
    body: 'text-slate-600',
    badge: 'bg-amber-100 text-amber-900',
  },
};

const LAYER_ORDER: TissueLayer[] = ['pele', 'subcutaneo', 'veia', 'alerta'];

function slotToLayer(slot: IvComplicationSlot): TissueLayer {
  if (slot === 'contexto') return 'pele';
  if (slot === 'infiltracao' || slot === 'hematoma') return 'subcutaneo';
  if (slot === 'pegadinha') return 'alerta';
  if (slot === 'flebite' || slot === 'esclerose' || slot === 'extravasamento') return 'veia';
  return 'subcutaneo';
}

interface IvComplicationTissueLayersConceptMapProps {
  concepts: IvComplicationTissueConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function IvComplicationTissueLayersConceptMap({
  concepts,
  theme,
  footerRule,
}: IvComplicationTissueLayersConceptMapProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const nodes = useMemo(() => {
    return concepts
      .filter((c) => {
        const slot = inferIvComplicationSlot(c.title, c.description);
        return slot !== 'geral' && !/gabarito|letra\s*[a-e]/i.test(`${c.title} ${c.description}`);
      })
      .map((c, index) => {
        const slot = inferIvComplicationSlot(c.title, c.description);
        return {
          ...c,
          slot,
          layer: slotToLayer(slot),
          key: `${c.title}-${index}`,
        };
      });
  }, [concepts]);

  const byLayer = useMemo(() => {
    const map: Record<TissueLayer, typeof nodes> = {
      pele: [],
      subcutaneo: [],
      veia: [],
      alerta: [],
    };
    for (const node of nodes) {
      map[node.layer].push(node);
    }
    return map;
  }, [nodes]);

  const visibleLayers = LAYER_ORDER.filter((layer) => byLayer[layer].length > 0);
  const active = nodes.find((n) => n.key === activeKey) ?? null;
  const activeMeta = active ? LAYER_META[active.layer] : null;

  const toggle = useCallback((key: string) => {
    setActiveKey((current) => (current === key ? null : key));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-indigo-900 shadow-sm">
          <Layers3 className="h-3 w-3" aria-hidden />
          Camadas IV
        </span>

        <div className="flex flex-col gap-2">
          {visibleLayers.map((layer) => {
            const meta = LAYER_META[layer];
            const layerNodes = byLayer[layer];
            return (
              <div key={layer} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (layerNodes.length === 1) toggle(layerNodes[0]!.key);
                  }}
                  className={`relative overflow-hidden rounded-2xl border bg-white/90 shadow-sm ${meta.border}`}
                >
                  <div className={`h-2.5 bg-gradient-to-r ${meta.bar}`} />
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="text-left">
                      <p className={`font-mono text-[9px] font-bold uppercase tracking-widest ${meta.accent}`}>
                        {meta.label}
                      </p>
                      <p className="font-body text-[10px] text-slate-500">{meta.hint}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${meta.badge}`}
                    >
                      {layerNodes.length}
                    </span>
                  </div>
                </button>

                <div className="flex flex-wrap gap-2 pl-0.5">
                  {layerNodes.map((node) => {
                    const isActive = activeKey === node.key;
                    return (
                      <button
                        key={node.key}
                        type="button"
                        onClick={() => toggle(node.key)}
                        className={`flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border px-3 py-2 shadow-sm transition-all ${
                          isActive ? meta.chipActive : meta.chip
                        }`}
                        aria-expanded={isActive}
                      >
                        <SlideLucideIcon name={node.icon} className={`h-4 w-4 ${meta.accent}`} />
                        <span className={`max-w-[120px] truncate text-left font-body text-xs font-semibold ${meta.title}`}>
                          {ivComplicationSlotLabel(node.slot)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {active && activeMeta ? (
            <motion.div
              key={active.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className={`rounded-2xl border p-4 shadow-md ${activeMeta.panel}`}
            >
              <p className={`mb-1 font-mono text-[10px] font-bold uppercase tracking-widest ${activeMeta.accent}`}>
                {LAYER_META[active.layer].label} · {ivComplicationSlotLabel(active.slot)}
              </p>
              <h3 className={`mb-2 font-display text-base font-extrabold ${activeMeta.title}`}>
                {active.title}
              </h3>
              <p className={`font-body text-sm leading-relaxed ${activeMeta.body}`}>{active.description}</p>
            </motion.div>
          ) : (
            <p className="text-center font-body text-[11px] text-slate-500">
              Toque no chip da camada → mecanismo e sinal clínico
            </p>
          )}
        </AnimatePresence>

        {footerRule ? (
          <p
            className={`rounded-xl border bg-white/80 px-3 py-2 text-center font-body text-xs italic text-slate-600 ${theme.borderColor}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
