import { CheckCircle2, MessageCircle, MousePointerClick, Sparkles } from 'lucide-react';
import { WhatsAppSupportLink } from '@/components/support/WhatsAppSupportLink';
import { formatWhatsAppDisplay } from '@/lib/whatsapp';
import {
  AJUDA_SURFACE,
  ONDE_CLICAR,
  ActionLink,
  InternalLink,
  Note,
  Toc,
  TutorialFigure,
  TutorialVideo,
  hasTutorialImage,
} from './ajudaComponents';

export const metadata = {
  title: 'Como usar o AVANT | Tutorial rápido',
  description:
    'Tutorial claro para primeiro acesso: checklist inicial, foco único por passo, texto principal e figuras de apoio.',
  alternates: {
    canonical: '/ajuda',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Como usar o AVANT | Tutorial rápido',
    description:
      'Tutorial claro para começar no AVANT: escolha uma questão, veja o diagnóstico e avance no estudo reverso.',
  },
};

const TOC = [
  { id: 'passo-01', label: 'Entrar pela Vitrine' },
  { id: 'passo-02', label: 'Abrir um assunto e iniciar questão' },
  { id: 'passo-03', label: 'Responder e confirmar' },
  { id: 'passo-04', label: 'Ver o gabarito e ativar estudo reverso' },
  { id: 'passo-05', label: 'Avançar no NEURO-LEARNING' },
  { id: 'passo-06', label: 'Marcar como estudado' },
  { id: 'passo-07', label: 'Acompanhar Progresso' },
  { id: 'passo-08', label: 'Usar o Plano diário' },
  { id: 'passo-09', label: 'Criar caderno' },
  { id: 'passo-10', label: 'Adicionar questões e estudar caderno' },
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
    title: 'Entre pela Vitrine',
    file: 'seq-01.png',
    alt: 'Tela Vitrine de questões com menu, busca, filtros e cards de assunto',
    caption: 'Figura 1 — a vitrine é o ponto de partida: escolha um assunto ou use busca/filtros.',
    objetivo: 'Encontrar o assunto que você quer estudar.',
    clique: 'No menu lateral, clique em “Vitrine”. Depois escolha um card de assunto, ou use a busca e os filtros do topo.',
    actionHref: '/estudar',
    actionLabel: 'Abrir Vitrine',
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
    actionHref: '/progresso',
    actionLabel: 'Ver Progresso após estudar',
    depois: 'Esse registro alimenta o Progresso e ajuda o Plano diário a organizar revisões.',
  },
  {
    id: 'passo-07',
    n: '7',
    title: 'Acompanhe seu Progresso',
    file: 'seq-03.png',
    alt: 'Dashboard Progresso de estudo: meta, sequência, totais, gráfico',
    caption: 'Figura 7 — aqui ficam meta do dia, sequência, total estudado e atividade recente.',
    objetivo: 'Ver se você está cumprindo a rotina e quais estudos já foram concluídos.',
    clique: 'No menu lateral, clique em “Progresso”. Para voltar ao estudo, use “Voltar para a Vitrine” no topo da página.',
    actionHref: '/progresso',
    actionLabel: 'Abrir Progresso',
    depois: 'Use estes números como referência diária e, para simulados, abra Desempenho.',
  },
  {
    id: 'passo-08',
    n: '8',
    title: 'Use o Plano diário',
    file: 'seq-04.png',
    alt: 'Plano diário: em dia, link para a vitrine no topo',
    caption: 'Figura 8 — se não houver revisão, o AVANT informa que você está em dia.',
    objetivo: 'Cumprir as revisões agendadas pela plataforma.',
    clique: 'No menu lateral, clique em “Plano diário”. Se aparecer “Você está em dia”, use “Voltar para a Vitrine” no topo para estudar novos assuntos.',
    actionHref: '/plano-diario',
    actionLabel: 'Abrir Plano diário',
    depois: 'Quando houver questões pendentes, a tela mostrará o que revisar primeiro.',
  },
  {
    id: 'passo-09',
    n: '9',
    title: 'Crie um caderno de estudo',
    file: 'seq-05.png',
    alt: 'Página Cadernos de Estudo com lista de cadernos, estatísticas e botão Novo caderno',
    caption: 'Figura 9 — na área de cadernos você vê seus blocos de estudo; use “+ Novo caderno” para criar outro.',
    objetivo: 'Organizar questões por prova, tema ou estratégia.',
    clique: 'No menu, entre em “Cadernos”. Para criar, clique em “+ Novo caderno”, preencha o nome (descrição é opcional) e confirme a criação.',
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
    actionLabel: 'Abrir Cadernos',
    depois: 'O player abre respeitando a ordem do caderno.',
  },
];

const QUICK_START = [
  'Entre na Vitrine.',
  'Abra um assunto e inicie uma questão.',
  'Responda, confirme e ative o estudo reverso.',
  'Passe pelos slides NEURO e marque como estudado.',
  'Depois acompanhe o Progresso ou organize questões em cadernos.',
] as const;

export default function AjudaPage() {
  const firstSeq = hasTutorialImage('seq-01.png');
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 pb-6 md:px-6">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
        <Sparkles className="h-3.5 w-3.5 text-[#166534]" aria-hidden />
        Guia do aluno — início rápido
      </div>
      <h1 className="text-balance text-2xl font-black tracking-tight text-slate-900 md:text-4xl">Como usar o AVANT</h1>
      <p className="mt-3 text-pretty text-base font-medium leading-relaxed text-slate-600">
        Este tutorial foi pensado para quem acabou de chegar. Cada etapa tem <strong className="text-slate-900">um único foco</strong>:
        primeiro o que fazer,
        depois onde clicar, e por fim uma imagem limpa para confirmar visualmente.
      </p>

      <section className={`mt-6 p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
        <h2 className="text-base font-black text-slate-900">Assista o tutorial em vídeo (MP4)</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Se você preferir ver tudo em 2–3 minutos, este vídeo mostra o fluxo completo (vitrine → questão → estudo reverso → desempenho).
        </p>
        <div className="mt-4">
          <TutorialVideo file="tutorial-avant.mp4" title="Como usar o AVANT — tutorial rápido" poster="seq-01.png" />
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Arquivo esperado em <code>public/tutorial/tutorial-avant.mp4</code>.
        </p>
      </section>

      {!firstSeq && (
        <Note>
          <strong>Sem imagem:</strong> se os PNGs em <code>public/tutorial/</code> (seq-01 a seq-10) faltarem,
          execute o script de cópia do repositório ou peça suporte. Enquanto isso, o texto e o índice permanecem úteis.
        </Note>
      )}

      <section className={`mt-6 p-5 shadow-sm ${AJUDA_SURFACE}`}>
        <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
          Primeiro acesso: faça nesta ordem
        </h2>
        <ol className="mt-4 grid gap-3 text-sm text-slate-800 md:grid-cols-5">
          {QUICK_START.map((item, index) => (
            <li key={item} className="card-elevated p-3">
              <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#166534] text-xs font-black text-white">
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
            className={`scroll-mt-10 p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}
          >
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.35fr] lg:items-start">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#166534]">Passo {s.n}</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 md:text-2xl">{s.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
                  <p>
                    <strong className="text-slate-900">Objetivo:</strong> {s.objetivo}
                  </p>
                  <div className={`border-2 p-4 ${ONDE_CLICAR}`}>
                    <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#166534]">
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

      <section className={`mt-12 p-5 shadow-sm md:p-6 ${AJUDA_SURFACE}`}>
        <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
          <MessageCircle className="h-5 w-5 text-[#25D366]" aria-hidden />
          Ainda com dúvida?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
          Se algo não ficou claro no tutorial, fale com a gente no WhatsApp ({formatWhatsAppDisplay()}).
          Respondemos o mais rápido possível em horário comercial.
        </p>
        <div className="mt-4">
          <WhatsAppSupportLink className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 text-sm font-black text-white shadow-sm shadow-emerald-900/30 transition-colors hover:bg-[#20bd5a] hover:text-white">
            Abrir WhatsApp
          </WhatsAppSupportLink>
        </div>
      </section>

    </div>
  );
}
