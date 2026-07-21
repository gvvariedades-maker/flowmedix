'use client';

import { createElement } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { cn } from '@/lib/utils';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';
import { getTopicIcon } from '@/lib/vitrine/vitrineTopicIcon';
import { getTopicAccent } from '@/lib/vitrine/vitrineTopicAccent';
import { labelQuestoes } from '@/lib/labelQuestoes';
import { Button } from '@/components/ui/button';
import { NeonBadge } from '@/components/ui/neon-badge';
import { VitrineQuestaoLink } from '@/components/vitrine/VitrineQuestaoLink';
import { VitrineProgressRing } from '@/components/vitrine/VitrineProgressRing';
import { VitrineQuestaoList } from '@/components/vitrine/VitrineQuestaoList';
import VitrineSubjectSheet from '@/components/vitrine/VitrineSubjectSheet';
import {
  vitrineItemGroupVariants,
  vitrineItemVariants,
} from '@/components/vitrine/vitrineMotion';
import { VITRINE_PREFETCH_DATA_ATTR } from '@/hooks/useVitrineVisiblePrefetch';
import { useDashboardDesktop } from '@/lib/layout/useDashboardDesktop';

export type VitrineSubjectCardProps = {
  grupo: VitrineGrupoSubtopico;
  estudarQuery: string;
  index: number;
  assuntoExpandido: boolean;
  onAssuntoExpandedChange: (open: boolean) => void;
  /** Lista densa — layout mais compacto; no desktop expande inline como no grid. */
  compact?: boolean;
};

function resolveCtaSlug(grupo: VitrineGrupoSubtopico): string {
  return grupo.questoes.find((q) => q.status === 'nao_estudada')?.slug ?? grupo.firstSlug;
}

function resolveCtaLabel(grupo: VitrineGrupoSubtopico): string {
  const { totalResolvidas, totalQuestoes, trabalhadas } = grupo;
  const todas = trabalhadas === totalQuestoes && totalQuestoes > 0;
  if (totalResolvidas === 0) return 'Iniciar';
  if (todas) return 'Revisar';
  return 'Continuar';
}

export function VitrineSubjectCard({
  grupo,
  estudarQuery,
  index,
  assuntoExpandido,
  onAssuntoExpandedChange,
  compact = false,
}: VitrineSubjectCardProps) {
  const {
    titulo_aula,
    modulo_nome,
    totalResolvidas,
    totalQuestoes,
    totalNeuroSlides,
    trabalhadas,
    questoes,
    firstSlug,
  } = grupo;

  const todas = trabalhadas === totalQuestoes && totalQuestoes > 0;
  const pendentes = totalQuestoes - trabalhadas;
  const hasQuestions = totalQuestoes > 0;
  const mostrarNovo = totalResolvidas === 0 && !todas && hasQuestions;
  const mostrarCheckConclusao = todas && hasQuestions;
  const progressoPct = hasQuestions ? Math.round((trabalhadas / totalQuestoes) * 100) : 0;
  const panelId = `assunto-panel-${firstSlug}`;
  const topicIcon = getTopicIcon(titulo_aula, modulo_nome);
  const topicAccent = getTopicAccent(titulo_aula, modulo_nome);
  const ctaSlug = resolveCtaSlug(grupo);
  const ctaLabel = resolveCtaLabel(grupo);
  const isDesktop = useDashboardDesktop();
  /** Sheet só no mobile; no desktop (incl. lista compacta) expande inline. */
  const useSheet = !isDesktop;

  const toggleAssunto = () => {
    onAssuntoExpandedChange(!assuntoExpandido);
  };

  return (
    <motion.div
      variants={index < 8 ? vitrineItemVariants : vitrineItemGroupVariants}
      {...{ [VITRINE_PREFETCH_DATA_ATTR]: `${firstSlug}${estudarQuery}` }}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md',
        compact && 'rounded-xl shadow-none hover:shadow-sm',
        todas && 'border-green-200 hover:border-green-300',
      )}
    >
      {mostrarNovo && !compact ? (
        <span
          className="pointer-events-none absolute right-3 top-3 z-10 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 sm:text-[11px]"
          aria-label="Assunto novo"
        >
          Novo
        </span>
      ) : null}

      <div
        className={cn(
          'flex items-center gap-3',
          compact ? 'p-3' : 'items-start p-4',
          mostrarNovo && !compact && 'pt-9 sm:pt-10',
        )}
      >
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl border',
            compact ? 'size-8' : 'size-9',
            topicAccent.chip,
          )}
          aria-hidden
        >
          {createElement(topicIcon, {
            size: compact ? 16 : 18,
            strokeWidth: 2,
            className: topicAccent.icon,
          })}
        </span>

        <button
          type="button"
          aria-expanded={assuntoExpandido}
          aria-controls={useSheet ? undefined : panelId}
          aria-haspopup={useSheet ? 'dialog' : undefined}
          onClick={toggleAssunto}
          className="min-w-0 flex-1 overflow-hidden text-left"
        >
          <div className="flex min-w-0 items-start gap-2">
            <span
              className={cn(
                'min-w-0 flex-1 font-semibold text-slate-900',
                compact ? 'line-clamp-1 text-sm' : 'text-sm',
                !compact && (assuntoExpandido ? 'break-words' : 'line-clamp-2'),
              )}
              title={titulo_aula}
            >
              {titulo_aula}
            </span>
            {hasQuestions && !compact ? (
              <span
                className={cn(
                  'shrink-0 text-sm font-bold tabular-nums',
                  trabalhadas > 0 ? vitrineBrand.text : 'text-slate-300',
                )}
              >
                {progressoPct}%
              </span>
            ) : null}
          </div>
          {!compact ? (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-snug">
              <span>
                <span className="font-medium tabular-nums text-slate-700">
                  {totalQuestoes.toLocaleString('pt-BR')}
                </span>{' '}
                {labelQuestoes(totalQuestoes)}
              </span>
              {pendentes > 0 && !todas ? (
                <>
                  <span className="text-slate-300" aria-hidden>
                    ·
                  </span>
                  <span
                    className={cn(
                      'font-medium tabular-nums',
                      progressoPct > 0 ? 'text-amber-700' : 'text-slate-500',
                    )}
                  >
                    {pendentes} para estudar
                  </span>
                </>
              ) : null}
              {!assuntoExpandido ? (
                <>
                  <span className="text-slate-300" aria-hidden>
                    ·
                  </span>
                  <span className="text-slate-500">
                    <span className="font-medium tabular-nums">
                      {totalNeuroSlides.toLocaleString('pt-BR')}
                    </span>{' '}
                    NeuroSlides
                  </span>
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {totalQuestoes.toLocaleString('pt-BR')} {labelQuestoes(totalQuestoes)}
              {pendentes > 0 && !todas
                ? ` · ${pendentes} para estudar`
                : ''}
            </p>
          )}
        </button>

        {mostrarCheckConclusao ? (
          <CheckCircle2 size={compact ? 16 : 18} className={cn('shrink-0', vitrineBrand.icon)} aria-hidden />
        ) : null}

        {hasQuestions && !compact ? (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn('hidden shrink-0 text-xs font-medium sm:inline-flex', vitrineBrand.text, vitrineBrand.hoverBg, vitrineBrand.hoverText)}
          >
            <VitrineQuestaoLink
              slug={ctaSlug}
              estudarQuery={estudarQuery}
              onClick={(e) => e.stopPropagation()}
            >
              {ctaLabel}
            </VitrineQuestaoLink>
          </Button>
        ) : null}

        <button
          type="button"
          onClick={toggleAssunto}
          aria-expanded={assuntoExpandido}
          aria-controls={useSheet ? undefined : panelId}
          aria-haspopup={useSheet ? 'dialog' : undefined}
          aria-label={assuntoExpandido ? 'Recolher assunto' : 'Expandir assunto'}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          {assuntoExpandido ? (
            <ChevronUp size={18} aria-hidden />
          ) : (
            <ChevronDown size={18} aria-hidden />
          )}
        </button>
      </div>

      {hasQuestions && !compact ? (
        <div className="px-4 pb-3 sm:hidden">
          <Button variant="ghost" size="sm" asChild className={cn('w-full', vitrineBrand.text)}>
            <VitrineQuestaoLink slug={ctaSlug} estudarQuery={estudarQuery}>
              {ctaLabel}
            </VitrineQuestaoLink>
          </Button>
        </div>
      ) : null}

      {hasQuestions ? (
        <div
          className={cn(
            'w-full shrink-0',
            compact ? 'h-0.5 min-h-[2px]' : 'h-1 min-h-[4px]',
            trabalhadas > 0 ? 'bg-slate-100' : 'bg-slate-100/70',
          )}
          role="progressbar"
          aria-valuenow={progressoPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do estudo reverso neste assunto"
        >
          {trabalhadas > 0 ? (
            <div
              className={cn(
                'h-full transition-[width] duration-300 ease-out',
                vitrineBrand.bar,
              )}
              style={{ width: `${progressoPct}%` }}
            />
          ) : null}
        </div>
      ) : null}

      {isDesktop ? (
        <div
          id={panelId}
          aria-hidden={!assuntoExpandido}
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-in-out',
            assuntoExpandido ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-3 border-t border-slate-100 px-4 py-3 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {todas ? (
                  <NeonBadge variant="success">Completo</NeonBadge>
                ) : pendentes > 0 ? (
                  <NeonBadge variant={progressoPct > 0 ? 'warning' : 'neutral'}>
                    {pendentes} para estudar
                  </NeonBadge>
                ) : totalResolvidas === 0 ? (
                  <NeonBadge variant="neutral">Não iniciado</NeonBadge>
                ) : null}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn('ml-auto rounded-xl border-slate-200 text-slate-700', vitrineBrand.hoverBorderLight, vitrineBrand.hoverBgLight, vitrineBrand.hoverText)}
                >
                  <VitrineQuestaoLink slug={firstSlug} estudarQuery={estudarQuery}>
                    Entrar no assunto
                  </VitrineQuestaoLink>
                </Button>
              </div>

              <div className="flex justify-center">
                <VitrineProgressRing trabalhadas={trabalhadas} total={totalQuestoes} size={88} />
              </div>

              <p className="-mt-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Questões trabalhadas
              </p>

              <VitrineQuestaoList
                tituloAula={titulo_aula}
                firstSlug={firstSlug}
                totalQuestoes={totalQuestoes}
                questoes={questoes}
                estudarQuery={estudarQuery}
              />

              <p className="border-t border-slate-100 pt-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {totalQuestoes} {labelQuestoes(totalQuestoes)} no assunto
                {todas ? ' · Concluído' : trabalhadas > 0 ? ' · Em progresso' : ''}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <VitrineSubjectSheet
        open={useSheet && assuntoExpandido}
        onClose={() => onAssuntoExpandedChange(false)}
        grupo={grupo}
        estudarQuery={estudarQuery}
      />
    </motion.div>
  );
}

export default VitrineSubjectCard;
