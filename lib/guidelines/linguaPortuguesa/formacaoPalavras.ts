import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Formação de palavras — regras portáteis (subset de Classes de palavras / M15).
 * Usado em questões de derivação, composição e processos de formação.
 */
export const PT_FORMACAO_PALAVRAS: GuidelineTable = {
  id: 'pt-formacao-palavras-concursos',
  snapshot: 'Formação de palavras — derivação, composição, prefixo e sufixo',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Formação de palavras',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'form-pergunta-teste',
      label: 'Pergunta-teste (M15)',
      value: 'Qual processo formou a palavra? Quantos radicais?',
      detail: 'Derivação = um radical + afixo · Composição = dois ou mais radicais.',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-derivacao-prefixal',
      label: 'Derivação prefixal',
      value: 'prefixo + radical',
      detail: '«Re-escrever» · «In-útil» — prefixo modifica sentido.',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-derivacao-sufixal',
      label: 'Derivação sufixal',
      value: 'radical + sufixo',
      detail: '«Cidade**zinha**» · «Enferm**agem**» — sufixo cria nova palavra.',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-derivacao-parassintetica',
      label: 'Derivação parassintética',
      value: 'prefixo e sufixo simultâneos — radical isolado não existe',
      detail: '«**En**tristec**er**» — não se usa «tristecer» nem «entriste» sozinhos com o mesmo sentido.',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-composicao',
      label: 'Composição',
      value: 'dois ou mais radicais',
      detail: '«Guarda-chuva» · «Bem-estar» — processo de junção lexical.',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-justaposicao',
      label: 'Justaposição',
      value: 'radicais sem alteração fonética',
      detail: '«Pé-de-moleque» · «Bem-te-vi» — elementos mantêm forma plena.',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-aglutinacao',
      label: 'Aglutinação',
      value: 'radicais com perda ou fusão fonética',
      detail: '«Planalto» (plano + alto) · «Aguardente».',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-hibridismo',
      label: 'Hibridismo',
      value: 'elementos de línguas diferentes',
      detail: '«Automóvel» (grego + latim) — comum em termos técnicos.',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-sigla',
      label: 'Sigla e abreviatura',
      value: 'redução de expressão — leitura por letras ou como palavra',
      detail: '«CTI» · «Unidade de Terapia Intensiva (UTI)» — grafia e plural de siglas (AO1990).',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-pegadinha-derivacao-composicao',
      label: 'Pegadinha — derivação × composição',
      value: 'contar radicais independentes',
      detail: 'Um radical + afixo = derivação · Dois radicais = composição.',
      sourceId: 'pt-formacao-palavras-concursos',
    },
    {
      id: 'form-pegadinha-hifen',
      label: 'Pegadinha — hífen em compostos',
      value: 'AO1990 simplificou — conferir composto estabelecido',
      detail: '«Guarda-chuva» mantém hífen · muitos compostos perderam (ex.: «paraquedas»).',
      sourceId: 'pt-formacao-palavras-concursos',
    },
  ],
};
