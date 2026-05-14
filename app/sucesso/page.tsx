import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { getStripeClient } from '@/lib/stripe/client';
import { Button } from '@/components/ui/button';

type PageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export const metadata: Metadata = {
  title: 'Pagamento confirmado | AVANT',
  description: 'Seu acesso ao AVANT foi registrado. Entre na plataforma para começar.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/sucesso' },
};

export default async function SucessoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;

  if (!sessionId?.trim()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#010409] px-4 text-center text-slate-300">
        <p className="max-w-md text-lg font-medium">Não encontramos o identificador da sessão de pagamento.</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Abra o link enviado após o checkout ou volte à página do pacote e tente novamente.
        </p>
        <Button asChild className="mt-8" variant="secondary">
          <Link href="/campina-grande">Voltar ao pacote Campina Grande</Link>
        </Button>
      </div>
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#010409] px-4 text-center text-slate-300">
        <p className="max-w-md text-lg font-medium">Pagamentos não estão configurados neste ambiente.</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Defina STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET para consultar o comprovante aqui.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard">Acessar a plataforma</Link>
        </Button>
      </div>
    );
  }

  let customerName: string | null = null;
  let customerEmail: string | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId.trim());
    customerName = session.customer_details?.name?.trim() ?? null;
    const emailFromDetails = session.customer_details?.email?.trim();
    const emailDirect = session.customer_email?.trim();
    customerEmail = emailFromDetails || emailDirect || null;
  } catch {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#010409] px-4 text-center text-slate-300">
        <p className="max-w-md text-lg font-medium">Não foi possível validar esta sessão de pagamento.</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Se o pagamento foi concluído, verifique seu e-mail ou entre em contato com o suporte informando o código da
          sessão.
        </p>
        <Button asChild className="mt-8" variant="secondary">
          <Link href="/campina-grande">Voltar ao pacote</Link>
        </Button>
      </div>
    );
  }

  const greeting = customerName ? `${customerName},` : '';

  return (
    <div className="min-h-screen bg-[#010409] px-4 py-16 text-slate-100 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
        <div className="flex justify-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-400" aria-hidden />
        </div>
        <h1 className="mt-6 text-center text-2xl font-[1000] tracking-tight text-white sm:text-3xl">
          Pagamento confirmado
        </h1>
        <p className="mt-4 text-center text-slate-400">
          {greeting ? (
            <>
              <span className="font-semibold text-slate-200">{greeting}</span>{' '}
            </>
          ) : null}
          seu pagamento foi recebido. Seu acesso está liberado. Pode entrar agora.
        </p>
        {customerEmail ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-slate-300">
            E-mail da compra: <span className="font-semibold text-white">{customerEmail}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg" className="w-full font-bold">
            <Link href="/dashboard">Acessar a plataforma</Link>
          </Button>
          <p className="text-center text-xs text-slate-500">
            Use o mesmo e-mail do checkout para entrar. Se ainda não definiu senha, utilize &apos;Esqueci minha
            senha&apos; na tela de login.
          </p>
        </div>
      </div>
    </div>
  );
}
