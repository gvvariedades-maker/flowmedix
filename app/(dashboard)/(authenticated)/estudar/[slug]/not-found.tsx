import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function EstudarQuestaoNotFound() {
  return (
    <div className="flex min-h-[min(70vh,32rem)] flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-400">
          <FileQuestion className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-100">Questão não encontrada</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Esta questão não existe, foi removida ou você não tem acesso a ela no momento.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/estudar"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Voltar à vitrine
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-6 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
          >
            Início
          </Link>
        </div>
      </div>
    </div>
  );
}
