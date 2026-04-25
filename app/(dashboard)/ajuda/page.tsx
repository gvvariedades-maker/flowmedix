import { Sparkles } from 'lucide-react';
import { Toc, Note, InternalLink, AnnotatedShot, hasTutorialImage } from './ajudaComponents';

export const metadata = {
  title: 'Como usar o AVANT | Tutorial com legendas',
  description:
    'Passo a passo com figuras: selos numerados em cada print indicam onde clicar (vitrine, desempenho, plano, cadernos, questão, NEURO).',
};

const TOC = [
  { id: 'passo-01', label: 'Vitrine — grade de assuntos, busca e filtros' },
  { id: 'passo-02', label: 'Vitrine — card aberto, Iniciar e pendentes' },
  { id: 'passo-03', label: 'Meu Desempenho — metas e atividade' },
  { id: 'passo-04', label: 'Plano de Estudo Diário — em dia' },
  { id: 'passo-05', label: 'Novo caderno — nome e criar' },
  { id: 'passo-06', label: 'Questão — alternativas e confirmar' },
  { id: 'passo-07', label: 'Gabarito — ativar estudo reverso' },
  { id: 'passo-08', label: 'NEURO-LEARNING — 1/4' },
  { id: 'passo-09', label: 'NEURO-LEARNING — 4/4, marcar como estudado' },
  { id: 'passo-10', label: 'Caderno — adicionar questões e Estudar caderno' },
] as const;

const STEPS: {
  id: string;
  n: string;
  title: string;
  file: string;
  alt: string;
  caption: string;
  lead: string;
}[] = [
  {
    id: 'passo-01',
    n: '1',
    title: 'Vitrine — painel tático, busca e grade',
    file: 'seq-01.png',
    alt: 'Vitrine de questões: filtros, busca e assuntos em grade',
    caption: 'Figura 1 — comece na vitrine (/estudar): use busca, filtros e abra o assunto.',
    lead: 'A rota /estudar é a Vitrine de Aulas. O título "Missão: Estudo Reverso" (ou similar) e o rótulo Painel tático resumem o contexto. Os cards da vitrine de questões organizam o catálogo por assunto; a paginação leva a mais páginas de assuntos.',
  },
  {
    id: 'passo-02',
    n: '2',
    title: 'Vitrine — expandir assunto e escolher questão',
    file: 'seq-02.png',
    alt: 'Assuntos com Entrar no assunto, pendentes e Iniciar',
    caption: 'Figura 2 — com o card aberto: veja pendentes, "Entrar no assunto" e a lista com Iniciar.',
    lead: 'Cada assunto mostra quantas questões estão pendentes, o anel "N de M trabalhadas" e ações "Entrar no assunto" e, na lista, Iniciar em "Questão NN (Q-…)" para abrir o player nessa questão.',
  },
  {
    id: 'passo-03',
    n: '3',
    title: 'Meu Desempenho',
    file: 'seq-03.png',
    alt: 'Dashboard Meu desempenho: meta, sequência, totais, gráfico',
    caption: 'Figura 3 — acompanhe meta do dia, totais e atividade (7 / 15 / 30 dias).',
    lead: 'Em /analytics você vê a meta diária (ex.: 10 questões com estudo reverso concluído), dias seguidos, volume em 30 dias, total geral e o gráfico de atividade. O botão Ir à vitrine leva de volta ao catálogo.',
  },
  {
    id: 'passo-04',
    n: '4',
    title: 'Plano de Estudo Diário',
    file: 'seq-04.png',
    alt: 'Plano diário: em dia, Ir à vitrine',
    caption: 'Figura 4 — se não houver revisões hoje, a tela explica e manda retomar na vitrine.',
    lead: 'O /plano-diário traz a fila de revisão espaçada. Quando estiver "em dia", o foco é voltar a estudar conteúdo novo na vitrine para o algoritmo agendar o próximo ciclo.',
  },
  {
    id: 'passo-05',
    n: '5',
    title: 'Criar caderno',
    file: 'seq-05.png',
    alt: 'Formulário Novo caderno com nome, descrição e Criar caderno',
    caption: 'Figura 5 — defina o nome, opcionalmente a descrição, e confirme com + Criar caderno.',
    lead: 'Em /cadernos/novo, preencha o nome obrigatório e, se quiser, a descrição. Depois você adiciona questões pelo painel da vitrine (passo 10).',
  },
  {
    id: 'passo-06',
    n: '6',
    title: 'Tela de questão — alternativas e confirmar',
    file: 'seq-06.png',
    alt: 'Questão com alternativas A–E, Confirmar, navegação e progresso',
    caption: 'Figura 6 — selecione a letra, confirme; use Anterior, Próxima ou os círculos de progresso.',
    lead: 'O player mostra o enunciado, o código Q-, a banca, a posição (ex.: Questão 16 de 181). Escolha a alternativa e use Confirmar resposta. O rodapé permite voltar, avançar ou saltar por número.',
  },
  {
    id: 'passo-07',
    n: '7',
    title: 'Gabarito — ativar estudo reverso',
    file: 'seq-07.png',
    alt: 'Feedback de erro e botão Ativar estudo reverso',
    caption: 'Figura 7 — leia o diagnóstico; em seguida, Ativar estudo reverso para a sequência de slides.',
    lead: 'Após enviar, o app destaca a correta e a escolhida. Use Ativar estudo reverso para entrar no modo interativo (NEURO-LEARNING).',
  },
  {
    id: 'passo-08',
    n: '8',
    title: 'NEURO-LEARNING — primeira tela (1/4)',
    file: 'seq-08.png',
    alt: 'NEURO-LEARNING com círculos de tema, Próximo e fechar',
    caption: 'Figura 8 — interaja com os tópicos; avance com Próximo. X fecha o módulo.',
    lead: 'O modo escuro (1/4, 2/4, …) apresenta mapas, listas e destaques. Use Próximo / Voltar; o X encerra a visualização (evite se quiser concluir o bloco e registrar).',
  },
  {
    id: 'passo-09',
    n: '9',
    title: 'NEURO-LEARNING — tela final (4/4)',
    file: 'seq-09.png',
    alt: 'Última tela 4/4: erros comuns e Marcar como estudado',
    caption: 'Figura 9 — leia a síntese; finalize com Marcar como estudado (ou equivalente, ex.: estudo concluído).',
    lead: 'Na última sub-tela, confira os pontos (ex.: erros comuns) e toque em Marcar como estudado para registrar a conclusão do estudo reverso e alimentar metas e revisões.',
  },
  {
    id: 'passo-10',
    n: '10',
    title: 'Caderno — adicionar e estudar',
    file: 'seq-10.png',
    alt: 'Caderno com lista, Estudar caderno e painel Adicionar questões',
    caption: 'Figura 10 — filtre, use + no resultado, depois Estudar caderno na ordem.',
    lead: 'Com o caderno aberto, o painel Adicionar questões busca e filtra por assunto e banca; o + coloca a questão na lista. Estudar caderno inicia a sequência no contexto from=caderno.',
  },
];

export default function AjudaPage() {
  const firstSeq = hasTutorialImage('seq-01.png');
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 pb-20 md:px-6">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Guia do aluno — legendas na figura
      </div>
      <h1 className="text-balance text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Tutorial do AVANT</h1>
      <p className="mt-3 text-pretty text-base font-medium leading-relaxed text-slate-600">
        Cada print tem <strong>selos numerados</strong> sobre a imagem, apontando o local aproximado de cada ação. O texto
        abaixo de cada figura resume o passo; <InternalLink href="/estudar">abra a vitrine</InternalLink> e siga os números na ordem
        1, 2, 3…
      </p>

      {!firstSeq && (
        <Note>
          <strong>Sem imagem:</strong> se <code className="rounded bg-white/80 px-1">public/tutorial/seq-01.png</code> a{' '}
          <code className="rounded bg-white/80 px-1">seq-10.png</code> faltarem, execute o script de cópia do repositório ou peça
          suporte. Enquanto isso, o texto e o índice permanecem úteis.
        </Note>
      )}

      <Toc items={[...TOC]} />

      <div className="mt-10 space-y-0">
        {STEPS.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-10 border-t border-slate-200/80 pt-10 first:border-t-0 first:pt-0">
            <h2 className="mb-2 flex flex-wrap items-baseline gap-2 text-xl font-bold text-slate-900">
              <span className="text-indigo-600">{s.n}.</span> {s.title}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">{s.lead}</p>
            <AnnotatedShot
              file={s.file}
              alt={s.alt}
              caption={s.caption}
              priority={i === 0}
            />
          </section>
        ))}
      </div>

      <section className="mt-12 scroll-mt-10 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900">Material de apoio, texto e visitante</h3>
        <p className="text-sm text-slate-600">
          <strong>Material de apoio</strong> fica no menu lateral: explica a metodologia e o estudo reverso. Use{' '}
          <strong>Tamanho do texto</strong> (− / Padrão / +) no fim do menu. Se aparecer <strong>Visitante</strong>, faça{' '}
          <InternalLink href="/login">login</InternalLink> para registrar metas, cadernos e histórico. Figuras de referência:{' '}
          <code className="text-xs">01-landing</code>, <code className="text-xs">02-login</code> na pasta <code>public/tutorial</code>{' '}
          (opcional).
        </p>
      </section>

      <p className="mt-8 text-center text-xs text-slate-400">
        Cópia das capturas: script <code className="rounded bg-slate-100 px-1.5">scripts/copy-user-tutorial-assets.ps1</code> (mapeamento Cursor assets → <code>seq-*.png</code>).
      </p>
    </div>
  );
}
