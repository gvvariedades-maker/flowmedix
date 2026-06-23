import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Procedimentos diversos — técnica asséptica e higiene das mãos.
 * Fonte: Anvisa/OMS — precauções padrão e assepsia.
 */
export const PROCEDIMENTOS_DIVERSOS_ASSEPSIA: GuidelineTable = {
  id: 'procedimentos-diversos-assepsia',
  snapshot: 'Assepsia, antissepsia e higiene das mãos',
  issuer: 'Anvisa / OMS',
  title: 'Procedimentos diversos',
  year: 2017,
  url: 'https://www.gov.br/anvisa/',
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
      label: 'Higienização das mãos',
      value: 'antes e depois do contato — 5 momentos OMS',
      detail: 'Luva não substitui lavagem nos momentos indicados.',
      sourceId: 'procedimentos-diversos-assepsia',
    },
    {
      id: 'pegadinha-luva',
      label: 'Pegadinha luva',
      value: 'lavar só após procedimento com luva é insuficiente',
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
