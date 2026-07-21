import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Vocábulo "que" e partícula "se" — regras portáteis para concursos.
 * Card vitrine: "Vocábulo \"que\" e partícula \"se\"". Ramo L3: pt_vocabulo_que_se.
 */
export const PT_VOCABULO_QUE_SE: GuidelineTable = {
  id: 'pt-vocabulo-que-se-concursos',
  snapshot: '«Que» polissêmico + «se» (índice, partícula, pronome reflexivo)',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Vocábulo "que" e partícula "se"',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'qs-que-pergunta',
      label: 'Pergunta-teste — que',
      value: 'Que função o «que» exerce? Relativo, conjunção, pronome?',
      detail: '«Que» é a palavra mais polissêmica da gramática de prova.',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-que-pronome-relativo',
      label: '«Que» — pronome relativo',
      value: 'retoma antecedente, introduz oração subordinada adjetiva',
      detail: '«O medicamento **que** preciso» — sujeito ou objeto na relativa.',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-que-conjuncao-integrante',
      label: '«Que» — conjunção integrante',
      value: 'introduz oração substantiva (completa verbo/nome)',
      detail: '«Afirmo **que** ele chegou» · «É necessário **que** descanse».',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-que-pronome-interrogativo',
      label: '«Que» — pronome interrogativo',
      value: 'em pergunta direta ou indireta',
      detail: '«**Que** horas são?» · «Não sei **que** fazer».',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-que-exclamativo',
      label: '«Que» — exclamativo',
      value: 'ênfase, surpresa — «Que belo dia!»',
      detail: 'Não introduz oração subordinada substantiva — valor exclamativo.',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-se-pergunta',
      label: 'Pergunta-teste — se (M10)',
      value: 'SE = índice de indeterminação, partícula ou pronome reflexivo?',
      detail: 'Mesma forma, três funções — contexto e estrutura da frase decidem.',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-se-indice',
      label: '«Se» — índice de indeterminação',
      value: 'sujeito indeterminado ou oração condicional',
      detail: '«**Se** precisar, ligue» (condicional) · «Precisa-**se**» (índice passivo/impessoal).',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-se-particula',
      label: '«Se» — partícula apassivadora',
      value: 'voz passiva sintética — verbo transitivo direto + se',
      detail: '«**Se** vendem remédios» = remédios são vendidos — paciente da ação.',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-se-reflexivo',
      label: '«Se» — pronome reflexivo',
      value: 'sujeito pratica e sofre a ação',
      detail: '«Ele **se** feriu» — reflexivo; concorda com o sujeito.',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-se-reciproco',
      label: '«Se» — recíproco',
      value: 'ação mútua entre sujeitos',
      detail: '«Eles **se** cumprimentaram» — um ao outro.',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-pegadinha-se-passiva-reflexiva',
      label: 'Pegadinha — passiva × reflexiva',
      value: 'passiva: paciente sofre · reflexiva: sujeito age sobre si',
      detail: '«Vendem-**se** casas» (passiva) × «Ele **se** vendeu» (reflexivo/recíproco conforme contexto).',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
    {
      id: 'qs-pegadinha-que-quem',
      label: 'Pegadinha — que × quem',
      value: '«quem» só retoma pessoa; «que» retoma coisa ou pessoa',
      detail: '«A enfermeira **que** atendeu» × «A pessoa **quem** vi» — «quem» como relativo é restrito.',
      sourceId: 'pt-vocabulo-que-se-concursos',
    },
  ],
};
