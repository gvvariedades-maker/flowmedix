'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
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
import { buildVitrineSlugComQuery } from '@/components/vitrine/VitrineQuestaoLink';
import { VitrineQuestaoItems } from '@/components/vitrine/VitrineQuestaoItems';

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
  const [itensMontados, setItensMontados] = useState(false);
  const [jumpAlvo, setJumpAlvo] = useState('');
  const [jumpError, setJumpError] = useState<string | null>(null);
  const [jumpLoading, setJumpLoading] = useState(false);
  const questoesExpandidoRef = useRef(questoesExpandido);
  questoesExpandidoRef.current = questoesExpandido;

  const questoesExibidas = questoes.length;
  const questoesTruncadas = Math.max(0, totalQuestoes - questoesExibidas);
  const listaFoiTruncada = questoesTruncadas > 0;
  const hasQuestions = totalQuestoes > 0;

  const handleToggleQuestoes = useCallback(() => {
    if (questoesExpandido) {
      setQuestoesExpandido(false);
      setItensMontados(false);
      return;
    }
    setItensMontados(false);
    setQuestoesExpandido(true);
  }, [questoesExpandido]);

  useEffect(() => {
    if (!questoesExpandido) return;
    const frame = requestAnimationFrame(() => {
      if (!questoesExpandidoRef.current) return;
      setItensMontados(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [questoesExpandido]);

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
            variant="outline"
            size="sm"
            disabled={jumpLoading || !jumpAlvo.trim()}
            className={cn('h-11 min-h-[44px] shrink-0 rounded-xl border-slate-200 px-4 text-slate-700', vitrineBrand.hoverBorder, vitrineBrand.hoverBgLight, vitrineBrand.hoverText)}
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
        onClick={handleToggleQuestoes}
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

      {questoesExpandido ? (
        itensMontados ? (
          <VitrineQuestaoItems
            firstSlug={firstSlug}
            totalQuestoes={totalQuestoes}
            questoes={questoes}
            estudarQuery={estudarQuery}
          />
        ) : (
          <div className="max-h-[min(50vh,20rem)] overflow-y-auto overscroll-contain pt-1 pr-1" />
        )
      ) : null}
    </>
  );
}
