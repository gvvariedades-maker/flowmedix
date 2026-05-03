import { ActionLink, AJUDA_SURFACE, Note, Toc } from '../ajudaComponents';
import {
  CICLO,
  COMPARATIVO,
  CTA_FINAL,
  DEFINICAO,
  FAQ,
  FONTES,
  HERO,
  PASSO_A_PASSO,
  PILARES,
  PROBLEMA,
  TOC,
} from './copy';
import {
  CicloCards,
  ComparativoColunas,
  CtaFinal,
  FaqLista,
  FluxoBadges,
  FontesLista,
  HeroEstudoReverso,
  PilaresGrid,
  ProblemaBloco,
} from './estudoReversoComponents';

export const metadata = {
  title: 'Estudo Reverso: método AVANT | Como funciona',
  description:
    'Entenda o método Estudo Reverso do AVANT: ciclo de 4 etapas, fundamentos de neurociência aplicada e passo a passo prático.',
  alternates: {
    canonical: '/ajuda/estudo-reverso',
  },
  openGraph: {
    title: 'Estudo Reverso: método AVANT | Como funciona',
    description:
      'Entenda como o Estudo Reverso transforma questões de concursos em diagnóstico, mapa, regra de ouro e revisão inteligente.',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estudo Reverso: método AVANT | Como funciona',
    description:
      'Entenda como o Estudo Reverso transforma questões de concursos em diagnóstico e revisão inteligente.',
  },
};

export default function EstudoReversoPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 pb-20 md:px-6">
      <HeroEstudoReverso {...HERO} />

      <section
        className={`mt-6 p-5 shadow-sm md:flex md:items-center md:justify-between md:gap-5 ${AJUDA_SURFACE}`}
      >
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Introdução rápida</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-100">Prefere ver em formato de slides?</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Abra o resumo de boas-vindas com 4 passos curtos para apresentar o método a novos alunos.
          </p>
        </div>
        <div className="mt-4 shrink-0 md:mt-0">
          <ActionLink href="/ajuda/estudo-reverso?intro=1">Ver introdução rápida</ActionLink>
        </div>
      </section>

      <div className="md:hidden">
        <details
          className={`my-6 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-4 shadow-sm`}
        >
          <summary className="cursor-pointer text-[11px] font-black uppercase tracking-widest text-slate-400">
            Índice do método
          </summary>
          <div className="mt-3">
            <Toc items={[...TOC]} />
          </div>
        </details>
      </div>
      <div className="hidden md:block">
        <Toc items={[...TOC]} />
      </div>

      <div className="mt-10 space-y-10">
        <section id="problema" className="scroll-mt-10">
          <ProblemaBloco {...PROBLEMA} />
        </section>

        <section id="definicao" className={`scroll-mt-10 p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
          <h2 className="text-2xl font-black tracking-tight text-slate-100">{DEFINICAO.titulo}</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400">{DEFINICAO.resumo}</p>
          <FluxoBadges itens={DEFINICAO.fluxo} />
          <Note>
            O ponto central é simples: você não espera dominar tudo para praticar. Você pratica para descobrir o que precisa dominar.
          </Note>
        </section>

        <section id="ciclo" className="scroll-mt-10">
          <CicloCards {...CICLO} />
        </section>

        <section id="comparativo" className="scroll-mt-10">
          <ComparativoColunas titulo={COMPARATIVO.titulo} tradicional={COMPARATIVO.tradicional} reverso={COMPARATIVO.reverso} />
        </section>

        <section id="neurociencia" className="scroll-mt-10">
          <PilaresGrid {...PILARES} />
        </section>

        <section id="passo-a-passo" className={`scroll-mt-10 p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
          <h2 className="text-2xl font-black tracking-tight text-slate-100">{PASSO_A_PASSO.titulo}</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-5">
            {PASSO_A_PASSO.passos.map((passo, index) => (
              <li
                key={passo}
                className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-3 text-sm font-semibold leading-snug text-slate-200"
              >
                <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                {passo}
              </li>
            ))}
          </ol>
          <div className="mt-5">
            <ActionLink href="/estudar">Ir para a Vitrine de Aulas</ActionLink>
          </div>
        </section>

        <section id="faq" className="scroll-mt-10">
          <FaqLista itens={FAQ} />
        </section>

        <section id="fontes" className="scroll-mt-10">
          <FontesLista itens={FONTES} />
        </section>

        <CtaFinal {...CTA_FINAL} />
      </div>
    </div>
  );
}
