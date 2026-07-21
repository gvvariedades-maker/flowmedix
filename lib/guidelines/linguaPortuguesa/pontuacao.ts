import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Pontuação — regras portáteis para concursos (norma culta / bancas).
 * Card vitrine: "Pontuação". Ramo L3: pt_pontuacao (trilho «o que isola?»).
 *
 * Fontes tier A (consultadas 2026-07-20):
 * - ABL — Formulário Ortográfico, XVII Sinais de pontuação:
 *   https://www.academia.org.br/nossa-lingua/formulario-ortografico
 * - ABL — Evanildo Bechara, «Novas questões de ortografia» (aposto explicativo):
 *   https://www.academia.org.br/artigos/novas-questoes-de-ortografia
 * - FUNAG — Manual de Revisão, «Vírgula» (vocativo, enumeração, restritiva×explicativa):
 *   https://www.funag.gov.br/manual/index.php?title=Vírgula
 * Complemento de concurso: Cunha & Cintra; Bechara — não inventar caso raro no handcraft.
 */
export const PT_PONTUACAO: GuidelineTable = {
  id: 'pt-pontuacao-concursos',
  snapshot: 'Pontuação — pergunta-teste «o que a vírgula isola?» + proibições clássicas de prova',
  issuer: 'Academia Brasileira de Letras + norma culta (Cunha & Cintra / Bechara)',
  title: 'Pontuação — vírgula e sinais',
  year: 2024,
  url: 'https://www.academia.org.br/nossa-lingua/formulario-ortografico',
  entries: [
    {
      id: 'pont-pergunta-teste',
      label: 'Pergunta-teste (M08)',
      value: 'O que a vírgula isola? Muda o sentido se tirar?',
      detail:
        'Antes de julgar a frase: localizar a vírgula em debate → nomear o que fica isolado → testar obrigatoriedade.',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-pausa-oral',
      label: 'Pegadinha — pausa oral',
      value: 'pausa na fala não autoriza vírgula onde a norma proíbe',
      detail:
        'Pontuação marca função sintático-semântica na escrita, não respiração oral (ABL/FUNAG; TJSC).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-proibido-sujeito-verbo',
      label: 'Proibido — sujeito|verbo',
      value: 'sem vírgula entre núcleo do sujeito e o verbo',
      detail: 'Ex.: «O candidato estudou» ✓ · «O candidato, estudou» ✗. Trilho sujeito|verbo livre.',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-proibido-verbo-od',
      label: 'Proibido — verbo|complemento direto',
      value: 'em geral, sem vírgula entre verbo transitivo e OD',
      detail: 'Ex.: «O médico examinou o paciente». Vírgula entre verbo e argumento = erro clássico de prova.',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-vocativo',
      label: 'Vocativo',
      value: 'chamamento → vírgula(s) de isolamento',
      detail:
        'Início: «Rita, venha.» · Meio: «Rita, venha cá, por favor.» · Fim: «Venha cá, Rita.» (FUNAG; Cunha & Cintra).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-aposto-explicativo',
      label: 'Aposto explicativo',
      value: 'explica o nome → vírgulas (ou travessão/parênteses)',
      detail:
        '«Recife, a Veneza brasileira, é aprazível.» Pausa na fala = vírgula na escrita (ABL/Bechara).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-aposto-vocativo-teste',
      label: 'Teste aposto × vocativo',
      value: 'aposto explica o nome; vocativo chama alguém',
      detail: '«Dr. Silva, cardiologista, atendeu» = aposto · «Enfermeira, traga o material» = vocativo.',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-adjetiva-restritiva',
      label: 'Oração adjetiva restritiva',
      value: 'restringe o antecedente → sem vírgula',
      detail: '«O enfermeiro que plantou ontem chegou cedo» — só aquele enfermeiro (FUNAG).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-adjetiva-explicativa',
      label: 'Oração adjetiva explicativa',
      value: 'só comenta o antecedente → com vírgulas',
      detail: '«O enfermeiro, que plantou ontem, chegou cedo» — informação acessória (FUNAG).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-teste-adjetiva',
      label: 'Teste restritiva × explicativa',
      value: 'restringe ou só explica o antecedente?',
      detail: 'Sem vírgula = restritiva (especifica). Com vírgulas = explicativa (comenta). FGV cobra sentido.',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-enumeracao',
      label: 'Enumeração',
      value: 'elementos de mesma função → vírgula entre itens',
      detail: '«Comprei pão, leite e café.» Vírgula entre itens coordenados; «e» final facultativo (norma atual).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-coordenada-anteposta',
      label: 'Coordenada sindética anteposta',
      value: 'oração coordenada antes → vírgula antes do conectivo',
      detail: '«Não estudou, e reprovou.» Conectivo anteposto costuma exigir vírgula (FUNAG).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-adverbial-anteposta',
      label: 'Oração adverbial anteposta',
      value: 'subordinada adverbial antes da principal → vírgula depois dela',
      detail: '«Quando chegou o material, iniciamos o procedimento.»',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-termo-deslocado',
      label: 'Termo deslocado / intercalado',
      value: 'adjunto ou oração intercalada → vírgulas dos dois lados',
      detail: '«O paciente, segundo o médico, melhorou.» Inciso explicativo interrompe o fluxo (FUNAG).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-dois-pontos',
      label: 'Dois-pontos',
      value: 'anuncia explicação, enumeração, citação ou fala direta',
      detail: '«Há três etapas: triagem, atendimento e alta.» (ABL Formulário Ortográfico, sinais de pontuação).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-ponto-virgula',
      label: 'Ponto e vírgula',
      value: 'orações relacionadas sem conjunção; itens longos em lista',
      detail: 'Separa orações de mesmo período quando a pausa é maior que a da vírgula (FUNAG).',
      sourceId: 'pt-pontuacao-concursos',
    },
    {
      id: 'pont-pegadinha-determinante-sn',
      label: 'Pegadinha — SN cortado',
      value: 'não separe determinante do substantivo com vírgula',
      detail: '«Essa, faculdade» imita pausa oral — incorreto. Não é vocativo nem aposto.',
      sourceId: 'pt-pontuacao-concursos',
    },
  ],
};
