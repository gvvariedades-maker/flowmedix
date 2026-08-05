import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Enfermagem do Trabalho e segurança ocupacional em saúde.
 * Fonte: NR-32 consolidada (última Portaria MTP 4.219/2022; página MTE atualizada 2025)
 * + protocolos MS de exposição a material biológico.
 * @see https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/arquivos/normas-regulamentadoras/nr-32-atualizada-2022-1.pdf
 */
export const ENFERMAGEM_TRABALHO_NR32: GuidelineTable = {
  id: 'enfermagem-trabalho-nr32',
  snapshot: 'NR-32 atualizada 2022 (MTE) — PGR, PCMSO, imunização',
  issuer: 'Ministério do Trabalho e Emprego / MS',
  title: 'Enfermagem do Trabalho',
  year: 2025,
  url: 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadoras/norma-regulamentadora-no-32-nr-32',
  entries: [
    {
      id: 'nr32-escopo',
      label: 'NR-32',
      value: 'segurança e saúde em serviços de saúde',
      detail:
        'Riscos biológicos, químicos, físicos, ergonômicos e de acidentes. Texto consolidado Portaria MTP 4.219/2022 (página MTE atualizada 2025).',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr32-trabalhadores',
      label: 'Abrangência',
      value: 'trabalhadores em serviços de saúde',
      detail: 'Inclui técnico de enfermagem.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'vacina-hepatite-b',
      label: 'Vacina hepatite B',
      value: 'imunização gratuita obrigatória ao trabalhador da saúde',
      detail:
        'NR-32 item 32.2.4.17.1: tétano, difteria, hepatite B e demais do PCMSO — fornecidas gratuitamente; seguir calendário MS.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr32-pgr',
      label: 'PGR (Programa de Gerenciamento de Riscos)',
      value: 'medidas de proteção a partir da avaliação de riscos do PGR',
      detail:
        'NR-32 atualizada (Portaria MTP 806/2022): referência ao PGR (substitui linguagem antiga de PPRA isolado em vários itens).',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'epi-empregador',
      label: 'EPI',
      value: 'fornecido pelo empregador conforme risco da função',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'perfurocortante',
      label: 'Acidente perfurocortante',
      value: 'notificar, avaliar fonte, exames e profilaxia conforme protocolo',
      detail: 'Não basta lavar o local e retornar ao trabalho.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'pep-ocupacional',
      label: 'Pós-exposição ocupacional',
      value: 'fluxo institucional obrigatório',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'biosseguranca-ocupacional',
      label: 'Prevenção biológica',
      value: 'precauções padrão e adicionais conforme risco',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr32-ergonomia',
      label: 'Ergonomia',
      value: 'mobiliário, postura e organização do trabalho reduzem LER/DORT',
      detail: 'NR-32 inclui risco ergonômico — levantamento, transferência e jornada adequados.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'pep-hepatite-c',
      label: 'Hepatite C pós-exposição',
      value: 'segundo protocolo MS — seguimento sorológico do exposto',
      detail: 'Não há profilaxia medicamentosa rotineira como no HIV; avaliar fonte e exames seriados.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'estresse-ocupacional',
      label: 'Estresse ocupacional',
      value: 'identificação precoce e medidas preventivas institucionais',
      detail: 'Sobrecarga, violência e turnos inadequados aumentam adoecimento do trabalhador.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'vacina-influenza-trabalhador',
      label: 'Vacina influenza',
      value: 'recomendada anualmente para trabalhadores da saúde (PNI)',
      detail: 'Protege o profissional e reduz transmissão a pacientes vulneráveis.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'descarte-residuos',
      label: 'Descarte de resíduos',
      value: 'segregação A–E conforme RDC Anvisa 222/2018',
      detail:
        'A infectantes; B químicos; C radioativos; D comuns; E perfurocortantes. Nunca reencapar agulhas (NR-32 / PPRAMP).',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'afastamento-acidente',
      label: 'Afastamento pós-acidente',
      value: 'avaliação médica, CAT e afastamento conforme gravidade',
      detail: 'Acidente de trabalho exige notificação e acompanhamento do serviço de saúde ocupacional.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr32-violencia',
      label: 'Violência no trabalho',
      value: 'risco ocupacional em saúde — prevenção e notificação',
      detail: 'Protocolos institucionais para agressão verbal/física de pacientes e familiares.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'pep-hepatite-b-prazo',
      label: 'PEP hepatite B',
      value: 'vacina e/ou imunoglobulina — ideal nas primeiras 48–72 h',
      detail: 'Quanto mais precoce após exposição percutânea, maior eficácia da profilaxia.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr32-anexos',
      label: 'NR-32 — Anexo I (agentes biológicos)',
      value: 'classes de risco 1 a 4 (individual e coletivo)',
      detail:
        'Texto MTE consolidado (Portaria MTP 4.219/2022): Anexo I classifica agentes biológicos. Riscos químicos/físicos/ergonômicos também constam na NR-32 e nas NR gerais (NR-01/PGR, NR-09, NR-15, NR-17). exam_vs_current: provas que inventam “Anexos I–V por tipo de risco”.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr32-ppra-vs-pgr',
      label: 'PPRA × PGR',
      value: 'medidas de proteção a partir da avaliação de riscos do PGR (NR-01/NR-32 atualizada)',
      detail:
        'Portaria MTP 806/2022 alinhou NR-32 ao PGR. exam_vs_current: provas antigas ainda dizem PPRA como programa isolado da NR-32.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr32-dispositivo-seguranca',
      label: 'Perfurocortantes com dispositivo de segurança',
      value: 'empregador deve disponibilizar e capacitar no uso correto',
      detail:
        'NR-32 (Portaria 939/2008 e consolidações): substituição progressiva e capacitação sobre dispositivos de segurança.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr32-risco-quimico',
      label: 'Risco químico (NR-32)',
      value: 'exposição a medicamentos, desinfetantes e gases anestésicos',
      detail: 'FISPQ, ventilação adequada e EPI — antineoplásicos exigem precauções adicionais de manipulação.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'ergonomia-limite-levantamento',
      label: 'Ergonomia — limite de levantamento',
      value: 'evitar levantamento manual acima de 25 kg (NR-17 referência)',
      detail: 'Usar técnicas de transferência, pranchas e auxílio — sobrecarga crônica causa LER/DORT em enfermagem.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'vacina-hepatite-b-3-doses',
      label: 'Vacina hepatite B — esquema',
      value: '3 doses — 0, 1 e 6 meses',
      detail: 'Verificar anti-HBs após esquema completo; trabalhador da saúde sem resposta pode necessitar reforço ou revacinação.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'burnout-trabalhador-saude',
      label: 'Burnout e síndrome de esgotamento',
      value: 'risco ocupacional reconhecido — exaustão emocional, despersonalização e baixa realização',
      detail: 'Jornadas excessivas, violência e falta de suporte institucional são fatores — prevenção é dever do empregador.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'violencia-trabalho-protocolo',
      label: 'Violência contra trabalhador de saúde',
      value: 'notificar, acionar segurança e registrar ocorrência institucional',
      detail: 'Agressão verbal ou física é evento de risco — não é "parte do trabalho"; protocolo deve incluir apoio psicológico.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'epi-vestir-retirar',
      label: 'EPI — vestir e retirar (donning/doffing)',
      value: 'sequência correta evita autoinoculação',
      detail: 'Retirar luvas primeiro, depois outros itens sem tocar superfície externa contaminada — higienizar mãos entre etapas.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'cat-comunicacao-acidente',
      label: 'CAT — Comunicação de Acidente de Trabalho',
      value: 'empregador emite CAT em até 1 dia útil após o acidente',
      detail: 'Documento oficial para INSS — acidente com material biológico é acidente de trabalho; trabalhador tem direito a atendimento.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'residuos-biologicos-ocupacional',
      label: 'Resíduos biológicos — risco ocupacional',
      value: 'Grupo A (biológico) em saco branco leitoso — perfurocortantes em coletor rígido',
      detail: 'Não compactar, não reencapar agulhas — transporte interno em carrinho fechado e identificado conforme RDC Anvisa.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'pegadinha-nr32-epi-opcional',
      label: 'Pegadinha — EPI é opcional',
      value: 'EPI é obrigatório quando o risco não pode ser eliminado na fonte',
      detail: 'Fornecimento gratuito pelo empregador — recusar EPI ou usar incorretamente expõe a acidente e responsabilização.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr7-exame-demissional',
      label: 'PCMSO — exame demissional',
      value: 'até 10 dias contados do término do contrato',
      detail: 'NR-7 — exame clínico demissional dentro do prazo legal.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr7-exame-periodico-idade',
      label: 'PCMSO — exame periódico',
      value: 'periodicidade mínima varia por idade — acima de 45 anos é anual',
      detail: 'NR-7 — não é bienal para todos os trabalhadores sem exposição.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr15-ruido-100db',
      label: 'NR-15 — ruído 100 dB',
      value: '1 hora máxima de exposição diária',
      detail: 'Anexo 1 — dose dupla: 85 dB = 8 horas · 90 dB = 4 horas · 95 dB = 2 horas · 100 dB = 1 hora.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr15-ruido-85db',
      label: 'NR-15 — ruído 85 dB',
      value: '8 horas máximas de exposição diária',
      detail: 'Referência basal da tabela NR-15 Anexo 1.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr15-ruido-90db',
      label: 'NR-15 — ruído 90 dB',
      value: '4 horas máximas de exposição diária',
      detail: 'Anexo 1 — dose dupla a partir de 85 dB.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr15-ruido-95db',
      label: 'NR-15 — ruído 95 dB',
      value: '2 horas máximas de exposição diária',
      detail: 'Anexo 1 — dose dupla a partir de 85 dB.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
    {
      id: 'nr9-nivel-acao-quimico',
      label: 'NR-9 — nível de ação químico',
      value: '50% do limite de tolerância (LT)',
      detail: 'Acima do nível de ação exige controle sistemático antes de ultrapassar o LT.',
      sourceId: 'enfermagem-trabalho-nr32',
    },
  ],
};
