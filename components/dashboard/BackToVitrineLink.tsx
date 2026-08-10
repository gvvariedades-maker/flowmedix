'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export const VITRINE_PATH = '/estudar';

/** Rotas em que o link não deve aparecer (vitrine ou player de questão). */
export function shouldShowBackToVitrine(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === VITRINE_PATH) return false;
  if (pathname.startsWith(`${VITRINE_PATH}/`)) return false;
  return true;
}

type BackToVitrineLinkProps = {
  className?: string;
};

export function BackToVitrineLink({ className }: BackToVitrineLinkProps) {
  return (
    <Link
      href={VITRINE_PATH}
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[var(--color-success)]/50 hover:bg-[var(--color-success-dim)] hover:text-[var(--color-success-text)]',
        className,
      )}
    >
      <ArrowLeft size={16} aria-hidden />
      Voltar para a Vitrine
    </Link>
  );
}

export function BackToVitrineBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <BackToVitrineLink />
      </div>
    </div>
  );
}
