#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-crianca-g01 (8 slugs).
 *
 *   npx tsx scripts/handcraft-saude-da-crianca-g01.ts
 *   npm run validate:goldens -- --lote=saude-da-crianca-g01 --strict
 *   npm run audit:questao-readiness -- --lote=saude-da-crianca-g01 --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';

const LOTE = 'saude-da-crianca-g01';
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
    'teste do pezinho',
    'triagem neonatal',
    'puericultura',
    'desidratação',
    'sinais vitais pediátricos',
    'banho do recém-nascido',
    'sinais de alerta',
  ],
};

const SBP_FEBRE_SOURCE = {
  id: 'sbp-febre-pediatrica',
  tier: 'B' as const,
  issuer: 'Sociedade Brasileira de Pediatria',
  title: 'Febre na infância — definição e conduta (SBP 2019–2021)',
  year: 2021,
  covers: ['febre axilar', 'limiar térmico pediátrico'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'crianca_triagem_neonatal'
  | 'crianca_neonatologia'
  | 'crianca_dor'
  | 'crianca_sinais_vitais'
  | 'crianca_desidratacao'
  | 'crianca_aps_puericultura';

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  branch: Branch;
  guideline: string;
  sources?: (typeof MS_CADERNETA_SOURCE | typeof SBP_FEBRE_SOURCE)[];
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
    .replace(/orientaçã(o?)indicada/gi, 'orientação indicada')
    .replace(/tratarde/gi, 'tratar de')
    .replace(/estarpreparados/gi, 'estar preparados')
    .replace(/menoresde/gi, 'menores de')
    .replace(/donariz/gi, 'do nariz')
    .replace(/fontanela\(moleira\)/gi, 'fontanela (moleira)')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-exames-laboratoriais-1779563613404-2': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Teste do Pezinho — rastreamento neonatal (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Teste do Pezinho — enquadramento',
        meta: slideMeta,
        items: [
          {
            label: 'Programa público',
            detail: 'Exame obrigatório e gratuito na rede — rastreia doenças no RN.',
            icon: 'Baby',
          },
          {
            label: 'Objetivo MS',
            detail: 'Detectar distúrbios em tempo oportuno para intervenção e seguimento.',
            icon: 'Target',
          },
          {
            label: 'Não é o foco',
            detail: 'Não mede imunidade neonatal nem risco cardiovascular futuro isolado.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha vertical',
            detail: 'Transmissão mãe–filho no parto é outro rastreio (ex.: HIV/sífilis).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Pezinho = triagem metabólica/endócrina/genética no RN',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: objetivo do Teste do Pezinho segundo o MS.',
          'Lembrar: rastrear doenças no recém-nascido precocemente.',
          'Eliminar B: foco em transmissão vertical no parto — outro programa.',
          'Eliminar C: predisposição cardiovascular genética — não é o escopo do pezinho.',
          'Eliminar D: imunidade/morte neonatal — confunde com vigilância clínica.',
          'Testar A: detectar distúrbios em tempo oportuno com tratamento e seguimento.',
          'Marcar letra A.',
          'Fixação: pezinho = triagem neonatal universal.',
        ],
        footer_rule: 'Objetivo = detecção precoce + intervenção',
      },
      {
        type: 'golden_rule',
        slide_title: 'Teste do Pezinho — referência MS',
        meta: slideMeta,
        content: 'TRIAGEM NEONATAL',
        rows: [
          { label: 'Objetivo', value: 'Rastrear doenças no RN — intervenção precoce', badge: 'hot', emphasis: 'highlight' },
          { label: 'Coleta ideal', value: '3º ao 5º dia de vida', badge: 'ok' },
          { label: 'Local', value: 'Região lateral do calcanhar', badge: 'info' },
          { label: 'Exemplos rastreados', value: 'Fenilcetonúria, hipotireoidismo, hemoglobinopatias', badge: 'info' },
        ],
        footer_rule: 'Pezinho ≠ imunidade ≠ risco cardiovascular futuro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OBJETIVO DO PEZINHO',
        items: [
          {
            label: 'Letra B — transmissão mãe–filho no parto',
            detail: 'Parece vigilância neonatal, mas é rastreio de IST vertical.',
            correct: 'Pezinho rastreia doenças metabólicas/endócrinas/genéticas — não transmissão no parto.',
          },
          {
            label: 'Letra C — predisposição cardiovascular',
            detail: 'Confunde triagem neonatal com medicina preditiva adulta.',
            correct: 'Objetivo MS é detectar doenças no RN para tratamento imediato — não risco CV futuro.',
          },
          {
            label: 'Letra D — imunidade e morte neonatal',
            detail: 'Mistura programa de triagem com vigilância clínica geral.',
            correct: 'Pezinho identifica doenças específicas por triagem — não avalia imunidade global.',
          },
        ],
        footer_rule: 'Triagem neonatal ≠ transmissão vertical ≠ imunidade',
      },
    ],
  },

  'amauc-enfermagem-processo-de-enfermagem-1780004982901-8': {
    family: 'vf',
    branch: 'crianca_neonatologia',
    guideline: 'Banho do recém-nascido — segurança térmica e técnica (Caderneta MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Banho do RN — segurança',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Higiene com conforto térmico — nunca imersão sem suporte.', icon: 'Droplets' },
          { label: 'Água', detail: 'Nível baixo (até tórax) — banheira cheia aumenta risco.', icon: 'Thermometer' },
          { label: 'Frequência', detail: 'Pode ser diário com técnica correta — não só dias alternados.', icon: 'Calendar' },
          { label: 'Pegadinha térmica', detail: 'RN não vai “direto na água” sem proteção/suporte.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Banho seguro: suporte, pouca água, temperatura adequada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F em três assertivas sobre banho do RN.',
          'I — direto na água sem proteção: FALSA (exige suporte e cuidado térmico).',
          'II — banheira completamente cheia: FALSA (nível até tórax, ~10–12 cm).',
          'III — só em dias alternados: FALSA (frequência flexível com técnica segura).',
          'Sequência correta: F, F, F.',
          'Eliminar A (V,V,F), B (V,F,V), D (F,V,V), E (V,V,V).',
          'Marcar letra C.',
          'Fixação: as três assertivas são falsas.',
        ],
        footer_rule: 'Todas falsas → C (F, F, F)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Banho do RN — parâmetros',
        meta: slideMeta,
        content: 'SEGURANÇA NO BANHO',
        rows: [
          { label: 'Temperatura da água', value: '36 °C a 37 °C', badge: 'hot' },
          { label: 'Nível da água', value: 'Até a altura do tórax', badge: 'ok' },
          { label: 'Teste térmico', value: 'Dorso da mão ou punho', badge: 'info' },
          { label: 'Suporte', value: 'Uma mão apoia cabeça/pescoço — nunca soltar', badge: 'warn' },
        ],
        footer_rule: 'Pouca água, mãos seguras, ambiente aquecido',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BANHO DO RN (V/F)',
        items: [
          {
            label: 'Letra A — V, V, F',
            detail: 'Aceita imersão sem proteção e banheira cheia.',
            correct: 'I e II são falsas — RN precisa de suporte e nível baixo de água.',
          },
          {
            label: 'Letra B — V, F, V',
            detail: 'Mantém imersão direta e frequência alternada como verdadeiras.',
            correct: 'I é falsa; III também — banho não é restrito a dias alternados por regra fixa.',
          },
          {
            label: 'Letra D — F, V, V',
            detail: 'Considera banheira cheia e dias alternados como corretos.',
            correct: 'II e III são falsas — água até tórax e frequência não fixada assim.',
          },
          {
            label: 'Letra E — V, V, V',
            detail: 'Todas verdadeiras — conduta insegura.',
            correct: 'As três assertivas violam técnica segura do banho neonatal.',
          },
        ],
        footer_rule: 'Nenhuma assertiva é verdadeira — só C',
      },
    ],
    cleanInstruction: (s) =>
      cleanPdfNoise(s).replace(
        /\(__\)O bebê/g,
        '\n(__) O bebê',
      ),
  },

  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562725491-3': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Teste do Pezinho — coleta 3º–5º dia (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta do Teste do Pezinho',
        meta: slideMeta,
        items: [
          { label: 'Janela ideal', detail: '1ª semana de vida — preferência no 3º dia.', icon: 'Calendar' },
          { label: 'Sítio', detail: 'Punção lateral do calcanhar — não palma do pé.', icon: 'Syringe' },
          { label: 'Escopo', detail: 'Doenças metabólicas, endócrinas, hemoglobinopatias e outras.', icon: 'Activity' },
          { label: 'Pegadinha de prazo', detail: 'Atraso além da 1ª semana reduz sensibilidade.', icon: 'AlertTriangle' },
        ],
        footer_rule: '3º–5º dia · calcanhar lateral · triagem ampla',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa CORRETA sobre teste do pezinho na 1ª semana.',
          'Eliminar A: até 3º mês sem prejuízo — atraso prejudica detecção.',
          'Eliminar B: punção só na palma — local é calcanhar lateral.',
          'Eliminar C: apenas metabólicas não transmissíveis — painel é mais amplo.',
          'Testar D: coleta preferencialmente no 3º dia de vida, ainda na primeira semana.',
          'Marcar letra D.',
          'Fixação: janela na 1ª semana · calcanhar · não adiar meses.',
        ],
        footer_rule: 'Coleta precoce no calcanhar — não palma',
      },
      {
        type: 'golden_rule',
        slide_title: 'Parâmetros da coleta',
        meta: slideMeta,
        content: 'TESTE DO PEZINHO — COLETA',
        rows: [
          { label: 'Momento ideal', value: '3º dia de vida (1ª semana)', badge: 'hot', emphasis: 'highlight' },
          { label: 'Local anatômico', value: 'Região lateral do calcanhar', badge: 'ok' },
          { label: 'Volume', value: 'Preencher círculos do filtro completamente', badge: 'info' },
          { label: 'Prazo máximo', value: 'Não postergar sem justificativa — perde sensibilidade', badge: 'warn' },
        ],
        footer_rule: 'Calcanhar · 3º dia · filtro completo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COLETA DO PEZINHO',
        items: [
          {
            label: 'Letra A — até o 3º mês sem prejuízo',
            detail: 'Minimiza importância da janela neonatal precoce.',
            correct: 'MS recomenda coleta na 1ª semana — atraso reduz eficácia da triagem.',
          },
          {
            label: 'Letra B — punção na palma do pé',
            detail: 'Local anatômico incorreto para capilar.',
            correct: 'Coleta no calcanhar (face lateral) — não na palma plantar.',
          },
          {
            label: 'Letra C — só metabólicas não transmissíveis',
            detail: 'Restringe painel do programa.',
            correct: 'Triagem inclui hipotireoidismo, hemoglobinopatias e outras — não só metabólicas.',
          },
        ],
        footer_rule: 'Prazo, sítio e escopo — três pegadinhas clássicas',
      },
    ],
  },

  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779563512485-0': {
    family: 'conceito',
    branch: 'crianca_dor',
    guideline: 'Avaliação da dor em crianças — abordagem multidimensional (Caderneta MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dor pediátrica — avaliação',
        meta: slideMeta,
        items: [
          { label: 'Contexto PS', detail: 'Classificar intensidade orienta analgesia e priorização.', icon: 'Stethoscope' },
          { label: 'Multimodal', detail: 'Comportamento + relato verbal conforme idade/desenvolvimento.', icon: 'Users' },
          { label: 'Escalas', detail: 'Numérica só se criança compreende — lactente exige observação.', icon: 'BarChart' },
          { label: 'Pegadinha unimodal', detail: 'Expressão facial isolada não basta como único critério.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Dor pediátrica = observar + ouvir + adaptar à idade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: critério para avaliar intensidade da dor em criança.',
          'Eliminar A: só expressão facial — abordagem incompleta.',
          'Eliminar B: ignorar queixas verbais — desrespeita autoreporte quando possível.',
          'Eliminar C: só escala numérica — ignora faixa etária e compreensão.',
          'Testar D: integrar comportamento (agitação, choro) + queixa verbal adaptada à idade.',
          'Marcar letra D.',
          'Fixação: dor na infância exige abordagem etária e integrada.',
        ],
        footer_rule: 'Comportamento + verbal + escala adequada à idade',
      },
      {
        type: 'golden_rule',
        slide_title: 'Dor na infância — referência',
        meta: slideMeta,
        content: 'AVALIAÇÃO DA DOR PEDIÁTRICA',
        rows: [
          { label: 'Lactente', value: 'Escalas comportamentais (face, choro, postura)', badge: 'ok' },
          { label: 'Pré-escolar', value: 'Combinar observação + relato simplificado', badge: 'hot' },
          { label: 'Escolar/adolescente', value: 'Escala numérica ou faces quando compreende', badge: 'info' },
          { label: 'Nunca', value: 'Ignorar queixa verbal ou usar um único sinal isolado', badge: 'warn' },
        ],
        footer_rule: 'Integrar sinais — não reduzir a um único parâmetro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DOR PEDIÁTRICA',
        items: [
          {
            label: 'Letra A — só expressão facial',
            detail: 'Parece objetivo, mas é critério único e insuficiente.',
            correct: 'Expressão facial entra na avaliação — nunca como único indicador.',
          },
          {
            label: 'Letra B — ignorar queixas verbais',
            detail: 'Supõe imprecisão total do relato infantil.',
            correct: 'Queixa verbal é válida conforme idade — integrar com observação.',
          },
          {
            label: 'Letra C — só escala numérica',
            detail: 'Ignora desenvolvimento cognitivo da criança.',
            correct: 'Escala numérica exige compreensão — lactente precisa de escala comportamental.',
          },
        ],
        footer_rule: 'Unimodal = pegadinha — integrar sinais',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343932809-5': {
    family: 'conceito',
    branch: 'crianca_sinais_vitais',
    guideline: 'Febre axilar pediátrica — limiar SBP 2019–2021',
    sources: [MS_CADERNETA_SOURCE, SBP_FEBRE_SOURCE],
    exam_vs_current: 'Prova cita SBP 2019–2021: febre axilar >37,3 °C — conferir atualização SBP vigente.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Febre — definição axilar',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Limiar de febre por temperatura axilar (SBP 2019–2021).', icon: 'Thermometer' },
          { label: 'Axilar', detail: 'Via comum na pediatria — limiar inferior à oral/retal.', icon: 'Activity' },
          { label: 'Referência prova', detail: 'Gabarito exige valor citado pela SBP no enunciado.', icon: 'BookOpen' },
          { label: 'Pegadinha de corte', detail: 'Banca troca 37,3 / 37,5 / 37,8 / 38 °C.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Memorizar limiar da banca: axilar >37,3 °C (SBP 2019–2021)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar: definição de febre por temperatura axilar (SBP).',
          'Eliminar A: 37,8 °C — corte mais alto que o da prova.',
          'Eliminar B: 37,5 °C — valor intermediário distrator.',
          'Eliminar C: 38,1 °C — acima do limiar cobrado.',
          'Eliminar E: 38,3 °C — confunde com outros limiares.',
          'Testar D: 37,3 °C conforme referência do enunciado.',
          'Marcar letra D.',
          'Fixação: axilar SBP 2019–2021 → >37,3 °C.',
        ],
        footer_rule: 'Febre axilar na prova = 37,3 °C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Febre pediátrica — limiar',
        meta: slideMeta,
        content: 'FEBRE — TEMPERATURA AXILAR',
        rows: [
          { label: 'SBP 2019–2021 (prova)', value: 'Febre axilar > 37,3 °C', badge: 'hot', emphasis: 'highlight' },
          { label: 'Medida axilar', value: 'Via segura e frequente em crianças', badge: 'ok' },
          { label: 'Lactente <3 meses', value: 'Febre = sinal de alerta — encaminhar', badge: 'warn' },
          { label: 'Pegadinha', value: 'Trocar °C entre alternativas próximas', badge: 'info' },
        ],
        footer_rule: 'Na prova: 37,3 °C axilar (SBP citada)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LIMIAR DE FEBRE',
        items: [
          {
            label: 'Letra A — 37,8 °C',
            detail: 'Valor usado em outras referências — não é o da SBP 2019–2021 nesta prova.',
            correct: 'Enunciado pede SBP 2019–2021: limiar axilar é >37,3 °C.',
          },
          {
            label: 'Letra B — 37,5 °C',
            detail: 'Corte intermediário para confundir memorização.',
            correct: 'Gabarito D (37,3 °C) conforme referência explícita no comando.',
          },
          {
            label: 'Letra C — 38,1 °C',
            detail: 'Aproxima de 38 °C “redondo” — distrator clássico.',
            correct: 'SBP 2019–2021 na questão: ultrapassa 37,3 °C axilar.',
          },
          {
            label: 'Letra E — 38,3 °C',
            detail: 'Mistura limiar axilar com oral/retal em provas.',
            correct: 'Axilar nesta banca: 37,3 °C — não 38,3 °C.',
          },
        ],
        footer_rule: 'Decore o par SBP + axilar da questão',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-2': {
    family: 'certo_errado',
    branch: 'crianca_desidratacao',
    guideline: 'Diarreia aguda — saneamento básico e prevenção (MS / Caderneta)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diarreia + saneamento domiciliar',
        meta: slideMeta,
        items: [
          { label: 'Contexto APS', detail: 'Família em habitação precária com criança com diarreia.', icon: 'Home' },
          { label: 'Desidratação', detail: 'Plano A/B/C trata o episódio — saneamento previne reinfecção.', icon: 'Droplets' },
          { label: 'Saneamento', detail: 'Fossa séptica trata esgoto — reduz contaminação ambiental.', icon: 'Shield' },
          { label: 'Prevenção', detail: 'Água segura + destino adequado de fezes/lixo cortam reinfecção.', icon: 'Recycle' },
          { label: 'Pegadinha clínica', detail: 'Não substitui Plano A/B/C — mas saneamento é orientação MS de promoção.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Diarreia: tratar desidratação + melhorar saneamento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Item C/E: família em habitação precária, sem água encanada/filtrada, criança com diarreia.',
          'MS inclui saneamento básico na prevenção de diarreia e reinfecção por matéria orgânica.',
          'Fossa séptica = tratamento primário de esgoto no domicílio (decomposição).',
          'Sem coleta adequada de lixo, medida estruturante de saneamento é pertinente.',
          'Afirmativa alinhada à promoção à saúde e prevenção de agravos (Ministério da Saúde).',
          'Marcar Certo (letra A).',
          'Fixação: diarreia + precariedade habitacional → orientar saneamento.',
        ],
        footer_rule: 'Saneamento domiciliar integra prevenção de diarreia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Saneamento e diarreia',
        meta: slideMeta,
        content: 'MEDIDAS DE SANEAMENTO',
        rows: [
          { label: 'Fossa séptica', value: 'Tratamento primário de esgoto domiciliar', badge: 'hot' },
          { label: 'Água segura', value: 'Fervura ou cloração (hipoclorito)', badge: 'ok' },
          { label: 'Lixo', value: 'Coleta adequada ou enterro seguro', badge: 'ok' },
          { label: 'Diarreia', value: 'Plano A/B/C + saneamento para evitar reinfecção', badge: 'info' },
        ],
        footer_rule: 'Esgoto tratado + água segura = menos diarreia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E SANEAMENTO',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Parece “medida lenta” diante de diarreia aguda.',
            correct: 'MS orienta saneamento básico na prevenção — fossa séptica é conduta indicada.',
          },
          {
            label: 'Omitir saneamento na diarreia',
            detail: 'Focar só em soro oral ignora reinfecção por esgoto e lixo.',
            correct: 'Promoção à saúde inclui água segura, fossa séptica e coleta de lixo.',
          },
        ],
        footer_rule: 'Promoção inclui saneamento — não só soro oral',
      },
    ],
    cleanInstruction: (s) => cleanPdfNoise(s),
  },

  'cev-urca-enfermagem-semiologia-em-enfermagem-1779563491765-1': {
    family: 'conceito',
    branch: 'crianca_desidratacao',
    guideline: 'Desidratação pediátrica — sinais clínicos (MS / Caderneta)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Desidratação no lactente',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Desidratação = depleção de água e eletrólitos em lactentes.', icon: 'Search' },
          { label: 'Morbidade', detail: 'Principal causa de morbidade e mortalidade em crianças menores.', icon: 'AlertTriangle' },
          { label: 'Equipe', detail: 'Enfermagem deve identificar sinais para tratamento adequado e imediato.', icon: 'Users' },
          { label: 'Sinais clássicos', detail: 'Fontanela deprimida, mucosas secas, oligúria, letargia, sede.', icon: 'Droplets' },
          { label: 'Pegadinha poliúria', detail: 'Poliúria é o oposto de oligúria — não indica desidratação.', icon: 'XCircle' },
        ],
        footer_rule: 'Desidratação → oligúria, não poliúria',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO: marcar alternativa que NÃO contém sinais de desidratação.',
          'Contexto: depleção de água e eletrólitos — lactentes têm alta morbidade/mortalidade.',
          'Equipe de enfermagem identifica sinais para instituição de tratamento imediato.',
          'A — fontanela deprimida + boca seca: sinais presentes → eliminar.',
          'B — olhos afundados + sem lágrimas: sinais presentes → eliminar.',
          'C — hipoatividade/letargia: sinal presente → eliminar.',
          'D — sede + ingestão rápida: sinal presente → eliminar.',
          'E — prega cutânea + poliúria: poliúria NÃO é sinal de desidratação → marcar E.',
        ],
        footer_rule: 'EXCETO: poliúria não combina com desidratação',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sinais de desidratação',
        meta: slideMeta,
        content: 'DESIDRATAÇÃO — LACTENTE',
        rows: [
          { label: 'Fontanela', value: 'Deprimida (afundada)', badge: 'ok' },
          { label: 'Mucosas', value: 'Secas — olhos fundos, sem lágrimas', badge: 'ok' },
          { label: 'Diurese', value: 'Oligúria — redução do volume urinário', badge: 'hot', emphasis: 'highlight' },
          { label: 'Turgor', value: 'Sinal da prega positivo', badge: 'ok' },
          { label: 'Poliúria', value: 'NÃO é sinal — indica diurese aumentada', badge: 'warn' },
        ],
        footer_rule: 'Oligúria + prega · poliúria = distrator',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO DESIDRATAÇÃO',
        items: [
          {
            label: 'Letra A — fontanela deprimida e boca seca',
            detail: 'São sinais clássicos de desidratação no lactente.',
            correct: 'Fontanela afundada e mucosas secas confirmam perda hídrica — alternativa com sinais.',
          },
          {
            label: 'Letra B — olhos afundados e sem lágrimas',
            detail: 'Indicam depleção de volume extracelular.',
            correct: 'Olhos fundos e ausência de lágrimas são sinais de desidratação — não é o EXCETO.',
          },
          {
            label: 'Letra C — hipoatividade ou letargia',
            detail: 'Alteração neurológica por desidratação grave.',
            correct: 'Letargia é sinal de gravidade na desidratação pediátrica.',
          },
          {
            label: 'Letra D — sede e ingestão rápida',
            detail: 'Mecanismo compensatório da desidratação.',
            correct: 'Polidipsia e ingestão avida são sinais — alternativa incorreta para o EXCETO.',
          },
        ],
        footer_rule: 'A–D são sinais; E mistura prega com poliúria',
      },
    ],
    cleanInstruction: (s) => cleanPdfNoise(s),
  },

  'coseac-uff-enfermagem-semiologia-em-enfermagem-1779563549311-3': {
    family: 'conceito',
    branch: 'crianca_aps_puericultura',
    guideline: 'Visita domiciliar — sinais de alerta em lactente <2 meses (Caderneta MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lactente <2 meses — visita domiciliar',
        meta: slideMeta,
        items: [
          { label: 'Contexto APS', detail: 'Equipe observa sinais de gravidade na visita domiciliar.', icon: 'Home' },
          { label: 'Infecção grave', detail: 'Bradycardia, vômitos, letargia, tiragem, fontanela abaulada.', icon: 'AlertTriangle' },
          { label: 'Agente', detail: 'Quadro grave em <2 meses — banca aponta infecção bacteriana.', icon: 'Bug' },
          { label: 'Pegadinha FC', detail: 'FC <100 bpm em lactente = alerta — não confundir com <150.', icon: 'HeartPulse' },
        ],
        footer_rule: 'RN/lactente jovem descompensa rápido — sinais de alerta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sinais a observar em criança <2 meses na visita domiciliar.',
          'Eliminar A: infecção viral — gabarito exige bacteriana.',
          'Eliminar C: FC <150 e vômitos em jato — parâmetros trocados.',
          'Eliminar D: viral + sonolência transitória — minimiza gravidade.',
          'Eliminar E: viral + fontanela normotensa — sinais incompletos.',
          'Testar B: infecção bacteriana com FC <100, vômitos, letargia, tiragem, fontanela abaulada.',
          'Marcar letra B.',
          'Fixação: <2 meses + sinais de gravidade = encaminhar urgente.',
        ],
        footer_rule: 'Bacteriana + FC <100 + fontanela abaulada',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sinais de alerta — lactente',
        meta: slideMeta,
        content: 'PUERICULTURA — <2 MESES',
        rows: [
          { label: 'FC', value: '< 100 bpm — bradicardia grave', badge: 'hot', emphasis: 'highlight' },
          { label: 'Neurológico', value: 'Letargia ou inconsciência', badge: 'ok' },
          { label: 'Respiratório', value: 'Batimento de asa de nariz (tiragem)', badge: 'ok' },
          { label: 'Fontanela', value: 'Abaulada — suspeita de infecção/SNC', badge: 'warn' },
          { label: 'Conduta', value: 'Encaminhar imediatamente', badge: 'hot' },
        ],
        footer_rule: 'Sinais de alerta pediátrico = urgência',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VISITA DOMICILIAR',
        items: [
          {
            label: 'Letra A — infecção viral',
            detail: 'Mesmos sinais graves, mas agente errado para o gabarito.',
            correct: 'Prova aponta infecção bacteriana com sinais de sepse/meningite.',
          },
          {
            label: 'Letra C — FC <150 e vômitos em jato',
            detail: 'Troca limiar de FC e tipo de vômito.',
            correct: 'Alerta em lactente: FC <100 bpm — não <150.',
          },
          {
            label: 'Letra D — viral + sonolência transitória',
            detail: 'Minimiza gravidade com “transitória”.',
            correct: 'Letargia/inconsciência exigem avaliação urgente — não trivializar.',
          },
          {
            label: 'Letra E — fontanela normotensa',
            detail: 'Fontanela normal exclui hipertensão intracraniana/inflamação.',
            correct: 'Sinal de alerta inclui fontanela abaulada — não normotensa.',
          },
        ],
        footer_rule: 'Agente + FC + fontanela — três eixos da pegadinha',
      },
    ],
    cleanInstruction: (s) => cleanPdfNoise(s),
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
    console.log(`[handcraft:sc-g01] OK ${slug}`);
  }
  console.log(`[handcraft:sc-g01] total=${ok}`);
}

main();
