import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Concordância verbal e nominal — regras portáteis para concursos.
 * Card vitrine: "Concordância verbal e nominal". Ramo L3: pt_concordancia.
 * Pergunta-teste (M13): Núcleo do sujeito concordante?
 */
export const PT_CONCORDANCIA: GuidelineTable = {
  id: 'pt-concordancia-concursos',
  snapshot: 'Concordância — núcleo do sujeito + casos atípicos de prova',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Concordância verbal e nominal',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'conc-pergunta-teste',
      label: 'Pergunta-teste (M13)',
      value: 'Qual é o núcleo do sujeito? O verbo concorda com ele?',
      detail: 'Localizar núcleo antes de julgar singular/plural — sujeito atrás do verbo é pegadinha clássica.',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-verbal-regra',
      label: 'Concordância verbal',
      value: 'verbo concorda em número e pessoa com o núcleo do sujeito',
      detail: 'Sujeito simples: «O enfermeiro chegou». Composto: regra do mais próximo ou do plural (conforme caso).',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-nominal-regra',
      label: 'Concordância nominal',
      value: 'adjunto, artigo, pronome e verbo de ligação concordam com o núcleo do nome',
      detail: '«Pacientes cansados» — adjetivo no plural com núcleo plural.',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-sujeito-posposto',
      label: 'Sujeito posposto',
      value: 'concorda com o núcleo atrás, não com o vizinho do verbo',
      detail: '«Chegaram os profissionais de saúde» — plural com «profissionais», não com «saúde».',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-sujeito-composto',
      label: 'Sujeito composto',
      value: 'plural em geral; exceções com «nem», «ou», núcleos partitivos',
      detail: '«João e Maria estudaram». «Nem um nem outro **foi**» — singular por proximidade (banca varia).',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-coletivo',
      label: 'Núcleo coletivo',
      value: 'singular se unidade; plural se os integrantes em evidência',
      detail: '«A maioria dos pacientes **chegou**» × «A maioria **estavam** agitados» — provar na frase.',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-partitivo',
      label: 'Expressões partitivas',
      value: 'maioria, metade, parte, um dos que…',
      detail: '«Um dos enfermeiros que **plantou**» — relativa concorda com antecedente de «que».',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-porcentagem',
      label: 'Porcentagem',
      value: 'concorda com o termo de que se trata a porcentagem',
      detail: '«50% dos alunos **fizeram**» — plural com «alunos». Banca pode cobrar singular com «porcentagem» como núcleo.',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-haver-impessoal',
      label: 'Haver impessoal',
      value: 'haver existencial = singular (há / havia)',
      detail: '«Havia problemas» ✗ em norma culta → «Havia problema» ou «Existiam problemas».',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-sujeito-oracional',
      label: 'Sujeito oracional',
      value: 'oração substantiva sujeito → verbo no singular (em geral)',
      detail: '«Fazer exercícios **é** importante» · «**São** necessários exames» — banca cobra o núcleo oracional.',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-pronome-relativo',
      label: 'Pronome relativo',
      value: 'verbo da oração relativa concorda com o antecedente de que/ quem',
      detail: '«Eu, que **sou** técnico…» — «sou» com «eu», não com nome anterior.',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-ideologica-gramatical',
      label: 'Concordância ideológica × gramatical',
      value: '«a gente» → 3ª pessoa; «você» → 3ª pessoa',
      detail: '«A gente **vamos**» ✗ → «A gente **vai**». Pegadinha de fala × norma escrita.',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-meio-adverbio-numeral',
      label: 'Meio (advérbio × numeral)',
      value: 'meio + adjetivo = advérbio (invariável); meio + substantivo = numeral (varia)',
      detail: '«Meio cansado» × «meia hora» — função na frase decide a concordância.',
      sourceId: 'pt-concordancia-concursos',
    },
    {
      id: 'conc-pegadinha-vizinho',
      label: 'Pegadinha — vizinho do verbo',
      value: 'não concordar com o termo imediatamente após o verbo',
      detail: 'Sujeito deslocado: achar o núcleo completo antes de marcar singular/plural.',
      sourceId: 'pt-concordancia-concursos',
    },
  ],
};
