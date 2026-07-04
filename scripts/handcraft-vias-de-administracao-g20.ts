#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g20 (8 slugs P2 via_generico INCORRETA/EXCETO).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g20.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g20';
const SUBTOPICO = 'Vias de Administração';
const BRANCH = 'via_generico';
const REVIEWED = '2026-07-03';

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
    'via subcutânea',
    'via intradérmica',
    'técnica IM',
    'sítios SC',
    'indicação por via',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e absorção',
  year: 2020,
  covers: ['absorção por via', '1ª passagem hepática', 'técnica de punção', 'apresentação farmacêutica'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'certo_errado';
  guideline: string;
  roi_error?: string;
  cluster?: string;
  sources?: (typeof COFEN_SOURCE)[];
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  const branch =
    slug === 'gama-enfermagem-vias-de-administracao-1778968629127-2'
      ? 'via_vf_absorcao'
      : BRANCH;
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      cluster: pack.cluster ?? 'INCORRETA / EXCETO',
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'cetrede-enfermagem-vias-de-administracao-1776056391403-4': {
    family: 'certo_errado',
    guideline: 'Vias injetáveis — absorção, indicação e técnica (Potter/Perry e provas CETREDE)',
    roi_error: 'inverter_velocidade_vascularizacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vias injetáveis — mapa INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'INCORRETA sobre vias injetáveis — quatro afirmativas verdadeiras; uma inverte absorção ou técnica.', icon: 'Target' },
          { label: 'Trilho de absorção', detail: 'IV imediata → IM rápida → SC lenta. Suprimento sanguíneo maior acelera a absorção — a banca inverte na letra A.', icon: 'TrendingUp' },
          { label: 'Via intravenosa (IV)', detail: 'Soluções irritantes e emergências — evita lesão em tecido SC ou muscular.', icon: 'Syringe' },
          { label: 'Via subcutânea (SC)', detail: 'Medicamentos proteicos (insulina, heparina) — destruídos no TGI se administrados por via oral.', icon: 'Layers' },
          { label: 'Via intramuscular (IM)', detail: 'Músculo abaixo da pele e adiposo — agulha mais longa que na SC para atingir o alvo.', icon: 'Activity' },
          { label: 'Via intratecal', detail: 'Agulha entre vértebras lombares no espaço perimedular — rota especial para medicação no SNC.', icon: 'Bone' },
          { label: 'Padrão CETREDE', detail: 'Mistura definições corretas (B–E) com inversão vascularização × tempo de absorção (A).', icon: 'GitCompare' },
        ],
        footer_rule: 'INCORRETA = achar a falsa — teste absorção antes de técnica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: cinco alternativas + INCORRETA — quatro verdadeiras, uma falsa.',
          'Testar B: IV para soluções irritantes que lesionariam SC/IM → correta → eliminar.',
          'Testar C: intratecal lombar no espaço perimedular → correta → eliminar.',
          'Testar D: SC para proteicos destruídos no TGI se oral → correta → eliminar.',
          'Testar E: IM exige agulha mais longa por atravessar pele e adiposo → correta → eliminar.',
          'Testar A: maior suprimento sanguíneo = mais tempo para absorver → FALSO — mais vascularização acelera.',
          'Confirmar: só A inverte relação sangue × velocidade.',
          'Marcar A.',
          'Fixação: em INCORRETA de vias, valide perfil de absorção antes de aceitar definições técnicas.',
        ],
        footer_rule: 'Roteiro: B → C → D → E → A → marcar inversão de absorção',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias injetáveis',
        meta: slideMeta,
        content: 'VIAS INJETÁVEIS — ABSORÇÃO E INDICAÇÃO',
        rows: [
          { label: 'Intravenosa (IV)', value: 'Imediata — irritantes e emergências', badge: 'info' },
          { label: 'Intramuscular (IM)', value: 'Rápida — agulha longa; músculo vascularizado', badge: 'ok' },
          { label: 'Subcutânea (SC)', value: 'Lenta — proteicos (insulina, heparina)', badge: 'warn' },
          { label: 'Intratecal', value: 'Lombar, espaço perimedular — SNC', badge: 'info' },
          { label: 'Vascularização × absorção', value: 'Mais suprimento sanguíneo → absorção mais rápida', emphasis: 'alert', badge: 'hot' },
          { label: 'Mnemônico', value: 'IV imediata > IM rápida > SC lenta' },
        ],
        footer_rule: 'Mais vascularização acelera — não retarda',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CETREDE — VIAS INJETÁVEIS',
        items: [
          { label: 'Letra B — IV e irritantes', detail: 'Parece detalhe de farmácia, mas descreve indicação clássica da IV.', correct: 'Afirmativa correta: IV evita lesão em SC/IM para soluções irritantes.' },
          { label: 'Letra C — intratecal', detail: 'Termo técnico assusta, mas anatomia lombar perimedular está certa.', correct: 'Afirmativa correta: intratecal = agulha entre vértebras lombares no espaço perimedular.' },
          { label: 'Letra D — SC e proteicos', detail: 'Liga insulina/heparina — reforça indicação real da SC.', correct: 'Afirmativa correta: proteicos destruídos no TGI — SC evita digestão.' },
          { label: 'Letra E — agulha IM', detail: 'Detalhe de técnica que justifica comprimento da agulha na IM.', correct: 'Afirmativa correta: IM atravessa pele e adiposo — agulha mais longa que na SC.' },
          { label: 'Letra A — suprimento sanguíneo', detail: 'Usa fisiologia plausível, mas inverte: mais sangue = mais lento.', correct: 'INCORRETA: maior suprimento sanguíneo acelera a absorção, não a retarda.' },
        ],
        footer_rule: 'Transferência: desconfie de inversão absorção × vascularização',
      },
    ],
  },

  'educa-pb-enfermagem-vias-de-administracao-1776056366158-4': {
    family: 'certo_errado',
    guideline: 'COFEN/Potter — via oral é enteral (não parenteral); IV, ID, intratecal e inalatória',
    roi_error: 'oral_classificada_parenteral',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Perfis de via — mapa INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'INCORRETA sobre meios de administração — uma alternativa erra classificação ou definição.', icon: 'Target' },
          { label: 'Via oral (enteral)', detail: 'Mais usada, segura e econômica — comprimidos, cápsulas, líquidos. Nunca é parenteral.', icon: 'Pill' },
          { label: 'Erro ROI — oral parenteral', detail: 'Letra A classifica oral como parenteral — inverte o eixo enteral × parenteral.', icon: 'AlertTriangle' },
          { label: 'Via IV', detail: 'Direto na corrente sanguínea — doses únicas ou infusão contínua, volumes elevados.', icon: 'Syringe' },
          { label: 'Via intradérmica', detail: 'Derme — testes alérgicos, diagnósticos e algumas vacinas.', icon: 'Layers' },
          { label: 'Via inalatória', detail: 'Mucosa nasal a pulmões — efeito local ou sistêmico, doses pequenas, absorção rápida.', icon: 'Wind' },
        ],
        footer_rule: 'Enteral ≠ parenteral — oral nunca é parenteral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: INCORRETA sobre vias de administração.',
          'Testar B: IV direto na corrente sanguínea, infusão contínua → correta → eliminar.',
          'Testar C: intradérmica na derme, testes e vacinas → correta → eliminar.',
          'Testar D: intratecal subaracnóidea, contorna barreira hematoencefálica → correta → eliminar.',
          'Testar E: inalatória nasal a pulmões, absorção rápida → correta → eliminar.',
          'Testar A: oral segura e econômica, mas “caracterizada como parenteral” → FALSO.',
          'Confirmar: oral é via enteral — parenteral = fora do TGI (IV, IM, SC, ID…).',
          'Marcar A.',
        ],
        footer_rule: 'Oral = enteral → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação de vias',
        meta: slideMeta,
        content: 'ENTERAL × PARENTERAL',
        rows: [
          { label: 'Via oral', value: 'Enteral — atravessa TGI; segura e econômica', badge: 'hot' },
          { label: 'Parenteral', value: 'Fora do TGI — IV, IM, SC, ID, intratecal…', badge: 'ok' },
          { label: 'Intravenosa', value: 'Acesso direto à circulação — infusão possível', badge: 'info' },
          { label: 'Intradérmica', value: 'Derme — testes cutâneos e vacinas', badge: 'ok' },
          { label: 'Inalatória', value: 'Mucosa respiratória — absorção rápida', badge: 'info' },
        ],
        footer_rule: 'Oral nunca é parenteral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS EDUCA PB — CLASSIFICAÇÃO',
        items: [
          { label: 'Letra B — IV', detail: 'Definição técnica longa, mas correta sobre acesso venoso.', correct: 'Afirmativa correta: IV administra direto na corrente sanguínea.' },
          { label: 'Letra C — intradérmica', detail: 'Cita derme e testes alérgicos — perfil real da via.', correct: 'Afirmativa correta: ID na derme para testes e vacinas.' },
          { label: 'Letra D — intratecal', detail: 'Descreve espaço subaracnóideo e barreira hematoencefálica.', correct: 'Afirmativa correta: intratecal alcança SNC contornando a BHE.' },
          { label: 'Letra E — inalatória', detail: 'Trajeto nasal-pulmonar e absorção rápida — verdadeiro.', correct: 'Afirmativa correta: inalatória permite doses pequenas com absorção rápida.' },
          { label: 'Letra A — oral parenteral', detail: 'Elogia a oral corretamente, mas fecha com classificação errada.', correct: 'INCORRETA: via oral é enteral, não parenteral.' },
        ],
        footer_rule: 'Última frase de A invalida toda a alternativa',
      },
    ],
  },

  'educa-pb-enfermagem-vias-de-administracao-1776056374837-4': {
    family: 'certo_errado',
    guideline: 'COFEN/Potter — IM promove absorção rápida; sublingual evita 1ª passagem; transdérmica liberação contínua',
    roi_error: 'im_evitar_absorcao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Perfis de absorção — mapa INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'INCORRETA sobre vias — quatro perfis corretos; uma inverte finalidade da via.', icon: 'Target' },
          { label: 'Sublingual', detail: 'Absorção rápida pela mucosa oral — reduz 1ª passagem hepática inicial.', icon: 'Droplets' },
          { label: 'Intravenosa', detail: 'Ação imediata — medicamento já na circulação.', icon: 'Zap' },
          { label: 'Transdérmica', detail: 'Adesivo libera fármaco de forma contínua e controlada pela pele.', icon: 'Bandage' },
          { label: 'Via retal', detail: 'Acetaminofeno, diazepam, laxantes — irritantes em supositório costumam ir para injetável.', icon: 'Pill' },
          { label: 'Erro ROI — IM evita absorção', detail: 'Letra E diz que IM serve para evitar absorção — inverte o objetivo da via parenteral.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'IM absorve — não evita absorção',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: INCORRETA sobre perfis de via.',
          'Testar A: sublingual rápida, menor passagem hepática inicial → correta → eliminar.',
          'Testar B: IV ação imediata na corrente sanguínea → correta → eliminar.',
          'Testar C: transdérmica liberação contínua pela pele → correta → eliminar.',
          'Testar D: retal com exemplos e irritantes em supositório → correta → eliminar.',
          'Testar E: IM para evitar absorção pelo organismo → FALSO — IM promove absorção muscular rápida.',
          'Confirmar: parenteral busca absorção (ou acesso direto), não a evita.',
          'Marcar E.',
        ],
        footer_rule: 'IM = absorção rápida → E é a falsa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — finalidade por via',
        meta: slideMeta,
        content: 'VIAS — ABSORÇÃO E OBJETIVO',
        rows: [
          { label: 'Sublingual', value: 'Rápida · menor 1ª passagem hepática', badge: 'ok' },
          { label: 'Intravenosa', value: 'Imediata — já na circulação', badge: 'hot' },
          { label: 'Transdérmica', value: 'Liberação contínua pela pele', badge: 'info' },
          { label: 'Retal', value: 'Absorção retal — exemplos: paracetamol, diazepam', badge: 'ok' },
          { label: 'Intramuscular', value: 'Absorção rápida no músculo vascularizado', emphasis: 'alert', badge: 'hot' },
        ],
        footer_rule: 'Parenteral absorve ou injeta direto — não “evita” absorção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS EDUCA PB — ABSORÇÃO',
        items: [
          { label: 'Letra A — sublingual', detail: 'Descreve bypass parcial hepático — verdadeiro.', correct: 'Afirmativa correta: sublingual absorve rápido e reduz passagem hepática inicial.' },
          { label: 'Letra B — IV imediata', detail: 'Definição clássica de acesso venoso.', correct: 'Afirmativa correta: IV proporciona ação imediata na circulação.' },
          { label: 'Letra C — transdérmica', detail: 'Perfil de adesivo terapêutico — verdadeiro.', correct: 'Afirmativa correta: transdérmica libera medicamento de forma contínua.' },
          { label: 'Letra D — retal', detail: 'Exemplos clínicos e irritantes em supositório — coerente.', correct: 'Afirmativa correta: retal admite paracetamol, diazepam; irritantes vão para injetável.' },
          { label: 'Letra E — IM evita absorção', detail: 'Inverte finalidade — IM existe para absorção muscular.', correct: 'INCORRETA: IM promove absorção rápida, não a evita.' },
        ],
        footer_rule: 'E troca “promover absorção” por “evitar”',
      },
    ],
  },

  'fau-unicentro-enfermagem-vias-de-administracao-1776056357082-6': {
    family: 'certo_errado',
    guideline: 'COFEN — sítios SC: braço, abdome, coxa anterior/lateral; gastrocnêmio é sítio IM',
    roi_error: 'sitio_sc_im_confusao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítios SC — mapa EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'Locais para SC, EXCETO — quatro sítios clássicos de hipoderme; um pertence à IM.', icon: 'Target' },
          { label: 'Face externa do braço', detail: 'Sítio SC clássico — tecido adiposo do braço.', icon: 'Hand' },
          { label: 'Abdome', detail: 'Entre rebordos costais e cristas ilíacas — SC frequente (insulina).', icon: 'Circle' },
          { label: 'Coxa anterior e externa', detail: 'Face anterior e externa da coxa — hipoderme adequada para SC.', icon: 'Footprints' },
          { label: 'Pegadinha — gastrocnêmio medial', detail: 'Região medial da panturrilha (gastrocnêmio) é alvo de IM, não de SC — banca mistura sítio muscular com hipoderme.', icon: 'AlertTriangle' },
          { label: 'Técnica SC', detail: 'Pinça de pele, ângulo 45°–90° conforme protocolo — tecido adiposo subcutâneo.', icon: 'Syringe' },
        ],
        footer_rule: 'Gastrocnêmio = IM · SC fica em braço, abdome e coxa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sítios SC, EXCETO — quatro são hipoderme, um é músculo.',
          'Testar A: face superior externa do braço → sítio SC → eliminar.',
          'Testar B: face externa da coxa → sítio SC → eliminar.',
          'Testar C: abdome entre costelas e cristas ilíacas → sítio SC → eliminar.',
          'Testar D: região anterior da coxa → sítio SC → eliminar.',
          'Testar E: região medial gastrocnêmica → músculo da panturrilha, típico de IM → EXCEÇÃO.',
          'Confirmar: panturrilha medial não é sítio SC de prova.',
          'Marcar E.',
        ],
        footer_rule: 'Panturrilha = IM → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios SC',
        meta: slideMeta,
        content: 'SÍTIOS SUBCUTÂNEOS CLÁSSICOS',
        rows: [
          { label: 'Braço', value: 'Face superior externa — adiposo', badge: 'ok' },
          { label: 'Abdome', value: 'Entre rebordos costais e cristas ilíacas', badge: 'ok' },
          { label: 'Coxa', value: 'Anterior e face externa — hipoderme', badge: 'ok' },
          { label: 'Não é SC', value: 'Gastrocnêmio medial — sítio IM (panturrilha)', emphasis: 'alert', badge: 'hot' },
          { label: 'Mnemônico', value: 'SC = braço · abdome · coxa — não panturrilha' },
        ],
        footer_rule: 'Gastrocnêmio medial → punção IM',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FAU — SÍTIOS SC',
        items: [
          { label: 'Letra A — braço', detail: 'Sítio clássico de insulina e heparina SC.', correct: 'Afirmativa correta: face externa superior do braço é sítio SC.' },
          { label: 'Letra B — coxa externa', detail: 'Hipoderme lateral da coxa — SC válido.', correct: 'Afirmativa correta: face externa da coxa admite SC.' },
          { label: 'Letra C — abdome', detail: 'Região abdominal delimitada — SC frequente.', correct: 'Afirmativa correta: abdome entre costelas e cristas ilíacas é sítio SC.' },
          { label: 'Letra D — coxa anterior', detail: 'Face anterior da coxa — adiposo adequado.', correct: 'Afirmativa correta: região anterior da coxa é sítio SC.' },
          { label: 'Letra E — gastrocnêmio medial (pegadinha)', detail: 'Panturrilha medial é músculo gastrocnêmio — mesma pegadinha do mapa: sítio IM, não hipoderme SC.', correct: 'EXCEÇÃO: região medial gastrocnêmica é sítio IM, não SC.' },
        ],
        footer_rule: 'EXCETO SC: panturrilha pertence à IM',
      },
    ],
  },

  'fundatec-enfermagem-vias-de-administracao-1778968666352-8': {
    family: 'certo_errado',
    guideline: 'COFEN — IM 90° perpendicular; vasto lateral/deltoide volumes menores; aspiração opcional conforme protocolo',
    roi_error: 'angulo_im_45_sc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica IM — mapa INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'INCORRETA sobre técnica IM — quatro condutas plausíveis; uma erra ângulo ou volume.', icon: 'Target' },
          { label: 'Ordem de sítios', detail: 'Vasto lateral → glúteo → deltoide (exceto vacinas que priorizam deltoide).', icon: 'ListOrdered' },
          { label: 'Aspiração', detail: 'Após inserir agulha, aspirar para verificar punção vascular — prática tradicional de prova.', icon: 'Search' },
          { label: 'Erro ROI — ângulo 45° a 90°', detail: 'Letra C mistura faixa de SC (45°) com IM — técnica IM é 90° perpendicular.', icon: 'AlertTriangle' },
          { label: 'Volumes', detail: 'Glúteo e vasto lateral toleram até ~5 mL — deltoide bem menos.', icon: 'Droplets' },
          { label: 'Indicação IM', detail: 'Suspensões aquosas e oleosas — absorção em médio/longo prazo no músculo.', icon: 'Syringe' },
        ],
        footer_rule: 'IM = 90° · 45° é SC',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: INCORRETA sobre administração IM.',
          'Testar A: ordem vasto → glúteo → deltoide (exceto vacina) → correta → eliminar.',
          'Testar B: aspiração após introdução para evitar punção vascular → correta → eliminar.',
          'Testar D: glúteo e vasto lateral até 5 mL → correta → eliminar.',
          'Testar E: suspensões aquosas/oleosas, absorção prolongada → correta → eliminar.',
          'Testar C: bisel para cima e ângulo 45° a 90° → FALSO — IM exige 90°; 45° é SC.',
          'Confirmar: faixa 45°–90° invalida técnica IM.',
          'Marcar C.',
        ],
        footer_rule: '45° na IM = pegadinha → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica IM',
        meta: slideMeta,
        content: 'IM — ÂNGULO E VOLUME',
        rows: [
          { label: 'Ângulo IM', value: '90° perpendicular ao músculo', emphasis: 'alert', badge: 'hot' },
          { label: 'Ângulo SC', value: '45° (ou 90° pinçado) — não confundir com IM', badge: 'warn' },
          { label: 'Bisel', value: 'Para cima — padrão de punção', badge: 'ok' },
          { label: 'Volume glúteo/vasto', value: 'Até ~5 mL em adulto', badge: 'info' },
          { label: 'Aspiração', value: 'Verificar retorno sanguíneo antes de injetar', badge: 'ok' },
        ],
        footer_rule: 'IM não admite faixa 45°–90° como técnica correta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FUNDATEC — TÉCNICA IM',
        items: [
          { label: 'Letra A — ordem de sítios', detail: 'Prioriza vasto lateral — conduta de prova.', correct: 'Afirmativa correta: vasto lateral primeiro, depois glúteo e deltoide.' },
          { label: 'Letra B — aspiração', detail: 'Técnica clássica de segurança na IM.', correct: 'Afirmativa correta: aspirar após inserir para evitar injeção intravascular.' },
          { label: 'Letra D — volume 5 mL', detail: 'Limite plausível para glúteo e vasto lateral.', correct: 'Afirmativa correta: glúteo e vasto lateral toleram até 5 mL.' },
          { label: 'Letra E — suspensões oleosas', detail: 'Perfil farmacêutico típico da IM.', correct: 'Afirmativa correta: IM para suspensões com absorção prolongada.' },
          { label: 'Letra C — ângulo 45° a 90°', detail: 'Mistura técnica SC com IM em uma frase.', correct: 'INCORRETA: IM exige 90° perpendicular — 45° pertence à SC.' },
        ],
        footer_rule: 'C é a única que erra ângulo de punção',
      },
    ],
  },

  'gama-enfermagem-vias-de-administracao-1778968629127-2': {
    family: 'conceito',
    guideline: 'Potter/Perry — via oral: absorção no TGI; 1ª passagem hepática no fígado; não partir drágeas/cápsulas',
    roi_error: 'via_oral_trajeto_metabolismo',
    cluster: 'Certo ou errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via oral — mapa CORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'Assinale a CORRETA sobre via oral — três distratores erram trajeto, metabolismo ou manipulação.', icon: 'Target' },
          { label: 'Absorção TGI', detail: 'Medicamentos orais são absorvidos pelo trato gastrointestinal — núcleo da via enteral.', icon: 'Pill' },
          { label: 'Erro B — ordem faringe/esôfago', detail: 'Inverte sequência anatômica: oral → faringe → esôfago → estômago.', icon: 'GitCompare' },
          { label: 'Erro C — pâncreas e 2ª passagem', detail: '1ª passagem hepática ocorre no fígado via sistema porta — não no pâncreas.', icon: 'AlertTriangle' },
          { label: 'Erro D — partir drágeas', detail: 'Drágeas e cápsulas de liberação modificada não devem ser partidas sem orientação.', icon: 'Ban' },
        ],
        footer_rule: 'Oral = absorção no TGI — gabarito enxuto (A)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa CORRETA sobre via oral.',
          'Testar A: absorvidos pelo trato gastrointestinal → VERDADEIRO e enxuto.',
          'Testar B: passa esôfago antes da faringe → FALSO — ordem anatômica invertida.',
          'Testar C: metabolizado pelo pâncreas, “2ª passagem” → FALSO — 1ª passagem hepática no fígado.',
          'Testar D: drágeas/cápsulas devem ser partidas → FALSO — manipulação indevida.',
          'Confirmar: só A descreve corretamente sem erro embutido.',
          'Marcar A.',
        ],
        footer_rule: 'A é correta e limpa → marcar A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — via oral',
        meta: slideMeta,
        content: 'VIA ORAL — TRAJETO E METABOLISMO',
        rows: [
          { label: 'Absorção', value: 'Trato gastrointestinal — via enteral', badge: 'hot' },
          { label: 'Trajeto', value: 'Boca → faringe → esôfago → estômago → intestino', badge: 'ok' },
          { label: '1ª passagem hepática', value: 'Fígado via sistema porta — reduz biodisponibilidade', badge: 'warn' },
          { label: 'Drágeas/cápsulas', value: 'Não partir sem prescrição — liberação modificada', badge: 'warn' },
          { label: 'Dose', value: 'Seguir prescrição rigorosamente', badge: 'info' },
        ],
        footer_rule: 'Fígado metaboliza — não o pâncreas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS GAMA — VIA ORAL',
        items: [
          { label: 'Letra B — trajeto digestivo', detail: 'Texto longo com esôfago antes da faringe.', correct: 'Incorreta: sequência é faringe → esôfago, não o contrário.' },
          { label: 'Letra C — pâncreas', detail: 'Cita metabolismo pancreático e “2ª passagem”.', correct: 'Incorreta: 1ª passagem hepática ocorre no fígado, não no pâncreas.' },
          { label: 'Letra D — partir comprimidos', detail: 'Mistura verdade (dose certa) com erro (partir drágeas).', correct: 'Incorreta: drágeas e cápsulas não devem ser partidas sem orientação.' },
          { label: 'Letra A — absorção TGI', detail: 'Parece simples demais — mas é a única sem erro.', correct: 'Correta: medicamentos orais são absorvidos pelo trato gastrointestinal.' },
        ],
        footer_rule: 'Em CORRETA, a alternativa mais simples costuma ser A',
      },
    ],
  },

  'gualimp-enfermagem-vias-de-administracao-1778968968468-4': {
    family: 'certo_errado',
    guideline: 'COFEN/PNI — intradérmica: testes cutâneos, PPD, algumas vacinas; anticoagulantes são SC',
    roi_error: 'id_anticoagulante_sc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via intradérmica — mapa EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'Procedimentos por via intradérmica, EXCETO — três são ID clássicos; um pertence à SC.', icon: 'Target' },
          { label: 'Imunobiológicos', detail: 'Algumas vacinas aplicadas na derme (ex.: BCG intradérmica).', icon: 'Syringe' },
          { label: 'Teste de sensibilidade', detail: 'Antígeno na derme — leitura de pápula.', icon: 'Search' },
          { label: 'PPD / teste diagnóstico', detail: 'Tuberculose — intradérmica com leitura em 48–72 h.', icon: 'Stethoscope' },
          { label: 'Pegadinha — anticoagulantes na ID', detail: 'Heparina e anticoagulantes → via SC no tecido adiposo; banca inclui na intradérmica.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Anticoagulante = SC · ID = teste e algumas vacinas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: medicações/procedimentos ID, EXCETO.',
          'Testar A: imunobiológicos na derme → procedimento ID → eliminar.',
          'Testar B: teste de sensibilidade → ID clássico → eliminar.',
          'Testar D: PPD diagnóstico → ID → eliminar.',
          'Testar C: anticoagulantes → heparina/enoxaparina são SC, não intradérmicos → EXCEÇÃO.',
          'Confirmar: anticoagulante não se aplica na derme.',
          'Marcar C.',
        ],
        footer_rule: 'Anticoagulante → SC → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — via intradérmica',
        meta: slideMeta,
        content: 'INTRADÉRMICA × SUBCUTÂNEA',
        rows: [
          { label: 'Intradérmica', value: 'Derme — testes cutâneos, PPD, algumas vacinas', badge: 'hot' },
          { label: 'Teste PPD', value: 'Intradérmico — leitura 48–72 h', badge: 'ok' },
          { label: 'Sensibilidade', value: 'Antígeno na derme — pápula local', badge: 'ok' },
          { label: 'Anticoagulantes', value: 'Via SC — heparina, enoxaparina', emphasis: 'alert', badge: 'hot' },
          { label: 'Volume ID', value: 'Gotícula pequena — bevel quase paralelo à pele', badge: 'info' },
        ],
        footer_rule: 'Anticoagulante nunca é intradérmico em prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS GUALIMP — INTRADÉRMICA',
        items: [
          { label: 'Letra A — imunobiológicos', detail: 'Vacinas podem ser ID conforme protocolo.', correct: 'Afirmativa correta: imunobiológicos podem ser aplicados por via intradérmica.' },
          { label: 'Letra B — teste de sensibilidade', detail: 'Procedimento clássico na derme.', correct: 'Afirmativa correta: teste de sensibilidade é intradérmico.' },
          { label: 'Letra D — PPD', detail: 'Tuberculina intradérmica — padrão de prova.', correct: 'Afirmativa correta: PPD é teste diagnóstico intradérmico.' },
          { label: 'Letra C — anticoagulantes (pegadinha)', detail: 'Espelha o mapa: anticoagulante na intradérmica é erro — heparina vai na SC.', correct: 'EXCEÇÃO: anticoagulantes administram-se por via subcutânea, não intradérmica.' },
        ],
        footer_rule: 'Heparina = SC — não ID',
      },
    ],
  },

  'ibade-enfermagem-vias-de-administracao-1776056357082-2': {
    family: 'certo_errado',
    guideline: 'COFEN — parear apresentação × via: ampola → parenteral; comprimido/xarope → oral',
    roi_error: 'apresentacao_ampola_oral',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via × medicamento — mapa INCORRETA',
        meta: slideMeta,
        items: [
          { label: 'Comando da prova', detail: 'Relação via–medicação INCORRETA — quatro pares corretos; um mistura apresentação com via.', icon: 'Target' },
          { label: 'IM — Hepatite B', detail: 'Vacina hepatite B — via intramuscular clássica.', icon: 'Syringe' },
          { label: 'EV — bromoprida ampola', detail: 'Antiemético injetável — administração endovenosa ou IM conforme prescrição.', icon: 'Zap' },
          { label: 'SC — insulinas', detail: 'Insulina — via subcutânea de referência.', icon: 'Droplets' },
          { label: 'ID — BCG', detail: 'Vacina BCG — intradérmica no deltoide direito.', icon: 'Shield' },
          { label: 'Erro ROI — oral + ampola', detail: 'Letra D associa dipirona ampola à via oral — ampola é parenteral.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Ampola ≠ oral — comprimido/xarope sim',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: relação via–medicação incorreta.',
          'Testar A: Hepatite B IM → par correto → eliminar.',
          'Testar B: bromoprida ampola EV → par plausível → eliminar.',
          'Testar C: insulina SC → par clássico → eliminar.',
          'Testar E: BCG intradérmica → par correto → eliminar.',
          'Testar D: dipirona ampola via oral → FALSO — ampola indica apresentação injetável.',
          'Confirmar: apresentação farmacêutica deve combinar com a via.',
          'Marcar D.',
        ],
        footer_rule: 'Ampola + oral = incoerência → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — apresentação × via',
        meta: slideMeta,
        content: 'PARES CLÁSSICOS DE PROVA',
        rows: [
          { label: 'Vacina Hepatite B', value: 'Via IM', badge: 'ok' },
          { label: 'Insulina', value: 'Via SC', badge: 'hot' },
          { label: 'BCG', value: 'Via intradérmica', badge: 'ok' },
          { label: 'Ampola injetável', value: 'EV ou IM — nunca oral', emphasis: 'alert', badge: 'hot' },
          { label: 'Dipirona oral', value: 'Comprimido ou gotas — não ampola', badge: 'warn' },
        ],
        footer_rule: 'Leia apresentação antes da via',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IBADE — VIA × MEDICAMENTO',
        items: [
          { label: 'Letra A — Hepatite B IM', detail: 'Par vacinal clássico.', correct: 'Afirmativa correta: vacina hepatite B por via intramuscular.' },
          { label: 'Letra B — bromoprida ampola EV', detail: 'Antiemético injetável em ampola — coerente.', correct: 'Afirmativa correta: bromoprida ampola por via endovenosa.' },
          { label: 'Letra C — insulina SC', detail: 'Par mais cobrado em farmacologia.', correct: 'Afirmativa correta: insulinas por via subcutânea.' },
          { label: 'Letra E — BCG ID', detail: 'BCG intradérmica — padrão PNI.', correct: 'Afirmativa correta: vacina BCG por via intradérmica.' },
          { label: 'Letra D — dipirona ampola oral', detail: 'Ampola indica injetável — não deglutição.', correct: 'INCORRETA: dipirona em ampola é parenteral, não via oral.' },
        ],
        footer_rule: 'Ampola no enunciado → descarte oral',
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
    console.log(`[handcraft:vias-g20] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g20] total=${ok}`);
}

main();
