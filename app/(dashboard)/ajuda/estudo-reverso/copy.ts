export const HERO = {
  eyebrow: 'Método AVANT Enf',
  title: 'Estudo Reverso: aprenda pela questão, não para a questão',
  subtitle:
    'Uma das formas mais eficientes para concursos: o AVANT Enf transforma cada questão em uma aula completa, com diagnóstico, explicação guiada, fixação e revisão.',
  ctaPrimary: { label: 'Começar meu primeiro Estudo Reverso', href: '/estudar' },
  ctaSecondary: { label: 'Ver tutorial completo', href: '/ajuda' },
} as const;

export const TOC = [
  { id: 'problema', label: 'O problema do estudo tradicional' },
  { id: 'definicao', label: 'O que é Estudo Reverso' },
  { id: 'ciclo', label: 'Ciclo AVANT Enf de Aprovação' },
  { id: 'comparativo', label: 'Tradicional vs Reverso' },
  { id: 'neurociencia', label: 'Por que funciona (neurociência)' },
  { id: 'passo-a-passo', label: 'Como aplicar no AVANT Enf' },
  { id: 'faq', label: 'Perguntas frequentes' },
] as const;

export const PROBLEMA = {
  titulo: 'O problema do estudo tradicional',
  paragrafo:
    'Muitos concurseiros leem muita teoria e travam na primeira questão. O estudo tradicional costuma adiar a prática e, com isso, também adia a descoberta das próprias lacunas.',
  sintomas: [
    'Decora o conteúdo, mas não consegue aplicar.',
    'Demora semanas até começar a resolver questões.',
    'Descobre tarde quais pontos a banca realmente cobra.',
  ],
} as const;

export const DEFINICAO = {
  titulo: 'O que é Estudo Reverso',
  resumo:
    'Você começa pela questão, tenta resolver, recebe feedback, entende o conceito exato envolvido e revisa antes de esquecer.',
  fluxo: ['Questão', 'Tentativa', 'Feedback', 'Conceito', 'Revisão'],
} as const;

export const CICLO = {
  titulo: 'Ciclo AVANT Enf de Aprovação',
  intro: 'Quatro etapas que se repetem a cada questão. Quanto mais ciclos, mais consolidado o conteúdo fica.',
  etapas: [
    {
      n: '1',
      nome: 'Diagnosticar',
      desc: 'A questão revela o que você sabe e o que precisa aprender.',
      noAvant: 'No player, ao confirmar a alternativa, você recebe um diagnóstico imediato.',
    },
    {
      n: '2',
      nome: 'Entender',
      desc: 'A explicação corrige o erro e mostra o raciocínio correto.',
      noAvant: 'O botão "Ativar estudo reverso" abre os 4 slides do NEURO-LEARNING.',
    },
    {
      n: '3',
      nome: 'Fixar',
      desc: 'Os slides organizam o conhecimento em mapa, regra, fluxo e zona de perigo.',
      noAvant: 'Concept map, golden rule, logic flow e danger zone aparecem como uma trilha guiada.',
    },
    {
      n: '4',
      nome: 'Revisar',
      desc: 'A repetição espaçada traz o conteúdo de volta antes que ele se perca.',
      noAvant: 'O Plano diário organiza as revisões pendentes para você.',
    },
  ],
} as const;

export const COMPARATIVO = {
  titulo: 'Tradicional vs Reverso',
  tradicional: {
    rotulo: 'Estudo tradicional',
    linhaDoTempo: [
      'Lê teoria do começo ao fim.',
      'Tenta memorizar conceitos isolados.',
      'Resolve questões só quando se sente pronto.',
      'Descobre tarde os pontos fracos.',
    ],
  },
  reverso: {
    rotulo: 'Estudo Reverso',
    linhaDoTempo: [
      'Resolve a questão antes de revisar a teoria.',
      'Identifica a lacuna exata pela alternativa errada.',
      'Estuda o conceito necessário com explicação guiada.',
      'Revisa no momento certo para consolidar.',
    ],
  },
} as const;

export const PILARES = {
  titulo: 'Por que funciona: 5 pilares de neurociência aplicada',
  itens: [
    {
      nome: 'Active recall',
      desc: 'Tentar lembrar antes de reler ativa a memória e fortalece o traço da informação.',
      noAvant: 'Você responde antes de ver o gabarito.',
      fonte: 'Roediger & Karpicke (2006)',
    },
    {
      nome: 'Feedback imediato',
      desc: 'Saber rapidamente se acertou ou errou ajuda a corrigir a rota antes que o erro vire hábito.',
      noAvant: 'O diagnóstico aparece logo após confirmar a resposta.',
      fonte: 'Hattie & Timperley (2007)',
    },
    {
      nome: 'Aprendizagem com erro',
      desc: 'Errar com explicação tende a melhorar a retenção mais do que ler sem testar.',
      noAvant: 'O estudo reverso ganha força depois da tentativa.',
      fonte: 'Metcalfe (2017)',
    },
    {
      nome: 'Contextualização',
      desc: 'Aprender no formato em que o conteúdo será cobrado facilita a transferência para a prova.',
      noAvant: 'Você estuda dentro de questões de banca, não em parágrafos genéricos.',
      fonte: 'Brown, Collins & Duguid (1989)',
    },
    {
      nome: 'Repetição espaçada',
      desc: 'Revisar em intervalos planejados ajuda a fixar o conteúdo na memória de longo prazo.',
      noAvant: 'O Plano diário organiza revisões em intervalos crescentes.',
      fonte: 'Cepeda et al. (2008)',
    },
  ],
} as const;

export const PASSO_A_PASSO = {
  titulo: 'Como aplicar o método no AVANT Enf',
  passos: [
    'Escolha um assunto na Vitrine.',
    'Tente responder a questão antes de ver o gabarito.',
    'Confirme e leia o diagnóstico.',
    'Ative o estudo reverso e percorra os 4 slides.',
    'Marque como estudado e siga o Plano diário para revisar.',
  ],
} as const;

export const FAQ = [
  {
    q: 'Funciona para quem está começando do zero?',
    a: 'Sim. O método não exige conhecimento prévio completo: a explicação aparece no contexto da questão. Para iniciantes, isso ajuda a perceber mais cedo como a banca cobra cada tema.',
  },
  {
    q: 'Preciso ler teoria antes?',
    a: 'Não obrigatoriamente. A teoria entra no momento certo, dentro do estudo reverso. Você pode complementar com material externo se quiser aprofundar, mas não precisa esperar "estar pronto" para praticar.',
  },
  {
    q: 'E se eu errar muito no começo?',
    a: 'Errar faz parte do processo. O erro indica onde focar, e a explicação guiada transforma esse erro em uma oportunidade concreta de aprendizado.',
  },
  {
    q: 'Quanto tempo até ver resultado?',
    a: 'Cada aluno tem ritmo próprio. O que pesquisas em educação mostram é que prática ativa, feedback e revisão espaçada tendem a melhorar a retenção com uso consistente.',
  },
] as const;

export const FONTES = [
  'Brown, J. S., Collins, A., & Duguid, P. (1989). Situated Cognition and the Culture of Learning.',
  'Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in learning.',
  'Hattie, J., & Timperley, H. (2007). The Power of Feedback.',
  'Metcalfe, J. (2017). Learning from Errors.',
  'Roediger, H. L., & Karpicke, J. D. (2006). Test-Enhanced Learning.',
] as const;

export const CTA_FINAL = {
  titulo: 'Pronto para o primeiro Estudo Reverso?',
  subtitulo: 'Em poucos minutos você diagnostica, entende, fixa e já encaminha sua próxima revisão.',
  primary: { label: 'Começar agora', href: '/estudar' },
  secondary: { label: 'Voltar ao tutorial', href: '/ajuda' },
} as const;
