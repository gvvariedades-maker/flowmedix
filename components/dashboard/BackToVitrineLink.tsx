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
        'inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 transition-colors hover:border-[#BEF264]/40 hover:bg-[#BEF264]/10 hover:text-white',
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
        'shrink-0 border-b border-white/10 bg-[#010409]/90 px-4 py-3 backdrop-blur-xl sm:px-6',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <BackToVitrineLink />
      </div>
    </div>
  );
}
