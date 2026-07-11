#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g39 (8 slugs · 10º lote urgencias_generico).
 * Inferência: peçonhentos/Glasgow C/E → generico · escorpionismo cardíaco com choque no enunciado → choque.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeGenerico,
  glasgowDomainsRows,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';

const LOTE = 'urgencias-g39';
const REVIEWER = 'handcraft-urgencias-g39';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';

/** Escorpionismo — soro específico e temperatura. */
const ESCORPIAO_SORO_TEMP = [
  { label: 'Soro', value: 'Antiescorpiônico — não antiofídico (serpente)', badge: 'hot' },
  { label: 'Temperatura', value: 'Gravidade pode elevar temperatura — não hipotermia como descrito', badge: 'warn' },
  { label: 'Sudorese', value: 'Pode acompanhar quadro sistêmico grave', badge: 'ok' },
  { label: '× Antiofídico', value: 'Soro de serpente não trata escorpionismo', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca mistura hipotermia com rótulo hipertermia na mesma frase', badge: 'info' },
];

/** Abelha — reação tóxica × alérgica. */
const ABELHA_TOXICO_ALERGICA = [
  { label: 'Tóxica', value: 'Dose de veneno — múltiplas ferroadas aumentam gravidade', badge: 'hot' },
  { label: 'Alérgica', value: 'Sensibilidade individual — pode ocorrer com uma picada', badge: 'ok' },
  { label: 'Variáveis', value: 'Local · número de ferroadas · histórico alérgico', badge: 'info' },
  { label: '× Inversão', value: 'Tóxica com uma picada e alérgica só com múltiplas — falso', badge: 'warn' },
  { label: 'Gravidade', value: 'Múltiplas picadas → sobrecarga de veneno', badge: 'warn' },
];

/** Escorpionismo — cronologia e população. */
const ESCORPIAO_CRONOLOGIA = [
  { label: 'Dor local', value: 'Constante — pode ter parestesias', badge: 'ok' },
  { label: 'Sistêmico', value: 'Moderado/grave — horas, não dias', badge: 'hot' },
  { label: 'População', value: 'Crianças têm maior risco — não exclusivo delas', badge: 'warn' },
  { label: '× Só crianças', value: 'Adultos também evoluem para gravidade sistêmica', badge: 'warn' },
  { label: '× Após dias', value: 'Manifestações sistêmicas surgem precocemente', badge: 'info' },
];

/** Ofidismo — identificação e soro. */
const OFIDISMO_IDENTIFICACAO = [
  { label: 'Identificar', value: 'Auxilia alta de não peçonhentas e escolha do antiveneno', badge: 'hot' },
  { label: 'Antiveneno', value: 'Específico por gênero — Bothrops · Crotalus · Lachesis', badge: 'ok' },
  { label: 'Alta', value: 'Serpente não peçonhenta → observação e dispensa quando seguro', badge: 'info' },
  { label: '× Sem influência', value: 'Identificação não orienta soro — falso', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca acerta primeira metade e erra a relação com antiveneno', badge: 'warn' },
];

/** Escorpionismo grave — manifestações cardíacas (sem vocabulário de ramo choque). */
const ESCORPIAO_CARDIO_TRATAMENTO = [
  { label: 'Cardíaco', value: 'Arritmias e insuficiência cardíaca congestiva podem ocorrer', badge: 'hot' },
  { label: 'Específico', value: 'Soro antiescorpiônico + suporte avançado', badge: 'ok' },
  { label: 'Suporte', value: 'Monitorização e estabilização hemodinâmica hospitalar', badge: 'ok' },
  { label: '× Vitamina C', value: 'Ácido ascórbico citado na banca — sem indicação no escorpionismo', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca lista manifestações reais e erra o tratamento', badge: 'info' },
];

/** TCE — classificação pela Glasgow. */
const TCE_GLASGOW_CLASSIFICACAO = [
  { label: 'Leve', value: 'Glasgow 13–15', badge: 'ok' },
  { label: 'Moderado', value: 'Glasgow 9–12', badge: 'hot' },
  { label: 'Grave', value: 'Glasgow 3–8', badge: 'warn' },
  { label: '× 14–15 moderado', value: 'Banca inverte faixa — 14–15 é leve', badge: 'warn' },
  { label: 'Ferramenta', value: 'Glasgow gradua gravidade do TCE', badge: 'info' },
];

/** XABCDE — prioridade X (generico). */
const XABCDE_X_PRIORIDADE = [
  { label: 'Primária', value: 'Ameaças imediatas à vida — sequência ordenada', badge: 'hot' },
  { label: 'X', value: 'Hemorragia exsanguinante — controlar antes da via aérea', badge: 'hot' },
  { label: 'A', value: 'Via aérea + proteção cervical', badge: 'ok' },
  { label: 'Sequência', value: 'X precede A quando sangramento maciço ameaça vida', badge: 'warn' },
  { label: 'Pegadinha', value: 'Priorizar intubação com hemorragia ativa — erro', badge: 'info' },
];

/** Evisceração abdominal — curativo oclusivo (generico). */
const EVISCERACAO_ABDOMINAL_GENERICO = [
  { label: 'Posicionar', value: 'Decúbito dorsal — joelhos fletidos se tolerado', badge: 'ok' },
  { label: 'Não reintroduzir', value: 'Jamais empurrar vísceras para dentro', badge: 'hot' },
  { label: 'Umedecer', value: 'Compressas estéreis com soro fisiológico sobre vísceras', badge: 'ok' },
  { label: 'Oclusivo', value: 'Curativo oclusivo — proteger sem pressionar', badge: 'hot' },
  { label: '× Compressivo', value: 'Curativo compressivo — proibido em evisceração', badge: 'warn' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type ChoqueEntry = { branch: 'choque'; pack: ChoquePack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | ChoqueEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'igeduc-enfermagem-urgencias-e-emergencias-1777104018306-1': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Escorpionismo — antiescorpiônico específico; gravidade cursa com hipertermia, não hipotermia com rótulo invertido',
      roi_error: 'escorpionismo_antiofidico_hipotermia',
      cluster: 'Certo ou errado — escorpionismo imunodeprimido',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Escorpionismo — julgar',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Afirmativa',
              detail:
                'Mistura queda de temperatura com rótulo hipertermia + soro antiofídico — múltiplos erros na mesma frase.',
              icon: 'FileText',
            },
            {
              label: 'Temperatura',
              detail: 'Escorpionismo grave pode elevar temperatura — não reduzir abaixo do normal como descrito.',
              icon: 'Thermometer',
            },
            {
              label: 'Soro',
              detail: 'Antiescorpiônico — antiofídico é para acidente ofídico (serpente).',
              icon: 'Syringe',
            },
            {
              label: '× Antiofídico',
              detail: 'Soro de serpente não substitui antiescorpiônico.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca embute contradição térmica (hipo + hiper) na mesma afirmativa.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Escorpionismo em imunodeprimido — julgar afirmativa completa.',
            'Redução de temperatura rotulada como hipertermia — contradição conceitual.',
            'Soro antiofídico — indicado para serpentes, não escorpião.',
            'Frase combina erros térmicos + soro errado → globalmente falsa.',
            'Marcar B (Errado).',
            'Fixação: escorpião = antiescorpiônico · não confundir com ofídico.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Escorpião — decore',
          meta: genericoSlideMeta,
          content: 'ESCORPIONISMO — SORO E TEMPERATURA',
          rows: ESCORPIAO_SORO_TEMP,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — aceitar antiofidico escorpiao',
          items: [
            {
              label: 'Certo — validar afirmativa',
              detail: 'Aceitar a frase inteira ignora soro de serpente e contradição térmica.',
              correct:
                'Antiofídico não trata escorpionismo e a descrição térmica é incoerente — afirmativa falsa.',
            },
            {
              label: 'Pegadinha — soro de serpente',
              detail: 'Banca usa antiofídico onde o correto é antiescorpiônico.',
              correct:
                'Escorpionismo exige soro antiescorpiônico específico — antiofídico invalida a afirmativa.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida antiofídico e a contradição térmica — ambos tornam a afirmativa globalmente falsa.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104018306-2': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Picada de abelha — reação tóxica proporcional à dose (múltiplas picadas); alérgica depende da sensibilidade (pode ser com uma)',
      roi_error: 'abelha_toxica_alergica_invertida',
      cluster: 'Certo ou errado — abelhas reações variáveis',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Abelha — tipos de reação',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Variabilidade',
              detail: 'Local · número de ferroadas · histórico alérgico modulam a resposta.',
              icon: 'Target',
            },
            {
              label: 'Tóxica',
              detail: 'Quantidade de veneno — múltiplas picadas sobrecarregam.',
              icon: 'Zap',
            },
            {
              label: 'Alérgica',
              detail: 'Resposta imune — uma picada basta em indivíduo sensibilizado.',
              icon: 'Shield',
            },
            {
              label: '× Inversão',
              detail: 'Afirmativa troca: tóxica com uma picada e alérgica só com múltiplas.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Primeira metade verdadeira — segunda inverte mecanismos.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Picada de abelha — julgar afirmativa sobre tipos de reação.',
            'Reações diferem conforme local, dose e histórico — verdadeiro.',
            'Tóxica com uma só picada — falso: tóxica correlaciona-se à dose (múltiplas).',
            'Alérgica só com múltiplas — falso: alergia independe do número.',
            'Marcar B (Errado).',
            'Fixação: tóxica = dose · alérgica = sensibilidade.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Abelha — decore',
          meta: genericoSlideMeta,
          content: 'PICADA DE ABELHA',
          rows: ABELHA_TOXICO_ALERGICA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — inverter toxica e alergica',
          items: [
            {
              label: 'Certo — aceitar inversão',
              detail: 'Validar tóxica com uma picada e alérgica só com múltiplas.',
              correct:
                'Reação tóxica é proporcional ao veneno (múltiplas picadas); alérgica depende da sensibilidade — afirmativa invertida.',
            },
            {
              label: 'Pegadinha — dose × imunidade',
              detail: 'Banca acerta variabilidade e erra o par tóxico/alérgico.',
              correct:
                'Mecanismo tóxico segue dose de veneno; alérgico pode ocorrer com uma ferroada — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo aceita a inversão tóxica/alérgica — mecanismos opostos aos descritos na literatura de envenenamento.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104018306-4': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Escorpionismo — dor local constante; manifestações sistêmicas precoces (horas) e não exclusivas de crianças',
      roi_error: 'escorpionismo_sistemico_tempo_crianca',
      cluster: 'Certo ou errado — escorpionismo dor local',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Escorpionismo — evolução',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Dor local',
              detail: 'Característica frequente — pode ter parestesias no entorno.',
              icon: 'Activity',
            },
            {
              label: 'Sistêmico',
              detail: 'Moderado/grave — evolui em poucas horas, não após dias.',
              icon: 'Clock',
            },
            {
              label: 'Crianças',
              detail: 'Maior risco de gravidade — adultos também podem evoluir mal.',
              icon: 'Users',
            },
            {
              label: '× Só crianças',
              detail: 'Afirmativa restringe sistêmico exclusivamente a pediatria.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca acerta dor local e erra tempo + população.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Escorpionismo — julgar afirmativa sobre dor e evolução sistêmica.',
            'Dor local constante com parestesias — verdadeiro isoladamente.',
            'Sistêmico exclusivo de crianças — falso: adultos também evoluem para gravidade.',
            'Manifestações após dias — falso: surgem em horas nos casos moderados/graves.',
            'Marcar B (Errado).',
            'Fixação: sistêmico precoce · criança maior risco, não exclusividade.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Escorpião — evolução',
          meta: genericoSlideMeta,
          content: 'CRONOLOGIA DO ESCORPIONISMO',
          rows: ESCORPIAO_CRONOLOGIA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — sistemico apos dias',
          items: [
            {
              label: 'Certo — aceitar dias e só crianças',
              detail: 'Valida manifestações sistêmicas tardias e exclusivas de pediatria.',
              correct:
                'Manifestações sistêmicas surgem em horas e não são exclusivas de crianças — afirmativa falsa.',
            },
            {
              label: 'Pegadinha — dor local correta',
              detail: 'Banca embute verdade local com erro de tempo e população.',
              correct:
                'Dor local é verdadeira, mas sistêmico precoce e em qualquer idade — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo aceita sistêmico tardio e exclusivo de crianças — contradiz evolução precoce em todas as faixas etárias.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104018306-5': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Acidente ofídico — identificar serpente orienta alta de não peçonhentas e escolha do antiveneno específico',
      roi_error: 'ofidismo_identificacao_antiveneno',
      cluster: 'Certo ou errado — serpentes identificar animal',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Ofidismo — identificação',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Identificar',
              detail: 'Reconhecer animal — diferencia peçonhenta de não peçonhenta.',
              icon: 'Search',
            },
            {
              label: 'Alta segura',
              detail: 'Serpente não peçonhenta → observação e dispensa quando protocolo permitir.',
              icon: 'UserCheck',
            },
            {
              label: 'Antiveneno',
              detail: 'Gênero define soro — Bothrops · Crotalus · Lachesis.',
              icon: 'Syringe',
            },
            {
              label: '× Sem influência',
              detail: 'Afirmativa nega que identificação oriente antiveneno.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Primeira metade correta — segunda nega papel do soro.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Acidente com serpente — julgar papel da identificação do animal.',
            'Identificar permite dispensar não peçonhentas — verdadeiro.',
            'Identificação não contribui para antiveneno — falso.',
            'Gênero da serpente define soro específico — essencial.',
            'Marcar B (Errado).',
            'Fixação: identificar = alta segura + soro certo.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Ofidismo — decore',
          meta: genericoSlideMeta,
          content: 'IDENTIFICAÇÃO DA SERPENTE',
          rows: OFIDISMO_IDENTIFICACAO,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — negar papel do antiveneno',
          items: [
            {
              label: 'Certo — negar antiveneno',
              detail: 'Aceitar que identificação não orienta soro.',
              correct:
                'Identificação do gênero é decisiva para antiveneno específico — afirmativa falsa na segunda metade.',
            },
            {
              label: 'Pegadinha — metade certa',
              detail: 'Banca acerta alta de não peçonhentas e erra indicação de soro.',
              correct:
                'Dispensa de não peçonhentas é verdadeira, mas identificação guia antiveneno — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida que identificação não orienta antiveneno — nega função essencial na escolha do soro.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104018306-6': {
    branch: 'choque',
    pack: {
      family: 'protocolo',
      guideline:
        'Escorpionismo grave — arritmias e ICC podem evoluir para colapso circulatório; tratamento é soro antiescorpiônico e suporte, não ácido ascórbico',
      roi_error: 'escorpionismo_ascorbico_nao_tratamento',
      cluster: 'Certo ou errado — escorpionismo arritmias tratamento',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Escorpionismo — cardíaco',
          meta: choqueSlideMeta,
          items: [
            {
              label: 'Manifestações',
              detail: 'Arritmias e insuficiência cardíaca congestiva podem surgir na gravidade.',
              icon: 'HeartPulse',
            },
            {
              label: 'Colapso',
              detail: 'Instabilidade hemodinâmica grave exige monitorização e suporte avançado.',
              icon: 'Activity',
            },
            {
              label: 'Tratamento',
              detail: 'Soro antiescorpiônico + estabilização em ambiente hospitalar.',
              icon: 'Syringe',
            },
            {
              label: '× Vitamina C',
              detail: 'Ácido ascórbico citado na banca — sem indicação protocolar.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca lista manifestações plausíveis e erra a droga de tratamento.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Colapso circulatório = soro + suporte — não vitamina C',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Escorpionismo em adulto — julgar afirmativa sobre manifestações e tratamento.',
            'Arritmias e ICC podem ocorrer na gravidade — plausível.',
            'Tratar com ácido ascórbico — falso — sem indicação específica.',
            'Conduta correta: soro antiescorpiônico + suporte hemodinâmico.',
            'Marcar B (Errado).',
            'Fixação: gravidade cardíaca = soro + UTI · não vitamina C.',
          ],
          footer_rule: 'Colapso circulatório = soro + suporte — não vitamina C',
        },
        {
          type: 'golden_rule',
          slide_title: 'Escorpião grave — decore',
          meta: choqueSlideMeta,
          content: 'MANIFESTAÇÕES E TRATAMENTO',
          rows: ESCORPIAO_CARDIO_TRATAMENTO,
          footer_rule: 'Colapso circulatório = soro + suporte — não vitamina C',
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: choqueSlideMeta,
          content: 'PEGADINHAS — acido ascorbico escorpiao',
          items: [
            {
              label: 'Certo — aceitar vitamina C',
              detail: 'Valida ácido ascórbico como tratamento do escorpionismo grave.',
              correct:
                'Tratamento específico é soro antiescorpiônico com suporte avançado — vitamina C invalida a afirmativa.',
            },
            {
              label: 'Pegadinha — sintomas reais',
              detail: 'Banca usa manifestações cardíacas verdadeiras com droga errada.',
              correct:
                'Arritmias e ICC podem ocorrer, mas ácido ascórbico não é tratamento — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida ácido ascórbico no escorpionismo grave — conduta sem base protocolar.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-1': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Avaliação primária trauma — X do XABCDE controla hemorragia exsanguinante antes da via aérea',
      roi_error: 'xabcde_x_hemorragia_primeiro',
      cluster: 'Certo ou errado — avaliação primária XABCDE',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'XABCDE — prioridade X',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Primária',
              detail: 'Identificar e corrigir ameaças imediatas à vida — sequência ordenada.',
              icon: 'Target',
            },
            {
              label: 'X — exsanguinação',
              detail: 'Controlar hemorragia maciça antes de abrir via aérea.',
              icon: 'Droplets',
            },
            {
              label: 'A — via aérea',
              detail: 'Proteger coluna cervical ao garantir permeabilidade.',
              icon: 'Wind',
            },
            {
              label: 'Sequência',
              detail: 'X precede A quando sangramento exsanguinante ameaça vida.',
              icon: 'ListOrdered',
            },
            {
              label: 'Pegadinha',
              detail: 'Inverter X e A — priorizar intubação com sangramento ativo.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Avaliação primária no trauma — julgar afirmativa sobre XABCDE.',
            'Processo ordenado para ameaças imediatas — verdadeiro.',
            'X = conter hemorragia exsanguinante antes da via aérea — verdadeiro.',
            'Afirmativa alinhada ao XABCDE pré-hospitalar.',
            'Marcar A (Certo).',
            'Fixação: sangramento massivo mata antes da hipóxia — X antes de A.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'XABCDE — decore',
          meta: genericoSlideMeta,
          content: 'AVALIAÇÃO PRIMÁRIA TRAUMA',
          rows: XABCDE_X_PRIORIDADE,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — negar X antes de A',
          items: [
            {
              label: 'Errado — negar XABCDE',
              detail: 'Marcar Errado nega hemorragia exsanguinante como prioridade absoluta.',
              correct:
                'O X controla hemorragia exsanguinante antes da via aérea — afirmativa verdadeira.',
            },
            {
              label: 'Pegadinha — A antes de X',
              detail: 'Confundir sequência clássica ABC com XABCDE do trauma.',
              correct:
                'No trauma com sangramento maciço, X precede A — afirmativa descreve o protocolo correto.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega que hemorragia exsanguinante seja prioridade antes da via aérea no XABCDE.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-2': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Evisceração abdominal — não reintroduzir vísceras; compressas umedecidas com SF e curativo oclusivo (não compressivo)',
      roi_error: 'evisceracao_oclusivo_nao_compressivo',
      cluster: 'Certo ou errado — trauma abdominal evisceração',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Evisceração — APH',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Trauma abdominal com vísceras expostas — manter calor e posição.',
              icon: 'Target',
            },
            {
              label: 'Não reintroduzir',
              detail: 'Jamais empurrar vísceras para dentro do abdome.',
              icon: 'Ban',
            },
            {
              label: 'Umedecer',
              detail: 'Compressas estéreis com soro fisiológico sobre as vísceras.',
              icon: 'Droplets',
            },
            {
              label: 'Oclusivo',
              detail: 'Curativo oclusivo — cobrir sem pressionar.',
              icon: 'Bandage',
            },
            {
              label: '× Compressivo',
              detail: 'Afirmativa pede curativo compressivo — conduta proibida.',
              icon: 'XCircle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Evisceração abdominal — julgar afirmativa completa.',
            'Posicionamento adequado e não reintroduzir — verdadeiro.',
            'Compressas umedecidas com soro fisiológico — verdadeiro.',
            'Curativo compressivo — falso — deve ser oclusivo.',
            'Cirurgia definitiva — verdadeiro, mas erro no curativo invalida frase.',
            'Marcar B (Errado).',
            'Fixação: oclusivo + úmido · nunca compressivo · nunca reintroduzir.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Evisceração — decore',
          meta: genericoSlideMeta,
          content: 'TRAUMA ABDOMINAL — EVISCERAÇÃO',
          rows: EVISCERACAO_ABDOMINAL_GENERICO,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — curativo compressivo',
          items: [
            {
              label: 'Certo — aceitar compressivo',
              detail: 'Valida curativo compressivo sobre vísceras expostas.',
              correct:
                'Curativo deve ser oclusivo e não compressivo — a compressão invalida a afirmativa global.',
            },
            {
              label: 'Pegadinha — resto correto',
              detail: 'Banca embute não reintroduzir e SF corretos com compressivo errado.',
              correct:
                'Posicionamento e umedecimento estão certos, mas compressivo é proibido — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida curativo compressivo em evisceração — pressão sobre vísceras é contraindicada.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-4': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'TCE — Glasgow gradua gravidade; moderado = 9–12 (não 14–15, que é leve)',
      roi_error: 'tce_glasgow_moderado_faixa',
      cluster: 'Certo ou errado — TCE Glasgow classificação',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TCE — Glasgow',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Ferramenta',
              detail: 'Escala de Coma de Glasgow gradua gravidade do TCE.',
              icon: 'Brain',
            },
            {
              label: 'Leve',
              detail: 'Glasgow 13–15 — alteração mínima.',
              icon: 'CheckCircle',
            },
            {
              label: 'Moderado',
              detail: 'Glasgow 9–12 — rebaixamento intermediário.',
              icon: 'Activity',
            },
            {
              label: 'Grave',
              detail: 'Glasgow 3–8 — coma profundo.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca classifica 14–15 como moderado — na verdade é leve.',
              icon: 'XCircle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'TCE — julgar afirmativa sobre Glasgow e classificação.',
            'Glasgow avalia gravidade do TCE — verdadeiro.',
            'TCE moderado = Glasgow 14–15 — falso — essa faixa é leve.',
            'Moderado correto: Glasgow 9–12.',
            'Marcar B (Errado).',
            'Fixação: leve 13–15 · moderado 9–12 · grave 3–8.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'TCE — decore faixas',
          meta: genericoSlideMeta,
          content: 'CLASSIFICAÇÃO DO TCE',
          rows: TCE_GLASGOW_CLASSIFICACAO,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — 14-15 moderado',
          items: [
            {
              label: 'Certo — aceitar 14–15 moderado',
              detail: 'Valida Glasgow 14–15 como TCE moderado.',
              correct:
                'Glasgow 14–15 classifica TCE leve — moderado é 9–12 — afirmativa falsa.',
            },
            {
              label: 'Pegadinha — Glasgow verdadeiro',
              detail: 'Banca acerta uso da escala e erra a faixa numérica.',
              correct:
                'Glasgow gradua TCE corretamente, mas 14–15 é leve, não moderado — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo aceita Glasgow 14–15 como moderado — faixa corresponde a TCE leve.',
    },
  },
};

function readQuestaoJson(path: string): unknown {
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, entry] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = readQuestaoJson(path);

    if (entry.branch === 'generico') {
      const q = raw as GenericoQ;
      const slides = finalizeGenerico(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaGenerico(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    } else {
      const q = raw as ChoqueQ;
      const slides = finalizeChoque(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaChoque(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    }

    ok++;
    console.log(`[handcraft:urgencias-g39] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g39] total=${ok}`);
}

main();
