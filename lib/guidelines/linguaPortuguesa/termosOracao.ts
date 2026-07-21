import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Termos da oração — regras portáteis para concursos.
 * Card vitrine: "Termos da oração". Ramo L3: pt_termos_oracao.
 * Pergunta-teste (M05/M06): Modifica nome? O quê? A quem?
 */
export const PT_TERMOS_ORACAO: GuidelineTable = {
  id: 'pt-termos-oracao-concursos',
  snapshot: 'Termos da oração — matriz função sintática (PS)',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Termos da oração',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'term-pergunta-teste',
      label: 'Pergunta-teste (M05/M06)',
      value: 'Modifica nome? Liga sujeito? Completa verbo? Chama alguém?',
      detail: 'Classificar pelo vínculo sintático, não só pela forma da palavra.',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-adjunto-adnominal',
      label: 'Adjunto adnominal',
      value: 'modifica o substantivo (característica, posse, quantidade)',
      detail: '«Casa **grande**» · «**Minha** casa» · «casa **de** madeira» — função de adjunto ao nome.',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-complemento-nominal',
      label: 'Complemento nominal',
      value: 'completa o sentido de nome abstrato, adjetivo ou advérbio',
      detail: '«Obediência **às** normas» · «útil **ao** paciente» — nome/adjetivo que exige complemento.',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-adjunto-vs-cn',
      label: 'Teste adjunto × CN',
      value: 'adjunto = característica; CN = completa nome abstrato/adjetivo',
      detail: '«Medo **de** altura» (CN) × «altura **da** torre» (adjunto). Pergunta: completa **qual** nome?',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-aposto',
      label: 'Aposto',
      value: 'explica ou especifica outro termo (em geral substantivo)',
      detail: '«Recife, **a Veneza brasileira**, é aprazível» — vírgulas de isolamento (M05/M08).',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-vocativo',
      label: 'Vocativo',
      value: 'chama ou invoca o interlocutor — não integra a estrutura sujeito–predicado',
      detail: '«**Enfermeira**, traga o material» — não é sujeito nem aposto explicativo do sujeito.',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-aposto-vs-vocativo',
      label: 'Teste aposto × vocativo',
      value: 'aposto explica o nome; vocativo chama alguém',
      detail: '«Dr. Silva, **cardiologista**, atendeu» = aposto · «**Doutor**, venha» = vocativo.',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-objeto-direto',
      label: 'Objeto direto',
      value: 'complemento do verbo transitivo direto — sem preposição',
      detail: '«O médico examinou **o paciente**» — responde «o quê?» sem preposição.',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-objeto-indireto',
      label: 'Objeto indireto',
      value: 'complemento do verbo transitivo indireto — com preposição exigida',
      detail: '«O enfermeiro cuidou **do paciente**» — responde «a quem? / de quem?».',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-adjunto-adverbial',
      label: 'Adjunto adverbial',
      value: 'circunstância de tempo, lugar, modo, causa…',
      detail: '«Chegou **ontem**» · «Trabalha **com dedicação**» — modifica o verbo ou a oração.',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-oi-vs-adjunto-adverbial',
      label: 'Teste OI × adjunto adverbial',
      value: 'OI completa verbo; adjunto adverbial é circunstância facultativa',
      detail: '«Gosto **de** música» (OI obrigatório) × «Estudei **em** casa» (adjunto adverbial).',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-agente-passiva',
      label: 'Agente da passiva',
      value: 'quem pratica a ação na voz passiva — introduzido por «por»',
      detail: '«O paciente foi atendido **pelo enfermeiro**» — agente, não sujeito.',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-predicativo',
      label: 'Predicativo',
      value: 'atributo ligado ao sujeito ou ao objeto por verbo de ligação/transitivo',
      detail: '«O paciente **está** estável» (predicativo do sujeito) · «Considero o plano **útil**» (do objeto).',
      sourceId: 'pt-termos-oracao-concursos',
    },
    {
      id: 'term-pegadinha-predicativo-od',
      label: 'Pegadinha — predicativo × OD',
      value: '«Ele está feliz» ≠ «Ele comeu feliz»',
      detail: 'Predicativo liga ao sujeito; adjunto adverbial modifica o verbo sem atribuir ao núcleo.',
      sourceId: 'pt-termos-oracao-concursos',
    },
  ],
};
