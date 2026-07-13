#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g07 (8 slugs cauda puncao_generico).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g07
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g07';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_generico';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bANVISA\)publicou\b/gi, 'ANVISA) publicou')
    .replace(/\bparaprevenção\b/gi, 'para prevenção')
    .replace(/\bReferente aoscuidados\b/gi, 'Referente aos cuidados')
    .replace(/\bdegrandes\b/gi, 'de grandes')
    .replace(/\bna ANVISA\)publicou\b/gi, 'na ANVISA) publicou')
    .replace(/\bdosdedos\b/gi, 'dos dedos')
    .replace(/\bextremidades dosdedos\b/gi, 'extremidades dos dedos')
    .replace(/\bmais, comumente,\b/gi, 'mais comumente')
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
  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-3': {
    family: 'protocolo',
    guideline: 'Troca de curativo CVC — paciente em decúbito dorsal para acesso seguro ao sítio',
    roi_error: 'posicao_incorreta_troca_curativo_cvc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Troca de curativo — CVC',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Posicionamento do paciente para troca do curativo no cateter venoso central.',
            icon: 'Target',
          },
          {
            label: 'Decúbito dorsal',
            detail: 'Paciente deitado de costas — expõe o sítio e facilita técnica asséptica.',
            icon: 'User',
          },
          {
            label: 'Estabilidade',
            detail: 'Membro e cabeceira ajustados — evita movimento durante a troca.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha',
            detail: 'Trendelemburg, prona, litotômica ou Sims — posições inadequadas para o procedimento.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Troca de curativo central: decúbito dorsal, campo estéril e assepsia.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Posição na troca de curativo',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Posição', value: 'Decúbito dorsal — acesso frontal ao sítio.', badge: 'hot' },
          { label: 'Evitar', value: 'Prona, litotômica, Sims sem indicação específica.', badge: 'warn' },
          { label: 'Técnica', value: 'Assepsia + curativo semipermeável por integridade.', badge: 'ok' },
        ],
        footer_rule: 'Posição correta protege técnica e conforto do paciente.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher a posição',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: posição para troca de curativo no CVC.',
          'Eliminar A (Sims), B (Trendelemburg), C (prona), D (litotômica).',
          'Letra E: decúbito dorsal — padrão para acesso ao sítio de inserção.',
          'Marcar letra E.',
        ],
        footer_rule: 'Decúbito dorsal = resposta da AVANÇASP neste protocolo.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Posições inadequadas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — POSICIONAMENTO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Sims',
            detail: 'Lateral para procedimentos retais — não para curativo de CVC.',
            correct: 'Não expõe adequadamente o sítio torácico.',
          },
          {
            label: 'Letra B — Trendelemburg',
            detail: 'Cabeça baixa — usada em outras situações, não rotina de curativo.',
            correct: 'Eliminar — decúbito dorsal é o padrão.',
          },
          {
            label: 'Letra C — Prona',
            detail: 'Decúbito ventral oculta o sítio do cateter.',
            correct: 'Impossibilita troca asséptica frontal.',
          },
          {
            label: 'Letra D — Litotômica',
            detail: 'Posição ginecológica — sem relação com curativo de CVC.',
            correct: 'Só E (dorsal) fecha o protocolo.',
          },
        ],
        footer_rule: 'Curativo central = paciente supino.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-6': {
    family: 'conceito',
    guideline: 'PAM invasiva — artérias radial e femoral são acessos comuns para monitorização',
    roi_error: 'confundir_artérias_pam',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PAM — cateterização arterial',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Pressão arterial média (PAM) acurada exige cateter em artéria — quais são mais usadas?',
            icon: 'Target',
          },
          {
            label: 'Radial',
            detail: 'Artéria periférica de escolha em muitos serviços — compressível após retirada.',
            icon: 'Activity',
          },
          {
            label: 'Femoral',
            detail: 'Acesso central periférico em emergência — calibre maior, monitorização contínua.',
            icon: 'MapPin',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca mistura artérias venosas ou pares inadequados (carótida rotina, ulnar isolada).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PAM invasiva ≠ punção venosa — par radial + femoral é clássico de prova.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Artérias para PAM',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Radial', value: 'Acesso periférico frequente para PAM.', badge: 'ok' },
          { label: 'Femoral', value: 'Alternativa em instabilidade — artéria de grosso calibre.', badge: 'ok' },
          { label: 'Par clássico', value: 'Radial + femoral na monitorização invasiva de PA.', badge: 'hot' },
        ],
        footer_rule: 'Não confundir com veias de punção periférica.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Identificar o par arterial',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: artérias mais comumente usadas na cateterização para PAM.',
          'Eliminar A — carótida/subclávia não são rotina de PAM periférica.',
          'Eliminar B — poplítea não é par clássico citado.',
          'Eliminar C — ulnar/braquial não é o par da alternativa correta.',
          'Eliminar E — braquial substitui femoral no gabarito AVANÇASP.',
          'Letra D: radial e femoral.',
          'Marcar letra D.',
        ],
        footer_rule: 'Memorize o par cobrado — radial + femoral.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Pares incorretos',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PAM',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Carótida/subclávia',
            detail: 'Acessos centrais de alto risco — não “mais comuns” para PAM de rotina.',
            correct: 'Radial/femoral são o par da prova.',
          },
          {
            label: 'Letra C — Ulnar/braquial',
            detail: 'Ulnar é reserva; braquial aparece em outro contexto.',
            correct: 'Não fecha o gabarito D.',
          },
          {
            label: 'Letra E — Radial/braquial',
            detail: 'Femoral, não braquial, compõe o par com radial nesta questão.',
            correct: 'Banca troca femoral por braquial.',
          },
        ],
        footer_rule: 'D = radial + femoral.',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-6': {
    family: 'certo_errado',
    guideline: 'Calibre do cateter — maior calibre aumenta flebite mecânica e trauma venoso (ANVISA 2017)',
    roi_error: 'ce_calibre_maior_menos_flebite',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Calibre do cateter — julgue',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando IRAS',
            detail:
              'Julgue item sobre prevenção de infecções relacionadas à assistência à saúde (IRAS) — ANVISA 2017.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa do item',
            detail:
              'Cateteres com maior calibre causam menos flebite mecânica (irritação da parede da veia pela cânula).',
            icon: 'FileText',
          },
          {
            label: 'Fluxo sanguíneo',
            detail: 'Item também afirma menor obstrução do fluxo sanguíneo dentro do vaso — inverto na prática.',
            icon: 'Activity',
          },
          {
            label: 'Princípio ANVISA',
            detail: 'Menor calibre compatível com a terapia — não superdimensionar o dispositivo.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca associa calibre maior a menos irritação da parede venosa — física invertida.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Maior calibre irrita mais a parede da veia — item falso.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Calibre × flebite mecânica',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'MENOR CALIBRE COMPATÍVEL COM A TERAPIA',
        rows: [
          { label: 'IRAS / ANVISA', value: 'Medidas preventivas 2017 — escolha adequada do cateter.', badge: 'info' },
          { label: 'Flebite mecânica', value: 'Cânula grossa irrita endotélio — não reduz complicação.', badge: 'warn' },
          { label: 'Fluxo no vaso', value: 'Calibre excessivo pode obstruir — não “protege” o lúmen.', badge: 'ok' },
          { label: 'Julgamento', value: 'Afirmativa contradiz prevenção — item ERRADO.', badge: 'hot' },
        ],
        footer_rule: 'CebraSPE inverte calibre × irritação da parede venosa.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar o item',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: julgar item sobre cateteres e prevenção de IRAS (ANVISA 2017).',
          'Ler: maior calibre → menos flebite mecânica e menor obstrução do fluxo sanguíneo.',
          'Fixar: cânula maior traumatiza a parede da veia — irritação aumenta, não diminui.',
          'Afirmativa contradiz orientações básicas de prevenção e controle das infecções.',
          'Item falso — marcar Errado.',
          'Marcar alternativa B (Errado).',
        ],
        footer_rule: 'Compatibilidade veia × dispositivo — não superdimensionar calibre.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Se marcar Certo',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CALIBRE E FLEBITE MECÂNICA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Calibre maior “protege”',
            detail: 'Senso comum de que tubo grosso evita obstrução e irritação.',
            correct:
              'Maior calibre aumenta flebite mecânica — irritação da parede da veia pela cânula.',
          },
          {
            label: 'Ignorar fluxo sanguíneo',
            detail: 'Aceitar “menor obstrução” sem avaliar trauma endothelial.',
            correct:
              'Dispositivo superdimensionado prejudica o fluxo e a integridade do vaso — item errado.',
          },
          {
            label: 'Confundir com IRAS',
            detail: 'Achar que qualquer cateter serve se a técnica for asséptica.',
            correct:
              'ANVISA 2017 inclui escolha do calibre adequado na prevenção de infecções relacionadas à assistência.',
          },
        ],
        footer_rule: 'Errado — maior calibre não reduz flebite mecânica.',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-7': {
    family: 'certo_errado',
    guideline: 'Cateter periférico de emergência — trocar quando técnica asséptica foi comprometida (ANVISA 2017)',
    roi_error: 'ce_manter_cateter_emergencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Emergência — troca do periférico',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando IRAS',
            detail:
              'Julgue item sobre infecções relacionadas à assistência à saúde — medidas preventivas ANVISA 2017.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa',
            detail:
              'Cateter periférico instalado em situação de emergência, com comprometimento da técnica asséptica, deve ser trocado tão logo quanto possível.',
            icon: 'FileText',
          },
          {
            label: 'Risco IRAS',
            detail: 'Inserção sem assepsia ideal aumenta infecção relacionada à assistência à saúde.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Conduta',
            detail: 'Repor o acesso com técnica asséptica adequada — não manter indefinidamente.',
            icon: 'RefreshCw',
          },
          {
            label: 'Pegadinha',
            detail: 'Achar que emergência dispensa troca posterior do cateter contaminado.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Emergência justifica o acesso rápido — não a permanência sem assepsia.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Acesso emergencial',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Emergência', value: 'Pode inserir com técnica subótima para salvar vida.', badge: 'info' },
          { label: 'Depois', value: 'Trocar cateter periférico tão logo quanto possível.', badge: 'hot' },
          { label: 'Técnica asséptica', value: 'Comprometimento na inserção exige reposição segura.', badge: 'ok' },
          { label: 'Julgamento', value: 'Afirmativa alinhada à prevenção — item CERTO.', badge: 'ok' },
        ],
        footer_rule: 'Urgência salva primeiro — reposição asséptica depois.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar o item',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: julgar item sobre cateter periférico e prevenção de IRAS.',
          'Ler: emergência + comprometimento da técnica asséptica → trocar tão logo quanto possível.',
          'Conduta alinhada às orientações básicas ANVISA 2017 de controle das infecções.',
          'Item verdadeiro — marcar Certo.',
          'Marcar alternativa A (Certo).',
        ],
        footer_rule: 'Salvou na urgência → repõe com segurança depois.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Se marcar Errado',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CATETER DE EMERGÊNCIA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Manter cateter contaminado',
            detail: 'Deixar o dispositivo instalado sem reposição após falha asséptica.',
            correct:
              'Comprometimento da técnica asséptica exige troca do cateter periférico — não adiar indefinidamente.',
          },
          {
            label: 'Emergência = dispensa troca',
            detail: 'Confundir permissão de acesso rápido com manutenção prolongada.',
            correct:
              'Situação de emergência autoriza inserir — depois repõe com prevenção de IRAS.',
          },
          {
            label: 'Subestimar assistência à saúde',
            detail: 'Tratar o item como opinião, não como medida preventiva publicada.',
            correct:
              'ANVISA 2017 orienta controle das infecções — troca precoce após assepsia comprometida é correta.',
          },
        ],
        footer_rule: 'Certo — trocar cateter periférico após emergência com falha asséptica.',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-8': {
    family: 'certo_errado',
    guideline: 'Preparo da pele — clorexidina alcoólica: fricção e secagem; PVPI tem tempo de contato distinto',
    roi_error: 'ce_tempos_antissepsia_invertidos',
    exam_vs_current: 'tempos_pvpi_clorexidina_invertidos_cebraspe',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo da pele — julgue',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando IRAS',
            detail:
              'Julgue item sobre prevenção de infecções relacionadas à assistência à saúde — ANVISA 2017.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa',
            detail:
              'No preparo da pele para inserção de cateter venoso periférico: fricção com álcool gluconato de clorexidina, iodopovidona (PVP-I) ou álcool 70%.',
            icon: 'FileText',
          },
          {
            label: 'Tempos citados',
            detail:
              'Item atribui tempo curto ao PVP-I e tempo prolongado à clorexidina — inversão típica de prova.',
            icon: 'Timer',
          },
          {
            label: 'Clorexidina',
            detail: 'Friccionar e aguardar secagem completa — ação pela secagem, não tempo longo de PVPI.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha',
            detail: 'Decorar segundos sem associar ao antisséptico correto — banca troca PVP-I × clorexidina.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tempos invertidos entre PVP-I e clorexidina invalidam o item.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Antissepsia na punção periférica',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Fricção', value: 'Clorexidina alcoólica, PVP-I ou álcool 70% — movimento de vai e vem.', badge: 'ok' },
          { label: 'Clorexidina', value: 'Friccionar e aguardar secagem antes da inserção do cateter.', badge: 'hot' },
          { label: 'PVP-I', value: 'Tempo de contato próprio — não confundir com clorexidina alcoólica.', badge: 'warn' },
          { label: 'Julgamento', value: 'Tempos trocados no enunciado — item ERRADO.', badge: 'hot' },
        ],
        footer_rule: 'Secagem da clorexidina importa — não copiar tempo do PVPI.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar o item',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: julgar preparo da pele para cateter venoso periférico (ANVISA 2017).',
          'Ler: item troca os tempos de ação entre PVP-I e clorexidina alcoólica.',
          'Protocolo: clorexidina = fricção + secagem; PVPI tem tempo de contato distinto.',
          'O item inverte os antissépticos — afirmativa falsa.',
          'Marcar alternativa B (Errado).',
        ],
        footer_rule: 'Inversão de tempos entre PVP-I e clorexidina = pegadinha CebraSPE.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Se marcar Certo',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO DA PELE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Aceitar tempos trocados',
            detail: 'Marcar Certo porque o item cita clorexidina e iodopovidona.',
            correct:
              'PVP-I com tempo curto e clorexidina com tempo prolongado inverte o protocolo — item errado.',
          },
          {
            label: 'Puncionar sem secagem',
            detail: 'Tratar tempo longo de clorexidina como regra — ignora secagem espontânea.',
            correct:
              'Álcool gluconato de clorexidina exige fricção e secagem completa antes da inserção do cateter.',
          },
          {
            label: 'Ignorar cateter venoso periférico',
            detail: 'Generalizar antissepsia sem contexto de acesso venoso.',
            correct:
              'Preparo da pele na inserção de cateter venoso periférico segue tempos específicos por antisséptico.',
          },
        ],
        footer_rule: 'Errado — tempos de PVP-I e clorexidina invertidos no item.',
      },
    ],
  },

  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-9': {
    family: 'certo_errado',
    guideline: 'Manutenção CIVP — proteger sítio e conexões no banho; SF para flush; fita não estéril inadequada',
    roi_error: 'cuidado_incorreto_civp_manutencao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidados com CIVP',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cuidados de enfermagem no acesso venoso periférico — alternativa correta.',
            icon: 'Target',
          },
          {
            label: 'Proteção no banho',
            detail: 'Cobrir sítio e conexões — evitar umidade e contaminação.',
            icon: 'Droplets',
          },
          {
            label: 'Fixação',
            detail: 'Dispositivo estéril/transparente — não fita comum não estéril.',
            icon: 'Bandage',
          },
          {
            label: 'Flush/lock',
            detail: 'Soro fisiológico — não água estéril de rotina no periférico.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha',
            detail: 'Salina antes de cada uso como “teste”; seringa de diâmetro inadequado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Manutenção = proteger, avaliar e manter sistema fechado.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Manutenção do periférico',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Banho', value: 'Proteger sítio e conexões da umidade.', badge: 'hot' },
          { label: 'Fixação', value: 'Curativo estéril — evitar fita não estéril.', badge: 'warn' },
          { label: 'Flush', value: 'SF — técnica asséptica na conexão.', badge: 'ok' },
        ],
        footer_rule: 'A descreve proteção no banho — gabarito.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando CORRETA sobre cuidados do acesso periférico.',
          'Letra A: proteger sítio e conexões durante o banho — correto.',
          'Eliminar B — fita não estéril inadequada.',
          'Eliminar C — não administrar salina “para testar” antes de cada uso.',
          'Eliminar D — água estéril não é padrão de flush/lock.',
          'Eliminar E — seringa de diâmetro inadequado para avaliar permeabilidade.',
          'Marcar letra A.',
        ],
        footer_rule: 'Umidade no curativo = porta de infecção.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Condutas incorretas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — MANUTENÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Fita não estéril',
            detail: 'Esparadrapo comum não substitui fixador estéril.',
            correct: 'Risco de contaminação e maceração.',
          },
          {
            label: 'Letra C — Salina de teste',
            detail: 'Não é protocolo infundir salina só para “garantir funcionamento”.',
            correct: 'Flush segue indicação — não rotina antes de cada uso.',
          },
          {
            label: 'Letra D — Água estéril',
            detail: 'Lock/flush com SF — não água.',
            correct: 'Solução inadequada para patência.',
          },
          {
            label: 'Letra E — Seringa inadequada',
            detail: 'Diâmetro da seringa deve ser compatível com o lúmen.',
            correct: 'A é a única conduta plenamente correta.',
          },
        ],
        footer_rule: 'Proteção no banho fecha A.',
      },
    ],
  },

  'ibfc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-3': {
    family: 'certo_errado',
    guideline: 'Garrote na punção — tempo limitado; soltar se extremidade arroxeada',
    roi_error: 'garrote_tempo_excessivo',
    exam_vs_current: 'Gabarito prova = 1 minuto; ensinar tempo curto e sinais de congestão venosa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Garrote — tempo seguro',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Tempo máximo de garroteamento na punção venosa.',
            icon: 'Target',
          },
          {
            label: 'Função',
            detail: 'Ingurgitar a veia — facilitar visualização.',
            icon: 'Circle',
          },
          {
            label: 'Excesso',
            detail: 'Extremidades arroxeadas — soltar imediatamente.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Limite',
            detail: 'Tempo curto — na coleta, não prolongar além do necessário.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Garrote > tempo seguro compromete circulação distal.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Garrote na punção',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Sinal de alerta', value: 'Mão/dedos arroxeados → soltar na hora.', badge: 'warn' },
          { label: 'Tempo', value: 'Curto — gabarito IBFC: cerca de um minuto como limite.', badge: 'hot' },
          { label: 'Coleta', value: 'Em punção para sangue, tempo ainda mais restrito na prática.', badge: 'info' },
        ],
        footer_rule: 'Prova cobra 1 minuto; na prática, menos se houver congestão.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher o limite',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: tempo máximo de garroteamento.',
          'Eliminar A — trinta segundos é muito curto para limite da prova IBFC.',
          'Eliminar B — cinco minutos é excessivo e perigoso.',
          'Eliminar D — dois minutos não é o gabarito desta banca.',
          'Letra C: um minuto — resposta da prova.',
          'Marcar letra C.',
        ],
        footer_rule: 'Congestão distal manda soltar antes do limite teórico.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Tempos inadequados',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — GARROTE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — 30 segundos',
            detail: 'Limite inferior — não é o gabarito IBFC.',
            correct: 'Prova fixa um minuto como teto.',
          },
          {
            label: 'Letra B — 5 minutos',
            detail: 'Tempo prolongado causa isquemia distal.',
            correct: 'Nunca manter garrote tanto tempo.',
          },
          {
            label: 'Letra D — 2 minutos',
            detail: 'Intermediário — banca escolheu 1 minuto.',
            correct: 'C fecha conforme caderno IBFC.',
          },
        ],
        footer_rule: 'Arroxeado = soltar, independente do relógio.',
      },
    ],
  },

  'idecan-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1778712165781-3': {
    family: 'protocolo',
    guideline: 'Hemodiálise — assepsia do acesso vascular (CVC/fístula) antes de cada sessão',
    roi_error: 'hd_sem_assepsia_acesso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hemodiálise — cuidado no acesso',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Contexto',
            detail: 'IRC em hemodiálise — enfermagem garante qualidade e previne complicações do acesso.',
            icon: 'Gauge',
          },
          {
            label: 'Assepsia',
            detail: 'Técnica asséptica rigorosa no acesso vascular antes de cada sessão.',
            icon: 'Droplets',
          },
          {
            label: 'CVC/fístula',
            detail: 'Portal de infecção se manipulado sem barreira.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha',
            detail: 'Troca semanal de CVC, ATB profilático rotineiro, alterar dose sem médico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Cada sessão começa com assepsia do acesso.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Enfermagem na HD',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Prioridade', value: 'Assepsia do acesso vascular antes da sessão.', badge: 'hot' },
          { label: 'Evitar', value: 'ATB profilático de rotina; troca semanal de CVC; mudar dose sem médico.', badge: 'warn' },
          { label: 'Monitorar', value: 'Sinais vitais e complicações durante a sessão.', badge: 'ok' },
        ],
        footer_rule: 'Infecção do acesso = principal risco evitável na HD.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Responsabilidade correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: principal responsabilidade do enfermeiro no acesso em hemodiálise.',
          'Eliminar A — troca semanal de CVC não é rotina de enfermagem.',
          'Eliminar B — antibiótico profilático antes de cada sessão não é padrão.',
          'Eliminar C — ingestão de SF durante sessão não é conduta típica.',
          'Eliminar E — alterar dose sem médico é ilegal.',
          'Letra D: assepsia correta do acesso antes de cada sessão.',
          'Marcar letra D.',
        ],
        footer_rule: 'Barreira asséptica protege corrente sanguínea na HD.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Condutas proibidas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — HD',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Troca semanal CVC',
            detail: 'CVC não é trocado em cronograma fixo sem indicação.',
            correct: 'Remoção segue critério clínico.',
          },
          {
            label: 'Letra B — ATB profilático',
            detail: 'Não faz parte do bundle de prevenção de IPCS.',
            correct: 'Assepsia substitui profilaxia antibiótica.',
          },
          {
            label: 'Letra E — Dose sem médico',
            detail: 'Prescrição é médica — enfermagem executa e monitora.',
            correct: 'D é a atribuição técnica correta.',
          },
        ],
        footer_rule: 'Assepsia antes de conectar a máquina.',
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
    console.log(`[handcraft:puncao-g07] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g07] total=${ok}`);
}

main();
