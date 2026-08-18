'use client';

import { createElement } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { cn } from '@/lib/utils';
import type { VitrineGrupoSubtopico } from '@/lib/vitrine/types';
import { getTopicIcon } from '@/lib/vitrine/vitrineTopicIcon';
import {
  getTopicAccent,
  TOPIC_ACCENT_NEUTRAL,
} from '@/lib/vitrine/vitrineTopicAccent';
import { labelQuestoes } from '@/lib/labelQuestoes';
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
import { resolveAcertoDisplay } from '@/lib/vitrine/resolveAcertoDisplay';

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
    acertos,
    percentual,
    questoes,
    firstSlug,
  } = grupo;

  const todas = trabalhadas === totalQuestoes && totalQuestoes > 0;
  const pendentes = totalQuestoes - trabalhadas;
  const hasQuestions = totalQuestoes > 0;
  const mostrarNovo = totalResolvidas === 0 && !todas && hasQuestions;
  const mostrarCheckConclusao = todas && hasQuestions;
  const acertoDisplay = resolveAcertoDisplay({
    acertos,
    totalResolvidas,
    totalQuestoes,
    percentual,
  });
  const coberturaPct = acertoDisplay.coberturaPct;
  const showProgressBar = hasQuestions && coberturaPct >= 1 && coberturaPct < 100;
  const panelId = `assunto-panel-${firstSlug}`;
  const topicIcon = getTopicIcon(titulo_aula, modulo_nome);
  const topicAccent = getTopicAccent(titulo_aula, modulo_nome);
  /** Cor do tópico só no expandido; fechado = chip neutro. */
  const chipAccent = assuntoExpandido ? topicAccent : TOPIC_ACCENT_NEUTRAL;
  const ctaSlug = resolveCtaSlug(grupo);
  const ctaLabel = resolveCtaLabel(grupo);
  const isDesktop = useDashboardDesktop();
  /** Sheet só no mobile; no desktop (incl. lista compacta) expande inline. */
  const useSheet = !isDesktop;
  /** Painel desktop só monta expandido — recolhido não esconde a lista por CSS. */
  const painelDesktopMontado = isDesktop && assuntoExpandido;

  const toggleAssunto = () => {
    onAssuntoExpandedChange(!assuntoExpandido);
  };

  return (
    <motion.div
      variants={index < 8 ? vitrineItemVariants : vitrineItemGroupVariants}
      {...{ [VITRINE_PREFETCH_DATA_ATTR]: `${firstSlug}${estudarQuery}` }}
      className={cn(
        'relative flex flex-col overflow-hidden',
        vitrineBrand.cardSurface,
        compact && 'rounded-xl shadow-sm hover:shadow-md',
        /* Ativo (expandido): assinatura laranja — concluído usa success. */
        assuntoExpandido &&
          !todas &&
          'border-[var(--color-card-border-hover)] shadow-[var(--shadow-editorial-md)]',
        todas &&
          '!border-[var(--color-success)] hover:!border-[var(--color-success-text)] focus-within:!border-[var(--color-success-text)]',
      )}
    >
      <div className={cn('flex items-center gap-3', compact ? 'p-3' : 'p-4')}>
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl border',
            compact ? 'size-8' : 'size-9',
            chipAccent.chip,
          )}
          aria-hidden
        >
          {createElement(topicIcon, {
            size: compact ? 16 : 18,
            strokeWidth: 2,
            className: chipAccent.icon,
          })}
        </span>

        <button
          type="button"
          aria-expanded={assuntoExpandido}
          aria-controls={painelDesktopMontado ? panelId : undefined}
          aria-haspopup={useSheet ? 'dialog' : undefined}
          onClick={toggleAssunto}
          className={cn(
            'min-w-0 flex-1 overflow-hidden rounded-lg text-left outline-none',
            vitrineBrand.focusRing,
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900"
              title={titulo_aula}
            >
              {titulo_aula}
            </span>
            {mostrarNovo && !compact ? (
              <span
                className="shrink-0 rounded-md border border-[var(--color-success)] bg-[var(--color-success-dim)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-success-text)]"
                aria-label="Assunto novo"
              >
                Novo
              </span>
            ) : null}
            {hasQuestions ? (
              <span
                className={cn(
                  'shrink-0 font-bold',
                  compact ? 'text-xs' : 'text-sm',
                  acertoDisplay.tone === 'brand' && cn('tabular-nums', vitrineBrand.text),
                  acertoDisplay.tone === 'muted' && 'text-slate-500',
                  acertoDisplay.tone === 'success' &&
                    'text-[var(--color-success-text)]',
                )}
                aria-label={acertoDisplay.ariaLabel}
              >
                {acertoDisplay.label}
              </span>
            ) : null}
          </div>
          {!compact ? (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-snug">
              <span className="text-slate-500">
                <span className="font-medium tabular-nums text-slate-700">
                  {totalResolvidas.toLocaleString('pt-BR')}
                </span>
                /
                <span className="font-medium tabular-nums text-slate-700">
                  {totalQuestoes.toLocaleString('pt-BR')}
                </span>{' '}
                respondidas
              </span>
              {/* Pendência só no expandido (badge) — fechado: cobertura + NeuroSlides. */}
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
              {totalResolvidas}/{totalQuestoes} respondidas
              {pendentes > 0 && !todas ? (
                <>
                  {' · '}
                  <span className="font-medium tabular-nums text-slate-600">
                    {pendentes} para estudar
                  </span>
                </>
              ) : null}
            </p>
          )}
        </button>

        {mostrarCheckConclusao ? (
          <CheckCircle2
            size={compact ? 16 : 18}
            className="shrink-0 text-[var(--color-success)]"
            aria-hidden
          />
        ) : null}

        <button
          type="button"
          onClick={toggleAssunto}
          aria-expanded={assuntoExpandido}
          aria-controls={painelDesktopMontado ? panelId : undefined}
          aria-haspopup={useSheet ? 'dialog' : undefined}
          aria-label={assuntoExpandido ? 'Recolher assunto' : 'Expandir assunto'}
          className={cn(
            /* size-11 = 44px alvo de toque; glyph permanece 18. */
            'flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-700',
            vitrineBrand.focusRing,
          )}
        >
          {assuntoExpandido ? (
            <ChevronUp size={18} aria-hidden />
          ) : (
            <ChevronDown size={18} aria-hidden />
          )}
        </button>
      </div>

      {hasQuestions && !compact ? (
        <div className="px-4 pb-3">
          <VitrineQuestaoLink
            slug={ctaSlug}
            estudarQuery={estudarQuery}
            className={cn(vitrineBrand.buttonSecondary, 'w-full')}
          >
            {ctaLabel}
          </VitrineQuestaoLink>
        </div>
      ) : null}

      {hasQuestions ? (
        <div
          className={cn(
            'w-full shrink-0',
            compact ? 'h-0.5 min-h-[2px]' : 'h-1 min-h-[4px]',
            showProgressBar || coberturaPct >= 100 ? 'bg-slate-100' : 'bg-slate-100/70',
          )}
          role="progressbar"
          aria-valuenow={coberturaPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Cobertura do assunto: ${acertoDisplay.coberturaLabel}`}
        >
          {showProgressBar || coberturaPct >= 100 ? (
            <div
              className={cn(
                'h-full transition-[width] duration-300 ease-out',
                coberturaPct >= 100
                  ? 'bg-[var(--color-success)]'
                  : vitrineBrand.bar,
              )}
              style={{ width: `${coberturaPct}%` }}
            />
          ) : null}
        </div>
      ) : null}

      {painelDesktopMontado ? (
        <div id={panelId}>
          <div className="space-y-3 border-t border-slate-100 px-4 py-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {todas ? (
                <NeonBadge variant="success">Completo</NeonBadge>
              ) : pendentes > 0 ? (
                <NeonBadge variant="neutral">{pendentes} para estudar</NeonBadge>
              ) : totalResolvidas === 0 ? (
                <NeonBadge variant="neutral">Não iniciado</NeonBadge>
              ) : null}
              <VitrineQuestaoLink
                slug={firstSlug}
                estudarQuery={estudarQuery}
                className={cn(vitrineBrand.buttonSecondary, 'ml-auto')}
              >
                Entrar no assunto
              </VitrineQuestaoLink>
            </div>

            <div className="flex justify-center">
              <VitrineProgressRing
                acertos={acertos}
                respondidas={totalResolvidas}
                total={totalQuestoes}
                percentual={percentual}
                size={88}
              />
            </div>

            <p className="-mt-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Taxa de acerto
            </p>
            <p className="-mt-2 text-center text-[11px] text-slate-500">
              {acertoDisplay.coberturaLabel}
            </p>

            <VitrineQuestaoList
              tituloAula={titulo_aula}
              firstSlug={firstSlug}
              totalQuestoes={totalQuestoes}
              questoes={questoes}
              estudarQuery={estudarQuery}
            />

            <p className="border-t border-slate-100 pt-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {totalQuestoes} {labelQuestoes(totalQuestoes)} no assunto
              {todas ? ' · Concluído' : trabalhadas > 0 ? ' · Em progresso' : ''}
            </p>
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
