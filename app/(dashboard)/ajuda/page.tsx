import { CheckCircle2, MousePointerClick, Sparkles } from 'lucide-react';
import { Toc, Note, InternalLink, TutorialFigure, hasTutorialImage, ActionLink } from './ajudaComponents';

export const metadata = {
  title: 'Como usar o AVANT | Tutorial rápido',
  description:
    'Tutorial claro para primeiro acesso: checklist inicial, foco único por passo, texto principal e figuras de apoio.',
};

const TOC = [
  { id: 'passo-01', label: 'Entrar pela Vitrine de Aulas' },
  { id: 'passo-02', label: 'Abrir um assunto e iniciar questão' },
  { id: 'passo-03', label: 'Responder e confirmar' },
  { id: 'passo-04', label: 'Ver o gabarito e ativar estudo reverso' },
  { id: 'passo-05', label: 'Avançar no NEURO-LEARNING' },
  { id: 'passo-06', label: 'Marcar como estudado' },
  { id: 'passo-07', label: 'Acompanhar desempenho' },
  { id: 'passo-08', label: 'Usar o plano diário' },
  { id: 'passo-09', label: 'Criar caderno' },
  { id: 'passo-10', label: 'Adicionar questões e estudar caderno' },
  { id: 'material-apoio', label: 'Passo 11 — Usar o Material de Apoio (NeuroSlides)' },
] as const;

const STEPS: {
  id: string;
  n: string;
  title: string;
  file: string;
  alt: string;
  caption: string;
  objetivo: string;
  clique: string;
  actionHref?: string;
  actionLabel?: string;
  depois: string;
}[] = [
  {
    id: 'passo-01',
    n: '1',
    title: 'Entre pela Vitrine de Aulas',
    file: 'seq-01.png',
    alt: 'Tela Vitrine de questões com menu, busca, filtros e cards de assunto',
    caption: 'Figura 1 — a vitrine é o ponto de partida: escolha um assunto ou use busca/filtros.',
    objetivo: 'Encontrar o assunto que você quer estudar.',
    clique: 'No menu lateral, clique em “Vitrine de Aulas”. Depois escolha um card de assunto, ou use a busca e os filtros do topo.',
    actionHref: '/estudar',
    actionLabel: 'Abrir Vitrine de Aulas',
    depois: 'Quando encontrar o assunto desejado, avance para o próximo passo e abra o card.',
  },
  {
    id: 'passo-02',
    n: '2',
    title: 'Abra um assunto e inicie uma questão',
    file: 'seq-02.png',
    alt: 'Card de assunto expandido com botão Entrar no assunto e lista de questões',
    caption: 'Figura 2 — depois de abrir o assunto, você pode entrar no tema ou iniciar uma questão específica.',
    objetivo: 'Abrir o player de estudo a partir de um assunto.',
    clique: 'Clique na seta do card para expandir. Em seguida, use “Entrar no assunto” ou abra a lista e clique em “Iniciar” na questão escolhida.',
    actionHref: '/estudar',
    actionLabel: 'Ir para a vitrine e escolher um assunto',
    depois: 'A plataforma abre a tela da questão, com enunciado e alternativas.',
  },
  {
    id: 'passo-03',
    n: '3',
    title: 'Responda e confirme',
    file: 'seq-06.png',
    alt: 'Questão com alternativas A–E, Confirmar, navegação e progresso',
    caption: 'Figura 3 — escolha uma alternativa; o botão “Confirmar resposta” aparece para enviar.',
    objetivo: 'Registrar sua resposta antes de ver o gabarito.',
    clique: 'Clique em uma alternativa (A, B, C, D ou E). Depois clique em “Confirmar resposta”.',
    actionHref: '/estudar',
    actionLabel: 'Escolher uma questão na vitrine',
    depois: 'O AVANT mostra se sua resposta estava certa ou errada e libera o estudo reverso.',
  },
  {
    id: 'passo-04',
    n: '4',
    title: 'Veja o gabarito e ative o estudo reverso',
    file: 'seq-07.png',
    alt: 'Feedback de erro e botão Ativar estudo reverso',
    caption: 'Figura 4 — a alternativa correta fica destacada; o botão roxo abre o estudo reverso.',
    objetivo: 'Entender o erro/acerto e começar a explicação guiada.',
    clique: 'Leia o diagnóstico. Depois clique em “Ativar estudo reverso”.',
    actionHref: '/estudar',
    actionLabel: 'Abrir uma questão para testar',
    depois: 'Você entra no modo NEURO-LEARNING, com telas explicativas em sequência.',
  },
  {
    id: 'passo-05',
    n: '5',
    title: 'Avance no NEURO-LEARNING',
    file: 'seq-08.png',
    alt: 'NEURO-LEARNING com círculos de tema, Próximo e fechar',
    caption: 'Figura 5 — leia o mapa e avance com “Próximo”. Evite fechar se quiser concluir o ciclo.',
    objetivo: 'Percorrer os slides que explicam o raciocínio da questão.',
    clique: 'Clique em “Próximo” para passar de 1/4 para 2/4, 3/4 e 4/4.',
    actionHref: '/estudar',
    actionLabel: 'Começar por uma questão',
    depois: 'Na última tela, você confirma que estudou aquele conteúdo.',
  },
  {
    id: 'passo-06',
    n: '6',
    title: 'Marque como estudado',
    file: 'seq-09.png',
    alt: 'Última tela 4/4: erros comuns e Marcar como estudado',
    caption: 'Figura 6 — no final do NEURO, clique em “Marcar como estudado”.',
    objetivo: 'Salvar a conclusão do estudo reverso no seu histórico.',
    clique: 'Clique em “Marcar como estudado” ou, quando já estiver concluído, observe o estado “Estudo concluído”.',
    actionHref: '/analytics',
    actionLabel: 'Ver Meu Desempenho após estudar',
    depois: 'Esse registro alimenta Meu Desempenho e ajuda o Plano Diário a organizar revisões.',
  },
  {
    id: 'passo-07',
    n: '7',
    title: 'Acompanhe seu desempenho',
    file: 'seq-03.png',
    alt: 'Dashboard Meu desempenho: meta, sequência, totais, gráfico',
    caption: 'Figura 7 — aqui ficam meta do dia, sequência, total estudado e atividade recente.',
    objetivo: 'Ver se você está cumprindo a rotina e quais estudos já foram concluídos.',
    clique: 'No menu lateral, clique em “Meu Desempenho”. Para voltar ao estudo, clique em “Ir à vitrine”.',
    actionHref: '/analytics',
    actionLabel: 'Abrir Meu Desempenho',
    depois: 'Use estes números como referência diária, não como tela principal de estudo.',
  },
  {
    id: 'passo-08',
    n: '8',
    title: 'Use o Plano de Estudo Diário',
    file: 'seq-04.png',
    alt: 'Plano diário: em dia, Ir à vitrine',
    caption: 'Figura 8 — se não houver revisão, o AVANT informa que você está em dia.',
    objetivo: 'Cumprir as revisões agendadas pela plataforma.',
    clique: 'No menu lateral, clique em “Plano de Estudo Diário”. Se aparecer “Você está em dia”, clique em “Ir à vitrine” para estudar novos assuntos.',
    actionHref: '/plano-diario',
    actionLabel: 'Abrir Plano Diário',
    depois: 'Quando houver questões pendentes, a tela mostrará o que revisar primeiro.',
  },
  {
    id: 'passo-09',
    n: '9',
    title: 'Crie um caderno de estudo',
    file: 'seq-05.png',
    alt: 'Formulário Novo caderno com nome, descrição e Criar caderno',
    caption: 'Figura 9 — dê um nome ao caderno e confirme com “+ Criar caderno”.',
    objetivo: 'Organizar questões por prova, tema ou estratégia.',
    clique: 'No menu, entre em “Cadernos de Estudo”. Na criação, preencha “Nome” e clique em “+ Criar caderno”. A descrição é opcional.',
    actionHref: '/cadernos/novo',
    actionLabel: 'Criar novo caderno',
    depois: 'Depois de criado, você pode adicionar questões e estudar tudo em sequência.',
  },
  {
    id: 'passo-10',
    n: '10',
    title: 'Adicione questões e estude o caderno',
    file: 'seq-10.png',
    alt: 'Caderno com lista, Estudar caderno e painel Adicionar questões',
    caption: 'Figura 10 — filtre no painel da direita, use “+” para adicionar e “Estudar caderno” para começar.',
    objetivo: 'Transformar o caderno numa lista de estudo personalizada.',
    clique: 'No painel “Adicionar questões”, use busca/filtros e clique no “+” da questão. Depois clique em “Estudar caderno”.',
    actionHref: '/cadernos',
    actionLabel: 'Abrir Cadernos de Estudo',
    depois: 'O player abre respeitando a ordem do caderno.',
  },
];

const QUICK_START = [
  'Entre na Vitrine de Aulas.',
  'Abra um assunto e inicie uma questão.',
  'Responda, confirme e ative o estudo reverso.',
  'Passe pelos slides NEURO e marque como estudado.',
  'Depois acompanhe o desempenho ou organize questões em cadernos.',
  'Quando quiser revisar por tema, abra o Material de Apoio (NeuroSlides).',
] as const;

export default function AjudaPage() {
  const firstSeq = hasTutorialImage('seq-01.png');
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 pb-20 md:px-6">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Guia do aluno — início rápido
      </div>
      <h1 className="text-balance text-2xl font-black tracking-tight text-slate-900 md:text-4xl">Como usar o AVANT</h1>
      <p className="mt-3 text-pretty text-base font-medium leading-relaxed text-slate-600">
        Este tutorial foi pensado para quem acabou de chegar. Cada etapa tem <strong>um único foco</strong>: primeiro o que fazer,
        depois onde clicar, e por fim uma imagem limpa para confirmar visualmente.
      </p>

      {!firstSeq && (
        <Note>
          <strong>Sem imagem:</strong> se <code className="rounded bg-white/80 px-1">public/tutorial/seq-01.png</code> a{' '}
          <code className="rounded bg-white/80 px-1">seq-10.png</code> faltarem, execute o script de cópia do repositório ou peça
          suporte. Enquanto isso, o texto e o índice permanecem úteis.
        </Note>
      )}

      <section className="mt-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/70 p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
          Primeiro acesso: faça nesta ordem
        </h2>
        <ol className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-5">
          {QUICK_START.map((item, index) => (
            <li key={item} className="rounded-2xl bg-white/85 p-3 shadow-sm ring-1 ring-slate-200/70">
              <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                {index + 1}
              </span>
              <span className="font-semibold leading-snug">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <Toc items={[...TOC]} />

      <div className="mt-10 space-y-12">
        {STEPS.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.35fr] lg:items-start">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Passo {s.n}</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 md:text-2xl">{s.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
                  <p>
                    <strong className="text-slate-900">Objetivo:</strong> {s.objetivo}
                  </p>
                  <div className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/70 p-4">
                    <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-700">
                      <MousePointerClick className="h-4 w-4" aria-hidden />
                      Onde clicar
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">{s.clique}</p>
                    {s.actionHref && s.actionLabel ? (
                      <ActionLink href={s.actionHref}>{s.actionLabel}</ActionLink>
                    ) : null}
                  </div>
                  <p>
                    <strong className="text-slate-900">Depois disso:</strong> {s.depois}
                  </p>
                </div>
              </div>
              <TutorialFigure file={s.file} alt={s.alt} caption={s.caption} priority={i === 0} />
            </div>
          </section>
        ))}
      </div>

      <section id="material-apoio" className="mt-12 scroll-mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Passo 11</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 md:text-2xl">
          Como usar o Material de Apoio (NeuroSlides)
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
          <p>
            <strong className="text-slate-900">Objetivo:</strong> revisar conteúdos por tema, com foco visual, fora do fluxo de uma questão
            específica.
          </p>

          <div className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/70 p-4">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-700">
              <MousePointerClick className="h-4 w-4" aria-hidden />
              Onde clicar
            </p>
            <ol className="mt-2 list-decimal space-y-2 pl-5 font-semibold text-slate-900">
              <li>No menu lateral, clique em <strong>Material de Apoio</strong>.</li>
              <li>Na tela inicial, clique em <strong>Abrir NeuroSlide</strong>.</li>
              <li>Escolha uma coleção (Fundamentos, Medicações, SUS, etc.) e clique em <strong>Abrir</strong>.</li>
              <li>No modal, navegue pelos slides com os botões na parte inferior (voltar/avançar), pelas bolinhas ou pelo teclado (← / →).</li>
              <li>Para trocar de coleção sem sair, use o seletor no canto superior esquerdo.</li>
            </ol>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionLink href="/material">Abrir Material de Apoio</ActionLink>
              <ActionLink href="/material/neuroslides">Ir direto para coleções NeuroSlide</ActionLink>
            </div>
          </div>

          <p>
            <strong className="text-slate-900">Depois disso:</strong> use os NeuroSlides como revisão rápida antes de simulados e, em seguida,
            volte para a <InternalLink href="/estudar">Vitrine de Aulas</InternalLink> para consolidar com questões.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <TutorialFigure
            file="material-apoio-01-entrada.png"
            alt="Tela de entrada do Material de Apoio com botão Abrir NeuroSlide"
            caption="Figura A — entrada do Material de Apoio com CTA para abrir NeuroSlides."
          />
          <TutorialFigure
            file="material-apoio-02-colecoes.png"
            alt="Página de coleções NeuroSlide com cards por tema"
            caption="Figura B — seleção de coleções NeuroSlide por tema."
          />
          <TutorialFigure
            file="material-apoio-03-player.png"
            alt="Modal player de NeuroSlides com navegação e seletor de coleção"
            caption="Figura C — player em tela cheia, com navegação por slides e troca de coleção."
          />
        </div>
      </section>

    </div>
  );
}
