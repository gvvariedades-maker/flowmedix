import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function EstudarQuestaoNotFound() {
  return (
    <div className="flex min-h-[min(70vh,32rem)] flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
          <FileQuestion className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Questão não encontrada</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Esta questão não existe, foi removida ou você não tem acesso a ela no momento.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/estudar" className="btn-editorial-primary inline-flex h-11 items-center justify-center px-6">
            Voltar à vitrine
          </Link>
          <Link href="/" className="btn-editorial-outline inline-flex h-11 items-center justify-center px-6">
            Início
          </Link>
        </div>
      </div>
    </div>
  );
}
