#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g47 (8 slugs · 18º lote reconcile outside-tail).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  epinefrinaRows,
  finalizeSlides as finalizeAnafilaxia,
  metaBase as metaAnafilaxia,
  slideMeta as anafilaxiaSlideMeta,
  type Pack as AnafilaxiaPack,
  type Q as AnafilaxiaQ,
} from './lib/urgenciasAnafilaxiaGolden';
import {
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';
import {
  finalizeSlides as finalizeConvulsao,
  metaBase as metaConvulsao,
  slideMeta as convulsaoSlideMeta,
  type Pack as ConvulsaoPack,
  type Q as ConvulsaoQ,
} from './lib/urgenciasConvulsaoGolden';
import {
  finalizeSlides as finalizeEngasgo,
  metaBase as metaEngasgo,
  ovaceRows,
  slideMeta as engasgoSlideMeta,
  type Pack as EngasgoPack,
  type Q as EngasgoQ,
} from './lib/urgenciasEngasgoGolden';
import {
  finalizeSlides as finalizeAvc,
  metaBase as metaAvc,
  slideMeta as avcSlideMeta,
  type Pack as AvcPack,
  type Q as AvcQ,
} from './lib/urgenciasAvcGolden';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  finalizeSlides as finalizeRcp,
  metaBase as metaRcp,
  rcpParamRows,
  slideMeta as rcpSlideMeta,
  type Pack as RcpPack,
  type Q as RcpQ,
} from './lib/urgenciasRcpGolden';
import {
  finalizeSlides as finalizeTrauma,
  metaBase as metaTrauma,
  slideMeta as traumaSlideMeta,
  type Pack as TraumaPack,
  type Q as TraumaQ,
} from './lib/urgenciasTraumaGolden';

const LOTE = 'urgencias-g47';
const REVIEWER = 'handcraft-urgencias-g47';
const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const RCP_FOOTER = 'PCR — vasopressor e ritmo conforme algoritmo';
const TRAUMA_FOOTER = 'Trauma — sinais de alarme compartimental';
const ENGASGO_FOOTER = 'OVACE grave — ciclos 5 costas + 5 abdominais';
const CHOQUE_FOOTER = 'Choque elétrico — desenergizar antes de tocar';
const CONVULSAO_FOOTER = 'Crise reativa — fator agudo reversível';
const ANAFILAXIA_FOOTER = 'PCR — adrenalina EV em intervalos protocolares';

type Branch = 'rcp' | 'trauma' | 'engasgo' | 'generico' | 'convulsao' | 'choque' | 'anafilaxia';
type Entry = { branch: Branch; pack: unknown; danger: Record<string, string> };

const AMBULANCIA_TIPOS = [
  { label: 'Tipo A', value: 'Remoção/transporte simples', badge: 'info' },
  { label: 'Tipo B', value: 'Suporte básico — oxigênio e monitor', badge: 'ok' },
  { label: 'Tipo C', value: 'Resgate/salvamento', badge: 'warn' },
  { label: 'Tipo D', value: 'Suporte avançado', badge: 'hot' },
  { label: 'Pegadinha', value: 'Banca troca rótulos entre tipos', badge: 'warn' },
];

const SPECS: Record<string, Entry> = {
  'ibade-enfermagem-urgencias-e-emergencias-1777103988389-6': {
    branch: 'choque',
    pack: {
      family: 'protocolo',
      guideline:
        'Choque fisiológico ou parada cardíaca — quando pulsos periféricos não são palpáveis, avaliar pulso femoral',
      roi_error: 'pulso_femoral_choque_pcr',
      cluster: 'Choque/PCR — pulso femoral',
      danger_footer: 'Gabarito B — femoral',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Pulso em choque/PCR',
          meta: choqueSlideMeta,
          items: [
            { label: 'Choque/PCR', detail: 'Choque fisiológico ou parada — pulsos periféricos impalpáveis.', icon: 'HeartPulse' },
            { label: 'Femoral', detail: 'Pulso central — último a desaparecer na hipoperfusão.', icon: 'Activity' },
            { label: '× Apical', detail: 'Ausculta — não palpação de pulso.', icon: 'Ban' },
            { label: '× Radial', detail: 'Periférico — some precocemente.', icon: 'XCircle' },
            { label: 'Pegadinha — distal', detail: 'Temporal/radial/poplíteo quando femoral é o central.', icon: 'AlertTriangle' },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Choque/PCR — local do pulso quando outros impalpáveis?',
            'Femoral — pulso central de grande calibre.',
            'Eliminar apical · radial · temporal · poplíteo.',
            'Marcar B.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: choqueSlideMeta,
          content: 'PULSO FEMORAL',
          rows: [
            { label: 'Femoral', value: 'Central — avaliar em choque/PCR', badge: 'hot' },
            { label: '× Radial', value: 'Periférico — some cedo', badge: 'warn' },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Pulso apical é auscultado — não palpação de pulso em choque/PCR.',
      C: 'Radial é periférico e desaparece cedo na hipoperfusão.',
      D: 'Temporal é distal — não substitui femoral.',
      E: 'Poplíteo é distal — femoral é o central cobrado.',
    },
  },
  'ibfc-enfermagem-semiologia-em-enfermagem-1779563512485-8': {
    branch: 'trauma',
    pack: {
      family: 'vf',
      guideline:
        'Síndrome compartimental pós-trauma — I a IV verdadeiras: etiologia, tempo, dor refratária e extensão passiva dolorosa',
      roi_error: 'compartimental_vf_i_iv',
      cluster: 'Síndrome compartimental — VF',
      danger_footer: 'Gabarito A — I–IV',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Compartimental — V/F',
          meta: traumaSlideMeta,
          items: [
            { label: 'I', detail: 'Trauma/fratura/esmagamento/queimadura — verdadeiro.', icon: 'Bone' },
            { label: 'II', detail: 'Horas após evento — até ~48 h — verdadeiro.', icon: 'Clock' },
            { label: 'III', detail: 'Dor não alivia com analgesia simples — verdadeiro.', icon: 'Activity' },
            { label: 'IV', detail: 'Dor na extensão passiva — patognomônico — verdadeiro.', icon: 'Hand' },
            { label: 'Pegadinha', detail: 'Combinações parciais omitindo II ou IV.', icon: 'AlertTriangle' },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: traumaSlideMeta,
          steps: ['Julgar I–IV item a item.', 'Todas verdadeiras.', 'Marcar A — I, II, III e IV.'],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: traumaSlideMeta,
          content: 'COMPARTIMENTAL',
          rows: [
            { label: 'I–IV', value: 'Todas verdadeiras nesta prova', badge: 'hot' },
            { label: 'IV', value: 'Extensão passiva dolorosa — patognomônico', badge: 'ok' },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: traumaSlideMeta,
          content: 'PEGADINHAS — compartimental',
          items: [
            { label: 'Letra B', detail: 'Só I e IV.', correct: 'II e III também corretas — gabarito A.' },
            { label: 'Letra C', detail: 'Só II e III.', correct: 'I e IV faltando — gabarito A.' },
            { label: 'Letra D', detail: 'Só III e IV.', correct: 'I e II faltando — gabarito A.' },
            { label: 'Letra E', detail: 'Só I e III.', correct: 'IV patognomônico — gabarito A.' },
          ],
          footer_rule: 'Gabarito A',
        },
      ],
    },
    danger: {},
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934936220-1': {
    branch: 'rcp',
    pack: {
      family: 'vf',
      guideline:
        'Tromboembolismo pulmonar em PCR — ritmo não chocável mais comum; fibrinólise exige avaliar sangramento; dose trombolítica sem consenso único',
      roi_error: 'tep_pcr_vf_sequencia',
      cluster: 'TEP — PCR sequência F,F,V,V',
      danger_footer: 'Gabarito A — F,F,V,V',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TEP — PCR',
          meta: rcpSlideMeta,
          items: [
            { label: 'TEP', detail: 'Tromboembolismo pulmonar — causa reversível de choque e PCR.', icon: 'Wind' },
            { label: '1ª', detail: 'Choque por obstrução — não cardiogênico clássico — falsa.', icon: 'XCircle' },
            { label: '2ª', detail: 'Ritmo chocável primário — falsa.', icon: 'Ban' },
            { label: '3ª–4ª', detail: 'Sangramento pós-fibrinólise · dose sem consenso — verdadeiras.', icon: 'CheckCircle' },
            { label: 'Pegadinha', detail: 'FV como ritmo típico do TEP.', icon: 'AlertTriangle' },
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpSlideMeta,
          steps: [
            'TEP/PCR — sequência V/F.',
            'F,F,V,V — marcar A.',
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: rcpSlideMeta,
          content: 'TEP + PCR',
          rows: [
            { label: 'Sequência', value: 'F, F, V, V', badge: 'hot' },
            { label: 'Ritmo', value: 'Não chocável mais comum — não FV primária', badge: 'warn' },
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: rcpSlideMeta,
          content: 'PEGADINHAS — TEP',
          items: [
            { label: 'Letra B', detail: 'Aceita ritmo chocável.', correct: '2ª é falsa — gabarito A.' },
            { label: 'Letra C', detail: 'Inverte 2ª e 3ª.', correct: 'Sequência A: F,F,V,V.' },
            { label: 'Letra D', detail: 'Três verdadeiras.', correct: '1ª e 2ª falsas — gabarito A.' },
          ],
          footer_rule: 'Gabarito A',
        },
      ],
    },
    danger: {},
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-8': {
    branch: 'engasgo',
    pack: {
      family: 'protocolo',
      guideline:
        'OVACE grave em adulto consciente — ciclos alternados de cinco golpes nas costas e cinco compressões abdominais até expulsão ou inconsciência',
      roi_error: 'ovace_grave_5_costas_5_abdominal',
      cluster: 'OVACE grave — AHA 5+5',
      danger_footer: 'Gabarito E',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'OVACE grave',
          meta: engasgoSlideMeta,
          items: [
            { label: 'Grave', detail: 'Tosse ineficaz · cianose · sem fluxo aéreo.', icon: 'AlertTriangle' },
            { label: 'Sequência', detail: 'Cinco golpes nas costas + cinco compressões abdominais.', icon: 'ListOrdered' },
            { label: '× Heimlich fixo', detail: 'Compressões isoladas em intervalo fixo — incorreto.', icon: 'Ban' },
            { label: '× Varredura oral', detail: 'Varredura cega não é 1ª linha.', icon: 'XCircle' },
            { label: 'Pegadinha', detail: 'Jaw thrust ou Heimlich isolado sem alternância.', icon: 'AlertTriangle' },
          ],
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: engasgoSlideMeta,
          steps: [
            'OVACE grave consciente — conduta AHA.',
            'Eliminar Heimlich isolado · jaw thrust · varredura oral.',
            'E ciclos 5 costas + 5 abdominais — marcar E.',
          ],
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: engasgoSlideMeta,
          content: 'OVACE GRAVE',
          rows: ovaceRows([
            { label: 'Adulto', value: '5 costas + 5 abdominais em ciclos', badge: 'hot' },
          ]),
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: engasgoSlideMeta,
          content: 'PEGADINHAS — OVACE',
          items: [
            { label: 'Letra A', detail: 'Heimlich em intervalo fixo.', correct: 'Alternar costas/abdome — gabarito E.' },
            { label: 'Letra B', detail: 'Jaw thrust isolado.', correct: 'Desobstrução ativa com ciclos 5+5 — E.' },
            { label: 'Letra C', detail: 'Jaw thrust + Heimlich fixo.', correct: 'Protocolo alterna costas/abdome — E.' },
            { label: 'Letra D', detail: 'Varredura oral + Heimlich.', correct: 'Varredura cega não é 1ª linha — E.' },
          ],
          footer_rule: 'Gabarito E',
        },
      ],
    },
    danger: {},
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-3': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Classificação de ambulâncias — Tipo D corresponde a ambulância de suporte avançado; demais tipos têm rótulos distintos',
      roi_error: 'ambulancia_tipo_d_avancado',
      cluster: 'SAMU — tipos de ambulância',
      danger_footer: 'Gabarito D',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Ambulâncias',
          meta: genericoSlideMeta,
          items: [
            { label: 'Comando', detail: 'Classificação das ambulâncias — alternativa correta.', icon: 'Ambulance' },
            { label: 'Tipo D', detail: 'Suporte avançado — correto.', icon: 'Stethoscope' },
            { label: '× A/B/C', detail: 'Rótulos trocados pela banca.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'Confundir resgate com avançado.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Eliminar A B C — rótulos incorretos.',
            'D Tipo D suporte avançado — marcar D.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'TIPOS SAMU',
          rows: AMBULANCIA_TIPOS,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Tipo B não é ambulância de resgate nesta classificação.',
      B: 'Tipo C não é ambulância de transporte simples.',
      C: 'Tipo A não é suporte básico.',
    },
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010585356-8': {
    branch: 'convulsao',
    pack: {
      family: 'conceito',
      guideline:
        'Crise epiléptica reativa — fator agudo reversível; febre é causa clássica de crise reativa aguda',
      roi_error: 'crise_reativa_febre',
      cluster: 'Crise epiléptica reativa',
      danger_footer: 'Gabarito A — febre',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Crise reativa',
          meta: convulsaoSlideMeta,
          items: [
            { label: 'Reativa', detail: 'Crise epiléptica reativa — fator agudo e potencialmente reversível.', icon: 'Search' },
            { label: 'Investigação', detail: 'Sintomas sistêmicos · comorbidades · medicamentos · histórico neurológico.', icon: 'FileText' },
            { label: 'Febre', detail: 'Fator agudo infeccioso — causa reativa clássica.', icon: 'Thermometer' },
            { label: '× Crônicas', detail: 'Parkinson · Alzheimer · EM — doença de base.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'Tumor de evolução lenta ≠ reativa aguda.', icon: 'AlertTriangle' },
          ],
          footer_rule: CONVULSAO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: convulsaoSlideMeta,
          steps: [
            'Crise epiléptica reativa — causa correta?',
            'Febre — marcar A.',
          ],
          footer_rule: CONVULSAO_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: convulsaoSlideMeta,
          content: 'REATIVA — FEBRE',
          rows: [
            { label: 'Reativa', value: 'Fator agudo reversível', badge: 'hot' },
            { label: 'Febre', value: 'Gatilho agudo clássico', badge: 'ok' },
          ],
          footer_rule: CONVULSAO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Parkinson é neurodegenerativa crônica.',
      C: 'Tumor crônico não é fator agudo reativo.',
      D: 'Esclerose múltipla é condição crônica.',
      E: 'Alzheimer é demência progressiva.',
    },
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104048047-0': {
    branch: 'anafilaxia',
    pack: {
      family: 'protocolo',
      guideline:
        'Parada cardiorrespiratória — adrenalina 1 mg endovenosa repetida a cada 3 a 5 minutos em todos os ritmos',
      roi_error: 'adrenalina_pcr_intervalo_3_5',
      cluster: 'PCR — intervalo adrenalina EV',
      danger_footer: 'Gabarito D — 3 a 5 minutos',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Adrenalina PCR',
          meta: anafilaxiaSlideMeta,
          items: [
            { label: 'PCR', detail: 'Parada cardiorrespiratória — adrenalina em todos os ritmos.', icon: 'HeartPulse' },
            { label: 'Dose', detail: 'Adrenalina 1 mg endovenosa.', icon: 'Syringe' },
            { label: 'Intervalo', detail: 'Repetir a cada poucos minutos no algoritmo.', icon: 'Clock' },
            { label: '× Longo', detail: 'Intervalos de 15–25 min — incorretos.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'Confundir minutos entre doses com ciclos de compressão.', icon: 'AlertTriangle' },
          ],
          footer_rule: ANAFILAXIA_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: anafilaxiaSlideMeta,
          steps: [
            'Adrenalina na PCR — intervalo entre doses?',
            'Eliminar intervalos longos.',
            'D 3 a 5 minutos — marcar D.',
          ],
          footer_rule: ANAFILAXIA_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: anafilaxiaSlideMeta,
          content: 'ADRENALINA PCR',
          rows: epinefrinaRows([
            { label: 'PCR EV', value: '1 mg EV a cada 3 a 5 minutos', badge: 'hot' },
          ]),
          footer_rule: ANAFILAXIA_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Intervalo de 20 a 25 minutos é excessivo.',
      B: '15 a 20 minutos subdosa vasopressor.',
      C: '7 a 10 minutos não é o intervalo cobrado.',
    },
  },
  'vunesp-enfermagem-processo-de-enfermagem-1780003637054-7': {
    branch: 'choque',
    pack: {
      family: 'protocolo',
      guideline:
        'Choque elétrico — interromper fonte com segurança, evitar contato direto, acionar emergência e iniciar ressuscitação após ambiente seguro',
      roi_error: 'choque_eletrico_seguranca_rcp',
      cluster: 'Choque elétrico — conduta inicial',
      danger_footer: 'Gabarito E',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Choque elétrico',
          meta: choqueSlideMeta,
          items: [
            { label: 'Risco', detail: 'Vítima energizada — não tocar sem segurança.', icon: 'Zap' },
            { label: '1ª', detail: 'Interromper fonte elétrica.', icon: 'Power' },
            { label: 'Depois', detail: 'Emergência + ressuscitação se necessário.', icon: 'Phone' },
            { label: '× Contato', detail: 'Tocar/puxar/água/metal — energiza socorrista.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'RCP antes de desenergizar.', icon: 'AlertTriangle' },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Choque elétrico — conduta inicial?',
            'E desenergizar + evitar contato + emergência + RCP segura — marcar E.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: choqueSlideMeta,
          content: 'ELÉTRICO — SEQUÊNCIA',
          rows: [
            { label: '1º', value: 'Desenergizar — não tocar', badge: 'hot' },
            { label: '2º', value: 'Acionar emergência', badge: 'ok' },
            { label: '3º', value: 'RCP após ambiente seguro', badge: 'info' },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: choqueSlideMeta,
          content: 'PEGADINHAS — elétrico',
          items: [
            { label: 'Letra A', detail: 'Tocar para pulso.', correct: 'Desenergizar primeiro — E.' },
            { label: 'Letra B', detail: 'Água no sistema.', correct: 'Água conduz — E.' },
            { label: 'Letra C', detail: 'Puxar vítima.', correct: 'Contato energiza — E.' },
            { label: 'Letra D', detail: 'Ferramenta metálica.', correct: 'Metal conduz — E.' },
          ],
          footer_rule: 'Gabarito E',
        },
      ],
    },
    danger: {},
  },
};

function readQuestaoJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function writeEntry(slug: string, entry: Entry, raw: unknown) {
  const path = join(loteQuestionsDir(LOTE), `${slug}.json`);
  const dangerMap = { [slug]: entry.danger };

  if (entry.branch === 'choque') {
    const q = raw as ChoqueQ;
    const pack = entry.pack as ChoquePack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaChoque(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeChoque(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } else if (entry.branch === 'trauma') {
    const q = raw as TraumaQ;
    const pack = entry.pack as TraumaPack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaTrauma(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeTrauma(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } else if (entry.branch === 'rcp') {
    const q = raw as RcpQ;
    const pack = entry.pack as RcpPack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaRcp(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeRcp(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } else if (entry.branch === 'engasgo') {
    const q = raw as EngasgoQ;
    const pack = entry.pack as EngasgoPack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaEngasgo(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeEngasgo(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } else if (entry.branch === 'convulsao') {
    const q = raw as ConvulsaoQ;
    const pack = entry.pack as ConvulsaoPack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaConvulsao(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeConvulsao(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } else if (entry.branch === 'anafilaxia') {
    const q = raw as AnafilaxiaQ;
    const pack = entry.pack as AnafilaxiaPack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaAnafilaxia(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeAnafilaxia(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } else {
    const q = raw as GenericoQ;
    const pack = entry.pack as GenericoPack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaGenerico(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeGenerico(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }
}

function main() {
  let ok = 0;
  for (const [slug, entry] of Object.entries(SPECS)) {
    writeEntry(slug, entry, readQuestaoJson(join(loteQuestionsDir(LOTE), `${slug}.json`)));
    ok++;
    console.log(`[handcraft:urgencias-g47] OK ${slug} (${entry.branch})`);
  }
  console.log(`[handcraft:urgencias-g47] total=${ok}`);
}

main();
