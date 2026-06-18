import type { GuidelineTable } from '@/lib/guidelines/types';

/** Intervalos e regras PNI — builders de Imunização devem citar estas entradas. */
export const PNI_INTERVALOS_2025: GuidelineTable = {
  id: 'pni-2025-intervalos',
  snapshot: 'PNI / Manual MS 2025',
  issuer: 'Ministério da Saúde',
  title: 'Manual de Normas e Procedimentos para Vacinação — intervalos',
  year: 2025,
  url: 'https://www.gov.br/saude/pt-br/vacinacao/calendario',
  entries: [
    {
      id: 'grace-period-4d',
      label: 'Grace period (antecipação)',
      value: '≤4 dias antes da idade mínima ou intervalo mínimo = dose válida',
      detail: 'Não registrar erro nem repetir só por antecipação dentro da margem.',
      sourceId: 'pni-2025-intervalos',
    },
    {
      id: 'scr-fa-menor-2a',
      label: 'SCR/SCRV × febre amarela <2 anos',
      value: 'Não simultâneo em rotina; intervalo mínimo 30 dias',
      sourceId: 'pni-2025-intervalos',
    },
    {
      id: 'vpc13-vpp23',
      label: 'VPC13 × VPP23',
      value: 'Não simultâneas; mín. 8 semanas; VPC13 primeiro; VPP23 antes → 1 ano para VPC13',
      sourceId: 'pni-2025-intervalos',
    },
    {
      id: 'oral-injetavel',
      label: 'Oral atenuada × injetável',
      value: 'Mesmo dia ou qualquer intervalo',
      sourceId: 'pni-2025-intervalos',
    },
    {
      id: 'virais-vivos-injetaveis',
      label: 'Virais vivos injetáveis',
      value: 'Mesmo dia OU ≥4 semanas entre si',
      sourceId: 'pni-2025-intervalos',
    },
  ],
};
