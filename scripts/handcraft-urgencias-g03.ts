#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g03 (8 slugs · urgencias_rcp_sbv).
 *
 *   npx tsx scripts/init-urgencias-g03.ts
 *   npx tsx scripts/handcraft-urgencias-g03.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  dangerFromOptions,
  metaBase,
  rcpParamRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasRcpGolden';

const LOTE = 'urgencias-g03';
const REVIEWER = 'handcraft-urgencias-g03';

const SPECS: Record<string, Pack> = {
  'icece-enfermagem-urgencias-e-emergencias-1780001297464-0': {
    family: 'protocolo',
    guideline: 'PCR = emergência · fratura estável = urgência — priorizar parada cardiorrespiratória',
    roi_error: 'emergencia_urgencia_pcr',
    cluster: 'Classificação — parada cardiorrespiratória como emergência',
    danger_footer: 'PCR e inconsciente com dispneia = emergência — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Emergência × urgência',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Emergência máxima — iniciar RCP/SBV imediatamente.',
            icon: 'HeartPulse',
          },
          {
            label: 'Inconsciente + dispneia',
            detail: 'Emergência — risco iminente à vida; acionar SBV.',
            icon: 'Wind',
          },
          {
            label: 'Fratura estável',
            detail: 'Urgência — dor intensa, mas sinais vitais estáveis.',
            icon: 'Bone',
          },
          {
            label: 'Pegadinha — classificação',
            detail: 'Confundir parada cardiorrespiratória (emergência) com urgência — atrasa compressões torácicas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PCR nunca espera — RCP agora',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Relacione situações — qual sequência correta?',
          'Item 1: parada cardiorrespiratória → Emergência.',
          'Item 2: fratura fechada estável → Urgência.',
          'Item 3: inconsciente com dispneia → Emergência.',
          'Item 4: hipertensão sem falência → Urgência.',
          'Sequência: 1 Emergência · 2 Urgência · 3 Emergência · 4 Urgência.',
          'Marcar A.',
        ],
        footer_rule: 'Emergência = risco imediato à vida',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRIORIZAÇÃO SBV',
        rows: [
          { label: 'Emergência', value: 'PCR · inconsciente com insuficiência respiratória', badge: 'hot' },
          { label: 'Urgência', value: 'Fratura fechada estável · crise hipertensiva sem falência', badge: 'ok' },
          { label: 'RCP', value: 'Compressões 100–120/min · acionar DEA', badge: 'warn' },
        ],
        footer_rule: 'PCR → SBV antes de tudo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLASSIFICAÇÃO PCR',
        items: [
          {
            label: 'Letra B — inverte PCR e fratura',
            detail: 'Coloca parada cardiorrespiratória como urgência.',
            correct: 'PCR é emergência — compressões torácicas imediatas na parada cardiorrespiratória.',
          },
          {
            label: 'Letra C — dispneia como urgência',
            detail: 'Inconsciente com dificuldade respiratória classificado como urgência.',
            correct: 'Item 3 é emergência — risco iminente à vida.',
          },
          {
            label: 'Letra D — PCR como urgência',
            detail: 'Parada cardiorrespiratória não pode esperar fila de urgência.',
            correct: 'Item 1 sempre emergência — compressões sem demora.',
          },
        ],
        footer_rule: 'Gabarito A — 1E · 2U · 3E · 4U',
      },
    ],
  },
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-3': {
    family: 'protocolo',
    guideline: 'SBV solo — C-A-B: 30 compressões para cada 2 ventilações',
    roi_error: 'rcp_30_2_solo',
    cluster: 'RCP adulto — 30 compressões : 2 ventilações (socorrista solo)',
    danger_footer: 'Sozinho: 30 compressões por 2 ventilações — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SBV — socorrista solo',
        meta: slideMeta,
        items: [
          {
            label: 'PCR inconsciente',
            detail: 'Supor parada cardiorrespiratória — iniciar SBV sem demora.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Sequência C-A-B',
            detail: 'Compressão torácica → abertura via aérea → ventilação eficaz.',
            icon: 'Activity',
          },
          {
            label: 'Proporção',
            detail: '30 compressões torácicas para cada 2 ventilações.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha numérica',
            detail: '20, 40 ou 50 compressões — valores inventados pela banca.',
            icon: 'Hash',
          },
        ],
        footer_rule: '30:2 no adulto — dois socorristas ou solo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Socorrista solo — sem pulso: quantas compressões por 2 ventilações?',
          'Eliminar 20 compressões.',
          'Eliminar 40 e 50 compressões.',
          'Resta 30 compressões torácicas.',
          'Marcar B.',
        ],
        footer_rule: 'Decore: 30:2 adulto',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — 30:2',
        rows: rcpParamRows(),
        footer_rule: 'Solo ou dupla: 30 compressões : 2 ventilações',
      },
      null as unknown,
    ],
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-6': {
    family: 'protocolo',
    guideline: 'AHA — frequência compressões adulto: 100 a 120/min',
    roi_error: 'rcp_frequencia_100_120',
    cluster: 'RCP adulto — frequência 100–120 compressões/min',
    danger_footer: 'Faixa AHA: 100–120/min — não 80–100 nem 110–140 — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Frequência das compressões',
        meta: slideMeta,
        items: [
          {
            label: 'American Heart Association',
            detail: 'PCR adulto — compressões rápidas, fortes e regulares.',
            icon: 'HeartPulse',
          },
          {
            label: 'Faixa correta',
            detail: '100 a 120 compressões por minuto.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — lenta',
            detail: '80–100 ou 60–100/min abaixo ou fora do alvo atual.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — rápida demais',
            detail: '110–140/min excede recomendação e prejudica reexpansão.',
            icon: 'TrendingUp',
          },
        ],
        footer_rule: 'Metrônomo mental: 100–120',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'RCP adulto AHA — frequência correta das compressões?',
          'Eliminar 80 a 100/min (antiga ou insuficiente).',
          'Eliminar 110 a 140/min (excesso).',
          'Eliminar 60 a 100/min (muito lento).',
          'Resta 100 a 120 compressões por minuto.',
          'Marcar C.',
        ],
        footer_rule: 'Ritmo disco — não corrida',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FREQUÊNCIA RCP',
        rows: rcpParamRows([
          { label: 'Evitar', value: '<100/min ou >120/min', badge: 'warn' },
        ]),
        footer_rule: '100–120/min · profundidade 5–6 cm',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FREQUÊNCIA RCP',
        items: [
          {
            label: 'Letra A — 80 a 100/min',
            detail: 'Pegadinha — frequência lenta ou faixa antiga.',
            correct: '100 a 120 compressões por minuto — padrão AHA na parada cardiorrespiratória.',
          },
          {
            label: 'Letra B — 110 a 140/min',
            detail: 'Pegadinha — frequência rápida demais.',
            correct: 'Máximo 120/min com retorno completo do tórax entre compressões.',
          },
          {
            label: 'Letra D — 60 a 100/min',
            detail: 'Pegadinha — ritmo arrastado insuficiente.',
            correct: '100–120/min — compressões eficazes na PCR adulto.',
          },
        ],
        footer_rule: 'Gabarito C — 100 a 120/min',
      },
    ],
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780011879977-1': {
    family: 'protocolo',
    guideline: 'AHA/MS — PCR: compressões 100–120/min · 5–6 cm · DEA imediato',
    roi_error: 'rcp_conduta_inicial_completa',
    cluster: 'RCP adulto — conduta ao reconhecer PCR',
    danger_footer: 'Comprimir centro do tórax + DEA — não aguardar médico — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reconhecer PCR — agir',
        meta: slideMeta,
        items: [
          {
            label: 'Reconhecimento',
            detail: 'Inconsciência + ausência respiração normal — supor parada cardiorrespiratória.',
            icon: 'Eye',
          },
          {
            label: 'Compressões',
            detail: 'Centro do tórax · 100–120/min · profundidade 5–6 cm.',
            icon: 'HeartPulse',
          },
          {
            label: 'DEA',
            detail: 'Solicitar e acoplar assim que disponível — analisar ritmo.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinhas',
            detail: 'Aguardar médico · só ventilar · ventilar 2 min antes de comprimir.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'C-A-B + DEA sem demora',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR adulto reconhecida — conduta AHA/MS correta?',
          'Eliminar 60–80/min e profundidade reduzida (protocolo antigo).',
          'Eliminar aguardar médico antes de comprimir.',
          'Eliminar só ventilar ou ventilar 2 min antes das compressões.',
          'Resta compressões 100–120/min, 5–6 cm, com DEA assim que possível.',
          'Marcar C.',
        ],
        footer_rule: 'Tempo é cérebro',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONDUTA PCR ADULTO',
        rows: rcpParamRows([
          { label: 'Centro do tórax', value: 'Metade inferior do esterno', badge: 'ok' },
        ]),
        footer_rule: 'Comprimir bem · chocar cedo',
      },
      null as unknown,
    ],
  },
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-8': {
    family: 'protocolo',
    guideline: 'PCR extra-hospitalar — compressões imediatas + DEA assim que disponível',
    roi_error: 'rcp_extra_hospitalar_dea',
    cluster: 'RCP adulto — ambiente extra-hospitalar com DEA',
    danger_footer: 'Comprimir já · DEA em seguida — não ventilar 2 min antes — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR — via pública',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Inconsciente · sem respiração · sem pulso carotídeo — PCR extra-hospitalar.',
            icon: 'MapPin',
          },
          {
            label: 'Prioridade',
            detail: 'Compressões torácicas imediatas — C-A-B.',
            icon: 'HeartPulse',
          },
          {
            label: 'DEA',
            detail: 'Acoplar quando chegar — seguir comandos de análise e desfibrilação.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinhas',
            detail: 'Ventilar 2 min antes · intubar antes · aguardar SAMU parado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Comprimir enquanto busca DEA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR adulto em via pública — DEA disponível em minutos: conduta?',
          'Eliminar ventilação com BVM 2 min antes de comprimir.',
          'Eliminar intubação antes das compressões.',
          'Eliminar aguardar suporte avançado sem manobras.',
          'Eliminar droga vasoativa antes de desfibrilar (assistolia).',
          'Resta compressões imediatas + DEA assim que possível.',
          'Marcar C.',
        ],
        footer_rule: 'Minimizar tempo sem perfusão',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EXTRA-HOSPITALAR',
        rows: rcpParamRows([
          { label: 'DEA', value: 'Ligar · aplicar · retomar compressões após análise', badge: 'hot' },
        ]),
        footer_rule: '192 + RCP + DEA',
      },
      null as unknown,
    ],
  },
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011956256-2': {
    family: 'protocolo',
    guideline: 'AHA — qualidade das compressões determina sobrevida; minimizar pausas',
    roi_error: 'rcp_qualidade_compressoes',
    cluster: 'RCP intra-hospitalar — qualidade das compressões',
    danger_footer: 'Compressões de qualidade com mínimas interrupções — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP — qualidade importa',
        meta: slideMeta,
        items: [
          {
            label: 'American Heart Association',
            detail: 'Parada cardiorrespiratória no ambiente hospitalar — RCP com compressões torácicas de qualidade.',
            icon: 'HeartPulse',
          },
          {
            label: 'Qualidade',
            detail: '100–120/min · 5–6 cm · retorno torácico completo.',
            icon: 'Activity',
          },
          {
            label: 'Equipe e julgamento',
            detail: 'Decisões em situações críticas exigem competência técnica, julgamento clínico e trabalho em equipe.',
            icon: 'Users',
          },
          {
            label: 'Perfusão cerebral',
            detail: 'Interrupção frequente das compressões torácicas reduz perfusão cerebral — minimizar pausas.',
            icon: 'Brain',
          },
          {
            label: 'Pegadinhas',
            detail: 'Checar pulso toda hora · ventilar isolado · só monitorizar após ROSC.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Comprimir bem > procedimentos secundários',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'RCP hospitalar — American Heart Association: afirmativa correta sobre parada cardiorrespiratória?',
          'Eliminar interromper compressões frequentemente para pulso (piora perfusão).',
          'Eliminar ventilação prolongada antes de desfibrilar sempre.',
          'Eliminar ventilação isolada nas primeiras etapas.',
          'Eliminar monitorizar só após retorno espontâneo.',
          'Resta qualidade das compressões com mínimas interrupções.',
          'Marcar C.',
        ],
        footer_rule: 'Hands-on time máximo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMPRESSÕES DE QUALIDADE',
        rows: rcpParamRows([
          { label: 'Interrupções', value: 'Minimizar — trocar compressor sem parar RCP', badge: 'warn' },
        ]),
        footer_rule: 'Profundidade + frequência + recuo',
      },
      null as unknown,
    ],
  },
  'instituto-access-enfermagem-processo-de-enfermagem-1780005797734-0': {
    family: 'protocolo',
    guideline: 'AHA RCP alta qualidade — 100–120/min · 5–6 cm · recuo completo · pausas breves',
    roi_error: 'rcp_vf_qualidade_parametros',
    cluster: 'RCP adulto — V/F parâmetros de alta qualidade (todos verdadeiros)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — RCP alta qualidade (SBV)',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Técnico de enfermagem na unidade de emergência — perda de consciência, ausência de respiração e pulso carotídeo: RCP de alta qualidade.',
            icon: 'Building2',
          },
          {
            label: 'Item 1 — Frequência',
            detail: 'VERDADEIRA: 100 a 120 compressões por minuto na Reanimação Cardiopulmonar.',
            icon: 'Gauge',
          },
          {
            label: 'Profundidade',
            detail: 'VERDADEIRA: mínimo 5 cm, máximo 6 cm no adulto.',
            icon: 'ArrowDown',
          },
          {
            label: 'Retorno torácico',
            detail: 'VERDADEIRA: permitir reexpansão completa entre compressões.',
            icon: 'MoveVertical',
          },
          {
            label: 'Pausas',
            detail: 'VERDADEIRA: interrupções mínimas — ventilação/ritmo sem atrasar RCP.',
            icon: 'Timer',
          },
        ],
        footer_rule: 'Quatro itens V — sequência V,V,V,V',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Suporte Básico de Vida — julgue os quatro itens sobre RCP de alta qualidade no adulto.',
          'Item 1: frequência 100–120/min → V.',
          'Item 2: profundidade 5–6 cm → V.',
          'Item 3: retorno completo do tórax → V.',
          'Item 4: minimizar interrupções → V.',
          'Sequência de cima para baixo: V, V, V, V.',
          'Marcar C.',
        ],
        footer_rule: 'Todos verdadeiros nesta prova',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMPONENTES RCP — ALTA QUALIDADE',
        rows: rcpParamRows([
          { label: 'Pausas', value: 'Minimizar ao ventilar ou checar ritmo', badge: 'warn' },
        ]),
        footer_rule: '100–120 · 5–6 cm · recuo total',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SEQUÊNCIAS V/F',
        items: [
          {
            label: 'Letra A — V, F, V, F',
            detail: 'Marca itens 2 e 4 como falsos — profundidade e pausas são verdadeiras.',
            correct: 'Profundidade 5–6 cm e pausas mínimas são verdadeiras (V).',
          },
          {
            label: 'Letra B — V, V, F, F',
            detail: 'Rejeita retorno torácico e pausas — ambos verdadeiros.',
            correct: 'Retorno completo e interrupções mínimas são V.',
          },
          {
            label: 'Letra D — F, V, F, V',
            detail: 'Inverte frequência e profundidade — ambas verdadeiras.',
            correct: '100–120/min e 5–6 cm são parâmetros corretos (V).',
          },
        ],
        footer_rule: 'Gabarito C — V,V,V,V',
      },
    ],
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-3': {
    family: 'protocolo',
    guideline: 'AHA 2025 cadeia — reconhecimento → RCP → desfibrilação → avançado → pós-PCR',
    roi_error: 'cadeia_sobrevivencia_ordem',
    cluster: 'RCP adulto — ordem da cadeia de sobrevivência AHA',
    danger_footer: 'Reconhecer → RCP → DEA → avançado → pós-PCR — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadeia de sobrevivência',
        meta: slideMeta,
        items: [
          {
            label: '1º passo',
            detail: 'Reconhecimento da parada cardiorrespiratória + ativação da emergência.',
            icon: 'Phone',
          },
          {
            label: '2º passo',
            detail: 'RCP de alta qualidade — compressões imediatas.',
            icon: 'HeartPulse',
          },
          {
            label: '3º passo',
            detail: 'Desfibrilação precoce com DEA.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha',
            detail: 'Desfibrilar antes de comprimir ou RCP antes de reconhecer — ordem invertida.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ver → comprimir → chocar → avançar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR — ordem correta da cadeia de sobrevivência AHA?',
          'Eliminar desfibrilação antes de RCP.',
          'Eliminar RCP antes de reconhecimento/ativação.',
          'Confirmar: reconhecimento → RCP → desfibrilação → avançado → pós-PCR.',
          'Marcar D.',
        ],
        footer_rule: 'Reconhecer e acionar vêm primeiro',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CADEIA AHA 2025',
        rows: [
          { label: '1', value: 'Reconhecimento + ativação emergência', badge: 'hot' },
          { label: '2', value: 'RCP alta qualidade', badge: 'ok' },
          { label: '3', value: 'Desfibrilação precoce', badge: 'ok' },
          { label: '4–5', value: 'Ressuscitação avançada · Cuidados pós-PCR', badge: 'info' },
        ],
        footer_rule: 'Ordem salva vidas',
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-3': {
    A: '20 compressões — abaixo do padrão 30:2.',
    C: '40 compressões — valor inventado.',
    D: '50 compressões — não é proporção AHA.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780011879977-1': {
    A: '60–80/min e profundidade reduzida — protocolo desatualizado.',
    B: 'Aguardar médico atrasa perfusão cerebral.',
    D: 'Só ventilar sem compressões — viola C-A-B.',
    E: 'Ventilar 2 min antes de comprimir — atraso fatal.',
  },
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011947286-8': {
    A: 'Ventilar 2 min antes de comprimir — incorreto no adulto em PCR.',
    B: 'Intubação antes de compressões — atrasa RCP.',
    D: 'Aguardar suporte avançado sem manobras — abandona vítima.',
    E: 'Droga antes de desfibrilar sem ritmo — conduta inadequada.',
  },
  'inaz-do-para-enfermagem-processo-de-enfermagem-1780011956256-2': {
    A: 'Interromper compressões para pulso piora perfusão cerebral.',
    B: 'Ventilação prolongada antes de desfibrilar não é regra fixa.',
    D: 'Monitorização deve ocorrer durante RCP — não só após ROSC.',
    E: 'Ventilação isolada sem compressões — insuficiente na PCR cardíaca.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-3': {
    A: 'Desfibrilação antes de RCP — ordem invertida.',
    B: 'Desfibrilação antes de RCP de alta qualidade.',
    C: 'RCP antes de reconhecimento — pula ativação da emergência.',
  },
};

function finalizeSlides(slug: string, q: Q, pack: Pack): unknown[] {
  return pack.slides.map((slide) => {
    if (slide !== null) return slide;
    const overrides = DANGER_OVERRIDES[slug];
    if (!overrides) throw new Error(`danger_zone missing for ${slug}`);
    return dangerFromOptions(
      q,
      `PEGADINHAS — ${pack.roi_error.replace(/_/g, ' ')}`,
      overrides,
      pack.danger_footer ??
        `Gabarito ${q.question_data.options.find((o) => o.is_correct)?.id} — ${pack.cluster}`,
    );
  });
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = finalizeSlides(slug, raw, pack);
    const out = {
      meta: metaBase(
        raw,
        pack.family,
        pack.guideline,
        slug,
        pack.roi_error,
        pack.cluster,
        REVIEWER,
      ),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g03] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g03] total=${ok}`);
}

main();
