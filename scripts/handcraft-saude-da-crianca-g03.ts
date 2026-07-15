#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-crianca-g03 (8 slugs).
 *
 *   npx tsx scripts/handcraft-saude-da-crianca-g03.ts
 *   npm run validate:goldens -- --lote=saude-da-crianca-g03 --strict
 *   npm run audit:questao-readiness -- --lote=saude-da-crianca-g03 --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';

const LOTE = 'saude-da-crianca-g03';
const SUBTOPICO = 'Saúde da Criança';
const REVIEWED = '2026-07-15';

const MS_CADERNETA_SOURCE = {
  id: SAUDE_CRIANCA_MS.id,
  tier: 'A' as const,
  issuer: SAUDE_CRIANCA_MS.issuer,
  title: SAUDE_CRIANCA_MS.title,
  year: SAUDE_CRIANCA_MS.year,
  url: SAUDE_CRIANCA_MS.url,
  covers: [
    'sinais vitais pediátricos',
    'urgência pediátrica',
    'aleitamento materno',
    'reanimação neonatal',
    'sons respiratórios',
    'imunidade passiva',
    'estrabismo Hirschberg',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'crianca_sinais_vitais'
  | 'crianca_generico'
  | 'crianca_aleitamento_nutricao'
  | 'crianca_apgar_reanimacao'
  | 'crianca_desenvolvimento';

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  branch: Branch;
  guideline: string;
  sources?: (typeof MS_CADERNETA_SOURCE)[];
  exam_vs_current?: string;
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
    },
    sources: pack.sources ?? [MS_CADERNETA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/deixamais/gi, 'deixa mais')
    .replace(/essencialidentificar/gi, 'essencial identificar')
    .replace(/necessáriosnecessários/gi, 'necessários')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1779344182672-8': {
    family: 'protocolo',
    branch: 'crianca_sinais_vitais',
    guideline: 'Protocolo SAMU 192 — aferição de FC (BP11 SBV)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC — protocolo SAMU',
        meta: slideMeta,
        items: [
          { label: 'Protocolo SAMU', detail: 'BP11 — Suporte Básico de Vida: aferição de frequência cardíaca.', icon: 'HeartPulse' },
          { label: 'Parada cardíaca', detail: 'Suspeita de PCR ou parada cardiorrespiratória — aferir FC.', icon: 'AlertTriangle' },
          { label: 'Instabilidade', detail: 'Quadro instável do paciente exige medida imediata de FC.', icon: 'Activity' },
          { label: 'Registro', detail: 'Anotar dados na ficha — oximetria não dispensa FC.', icon: 'ClipboardList' },
        ],
        footer_rule: 'Instabilidade/PCR → aferir FC sem hesitar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: Protocolo Samu 192 — SBV BP11 aferição de sinais vitais (frequência cardíaca).',
          'Suspeita de parada cardíaca ou parada cardiorrespiratória.',
          'Presença de instabilidade do quadro do paciente.',
          'Eliminar D: não registrar na ficha — documentação obrigatória.',
          'Eliminar E: dispensar FC sem oximetria — medidas independentes.',
          'Testar A: aferir FC na suspeita de PCR ou instabilidade.',
          'Marcar letra A.',
        ],
        footer_rule: 'PCR/instabilidade = aferir FC',
      },
      {
        type: 'golden_rule',
        slide_title: 'FC — quando aferir',
        meta: slideMeta,
        content: 'SAMU BP11',
        rows: [
          { label: 'Obrigatório', value: 'PCR ou instabilidade hemodinâmica', badge: 'hot', emphasis: 'highlight' },
          { label: 'Neonato ref.', value: 'FC ~100–160 bpm (referência)', badge: 'info' },
          { label: 'Registro', value: 'Anotar na ficha do paciente', badge: 'ok' },
          { label: 'Oximetria', value: 'Não dispensa aferição de FC', badge: 'warn' },
        ],
        footer_rule: 'Instabilidade manda medir — não só decorar normalidade',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FC SAMU',
        items: [
          {
            label: 'Letra B — valores normais adulto',
            detail: 'Referência etária não responde ao protocolo de conduta.',
            correct: 'Gabarito A: aferir em PCR ou instabilidade.',
          },
          {
            label: 'Letra C — FC neonatal referência',
            detail: 'Dado numérico sem regra de procedimento.',
            correct: 'Protocolo prioriza aferição em parada/instabilidade.',
          },
          {
            label: 'Letra D — sem registro',
            detail: 'Omissão de documentação — conduta incorreta.',
            correct: 'Registrar dados na ficha é parte do atendimento.',
          },
          {
            label: 'Letra E — dispensar FC sem oxímetro',
            detail: 'Oximetria não substitui palpação/ausculta de FC.',
            correct: 'Aferir FC independentemente da oximetria.',
          },
        ],
        footer_rule: 'Referência ≠ indicação de aferição',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'educa-pb-enfermagem-semiologia-em-enfermagem-1779563527042-1': {
    family: 'protocolo',
    branch: 'crianca_generico',
    guideline: 'Sinais de alerta pediátrico — quando encaminhar com urgência (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urgência pediátrica — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Marcar o que NÃO exige urgência imediata.', icon: 'Search' },
          { label: 'Urgência real', detail: 'Intoxicação, trauma, dispneia, convulsão.', icon: 'Ambulance' },
          { label: 'Febre isolada', detail: 'Febre axilar >37,8 °C sozinha — nem sempre urgência.', icon: 'Thermometer' },
          { label: 'Pegadinha', detail: 'Banca mistura febre com sinais de gravidade.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'EXCETO: febre isolada ≠ sempre urgência',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO: quando levar criança ao pediatra com urgência.',
          'B — intoxicação: urgência → eliminar.',
          'C — acidentes graves: urgência → eliminar.',
          'D — dispneia/falta de ar: urgência → eliminar.',
          'E — convulsão/alteração consciência: urgência → eliminar.',
          'A — febre >37,8 °C ou sensação febril isolada: NÃO é o padrão de urgência listado.',
          'Marcar letra A.',
        ],
        footer_rule: 'EXCETO = febre isolada (A)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Alerta pediátrico',
        meta: slideMeta,
        content: 'URGÊNCIA × FEBRE',
        rows: [
          { label: 'Urgente', value: 'Convulsão, dispneia, trauma, intoxicação', badge: 'hot' },
          { label: 'Febre isolada', value: 'Avaliar contexto — nem sempre PS imediato', badge: 'ok' },
          { label: 'Lactente <3 meses', value: 'Febre = alerta — regra especial', badge: 'warn' },
          { label: 'EXCETO', value: 'Febre sozinha é a exceção nesta questão', badge: 'info' },
        ],
        footer_rule: 'Sinais de gravidade mandam urgência',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO URGÊNCIA',
        items: [
          {
            label: 'Letra B — intoxicação',
            detail: 'Intoxicação exige atendimento urgente.',
            correct: 'É sinal de urgência — não é o EXCETO.',
          },
          {
            label: 'Letra C — queimaduras e engasgos',
            detail: 'Acidentes graves requerem emergência.',
            correct: 'Trauma/acidente = urgência — eliminar no EXCETO.',
          },
          {
            label: 'Letra D — dispneia',
            detail: 'Dificuldade respiratória é emergência.',
            correct: 'Falta de ar manda urgência — não é exceção.',
          },
          {
            label: 'Letra E — convulsão',
            detail: 'Convulsão e alteração de consciência = urgência.',
            correct: 'Neurológico grave — alternativa com sinais de alerta.',
          },
        ],
        footer_rule: 'B–E são urgentes; A é o EXCETO',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009379028-4': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'AME — OMS/MS até 6 meses',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alimento exclusivo 6 meses',
        meta: slideMeta,
        items: [
          { label: 'Política OMS/MS', detail: 'Só leite materno até 6 meses — sem água, chá, suco.', icon: 'Baby' },
          { label: 'Nutrição completa', detail: 'Leite materno supre necessidades no 1º semestre.', icon: 'Milk' },
          { label: 'Introdução', detail: 'Alimentos complementares a partir dos 6 meses.', icon: 'Utensils' },
          { label: 'Pegadinha', detail: 'Água ou “A e D corretas” — distrator clássico.', icon: 'AlertTriangle' },
        ],
        footer_rule: '6 meses exclusivo = só leite materno',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alimento exclusivo até 6 meses (OMS/MS).',
          'Eliminar A: água — não no 1º semestre em AME.',
          'Eliminar B: banana — alimento sólido.',
          'Eliminar C: feijão — complementar precoce.',
          'Eliminar E: A e D — água não é correta.',
          'Testar D: leite materno.',
          'Marcar letra D.',
        ],
        footer_rule: 'D = leite materno exclusivo',
      },
      {
        type: 'golden_rule',
        slide_title: 'AME — referência',
        meta: slideMeta,
        content: '6 MESES EXCLUSIVO',
        rows: [
          { label: 'AME', value: 'Só leite materno até 6 meses', badge: 'hot', emphasis: 'highlight' },
          { label: 'Proibido', value: 'Água, chá, suco, fórmula rotineira', badge: 'warn' },
          { label: 'Após 6 meses', value: 'Alimentação complementar + leite', badge: 'ok' },
          { label: 'OMS/MS', value: 'Política nacional de aleitamento', badge: 'info' },
        ],
        footer_rule: 'Nada além do leite nos 6 primeiros meses',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AME 6 MESES',
        items: [
          {
            label: 'Letra A — água',
            detail: 'Água não faz parte do AME exclusivo.',
            correct: 'Até 6 meses: somente leite materno — sem água.',
          },
          {
            label: 'Letra B — banana',
            detail: 'Fruta é alimentação complementar — após 6 meses.',
            correct: 'Exclusivo = leite materno — não frutas.',
          },
          {
            label: 'Letra C — feijão',
            detail: 'Leguminosa introduzida na fase complementar.',
            correct: 'AME não inclui alimentos sólidos.',
          },
          {
            label: 'Letra E — A e D',
            detail: 'Combina água com leite materno.',
            correct: 'Água invalida a alternativa — só D é correta.',
          },
        ],
        footer_rule: 'Água no 1º semestre = pegadinha',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fepese-geral-saude-da-crianca-1777104415052-9': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Benefícios do aleitamento materno para mãe e criança (MS/OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Benefícios da amamentação',
        meta: slideMeta,
        items: [
          { label: 'Para a mãe', detail: 'Reduz câncer de mama, útero, ovário; diabetes e obesidade.', icon: 'Heart' },
          { label: 'Para o bebê', detail: 'Proteção infecciosa e nutrição completa.', icon: 'Baby' },
          { label: 'Pega', detail: 'Avaliar pega previne fissuras — lábios e aréola.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'AME até 4 meses ou leite “fraco” com fórmula.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Amamentar protege mãe e filho a longo prazo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre aleitamento materno.',
          'Eliminar A: exclusivo até 4 meses — MS/OMS é 6 meses.',
          'Eliminar B: leite fraco → fórmula — mito.',
          'Eliminar C: alternar mamas a cada 15 min — rigidez desnecessária.',
          'Eliminar E: pega — parcialmente correta, mas D é mais abrangente na prova.',
          'Testar D: benefícios para mãe (câncer, diabetes, obesidade).',
          'Marcar letra D.',
        ],
        footer_rule: 'D = benefícios maternos comprovados',
      },
      {
        type: 'golden_rule',
        slide_title: 'AME — benefícios',
        meta: slideMeta,
        content: 'MAE E FILHO',
        rows: [
          { label: 'Mãe', value: '↓ câncer mama/útero/ovário; ↓ DM e obesidade', badge: 'hot' },
          { label: 'Bebê', value: 'Imunidade passiva + nutrição', badge: 'ok' },
          { label: 'Duração', value: 'Exclusivo 6 meses; prolongado ≥2 anos', badge: 'info' },
          { label: 'Mito', value: 'Leite materno nunca é “fraco”', badge: 'warn' },
        ],
        footer_rule: '6 meses exclusivo — benefícios duradouros',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ALEITAMENTO',
        items: [
          {
            label: 'Letra A — exclusivo 4 meses',
            detail: 'Prazo inferior ao MS/OMS.',
            correct: 'AME exclusivo até 6 meses — não 4.',
          },
          {
            label: 'Letra B — leite fraco',
            detail: 'Mito clássico de prova.',
            correct: 'Leite materno é suficiente — não indicar fórmula por “fraqueza”.',
          },
          {
            label: 'Letra C — alternar 15 min',
            detail: 'Regra rígida sem evidência.',
            correct: 'Livre demanda — não cronometrar troca de mama.',
          },
          {
            label: 'Letra E — pega adequada',
            detail: 'Verdadeira, mas D é o gabarito da questão.',
            correct: 'Gabarito D: benefícios oncológicos e metabólicos para a mãe.',
          },
        ],
        footer_rule: 'Leite fraco = mito · 6 meses exclusivo',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-5': {
    family: 'protocolo',
    branch: 'crianca_apgar_reanimacao',
    guideline: 'Reanimação neonatal — passos iniciais (SBP/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reanimação neonatal — início',
        meta: slideMeta,
        items: [
          { label: 'Cenário', detail: 'RN com suspeita de asfixia — avaliar respiração e FC.', icon: 'Baby' },
          { label: 'Passos iniciais', detail: 'Secar, aquecer, posicionar VA, estimular.', icon: 'Wind' },
          { label: 'Não rotina', detail: 'Aspiração só se secreção obstrui VA.', icon: 'Syringe' },
          { label: 'Pegadinha', detail: 'Compressão ou VPP imediata sem avaliação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Aquecer + posicionar + estimular antes de VPP',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta inicial na suspeita de asfixia neonatal.',
          'Eliminar A: compressões imediatas — só se FC <60 após VPP.',
          'Eliminar B: aspiração rotineira — não em todos os casos.',
          'Eliminar D: O₂ 100% fluxo alto — não primeira linha.',
          'Eliminar E: VPP em todos — após passos iniciais e avaliação.',
          'Testar C: secar, aquecer, posicionar vias aéreas e estimular.',
          'Marcar letra C.',
        ],
        footer_rule: 'C = passos iniciais da reanimação',
      },
      {
        type: 'golden_rule',
        slide_title: 'RN — primeiros passos',
        meta: slideMeta,
        content: 'REANIMAÇÃO NEONATAL',
        rows: [
          { label: '1º', value: 'Secar e aquecer — prevenir hipotermia', badge: 'hot' },
          { label: '2º', value: 'Posicionar VA (sniffing)', badge: 'ok' },
          { label: '3º', value: 'Estimular — fricção dorsal', badge: 'info' },
          { label: 'Depois', value: 'Avaliar FC/respiração → VPP se necessário', badge: 'warn' },
        ],
        footer_rule: 'Não pular para VPP sem passos iniciais',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — REANIMAÇÃO',
        items: [
          {
            label: 'Letra A — compressões imediatas',
            detail: 'Compressão só após VPP inadequada e FC <60.',
            correct: 'Primeiro: secar, aquecer, posicionar e estimular.',
          },
          {
            label: 'Letra B — aspiração rotineira',
            detail: 'Aspiração não é para todos os RN.',
            correct: 'Aspirar só se secreção obstrui vias aéreas.',
          },
          {
            label: 'Letra D — O₂ 100%',
            detail: 'Oxigênio suplementar não é conduta inicial universal.',
            correct: 'Passos iniciais vêm antes de oxigenoterapia.',
          },
          {
            label: 'Letra E — VPP em todos',
            detail: 'Muitos RN respondem aos passos iniciais.',
            correct: 'VPP se apneia/FC baixa após estimulação — não automaticamente.',
          },
        ],
        footer_rule: 'Sequência: aquecer → posicionar → estimular',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fundatec-enfermagem-semiologia-em-enfermagem-1779563480978-2': {
    family: 'conceito',
    branch: 'crianca_generico',
    guideline: 'Ausculta respiratória pediátrica — sons normais × patológicos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sons respiratórios — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Ausculta pediátrica', detail: 'Técnico identifica sons respiratórios para diagnóstico precoce.', icon: 'Stethoscope' },
          { label: 'Patológicos', detail: 'Estertores, estertores finos e sibilância indicam doença.', icon: 'Wind' },
          { label: 'Fisiológico', detail: 'Murmúrio vesicular — som normal em pulmão sadio.', icon: 'Activity' },
          { label: 'Comando EXCETO', detail: 'Marcar o som que NÃO é relacionado a patologias.', icon: 'Search' },
        ],
        footer_rule: 'Murmúrio vesicular = normal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO: som NÃO relacionado a patologia.',
          'A — estertores: patológico → eliminar.',
          'B — estertores finos: patológico → eliminar.',
          'D — sibilância: patológico (asma/OBSTRUÇÃO) → eliminar.',
          'C — murmúrio vesicular: som normal da ventilação.',
          'Marcar letra C.',
        ],
        footer_rule: 'EXCETO = murmúrio vesicular (C)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ausculta pediátrica',
        meta: slideMeta,
        content: 'SONS RESPIRATÓRIOS',
        rows: [
          { label: 'Normal', value: 'Murmúrio vesicular', badge: 'hot', emphasis: 'highlight' },
          { label: 'Estertores', value: 'Crepitações — pneumonia/edema', badge: 'warn' },
          { label: 'Sibilância', value: 'Obstrução de vias aéreas', badge: 'ok' },
          { label: 'Ronco', value: 'Secreção ou estreitamento', badge: 'info' },
        ],
        footer_rule: 'MV presente = pulmão ventilando',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO AUSCULTA',
        items: [
          {
            label: 'Letra A — estertores',
            detail: 'Crepitações indicam consolidação ou líquido.',
            correct: 'Estertores são patológicos — não é o EXCETO.',
          },
          {
            label: 'Letra B — estertores finos',
            detail: 'Variante de estertores — também patológica.',
            correct: 'Sons adventícios indicam doença — eliminar.',
          },
          {
            label: 'Letra D — sibilância',
            detail: 'Som agudo de obstrução brônquica.',
            correct: 'Sibilância é patológica — asma/bronquiolite.',
          },
        ],
        footer_rule: 'Só murmúrio vesicular é fisiológico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-1': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Imunidade passiva no leite materno (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Imunidade e amamentação',
        meta: slideMeta,
        items: [
          { label: 'AME 6 meses', detail: 'Proteção nutricional e imunológica.', icon: 'Shield' },
          { label: 'Leite materno', detail: 'IgA secretora e anticorpos maternos — passivos.', icon: 'Droplets' },
          { label: 'Passiva', detail: 'Bebê recebe anticorpos prontos — não produz ainda.', icon: 'Baby' },
          { label: 'Pegadinha', detail: 'Confundir passiva com ativa ou inata.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Leite materno = imunidade passiva',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: tipo de imunidade relacionada à amamentação.',
          'Leite materno transfere anticorpos prontos ao lactente.',
          'Eliminar B: ativa — produção própria após exposição/vacina.',
          'Eliminar C: inata — barreiras inespecíficas.',
          'Eliminar D/E: adquirida/celular — categorias amplas.',
          'Testar A: imunidade passiva.',
          'Marcar letra A.',
        ],
        footer_rule: 'A = passiva (anticorpos maternos)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Imunidade no lactente',
        meta: slideMeta,
        content: 'TIPOS DE IMUNIDADE',
        rows: [
          { label: 'Passiva', value: 'Anticorpos maternos via placenta e leite', badge: 'hot' },
          { label: 'Ativa', value: 'Corpo produz após antígeno/vacina', badge: 'ok' },
          { label: 'Colostro', value: 'IgA secretora — proteção mucosa', badge: 'info' },
          { label: 'AME', value: 'Mantém proteção nos 6 primeiros meses', badge: 'warn' },
        ],
        footer_rule: 'Amamentar = passiva · vacinar = ativa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IMUNIDADE',
        items: [
          {
            label: 'Letra B — imunidade ativa',
            detail: 'Bebê ainda não produz anticorpos específicos.',
            correct: 'Leite materno fornece anticorpos prontos — passiva.',
          },
          {
            label: 'Letra C — imunidade inata',
            detail: 'Barreiras inespecíficas (pele, mucosa).',
            correct: 'Anticorpos no leite são imunidade passiva adquirida.',
          },
          {
            label: 'Letra D — adquirida',
            detail: 'Termo genérico — passiva e ativa são subtipos.',
            correct: 'Prova pede passiva — anticorpos transferidos.',
          },
          {
            label: 'Letra E — celular',
            detail: 'Resposta mediada por linfócitos T.',
            correct: 'Leite materno = humoral passiva (IgA, IgG).',
          },
        ],
        footer_rule: 'Passiva = recebe pronto · ativa = produz',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-procedimentos-diversos-1778712203076-3': {
    family: 'conceito',
    branch: 'crianca_desenvolvimento',
    guideline: 'Teste de Hirschberg — rastreio de estrabismo (SBP)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Teste de Hirschberg',
        meta: slideMeta,
        items: [
          { label: 'Objetivo', detail: 'Rastrear desvio ocular (estrabismo) em crianças.', icon: 'Eye' },
          { label: 'Técnica', detail: 'Luz na raiz nasal — observar reflexo nas pupilas.', icon: 'Flashlight' },
          { label: 'Resultado', detail: 'Desvio do reflexo luminoso sugere estrabismo.', icon: 'Target' },
          { label: 'Pegadinha', detail: 'Confundir com Snellen, daltonismo ou fundo de olho.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Hirschberg = reflexo pupilar simétrico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre teste de Hirschberg.',
          'Eliminar A: daltonismo — teste de cores, não Hirschberg.',
          'Eliminar B: acuidade visual — tabelas/Snellen.',
          'Eliminar D: opacidades — teste do reflexo vermelho.',
          'Eliminar E: distância 10–15 cm — técnica incorreta.',
          'Testar C: desvio do reflexo luminoso pode indicar estrabismo.',
          'Marcar letra C.',
        ],
        footer_rule: 'C = desvio do reflexo → estrabismo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Hirschberg — referência',
        meta: slideMeta,
        content: 'RASTREIO OCULAR',
        rows: [
          { label: 'Luz', value: 'Na raiz nasal do paciente', badge: 'ok' },
          { label: 'Normal', value: 'Reflexo simétrico nas pupilas', badge: 'hot' },
          { label: 'Alterado', value: 'Desvio do reflexo — estrabismo', badge: 'warn' },
          { label: 'Não é', value: 'Acuidade, daltonismo ou fundo de olho', badge: 'info' },
        ],
        footer_rule: 'Reflexo assimétrico = encaminhar oftalmologia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIRSCHBERG',
        items: [
          {
            label: 'Letra A — daltonismo',
            detail: 'Teste de Ishihara/placas de cores.',
            correct: 'Hirschberg avalia alinhamento ocular — não percepção de cores.',
          },
          {
            label: 'Letra B — acuidade visual',
            detail: 'Snellen/letras para escolares.',
            correct: 'Hirschberg é rastreio de estrabismo por reflexo pupilar.',
          },
          {
            label: 'Letra D — opacidades',
            detail: 'Teste do reflexo vermelho no RN.',
            correct: 'Opacidades de meios — não é função do Hirschberg.',
          },
          {
            label: 'Letra E — 10–15 cm da raiz nasal',
            detail: 'Distância incorreta para o teste.',
            correct: 'Luz na raiz nasal — desvio do reflexo indica estrabismo.',
          },
        ],
        footer_rule: 'Não confundir testes oftalmológicos',
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
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sc-g03] OK ${slug}`);
  }
  console.log(`[handcraft:sc-g03] total=${ok}`);
}

main();
