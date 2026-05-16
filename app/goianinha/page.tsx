import type { Metadata } from 'next';
import Image from 'next/image';
import {
  BookOpenCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HelpCircle,
  Stethoscope,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { iniciarCheckoutGoianinha } from './actions';
import { CountdownDays } from './CountdownDays';

type GoianinhaPageProps = {
  searchParams: Promise<{ erro?: string | string[] }>;
};

const checkoutErrorMessages: Record<string, string> = {
  invalido: 'Não foi possível iniciar o pagamento. Atualize a página e tente novamente.',
  pagamentos: 'Pagamentos temporariamente indisponíveis. Tente novamente em alguns minutos.',
  config:
    'O checkout deste pacote ainda não está configurado no servidor. Entre em contato com o suporte se o problema persistir.',
  checkout: 'Não foi possível abrir o pagamento agora. Tente novamente em alguns minutos.',
};

function resolveCheckoutErrorMessage(erro: string | undefined): string | null {
  if (!erro) return null;
  return checkoutErrorMessages[erro] ?? null;
}

export const metadata: Metadata = {
  title: 'Técnico de Enfermagem Goianinha | AVANT',
  description:
    'Questões reais da IDIB para Técnico de Enfermagem em Goianinha. Treine os Conhecimentos Específicos por R$ 37.',
  alternates: { canonical: '/goianinha' },
  openGraph: {
    title: 'Questões reais da IDIB para Técnico de Enfermagem | AVANT',
    description:
      'Treine com questões reais aplicadas pela IDIB e saiba exatamente o que revisar antes da prova em Goianinha.',
    url: getAbsoluteUrl('/goianinha'),
    type: 'website',
    locale: 'pt_BR',
  },
};

function GoianinhaBackdrop() {
  return (
    <>
      <div className="absolute top-[-18%] left-1/2 h-[560px] w-[min(140%,1040px)] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[130px]" />
      <div className="absolute right-[-14%] bottom-[10%] h-[520px] w-[520px] rounded-full bg-emerald-400/12 blur-[120px]" />
      <div className="absolute top-1/3 left-[-18%] h-[460px] w-[460px] rounded-full bg-indigo-600/18 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </>
  );
}

function CheckoutCtaForm({ label }: { label: string }) {
  return (
    <form action={iniciarCheckoutGoianinha} className="inline-flex w-full max-w-md flex-col sm:w-auto">
      <input type="hidden" name="intent" value="goianinha-checkout" />
      <Button
        type="submit"
        size="lg"
        className="h-[52px] w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-300 px-7 text-base font-black tracking-tight text-slate-950 shadow-2xl shadow-cyan-500/20 hover:from-cyan-300 hover:to-emerald-200 sm:w-auto sm:min-w-[290px]"
      >
        {label}
      </Button>
    </form>
  );
}

function PageHeader() {
  return (
    <header className="relative z-20 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#topo" className="flex items-center gap-3" aria-label="AVANT Goianinha">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-sm font-black text-cyan-100 shadow-lg shadow-cyan-500/10">
            A
          </span>
          <span className="text-xl font-black tracking-[0.22em] text-white uppercase">AVANT</span>
        </a>

        <Button
          asChild
          size="sm"
          className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 font-bold text-cyan-50 hover:bg-cyan-300/20"
        >
          <a href="#cta">Quero me preparar</a>
        </Button>
      </div>
    </header>
  );
}

const contestNumbers = [
  {
    icon: Stethoscope,
    value: '20',
    label: 'vagas imediatas na Saúde',
  },
  {
    icon: Target,
    value: '50',
    label: 'oportunidades (+ cadastro reserva)',
  },
  {
    icon: CalendarDays,
    value: '30/08/2026',
    label: 'data da prova',
  },
  {
    icon: CircleDollarSign,
    value: 'R$ 37',
    label: 'acesso completo',
  },
];

const painPoints = [
  'Resolve questões genéricas que não têm nada a ver com o estilo real da IDIB',
  'Erra uma questão, olha o gabarito e continua sem entender o porquê',
  'Estuda entre plantões sem saber se está evoluindo ou andando em círculos',
  'Chega perto da prova sem clareza do que ainda trava sua pontuação',
];

const differentials = [
  {
    icon: BookOpenCheck,
    title: 'Questões reais da IDIB',
    description:
      'Questões de concursos anteriores aplicados pela IDIB para Técnico de Enfermagem — você treina com o que a banca realmente cobra.',
  },
  {
    icon: Brain,
    title: 'Aprende acertando e errando',
    description:
      'Acertou? Reforça o que já sabe. Errou? O AVANT identifica o gap e abre o NeuroSlide certo: fluxo, regra, mapa ou zona de perigo.',
  },
  {
    icon: Target,
    title: 'Zona de Perigo da IDIB',
    description:
      'A IDIB cobra o que separa candidato preparado de candidato aprovado: diferença de atribuição entre Técnico e Enfermeiro, protocolos com número exato, calendário vacinal atualizado pela IN 2024.',
  },
  {
    icon: Clock3,
    title: 'Revisão espaçada',
    description:
      'Técnica científica que programa a revisão no momento certo — antes que o conteúdo saia da memória.',
  },
];

const packageItems = [
  'Questões reais da IDIB para Técnico de Enfermagem',
  'Conteúdo alinhado ao edital de Goianinha 2026',
  'NeuroSlides após cada questão — mapa, regra, fluxo e zona de perigo',
  'Feedback em cada questão — certa ou errada',
  'Painel de desempenho — acompanhe sua evolução',
  'Revisão espaçada — absorção de longo prazo',
  'Estude no celular, entre plantões, no seu ritmo',
];

const walkthroughSteps = [
  {
    step: '01',
    src: '/images/goianinha/walk-01.jpg',
    alt: 'Questão real da IDIB — Ceará-Mirim 2024',
    caption: 'Questão real da IDIB — Ceará-Mirim 2024',
  },
  {
    step: '02',
    src: '/images/goianinha/walk-02.jpg',
    alt: 'Seleção de resposta no AVANT',
    caption: 'Você escolhe sua resposta',
  },
  {
    step: '03',
    src: '/images/goianinha/walk-03.jpg',
    alt: 'Diagnóstico imediato após responder',
    caption: 'Diagnóstico imediato — certa ou errada',
  },
  {
    step: '04',
    src: '/images/goianinha/walk-04.jpg',
    alt: 'Mapa de conceitos com 4 esferas ciano sobre a vacina BCG',
    caption: 'Mapa de conceitos — pontos críticos da BCG',
  },
  {
    step: '05',
    src: '/images/goianinha/walk-05.jpg',
    alt: 'Regra de Ouro — BCG é intradérmica',
    caption: 'Regra de Ouro — o que não pode esquecer',
  },
  {
    step: '06',
    src: '/images/goianinha/walk-06.jpg',
    alt: 'Fluxo de administração passo a passo',
    caption: 'Fluxo de administração — passo a passo',
  },
  {
    step: '07',
    src: '/images/goianinha/walk-07.jpg',
    alt: 'Zona de Perigo — erros comuns na administração da BCG',
    caption: 'Zona de Perigo — erros que derrubam na prova',
  },
  {
    step: '08',
    src: '/images/goianinha/walk-08.jpg',
    alt: 'Ciclo concluído — próxima questão',
    caption: 'Ciclo concluído — próxima questão',
  },
] as const;

function ProductWalkthroughSection() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mx-auto max-w-2xl text-center text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
          Veja o ciclo completo — do erro ao aprendizado
        </h2>
        <p className="mt-2 text-center text-slate-400">
          É isso que acontece depois de cada questão da IDIB no AVANT.
        </p>

        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {walkthroughSteps.map((item) => (
            <article
              key={item.step}
              className="min-w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl md:min-w-0"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={280}
                height={500}
                className="h-auto w-full"
              />
              <div className="px-3 py-2">
                <span className="font-mono text-xs text-cyan-400">{item.step}</span>
                <p className="mt-1 text-xs text-slate-400">{item.caption}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-md text-center text-sm text-slate-300">
          4 slides. Cada um com uma função diferente. Isso acontece depois de cada questão — certa ou errada.
        </p>
      </div>
    </section>
  );
}


function CheckoutErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <p className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-5 py-4 text-sm font-semibold leading-relaxed text-amber-50">
        {message}
      </p>
    </div>
  );
}

export default async function GoianinhaPage({ searchParams }: GoianinhaPageProps) {
  const params = await searchParams;
  const erroParam = Array.isArray(params.erro) ? params.erro[0] : params.erro;
  const checkoutErrorMessage = resolveCheckoutErrorMessage(erroParam);

  return (
    <div
      id="topo"
      className="min-h-screen overflow-x-hidden bg-[#010409] text-slate-100 selection:bg-cyan-400/25 selection:text-white"
    >
      <div className="pointer-events-none fixed inset-0">
        <GoianinhaBackdrop />
      </div>

      <PageHeader />

      <main className="relative z-10">
        {checkoutErrorMessage ? <CheckoutErrorBanner message={checkoutErrorMessage} /> : null}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:grid-cols-[1.06fr_0.94fr] lg:px-8">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-[10px] font-black tracking-[0.2em] text-cyan-100 uppercase sm:text-xs">
              <span aria-hidden>⚡</span>
              Prova em 30/08/2026 · Inscrições até 18/05
            </p>

            <h1 className="max-w-4xl text-4xl leading-[1.05] font-[1000] tracking-tight text-white sm:text-6xl">
              20 vagas para Técnico de Enfermagem em Goianinha.{' '}
              <span className="bg-gradient-to-r from-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                A IDIB cobra detalhe — não conceito geral.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed font-medium text-slate-300 sm:text-xl">
              Treine com questões reais aplicadas pela IDIB e saiba exatamente o que revisar antes da
              prova.
            </p>

            <div className="mt-9">
              <CheckoutCtaForm label="Quero começar agora — R$ 37" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8">
            <p className="text-sm font-black tracking-[0.22em] text-emerald-200 uppercase">
              Edital Goianinha 2026
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-slate-400">Cargo</p>
                <p className="mt-1 text-xl font-black text-white">Técnico de Enfermagem — 40h</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Banca</p>
                  <p className="mt-1 font-black text-cyan-100">IDIB</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Vagas</p>
                  <p className="mt-1 font-black text-cyan-100">20 + 30 cadastro reserva</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Prova</p>
                  <p className="mt-1 font-black text-cyan-100">30/08/2026 · Goianinha/RN</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Inscrições</p>
                  <p className="mt-1 font-black text-cyan-100">14/05 a 18/05/2026</p>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4">
                <p className="text-sm text-emerald-100">Remuneração</p>
                <p className="mt-1 font-black text-white">R$ 1.621,00 · taxa de inscrição R$ 120,00</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contestNumbers.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-xl shadow-black/20"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                    <Icon size={22} aria-hidden />
                  </span>
                  <p className="mt-5 text-3xl font-black tracking-tight text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black tracking-[0.22em] text-slate-500 uppercase">O problema</p>
              <h2 className="mt-4 text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
                Você estuda, mas não sabe se está estudando o que a IDIB cobra?
              </h2>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {painPoints.map((pain) => (
                <div key={pain} className="rounded-3xl border border-red-300/10 bg-red-950/15 p-6">
                  <XCircle className="text-red-200" size={24} aria-hidden />
                  <p className="mt-5 text-base leading-relaxed font-semibold text-slate-200">{pain}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductWalkthroughSection />

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <p className="text-sm font-black tracking-[0.22em] text-cyan-200 uppercase">A solução</p>
            <h2 className="text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              O AVANT foi feito para quem não tem tempo a perder
            </h2>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {differentials.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/20"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                    <Icon size={24} aria-hidden />
                  </span>
                  <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-400">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div>
              <p className="text-sm font-black tracking-[0.22em] text-emerald-200 uppercase">O pacote</p>
              <h2 className="mt-4 text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
                O que você acessa por R$ 37
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Um treino direto para Conhecimentos Específicos de Técnico de Enfermagem, com foco no estilo da
                IDIB e na sua evolução real.
              </p>
            </div>

            <div className="space-y-4">
              {packageItems.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={20} aria-hidden />
                  <p className="text-base leading-relaxed text-slate-200">{item}</p>
                </div>
              ))}

              <div className="mt-6 flex gap-3 rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-5">
                <HelpCircle className="mt-0.5 shrink-0 text-cyan-100" size={22} aria-hidden />
                <p className="text-sm leading-relaxed text-cyan-50">
                  Este pacote cobre os Conhecimentos Específicos. Para Conhecimentos Gerais, como Português,
                  Raciocínio Lógico e Legislação, recomendamos complementar com outras fontes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/35 shadow-2xl shadow-emerald-950/30">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:p-10">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black tracking-[0.18em] text-emerald-100 uppercase">
                  <TrendingUp size={15} aria-hidden />
                  Pagamento único
                </p>
                <h2 className="mt-6 max-w-2xl text-3xl leading-tight font-black tracking-tight text-white sm:text-5xl">
                  Prepare-se para a prova da IDIB por R$ 37
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                  A taxa de inscrição custou R$ 120. Sua preparação específica custa R$ 37.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm font-semibold text-slate-400">Acesso completo</p>
                <p className="mt-2 text-5xl font-black tracking-tight text-white">R$ 37</p>
                <p className="mt-2 text-sm font-semibold text-emerald-200">Pagamento único, sem mensalidade</p>
                <div className="mt-7">
                  <CheckoutCtaForm label="Garantir meu acesso — R$ 37" />
                </div>
                <p className="mt-4 text-sm text-slate-400">Acesso imediato após o pagamento</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/10 p-6 text-center shadow-2xl shadow-cyan-950/20 sm:p-8">
            <CountdownDays />
          </div>
        </section>

        <footer className="relative z-10 border-t border-white/10 bg-slate-950/80">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
                O AVANT é uma plataforma de estudo independente. Não somos órgão público, banca examinadora nem
                afiliados à IDIB ou à Prefeitura de Goianinha. As questões utilizadas são de concursos públicos
                anteriores, de domínio público, aplicadas pela banca IDIB.
              </p>
              <div className="flex gap-4 text-sm font-semibold text-slate-300">
                <a className="hover:text-cyan-200" href="/politica-de-privacidade">
                  Política de Privacidade
                </a>
                <a className="hover:text-cyan-200" href="/termos-de-uso">
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
