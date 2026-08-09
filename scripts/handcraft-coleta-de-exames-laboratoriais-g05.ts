#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g05 (8 slugs coleta_nao_sanguinea).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g05.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'coleta-de-exames-laboratoriais-g05';
const SUBTOPICO = 'Coleta de Exames Laboratoriais';
const BRANCH = 'coleta_nao_sanguinea';
const REVIEWED = '2026-08-05';

const MS_SOURCE = {
  id: 'ms-manual-amostras-biologicas',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Coleta de Amostras Biológicas para Exames Laboratoriais',
  year: 2020,
  url: 'https://www.gov.br/saude/',
  covers: ['urina', 'fezes', 'escarro', 'urocultura', 'EAS', '24 horas', 'sonda vesical'],
};

const POTTER_SOURCE = {
  id: 'potter-coleta-11ed',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Coleta de amostras',
  year: 2024,
  covers: ['jato médio', 'fezes', 'escarro', 'urina 24 h'],
};

const MS_TB_SOURCE = {
  id: 'ms-manual-recomendacoes-tb',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Recomendações para o Controle da Tuberculose no Brasil',
  year: 2019,
  covers: ['escarro mucopurulento', 'baciloscopia', 'TRM-TB'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[]; text_fragment?: string };
  modulo_slug?: string;
};

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo' | 'text_fragment';
  guideline: string;
  exam_vs_current?: string;
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
  patchQuestion?: (q: Q) => Q;
  extraSources?: typeof MS_SOURCE[];
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
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:coleta-g05',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: pack.extraSources ?? [MS_SOURCE, POTTER_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/deescarro/gi, 'de escarro')
    .replace(/sonda vesicalde/gi, 'sonda vesical de')
    .replace(/arealização/gi, 'a realização')
    .replace(/materialtambém/gi, 'material também')
    .replace(/tratogastrointestinal/gi, 'trato gastrointestinal')
    .replace(/03dias/gi, '03 dias')
    .replace(/para odiagnóstico/gi, 'para o diagnóstico')
    .replace(/aindanão/gi, 'ainda não')
    .replace(/sejamconfiáveis/gi, 'sejam confiáveis')
    .replace(/ascondições/gi, 'as condições')
    .replace(/CORRETO\n/gi, 'CORRETO ')
    .replace(/INCORRETO\n/gi, 'INCORRETO ')
    .trim();
}

const VUNESP_SVD_FRAGMENT =
  '<p><strong>Circuito coletor fechado — sonda vesical de demora</strong> (transcrição da figura):</p>' +
  '<p>1 — conexão proximal junto ao paciente; 2 — trecho inicial do dreno; 3 — segmento com válvula anti-refluxo; ' +
  '<strong>4 — porta de amostragem (lúmen de punção estéril) no dreno de drenagem, acima da bolsa</strong>; ' +
  '5 — bolsa coletora.</p>' +
  '<p>Na figura transcrita acima, identifique o ponto de punção para coleta de urina para cultura.</p>';

const SPECS: Record<string, Pack> = {
  'objetiva-concursos-enfermagem-coleta-de-exames-laboratoriais-1779563200105-5': {
    family: 'conceito',
    guideline: 'MS — escarro: enxágue oral, evitar saliva/secreção nasal; amostra representativa de vias aéreas inferiores',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta de escarro — terreno',
        meta: slideMeta,
        items: [
          { label: 'Indicação', detail: 'Cultura pode auxiliar na pneumonia bacteriana — coleta não invasiva.', icon: 'Microscope' },
          { label: 'Qualidade', detail: 'Escarro das vias aéreas inferiores — não saliva nem secreção nasal.', icon: 'Wind' },
          { label: 'Higiene oral', detail: 'Enxaguar boca e gargarejar com água antes da coleta.', icon: 'Sparkles' },
          { label: 'Volume', detail: 'Amostra suficiente para exame — pegadinha de “>10 mL” absoluto.', icon: 'Droplets' },
          { label: 'Horário', detail: 'Preferência matinal após higiene — “só à noite” não é regra única.', icon: 'Clock' },
          { label: 'Pegadinha — saliva', detail: 'Banca troca escarro por saliva ou muco nasal pós-higiene.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Escarro = vias inferiores · higiene oral antes · sem saliva/nasal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa CORRETA sobre coleta de escarro para cultura.',
          'Escorro válido vem das vias aéreas inferiores — exige higiene oral prévia.',
          'Eliminar A — “ideal à noite” não é a regra universal da coleta.',
          'Eliminar B — volume >10 mL não é critério fixo de qualidade.',
          'Eliminar D — amostras consecutivas para fungo/anaeróbio é outro protocolo.',
          'Marcar C — enxaguar boca/gargarejar e não coletar saliva ou secreção nasal.',
          'Em similares: saliva contamina cultura — higiene oral é passo-chave.',
        ],
        footer_rule: 'C = higiene oral + escarro representativo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escarro',
        meta: slideMeta,
        content: 'ESCORRO — ORIENTAÇÃO',
        rows: [
          { label: 'Pré-coleta', value: 'Enxágue oral + gargarejo com água', badge: 'hot' },
          { label: 'Evitar', value: 'Saliva e secreção nasal após higiene', badge: 'warn' },
          { label: 'Amostra', value: 'Escarro profundo pós-tosse — mucopurulento', badge: 'ok' },
          { label: 'Recipiente', value: 'Frasco estéril/fechado — transporte rápido', badge: 'ok' },
        ],
        footer_rule: 'Saliva invalida cultura bacteriana',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCORRO OBJETIVA',
        items: [
          { label: 'Letra A — só à noite', detail: 'Horário preferencial pode ser manhã.', correct: 'Coleta matinal após higiene é comum — “ideal à noite” não é afirmativa correta.' },
          { label: 'Letra B — >10 mL', detail: 'Volume mínimo absoluto inventado.', correct: 'Qualidade importa mais que mililitragem fixa — escarro representativo basta.' },
          { label: 'Letra D — fungo/anaeróbio', detail: 'Protocolo de múltiplas amostras consecutivas.', correct: 'Regra específica para micobactéria/fungos — não responde ao comando geral.' },
          { label: 'Confundir com aspirado', detail: 'Em internados, aspiração traqueal é outra via.', correct: 'Questão pede orientação de escarro espontâneo — higiene oral (C).' },
        ],
        footer_rule: 'Higiene oral separa escarro de saliva',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'objetiva-concursos-enfermagem-coleta-de-exames-laboratoriais-1779563288910-0': {
    family: 'conceito',
    guideline: 'Motta/Potter — controle de diurese: urina 24 h + registro de débito em intervalos clínicos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Controle de diurese — terreno',
        meta: slideMeta,
        items: [
          { label: 'Controle de diurese', detail: 'Coleta de urina em período de 24 horas com registro do volume.', icon: 'Clock' },
          { label: '1ª parte', detail: 'Urina acumulada por 24 h — ex.: creatinina/clearance.', icon: 'FlaskConical' },
          { label: '2ª parte', detail: 'Débito urinário anotado em intervalos conforme condição clínica.', icon: 'ClipboardList' },
          { label: 'Frasco', detail: 'Recipiente com conservante quando indicado — manter fresco.', icon: 'Package' },
          { label: 'Início/fim', detail: 'Desprezar 1ª micção do dia e coletar até a 1ª do dia seguinte.', icon: 'ArrowRight' },
          { label: 'Pegadinha — só volume total', detail: 'Banca corta a 2ª parte (intervalos) ou inverte as definições.', icon: 'AlertTriangle' },
        ],
        footer_rule: '24 h + débito intervalar = controle de diurese completo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sentença sobre controle de diurese (Motta) — totalmente correta, parcial ou incorreta.',
          '1ª parte: coleta de urina em 24 h — correta.',
          '2ª parte: débito em intervalos determinados pela condição clínica — correta.',
          'Ambas as partes descrevem o controle de diurese — sentença integralmente verdadeira.',
          'Eliminar B e C — não há erro isolado em apenas uma metade.',
          'Eliminar D — não é totalmente incorreta.',
          'Marcar A — totalmente correta.',
          'Em similares: controle de diurese = urina 24 h + débito em intervalos clínicos.',
        ],
        footer_rule: 'A = 24 h + intervalos clínicos',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — controle de diurese',
        meta: slideMeta,
        content: 'DIURESE 24 H — DECORE',
        rows: [
          { label: 'Período', value: 'Urina de 24 horas acumulada', badge: 'hot' },
          { label: 'Registro', value: 'Débito anotado em intervalos (condição clínica)', badge: 'ok' },
          { label: 'Orientação', value: 'Desprezar 1ª urina da manhã → coletar até 1ª do dia seguinte', badge: 'warn' },
          { label: 'Conservação', value: 'Frasco apropriado, local fresco, identificação', badge: 'ok' },
        ],
        footer_rule: 'Volume total + intervalos = controle completo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIURESE MOTTA',
        items: [
          { label: 'Letra B — só 1ª parte', detail: 'Aceita 24 h mas nega registro intervalar.', correct: 'Débito em intervalos clínicos faz parte do controle — sentença inteira está certa.' },
          { label: 'Letra C — só 2ª parte', detail: 'Mantém intervalos mas nega coleta 24 h.', correct: 'Controle de diurese exige urina de 24 h — 1ª parte também correta.' },
          { label: 'Letra D — totalmente incorreta', detail: 'Nega ambas as definições válidas.', correct: 'As duas partes descrevem conduta correta — marcar A.' },
          { label: 'Confundir com balanço hídrico', detail: 'Entrada + saída ≠ só urina 24 h.', correct: 'Aqui o foco é controle de diurese — coleta 24 h + débito intervalar.' },
        ],
        footer_rule: 'Não corte a 2ª parte do controle',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'objetiva-concursos-enfermagem-exames-laboratoriais-1779563631609-7': {
    family: 'conceito',
    guideline: 'Carmagnani/MS — urina bioquímica: 1ª urina manhã + jato médio; frasco limpo (bioquímica); incontinência pode exigir sondagem',
    exam_vs_current: 'Item II — Objetiva/Carmagnani: frasco não estéril para bioquímica; MS exige estéril para cultura/EAS rigoroso — ensinar gabarito D.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urina bioquímica — terreno',
        meta: slideMeta,
        items: [
          { label: 'Item I', detail: 'Rotina: 1ª urina da manhã, desprezar 1º jato — correto.', icon: 'Sun' },
          { label: 'Item II', detail: 'Bioquímica/EAS rotina: frasco limpo do lab — não cultura estéril.', icon: 'FlaskConical' },
          { label: 'Item III', detail: 'Incontinência: sondagem de alívio pode ser necessária para amostra.', icon: 'Syringe' },
          { label: 'Jato médio', detail: 'Descartar início da micção — comum a I e cultura.', icon: 'Droplets' },
          { label: 'Pegadinha — esterilidade', detail: 'Banca troca frasco limpo (bioquímica) por estéril universal.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — item isolado', detail: 'Só I parece certo — esconde II e III válidos no gabarito.', icon: 'Search' },
        ],
        footer_rule: 'I + II + III corretos no gabarito Objetiva (D)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: item(ns) CORRETO(S) sobre urina para análise bioquímica (Carmagnani).',
          'I — 1ª urina da manhã desprezando 1º jato: conduta clássica de rotina.',
          'II — frasco do lab não precisa ser estéril para bioquímica (≠ urocultura).',
          'III — incontinência pode exigir sondagem de alívio para coleta.',
          'Eliminar A — ignora II e III corretos.',
          'Eliminar B e C — isolam apenas um item.',
          'Marcar D — todos os itens corretos.',
          'Em similares: bioquímica rotina aceita frasco limpo — cultura exige estéril.',
        ],
        footer_rule: 'D = I + II + III (gabarito Objetiva)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urina bioquímica',
        meta: slideMeta,
        content: 'URINA BIOQUÍMICA — ITENS',
        rows: [
          { label: 'I — momento', value: '1ª urina da manhã; desprezar 1º jato', badge: 'hot' },
          { label: 'II — frasco', value: 'Limpo do laboratório (bioquímica rotina)', badge: 'warn' },
          { label: 'III — incontinência', value: 'Sondagem de alívio se necessário', badge: 'ok' },
          { label: 'Cultura', value: 'Frasco estéril + jato médio — regra diferente', badge: 'ok' },
        ],
        footer_rule: 'Bioquímica ≠ urocultura no frasco',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CARMAGNANI I/II/III',
        items: [
          { label: 'Letra A — só I', detail: 'Primeira urina + jato médio parece suficiente.', correct: 'II e III também corretos no enunciado — gabarito é D (todos).' },
          { label: 'Letra B — só II', detail: 'Foco na esterilidade do frasco.', correct: 'I (jato/momento) e III (incontinência) também estão certos.' },
          { label: 'Letra C — I e III', detail: 'Omite II sobre frasco não estéril.', correct: 'Item II é afirmativa válida para bioquímica — marcar D.' },
          { label: 'MS vs prova', detail: 'Cultura sempre estéril; bioquímica rotina aceita frasco limpo.', correct: 'Prova cobra Carmagnani — frasco não estéril para bioquímica (II) entra no gabarito.' },
          { label: 'Em outra banca…', detail: 'Só item I parece óbvio.', correct: 'II (frasco limpo) e III (incontinência) também entram — gabarito D todos.' },
        ],
        footer_rule: 'Esterilidade depende do exame solicitado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'omni-enfermagem-exames-laboratoriais-1779563650975-5': {
    family: 'certo_errado',
    guideline: 'MS — EAS/urina tipo I: triagem qualitativa; doseamento de drogas usa urina 24 h ou protocolo específico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Exame de urina — terreno',
        meta: slideMeta,
        items: [
          { label: 'EAS / tipo I', detail: 'Sumário de urina — amostra pequena (~meio frasco), triagem físico-química e sedimento.', icon: 'FlaskConical' },
          { label: 'Dipstick', detail: 'Resultados qualitativos/semi-quantitativos na triagem rápida.', icon: 'TestTube' },
          { label: 'Utilidade', detail: 'Sangue, pus, proteína, glicose — sinais precoces de doença.', icon: 'Search' },
          { label: 'Não é EAS', detail: 'Doseamento terapêutico de drogas — outro tipo de coleta.', icon: 'Pill' },
          { label: 'Pegadinha — função do EAS', detail: 'Banca atribui doseamento medicamentoso ao tipo I.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'EAS = triagem · não doseia drogas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa INCORRETA sobre exame de urina.',
          'B, C e D descrevem EAS/dipstick corretamente.',
          'Isolar A — “EAS serve para doseamento de drogas/medicamentos”.',
          'Doseamento terapêutico exige urina 24 h ou protocolo específico — não EAS.',
          'A é a INCORRETA — função errada atribuída ao exame.',
          'Marcar A.',
          'Em similares: INCORRETA em urina = buscar função trocada (doseamento × triagem).',
        ],
        footer_rule: 'INCORRETA = A (EAS ≠ doseamento)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tipos de urina',
        meta: slideMeta,
        content: 'URINA — FINALIDADES',
        rows: [
          { label: 'EAS / tipo I', value: 'Triagem: físico, químico, sedimento (amostra pequena)', badge: 'hot' },
          { label: 'Dipstick', value: 'Qualitativo na triagem — não substitui quantitativo pleno', badge: 'ok' },
          { label: 'Doseamento drogas', value: 'Urina 24 h ou coleta seriada — protocolo próprio', badge: 'warn' },
          { label: 'Achados precoces', value: 'Hematuria, piúria, proteinúria, glicosúria', badge: 'ok' },
        ],
        footer_rule: 'Tipo I não doseia medicamento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EAS OMNI',
        items: [
          { label: 'Letra B — dipstick qualitativo', detail: 'Descreve limitação correta do reagente.', correct: 'Afirmativa correta — não é a INCORRETA pedida.' },
          { label: 'Letra C — volume da amostra', detail: 'Volume típico de coleta para EAS.', correct: 'Conduta plausível — mantém como correta.' },
          { label: 'Letra D — achados silenciosos', detail: 'Utilidade clínica do EAS.', correct: 'Proteína/glicose/pus antecipam diagnóstico — correta.' },
          { label: 'Letra A — doseamento no EAS', detail: 'Confunde triagem com monitorização farmacológica.', correct: 'EAS não objetiva doseamento de drogas — esta é a INCORRETA.' },
          { label: 'Em outra banca…', detail: 'Pergunta função do EAS vs urina 24 h.', correct: 'EAS triagem — doseamento de drogas usa coleta/protocolo específico.' },
        ],
        footer_rule: 'Função do exame antes de marcar',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'reis-e-reis-enfermagem-coleta-de-exames-laboratoriais-1779563225798-9': {
    family: 'certo_errado',
    guideline: 'MS — fezes parasitológico: amostra fresca, recipiente limpo/seco, evitar menstruação; MIF com conservante',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta de fezes — terreno',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Marcar a informação INCORRETA sobre coleta/armazenamento.', icon: 'ClipboardList' },
          { label: 'Sangue oculto', detail: 'Suspender ferro, AINEs e vitamina C antes — A correta.', icon: 'Droplet' },
          { label: 'Parasitológico', detail: 'Fresco, recipiente limpo/seco, sem menstruação — C correta.', icon: 'Bug' },
          { label: 'MIF', detail: 'Amostras alternadas no conservante — tóxico, não ingerir — D correta.', icon: 'FlaskConical' },
          { label: 'Pegadinha B', detail: 'Coletar na véspera + congelador prolongado — protocolo errado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Fezes parasitológico = frescas · não congelar rotina',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: informação INCORRETA sobre coleta de fezes/exames.',
          'A — sangue oculto: evitar ferro/AINEs/vit C — correta.',
          'C — parasitológico: recipiente limpo/seco, evitar menstruação — correta.',
          'D — MIF: amostras seriadas no conservante, alerta de toxicidade — correta.',
          'Isolar B — coletar na véspera, congelador prolongado, saco plástico com “muitas fezes”.',
          'Parasitológico exige amostra fresca e entrega rápida — congelamento prolongado invalida.',
          'Marcar B — INCORRETA.',
          'Em similares: fezes parasitológico = frescas — congelador rotineiro é pegadinha clássica.',
        ],
        footer_rule: 'INCORRETA = B (congelador/noite anterior)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fezes',
        meta: slideMeta,
        content: 'FEZES — COLETA',
        rows: [
          { label: 'Parasitológico', value: 'Frescas, limpo/seco, quantidade mínima, entregar rápido', badge: 'hot' },
          { label: 'Sangue oculto', value: 'Evitar ferro, AINE, vitamina C pré-exame', badge: 'ok' },
          { label: 'MIF', value: 'Amostras alternadas no conservante — não ingerir', badge: 'warn' },
          { label: 'Evitar', value: 'Congelador rotina, menstruação, urina no vaso', badge: 'warn' },
        ],
        footer_rule: 'Fresco > congelado para parasitas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FEZES REIS E REIS',
        items: [
          { label: 'Letra A — sangue oculto', detail: 'Lista medicamentos a evitar.', correct: 'Orientação correta — não é a INCORRETA.' },
          { label: 'Letra C — recipiente limpo', detail: 'Menstruação contraindica coleta.', correct: 'Conduta correta para parasitológico.' },
          { label: 'Letra D — MIF conservante', detail: 'Três amostras + toxicidade do líquido.', correct: 'Protocolo MIF descrito corretamente.' },
          { label: 'Letra B — congelador prolongado', detail: 'Coleta na véspera e saco plástico generoso.', correct: 'Parasitológico exige frescor — congelamento rotineiro é INCORRETO.' },
          { label: 'Em outra banca…', detail: 'MIF pede amostras seriadas no conservante.', correct: 'MIF tem protocolo próprio — não confunda com parasitológico simples congelado.' },
        ],
        footer_rule: 'Não congele amostra parasitológica de rotina',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'univali-enfermagem-coleta-de-exames-laboratoriais-1779563165114-9': {
    family: 'conceito',
    guideline: 'MS — urina 24 h: desprezar 1ª urina da manhã, coletar todo débito subsequente 24 h em frasco com conservante/fresco',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urina de 24 horas — terreno',
        meta: slideMeta,
        items: [
          { label: 'Indicação', detail: 'Clearance, proteinúria 24 h, doseamentos acumulados.', icon: 'Clock' },
          { label: 'Início', detail: 'Desprezar 1ª urina da manhã — marco zero.', icon: 'Sunrise' },
          { label: 'Coleta', detail: 'Todo débito urinário nas 24 h seguintes.', icon: 'Droplets' },
          { label: 'Fim', detail: 'Incluir 1ª urina da manhã do dia seguinte — fecha 24 h.', icon: 'Sun' },
          { label: 'Armazenamento', detail: 'Frasco apropriado, local fresco, conservante se indicado.', icon: 'Thermometer' },
          { label: 'Pegadinha — inverter início/fim', detail: 'Banca troca o que descartar no dia 1 e no dia 2.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Descarta 1ª manhã → coleta 24 h → inclui 1ª manhã seguinte',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: orientação CORRETA para urina de 24 horas.',
          'Protocolo: desprezar 1ª micção da manhã inicial.',
          'Coletar toda urina produzida nas 24 horas seguintes.',
          'Encerrar com a 1ª micção da manhã do dia seguinte.',
          'Eliminar A — inclui 1ª manhã inicial (errado).',
          'Eliminar B e C — invertem o que coletar/descartar.',
          'Marcar D — desprezar 1ª manhã + coletar 24 h em frasco fresco.',
          'Em similares: urina 24 h = descarta 1ª micção da manhã → coleta intervalo → inclui 1ª do dia seguinte.',
        ],
        footer_rule: 'D = janela clássica de 24 h',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urina 24 h',
        meta: slideMeta,
        content: 'URINA 24 H — ROTEIRO',
        rows: [
          { label: 'Passo 1', value: 'Desprezar 1ª urina da manhã (dia 1)', badge: 'hot' },
          { label: 'Passo 2', value: 'Coletar todo débito por 24 h', badge: 'ok' },
          { label: 'Passo 3', value: 'Incluir 1ª urina da manhã do dia 2', badge: 'ok' },
          { label: 'Conservação', value: 'Frasco adequado, local fresco/conservante', badge: 'warn' },
        ],
        footer_rule: 'Marco inicial = 1ª micção descartada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — URINA 24 H UNIVALI',
        items: [
          { label: 'Letra A — inclui 1ª manhã', detail: 'Coleta do dia inteiro mantendo 1ª micção.', correct: '1ª urina da manhã inicial deve ser descartada — invalida o início.' },
          { label: 'Letra B — omite 1ª do dia 2', detail: 'Despreza manhã 1 mas não fecha com manhã 2.', correct: 'Urina 24 h encerra com a 1ª micção da manhã seguinte.' },
          { label: 'Letra C — inverte tudo', detail: 'Coleta só manhã inicial e descarta o resto.', correct: 'Oposto do protocolo — descarta início e coleta intervalo.' },
          { label: 'Confundir com EAS', detail: 'EAS = amostra isolada; 24 h = acumulado.', correct: 'Orientação D é específica para urina de 24 horas.' },
        ],
        footer_rule: 'Início e fim da janela não se invertem',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562716126-4': {
    family: 'text_fragment',
    guideline: 'MS/ANVISA — SVD: punção estéril na porta de amostragem do circuito fechado; nunca na bolsa coletora',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urocultura em SVD — terreno',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Urina para cultura — paciente com sonda vesical de demora.', icon: 'Syringe' },
          { label: 'Circuito fechado', detail: 'Sistema integrado com porta de amostragem no dreno.', icon: 'Link' },
          { label: 'Ponto 4', detail: 'Lúmen de punção estéril acima da bolsa — local correto.', icon: 'Target' },
          { label: 'Evitar', detail: 'Bolsa coletora (5) ou conexão proximal sem técnica (1).', icon: 'Ban' },
          { label: 'Técnica', detail: 'Antissepsia + seringa estéril — fechar circuito após coleta.', icon: 'ShieldCheck' },
          { label: 'Pegadinha — bolsa', detail: 'Banca aponta punção na bolsa — contaminação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Porta de amostragem (4) · nunca bolsa (5)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ponto de punção correto no circuito coletor (figura transcrita).',
          'Urocultura em SVD exige amostra do trato urinário — não urina estagnada da bolsa.',
          'Eliminar 5 — bolsa coletora concentra flora ambiental e tempo de permanência.',
          'Eliminar 1–3 — trechos inadequados ou sem porta de amostragem.',
          'Ponto 4 = porta/lúmen de punção estéril no dreno, acima da bolsa.',
          'Marcar D (4).',
          'Em similares: urocultura em SVD → porta de amostragem do circuito fechado, nunca bolsa coletora.',
        ],
        footer_rule: 'D = ponto 4 (porta de amostragem)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SVD cultura',
        meta: slideMeta,
        content: 'UROCULTURA SVD — DECORE',
        rows: [
          { label: 'Volume', value: 'Amostra suficiente para cultura (protocolo local)', badge: 'ok' },
          { label: 'Local', value: 'Porta de amostragem do circuito fechado (4)', badge: 'hot' },
          { label: 'Técnica', value: 'Antissepsia + seringa estéril + fechar lúmen', badge: 'ok' },
          { label: 'Nunca', value: 'Puncionar bolsa coletora ou dreno sem porta', badge: 'warn' },
        ],
        footer_rule: 'Bolsa = contaminação · porta = amostra válida',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SVD VUNESP',
        items: [
          { label: 'Letra A/B/C — trechos do dreno', detail: 'Pontos sem lúmen de amostragem adequado.', correct: 'Coleta deve ser na porta estéril (4) — não em conexões aleatórias.' },
          { label: 'Letra E — ponto 5', detail: 'Bolsa coletora parece acessível.', correct: 'Urina da bolsa é estagnada e contaminada — invalida cultura.' },
          { label: 'Figura ausente', detail: 'Enunciado referencia diagrama do circuito.', correct: 'Porta de amostragem (4) no dreno acima da bolsa — gabarito D.' },
          { label: 'Confundir com jato médio', detail: 'Micção espontânea ≠ sonda.', correct: 'Em SVD, punção asséptica na porta do circuito fechado.' },
        ],
        footer_rule: 'Circuito fechado protege — use a porta',
      },
    ],
    cleanInstruction: cleanPdfNoise,
    patchQuestion: (q) => ({
      ...q,
      question_data: {
        ...q.question_data,
        figure_policy: 'transcribed' as const,
        instruction: cleanPdfNoise(q.question_data.instruction).replace(
          'figura a seguir.',
          'figura transcrita abaixo.',
        ),
        text_fragment: VUNESP_SVD_FRAGMENT,
      },
    }),
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562730776-5': {
    family: 'conceito',
    guideline: 'MS TB — escarro mucopurulento pós-tosse; poucos mL; baciloscopia/TRM-TB dependem de qualidade',
    extraSources: [MS_TB_SOURCE, MS_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro para TB — terreno',
        meta: slideMeta,
        items: [
          { label: 'Exames', detail: 'Baciloscopia, cultura micobactéria, TRM-TB — dependem da amostra.', icon: 'Microscope' },
          { label: 'Aspecto ideal', detail: 'Mucopurulento após esforço de tosse — vias inferiores.', icon: 'Wind' },
          { label: 'Volume', detail: 'Poucos mL bastam — não prejudica baciloscopia.', icon: 'Droplets' },
          { label: 'UBS', detail: 'Coleta em ambiente privado, preferencialmente banheiro.', icon: 'Building2' },
          { label: 'Pegadinha — antisséptico', detail: 'Bochecho com antisséptico antes da coleta não é rotina MS.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — aspiração', detail: 'Aspiração de faringe não substitui escarro espontâneo de rotina.', icon: 'Ban' },
        ],
        footer_rule: 'Mucopurulento pós-tosse = amostra ideal TB',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: consideração correta na coleta de escarro para TB.',
          'A — UBS em ambiente privado/banheiro: conduta correta.',
          'C — poucos mL: volume adequado para baciloscopia.',
          'E — aspecto mucopurulento pós-tosse: amostra ideal — gabarito pedido.',
          'Eliminar B — antisséptico bucal antes da coleta não é orientação padrão MS.',
          'Eliminar D — aspiração de faringe não é primeira escolha se paciente pode expectorar.',
          'Marcar E — aspecto mucopurulento.',
          'Em similares: escarro TB = mucopurulento das vias inferiores — saliva ou aspecto seroso reprova.',
        ],
        footer_rule: 'E = mucopurulento pós-tosse',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escarro TB',
        meta: slideMeta,
        content: 'TB — COLETA DE ESCORRO',
        rows: [
          { label: 'Aspecto', value: 'Mucopurulento após tosse produtiva', badge: 'hot' },
          { label: 'Volume', value: 'Poucos mL — suficiente para baciloscopia/TRM', badge: 'ok' },
          { label: 'Local UBS', value: 'Privacidade — preferencialmente banheiro', badge: 'ok' },
          { label: 'Evitar', value: 'Saliva, antisséptico rotineiro, aspiração se não indicada', badge: 'warn' },
        ],
        footer_rule: 'Qualidade > quantidade para TB',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCORRO TB VUNESP',
        items: [
          { label: 'Letra A — banheiro UBS', detail: 'Privacidade e biossegurança locais.', correct: 'Conduta correta — não é o foco único do gabarito E, mas é verdadeira.' },
          { label: 'Letra B — antisséptico bucal', detail: 'Parece rigoroso e “limpo”.', correct: 'Não é protocolo MS rotineiro — pode interferir na amostra.' },
          { label: 'Letra C — volume pequeno', detail: 'Volume mínimo plausível.', correct: 'Volume adequado — afirmativa correta, mas E responde “aspecto ideal”.' },
          { label: 'Letra D — aspiração faringea', detail: 'Alternativa para dificuldade de tosse.', correct: 'Não substitui escarro espontâneo quando possível — E é a resposta pedida.' },
          { label: 'Letra E — mucopurulento', detail: 'Descrição do aspecto ideal.', correct: 'Escarro das vias inferiores, mucopurulento — gabarito da questão.' },
          { label: 'Em outra banca…', detail: 'Pergunta antisséptico bucal ou aspiração.', correct: 'Aspecto mucopurulento pós-tosse permanece o ideal para baciloscopia/TRM-TB.' },
        ],
        footer_rule: 'Aspecto mucopurulento = amostra representativa',
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
    let raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    if (pack.patchQuestion) raw = pack.patchQuestion(raw);
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
    console.log(`[handcraft:coleta-g05] OK ${slug}`);
  }
  console.log(`[handcraft:coleta-g05] total=${ok}`);
}

main();
