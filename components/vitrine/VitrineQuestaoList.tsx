'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { cn } from '@/lib/utils';
import type { VitrineQuestaoItem } from '@/lib/vitrine/types';
import { buildVitrineResolveQuestaoSearchParams } from '@/lib/vitrine/resolveQuestaoUrl';
import { labelQuestoes } from '@/lib/labelQuestoes';
import {
  buildEstudarHref,
  markEstudarVitrineReturnEligible,
} from '@/lib/estudar/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  VitrineQuestaoLink,
  buildVitrineSlugComQuery,
} from '@/components/vitrine/VitrineQuestaoLink';

function StatusBadge({ status }: { status: VitrineQuestaoItem['status'] }) {
  if (status === 'estudada') {
    return <CheckCircle2 size={15} className="shrink-0 text-green-600" aria-hidden />;
  }
  return <Circle size={15} className="shrink-0 text-slate-300" aria-hidden />;
}

export type VitrineQuestaoListProps = {
  tituloAula: string;
  firstSlug: string;
  totalQuestoes: number;
  questoes: VitrineQuestaoItem[];
  estudarQuery: string;
};

export function VitrineQuestaoList({
  tituloAula,
  firstSlug,
  totalQuestoes,
  questoes,
  estudarQuery,
}: VitrineQuestaoListProps) {
  const router = useRouter();
  const [questoesExpandido, setQuestoesExpandido] = useState(false);
  const [jumpAlvo, setJumpAlvo] = useState('');
  const [jumpError, setJumpError] = useState<string | null>(null);
  const [jumpLoading, setJumpLoading] = useState(false);

  const questoesExibidas = questoes.length;
  const questoesTruncadas = Math.max(0, totalQuestoes - questoesExibidas);
  const listaFoiTruncada = questoesTruncadas > 0;
  const hasQuestions = totalQuestoes > 0;

  const handleJumpToQuestao = useCallback(async () => {
    const alvo = jumpAlvo.trim();
    if (!alvo) {
      setJumpError('Informe o número ou código Q-…');
      return;
    }

    setJumpLoading(true);
    setJumpError(null);
    try {
      const params = buildVitrineResolveQuestaoSearchParams({
        assunto: tituloAula,
        alvo,
        estudarQuery,
      });
      const res = await fetchWithAuth(`/api/vitrine/questao?${params.toString()}`);
      const body = (await res.json().catch(() => ({}))) as { slug?: string; error?: string };
      if (!res.ok || !body.slug) {
        setJumpError(body.error ?? 'Questão não encontrada neste assunto');
        return;
      }
      const destino = buildEstudarHref(buildVitrineSlugComQuery(body.slug, estudarQuery));
      markEstudarVitrineReturnEligible();
      router.push(destino);
    } catch {
      setJumpError('Não foi possível abrir a questão. Tente de novo.');
    } finally {
      setJumpLoading(false);
    }
  }, [estudarQuery, jumpAlvo, router, tituloAula]);

  if (!hasQuestions) return null;

  return (
    <>
      <form
        className="space-y-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleJumpToQuestao();
        }}
      >
        <label
          htmlFor={`jump-questao-${firstSlug}`}
          className="text-[10px] font-medium uppercase tracking-wide text-slate-500"
        >
          Ir para questão
        </label>
        <div className="flex gap-2">
          <Input
            id={`jump-questao-${firstSlug}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="go"
            placeholder={listaFoiTruncada ? `1–${totalQuestoes} ou Q-…` : 'Nº ou Q-…'}
            value={jumpAlvo}
            onChange={(e) => {
              setJumpAlvo(e.target.value);
              if (jumpError) setJumpError(null);
            }}
            disabled={jumpLoading}
            className="input-editorial h-11 min-h-[44px] flex-1 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            disabled={jumpLoading || !jumpAlvo.trim()}
            className="h-11 min-h-[44px] shrink-0 rounded-xl px-4"
          >
            {jumpLoading ? '…' : 'Ir'}
          </Button>
        </div>
        {jumpError ? (
          <p className="text-[11px] font-medium text-red-600" role="alert">
            {jumpError}
          </p>
        ) : listaFoiTruncada ? (
          <p className="text-[10px] text-slate-500">
            A lista abaixo mostra as primeiras {questoesExibidas} de {totalQuestoes}.
          </p>
        ) : null}
      </form>

      <button
        type="button"
        onClick={() => setQuestoesExpandido((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <span className="text-xs font-medium">
          {questoesExpandido
            ? 'Ocultar questões'
            : listaFoiTruncada
              ? `Ver ${questoesExibidas} de ${totalQuestoes} questões`
              : `Ver ${totalQuestoes} ${labelQuestoes(totalQuestoes)}`}
        </span>
        {questoesExpandido ? (
          <ChevronUp size={14} className="text-slate-500" aria-hidden />
        ) : (
          <ChevronDown size={14} className="text-slate-500" aria-hidden />
        )}
      </button>

      <div
        aria-hidden={!questoesExpandido}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          questoesExpandido ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="max-h-[min(50vh,20rem)] space-y-1.5 overflow-y-auto overscroll-contain pt-1 pr-1">
            {questoes.map((q) => {
              const estudada = q.status === 'estudada';
              return (
                <VitrineQuestaoLink
                  key={q.slug}
                  slug={q.slug}
                  estudarQuery={estudarQuery}
                  className={cn(
                    'group flex min-h-[44px] items-center gap-3 rounded-xl border px-3 py-2.5 transition-all',
                    estudada
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : 'border-slate-200 bg-white hover:border-[rgba(143,224,32,0.3)] hover:bg-[rgba(143,224,32,0.04)]',
                  )}
                >
                  <StatusBadge status={q.status} />
                  <span
                    className={cn(
                      'flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium',
                      estudada ? 'text-green-700' : 'text-slate-700',
                    )}
                  >
                    <span>Questão {String(q.numero).padStart(2, '0')}</span>
                    {formatAvantCodigo(q.avant_codigo) ? (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                        {formatAvantCodigo(q.avant_codigo)}
                      </span>
                    ) : null}
                  </span>
                  {!estudada ? (
                    <span className="text-[10px] font-medium text-slate-500">Iniciar</span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#3d6b0f]">Revisitar</span>
                  )}
                  <ChevronRight
                    size={12}
                    className="shrink-0 text-slate-400 opacity-60 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </VitrineQuestaoLink>
              );
            })}
          </div>
          {listaFoiTruncada ? (
            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[11px] font-medium text-amber-700">
              <span>
                +{questoesTruncadas} {labelQuestoes(questoesTruncadas)} neste assunto.
              </span>
              <VitrineQuestaoLink
                slug={firstSlug}
                estudarQuery={estudarQuery}
                className="inline-flex min-h-[44px] items-center font-semibold text-amber-800 underline-offset-2 hover:text-amber-900 hover:underline"
              >
                Próxima pendente
              </VitrineQuestaoLink>
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
