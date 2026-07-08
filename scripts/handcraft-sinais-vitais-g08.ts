#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g08 (8 slugs P0 vitals_pa_tecnica + FC).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g08.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g08';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-05';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Faixas de sinais vitais — repouso (adulto)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'PA normotenso',
    'técnica de aferição PA',
    'fases de Korotkoff',
    'manguito inadequado',
    'pulso central × periférico',
    'preparo pré-PA',
    'sequência protocolo PA MS',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'vitals_pa_tecnica' | 'vitals_fc_faixas' | 'vitals_interpretacao';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  roi_error?: string;
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
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1778969768866-1': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/COFEN — locais de palpação: carótida na borda medial do ECM; radial no punho lateral ao dedo mínimo',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Locais de palpação do pulso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar o local CORRETO de verificação da pulsação — CPCON UEPB.',
            icon: 'Target',
          },
          {
            label: 'Pulso carótido',
            detail:
              'Ao longo da borda medial do esternocleidomastóideo no pescoço — pulso central de emergência.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — radial × ulnar',
            detail:
              'Radial fica no lado do dedo polegar (não mínimo); ulnar no lado do dedo mínimo — banca inverte.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — apical',
            detail:
              'Apical palpa-se no ápice cardíaco (5º EIC MCL), não no 1º–2º espaço intercostal.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — poplíteo',
            detail: 'Artéria poplítea fica na fossa poplítea (joelho), não no tornozelo medial.',
            icon: 'MapPin',
          },
        ],
        footer_rule: 'Carótida = ECM medial — radial = punho lateral ao polegar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: local CORRETO de verificação da pulsação.',
          'Testar A — ulnar no lado do polegar: inverte lateralidade → eliminar.',
          'Testar B — apical no 1º–2º EIC: local anatômico errado → eliminar.',
          'Testar C — carótida na borda medial do ECM: anatomia correta → candidata.',
          'Testar D — radial no lado do dedo mínimo: inverte com ulnar → eliminar.',
          'Testar E — poplíteo no tornozelo medial: sítio errado → eliminar.',
          'Confirmar: só C descreve carótida corretamente.',
          'Marcar C.',
        ],
        footer_rule: 'Carótida ECM medial → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios de palpação',
        meta: slideMeta,
        content: 'CENTRAL · PERIFÉRICO · ANATOMIA',
        rows: [
          {
            label: 'Carótida',
            value: 'Borda medial do ECM no pescoço — pulso central',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Alternativa C.',
          },
          {
            label: 'Radial',
            value: 'Punho — lado do polegar (face volar lateral)',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'Ulnar',
            value: 'Punho — lado do dedo mínimo',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'Apical',
            value: 'Ápice cardíaco — 5º EIC linha medioclavicular',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'Poplítea',
            value: 'Fossa poplítea — joelho flexionado',
            sv_kind: 'fc',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore lateralidade radial (polegar) × ulnar (mínimo)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LOCAIS DE PULSO',
        items: [
          {
            label: 'Letra A — ulnar no polegar',
            detail: 'Troca lateralidade do punho.',
            correct:
              'Ulnar palpa-se no lado do dedo mínimo — A atribui ao polegar, confundindo com radial.',
          },
          {
            label: 'Letra B — apical no 1º EIC',
            detail: 'Localiza ápice cardíaco no tórax superior.',
            correct:
              'Apical fica no 5º espaço intercostal — B descreve região supraclavicular errada.',
          },
          {
            label: 'Letra D — radial no mínimo',
            detail: 'Inverte radial com ulnar.',
            correct:
              'Radial é lateral ao tendão do polegar — D coloca no lado do dedo mínimo.',
          },
          {
            label: 'Letra E — poplíteo no tornozelo',
            detail: 'Confunde artéria poplítea com tibial posterior.',
            correct:
              'Poplítea palpa-se na fossa do joelho — E desloca para maléolo medial.',
          },
        ],
        footer_rule: 'Elimine inversões anatômicas → carótida (C)',
      },
    ],
  },

  'cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1779344111854-5': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — preparo PA: repouso 3–5 min · bexiga vazia · sem exercício 60 min · sem café/álcool/fumo 30 min',
    roi_error: 'pernas_cruzadas_pa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo pré-aferição de PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Afirmativa CORRETA sobre preparo da aferição de PA — CPCON.',
            icon: 'Target',
          },
          {
            label: 'Repouso e ambiente',
            detail: 'Explicar procedimento · repouso 3–5 min em ambiente calmo — item A.',
            icon: 'Clock',
          },
          {
            label: 'Bexiga e exercício',
            detail: 'Bexiga não cheia · sem exercício físico há pelo menos uma hora.',
            icon: 'Activity',
          },
          {
            label: 'Substâncias interferentes',
            detail: 'Sem álcool, café, alimentos ou cigarro nos trinta minutos anteriores.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — posição',
            detail: 'B/D/E erram: pernas cruzadas, braço abaixo do coração, palma fechada com força.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Preparo = repouso + bexiga + abstinência recente — não posição errada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preparo da aferição de PA — assinalar correta.',
          'Testar A — explicar + repouso 3–5 min + bexiga + exercício uma hora + café/álcool/fumo trinta min: protocolo MS → candidata.',
          'Testar B — em pé ou sentado com pernas cruzadas e braço abaixo do coração: erros de posição → eliminar.',
          'Testar C — qualquer ambiente + palma fechada com força: absurdo técnico → eliminar.',
          'Testar D — sentado com pernas cruzadas: posição incorreta → eliminar.',
          'Testar E — braço abaixo do coração + sem cuidado com ingestão: duplo erro → eliminar.',
          'Confirmar: só A integra preparo completo.',
          'Marcar A.',
        ],
        footer_rule: 'Repouso + bexiga + abstinência → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo PA MS',
        meta: slideMeta,
        content: 'REPOUSO · BEXIGA · ABSTINÊNCIA',
        rows: [
          {
            label: 'Repouso pré-PA',
            value: '3–5 min sentado, ambiente calmo, explicar procedimento',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa A.',
          },
          {
            label: 'Bexiga',
            value: 'Certificar-se de que não está cheia',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Exercício',
            value: 'Sem atividade física há pelo menos uma hora',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Abstinência recente',
            value: 'Sem álcool, café, alimentos ou cigarro — trinta minutos antes',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Posição',
            value: 'Sentado · pernas descruzadas · braço ao nível do coração',
            sv_kind: 'pa',
            badge: 'warn',
          },
        ],
        footer_rule: 'Decore janelas: uma hora sem exercício · trinta min sem café/álcool/fumo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO PA CPCON',
        items: [
          {
            label: 'Letra B — pernas cruzadas e braço baixo',
            detail: 'Posicionamento que eleva ou reduz leitura pressórica.',
            correct:
              'Pernas descruzadas e braço ao nível do coração — B inverte e coloca membro abaixo do coração.',
          },
          {
            label: 'Letra C — palma fechada com força',
            detail: 'Isometria muscular altera PA.',
            correct:
              'Mão relaxada com palma para cima — forçar punho closed fist gera pseudohipertensão.',
          },
          {
            label: 'Letra D — pernas cruzadas',
            detail: 'Postura sentada incorreta.',
            correct:
              'Pernas cruzadas comprimem vasos e alteram retorno — posição correta é pés apoiados, descruzadas.',
          },
          {
            label: 'Letra E — braço abaixo do coração',
            detail: 'Ignora interferentes e posiciona membro errado.',
            correct:
              'Braço abaixo do coração superestima PA — E ainda dispensa cuidado com ingestão recente.',
          },
        ],
        footer_rule: 'Posição errada elimina B, D, E → confirme A',
      },
    ],
  },

  'cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1779344182672-7': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — bexiga cheia eleva PA; evitar conversa durante aferição; repouso prévio',
    roi_error: 'contar_fr_com_fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo do paciente — PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Afirmativa CORRETA sobre preparo do paciente na aferição de PA.',
            icon: 'Target',
          },
          {
            label: 'Bexiga cheia',
            detail:
              'Certificar-se de que o indivíduo não está com a bexiga cheia — eleva leitura pressórica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Sem conversar na aferição',
            detail:
              'Perguntar sobre dor de cabeça ou cervical antes — não conversar durante a medição.',
            icon: 'MessageSquareOff',
          },
          {
            label: 'Pegadinha — hipertenso e remédio',
            detail:
              'Alternativa C restringe a hipertenso e remédio — preparo é mais amplo que histórico medicamentoso.',
            icon: 'Pill',
          },
          {
            label: 'Pegadinha — sono',
            detail: 'Alternativa E foca apenas se dormiu bem — irrelevante isolado para técnica.',
            icon: 'Moon',
          },
        ],
        footer_rule: 'Bexiga vazia + não conversar na medida — núcleo da alternativa D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preparo do paciente na PA — assinalar correta.',
          'Testar A — posição livre + conversar durante aferição: erros clássicos → eliminar.',
          'Testar B — só perguntar dor de cabeça/cervical: incompleto e na hora errada → eliminar.',
          'Testar C — só hipertenso e remédio: foco estreito demais → eliminar.',
          'Testar D — bexiga não cheia + não conversar durante aferição: MS → candidata.',
          'Testar E — só sono: irrelevante isolado → eliminar.',
          'Confirmar: D integra bexiga e silêncio na medição.',
          'Marcar D.',
        ],
        footer_rule: 'Bexiga vazia + silêncio → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — interferentes pré-PA',
        meta: slideMeta,
        content: 'BEXIGA · SILÊNCIO · REPOUSO',
        rows: [
          {
            label: 'Bexiga cheia',
            value: 'Eleva PA falsamente — esvaziar antes ou adiar',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa D.',
          },
          {
            label: 'Conversa na aferição',
            value: 'Proibida — altera PA e FR; orientar antes',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Repouso',
            value: '3–5 min sentado antes da 1ª medida',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Dor referida',
            value: 'Investigar antes da medição — não durante',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Medicamentos',
            value: 'Registrar anti-hipertensivos — mas não substitui preparo físico',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Bexiga cheia = PA falsamente alta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO CPCON',
        items: [
          {
            label: 'Letra A — conversar na aferição',
            detail: 'Permite diálogo durante medição.',
            correct:
              'Conversa eleva PA e FR — paciente deve permanecer em silêncio durante a aferição.',
          },
          {
            label: 'Letra B — só dor de cabeça',
            detail: 'Reduz preparo a sintoma cervical.',
            correct:
              'Dor pode ser investigada antes — B não cobre bexiga nem silêncio exigidos pelo MS.',
          },
          {
            label: 'Letra C — só anti-hipertensivo',
            detail: 'Foca histórico medicamentoso isolado.',
            correct:
              'Medicamento importa, mas preparo inclui bexiga vazia e ausência de conversa na medida.',
          },
          {
            label: 'Letra E — sono',
            detail: 'Qualidade do sono não define técnica de aferição.',
            correct:
              'Sono não substitui cuidados com bexiga e silêncio — E é distrator irrelevante.',
          },
        ],
        footer_rule: 'Elimine foco estreito → bexiga + silêncio (D)',
      },
    ],
  },

  'decorp-enfermagem-verificacao-de-sinais-vitais-1779343811344-4': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS — coma diabético: monitorar glicemia capilar + SV (PA, FC, FR, T) continuamente',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Monitoramento — coma diabético',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Prioridade de monitoramento contínuo em paciente com coma diabético — DECORP.',
            icon: 'Target',
          },
          {
            label: 'Glicemia + SV',
            detail: 'Controle glicêmico e sinais vitais integram vigilância — alternativa B.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — insulina imediata',
            detail: 'Alternativa A antecipa tratamento sem dados — conduta médica, não prioridade de monitor.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — VO',
            detail: 'Coma contraindica via oral — alternativa C é absurda clínica.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — agir sem comunicar',
            detail:
              'Priorizar glicemia + SV e comunicar alteração à equipe — não antecipar insulina ou hidratação oral.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Coma diabético = glicemia + conjunto de SV — não intervenção isolada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: monitoramento contínuo em coma diabético — priorizar.',
          'Testar A — insulina rápida imediata: tratamento sem monitorar antes → eliminar.',
          'Testar B — glicemia + sinais vitais: vigilância integrada → candidata.',
          'Testar C — líquidos VO: via oral em coma → eliminar.',
          'Testar D — só PA a cada 15 min: parcial e ignora glicemia → eliminar.',
          'Confirmar: B cobre parâmetro metabólico + hemodinâmico/respiratório.',
          'Marcar B.',
        ],
        footer_rule: 'Glicemia + SV → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vigilância em coma',
        meta: slideMeta,
        content: 'GLICEMIA · SV · COMUNICAÇÃO',
        rows: [
          {
            label: 'Glicemia capilar',
            value: 'Monitorar serialmente — hipoglicemia e hiperglicemia alteram consciência',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Alternativa B.',
          },
          {
            label: 'Sinais vitais',
            value: 'PA, FC, FR, temperatura — detectar deterioração',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Via oral',
            value: 'Contraindicada em coma — risco de aspiração',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Insulina',
            value: 'Prescrição médica após confirmar glicemia — não antecipar sem dado',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Escalonar',
            value: 'Comunicar alteração à equipe e registrar',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Monitorar antes de tratar — glicemia + SV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMA DIABÉTICO',
        items: [
          {
            label: 'Letra A — insulina rápida',
            detail: 'Prioriza medicação sem vigilância prévia.',
            correct:
              'Insulina exige glicemia conhecida — monitorar glicemia e SV precede qualquer bolus.',
          },
          {
            label: 'Letra C — líquidos VO',
            detail: 'Hidratação oral em paciente comatoso.',
            correct:
              'Coma impede deglutição segura — hidratação é venosa, não oral.',
          },
          {
            label: 'Letra D — só PA 15 min',
            detail: 'Reduz monitoramento a um parâmetro.',
            correct:
              'Coma diabético exige glicemia seriada + SV completos — PA isolada é insuficiente.',
          },
        ],
        footer_rule: 'Tratamento sem monitor → elimine A e C',
      },
    ],
  },

  'educa-pb-enfermagem-verificacao-de-sinais-vitais-1779343811344-6': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS Linhas de Cuidado — sequência PA: 1 preparo · 2 posição · 3 manguito · 4 medição · 5 registro',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sequência técnica PA — MS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Associar descrições às etapas 1–5 da aferição de PA — EDUCA-PB.',
            icon: 'Target',
          },
          {
            label: 'Etapa 1 — preparo',
            detail:
              'Bexiga vazia · sem exercício físico · sem café ou álcool nos trinta minutos anteriores.',
            icon: 'Clipboard',
          },
          {
            label: 'Etapa 2 — posição',
            detail: 'Sentado · costas apoiadas · pernas descruzadas · braço ao nível do coração.',
            icon: 'User',
          },
          {
            label: 'Etapa 3 — manguito',
            detail: 'Tamanho adequado · acima da fossa cubital.',
            icon: 'Ruler',
          },
          {
            label: 'Pegadinha — ordem',
            detail: 'Banca troca preparo × posição ou medição × manguito nas alternativas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ordem lógica: preparo → posição → manguito → medição → registro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: associar 5 descrições às etapas numeradas.',
          '1º parêntese — bexiga vazia + sem exercício/ingestão trinta min → etapa 1 (preparo).',
          '2º — sentado, costas apoiadas, pernas descruzadas, braço ao coração → etapa 2 (posição).',
          '3º — manguito adequado acima da fossa cubital → etapa 3.',
          '4º — insuflar vinte a trinta mmHg acima da sistólica, deflação gradual → etapa 4 (medição).',
          '5º — anotar valores sem arredondar + braço usado → etapa 5 (registro).',
          'Sequência correta: 1 – 2 – 3 – 4 – 5.',
          'Testar A — 2-1-3-4-5: posição antes do preparo → eliminar.',
          'Testar C — 1-3-4-2-5: medição antes de posicionar → eliminar.',
          'Testar D — 3-2-1-4-5: manguito antes do preparo → eliminar.',
          'Testar E — 1-2-4-3-5: medição antes do manguito → eliminar.',
          'Marcar B.',
        ],
        footer_rule: '1-2-3-4-5 → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 5 etapas PA MS',
        meta: slideMeta,
        content: 'PREPARO · POSIÇÃO · MANGUITO · MEDIR · REGISTRAR',
        rows: [
          { label: '1 Preparo', value: 'Bexiga vazia · sem exercício · sem interferentes trinta min antes', sv_kind: 'pa', badge: 'hot' },
          { label: '2 Posição', value: 'Sentado · costas apoiadas · braço ao coração', sv_kind: 'pa', badge: 'hot' },
          { label: '3 Manguito', value: 'Tamanho adequado · 2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'ok' },
          { label: '4 Medição', value: 'Insuflar vinte a trinta mmHg acima da sistólica · deflação lenta', sv_kind: 'pa', badge: 'hot' },
          { label: '5 Registro', value: 'Valor exato · braço utilizado · horário', sv_kind: 'meta', badge: 'ok', exam_hint: 'Seq. B.' },
        ],
        footer_rule: 'Nunca medir antes de posicionar e colocar manguito',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SEQUÊNCIA PA',
        items: [
          {
            label: 'Letra A — 2-1-3-4-5',
            detail: 'Inicia por posição antes do preparo.',
            correct:
              'Preparo (bexiga, abstinência) precede posicionamento — A inverte etapas 1 e 2.',
          },
          {
            label: 'Letra C — 1-3-4-2-5',
            detail: 'Mede antes de posicionar o paciente.',
            correct:
              'Posição (etapa 2) vem antes da medição (4) — C coloca medição antes de posicionar.',
          },
          {
            label: 'Letra D — 3-2-1-4-5',
            detail: 'Coloca manguito antes de preparo e posição.',
            correct:
              'Manguito só após preparo e posição — D antecipa etapa 3 indevidamente.',
          },
          {
            label: 'Letra E — 1-2-4-3-5',
            detail: 'Medição antes de ajustar manguito.',
            correct:
              'Manguito (3) precede medição (4) — E troca ordem técnica crítica.',
          },
        ],
        footer_rule: 'Qualquer inversão 1↔2 ou 3↔4 elimina → confirme B',
      },
    ],
  },

  'facet-enfermagem-verificacao-de-sinais-vitais-1779343845367-0': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — manguito estreito superestima PA; repetir após repouso e manguito adequado antes de conduta',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA discrepante — técnica inadequada',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Idoso hipertenso: PA 190/110 com manguito estreito e sem repouso — interpretação correta FACET.',
            icon: 'Target',
          },
          {
            label: 'Manguito estreito',
            detail: 'Superestima PA — valor pode ser falsamente alto, não crise imediata.',
            icon: 'TrendingUp',
          },
          {
            label: 'Sem repouso prévio',
            detail: 'Ausência de 3–5 min de repouso também eleva leitura — técnica comprometida.',
            icon: 'Clock',
          },
          {
            label: 'Conduta técnica',
            detail: 'Repetir após repouso + manguito adequado + registrar condições — alternativa B.',
            icon: 'RefreshCw',
          },
          {
            label: 'Pegadinha — crise imediata',
            detail: 'A/E antecipam intervenção sem validar medida — erro de enfermagem.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Técnica ruim → repetir antes de crise ou medicar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: 190/110 mmHg · manguito estreito · sem repouso · sentado.',
          'Testar A — validar crise sem considerar técnica: precipitado → eliminar.',
          'Testar B — superestimação possível; repetir com repouso e manguito adequado: MS → candidata.',
          'Testar C — sentado invalida medida: posição sentada é correta → eliminar.',
          'Testar D — manguito estreito subestima: direção do erro invertida → eliminar.',
          'Testar E — anti-hipertensivo antes de repetir: conduta perigosa → eliminar.',
          'Confirmar: B prioriza reaferição técnica.',
          'Marcar B.',
        ],
        footer_rule: 'Repetir com técnica correta → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — erro técnico × conduta',
        meta: slideMeta,
        content: 'MANGUITO · REPOUSO · REPETIR',
        rows: [
          {
            label: 'Manguito estreito',
            value: 'PA falsamente elevada — trocar por tamanho adequado',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Sem repouso',
            value: 'Eleva leitura — aguardar 3–5 min antes de medir',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Conduta',
            value: 'Repetir PA · registrar condições · comunicar se mantiver alterado',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa B.',
          },
          {
            label: 'Posição sentada',
            value: 'Padrão MS — não invalida a medida',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Medicar',
            value: 'Só após confirmar valor com técnica correta',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Estreito = alto falso — nunca medicar na 1ª leitura duvidosa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA DISCREPANTE',
        items: [
          {
            label: 'Letra A — crise sem técnica',
            detail: 'Ignora manguito estreito e falta de repouso.',
            correct:
              '190/110 com técnica ruim não confirma crise — repetir antes de classificar emergência.',
          },
          {
            label: 'Letra C — sentado invalida',
            detail: 'Rejeita posição padrão MS.',
            correct:
              'PA em decúbito não é obrigatória — sentado com braço ao coração é posição de referência.',
          },
          {
            label: 'Letra D — estreito subestima',
            detail: 'Inverte direção do erro do manguito.',
            correct:
              'Manguito estreito eleva PA — D erra ao presumir subestimação e dispensar nova medida.',
          },
          {
            label: 'Letra E — medicar antes',
            detail: 'Anti-hipertensivo de emergência sem reaferir.',
            correct:
              'Conduta farmacológica exige valor confirmado — E antecipa tratamento sem técnica adequada.',
          },
        ],
        footer_rule: 'Direção do erro + repetir → confirme B',
      },
    ],
  },

  'fafipa-enfermagem-verificacao-de-sinais-vitais-1779343822075-2': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA: sem conversa · bexiga vazia · pernas descruzadas; palma voltada para cima (não para baixo)',
    roi_error: 'pernas_cruzadas_pa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — assertivas I–IV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Julgar I–IV sobre técnica de verificação de PA — FAFIPA.',
            icon: 'Target',
          },
          {
            label: 'Item I — silêncio',
            detail: 'Paciente não deve conversar durante medição — VERDADEIRO.',
            icon: 'MessageSquareOff',
          },
          {
            label: 'Item II — bexiga',
            detail: 'Bexiga vazia antes da aferição — VERDADEIRO.',
            icon: 'Check',
          },
          {
            label: 'Item III — posição sentada',
            detail: 'Pernas descruzadas · pés no chão · dorso apoiado · relaxado — VERDADEIRO.',
            icon: 'User',
          },
          {
            label: 'Pegadinha — pernas cruzadas',
            detail:
              'Item III exige pernas descruzadas e pés apoiados — pernas cruzadas durante PA é erro clássico de prova.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — item IV palma',
            detail: 'Palma voltada para baixo — MS exige palma para cima (supinada) → item IV FALSO.',
            icon: 'Hand',
          },
        ],
        footer_rule: 'I, II, III verdadeiros · IV falso (palma para baixo)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assertivas I–IV — marcar combinação correta.',
          'Julgar I — não conversar na medição → VERDADEIRO.',
          'Julgar II — bexiga vazia → VERDADEIRO.',
          'Julgar III — sentado, pernas descruzadas, pés apoiados, dorso recostado → VERDADEIRO.',
          'Julgar IV — braço ao coração mas palma para baixo → FALSO (palma para cima).',
          'Combinação: I, II e III apenas.',
          'Eliminar B (inclui IV), D (sem I), E (sem III).',
          'Marcar C.',
        ],
        footer_rule: 'I+II+III → letra C (IV excluído)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posição PA',
        meta: slideMeta,
        content: 'SILÊNCIO · BEXIGA · MÃO SUPINADA',
        rows: [
          { label: 'Conversa', value: 'Proibida durante aferição', sv_kind: 'pa', badge: 'hot', exam_hint: 'I = V.' },
          { label: 'Bexiga', value: 'Esvaziada antes da medida', sv_kind: 'pa', badge: 'hot', exam_hint: 'II = V.' },
          { label: 'Pernas', value: 'Descruzadas · pés apoiados', sv_kind: 'pa', badge: 'hot', exam_hint: 'III = V.' },
          { label: 'Palma da mão', value: 'Voltada para cima (supinada) — não para baixo', sv_kind: 'pa', badge: 'hot', exam_hint: 'IV = F.' },
          { label: 'Braço', value: 'Ao nível do coração · apoiado · sem garrotear roupa', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Palma para baixo = item IV falso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F TÉCNICA PA',
        items: [
          {
            label: 'Letra A — só I e III',
            detail: 'Omite bexiga vazia (item II) e pernas descruzadas incompletas.',
            correct:
              'Item II é verdadeiro — bexiga cheia eleva PA; A erra ao excluir II e ignora pernas descruzadas do III.',
          },
          {
            label: 'Letra B — I, II, III e IV',
            detail: 'Aceita palma voltada para baixo (item IV).',
            correct:
              'Palma deve ficar para cima — IV é falso; B erra ao incluir pernas cruzadas implícitas e palma invertida.',
          },
          {
            label: 'Letra D — II, III e IV',
            detail: 'Exclui silêncio (item I) e aceita palma para baixo.',
            correct:
              'Conversa altera PA — I é verdadeiro; IV com palma para baixo e postura sem pernas descruzadas falha na técnica.',
          },
          {
            label: 'Letra E — I, II e IV',
            detail: 'Inclui IV e exclui posição sentada completa (III).',
            correct:
              'III descreve postura correta — E troca III por IV (palma errada).',
          },
        ],
        footer_rule: 'IV com palma para baixo elimina B — confirme C',
      },
    ],
  },

  'fau-unicentro-enfermagem-verificacao-de-sinais-vitais-1779343956155-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — campânula do estetoscópio sobre artéria braquial na fossa cubital durante ausculta PA',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estetoscópio na aferição PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Posicionamento correto da campânula do estetoscópio na PA — FAU UNICENTRO.',
            icon: 'Target',
          },
          {
            label: 'Artéria braquial',
            detail: 'Sítio de ausculta dos sons de Korotkoff — fossa cubital medial.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — radial',
            detail: 'Radial é para palpação de pulso — não para ausculta PA.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — poplítea',
            detail: 'Poplítea fica no joelho — PA braquial usa braquial.',
            icon: 'MapPin',
          },
          {
            label: 'Pegadinha — jugular/ouvidos',
            detail: 'Alternativas absurdas para técnica de PA no braço.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Campânula na braquial — sob manguito, fossa cubital',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: posicionamento da campânula na aferição de PA.',
          'Testar A — veia radial: local de punção/pulso, não ausculta PA → eliminar.',
          'Testar B — fossa poplítea: membro inferior → eliminar.',
          'Testar C — artéria braquial: sítio correto Korotkoff → candidata.',
          'Testar D — jugular: pescoço, não braço → eliminar.',
          'Testar E — ouvidos: uso do estetoscópio, não posição da campânula → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Braquial na fossa cubital → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ausculta PA',
        meta: slideMeta,
        content: 'BRAQUIAL · MANGUITO · KOROTKOFF',
        rows: [
          {
            label: 'Campânula',
            value: 'Sobre artéria braquial — medial à fossa cubital',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa C.',
          },
          {
            label: 'Manguito',
            value: '2–3 cm acima da fossa cubital — não sobre a campânula',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Radial',
            value: 'Palpação de pulso — não ausculta sistólica',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'Korotkoff',
            value: 'Sons audíveis na braquial durante deflação',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Membro',
            value: 'PA no braço — braquial; perna usa poplítea (outro contexto)',
            sv_kind: 'pa',
            badge: 'ok',
          },
        ],
        footer_rule: 'PA braço = braquial — não radial nem jugular',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESTETOSCÓPIO PA',
        items: [
          {
            label: 'Letra A — veia radial',
            detail: 'Confunde artéria de pulso com sítio auscultatório.',
            correct:
              'Radial palpa FC — sons de Korotkoff auscultam-se na artéria braquial.',
          },
          {
            label: 'Letra B — fossa poplítea',
            detail: 'Desloca ausculta para membro inferior.',
            correct:
              'PA padrão no braço usa braquial — poplítea é contexto de PA em perna.',
          },
          {
            label: 'Letra D — jugular',
            detail: 'Pescoço não é sítio de PA braquial.',
            correct:
              'Jugular avalia turgência venosa — não substitui ausculta braquial na PA.',
          },
          {
            label: 'Letra E — ouvidos',
            detail: 'Resposta meta sobre uso do aparelho.',
            correct:
              'Comando pede onde posicionar campânula — ouvidos recebem som, não definem sítio anatômico.',
          },
        ],
        footer_rule: 'Elimine pulso e jugular → braquial (C)',
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
    console.log(`[handcraft:sv-g08] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g08] total=${ok}`);
}

main();
