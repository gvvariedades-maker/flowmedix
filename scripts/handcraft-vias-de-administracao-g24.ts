#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g24 (8 slugs P2 perfis + técnica + VF).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g24.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const loteQuestionsDir = (lote: string) =>
  join(process.cwd(), 'data/catalog-migration', lote, 'questions');

const LOTE = 'vias-de-administracao-g24';
const SUBTOPICO = 'Vias de Administração';
const REVIEWED = '2026-07-04';

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'absorção IM x SC x IV',
    'via oral enteral',
    'técnica IM 90°',
    'técnica SC 45°–90°',
    'sítios SC',
    'hipodermóclise',
    'noradrenalina diluente',
    'técnica em Z',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção por via', 'técnica de punção', 'materiais enterais', 'hipodermóclise'],
};

const MS_SOURCE = {
  id: 'ms-cuidados-paliativos',
  tier: 'A' as const,
  issuer: 'MS',
  title: 'Cuidados paliativos — hipodermóclise',
  year: 2020,
  url: 'https://www.gov.br/saude/',
  covers: ['hipodermóclise volume', 'fluidoterapia SC paliativa'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'certo_errado';
  branch: 'via_vf_absorcao' | 'via_tecnica_admin' | 'via_generico';
  guideline: string;
  roi_error?: string;
  cluster?: string;
  sources?: (typeof COFEN_SOURCE)[];
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
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      cluster: pack.cluster ?? 'Perfis de via',
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'funatec-enfermagem-vias-de-administracao-1778968609115-0': {
    family: 'certo_errado',
    branch: 'via_tecnica_admin',
    cluster: 'INCORRETA / NÃO correta',
    guideline: 'COFEN/Potter — materiais para administração enteral: bandeja, medicamento, copo; gaze é material parenteral',
    roi_error: 'gaze_enteral_confusao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Materiais enterais — mapa NÃO correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'NÃO apresenta corretamente os materiais para administração por vias enterais — quatro itens corretos; um é de via parenteral.',
            icon: 'Target',
          },
          {
            label: 'Via enteral',
            detail: 'Medicamento pelo trato digestório — oral, sonda, sublingual, retal.',
            icon: 'Pill',
          },
          {
            label: 'Bandeja',
            detail: 'Organização asséptica do material — item correto para qualquer administração.',
            icon: 'Layers',
          },
          {
            label: 'Medicamento prescrito',
            detail: 'Fármaco da prescrição — indispensável em qualquer via.',
            icon: 'Syringe',
          },
          {
            label: 'Copo descartável',
            detail: 'Recipiente graduado para deglutição de líquidos orais — material enteral típico.',
            icon: 'CupSoda',
          },
          {
            label: 'Pegadinha — gaze no kit enteral',
            detail: 'Erro reproduzível: incluir gaze como material de via enteral — gaze é antissepsia parenteral.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Enteral = deglutição · gaze = pele/parenteral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: NÃO apresenta corretamente — quatro materiais verdadeiros, um inadequado.',
          'Testar A bandeja: organização do procedimento → correta → eliminar.',
          'Testar B medicamento prescrito: item obrigatório → correta → eliminar.',
          'Testar C copo descartável: recipiente para via oral → correta → eliminar.',
          'Testar D gaze: material de antissepsia cutânea para punção — não é material enteral de rotina.',
          'Confirmar: gaze pertence ao kit parenteral, não ao preparo oral.',
          'Marcar D.',
        ],
        footer_rule: 'Gaze não fecha lista de materiais enterais',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — materiais por via',
        meta: slideMeta,
        content: 'ENTERAL × PARENTERAL — MATERIAIS',
        rows: [
          { label: 'Enteral oral', value: 'Bandeja · medicamento · copo/colher · água', badge: 'hot' },
          { label: 'Parenteral', value: 'Gaze · álcool 70% · seringa · agulha · luvas', badge: 'ok' },
          { label: 'Copo graduado', value: 'Medição e deglutição de líquidos orais', badge: 'info' },
          { label: 'Gaze', value: 'Antissepsia de pele — punção IM/SC/IV', emphasis: 'alert', badge: 'warn' },
          { label: 'Pegadinha', value: 'Misturar kit parenteral com lista enteral', badge: 'hot' },
        ],
        footer_rule: 'Leia a via antes de listar materiais',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FUNATEC — MATERIAIS ENTERAIS',
        items: [
          {
            label: 'Letra A — bandeja',
            detail: 'Recipiente de organização universal em enfermagem.',
            correct: 'Afirmativa correta: bandeja é material utilizado na administração enteral.',
          },
          {
            label: 'Letra B — medicamento prescrito',
            detail: 'Fármaco indicado na prescrição médica.',
            correct: 'Afirmativa correta: medicamento prescrito integra o material de qualquer via.',
          },
          {
            label: 'Letra C — copo descartável',
            detail: 'Recipiente para líquidos orais com medida aproximada.',
            correct: 'Afirmativa correta: copo descartável graduado é material típico de administração oral.',
          },
          {
            label: 'Letra D — gaze',
            detail: 'Compressa estéril para limpeza de pele em punção.',
            correct: 'NÃO correta: gaze é material de antissepsia parenteral — não integra rotina enteral oral.',
          },
        ],
        footer_rule: 'D é o único item fora do perfil enteral',
      },
    ],
  },

  'fundatec-enfermagem-vias-de-administracao-1776056409987-7': {
    family: 'conceito',
    branch: 'via_generico',
    cluster: 'Vasopressor EV — diluente e acesso',
    guideline: 'COFEN/sociedades — noradrenalina: diluir em glicose 5% e preferir acesso venoso central (extravasamento)',
    roi_error: 'noradrenalina_soro_fisiologico_periferico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Noradrenalina — diluente e acesso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Preencher lacunas: solução preferencial e tipo de acesso venoso para noradrenalina em urgência.',
            icon: 'Target',
          },
          {
            label: 'Noradrenalina',
            detail: 'Vasopressor — fotossensível, oxida com exposição à luz em acesso periférico.',
            icon: 'Zap',
          },
          {
            label: 'Glicose 5% (gabarito)',
            detail: 'Diluente que reduz oxidação do fármaco quando exposto à luz.',
            icon: 'CheckCircle',
          },
          {
            label: 'Acesso venoso central',
            detail: 'Infusão em veia central — menor risco de extravasamento necrosante do vasopressor.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha — SF periférico',
            detail: 'Erro reproduzível: soro fisiológico em acesso periférico — oxidação à luz e risco de extravasamento.',
            icon: 'AlertTriangle',
          },
          {
            label: 'SF + periférico (distrator)',
            detail: 'Combinação que a banca oferece mas não é preferência para noradrenalina.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Noradrenalina = glicose 5% + acesso central',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar fármaco: noradrenalina vasopressora em urgência.',
          '1ª lacuna — diluente: eliminar SF 0,9% (A) e Ringer (E); glicose 5% protege da oxidação.',
          '2ª lacuna — acesso: eliminar periférico (A, C); central reduz extravasamento.',
          'Eliminar B glicofisiológico central: diluente não é o par clássico da prova.',
          'Confirmar D: glicosado 5% + acesso venoso central.',
          'Marcar D.',
          'Fixação: vasopressor irritante = glicose + acesso venoso central.',
        ],
        footer_rule: 'Diluente e acesso andam juntos na banca',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — noradrenalina EV',
        meta: slideMeta,
        content: 'VASOPRESSOR — DILUENTE E ACESSO',
        rows: [
          { label: 'Diluente', value: 'Glicose 5% — reduz oxidação à luz', badge: 'hot' },
          { label: 'Acesso', value: 'Venoso central preferencial', badge: 'hot' },
          { label: 'Extravasamento', value: 'Necrose tecidual — nunca subestimar', emphasis: 'alert', badge: 'warn' },
          { label: 'SF 0,9%', value: 'Não é diluente preferido de noradrenalina', badge: 'warn' },
          { label: 'Acesso periférico', value: 'Evitar para infusão prolongada de vasopressor', badge: 'info' },
        ],
        footer_rule: 'Glicose 5% + central = par da prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FUNDATEC — NORADRENALINA',
        items: [
          {
            label: 'Letra A — SF 0,9% periférico',
            detail: 'Combina diluente e acesso inadequados.',
            correct: 'SF 0,9% com acesso periférico não é preferência — noradrenalina oxida e extravasa.',
          },
          {
            label: 'Letra B — glicofisiológico central',
            detail: 'Acesso correto, diluente atípico na referência de prova.',
            correct: 'Glicofisiológico não é o diluente clássico cobrado — gabarito exige glicose 5%.',
          },
          {
            label: 'Letra C — glicose 5% periférico',
            detail: 'Diluente certo, acesso insuficiente para vasopressor.',
            correct: 'Glicose 5% está correta, mas acesso periférico não fecha o par — falta central.',
          },
          {
            label: 'Letra E — Ringer lactato central',
            detail: 'Acesso adequado, diluente inadequado.',
            correct: 'Ringer lactato não substitui glicose 5% na proteção contra oxidação da noradrenalina.',
          },
          {
            label: 'Pegadinha — SF periférico',
            detail: 'Par clássico de erro em vasopressor — oxidação à luz e extravasamento.',
            correct: 'SF em acesso periférico ignora fotossensibilidade — gabarito exige glicose e acesso central.',
          },
        ],
        footer_rule: 'Só D fecha diluente + acesso',
      },
    ],
  },

  'gama-geral-vias-de-administracao-1776056427936-3': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    cluster: 'Técnica SC abdominal',
    guideline: 'COFEN/Potter — SC no abdome: antissepsia centrífuga, ângulo 45°–90° conforme adiposidade, injeção lenta',
    roi_error: 'sc_umbigo_cicatriz_rapida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SC abdominal — técnica correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Injeção subcutânea no abdome — conduta para minimizar complicações.',
            icon: 'Target',
          },
          {
            label: 'Antissepsia centrífuga',
            detail: 'Movimentos de dentro para fora — técnica asséptica padrão.',
            icon: 'Shield',
          },
          {
            label: 'Ângulo 45°–90°',
            detail: 'Depende da espessura do tecido adiposo — pinça ou perpendicular.',
            icon: 'Move',
          },
          {
            label: 'Injeção lenta',
            detail: 'Velocidade reduzida diminui dor e hematoma.',
            icon: 'Timer',
          },
          {
            label: 'Pegadinha — umbigo e cicatriz',
            detail: 'Erro reproduzível: punção periumbilical ou sobre cicatriz — sítio SC inadequado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SC abdome = assepsia + ângulo adaptado + lentidão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fixar via e sítio: subcutânea no abdome.',
          'Eliminar A: área próxima ao umbigo + injeção rápida — sítio e velocidade inadequados.',
          'Eliminar B: 90° com pressão firme contínua — técnica incompleta e arriscada.',
          'Eliminar D: agulha longa sobre cicatriz — contraindicação de sítio.',
          'Confirmar C: antissepsia centrífuga + ângulo 45°–90° + injeção lenta.',
          'Marcar C.',
          'Fixação: rodízio abdominal longe de umbigo e cicatrizes.',
        ],
        footer_rule: 'Sítio + assepsia + ângulo + velocidade',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SC abdominal',
        meta: slideMeta,
        content: 'TÉCNICA SC — ABDOME',
        rows: [
          { label: 'Antissepsia', value: 'Movimentos de dentro para fora', badge: 'hot' },
          { label: 'Ângulo', value: '45°–90° conforme espessura adiposa', badge: 'ok' },
          { label: 'Velocidade', value: 'Injeção lenta — reduz complicações', badge: 'ok' },
          { label: 'Evitar', value: 'Umbigo · cicatrizes · lipodistrofia', emphasis: 'alert', badge: 'warn' },
          { label: 'Rodízio', value: 'Alternar quadrantes abdominais', badge: 'info' },
        ],
        footer_rule: 'Insulina/heparina: rodízio + técnica asséptica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS GAMA — SC ABDOMINAL',
        items: [
          {
            label: 'Letra A — próximo ao umbigo',
            detail: 'Sítio inadequado + injeção rápida para “evitar dor”.',
            correct: 'Evitar região periumbilical; injeção deve ser lenta, não rápida.',
          },
          {
            label: 'Letra B — 90° com pressão firme',
            detail: 'Pressionar firmemente durante toda administração.',
            correct: 'Pressão contínua não é técnica SC padrão — ângulo varia com adiposidade.',
          },
          {
            label: 'Letra D — sobre cicatriz',
            detail: 'Aplicar diretamente em cicatriz abdominal.',
            correct: 'Cicatriz é sítio contraindicado — absorção irregular e risco de complicação.',
          },
          {
            label: 'Confundir com IM',
            detail: '90° rígido sem avaliar tecido adiposo.',
            correct: 'SC adapta ângulo 45°–90° — gabarito C descreve técnica completa.',
          },
        ],
        footer_rule: 'C integra assepsia, ângulo e lentidão',
      },
    ],
  },

  'igeduc-enfermagem-vias-de-administracao-1778968609115-6': {
    family: 'certo_errado',
    branch: 'via_vf_absorcao',
    cluster: 'Hipodermóclise — volume',
    guideline: 'MS/COFEN — hipodermóclise: limite diário e por região em paliativos (conforme enunciado da prova)',
    roi_error: 'hipodermoclise_volume_negado',
    sources: [MS_SOURCE, COFEN_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipodermóclise — volume máximo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Certo/Errado: hipodermóclise com limites de volume diário e por região (conforme texto da banca).',
            icon: 'Target',
          },
          {
            label: 'Hipodermóclise',
            detail: 'Infusão lenta de fluidos no tecido subcutâneo — paliativos e acesso difícil.',
            icon: 'Droplets',
          },
          {
            label: 'Indicação',
            detail: 'Desequilíbrio hidroeletrolítico leve em idosos e cuidados paliativos.',
            icon: 'Heart',
          },
          {
            label: 'Limite diário',
            detail: 'Teto total em vinte e quatro horas — protocolo paliativo de hipodermóclise.',
            icon: 'CheckCircle',
          },
          {
            label: 'Limite por região',
            detail: 'Teto por sítio de punção — evita edema e absorção inadequada.',
            icon: 'MapPin',
          },
          {
            label: 'Pegadinha — negar volume SC',
            detail: 'Erro reproduzível: achar que hipoderme não admite infusão de maior volume em paliativo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hipodermóclise tem teto de volume por dia e por sítio',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar conceito: hipodermóclise = fluidos SC lentos.',
          'Verificar indicação: paliativos, idosos, acesso vascular difícil — coerente.',
          'Conferir volume diário e por região — valores do enunciado batem com protocolo paliativo.',
          'Afirmativa completa e correta → Certo.',
          'Marcar A.',
        ],
        footer_rule: 'Volume SC paliativo ≠ bolus IM',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — hipodermóclise',
        meta: slideMeta,
        content: 'HIPODERMÓCLISE — VOLUMES',
        rows: [
          { label: 'Via', value: 'Subcutânea — infusão lenta', badge: 'hot' },
          { label: 'Total/dia', value: 'Limite diário em protocolo paliativo', badge: 'ok' },
          { label: 'Por região', value: 'Limite por sítio de punção', badge: 'ok' },
          { label: 'Indicação', value: 'Paliativo · idoso · acesso difícil', badge: 'info' },
          { label: 'Contraindicação', value: 'Choque · desidratação grave aguda', badge: 'warn' },
        ],
        footer_rule: 'Decore limites diário e por sítio',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IGEDUC — HIPODERMÓCLISE',
        items: [
          {
            label: 'Marcar Errado por “volume alto”',
            detail: 'Achar que SC não admite litros em 24h.',
            correct: 'Hipodermóclise paliativa admite volume diário elevado — afirmativa é verdadeira.',
          },
          {
            label: 'Confundir com bolus SC',
            detail: 'Insulina/heparina usam mililitros, não litros.',
            correct: 'Hipodermóclise é infusão contínua — protocolo distinto de injeção SC unitária.',
          },
          {
            label: 'Usar em emergência',
            detail: 'Choque exige acesso venoso, não SC lenta.',
            correct: 'Volume máximo vale em paliativo — não substitui reposição EV em choque.',
          },
          {
            label: 'Ignorar limite por região',
            detail: 'Infundir volume excessivo no mesmo sítio.',
            correct: 'Limite por região é teto de segurança — item descreve corretamente.',
          },
        ],
        footer_rule: 'Certo (A) — volumes de referência corretos',
      },
    ],
  },

  'igeduc-enfermagem-vias-de-administracao-1778968609115-8': {
    family: 'certo_errado',
    branch: 'via_vf_absorcao',
    cluster: 'Absorção SC',
    guideline: 'COFEN/Potter — SC: absorção pelo endotélio capilar/linfático; soluções constantes, suspensões lentas',
    roi_error: 'sc_absorcao_negada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Absorção via subcutânea',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'V/F: medicamentos SC absorvidos pelo endotélio capilar e linfático; vantagens da via.',
            icon: 'Target',
          },
          {
            label: 'Tecido subcutâneo',
            detail: 'Hipoderme rica em capilares e vasos linfáticos.',
            icon: 'Layers',
          },
          {
            label: 'Endotélio capilar',
            detail: 'Barreira de troca — absorção para circulação sistêmica.',
            icon: 'Activity',
          },
          {
            label: 'Soluções',
            detail: 'Absorção boa e constante — perfil de insulina e heparina.',
            icon: 'CheckCircle',
          },
          {
            label: 'Suspensões',
            detail: 'Absorção mais lenta que soluções — partículas no tecido adiposo.',
            icon: 'Timer',
          },
          {
            label: 'Pegadinha — negar absorção SC',
            detail: 'Erro reproduzível: confundir perfil SC lento com ausência de absorção.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SC = capilares + linfáticos · solução ≠ suspensão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar mecanismo: absorção pelo endotélio de capilares e linfáticos → correto.',
          'Julgar vantagem 1: soluções com absorção boa e constante → correto.',
          'Julgar vantagem 2: suspensões com absorção lenta → correto.',
          'Nenhum trecho inverte fisiologia da via SC.',
          'Afirmativa integralmente verdadeira → Certo.',
          'Marcar A.',
        ],
        footer_rule: 'SC não é IM — mas absorção é real e previsível',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — absorção SC',
        meta: slideMeta,
        content: 'VIA SC — MECANISMO',
        rows: [
          { label: 'Absorção', value: 'Capilares sanguíneos + linfáticos', badge: 'hot' },
          { label: 'Soluções', value: 'Absorção boa e constante', badge: 'ok' },
          { label: 'Suspensões', value: 'Absorção mais lenta', badge: 'info' },
          { label: 'Vs IM', value: 'SC mais lenta que IM', badge: 'warn' },
          { label: 'Exemplos', value: 'Insulina · heparina · enoxaparina', badge: 'ok' },
        ],
        footer_rule: 'Endotélio capilar = porta de entrada SC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IGEDUC — ABSORÇÃO SC',
        items: [
          {
            label: 'Negar absorção SC',
            detail: 'Achar que hipoderme não absorve fármacos.',
            correct: 'Medicamentos SC são absorvidos por capilares e linfáticos — item verdadeiro.',
          },
          {
            label: 'Igualar SC e IM',
            detail: 'Mesma velocidade de absorção.',
            correct: 'SC é mais lenta que IM — mas ainda absorve de forma constante (soluções).',
          },
          {
            label: 'Suspensão = solução',
            detail: 'Mesma cinética de absorção.',
            correct: 'Suspensões absorvem mais lentamente — distinção correta do enunciado.',
          },
          {
            label: 'Marcar Errado sem ler',
            detail: 'Confundir com pegadinha de via oral.',
            correct: 'Texto descreve fisiologia SC corretamente — gabarito Certo (A).',
          },
        ],
        footer_rule: 'A — afirmativa fisiologicamente correta',
      },
    ],
  },

  'igeduc-enfermagem-vias-de-administracao-1778968629127-3': {
    family: 'certo_errado',
    branch: 'via_vf_absorcao',
    cluster: 'Insulina — via e sítios',
    guideline: 'COFEN/MS — insulina: via SC usual; sítios braços, abdome, coxas e nádegas com rodízio',
    roi_error: 'insulina_im_confusao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina — via e sítios SC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'V/F: insulina por via subcutânea nos braços, abdome, coxas e nádegas.',
            icon: 'Target',
          },
          {
            label: 'Insulina',
            detail: 'Hormônio proteico — destruído no TGI; exige via parenteral não EV de rotina.',
            icon: 'Syringe',
          },
          {
            label: 'Via subcutânea',
            detail: 'Rota padrão domiciliar e hospitalar para insulina.',
            icon: 'CheckCircle',
          },
          {
            label: 'Sítios autorizados',
            detail: 'Braços, abdome, coxas e nádegas — com rodízio sistemático.',
            icon: 'MapPin',
          },
          {
            label: 'Rodízio',
            detail: 'Evita lipodistrofia e variação de absorção no mesmo ponto.',
            icon: 'RefreshCw',
          },
          {
            label: 'Pegadinha — insulina IM',
            detail: 'Erro reproduzível: marcar insulina por via intramuscular — altera absorção.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Insulina = SC + rodízio em quatro regiões',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar fármaco: insulina.',
          'Via usual: subcutânea — padrão mundial de administração.',
          'Sítios listados: braços, abdome, coxas, nádegas — todos aceitos com técnica.',
          'Nenhuma contraindicação geral aos sítios citados.',
          'Afirmativa correta → Certo.',
          'Marcar A.',
        ],
        footer_rule: 'Quatro regiões + rodízio = educação diabética',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — insulina SC',
        meta: slideMeta,
        content: 'INSULINA — VIA E SÍTIOS',
        rows: [
          { label: 'Via', value: 'Subcutânea — única de rotina', badge: 'hot' },
          { label: 'Sítios', value: 'Braços · abdome · coxas · nádegas', badge: 'ok' },
          { label: 'Rodízio', value: 'Alternar pontos a cada aplicação', badge: 'ok' },
          { label: 'Não é IM', value: 'IM altera absorção — contraindicado', badge: 'warn' },
          { label: 'Não é oral', value: 'Proteína degradada no TGI', badge: 'info' },
        ],
        footer_rule: 'Decore: insulina sempre SC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IGEDUC — INSULINA',
        items: [
          {
            label: 'Insulina intramuscular',
            detail: 'Absorção imprevisível e rápida demais.',
            correct: 'Via usual da insulina é subcutânea — não intramuscular.',
          },
          {
            label: 'Apenas abdome',
            detail: 'Restringir a um único sítio.',
            correct: 'Braços, coxas e nádegas também são sítios válidos com rodízio.',
          },
          {
            label: 'Sem rodízio',
            detail: 'Aplicar sempre no mesmo ponto.',
            correct: 'Rodízio é obrigatório — lipodistrofia altera absorção.',
          },
          {
            label: 'Marcar Errado',
            detail: 'Negar sítios listados no enunciado.',
            correct: 'Afirmativa descreve via e sítios corretos — gabarito Certo (A).',
          },
        ],
        footer_rule: 'A — par clássico insulina/SC',
      },
    ],
  },

  'igeduc-enfermagem-vias-de-administracao-1778968646731-1': {
    family: 'certo_errado',
    branch: 'via_tecnica_admin',
    cluster: 'Técnica SC — seringa e ângulo',
    guideline: 'COFEN — SC: seringa de insulina dedicada; ângulo conforme adiposidade com pinça; bisel não “para cima” como regra',
    roi_error: 'sc_seringa_1_3ml_erro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica SC — seringa e ângulo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Certo/Errado: seringa, agulha, ângulo e bisel na técnica SC — item contém imprecisões.',
            icon: 'Target',
          },
          {
            label: 'Seringa adequada',
            detail: 'Insulina/SC usa seringa dedicada pequena com agulha curta fina — não seringa genérica grande.',
            icon: 'XCircle',
          },
          {
            label: 'Ângulo adaptativo',
            detail: 'Quarenta e cinco a noventa graus conforme adiposidade — pinça de pele em magros.',
            icon: 'Move',
          },
          {
            label: 'Pegadinha — seringa grande',
            detail: 'Erro reproduzível: indicar seringa de um a três mililitros como padrão SC de rotina.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Bisel e timing',
            detail: 'Regra de bisel “para cima” e ângulo fixo em todos adultos — imprecisões do enunciado.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'SC ≠ seringa genérica grande · ângulo não é fixo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler item integral: seringa, agulha, ângulo e bisel.',
          'Testar seringa grande: SC rotineira usa seringa dedicada pequena — FALSO como “mais apropriada”.',
          'Testar 90° em todos adultos: ignora pinça e espessura adiposa — impreciso.',
          'Testar bisel direcionado para cima: não é regra técnica SC padronizada.',
          'Conjunto de imprecisões → afirmativa ERRADA.',
          'Marcar B (Errado).',
        ],
        footer_rule: 'Um erro técnico já invalida o item',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — material SC',
        meta: slideMeta,
        content: 'SC — SERINGA E ÂNGULO',
        rows: [
          { label: 'Seringa', value: 'Dedicada pequena — agulha curta', badge: 'hot' },
          { label: 'Ângulo', value: 'Quarenta e cinco a noventa graus conforme tecido adiposo', badge: 'ok' },
          { label: 'Pinça', value: 'Pele pinçada em magros', badge: 'info' },
          { label: 'Erro clássico', value: 'Seringa genérica grande como padrão SC', emphasis: 'alert', badge: 'warn' },
          { label: 'Bisel', value: 'Não há regra “bisel para cima” em SC', badge: 'warn' },
        ],
        footer_rule: 'Insulina = seringa dedicada pequena',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IGEDUC — SERINGA SC',
        items: [
          {
            label: 'Letra A — Certo',
            detail: 'Aceitar seringa de grande volume e ângulos fixos.',
            correct: 'Item é falso: seringa SC apropriada é dedicada e pequena, não seringa genérica de grande volume.',
          },
          {
            label: '90° universal em adultos',
            detail: 'Ignorar avaliação de adiposidade.',
            correct: 'Ângulo varia 45°–90° — afirmar 90° fixo em todos adultos é impreciso.',
          },
          {
            label: 'Bisel para cima',
            detail: 'Regra inventada para agulha longa.',
            correct: 'Direção do bisel “para cima” não é técnica SC padronizada na referência.',
          },
          {
            label: 'Confundir com IM',
            detail: 'Seringa maior e 90° rígido.',
            correct: 'IM usa seringa maior e 90° — item mistura parâmetros e fica errado.',
          },
        ],
        footer_rule: 'B (Errado) — técnica SC mal descrita',
      },
    ],
  },

  'igeduc-enfermagem-vias-de-administracao-1778968646731-2': {
    family: 'certo_errado',
    branch: 'via_tecnica_admin',
    cluster: 'Técnica em Z — IM',
    guideline: 'COFEN/Potter — Z-track: deslocar pele ANTES da punção; soltar APÓS retirar agulha (não durante/após injeção)',
    roi_error: 'ztrack_timing_erro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica em Z — IM irritante',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'V/F: método Z desloca tecido antes, durante e após introdução da droga na IM irritante.',
            icon: 'Target',
          },
          {
            label: 'Técnica em Z',
            detail: 'Recomendada para medicamentos irritantes IM — ferro, alguns antibióticos oleosos.',
            icon: 'Move',
          },
          {
            label: 'Antes da punção',
            detail: 'Pele e tecido deslocados 2–3 cm lateralmente — correto.',
            icon: 'CheckCircle',
          },
          {
            label: 'Durante e após injeção',
            detail: 'Erro do enunciado: deslocamento contínuo durante e após não faz parte da técnica.',
            icon: 'XCircle',
          },
          {
            label: 'Soltar após retirada',
            detail: 'Após remover agulha, liberar pele — trilho desalinhado selo o depósito.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha — timing da Z-track',
            detail: 'Erro reproduzível: deslocar pele durante e após injeção — sequência falsa.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Z = puxa antes · injeta · retira · solta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar técnica: Z-track para IM de medicamentos irritantes.',
          'Verificar indicação: evitar extravasamento para SC — correto em princípio.',
          'Testar timing: “antes, durante e após” introdução — FALSO.',
          'Sequência correta: deslocar ANTES → injetar 90° → retirar agulha → SOLTAR pele.',
          'Não há deslocamento lateral contínuo durante e após deposição.',
          'Afirmativa errada no timing → Errado.',
          'Marcar B.',
        ],
        footer_rule: 'Z-track não desloca “durante e após”',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica Z',
        meta: slideMeta,
        content: 'Z-TRACK — SEQUÊNCIA',
        rows: [
          { label: '1. Deslocar', value: 'Pele 2–3 cm lateralmente — ANTES', badge: 'hot' },
          { label: '2. Injetar', value: '90° no músculo — sem mover pele', badge: 'ok' },
          { label: '3. Retirar', value: 'Agulha sai com pele ainda tensionada', badge: 'ok' },
          { label: '4. Soltar', value: 'Liberar pele — trilho desalinhado', badge: 'hot' },
          { label: 'Erro da prova', value: '“Durante e após” — sequência falsa', emphasis: 'alert', badge: 'warn' },
        ],
        footer_rule: 'Timing errado invalida o item',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IGEDUC — Z-TRACK',
        items: [
          {
            label: 'Letra A — Certo',
            detail: 'Aceitar deslocamento durante e após injeção.',
            correct: 'Falso: Z-track desloca pele ANTES e solta APÓS retirar agulha — não durante/após deposição.',
          },
          {
            label: 'Negar Z-track na IM',
            detail: 'Achar que técnica não existe.',
            correct: 'Z-track é recomendada na IM irritante — o erro está no timing, não na indicação.',
          },
          {
            label: 'Confundir com SC',
            detail: 'Pinça subcutânea contínua.',
            correct: 'Z-track é técnica IM — deslocamento único antes da punção.',
          },
          {
            label: 'Objetivo correto',
            detail: 'Evitar extravasamento para SC.',
            correct: 'Finalidade descrita é correta, mas timing “durante e após” torna item ERRADO.',
          },
        ],
        footer_rule: 'B (Errado) — timing invalida afirmativa',
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
    console.log(`[handcraft:vias-g24] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g24] total=${ok}`);
}

main();
