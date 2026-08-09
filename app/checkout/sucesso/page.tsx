import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { isAdminSessionEmail } from '@/lib/constants';
import { getServerSession } from '@/lib/supabase/server-auth';

export const metadata: Metadata = {
  title: 'Acesso liberado | AVANT enf',
  description: 'Pagamento confirmado. Verifique seu e-mail para entrar no AVANT enf.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/checkout/sucesso' },
};

export default async function CheckoutSucessoPage() {
  const session = await getServerSession();
  if (session?.user?.id) {
    redirect(isAdminSessionEmail(session.user.email) ? '/admin' : '/estudar');
  }

  return (
    <div className="min-h-screen bg-[#010409] px-4 py-16 text-slate-100 sm:px-6 sm:py-24">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-22%] left-1/2 h-[520px] w-[min(140%,980px)] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute right-[-10%] bottom-[-12%] h-[400px] w-[400px] rounded-full bg-[#F26522]/8 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-10">
        <div className="flex justify-center">
          <CheckCircle2 className="h-14 w-14 text-[#F26522]" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-[1000] tracking-tight text-white sm:text-3xl">
          Acesso liberado.
        </h1>
        <p className="mt-4 text-base font-medium leading-relaxed text-slate-400">
          Enviamos um link de acesso para o seu e-mail. Clique nele para entrar direto no AVANT enf.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Se não encontrar, verifique a caixa de spam.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          Já tenho conta → Entrar
        </Link>
      </div>
    </div>
  );
}
