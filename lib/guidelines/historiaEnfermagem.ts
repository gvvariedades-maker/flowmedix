import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * História da enfermagem e marcos regulatórios brasileiros.
 * Fontes: COFEN (escolas, Anna Nery, Dia Internacional) · Lei 7.498/86 · Decreto 94.406/87 · CEPE 564/2017.
 */
export const HISTORIA_ENFERMAGEM_COFEN: GuidelineTable = {
  id: 'historia-enfermagem-cofen',
  snapshot: 'Nightingale · Anna Nery · escolas COFEN · Lei 7.498',
  issuer: 'COFEN / Planalto',
  title: 'História da Enfermagem',
  year: 2024,
  url: 'https://www.cofen.gov.br/raizes-historicas-da-profissao-primeiras-escolas-de-enfermagem-no-brasil/',
  entries: [
    {
      id: 'nightingale',
      label: 'Florence Nightingale',
      value: 'fundadora da enfermagem moderna',
      detail: 'Guerra da Crimeia: higiene, ventilação, registro de mortalidade.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'cofen-papel',
      label: 'COFEN',
      value: 'Conselho Federal de Enfermagem',
      detail: 'Normatiza e fiscaliza o exercício profissional no Brasil.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'coren-papel',
      label: 'COREN',
      value: 'fiscalização estadual do exercício profissional',
      detail: 'Não confundir com COFEN — Código de Ética é norma do COFEN.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'codigo-etica',
      label: 'Código de Ética (CEPE)',
      value: 'Resolução COFEN nº 564/2017',
      detail: 'Orienta direitos, deveres e proibições da enfermagem — vigente no Sistema COFEN/Conselhos Regionais.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'enfermagem-brasil-pre-sus',
      label: 'Enfermagem no Brasil',
      value: 'raízes anteriores ao SUS (1988)',
      detail: 'Escolas e regulamentação vêm do século XX — SUS reorganizou o sistema.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'pegadinha-sus',
      label: 'Pegadinha SUS',
      value: 'enfermagem não surgiu apenas após criação do SUS',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'eulalia-paiva-queiroz',
      label: 'Primeiras escolas — pegadinha de prova',
      value: 'não confundir Alfredo Pinto (1890) com Escola Anna Nery (1923)',
      detail:
        'COFEN: 1ª escola = Escola Profissional/Alfredo Pinto (1890). Anna Nery = 1ª escola modelo Nightingale/ANA (1923). exam_vs_current: algumas provas atribuem “Eulália Paiva / 1890” à Anna Nery — erro factual.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'ana-neri',
      label: 'Anna Nery (Ana Néri)',
      value: 'voluntária da Guerra do Paraguai (1865–1870) — símbolo da enfermagem no Brasil',
      detail:
        'COFEN: nascida 13/12/1814 (BA), falecida 20/05/1880 (RJ); heroína da Pátria (2009). Não foi a primeira enfermeira diplomada.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'escola-alfredo-pinto',
      label: 'Escola Alfredo Pinto',
      value: 'primeira escola de enfermagem do Brasil (1890, RJ)',
      detail:
        'COFEN: Escola Profissional de Enfermeiros e Enfermeiras (Dec. 791/1890), Hospital Nacional de Alienados — modelo francês; hoje EEAP/UNIRIO.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'lei-7498-86',
      label: 'Lei 7.498/86',
      value: 'regulamenta o exercício da enfermagem no Brasil',
      detail: 'Define atribuições de enfermeiro, técnico e auxiliar; base legal junto ao Decreto 94.406/87.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'florence-creditos',
      label: 'Florence Nightingale — legado',
      value: 'enfermagem científica, estatística sanitária e cuidado humanizado',
      detail: 'Reduziu mortalidade no hospital de Scutari; "A Dama da Lâmpada" — fundadora da enfermagem moderna.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'ona-acreditacao',
      label: 'ONA',
      value: 'Organização Nacional de Acreditação — certificação de serviços de saúde',
      detail: 'Acreditação hospitalar (níveis 1 a 3); promove qualidade e segurança do paciente.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'decreto-94406-87',
      label: 'Decreto 94.406/87',
      value: 'regulamenta a Lei 7.498/86 — atividades privativas por categoria',
      detail: 'Diferencia atribuições de enfermeiro, técnico e auxiliar — frequentemente cobrado em prova.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'escola-anna-nery',
      label: 'Escola Anna Nery',
      value: 'fundada em 1923 (DNSP/RJ) — primeira escola modelo Nightingale/ANA no Brasil',
      detail:
        'COFEN/SciELO: Escola de Enfermeiras do DNSP (1923), homenagem a Anna Nery; padrão Rockefeller — distinta da Alfredo Pinto (1890).',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'pegadinha-ana-eulalia',
      label: 'Pegadinha pioneiras',
      value: 'Anna Nery = símbolo da Guerra do Paraguai; 1ª escola formal = Alfredo Pinto (1890)',
      detail: 'Escola Anna Nery (1923) é a 1ª no modelo científico moderno — não a primeira escola do país.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'dia-enfermeiro-brasil-20-maio',
      label: 'Dia do Enfermeiro (Brasil)',
      value: '20 de maio — homenagem a Anna Nery (data de falecimento)',
      detail:
        'COFEN celebra 20/05; Dia Internacional permanece 12/05 (Nightingale). exam_vs_current: Dec. 2.956/1938 fixou 12/05 com homenagens a Anna Nery.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'getulio-vargas-regulamentacao',
      label: 'Era Getúlio Vargas',
      value: 'Estado Novo e políticas de saúde pública — expansão de formação e serviços',
      detail: 'Década de 1930–40: reorganização sanitária e marcos para profissões da saúde no Brasil.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'ufsc-enfermagem',
      label: 'UFSC — enfermagem no Brasil',
      value: 'Universidade Federal de Santa Catarina — referência na formação superior de enfermagem',
      detail: 'Cursos universitários consolidam a enfermagem como graduação e pesquisa no país.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'dia-internacional-enfermagem',
      label: 'Dia Internacional da Enfermagem',
      value: '12 de maio — aniversário de Florence Nightingale',
      detail: 'Celebrado mundialmente desde 1965 (ICN); homenagem à categoria e à pioneira da Crimeia.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'florence-crimeia-estatisticas',
      label: 'Florence — Guerra da Crimeia',
      value: 'reduziu mortalidade hospitalar de ~40% para ~2% com higiene e saneamento',
      detail: 'Estatísticas e gráficos de Nightingale (coxcomb) — base da enfermagem científica.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'teoria-peplau',
      label: 'Teoria de Peplau',
      value: 'relações interpessoais enfermeiro–paciente — fases: orientação, identificação, exploração e resolução',
      detail: 'Hildegard Peplau — enfermagem psiquiátrica e cuidado terapêutico centrado na relação.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'etica-autonomia-beneficencia',
      label: 'Ética — autonomia e beneficência',
      value: 'respeitar decisão do paciente (autonomia) e agir para o bem (beneficência)',
      detail: 'Princípios do Código de Ética COFEN — junto com não maleficência, justiça e dignidade.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'henrique-dutra-vargas',
      label: 'Marco sanitário brasileiro',
      value: 'políticas de saúde e formação profissional no século XX',
      detail: 'Contexto histórico da profissionalização da enfermagem antes e após o SUS (1988).',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'teorias-enfermagem-classicas',
      label: 'Teorias clássicas de enfermagem',
      value: 'Nightingale (ambiente), Peplau (relação), Henderson (necessidades básicas)',
      detail: 'Fundamentos para o Processo de Enfermagem e prática baseada em evidências.',
      sourceId: 'historia-enfermagem-cofen',
    },
    {
      id: 'hepatite-b-sinan-epidemiologia',
      label: 'Hepatite B — Sinan (MS)',
      value: '36,8% das hepatites virais confirmadas (2000–2023)',
      detail:
        'Boletim Epidemiológico Hepatites Virais MS (jul/2024): 289.029/785.571. Série 2000–2024 (boletim 2025): ~36,6% — exam_vs_current se prova citar percentual arredondado.',
      sourceId: 'historia-enfermagem-cofen',
    },
  ],
};
