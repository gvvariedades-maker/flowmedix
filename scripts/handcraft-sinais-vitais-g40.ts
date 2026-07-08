#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g40 (8 slugs P1 vitals_temperatura batch 2).
 * Cluster Temperatura — vias e febre (33 slugs — g39=8, g40=8).
 *
 *   npm run handcraft:sinais-vitais-g40
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g40';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Temperatura corporal — vias, faixas e classificação clínica',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'vias axilar · oral · retal · timpânica · temporal',
    'afebril · febre · hiperpirexia · hipotermia',
    'retal 36,5–37,5 °C · axilar ~0,5 °C menor',
    'febre axilar ≥37,8 °C',
    'hiperpirexia ≥41 °C',
    'esfigmomanômetro — limite de insuflação 300 mmHg',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: 'vitals_temperatura',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const FEBRE_HIPOTERMIA_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Febre × hipotermia — definições',
    meta: slideMeta,
    items: [
      {
        label: 'Comando da prova',
        detail:
          'Temperatura reflete equilíbrio produção/perda de calor — assinalar afirmativa correta.',
        icon: 'Target',
      },
      {
        label: 'Febre',
        detail: 'Elevação da temperatura acima do normal — não é queda.',
        icon: 'Thermometer',
      },
      {
        label: 'Hipotermia',
        detail: 'Temperatura abaixo do normal — não é elevação persistente.',
        icon: 'Snowflake',
      },
      {
        label: 'Valor clínico',
        detail: 'Alterações térmicas sinalizam processo infeccioso ou inflamatório.',
        icon: 'Activity',
      },
      {
        label: 'Pegadinha — inversão A/B',
        detail: 'Alternativas A e B trocam febre e hipotermia.',
        icon: 'Ban',
      },
    ],
    footer_rule: 'Febre = alta · hipotermia = baixa',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Comando: afirmativa correta sobre temperatura corporal e equilíbrio térmico.',
      'Testar A — febre como queda: inverte definição → eliminar.',
      'Testar B — hipotermia como elevação persistente: inverte definição → eliminar.',
      'Testar D — temperatura imune a ambiente/metabolismo: falso — exercício, ambiente e hormônios alteram → eliminar.',
      'Testar C — alterações indicam infecção/inflamação: coerente com monitorização de SV → candidata.',
      'Marcar C.',
    ],
    footer_rule: 'C = alteração térmica tem significado clínico',
  },
  {
    type: 'golden_rule',
    slide_title: 'Referência — classificação térmica',
    meta: slideMeta,
    content: 'TERMOS CLÍNICOS × DIREÇÃO DA TEMPERATURA',
    rows: [
      { label: 'Afebril', value: '≈36,0 a 37,5 °C axilar', sv_kind: 'temp', badge: 'ok' },
      { label: 'Febre', value: 'Elevação acima do normal (axilar ≥37,8 °C)', sv_kind: 'temp', badge: 'hot' },
      { label: 'Hipotermia', value: 'Temperatura abaixo do normal (<35 °C grave)', sv_kind: 'temp', badge: 'warn' },
      { label: 'Hiperpirexia', value: 'Febre muito alta — ≥41 °C em muitas bancas', sv_kind: 'temp', badge: 'hot' },
      { label: 'Significado clínico', value: 'Pode indicar infecção ou inflamação', sv_kind: 'meta', badge: 'ok' },
    ],
    footer_rule: 'Não inverta febre e hipotermia',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — DEFINIÇÕES TÉRMICAS',
    items: [
      {
        label: 'Letra A — febre como queda',
        detail: 'Febre caracteriza-se por diminuição da temperatura abaixo do normal.',
        correct:
          'Febre é elevação acima do valor de referência — hipotermia é que representa queda.',
      },
      {
        label: 'Letra B — hipotermia como elevação',
        detail: 'Hipotermia ocorre quando a temperatura se mantém persistentemente elevada.',
        correct:
          'Hipotermia é temperatura abaixo do normal; elevação persistente configura febre ou hipertermia.',
      },
      {
        label: 'Letra D — sem influência ambiental',
        detail: 'Temperatura não sofre influência de fatores ambientais ou metabólicos.',
        correct:
          'Exercício, ambiente quente/frio, metabolismo e hormônios alteram a temperatura corporal.',
      },
    ],
    footer_rule: 'Só C fecha a gramática térmica',
  },
];

const SPECS: Record<string, Pack> = {
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343904263-1': {
    family: 'protocolo',
    guideline:
      'COFEN/MS — esfigmomanômetro: não inflar acima de 300 mmHg · calibrar periodicamente · limpeza com pano úmido (não autoclave)',
    roi_error: 'limite_inflacao_esfigmo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Esfignomanômetro — uso seguro',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Utilização correta do esfigmomanômetro — alternativa verdadeira.',
            icon: 'Target',
          },
          {
            label: 'Limite de insuflação',
            detail: 'Nunca ultrapassar 300 mmHg — risco de lesão vascular e dor.',
            icon: 'Gauge',
          },
          {
            label: 'Calibragem em repouso',
            detail: 'Ponteiro em zero — não 15±5 mmHg como “repouso” do manômetro.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — autoclave e temperatura',
            detail:
              'Autoclave em alta temperatura danifica esfigmomanômetro — não confundir com repouso térmico antes de aferir axilar.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — secagem ao sol',
            detail: 'Letra D: exposição solar danifica mangueira e escala.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Teto de insuflação = 300 mmHg',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: uso correto do esfigmomanômetro.',
          'Testar A — ponteiro em 15±5 mmHg em repouso: valor incorreto; repouso = zero → eliminar.',
          'Testar C — autoclavável: aneroide não suporta autoclave → eliminar.',
          'Testar D — secar ao sol após esterilização úmida: danifica componentes → eliminar.',
          'Testar E — autoclave com temperatura elevada: contraindicado ao equipamento → eliminar.',
          'Testar B — nunca inflar acima de 300 mmHg: limite de segurança clássico → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'B = teto 300 mmHg',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cuidados com esfigmomanômetro',
        meta: slideMeta,
        content: 'MANÔMETRO ANEROIDE — SEGURANÇA',
        rows: [
          { label: 'Insuflação máxima', value: 'Não ultrapassar 300 mmHg', sv_kind: 'pa', badge: 'hot' },
          { label: 'Repouso do ponteiro', value: 'Zero antes da aferição', sv_kind: 'pa', badge: 'ok' },
          { label: 'Limpeza', value: 'Pano úmido com desinfetante — sem autoclave', sv_kind: 'pa', badge: 'ok' },
          { label: 'Calibração', value: 'Verificar periodicamente conforme protocolo', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Autoclave danifica mangueira e bulbo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESFIGMOMANÔMETRO AVANÇASP',
        items: [
          {
            label: 'Letra A — repouso do ponteiro',
            detail: 'Em repouso, o ponteiro deve marcar cerca de 15 mmHg.',
            correct:
              'Em repouso o manômetro deve marcar zero — valor baixo de insuflação inicial não é “repouso do ponteiro”.',
          },
          {
            label: 'Letra C — autoclavável',
            detail: 'Equipamento pode ser autoclavado para esterilização.',
            correct:
              'Esfigmomanômetro aneroide não é autoclavável — calor e pressão danificam mangueira, bulbo e conexões.',
          },
          {
            label: 'Letra D — secagem ao sol',
            detail: 'Após esterilização úmida, expor ao sol para secar.',
            correct:
              'Sol e calor degradam borrachas e escala graduada — secar à sombra com pano limpo.',
          },
          {
            label: 'Letra E — autoclave',
            detail: 'Limpeza em autoclave com temperatura e pressão elevadas.',
            correct:
              'Mesmo com parâmetros “controlados”, autoclave não é método de processamento do esfigmomanômetro de bolso.',
          },
        ],
        footer_rule: 'Só B descreve limite seguro',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344158323-8': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — hiperpirexia ≥41 °C · subfebril 37,3–37,7 °C · febre axilar ≥37,8 °C · hipotermia <35 °C',
    roi_error: 'classificacao_hiperpirexia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hiperpirexia — termo e corte',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar hiperpirexia ao verificar sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Hiperpirexia',
            detail: 'Febre extrema — temperatura a partir de 41 °C.',
            icon: 'Thermometer',
          },
          {
            label: 'Subfebril',
            detail: '37,3 a 37,7 °C — elevação leve, não hiperpirexia.',
            icon: 'Activity',
          },
          {
            label: 'Afebril / hipotermia',
            detail: 'Normal ou abaixo — não configuram hiperpirexia.',
            icon: 'Snowflake',
          },
          {
            label: 'Pegadinha — febre comum',
            detail: 'Letra C: 37,3–37,7 °C é subfebril, não hiperpirexia.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Hiperpirexia = ≥41 °C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quando há hiperpirexia.',
          'Testar A — temperatura normal: sem elevação extrema → eliminar.',
          'Testar B — ausência de elevação: oposto de hiperpirexia → eliminar.',
          'Testar C — 37,3 a 37,7 °C: subfebril leve → eliminar.',
          'Testar D — abaixo do normal: hipotermia, não hiperpirexia → eliminar.',
          'Testar E — temperatura a partir de 41 °C: corte clássico de hiperpirexia → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Hiperpirexia → E (≥41 °C)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escala térmica clínica',
        meta: slideMeta,
        content: 'CLASSIFIQUE ANTES DE ROTULAR',
        rows: [
          { label: 'Afebril', value: '≈36,0 a 37,5 °C axilar', sv_kind: 'temp', badge: 'ok' },
          { label: 'Subfebril', value: '37,3 a 37,7 °C', sv_kind: 'temp', badge: 'warn' },
          { label: 'Febre', value: 'Axilar ≥37,8 °C (varia por fonte)', sv_kind: 'temp', badge: 'hot' },
          { label: 'Hiperpirexia', value: '≥41 °C', sv_kind: 'temp', badge: 'hot' },
          { label: 'Hipotermia', value: 'Abaixo do normal — <35 °C grave', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Hiperpirexia é o topo da escala febril',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPERPIREXIA AVANÇASP',
        items: [
          {
            label: 'Letra A — temperatura normal',
            detail: 'Temperatura corporal normal.',
            correct:
              'Normotermia não é hiperpirexia — falta elevação extrema acima de 41 °C.',
          },
          {
            label: 'Letra B — sem elevação',
            detail: 'Ausência da elevação da temperatura.',
            correct:
              'Hiperpirexia exige pico térmico elevado — ausência de elevação exclui o diagnóstico.',
          },
          {
            label: 'Letra C — 37,3 a 37,7 °C',
            detail: 'Temperatura entre 37,3 °C e 37,7 °C.',
            correct:
              'Faixa subfebril leve — distante do corte de 41 °C exigido para hiperpirexia.',
          },
          {
            label: 'Letra D — abaixo do normal',
            detail: 'Temperatura abaixo do valor normal.',
            correct:
              'Hipotermia é queda térmica — hiperpirexia é febre extrema no outro extremo da escala.',
          },
        ],
        footer_rule: 'Só E fecha ≥41 °C',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-verificacao-de-sinais-vitais-1779344137078-4': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — vias de temperatura: axilar · oral · retal · timpânica · temporal (frontal)',
    roi_error: 'vias_afericao_incompletas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vias de aferição da temperatura',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Locais do corpo onde pode ser aferida a temperatura corporal.',
            icon: 'Target',
          },
          {
            label: 'Vias periféricas',
            detail: 'Axilar e oral — acesso fácil no leito.',
            icon: 'Thermometer',
          },
          {
            label: 'Vias centrais/proximais',
            detail: 'Retal e timpânica — leitura mais próxima da temperatura central.',
            icon: 'Ear',
          },
          {
            label: 'Temporal',
            detail: 'Artéria temporal — termometria infravermelha na fronte.',
            icon: 'Scan',
          },
          {
            label: 'Pegadinha — lista incompleta',
            detail: 'Alternativas A, C e D omitem oral, timpânica ou temporal.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Cinco vias clássicas na prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: listar todos os locais válidos de aferição térmica.',
          'Testar A — falta oral e retal → eliminar.',
          'Testar C — só axilar, oral e retal — omite temporal e timpânica → eliminar.',
          'Testar D — falta oral e timpânica → eliminar.',
          'Testar E — lista parcial + requisito de “profissional treinado” (verdadeiro, mas incompleto) → eliminar.',
          'Testar B — axilar, temporal, timpânica, oral e retal: lista completa → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'B = lista integral de vias',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias de temperatura',
        meta: slideMeta,
        content: 'REGISTRE A VIA NO PRONTUÁRIO',
        rows: [
          { label: 'Axilar', value: 'Mais usada — ~0,5 °C abaixo da central', sv_kind: 'temp', badge: 'ok' },
          { label: 'Oral', value: 'Sublingual — não usar pós-bebida quente', sv_kind: 'temp', badge: 'ok' },
          { label: 'Retal', value: '36,5–37,5 °C normal — mais próxima da central', sv_kind: 'temp', badge: 'hot' },
          { label: 'Timpânica', value: 'Membrana do ouvido — técnica adequada', sv_kind: 'temp', badge: 'ok' },
          { label: 'Temporal', value: 'Artéria temporal — infravermelho', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Não compare valores sem anotar a via',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIAS COGEPS',
        items: [
          {
            label: 'Letra A — sem oral/retal',
            detail: 'Axilas, artéria temporal e membrana timpânica.',
            correct:
              'Faltam cavidade oral e reto — duas vias clássicas cobradas em semiologia.',
          },
          {
            label: 'Letra C — sem temporal/timpânica',
            detail: 'Axilas, cavidade oral e reto.',
            correct:
              'Omite artéria temporal e membrana timpânica — vias modernas frequentes em prova.',
          },
          {
            label: 'Letra D — sem oral/timpânica',
            detail: 'Axilas, artéria temporal e reto.',
            correct:
              'Falta cavidade oral e timpânica — lista incompleta para o comando.',
          },
          {
            label: 'Letra E — lista parcial + treinamento',
            detail: 'Axilar, oral e retal — exige profissional treinado.',
            correct:
              'Afirmativa sobre treinamento é verdadeira, mas a lista ignora temporal e timpânica.',
          },
        ],
        footer_rule: 'Só B enumera as cinco vias',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-verificacao-de-sinais-vitais-1779344205200-7': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — SV fundamentam diagnóstico e conduta · FR adulto 12–20 irpm · temperatura esofágica é via central em UTI',
    exam_vs_current:
      'Gabarito B nega papel dos SV na resolução clínica — clinicamente SV são essenciais; prova marca B como correta',
    roi_error: 'negar_papel_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Papel dos sinais vitais',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Afirmativa correta sobre sinais vitais como indicadores de saúde.',
            icon: 'Target',
          },
          {
            label: 'Função dos SV',
            detail: 'Monitoram eficiência de funções vitais — base para decisão clínica.',
            icon: 'Activity',
          },
          {
            label: 'FR adulto',
            detail: '12 a 20 irpm em repouso — não 8 a 12 (alternativa C).',
            icon: 'Wind',
          },
          {
            label: 'Temperatura central',
            detail: 'Esôfago é via central em monitorização invasiva (UTI).',
            icon: 'Thermometer',
          },
          {
            label: 'Gabarito da prova',
            detail: 'Letra B — texto literal do gabarito oficial.',
            icon: 'FileText',
          },
        ],
        footer_rule: 'Leia o comando + gabarito da banca',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa CORRETA sobre sinais vitais.',
          'Testar A — não medir após procedimento invasivo: falso — SV devem ser monitorados → eliminar.',
          'Testar C — FR adulto 8–12 irpm: bradipneia; normal é 12–20 → eliminar.',
          'Testar D — esôfago como via central: afirmativa verdadeira clinicamente → eliminar pelo gabarito.',
          'Testar E — não medir na transfusão: falso — monitorar SV na transfusão → eliminar.',
          'Testar B — gabarito oficial da prova → marcar B.',
          'Registrar: clinicamente SV contribuem para resolução — divergência em exam_vs_current.',
        ],
        footer_rule: 'Gabarito prova = B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SV e temperatura',
        meta: slideMeta,
        content: 'MONITORAR ≠ OPCIONAL',
        rows: [
          { label: 'FR adulto', value: '12 a 20 irpm em repouso', sv_kind: 'fr', badge: 'hot' },
          { label: 'Temperatura central', value: 'Esôfago, retal, timpânica (contexto)', sv_kind: 'temp', badge: 'ok' },
          { label: 'Transfusão', value: 'Monitorar SV — reação hemolítica/febre', sv_kind: 'meta', badge: 'warn' },
          { label: 'Pós-procedimento', value: 'Reavaliar SV após invasivo', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'FR 8–12 irpm = bradipneia no adulto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PAPEL DOS SV COGEPS',
        items: [
          {
            label: 'Letra A — não medir pós-invasivo',
            detail: 'SV não devem ser mensurados após procedimento invasivo.',
            correct:
              'Após procedimento invasivo a monitorização de SV é reforçada — não suspensa.',
          },
          {
            label: 'Letra C — FR 8–12 irpm',
            detail: 'FR aceitável no adulto: 8 a 12 respirações/min.',
            correct:
              'Bradipneia adulta é <12 irpm — faixa normal de repouso é 12 a 20 irpm.',
          },
          {
            label: 'Letra D — esôfago central',
            detail: 'Esôfago é local de mensuração de temperatura central.',
            correct:
              'Afirmativa clinicamente verdadeira — sonda esofágica mede temperatura central em UTI.',
          },
          {
            label: 'Letra E — não medir na transfusão',
            detail: 'SV não devem ser mensurados durante transfusão.',
            correct:
              'Transfusão exige vigilância de temperatura, PA e FC — reação febril é complicação clássica.',
          },
        ],
        footer_rule: 'Gabarito literal = B (ver exam_vs_current)',
      },
    ],
  },

  'fenix-instituto-enfermagem-verificacao-de-sinais-vitais-1779343967847-5': {
    family: 'conceito',
    guideline:
      'MS — febre = elevação acima do normal · hipotermia = queda · alterações térmicas sinalizam infecção/inflamação',
    roi_error: 'inversao_febre_hipotermia',
    slides: FEBRE_HIPOTERMIA_SLIDES,
  },

  'fenix-instituto-enfermagem-verificacao-de-sinais-vitais-1780000237780-9': {
    family: 'conceito',
    guideline:
      'MS — febre = elevação acima do normal · hipotermia = queda · alterações térmicas sinalizam infecção/inflamação',
    roi_error: 'inversao_febre_hipotermia',
    slides: FEBRE_HIPOTERMIA_SLIDES.map((s) =>
      s.type === 'danger_zone'
        ? { ...s, content: 'PEGADINHAS — DEFINIÇÕES TÉRMICAS FÊNIX' }
        : s,
    ),
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344127707-5': {
    family: 'protocolo',
    guideline:
      'MS — temp axilar 36,6 °C afebril · FC 60–100 normocárdico · FR 12–20 eupneia · taquipneia >20',
    roi_error: 'classificacao_sv_cruzada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Classificar cada SV separadamente',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Afirmativa correta sobre classificação de sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Temperatura 36,6 °C axilar',
            detail: 'Dentro da faixa afebril — não é febre.',
            icon: 'Thermometer',
          },
          {
            label: 'FC 80 bpm',
            detail: 'Entre 60 e 100 → normocárdico.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR 18 irpm',
            detail: 'Dentro de 12–20 → eupneia, não taquipneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — trocar termos',
            detail: 'Alternativas misturam taqui/bradi entre FC e FR.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Traduzir número → termo antes de julgar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual afirmativa classifica corretamente os SV.',
          'Testar A — 36,6 °C axilar febril: valor afebril → eliminar.',
          'Testar B — FR 18 taquipneico: 18 irpm é eupneia → eliminar.',
          'Testar C — FR 25 bradipneico: 25 é taquipneia, não bradi → eliminar.',
          'Testar D — FC 65 taquicárdico: 65 está na faixa normal → eliminar.',
          'Testar E — FC 80 normocárdico: 60–100 bpm → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'E = 80 bpm normocárdico',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'NÚMERO → TERMO CLÍNICO',
        rows: [
          { label: 'Temp axilar 36,6 °C', value: 'Afebril', sv_kind: 'temp', badge: 'ok' },
          { label: 'FC 60–100 bpm', value: 'Normocárdico', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 12–20 irpm', value: 'Eupneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR >20 irpm', value: 'Taquipneia', sv_kind: 'fr', badge: 'warn' },
          { label: 'Febre axilar', value: '≥37,8 °C (maioria das bancas)', sv_kind: 'temp', badge: 'hot' },
        ],
        footer_rule: '36,6 °C axilar não é febre',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLASSIFICAÇÃO FEPESE',
        items: [
          {
            label: 'Letra A — 36,6 °C febril',
            detail: 'Temperatura axilar de 36,6 °C está febril.',
            correct:
              '36,6 °C axilar está na faixa afebril — febre exige corte ≥37,8 °C na maioria das referências.',
          },
          {
            label: 'Letra B — FR 18 taquipneico',
            detail: 'FR de 18 irpm está taquipneico.',
            correct:
              '18 irpm está dentro de 12–20 — eupneia em repouso, não taquipneia (>20).',
          },
          {
            label: 'Letra C — FR 25 bradipneico',
            detail: 'FR de 25 irpm está bradipneico.',
            correct:
              '25 irpm é taquipneia — bradipneia seria FR <12 irpm no adulto.',
          },
          {
            label: 'Letra D — FC 65 taquicárdico',
            detail: 'FC de 65 bpm está taquicárdico.',
            correct:
              '65 bpm está entre 60 e 100 — normocárdico; taquicardia exige FC >100 bpm.',
          },
        ],
        footer_rule: 'Só E fecha FC + termo cardíaco',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344152370-5': {
    family: 'protocolo',
    guideline:
      'MS — temp axilar 36,5 °C afebril · FC 60–100 normocárdico · FR >20 taquipneia',
    roi_error: 'interpretacao_sv_combinada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso clínico — traduzir os 3 SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Paciente 50 anos: 36,5 °C axilar · FR 27 mpm · FC 80 bpm — classificar conjunto.',
            icon: 'Target',
          },
          {
            label: '36,5 °C axilar',
            detail: 'Valor afebril — não configurar febre.',
            icon: 'Thermometer',
          },
          {
            label: 'FC 80 bpm',
            detail: 'Faixa 60–100 → normocárdico.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR 27 mpm',
            detail: 'Acima de 20 → taquipneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — eupneia',
            detail: 'Letra A chama FR 27 de eupneia — erro clássico.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Afebril · taquipneico · normocárdico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: combinar classificação dos três sinais vitais do caso.',
          'Temperatura: 36,5 °C axilar → afebril.',
          'FC: 80 bpm → normocárdico (60–100).',
          'FR: 27 mpm → taquipneia (>20 irpm).',
          'Testar A — eupneia: FR 27 não é eupneia → eliminar.',
          'Testar B — taquicárdico: FC 80 é normal → eliminar.',
          'Testar D/E — febril: temp afebril → eliminar.',
          'Testar C — afebril, taquipneico e normocárdico → candidata.',
          'Marcar C.',
        ],
        footer_rule: 'C = tríade correta do caso',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — caso 50 anos',
        meta: slideMeta,
        content: 'TRADUZA CADA VALOR ANTES DE COMBINAR',
        rows: [
          { label: '36,5 °C axilar', value: 'Afebril', sv_kind: 'temp', badge: 'ok' },
          { label: '80 bpm', value: 'Normocárdico', sv_kind: 'fc', badge: 'ok' },
          { label: '27 mpm', value: 'Taquipneico', sv_kind: 'fr', badge: 'hot' },
          { label: 'FR normal adulto', value: '12 a 20 irpm', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: '27 mpm ≠ eupneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CASO FEPESE 50 ANOS',
        items: [
          {
            label: 'Letra A — eupneia',
            detail: 'Afebril, eupneico e normocárdico.',
            correct:
              'FR 27 mpm é taquipneia — eupneia exige 12–20 irpm em repouso.',
          },
          {
            label: 'Letra B — taquicárdico',
            detail: 'Afebril, taquipneico e taquicárdico.',
            correct:
              'FC 80 bpm está na faixa normocárdica — taquicardia exige >100 bpm.',
          },
          {
            label: 'Letra D — febril',
            detail: 'Febril, taquipneico e normocárdico.',
            correct:
              '36,5 °C axilar é afebril — febre exigiria elevação acima do corte (≥37,8 °C axilar).',
          },
          {
            label: 'Letra E — febril + taquicárdico',
            detail: 'Febril, taquipneico e taquicárdico.',
            correct:
              'Erra temperatura (afebril) e FC (normocárdica) — só acerta taquipneia.',
          },
        ],
        footer_rule: 'Só C combina os três achados',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sv-g40] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g40] total=${ok}`);
}

main();
