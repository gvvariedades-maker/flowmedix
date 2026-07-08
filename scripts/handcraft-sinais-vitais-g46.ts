#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g46 (8 slugs batch 1 vitals_generico · certo_errado).
 * Cluster Certo ou errado (10 slugs — g46=8, g47=2 restantes).
 *
 *   npm run handcraft:sinais-vitais-g46
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g46';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBC',
  title: 'Sinais vitais — técnica, faixas e interpretação',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'Korotkoff fase V — PAD pelo desaparecimento dos sons',
    'manguito estreito → PA falsamente elevada',
    'deflação lenta do manguito',
    'braço nível do coração',
    'temperatura central × superficial · hipotermia <35 °C',
    'respiração de Biot — grupos regulares + apneia',
    'FC radial 60 s · 60–100 bpm',
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
  family: 'certo_errado';
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
    pedagogical_branch: 'vitals_generico',
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

const SPECS: Record<string, Pack> = {
  'cebraspe-cespe-enfermagem-verificacao-de-sinais-vitais-1779344245160-0': {
    family: 'certo_errado',
    guideline:
      'MS/COFEN — PAD (fase V de Korotkoff) = desaparecimento dos sons; fase IV = abafamento/murmúrio — não confundir com “sons suaves”',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PAD — fase V de Korotkoff',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar se a PAD é definida por sons mais suaves/enfraquecidos ou quando o ponteiro para de oscilar.',
            icon: 'Target',
          },
          {
            label: 'PAS — fase I',
            detail: 'Primeiro som audível após insuflar o manguito — início da sistólica.',
            icon: 'Activity',
          },
          {
            label: 'PAD — fase V (MS)',
            detail: 'Desaparecimento completo dos sons de Korotkoff — referência atual para diastólica.',
            icon: 'HeartPulse',
          },
          {
            label: 'Fase IV — abafamento',
            detail: 'Sons abafados/murmúrios — não é a definição padrão de PAD no protocolo MS atual.',
            icon: 'VolumeX',
          },
          {
            label: 'Pegadinha da assertiva',
            detail: 'Mistura “sons suaves” e “ponteiro para de oscilar” — não descreve fase V corretamente.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PAD = desaparecimento dos sons — não confunda com abafamento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar definição de pressão diastólica na ausculta de Korotkoff.',
          'Lembrar: PAD pelo MS = fase V — momento em que os sons desaparecem.',
          'A assertiva cita “sons mais suaves/enfraquecidos” — remete à fase IV, não à PAD padrão.',
          '“Ponteiro para de oscilar” não substitui critério auscultatório de Korotkoff.',
          'Conclusão: afirmativa tecnicamente incorreta.',
          'Marcar Errado.',
          'Gabarito: letra B (Errado).',
        ],
        footer_rule: 'Fase V = silêncio — não sons suaves',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fases de Korotkoff',
        meta: slideMeta,
        content: 'AUSCULTA PA — FASES',
        rows: [
          { label: 'Fase I', value: 'Primeiro som — início da PAS', sv_kind: 'pa', badge: 'ok' },
          { label: 'Fase IV', value: 'Abafamento/murmúrio dos sons', sv_kind: 'pa', badge: 'warn' },
          { label: 'Fase V (PAD MS)', value: 'Desaparecimento completo dos sons', sv_kind: 'pa', badge: 'hot' },
          { label: 'Deflação', value: 'Lenta durante a ausculta — não apressar', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'PAD atual = fase V — desaparecimento dos sons',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PAD E KOROTKOFF',
        items: [
          {
            label: 'Marcar Certo por “sons suaves”',
            detail: 'Aluno associa diastólica ao abafamento dos sons (fase IV).',
            correct:
              'PAD pelo MS é fase V — desaparecimento dos sons; fase IV é abafamento, não definição padrão atual.',
          },
          {
            label: 'Confundir com oscilação do manômetro',
            detail: 'Achar que “ponteiro para de oscilar” fecha a diastólica.',
            correct:
              'Critério é auscultatório — silêncio após o último som de Korotkoff, não parada mecânica do ponteiro.',
          },
          {
            label: 'Inverter PAS e PAD',
            detail: 'Memorizar só “primeiro e último som” sem saber qual é qual.',
            correct:
              'Primeiro som = PAS (fase I) · desaparecimento = PAD (fase V) — sequência importa na prova.',
          },
        ],
        footer_rule: 'Assertiva errada — PAD ≠ sons enfraquecidos',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-verificacao-de-sinais-vitais-1779344245160-1': {
    family: 'certo_errado',
    guideline:
      'MS/COFEN — manguito estreito para o braço superestima a PA (falsamente alta); manguito largo subestima',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Manguito — tamanho e leitura',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar se manguito estreito para o braço obeso pode gerar pressão falsamente baixa.',
            icon: 'Target',
          },
          {
            label: 'Cobertura ~80%',
            detail: 'Bolsa deve envolver cerca de 80% da circunferência braquial — largura adequada ao braço.',
            icon: 'Ruler',
          },
          {
            label: 'Manguito estreito',
            detail: 'Compressão excessiva do vaso → leitura falsamente elevada, não baixa.',
            icon: 'TrendingUp',
          },
          {
            label: 'Manguito largo',
            detail: 'Subestima a pressão — leitura falsamente baixa.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha da assertiva',
            detail: 'Inverte o efeito: estreito = alto, não baixo.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Estreito → PA alta · largo → PA baixa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: manguito estreito no braço obeso → PA falsamente baixa?',
          'Regra: manguito menor que o braço comprime demais o membro.',
          'Efeito fisiológico: leitura superestimada — PA falsamente alta.',
          'A assertiva diz “falsamente baixa” — inverte o erro técnico.',
          'Conclusão: afirmativa incorreta.',
          'Marcar Errado.',
          'Gabarito: letra B (Errado).',
        ],
        footer_rule: 'Estreito = leitura alta — gabarito Errado',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — manguito e PA',
        meta: slideMeta,
        content: 'TAMANHO DO MANGUITO · EFEITO NA LEITURA',
        rows: [
          { label: 'Manguito adequado', value: '~80% da circunferência braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Estreito (pequeno)', value: 'PA falsamente elevada', sv_kind: 'pa', badge: 'hot' },
          { label: 'Largo (grande)', value: 'PA falsamente baixa', sv_kind: 'pa', badge: 'warn' },
          { label: 'Braço obeso', value: 'Escolher manguito largo calibrado', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Não inverta: estreito sobe · largo desce a leitura',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANGUITO ESTREITO',
        items: [
          {
            label: 'Achar que estreito baixa a PA',
            detail: 'Intuição de “apertar menos vaso = pressão menor”.',
            correct:
              'Manguito estreito comprime excessivamente → transmuração maior → leitura falsamente alta.',
          },
          {
            label: 'Confundir com manguito largo',
            detail: 'Trocar o efeito do manguito grande pelo pequeno.',
            correct:
              'Manguito largo subestima a PA; estreito superestima — a assertiva descreve o oposto do estreito.',
          },
          {
            label: 'Ignorar obesidade braquial',
            detail: 'Usar manguito adulto padrão sem avaliar circunferência.',
            correct:
              'Braço obeso exige manguito largo — estreito distorce a aferição para cima, não para baixo.',
          },
        ],
        footer_rule: 'Estreito = PA alta — marque Errado',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-verificacao-de-sinais-vitais-1779344245160-2': {
    family: 'certo_errado',
    guideline:
      'MS/COFEN — deflação lenta do manguito; deflação muito rápida distorce PAS/PAD',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Deflação — velocidade na PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar se deflação muito rápida durante a ausculta pode provocar leitura incorreta.',
            icon: 'Target',
          },
          {
            label: 'Velocidade MS',
            detail: 'Deflação lenta durante a ausculta — para captar fases de Korotkoff.',
            icon: 'Gauge',
          },
          {
            label: 'Deflação rápida',
            detail: 'Pode “pular” fases sonoras → subestimar ou superestimar PAS/PAD.',
            icon: 'Zap',
          },
          {
            label: 'Adulto obeso',
            detail: 'Contexto do enunciado — técnica cuidadosa ainda mais necessária.',
            icon: 'User',
          },
          {
            label: 'Assertiva da prova',
            detail: 'Não recomendar deflação muito rápida — alinhada ao MS.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Deflação lenta — não apressar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: deflação muito rápida → leitura incorreta de PA?',
          'Protocolo MS: deflar lentamente enquanto ausculta Korotkoff — sem apressar a deflação.',
          'Deflação rápida pode mascarar o desaparecimento dos sons.',
          'A assertiva alerta corretamente contra deflação muito rápida.',
          'Conclusão: afirmativa correta.',
          'Marcar Certo.',
          'Gabarito: letra A (Certo).',
        ],
        footer_rule: 'Deflação rápida distorce — gabarito Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica de deflação',
        meta: slideMeta,
        content: 'DEFLAÇÃO DO MANGUITO',
        rows: [
          { label: 'Velocidade MS', value: 'Deflação lenta durante a ausculta — não apressar', sv_kind: 'pa', badge: 'ok' },
          { label: 'Deflação rápida', value: 'Risco de leitura incorreta de PAS/PAD', sv_kind: 'pa', badge: 'hot' },
          { label: 'Após PAD', value: 'Auscultar 20–30 mmHg abaixo do último som', sv_kind: 'pa', badge: 'warn' },
          { label: 'Registro', value: 'Anotar PAS/PAD com técnica padronizada', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Não apresse a deflação — distorce Korotkoff',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFLAÇÃO RÁPIDA',
        items: [
          {
            label: 'Marcar Errado por “agilizar” o procedimento',
            detail: 'Achar que deflação rápida só economiza tempo sem erro.',
            correct:
              'Deflação apressada durante a ausculta pode omitir fases sonoras — leitura de PAS/PAD fica imprecisa.',
          },
          {
            label: 'Confundir com deflação pós-diastólica',
            detail: 'Misturar deflação lenta na ausculta com deflação rápida final após confirmar PAD.',
            correct:
              'Durante a ausculta a deflação é lenta; rápida demais no meio do procedimento é o erro cobrado.',
          },
          {
            label: 'Subestimar impacto no obeso',
            detail: 'Achar que braço grande tolera técnica apressada.',
            correct:
              'Obesidade braquial exige manguito adequado e deflação controlada — pressa distorce ainda mais.',
          },
        ],
        footer_rule: 'Assertiva correta — deflação rápida = erro',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-verificacao-de-sinais-vitais-1779344245160-5': {
    family: 'certo_errado',
    guideline:
      'MS — temperatura central (reto, timpânica, esôfago, bexiga, artéria pulmonar) × superficial (pele, oral, axilar); hipotermia <35 °C exige termômetro de baixa escala',
    roi_error: 'temp_via_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Temperatura — vias central e superficial',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar classificação de vias centrais/superficiais e necessidade de termômetro especial na hipotermia.',
            icon: 'Target',
          },
          {
            label: 'Vias centrais',
            detail: 'Reto, timpânica, temporal, esôfago, artéria pulmonar, bexiga — core corporal.',
            icon: 'Thermometer',
          },
          {
            label: 'Vias superficiais',
            detail: 'Pele, oral, axilar — mais acessíveis, podem subestimar na hipotermia.',
            icon: 'Hand',
          },
          {
            label: 'Hipotermia <35 °C',
            detail: 'Suspeita exige temperatura central com equipamento de baixa escala.',
            icon: 'Snowflake',
          },
          {
            label: 'Assertiva da prova',
            detail: 'Lista vias e alerta para hipotermia — coerente com MS.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Central na hipotermia — superficial no rotina',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: vias de temperatura e hipotermia <35 °C — julgar item.',
          'Conferir vias centrais citadas: reto, timpânica, temporal, esôfago, pulmonar, bexiga.',
          'Conferir superficiais: pele, oral, axilar — classificação correta.',
          'Hipotermia: termômetro que registre <35 °C (95 °F) em via central — verdadeiro.',
          'Assertiva alinhada ao MS — sem erro técnico.',
          'Marcar Certo.',
          'Gabarito: letra A (Certo).',
        ],
        footer_rule: 'Vias + hipotermia central — Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias de temperatura',
        meta: slideMeta,
        content: 'TEMPERATURA — CENTRAL × SUPERFICIAL',
        rows: [
          { label: 'Central', value: 'Reto · timpânica · temporal · esôfago · bexiga · art. pulmonar', sv_kind: 'temp', badge: 'hot' },
          { label: 'Superficial', value: 'Pele · oral · axilar', sv_kind: 'temp', badge: 'ok' },
          { label: 'Hipotermia', value: '<35 °C — priorizar via central', sv_kind: 'temp', badge: 'warn' },
          { label: 'Equipamento', value: 'Termômetro de baixa escala na suspeita', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Hipotermia → central + termômetro adequado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIAS DE TEMPERATURA',
        items: [
          {
            label: 'Trocar central por superficial',
            detail: 'Classificar axilar ou oral como temperatura central.',
            correct:
              'Axilar, oral e pele são superficiais; reto/timpânica/esôfago/bexiga são centrais.',
          },
          {
            label: 'Usar axilar na hipotermia grave',
            detail: 'Aferir só axilar quando suspeita <35 °C.',
            correct:
              'Hipotermia exige temperatura central com termômetro que leia abaixo de 35 °C.',
          },
          {
            label: 'Marcar Errado por lista longa de vias',
            detail: 'Desconfiar de enumeração extensa da banca.',
            correct:
              'A lista de vias centrais e superficiais está correta — não rejeite por volume de texto.',
          },
        ],
        footer_rule: 'Assertiva correta — vias e hipotermia',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-verificacao-de-sinais-vitais-1779344245160-6': {
    family: 'certo_errado',
    guideline:
      'MS/Potter — respiração de Biot: grupos de respirações regulares seguidos de apneia; não é alternância irregular apneia/hipoventilação',
    roi_error: 'padrao_respiratorio_biot',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Padrões respiratórios — Biot',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar se respiração de Biot é frequência/profundidade irregulares com apneia e hipoventilação alternadas.',
            icon: 'Target',
          },
          {
            label: 'Biot (cluster)',
            detail: 'Grupos de respirações de amplitude similar, ritmo regular, seguidos de apneia.',
            icon: 'Wind',
          },
          {
            label: 'Cheyne-Stokes',
            detail: 'Crescendo-decrescendo + apneia — padrão diferente do Biot.',
            icon: 'Waves',
          },
          {
            label: 'Ataxica (Kussmaul)',
            detail: 'Profunda e rápida (Kussmaul) ou irregular/atáxica — outro mecanismo.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — Biot × Cheyne-Stokes',
            detail:
              'Confundir frequência respiratória irregular com Biot — Biot tem grupos regulares + apneia, não alternância caótica.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Biot = grupos regulares + apneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: caracterizar respiração de Biot — julgar item.',
          'Biot: ciclos de respirações em cluster (grupos), ritmo regular dentro do grupo, pausa apneica.',
          'Assertiva fala em “irregulares” com apneia/hipoventilação alternadas — mistura padrões.',
          'Não corresponde à definição clássica de Biot.',
          'Conclusão: afirmativa incorreta.',
          'Marcar Errado.',
          'Gabarito: letra B (Errado).',
        ],
        footer_rule: 'Biot ≠ irregular com hipoventilação — Errado',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — padrões respiratórios',
        meta: slideMeta,
        content: 'PADRÕES ANORMAIS — DECORE',
        rows: [
          { label: 'Biot', value: 'Grupos regulares de respirações + apneia', sv_kind: 'fr', badge: 'hot' },
          { label: 'Cheyne-Stokes', value: 'Crescendo-decrescendo + apneia', sv_kind: 'fr', badge: 'warn' },
          { label: 'Kussmaul', value: 'Profunda e rápida — acidose metabólica', sv_kind: 'fr', badge: 'warn' },
          { label: 'FR adulto', value: '12–20 irpm em repouso', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Biot = cluster regular + pausa — não irregular',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BIOT × OUTROS PADRÕES',
        items: [
          {
            label: 'Confundir Biot com Cheyne-Stokes',
            detail: 'Ambos têm apneia — aluno generaliza “irregular”.',
            correct:
              'Cheyne-Stokes alterna crescendo-decrescendo; Biot são grupos regulares seguidos de apneia.',
          },
          {
            label: 'Aceitar “hipoventilação alternada”',
            detail: 'Achar que qualquer apneia + baixo volume define Biot.',
            correct:
              'Biot exige grupos de respirações de amplitude similar — não alternância irregular apneia/hipoventilação.',
          },
          {
            label: 'Marcar Certo por citar apneia',
            detail: 'Banca menciona apneia na frequência respiratória e o aluno valida a frase inteira.',
            correct:
              'Apneia faz parte do Biot, mas irregularidade com hipoventilação alternada descreve outro padrão respiratório.',
          },
        ],
        footer_rule: 'Definição errada — marque Errado',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-verificacao-de-sinais-vitais-1779344245160-7': {
    family: 'certo_errado',
    guideline:
      'MS — após PAD: auscultar 20–30 mmHg abaixo do último som; deflação rápida final; se sons até zero → PAD fase IV e anotar PAS/PAD/zero',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica MS — confirmação da PAD',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar etapa de auscultar 20–30 mmHg abaixo do último som, deflação rápida e fase IV se sons até zero.',
            icon: 'Target',
          },
          {
            label: 'Após último som',
            detail: 'Continuar auscultando 20–30 mmHg abaixo para confirmar desaparecimento (fase V).',
            icon: 'Ear',
          },
          {
            label: 'Deflação final',
            detail: 'Após confirmação — deflação rápida e completa do manguito.',
            icon: 'Gauge',
          },
          {
            label: 'Sons até zero',
            detail: 'Persistência até 0 mmHg → registrar PAD na fase IV (abafamento) + PAS/PAD/zero.',
            icon: 'FileText',
          },
          {
            label: 'Assertiva da prova',
            detail: 'Descreve sequência do protocolo MS para casos especiais.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Confirmar PAD — 20–30 mmHg abaixo do último som',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: etapas da técnica auscultatória MS — julgar item.',
          'Após identificar último som: auscultar mais 20–30 mmHg abaixo — procedimento MS.',
          'Depois: deflação rápida e completa do manguito.',
          'Se batimentos persistem até zero: PAD na fase IV + anotar PAS/PAD/zero.',
          'Assertiva reproduz o protocolo — correta.',
          'Marcar Certo.',
          'Gabarito: letra A (Certo).',
        ],
        footer_rule: 'Sequência MS completa — Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — protocolo MS PA',
        meta: slideMeta,
        content: 'TÉCNICA AUSCULTATÓRIA — PÓS-DIASTÓLICA',
        rows: [
          { label: 'Confirmação PAD', value: 'Auscultar 20–30 mmHg abaixo do último som', sv_kind: 'pa', badge: 'hot' },
          { label: 'Deflação final', value: 'Rápida e completa após confirmação', sv_kind: 'pa', badge: 'ok' },
          { label: 'Sons até 0 mmHg', value: 'PAD fase IV + registrar PAS/PAD/zero', sv_kind: 'pa', badge: 'warn' },
          { label: 'PAD (fase V)', value: 'Desaparecimento completo dos sons de Korotkoff', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'MS detalha confirmação e exceção fase IV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONFIRMAÇÃO DA PAD',
        items: [
          {
            label: 'Parar no primeiro “último som”',
            detail: 'Não auscultar 20–30 mmHg abaixo antes de registrar.',
            correct:
              'MS exige confirmar desaparecimento — continuar 20–30 mmHg abaixo do último som audível.',
          },
          {
            label: 'Rejeitar deflação rápida final',
            detail: 'Confundir deflação lenta na ausculta com deflação rápida após confirmação.',
            correct:
              'Durante a ausculta é lenta; após confirmar PAD, deflação rápida e completa é etapa do protocolo.',
          },
          {
            label: 'Marcar Errado por citar fase IV',
            detail: 'Achar que fase IV nunca se usa para PAD.',
            correct:
              'Quando sons persistem até zero, MS orienta PAD na fase IV e anotação PAS/PAD/zero.',
          },
        ],
        footer_rule: 'Protocolo MS — assertiva correta',
      },
    ],
  },

  'cebraspe-cespe-geral-verificacao-de-sinais-vitais-1779344245160-3': {
    family: 'certo_errado',
    guideline:
      'MS/COFEN — braço apoiado na altura do coração (nível do átrio) durante aferição de PA',
    roi_error: 'pa_posicao_braco',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA — posição do braço',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Julgar se o braço deve ficar no nível do coração durante a aferição de PA.',
            icon: 'Target',
          },
          {
            label: 'Nível do coração',
            detail: 'Braço apoiado na altura do átrio — evita erro hidrostático na leitura.',
            icon: 'Heart',
          },
          {
            label: 'Braço abaixo do coração',
            detail: 'Aumenta leitura — coluna de sangue adiciona pressão hidrostática.',
            icon: 'TrendingUp',
          },
          {
            label: 'Braço acima do coração',
            detail: 'Diminui leitura — efeito hidrostático inverso.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — braço pendente',
            detail:
              'Aferir com braço abaixo do coração ou ao nível do fígado — eleva a leitura por efeito hidrostático.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Assertiva da prova',
            detail: 'Manter braço no nível do coração — conduta correta.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Braço = altura do coração — sempre',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: braço no nível do coração na aferição de PA?',
          'Física: diferença de altura altera pressão hidrostática transmitida ao manguito.',
          'MS/COFEN: apoiar membro superior na altura do átrio/coração.',
          'Assertiva descreve conduta correta — sem erro.',
          'Marcar Certo.',
          'Gabarito: letra A (Certo).',
        ],
        footer_rule: 'Nível do coração — gabarito Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posição na PA',
        meta: slideMeta,
        content: 'TÉCNICA PA — POSICIONAMENTO',
        rows: [
          { label: 'Braço', value: 'Nível do coração (átrio) — apoiado', sv_kind: 'pa', badge: 'hot' },
          { label: 'Paciente', value: 'Sentado ou decúbito — costas apoiadas', sv_kind: 'pa', badge: 'ok' },
          { label: 'Pé no chão', value: 'Pés apoiados — sem pernas cruzadas', sv_kind: 'pa', badge: 'ok' },
          { label: 'Repouso', value: '5 min sentado antes da 1ª medida', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Altura do braço altera mmHg — nivelar ao coração',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POSIÇÃO DO BRAÇO',
        items: [
          {
            label: 'Aferir com braço pendente',
            detail: 'Paciente sentado com braço abaixo do coração ou ao nível do fígado.',
            correct:
              'Braço abaixo do coração eleva a leitura — apoiar na altura do átrio, nunca ao nível do fígado.',
          },
          {
            label: 'Marcar Errado por obesidade',
            detail: 'Achar que braço grande dispensa nivelamento.',
            correct:
              'Obesidade não altera a regra — braço permanece na altura do coração com manguito adequado.',
          },
          {
            label: 'Confundir com punho abaixo do coração',
            detail: 'Nivelar só o manguito e não o braço inteiro.',
            correct:
              'Todo o membro superior deve estar na altura do coração — não só o punho.',
          },
        ],
        footer_rule: 'Assertiva correta — braço no coração',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1778712135178-3': {
    family: 'certo_errado',
    guideline:
      'COFEN/MS — FC adulto 60–100 bpm; pulso radial com indicador e médio, 60 segundos',
    roi_error: 'fc_radial_60s_faixa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC — pulso radial e faixa',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar: FC aferida no pulso radial, 60 segundos, normalidade 60–100 bpm.',
            icon: 'Target',
          },
          {
            label: 'Pulso radial',
            detail: 'Local mais usado na prática e em prova para aferir frequência cardíaca.',
            icon: 'HeartPulse',
          },
          {
            label: '60 segundos',
            detail: 'Contagem completa quando se busca maior precisão na palpação.',
            icon: 'Timer',
          },
          {
            label: 'Faixa adulto',
            detail: '60 a 100 batimentos por minuto em repouso — normocárdico.',
            icon: 'Scale',
          },
          {
            label: 'Assertiva da prova',
            detail: 'Técnica + tempo + faixa — tríade que a banca costuma validar.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Radial · 60 s · 60–100 bpm',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar afirmativa sobre FC radial, 60 s e faixa 60–100 bpm.',
          'Identificar parâmetro: frequência cardíaca no adulto.',
          'Técnica citada: palpação do pulso radial — padrão de enfermagem.',
          'Tempo: 60 segundos — contagem completa para precisão.',
          'Faixa: 60–100 bpm — normalidade do adulto em repouso.',
          'Assertiva correta em técnica, tempo e referência.',
          'Marcar Certo.',
          'Gabarito: letra A (Certo).',
        ],
        footer_rule: 'Pulso radial 60 s · 60–100 bpm — Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — aferição de FC',
        meta: slideMeta,
        content: 'FREQUÊNCIA CARDÍACA — TÉCNICA',
        rows: [
          { label: 'Pulso radial', value: 'Indicador e médio — 60 segundos', sv_kind: 'fc', badge: 'hot' },
          { label: 'FC adulto repouso', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Dedos', value: 'Indicador e médio — nunca o polegar', sv_kind: 'meta', badge: 'warn' },
          { label: 'Precisão', value: '60 s completos na palpação de rotina', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Não use polegar — conte 60 s quando preciso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AFERIÇÃO DE FC',
        items: [
          {
            label: 'Contar só 15 segundos',
            detail: 'Achar que qualquer tempo serve se multiplicar por 4.',
            correct:
              'A assertiva cita 60 segundos — contagem completa para maior fidelade na palpação.',
          },
          {
            label: 'Faixa acima de 100 como normal',
            detail: 'Confundir taquicardia com normalidade.',
            correct:
              'Adulto em repouso: 60–100 bpm — acima de 100 é taquicardia, não faixa normal.',
          },
          {
            label: 'Palpar com o polegar',
            detail: 'Polegar tem pulsação própria que contamina a contagem.',
            correct:
              'Pulso radial: dedos indicador e médio sobre a artéria — nunca o polegar.',
          },
        ],
        footer_rule: 'Técnica + faixa corretas — marque Certo',
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
    console.log(`[handcraft:sv-g46] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g46] total=${ok}`);
}

main();
