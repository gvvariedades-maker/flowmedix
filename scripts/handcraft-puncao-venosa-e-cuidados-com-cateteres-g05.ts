#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g05 (8 slugs P0 puncao_periferica_antissepsia).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g05
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g05';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_periferica_antissepsia';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bparaterapias\b/gi, 'para terapias')
    .replace(/\bgarantindosegurança\b/gi, 'garantindo segurança')
    .replace(/\bnão hárefluxo\b/gi, 'não há refluxo')
    .replace(/\bavaliação doocorrido\b/gi, 'avaliação do ocorrido')
    .replace(/\bouinfundir\b/gi, 'ou infundir')
    .replace(/\bterapiasendovenosas\b/gi, 'terapias endovenosas')
    .replace(/\bpunção venosaperiférica\b/gi, 'punção venosa periférica')
    .replace(/\bfacilidade deacesso\b/gi, 'facilidade de acesso')
    .replace(/\bde formadistal-proximal\b/gi, 'de forma distal-proximal')
    .replace(/\bmaisfrequentemente\b/gi, 'mais frequentemente')
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
  'amauc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-5': {
    family: 'conceito',
    guideline: 'Anatomia da fossa antecubital — cefálica lateral, basílica medial, medianas na fossa',
    roi_error: 'inverter_nomenclatura_fossa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fossa antecubital — mapa venoso',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Imagem da fossa antecubital (formato H ou M) — identificar veias numeradas.',
            icon: 'Target',
          },
          {
            label: 'Cefálica',
            detail: 'Trajeto lateral do braço — posição 1 na figura típica.',
            icon: 'Map',
          },
          {
            label: 'Basílica',
            detail: 'Trajeto medial do braço — posição 2 na figura.',
            icon: 'Map',
          },
          {
            label: 'Medianas',
            detail: 'Cubital mediana e cefálica/basílica medianas na fossa — posições centrais.',
            icon: 'GitBranch',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca troca basílica com cefálica ou inverte medianas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Lateral = cefálica; medial = basílica; fossa = medianas.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Nomenclatura — fossa cubital',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Posição 1', value: 'Cefálica — face lateral do antebraço/braço.', badge: 'ok' },
          { label: 'Posição 2', value: 'Basílica — face medial.', badge: 'ok' },
          { label: 'Fossa', value: 'Cubital mediana + medianas comunicantes.', badge: 'hot' },
        ],
        footer_rule: 'Na imagem AMAUC: sequência cefálica-basílica-medianas fecha B.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Ler a figura',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Localizar cefálica (lateral) e basílica (medial) nos pontos 1 e 2.',
          'Identificar cubital mediana e medianas no centro da fossa (3, 4, 5).',
          'Comparar alternativas que invertem basílica/cefálica nas posições 1–2.',
          'Eliminar opções que trocam cefálica mediana com cubital mediana.',
          'Letra B: Cefálica (1); Basílica (2); Cubital mediana (3); Cefálica mediana (4); Basílica mediana (5).',
          'Marcar letra B.',
        ],
        footer_rule: 'Anatomia visual: lateral × medial antes de medianas.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Trocas clássicas na figura',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ANATOMIA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Basílica no 1',
            detail: 'Posição lateral é cefálica, não basílica.',
            correct: 'Inversão lateral/medial — eliminar.',
          },
          {
            label: 'Letra C — Medianas trocadas',
            detail: 'Cefálica mediana e cubital mediana em posições invertidas.',
            correct: 'Centro da fossa exige nomenclatura precisa.',
          },
          {
            label: 'Letra D — Mediana 4 errada',
            detail: 'Basílica mediana no lugar da cefálica mediana.',
            correct: 'Conferir par mediana cefálica × basílica mediana.',
          },
          {
            label: 'Letra E — Ordem das medianas',
            detail: 'Basílica mediana e cubital mediana permutadas.',
            correct: 'Só B nomeia 1–5 corretamente.',
          },
        ],
        footer_rule: 'Figura H/M: cefálica lateral, basílica medial.',
      },
    ],
  },

  'ameosc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-7': {
    family: 'protocolo',
    guideline: 'Falha de punção — sem refluxo, dor e queimação: interromper e comprimir',
    roi_error: 'reposicionar_agulha_sem_refluxo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Complicação imediata na punção',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Sinais',
            detail: 'Sem refluxo de sangue + dor + queimação — punção extravenosa ou trauma.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Não insistir',
            detail: 'Reposicionar ou movimentar o braço agrava lesão tecidual.',
            icon: 'XCircle',
          },
          {
            label: 'Interromper',
            detail: 'Retirar agulha com segurança assim que identificar falha.',
            icon: 'StopCircle',
          },
          {
            label: 'Compressão',
            detail: 'Gaze limpa no sítio — prevenir hematoma.',
            icon: 'Bandage',
          },
          {
            label: 'Comunicar',
            detail: 'Registrar e acionar enfermeiro para reavaliação do acesso.',
            icon: 'Users',
          },
        ],
        footer_rule: 'Sem refluxo com dor = parar, não “forçar” a coleta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Falha na punção — conduta',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Interromper', value: 'Retirar agulha imediatamente.', badge: 'hot' },
          { label: 'Compressão', value: 'Gaze limpa no sítio por alguns minutos.', badge: 'ok' },
          { label: 'Comunicar', value: 'Enfermeiro avalia e reprograma coleta.', badge: 'ok' },
          { label: 'Proibido', value: 'Reposicionar agulha ou ignorar dor/queimação.', badge: 'warn' },
        ],
        footer_rule: 'Segurança do paciente > concluir coleta a qualquer custo.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Conduta na falha',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Cenário: coleta venosa — sem refluxo, dor e queimação.',
          'Eliminar A — desconforto não é normal sem sangue no equipo.',
          'Eliminar B — movimentar braço mantendo agulha piora trauma.',
          'Eliminar D — reposicionar agulha no tecido é proscrito.',
          'Letra C: interromper, retirar, comprimir, comunicar enfermeiro.',
          'Marcar letra C.',
        ],
        footer_rule: 'Falha de acesso = reinício com nova assepsia e novo sítio.',
      },
      {
        type: 'danger_zone',
        slide_title: 'O que não fazer',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — COLETA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Continuar',
            detail: 'Sem refluxo indica falha de punção — não prosseguir.',
            correct: 'Risco de extravasamento e hematoma.',
          },
          {
            label: 'Letra B — Movimentar braço',
            detail: 'Manipular membro com agulha mal posicionada aumenta lesão.',
            correct: 'Retirar antes de novo posicionamento.',
          },
          {
            label: 'Letra D — Reposicionar',
            detail: '“Varredura” com agulha no subcutâneo é conduta inaceitável.',
            correct: 'C é o protocolo seguro de interrupção.',
          },
        ],
        footer_rule: 'Queimação = alerta de punção extravascular.',
      },
    ],
  },

  'cev-urca-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-3': {
    family: 'conceito',
    guideline: 'Locais de punção periférica — preferir veias calibrosas de MS; evitar dígitos para volume',
    roi_error: 'confundir_anatomia_radial_basílica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Locais de acesso periférico',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Inferências corretas sobre locais de aplicação endovenosa periférica.',
            icon: 'Target',
          },
          {
            label: 'Membro superior',
            detail: 'Fossa antecubital e antebraço — veias calibrosas de escolha.',
            icon: 'Activity',
          },
          {
            label: 'Cefálica acessória',
            detail: 'Trajeto radial no antebraço — calibre favorável à punção.',
            icon: 'Map',
          },
          {
            label: 'Mão',
            detail: 'Metacarpianas — calibre fino, punção mais dolorosa.',
            icon: 'Hand',
          },
          {
            label: 'Pegadinha',
            detail: 'Basílica no rádio; evitar fossa; dígitos para grande volume.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Calibrosa + acessível no MS = preferência; mão/dedo = reserva.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Escolha do sítio',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Preferência', value: 'Veias calibrosas do braço/antebraço.', badge: 'hot' },
          { label: 'Cefálica acessória', value: 'Alongamento radial — boa opção terapêutica.', badge: 'ok' },
          { label: 'Evitar', value: 'Dígitos para infusão prolongada; basílica no rádio (anatomia errada).', badge: 'warn' },
        ],
        footer_rule: 'A banca CEV cobra cefálica acessória radial como correta.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Eliminar locais errados',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: inferência correta sobre locais EV periféricos.',
          'Eliminar A — basílica não segue o osso radial (fica medial).',
          'Eliminar B — metacarpianas são finas e dolorosas (verdade, mas não é a “inferência” cobrada).',
          'Eliminar C — fossa antecubital é local comum, não a evitar rotineiramente.',
          'Eliminar E — dígitos não são preferência para grande volume prolongado.',
          'Letra D: cefálicas acessórias radiais calibrosas — correta na prova.',
          'Marcar letra D.',
        ],
        footer_rule: 'Anatomia + calibre guiam a eliminação.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Erros anatômicos',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Basílica radial',
            detail: 'Basílica é medial; radial acompanha cefálica/acessória.',
            correct: 'Confusão anatômica clássica.',
          },
          {
            label: 'Letra C — Evitar fossa',
            detail: 'Fossa antecubital é ponto frequente de coleta.',
            correct: 'Não é área proscrita de rotina.',
          },
          {
            label: 'Letra E — Dígitos prolongados',
            detail: 'Veias digitais não suportam terapia de grande volume.',
            correct: 'Reservar para situações específicas.',
          },
        ],
        footer_rule: 'D fecha o raciocínio calibro × trajeto radial.',
      },
    ],
  },

  'fau-unicentro-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-8': {
    family: 'conceito',
    guideline: 'Material indispensável na punção venosa — cateter ou dispositivo de acesso',
    roi_error: 'material_nao_essencial_puncao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Material da punção',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Material indispensável para realizar punção venosa.',
            icon: 'Target',
          },
          {
            label: 'Cateter/agulha',
            detail: 'Dispositivo que efetivamente acessa o vaso — sem ele não há punção.',
            icon: 'Syringe',
          },
          {
            label: 'Auxiliares',
            detail: 'Garrote, antisséptico, equipo — necessários mas não definem o ato isolado.',
            icon: 'Package',
          },
          {
            label: 'Monitorização',
            detail: 'Oxímetro e termômetro avaliam paciente, não realizam punção.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha',
            detail: 'Ambu (ventilação) e tesoura (corte) — outros procedimentos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Indispensável = o que penetra a veia.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Kit mínimo mental',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'PUNÇÃO = DISPOSITIVO INTRAVASCULAR',
        rows: [
          { label: 'Essencial', value: 'Cateter, jelco ou agulha de punção.', badge: 'hot' },
          { label: 'Suporte', value: 'Garrote, antisséptico, curativo, equipo.', badge: 'info' },
          { label: 'Outros', value: 'Ambu, oxímetro, termômetro, tesoura — não são da punção em si.', badge: 'warn' },
        ],
        footer_rule: 'Sem cateter/agulha não há acesso venoso.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Identificar o indispensável',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: material indispensável à punção venosa.',
          'Eliminar A — Ambu é reanimação/ventilação.',
          'Eliminar C — oxímetro monitora SpO₂.',
          'Eliminar D — termômetro mede temperatura.',
          'Eliminar E — tesoura é instrumento de corte geral.',
          'Letra B — cateter (dispositivo de acesso venoso).',
          'Marcar letra B.',
        ],
        footer_rule: 'Pergunta direta: o que não pode faltar no vaso.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Itens de outras funções',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — MATERIAL',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Ambu',
            detail: 'Bolsa-valva para ventilação manual.',
            correct: 'Urgência respiratória — não punção.',
          },
          {
            label: 'Letra C — Oxímetro',
            detail: 'Monitorização não invasiva.',
            correct: 'Útil no atendimento, mas não indispensável à punção.',
          },
          {
            label: 'Letra D — Termômetro',
            detail: 'Sinal vital — outro procedimento.',
            correct: 'Eliminar por função diferente.',
          },
          {
            label: 'Letra E — Tesoura',
            detail: 'Pode cortar curativo, mas não define punção.',
            correct: 'B (cateter) é o núcleo do procedimento.',
          },
        ],
        footer_rule: 'Cateter = resposta objetiva.',
      },
    ],
  },

  'fepese-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-6': {
    family: 'certo_errado',
    guideline: 'Punção EV — técnica asséptica e escolha distal-proximal do vaso',
    roi_error: 'confundir_vias_administracao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo e vias — foco EV',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Princípios de preparo e administração — achado correto (mistura vias).',
            icon: 'Target',
          },
          {
            label: 'Punção EV',
            detail: 'Técnica asséptica + escolha do vaso distal-proximal no membro.',
            icon: 'Syringe',
          },
          {
            label: 'Subcutânea',
            detail: 'B erra locais (periumbilical não é rotina SC).',
            icon: 'Layers',
          },
          {
            label: 'Intramuscular',
            detail: 'C e E invertem prioridade de sítios IM.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha',
            detail: 'D confunde velocidade de absorção SC × ID × IM.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Isolar o item sobre punção endovenosa na alternativa A.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Punção endovenosa',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Assepsia', value: 'Punção EV sempre com técnica asséptica.', badge: 'hot' },
          { label: 'Ordem do vaso', value: 'Distal → proximal — poupar veias proximais.', badge: 'ok' },
          { label: 'Outras vias', value: 'SC/IM têm locais e ordens próprias — não generalizar.', badge: 'warn' },
        ],
        footer_rule: 'A é o único bloco correto sobre EV.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Questão mescla vias — localizar afirmativa sobre endovenosa.',
          'Letra A: asséptica + distal-proximal — protocolo de punção.',
          'Eliminar B — locais SC incorretos.',
          'Eliminar C — deltoide não é primeira escolha IM universal.',
          'Eliminar D — absorção SC não é mais lenta que ID.',
          'Eliminar E — ordem IM invertida.',
          'Marcar letra A.',
        ],
        footer_rule: 'Distal-proximal preserva acesso futuro no membro.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Erros nas outras vias',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — VIAS',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — SC',
            detail: 'Periumbilical não é sítio SC clássico de rotina.',
            correct: 'Braço, coxa anterior, abdome — protocolo SC próprio.',
          },
          {
            label: 'Letra C — Deltoide IM',
            detail: 'Vasto lateral costuma preceder deltoide em muitos protocolos.',
            correct: 'Não é “primeira escolha” absoluta.',
          },
          {
            label: 'Letra D — Absorção',
            detail: 'SC é mais lenta que IM; ID é a mais lenta.',
            correct: 'Hierarquia de absorção invertida na alternativa.',
          },
          {
            label: 'Letra E — Ordem IM',
            detail: 'Prioridade vasto → deltoide → glúteos — não a sequência da letra.',
            correct: 'Só A descreve EV corretamente.',
          },
        ],
        footer_rule: 'Filtre por via antes de julgar verdade.',
      },
    ],
  },

  'gama-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-3': {
    family: 'conceito',
    guideline: 'Veia mediana cubital — comunicação cefálica-basílica na fossa; cefálica superficial lateral',
    roi_error: 'anatomia_braco_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Anatomia venosa do braço',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Conhecimento anatômico para punção venosa periférica segura.',
            icon: 'Target',
          },
          {
            label: 'Mediana cubital',
            detail: 'Na fossa cubital, conecta cefálica e basílica — acesso fácil.',
            icon: 'GitBranch',
          },
          {
            label: 'Cefálica',
            detail: 'Trajeto superficial lateral do membro — não é profunda posterior.',
            icon: 'Map',
          },
          {
            label: 'Basílica',
            detail: 'Medial e mais profunda em trechos — cuidado na punção.',
            icon: 'Map',
          },
          {
            label: 'Pegadinha',
            detail: 'Artéria braquial como alvo de infusão — erro grave.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mediana cubital = ponte cefálica–basílica na fossa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Mapa do braço',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Mediana cubital', value: 'Fossa cubital — comunicação cefálica ↔ basílica.', badge: 'hot' },
          { label: 'Cefálica', value: 'Superficial, lateral — punção frequente.', badge: 'ok' },
          { label: 'Basílica', value: 'Medial — maior risco de lesão nervosa se mal puncionada.', badge: 'info' },
          { label: 'Artéria', value: 'Nunca alvo de infusão venosa de rotina.', badge: 'warn' },
        ],
        footer_rule: 'Âncora Gama: mediana cubital na fossa.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Alternativa correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: anatomia correta do braço para punção.',
          'Letra A: mediana do cotovelo comunica cefálica e basílica — verdadeiro.',
          'Eliminar B — cefálica é superficial lateral, não profunda posterior.',
          'Eliminar C — basílica é medial, não lateral de primeira escolha.',
          'Eliminar D — artéria braquial não é vaso de infusão EV.',
          'Marcar letra A.',
        ],
        footer_rule: 'Fossa cubital = mediana cubital de acesso fácil.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Inversões anatômicas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ANATOMIA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Cefálica profunda',
            detail: 'Cefálica é superficial e lateral.',
            correct: 'Acesso periférico justamente pela superficialidade.',
          },
          {
            label: 'Letra C — Basílica lateral',
            detail: 'Basílica corre medialmente.',
            correct: 'Confundir lado do braço invalida a alternativa.',
          },
          {
            label: 'Letra D — Artéria braquial',
            detail: 'Puncionar artéria é evento adverso grave.',
            correct: 'Infusão é no sistema venoso — A descreve mediana.',
          },
        ],
        footer_rule: 'Nunca confundir artéria com veia de punção.',
      },
    ],
  },

  'idecan-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1780066938846-2': {
    family: 'conceito',
    guideline: 'Associação região × veias — MS braço/antebraço; mão metacarpianas; MI safena última escolha',
    roi_error: 'associar_regiao_veia_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Associação — região e veias',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Associar região corporal à descrição venosa correta.',
            icon: 'Target',
          },
          {
            label: 'Mão',
            detail: 'Metacarpianas dorsais, cefálica e basílica do dorso da mão.',
            icon: 'Hand',
          },
          {
            label: 'Membro superior',
            detail: 'Braço e antebraço — cefálica, basílica, acessória, intermediária.',
            icon: 'Activity',
          },
          {
            label: 'Membro inferior',
            detail: 'Safena magna — última escolha, não primeira opção de punção.',
            icon: 'MapPin',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca embaralha safena com rede do braço.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mão ≠ braço ≠ perna — cada região tem rede própria.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Três regiões',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'MS', value: 'Cefálica/basílica do braço e antebraço.', badge: 'hot' },
          { label: 'Mão', value: 'Metacarpianas dorsais + ramos do dorso.', badge: 'ok' },
          { label: 'MI', value: 'Safena — opção residual, não preferencial.', badge: 'warn' },
        ],
        footer_rule: 'Sequência correta da prova: 2, 3, 1.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar a associação',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Listar três regiões: mão, membros inferiores, membros superiores.',
          'Safena magna → membros inferiores (última escolha).',
          'Rede do braço/antebraço → membros superiores.',
          'Metacarpianas dorsais → região da mão.',
          'Ordem nas colunas 1–2–3: 2, 3, 1.',
          'Marcar letra A.',
        ],
        footer_rule: 'Associação: perna = safena; braço = grande rede; mão = dorsais.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Embaralhamentos típicos',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSOCIAÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — 2, 1, 3',
            detail: 'Troca mão com membro superior.',
            correct: 'Metacarpianas pertencem à mão, não ao braço.',
          },
          {
            label: 'Letra C — 1, 3, 2',
            detail: 'Safena no membro superior — anatomia impossível.',
            correct: 'Safena é rede do membro inferior.',
          },
          {
            label: 'Letra D — 1, 2, 3',
            detail: 'Ordem linear sem cruzar descrições corretas.',
            correct: 'Cada descrição tem região fixa — só A fecha.',
          },
        ],
        footer_rule: '2,3,1 = MI, MS, mão respectivamente.',
      },
    ],
  },

  'metrocapital-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-3': {
    family: 'vf',
    guideline: 'Seleção de veia — medianas frequentes; evitar cicatriz de queimadura; não bater na veia',
    roi_error: 'vf_selecao_sitio_puncao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Seleção do sítio — V/F',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'I',
            detail: 'Basílica mediana e cefálica são veias frequentes na coleta — V.',
            icon: 'CheckCircle',
          },
          {
            label: 'II',
            detail: 'Cicatriz de queimadura é sítio indicado — F (evitar área lesionada).',
            icon: 'XCircle',
          },
          {
            label: 'III',
            detail: 'Não bater na veia com os dedos na seleção — V.',
            icon: 'CheckCircle',
          },
          {
            label: 'Técnica',
            detail: 'Palpar suavemente; evitar trauma e áreas sem condição.',
            icon: 'Hand',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca marca cicatriz como “indicada” ou libera batida na veia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sítio íntegro, palpação delicada, medianas preferidas.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Critérios de seleção',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Preferência', value: 'Medianas/cefálica na fossa — acesso comum.', badge: 'ok' },
          { label: 'Evitar', value: 'Cicatriz, queimadura, infecção, flebite prévia.', badge: 'warn' },
          { label: 'Palpação', value: 'Sem “bater” na veia — trauma desnecessário.', badge: 'hot' },
        ],
        footer_rule: 'Sequência V-F-V = alternativa A.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar V-F-V',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Item I: medianas/cefálica frequentes — Verdadeiro.',
          'Item II: cicatriz de queimadura indicada — Falso (evitar).',
          'Item III: não bater na veia — Verdadeiro.',
          'Sequência I-II-III: V-F-V.',
          'Marcar letra A.',
        ],
        footer_rule: 'Integridade da pele é pré-requisito do sítio.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Itens que mudam a sequência',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F SÍTIO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'B — V-F-F',
            detail: 'Aceita bater na veia (III falso).',
            correct: 'Palpação deve ser gentil — III é verdadeiro.',
          },
          {
            label: 'C — V-V-F',
            detail: 'Trata cicatriz de queimadura como indicada (II verdadeiro).',
            correct: 'Área queimada não é sítio de punção.',
          },
          {
            label: 'E — F-V-V',
            detail: 'Nega veias medianas frequentes (I falso).',
            correct: 'I é verdadeiro — fossa antecubital é clássica.',
          },
        ],
        footer_rule: 'V-F-V só aparece na letra A.',
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
    console.log(`[handcraft:puncao-g05] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g05] total=${ok}`);
}

main();
