#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-crianca-g04 (8 slugs).
 *
 *   npx tsx scripts/handcraft-saude-da-crianca-g04.ts
 *   npm run validate:goldens -- --lote=saude-da-crianca-g04 --strict
 *   npm run audit:questao-readiness -- --lote=saude-da-crianca-g04 --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';

const LOTE = 'saude-da-crianca-g04';
const SUBTOPICO = 'Saúde da Criança';
const REVIEWED = '2026-07-15';

const MS_CADERNETA_SOURCE = {
  id: SAUDE_CRIANCA_MS.id,
  tier: 'A' as const,
  issuer: SAUDE_CRIANCA_MS.issuer,
  title: SAUDE_CRIANCA_MS.title,
  year: SAUDE_CRIANCA_MS.year,
  url: SAUDE_CRIANCA_MS.url,
  covers: [
    'neonatologia',
    'surfactante',
    'fenilcetonúria',
    'estrabismo',
    'aleitamento materno',
    'diarreia desidratação',
    'crescimento OMS',
    'PNAE',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'crianca_neonatologia'
  | 'crianca_triagem_neonatal'
  | 'crianca_aleitamento_nutricao'
  | 'crianca_crescimento_curvas';

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  branch: Branch;
  guideline: string;
  sources?: (typeof MS_CADERNETA_SOURCE)[];
  exam_vs_current?: string;
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
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
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: pack.sources ?? [MS_CADERNETA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

const SPECS: Record<string, Pack> = {
  'idecan-enfermagem-saude-da-crianca-1778712418722-3': {
    family: 'conceito',
    branch: 'crianca_neonatologia',
    guideline: 'Surfactante exógeno na SDR — instilação traqueal (SBP)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Surfactante na SDR',
        meta: slideMeta,
        items: [
          { label: 'SDR', detail: 'Síndrome do desconforto respiratório em prematuros — surfactante.', icon: 'Wind' },
          { label: 'Via correta', detail: 'Instilação traqueal — chega aos alvéolos.', icon: 'Syringe' },
          { label: 'Objetivo', detail: 'Reduzir tensão superficial pulmonar.', icon: 'Droplets' },
          { label: 'Pegadinha', detail: 'IM, IV, nebulização ou via oral não substituem.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Surfactante = instilação traqueal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: via de administração de surfactante exógeno na SDR.',
          'Eliminar A: intramuscular — não atinge pulmão.',
          'Eliminar B: intravenosa — metabolizado, sem efeito alveolar.',
          'Eliminar C: nebulização — deposição insuficiente.',
          'Eliminar D: via oral — destruído/deglutido.',
          'Testar E: instilação traqueal.',
          'Marcar letra E.',
        ],
        footer_rule: 'E = instilação traqueal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Surfactante — via',
        meta: slideMeta,
        content: 'SDR PRÉ-TERMO',
        rows: [
          { label: 'Via', value: 'Instilação traqueal (ETT)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Momento', value: 'Precoce na SDR moderada/grave', badge: 'ok' },
          { label: 'Não usar', value: 'IM, IV, nebulização, oral', badge: 'warn' },
          { label: 'Cuidado', value: 'Monitorar SpO₂ e FC durante instilação', badge: 'info' },
        ],
        footer_rule: 'Traqueal = única via eficaz',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SURFACTANTE',
        items: [
          {
            label: 'Letra A — intramuscular',
            detail: 'Absorção sistêmica não trata alvéolos.',
            correct: 'Surfactante exige instilação direta na traqueia.',
          },
          {
            label: 'Letra B — intravenosa',
            detail: 'Não deposita no epitélio alveolar.',
            correct: 'Via traqueal é a única eficaz na SDR.',
          },
          {
            label: 'Letra C — nebulização',
            detail: 'Partículas não penetram adequadamente.',
            correct: 'Instilação traqueal — não aerossol.',
          },
          {
            label: 'Letra D — via oral',
            detail: 'Surfactante não é administrado por boca.',
            correct: 'Gabarito E: instilação traqueal no RN intubado.',
          },
        ],
        footer_rule: 'Pulmão precisa do surfactante in loco',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712418722-4': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Fenilcetonúria (PKU) — teste do pezinho e dieta (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fenilcetonúria (PKU)',
        meta: slideMeta,
        items: [
          { label: 'Rastreio', detail: 'Teste do pezinho — coleta 3º–5º dia.', icon: 'Activity' },
          { label: 'Tratamento', detail: 'Dieta hipoproteica restrita em fenilalanina — precoce.', icon: 'Apple' },
          { label: 'Prognóstico', detail: 'Tratamento precoce evita comprometimento neurológico.', icon: 'Brain' },
          { label: 'Pegadinha', detail: 'Só medicamento ou jejum para coleta — falsos.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'PKU: detectar cedo + dieta = sem déficit neurológico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: manejo correto da fenilcetonúria.',
          'Eliminar B: diagnóstico antes de 48 h — falso positivo possível.',
          'Eliminar C: evitar >5% proteína — critério impreciso.',
          'Eliminar D: coleta com jejum — não exigido no pezinho.',
          'Eliminar E: só medicamentos — dieta é pilar.',
          'Testar A: tratamento precoce evita comprometimento neurológico.',
          'Marcar letra A.',
        ],
        footer_rule: 'A = prognóstico com tratamento precoce',
      },
      {
        type: 'golden_rule',
        slide_title: 'PKU — referência',
        meta: slideMeta,
        content: 'FENILCETONÚRIA',
        rows: [
          { label: 'Triagem', value: 'Pezinho — 3º–5º dia', badge: 'ok' },
          { label: 'Tratamento', value: 'Dieta baixa em fenilalanina', badge: 'hot' },
          { label: 'Prognóstico', value: 'Precoce = sem déficit neurológico', badge: 'hot', emphasis: 'highlight' },
          { label: 'Confirmatório', value: 'Após triagem positiva — não antes 48h', badge: 'warn' },
        ],
        footer_rule: 'PKU tratada cedo = desenvolvimento preservado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PKU',
        items: [
          {
            label: 'Letra B — diagnóstico antes 48 h',
            detail: 'Coleta muito precoce gera falso positivo.',
            correct: 'Triagem no 3º–5º dia — confirmação após.',
          },
          {
            label: 'Letra C — 5% proteína',
            detail: 'Critério simplificado incorreto.',
            correct: 'Restrição de fenilalanina individualizada — não % fixo.',
          },
          {
            label: 'Letra D — jejum para coleta',
            detail: 'Pezinho não exige jejum.',
            correct: 'Coleta em papel filtro no calcanhar — sem jejum.',
          },
          {
            label: 'Letra E — só medicamentos',
            detail: 'Tratamento é essencialmente dietético.',
            correct: 'Dieta hipofenilalanina — não medicação isolada.',
          },
        ],
        footer_rule: 'Dieta precoce salva neurológico',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712418722-5': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Rastreio de estrabismo — teste de cobertura (>4 meses)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estrabismo — rastreio',
        meta: slideMeta,
        items: [
          { label: 'Faixa etária', detail: 'A partir de 4 meses — avaliação sistemática.', icon: 'Calendar' },
          { label: 'Teste de cobertura', detail: 'Oclusão alternada — detecta desvio ocular.', icon: 'Eye' },
          { label: 'Reflexo vermelho', detail: 'RN/lactente — não é o teste dos 4 meses.', icon: 'Flashlight' },
          { label: 'Pegadinha', detail: 'Snellen/letras exigem idade escolar.', icon: 'AlertTriangle' },
        ],
        footer_rule: '>4 meses: teste de cobertura para estrabismo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: diagnóstico de estrabismo a partir de 4 meses.',
          'Eliminar A: reflexo vermelho — rastreio neonatal.',
          'Eliminar C: tabela de letras — idade inadequada.',
          'Eliminar D: fundo de olho — não rastreio primário de estrabismo.',
          'Eliminar E: Snellen — pré-escolar/escolar.',
          'Testar B: teste de cobertura.',
          'Marcar letra B.',
        ],
        footer_rule: 'B = teste de cobertura',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rastreio ocular por idade',
        meta: slideMeta,
        content: 'ESTRABISMO',
        rows: [
          { label: '4+ meses', value: 'Teste de cobertura', badge: 'hot', emphasis: 'highlight' },
          { label: 'RN', value: 'Reflexo vermelho', badge: 'ok' },
          { label: 'Pré-escolar', value: 'Hirschberg, acuidade adaptada', badge: 'info' },
          { label: 'Escolar', value: 'Snellen/tabela', badge: 'info' },
        ],
        footer_rule: 'Cobrir alternadamente — observar realinhamento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESTRABISMO',
        items: [
          {
            label: 'Letra A — reflexo vermelho',
            detail: 'Rastreio de opacidades e retinoblastoma no RN.',
            correct: 'Aos 4 meses: teste de cobertura para estrabismo.',
          },
          {
            label: 'Letra C — tabela de letras',
            detail: 'Criança não lê ainda aos 4 meses.',
            correct: 'Teste de cobertura — não acuidade com letras.',
          },
          {
            label: 'Letra D — fundo de olho',
            detail: 'Exame especializado — não rastreio de rotina.',
            correct: 'Rastreio aos 4 meses = teste de cobertura.',
          },
          {
            label: 'Letra E — Snellen',
            detail: 'Exige cooperação e alfabetização.',
            correct: 'Gabarito B: oclusão alternada.',
          },
        ],
        footer_rule: 'Idade define o teste ocular',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712418722-6': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Puericultura — AME livre demanda e política MS/OMS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saúde da criança — APS',
        meta: slideMeta,
        items: [
          { label: 'Acompanhamento', detail: 'Crescimento e desenvolvimento na UBS de referência.', icon: 'Home' },
          { label: 'AME', detail: 'Livre demanda no 1º mês; exclusivo até 6 meses.', icon: 'Baby' },
          { label: 'Vacina HIV', detail: 'Filho de mãe HIV segue calendário especial — não adiar BCG/HB sem critério.', icon: 'Syringe' },
          { label: 'Pegadinha', detail: 'Tela <2 anos “ajuda” ou papinha aos 4 meses.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Livre demanda + 6 meses exclusivo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre saúde da criança.',
          'Eliminar A: adiar vacinas em filho de mãe HIV — protocolo específico, não suspensão geral.',
          'Eliminar B: telas <2 anos auxiliam desenvolvimento — falso.',
          'Eliminar C: sólidos aos 4 meses — MS recomenda 6 meses.',
          'Testar D: livre demanda no 1º mês e nutrição adequada até 6 meses com AME.',
          'Marcar letra D.',
        ],
        footer_rule: 'D = AME livre demanda + 6 meses',
      },
      {
        type: 'golden_rule',
        slide_title: 'Política infantil MS',
        meta: slideMeta,
        content: 'PUERICULTURA',
        rows: [
          { label: 'AME', value: 'Livre demanda · exclusivo 6 meses', badge: 'hot', emphasis: 'highlight' },
          { label: 'Introdução', value: 'Alimentos aos 6 meses', badge: 'ok' },
          { label: 'Telas', value: 'Evitar <2 anos', badge: 'warn' },
          { label: 'HIV exposto', value: 'Seguir protocolo — não adiar vacinas sem base', badge: 'info' },
        ],
        footer_rule: '6 meses exclusivo — não 4',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PUERICULTURA',
        items: [
          {
            label: 'Letra A — adiar vacinas HIV',
            detail: 'Generaliza suspensão indevida.',
            correct: 'Filho de mãe HIV: calendário específico — não adiar sem protocolo.',
          },
          {
            label: 'Letra B — telas <2 anos',
            detail: 'OMS/MS desaconselham tempo de tela precoce.',
            correct: 'Telas não auxiliam desenvolvimento — prejuízo possível.',
          },
          {
            label: 'Letra C — sólidos aos 4 meses',
            detail: 'Antecipa introdução alimentar.',
            correct: 'MS/OMS: complementar a partir de 6 meses.',
          },
        ],
        footer_rule: 'AME 6 meses · sem tela precoce',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712418722-7': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Diarreia aguda — sinais de desidratação (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diarreia e desidratação',
        meta: slideMeta,
        items: [
          { label: 'Diarreia', detail: 'Evacuações líquidas frequentes — perda hídrica.', icon: 'Droplets' },
          { label: 'Fontanela', detail: 'Abaulada = hipertensão; afundada = desidratação.', icon: 'Baby' },
          { label: 'Plano A', detail: 'SRO e orientação na APS — agente pode orientar.', icon: 'Home' },
          { label: 'Pegadinha', detail: 'Restringir líquidos ou negar proteção do leite materno.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Fontanela afundada = desidratação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre diarreia infantil.',
          'Eliminar A: SRO só com prescrição — Plano A na APS orienta SRO.',
          'Eliminar B: reduzir líquidos — aumenta desidratação.',
          'Eliminar D: amamentação não previne — leite protege contra diarreia.',
          'Testar C: fontanela afundada + olhos fundos + boca seca + oligúria.',
          'Marcar letra C.',
        ],
        footer_rule: 'C = sinais de desidratação',
      },
      {
        type: 'golden_rule',
        slide_title: 'Desidratação na diarreia',
        meta: slideMeta,
        content: 'SINAIS DE ALERTA',
        rows: [
          { label: 'Fontanela', value: 'Afundada (deprimida)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Mucosas', value: 'Boca seca, olhos fundos', badge: 'ok' },
          { label: 'Diurese', value: 'Diminuição da urina', badge: 'warn' },
          { label: 'Conduta', value: 'SRO + avaliar Plano B/C', badge: 'info' },
        ],
        footer_rule: 'Orientar pais a observar sinais',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIARREIA',
        items: [
          {
            label: 'Letra A — SRO só com prescrição',
            detail: 'Plano A permite orientar SRO na APS.',
            correct: 'Agente de saúde orienta SRO — não exige prescrição prévia.',
          },
          {
            label: 'Letra B — reduzir sopas e sucos',
            detail: 'Restringe líquidos na desidratação.',
            correct: 'Manter oferta de líquidos e SRO — não restringir.',
          },
          {
            label: 'Letra D — AME não previne diarreia',
            detail: 'Nega proteção do leite materno.',
            correct: 'Amamentação reduz diarreia — alternativa falsa.',
          },
        ],
        footer_rule: 'SRO + AME — não restringir líquidos',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712426701-0': {
    family: 'conceito',
    branch: 'crianca_crescimento_curvas',
    guideline: 'Crescimento e desenvolvimento — curvas OMS (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crescimento × desenvolvimento',
        meta: slideMeta,
        items: [
          { label: 'Programa', detail: 'Eixos de referência para atividades de saúde da criança.', icon: 'BarChart' },
          { label: 'Crescimento', detail: 'Aumento quantitativo — peso, estatura, PC.', icon: 'TrendingUp' },
          { label: 'Desenvolvimento', detail: 'Aquisição de habilidades — motor, cognitivo, social.', icon: 'Brain' },
          { label: 'Pegadinha', detail: 'Confundir crescimento só biológico ou negar fatores ambientais.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Crescimento + desenvolvimento = pilares da puericultura',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre acompanhamento do crescimento.',
          'Eliminar B: desenvolvimento só biológico/celular — é biopsicossocial.',
          'Eliminar C: crescimento sem influência ambiental — hábitos e saúde influenciam.',
          'Eliminar D: período intrauterino sem influência — nutrição materna importa.',
          'Testar A: eixos de referência para atividades de saúde da criança.',
          'Marcar letra A.',
        ],
        footer_rule: 'A = eixos do programa de saúde da criança',
      },
      {
        type: 'golden_rule',
        slide_title: 'Curvas OMS — puericultura',
        meta: slideMeta,
        content: 'CRESCIMENTO E DESENVOLVIMENTO',
        rows: [
          { label: 'Crescimento', value: 'Peso, estatura, PC — curvas OMS', badge: 'hot' },
          { label: 'Desenvolvimento', value: 'Marcos por idade — AIDPI', badge: 'ok' },
          { label: 'Fatores', value: 'Genética + nutrição + ambiente', badge: 'info' },
          { label: 'Intraútero', value: 'Nutrição materna influencia', badge: 'warn' },
        ],
        footer_rule: 'Plotar curvas a cada consulta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CRESCIMENTO',
        items: [
          {
            label: 'Letra B — desenvolvimento só biológico',
            detail: 'Ignora aspectos psicossociais.',
            correct: 'Desenvolvimento é biopsicossocial — motor, cognitivo, social.',
          },
          {
            label: 'Letra C — só genética e metabolismo',
            detail: 'Nega ambiente, nutrição e saúde.',
            correct: 'Hábitos alimentares e ambiente influenciam crescimento.',
          },
          {
            label: 'Letra D — intrauterino sem influência',
            detail: 'Nega importância da gestação.',
            correct: 'Vida intrauterina impacta crescimento futuro.',
          },
        ],
        footer_rule: 'Crescimento ≠ só genética',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712426701-1': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Primeiros mil dias + nutrição escolar (MS/FNDE)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nutrição infantil — mil dias',
        meta: slideMeta,
        items: [
          { label: 'Primeiros mil dias', detail: 'Gestação + 2 anos — janela crítica.', icon: 'Calendar' },
          { label: 'Escola', detail: 'Intervenções escolares potencializam nutrição precoce.', icon: 'School' },
          { label: 'Alimentação', detail: 'Desde o nascimento — AME e complementar adequada.', icon: 'Apple' },
          { label: 'Pegadinha', detail: 'PNAE sem restrição de ultraprocessados — falso.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Mil dias + escola = investimento cumulativo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: importância da alimentação e nutrição infantil.',
          'Eliminar B: balanceada desde adolescência — tarde demais.',
          'Eliminar C: FNDE só comunidade escolar — missão mais ampla.',
          'Eliminar D: PNAE sem restrição açúcar/sódio — legislação restringe.',
          'Testar A: intervenções escolares potencializam nutrição nos mil dias.',
          'Marcar letra A.',
        ],
        footer_rule: 'A = escola + mil dias',
      },
      {
        type: 'golden_rule',
        slide_title: 'Mil dias + escola',
        meta: slideMeta,
        content: 'NUTRIÇÃO INFANTIL',
        rows: [
          { label: 'Mil dias', value: 'Gestação até 2 anos — crítico', badge: 'hot' },
          { label: 'Escola', value: 'Potencializa investimentos precoces', badge: 'ok' },
          { label: 'PNAE', value: 'Restringe ultraprocessados', badge: 'warn' },
          { label: 'Início', value: 'AME desde o nascimento', badge: 'info' },
        ],
        footer_rule: 'Nutrição precoce + escola = sinergia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NUTRIÇÃO',
        items: [
          {
            label: 'Letra B — desde adolescência',
            detail: 'Posterga intervenção nutricional.',
            correct: 'Investir desde gestação e primeiros mil dias.',
          },
          {
            label: 'Letra C — FNDE só escola',
            detail: 'Reduz papel do FNDE/PNAE.',
            correct: 'Gabarito A: escola potencializa nutrição precoce.',
          },
          {
            label: 'Letra D — PNAE sem restrição',
            detail: 'Legislação limita açúcar, sódio e gordura.',
            correct: 'PNAE restringe ultraprocessados — alternativa falsa.',
          },
        ],
        footer_rule: 'Mil dias começam na gestação',
      },
    ],
  },

  'idecan-enfermagem-saude-da-crianca-1778712426701-2': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'PNAE — Segurança Alimentar e Nutricional (FNDE/Lei 11.947)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PNAE — objetivos',
        meta: slideMeta,
        items: [
          { label: 'PNAE', detail: 'Programa Nacional de Alimentação Escolar — educação básica pública.', icon: 'School' },
          { label: 'Objetivo', detail: 'Crescimento biopsicossocial, aprendizagem e hábitos alimentares saudáveis.', icon: 'Users' },
          { label: 'SAN', detail: 'Segurança Alimentar e Nutricional — eixo fundamental do programa.', icon: 'Shield' },
          { label: 'FNDE', detail: 'Financia refeições e educação alimentar e nutricional.', icon: 'Utensils' },
        ],
        footer_rule: 'PNAE = SAN na escola pública',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: Programa Nacional de Alimentação Escolar (PNAE) — objetivo e gestão.',
          'Contribui para crescimento biopsicossocial e formação de hábitos alimentares saudáveis.',
          'Eliminar A: FNDE sem repasse à rede federal — há transferência.',
          'Eliminar C: Corregedoria da União — órgão de controle, não gestor do PNAE.',
          'Eliminar D: Defensoria Pública — não executa o programa.',
          'Testar B: eixo fundamental da Segurança Alimentar e Nutricional.',
          'Marcar letra B.',
        ],
        footer_rule: 'B = SAN via PNAE',
      },
      {
        type: 'golden_rule',
        slide_title: 'PNAE — referência',
        meta: slideMeta,
        content: 'PROGRAMA NACIONAL',
        rows: [
          { label: 'Objetivo', value: 'SAN + hábitos saudáveis + aprendizagem', badge: 'hot' },
          { label: 'Gestão', value: 'FNDE — repasse a estados/municípios', badge: 'ok' },
          { label: 'Público', value: 'Educação básica pública', badge: 'info' },
          { label: 'Base legal', value: 'Lei 11.947/2009', badge: 'warn' },
        ],
        footer_rule: 'PNAE ≠ CGU ≠ Defensoria',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PNAE',
        items: [
          {
            label: 'Letra A — FNDE sem repasse federal',
            detail: 'FNDE repassa recursos à educação básica.',
            correct: 'Há transferência fundo a fundo — alternativa falsa.',
          },
          {
            label: 'Letra C — Corregedoria da União',
            detail: 'Órgão de controle externo do Executivo.',
            correct: 'PNAE é gerido pelo FNDE/MS — não CGU.',
          },
          {
            label: 'Letra D — Defensoria Pública',
            detail: 'Instituição de defesa de direitos.',
            correct: 'Gestão do PNAE: FNDE — gabarito B.',
          },
        ],
        footer_rule: 'FNDE executa · SAN é o eixo',
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
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sc-g04] OK ${slug}`);
  }
  console.log(`[handcraft:sc-g04] total=${ok}`);
}

main();
