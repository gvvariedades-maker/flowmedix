#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g07 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g07.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g07';
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
    'fatores interferentes PA',
    'oximetria SpO₂',
    'indicações monitorização SV',
    'gráfico de prontuário',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'vitals_pa_tecnica' | 'vitals_interpretacao' | 'vitals_generico';

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
  'copese-ufpi-enfermagem-verificacao-de-sinais-vitais-1779344117207-6': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — Korotkoff: 1º som = sistólica · 5ª fase = diastólica · fatores interferentes na PA',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA — conceitos e V/F COPESE',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar cinco assertivas V/F sobre técnica, definição e Korotkoff na aferição de PA — COPESE UFPI.',
            icon: 'Target',
          },
          {
            label: 'Fatores interferentes',
            detail:
              'Sobrecarga física/emocional, fumo, álcool e manguito inadequado alteram a leitura — item I verdadeiro.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Definição de PA',
            detail:
              'Força do sangue contra a parede arterial — item II verdadeiro.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — sistólica × diastólica',
            detail:
              'Item III troca conceitos: pico na contração ventricular é sistólica, não diastólica → falso.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — fase Korotkoff',
            detail:
              'Diastólica = desaparecimento do último som (5ª fase MS) — não o 4º som isolado → item IV falso.',
            icon: 'Stethoscope',
          },
        ],
        footer_rule: 'Inverta sistólica/diastólica e confunda fases Korotkoff antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: cinco itens V/F sobre PA e Korotkoff.',
          'Julgar I — fatores interferentes (sobrecarga, fumo, álcool, manguito)? → VERDADEIRO.',
          'Julgar II — PA = força do sangue contra parede arterial? → VERDADEIRO.',
          'Julgar III — diastólica = pico na contração ventricular? → FALSO (isso é sistólica).',
          'Julgar IV — diastólica no 4º som Korotkoff? → FALSO (5ª fase = desaparecimento).',
          'Julgar V — PA em membros inferiores em situações especiais? → VERDADEIRO.',
          'Sequência: V, V, F, F, V.',
          'Eliminar A (V,V,F,V,V), C, D e E.',
          'Marcar B — V, V, F, F, V.',
        ],
        footer_rule: 'V, V, F, F, V → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Korotkoff e PA',
        meta: slideMeta,
        content: 'SISTÓLICA · DIASTÓLICA · INTERFERENTES',
        rows: [
          {
            label: 'Pressão sistólica',
            value: 'Pico durante ejeção ventricular — 1º som Korotkoff',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item III = F.',
          },
          {
            label: 'Pressão diastólica',
            value: '5ª fase — desaparecimento do último som na deflação',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item IV = F.',
          },
          {
            label: 'Fatores interferentes',
            value: 'Estresse, fumo, álcool, manguito inadequado, bexiga cheia',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item I = V.',
          },
          {
            label: 'Membros inferiores',
            value: 'PA pode ser aferida em MMII em situações especiais',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'Item V = V.',
          },
          {
            label: 'Definição PA',
            value: 'Força exercida pelo sangue sobre a parede arterial',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'Item II = V.',
          },
        ],
        footer_rule: 'Decore: sistólica = contração · diastólica = 5ª fase',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F PA COPESE',
        items: [
          {
            label: 'Letra A — aceita 4º som',
            detail: 'Sequência V,V,F,V,V marca item IV como verdadeiro.',
            correct:
              'Diastólica corresponde ao desaparecimento do último som (5ª fase) — item IV é falso, não verdadeiro.',
          },
          {
            label: 'Letra C — inverte item II',
            detail: 'Sequência V,F,V,F,V nega definição correta de PA.',
            correct:
              'PA é força do sangue contra parede arterial — item II é verdadeiro, não falso.',
          },
          {
            label: 'Letra D — nega fatores interferentes',
            detail: 'Sequência F,V,F,V,F invalida item I.',
            correct:
              'Sobrecarga, fumo, álcool e manguito inadequado interferem na PA — item I é verdadeiro.',
          },
          {
            label: 'Letra E — nega MMII',
            detail: 'Sequência F,V,F,V,V exclui aferição em membros inferiores.',
            correct:
              'Em situações especiais a PA pode ser verificada nos MMII — item V é verdadeiro.',
          },
        ],
        footer_rule: 'Só B fecha V,V,F,F,V sem erro de fase',
      },
    ],
  },

  'coseac-uff-enfermagem-verificacao-de-sinais-vitais-1779344105099-8': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — SV: detectar alteração precoce · baseline saúde · monitorar condição — não determinar idade',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Indicações da verificação de SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Assinalar combinação correta das indicações da verificação de sinais vitais — COSEAC UFF.',
            icon: 'Target',
          },
          {
            label: 'Detecção precoce',
            detail: 'Item I — identificar alterações orgânicas graves antes da deterioração — indicação clássica.',
            icon: 'Activity',
          },
          {
            label: 'Estado basal',
            detail: 'Item II — obter dados do estado usual de saúde do paciente — baseline.',
            icon: 'Clipboard',
          },
          {
            label: 'Pegadinha — idade exata',
            detail:
              'Item III propõe determinar idade — SV monitora condição, comunicar alteração à equipe e registrar no prontuário; não substitui identificação civil.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Monitorização contínua',
            detail: 'Item IV — monitorar condição ou identificar problemas — indicação correta.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'SV monitora condição clínica — não substitui identificação civil',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: indicações da verificação de SV — quais itens corretos?',
          'Julgar I — detectar precocemente alterações graves? → CORRETO.',
          'Julgar II — obter dados do estado usual de saúde? → CORRETO.',
          'Julgar III — determinar idade exata? → INCORRETO (absurdo clínico).',
          'Julgar IV — monitorar condição ou identificar problemas? → CORRETO.',
          'Combinação: I + II + IV.',
          'Eliminar B (inclui III), C, D e E (omitem IV ou incluem III).',
          'Marcar A — I, II e IV.',
        ],
        footer_rule: 'I + II + IV → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — para que aferir SV',
        meta: slideMeta,
        content: 'MONITORAR · DETECTAR · REGISTRAR',
        rows: [
          {
            label: 'Detecção precoce',
            value: 'Identificar alteração grave antes da deterioração clínica',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Baseline',
            value: 'Registrar estado usual de saúde na admissão',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Monitorização',
            value: 'Acompanhar evolução e identificar novos problemas',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Não é indicação',
            value: 'Determinar idade exata do paciente',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Comunicação',
            value: 'Comunicar alteração à equipe e registrar no prontuário',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Idade exata = distrator — elimine qualquer opção com III',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INDICAÇÕES SV',
        items: [
          {
            label: 'Letra B — inclui idade exata',
            detail: 'Combina II, III e IV — item III é falso.',
            correct:
              'SV não determina idade exata — indicações válidas são I, II e IV, não II+III+IV.',
          },
          {
            label: 'Letra C — I e III',
            detail: 'Mantém detecção precoce mas inclui item absurdo (idade).',
            correct:
              'Item III não é indicação de SV — monitorar condição exige comunicar alteração à equipe (item IV), não determinar idade.',
          },
          {
            label: 'Letra D — só III e IV',
            detail: 'Omite detecção precoce e baseline (I e II).',
            correct:
              'Indicações completas incluem detectar alteração grave e obter estado basal — não só III+IV.',
          },
          {
            label: 'Letra E — I e II sem IV',
            detail: 'Falta monitorar condição/identificar problemas.',
            correct:
              'Item IV (monitorização) é indicação correta — gabarito exige I, II e IV.',
          },
        ],
        footer_rule: 'Elimine III → confirme I + II + IV (A)',
      },
    ],
  },

  'coseac-uff-enfermagem-verificacao-de-sinais-vitais-1779344253939-5': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA: sentado · braço nível precórdio · 5 min repouso · manguito 2/3 braço · +30 mmHg · deflação 2–4 mmHg/s',
    roi_error: 'braco_nivel_figado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — protocolo COSEAC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar técnica correta para medir pressão arterial — COSEAC UFF.',
            icon: 'Target',
          },
          {
            label: 'Posição e repouso',
            detail: 'Paciente sentado, braço na altura do precórdio, ~5 minutos de repouso prévio.',
            icon: 'User',
          },
          {
            label: 'Manguito e insuflação',
            detail: 'Câmara cobre ≥2/3 da circunferência — inflar 30 mmHg acima do desaparecimento do pulso braquial.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — braço único',
            detail: 'Alternativas B e D medem só um braço e escolhem valor mais alto/baixo — incorreto na 1ª vez.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — braço fora do precórdio',
            detail:
              'Braço pendente, na altura do ombro ou abaixo do nível do coração — membro mal posicionado altera leitura pressórica.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sentado + precórdio + 5 min + 2/3 manguito + deflação lenta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica correta para medir PA.',
          'Testar A — sentado, braço precórdio, cinco minutos, manguito dois terços, insuflação acima do pulso, deflação lenta: protocolo MS → candidata.',
          'Testar B — um braço, valor mais alto: técnica incompleta → eliminar.',
          'Testar C — deitado, repouso curto: posição/tempo inadequados → eliminar.',
          'Testar D — um braço, valor mais baixo: erro de seleção → eliminar.',
          'Testar E — braço altura ombro, repouso prolongado: posição errada → eliminar.',
          'Confirmar: só A descreve técnica COSEAC/MS completa.',
          'Marcar A.',
        ],
        footer_rule: 'Precórdio + 5 min + deflação lenta → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA COSEAC',
        meta: slideMeta,
        content: 'POSIÇÃO · REPOUSO · MANGUITO · DEFLAÇÃO',
        rows: [
          {
            label: 'Posição',
            value: 'Sentado — braço apoiado na altura do precórdio (coração)',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Repouso pré-PA',
            value: 'Cerca de 5 minutos antes da 1ª medida',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Manguito',
            value: 'Bolsa cobre pelo menos 2/3 da circunferência braquial',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Insuflação',
            value: '30 mmHg acima do ponto em que o pulso braquial desaparece',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Deflação',
            value: 'Lenta e constante na auscultatória Korotkoff',
            sv_kind: 'pa',
            badge: 'hot',
          },
        ],
        footer_rule: 'Decore: precórdio ≠ ombro · repouso adequado antes da medida',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA PA COSEAC',
        items: [
          {
            label: 'Letra B — braço único, valor alto',
            detail: 'Na 1ª vez mede só um braço e considera o mais alto.',
            correct:
              'Protocolo MS afere ambos os braços na admissão — B simplifica incorretamente a técnica.',
          },
          {
            label: 'Letra C — deitado, repouso curto',
            detail: 'Paciente deitado com repouso insuficiente.',
            correct:
              'Posição padrão é sentado com braço ao nível do precórdio — deitado com repouso curto deixa membro fora do nível cardíaco.',
          },
          {
            label: 'Letra D — braço único, valor baixo',
            detail: 'Considera o valor mais baixo entre medidas em um só braço.',
            correct:
              'Seleção arbitrária do valor mais baixo ignora técnica bilateral na admissão — A é o protocolo completo.',
          },
          {
            label: 'Letra E — braço na altura do ombro',
            detail: 'Braço na altura do ombro com repouso prolongado.',
            correct:
              'Braço pendente ou na altura do ombro altera hidrostática — posição correta é apoio ao precórdio/coração.',
          },
        ],
        footer_rule: 'Elimine braço único e posição errada → A',
      },
    ],
  },

  'coseac-uff-enfermagem-verificacao-de-sinais-vitais-1779344253939-7': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — gráfico de prontuário: acompanhar oscilações de PA, pulso, FR, temperatura e sinais objetivos',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gráfico de prontuário — objetivo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Objetivo do gráfico nas anotações de enfermagem no prontuário — COSEAC Pref Niterói.',
            icon: 'Target',
          },
          {
            label: 'Oscilações dos SV',
            detail:
              'Gráfico traça evolução de PA, pulso, respiração e temperatura ao longo do tempo.',
            icon: 'Activity',
          },
          {
            label: 'Sinais objetivos',
            detail:
              'Também registra altura, perímetros, peso e PVC — tendência visual.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — eliminações',
            detail: 'Alternativas A, D e E focam volume de urina/dreno — balanço hídrico, não gráfico de SV.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — IMC isolado',
            detail: 'Alternativa C mistura SV com controle hídrico/IMC — incompleta frente a B.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Gráfico = tendência de SV + sinais objetivos — não balanço de eliminações',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: objetivo do gráfico no prontuário.',
          'Traduzir: gráfico acompanha oscilações dos parâmetros vitais e sinais objetivos.',
          'Testar A — volume de eliminações e PVC: foco em balanço, não gráfico de SV → eliminar.',
          'Testar B — oscilações PA, P, R, T + sinais objetivos (altura, PC, PT, peso, PVC): completo → candidata.',
          'Testar C — SV + IMC hidríco: parcial, omite sinais objetivos amplos → eliminar.',
          'Testar D — IMC + eliminações: sem foco em SV → eliminar.',
          'Testar E — eliminações + IMC: balanço hídrico → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Oscilações SV + sinais objetivos → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — registros gráficos',
        meta: slideMeta,
        content: 'GRÁFICO · SV · TENDÊNCIA',
        rows: [
          {
            label: 'Gráfico de SV',
            value: 'PA, pulso, FR, temperatura — evolução temporal',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Sinais objetivos',
            value: 'Altura, perímetros cefálico/torácico, peso, PVC',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Balanço hídrico',
            value: 'Volume de eliminações — registro distinto do gráfico de SV',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Controle hídrico',
            value: 'IMC e perda/ganho ponderal — planilha específica',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Finalidade',
            value: 'Visualizar tendência e detectar alteração precoce',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Gráfico ≠ balanço de eliminações',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GRÁFICO PRONTUÁRIO',
        items: [
          {
            label: 'Letra A — eliminações e PVC',
            detail: 'Descreve balanço de eliminações e medidas isoladas.',
            correct:
              'Gráfico de SV acompanha oscilações de PA, pulso, FR e T — não foco primário em volume urinário.',
          },
          {
            label: 'Letra C — SV + IMC hidríco',
            detail: 'Lista SV mas restringe a controle hídrico/IMC.',
            correct:
              'Objetivo do gráfico inclui sinais objetivos amplos (altura, perímetros, peso, PVC) — B é mais completa.',
          },
          {
            label: 'Letra D — IMC e eliminações',
            detail: 'Combina controle hídrico com eliminações sem SV central.',
            correct:
              'Comando pede objetivo do gráfico de SV — D desvia para balanço e IMC.',
          },
          {
            label: 'Letra E — checagem de eliminações',
            detail: 'Evolução de volume eliminado + IMC.',
            correct:
              'Gráfico de enfermagem para SV traça PA, pulso, FR e T — E descreve outro instrumento.',
          },
        ],
        footer_rule: 'Elimine balanço hídrico → confirme B',
      },
    ],
  },

  'coseac-uff-enfermagem-verificacao-de-sinais-vitais-1779344262940-0': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — gráfico: visualizar tendência de PA, pulso, FR, T e medidas objetivas no prontuário',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gráfico no prontuário — FMS Niterói',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Finalidade do gráfico nas anotações de enfermagem — COSEAC FMS Niterói (mesmo enunciado-base).',
            icon: 'Target',
          },
          {
            label: 'Traçado de SV',
            detail: 'Permite ver oscilações de PA, pulso, respiração e temperatura ao longo dos turnos.',
            icon: 'Activity',
          },
          {
            label: 'Medidas objetivas',
            detail: 'Inclui altura, perímetros, peso e pressão venosa central na mesma lógica gráfica.',
            icon: 'Ruler',
          },
          {
            label: 'Pegadinha — balanço',
            detail: 'Letras A, D e E descrevem eliminações urinárias/sanguíneas — outro tipo de registro.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — resposta parcial',
            detail: 'Letra C cita SV mas acrescenta só IMC hidríco — não cobre sinais objetivos do gabarito.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Filtre balanço hídrico antes de escolher a alternativa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: objetivo do gráfico no prontuário do paciente.',
          'Fixar: gráfico de enfermagem = tendência visual dos SV.',
          'Testar A — medidas de eliminações: balanço, não gráfico de SV → eliminar.',
          'Testar B — oscilações PA, P, R, T + sinais objetivos completos → candidata.',
          'Testar C — SV + IMC hidríco apenas: resposta incompleta → eliminar.',
          'Testar D — IMC + eliminações + altura: sem eixo de SV → eliminar.',
          'Testar E — evolução de eliminações: balanço hídrico → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Tendência de SV + objetivos → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — instrumentos de registro',
        meta: slideMeta,
        content: 'GRÁFICO · BALANÇO · SV',
        rows: [
          {
            label: 'Gráfico enfermagem',
            value: 'PA, P, R, T — linha do tempo clínica',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Sinais objetivos no gráfico',
            value: 'Altura, PC, PT, peso, PVC',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Balanço hídrico',
            value: 'Entradas × saídas — planilha separada',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Eliminações',
            value: 'Urina, dreno, sangramento — não definem o gráfico de SV',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Leitura gráfica',
            value: 'Identificar padrão e alteração precoce',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Gráfico SV ≠ planilha de eliminações',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — REGISTRO GRÁFICO FMS',
        items: [
          {
            label: 'Letra A — volume de eliminações',
            detail: 'Foco em urina, sangue e dreno com PVC.',
            correct:
              'Objetivo do gráfico é observar oscilações de SV — eliminações pertencem a outro registro.',
          },
          {
            label: 'Letra C — SV + IMC hidríco',
            detail: 'Menciona PA, P, R, T mas limita a controle hídrico.',
            correct:
              'Gráfico abrange também altura, perímetros, peso e PVC — B descreve o escopo completo.',
          },
          {
            label: 'Letra D — IMC e eliminações',
            detail: 'Prioriza controle hídrico e balanço.',
            correct:
              'Comando pede finalidade do gráfico de SV — D não centraliza PA, pulso, FR e T.',
          },
          {
            label: 'Letra E — checagem de eliminações',
            detail: 'Evolução diária de volume eliminado.',
            correct:
              'Gráfico de enfermagem traça parâmetros vitais — E descreve balanço de eliminações.',
          },
        ],
        footer_rule: 'Resposta completa = oscilações SV + objetivos (B)',
      },
    ],
  },

  'coseac-uff-geral-verificacao-de-sinais-vitais-1779344253939-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — evitar aferir PA em membro com acesso venoso contínuo ou procedimento que comprometa circulação local',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV — o que NÃO fazer na PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Procedimento de SV em que NÃO se deve aferir PA — COSEAC UFF (negativa).',
            icon: 'Target',
          },
          {
            label: 'Lógica do comando',
            detail: 'Buscar alternativa absurda ou tecnicamente proibida — banca usa termos inventados.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — termos fictícios',
            detail: '“Esvaziamento ganglionar/insuflamento ganglionar” não são procedimentos reais de enfermagem.',
            icon: 'XCircle',
          },
          {
            label: 'Acesso venoso',
            detail: 'Membro com infusão EV contínua é local a evitar para manguito — parte da alternativa B.',
            icon: 'HeartPulse',
          },
          {
            label: 'Distratores plausíveis',
            detail: 'A, C, D e E citam restrições parcialmente aceitáveis — não são o “NÃO se deve” absurdo.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'NÃO se deve = alternativa com procedimento inexistente ou absurdo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: na aferição de SV, NÃO se deve…',
          'Ler A — esvaziamento biliar + SC contínua: restritivo mas não o foco do gabarito → eliminar.',
          'Ler B — esvaziamento ganglionar + EV contínua: termos fictícios/absurdos → candidata (NÃO se deve).',
          'Ler C — retorno linfático + IM: parcialmente plausível → eliminar.',
          'Ler D — insuflamento ganglionar + EV intermitente: termo inventado → eliminar como distrator secundário.',
          'Ler E — retorno linfático + EV intermitente: plausível → eliminar.',
          'Confirmar: B descreve conduta inexistente — é o que NÃO se deve.',
          'Marcar B.',
        ],
        footer_rule: 'Procedimento fictício → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítio de aferição PA',
        meta: slideMeta,
        content: 'MEMBRO · ACESSO · CIRCULAÇÃO',
        rows: [
          {
            label: 'Evitar membro com EV',
            value: 'Não aferir PA no braço com infusão venosa contínua ativa',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Fístula / acesso vascular',
            value: 'Não usar membro com acesso dedicado ou procedimento local',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Braço livre',
            value: 'Preferir membro sem dispositivos invasivos',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Termos reais',
            value: 'Procedimentos documentados — desconfie de “ganglionar” inventado',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Registro',
            value: 'Anotar membro aferido e condição do paciente',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Desconfie de procedimentos que não existem na prática',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÃO SE DEVE PA',
        items: [
          {
            label: 'Letra A — esvaziamento biliar',
            detail: 'Menciona esvaziamento biliar e SC contínua.',
            correct:
              'Restrição parcialmente plausível — o gabarito aponta conduta com termo fictício “esvaziamento ganglionar” (B).',
          },
          {
            label: 'Letra C — retorno linfático + IM',
            detail: 'Cita retorno linfático e aplicação intramuscular.',
            correct:
              'Combinação mais aceitável clinicamente — não é o absurdo que a banca marca como NÃO se deve.',
          },
          {
            label: 'Letra D — insuflamento ganglionar',
            detail: 'Termo “insuflamento ganglionar” é inventado.',
            correct:
              'Embora absurdo, o gabarito oficial é B (esvaziamento ganglionar + EV contínua) — D é distrator paralelo.',
          },
          {
            label: 'Letra E — retorno linfático + EV intermitente',
            detail: 'Descreve locais com retorno linfático e EV intermitente.',
            correct:
              'Restrição parcial — comando COSEAC fecha com B por combinar termo fictício + EV contínua.',
          },
        ],
        footer_rule: 'B = procedimento inexistente — gabarito da prova',
      },
    ],
  },

  'cotec-fadenor-enfermagem-verificacao-de-sinais-vitais-1779344189558-2': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline: 'MS/COES — estratificação SRAG COVID: oxímetro de pulso (SpO₂) não invasivo por LED vermelho/infravermelho',
    roi_error: 'oximetro_substitui_palpacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SpO₂ na estratificação COVID',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Na síndrome gripal/COVID-19, instrumento APS para estratificação de risco SRAG que mede saturação de oxigênio na hemoglobina — COTEC Fadenor.',
            icon: 'Target',
          },
          {
            label: 'Estratificação SRAG',
            detail:
              'APS identifica casos graves de síndrome respiratória aguda grave — SpO₂ é parâmetro-chave na avaliação clínica.',
            icon: 'Activity',
          },
          {
            label: 'Oxímetro de pulso',
            detail:
              'Sensor não invasivo com LED vermelho e infravermelho — mede SpO₂ de forma contínua, simples e indolor.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — termômetro',
            detail: 'Mede temperatura corporal — não saturação arterial de oxigênio transportada pela hemoglobina.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — esfigmomanômetro',
            detail: 'Afere pressão arterial em mmHg — não oxigenação na estratificação gripal.',
            icon: 'Gauge',
          },
        ],
        footer_rule: 'SRAG/COVID + saturação hemoglobina → oxímetro — não PA nem temperatura',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: instrumento COES MINAS para SpO₂ na estratificação de risco da síndrome gripal (COVID-19) na APS.',
          'Contexto: avaliação clínica com anamnese e exame físico — detectar SRAG precocemente.',
          'Traduzir: saturação de O₂ na hemoglobina por sensor óptico não invasivo (vermelho/infravermelho).',
          'Testar A — termômetro: mede temperatura → eliminar.',
          'Testar B — esfigmomanômetro: mede PA → eliminar.',
          'Testar C — oxímetro: SpO₂ contínua e indolor → candidata.',
          'Testar D — otoscópio: exame de ouvido → eliminar.',
          'Testar E — sonar: termo inadequado → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'SpO₂ não invasiva na SRAG → oxímetro → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — oximetria de pulso',
        meta: slideMeta,
        content: 'SpO₂ · OXÍMETRO · SRAG',
        rows: [
          {
            label: 'Oxímetro de pulso',
            value: 'SpO₂ — LED vermelho/infravermelho, não invasivo',
            sv_kind: 'spo2',
            badge: 'hot',
          },
          {
            label: 'SRAG / COVID',
            value: 'SpO₂ baixa sugere gravidade — estratificação na APS',
            sv_kind: 'spo2',
            badge: 'hot',
          },
          {
            label: 'Esfigmomanômetro',
            value: 'Pressão arterial em mmHg — função distinta',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Termômetro',
            value: 'Temperatura corporal — não oxigenação',
            sv_kind: 'temp',
            badge: 'warn',
          },
          {
            label: 'Limitação',
            value: 'Oxímetro complementa — não substitui avaliação clínica completa',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore: SpO₂ = oxímetro de dedo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EQUIPAMENTO SpO₂',
        items: [
          {
            label: 'Letra A — termômetro',
            detail: 'Instrumento para temperatura axilar/oral/retal.',
            correct:
              'Saturação de oxigênio exige oxímetro — termômetro não mede SpO₂.',
          },
          {
            label: 'Letra B — esfigmomanômetro',
            detail: 'Equipamento de pressão arterial com manguito.',
            correct:
              'PA e SpO₂ são parâmetros distintos — estratificação gripal usa oxímetro, não esfigmomanômetro.',
          },
          {
            label: 'Letra D — otoscópio',
            detail: 'Exame do canal auditivo e membrana timpânica.',
            correct:
              'Otoscópio não avalia oxigenação sanguínea — resposta é oxímetro (C).',
          },
          {
            label: 'Letra E — sonar',
            detail: 'Termo sem uso em aferição de SV.',
            correct:
              'Equipamento válido para SpO₂ é oxímetro de pulso — E é distrator sem sentido clínico.',
          },
        ],
        footer_rule: 'Elimine T e PA → confirme oxímetro (C)',
      },
    ],
  },

  'cpcon-uepb-enfermagem-verificacao-de-sinais-vitais-1778969745165-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — manguito: cobrir ~80% do braço adulto · estreito = PA alta falsa · frouxo = PA baixa falsa',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Manguito — técnica CPCON',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinalar alternativa CORRETA sobre aferição de PA — CPCON UEPB.',
            icon: 'Target',
          },
          {
            label: 'Tamanho do manguito',
            detail: 'Bolsa deve circundar cerca de 80% do braço adulto — e todo o braço infantil.',
            icon: 'Ruler',
          },
          {
            label: 'Pegadinha — dimensões fixas',
            detail: 'Alternativa A fixa 22–23 cm — manguito depende da circunferência do paciente.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — apertado/frouxo invertido',
            detail: 'C inverte: apertado eleva leitura; frouxo reduz — memorize a direção.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — posição do braço',
            detail: 'D coloca braço abaixo do coração nas pernas — eleva erro de medida.',
            icon: 'User',
          },
        ],
        footer_rule: '80% do braço · estreito = alto falso · braço ao nível do coração',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre aferição de PA.',
          'Testar A — largura fixa 22–23 cm: ignora individualização → eliminar.',
          'Testar B — 80% do braço adulto e todo braço infantil: regra MS → candidata.',
          'Testar C — apertado = baixo / frouxo = alto: inverte direção do erro → eliminar.',
          'Testar D — braço apoiado nas pernas abaixo do coração: posição errada → eliminar.',
          'Testar E — deitado, braço na cama, pernas flexionadas: não é a assertiva correta do gabarito → eliminar.',
          'Confirmar: só B descreve tamanho adequado do manguito.',
          'Marcar B.',
        ],
        footer_rule: '80% circunferência braquial → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — manguito × leitura',
        meta: slideMeta,
        content: 'MANGUITO · 80% · ERRO SISTEMÁTICO',
        rows: [
          {
            label: 'Cobertura ideal',
            value: '~80% da circunferência braquial no adulto',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Pediatria',
            value: 'Manguito cobre todo o braço infantil proporcionalmente',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Manguito estreito',
            value: 'PA falsamente elevada',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Manguito largo/frouxo',
            value: 'PA falsamente baixa',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Posição braço',
            value: 'Nível do coração — não pendente nem abaixo nas pernas',
            sv_kind: 'pa',
            badge: 'hot',
          },
        ],
        footer_rule: 'Estreito = alto falso · frouxo = baixo falso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANGUITO CPCON',
        items: [
          {
            label: 'Letra A — medida fixa',
            detail: 'Largura 22–23 cm para todo adulto.',
            correct:
              'Manguito deve ser escolhido pela circunferência do braço (~80%) — não tamanho único fixo.',
          },
          {
            label: 'Letra C — inverte apertado/frouxo',
            detail: 'Apertado causa baixa e frouxo causa alta.',
            correct:
              'Manguito apertado eleva a leitura; frouxo reduz — C inverte a direção clássica do erro.',
          },
          {
            label: 'Letra D — braço nas pernas',
            detail: 'Braço apoiado nas pernas abaixo do coração.',
            correct:
              'Membro abaixo do nível cardíaco altera hidrostática — posição correta é apoio ao precórdio.',
          },
          {
            label: 'Letra E — deitado pernas flexionadas',
            detail: 'Paciente deitado com braço na cama.',
            correct:
              'Assertiva E não descreve critério de tamanho do manguito — B é a regra de 80% do braço.',
          },
        ],
        footer_rule: 'Elimine inversão e medida fixa → confirme B',
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
    console.log(`[handcraft:sv-g07] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g07] total=${ok}`);
}

main();
