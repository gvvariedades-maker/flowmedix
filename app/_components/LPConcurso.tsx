import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react';
import {
  LPCheckoutButton,
  LPCountdownDays,
  LPImpactMetrics,
  LPMotionSection,
  LPNeuroSlideCarousel,
  LPNavbar,
} from '@/app/_components/LPConcurso.client';

export interface LPConcursoConfig {
  concurso: {
    cidade: string;
    cargo: string;
    banca: string;
    nomeBanca: string;
    vagas: string;
    vagasPCD?: string;
    cadastroReserva?: string;
    dataProva: string;
    dataProvaFormatada: string;
    statusInscricoes: string;
    remuneracao: string;
    taxaInscricao: string;
    orgao: string;
  };
  oferta?: {
    preco: string;
  };
  copy: {
    headlinePrincipal: string;
    subtitulo: string;
    dores: [string, string, string];
    perigosBanca: [string, string, string];
    listaBeneficios: string[];
    disclaimer: string;
    disclaimerLegal: string;
  };
  walkthrough: {
    imagens: string[];
  };
}

const WALKTHROUGH_CAPTIONS = [
  'Questão real da banca',
  'Você escolhe sua resposta',
  'Gabarito imediato',
  'Diagnóstico do erro',
  'NeuroSlide: Mapa Mental',
  'NeuroSlide: Regra de Ouro',
  'NeuroSlide: Fluxo Lógico',
  'NeuroSlide: Zona de Perigo',
] as const;

const DEFAULT_PRECO = '14,90';

function ctaLabel(preco: string): string {
  return `Assinar AVANT Pro — R$ ${preco}/mês`;
}

function inscricoesEncerradas(status: string): boolean {
  return /encerrad/i.test(status);
}

function resolveWalkthroughImage(imagens: string[], index: number): string | null {
  if (imagens.length === 0) return null;
  return imagens[index % imagens.length] ?? null;
}

function HeroBackdrop() {
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

export function LPConcurso({ config }: { config: LPConcursoConfig }) {
  const { concurso, copy, walkthrough } = config;
  const preco = config.oferta?.preco ?? DEFAULT_PRECO;
  const labelCta = ctaLabel(preco);
  const encerradas = inscricoesEncerradas(concurso.statusInscricoes);

  const vagasLabel =
    concurso.vagasPCD && concurso.vagasPCD !== 'A divulgar'
      ? `${concurso.vagas} + ${concurso.vagasPCD} PCD`
      : concurso.vagas;

  const editalCards = [
    { label: 'Cargo', value: concurso.cargo },
    { label: 'Banca', value: concurso.banca },
    { label: 'Vagas', value: vagasLabel },
    { label: 'Data da Prova', value: concurso.dataProvaFormatada },
    { label: 'Remuneração', value: concurso.remuneracao },
    { label: 'Taxa de Inscrição', value: concurso.taxaInscricao },
  ];

  const beneficiosPro = [
    `Preparação direcionada para o edital de ${concurso.cidade}`,
    'Acesso a todos os concursos futuros — sem pagar de novo',
    ...copy.listaBeneficios,
  ];

  const badgeClassName = encerradas
    ? 'border-rose-400/30 bg-rose-500/15 text-rose-200'
    : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#010409] text-slate-100 selection:bg-cyan-400/25 selection:text-white">
      <LPNavbar
        statusInscricoes={concurso.statusInscricoes}
        dataProva={concurso.dataProva}
        ctaLabel={labelCta}
      />

      <main className="relative z-10 pt-[72px]">
        {/* 2 — Hero */}
        <LPMotionSection
          ariaLabel="Apresentação do concurso"
          className="relative overflow-hidden px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:px-8"
        >
          <div className="pointer-events-none absolute inset-0">
            <HeroBackdrop />
          </div>
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <p
                className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black sm:text-sm ${badgeClassName}`}
              >
                {concurso.statusInscricoes} · Prova em {concurso.dataProvaFormatada}
              </p>

              <h1 className="max-w-4xl bg-gradient-to-r from-white via-cyan-200 to-[#BEF264] bg-clip-text text-4xl leading-[1.05] font-[1000] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                {copy.headlinePrincipal}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                {copy.subtitulo}
              </p>

              <div className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
                {editalCards.map((card) => (
                  <div
                    key={card.label}
                    className="min-w-[140px] shrink-0 snap-start rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur sm:min-w-[160px]"
                  >
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      {card.label}
                    </p>
                    <p className="mt-1 text-sm font-black text-white">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 max-w-md">
                <LPCheckoutButton label={labelCta} />
                <p className="mt-3 text-sm text-slate-500">
                  Cancela quando quiser · Acesso completo · Preparação para {concurso.cidade} e
                  todos os próximos concursos
                </p>
              </div>

              <div className="mt-8">
                <LPCountdownDays
                  dataProva={concurso.dataProva}
                  dataProvaFormatada={concurso.dataProvaFormatada}
                  variant="hero"
                />
              </div>
            </div>

            <LPNeuroSlideCarousel />
          </div>
        </LPMotionSection>

        {/* 3 — Números de impacto */}
        <LPMotionSection
          ariaLabel="Números do concurso"
          className="border-y border-white/5 bg-slate-950/50 px-4 py-10 sm:px-6 lg:px-8"
        >
          <LPImpactMetrics
            vagas={concurso.vagas}
            dataProva={concurso.dataProva}
            preco={preco}
          />
        </LPMotionSection>

        {/* 4 — Dor */}
        <LPMotionSection
          ariaLabel="Dores de estudo"
          className="px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              Você estuda, mas não sabe se está estudando o que a {concurso.nomeBanca} cobra?
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {copy.dores.map((dor) => (
                <li
                  key={dor}
                  className="rounded-2xl border border-rose-400/15 bg-rose-950/15 p-5"
                >
                  <CircleAlert className="mb-4 text-rose-300" size={22} aria-hidden />
                  <p className="text-base leading-relaxed text-slate-200">{dor}</p>
                </li>
              ))}
            </ul>
          </div>
        </LPMotionSection>

        {/* 5 — Walkthrough */}
        <LPMotionSection
          ariaLabel="Demonstração do ciclo de estudo"
          className="bg-slate-950/30 px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              Veja o ciclo completo — do erro ao aprendizado
            </h2>
            <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible [&::-webkit-scrollbar]:hidden">
              {WALKTHROUGH_CAPTIONS.map((caption, index) => {
                const step = index + 1;
                const imageSrc = resolveWalkthroughImage(walkthrough.imagens, index);

                return (
                  <article
                    key={caption}
                    className="min-w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl md:min-w-0"
                  >
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={caption}
                        width={260}
                        height={360}
                        className="aspect-[13/18] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[13/18] w-full items-center justify-center bg-slate-800">
                        <span className="text-4xl font-black text-slate-600">{step}</span>
                      </div>
                    )}
                    <div className="px-3 py-2">
                      <p className="text-[11px] leading-snug text-slate-400">
                        {step}. {caption}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mx-auto mt-8 max-w-lg text-center text-sm text-slate-400">
              4 slides. Cada um com uma função diferente. Isso acontece depois de cada questão —
              certa ou errada.
            </p>
          </div>
        </LPMotionSection>

        {/* 6 — Zona de perigo */}
        <LPMotionSection
          ariaLabel="Pontos críticos da banca"
          className="border-y border-rose-500/15 bg-rose-950/20 px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              O que a {concurso.nomeBanca} cobra e a maioria ignora
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {copy.perigosBanca.map((perigo) => (
                <div
                  key={perigo}
                  className="rounded-2xl border border-rose-400/20 bg-slate-900/60 p-5"
                >
                  <AlertTriangle className="text-rose-400" size={22} aria-hidden />
                  <p className="mt-4 text-base leading-relaxed text-slate-200">{perigo}</p>
                </div>
              ))}
            </div>
          </div>
        </LPMotionSection>

        {/* 7 — Benefícios */}
        <LPMotionSection
          ariaLabel="O que você acessa"
          className="px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl">
              Acesso completo por R$ {preco}/mês
            </h2>
            <ul className="mt-8 space-y-4">
              {beneficiosPro.map((beneficio) => (
                <li key={beneficio} className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-[#00ff88]"
                    size={20}
                    aria-hidden
                  />
                  <span className="text-base leading-relaxed text-slate-200">{beneficio}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-slate-500">{copy.disclaimer}</p>
          </div>
        </LPMotionSection>

        {/* 8 — CTA */}
        <LPMotionSection
          id="cta"
          ariaLabel="Assinar AVANT Pro"
          className="px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/35 p-6 sm:p-10">
            <h2 className="text-center text-2xl leading-tight font-black tracking-tight text-white sm:text-3xl">
              Prepare-se para a prova da {concurso.nomeBanca} com o AVANT Pro
            </h2>
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl">
              <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-200">
                AVANT Pro
              </span>
              <p className="mt-2 text-sm font-semibold text-emerald-200/90">
                Acesso completo à plataforma
              </p>
              <p className="mt-4 text-5xl font-black text-white">
                R$ {preco}
                <span className="text-2xl font-bold text-slate-400">/mês</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-200">Cancela quando quiser</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                A inscrição custou {concurso.taxaInscricao}. O AVANT Pro custa R$ {preco}/mês —
                menos que um lanche.
              </p>
              <div className="mt-6">
                <LPCheckoutButton label={labelCta} />
              </div>
              <p className="mt-4 text-center text-sm text-slate-400">
                Acesso imediato após o pagamento
              </p>
            </div>
            <div className="mt-8">
              <LPCountdownDays
                dataProva={concurso.dataProva}
                dataProvaFormatada={concurso.dataProvaFormatada}
                variant="cta"
              />
            </div>
          </div>
        </LPMotionSection>

        {/* 9 — Rodapé */}
        <footer
          role="contentinfo"
          className="border-t border-white/10 bg-slate-950/80 px-4 py-10 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-3xl text-sm leading-relaxed text-slate-500">
              {copy.disclaimerLegal}
            </p>
            <div className="flex gap-4 text-sm font-semibold text-slate-300">
              <Link className="hover:text-cyan-200" href="/politica-de-privacidade">
                Política de Privacidade
              </Link>
              <span aria-hidden>·</span>
              <Link className="hover:text-cyan-200" href="/termos-de-uso">
                Termos de Uso
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
