#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g40 (8 slugs · 11º lote urgencias_generico).
 * Inferência: choque só quando enunciado ancora choque (hemorragia 30% · defin distributivo) · demais generico.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  choqueTypesRows,
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  perfusaoRows,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';
import {
  finalizeSlides as finalizeEngasgo,
  metaBase as metaEngasgo,
  slideMeta as engasgoSlideMeta,
  type Pack as EngasgoPack,
  type Q as EngasgoQ,
} from './lib/urgenciasEngasgoGolden';

const LOTE = 'urgencias-g40';
const REVIEWER = 'handcraft-urgencias-g40';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const CHOQUE_FOOTER = 'Choque = perfusão inadequada — reconhecer e estabilizar';
const ENGASGO_FOOTER = 'Gestante/obeso = compressões torácicas — não abdominais';

/** Emergência × urgência hipertensiva (SBV 2014). */
const HIPERTENSA_EMERGENCIA_URGENCIA = [
  { label: 'Emergência', value: 'PA elevada + lesão aguda de órgão-alvo + risco iminente', badge: 'hot' },
  { label: 'Urgência', value: 'PA muito alta sem dano agudo progressivo de órgão-alvo', badge: 'ok' },
  { label: 'Conduta emergência', value: 'Redução pressórica imediata em ambiente monitorizado', badge: 'warn' },
  { label: '× Trocar termos', value: 'Rotular emergência como urgência hipertensiva — erro de nomenclatura', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca usa rótulo errado com descrição de gravidade máxima', badge: 'info' },
];

/** Emergência × urgência (conceito assistencial). */
const EMERGENCIA_VS_URGENCIA = [
  { label: 'Emergência', value: 'Risco iminente de morte — atendimento imediato', badge: 'hot' },
  { label: 'Urgência', value: 'Agravo relevante sem risco imediato de vida — atendimento rápido', badge: 'ok' },
  { label: 'Local', value: 'Pode ocorrer em qualquer lugar — comunidade aciona SAMU 192', badge: 'info' },
  { label: '× Definição invertida', value: 'Atribuir critério de emergência ao rótulo urgência', badge: 'warn' },
  { label: 'Pegadinha', value: 'Primeira metade verdadeira (local/SAMU) + definição errada no fim', badge: 'warn' },
];

/** Hemorragia digestiva alta × baixa. */
const HDA_HDB_SINAIS = [
  { label: 'Alta', value: 'Proximal ao ligamento de Treitz — hematêmese e melena', badge: 'hot' },
  { label: 'Baixa', value: 'Distal ao Treitz — enterorragia e melena possível', badge: 'ok' },
  { label: '× Hematêmese na baixa', value: 'Vômito com sangue — sinal de sangramento alto', badge: 'warn' },
  { label: 'Sistêmico', value: 'Hipotensão · taquicardia · síncope — comum em ambas se volumosas', badge: 'info' },
  { label: 'Pegadinha', value: 'Banca mistura sinais altos na hemorragia baixa', badge: 'warn' },
];

/** Choque hemorrágico — sinais qualitativos (sem inventar faixas numéricas). */
const CHOQUE_HEMORRAGICO_QUALITATIVO = [
  { label: 'Perda maciça', value: 'Grande perda volêmica pode evoluir para choque', badge: 'hot' },
  { label: 'Perfusão', value: 'Pele fria · palidez · sudorese · pulso fraco', badge: 'ok' },
  { label: 'Compensação', value: 'Taquicardia e taquipneia tentam manter débito', badge: 'warn' },
  { label: '× FC subestimada', value: 'Banca atribui faixa leve de FC à perda grave descrita', badge: 'warn' },
  { label: 'Pegadinha', value: 'Lista sinais plausíveis mas erra intensidade da resposta circulatória', badge: 'info' },
];

/** Choque distributivo — fisiopatologia. */
const CHOQUE_DISTRIBUTIVO_FISIO = [
  { label: 'Definição', value: 'Perfusão e oxigenação tecidual inadequadas', badge: 'hot' },
  { label: 'RVS', value: 'Resistência vascular sistêmica diminuída — vasodilatação', badge: 'ok' },
  { label: 'Débito', value: 'Aumento compensatório insuficiente do débito cardíaco', badge: 'ok' },
  { label: 'Distribuição', value: 'Fluxo sanguíneo irregular — má perfusão periférica', badge: 'warn' },
  { label: 'Exemplos', value: 'Séptico · anafilático · neurogênico', badge: 'info' },
];

/** XABCDE — prioridade X (generico). */
const XABCDE_X_PRIORIDADE = [
  { label: 'Primária', value: 'Ameaças imediatas à vida — sequência ordenada', badge: 'hot' },
  { label: 'X', value: 'Hemorragia exsanguinante — controlar antes da via aérea', badge: 'hot' },
  { label: 'A', value: 'Via aérea + proteção cervical', badge: 'ok' },
  { label: 'Sequência', value: 'X precede A quando sangramento maciço ameaça vida', badge: 'warn' },
  { label: 'Pegadinha', value: 'Priorizar intubação com hemorragia ativa — erro', badge: 'info' },
];

/** OVACE — gestante/obesa (generico, sem drift engasgo). */
const OVACE_GESTANTE_OBESA = [
  { label: 'Consciente', value: 'Obstrução por corpo estranho com vítima responsiva', badge: 'hot' },
  { label: 'Gestante/obesa', value: 'Compressões torácicas — proteger útero e vísceras', badge: 'hot' },
  { label: '× Abdome', value: 'Compressão abdominal em grávida/obeso — contraindicada', badge: 'warn' },
  { label: 'Objetivo', value: 'Gerar tosse efetiva e desobstruir via aérea', badge: 'ok' },
  { label: 'Pegadinha', value: 'Banca inverte manobra torácica × abdominal na população especial', badge: 'info' },
];

/** Objeto encravado — APH penetrante (generico). */
const OBJETO_ENCRAVADO_APH = [
  { label: 'Não remover', value: 'Objeto fincado tampona — extração no hospital', badge: 'hot' },
  { label: 'Estabilizar', value: 'Imobilizar junto ao corpo com curativos ao redor', badge: 'ok' },
  { label: 'Transporte', value: 'Encaminhamento rápido para centro cirúrgico', badge: 'warn' },
  { label: '× Extrair no local', value: 'Remoção pré-hospitalar — risco de hemorragia maciça', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca testa conduta correta de ferimento penetrante com lâmina', badge: 'info' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type ChoqueEntry = { branch: 'choque'; pack: ChoquePack; danger: Record<string, string> };
type EngasgoEntry = { branch: 'engasgo'; pack: EngasgoPack; danger: Record<string, string> };

type HandcraftEntry = GenericoEntry | ChoqueEntry | EngasgoEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-6': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'SBV 2014 — emergência hipertensiva tem lesão aguda de órgão-alvo e risco iminente; não confundir rótulo com urgência hipertensiva',
      roi_error: 'emergencia_hipertensiva_rotulo',
      cluster: 'Certo ou errado — urgência hipertensiva SBV',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Hipertensão — julgar',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Afirmativa',
              detail:
                'Descreve dano agudo progressivo de órgão-alvo com risco iminente — perfil de emergência hipertensiva.',
              icon: 'FileText',
            },
            {
              label: 'Emergência',
              detail: 'PA elevada + lesão aguda de órgão-alvo + necessidade de redução imediata.',
              icon: 'HeartPulse',
            },
            {
              label: 'Urgência',
              detail: 'PA muito alta sem dano agudo de órgão-alvo — sem risco iminente de morte.',
              icon: 'Activity',
            },
            {
              label: '× Rótulo',
              detail: 'Afirmativa chama de urgência hipertensiva o quadro de emergência.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca acerta gravidade e erra nomenclatura assistencial.',
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
            'Protocolo SBV 2014 — julgar afirmativa sobre crise hipertensiva.',
            'Dano agudo de órgão-alvo com risco iminente — quadro de emergência hipertensiva.',
            'Rótulo urgência hipertensiva — falso para essa gravidade descrita.',
            'Afirmativa combina descrição grave com termo inadequado.',
            'Marcar B (Errado).',
            'Fixação: emergência = órgão-alvo + risco iminente · urgência = sem dano agudo.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Crise hipertensiva — decore',
          meta: genericoSlideMeta,
          content: 'EMERGÊNCIA × URGÊNCIA HIPERTENSIVA',
          rows: HIPERTENSA_EMERGENCIA_URGENCIA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — rotulo urgencia hipertensiva',
          items: [
            {
              label: 'Certo — validar rótulo',
              detail: 'Aceitar urgência hipertensiva para quadro com risco iminente de morte.',
              correct:
                'Descrição corresponde a emergência hipertensiva — rótulo urgência invalida a afirmativa.',
            },
            {
              label: 'Pegadinha — gravidade certa',
              detail: 'Banca embute critérios de emergência no nome de urgência.',
              correct:
                'Lesão aguda de órgão-alvo com risco iminente é emergência — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida rótulo urgência hipertensiva para quadro com dano agudo de órgão-alvo e risco iminente — nomenclatura inadequada.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-7': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Urgência ≠ emergência — risco de morte iminente define emergência; urgência exige atendimento rápido sem risco imediato de vida',
      roi_error: 'emergencia_definida_como_urgencia',
      cluster: 'Certo ou errado — definição urgência/emergência',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Urgência — julgar',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Situações podem ocorrer em qualquer local — comunidade aciona SAMU 192.',
              icon: 'MapPin',
            },
            {
              label: 'Emergência',
              detail: 'Risco iminente de morte ou sofrimento intenso — tratamento imediato.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Urgência',
              detail: 'Necessidade de atendimento rápido sem risco imediato de vida.',
              icon: 'Clock',
            },
            {
              label: '× Definição',
              detail: 'Afirmativa atribui critério de emergência ao termo urgências.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Primeira metade correta (local/SAMU) + classificação errada no fim.',
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
            'Julgar afirmativa sobre onde ocorrem urgências e sua definição.',
            'Ocorrência em qualquer local e acionar SAMU — verdadeiro isoladamente.',
            'Definir urgências como risco de morte iminente — falso — isso é emergência.',
            'Frase mistura verdade contextual com erro conceitual na classificação.',
            'Marcar B (Errado).',
            'Fixação: emergência = morte iminente · urgência = rápido sem risco imediato.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Emergência × urgência',
          meta: genericoSlideMeta,
          content: 'CLASSIFICAÇÃO ASSISTENCIAL',
          rows: EMERGENCIA_VS_URGENCIA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — definir urgencia como emergencia',
          items: [
            {
              label: 'Certo — aceitar definição',
              detail: 'Validar que urgências implicam risco de morte e tratamento imediato.',
              correct:
                'Esse critério define emergência, não urgência — afirmativa globalmente falsa.',
            },
            {
              label: 'Pegadinha — SAMU correto',
              detail: 'Banca usa verdade sobre local e SAMU para embutir erro de classificação.',
              correct:
                'Acionar SAMU é correto, mas urgência não equivale a risco iminente de morte — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo aceita definição de urgência com risco iminente de morte — confunde com emergência.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-8': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Hemorragia digestiva baixa — hematêmese é sinal de sangramento alto (proximal ao Treitz), não de HDB',
      roi_error: 'hdb_hematemese',
      cluster: 'Certo ou errado — hemorragia digestiva baixa',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'HDB — julgar',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'HDB',
              detail: 'Sangramento distal ao ligamento de Treitz — enterorragia predominante.',
              icon: 'Droplets',
            },
            {
              label: 'HDA',
              detail: 'Proximal ao Treitz — hematêmese e melena.',
              icon: 'Activity',
            },
            {
              label: '× Hematêmese',
              detail: 'Vômito com sangue listado na hemorragia baixa — inconsistência anatômica.',
              icon: 'Ban',
            },
            {
              label: 'Sistêmico',
              detail: 'Hipotensão e taquicardia podem ocorrer em sangramento volumoso de qualquer nível.',
              icon: 'HeartPulse',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca mistura sinal alto na hemorragia baixa.',
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
            'Hemorragia digestiva baixa — julgar lista de sinais e sintomas.',
            'Enterorragia e melena — compatíveis com HDB.',
            'Hematêmese — sinal de hemorragia alta — não de baixa.',
            'Hipotensão e taquicardia — podem ocorrer, mas hematêmese invalida a frase.',
            'Marcar B (Errado).',
            'Fixação: hematêmese = alta · enterorragia = baixa.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'HDA × HDB — decore',
          meta: genericoSlideMeta,
          content: 'SINAIS POR NÍVEL DIGESTIVO',
          rows: HDA_HDB_SINAIS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — hematêmese na HDB',
          items: [
            {
              label: 'Certo — aceitar hematêmese',
              detail: 'Validar hematêmese como sinal de hemorragia digestiva baixa.',
              correct:
                'Hematêmese indica sangramento alto — presença na lista de HDB torna a afirmativa falsa.',
            },
            {
              label: 'Pegadinha — sinais sistêmicos',
              detail: 'Banca embute hipotensão correta com sinal anatômico errado.',
              correct:
                'Sinais de instabilidade podem existir, mas hematêmese não pertence à HDB — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida hematêmese na hemorragia digestiva baixa — sinal exclusivo de sangramento alto.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104024064-9': {
    branch: 'choque',
    pack: {
      family: 'certo_errado',
      guideline:
        'Choque hemorrágico grave — perda volêmica maciça cursa com taquicardia marcada e hipoperfusão; banca subestima intensidade da resposta circulatória na afirmativa',
      roi_error: 'choque_hemorragico_fc_subestimada',
      cluster: 'Certo ou errado — hemorragia perda volêmica choque',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Choque hemorrágico — julgar',
          meta: choqueSlideMeta,
          items: [
            {
              label: 'Hemorragias',
              detail:
                'Perdas volêmicas maciças em adultos podem causar estado de choque.',
              icon: 'Droplets',
            },
            {
              label: 'Sinais listados',
              detail:
                'Ansiedade · sede · pulso radial fraco · pele fria · palidez · suor frio · enchimento capilar lentificado.',
              icon: 'Thermometer',
            },
            {
              label: 'Taquicardia',
              detail:
                'Afirmativa atribui taquicardia branda à perda grave descrita — inconsistência.',
              icon: 'HeartPulse',
            },
            {
              label: 'Respiração',
              detail: 'Frequência respiratória elevada — compatível com compensação.',
              icon: 'Wind',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca lista sinais plausíveis mas subestima intensidade da taquicardia esperada.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Hemorragias com grande perda volêmica em adultos — julgar afirmativa.',
            'Estado de choque com ansiedade · sede · pulso radial fraco — plausível.',
            'Taquicardia atribuída é branda para gravidade da perda citada — inconsistência.',
            'Pele fria · palidez · suor frio · taquipneia · enchimento capilar lentificado — coerentes.',
            'Conjunto erra intensidade da resposta circulatória — afirmativa falsa.',
            'Marcar B (Errado).',
            'Fixação: choque grave = taquicardia marcada — não resposta branda com perda maciça.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Choque hemorrágico — decore',
          meta: choqueSlideMeta,
          content: 'PERDA MACIÇA E PERFUSÃO',
          rows: [...CHOQUE_HEMORRAGICO_QUALITATIVO, ...perfusaoRows().slice(0, 2)],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: choqueSlideMeta,
          content: 'PEGADINHAS — fc branda choque grave',
          items: [
            {
              label: 'Certo — aceitar faixa leve',
              detail: 'Validar taquicardia branda como resposta à perda volêmica grave descrita.',
              correct:
                'Choque por perda maciça exige resposta circulatória intensa — afirmativa subestima e fica falsa.',
            },
            {
              label: 'Pegadinha — sinais corretos',
              detail: 'Banca mistura pele fria e pulso fraco com intensidade errada da FC.',
              correct:
                'Hipoperfusão é plausível, mas a intensidade da taquicardia não condiz — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida resposta circulatória leve para perda volêmica grave — incoerente com choque hemorrágico.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104031822-0': {
    branch: 'choque',
    pack: {
      family: 'certo_errado',
      guideline:
        'Choque distributivo — queda da resistência vascular sistêmica com débito compensatório insuficiente e má distribuição do fluxo',
      roi_error: 'choque_distributivo_fisiopatologia',
      cluster: 'Certo ou errado — choque distributivo definição',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Choque — tipos',
          meta: choqueSlideMeta,
          items: [
            {
              label: 'Choque',
              detail: 'Síndrome de perfusão e oxigenação tecidual inadequadas.',
              icon: 'Activity',
            },
            {
              label: 'Distributivo',
              detail: 'Vasodilatação — resistência vascular sistêmica diminuída.',
              icon: 'Wind',
            },
            {
              label: 'Débito',
              detail: 'Aumento compensatório do débito cardíaco — insuficiente.',
              icon: 'HeartPulse',
            },
            {
              label: 'Fluxo',
              detail: 'Distribuição irregular — má perfusão periférica.',
              icon: 'GitBranch',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir distributivo com falha primária da bomba cardíaca.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Julgar afirmativa sobre choque distributivo.',
            'Choque = perfusão inadequada — verdadeiro.',
            'Queda da RVS com débito compensatório insuficiente — verdadeiro.',
            'Distribuição irregular do fluxo com má perfusão — verdadeiro.',
            'Marcar A (Certo).',
            'Fixação: distributivo = vasodilatação + má distribuição do fluxo.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Choque distributivo — decore',
          meta: choqueSlideMeta,
          content: 'TIPOS DE CHOQUE',
          rows: [...choqueTypesRows(), ...CHOQUE_DISTRIBUTIVO_FISIO.slice(1, 3)],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: choqueSlideMeta,
          content: 'PEGADINHAS — negar choque distributivo',
          items: [
            {
              label: 'Errado — negar fisiopatologia',
              detail: 'Marcar Errado nega queda da RVS e má distribuição do fluxo.',
              correct:
                'Choque distributivo cursa com vasodilatação e perfusão irregular — afirmativa verdadeira.',
            },
            {
              label: 'Pegadinha — confundir com cardiogênico',
              detail: 'Atribuir falha primária da bomba ao distributivo.',
              correct:
                'Problema central é vasodilatação e distribuição — afirmativa descreve corretamente o distributivo.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega definição correta do choque distributivo — RVS baixa e má distribuição do fluxo.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104070286-8': {
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
              detail: 'Sequência ordenada para ameaças imediatas à vida.',
              icon: 'Target',
            },
            {
              label: 'X — exsanguinação',
              detail: 'Hemorragias externas graves — controlar antes da via aérea.',
              icon: 'Droplets',
            },
            {
              label: 'A — via aérea',
              detail: 'Garantir permeabilidade após conter sangramento maciço.',
              icon: 'Wind',
            },
            {
              label: 'Sequência',
              detail: 'X precede A quando perda sanguínea ameaça vida.',
              icon: 'ListOrdered',
            },
            {
              label: 'Pegadinha',
              detail: 'Inverter X e A — priorizar via aérea com hemorragia ativa.',
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
            'Avaliação primária — julgar afirmativa sobre XABCDE.',
            'X = hemorragias externas graves — verdadeiro.',
            'Contenção antes da via aérea — verdadeiro.',
            'Afirmativa alinhada ao protocolo pré-hospitalar de trauma.',
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
                'O X controla hemorragia grave antes da via aérea — afirmativa verdadeira.',
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
  'igeduc-enfermagem-urgencias-e-emergencias-1777104077075-0': {
    branch: 'engasgo',
    pack: {
      family: 'protocolo',
      guideline:
        'Obstrução de via aérea em gestante ou obeso — compressões torácicas substituem abdominais para proteger útero e vísceras',
      roi_error: 'ovace_gestante_toracica_nao_abdominal',
      cluster: 'Certo ou errado — OVACE gestante/obesa',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'OVACE — gestante/obesa',
          meta: engasgoSlideMeta,
          items: [
            {
              label: 'Obstrução',
              detail: 'Vítima de obstrução de vias aéreas por corpo estranho — consciente.',
              icon: 'Target',
            },
            {
              label: 'Gestante/obesa',
              detail: 'Compressões torácicas — evitar lesão uterina e vísceras abdominais.',
              icon: 'Heart',
            },
            {
              label: '× Abdome',
              detail: 'Afirmativa pede compressões abdominais ao invés de torácicas — invertido.',
              icon: 'Ban',
            },
            {
              label: 'Objetivo',
              detail: 'Desobstruir via aérea com manobra segura e eficaz.',
              icon: 'Wind',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca inverte manobra torácica × abdominal na população especial.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: engasgoSlideMeta,
          steps: [
            'Obstrução por corpo estranho em gestante ou obeso — julgar manobra.',
            'Vítima consciente — desobstrução ativa indicada.',
            'Compressões abdominais — falso — risco à gestação e vísceras.',
            'Compressões torácicas — conduta correta nesta população.',
            'Marcar B (Errado).',
            'Fixação: grávida/obeso = torácica · adulto padrão = abdominal.',
          ],
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'OVACE — população especial',
          meta: engasgoSlideMeta,
          content: 'MANOBRA POR PERFIL',
          rows: OVACE_GESTANTE_OBESA,
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: engasgoSlideMeta,
          content: 'PEGADINHAS — abdominal gestante',
          items: [
            {
              label: 'Certo — aceitar abdominal',
              detail: 'Validar compressões abdominais em gestante ou obeso.',
              correct:
                'Gestante e obeso recebem compressões torácicas — afirmativa com abdominal é falsa.',
            },
            {
              label: 'Pegadinha — inverter manobras',
              detail: 'Banca troca torácica (correta) por abdominal (errada).',
              correct:
                'Manobra abdominal é padrão no adulto, mas não na gestante/obeso — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida compressões abdominais em gestante ou obeso — manobra inadequada para proteção uterina.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1777104077075-1': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Ferimento penetrante com objeto encravado — não remover no APH; estabilizar e transportar rapidamente',
      roi_error: 'objeto_encravado_nao_remover',
      cluster: 'Certo ou errado — arma branca objeto fincado',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Objeto encravado — APH',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Ferimento por arma branca com lâmina ainda no corpo.',
              icon: 'Target',
            },
            {
              label: 'Não remover',
              detail: 'Objeto tampona vasos — extração só no hospital.',
              icon: 'Ban',
            },
            {
              label: 'Estabilizar',
              detail: 'Fixar objeto junto ao corpo com curativos ao redor.',
              icon: 'Bandage',
            },
            {
              label: 'Transporte',
              detail: 'Encaminhamento rápido para cirurgia.',
              icon: 'Ambulance',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca testa tentação de extrair no local para “limpar” ferida.',
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
            'Arma branca com lâmina fincada — julgar conduta pré-hospitalar.',
            'Não remover objeto no local — verdadeiro.',
            'Estabilizar junto ao corpo — verdadeiro.',
            'Transporte rápido ao hospital — verdadeiro.',
            'Marcar A (Certo).',
            'Fixação: encravado = tamponamento — remover no APH agrava hemorragia.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Penetrante — decore',
          meta: genericoSlideMeta,
          content: 'OBJETO ENCRAVADO NO APH',
          rows: OBJETO_ENCRAVADO_APH,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — remover objeto APH',
          items: [
            {
              label: 'Errado — negar conduta',
              detail: 'Marcar Errado nega estabilização e transporte com objeto fincado.',
              correct:
                'Não remover e estabilizar para transporte rápido — afirmativa descreve conduta correta.',
            },
            {
              label: 'Pegadinha — extrair no local',
              detail: 'Parece lógico retirar lâmina para avaliar ferida.',
              correct:
                'Remoção pré-hospitalar descompensa tamponamento — conduta da afirmativa está certa.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega conduta de não remover e estabilizar objeto encravado — extração no APH é contraindicada.',
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
    } else if (entry.branch === 'choque') {
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
    } else {
      const q = raw as EngasgoQ;
      const slides = finalizeEngasgo(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaEngasgo(
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
    console.log(`[handcraft:urgencias-g40] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g40] total=${ok}`);
}

main();
