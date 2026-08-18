import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Procedimentos diversos — técnica asséptica e higiene das mãos.
 * Fontes: MS/Anvisa/Fiocruz Protocolo Higiene das Mãos (PNSP) · OMS 5 momentos · RDC 42/2010.
 */
export const PROCEDIMENTOS_DIVERSOS_ASSEPSIA: GuidelineTable = {
  id: 'procedimentos-diversos-assepsia',
  snapshot: 'Assepsia + 5 momentos HM (Protocolo PNSP / Anvisa)',
  issuer: 'Anvisa / MS / OMS',
  title: 'Procedimentos diversos',
  year: 2013,
  url: 'https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/publicacoes/protocolo-de-higiene-das-maos',
  entries: [
    {
      id: 'tecnica-asseptica',
      label: 'Técnica asséptica',
      value: 'reduz transmissão de microrganismos em procedimentos invasivos',
      detail: 'Campo estéril, material estéril, barreira contra contaminação.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'antissepsia',
      label: 'Antissepsia',
      value: 'pele ou mucosa do paciente — tecido vivo',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'desinfeccao',
      label: 'Desinfecção',
      value: 'objetos e superfícies inanimadas',
      detail: 'Não confundir com antissepsia.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'higiene-maos',
      label: 'Higienização das mãos — 5 momentos',
      value: '1 antes do paciente · 2 antes de procedimento limpo/asséptico · 3 após fluidos · 4 após o paciente · 5 após superfícies próximas',
      detail:
        'Protocolo MS/Anvisa/Fiocruz (PNSP) + OMS — luva não substitui HM; fricção alcoólica se mãos visivelmente limpas.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'higiene-maos-agua-vs-alcool',
      label: 'HM — água e sabão × álcool',
      value: 'sabão + água se sujas/visíveis; preparação alcoólica se limpas (5 momentos)',
      detail:
        'RDC 42/2010 obriga disponibilizar preparação alcoólica nos pontos de assistência; Anvisa NT 05/2024 reforça os 5 momentos.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'pegadinha-luva',
      label: 'Pegadinha luva',
      value: 'higienizar antes de calçar e após retirar luvas — luva não substitui HM',
      detail: 'Protocolo PNSP: após remover luvas, HM é obrigatória (momentos 3/4/5 conforme fluxo).',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'vivo-vs-objeto',
      label: 'Vivo × objeto',
      value: 'antissepsia no paciente; desinfecção no ambiente/objeto',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'puncao-capilar-glicemia',
      label: 'Punção capilar (glicemia)',
      value: 'face lateral da polpa digital — após antissepsia e secagem',
      detail: 'Descartar primeira gota se protocolo indicar (evitar diluição com álcool).',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'glicemia-lanceta',
      label: 'Lanceta descartável',
      value: 'uso único — não compartilhar dispositivo de punção',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'nebulizacao',
      label: 'Nebulização',
      value: 'administração de aerossol na via inalatória com máscara ou bocal',
      detail: 'Higienizar nebulizador entre usos; observar resposta respiratória.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'lavagem-gastrica',
      label: 'Lavagem gástrica',
      value: 'contraindicada na maioria das intoxicações atuais',
      detail: 'Raramente indicada; corrosivos e hidrocarbonetos — risco de aspiração e perfuração.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'sonda-retal',
      label: 'Sonda retal',
      value: 'técnica asséptica — lubrificar e introduzir sem força',
      detail: 'Contraindicações: neutropenia grave, hemorragia retal ativa, pós-cirurgia anal recente.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'curativo-simples',
      label: 'Curativo simples',
      value: 'limpeza, antissepsia perilesional e cobertura estéril',
      detail: 'Trocar conforme exsudato e protocolo; registrar evolução da ferida.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'nebul-posicao',
      label: 'Nebulização — posição',
      value: 'paciente sentado ou semissentado quando possível',
      detail: 'Facilita depósito pulmonar e reduz risco de aspiração.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'pegadinha-lavagem-gastrica',
      label: 'Pegadinha lavagem gástrica',
      value: 'não é rotina em toda intoxicação aguda',
      detail: 'Carvão ativado e suporte são frequentemente preferíveis conforme substância.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'nebulizacao-cuidados-enfermagem',
      label: 'Nebulização — cuidados de enfermagem',
      value: 'posicionar semissentado, oxigenar se indicado, observar taquipneia e sibilos, higienizar kit após uso',
      detail: 'Registrar horário e medicamento nebulizado; aguardar término antes de retirar máscara; lavar rosto após broncodilatador.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
  ],
};
