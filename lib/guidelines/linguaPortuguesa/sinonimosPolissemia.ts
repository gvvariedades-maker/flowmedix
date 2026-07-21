import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Sinônimos, antônimos e polissemia — regras portáteis para concursos.
 * Card vitrine: "Sinônimos, antônimos e polissemia". Ramo L3: pt_sinonimos_polissemia.
 */
export const PT_SINONIMOS_POLISSEMIA: GuidelineTable = {
  id: 'pt-sinonimos-polissemia-concursos',
  snapshot: 'Semântica lexical — sinonímia, antonímia, polissemia e parônimos',
  issuer: 'Norma culta (Cunha & Cintra) — referência de concurso',
  title: 'Sinônimos, antônimos e polissemia',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'sin-pergunta-teste',
      label: 'Pergunta-teste',
      value: 'O sentido na frase é o mesmo? Há outro sentido possível?',
      detail: 'Sinonímia perfeita é rara — contexto decide equivalência.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-sinonimo',
      label: 'Sinônimo',
      value: 'palavras de sentido próximo no contexto',
      detail: '«Casa» × «moradia» — campo semântico; nem sempre intercambiáveis.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-antonimo',
      label: 'Antônimo',
      value: 'sentidos opostos ou complementares',
      detail: 'Graduais (quente/frio) × complementares (vivo/morto) × recíprocos (comprar/vender).',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-polissemia',
      label: 'Polissemia',
      value: 'mesma palavra, sentidos diferentes',
      detail: '«Banco» (assento × instituição) — contexto desambigua.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-homonimia',
      label: 'Homonímia',
      value: 'mesma forma, origens/sentidos distintos',
      detail: '«Manga» (fruta × parte da camisa) — grafia e pronúncia iguais.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-paronimo',
      label: 'Parônimo',
      value: 'palavras parecidas na forma, sentidos diferentes',
      detail: '«Descrição» × «discrição» · «Eminente» × «iminente» — pegadinha ortográfica-semântica.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-hiperonimia',
      label: 'Hiperônimo × hipônimo',
      value: 'termo geral × termo específico',
      detail: '«Flor» (hiperônimo) × «rosa» (hipônimo).',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-campo-semantico',
      label: 'Campo semântico',
      value: 'conjunto de palavras relacionadas por tema',
      detail: 'Saúde: hospital, paciente, tratamento — coesão lexical no texto.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-sinonimo-imperfeito',
      label: 'Sinonímia imperfeita',
      value: 'troca muda nuance ou registro',
      detail: '«Criança» × «pivete» — sentido social diferente; banca cobra adequação.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-pegadinha-contexto',
      label: 'Pegadinha — fora de contexto',
      value: 'sinônimo de dicionário que não cabe na frase',
      detail: 'Provar na oração completa — colocação e regência podem vetar a troca.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
    {
      id: 'sin-reescrita-equivalencia',
      label: 'Reescrita com sinônimo',
      value: 'manter sentido, tempo verbal e regência',
      detail: 'Overlap M12 — trocar só o vocábulo sem conferir complementos = erro.',
      sourceId: 'pt-sinonimos-polissemia-concursos',
    },
  ],
};
