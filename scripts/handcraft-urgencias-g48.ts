#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g48 (7 slugs · lote FINAL 340/340).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';
import {
  finalizeSlides as finalizeAnafilaxia,
  metaBase as metaAnafilaxia,
  slideMeta as anafilaxiaSlideMeta,
  type Pack as AnafilaxiaPack,
  type Q as AnafilaxiaQ,
} from './lib/urgenciasAnafilaxiaGolden';
import {
  finalizeSlides as finalizeEngasgo,
  metaBase as metaEngasgo,
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

const LOTE = 'urgencias-g48';
const REVIEWER = 'handcraft-urgencias-g48';
const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const RCP_FOOTER = 'PCR — vasopressor e ritmo conforme algoritmo';
const TRAUMA_FOOTER = 'Trauma — sinais de alarme compartimental';
const ENGASGO_FOOTER = 'OVACE grave — ciclos 5 costas + 5 abdominais';
const CHOQUE_FOOTER = 'Choque elétrico — desenergizar antes de tocar';

const OVACE_ADULTO_AHA_ROWS = [
  { label: 'OVACE grave', value: 'Tosse ineficaz · cianose · sem fluxo aéreo', badge: 'hot' },
  { label: 'Sinal universal', value: 'Mãos ao pescoço — vítima consciente lúcida', badge: 'ok' },
  { label: 'AHA 5+5', value: 'Ciclos de 5 golpes nas costas + 5 compressões abdominais', badge: 'hot' },
  { label: '× Heimlich fixo', value: 'Intervalo fixo sem alternância — incorreto', badge: 'warn' },
  { label: '× Varredura cega', value: 'Não é 1ª linha em consciente com obstrução grave', badge: 'warn' },
];

type Branch = 'rcp' | 'trauma' | 'engasgo' | 'generico' | 'choque' | 'anafilaxia';
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
      danger_footer: 'Gabarito A — I, II, III e IV',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Compartimental — V/F',
          meta: traumaSlideMeta,
          items: [
            { label: 'I', detail: 'Antebraço pós-trauma/fratura/esmagamento/queimadura — verdadeira.', icon: 'Bone' },
            { label: 'II', detail: 'Apresentação poucas horas após evento — janela aguda — verdadeira.', icon: 'Clock' },
            { label: 'III', detail: 'Dor não alivia com repouso, analgesia ou anti-inflamatória — verdadeira.', icon: 'Activity' },
            { label: 'IV', detail: 'Dor desproporcional na extensão passiva dos dedos — patognomônica — verdadeira.', icon: 'Hand' },
            { label: 'Pegadinha', detail: 'Combinações parciais omitindo II ou IV — banca troca subconjuntos.', icon: 'AlertTriangle' },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: traumaSlideMeta,
          steps: [
            'Síndrome compartimental — julgar afirmativas I a IV.',
            'I trauma/fratura/esmagamento/queimadura no antebraço — verdadeira.',
            'II poucas horas após evento desencadeante — janela aguda — verdadeira.',
            'III dor refratária a repouso/analgesia/anti-inflamatória — verdadeira.',
            'IV extensão passiva dolorosa — patognomônica — verdadeira.',
            'Todas corretas — marcar A (I, II, III e IV).',
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: traumaSlideMeta,
          content: 'COMPARTIMENTAL',
          rows: [
            { label: 'I–IV', value: 'Todas verdadeiras nesta prova', badge: 'hot' },
            { label: 'IV', value: 'Extensão passiva dolorosa — patognomônico', badge: 'ok' },
            { label: 'III', value: 'Dor não alivia com analgesia simples', badge: 'warn' },
          ],
          footer_rule: TRAUMA_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: traumaSlideMeta,
          content: 'PEGADINHAS — compartimental',
          items: [
            { label: 'Letra B', detail: 'Só I e IV — omite II e III.', correct: 'II e III também corretas — gabarito A.' },
            { label: 'Letra C', detail: 'Só II e III — omite I e IV.', correct: 'I e IV faltando — gabarito A.' },
            { label: 'Letra D', detail: 'Só III e IV — omite I e II.', correct: 'I e II faltando — gabarito A.' },
            { label: 'Letra E', detail: 'Só I e III — omite IV patognomônico.', correct: 'IV extensão passiva — gabarito A.' },
          ],
          footer_rule: 'Gabarito A — I, II, III e IV',
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
            { label: 'I', detail: 'Obstrução artéria pulmonar — choque obstrutivo, não cardiogênico clássico — falsa.', icon: 'XCircle' },
            { label: 'II', detail: 'PCR com ritmo chocável/FV primário — falsa no TEP.', icon: 'Ban' },
            { label: 'III', detail: 'Avaliar sangramento pós-fibrinólise na escolha da intervenção — verdadeira.', icon: 'CheckCircle' },
            { label: 'IV', detail: 'Dose trombolítica sem consenso único em PCR por TEP — verdadeira.', icon: 'CheckCircle' },
            { label: 'Pegadinha — FV', detail: 'Banca induz ritmo chocável/FV como típico do tromboembolismo pulmonar em PCR.', icon: 'AlertTriangle' },
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: rcpSlideMeta,
          steps: [
            'TEP/tromboembolismo pulmonar em PCR — julgar afirmativas I a IV (V/F).',
            'I obstrução artéria pulmonar + mediadores vasoativos — choque obstrutivo — falsa.',
            'II ritmo chocável/FV primário — pegadinha — falsa.',
            'III fibrinólise — avaliar sangramento e contraindicações — verdadeira.',
            'IV terapêutica trombolítica — dose ideal sem consenso — verdadeira.',
            'Sequência F,F,V,V — marcar A.',
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: rcpSlideMeta,
          content: 'TEP + PCR',
          rows: [
            { label: 'Sequência', value: 'F, F, V, V', badge: 'hot' },
            { label: 'II', value: 'Ritmo não chocável mais comum — não FV primária', badge: 'warn' },
            { label: 'III', value: 'Avaliar sangramento antes de fibrinólise', badge: 'ok' },
          ],
          footer_rule: RCP_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: rcpSlideMeta,
          content: 'PEGADINHAS — TEP PCR',
          items: [
            { label: 'Letra B', detail: 'Aceita II — ritmo chocável/FV primário no TEP.', correct: 'Pegadinha ritmo chocável — II é falsa — gabarito A.' },
            { label: 'Letra C', detail: 'Inverte julgamento II/III na sequência V/F.', correct: 'Sequência correta F,F,V,V — marcar A.' },
            { label: 'Letra D', detail: 'Três verdadeiras — aceita choque cardiogênico (I).', correct: 'I falsa por obstrução pulmonar — gabarito A.' },
          ],
          footer_rule: 'Gabarito A — F,F,V,V',
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
      danger_footer: 'Gabarito E — ciclos 5 costas + 5 abdominais',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'OVACE grave',
          meta: engasgoSlideMeta,
          items: [
            { label: 'Grave', detail: 'Tosse ineficaz · cianose · sinal de engasgamento · sem fluxo aéreo.', icon: 'AlertTriangle' },
            { label: 'Sequência', detail: 'Cinco golpes nas costas + cinco compressões abdominais em ciclos.', icon: 'ListOrdered' },
            { label: '× Heimlich fixo', detail: 'Compressões abdominais isoladas em intervalo fixo — incorreto.', icon: 'Ban' },
            { label: '× Varredura oral', detail: 'Varredura cega com dedos não é 1ª linha.', icon: 'XCircle' },
            { label: 'Pegadinha', detail: 'Jaw thrust ou Heimlich isolado sem alternância costas/abdome.', icon: 'AlertTriangle' },
          ],
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: engasgoSlideMeta,
          steps: [
            'OVACE grave em adulto consciente — conduta AHA ACE imediata.',
            'Quadro: tosse ineficaz · cianose · sinal universal · ausência de fluxo aéreo.',
            'Eliminar Heimlich isolado · jaw thrust isolado · varredura oral cega.',
            'Protocolo: ciclos alternados 5 golpes nas costas + 5 compressões abdominais.',
            'Marcar E — até expulsão ou inconsciência.',
          ],
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: engasgoSlideMeta,
          content: 'OVACE GRAVE — ADULTO',
          rows: OVACE_ADULTO_AHA_ROWS,
          footer_rule: ENGASGO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: engasgoSlideMeta,
          content: 'PEGADINHAS — OVACE',
          items: [
            { label: 'Letra A', detail: 'Heimlich em intervalo fixo sem alternância.', correct: 'Alternar costas/abdome — gabarito E.' },
            { label: 'Letra B', detail: 'Jaw thrust isolado — abertura passiva sem desobstrução ativa.', correct: 'Desobstrução ativa com ciclos 5+5 — E.' },
            { label: 'Letra C', detail: 'Jaw thrust + Heimlich fixo — sem golpes nas costas.', correct: 'Protocolo alterna costas/abdome — E.' },
            { label: 'Letra D', detail: 'Varredura oral + Heimlich — varredura cega não é 1ª linha.', correct: 'Ciclos 5 costas + 5 abdominais — E.' },
          ],
          footer_rule: 'Gabarito E — ciclos 5 costas + 5 abdominais',
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
      danger_footer: 'Gabarito D — Tipo D suporte avançado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Ambulâncias',
          meta: genericoSlideMeta,
          items: [
            { label: 'Comando', detail: 'Classificação das ambulâncias SAMU — alternativa correta.', icon: 'Ambulance' },
            { label: 'Tipo D', detail: 'Suporte avançado — equipe e equipamento qualificados.', icon: 'Stethoscope' },
            { label: '× A/B/C', detail: 'Rótulos trocados pela banca entre transporte, básico e resgate.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'Confundir resgate (Tipo C) com suporte avançado (Tipo D).', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Classificação das ambulâncias — identificar alternativa correta.',
            'Tipo D = suporte avançado — perfil com recursos avançados de suporte.',
            'Eliminar A resgate · B transporte · C suporte básico — rótulos incorretos.',
            'Pegadinha: confundir resgate com suporte avançado.',
            'Marcar D — Tipo D suporte avançado.',
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
      A: 'Tipo B não é ambulância de resgate — pegadinha troca rótulos; suporte avançado é Tipo D.',
      B: 'Tipo C é resgate/salvamento, não transporte simples — confundir resgate com avançado.',
      C: 'Tipo A é remoção/transporte simples, não suporte básico — gabarito D.',
    },
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010585356-8': {
    branch: 'generico',
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
          meta: genericoSlideMeta,
          items: [
            { label: 'Reativa', detail: 'Crise epiléptica reativa — fator agudo potencialmente reversível.', icon: 'Search' },
            { label: 'Investigação', detail: 'Sintomas sistêmicos · comorbidades · medicamentos · histórico neurológico.', icon: 'FileText' },
            { label: 'Febre', detail: 'Fator infeccioso agudo — causa reativa clássica.', icon: 'Thermometer' },
            { label: '× Crônicas', detail: 'Parkinson · Alzheimer · esclerose múltipla — doença de base.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'Tumor cerebral de evolução lenta ≠ fator agudo reativo.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Crise epiléptica reativa — causa aguda reversível.',
            'Investigar sintomas sistêmicos · comorbidades · medicamentos · alterações metabólicas/infecciosas.',
            'Febre é gatilho agudo clássico — marcar A.',
            'Eliminar Parkinson · Alzheimer · esclerose múltipla · tumor crônico.',
            'Marcar A — febre.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: genericoSlideMeta,
          content: 'REATIVA — FEBRE',
          rows: [
            { label: 'Reativa', value: 'Fator agudo reversível', badge: 'hot' },
            { label: 'Febre', value: 'Gatilho infeccioso agudo clássico', badge: 'ok' },
            { label: '× Tumor crônico', value: 'Evolução lenta — não reativa aguda', badge: 'warn' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Parkinson é neurodegenerativa crônica — não fator agudo reativo.',
      C: 'Tumor cerebral de evolução lenta — pegadinha: tumor crônico não é reativa aguda.',
      D: 'Esclerose múltipla é condição crônica desmielinizante.',
      E: 'Alzheimer é demência progressiva — não gatilho agudo.',
    },
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104048047-0': {
    branch: 'anafilaxia',
    pack: {
      family: 'protocolo',
      guideline:
        'Parada cardiorrespiratória — vasopressor endovenoso repetido a cada poucos minutos em todos os ritmos',
      roi_error: 'adrenalina_pcr_intervalo_3_5',
      cluster: 'PCR — intervalo vasopressor EV',
      danger_footer: 'Gabarito D — intervalo protocolar entre doses',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Vasopressor PCR',
          meta: anafilaxiaSlideMeta,
          items: [
            { label: 'PCR', detail: 'Parada cardiorrespiratória — vasopressor em todos os ritmos cardíacos.', icon: 'HeartPulse' },
            { label: 'Dose EV', detail: 'Vasopressor endovenoso em bolus de dose protocolar.', icon: 'Syringe' },
            { label: 'Intervalo', detail: 'Repetir em poucos minutos — não confundir com ciclos de compressão.', icon: 'Clock' },
            { label: '× Longo', detail: 'Intervalos muito espaçados — incorretos na reanimação.', icon: 'Ban' },
            { label: 'Pegadinha — compressão', detail: 'Confundir minutos entre doses com ciclos de compressão torácica.', icon: 'AlertTriangle' },
          ],
          footer_rule: 'PCR — vasopressor EV em intervalos protocolares',
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: anafilaxiaSlideMeta,
          steps: [
            'Vasopressor na PCR — intervalo entre aplicações endovenosas?',
            'Todos os ritmos cardíacos — repetir em ciclos alternados com compressões.',
            'Eliminar intervalos excessivamente longos nas alternativas A, B e C.',
            'Pegadinha: intervalo entre doses ≠ ciclo de compressão torácica.',
            'D — poucos minutos (protocolo) — marcar D.',
          ],
          footer_rule: 'PCR — vasopressor EV em intervalos protocolares',
        },
        {
          type: 'golden_rule',
          meta: anafilaxiaSlideMeta,
          content: 'VASOPRESSOR PCR',
          rows: [
            { label: 'PCR EV', value: 'Vasopressor em dose protocolar — repetir periodicamente', badge: 'hot' },
            { label: 'Intervalo', value: 'Poucos minutos entre bolus — algoritmo de reanimação', badge: 'ok' },
            { label: '× Confusão', value: 'Não confundir com ciclos de compressão 30:2', badge: 'warn' },
          ],
          footer_rule: 'PCR — vasopressor EV em intervalos protocolares',
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: anafilaxiaSlideMeta,
          content: 'PEGADINHAS — intervalo vasopressor PCR',
          items: [
            { label: 'Letra A', detail: 'Intervalo excessivamente longo entre bolus.', correct: 'Confunde pausa entre doses com ciclo de compressão — gabarito D.' },
            { label: 'Letra B', detail: 'Intervalo longo — subdosa vasopressor na PCR.', correct: 'Protocolo exige poucos minutos entre doses — marcar D.' },
            { label: 'Letra C', detail: 'Intervalo intermediário incorreto.', correct: 'Pegadinha de minutos — intervalo protocolar curto — D.' },
          ],
          footer_rule: 'Gabarito D — intervalo protocolar entre doses',
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
    console.log(`[handcraft:urgencias-g48] OK ${slug} (${entry.branch})`);
  }
  console.log(`[handcraft:urgencias-g48] total=${ok}`);
}

main();
