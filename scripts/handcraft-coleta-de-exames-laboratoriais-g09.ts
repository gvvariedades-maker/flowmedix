#!/usr/bin/env tsx
/** Handcraft golden-v1 — coleta-de-exames-laboratoriais-g09 */
import { MS_SOURCE, mcqPack, runHandcraftLote } from './lib/coleta-handcraft-base';

const LOTE = 'coleta-de-exames-laboratoriais-g09';
const REVIEWER = 'coleta-g09';

const MS_TB = {
  id: 'ms-manual-recomendacoes-tb',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Recomendações para Controle da Tuberculose no Brasil',
  year: 2019,
  covers: ['escarro', 'baciloscopia', 'volume amostra'],
};

const SPECS = {
  'igeduc-enfermagem-coleta-de-exames-laboratoriais-1779563248005-2': mcqPack({
    family: 'certo_errado',
    guideline: 'CLSI — ordem tubos: citrato/coagulação azul primeiro — não iniciar por tubo errado com escalpe',
    title: 'C/E — ordem com escalpe',
    conceptItems: [
      { label: 'Comando C/E', detail: 'Escalpe + tubo coagulação primeiro — julgar.', icon: 'Syringe' },
      { label: 'Errado (B)', detail: 'Sequência/ordem apresentada é falsa.', icon: 'XCircle' },
      { label: 'CLSI', detail: 'Respeitar ordem — citrato antes de outros quando aplicável.', icon: 'ListOrdered' },
    ],
    conceptFooter: 'B = Errado',
    steps: [
      'Comando: julgar item sobre escalpe e tubo de coagulação primeiro.',
      'Afirmativa contraria ordem normativa — Errado.',
      'Marcar B.',
    ],
    logicFooter: 'B = Errado',
    goldenTitle: 'Referência — ordem',
    goldenContent: 'ESCALPE + ORDEM',
    rows: [{ label: '1º tubo', value: 'Citrato azul quando na sequência', badge: 'hot' }],
    goldenFooter: 'Ordem importa com escalpe',
    dangerTitle: 'PEGADINHAS — IGEDUC ORDEM',
    dangerItems: [{ label: 'Letra A — Certo', detail: 'Aceita ordem errada.', correct: 'Sequência falsa — B Errado.' }],
    dangerFooter: 'C/E = assertiva literal',
  }),

  'igeduc-enfermagem-infeccoes-no-contexto-da-biosseguranca-1780000569658-7': mcqPack({
    branch: 'coleta_tecnica_venosa',
    guideline: 'MS/Anvisa — coleta sangue ESF: identificar paciente, higiene mãos, material estéril descartável',
    title: 'Coleta ESF — conduta correta',
    conceptItems: [
      { label: 'Comando', detail: 'Coleta segura na ESF — alternativa correta.', icon: 'Shield' },
      { label: 'C — identificação + higiene + estéril', detail: 'Triade mínima de segurança.', icon: 'Check' },
      { label: 'Sem identificação', detail: 'A — erro grave.', icon: 'XCircle' },
      { label: 'Garrote reutilizado', detail: 'B — violação biossegurança.', icon: 'Ban' },
      { label: 'Descarte perfurocortante', detail: 'D — lixo comum proibido.', icon: 'Trash2' },
    ],
    conceptFooter: 'C = conduta segura',
    steps: [
      'Comando: coleta de sangue segura na ESF.',
      'Eliminar A (sem ID), B (garrote reutilizado), D (descarte errado).',
      'Marcar C — identificar, higienizar mãos, material estéril descartável.',
    ],
    logicFooter: 'C = ID + higiene + estéril',
    goldenTitle: 'Referência — biossegurança',
    goldenContent: 'COLETA SEGURA',
    rows: [
      { label: 'Identificação', value: 'Dois identificadores', badge: 'hot' },
      { label: 'Higiene', value: 'Higienizar mãos', badge: 'ok' },
      { label: 'Material', value: 'Estéril descartável', badge: 'ok' },
    ],
    goldenFooter: 'Nunca pular identificação',
    dangerTitle: 'PEGADINHAS — ESF IGEDUC',
    dangerItems: [
      { label: 'Letra A — sem ID', detail: 'Risco identidade.', correct: 'Proibido — eliminar.' },
      { label: 'Letra B — garrote reutilizado', detail: 'Contaminação.', correct: 'Descartável — eliminar.' },
      { label: 'Letra D — lixo comum', detail: 'Perfurocortante.', correct: 'Caixa rígida — eliminar.' },
    ],
    dangerFooter: 'Biossegurança não negocia',
  }),

  'lj-assessoria-enfermagem-coleta-de-exames-laboratoriais-1779563288910-6': mcqPack({
    family: 'certo_errado',
    branch: 'coleta_nao_sanguinea',
    guideline: 'MS TB — escarro: identificação no frasco (corpo), não só tampa; volume 5–10 mL orientação banca',
    extraSources: [MS_SOURCE, MS_TB],
    title: 'Escarro — EXCETO',
    conceptItems: [
      { label: 'Comando EXCETO', detail: 'Informação incorreta sobre coleta escarro.', icon: 'Wind' },
      { label: 'C — identificação tampa', detail: 'Identificar frasco (corpo), não protocolo errado de tampa.', icon: 'Tag' },
      { label: 'Árvore brônquica', detail: 'A — correto.', icon: 'Check' },
      { label: 'Volume 5–10 mL', detail: 'B — orientação banca.', icon: 'Droplets' },
    ],
    conceptFooter: 'EXCETO = C',
    steps: [
      'Comando: informações corretas EXCETO uma.',
      'A, B, D, E descrevem condutas aceitas pela banca.',
      'C erra identificação só na tampa.',
      'Marcar C.',
    ],
    logicFooter: 'C = EXCETO escarro',
    goldenTitle: 'Referência — escarro',
    goldenContent: 'ESCORRO — ID',
    rows: [
      { label: 'Identificação', value: 'Frasco com dados do paciente', badge: 'hot' },
      { label: 'Qualidade', value: 'Escarro profundo pós-tosse', badge: 'ok' },
    ],
    goldenFooter: 'Etiqueta no frasco corretamente',
    dangerTitle: 'PEGADINHAS — ESCORRO EXCETO',
    dangerItems: [
      { label: 'Letra A — árvore brônquica', detail: 'Correta.', correct: 'Não é EXCETO.' },
      { label: 'Letra B — volume', detail: 'Orientação prova.', correct: 'Não é EXCETO nesta banca.' },
      { label: 'Letra D — local aberto', detail: 'Ventilação.', correct: 'Conduta correta — eliminar.' },
      { label: 'Letra E — transporte', detail: 'Prazo envio.', correct: 'Correta — eliminar.' },
    ],
    dangerFooter: 'EXCETO = única falsa',
  }),

  'reis-e-reis-enfermagem-coleta-de-exames-laboratoriais-1779562768558-8': mcqPack({
    family: 'vf',
    branch: 'coleta_tecnica_venosa',
    guideline: 'MS — hemólise: causas punção, centrifugação, transporte; afirmativas I II III corretas (A)',
    title: 'Hemólise — I–IV',
    conceptItems: [
      { label: 'Comando', detail: 'Hemólise — combinação I II III corretas.', icon: 'AlertTriangle' },
      { label: 'I II III', detail: 'Causas/mecanismos verdadeiros.', icon: 'Check' },
      { label: 'IV', detail: 'Falsa — excluída.', icon: 'XCircle' },
    ],
    conceptFooter: 'A = I II III',
    steps: [
      'Comando: afirmativas sobre hemólise.',
      'I, II e III corretas segundo Reis & Reis.',
      'IV incorreta.',
      'Marcar A.',
    ],
    logicFooter: 'A = I + II + III',
    goldenTitle: 'Referência — hemólise',
    goldenContent: 'HEMÓLISE',
    rows: [{ label: 'Efeito', value: 'Libera intracelular → falsos altos K+ LDH', badge: 'hot' }],
    goldenFooter: 'Evitar hemólise pré-analítica',
    dangerTitle: 'PEGADINHAS — REIS HEMÓLISE',
    dangerItems: [
      { label: 'Letra B — I II IV', detail: 'Inclui IV.', correct: 'IV falsa.' },
      { label: 'Letra C — II III IV', detail: 'Corta I.', correct: 'I também correta.' },
      { label: 'Letra D — todas', detail: 'IV invalida.', correct: 'A = I II III.' },
    ],
    dangerFooter: 'Hemólise altera painel bioquímico',
  }),

  'selecon-enfermagem-coleta-de-exames-laboratoriais-1779563272300-0': mcqPack({
    guideline: 'CLSI — homogeneização tubos anticoagulantes: 5–10 inversões suaves',
    title: 'Homogeneização — inversões',
    conceptItems: [
      { label: 'Comando', detail: 'Inversões após coleta para homogeneizar.', icon: 'RotateCw' },
      { label: '5–10 vezes (B)', detail: 'Padrão EDTA/citrato — contato sangue-aditivo.', icon: 'Repeat' },
      { label: 'Agitação vigorosa', detail: 'Evitar hemólise.', icon: 'AlertTriangle' },
    ],
    conceptFooter: 'B = 5 a 10 inversões',
    steps: [
      'Comando: quantas inversões suaves pós-coleta.',
      'Eliminar 1–5, 10–20, 20–30 extremos.',
      'Marcar B — 5 a 10 vezes.',
    ],
    logicFooter: 'B = 5–10 inversões',
    goldenTitle: 'Referência — homogeneizar',
    goldenContent: 'INVERSÃO TUBOS',
    rows: [
      { label: 'EDTA/citrato', value: '5–10 inversões suaves', badge: 'hot' },
      { label: 'Evitar', value: 'Agitação vigorosa → hemólise', badge: 'warn' },
    ],
    goldenFooter: 'Homogeneizar ≠ agitar forte',
    dangerTitle: 'PEGADINHAS — SELECON',
    dangerItems: [
      { label: 'Letra A — 1–5', detail: 'Pouco.', correct: 'Insuficiente para misturar aditivo.' },
      { label: 'Letra C — 10–20', detail: 'Excesso.', correct: 'Além do padrão 5–10.' },
      { label: 'Letra D — 20–30', detail: 'Hemólise.', correct: 'Agitação excessiva.' },
    ],
    dangerFooter: 'Suave e 5–10×',
  }),

  'unifil-enfermagem-coleta-de-exames-laboratoriais-1779563288910-8': mcqPack({
    family: 'vf',
    branch: 'coleta_tecnica_venosa',
    guideline: 'CLSI — pré-coleta: higiene mãos, identificação, material; assertivas I II III corretas (D)',
    title: 'Coleta sangue — assertivas',
    conceptItems: [
      { label: 'Comando', detail: 'Assertivas I II III sobre coleta — todas corretas.', icon: 'ClipboardList' },
      { label: 'I II III', detail: 'Higiene, identificação, técnica — verdadeiras.', icon: 'Check' },
    ],
    conceptFooter: 'D = todas corretas',
    steps: [
      'Comando: analise assertivas coleta sangue.',
      'I, II e III corretas.',
      'Eliminar A, B, C isoladas.',
      'Marcar D — todas corretas.',
    ],
    logicFooter: 'D = I + II + III',
    goldenTitle: 'Referência — assertivas',
    goldenContent: 'PRÉ-COLETA',
    rows: [{ label: 'Segurança', value: 'ID + higiene + técnica', badge: 'hot' }],
    goldenFooter: 'Três assertivas verdadeiras',
    dangerTitle: 'PEGADINHAS — UNIFIL',
    dangerItems: [
      { label: 'Letra A — só I', detail: 'Parcial.', correct: 'II e III também corretas.' },
      { label: 'Letra B — só II', detail: 'Parcial.', correct: 'D = todas.' },
      { label: 'Letra C — só III', detail: 'Parcial.', correct: 'Marcar D.' },
    ],
    dangerFooter: 'Ler combinação completa',
  }),

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562735777-0': mcqPack({
    guideline: 'CLSI — dengue sorologia (soro vermelho) + hemograma (EDTA roxo): dois tubos distintos',
    title: 'Dengue + hemograma — tubos',
    conceptItems: [
      { label: 'Comando', detail: 'Sorologia dengue + hemograma — materiais.', icon: 'TestTube' },
      { label: 'C — roxo + vermelho', detail: 'EDTA hemograma + soro sorologia.', icon: 'Layers' },
      { label: 'Dois roxos', detail: 'Não separa soro.', icon: 'XCircle' },
      { label: 'Só vermelho', detail: 'Perde hemograma.', icon: 'Ban' },
    ],
    conceptFooter: 'C = roxo + vermelho',
    steps: [
      'Comando: frascos para sorologia dengue e hemograma.',
      'Hemograma → anticoagulante roxo (EDTA).',
      'Sorologia → sem anticoagulante vermelho (soro).',
      'Marcar C.',
    ],
    logicFooter: 'C = roxo EDTA + vermelho soro',
    goldenTitle: 'Referência — dois exames',
    goldenContent: 'SORO + HEMOGRAMA',
    rows: [
      { label: 'Hemograma', value: 'Roxo EDTA', badge: 'hot' },
      { label: 'Sorologia', value: 'Vermelho soro seco/gel', badge: 'hot' },
    ],
    goldenFooter: 'Dois pedidos = dois tubos',
    dangerTitle: 'PEGADINHAS — VUNESP DENGUE',
    dangerItems: [
      { label: 'Letra A — azul + amarelo', detail: 'Citrato + gel.', correct: 'Não dengue+hemograma padrão.' },
      { label: 'Letra B — roxo + cinza', detail: 'EDTA + fluoreto.', correct: 'Sorologia não usa cinza.' },
      { label: 'Letra D — dois roxos', detail: 'Sem soro.', correct: 'Sorologia exige tubo soro.' },
      { label: 'Letra E — só vermelho', detail: 'Sem hemograma.', correct: 'Falta EDTA roxo.' },
    ],
    dangerFooter: 'Sorologia soro · hemograma EDTA',
  }),

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563165114-7': mcqPack({
    family: 'certo_errado',
    branch: 'coleta_nao_sanguinea',
    extraSources: [MS_SOURCE, MS_TB],
    guideline: 'MS TB — escarro: volume mínimo representativo; 5–10 mL é orientação VUNESP (B) — aspecto > volume absoluto',
    exam_vs_current: 'VUNESP afirma 5–10 mL como ideal — MS enfatiza qualidade mucopurulenta; ensinar gabarito B.',
    title: 'Escarro TB — VUNESP',
    conceptItems: [
      { label: 'Comando', detail: 'Baciloscopia escarro — afirmativa correta VUNESP.', icon: 'Microscope' },
      { label: 'B — 5–10 mL', detail: 'Gabarito VUNESP para volume.', icon: 'Droplets' },
      { label: 'Aspecto mucopurulento', detail: 'Outras bancas priorizam qualidade.', icon: 'Wind' },
    ],
    conceptFooter: 'B = volume 5–10 mL (VUNESP)',
    steps: [
      'Comando: coleta escarro para baciloscopia TB.',
      'Gabarito VUNESP: B — 5 a 10 mL.',
      'Eliminar alternativas conflitantes com enunciado.',
      'Marcar B.',
    ],
    logicFooter: 'B = 5–10 mL escarro VUNESP',
    goldenTitle: 'Referência — TB escarro',
    goldenContent: 'BACILOSCOPIA',
    rows: [
      { label: 'VUNESP', value: '5–10 mL escarro', badge: 'hot' },
      { label: 'MS qualidade', value: 'Mucopurulento pós-tosse', badge: 'warn' },
    ],
    goldenFooter: 'Registrar exam_vs_current se MS divergir',
    dangerTitle: 'PEGADINHAS — TB VUNESP',
    dangerItems: [
      { label: 'Letra A — 1ª consulta', detail: 'Timing coleta.', correct: 'Protocolo específico — B responde volume.' },
      { label: 'Letra C — pote descartável', detail: 'Recipiente.', correct: 'Verdade parcial — B é gabarito.' },
      { label: 'Letra D — higiene', detail: 'Lavar mãos/boca.', correct: 'Correta — não foco único.' },
      { label: 'Letra E — prótese', detail: 'Retirar dentadura.', correct: 'Orientação válida — B pedida.' },
    ],
    dangerFooter: 'Volume VUNESP vs qualidade MS',
  }),
};

runHandcraftLote(LOTE, REVIEWER, SPECS);
