export type ReverseStudyMicrotipKey =
  | 'answer-before-feedback'
  | 'feedback-learning'
  | 'option-elimination'
  | 'reverse-study-intro'
  | 'dots-meaning'
  | 'concept-map'
  | 'golden-rule'
  | 'logic-flow'
  | 'danger-zone'
  | 'study-completed';

export type ReverseStudyMicrotip = {
  title: string;
  body: string;
  tone?: 'indigo' | 'emerald' | 'amber';
  learnMoreHref?: string;
};

export const REVERSE_STUDY_MICROTIPS: Record<ReverseStudyMicrotipKey, ReverseStudyMicrotip> = {
  'answer-before-feedback': {
    title: 'Dica do método',
    body: 'Tente responder antes de ver o gabarito. Esse esforço ativa sua memória e torna o estudo mais ativo.',
    tone: 'indigo',
    learnMoreHref: '/ajuda/estudo-reverso',
  },
  'feedback-learning': {
    title: 'Feedback que ensina',
    body: 'Agora o gabarito corrige sua rota: acerto confirma o raciocínio; erro mostra onde estudar.',
    tone: 'emerald',
    learnMoreHref: '/ajuda/estudo-reverso',
  },
  'option-elimination': {
    title: 'Elimine o que não serve',
    body: 'Use a tesoura ou a tecla E para riscar alternativas improváveis — como nas grandes plataformas de questões.',
    tone: 'indigo',
  },
  'reverse-study-intro': {
    title: 'Cada questão vira uma mini aula',
    body: 'O Estudo Reverso organiza o conceito, a regra, a lógica da resposta e as pegadinhas da banca.',
    tone: 'indigo',
  },
  'dots-meaning': {
    title: 'O que significa o verde?',
    body: 'O ponto verde indica que você concluiu o estudo reverso da questão — isso é independente de ter acertado ou errado no gabarito.',
    tone: 'emerald',
    learnMoreHref: '/ajuda/estudo-reverso',
  },
  'concept-map': {
    title: 'Mapa conceitual',
    body: 'Este slide organiza as ideias principais para você enxergar o tema como um conjunto.',
    tone: 'indigo',
  },
  'golden-rule': {
    title: 'Regra de ouro',
    body: 'Aqui fica o ponto essencial que você precisa levar para questões parecidas.',
    tone: 'amber',
  },
  'logic-flow': {
    title: 'Fluxo lógico',
    body: 'Toque no passo em destaque (anel violeta) para revelar o próximo — ou use o botão abaixo. Siga na ordem até ver todo o raciocínio.',
    tone: 'emerald',
  },
  'danger-zone': {
    title: 'Zona de perigo',
    body: 'Atenção às pegadinhas: este slide mostra onde a banca costuma confundir o aluno.',
    tone: 'amber',
  },
  'study-completed': {
    title: 'Conclusão que vira histórico',
    body: 'Ao marcar como estudado, você registra o ciclo e facilita o acompanhamento das próximas revisões.',
    tone: 'emerald',
    learnMoreHref: '/ajuda/estudo-reverso',
  },
};

export function getReverseStudySlideMicrotipKey(type?: string | null): ReverseStudyMicrotipKey | null {
  switch (type) {
    case 'concept_map':
      return 'concept-map';
    case 'golden_rule':
      return 'golden-rule';
    case 'logic_flow':
      return 'logic-flow';
    case 'danger_zone':
      return 'danger-zone';
    default:
      return null;
  }
}
