import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Crase — regras portáteis para concursos (norma culta / bancas).
 * Complementa skill professor-lingua-portuguesa + pegadinhas.
 * Não inventar caso raro: handcraft prova na frase da questão.
 */
export const PT_CRASE_CONCURSOS: GuidelineTable = {
  id: 'pt-crase-concursos',
  snapshot: 'Crase — funil de 3 testes + casos clássicos de prova',
  issuer: 'Norma culta (Bechara / Cunha & Cintra) — referência de concurso',
  title: 'Crase (a + a)',
  year: 2024,
  url: 'https://www.academia.org.br/',
  entries: [
    {
      id: 'crase-definicao',
      label: 'O que é crase',
      value: 'fusão a (prep.) + a (artigo/pronome)',
      detail: 'Marca gráfica: à / às. Sem fusão = sem crase.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-teste-1-masculino',
      label: 'Teste 1 — masculino',
      value: 'antes de masculino = sem crase',
      detail: 'Se o substantivo for masculino, a prep. não se funde com artigo feminino.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-teste-2-verbo',
      label: 'Teste 2 — verbo',
      value: 'antes de verbo = sem crase',
      detail: 'Ex.: “vou a fazer” / “começou a estudar” — a = só preposição.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-teste-3-a-mais-a',
      label: 'Teste 3 — a + a feminino',
      value: 'prep. a + artigo a feminino = à',
      detail: 'Ex.: “fui à escola” (a + a escola). Substituir por ao (masculino) para checar.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-substituicao-ao',
      label: 'Teste portátil — ao',
      value: 'se “ao” couber no masculino → à no feminino',
      detail: 'Fui ao cinema → fui à praia. Se “ao” não couber, em geral sem crase.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-locucao-adverbial-feminina',
      label: 'Locução adverbial feminina',
      value: 'às vezes, à noite, à toa, às pressas',
      detail: 'Locuções femininas clássicas levam crase; “a tempo” / “a pé” = sem (masculino/neutro).',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-locucao-prepositiva',
      label: 'Locução prepositiva feminina',
      value: 'à frente de, à espera de, à procura de',
      detail: 'Núcleo feminino da locução → crase. Conferir o núcleo, não a palavra seguinte.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-horas',
      label: 'Horas',
      value: 'às + hora(s) = com crase',
      detail: 'Ex.: às 8h, à 1h. Com “desde” / “após”: desde as 8h (sem crase — as = artigo).',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-ate',
      label: 'Até',
      value: 'até a / até à — facultativo em muitos manuais',
      detail: 'Bancas divergem: marcar pela opção e pela gramática cobrada no item.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-pronomes-demonstrativos',
      label: 'Pronomes demonstrativos',
      value: 'àquela / àquele = com crase; a esta = sem',
      detail: 'a + aquela → àquela. “a esta”, “a isso” = sem crase.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-pronomes-pessoais',
      label: 'Pronomes pessoais',
      value: 'antes de mim, ti, ele… = sem crase',
      detail: 'Pronome pessoal não admite artigo a → sem fusão.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-cidade-sem-artigo',
      label: 'Cidade / país sem artigo',
      value: 'fui a Paris / a Roma = sem crase',
      detail: 'Se o nome não usa artigo (“a Paris”), só a prep. Se usa (“o Rio”), “ao Rio” / “à Bahia”.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-casa-terra-distancia',
      label: 'Casa / terra / distância',
      value: 'fui a casa (própria) × à casa de…',
      detail: '“Casa” sem determinante (própria) = sem; determinada = à. Terra/distância: mesma lógica.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-especificar',
      label: 'Palavra especificada',
      value: 'à direita / à esquerda = com crase',
      detail: 'Locuções femininas de lugar. “a direita” sem crase atrai — pegadinha clássica.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-mesmo-proprio',
      label: 'Mesmo / próprio / só',
      value: 'à mesma / à própria / à só — conforme artigo',
      detail: 'Se houver artigo feminino fundido com prep. a → crase. Provar na frase.',
      sourceId: 'pt-crase-concursos',
    },
    {
      id: 'crase-pegadinha-automatica',
      label: 'Pegadinha — crase automática',
      value: 'não marcar à só porque há “a” antes de feminino',
      detail: 'Sempre: masculino? verbo? artigo a real? Locução? — funil completo.',
      sourceId: 'pt-crase-concursos',
    },
  ],
};
