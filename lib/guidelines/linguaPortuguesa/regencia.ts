import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Regência verbal e nominal — regras portáteis para concursos.
 * Card vitrine: "Regência verbal e nominal". Ramo L3: pt_regencia.
 */
export const PT_REGENCIA: GuidelineTable = {
  id: 'pt-regencia-concursos',
  snapshot: 'Regência — preposição exigida pelo verbo/nome + verbos de duplo sentido',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Regência verbal e nominal',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'reg-pergunta-teste',
      label: 'Pergunta-teste',
      value: 'Qual preposição o verbo/nome exige neste sentido?',
      detail: 'Regência = relação sintática verbo↔complemento ou nome↔complemento. Sentido muda a preposição.',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-verbal-transitividade',
      label: 'Transitividade',
      value: 'transitivo direto, indireto, direto e indireto ou intransitivo',
      detail: 'OD sem preposição · OI com preposição exigida · VI sem complemento nomeado.',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-nominal',
      label: 'Regência nominal',
      value: 'substantivo/adjetivo exige preposição no complemento',
      detail: '«Obediência **a**» · «Acessível **a**» · «Capaz **de**» — memorizar pares clássicos de prova.',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-assistir-duplo',
      label: 'Assistir — duplo sentido',
      value: 'assistir ao jogo (VI) × assistir o paciente (VTD)',
      detail: 'Ver × prestar assistência — preposição ou não conforme o sentido. Contexto da frase decide.',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-implicar-duplo',
      label: 'Implicar — duplo sentido',
      value: 'implicar em (envolver) × implicar que (acarretar)',
      detail: 'Substituir por sinônimo-teste: «envolver» × «acarretar».',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-visar-duplo',
      label: 'Visar — duplo sentido',
      value: 'visar a (ter como fim) × visar o alvo (mirar, VTD)',
      detail: '«Visar a aprovação» × «visar o paciente» (sentido de mirar — raro em TE).',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-aspirar-duplo',
      label: 'Aspirar — duplo sentido',
      value: 'aspirar a (desejar) × aspirar secreções (VTD)',
      detail: 'Mesma forma, regências opostas — prova cobra o sentido pelo complemento.',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-obedecer-namorar',
      label: 'VTD sem preposição',
      value: 'obedecer, namorar, acessar, visar (mirar) — complemento direto',
      detail: '«Obedecer **às** normas» ✗ → «obedecer as normas» ou «obedecer **a** normas» (regência nominal).',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-cidade-precisar',
      label: 'Cidade / lugar + precisar',
      value: 'precisar **de** × ir **a** — relativo retoma regência do verbo',
      detail: '«Cidade de que precisamos» — «que» = cidade; verbo «precisar de».',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-pronome-relativo',
      label: 'Pronome relativo',
      value: 'preposição antes de que/quem conforme regência do verbo na oração relativa',
      detail: '«O medicamento **de** que preciso» — preposição exigida por «precisar de».',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-infinitivo',
      label: 'Regência do infinitivo',
      value: 'infinitivo mantém a preposição do verbo de origem',
      detail: '«É preciso **de** atenção» × «Preciso **de** atenção» — nominalização preserva regência.',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-pegadinha-sinonimo',
      label: 'Pegadinha — sinônimo falso',
      value: 'trocar verbo sem conferir a preposição',
      detail: '«Assistir» × «atender» × «ver» — cada um com regência própria. Reescrita cobra isso.',
      sourceId: 'pt-regencia-concursos',
    },
    {
      id: 'reg-crase-regencia',
      label: 'Crase × regência',
      value: 'a + artigo feminino após verbo/nome que exige «a»',
      detail: '«Referir-se **à** paciente» — regência + crase. Não confundir com regência pura sem artigo.',
      sourceId: 'pt-regencia-concursos',
    },
  ],
};
