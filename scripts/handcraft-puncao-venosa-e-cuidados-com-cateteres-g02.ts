#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g02 (8 slugs P0 puncao_dispositivo).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g02
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g02';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_dispositivo';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bdescritascaracterísticas\b/gi, 'descritas características')
    .replace(/\bcatetercentral\b/gi, 'cateter central')
    .replace(/\bnacoleta\b/gi, 'na coleta')
    .replace(/\bdistalmenteao\b/gi, 'distalmente ao')
    .replace(/\bcomosmolalidade\b/gi, 'com osmolalidade')
    .replace(/\bparaassegurar\b/gi, 'para assegurar')
    .replace(/\bdaagulha\b/gi, 'da agulha')
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
    subtopico: SUBTOPICO,
    pedagogical_branch: BRANCH,
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
  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-3': {
    family: 'conceito',
    guideline: 'Dispositivo IV curto — escalpe/scalp para terapia periférica de curta duração',
    roi_error: 'confundir_escalpe_equipo_garrote',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dispositivos de acesso — mapa visual',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Imagem de acesso IV periférico para infusão de curta duração — identificar o nome do dispositivo.',
            icon: 'Target',
          },
          {
            label: 'Escalpe (scalp)',
            detail: 'Cateter com asas e tubo curto — punção venosa breve, coleta ou medicação de curta duração.',
            icon: 'Syringe',
          },
          {
            label: 'Equipo',
            detail: 'Conjunto para infusão gravitacional (macrogotas/microgotas) — não é o cateter de punção da imagem.',
            icon: 'Droplets',
          },
          {
            label: 'Garrote',
            detail: 'Torniquete para ingurgitar veia — auxilia a punção, não é cateter.',
            icon: 'Circle',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca mistura dispositivo de punção (escalpe/jelco) com equipo, garrote ou sonda.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Escalpe = punção curta; equipo = linha de infusão após o acesso.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Nomenclatura — punção × infusão',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'DISPOSITIVO DE PUNÇÃO ≠ EQUIPO DE INFUSÃO',
        rows: [
          { label: 'Escalpe / scalp', value: 'Acesso venoso periférico de curta duração.', badge: 'ok' },
          { label: 'Jelco', value: 'Cateter periférico flexível para infusão por alguns dias.', badge: 'info' },
          { label: 'Equipo', value: 'Mangueira + câmara + regulador para gotejamento.', badge: 'info' },
          { label: 'Garrote', value: 'Compressão temporária do braço — não penetra a veia.', badge: 'warn' },
        ],
        footer_rule: 'Na imagem de punção curta, escalpe é o nome cobrado pela AVANÇASP.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Como identificar o dispositivo',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Ler: terapia intravascular periférica + infusão de curta duração — dispositivo de punção, não equipo.',
          'Eliminar A (garrote): torniquete — não é cateter intravenoso.',
          'Eliminar C (equipo): linha de infusão gravitacional — montada após o acesso.',
          'Eliminar D e E: sondas urinárias — outro sistema corporal.',
          'Letra B (escalpe): scalp/butterfly para punção venosa breve.',
          'Marcar letra B.',
          'Fixação: em similares com figura, pergunte “punção curta” ou “linha de infusão”.',
        ],
        footer_rule: 'Nome do dispositivo segue a função no enunciado.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — nome do dispositivo',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — IDENTIFICAÇÃO VISUAL',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Garrote',
            detail: 'Garrote ingurgita a veia antes da punção.',
            correct: 'Não é cateter — é auxiliar de compressão venosa.',
          },
          {
            label: 'Letra C — Equipo',
            detail: 'Equipo conecta frasco ao cateter já instalado.',
            correct: 'Dispositivo da imagem é de punção (escalpe), não de gotejamento.',
          },
          {
            label: 'Letra D — Sonda de Foley',
            detail: 'Sonda vesical de demora — via urinária.',
            correct: 'Fora do tema acesso venoso periférico.',
          },
          {
            label: 'Letra E — Cateter uretral',
            detail: 'Cateter para via urinária, não venosa.',
            correct: 'Eliminar por sistema anatômico diferente do IV.',
          },
        ],
        footer_rule: 'Escalpe fecha punção curta — não troque por equipo na figura.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-5': {
    family: 'certo_errado',
    guideline: 'CVP curto (jelco) — limites de pH, osmolalidade, vesicantes; não confundir com PICC',
    roi_error: 'confundir_cvp_curto_picc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'CVP curto — o que é e o que não é',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando EXCETO',
            detail: 'Características do cateter intravenoso periférico curto — assinale a que não condiz.',
            icon: 'Target',
          },
          {
            label: 'Segurança do paciente',
            detail: 'Especificidades de cada tipo de cateter intravenoso — trilho AVANÇASP.',
            icon: 'Shield',
          },
          {
            label: 'CVP curto (jelco)',
            detail: 'Poucos centímetros na veia periférica — terapias de curta duração (jelco típico).',
            icon: 'Syringe',
          },
          {
            label: 'Limites de segurança',
            detail: 'Evitar NPP, pH extremo, osmolalidade alta e vesicantes no periférico curto.',
            icon: 'Shield',
          },
          {
            label: 'Calibre',
            detail: 'Menor calibre adequado à terapia e ao vaso — preserva a veia.',
            icon: 'Gauge',
          },
          {
            label: 'PICC (intruso)',
            detail: 'Cateter longo em veia basílica/cefálica/cubital mediana — não é periférico curto.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'CVP curto ≠ cateter central de inserção periférica longa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tabela — CVP curto × PICC',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'CVP curto', value: 'Curta duração; veia periférica superficial.', badge: 'ok' },
          { label: 'Não usar no CVP', value: 'NPP, pH extremo, osmolalidade elevada, vesicantes.', badge: 'warn' },
          { label: 'Calibre', value: 'Menor G possível que atenda à prescrição.', badge: 'ok' },
          { label: 'PICC', value: 'Inserção periférica longa — ponta em veia central.', badge: 'hot' },
        ],
        footer_rule: 'Comprimento e posição da ponta separam CVP de PICC.',
      },
      {
        type: 'logic_flow',
        slide_title: 'EXCETO — achar a intrusa',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Formato EXCETO: três afirmativas corretas sobre CVP curto + uma descrição de outro dispositivo.',
          'Validar A: restrição a NPP, pH e osmolalidade — conduta correta no periférico.',
          'Validar B: terapia de curta duração — perfil do cateter periférico curto.',
          'Validar C: menor calibre adequado — técnica segura.',
          'Validar D: proibição de vesicantes no CVP curto — correto.',
          'Letra E descreve inserção longa em basílica/cefálica/cubital — perfil PICC, não CVP curto.',
          'Marcar letra E.',
          'Fixação: em EXCETO de cateter, compare comprimento e posição da ponta.',
        ],
        footer_rule: 'A intrusa costuma ser cateter central ou PICC.',
      },
      {
        type: 'danger_zone',
        slide_title: 'EXCETO — por que A–D são corretas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CVP × PICC',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — NPP e pH',
            detail: 'Nutrição e soluções extremas exigem via central, não periférico curto.',
            correct: 'Afirmativa verdadeira — por isso não é o gabarito do EXCETO.',
          },
          {
            label: 'Letra B — Curta duração',
            detail: 'Jelco é para terapias de poucos dias, não semanas.',
            correct: 'Conduta correta do CVP — eliminar do EXCETO.',
          },
          {
            label: 'Letra C — Menor calibre',
            detail: 'Preserva o endotélio venoso quando compatível com a infusão.',
            correct: 'Regra técnica válida — não é a alternativa falsa.',
          },
          {
            label: 'Letra D — Vesicantes',
            detail: 'Medicamentos vesicantes podem necrosar tecido se extravasarem.',
            correct: 'Proibição correta no periférico — só E é intrusa (PICC longo).',
          },
        ],
        footer_rule: 'Não marque A–D só porque “parecem restritivas” — são verdadeiras.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-7': {
    family: 'conceito',
    guideline: 'Cateter intravenoso central (intracath) — NPP, PVC, vasoativas e terapia prolongada',
    roi_error: 'esquecer_indicacao_cateter_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cateter intravenoso central — indicações',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Intracath em veia de grande calibre — listar situações que justificam cateter intravenoso central.',
            icon: 'Target',
          },
          {
            label: 'Nutrição parenteral',
            detail: 'NPP prolongada — hiperosmolar; via central obrigatória.',
            icon: 'Droplets',
          },
          {
            label: 'PVC',
            detail: 'Medida hemodinâmica — acesso central.',
            icon: 'Activity',
          },
          {
            label: 'Vasoativas',
            detail: 'Drogas irritantes/concentradas — fluxo rápido em veia central.',
            icon: 'Zap',
          },
          {
            label: 'Terapia prolongada',
            detail: 'Antibióticos ou infusões de longo prazo quando periférico não basta.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Cateter central quando periférico curto não sustenta a terapia.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Quando o central vence o periférico',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'NPP prolongada', value: 'Via central — osmolalidade alta.', badge: 'ok' },
          { label: 'PVC', value: 'Monitorização hemodinâmica.', badge: 'ok' },
          { label: 'Vasoativas', value: 'Diluição e segurança em grande fluxo.', badge: 'ok' },
          { label: 'Terapia prolongada', value: 'Estabilidade do acesso por semanas.', badge: 'ok' },
        ],
        footer_rule: 'Todas as alternativas isoladas são indicações clássicas de cateter central.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar as indicações',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Identificar: cateter central (intracath) em veia profunda.',
          'Testar A (NPP prolongada): indicação clássica — correto.',
          'Testar B (PVC): medida invasiva central — correto.',
          'Testar C (vasoativas): infusão em veia de grande calibre — correto.',
          'Testar D (terapia prolongada): acesso estável — correto.',
          'Todas as letras isoladas são verdadeiras → letra E (todas).',
          'Marcar letra E.',
          'Fixação: em listas de indicação de cateter intravenoso central, suspeite de “todas corretas” quando A–D são clássicas.',
        ],
        footer_rule: 'NPP + PVC + vasoativa + prolongada = pacote de cateter central.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — cateter central',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — INDICAÇÃO CENTRAL',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Descartar E por “todas”',
            detail: 'Aluno evita E em questões de múltipla escolha.',
            correct: 'Aqui A–D são indicações reais — E é o gabarito.',
          },
          {
            label: 'Confundir com periférico curto',
            detail: 'NPP e vasoativas não vão em jelco de curta permanência.',
            correct: 'O enunciado já ancora cateter intravenoso central.',
          },
          {
            label: 'Letra B isolada',
            detail: 'PVC só é possível com cateter cuja ponta está em átrio/veia central.',
            correct: 'Reforça que B sozinha já justificaria cateter intravenoso central.',
          },
          {
            label: 'Letra D vaga',
            detail: '“Prolongada” sem contexto parece genérica.',
            correct: 'No pacote AVANÇASP, soma com NPP/PVC/vasoativas → todas.',
          },
        ],
        footer_rule: 'Intracath = cateter intravenoso central — não reduza a uma única indicação.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-2': {
    family: 'protocolo',
    guideline: 'Transfusão sanguínea — equipo com filtro de hemocomponentes',
    roi_error: 'equipo_transfusao_sem_filtro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Transfusão — material correto',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Cirurgia eletiva com necessidade de transfusão — técnico coleta materiais com enfermeiro.',
            icon: 'Target',
          },
          {
            label: 'Equipo padrão',
            detail: 'Macrogotas para medicamentos não substitui equipo de hemoterapia.',
            icon: 'XCircle',
          },
          {
            label: 'Filtro',
            detail: 'Retém microagregados e partículas — item obrigatório na transfusão.',
            icon: 'Filter',
          },
          {
            label: 'Rh / tipo sanguíneo',
            detail: 'Compatibilidade é na bolsa e na prescrição — não no modelo do equipo.',
            icon: 'Droplet',
          },
          {
            label: 'Esterilização',
            detail: 'Equipo de transfusão é descartável estéril — não autoclave de rotina.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Transfusão = equipo específico com filtro.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Equipo na hemoterapia',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Equipo com filtro', value: 'Padrão para transfusão de hemocomponentes.', badge: 'ok' },
          { label: 'Macrogotas comum', value: 'Medicamentos e cristaloides — não sangue.', badge: 'warn' },
          { label: 'Microgotas + autoclave', value: 'Não é protocolo de transfusão.', badge: 'warn' },
          { label: 'Rh no equipo', value: 'Compatibilidade é pré-transfusional na bolsa.', badge: 'info' },
        ],
        footer_rule: 'Filtro protege o paciente de microêmbolos e agregados.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher o equipo',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Contexto: transfusão de sangue pós-cirurgia — não infusão medicamentosa comum.',
          'Eliminar A: macrogotas padrão não tem filtro para hemocomponentes.',
          'Eliminar B: fator Rh não define modelo de equipo.',
          'Eliminar C: microgotas + autoclave não é protocolo de hemoterapia.',
          'Eliminar E: equipo “automatizado por tipo sanguíneo” — invenção de prova.',
          'Letra D: equipo com filtro para retenção de partículas.',
          'Marcar letra D.',
          'Fixação: hemoterapia sempre lembra filtro — nunca equipo de soro comum.',
        ],
        footer_rule: 'Bolsa de sangue → equipo com filtro estéril.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — equipo na transfusão',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — HEMOTERAPIA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Macrogotas',
            detail: 'Serve para medicamentos e soluções, sem filtro de sangue.',
            correct: 'Transfusão exige equipo específico com filtro.',
          },
          {
            label: 'Letra B — Rh no equipo',
            detail: 'Tipagem e prova cruzada são feitas no laboratório.',
            correct: 'O equipo não “se adapta” ao Rh do paciente.',
          },
          {
            label: 'Letra C — Autoclave',
            detail: 'Equipo de transfusão é unitário estéril descartável.',
            correct: 'Reprocessar equipo de sangue não é conduta.',
          },
          {
            label: 'Letra E — Automatizado',
            detail: 'Não existe seleção automática de tipo sanguíneo pelo equipo.',
            correct: 'Segurança transfusional é checagem humana + filtro.',
          },
        ],
        footer_rule: 'Em outra banca: filtro + dupla checagem identificam hemoterapia segura.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-5': {
    family: 'conceito',
    guideline: 'Equipo — infusão gravitacional com regulador de fluxo',
    roi_error: 'confundir_equipo_escalpe',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Equipo de venóclise',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Imagem de dispositivo para infusão gravitacional de soluções com regulador de fluxo.',
            icon: 'Target',
          },
          {
            label: 'Equipo',
            detail: 'Mangueira, câmara de gotejamento e rolete — liga frasco ao cateter.',
            icon: 'Droplets',
          },
          {
            label: 'Escalpe',
            detail: 'Dispositivo de punção — não é linha de gotejamento.',
            icon: 'Syringe',
          },
          {
            label: 'Vacutainer',
            detail: 'Sistema de coleta laboratorial — outro contexto.',
            icon: 'TestTube',
          },
          {
            label: 'Garrote',
            detail: 'Compressão venosa — auxiliar, não equipo.',
            icon: 'Circle',
          },
        ],
        footer_rule: 'Equipo = conduzir solução; escalpe = obter acesso.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Função do equipo',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'EQUIPO = VENÓCLISE GRAVITACIONAL',
        rows: [
          { label: 'Equipo', value: 'Frasco → câmara → regulador → cateter.', badge: 'ok' },
          { label: 'Macrogotas / microgotas', value: 'Variantes do equipo conforme velocidade.', badge: 'info' },
          { label: 'Escalpe', value: 'Punção venosa curta — não confundir com equipo.', badge: 'warn' },
        ],
        footer_rule: 'Regulador de fluxo na figura aponta para equipo.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Nomear o dispositivo',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Enunciado: infusão gravitacional + regulador de fluxo — linha de administração.',
          'Eliminar B (escalpe): punção, não gotejamento.',
          'Eliminar C (sonda): via urinária ou outra — não venóclise.',
          'Eliminar D (vacutainer): coleta de sangue para laboratório.',
          'Eliminar E (garrote): torniquete pré-punção.',
          'Letra A (equipo): conjunto de venóclise.',
          'Marcar letra A.',
          'Fixação: “regulador de fluxo” na figura = equipo, não cateter.',
        ],
        footer_rule: 'Punção × infusão — dois dispositivos distintos na prova.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — equipo',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — VENÓCLISE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Escalpe',
            detail: 'Usado para entrar na veia — procedimento de punção.',
            correct: 'A figura mostra linha de infusão após o acesso.',
          },
          {
            label: 'Letra C — Sonda',
            detail: 'Dispositivo para outras vias (urinária, enteral).',
            correct: 'Não nomeia equipo de soro endovenoso.',
          },
          {
            label: 'Letra D — Vacutainer',
            detail: 'Coleta diagnóstica com tubo a vácuo.',
            correct: 'Diferente de infusão gravitacional contínua.',
          },
          {
            label: 'Letra E — Garrote',
            detail: 'Ingurgita veia — não conduz solução.',
            correct: 'Equipo é a resposta quando há câmara de gotejamento.',
          },
        ],
        footer_rule: 'Câmara + rolete na imagem = equipo.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-6': {
    family: 'conceito',
    guideline: 'Escalpe/scalp — punção intravenosa de curto período',
    roi_error: 'confundir_escalpe_jelco_imagem',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Punção curta — dispositivo da imagem',
        chip_label: 'DISPOSITIVO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Dispositivo para punções IV de curto período — identificação visual.',
            icon: 'Target',
          },
          {
            label: 'Escalpe (scalp)',
            detail: 'Agulha com asas plásticas e tubo curto — acesso breve ou coleta.',
            icon: 'Syringe',
          },
          {
            label: 'Jelco',
            detail: 'Cateter sobre agulha que permanece no vaso — infusão por dias.',
            icon: 'Droplets',
          },
          {
            label: 'Equipo',
            detail: 'Linha de infusão — montada depois do cateter.',
            icon: 'Link',
          },
          {
            label: 'Dica visual',
            detail: 'Asas laterais (butterfly) sugerem escalpe, não jelco com hub longo.',
            icon: 'Eye',
          },
        ],
        footer_rule: 'Curto período + asas = escalpe na nomenclatura de prova.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Escalpe × jelco',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Escalpe', value: 'Punção curta, coleta, medicação breve.', badge: 'ok' },
          { label: 'Jelco', value: 'Cateter indwelling — permanece no vaso.', badge: 'info' },
          { label: 'Equipo', value: 'Administração gravitacional após acesso.', badge: 'info' },
        ],
        footer_rule: 'AVANÇASP costuma nomear butterfly de escalpe.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Identificar na figura',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Enunciado: punção IV de curto período — dispositivo da imagem com asas (butterfly).',
          'Eliminar A (adaptador de seringa): conector, não punção venosa completa.',
          'Eliminar B (equipo): linha de infusão gravitacional.',
          'Eliminar C (agulha Vacutainer): coleta laboratorial a vácuo.',
          'Eliminar E (garrote): torniquete — não perfura veia.',
          'Letra D (escalpe): nomenclatura do scalp/butterfly.',
          'Marcar letra D.',
          'Fixação: imagem com asas + tubo curto → escalpe/scalp.',
        ],
        footer_rule: 'Tempo de uso no enunciado guia scalp × jelco.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — escalpe na figura',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — BUTTERFLY',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Adaptador',
            detail: 'Conecta seringa a outro dispositivo — não é butterfly de punção.',
            correct: 'A figura mostra escalpe para acesso venoso curto.',
          },
          {
            label: 'Letra B — Equipo',
            detail: 'Equipo não perfura veia — só conduz solução.',
            correct: 'Dispositivo de punção, não de gotejamento.',
          },
          {
            label: 'Letra C — Vacutainer',
            detail: 'Sistema de coleta com tubo a vácuo.',
            correct: 'Diferente de punção para infusão ou coleta com escalpe.',
          },
          {
            label: 'Letra E — Garrote',
            detail: 'Alguns distratores trazem torniquete.',
            correct: 'Garrote ingurgita veia — não é cateter IV.',
          },
        ],
        footer_rule: 'Butterfly = escalpe na terminologia AVANÇASP.',
      },
    ],
  },

  'fau-unicentro-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-5': {
    family: 'conceito',
    guideline: 'Calibre vascular — Gauge (G) como unidade de diâmetro',
    roi_error: 'confundir_gauge_pressao_volume',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Unidades do cateter',
        chip_label: 'CALIBRE',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Assinale a unidade dimensional de diâmetro de cateter vascular.',
            icon: 'Target',
          },
          {
            label: 'Gauge (G)',
            detail: 'Quanto maior o número G, menor o diâmetro interno do cateter.',
            icon: 'Gauge',
          },
          {
            label: 'mmHg',
            detail: 'Unidade de pressão arterial — não calibre.',
            icon: 'Activity',
          },
          {
            label: '% e mg',
            detail: 'Concentração ou massa — não medem diâmetro do cateter.',
            icon: 'Percent',
          },
          {
            label: 'm³',
            detail: 'Volume — não diâmetro linear.',
            icon: 'Box',
          },
        ],
        footer_rule: 'Diâmetro de cateter → Gauge (ou French em outros contextos).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Gauge — regra prática',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Gauge (G)', value: 'Diâmetro do cateter — número maior = fio mais fino.', badge: 'ok' },
          { label: 'Calibre grosso', value: 'Volume rápido — veia com bom fluxo.', badge: 'info' },
          { label: 'Calibre fino', value: 'Veia frágil, pediátrico ou idoso.', badge: 'info' },
          { label: 'mmHg', value: 'Pressão — outro parâmetro hemodinâmico.', badge: 'warn' },
        ],
        footer_rule: 'Não misture unidade de calibre com pressão ou dose.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher a unidade correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Pergunta direta: unidade de diâmetro de cateter vascular.',
          'Eliminar A (mmHg): pressão.',
          'Eliminar B (%): concentração.',
          'Eliminar C (m³): volume.',
          'Eliminar E (mg): massa de fármaco.',
          'Letra D (Gauge): padrão em cateteres IV.',
          'Marcar letra D.',
          'Fixação: calibre = G; pressão = mmHg; nunca inverta na prova.',
        ],
        footer_rule: 'Gauge é a resposta “seca” de nomenclatura técnica.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — unidades',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CALIBRE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — mmHg',
            detail: 'Usado em PA e PVC — grandeza de pressão.',
            correct: 'Não mede diâmetro do cateter.',
          },
          {
            label: 'Letra B — %',
            detail: 'Percentual de solução ou saturação.',
            correct: 'Dimensão diferente de calibre vascular.',
          },
          {
            label: 'Letra C — m³',
            detail: 'Unidade de volume tridimensional.',
            correct: 'Cateter usa G para diâmetro, não m³.',
          },
          {
            label: 'Letra E — mg',
            detail: 'Dose de medicamento.',
            correct: 'Massa ≠ diâmetro do dispositivo.',
          },
        ],
        footer_rule: 'Em similares: diâmetro → G; fluxo/pressão → outras unidades.',
      },
    ],
  },

  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-4': {
    family: 'certo_errado',
    guideline: 'Registro de AVP — COFEN 358: data, local, calibre, profissional; marca comercial não é obrigatória',
    roi_error: 'registrar_marca_lote_obrigatorio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Anotação de enfermagem no AVP',
        chip_label: 'DOCUMENTAÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando NÃO',
            detail: 'Qual informação do acesso venoso periférico não precisa constar na anotação.',
            icon: 'Target',
          },
          {
            label: 'Quando e por quê',
            detail: 'Data, hora e motivo da punção ou troca — rastreabilidade.',
            icon: 'Calendar',
          },
          {
            label: 'Onde e como',
            detail: 'Local, pele e rede venosa — avaliação do sítio.',
            icon: 'MapPin',
          },
          {
            label: 'Dispositivo',
            detail: 'Número de punções, tipo e calibre do cateter, intercorrências.',
            icon: 'Gauge',
          },
          {
            label: 'Responsável',
            detail: 'Nome e Coren de quem realizou — accountability.',
            icon: 'User',
          },
        ],
        footer_rule: 'SAE exige conteúdo clínico — não propaganda de fabricante.',
      },
      {
        type: 'golden_rule',
        slide_title: 'O que registrar no AVP',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Registrar', value: 'Data/hora, motivo, local, calibre, intercorrências, Coren.', badge: 'ok' },
          { label: 'Não obrigatório', value: 'Marca comercial e lote do cateter na anotação de rotina.', badge: 'hot' },
          { label: 'Rastreio de lote', value: 'Pode existir em sistema de estoque — não item clínico da SAE.', badge: 'info' },
        ],
        footer_rule: 'Prontuário clínico ≠ nota fiscal do material.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar o que NÃO anotar',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Formato: qual item NÃO compõe a anotação de AVP.',
          'A, B, C e E são dados clínicos/legais essenciais — devem ser registrados.',
          'Letra D (marca comercial e lote): dado administrativo/comercial, não exigido na anotação de enfermagem.',
          'Marcar letra D.',
          'Fixação: calibre e tipo sim; marca do fabricante não é núcleo da SAE.',
        ],
        footer_rule: 'Documente o cuidado — não o marketing do cateter.',
      },
      {
        type: 'danger_zone',
        slide_title: 'NÃO compõe — por que as outras sim',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — REGISTRO AVP',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Data e motivo',
            detail: 'Permite reconstruir a linha do tempo do acesso.',
            correct: 'Informação necessária — não é o gabarito do NÃO.',
          },
          {
            label: 'Letra B — Local e pele',
            detail: 'Avaliação do sítio e rede venosa faz parte da segurança.',
            correct: 'Deve constar no prontuário.',
          },
          {
            label: 'Letra C — Calibre e intercorrências',
            detail: 'Tipo de cateter e eventos (flebite, infiltração) orientam conduta.',
            correct: 'Registro clínico obrigatório — eliminar do NÃO.',
          },
          {
            label: 'Letra E — Coren',
            detail: 'Identifica o profissional responsável pelo procedimento.',
            correct: 'Exigência ético-legal — só D fica de fora.',
          },
        ],
        footer_rule: 'Marca/lote é estoque — anotação pede dado assistencial.',
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
    console.log(`[handcraft:puncao-g02] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g02] total=${ok}`);
}

main();
