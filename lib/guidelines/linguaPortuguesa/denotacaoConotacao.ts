import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Denotação, conotação e figuras de linguagem — regras portáteis para concursos.
 * Card vitrine: "Denotação, conotação e figuras de linguagem". Ramo L3: pt_denotacao_conotacao.
 */
export const PT_DENOTACAO_CONOTACAO: GuidelineTable = {
  id: 'pt-denotacao-conotacao-concursos',
  snapshot: 'Semântica — sentido literal, figurado e figuras de linguagem',
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Denotação, conotação e figuras de linguagem',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'den-pergunta-teste',
      label: 'Pergunta-teste',
      value: 'Sentido literal ou figurado? Qual figura está em jogo?',
      detail: 'Denotação = dicionário · Conotação = carga subjetiva/social do termo.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-denotacao',
      label: 'Denotação',
      value: 'sentido literal, objetivo da palavra',
      detail: '«Cão» = animal — uso neutro, enciclopédico.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-conotacao',
      label: 'Conotação',
      value: 'sentido figurado, subjetivo, emotivo',
      detail: '«Cão» = pessoa desprezível — valor afetivo ou social.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-metafora',
      label: 'Metáfora',
      value: 'substituição por semelhança — sem «como»',
      detail: '«O tempo **voa**» — verbo de ação aplicado a tempo.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-comparacao',
      label: 'Comparação',
      value: 'aproximação com conectivo (como, tal qual, que)',
      detail: '«Forte **como** um touro» — presença explícita do comparativo.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-personificacao',
      label: 'Personificação / prosopopeia',
      value: 'atribui ação humana a ser inanimado ou abstrato',
      detail: '«A morte **bateu** à porta» — subtipo de metáfora.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-metonimia',
      label: 'Metonímia',
      value: 'troca por contiguidade (parte pelo todo, autor pela obra)',
      detail: '«Ler **Machado**» (autor pela obra) · «**Brasil** venceu» (país pelo time).',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-sinestesia',
      label: 'Sinestesia',
      value: 'mistura de sensações de campos diferentes',
      detail: '«Voz **doce**» · «Cor **quente**».',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-hipérbole',
      label: 'Hipérbole',
      value: 'exagero intencional',
      detail: '«Esperei **séculos**» — intensificação figurada.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-ironía',
      label: 'Ironia',
      value: 'dizer o oposto do que se pensa',
      detail: 'Tom do autor e contexto — sentido literal ≠ sentido pretendido.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-pleonasmo',
      label: 'Pleonasmo',
      value: 'redundância intencional (ênfase) ou viciosa (erro)',
      detail: '«Subir **para cima**» — vicioso × «Eu vi com **meus próprios olhos**» — enfático.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
    {
      id: 'den-pegadinha-figura',
      label: 'Pegadinha — metáfora × comparação',
      value: 'presença de «como/que/tal qual» indica comparação',
      detail: 'Sem conectivo comparativo → tende a metáfora.',
      sourceId: 'pt-denotacao-conotacao-concursos',
    },
  ],
};
