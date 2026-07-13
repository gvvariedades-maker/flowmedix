#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g14 (11 slugs exceto + dispositivo + tempo).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g14
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g14';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const REVIEWED = '2026-07-12';

type Branch = 'puncao_exceto' | 'puncao_dispositivo' | 'puncao_tempo';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bumidade ousujidade\b/gi, 'umidade ou sujidade')
    .replace(/\bdecomplicações\b/gi, 'de complicações')
    .replace(/\brompimentodo\b/gi, 'rompimento do')
    .replace(/\bcontribuíremsignificativamente\b/gi, 'contribuírem significativamente')
    .replace(/\bcomcomprometimento\b/gi, 'com comprometimento')
    .replace(/\bperdas de líquidos por meio da transpiração\b/gi, 'perdas de líquidos por transpiração')
    .replace(/\bdelíquidos\b/gi, 'de líquidos')
    .replace(/\bestaratento\b/gi, 'estar atento')
    .replace(/\bDiante doexposto\b/gi, 'Diante do exposto')
    .replace(/\bumacaracterística\b/gi, 'uma característica')
    .replace(/\bumacesso\b/gi, 'um acesso')
    .replace(/\btraumaassociado\b/gi, 'trauma associado')
    .replace(/\bmedicamentosirritantes\b/gi, 'medicamentos irritantes')
    .replace(/\boscalp\b/gi, 'o scalp')
    .replace(/\baindicação\b/gi, 'a indicação')
    .replace(/\bmaisadequada\b/gi, 'mais adequada')
    .replace(/\bconformeprotocolo\b/gi, 'conforme protocolo')
    .replace(/\bfluidos corporais\b/gi, 'fluidos corporais')
    .replace(/\bunidades deinternação\b/gi, 'unidades de internação')
    .replace(/\bdeacordo\b/gi, 'de acordo')
    .replace(/\bdocateter\b/gi, 'do cateter')
    .replace(/\bqueos\b/gi, 'que os')
    .replace(/\bparaassegurar\b/gi, 'para assegurar')
    .replace(/\bÉ CORRETO:/gi, 'É CORRETO:')
    .replace(/\bÉ CORRETO\b/gi, 'É CORRETO')
    .replace(/\bassinale aalternativa\b/gi, 'assinale a alternativa')
    .replace(/\bmarque aalternativa\b/gi, 'marque a alternativa')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2');
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfArtifacts(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfArtifacts(o.text) })),
  };
}

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  branch: Branch;
  family: 'vf' | 'conceito' | 'protocolo' | 'calc' | 'certo_errado';
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  const corpus = `${q.question_data.instruction} ${q.question_data.options.map((o) => o.text).join(' ')} ${JSON.stringify(pack.slides)}`;
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    topico: 'Enfermagem',
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: buildPuncaoGuidelineSnapshot(corpus, pack.guideline),
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: buildPuncaoSourcesForSlug(corpus),
  };
}

const SPECS: Record<string, Pack> = {
  'fundep-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-1': {
    branch: 'puncao_exceto',
    family: 'conceito',
    guideline: 'Cateter venoso periférico — evitar regiões de articulação; preferir flexíveis; documentar calibre e data',
    roi_error: 'puncao_em_articulacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — cateteres endovenosos',
        chip_label: 'INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Uso de cateteres endovenosos — assinale a alternativa incorreta.',
            icon: 'Target',
          },
          {
            label: 'Cateter flexível',
            detail: 'Poliuretano e dispositivos flexíveis reduzem lesão íntima e flebite.',
            icon: 'Syringe',
          },
          {
            label: 'Sítio da punção',
            detail: 'Evitar articulações — flexão aumenta risco de infiltração e obstrução.',
            icon: 'Ban',
          },
          {
            label: 'Pós-punção',
            detail: 'Curativo, fixação e registro de calibre, data e assinatura.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca inverte e sugere punção em articulação como vantagem.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Articulação = sítio a evitar, não a escolher.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Escolha do sítio × mobilidade',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Flexível (A/C)', value: 'Menor trauma venoso que cateter rígido de rotina.', badge: 'ok' },
          { label: 'Documentação (D)', value: 'Curativo + calibre + data + identificação.', badge: 'ok' },
          { label: 'Articulação (B)', value: 'Não é sítio recomendado — mobilidade prejudica o acesso.', badge: 'hot' },
          { label: 'Princípio', value: 'Veia estável, longe de dobras articulares.', badge: 'info' },
        ],
        footer_rule: 'Mobilidade do paciente exige sítio fora de articulação.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a INCORRETA',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: alternativa incorreta sobre cateteres endovenosos.',
          'Validar A — cateter flexível reduz lesão íntima e complicações.',
          'Letra B — inserir em regiões de articulação está errado (risco de infiltração e rompimento).',
          'Validar C — poliuretano associado a menos flebite em punção periférica.',
          'Validar D — curativo, fixação e anotação de calibre/data.',
          'Marcar letra B.',
        ],
        footer_rule: 'FUNDEP cobra articulação como conduta falsa.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Por que A, C e D são corretas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO DA PUNÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Flexível',
            detail: 'Rígido lesa mais a íntima venosa — flexível é preferível.',
            correct: 'Afirmativa correta — não é a INCORRETA.',
          },
          {
            label: 'Letra C — Poliuretano',
            detail: 'Material flexível moderno reduz flebite em AVP.',
            correct: 'Conduta adequada — eliminar do INCORRETA.',
          },
          {
            label: 'Letra D — Registro',
            detail: 'Rastreabilidade do dispositivo faz parte da segurança.',
            correct: 'Documentação obrigatória — alternativa correta.',
          },
        ],
        footer_rule: 'Só B romantiza punção sobre articulação.',
      },
    ],
  },

  'gualimp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-5': {
    branch: 'puncao_exceto',
    family: 'conceito',
    guideline: 'Balanço hídrico — entradas e saídas mensuráveis; via parenteral é importante mas não única entrada em críticos',
    roi_error: 'bh_parenteral_principal_critico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — balanço hídrico',
        chip_label: 'INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Balanço hídrico (BH) — detectar retenção e sobrecarga; marque a INCORRETA.',
            icon: 'Target',
          },
          {
            label: 'Cálculo',
            detail: 'Infundido menos eliminado — perdas insensíveis nem sempre entram no BH adulto.',
            icon: 'Calculator',
          },
          {
            label: 'BH positivo',
            detail: 'Sugere retenção — correlacionar com FC e PA elevadas.',
            icon: 'TrendingUp',
          },
          {
            label: 'Via parenteral',
            detail: 'Grande volume em críticos, mas não se chama de única via principal de entrada.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha',
            detail: 'Letra D absolutiza parenteral como principal entrada de líquidos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'BH soma todas as entradas mensuráveis — não só EV.',
      },
      {
        type: 'golden_rule',
        slide_title: 'BH × vias de entrada',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Fórmula (B)', value: 'Entradas − saídas mensuráveis na prática clínica.', badge: 'ok' },
          { label: 'Perdas insensíveis (A)', value: 'Nem sempre quantificadas no BH do adulto.', badge: 'info' },
          { label: 'Retenção (C)', value: 'BH positivo + sinais de sobrecarga.', badge: 'ok' },
          { label: 'Erro (D)', value: 'Parenteral como única/principal via de entrada — generalização indevida.', badge: 'hot' },
        ],
        footer_rule: 'Crítico recebe EV, mas BH não reduz tudo a parenteral.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Eliminar a falsa sobre BH',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: INCORRETA sobre balanço hídrico.',
          'Validar A — perdas insensíveis nem sempre entram no cálculo do adulto.',
          'Validar B — BH = infundido − eliminado (operação simples).',
          'Validar C — BH positivo com FC/PA elevadas sugere retenção.',
          'Letra D — afirmar que a principal via de entrada em críticos é sempre parenteral está incorreta.',
          'Marcar letra D.',
        ],
        footer_rule: 'GUALIMP mistura BH com absoluto parenteral.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — BH e acesso venoso',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — BALANÇO HÍDRICO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Perdas insensíveis',
            detail: 'Transpiração e respiração nem sempre são medidas no BH.',
            correct: 'Afirmativa aceita em prova — não é a INCORRETA.',
          },
          {
            label: 'Letra B — Cálculo simples',
            detail: 'Entradas menos eliminações é a lógica do BH.',
            correct: 'Mecânica correta do balanço — eliminar.',
          },
          {
            label: 'Letra C — Sobrecarga',
            detail: 'BH positivo orienta avaliar sinais vitais.',
            correct: 'Correlação clínica válida — alternativa correta.',
          },
        ],
        footer_rule: 'D confunde importância da EV com ser a única entrada.',
      },
    ],
  },

  'instituto-consulplan-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-7': {
    branch: 'puncao_exceto',
    family: 'conceito',
    guideline: 'Infiltração/extravasamento — reconhecer sinais; não abaixar equipo para forçar retorno sanguíneo',
    roi_error: 'infiltracao_abaixar_equipo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — infiltração',
        chip_label: 'INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Infiltração e extravasamento na infusão venosa — marque a INCORRETA.',
            icon: 'Target',
          },
          {
            label: 'Sinais',
            detail: 'Mudança de temperatura, dor, edema e risco de necrose local.',
            icon: 'Thermometer',
          },
          {
            label: 'Solução irritante',
            detail: 'Pode causar descamação do tecido — vigilância contínua.',
            icon: 'Flame',
          },
          {
            label: 'Conduta errada',
            detail: 'Abaixar a bolsa para “provar” retorno de sangue mascara infiltração.',
            icon: 'XCircle',
          },
          {
            label: 'Garrote local',
            detail: 'Apertar acima do sítio com infusão ainda gotejando agrava extravasamento.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Suspeita de infiltração → interromper e reavaliar, não manipular equipo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Reconhecer × mascarar',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Sinais (A/B)', value: 'Temperatura alterada e lesão cutânea em solução irritante.', badge: 'ok' },
          { label: 'Garrote (D)', value: 'Restringir fluxo com infusão ativa pode ocultar extravasamento.', badge: 'warn' },
          { label: 'Erro (C)', value: 'Abaixar solução para forçar sangue no equipo — conduta incorreta.', badge: 'hot' },
          { label: 'Conduta', value: 'Parar infusão, elevar membro, avaliar sítio e notificar.', badge: 'info' },
        ],
        footer_rule: 'Não use gravidade do equipo como teste de permeabilidade.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a INCORRETA',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: afirmativa INCORRETA sobre infiltração/extravasamento.',
          'Validar A — paciente pode relatar mudança de temperatura no sítio.',
          'Validar B — solução irritante pode descamar o tecido.',
          'Validar D — garrote local com infusão ativa é conduta de vigilância, não a INCORRETA pedida.',
          'Letra C — abaixar a solução para retorno de sangue no equipo está incorreta.',
          'Marcar letra C.',
        ],
        footer_rule: 'CONSULPLAN cobra manipulação do equipo como erro.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — sinais reais',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — EXTRAVASAMENTO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Temperatura',
            detail: 'Frio ou calor local alertam para solução fora do vaso.',
            correct: 'Sinal clínico válido — alternativa correta.',
          },
          {
            label: 'Letra B — Irritante',
            detail: 'Químico vesicante ou irritante lesa pele e subcutâneo.',
            correct: 'Risco real documentado — não é a INCORRETA.',
          },
          {
            label: 'Letra D — Garrote',
            detail: 'Pode ser usado em manobra de contenção do extravasamento em alguns protocolos.',
            correct: 'Não confunda com C — o erro é abaixar a bolsa para “testar” sangue.',
          },
        ],
        footer_rule: 'Retorno sanguíneo espontâneo ≠ prova de cateter bem posicionado.',
      },
    ],
  },

  'reis-e-reis-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-8': {
    branch: 'puncao_exceto',
    family: 'conceito',
    guideline: 'Curativo de cateter vascular — proteger sítio, manter seco e detectar infecção; não é curativo de ferida com drenagem',
    roi_error: 'curativo_vascular_drenar_exsudato',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — curativo vascular',
        chip_label: 'EXCETO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Finalidades do curativo de cateteres vasculares — assinale a EXCETO.',
            icon: 'Target',
          },
          {
            label: 'Proteção',
            detail: 'Manter o local limpo e seco sobre o sítio de inserção.',
            icon: 'Shield',
          },
          {
            label: 'Barreira',
            detail: 'Prevenir entrada de microrganismos no cateter.',
            icon: 'Lock',
          },
          {
            label: 'Vigilância',
            detail: 'Permitir observar rubor, edema ou secreção precoce.',
            icon: 'Eye',
          },
          {
            label: 'Intruso',
            detail: 'Drenar exsudato como curativo de ferida — não é função do curativo de acesso.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Curativo de cateter ≠ curativo absorvente de ferida.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funções do curativo de acesso',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'PROTEGER · SECAR · VIGIAR',
        rows: [
          { label: 'A — Limpo e seco', value: 'Finalidade correta do curativo.', badge: 'ok' },
          { label: 'C — Prevenir infecção', value: 'Barreira microbiológica no sítio.', badge: 'ok' },
          { label: 'D — Detectar infecção', value: 'Inspeção através de curativo transparente.', badge: 'ok' },
          { label: 'B — Drenar exsudato', value: 'Função de curativo de ferida, não de cateter vascular.', badge: 'hot' },
        ],
        footer_rule: 'EXCETO = tratar curativo vascular como ferida cavitária.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Localizar o EXCETO',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: finalidades do curativo vascular — EXCETO.',
          'Validar A — conservar limpo e seco.',
          'Validar C — prevenir infecção.',
          'Validar D — verificar sinais de infecção.',
          'Letra B — remover, drenar e absorver exsudato não é finalidade do curativo de cateter.',
          'Marcar letra B.',
        ],
        footer_rule: 'REIS E REIS separa curativo de acesso de curativo de ferida.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Finalidades corretas (não são EXCETO)',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CURATIVO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Limpo e seco',
            detail: 'Umidade no curativo aumenta colonização bacteriana.',
            correct: 'Finalidade legítima — não marque no EXCETO.',
          },
          {
            label: 'Letra C — Prevenir infecção',
            detail: 'Selo estéril ou semipermeável protege o orifício.',
            correct: 'Objetivo central do curativo — eliminar.',
          },
          {
            label: 'Letra D — Detectar infecção',
            detail: 'Curativo transparente permite inspeção diária.',
            correct: 'Vigilância faz parte do cuidado — alternativa correta.',
          },
        ],
        footer_rule: 'Só B descreve curativo de ferida, não de cateter.',
      },
    ],
  },

  'gama-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-0': {
    branch: 'puncao_dispositivo',
    family: 'conceito',
    guideline: 'Scalp (cateter agulhado) — neonatos e crianças pequenas; calibre fino e menor trauma',
    roi_error: 'scalp_adulto_uti_longo_prazo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cateter agulhado (scalp)',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Característica e indicação corretas do cateter agulhado (scalp).',
            icon: 'Target',
          },
          {
            label: 'Neonato/criança',
            detail: 'Veias finas — scalp de calibre menor e menor trauma na inserção.',
            icon: 'Baby',
          },
          {
            label: 'Adulto/UTI',
            detail: 'Não é dispositivo de acesso prolongado em adulto crítico.',
            icon: 'XCircle',
          },
          {
            label: 'Coleta exclusiva',
            detail: 'Scalp também administra medicação — não é só coleta.',
            icon: 'TestTube',
          },
          {
            label: 'Pegadinha',
            detail: 'Alternativas descrevem adulto, UTI ou uso exclusivo laboratorial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Scalp = pediatria e veias delicadas.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Scalp × perfil do paciente',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Indicação (B)', value: 'Neonatos e crianças pequenas — calibre fino.', badge: 'hot' },
          { label: 'Adulto longo prazo (A/D)', value: 'Jelco/cateter flexível, não scalp.', badge: 'warn' },
          { label: 'Só coleta (C)', value: 'Scalp infunde e coleta — uso curto.', badge: 'info' },
          { label: 'Trauma', value: 'Menor lesão em comparação a calibres maiores.', badge: 'ok' },
        ],
        footer_rule: 'Memorize: scalp = pediatria.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher a descrição correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: característica e indicação do cateter agulhado (scalp).',
          'Eliminar A — adulto com acesso longo prazo não é indicação clássica do scalp.',
          'Eliminar C — não é exclusivo para coleta de sangue.',
          'Eliminar D — emergência adulta em UTI usa outros dispositivos.',
          'Letra B: neonatos e crianças pequenas — menor dimensão e menor trauma.',
          'Marcar letra B.',
        ],
        footer_rule: 'GAMA ancora scalp na pediatria.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — generalizar o scalp',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — DISPOSITIVO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Adulto longo prazo',
            detail: 'Scalp é acesso curto; adulto crítico precisa cateter flexível.',
            correct: 'Descrição incorreta — eliminar.',
          },
          {
            label: 'Letra C — Só coleta',
            detail: 'Butterfly/scalp também infunde medicação em curta duração.',
            correct: 'Uso não exclusivo laboratorial.',
          },
          {
            label: 'Letra D — UTI adulto',
            detail: 'Emergência adulta pede jelco de calibre adequado à infusão.',
            correct: 'Indicação pediátrica = letra B.',
          },
        ],
        footer_rule: 'Calibre fino + paciente pequeno = scalp.',
      },
    ],
  },

  'gama-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-2': {
    branch: 'puncao_dispositivo',
    family: 'conceito',
    guideline: 'Scalp calibre fino para curta duração/coleta; jelco calibre maior para infusão prolongada',
    roi_error: 'scalp_jelco_calibre_invertido',
    exam_vs_current:
      'Prova Gama cita calibres 21G/23G (scalp) e 14–24G (jelco) — valores do enunciado, não norma numérica universal.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Scalp × jelco',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Diferenças corretas entre scalp (butterfly) e jelco (AVP).',
            icon: 'Target',
          },
          {
            label: 'Scalp',
            detail: 'Curta duração ou coleta — calibres finos (butterfly).',
            icon: 'Syringe',
          },
          {
            label: 'Jelco',
            detail: 'Infusão prolongada e medicação EV — calibres médios a largos.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha A',
            detail: 'Scalp maior que jelco para volume irritante — inversão de calibre.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha D',
            detail: 'Jelco exclusivo de neonato ou scalp para contraste — troca de papéis.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Curta duração = scalp; permanência = jelco.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Calibres × indicação',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Scalp', value: 'Calibres finos · coleta ou acesso breve.', badge: 'hot' },
          { label: 'Jelco', value: 'Calibres maiores · infusão prolongada.', badge: 'hot' },
          { label: 'Pediatria frágil', value: 'Calibres menores conforme veia — não inverter dispositivos.', badge: 'info' },
          { label: 'Correto (C)', value: 'Scalp curto/coleta; jelco infusão prolongada.', badge: 'ok' },
        ],
        footer_rule: 'Pergunte: coleta curta ou infusão que vai ficar?',
      },
      {
        type: 'logic_flow',
        slide_title: 'Comparar scalp e jelco',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: diferenças corretas entre scalp e jelco (calibre e indicação).',
          'Eliminar A — scalp não é calibre maior para volume irritante.',
          'Eliminar B — inverte papéis (jelco pediátrico × scalp adulto).',
          'Eliminar D — jelco não é exclusivo de neonato; scalp não é para contraste radiológico.',
          'Letra C: scalp calibre fino para curta duração/coleta; jelco calibre maior para infusão prolongada.',
          'Marcar letra C.',
        ],
        footer_rule: 'GAMA cobra tabela mental scalp curto × jelco longo.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — inverter dispositivos',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CALIBRE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Scalp grande',
            detail: 'Scalp é fino; grande volume irritante pede jelco adequado.',
            correct: 'Calibres invertidos — eliminar.',
          },
          {
            label: 'Letra B — Papéis trocados',
            detail: 'Scalp não é rotina de punção breve em adulto com jelco para pediatria.',
            correct: 'Indicações cruzadas incorretamente.',
          },
          {
            label: 'Letra D — Neonato/contraste',
            detail: 'Generalizações falsas sobre quem usa cada dispositivo.',
            correct: 'Só C fecha a comparação correta.',
          },
        ],
        footer_rule: 'Butterfly = curto; jelco = permanece infundindo.',
      },
    ],
  },

  'ibade-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-8': {
    branch: 'puncao_dispositivo',
    family: 'conceito',
    guideline: 'Cateter de calibre muito fino — veias de pequeno calibre em lactentes, pré-escolares e crianças menores',
    roi_error: 'gauge_25_infusao_rapida',
    exam_vs_current:
      'Prova IBADE ancora calibre vinte e cinco G para veias pequenas em crianças — referência do gabarito, não tabela única de protocolo.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dispositivo de calibre fino',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cateter venoso periférico de calibre muito fino — indicação mais adequada.',
            icon: 'Target',
          },
          {
            label: 'Calibre fino',
            detail: 'Quanto maior o número G, menor o calibre — dispositivo muito fino.',
            icon: 'Gauge',
          },
          {
            label: 'Veias pequenas',
            detail: 'Lactentes, pré-escolares e crianças menores com vasos delicados.',
            icon: 'Baby',
          },
          {
            label: 'Infusão rápida',
            detail: 'Calibre fino não suporta fluxo alto — pegadinha da letra A.',
            icon: 'XCircle',
          },
          {
            label: 'Maioria das infusões',
            detail: 'Rotina adulta usa calibres maiores.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Calibre fino = veia miúda de criança pequena.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tabela mental de calibre',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Calibre fino (C)', value: 'Veias pequenas · lactentes e pré-escolares.', badge: 'hot' },
          { label: 'Infusão rápida (A)', value: 'Calibres maiores — não cateter fino.', badge: 'warn' },
          { label: 'Maioria (B)', value: 'Adulto/escolar usa calibre intermediário em rotina.', badge: 'info' },
          { label: 'Neonato (D)', value: 'Pode usar scalp; calibre fino cobre crianças pequenas.', badge: 'info' },
        ],
        footer_rule: 'Número G alto = agulha fina = pediatria miúda.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Para quem é o calibre fino?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: dispositivo de calibre muito fino mais indicado para…',
          'Eliminar A — infusão rápida exige calibre maior.',
          'Eliminar B — maioria das infusões em adulto não usa cateter fino.',
          'Eliminar D — neonato/lactente pode usar scalp; calibre fino cobre veias pequenas de crianças menores.',
          'Eliminar E — escolares/adolescentes/idosos usam calibres intermediários.',
          'Letra C: veias de pequeno calibre em lactentes, pré-escolares e crianças menores.',
          'Marcar letra C.',
        ],
        footer_rule: 'IBADE ancora calibre fino na pediatria de veias delicadas.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — calibre e fluxo',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CALIBRE FINO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Infusão rápida',
            detail: 'Lúmen estreito limita vazão — precisa calibre maior.',
            correct: 'Incompatível com cateter fino — eliminar.',
          },
          {
            label: 'Letra B — Maioria',
            detail: 'Adulto médio recebe calibre intermediário, não fino.',
            correct: 'Rotina geral não é indicação do cateter fino.',
          },
          {
            label: 'Letra E — Escolar/idoso',
            detail: 'Veias maiores toleram cateter de calibre intermediário.',
            correct: 'Faixa etária errada para calibre muito fino.',
          },
        ],
        footer_rule: 'Quanto menor a veia, maior o número G do cateter.',
      },
    ],
  },

  'instituto-verbena-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-0': {
    branch: 'puncao_dispositivo',
    family: 'protocolo',
    guideline: 'Registro de enfermagem no AVP — data/hora, local, calibre, punções, intercorrências e identificação do profissional',
    roi_error: 'registro_avp_misturado_dreno',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Documentação do AVP',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Acesso venoso periférico — o que anotar no registro de enfermagem.',
            icon: 'Target',
          },
          {
            label: 'Quando e onde',
            detail: 'Data, hora, motivo (inicial/troca) e local da punção.',
            icon: 'MapPin',
          },
          {
            label: 'Dispositivo',
            detail: 'Tipo, calibre, número de punções e condições da pele/veia.',
            icon: 'Syringe',
          },
          {
            label: 'Segurança',
            detail: 'Intercorrências, permeabilização e medida de contenção se usada.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha',
            detail: 'Alternativas misturam registro de dreno, escala de dor ou SNG.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Registro do AVP descreve o acesso venoso, não outro dispositivo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Itens do registro AVP',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Data/hora/local', value: 'Quando e onde foi puncionado.', badge: 'ok' },
          { label: 'Cateter', value: 'Tipo, calibre e número de tentativas.', badge: 'ok' },
          { label: 'Intercorrências', value: 'Falhas, extravasamento e condutas.', badge: 'ok' },
          { label: 'Profissional', value: 'Identificação de quem realizou.', badge: 'info' },
          { label: 'Dreno/escala (A/B)', value: 'Itens de outro procedimento — distratores.', badge: 'warn' },
        ],
        footer_rule: 'VERBENA cobra lista específica de punção venosa.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual lista documenta AVP?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: anotações obrigatórias ao realizar acesso venoso periférico.',
          'Eliminar A — mistura avaliação corporal e escala de dor (não é registro de punção).',
          'Eliminar B — descreve dreno cirúrgico (tipo, secreção, penrose).',
          'Eliminar D e E — outros dispositivos ou campos genéricos fora do AVP.',
          'Letra C: data/hora, motivo, local, condições, punções, calibre, intercorrências e segurança.',
          'Marcar letra C.',
        ],
        footer_rule: 'Leia a lista inteira — procure “punção” e “cateter”.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — registro de outro procedimento',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — DOCUMENTAÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Escala de dor',
            detail: 'Avaliação de dor é registro clínico, não checklist de punção.',
            correct: 'Procedimento diferente — eliminar.',
          },
          {
            label: 'Letra B — Dreno',
            detail: 'Volume e aspecto de secreção pertencem a drenos cirúrgicos.',
            correct: 'Não documenta AVP — buscar letra C.',
          },
          {
            label: 'Lista genérica',
            detail: 'Banca copia itens de SNG ou curativo sem citar veia.',
            correct: 'Só C lista punção, calibre e tentativas.',
          },
        ],
        footer_rule: 'AVP no prontuário = rastreio do dispositivo venoso.',
      },
    ],
  },

  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-4': {
    branch: 'puncao_tempo',
    family: 'certo_errado',
    guideline: 'Carmagnani — antissepsia com álcool 70% ou clorexidina alcoólica 0,5%; evitar FAV; não trocar cateter em 24h rotineiro',
    roi_error: 'carmagnani_antissepsia_fav_24h',
    exam_vs_current:
      'Letra B cobra álcool 70% ou clorexidina 0,5% e condutas clássicas de prova (FAV proibida, troca após 2ª falha). Guidelines atuais podem diferir em periodicidade de troca do cateter.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Carmagnani — punção periférica',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'É CORRETO afirmar sobre punção venosa periférica (Carmagnani).',
            icon: 'Target',
          },
          {
            label: 'Antissepsia (B)',
            detail: 'Álcool 70% ou clorexidina alcoólica 0,5% no sítio.',
            icon: 'Droplets',
          },
          {
            label: 'FAV (A)',
            detail: 'Membro com fístula arteriovenosa não deve ser puncionado.',
            icon: 'Ban',
          },
          {
            label: 'Escolha de veia (C)',
            detail: '“Sempre” antecubital dominante é absoluto demais.',
            icon: 'XCircle',
          },
          {
            label: 'Troca 24h (D)',
            detail: 'Troca rotineira diária não é conduta atual para prevenir infecção.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Antissepsia correta = letra B.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Carmagnani — decore técnico',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Correto (B)', value: 'Antissepsia: álcool 70% ou clorexidina 0,5%.', badge: 'hot' },
          { label: 'FAV', value: 'Nunca punir membro com fístula AV.', badge: 'warn' },
          { label: '“Sempre” antecubital', value: 'Escolha individualizada — não é regra fixa.', badge: 'info' },
          { label: 'Troca 24h', value: 'Não se troca cateter por calendário curto de rotina.', badge: 'warn' },
          { label: '2ª falha', value: 'Outro profissional após segunda tentativa sem sucesso.', badge: 'ok' },
        ],
        footer_rule: 'FAV sagrada; antissepsia com álcool ou clorexidina.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual afirmativa é CORRETA?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: É CORRETO segundo Carmagnani — punção venosa periférica.',
          'Eliminar A — membro com fístula arteriovenosa não pode ser puncionado.',
          'Letra B: antissepsia com álcool 70% ou clorexidina alcoólica 0,5% — correta.',
          'Eliminar C — “sempre” veia antecubital dominante é generalização.',
          'Eliminar D — troca do cateter a cada 24 horas não é recomendação atual.',
          'Eliminar E — troca de profissional após quarta tentativa; referência cobra após segunda falha.',
          'Marcar letra B.',
        ],
        footer_rule: 'OBJETIVA isola a antissepsia como única CORRETA.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — FAV e troca calendarizada',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E CARMANGANI',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — FAV',
            detail: 'Hemodiálise depende do fistula — punção destrói o acesso.',
            correct: 'Afirmativa falsa — eliminar.',
          },
          {
            label: 'Letra C — Sempre antecubital',
            detail: 'Dominância e calibre variam por paciente.',
            correct: 'Absoluto indevido — não é CORRETO.',
          },
          {
            label: 'Letra D — 24 horas',
            detail: 'Troca por necessidade clínica, não relógio fixo diário.',
            correct: 'Calendarização errada — só B fecha.',
          },
        ],
        footer_rule: 'Memorize antissepsia B antes das demais pegadinhas.',
      },
    ],
  },

  'selecon-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-3': {
    branch: 'puncao_tempo',
    family: 'protocolo',
    guideline: 'Prevenção ITU associada a cateter vesical — esvaziar bolsa regularmente com recipiente individual; manter sistema fechado',
    roi_error: 'itu_coletor_coletivo_bolsa_acima',
    exam_vs_current:
      'Questão de sonda vesical no lote de punção — ensinar prevenção de ITU-AC: esvaziamento regular, recipiente individual e bolsa abaixo da bexiga.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ITU-AC — prevenção na SVD',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cuidados do técnico para prevenir ITU relacionada à cateterização vesical.',
            icon: 'Target',
          },
          {
            label: 'Esvaziamento',
            detail: 'Bolsa coletora esvaziada regularmente — não só a cada 24h fixas.',
            icon: 'Clock',
          },
          {
            label: 'Recipiente',
            detail: 'Coletor individual por paciente — evita contaminação cruzada.',
            icon: 'User',
          },
          {
            label: 'Sistema fechado',
            detail: 'Tubo de drenagem não deve tocar o recipiente coletor.',
            icon: 'Link',
          },
          {
            label: 'Posição da bolsa',
            detail: 'Manter abaixo da bexiga — pegadinha das letras C/D.',
            icon: 'ArrowDown',
          },
        ],
        footer_rule: 'ITU-AC: fechado, individual e abaixo da bexiga.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Checklist ITU-AC',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Correto (B)', value: 'Esvaziar regularmente + recipiente individual + não tocar tubo no coletor.', badge: 'hot' },
          { label: '24h fixo (A)', value: 'Intervalo rígido sem “regularmente” — incompleto.', badge: 'warn' },
          { label: 'Bolsa acima (C/D)', value: 'Refluxo urinário — manter abaixo da bexiga.', badge: 'warn' },
          { label: 'Coletivo (A)', value: 'Recipiente compartilhado aumenta risco de ITU.', badge: 'info' },
        ],
        footer_rule: 'SELECON cobra tríade: regular + individual + sem contato.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher os cuidados corretos',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: prevenção de ITU associada à cateterização vesical.',
          'Eliminar A — esvaziar só a cada 24h com recipiente coletivo.',
          'Eliminar C — bolsa acima da bexiga e intervalo fixo de 12h.',
          'Eliminar D — esvaziamento regular mas bolsa acima da bexiga.',
          'Letra B: esvaziar regularmente, recipiente individual e evitar contato do tubo com o coletor.',
          'Marcar letra B.',
        ],
        footer_rule: 'Mesmo em lote de punção, aplique protocolo de SVD.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — bolsa e coletor',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ITU-AC',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Coletivo 24h',
            detail: 'Recipiente compartilhado e intervalo longo favorece colonização.',
            correct: 'Duplo erro — eliminar.',
          },
          {
            label: 'Letra C — Acima da bexiga',
            detail: 'Gravidade favorece refluxo e infecção ascendente.',
            correct: 'Posição incorreta da bolsa.',
          },
          {
            label: 'Letra D — Só posição',
            detail: 'Mesmo esvaziando, bolsa alta mantém risco.',
            correct: 'Falta manter bolsa abaixo da bexiga.',
          },
        ],
        footer_rule: 'Sistema urinário fechado = prevenção de ITU.',
      },
    ],
  },

  'vunesp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-4': {
    branch: 'puncao_tempo',
    family: 'protocolo',
    guideline: 'Prevenção de infecção em cateter periférico — novo cateter a cada tentativa; não trocar rotineiro em 48h',
    roi_error: 'reutilizar_cateter_tentativa',
    exam_vs_current:
      'Letra D (cateter novo a cada tentativa) é o gabarito VUNESP. Letra E (troca a cada 48h) e avaliação só a cada 24h (B) podem divergir de protocolos que priorizam necessidade clínica sobre calendário.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção — cateter periférico',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Medida de prevenção de infecção em cateteres periféricos.',
            icon: 'Target',
          },
          {
            label: 'Higiene das mãos',
            detail: 'HH com água e sabão ou álcool gel conforme sujidade visível.',
            icon: 'Hand',
          },
          {
            label: 'Novo cateter',
            detail: 'Cada tentativa de punção exige dispositivo estéril novo.',
            icon: 'Syringe',
          },
          {
            label: 'Avaliação do sítio',
            detail: 'Inspeção conforme rotina — não só a cada 24h fixas.',
            icon: 'Eye',
          },
          {
            label: 'Pegadinha',
            detail: 'Troca calendarizada em 48h ou barbear rotineiro.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tentativa falhou → outro cateter estéril.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Medidas × erros clássicos',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Correto (D)', value: 'Novo cateter periférico a cada tentativa no mesmo paciente.', badge: 'hot' },
          { label: 'HH (A)', value: 'Correta, mas incompleta frente às demais opções da questão.', badge: 'info' },
          { label: 'Avaliar 24h (B)', value: 'Frequência fixa não substitui vigilância contínua.', badge: 'warn' },
          { label: 'Barbear (C)', value: 'Não é rotina recomendada na punção periférica.', badge: 'warn' },
          { label: 'Troca 48h (E)', value: 'Troca por indicação, não calendário fixo.', badge: 'warn' },
        ],
        footer_rule: 'VUNESP destaca dispositivo novo por tentativa.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual medida previne infecção?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: prevenção de infecção relacionada a cateter periférico.',
          'Letra A descreve HH — correta, mas há opção mais específica na lista.',
          'Eliminar B — avaliação apenas a cada 24h é intervalo fixo inadequado.',
          'Eliminar C — barbear membros superiores não é medida de rotina.',
          'Letra D: usar novo cateter a cada tentativa de punção — medida preventiva chave.',
          'Eliminar E — troca rotineira a cada 48h não é conduta atual.',
          'Marcar letra D.',
        ],
        footer_rule: 'Falha de punção = descartar cateter e abrir outro estéril.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — calendário e técnica',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PREVENÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Higiene',
            detail: 'HH é obrigatória, mas a questão pede medida mais específica de dispositivo.',
            correct: 'Correta porém genérica — D é mais completa.',
          },
          {
            label: 'Letra B — 24 horas',
            detail: 'Sítio deve ser observado na assistência, não só em relógio fixo.',
            correct: 'Periodicidade inadequada — eliminar.',
          },
          {
            label: 'Letra E — 48 horas',
            detail: 'Troca quando indicado clinicamente, não a cada dois dias.',
            correct: 'Calendarização errada — D prevalece.',
          },
        ],
        footer_rule: 'Não reutilize cateter de tentativa mal-sucedida.',
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
      question_data: cleanQuestionData(raw.question_data),
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:puncao-g14] OK ${slug} (${pack.branch})`);
  }
  console.log(`[handcraft:puncao-g14] total=${ok}`);
}

main();
