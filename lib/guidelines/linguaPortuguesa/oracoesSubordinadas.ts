import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Orações coordenadas e subordinadas — regras portáteis para concursos.
 * Card vitrine: "Orações coordenadas e subordinadas". Ramo L3: pt_oracoes_subordinadas.
 */
export const PT_ORACOES_SUBORDINADAS: GuidelineTable = {
  id: 'pt-oracoes-subordinadas-concursos',
  snapshot: 'Período composto — coordenação, subordinação e testes de sentido',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Orações coordenadas e subordinadas',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'orac-pergunta-teste',
      label: 'Pergunta-teste (M07)',
      value: 'As orações são independentes ou uma depende da outra?',
      detail: 'Coordenada = mesma hierarquia · Subordinada = uma funciona como termo da outra.',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-coordenada-sindetica',
      label: 'Coordenada sindética',
      value: 'ligadas por conjunção coordenativa (e, mas, ou, pois…)',
      detail: '«Estudei **e** passei» — orações com valor semântico de adição, oposição, alternativa.',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-coordenada-assindetica',
      label: 'Coordenada assindética',
      value: 'coordenadas sem conjunção explícita — vírgula entre elas',
      detail: '«Chegou, viu, venceu» — sequência de ações coordenadas.',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-substantiva-subjetiva',
      label: 'Subordinada substantiva subjetiva',
      value: 'funciona como sujeito da principal',
      detail: '«**É necessário** que o paciente descanse» — oração «que…» = sujeito de «é necessário».',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-substantiva-objetiva',
      label: 'Subordinada substantiva objetiva',
      value: 'funciona como OD ou OI da principal',
      detail: '«Desejo **que** você melhore» (OD) · «Lembre-se **de que**…» (OI).',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-substantiva-completiva',
      label: 'Substantiva completiva × predicativa',
      value: 'completiva = OD de verbo; predicativa = atributo do sujeito',
      detail: '«Afirmo **que** ele mentiu» (OD) × «O problema é **que** falta material» (predicativa).',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-adjetiva-restritiva',
      label: 'Adjetiva restritiva',
      value: 'restringe o antecedente — sem vírgula',
      detail: '«O enfermeiro **que plantou ontem** chegou» — só aquele enfermeiro.',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-adjetiva-explicativa',
      label: 'Adjetiva explicativa',
      value: 'apenas explica o antecedente — com vírgulas',
      detail: '«O enfermeiro**, que plantou ontem,** chegou» — informação acessória.',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-adverbial-causal',
      label: 'Adverbial causal',
      value: 'indica causa — porque, visto que, já que',
      detail: '«Não saiu **porque** estava chovendo» — responde «por qual motivo?».',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-adverbial-final',
      label: 'Adverbial final × causal',
      value: 'final = para que (fim); causal = porque (motivo)',
      detail: '«Estudou **para** passar» (final) × «Estudou **porque** queria passar» (causal).',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-adverbial-concessiva',
      label: 'Adverbial concessiva × adversativa',
      value: 'concessiva = embora (admite); adversativa = mas (opõe)',
      detail: '«**Embora** doente, trabalhou» × «Estava doente, **mas** trabalhou».',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-reduzida',
      label: 'Oração reduzida',
      value: 'verbo em infinitivo, gerúndio ou particípio — oração subordinada subentendida',
      detail: '«Ao chegar, avisou» = «**Quando** chegou, avisou» — identificar a oração desenvolvida.',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
    {
      id: 'orac-pegadinha-e-coordenada',
      label: 'Pegadinha — «e» coordenada × subordinada',
      value: 'testar se a segunda oração depende sintaticamente da primeira',
      detail: '«Correu e caiu» (coord.) × frases em que «e» liga termos, não orações inteiras.',
      sourceId: 'pt-oracoes-subordinadas-concursos',
    },
  ],
};
