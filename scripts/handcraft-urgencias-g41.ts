#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g41 (8 slugs · 12º lote urgencias_generico).
 * Inferência: EXCETO → exceto · V/F primeiros socorros → vf_protocolo · coluna/APH → generico.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  dangerExceto,
  metaBase as metaExceto,
  slideMeta as excetoSlideMeta,
  type Q as ExcetoQ,
} from './lib/urgenciasExcetoGolden';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  samuPapeisRows,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  finalizeSlides as finalizeVf,
  metaBase as metaVf,
  slideMeta as vfSlideMeta,
  vfRows,
  type Pack as VfPack,
  type Q as VfQ,
} from './lib/urgenciasVfProtocoloGolden';

const LOTE = 'urgencias-g41';
const REVIEWER = 'handcraft-urgencias-g41';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const VF_FOOTER = 'Primeiros socorros = cena segura + estabilizar + acionar';
const EXCETO_FOOTER = 'CRMU regula · unidade móvel estabiliza e transporta';

/** Estabilização manual coluna cervical — trauma raquimedular (generico, 1 hit trauma). */
const COLUNA_CERVICAL_ESTABILIZACAO = [
  { label: 'Suspeita', value: 'Trauma com risco à coluna — estabilizar antes de mover', badge: 'hot' },
  { label: 'Primeira ação', value: 'Estabilização manual da coluna cervical', badge: 'hot' },
  { label: 'Aguardar', value: 'Equipe especializada e imobilização adequada', badge: 'ok' },
  { label: '× Mover cedo', value: 'Transporte sem proteção cervical agrava lesão medular', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca testa se socorrista prioriza coluna antes de outras manobras', badge: 'info' },
];

/** APH — queda com dor e limitação motora. */
const APH_QUEDA_IMOBILIZAR = [
  { label: 'Segurança', value: 'Avaliar cena e nível de consciência primeiro', badge: 'hot' },
  { label: 'Imobilidade', value: 'Manter vítima imóvel até avaliação — evitar agravamento', badge: 'ok' },
  { label: 'Acionar', value: 'Serviço de emergência para remoção segura', badge: 'warn' },
  { label: 'Monitorar', value: 'Sinais vitais até chegada do socorro', badge: 'info' },
  { label: '× Ofertar VO', value: 'Líquidos ou alimentos podem atrasar cirurgia ou piorar quadro', badge: 'warn' },
];

/** Atribuições técnico ESF em urgência. */
const TECNICO_ESF_URGENCIA = [
  { label: 'Escopo', value: 'Avaliação inicial e cuidados conforme protocolo', badge: 'hot' },
  { label: 'Comunicar', value: 'Articular com equipe multiprofissional', badge: 'ok' },
  { label: '× Prescrever', value: 'Prescrição e diagnóstico médico — fora do escopo', badge: 'warn' },
  { label: '× Invasivo autônomo', value: 'Procedimentos invasivos exigem prescrição e supervisão', badge: 'warn' },
  { label: '× Encaminhar solo', value: 'Fluxo hospitalar depende de regulação médica', badge: 'info' },
];

/** APH — sequência cena segura. */
const APH_CENA_SEGURA = [
  { label: 'Cena', value: 'Segurança do local antes de abordar a vítima', badge: 'hot' },
  { label: 'Abordagem', value: 'Avaliação inicial respeitando limites profissionais', badge: 'ok' },
  { label: 'Acionar', value: 'Emergência quando gravidade exige suporte avançado', badge: 'warn' },
  { label: '× Remoção imediata', value: 'Transporte sem avaliação agrava risco', badge: 'warn' },
  { label: '× Medicação própria', value: 'Medicamentos exigem prescrição ou protocolo institucional', badge: 'info' },
];

/** Picada de abelha — reação local × sintomas absurdos. */
const PICADA_ABELHA_REACAO = [
  { label: 'Local', value: 'Dor · edema · eritema no local da picada', badge: 'hot' },
  { label: 'Sistêmico leve', value: 'Urticária generalizada · prurido · mal-estar', badge: 'ok' },
  { label: '× CD4 / alopecia', value: 'Marcadores imunológicos ou queda capilar — não fazem parte do quadro típico', badge: 'warn' },
  { label: 'Reação alérgica grave', value: 'Dispneia · hipotensão · estridor — emergência imediata', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca mistura sintomas de outras doenças na picada comum', badge: 'info' },
];

/** Access — definição urgência × emergência (literal da banca). */
const ACCESS_URGENCIA_EMERGENCIA = [
  { label: 'Urgência (Access)', value: 'Agravo imprevisto com ou sem risco potencial — assistência médica imediata', badge: 'hot' },
  { label: 'Emergência (Access)', value: 'Risco iminente de vida ou sofrimento intenso — tratamento imediato', badge: 'ok' },
  { label: '× Inverter rótulos', value: 'Atribuir critério de emergência ao termo urgência', badge: 'warn' },
  { label: '× Adiar emergência', value: 'Emergência não admite espera por avaliação eletiva', badge: 'warn' },
  { label: 'Pegadinha', value: 'Alternativa A descreve emergência mas rotula urgência', badge: 'info' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type VfEntry = { branch: 'vf'; pack: VfPack; danger: Record<string, string> };
type ExcetoEntry = {
  branch: 'exceto';
  family: 'protocolo' | 'conceito';
  guideline: string;
  roiError: string;
  cluster: string;
  buildSlides: (q: ExcetoQ) => unknown[];
};

type HandcraftEntry = GenericoEntry | VfEntry | ExcetoEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'igeduc-enfermagem-urgencias-e-emergencias-1777104077075-2': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Suspeita de lesão raquimedular — estabilização manual da coluna cervical é a primeira providência antes de aguardar equipe especializada',
      roi_error: 'coluna_cervical_estabilizacao_manual',
      cluster: 'Certo ou errado — trauma coluna cervical APH',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Coluna cervical — julgar',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Emergência com risco à coluna vertebral — priorizar proteção medular.',
              icon: 'Target',
            },
            {
              label: 'Primeira ação',
              detail: 'Estabilização manual da coluna cervical da vítima.',
              icon: 'Shield',
            },
            {
              label: 'Aguardar',
              detail: 'Serviço médico de emergência para imobilização e transporte adequados.',
              icon: 'Ambulance',
            },
            {
              label: '× Mover antes',
              detail: 'Transportar ou reposicionar sem proteção cervical agrava lesão.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca testa se estabilização manual precede outras condutas.',
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
            'Emergência traumática com risco à coluna — julgar afirmativa.',
            'Primeira providência = estabilização manual da coluna cervical — verdadeiro.',
            'Aguardar serviço médico de emergência — conduta complementar coerente.',
            'Afirmativa alinhada ao protocolo de primeiros socorros em trauma raquimedular.',
            'Marcar A (Certo).',
            'Fixação: coluna suspeita = estabilizar manualmente · aguardar equipe.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Coluna — decore',
          meta: genericoSlideMeta,
          content: 'TRAUMA RAQUIMEDULAR — ESTABILIZAR',
          rows: COLUNA_CERVICAL_ESTABILIZACAO,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — negar estabilizacao coluna',
          items: [
            {
              label: 'Errado — negar conduta',
              detail: 'Marcar Errado nega estabilização manual como primeira ação.',
              correct:
                'Estabilização manual da coluna cervical precede transporte — afirmativa verdadeira.',
            },
            {
              label: 'Pegadinha — mover cedo',
              detail: 'Parece urgente remover vítima, mas coluna desprotegida piora prognóstico.',
              correct:
                'Manter estabilização manual até equipe especializada — conduta da afirmativa está certa.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega estabilização manual da coluna como primeira providência em trauma raquimedular suspeito.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1780001220945-7': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'APH — vítima consciente pós-queda com dor intensa: avaliar consciência, manter imóvel, acionar emergência e monitorar sinais vitais',
      roi_error: 'aph_queda_manter_imovel',
      cluster: 'APH ESF — queda com limitação motora',
      danger_footer: 'Gabarito C — imobilizar e acionar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'APH — queda',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'Via pública · vítima consciente · queda · dor intensa · dificuldade de movimentar.',
              icon: 'MapPin',
            },
            {
              label: 'Avaliar',
              detail: 'Nível de consciência e sinais vitais — base da abordagem inicial.',
              icon: 'Brain',
            },
            {
              label: 'Imobilizar',
              detail: 'Manter vítima imóvel até avaliação e remoção seguras.',
              icon: 'Shield',
            },
            {
              label: 'Acionar',
              detail: 'Serviço de emergência para transporte especializado.',
              icon: 'Phone',
            },
            {
              label: 'Pegadinha',
              detail: 'Ofertar líquidos ou movimentar para conforto — condutas inadequadas.',
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
            'APH — queda com dor intensa e limitação motora — conduta correta?',
            'A oferecer líquidos — eliminar — risco de cirurgia ou piora.',
            'B movimentação ativa sem avaliação — eliminar — pode agravar lesão.',
            'D pedir para levantar antes de acionar — eliminar — teste de marcha inadequado.',
            'C avaliar consciência · manter imóvel · acionar emergência · monitorar SV — conduta completa.',
            'Marcar C.',
            'Fixação: queda grave = imobilizar · acionar · monitorar.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'APH queda — decore',
          meta: genericoSlideMeta,
          content: 'QUEDA COM DOR INTENSA',
          rows: APH_QUEDA_IMOBILIZAR,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — ofertar liquido mover vitima',
          items: [
            {
              label: 'Letra A — oferecer líquidos',
              detail: 'Hidratar enquanto aguarda remoção.',
              correct:
                'Ofertar líquidos no APH pós-queda não é conduta inicial — pegadinha de conforto versus imobilização.',
            },
            {
              label: 'Letra B — movimentação ativa',
              detail: 'Reposicionar para conforto sem avaliação.',
              correct:
                'Movimentação ativa antes da avaliação agrava possível lesão — pegadinha clássica em queda com dor intensa.',
            },
            {
              label: 'Letra D — levantar para testar marcha',
              detail: 'Verificar se caminha antes de acionar emergência.',
              correct:
                'Teste de marcha antes do acionamento ignora risco de agravamento — pegadinha oposta à imobilização correta.',
            },
          ],
          footer_rule: 'Gabarito C — imobilizar e acionar',
        },
      ],
    },
    danger: {},
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1780001220945-8': {
    branch: 'vf',
    pack: {
      family: 'vf',
      guideline:
        'Primeiros socorros V/F — segurança da cena (V) · compressão direta sangramento (V) · medicamentos obrigatórios (F) · acionar emergência grave (V)',
      roi_error: 'vf_primeiros_socorros_esf',
      cluster: 'V/F — primeiros socorros ESF',
      danger_footer: 'Gabarito A — V, V, F, V',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Primeiros socorros — V/F',
          meta: vfSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Julgar quatro afirmativas sobre primeiros socorros e montar a sequência V/F.',
              icon: 'Target',
            },
            {
              label: 'Afirmativa I',
              detail: 'VERDADEIRO — priorizar segurança do socorrista e do ambiente.',
              icon: 'Shield',
            },
            {
              label: 'Afirmativa II',
              detail: 'VERDADEIRO — compressão direta com material limpo em sangramento intenso.',
              icon: 'Droplets',
            },
            {
              label: 'Afirmativa III',
              detail: 'FALSO — medicamentos não são ação obrigatória em todo primeiro socorro.',
              icon: 'XCircle',
            },
            {
              label: 'Item IV',
              detail: 'VERDADEIRO — comunicar serviço de emergência em situações graves.',
              icon: 'Phone',
            },
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: vfSlideMeta,
          steps: [
            'Primeiros socorros — julgar afirmativas I a IV antes de cruzar com letras A–D.',
            'Afirmativa I — segurança do socorrista e ambiente → verdadeiro.',
            'Afirmativa II — compressão direta em sangramento intenso → verdadeiro.',
            'Afirmativa III — medicamentos obrigatórios em qualquer PS → falso.',
            'Afirmativa IV — acionar emergência em situação grave → verdadeiro.',
            'Sequência V, V, F, V — marcar A.',
            'Fixação: PS = cena segura · hemostasia · acionar · sem medicação rotineira.',
          ],
          footer_rule: VF_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'PS — decore V/F',
          meta: vfSlideMeta,
          content: 'PRIMEIROS SOCORROS — ESF',
          rows: vfRows([
            { roman: 'I', verdict: 'V', note: 'Segurança do socorrista e do ambiente primeiro' },
            { roman: 'II', verdict: 'V', note: 'Compressão direta com material limpo no sangramento' },
            { roman: 'III', verdict: 'F', note: 'Medicamentos não são obrigatórios em todo PS' },
            { roman: 'IV', verdict: 'V', note: 'Acionar emergência diante de gravidade' },
          ]),
          footer_rule: VF_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: vfSlideMeta,
          content: 'PEGADINHAS — item III medicamentos',
          items: [
            {
              label: 'Letra B — F, V, V, F',
              detail: 'Nega afirmativa I (cena segura) e aceita item III falso como verdadeiro.',
              correct:
                'Afirmativa I é verdadeira (cena segura) e III é falsa (sem medicação rotineira) — sequência inválida.',
            },
            {
              label: 'Letra C — V, F, V, F',
              detail: 'Omite afirmativa II (compressão) e nega acionar emergência na IV.',
              correct:
                'Afirmativa II (compressão) e IV (acionar SAMU) são verdadeiras nesta sequência.',
            },
            {
              label: 'Letra D — F, F, V, V',
              detail: 'Aceita medicamentos obrigatórios na afirmativa III — item falso.',
              correct:
                'Primeiros socorros não exigem administração de medicamentos em toda situação — afirmativa III invalida a letra.',
            },
          ],
          footer_rule: 'Gabarito A — V, V, F, V',
        },
      ],
    },
    danger: {},
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1780001220945-9': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Técnico ESF em urgência — avaliação inicial, cuidados imediatos conforme protocolo e comunicação com equipe; sem prescrição ou autonomia invasiva',
      roi_error: 'tecnico_esf_escopo_urgencia',
      cluster: 'Atribuições técnico ESF — urgência/emergência',
      danger_footer: 'Gabarito B — avaliar e comunicar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Técnico ESF — urgência',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Contexto',
              detail: 'Urgência na UBS ou território — atuação rápida dentro do escopo.',
              icon: 'Users',
            },
            {
              label: 'Avaliar',
              detail: 'Avaliação inicial do usuário e reconhecimento de gravidade.',
              icon: 'Stethoscope',
            },
            {
              label: 'Cuidar',
              detail: 'Cuidados imediatos conforme protocolos institucionais.',
              icon: 'HeartPulse',
            },
            {
              label: 'Comunicar',
              detail: 'Articular com equipe multiprofissional de saúde.',
              icon: 'MessageSquare',
            },
            {
              label: 'Pegadinha',
              detail: 'Prescrever · diagnosticar · proceder invasivo sem supervisão.',
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
            'Atribuições do técnico em urgência — alternativa correta?',
            'A procedimentos invasivos sem prescrição — eliminar — ultrapassa escopo.',
            'C autorizar encaminhamentos hospitalares solo — eliminar — regulação médica.',
            'D diagnosticar e prescrever autonomamente — eliminar — atribuição médica.',
            'B avaliação inicial · cuidados protocolares · comunicar equipe — conduta do técnico.',
            'Marcar B.',
            'Fixação: técnico avalia · estabiliza · comunica — não prescreve.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Escopo técnico — decore',
          meta: genericoSlideMeta,
          content: 'TÉCNICO ESF EM URGÊNCIA',
          rows: TECNICO_ESF_URGENCIA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Determinar e executar procedimentos invasivos sem prescrição ultrapassa o escopo do técnico de enfermagem.',
      C: 'Autorizar encaminhamentos hospitalares de forma independente é atribuição de regulação médica.',
      D: 'Definir diagnóstico clínico e prescrever medicamentos é competência médica, não do técnico.',
    },
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1780001297464-2': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'APH — avaliar segurança da cena, abordagem inicial da vítima e acionar emergência quando necessário; sem remoção precipitada nem medicação por iniciativa própria',
      roi_error: 'aph_cena_segura_abordagem',
      cluster: 'APH — sequência cena segura',
      danger_footer: 'Gabarito A — cena · abordagem · acionar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'APH — sequência',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'APH',
              detail: 'Ações fora do hospital para reduzir agravos até serviço de saúde.',
              icon: 'Ambulance',
            },
            {
              label: 'Cena',
              detail: 'Avaliar segurança do local antes de abordar a vítima.',
              icon: 'Shield',
            },
            {
              label: 'Abordagem',
              detail: 'Avaliação inicial respeitando limites profissionais.',
              icon: 'Eye',
            },
            {
              label: 'Acionar',
              detail: 'Emergência quando gravidade exige suporte avançado.',
              icon: 'Phone',
            },
            {
              label: 'Pegadinha',
              detail: 'Remover imediatamente ou medicar sem protocolo.',
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
            'APH — conduta correta segundo princípios pré-hospitalares?',
            'B medicar por iniciativa própria — eliminar — exige prescrição ou protocolo.',
            'C remover imediatamente sem avaliar cena — eliminar — risco ao socorrista e vítima.',
            'D transporte rápido dispensando avaliação primária — eliminar — sequência invertida.',
            'A segurança da cena · abordagem inicial · acionar emergência — tríade correta.',
            'Marcar A.',
            'Fixação: APH = cena segura → abordar → acionar se preciso.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'APH — decore',
          meta: genericoSlideMeta,
          content: 'ATENDIMENTO PRÉ-HOSPITALAR',
          rows: APH_CENA_SEGURA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Administrar medicamentos por iniciativa própria viola limites profissionais do técnico no APH.',
      C: 'Remover vítima sem avaliar cena e estado clínico expõe socorrista e paciente a risco.',
      D: 'Priorizar transporte rápido dispensando avaliação primária inverte a sequência segura do APH.',
    },
  },
  'igeduc-geral-urgencias-e-emergencias-1777103471372-1': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'Picada de abelha — reação local predominante; sintomas como alopecia e redução de linfócitos CD4 não compõem quadro típico descrito na afirmativa',
      roi_error: 'picada_abelha_sintomas_absurdos',
      cluster: 'Certo ou errado — picada abelha sintomas',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Picada abelha — julgar',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Reação local',
              detail: 'Dor · edema · eritema no local da picada — padrão mais comum.',
              icon: 'Target',
            },
            {
              label: 'Sistêmico leve',
              detail: 'Urticária · prurido · mal-estar — possível reação sistêmica leve.',
              icon: 'Activity',
            },
            {
              label: '× CD4 / alopecia',
              detail: 'Marcadores imunológicos e queda capilar — não fazem parte do quadro típico de picada.',
              icon: 'Ban',
            },
            {
              label: 'Reação grave',
              detail: 'Dispneia · hipotensão · estridor — quadro sistêmico distinto da picada local.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca embute sintomas de outras condições na picada comum.',
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
            'Picada de abelha — julgar lista de manifestações.',
            'Reações locais e alguns sintomas gerais leves — plausíveis isoladamente.',
            'Alopecia e redução de linfócitos CD4 — não correspondem ao quadro típico de picada.',
            'Conjunto mistura achados incompatíveis com envenenamento por himenóptero comum.',
            'Marcar B (Errado).',
            'Fixação: picada = local + eventual urticária — não imunologia de HIV.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Abelha — decore',
          meta: genericoSlideMeta,
          content: 'PICADA DE HIMENÓPTERO',
          rows: PICADA_ABELHA_REACAO,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — aceitar cd4 alopecia',
          items: [
            {
              label: 'Certo — validar sintomas',
              detail: 'Aceitar alopecia e redução de CD4 como manifestação típica de picada.',
              correct:
                'Esses achados não compõem quadro típico de picada de abelha — afirmativa globalmente falsa.',
            },
            {
              label: 'Pegadinha — sintomas plausíveis',
              detail: 'Banca embute cefaleia e calafrios plausíveis com achados impossíveis.',
              correct:
                'Mesmo com sintomas gerais leves, CD4 e alopecia invalidam a afirmativa — marcar Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo valida alopecia e redução de linfócitos CD4 na picada de abelha — achados atípicos e incompatíveis.',
    },
  },
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104000896-5': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Definição Access — urgência = agravo imprevisto com ou sem risco potencial de vida, necessitando assistência médica imediata',
      roi_error: 'access_urgencia_definicao',
      cluster: 'Access — conceito urgência × emergência',
      danger_footer: 'Gabarito B — urgência Access',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Urgência — Access',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Conceitos de urgência e emergência segundo definição da banca Access.',
              icon: 'BookOpen',
            },
            {
              label: 'Urgência',
              detail: 'Agravo imprevisto com ou sem risco potencial — assistência imediata.',
              icon: 'Clock',
            },
            {
              label: 'Emergência',
              detail: 'Risco iminente de vida ou sofrimento intenso — tratamento imediato.',
              icon: 'AlertTriangle',
            },
            {
              label: '× Letra A',
              detail: 'Descreve risco iminente de vida mas rotula urgência — inversão.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca troca rótulos entre urgência e emergência.',
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
            'Urgência × emergência — definição correta (Access)?',
            'A define urgência com risco iminente de vida — perfil de emergência, não urgência Access.',
            'C rotula emergência com definição de urgência Access — troca de rótulos.',
            'D descreve emergência como avaliação sem intervenção instantânea — inconsistente.',
            'B urgência imprevista com ou sem risco potencial — assistência imediata — literal Access.',
            'Marcar B.',
            'Fixação: Access — urgência admite risco potencial variável · emergência = iminente.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Access — decore',
          meta: genericoSlideMeta,
          content: 'URGÊNCIA × EMERGÊNCIA (ACCESS)',
          rows: ACCESS_URGENCIA_EMERGENCIA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — inverter rotulos access',
          items: [
            {
              label: 'Letra A — urgência com risco iminente',
              detail: 'Define urgência com risco iminente de vida.',
              correct:
                'Pegadinha de rótulo — critério de risco iminente descreve emergência Access, não urgência.',
            },
            {
              label: 'Letra C — emergência imprevista',
              detail: 'Rotula emergência com definição de urgência Access.',
              correct:
                'Pegadinha de inversão — banca troca nomenclatura entre urgência e emergência.',
            },
            {
              label: 'Letra D — emergência sem intervenção',
              detail: 'Emergência sem intervenção instantânea.',
              correct:
                'Pegadinha — emergência exige tratamento imediato, não apenas avaliação pronta.',
            },
          ],
          footer_rule: 'Gabarito B — urgência Access',
        },
      ],
    },
    danger: {},
  },
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104000896-7': {
    branch: 'exceto',
    family: 'protocolo',
    guideline:
      'Decreto 5.055/2004 — Central de Regulação Médica regula, cobre eventos e capacita; entreposto de estabilização é função hospitalar/unidade móvel, não da CRMU',
    roiError: 'samu_crmu_exceto_entreposto',
    cluster: 'SAMU — atribuições CRMU EXCETO',
    buildSlides: (q) => [
      {
        type: 'concept_map',
        slide_title: 'SAMU — CRMU',
        chip_label: 'REGULAÇÃO',
        meta: excetoSlideMeta,
        items: [
          {
            label: 'CRMU',
            detail: 'Central de Regulação Médica de Urgências — recebe chamadas 192 e regula.',
            icon: 'Phone',
          },
          {
            label: 'Cobertura',
            detail: 'Eventos de risco e acidentes com múltiplas vítimas — atribuição real.',
            icon: 'Users',
          },
          {
            label: 'Capacitação',
            detail: 'Formação de recursos humanos do SAMU — atribuição institucional.',
            icon: 'GraduationCap',
          },
          {
            label: '× Entreposto',
            detail: 'Estabilização de crítico para UPH móvel — papel da unidade móvel/hospital, não da central.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — entreposto',
            detail: 'Confundir regulação da CRMU com estabilização operacional da unidade móvel.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: EXCETO_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: excetoSlideMeta,
        steps: [
          'Atribuições da Central de Regulação Médica — EXCETO qual?',
          'A cobertura de eventos de risco — função real da CRMU — eliminar.',
          'B cobertura a acidentes com múltiplas vítimas — função real — eliminar.',
          'C capacitação de recursos humanos — função real — eliminar.',
          'D entreposto de estabilização para UPH móvel — papel operacional da unidade móvel/hospital.',
          'Marcar D.',
          'Fixação: CRMU regula · cobre · capacita — não estabiliza paciente no entreposto.',
        ],
        footer_rule: EXCETO_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: excetoSlideMeta,
        content: 'SAMU — PAPÉIS',
        rows: samuPapeisRows([
          {
            label: 'CRMU',
            value: 'Regulação médica · cobertura · capacitação — Decreto 5.055/2004',
            badge: 'hot',
          },
          {
            label: 'Unidade móvel',
            value: 'Estabilização e transporte pré-hospitalar do paciente crítico',
            badge: 'ok',
          },
        ]),
        footer_rule: EXCETO_FOOTER,
      },
      dangerExceto(
        q,
        'EXCETO — ATRIBUIÇÕES CRMU',
        {
          A: 'Cobertura de eventos de risco é atribuição real da Central de Regulação Médica de Urgências.',
          B: 'Cobertura a acidentes com múltiplas vítimas integra planejamento e resposta do SAMU regulado pela CRMU.',
          C: 'Capacitação de recursos humanos do serviço móvel é função institucional compatível com a CRMU.',
        },
        'Exceção do enunciado — entreposto de estabilização do paciente crítico é pegadinha de papel: função da unidade móvel pré-hospitalar, não da Central de Regulação Médica.',
        'Gabarito D — entreposto não é CRMU',
      ),
    ],
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
    } else if (entry.branch === 'vf') {
      const q = raw as VfQ;
      const slides = finalizeVf(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaVf(
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
      const q = raw as ExcetoQ;
      const slides = entry.buildSlides(q);
      const out = {
        meta: metaExceto(
          q,
          entry.family,
          entry.guideline,
          slug,
          entry.roiError,
          entry.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    }

    ok++;
    console.log(`[handcraft:urgencias-g41] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g41] total=${ok}`);
}

main();
