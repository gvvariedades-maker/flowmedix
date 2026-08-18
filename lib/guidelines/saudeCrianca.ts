import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Saúde da criança — aleitamento, alimentação complementar.
 * Fonte: Caderneta da Criança MS 6ª ed. (2024) + Caderneta Digital (Meu SUS Digital, 2025) + Guia Alimentar.
 * @see https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/caderneta
 */
export const SAUDE_CRIANCA_MS: GuidelineTable = {
  id: 'saude-crianca-ms',
  snapshot: 'Caderneta da Criança MS 6ª ed. (2024) + digital Meu SUS',
  issuer: 'Ministério da Saúde',
  title: 'Saúde da criança — aleitamento e nutrição',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/caderneta',
  entries: [
    {
      id: 'ame-exclusivo',
      label: 'Aleitamento materno exclusivo',
      value: 'até 6 meses',
      detail: 'Sem água, chá, suco ou outro alimento.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'ame-prolongado',
      label: 'Amamentação prolongada',
      value: 'até 2 anos ou mais',
      detail: 'Manter leite materno com alimentação complementar após 6 meses.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'intro-alimentar',
      label: 'Introdução alimentar',
      value: 'a partir de 6 meses',
      detail: 'Alimentos in natura ou minimamente processados; consistência espessa de colher.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'refeicoes-complementares',
      label: 'Refeições complementares (6 meses)',
      value: '3 vezes ao dia',
      detail: 'Se em aleitamento materno — cereais, carnes, legumes, frutas.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'apgar-normal',
      label: 'APGAR normal',
      value: '7 a 10 no 1º e 5º minuto',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'apgar-moderado',
      label: 'APGAR moderado',
      value: '4 a 6 — reanimação moderada',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'apgar-grave',
      label: 'APGAR grave',
      value: '0 a 3 — reanimação vigorosa',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'spo2-crianca',
      label: 'SpO₂ criança',
      value: '≥95% em ar ambiente',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'fc-lactente',
      label: 'FC lactente (0–2 anos)',
      value: '100 a 160 bpm',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'fr-lactente',
      label: 'FR lactente',
      value: '30 a 60 irpm',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'crescimento-curvas-oms',
      label: 'Crescimento (curvas OMS)',
      value: 'peso, comprimento/estatura e PC — acompanhar mensalmente até 2 anos',
      detail: 'Caderneta MS: plotar nas curvas OMS; desvio de canal exige investigação.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'desidratacao-sinais',
      label: 'Desidratação — sinais',
      value: 'fontanela afundada, mucosas secas, oligúria, irritabilidade ou letargia',
      detail: 'Plano A/B/C MS ( diarréia aguda): avaliar sede, lágrimas e tempo de enchimento capilar.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'aleitamento-misto',
      label: 'Aleitamento misto',
      value: 'priorizar leite materno — complementar só quando necessário',
      detail: 'MS: evitar mamadeira precoce; orientar ordenha e técnica correta para manter produção.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'pentavalente-pni',
      label: 'Vacina pentavalente (PNI)',
      value: '2, 4 e 6 meses — 3 doses',
      detail: 'DTP + Hib + hepatite B; intervalo mínimo 30 dias entre doses.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'queda-trauma-craniano',
      label: 'Queda — trauma craniano',
      value: 'observar 24 a 48 h — vômitos, sonolência, convulsão = urgência',
      detail: 'Caderneta MS: orientar família sobre sinais de alerta após queda com impacto na cabeça.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'pc-lactente',
      label: 'Perímetro cefálico (PC)',
      value: 'avaliar mensalmente no 1º ano',
      detail: 'Microcefalia ou macrocefalia progressiva requer encaminhamento.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'sinais-alerta-pediatrico',
      label: 'Sinais de alerta pediátrico',
      value: 'febre em <3 meses, recusa alimentar, gemido, tiragem, cianose',
      detail: 'Encaminhar prontamente — lactente pequeno descompensa rápido.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'teste-pezinho-coleta',
      label: 'Teste do Pezinho — coleta',
      value: '48 h após o nascimento até o 5º dia de vida',
      detail:
        'MS/PNTN (FAQ vigente): janela ideal 48 h–5º dia; punção no calcanhar lateral. exam_vs_current: provas antigas fixam “3º ao 5º dia”.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'caderneta-crianca-escopo',
      label: 'Caderneta da Criança',
      value: 'acompanhamento do nascimento aos 9 anos (física + digital Meu SUS)',
      detail:
        'MS 6ª ed. (2024): crescimento OMS, vacinas, desenvolvimento; versão digital no Meu SUS Digital (2025) complementar à física.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'teste-pezinho-objetivo',
      label: 'Teste do Pezinho — objetivo',
      value: 'rastrear doenças no RN em tempo oportuno',
      detail: 'Programa público obrigatório — intervenção precoce e seguimento.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'teste-coracaozinho-anormal',
      label: 'Teste do coraçãozinho — resultado anormal',
      value: 'SpO₂ <95% ou diferença ≥3% entre medidas',
      detail: 'Oximetria de pulso no RN ≥34 sem, 24–48 h de vida, antes da alta.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'leite-materno-geladeira',
      label: 'Leite materno ordenhado — geladeira',
      value: 'até 12 horas sob refrigeração',
      detail:
        'MS/RBLH e RDC 918/2024 (BLH): LHOC refrigerado ≤12 h (máx. 5 °C); freezer/congelador até 15 dias (domiciliar/BLH cru).',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'baixo-peso-nascimento',
      label: 'Baixo peso ao nascer',
      value: '< 2500 g — alto risco',
      detail: 'Classificação imediata ao nascer; ex.: RN 1750 g.',
      sourceId: 'saude-crianca-ms',
    },
    {
      id: 'pegadinha-penta-2-doses',
      label: 'Pegadinha pentavalente',
      value: 'esquema primário = 3 doses (2-4-6 meses), não 2',
      detail: 'Banca troca número de doses ou idade de início.',
      sourceId: 'saude-crianca-ms',
    },
  ],
};
