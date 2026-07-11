#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g25 (14 slugs cauda P0 mista).
 *
 *   npm run handcraft:saude-da-mulher-g25
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g25 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g25';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: [
    'sinais de gestação',
    'altura uterina',
    'captação precoce',
    'exames pré-natais',
    'dez passos pré-natal qualidade',
  ],
};

const OMS_PARTO_SOURCE = {
  id: 'oms-parto-humanizado',
  tier: 'A' as const,
  issuer: 'OMS / MS — PNH',
  title: 'Recomendações OMS — parto humanizado e cuidados intraparto',
  year: 2018,
  url: 'https://www.who.int/publications/i/item/9789241550215',
  covers: [
    'monitorização fetal',
    'hidratação no trabalho de parto',
    'alívio não farmacológico da dor',
    'atribuições do técnico',
  ],
};

const INCA_SOURCE = {
  id: 'inca-rastreio-colo',
  tier: 'A' as const,
  issuer: 'INCA / MS',
  title: 'Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero',
  year: 2016,
  url: 'https://www.inca.gov.br/publicacoes/livros/diretrizes-brasileiras-para-o-rastreamento-do-cancer-do-colo-do-utero',
  covers: ['25-64 anos', 'trienal', 'dois exames anuais', 'preparo citológico', 'USG transvaginal'],
};

const OMS_AM_SOURCE = {
  id: 'oms-am-exclusiva',
  tier: 'A' as const,
  issuer: 'OMS / MS',
  title: 'Política Nacional de Aleitamento Materno / Banco de Leite Humano',
  year: 2015,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/politica_nacional_de_aleitamento_materno.pdf',
  covers: [
    'ingurgitamento mamário',
    'fissura mamilar',
    'ordenha BLH',
    'primeiros jatos',
    'higiene mamária',
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

type Branch = 'mulher_prenatal' | 'mulher_parto' | 'mulher_papanicolau' | 'mulher_mama';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof AB32_SOURCE | typeof OMS_PARTO_SOURCE | typeof INCA_SOURCE | typeof OMS_AM_SOURCE)[];
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
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/últimamenstruação/g, 'última menstruação')
    .replace(/se encontravano/g, 'se encontrava no')
    .replace(/daidade/g, 'da idade')
    .replace(/pré- -natalde/g, 'pré-natal de')
    .replace(/quecorresponde/g, 'que corresponde')
    .replace(/técnico deenfermagem/g, 'técnico de enfermagem')
    .replace(/muitador/g, 'muita dor')
    .replace(/essasituação/g, 'essa situação')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563467322-8': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — sinais de gestação: presunção (amenorreia, náuseas); certeza (BCF, USG)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinais — gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Classificar sinais de presunção, probabilidade e certeza na gravidez.', icon: 'Target' },
          { label: 'Presunção (D)', detail: 'Subjetivos precoces — amenorreia, náuseas, fadiga.', icon: 'Calendar' },
          { label: 'Pegadinha lactogênese', detail: 'Lactogênese II é puerpério — não presunção; puerpério até 42º dia, não 30 — C.', icon: 'Baby' },
          { label: 'Pegadinha ITU', detail: 'Disúria sugere infecção urinária — não sinal gestacional — B.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Amenorreia = presunção',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tríade — gestação',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO',
        rows: [
          { label: 'Presunção', value: 'Amenorreia, náuseas, polaciúria, sensibilidade mamária', badge: 'hot', emphasis: 'highlight' },
          { label: 'Probabilidade', value: 'Aumento uterino, sinais de Hegar/Piskacek', badge: 'info' },
          { label: 'Certeza', value: 'BCF audíveis, movimentos fetais, USG com concepto', badge: 'info' },
          { label: 'Pegadinha', value: 'Pica (tijolo) e anosmia não são clássicos de presunção', badge: 'warn' },
        ],
        footer_rule: 'Presunção ≠ certeza',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinal de presunção de gestação.',
          'Eliminar A — pica (tijolo) não é classificação clássica.',
          'Eliminar B — disúria é sintoma urinário.',
          'Eliminar C — lactogênese II é evento puerperal.',
          'Eliminar E — anosmia não é sinal obstétrico clássico.',
          'Testar D — amenorreia é presunção.',
          'Marcar letra D.',
        ],
        footer_rule: 'Amenorreia — presunção — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SINAIS',
        items: [
          { label: 'Letra A — pica', detail: 'Desejo alimentar atípico não define presunção obstétrica.', correct: 'Pica não classifica presunção — eliminar A.' },
          { label: 'Letra B — disúria', detail: 'Queimação ao urinar aponta ITU, não gestação.', correct: 'Disúria é sintoma urinário — eliminar B.' },
          { label: 'Letra C — lactogênese II', detail: 'Apojadura ocorre após o parto — pegadinha lactogênese.', correct: 'Lactogênese é puerpério — eliminar C.' },
          { label: 'Letra E — anosmia', detail: 'Perda de olfato não integra a tríade obstétrica.', correct: 'Anosmia não é sinal obstétrico — eliminar E.' },
          { label: 'Pegadinha ITU', detail: 'Disúria aponta ITU — não presunção de gestação.', correct: 'Amenorreia é presunção — marcar D.' },
        ],
        footer_rule: 'Memorize presunção × probabilidade × certeza',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-semiologia-em-enfermagem-1779563527042-7': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — altura uterina: meio sínfise-umbigo condiz com IG; gráfico AU × idade gestacional',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso — AU e IG',
        meta: slideMeta,
        items: [
          { label: 'Dados', detail: 'DUM 28/05/2023; consulta 20/09/2023; BCF presentes; fundo no meio sínfise-umbigo.', icon: 'User' },
          { label: 'Compatível (A)', detail: 'Fundo no meio sínfise-umbigo condiz com IG do caso.', icon: 'CheckCircle' },
          { label: 'Pegadinha clampeamento imediato', detail: 'Encaminhar imediatamente sem discrepância — E — não é o caso.', icon: 'AlertTriangle' },
          { label: 'Pegadinha AU baixa', detail: 'AU inferior exigiria restrição — não descrito — B.', icon: 'TrendingDown' },
          { label: 'Pegadinha AU alta', detail: 'AU superior pediria USG — não é o relato — C.', icon: 'TrendingUp' },
        ],
        footer_rule: 'Meio sínfise-umbigo — compatível',
      },
      {
        type: 'golden_rule',
        slide_title: 'AU — marcos',
        meta: slideMeta,
        content: 'ALTURA UTERINA',
        rows: [
          { label: '12 semanas', value: 'Altura da sínfise púbica', badge: 'info' },
          { label: 'Meio sínfise-umbigo', value: 'Marco compatível com IG do caso clínico', badge: 'hot', emphasis: 'highlight' },
          { label: '20 semanas', value: 'Nível da cicatriz umbilical', badge: 'info' },
          { label: '20–32 sem', value: 'AU (cm) ≈ idade gestacional (semanas)', badge: 'info' },
        ],
        footer_rule: 'BCF + AU coerente → baixo risco',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Calcular IG pela DUM — consulta em setembro, IG compatível com meio sínfise-umbigo.',
          'Relacionar AU: meio sínfise-umbigo condiz com marco gestacional.',
          'BCF presentes reforçam compatibilidade.',
          'Eliminar B — AU não está inferior.',
          'Eliminar C — AU não está superior.',
          'Eliminar D e E — sem discrepância que exija encaminhamento imediato.',
          'Testar A — medidas compatíveis.',
          'Marcar letra A.',
        ],
        footer_rule: 'AU e IG alinhadas — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AU',
        items: [
          { label: 'Letra B — AU baixa', detail: 'Fundo no meio sínfise-umbigo não indica restrição.', correct: 'Compatibilidade gestacional — letra A.' },
          { label: 'Letra C — AU alta', detail: 'Não há macrossomia ou polidrâmnio sugeridos.', correct: 'IG compatível com AU — gabarito A.' },
          { label: 'Letra D — reavaliar 2 sem', detail: 'Sem discrepância persistente no caso.', correct: 'AU esperada — marcar A.' },
          { label: 'Letra E — alto risco imediato', detail: 'Encaminhamento imediato sem indicação — pegadinha clampeamento imediato.', correct: 'AU compatível — letra A.' },
          { label: 'Pegadinha clampeamento imediato', detail: 'Imediato sem critério de risco no caso.', correct: 'Pré-natal rotineiro — marcar A.' },
        ],
        footer_rule: 'Marcos fixos de AU no 1º trimestre',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'objetiva-concursos-enfermagem-saude-da-mulher-1777104424950-1': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS — Dez Passos para o Pré-Natal de Qualidade: captação precoce na APS até a 12ª semana',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Captação — APS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Dez passos MS — início do pré-natal de captação precoce na atenção primária.', icon: 'Target' },
          { label: '12ª semana (A)', detail: 'Limite para captação precoce na APS.', icon: 'Calendar' },
          { label: 'Pegadinha 2º tri', detail: '18ª e 20ª semanas são tardias para captação precoce.', icon: 'Clock' },
          { label: 'Pegadinha neonatal', detail: 'Mortes evitáveis ligam pré-natal, parto e RN.', icon: 'Heart' },
        ],
        footer_rule: 'Captação precoce → até 12ª semana',
      },
      {
        type: 'golden_rule',
        slide_title: 'Dez passos — MS',
        meta: slideMeta,
        content: 'CAPTAÇÃO PRECOCE',
        rows: [
          { label: 'Prazo APS', value: 'Iniciar pré-natal até a 12ª semana de gestação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Objetivo', value: 'Reduzir óbitos neonatais e maternos evitáveis', badge: 'info' },
          { label: 'Pegadinha 18ª sem', value: 'Segundo trimestre — captação tardia', badge: 'warn' },
          { label: 'Pegadinha 24ª sem', value: 'Ultrapassa janela de captação precoce', badge: 'warn' },
        ],
        footer_rule: '12ª semana — regra de ouro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Dez passos — captação precoce na atenção primária.',
          'Eliminar B — 18ª semana é tardia.',
          'Eliminar C — 20ª semana é tardia.',
          'Eliminar D — 24ª semana é tardia.',
          'Testar A — até a 12ª semana.',
          'Marcar letra A.',
        ],
        footer_rule: 'APS — 12ª semana — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CAPTAÇÃO',
        items: [
          { label: 'Letra B — 18ª semana', detail: 'Já no 2º trimestre — perdeu janela precoce.', correct: 'Captação até 12ª semana — letra A.' },
          { label: 'Letra C — 20ª semana', detail: 'Metade da gestação — captação tardia.', correct: 'Dez passos MS — gabarito A.' },
          { label: 'Letra D — 24ª semana', detail: 'Viabilidade fetal ≠ captação precoce.', correct: 'Início na APS — marcar A.' },
          { label: 'Pegadinha 2º tri', detail: '18ª e 20ª semanas são captação tardia.', correct: 'Até 12ª semana — letra A.' },
        ],
        footer_rule: 'Não confundir viabilidade com captação',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unesc-enfermagem-exames-complementares-1779563674260-4': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'Caderno AB 32 (MS) — rotina pré-natal: hemograma, tipagem, glicemia/TOTG, sorologias, urina, USG',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Exames — pré-natal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Exames comuns no acompanhamento pré-natal — painel básico.', icon: 'Target' },
          { label: 'Painel (B)', detail: 'Sangue, ultrassonografia e teste de glicose.', icon: 'TestTube' },
          { label: 'Pegadinha só urina', detail: 'Urina faz parte, mas não isolada — A.', icon: 'Ban' },
          { label: 'Pegadinha alergia', detail: 'Teste de alergia não é rotina obstétrica — C.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Rotina = sangue + USG + glicose',
      },
      {
        type: 'golden_rule',
        slide_title: 'Painel — MS',
        meta: slideMeta,
        content: 'PRÉ-NATAL',
        rows: [
          { label: 'Laboratorial', value: 'Hemograma, tipagem, sorologias, urina', badge: 'info' },
          { label: 'Metabólico', value: 'Glicemia / TOTG conforme protocolo', badge: 'hot', emphasis: 'highlight' },
          { label: 'Imagem', value: 'Ultrassonografia obstétrica', badge: 'hot' },
          { label: 'Não rotina', value: 'Somente alergia ou só imagem', badge: 'warn' },
        ],
        footer_rule: 'Conjunto integrado — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Exames habituais no pré-natal.',
          'Eliminar A — apenas urina é incompleto.',
          'Eliminar C — alergia não é painel obstétrico.',
          'Eliminar D — sangue é necessário.',
          'Eliminar E — só imagem é incompleto.',
          'Testar B — sangue, USG e glicose.',
          'Marcar letra B.',
        ],
        footer_rule: 'Painel básico — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXAMES',
        items: [
          { label: 'Letra A — só urina', detail: 'EAS faz parte, mas não substitui hemograma e sorologias.', correct: 'Painel completo — letra B.' },
          { label: 'Letra C — alergia', detail: 'Não integra protocolo MS de pré-natal.', correct: 'Sangue + USG + glicose — gabarito B.' },
          { label: 'Letra D — sem sangue', detail: 'Tipagem e sorologias são obrigatórias.', correct: 'Rotina obstétrica — marcar B.' },
          { label: 'Letra E — só imagem', detail: 'USG complementa, não substitui laboratório.', correct: 'Alternativa integrada — letra B.' },
        ],
        footer_rule: 'Pré-natal = clínica + lab + USG',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unesc-enfermagem-saude-da-mulher-1777104295283-2': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'OMS/MS — monitorização fetal intraparto: ausculta intermitente na fase ativa (≈15 min)',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'BCF — parto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Monitorização fetal no trabalho de parto — prevenir sofrimento fetal.', icon: 'Target' },
          { label: '15 min (B)', detail: 'Ausculta seriada na fase ativa identifica alteração precoce.', icon: 'Activity' },
          { label: 'Pegadinha CTG universal', detail: 'Pinard não elimina cardiotocografia quando indicada — D.', icon: 'Ban' },
          { label: 'Pegadinha início único', detail: 'Só no início do TP é insuficiente — A.', icon: 'Ban' },
        ],
        footer_rule: 'Fase ativa — BCF a cada 15 min',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ausculta — intraparto',
        meta: slideMeta,
        content: 'MONITORIZAÇÃO',
        rows: [
          { label: 'Fase ativa', value: 'BCF a cada 15 minutos (ausculta intermitente)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Registro', value: 'Anotar frequência e padrão em prontuário', badge: 'hot' },
          { label: 'Pinard', value: 'Complementa, não substitui cardiotocografia quando indicada', badge: 'info' },
          { label: 'Erro', value: 'Monitorar só no início ou a cada hora na ativa', badge: 'warn' },
        ],
        footer_rule: 'Continuidade na fase ativa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Monitorização fetal durante o parto.',
          'Eliminar A — apenas no início é insuficiente.',
          'Testar B — BCF a cada 15 min na fase ativa.',
          'Eliminar C — hora a hora na ativa é tardio.',
          'Eliminar D — Pinard não elimina CTG quando indicada.',
          'Eliminar E — registro é obrigatório.',
          'Marcar letra B.',
        ],
        footer_rule: '15 minutos — fase ativa — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BCF',
        items: [
          { label: 'Letra A — só início', detail: 'Trabalho de parto evolui — monitorização contínua.', correct: 'Início isolado é insuficiente — eliminar A.' },
          { label: 'Letra C — hora a hora', detail: 'Intervalo longo perde dessaturação fetal.', correct: 'Hora a hora na ativa é tardio — eliminar C.' },
          { label: 'Letra D — Pinard bastante', detail: 'CTG contínua não substitui ausculta seriada — pegadinha CTG.', correct: 'Pinard complementa, não substitui — eliminar D.' },
          { label: 'Letra E — sem registro', detail: 'Sem anotação não há rastreabilidade clínica.', correct: 'Registro obrigatório — eliminar E.' },
          { label: 'Pegadinha CTG universal', detail: 'Método simples complementa monitorização indicada.', correct: 'BCF a cada 15 min na ativa — marcar B.' },
        ],
        footer_rule: 'OMS — ausculta intermitente seriada',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unesc-enfermagem-saude-da-mulher-1777104382533-3': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'OMS/MS — pré-parto: hidratação oral e conforto são prioridade; fluidos IV conforme prescrição',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-parto — INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assinalar afirmativa INCORRETA sobre cuidados de enfermagem no pré-parto.', icon: 'Target' },
          { label: 'Erro (B)', detail: 'Hidratação materna não é prioridade — falso.', icon: 'Ban' },
          { label: 'Pegadinha supina única', detail: 'Mudança de posição no pré-parto é conduta correta — A.', icon: 'CheckCircle' },
          { label: 'Conduta C', detail: 'BCF periódico na fase ativa — correto.', icon: 'Activity' },
        ],
        footer_rule: 'Hidratar é prioridade — B é o erro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Cuidados — pré-parto',
        meta: slideMeta,
        content: 'ENFERMAGEM',
        rows: [
          { label: 'Hidratação', value: 'Oferecer líquidos orais e monitorar balanço', badge: 'hot', emphasis: 'highlight' },
          { label: 'Conforto', value: 'Mudança de posição, massagem, respiração', badge: 'info' },
          { label: 'BCF', value: 'Ausculta seriada na fase ativa', badge: 'info' },
          { label: 'Dilatação', value: 'Avaliar evolução e comunicar intercorrências', badge: 'info' },
        ],
        footer_rule: 'INCORRETA = negar hidratação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO/INCORRETA — pré-parto.',
          'Letra A — técnicas de alívio da dor → conduta correta.',
          'Letra B — hidratação não é prioridade → erro conceitual.',
          'Letra C — BCF periódico → conduta correta.',
          'Letra D — dilatação e comunicação → conduta correta.',
          'Marcar letra B (incorreta).',
        ],
        footer_rule: 'Negar hidratação — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO',
        items: [
          { label: 'Letra A — alívio dor', detail: 'Posição livre e respiração são medidas não farmacológicas válidas no pré-parto.', correct: 'Alívio da dor com posição e massagem é conduta correta — não é o EXCETO.' },
          { label: 'Letra C — BCF', detail: 'Monitorização fetal seriada é padrão intraparto.', correct: 'BCF periódico é conduta correta — não é o EXCETO.' },
          { label: 'Letra D — dilatação', detail: 'Avaliar colo e comunicar obstetra é atribuição enfermeira.', correct: 'Monitorar dilatação e comunicar é conduta correta — não é o EXCETO.' },
          { label: 'Pegadinha supina única', detail: 'Posição de conforto é direito da parturiente — conduta correta em A.', correct: 'Única incorreta nega hidratação — marcar B.' },
        ],
        footer_rule: 'IV só com indicação — oral é rotina',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'univali-enfermagem-processo-de-enfermagem-1780010600919-3': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'COFEN/MS — TE no parto: monitorar SV, conforto, suporte emocional, identificar alertas e comunicar enfermeiro',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — parto vaginal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Responsabilidades do TE na assistência ao parto sob supervisão.', icon: 'Target' },
          { label: 'Escopo (C)', detail: 'SV materno/fetal, conforto, suporte emocional e comunicação de alertas.', icon: 'Users' },
          { label: 'Pegadinha abandono', detail: 'Deixar parturiente sozinha — A — proibido.', icon: 'Ban' },
          { label: 'Pegadinha prescrever', detail: 'Medicar sem prescrição — B — ilegal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'TE auxilia — não prescreve',
      },
      {
        type: 'golden_rule',
        slide_title: 'Atribuições — TE',
        meta: slideMeta,
        content: 'PARTO — TE',
        rows: [
          { label: 'Faz', value: 'SV, conforto, suporte emocional, sinais de alerta', badge: 'hot', emphasis: 'highlight' },
          { label: 'Comunica', value: 'Enfermeiro e médico ante intercorrência', badge: 'hot' },
          { label: 'Não faz', value: 'Prescrever ou acelerar parto por conta própria', badge: 'warn' },
          { label: 'Não faz', value: 'Ignorar sangramento excessivo', badge: 'warn' },
        ],
        footer_rule: 'Assistência sob supervisão — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'TE no parto vaginal — atribuições legais.',
          'Eliminar A — abandono da parturiente.',
          'Eliminar B — medicação sem prescrição.',
          'Testar C — monitorar, confortar, apoiar e comunicar.',
          'Eliminar D — normalizar sangramento excessivo.',
          'Marcar letra C.',
        ],
        footer_rule: 'Protocolo MS — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TE',
        items: [
          { label: 'Letra A — sozinha', detail: 'Acompanhamento contínuo é direito da parturiente.', correct: 'Assistência integral — letra C.' },
          { label: 'Letra B — medicar', detail: 'Ocitocina e analgesia exigem prescrição.', correct: 'Suporte e comunicação — gabarito C.' },
          { label: 'Letra D — sangramento', detail: 'HPP é emergência — registrar e acionar equipe.', correct: 'Papel do TE — marcar C.' },
        ],
        footer_rule: 'Segurança do paciente no parto',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-saude-da-mulher-1777104261182-6': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'OMS/PNH — fase ativa: apoio emocional, posição livre, práticas integrativas; sem episiotomia de rotina',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TP ativo — dilatação',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Primípara, contrações frequentes, colo dilatado — fase ativa avançada.', icon: 'User' },
          { label: 'Humanizado (C)', detail: 'Apoio emocional, posição de escolha e aromaterapia para dor.', icon: 'Heart' },
          { label: 'Pegadinha expulsivo', detail: 'Dilatação incompleta ≠ período expulsivo — B prematuro.', icon: 'Clock' },
          { label: 'Pegadinha rotina', detail: 'Episiotomia e litotomia de rotina — E — OMS desaconselha.', icon: 'Ban' },
        ],
        footer_rule: 'Parto humanizado — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Alívio — não farmacológico',
        meta: slideMeta,
        content: 'PNH / OMS',
        rows: [
          { label: 'Posição', value: 'Livre escolha da parturiente', badge: 'hot', emphasis: 'highlight' },
          { label: 'Apoio', value: 'Presença, escuta e técnicas complementares', badge: 'hot' },
          { label: 'Evitar', value: 'Episiotomia de rotina e ocitocina sem indicação', badge: 'warn' },
          { label: 'Neonatologista', value: 'Chamar quando nascimento iminente — não antes do expulsivo', badge: 'info' },
        ],
        footer_rule: 'Conforto e autonomia — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fase ativa avançada — alívio da dor e cuidados.',
          'Eliminar A — alongamento forçado precoce.',
          'Eliminar B — expulsivo não iniciado nesta dilatação.',
          'Testar C — apoio emocional, posição livre e PICs.',
          'Eliminar D — ocitocina/rotura sem indicação no caso.',
          'Eliminar E — episiotomia de rotina.',
          'Marcar letra C.',
        ],
        footer_rule: 'Humanização — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TP ATIVO',
        items: [
          { label: 'Letra A — pernas abertas', detail: 'Posição deve ser confortável, não forçada.', correct: 'Apoio e posição livre — letra C.' },
          { label: 'Letra B — neonatologista', detail: 'Expulsivo ainda não iniciado nesta fase.', correct: 'Práticas integrativas — gabarito C.' },
          { label: 'Letra D — ocitocina', detail: 'Aceleração farmacológica exige protocolo e indicação.', correct: 'Alívio não farmacológico — marcar C.' },
          { label: 'Letra E — episiotomia', detail: 'OMS contraindica episiotomia de rotina.', correct: 'Parto humanizado — letra C.' },
        ],
        footer_rule: '7 cm = fase ativa, não expulsivo',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562730776-4': {
    family: 'protocolo',
    branch: 'mulher_papanicolau',
    guideline: 'MS/INCA — preparo citológico: evitar USG transvaginal, relações, duchas e cremes nas 48h anteriores',
    sources: [INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo — citologia',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Orientação do TE sobre preparo do exame citopatológico de colo.', icon: 'Target' },
          { label: 'USG 48h (C)', detail: 'Evitar ultrassom transvaginal nas 48h antes da coleta.', icon: 'Microscope' },
          { label: 'Pegadinha abstinência 7d', detail: 'Protocolo MS fala em janela de 48 horas — não abstinência de 7 dias — A.', icon: 'Clock' },
          { label: 'Pegadinha lubrificante', detail: 'Lubrificante altera a lâmina — B.', icon: 'Ban' },
        ],
        footer_rule: '48h sem interferências vaginais',
      },
      {
        type: 'golden_rule',
        slide_title: 'Preparo — MS',
        meta: slideMeta,
        content: 'CITOLOGIA',
        rows: [
          { label: '48 horas', value: 'Sem relações, duchas, cremes, medicamentos vaginais ou USG transvaginal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Menstruação', value: 'Evitar coleta durante o fluxo', badge: 'info' },
          { label: 'Gestação', value: 'Não contraindica citologia de rotina', badge: 'info' },
          { label: 'Erro', value: 'Lubrificante ou medicação vaginal imediata', badge: 'warn' },
        ],
        footer_rule: 'Material representativo — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Preparo para citopatologia cervical.',
          'Eliminar A — abstinência de 7 dias não é o protocolo citado.',
          'Eliminar B — lubrificante prejudica a coleta.',
          'Testar C — evitar USG transvaginal 48h antes.',
          'Eliminar D — medicação vaginal recente altera resultado.',
          'Eliminar E — gestação não contraindica rastreio.',
          'Marcar letra C.',
        ],
        footer_rule: 'USG transvaginal — evitar 48h — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO',
        items: [
          { label: 'Letra A — 7 dias', detail: 'Intervalo citado na prova é 48 horas.', correct: 'Evitar USG transvaginal — letra C.' },
          { label: 'Letra B — lubrificante', detail: 'Substâncias vaginais mascaram células.', correct: 'Janela de 48h — gabarito C.' },
          { label: 'Letra D — medicação 6h', detail: 'Cremes e óvulos alteram citologia.', correct: 'Preparo correto — marcar C.' },
          { label: 'Letra E — 1º trimestre', detail: 'Gestante pode coletar conforme MS.', correct: 'Orientação TE — letra C.' },
        ],
        footer_rule: 'Não confundir com abstinência de 7 dias',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-saude-da-mulher-1777104295283-1': {
    family: 'protocolo',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — rastreio colo uterino: Papanicolau 25–64 anos, trienal após dois anuais normais',
    sources: [INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Rastreio — INCA',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'MS recomenda ações para rastreamento do câncer de colo do útero.', icon: 'Target' },
          { label: '25–64 trienal (C)', detail: 'Faixa etária e periodicidade populacional.', icon: 'Calendar' },
          { label: 'Pegadinha 40 anos', detail: 'Início aos 25, não 40 — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha sintomático', detail: 'Rastreio é assintomático — B.', icon: 'Ban' },
        ],
        footer_rule: '25–64 anos — trienal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Papanicolau — SUS',
        meta: slideMeta,
        content: 'MS / INCA',
        rows: [
          { label: 'Faixa', value: '25 a 64 anos com vida sexual', badge: 'hot', emphasis: 'highlight' },
          { label: 'Periodicidade', value: 'Trienal após dois exames anuais normais', badge: 'hot' },
          { label: 'Não é', value: 'Só com sintomas ou anual universal', badge: 'warn' },
          { label: 'Não é', value: 'Suspender aos 50 independente do histórico', badge: 'warn' },
        ],
        footer_rule: 'Rastreio organizado — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Rastreamento câncer de colo — MS.',
          'Eliminar A — início aos 40 anos.',
          'Eliminar B — rastreio não é só sintomático.',
          'Testar C — 25–64 anos a cada três anos.',
          'Eliminar D — anual universal.',
          'Eliminar E — suspensão arbitrária aos 50.',
          'Marcar letra C.',
        ],
        footer_rule: 'Trienal 25–64 — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXA',
        items: [
          { label: 'Letra A — 40 anos', detail: 'Marco inicial no SUS é 25 anos.', correct: '25–64 trienal — letra C.' },
          { label: 'Letra B — sintomas', detail: 'Rastreio populacional é preventivo.', correct: 'Papanicolau periódico — gabarito C.' },
          { label: 'Letra D — anual todas', detail: 'Anual só na fase inicial (dois exames).', correct: 'Periodicidade MS — marcar C.' },
          { label: 'Letra E — parar 50', detail: 'Rastreio segue até 64 anos.', correct: 'Faixa etária — letra C.' },
        ],
        footer_rule: 'Não confundir mama (50+) com colo (25+)',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-saude-da-mulher-1777104415052-0': {
    family: 'protocolo',
    branch: 'mulher_papanicolau',
    guideline: 'INCA/MS — citologia: dois primeiros exames anuais; se normais, próximo em 3 anos',
    sources: [INCA_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Esquema — citologia',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Afirmativa correta sobre exame citopatológico de rastreio.', icon: 'Target' },
          { label: 'Esquema (E)', detail: 'Dois anuais normais → próximo em três anos.', icon: 'Calendar' },
          { label: 'Pegadinha anual universal', detail: 'Anual desde 18 anos — A — não é protocolo MS.', icon: 'Ban' },
          { label: 'Pegadinha gestante', detail: 'Coleta não contraindicada na gestação — B.', icon: 'Baby' },
        ],
        footer_rule: '2 anuais + trienal — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Periodicidade',
        meta: slideMeta,
        content: 'INCA 2016',
        rows: [
          { label: 'Início', value: '25 anos após início da vida sexual', badge: 'info' },
          { label: 'Fase inicial', value: 'Dois exames com intervalo anual', badge: 'hot', emphasis: 'highlight' },
          { label: 'Manutenção', value: 'Se normais → citologia a cada 3 anos', badge: 'hot' },
          { label: 'Preparo', value: 'Abstinência sexual ~48h; evitar USG transvaginal pré-coleta', badge: 'info' },
        ],
        footer_rule: 'Anual ×2 → trienal — E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Citopatologia — julgar alternativas.',
          'Eliminar A — anual universal desde 18 anos.',
          'Eliminar B — gestante pode coletar.',
          'Eliminar C — abstinência de 3 dias fixa não é única regra citada.',
          'Eliminar D — USG 4h não é protocolo padrão MS.',
          'Testar E — dois anuais normais → trienal.',
          'Marcar letra E.',
        ],
        footer_rule: 'Esquema MS — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERVALO',
        items: [
          { label: 'Letra A — 18 anos anual', detail: 'Faixa etária SUS inicia aos 25 — pegadinha anual universal.', correct: 'Dois anuais → trienal — letra E.' },
          { label: 'Letra B — gestante', detail: 'Citologia de rotina não é contraindicada.', correct: 'Periodicidade correta — gabarito E.' },
          { label: 'Letra C — 3 dias', detail: 'Preparo padrão é janela de 48 horas.', correct: 'Esquema anual inicial — marcar E.' },
          { label: 'Letra D — USG intravaginal', detail: 'Evitar ultrassom transvaginal no preparo — não intervalo de poucas horas.', correct: 'Janela de 48 horas no preparo — gabarito E.' },
          { label: 'Pegadinha anual universal', detail: 'Anual desde 18 anos não é esquema MS.', correct: 'Dois anuais → trienal — gabarito E.' },
        ],
        footer_rule: 'Trienal só após dois negativos',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'selecon-enfermagem-saude-da-mulher-1777104376057-2': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — ingurgitamento mamário (3º dia): massagem, ordenha, manter amamentação; não suspender nem antibiótico de rotina',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ingurgitamento — D3',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Puérpera em apojadura — mamas endurecidas, quentes, doloridas; RN mama com desconforto.', icon: 'User' },
          { label: 'Conduta (C)', detail: 'Medidas não farmacológicas, massagem, ordenha e manter AM.', icon: 'Heart' },
          { label: 'Pegadinha suspender', detail: 'Suspender mamadas agrava ingurgitamento — A.', icon: 'Ban' },
          { label: 'Pegadinha mastite', detail: 'Sem flogose sistêmica — não antibiótico imediato — B.', icon: 'Pill' },
        ],
        footer_rule: 'Esvaziar e manter AM — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ingurgitamento',
        meta: slideMeta,
        content: 'LACTOGÊNESE II',
        rows: [
          { label: 'Sinais', value: 'Mamas pesadas, quentes, endurecidas — lactogênese II', badge: 'info' },
          { label: 'TE faz', value: 'Massagem, ordenha manual, orientar pega', badge: 'hot', emphasis: 'highlight' },
          { label: 'Manter', value: 'Amamentação em livre demanda', badge: 'hot' },
          { label: 'Evitar', value: 'Suspender mamadas ou antibiótico sem indicação', badge: 'warn' },
        ],
        footer_rule: 'Esvaziamento resolve ingurgitamento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Puérpera em apojadura — quadro de ingurgitamento.',
          'Eliminar A — suspender mamadas piora estase.',
          'Eliminar B — sem sinais de mastite purulenta.',
          'Testar C — medidas não farmacológicas e manter AM.',
          'Eliminar D — bomba contínua sem orientação individualizada.',
          'Marcar letra C.',
        ],
        footer_rule: 'Massagem + ordenha — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MAMAS',
        items: [
          { label: 'Letra A — suspender', detail: 'Esvaziamento é tratamento — não interromper.', correct: 'Manter AM com suporte — letra C.' },
          { label: 'Letra B — antibiótico', detail: 'Mastite infecciosa exige febre e sinais sistêmicos.', correct: 'Ingurgitamento fisiológico — gabarito C.' },
          { label: 'Letra D — bomba contínua', detail: 'Ordenha manual e pega correta vêm antes.', correct: 'Medidas não farmacológicas — marcar C.' },
          { label: 'Pegadinha puerperio', detail: 'Apojadura esperada no puerpério imediato.', correct: 'Esvaziar mamas — letra C.' },
        ],
        footer_rule: 'Ingurgitamento ≠ mastite',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'univali-enfermagem-curativos-e-manejo-de-feridas-1779269228428-4': {
    family: 'conceito',
    branch: 'mulher_mama',
    guideline: 'OMS/MS — fissura mamilar: manter AM, corrigir pega; não lavar mamilos com sabão',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fissura — NÃO fazer',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Conduta que NÃO é adequada para dor e fissuras nos mamilos.', icon: 'Target' },
          { label: 'Pegadinha sabão', detail: 'Sabão neutro nos mamilos resseca e piora fissura — C.', icon: 'Ban' },
          { label: 'Conduta A', detail: 'Alternar mamas e retirada cuidadosa — correto.', icon: 'CheckCircle' },
          { label: 'Conduta D', detail: 'Manter amamentação auxilia cicatrização — correto.', icon: 'Baby' },
        ],
        footer_rule: 'Sabão nos mamilos — incorreto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Higiene — mamilar',
        meta: slideMeta,
        content: 'AM — MAMILOS',
        rows: [
          { label: 'Fazer', value: 'Corrigir pega, alternar seios, leite materno no mamilo', badge: 'hot', emphasis: 'highlight' },
          { label: 'Limpeza', value: 'Água limpa apenas — sem sabão nos mamilos', badge: 'hot' },
          { label: 'Manter', value: 'Amamentação com suporte à pega', badge: 'info' },
          { label: 'Não fazer', value: 'Sabão, álcool ou antisséptico rotineiro', badge: 'warn' },
        ],
        footer_rule: 'NÃO = sabão — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando NÃO — fissura mamilar.',
          'Letra A — alternar e retirar com cuidado → conduta correta.',
          'Letra B — exposição solar moderada → pode ser orientada.',
          'Letra C — sabão neutro antes/depois → inadequado.',
          'Letra D — manter AM → conduta correta.',
          'Marcar letra C (não adequada).',
        ],
        footer_rule: 'Sem sabão no mamilo — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO',
        items: [
          { label: 'Letra A — alternar', detail: 'Técnica correta reduz trauma mamilar.', correct: 'Alternância de seios é conduta adequada — não é o NÃO.' },
          { label: 'Letra B — sol', detail: 'Exposição breve pode ser recomendada em alguns protocolos.', correct: 'Exposição solar moderada é orientação válida — não é o NÃO.' },
          { label: 'Letra D — manter AM', detail: 'Sucção adequada favorece cicatrização.', correct: 'Manter amamentação é conduta correta — não é o NÃO.' },
          { label: 'Pegadinha sabão', detail: 'Sabão resseca mamilos e piora fissura.', correct: 'Limpar com sabão é inadequado — marcar C.' },
        ],
        footer_rule: 'Pega correta > produtos no mamilo',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-saude-da-mulher-1777104323066-6': {
    family: 'protocolo',
    branch: 'mulher_mama',
    guideline: 'MS/BLH — ordenha: descartar primeiros jatos (0,5–1 mL) para reduzir contaminação microbiana',
    sources: [OMS_AM_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'BLH — ordenha',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Procedimentos de ordenha e coleta no Banco de Leite Humano.', icon: 'Target' },
          { label: 'Primeiro jato (D)', detail: 'Desprezar primeiro jato — reduz contaminantes microbianos.', icon: 'Droplet' },
          { label: 'Pegadinha antisséptico', detail: 'Lavar com sabão antisséptico na mama — A — inadequado.', icon: 'Ban' },
          { label: 'Pegadinha técnica', detail: 'Pressionar em direção ao mamilo — técnica C — parcialmente correta mas não é o item.', icon: 'Hand' },
        ],
        footer_rule: 'Descartar primeiro jato — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Coleta — BLH',
        meta: slideMeta,
        content: 'ORDENHA',
        rows: [
          { label: 'Higiene', value: 'Lavar mãos; limpar mama com água — não antisséptico rotineiro', badge: 'info' },
          { label: 'Primeiro jato', value: 'Desprezar antes da coleta no BLH', badge: 'hot', emphasis: 'highlight' },
          { label: 'Técnica', value: 'Círculo de pressão na aréola — alternar quadrantes', badge: 'info' },
          { label: 'Erro', value: 'Esfregar mama ou antisséptico na pele', badge: 'warn' },
        ],
        footer_rule: 'Qualidade do leite doado — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ordenha no BLH — cuidado obrigatório.',
          'Eliminar A — antisséptico na mama.',
          'Eliminar B — esfregar mama irrita tecido.',
          'Eliminar C — técnica incompleta isolada.',
          'Testar D — desprezar primeiros jatos.',
          'Eliminar E — alternância de dedos é técnica, não o destaque da questão.',
          'Marcar letra D.',
        ],
        footer_rule: 'Primeiros jatos — descarte — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BLH',
        items: [
          { label: 'Letra A — antisséptico', detail: 'Resíduo químico contamina o leite.', correct: 'Descartar primeiro jato — letra D.' },
          { label: 'Letra B — esfregar', detail: 'Trauma mamário e dor.', correct: 'Reduzir carga microbiana — gabarito D.' },
          { label: 'Letra C — pressão mamilo', detail: 'Técnica de expressão parcialmente descrita.', correct: 'Descartar primeiro jato — marcar D.' },
          { label: 'Letra E — alternar dedos', detail: 'Boa prática, mas não é o foco do enunciado.', correct: 'Primeiros jatos — letra D.' },
        ],
        footer_rule: 'BLH — qualidade microbiológica',
      },
    ],
    cleanInstruction: cleanPdfNoise,
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
    const { text_fragment: _drop, ...questionRest } = raw.question_data;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...questionRest, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g25] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g25] total=${ok}`);
}

main();
