import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Coesão, coerência e conectivos — regras portáteis para concursos.
 * Card vitrine: "Coesão, coerência e conectivos". Ramo L3: pt_coesao_conectivos.
 */
export const PT_COESAO_CONECTIVOS: GuidelineTable = {
  id: 'pt-coesao-conectivos-concursos',
  snapshot: 'Coesão textual — elos, conectivos e referência',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Coesão, coerência e conectivos',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'coes-pergunta-teste',
      label: 'Pergunta-teste',
      value: 'Qual a relação entre as orações? O «isso» retoma o quê?',
      detail: 'Coesão = elos gramaticais/lexicais · Coerência = sentido lógico global.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-coerencia',
      label: 'Coerência',
      value: 'unidade de sentido — ideias não se contradizem',
      detail: 'Texto incoerente quebra a lógica mesmo com coesão gramatical aparente.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-anáfora',
      label: 'Anáfora',
      value: 'retomada de termo já mencionado (antes → depois)',
      detail: '«O **paciente** chegou. **Ele** aguardou» — «ele» = anáfora.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-catafora',
      label: 'Catáfora',
      value: 'referência antecipada — pronome antes do referente',
      detail: '«**Isso** me preocupa: a falta de material» — «isso» aponta para o que vem depois.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-conectivo-adicao',
      label: 'Conectivo — adição',
      value: 'e, nem, bem como, além disso',
      detail: 'Soma informações na mesma direção argumentativa.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-conectivo-oposicao',
      label: 'Conectivo — oposição',
      value: 'mas, porém, contudo, todavia, entretanto',
      detail: '«Mas» × «porém» — mesma função; registro e posição podem variar.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-conectivo-causa',
      label: 'Conectivo — causa',
      value: 'porque, pois, já que, visto que',
      detail: 'Liga consequência ou explicação ao motivo.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-conectivo-consequencia',
      label: 'Conectivo — consequência',
      value: 'portanto, logo, assim, por isso, então',
      detail: 'Exige relação lógica real — «logo» sem conclusão = pegadinha.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-pronome-relativo',
      label: 'Pronome relativo como elo',
      value: 'que, quem, onde, cujo — retomam antecedente',
      detail: '«O enfermeiro **que** atendeu» — coesão dentro da oração.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-elipse',
      label: 'Elipse',
      value: 'omissão de termo recuperável pelo contexto',
      detail: '«João estudou e Maria também **estudou**» → elipse do verbo — economia textual.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-pegadinha-isso',
      label: 'Pegadinha — «isso» sem referente',
      value: 'pronome deve retomar antecedente claro',
      detail: 'Ambiguidade referencial — achar o núcleo retomado no parágrafo.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
    {
      id: 'coes-pegadinha-sinonimo-conectivo',
      label: 'Pegadinha — conectivo sinônimo falso',
      value: 'trocar «mas» por «porque» altera a relação lógica',
      detail: 'Reescrita cobra equivalência de sentido, não só de palavra parecida.',
      sourceId: 'pt-coesao-conectivos-concursos',
    },
  ],
};
