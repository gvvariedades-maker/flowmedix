#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g13 (8 slugs).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g13.ts
 */
import {
  CLSI_SOURCE,
  MS_SOURCE,
  MS_TB_SOURCE,
  POTTER_SOURCE,
  cleanPdfNoise,
  runHandcraft,
  slideMeta,
  type Pack,
} from './handcraft-coleta-shared';

const LOTE = 'coleta-de-exames-laboratoriais-g13';
const BRANCH_DEFAULT = 'coleta_generico';

const VUNESP_TB_VOLUME_EXAM =
  'VUNESP cobra 5–10 mL como volume ideal de escarro para baciloscopia; MS enfatiza qualidade mucopurulenta e volume mínimo representativo (poucos mL). Ensinar gabarito da prova; registrar divergência.';

const SPECS: Record<string, Pack> = {
  'lj-assessoria-enfermagem-coleta-de-exames-laboratoriais-1779563288910-6': {
    family: 'certo_errado',
    branch: 'coleta_nao_sanguinea',
    guideline: 'MS TB — escarro: identificação no frasco (corpo), não só na tampa; EXCETO = C',
    sources: [MS_SOURCE, MS_TB_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Informações corretas EXCETO uma — marque a falsa.', icon: 'Wind' },
          { label: 'C — ID só tampa', detail: 'Identificar frasco (corpo), não protocolo errado de tampa.', icon: 'Tag' },
          { label: 'Árvore brônquica', detail: 'A — escarro profundo pós-tosse — correto.', icon: 'Check' },
          { label: 'Volume orientado', detail: 'B — orientação banca sobre mL.', icon: 'Droplets' },
          { label: 'Ventilação/transporte', detail: 'D/E — condutas aceitas — não EXCETO.', icon: 'Truck' },
        ],
        footer_rule: 'EXCETO = C (identificação errada)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: informações corretas sobre coleta de escarro EXCETO.',
          'A, B, D, E descrevem condutas aceitas pela banca LJ Assessoria.',
          'C erra: identificação apenas na tampa — deve rotular frasco corretamente.',
          'Marcar C.',
          'Em similares: escarro TB — etiqueta no frasco, não só tampa.',
        ],
        footer_rule: 'C = EXCETO escarro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escarro ID',
        meta: slideMeta,
        content: 'ESCORRO — IDENTIFICAÇÃO',
        rows: [
          { label: 'Frasco', value: 'Etiqueta com dados completos do paciente', badge: 'hot' },
          { label: 'Qualidade', value: 'Mucopurulento pós-tosse profunda', badge: 'ok' },
          { label: 'Evitar', value: 'Saliva; ID só na tampa', badge: 'warn' },
        ],
        footer_rule: 'Etiqueta no frasco corretamente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCORRO EXCETO',
        items: [
          { label: 'Letra A — árvore brônquica', detail: 'Correta.', correct: 'Escarro profundo — não é EXCETO.' },
          { label: 'Letra B — volume', detail: 'Orientação prova.', correct: 'Conduta aceita — eliminar.' },
          { label: 'Letra D — local ventilado', detail: 'Biossegurança.', correct: 'Correta — não EXCETO.' },
          { label: 'Letra E — transporte/prazo', detail: 'Logística.', correct: 'Verdadeira — C é única falsa.' },
          { label: 'Em outra banca…', detail: 'Volume 5–10 mL VUNESP.', correct: 'EXCETO aqui = identificação tampa (C).' },
        ],
        footer_rule: 'EXCETO = única afirmativa falsa',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'reis-e-reis-enfermagem-coleta-de-exames-laboratoriais-1779562768558-8': {
    family: 'vf',
    branch: 'coleta_tecnica_venosa',
    guideline: 'MS/CLSI — hemólise: causas punção, garrote, homogeneização; I II III corretas; IV (álcool secar) falsa',
    sources: [MS_SOURCE, POTTER_SOURCE, CLSI_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hemólise — I–IV',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Afirmativas sobre hemólise — combinação correta.', icon: 'AlertTriangle' },
          { label: 'I II III', detail: 'Causas/mecanismos verdadeiros Reis & Reis.', icon: 'Check' },
          { label: 'IV — álcool secar', detail: 'Secar álcool antes punção — não causa hemólise; IV falsa.', icon: 'XCircle' },
          { label: 'Efeito analítico', detail: 'K+, LDH, AST falsamente elevados.', icon: 'TrendingUp' },
          { label: 'Prevenção', detail: 'Garrote <1 min, punção suave, sem agitação vigorosa.', icon: 'Shield' },
        ],
        footer_rule: 'A = I + II + III',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativas I–IV sobre hemólise na coleta.',
          'I, II e III descrevem causas/fatores reais de hemólise.',
          'IV afirma que secar álcool antes punção causa hemólise — FALSA (secar é correto).',
          'Eliminar combinações com IV ou sem I/II/III.',
          'Marcar A — I, II e III apenas.',
          'Em similares: hemólise = punção/garrote/agitação; secar álcool não hemolisa.',
        ],
        footer_rule: 'A = I + II + III',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — hemólise',
        meta: slideMeta,
        content: 'HEMÓLISE PRÉ-ANALÍTICA',
        rows: [
          { label: 'Causas', value: 'Garrote prolongado, punção traumática, agitação', badge: 'hot' },
          { label: 'Efeito', value: 'K+, LDH, AST falsamente altos', badge: 'warn' },
          { label: 'IV falsa', value: 'Secar álcool é conduta correta', badge: 'ok' },
        ],
        footer_rule: 'Secar álcool ≠ hemólise',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — REIS HEMÓLISE',
        items: [
          { label: 'Letra B — I II IV', detail: 'Inclui IV falsa.', correct: 'Secar álcool não hemolisa — excluir IV.' },
          { label: 'Letra C — II III IV', detail: 'Corta I.', correct: 'I também correta — A = I II III.' },
          { label: 'Letra D — todas', detail: 'IV invalida.', correct: 'IV falsa — marcar A.' },
          { label: 'Letra E — só IV', detail: 'Inverte.', correct: 'IV é distrator — A correto.' },
          { label: 'Em outra banca…', detail: 'Homogeneização 5–10×.', correct: 'Hemólise IV = secar álcool falso fator.' },
        ],
        footer_rule: 'IV pegadinha clássica Reis',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'selecon-enfermagem-coleta-de-exames-laboratoriais-1779563272300-0': {
    family: 'conceito',
    branch: 'coleta_tecnica_venosa',
    guideline: 'CLSI GP41 — homogeneização tubos anticoagulantes: 5–10 inversões suaves pós-coleta',
    sources: [MS_SOURCE, POTTER_SOURCE, CLSI_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Homogeneização — inversões',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quantas inversões suaves após coleta em tubo anticoagulado.', icon: 'RotateCw' },
          { label: 'B — 5 a 10', detail: 'Padrão CLSI EDTA/citrato — mistura sangue-aditivo.', icon: 'Repeat' },
          { label: 'Agitação vigorosa', detail: 'Causa hemólise — evitar.', icon: 'AlertTriangle' },
          { label: '1–5 inversões', detail: 'Insuficiente para homogeneizar.', icon: 'XCircle' },
          { label: '20–30 inversões', detail: 'Excessivo — risco hemólise.', icon: 'Ban' },
        ],
        footer_rule: 'B = 5 a 10 inversões suaves',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: inversões para homogeneizar tubo após coleta.',
          'CLSI: 5–10 inversões suaves em tubos com anticoagulante.',
          'Eliminar A (1–5), C (10–20), D (20–30) extremos.',
          'Marcar B — 5 a 10 vezes.',
          'Em similares: homogeneizar ≠ agitar forte — 5–10 inversões.',
        ],
        footer_rule: 'B = 5–10 inversões',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — homogeneizar',
        meta: slideMeta,
        content: 'INVERSÃO DE TUBOS',
        rows: [
          { label: 'EDTA/citrato', value: '5–10 inversões suaves', badge: 'hot' },
          { label: 'Evitar', value: 'Agitação vigorosa → hemólise', badge: 'warn' },
          { label: 'Timing', value: 'Imediatamente após coleta', badge: 'ok' },
        ],
        footer_rule: 'Suave e 5–10×',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SELECON',
        items: [
          { label: 'Letra A — 1–5', detail: 'Pouco.', correct: 'Insuficiente para misturar aditivo — eliminar.' },
          { label: 'Letra C — 10–20', detail: 'Excesso.', correct: 'Além do padrão 5–10 — eliminar.' },
          { label: 'Letra D — 20–30', detail: 'Hemólise.', correct: 'Agitação excessiva — B correto.' },
          { label: 'Não inverter', detail: 'Coágulo micro.', correct: 'Obrigatório homogeneizar — B.' },
          { label: 'Em outra banca…', detail: 'Ordem tubos.', correct: 'Homogeneização = 5–10 inversões suaves.' },
        ],
        footer_rule: 'Número fixo: 5–10',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unifil-enfermagem-coleta-de-exames-laboratoriais-1779563288910-8': {
    family: 'vf',
    branch: 'coleta_tecnica_venosa',
    guideline: 'CLSI — pré-coleta sangue: assertivas I II III corretas — D (todas corretas)',
    sources: [MS_SOURCE, POTTER_SOURCE, CLSI_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta sangue — assertivas',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assertivas I II III sobre coleta — julgar combinação.', icon: 'ClipboardList' },
          { label: 'I II III', detail: 'Higiene, identificação, técnica — verdadeiras.', icon: 'Check' },
          { label: 'D — todas', detail: 'Três assertivas corretas simultaneamente.', icon: 'Layers' },
          { label: 'Parcial A/B/C', detail: 'Pegadinha de combinação incompleta.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'D = I + II + III corretas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: analise assertivas sobre coleta de sangue.',
          'I, II e III corretas segundo Unifil.',
          'Eliminar A (só I), B (só II), C (só III).',
          'Marcar D — todas corretas.',
          'Em similares: VF coleta — três assertivas verdadeiras = D.',
        ],
        footer_rule: 'D = todas corretas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — assertivas',
        meta: slideMeta,
        content: 'PRÉ-COLETA SANGUE',
        rows: [
          { label: 'Identificação', value: 'Dois identificadores', badge: 'hot' },
          { label: 'Higiene', value: 'Antisepsia + HH', badge: 'ok' },
          { label: 'Técnica', value: 'Ordem tubos, homogeneizar, descarte', badge: 'ok' },
        ],
        footer_rule: 'Três assertivas verdadeiras',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — UNIFIL',
        items: [
          { label: 'Letra A — só I', detail: 'Parcial.', correct: 'II e III também corretas — D.' },
          { label: 'Letra B — só II', detail: 'Parcial.', correct: 'Marcar D — todas.' },
          { label: 'Letra C — só III', detail: 'Parcial.', correct: 'I e II também — D.' },
          { label: 'Letra E — nenhuma', detail: 'Inverte tudo.', correct: 'Três corretas — D.' },
          { label: 'Em outra banca…', detail: 'IV falsa hemólise.', correct: 'Unifil = I II III todas — D.' },
        ],
        footer_rule: 'Ler combinação completa',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562735777-0': {
    family: 'conceito',
    branch: 'coleta_tubos_ordem',
    guideline: 'CLSI — sorologia dengue (soro vermelho) + hemograma (EDTA roxo): dois tubos distintos — C',
    sources: [MS_SOURCE, POTTER_SOURCE, CLSI_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dengue + hemograma — tubos',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Materiais para sorologia dengue e hemograma simultâneos.', icon: 'TestTube' },
          { label: 'C — roxo + vermelho', detail: 'EDTA hemograma + soro seco sorologia.', icon: 'Layers' },
          { label: 'Dois roxos', detail: 'Sem tubo soro — sorologia inviável.', icon: 'XCircle' },
          { label: 'Só vermelho', detail: 'Perde hemograma EDTA.', icon: 'Ban' },
          { label: 'Azul + amarelo', detail: 'Citrato + gel — não par dengue+hemograma.', icon: 'Shuffle' },
        ],
        footer_rule: 'C = roxo EDTA + vermelho soro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frascos para sorologia dengue e hemograma.',
          'Hemograma → anticoagulante EDTA tampa roxa.',
          'Sorologia dengue → soro (tubo vermelho/amarelo sem anticoagulante).',
          'Eliminar um tubo só, dois roxos, azul+cinza.',
          'Marcar C — roxo + vermelho.',
          'Em similares: dois pedidos = dois tubos — EDTA + soro.',
        ],
        footer_rule: 'C = roxo + vermelho',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dois exames',
        meta: slideMeta,
        content: 'SORO + HEMOGRAMA',
        rows: [
          { label: 'Hemograma', value: 'Roxo/lilás — EDTA', badge: 'hot' },
          { label: 'Sorologia', value: 'Vermelho — soro seco/gel', badge: 'hot' },
          { label: 'Ordem', value: 'Seguir CLSI se mais tubos', badge: 'ok' },
        ],
        footer_rule: 'Sorologia soro · hemograma EDTA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VUNESP DENGUE',
        items: [
          { label: 'Letra A — azul + amarelo', detail: 'Citrato + gel.', correct: 'Não dengue+hemograma padrão.' },
          { label: 'Letra B — roxo + cinza', detail: 'EDTA + fluoreto.', correct: 'Sorologia não usa cinza.' },
          { label: 'Letra D — dois roxos', detail: 'Sem soro.', correct: 'Sorologia exige tubo soro — C.' },
          { label: 'Letra E — só vermelho', detail: 'Sem hemograma.', correct: 'Falta EDTA roxo — C.' },
          { label: 'Em outra banca…', detail: 'Ordem citrato primeiro.', correct: 'Par roxo+vermelho permanece.' },
        ],
        footer_rule: 'Dois exames = dois tubos',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563165114-7': {
    family: 'certo_errado',
    branch: 'coleta_nao_sanguinea',
    guideline: 'MS TB — escarro baciloscopia: VUNESP gabarito B volume 5–10 mL; MS enfatiza qualidade mucopurulenta',
    exam_vs_current: VUNESP_TB_VOLUME_EXAM,
    sources: [MS_SOURCE, MS_TB_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro TB — volume VUNESP',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Baciloscopia escarro TB — afirmativa correta VUNESP.', icon: 'Microscope' },
          { label: 'B — 5–10 mL', detail: 'Gabarito VUNESP para volume de escarro.', icon: 'Droplets' },
          { label: 'Qualidade MS', detail: 'Mucopurulento pós-tosse — guideline atual.', icon: 'Wind' },
          { label: 'exam_vs_current', detail: 'Prova ≠ MS — ensinar B; registrar divergência.', icon: 'AlertTriangle' },
          { label: 'Identificação frasco', detail: 'Outras alternativas corretas parciais — B foco volume.', icon: 'Tag' },
        ],
        footer_rule: 'B = 5–10 mL (VUNESP)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: coleta escarro para baciloscopia de tuberculose.',
          'Gabarito VUNESP: B — volume de 5 a 10 mL de escarro.',
          'MS atual prioriza qualidade mucopurulenta — registrar exam_vs_current.',
          'Eliminar alternativas conflitantes com enunciado VUNESP.',
          'Marcar B.',
          'Em similares: VUNESP TB escarro = 5–10 mL — qualidade MS em outras bancas.',
        ],
        footer_rule: 'B = 5–10 mL escarro VUNESP',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — TB escarro',
        meta: slideMeta,
        content: 'BACILOSCOPIA — VOLUME',
        rows: [
          { label: 'VUNESP (prova)', value: '5–10 mL escarro — gabarito B', badge: 'hot' },
          { label: 'MS (guideline)', value: 'Mucopurulento; volume mínimo representativo', badge: 'warn' },
          { label: 'Registro', value: 'exam_vs_current obrigatório', badge: 'ok' },
        ],
        footer_rule: 'Ensinar gabarito · registrar MS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TB VUNESP B',
        items: [
          { label: 'Letra A — timing consulta', detail: 'Protocolo.', correct: 'Verdade parcial — B responde volume.' },
          { label: 'Letra C — recipiente', detail: 'Frasco estéril.', correct: 'Correta — não foco único da questão.' },
          { label: 'Letra D — higiene oral', detail: 'Enxágue.', correct: 'Conduta válida — B pedida.' },
          { label: 'Letra E — prótese dentária', detail: 'Retirar.', correct: 'Orientação correta — marcar B volume.' },
          { label: 'Em outra banca…', detail: 'MS poucos mL.', correct: 'VUNESP = 5–10 mL — exam_vs_current.' },
        ],
        footer_rule: 'Volume VUNESP vs qualidade MS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563200105-4': {
    family: 'conceito',
    branch: 'coleta_nao_sanguinea',
    guideline: 'MS TB — observar volume escarro baciloscopia: VUNESP gabarito E 5–10 mL',
    exam_vs_current: VUNESP_TB_VOLUME_EXAM,
    sources: [MS_SOURCE, MS_TB_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro TB — observar volume',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Observar/coletar escarro TB — alternativa correta.', icon: 'Eye' },
          { label: 'E — 5–10 mL', detail: 'Gabarito VUNESP volume a observar/coletar.', icon: 'Droplets' },
          { label: 'Qualidade', detail: 'Mucopurulento matinal pós-tosse.', icon: 'Wind' },
          { label: 'MS diverge', detail: 'Volume mínimo representativo — exam_vs_current.', icon: 'AlertTriangle' },
          { label: 'Saliva', detail: 'Não válida — rejeitar amostra.', icon: 'XCircle' },
        ],
        footer_rule: 'E = 5–10 mL VUNESP',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: volume de escarro a observar na baciloscopia TB (VUNESP).',
          'Gabarito oficial: E — 5 a 10 mL.',
          'Registrar exam_vs_current: MS enfatiza qualidade sobre volume absoluto.',
          'Eliminar volumes muito baixos/altos ou saliva.',
          'Marcar E.',
          'Em similares: par VUNESP TB escarro — 5–10 mL (B ou E conforme comando).',
        ],
        footer_rule: 'E = 5–10 mL escarro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — observação volume',
        meta: slideMeta,
        content: 'ESCORRO TB — VUNESP',
        rows: [
          { label: 'Prova', value: '5–10 mL — gabarito E', badge: 'hot' },
          { label: 'MS', value: 'Qualidade mucopurulenta', badge: 'warn' },
          { label: 'Coleta', value: 'Após higiene oral, pós-tosse profunda', badge: 'ok' },
        ],
        footer_rule: 'Gabarito prova + nota MS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TB VUNESP E',
        items: [
          { label: 'Letra A — 1–2 mL', detail: 'Pouco VUNESP.', correct: 'Abaixo 5 mL — eliminar.' },
          { label: 'Letra B — saliva', detail: 'Amostra inválida.', correct: 'Escarro profundo — E volume.' },
          { label: 'Letra C — 50 mL', detail: 'Exagero.', correct: 'Faixa VUNESP 5–10 — E.' },
          { label: 'Letra D — urina', detail: 'Material errado.', correct: 'Escarro TB — E.' },
          { label: 'Em outra banca…', detail: 'Conservação >24 h.', correct: 'Volume VUNESP = 5–10 mL (E).' },
        ],
        footer_rule: 'Mesma divergência MS — exam_vs_current',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563272300-7': {
    family: 'conceito',
    branch: 'coleta_nao_sanguinea',
    guideline: 'MS — escarro: conservação em temperatura ambiente >24 h não recomendada; gabarito B',
    sources: [MS_SOURCE, MS_TB_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro — conservação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Conservação de escarro — alternativa correta VUNESP.', icon: 'Thermometer' },
          { label: 'B — ambiente >24 h não', detail: 'Não manter escorro em temperatura ambiente além de 24 h.', icon: 'Clock' },
          { label: 'Refrigeração', detail: '2–8 °C prolonga viabilidade conforme protocolo.', icon: 'Snowflake' },
          { label: 'Transporte rápido', detail: 'Enviar lab o quanto antes.', icon: 'Truck' },
          { label: 'Decomposição', detail: 'Ambiente acelera deterioração da amostra.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'B = não conservar ambiente >24 h',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conservação de amostra de escorro.',
          'Temperatura ambiente prolongada (>24 h) não é recomendada.',
          'Eliminar alternativas que autorizam ambiente indefinido ou congelamento inadequado.',
          'Marcar B — não recomendado conservar em ambiente por mais de 24 horas.',
          'Em similares: escorro — refrigerar/transportar rápido; ambiente >24 h reprovado.',
        ],
        footer_rule: 'B = ambiente >24 h não recomendado',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — conservação escarro',
        meta: slideMeta,
        content: 'ESCORRO — TEMPO/TEMP',
        rows: [
          { label: 'Ambiente', value: 'Não >24 h — gabarito B', badge: 'hot' },
          { label: 'Ideal', value: 'Processar/refrigerar cedo', badge: 'ok' },
          { label: 'Qualidade', value: 'Decomposição altera cultura/baciloscopia', badge: 'warn' },
        ],
        footer_rule: '24 h ambiente = limite',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONSERVAÇÃO VUNESP',
        items: [
          { label: 'Letra A — ambiente 72 h', detail: 'Prolongado.', correct: 'Inviável — eliminar.' },
          { label: 'Letra C — congelar escarro', detail: 'Nem sempre indicado.', correct: 'Protocolo local — B ambiente >24 h.' },
          { label: 'Letra D — sol pleno', detail: 'Degrada.', correct: 'Não expor — B.' },
          { label: 'Letra E — sem prazo', detail: 'Indefinido.', correct: '24 h limite — marcar B.' },
          { label: 'Em outra banca…', detail: 'Volume 5–10 mL.', correct: 'Conservação = não >24 h ambiente (B).' },
        ],
        footer_rule: 'Escorro deteriora fora do frio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

runHandcraft(LOTE, SPECS, 'handcraft:coleta-g13', BRANCH_DEFAULT);
