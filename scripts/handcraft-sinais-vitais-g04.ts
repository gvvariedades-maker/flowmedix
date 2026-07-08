#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g04 (8 slugs P0 vitals_pa_tecnica + SpO₂ + 5º SV).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g04.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g04';
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
    'temperatura axilar',
    'técnica de aferição PA',
    'fases de Korotkoff',
    'oximetria SpO₂',
    'quinto sinal vital — dor',
    'PA invasiva UTI',
    'equipamentos SV',
    'postura MS na PA',
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
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343845367-2': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline: 'MS/COFEN — oxímetro de pulso mede saturação periférica de oxigênio (SpO₂), não PA, FC, FR ou temperatura',
    roi_error: 'oximetro_substitui_palpacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Oxímetro de pulso — função',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Identificar o parâmetro medido pelo oxímetro de pulso (clip digital no dedo).',
            icon: 'Target',
          },
          {
            label: 'Oximetria de pulso',
            detail: 'Sensor não invasivo estima SpO₂ — percentual de hemoglobina saturada com O₂.',
            icon: 'Activity',
          },
          {
            label: 'Não confundir com',
            detail: 'Pulso radial (palpação), PA (manguito), FR (observação) e T (termômetro) usam outros métodos.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — “pulso” no nome',
            detail: 'Oxímetro mede saturação, não conta batimentos — banca troca por pulso radial ou PA.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Complemento clínico',
            detail: 'SpO₂ avalia oxigenação; FR e esforço respiratório completam a avaliação respiratória.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Oxímetro = SpO₂ — não substitui aferição completa de SV',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: o oxímetro de pulso é utilizado para medir:',
          'Fixar: clip de oximetria → saturação periférica de oxigênio (SpO₂).',
          'Testar A — pulso radial: palpação manual de FC → eliminar.',
          'Testar B — pressão arterial: esfigmomanômetro/manguito → eliminar.',
          'Testar C — frequência respiratória: contagem de incursões → eliminar.',
          'Testar D — saturação de oxigênio: função do oxímetro → candidata.',
          'Testar E — temperatura corporal: termômetro → eliminar.',
          'Confirmar: só D descreve o parâmetro do equipamento.',
          'Marcar D.',
        ],
        footer_rule: 'Oxímetro → SpO₂ → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — oximetria',
        meta: slideMeta,
        content: 'SpO₂ · OXÍMETRO · OXIGENAÇÃO',
        rows: [
          {
            label: 'Oxímetro de pulso',
            value: 'Mede saturação periférica de oxigênio (SpO₂)',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'SpO₂ adequada',
            value: '≥95% em ar ambiente (referência adulto saudável)',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Pulso radial',
            value: 'Palpação/relógio — frequência cardíaca, não SpO₂',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'PA',
            value: 'Esfigmomanômetro + estetoscópio (auscultatório)',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Limitação',
            value: 'SpO₂ complementa FR — não substitui avaliação respiratória completa',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Decore: oxímetro = saturação, não pulso nem PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OXÍMETRO DE PULSO',
        items: [
          {
            label: 'Letra A — pulso radial',
            detail: 'Confunde palpação de artéria radial com função do oxímetro.',
            correct:
              'Pulso radial mede frequência cardíaca por palpação — oxímetro lê SpO₂ por sensor óptico no dedo.',
          },
          {
            label: 'Letra B — pressão arterial',
            detail: 'Atribui ao oxímetro função do esfigmomanômetro.',
            correct:
              'PA exige manguito e (na técnica auscultatória) estetoscópio — oxímetro não mede mmHg.',
          },
          {
            label: 'Letra C — frequência respiratória',
            detail: 'Mistura oxigenação com contagem de respirações.',
            correct:
              'FR é contada por observação/incursões torácicas — oxímetro não substitui contagem respiratória.',
          },
          {
            label: 'Letra E — temperatura corporal',
            detail: 'Equipamento térmico diferente do sensor de SpO₂.',
            correct:
              'Temperatura usa termômetro (axilar, oral, timpânica) — oxímetro não afere graus Celsius.',
          },
        ],
        footer_rule: 'Elimine outros SV → SpO₂ (D)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343845367-3': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — monitorização arterial invasiva (linha arterial) em UTI mede PA contínua invasiva — distinta de oximetria e glicemia capilar',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Monitorização arterial — UTI',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Finalidade da monitorização arterial em terapia intensiva.',
            icon: 'Target',
          },
          {
            label: 'Linha arterial',
            detail: 'Cateter em artéria (ex.: radial) → transdutor → PA invasiva contínua em mmHg.',
            icon: 'HeartPulse',
          },
          {
            label: 'Contexto UTI',
            detail: 'Paciente crítico exige leitura contínua e precisa de pressão — não oximetria isolada.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — saturação',
            detail: 'SpO₂ é oxímetro de pulso não invasivo — função distinta da linha arterial.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — glicemia/oral',
            detail: 'Coleta para glicemia e medicação oral não são finalidade da monitorização arterial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Linha arterial = PA invasiva contínua',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: em UTI, monitorização arterial é utilizada para:',
          'Traduzir: cateter intra-arterial + transdutor → pressão arterial invasiva.',
          'Testar A — saturação periférica: função do oxímetro, não da linha arterial → eliminar.',
          'Testar B — glicemia capilar: punção para glicose, procedimento distinto → eliminar.',
          'Testar C — medicação oral: via enteral, não monitorização → eliminar.',
          'Testar D — PA invasiva: finalidade clássica da linha arterial → candidata.',
          'Testar E — frequência respiratória: observação/contagem, não linha arterial → eliminar.',
          'Confirmar: só D descreve monitorização arterial.',
          'Marcar D.',
        ],
        footer_rule: 'UTI + linha arterial → PA invasiva → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — métodos de PA',
        meta: slideMeta,
        content: 'INVASIVA × NÃO INVASIVA',
        rows: [
          {
            label: 'PA invasiva',
            value: 'Cateter arterial + transdutor — monitorização contínua UTI',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'PA não invasiva',
            value: 'Esfigmomanômetro (auscultatório ou oscilatório)',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'SpO₂',
            value: 'Oxímetro de pulso — saturação, não pressão',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Glicemia capilar',
            value: 'Glicosímetro + fita — glicose, não PA',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Indicação UTI',
            value: 'Instabilidade hemodinâmica — necessidade de PA contínua',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Linha arterial ≠ oxímetro ≠ glicosímetro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MONITORIZAÇÃO ARTERIAL',
        items: [
          {
            label: 'Letra A — saturação periférica',
            detail: 'Atribui função de oximetria à linha arterial.',
            correct:
              'SpO₂ é medida por oxímetro de pulso — monitorização arterial mede pressão invasiva em mmHg.',
          },
          {
            label: 'Letra B — glicemia',
            detail: 'Confunde punção capilar para glicose com cateter arterial.',
            correct:
              'Glicemia capilar usa glicosímetro — linha arterial destina-se à hemodinâmica (PA), não glicose.',
          },
          {
            label: 'Letra C — medicação oral',
            detail: 'Via de administração, não finalidade de monitor.',
            correct:
              'Medicação oral é terapêutica — cateter arterial serve para aferir PA invasiva continuamente.',
          },
          {
            label: 'Letra E — frequência respiratória',
            detail: 'Parâmetro respiratório mensurado por observação.',
            correct:
              'FR não é lida por transdutor arterial — linha arterial monitora pressão sanguínea.',
          },
        ],
        footer_rule: 'Descarte oximetria e glicemia → PA invasiva (D)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343897104-3': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline: 'COFEN/OMS — dor como 5º sinal vital: experiência subjetiva avaliada por escalas (EVA, EVN)',
    roi_error: 'sv_quinto_sinal_dor',
    slides: [
      {
        type: 'concept_map',
        slide_title: '5º sinal vital — dor subjetiva',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Entre os cinco sinais vitais, qual é experiência subjetiva do paciente com escalas EVA/EVN?',
            icon: 'Target',
          },
          {
            label: 'Quatro SV objetivos',
            detail: 'PA, T, FC e FR são mensuráveis diretamente por equipamento ou observação.',
            icon: 'Activity',
          },
          {
            label: 'Dor — subjetiva',
            detail: 'Relato individual; escalas visuais analógica e numérica quantificam percepção.',
            icon: 'Heart',
          },
          {
            label: 'EVA / EVN',
            detail: 'Ferramentas padronizadas para dor — reforçam caráter subjetivo do 5º sinal.',
            icon: 'Clipboard',
          },
          {
            label: 'Pegadinha — objetivo × subjetivo',
            detail:
              'Banca lista frequência cardíaca (60–100 bpm objetivo) ou temperatura — distraem do 5º sinal subjetivo (dor, EVA/EVN).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'EVA/EVN → dor = único subjetivo entre as opções',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual SV é experiência subjetiva com escalas EVA/EVN?',
          'Critério: subjetivo = relato do paciente, não só instrumento objetivo.',
          'Testar A — FC: batimentos mensuráveis → eliminar.',
          'Testar B — FR: incursões contadas → eliminar.',
          'Testar C — dor: subjetiva, escalas EVA/EVN → candidata.',
          'Testar D — temperatura: termômetro, valor objetivo → eliminar.',
          'Testar E — PA: esfigmomanômetro, mmHg objetivo → eliminar.',
          'Confirmar: só dor combina subjetividade + escalas citadas.',
          'Marcar C.',
        ],
        footer_rule: 'Subjetivo + EVA/EVN → dor → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 5 sinais vitais',
        meta: slideMeta,
        content: '4 OBJETIVOS + 1 SUBJETIVO',
        rows: [
          {
            label: 'SV clássicos',
            value: 'PA · temperatura · FC · FR — mensuráveis',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: '5º sinal vital',
            value: 'Dor — experiência subjetiva multidimensional',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Escalas de dor',
            value: 'EVA (analógica) · EVN (numérica) — relato do paciente',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'FC adulto',
            value: '60–100 bpm — parâmetro objetivo',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'FR adulto',
            value: '12–20 irpm — parâmetro objetivo',
            sv_kind: 'fr',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore: dor é o único subjetivo entre as letras',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 5º SINAL VITAL',
        items: [
          {
            label: 'Letra A — frequência cardíaca',
            detail: 'FC é contagem de batimentos — parâmetro fisiológico objetivo.',
            correct:
              'Pulso/FC mensuram ritmo cardíaco numericamente — não captam experiência subjetiva com EVA/EVN.',
          },
          {
            label: 'Letra B — frequência respiratória',
            detail: 'FR é observação/contagem de incursões.',
            correct:
              'FR é SV mensurável por observação — escalas de dor não se aplicam à respiração objetiva.',
          },
          {
            label: 'Letra D — temperatura',
            detail: 'Temperatura é aferida com termômetro — valor numérico objetivo.',
            correct:
              'Temperatura corporal é mensuração direta em °C — diferente da percepção subjetiva da dor.',
          },
          {
            label: 'Letra E — pressão arterial',
            detail: 'PA mede força do sangue nos vasos — parâmetro objetivo.',
            correct:
              'PA em mmHg é mensuração instrumental — o 5º sinal vital subjetivo é a dor (C).',
          },
        ],
        footer_rule: 'Objetivo ≠ subjetivo — dor fecha letra C',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343897104-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — cada SV tem técnica e equipamento próprios; não existe procedimento único inalterado para todos',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidados na aferição — INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'SSVV refletem funções circulatórias, respiratórias, neurais e endócrinas — assinale a alternativa mal elaborada.',
            icon: 'Target',
          },
          {
            label: 'Equipamento adequado',
            detail: 'Manguito/termômetro proporcionais à idade e sítio correto — conduta correta (A).',
            icon: 'Stethoscope',
          },
          {
            label: 'Histórico clínico',
            detail: 'Medicamentos e comorbidades alteram SV — conduta correta (B).',
            icon: 'Clipboard',
          },
          {
            label: 'Fatores ambientais',
            detail: 'Ruído, temperatura ambiente e estresse interferem — conduta correta (C).',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — padrão único',
            detail: 'Alternativa D propõe abordagem unificada inalterada — falso: PA ≠ T ≠ FC ≠ FR.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Interpretação integrada',
            detail: 'SV devem ser analisados em conjunto — conduta correta (E).',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Avaliação física integrada — cada SV tem técnica própria, não padrão único',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: há uma alternativa mal elaborada — assinale-a (INCORRETA).',
          'Formato: quatro afirmativas corretas + uma falsa.',
          'Validar A — equipamento e sítio adequados: conduta MS → correta, eliminar.',
          'Validar B — histórico e medicamentos: conduta MS → correta, eliminar.',
          'Validar C — controlar fatores ambientais: conduta MS → correta, eliminar.',
          'Testar D — abordagem unificada padrão inalterado: cada SV tem técnica distinta → FALSA → candidata.',
          'Validar E — não interpretar SV isoladamente: conduta MS → correta, eliminar.',
          'Confirmar: só D nega a individualização técnica.',
          'Marcar D.',
        ],
        footer_rule: 'Procedimento único inalterado é falso → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cuidados na aferição',
        meta: slideMeta,
        content: 'TÉCNICA POR PARÂMETRO',
        rows: [
          {
            label: 'PA',
            value: 'Repouso ~5 min · manguito 2–3 cm acima cotovelo · nível coração',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Temperatura',
            value: 'Termômetro · sítio conforme protocolo (axilar, oral, timpânica)',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'FC / FR',
            value: 'Relógio · 1 min · sem alertar paciente (FR)',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'Equipamento',
            value: 'Tamanho e calibragem conforme idade — conduta correta da letra A',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Erro da letra D',
            value: 'Não existe “padrão inalterado” único para todos os SV',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Cada parâmetro = instrumento + técnica específicos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA SOBRE SSVV',
        items: [
          {
            label: 'Letra A — equipamento adequado',
            detail: 'Assegurar funcionalidade e tamanho correto do equipamento.',
            correct:
              'Conduta correta MS — manguito e termômetro devem ser proporcionais; A não é a mal elaborada.',
          },
          {
            label: 'Letra B — histórico clínico',
            detail: 'Relacionar medicamentos e doenças preexistentes aos SV.',
            correct:
              'Conhecer histórico é cuidado essencial — B é afirmativa verdadeira, não a INCORRETA.',
          },
          {
            label: 'Letra C — fatores ambientais',
            detail: 'Minimizar interferências externas na aferição.',
            correct:
              'Controlar ambiente (ruído, estresse) é recomendação válida — C não é a falsa.',
          },
          {
            label: 'Letra E — interpretação integrada',
            detail: 'Analisar SV em conjunto, não isoladamente.',
            correct:
              'Visão holística dos SV é conduta correta — E é verdadeira; a falsa propõe padrão único (D).',
          },
        ],
        footer_rule: 'A,B,C,E são cuidados corretos — falsa = D',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343897104-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA auscultatória: sons de Korotkoff · FC ≠ FR · 5º SV = dor · técnico também afera SV',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Conceitos sobre SV — CORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Avaliação efetiva do estado de saúde geral — assinale a alternativa elaborada corretamente.',
            icon: 'Target',
          },
          {
            label: 'PA e Korotkoff',
            detail: 'Técnica auscultatória usa sons de Korotkoff na deflação do manguito — afirmativa D correta.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha A — só enfermeiro',
            detail: 'Técnico de enfermagem também verifica SV — atribuição não exclusiva do enfermeiro.',
            icon: 'User',
          },
          {
            label: 'Pegadinha B — consciência',
            detail: '5º sinal vital clássico é dor, não nível de consciência.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha C — FC = FR',
            detail: 'FC são batimentos cardíacos; FR são movimentos respiratórios — conceitos distintos.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha E — T 3×/dia',
            detail: 'Frequência de T depende de gravidade — não regra fixa de três vezes ao dia.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'Teste cada afirmativa — só D descreve PA/Korotkoff corretamente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinale alternativa corretamente elaborada.',
          'Testar A — SV só atribuição do enfermeiro: técnico também afera → eliminar.',
          'Testar B — 5 medidas incluem consciência: 5º SV é dor → eliminar.',
          'Testar C — FC = movimentos respiratórios: confunde FC com FR → eliminar.',
          'Testar D — PA por sons de Korotkoff: semiologia correta → candidata.',
          'Testar E — temperatura só 3×/dia: frequência rígida falsa → eliminar.',
          'Confirmar: só D é assertiva correta.',
          'Marcar D.',
        ],
        footer_rule: 'Korotkoff + PA auscultatória → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SV e Korotkoff',
        meta: slideMeta,
        content: 'KOROTKOFF · 5 SV · FC × FR',
        rows: [
          {
            label: 'Sons de Korotkoff',
            value: 'Ruídos na braquial durante deflação — técnica auscultatória PA',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: '5º sinal vital',
            value: 'Dor (subjetiva) — não nível de consciência',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'FC',
            value: 'Batimentos cardíacos/min — palpação ou monitor',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'FR',
            value: 'Incursões respiratórias/min — observação',
            sv_kind: 'fr',
            badge: 'ok',
          },
          {
            label: 'Atribuição',
            value: 'Técnico e enfermeiro aferem SV conforme protocolo',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'FC ≠ FR · 5º SV = dor · Korotkoff = PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONCEITOS SOBRE SV',
        items: [
          {
            label: 'Letra A — só enfermeiro',
            detail: 'Restringe aferição de SV exclusivamente ao enfermeiro.',
            correct:
              'Técnico de enfermagem também verifica SV na rotina — atribuição não é exclusiva do enfermeiro.',
          },
          {
            label: 'Letra B — consciência como 5º SV',
            detail: 'Lista nível de consciência entre as cinco medidas principais.',
            correct:
              'O 5º sinal vital reconhecido é a dor — consciência é avaliação neurológica distinta.',
          },
          {
            label: 'Letra C — FC = respiração',
            detail: 'Define FC pelos movimentos inspiratório/expiratório.',
            correct:
              'FC mede batimentos cardíacos — movimentos respiratórios definem FR, não FC.',
          },
          {
            label: 'Letra E — temperatura 3×/dia',
            detail: 'Fixa frequência rígida de aferição de temperatura.',
            correct:
              'Frequência de T depende da condição clínica — não há regra universal de apenas três vezes ao dia.',
          },
        ],
        footer_rule: 'Elimine erros conceituais → confirme D (Korotkoff)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343904263-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA: braçadeira 2–3 cm acima do cotovelo · nível do coração · velcro snug (1–2 dedos) · ovinas sobre braquial · válvula anti-horário para deflação · silêncio na medida',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — protocolo MS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Procedimentos corretos para aferição de PA — assinale a alternativa certa.',
            icon: 'Target',
          },
          {
            label: 'Posição do manguito',
            detail: 'Braçadeira ~2–3 cm acima do cotovelo, alinhada ao nível do coração/precórdio.',
            icon: 'HeartPulse',
          },
          {
            label: 'Velcro do manguito',
            detail: 'Fechamento snug — permite passar 1–2 dedos, não 8–10 (pegadinha B).',
            icon: 'Ruler',
          },
          {
            label: 'Estetoscópio',
            detail: 'Ovinas sobre artéria braquial na fossa antecubital — não “acima” comprimindo (pegadinha C).',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinhas D e E',
            detail: 'Válvula abre no sentido anti-horário; evitar conversar e oferecer água durante a medida.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Manguito 2–3 cm · nível coração · velcro snug · silêncio',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinale alternativa correta sobre técnica de PA.',
          'Testar A — manguito 2–3 cm acima cotovelo, nível coração: protocolo MS → candidata.',
          'Testar B — velcro para 8–10 dedos: frouxo demais, leitura errada → eliminar.',
          'Testar C — ovinas acima da braquial na fossa: posicionamento incorreto → eliminar.',
          'Testar D — válvula horário para abrir: sentido invertido → eliminar.',
          'Testar E — conversar e dar água na medida: interfere na PA → eliminar.',
          'Confirmar: só A descreve posicionamento correto do manguito.',
          'Marcar A.',
        ],
        footer_rule: '2–3 cm + nível coração → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA',
        meta: slideMeta,
        content: 'MANGUITO · ESTETOSCÓPIO · DEFLAÇÃO',
        rows: [
          {
            label: 'Posição manguito',
            value: '2–3 cm acima do cotovelo · nível do coração',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Velcro',
            value: 'Snug — 1–2 dedos entre manguito e braço',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Ovinas',
            value: 'Sobre artéria braquial — contato leve, sem compressão',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Válvula',
            value: 'Abrir no sentido anti-horário para deflação lenta',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Repouso',
            value: '~5 min sentado · sem falar · braço apoiado',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore posição do manguito — âncora do lote g04',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA DE PA',
        items: [
          {
            label: 'Letra B — velcro 8–10 dedos',
            detail: 'Propõe fechamento extremamente frouxo do manguito.',
            correct:
              'Manguito frouxo subestima PA — o correto é snug com 1–2 dedos, não oito a dez.',
          },
          {
            label: 'Letra C — ovinas acima da braquial',
            detail: 'Posiciona estetoscópio acima da artéria com compressão.',
            correct:
              'Ovinas devem repousar sobre a artéria braquial na fossa antecubital — posição C está errada.',
          },
          {
            label: 'Letra D — válvula horário',
            detail: 'Inverte sentido de abertura da válvula de ar.',
            correct:
              'Deflação exige abrir a válvula no sentido anti-horário — horário é erro técnico clássico.',
          },
          {
            label: 'Letra E — conversar e hidratar',
            detail: 'Permite conversa e ingestão de água durante a aferição.',
            correct:
              'Falar e ingerir líquidos alteram PA — paciente deve permanecer em repouso e silêncio.',
          },
        ],
        footer_rule: 'Elimine erros de técnica → confirme A',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343904263-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — esfigmomanômetro: equipamento para medir PA (manguito + manômetro + insuflação)',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Equipamento PA — imagem',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Nomear equipamento assinalado na imagem de aferição de PA (item 1).',
            icon: 'Target',
          },
          {
            label: 'Esfigmomanômetro',
            detail: 'Conjunto manguito + manômetro (+ pêra) para medir pressão arterial.',
            icon: 'HeartPulse',
          },
          {
            label: 'Estetoscópio',
            detail: 'Item separado — usado na técnica auscultatória, não é o equipamento 1 da imagem.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — termos inventados',
            detail: 'Anemoscópio, cinescópio e ressectoscópio são equipamentos de outros contextos.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Distinção clínica',
            detail: 'Reconhecer manguito/manômetro na figura antes de marcar alternativa.',
            icon: 'Eye',
          },
        ],
        footer_rule: 'Manguito + manômetro = esfigmomanômetro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: equipamento 1 na imagem de PA é nomeado:',
          'Identificar na figura: manguito inflável + coluna de mercúrio/analog/digital.',
          'Testar A — esfigmomanômetro: equipamento de PA → candidata.',
          'Testar B — estetoscópio: acessório auscultatório separado → eliminar.',
          'Testar C — anemoscópio: mede vento, não PA → eliminar.',
          'Testar D — cinescópio: equipamento de projeção → eliminar.',
          'Testar E — ressectoscópio: instrumento urológico → eliminar.',
          'Confirmar: item 1 = esfigmomanômetro.',
          'Marcar A.',
        ],
        footer_rule: 'Equipamento PA → esfigmomanômetro → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equipamentos PA',
        meta: slideMeta,
        content: 'ESFIGMO × ESTETOSCÓPIO',
        rows: [
          {
            label: 'Esfigmomanômetro',
            value: 'Manguito + manômetro — mede PA (mmHg)',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Estetoscópio',
            value: 'Ausculta sons de Korotkoff — complemento, não substitui manguito',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Técnica auscultatória',
            value: 'Esfigmo + estetoscópio sobre braquial',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Oscilatório',
            value: 'Esfigmo automático — sem estetoscópio',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Mnemônico',
            value: 'Esfigmo = pressão · Esteto = sons',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Item 1 da imagem = manguito/manômetro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NOME DO EQUIPAMENTO',
        items: [
          {
            label: 'Letra B — estetoscópio',
            detail: 'Confunde acessório de ausculta com o equipamento de pressão.',
            correct:
              'Estetoscópio ausculta Korotkoff — o item 1 (manguito/manômetro) chama-se esfigmomanômetro.',
          },
          {
            label: 'Letra C — anemoscópio',
            detail: 'Instrumento para medir velocidade do vento.',
            correct:
              'Anemoscópio não mede PA — banca testa reconhecimento do esfigmomanômetro na imagem.',
          },
          {
            label: 'Letra D — cinescópio',
            detail: 'Equipamento de projeção cinematográfica — termo fora do contexto clínico.',
            correct:
              'Cinescópio não pertence à bandeja de SV — equipamento de PA é esfigmomanômetro.',
          },
          {
            label: 'Letra E — ressectoscópio',
            detail: 'Instrumento cirúrgico urológico.',
            correct:
              'Ressectoscópio é procedimento invasivo distinto — item 1 da figura é esfigmomanômetro.',
          },
        ],
        footer_rule: 'Elimine termos inventados → esfigmomanômetro (A)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343904263-7': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — PA sentada: pés apoiados no chão · dorso encostado na cadeira · braço apoiado · repouso ~5 min',
    roi_error: 'pa_nivel_figado_pernas_cruzadas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Postura PA — erros na imagem',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Identificar erros de postura na imagem — qual alternativa aponta o que faltou (orientação MS)?',
            icon: 'Target',
          },
          {
            label: 'Pés no chão',
            detail: 'Paciente deve apoiar os pés no solo — imagem provavelmente mostra pés pendentes.',
            icon: 'User',
          },
          {
            label: 'Dorso na cadeira',
            detail: 'Encosto apoiado — postura estável para leitura confiável de PA.',
            icon: 'Armchair',
          },
          {
            label: 'Pegadinha — invertida',
            detail: 'Alternativa A descreve conduta CORRETA (o que deveria ter sido feito), não um erro absurdo.',
            icon: 'GitCompare',
          },
          {
            label: 'Erros falsos B–E',
            detail: 'Proíbem apoio de braço, proíbem sentar ou impõem regras incorretas — não são erros da imagem.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'MS: pés no chão + dorso na cadeira + braço apoiado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: principais erros de postura na imagem — orientações MS.',
          'Observar imagem: identificar o que NÃO foi orientado (pés/dorso).',
          'Traduzir: MS exige pés apoiados e dorso encostado na cadeira.',
          'Testar A — pés no chão e dorso na cadeira: descreve o que faltou na imagem → candidata.',
          'Testar B — não apoiar braço na mesa: MS recomenda apoio → eliminar.',
          'Testar C — não sentar: PA padrão é sentado → eliminar.',
          'Testar D — palma obrigatoriamente para baixo: regra inexistente → eliminar.',
          'Testar E — braço esquerdo obrigatório: não há exclusividade → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Pés no chão + dorso apoiado = erro identificado → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — postura MS',
        meta: slideMeta,
        content: 'POSTURA · REPOUSO · AFERIÇÃO',
        rows: [
          {
            label: 'Posição',
            value: 'Sentado · pés apoiados no chão',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Encosto',
            value: 'Dorso encostado na cadeira — estável',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Braço',
            value: 'Apoiado na mesa · nível do coração',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Repouso',
            value: 'Cerca de cinco minutos antes da medida',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Evitar',
            value: 'Pernas cruzadas · pés pendentes · conversa durante aferição',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Postura MS: pés + dorso + braço apoiado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POSTURA NA PA',
        items: [
          {
            label: 'Letra B — não apoiar braço',
            detail: 'Afirma que braço não deve apoiar na mesa e face inclinada para baixo.',
            correct:
              'MS recomenda braço apoiado ao nível do coração — B descreve conduta errada, não o erro da imagem.',
          },
          {
            label: 'Letra C — não sentar',
            detail: 'Sustenta que paciente não deve sentar para PA.',
            correct:
              'Posição sentada é padrão MS para PA de rotina — C inventa contraindicação falsa ao sentar.',
          },
          {
            label: 'Letra D — palma para baixo',
            detail: 'Impõe palma obrigatoriamente voltada para baixo.',
            correct:
              'Não há exigência de orientação palmar fixa — D cria regra inexistente, distinta do erro postural real.',
          },
          {
            label: 'Letra E — braço esquerdo obrigatório',
            detail: 'Exige aferição exclusiva no braço esquerdo e face inclinada.',
            correct:
              'PA pode ser aferida em either braço conforme protocolo — E impõe obrigatoriedade falsa.',
          },
        ],
        footer_rule: 'A aponta o que faltou na imagem — pés e dorso',
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
    console.log(`[handcraft:sv-g04] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g04] total=${ok}`);
}

main();
