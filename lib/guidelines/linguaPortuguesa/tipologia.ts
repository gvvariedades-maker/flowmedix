import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Tipologia e gêneros textuais — regras portáteis para concursos.
 * Card vitrine: "Tipologia e gêneros textuais". Ramo L3: pt_tipologia.
 */
export const PT_TIPOLOGIA: GuidelineTable = {
  id: 'pt-tipologia-concursos',
  snapshot: 'Tipologia — função do texto, gênero e estrutura discursiva',
  issuer: 'Norma culta + didática de gêneros (Cunha & Cintra; Bechara)',
  title: 'Tipologia e gêneros textuais',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'tipo-pergunta-teste',
      label: 'Pergunta-teste',
      value: 'Qual a função do texto? Qual o gênero? Quem fala a quem?',
      detail: 'Tipologia = tipo textual (narração, descrição…) × gênero = forma social (notícia, receita…).',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-narracao',
      label: 'Narração',
      value: 'sequência de ações no tempo — verbos de ação predominam',
      detail: 'Conto, romance, crônica, notícia factual — «o que aconteceu?».',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-descricao',
      label: 'Descrição',
      value: 'caracteriza seres, objetos, cenários — adjetivos e locuções',
      detail: 'Retrato, catálogo, laudo parcial — «como é?».',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-dissertacao',
      label: 'Dissertação',
      value: 'defende ponto de vista com argumentos',
      detail: 'Artigo de opinião, editorial, redação dissertativa — tese + argumentos + conclusão.',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-injuncao',
      label: 'Injunção',
      value: 'orienta o leitor a fazer algo — imperativo',
      detail: 'Receita, bula, manual, norma — verbos no imperativo ou infinitivo injuntivo.',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-hibrido',
      label: 'Texto híbrido',
      value: 'mistura tipos em um mesmo gênero',
      detail: 'Notícia pode narrar + descrever. Classificar pelo **predominante** ou pelo foco da questão.',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-genero-noticia',
      label: 'Gênero — notícia',
      value: 'lider, corpo, título; fatos verificáveis; impessoalidade relativa',
      detail: 'Pirâmide invertida — o mais importante primeiro.',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-genero-receita',
      label: 'Gênero — receita/instrução',
      value: 'lista ordenada de passos; injunção',
      detail: 'Sequência temporal ou lógica — «primeiro», «em seguida», «por fim».',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-intertextualidade',
      label: 'Intertextualidade',
      value: 'referência a outro texto, citação, paródia',
      detail: 'Aspas, epígrafe, menção explícita — função pode ser reforço ou crítica.',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-interpretacao',
      label: 'Interpretação × tipologia',
      value: 'questão de leitura: voltar ao trecho; não extrapolar',
      detail: '«Texto não diz = não marca» — separar fato do texto × opinião do candidato.',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-pegadinha-genero',
      label: 'Pegadinha — gênero × suporte',
      value: 'mesmo conteúdo em gêneros diferentes (post × editorial)',
      detail: 'Tom, extensão e público mudam — gabarito ancora no trecho da prova.',
      sourceId: 'pt-tipologia-concursos',
    },
    {
      id: 'tipo-coerencia-tema',
      label: 'Tema e progressão',
      value: 'parágrafo desenvolve o tema central ou tangente?',
      detail: 'Coesão temática — repetir léxico-chave ou sinônimos do assunto central.',
      sourceId: 'pt-tipologia-concursos',
    },
  ],
};
