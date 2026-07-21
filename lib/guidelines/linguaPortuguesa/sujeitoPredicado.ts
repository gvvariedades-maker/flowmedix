import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Sujeito e predicado — regras portáteis para concursos.
 * Cards: "Sujeito e predicado" + "Frase, oração e período" (merge no handcraft).
 * Ramo L3: sintaxe núcleo.
 */
export const PT_SUJEITO_PREDICADO: GuidelineTable = {
  id: 'pt-sujeito-predicado-concursos',
  snapshot: 'Sujeito e predicado — quem? + tipo de predicado',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Sujeito e predicado',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'sp-pergunta-teste',
      label: 'Pergunta-teste (M03/M04)',
      value: 'Quem pratica a ação? O verbo liga ou age? O quê?',
      detail: 'Sujeito = termo sobre o qual se declara algo. Predicado = declaração sobre o sujeito.',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-frase-oracao-periodo',
      label: 'Frase, oração, período',
      value: 'frase = enunciado · oração = verbo · período = 1+ orações',
      detail: '«Bom dia!» = frase sem oração · «Choveu» = oração · período simples ou composto.',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-sujeito-simples',
      label: 'Sujeito simples',
      value: 'um só núcleo',
      detail: '«O **técnico** atendeu» — núcleo = técnico.',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-sujeito-composto',
      label: 'Sujeito composto',
      value: 'dois ou mais núcleos coordenados',
      detail: '«**João e Maria** estudaram» — núcleos coordenados pelo «e».',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-sujeito-oculto',
      label: 'Sujeito oculto/elíptico',
      value: 'não aparece, mas identificável pela desinência verbal',
      detail: '«**Estudamos** ontem» — sujeito = nós (1ª pessoa do plural).',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-sujeito-indeterminado',
      label: 'Sujeito indeterminado',
      value: 'ação praticada por alguém não identificado',
      detail: '«Precisa-se de enfermeiros» · «Falaram mal» — índice «se» ou 3ª pessoa plural sem referente.',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-oracao-sem-sujeito',
      label: 'Oração sem sujeito',
      value: 'verbos impessoais — fenômeno da natureza, haver existencial',
      detail: '«**Choveu**» · «**Há** vagas» — não há sujeito gramatical.',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-predicado-verbal',
      label: 'Predicado verbal',
      value: 'núcleo = verbo de ação ou estado com sentido pleno',
      detail: '«O paciente **melhorou**» — verbo com significado completo.',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-predicado-nominal',
      label: 'Predicado nominal',
      value: 'núcleo = nome (predicativo) + verbo de ligação',
      detail: '«O paciente **está** estável» — núcleo predicativo = «estável».',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-predicado-verbo-nominal',
      label: 'Predicado verbo-nominal',
      value: 'verbo de ação + predicativo',
      detail: '«O médico **considerou** o caso **grave**» — verbo + predicativo do objeto.',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-pegadinha-eliptico-indeterminado',
      label: 'Pegadinha — elíptico × indeterminado',
      value: 'elíptico = sujeito identificável; indeterminado = não se sabe quem',
      detail: '«Comemos» (nós) × «Comeram bem» (quem? indeterminado).',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
    {
      id: 'sp-pegadinha-sujeito-predicativo',
      label: 'Pegadinha — sujeito × predicativo',
      value: '«O problema é a falta de material» — «a falta» é predicativo, não sujeito',
      detail: 'Com verbo de ligação, o atributo é predicativo; sujeito é o termo a que se atribui.',
      sourceId: 'pt-sujeito-predicado-concursos',
    },
  ],
};
