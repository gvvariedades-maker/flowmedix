#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g03 (8 slugs P0 vitals_pa_tecnica + interpretação).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g03.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g03';
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
    'peso e altura — técnica',
    'quinto sinal vital — dor',
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
  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344224014-5': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — peso: mínimo de roupa · mesma hora · altura: ereta, pés juntos na plataforma',
    roi_error: 'peso_altura_tecnica_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Peso e altura — mapa I–IV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro afirmativas sobre medição de peso e altura no adulto — julgue I–IV antes de combinar letras.',
            icon: 'Target',
          },
          {
            label: 'Peso — roupa (I)',
            detail: 'Pesar com mínimo de roupa e peças de peso equivalente — item verdadeiro.',
            icon: 'Scale',
          },
          {
            label: 'Peso — rotina (II)',
            detail:
              'Pegadinha: jejum e horários diferentes a cada dia distorcem tendência — item falso.',
            icon: 'GitCompare',
          },
          {
            label: 'Altura — postura (III)',
            detail:
              'Pés desunidos na balança comprometem leitura — posição correta exige pés juntos/paralelos.',
            icon: 'User',
          },
          {
            label: 'Tarar balança (IV)',
            detail: 'Soltar trava, ajustar pesos no zero e nivelar fiel — procedimento de taragem válido.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha AMEOSC',
            detail:
              'Banca mistura item II (horário variável) com III (pés desunidos) — não confundir com faixa pediátrica.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'II e III são filtros decisivos — feche antes de combinar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro itens I–IV + combinações — tabela V/F primeiro.',
          'Julgar I: pesar com mínimo de roupa e peças equivalentes? → VERDADEIRO.',
          'Julgar II: peso diário em jejum em horários diferentes? → FALSO — mesma roupa e horário padronizado.',
          'Julgar III: altura com pés desunidos centralizados? → FALSO — pés paralelos/juntos na plataforma.',
          'Julgar IV: tarar balança no zero com nivelamento do fiel? → VERDADEIRO.',
          'Conjunto correto: I e IV apenas.',
          'Eliminar A (II+III), C (II+III+IV), D (I+III).',
          'Marcar B.',
          'Fixação: II (horário) e III (pés) são os itens falsos clássicos desta banca.',
        ],
        footer_rule: 'I=V · II=F · III=F · IV=V → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — peso e altura',
        meta: slideMeta,
        content: 'PESO · ALTURA — PADRÃO DE PROVA',
        rows: [
          {
            label: 'Peso — roupa',
            value: 'Mínimo de roupa · peças de peso equivalente entre aferições',
            sv_kind: 'meta',
            badge: 'ok',
            exam_hint: 'Item I verdadeiro.',
          },
          {
            label: 'Peso — série',
            value: 'Mesmo horário · mesma roupa — não variar jejum/horário sem critério',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'Item II falso.',
          },
          {
            label: 'Altura — postura',
            value: 'Ereta · costas à haste · pés juntos/paralelos na plataforma',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Item III falso — pés desunidos.',
          },
          {
            label: 'Taragem',
            value: 'Zero calibrado · fiel nivelado com marca da trava',
            sv_kind: 'meta',
            badge: 'ok',
            exam_hint: 'Item IV verdadeiro.',
          },
        ],
        footer_rule: 'Peso fidedigno = roupa mínima + horário padronizado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PESO E ALTURA (I–IV)',
        items: [
          {
            label: 'Letra A — II e III',
            detail: 'Aceita II falso (jejum/horários diferentes) e III falso (pés desunidos).',
            correct:
              'Peso de rotina exige padronização de horário e roupa — II é falso; altura exige pés juntos na plataforma.',
          },
          {
            label: 'Letra C — II, III e IV',
            detail: 'Inclui II e III falsos junto com IV verdadeiro.',
            correct:
              'IV isolado é verdadeiro, mas II e III invalidam a combinação — taragem não salva itens de técnica errada.',
          },
          {
            label: 'Letra D — I e III',
            detail: 'Acerta I, mas mantém III falso (pés desunidos).',
            correct:
              'Medição de altura exige pés paralelos apoiados — pés desunidos distorcem a leitura.',
          },
          {
            label: 'Confundir jejum com peso',
            detail: 'Achar que peso diário deve ser sempre em jejum com horário variável.',
            correct:
              'Controle de peso pede mesma roupa e horário — variar sem critério mascara ganho/perda real.',
          },
        ],
        footer_rule: 'Feche II e III → só I + IV → letra B',
      },
    ],
  },

  'atame-enfermagem-verificacao-de-sinais-vitais-1779343932809-3': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — estetoscópio: campânula sobre artéria braquial na fossa antecubital, sem compressão excessiva',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA — posição do estetoscópio',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Posição correta do estetoscópio na artéria braquial — técnica antes de interpretar mmHg.',
            icon: 'Target',
          },
          {
            label: 'Fossa antecubital',
            detail:
              'Sítio de palpação da braquial — campânula centrada sobre o trajeto arterial.',
            icon: 'HeartPulse',
          },
          {
            label: 'Campânula × compressão',
            detail: 'Contato firme sem esmagar a artéria — pressão excessiva abafa sons de Korotkoff.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — fossa antecubital',
            detail:
              'Meio do braço, face lateral ou posterior não coincidem com braquial na fossa antecubital — manguito acima da fossa.',
            icon: 'GitCompare',
          },
          {
            label: 'Passo MS',
            detail: 'Braçadeira 2–3 cm acima da fossa → localizar braquial → auscultar na mesma região.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Braquial = fossa antecubital — não confundir com carótida ou meio do braço',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: posição correta do estetoscópio na artéria braquial.',
          'Testar A — fossa antecubital, campânula sobre braquial: sítio anatômico correto → candidata.',
          'Testar B — meio do braço 5 cm acima: afasta da braquial → eliminar.',
          'Testar C — parte lateral do braço: trajeto arterial não é lateral isolado → eliminar.',
          'Testar D — posterior do braço sobre tríceps: braquial não passa ali → eliminar.',
          'Confirmar: só A descreve posicionamento MS/COFEN.',
          'Marcar A.',
          'Fixação: palpar braquial na fossa → posicionar campânula no mesmo ponto.',
        ],
        footer_rule: 'Fossa antecubital + braquial → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ausculta PA',
        meta: slideMeta,
        content: 'BRAQUIAL · FOSSA · CAMPÂNULA',
        rows: [
          {
            label: 'PA — sítio braquial',
            value: 'Fossa antecubital — campânula sobre trajeto arterial',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Estetoscópio',
            value: 'Campânula sobre braquial — sem compressão excessiva',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Manguito',
            value: '2–3 cm acima da fossa antecubital · 80% circunferência',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Braço',
            value: 'Nível do coração (4º EIC) — não abdômen nem ombro',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Repouso pré-PA',
            value: 'Cerca de cinco minutos sentado — repouso padrão MS',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Palpar → auscultar no mesmo sítio braquial',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO ERRADO DO ESTETOSCÓPIO',
        items: [
          {
            label: 'Pegadinha — fossa antecubital',
            detail:
              'Meio do braço, face lateral ou posterior não coincidem com braquial na fossa antecubital.',
            correct:
              'Estetoscópio na fossa antecubital sobre braquial — único sítio correto (letra A).',
          },
          {
            label: 'Letra B — meio do braço',
            detail: 'Alternativa B coloca estetoscópio longe da fossa antecubital, fora do trajeto braquial após o manguito.',
            correct:
              'Após manguito acima da fossa, ausculta na fossa antecubital sobre braquial — meio do braço é erro.',
          },
          {
            label: 'Letra C — face lateral',
            detail: 'Sugere lateral do braço em vez da fossa antecubital medial.',
            correct:
              'Braquial percorre a fossa antecubital — campânula centrada no pulso palpado nesse sítio.',
          },
          {
            label: 'Letra D — face posterior',
            detail: 'Posiciona estetoscópio na face posterior sobre tríceps, não na fossa antecubital.',
            correct:
              'Artéria braquial é auscultada na fossa antecubital anterior — não na face posterior.',
          },
          {
            label: 'Confundir com carótida',
            detail: 'Misturar pulso central cervical com técnica de PA no membro superior.',
            correct:
              'PA no braço usa braquial na fossa antecubital — carótida é outro sítio de palpação.',
          },
        ],
        footer_rule: 'Fossa antecubital + braquial = única alternativa correta (A)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343789998-5': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline: 'MS — adulto: T axilar <37,8°C afebril · FC 60–100 · FR 12–20 · PA ~90–140/60–90 normotensa',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV do caso — painel de classificação',
        meta: slideMeta,
        items: [
          {
            label: 'Temperatura axilar',
            detail: 'Valor do enunciado abaixo do limiar de febre axilar — afebril.',
            icon: 'Thermometer',
          },
          {
            label: 'Pulso apical',
            detail: 'FC do caso abaixo de 60 bpm — bradicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR do caso',
            detail: 'Dentro de 12–20 irpm — eupneico.',
            icon: 'Wind',
          },
          {
            label: 'PA do caso',
            detail: 'Sistólica e diastólica compatíveis com normotensão em repouso.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha AVANÇASP',
            detail:
              'Alternativas misturam taquicardia, taquipneia ou hipertensão com valores normais do enunciado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Traduza cada número antes de combinar os quatro termos clínicos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler os quatro valores do enunciado — traduzir cada parâmetro antes de combinar.',
          'Classificar temperatura axilar: valor afebril (sem febre).',
          'Classificar FC: bradicárdico (abaixo de 60 bpm).',
          'Classificar FR: eupneico (faixa 12–20 irpm).',
          'Classificar PA: normotenso (sistólica e diastólica de repouso).',
          'Testar A — taquipneico + hipertenso: FR e PA do caso são normais → eliminar.',
          'Testar B — febril + taquipneico: temp e FR não batem → eliminar.',
          'Testar C — afebril + bradicárdico + eupneico + normotenso: todos conferem → candidata.',
          'Testar D — febril + taquicárdico: oposto do caso → eliminar.',
          'Testar E — taquicárdico + hipertenso: FC 40 é bradi, PA normal → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Afebril · bradicárdico · eupneico · normotenso → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'CLASSIFIQUE CADA SV ANTES DE COMBINAR',
        rows: [
          {
            label: 'Temperatura axilar',
            value: 'Afebril abaixo de 37,8°C',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'FC adulto',
            value: '60–100 bpm normocárdico · abaixo de 60 bradicárdico',
            sv_kind: 'fc',
            badge: 'hot',
          },
          {
            label: 'FR adulto',
            value: '12–20 irpm eupneico · acima de 20 taquipneia',
            sv_kind: 'fr',
            badge: 'hot',
          },
          {
            label: 'PA adulto',
            value: 'Normotenso aproximadamente 90–140 × 60–90 mmHg',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Mnemônico',
            value: 'Um parâmetro errado invalida a alternativa inteira',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Quatro traduções corretas juntas → única combinação válida',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO MULTI-SV',
        items: [
          {
            label: 'Letra A — taquipneico e hipertenso',
            detail: 'Atribui taquipneia (FR>20) e hipertensão ao caso com FR 12 e PA 110/70.',
            correct:
              'FR 12 irpm é eupneia; PA 110/70 é normotensão — alternativa inventa alterações inexistentes.',
          },
          {
            label: 'Letra B — febril e taquipneico',
            detail: 'Chama temperatura afebril de febre e FR normal de taquipneia.',
            correct:
              'Temperatura do enunciado é afebril; FR está na faixa eupneica — dois erros de classificação.',
          },
          {
            label: 'Letra D — febril e taquicárdico',
            detail: 'Inverte temperatura e FC — caso é afebril e bradicárdico.',
            correct:
              '40 bpm é bradicardia, não taquicardia; temperatura não indica febre.',
          },
          {
            label: 'Letra E — taquicárdico e hipertenso',
            detail: 'Ignora bradicardia e PA normal do enunciado.',
            correct:
              'FC abaixo de 60 é bradicardia; PA do caso é normotensa — não taquicardia nem hipertensão.',
          },
        ],
        footer_rule: 'Valide os quatro parâmetros — só C fecha sem contradição',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343789998-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — PA: repouso ~5 min · manguito 2–3 cm acima da fossa · braço nível coração · palpar braquial',
    roi_error: 'pa_nivel_figado_pernas_cruzadas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — checklist AVANÇASP',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinalar conduta correta na aferição de PA — foco em técnica, não em valores.',
            icon: 'Target',
          },
          {
            label: 'Repouso pré-PA',
            detail: 'MS recomenda cerca de cinco minutos sentado — repouso excessivo ou zero repouso invalidam a PA.',
            icon: 'Clock',
          },
          {
            label: 'Manguito',
            detail: 'Tamanho adequado firmemente 2–3 cm acima da fossa antecubital — eixo da questão.',
            icon: 'HeartPulse',
          },
          {
            label: 'Nível do braço',
            detail: 'Braço ao nível do coração — “altura do abdômen” distorce leitura.',
            icon: 'GitCompare',
          },
          {
            label: 'Palpação para insuflar',
            detail: 'Palpar braquial na fossa — carótida é sítio errado para PA de membro.',
            icon: 'Stethoscope',
          },
        ],
        footer_rule: 'Repouso 5 min · manguito na fossa · braço ao coração',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica correta de aferição de PA.',
          'Testar A — repouso excessivo (trinta a quarenta minutos): tempo inadequado, MS usa cerca de cinco minutos → eliminar.',
          'Testar B — manguito 2–3 cm acima da fossa, firme: técnica MS → candidata.',
          'Testar C — braço na altura do abdômen: abaixo do coração → eliminar.',
          'Testar D — palpar carótida para insuflar: sítio errado → eliminar.',
          'Testar E — carótida na fossa antecubital: anatomia incoerente → eliminar.',
          'Confirmar: só B descreve posicionamento correto do manguito.',
          'Marcar B.',
        ],
        footer_rule: 'Manguito 2–3 cm acima da fossa → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA MS',
        meta: slideMeta,
        content: '5 MIN · MANGUITO · CORAÇÃO · BRAQUIAL',
        rows: [
          {
            label: 'Repouso',
            value: 'Cerca de cinco minutos sentado, sem falar — repouso padrão MS',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'Alternativa A falsa.',
          },
          {
            label: 'Manguito',
            value: '2–3 cm acima da fossa antecubital · 80% circunferência',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa B correta.',
          },
          {
            label: 'Braço',
            value: 'Nível do coração (4º EIC) — não abdômen',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Alternativa C falsa.',
          },
          {
            label: 'PA — artéria braquial',
            value: 'Fossa antecubital — não carótida cervical',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Insuflação',
            value: '20–30 mmHg acima da sistólica estimada',
            sv_kind: 'pa',
            badge: 'ok',
          },
        ],
        footer_rule: 'Carótida ≠ braquial — não misture sítios de palpação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA PA',
        items: [
          {
            label: 'Letra A — repouso excessivo',
            detail: 'Propõe espera muito longa antes da aferição.',
            correct:
              'Protocolo MS: repouso de cerca de cinco minutos sentado — não meia hora ou mais.',
          },
          {
            label: 'Letra C — braço na altura do abdômen',
            detail: 'Posiciona membro abaixo do nível cardíaco.',
            correct:
              'Braço deve estar apoiado ao nível do coração — posição abdominal superestima PA.',
          },
          {
            label: 'Letra D — pulso carotídeo para insuflar',
            detail: 'Usa artéria cervical para estimar insuflação do manguito no braço.',
            correct:
              'Insuflação baseia-se na braquial palpada na fossa antecubital — não na carótida.',
          },
          {
            label: 'Letra E — carótida na fossa antecubital',
            detail: 'Confunde anatomia: carótida não passa na fossa do cotovelo.',
            correct:
              'Fossa antecubital abriga a braquial — carótida é pulso central cervical.',
          },
        ],
        footer_rule: 'Elimine A, C, D, E → confirme manguito na fossa (B)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343801786-4': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline: 'COFEN/OMS — dor como 5º sinal vital: experiência subjetiva e multidimensional',
    roi_error: 'sv_quinto_sinal_dor',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Quinto sinal vital — dor',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Identificar SV ligado à experiência individual e multidimensional — conceito COFEN/OMS.',
            icon: 'Target',
          },
          {
            label: 'Quatro SV clássicos',
            detail: 'PA, temperatura, FC e FR são objetivos e mensuráveis diretamente.',
            icon: 'Activity',
          },
          {
            label: 'Dor — subjetiva',
            detail:
              'Experiência pessoal, influenciada por cultura, emoção e contexto — 5º sinal vital.',
            icon: 'Heart',
          },
          {
            label: 'Distratores objetivos',
            detail: 'PA, temp, FC e FR são parâmetros fisiológicos mensuráveis — não o 5º SV.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — objetivo × subjetivo',
            detail:
              'Banca lista PA/FC/FR/temp (objetivos) para testar se aluno diferencia do 5º sinal subjetivo (dor).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Objetivo × subjetivo — dor é experiência, não só número',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: SV com experiência individual multidimensional = 5º sinal vital.',
          'Testar A — pressão arterial: parâmetro objetivo mensurável → eliminar.',
          'Testar B — temperatura: parâmetro objetivo → eliminar.',
          'Testar C — dor: experiência subjetiva multidimensional → candidata.',
          'Testar D — frequência cardíaca: parâmetro objetivo → eliminar.',
          'Testar E — frequência respiratória: parâmetro objetivo → eliminar.',
          'Confirmar: só dor atende “experiência individual”.',
          'Marcar C.',
        ],
        footer_rule: 'Dor = 5º sinal vital → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sinais vitais',
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
            value: 'Dor — experiência subjetiva e multidimensional',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Gabarito C.',
          },
          {
            label: 'Avaliação da dor',
            value: 'Escalas (EVA, numérica) — relato do paciente',
            sv_kind: 'meta',
            badge: 'ok',
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
        footer_rule: 'Decore: dor é o único subjetivo entre as opções',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 5º SINAL VITAL',
        items: [
          {
            label: 'Letra A — pressão arterial (objetivo)',
            detail: 'PA é mensurada com esfigmomanômetro — parâmetro objetivo mensurável.',
            correct:
              'Pressão arterial é SV clássico objetivo — o 5º sinal vital é subjetivo (dor), não PA.',
          },
          {
            label: 'Letra B — temperatura',
            detail: 'Temperatura é aferida com termômetro — valor numérico objetivo.',
            correct:
              'Temperatura corporal é mensuração direta — diferente da experiência da dor.',
          },
          {
            label: 'Letra D — frequência cardíaca',
            detail: 'FC é contagem de batimentos — parâmetro fisiológico objetivo.',
            correct:
              'Pulso/FC mensuram ritmo cardíaco — não captam dimensão subjetiva do paciente.',
          },
          {
            label: 'Letra E — frequência respiratória',
            detail: 'FR é contagem de incursões — parâmetro respiratório objetivo.',
            correct:
              'FR é SV mensurável por observação/contagem — não é o 5º sinal vital (dor).',
          },
        ],
        footer_rule: 'Objetivo ≠ subjetivo — dor fecha letra C',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343822075-4': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline: 'MS — PA <90/60 hipotensão · FC <60 bradi · FR 12–20 eupneico · T <37,8°C afebril',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV do caso — instabilidade hemodinâmica',
        meta: slideMeta,
        items: [
          {
            label: 'PA do caso',
            detail: 'Pressão arterial criticamente baixa — hipotensão grave.',
            icon: 'HeartPulse',
          },
          {
            label: 'Temperatura axilar',
            detail: 'Valor do enunciado abaixo de 37,8°C — afebril.',
            icon: 'Thermometer',
          },
          {
            label: 'Pulso apical',
            detail: 'FC abaixo de 60 bpm — bradicardia.',
            icon: 'Activity',
          },
          {
            label: 'FR do caso',
            detail: 'Dentro de 12–20 irpm — eupneico.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha E',
            detail:
              'Alternativa E repete três achados corretos mas troca hipotensão por normotensão.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hipotensão grave é o filtro decisivo — não normalize PA crítica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler os quatro valores do enunciado — traduzir cada parâmetro.',
          'Classificar PA: hipotenso (pressão arterial gravemente baixa).',
          'Classificar T: afebril (abaixo de 37,8°C axilar).',
          'Classificar FC: bradicárdico (abaixo de 60 bpm).',
          'Classificar FR: eupneico (faixa 12–20 irpm).',
          'Testar A — normocárdico + taquipneico + hipertenso: oposto do caso → eliminar.',
          'Testar B — normotensa + taquipneico: PA e FR errados → eliminar.',
          'Testar C — afebril + bradicárdico + eupneico + hipotenso: todos conferem → candidata.',
          'Testar D — febril + taquicárdico + taquipneico: três erros → eliminar.',
          'Testar E — normotenso: PA do caso é hipotensão grave, não normotensão → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Afebril · bradicárdico · eupneico · hipotenso → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação SV',
        meta: slideMeta,
        content: 'HIPOTENSÃO GRAVE — NÃO NORMALIZAR',
        rows: [
          {
            label: 'PA — hipotensão',
            value: 'Abaixo de 90/60 mmHg ou sintomática — emergência hemodinâmica',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Temperatura axilar',
            value: 'Afebril abaixo de 37,8°C',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'FC adulto',
            value: 'Abaixo de 60 bpm = bradicardia',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'FR adulto',
            value: '12–20 irpm = eupneico',
            sv_kind: 'fr',
            badge: 'ok',
          },
          {
            label: 'Conduta',
            value: 'Hipotensão grave → comunicar equipe / monitorar',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Hipotensão grave invalida qualquer alternativa “normotensa”',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPOTENSÃO NO CASO',
        items: [
          {
            label: 'Letra A — normocárdico e hipertenso',
            detail: 'FC bradicárdica e PA hipotensa — não normocárdico nem hipertenso.',
            correct:
              'Bradicardia e hipotensão grave do enunciado — alternativa inverte dois parâmetros.',
          },
          {
            label: 'Letra B — normotensa e taquipneica',
            detail: 'PA crítica não é normotensão; FR 13 não é taquipneia.',
            correct:
              'PA criticamente baixa exige hipotensão; FR do caso está na faixa eupneica.',
          },
          {
            label: 'Letra D — febril e taquicárdico',
            detail: 'Temperatura afebril e FC bradicárdica — não febre nem taquicardia.',
            correct:
              'Temperatura e FC do enunciado contradizem três termos da alternativa D.',
          },
          {
            label: 'Letra E — normotenso',
            detail: 'Repete afebril, bradicárdico e eupneico, mas classifica PA crítica como normotensão.',
            correct:
              'PA gravemente baixa do enunciado é hipotensão — pegadinha de “quase certo” com PA errada.',
          },
        ],
        footer_rule: 'Confira PA por último — E cai no “normotenso” falso',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343833455-1': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/SBC — PA: evitar braço operado · repouso ~5 min · sem café/álcool/exercício 30 min antes',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidados pré-PA — mapa V/F',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três afirmativas sobre cuidados com esfigmomanômetro — julgue V/F antes das letras.',
            icon: 'Target',
          },
          {
            label: 'Braço cirúrgico (1º)',
            detail:
              'Evitar braçadeira no lado de mama/axila operada — proteção linfática — verdadeiro.',
            icon: 'Shield',
          },
          {
            label: 'Repouso excessivo (II)',
            detail: 'Tempo muito longo antes da PA — MS orienta cerca de cinco minutos — falso.',
            icon: 'Clock',
          },
          {
            label: 'Estimulantes pré-PA (3º)',
            detail:
              'Afirmativa manda realizar exercício/café/álcool antes — conduta proibida — falso.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha AVANÇASP',
            detail: 'Itens 2 e 3 parecem “cuidados” mas invertem tempo e comportamento pré-aferição.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Só o 1º item é V — repouso e hábitos têm tempo certo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: três itens V/F + combinações — julgar cada afirmativa.',
          'Julgar I: evitar braço de mama/axila operada? → VERDADEIRO.',
          'Julgar II: descansar tempo excessivo antes da PA? → FALSO — repouso padrão cerca de cinco minutos.',
          'Julgar III: fazer exercício/café/álcool antes da aferição? → FALSO — deve-se EVITAR.',
          'Sequência correta: V, F, F.',
          'Eliminar B (V,V,V), C (V,F,V), D (V,V,V), E (F,F,F).',
          'Marcar A.',
        ],
        footer_rule: 'V, F, F → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pré-PA MS',
        meta: slideMeta,
        content: '5 MIN · SEM ESTIMULANTES · BRAÇO ÍNTEGRO',
        rows: [
          {
            label: 'Braço operado',
            value: 'Evitar manguito no lado de cirurgia mama/axila',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: '1º item V.',
          },
          {
            label: 'Repouso',
            value: 'Cerca de cinco minutos sentado — não repouso excessivo',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Pré-aferição',
            value: 'Evitar exercício, café ou álcool imediatamente antes da PA',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Manguito',
            value: '2–3 cm acima da fossa · tamanho adequado',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Braço',
            value: 'Nível do coração · pés apoiados',
            sv_kind: 'pa',
            badge: 'ok',
          },
        ],
        footer_rule: 'Evitar estimulantes ≠ fazer exercício antes da PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CUIDADOS PRÉ-PA',
        items: [
          {
            label: 'Letra B — V, V, V',
            detail: 'Aceita repouso excessivo e estimulantes antes da aferição como corretos.',
            correct:
              'Repouso MS é cerca de cinco minutos; café, álcool e exercício devem ser evitados antes da PA — itens II e III falsos.',
          },
          {
            label: 'Letra C — V, F, V',
            detail: 'Acerta 2º falso, mas mantém 3º verdadeiro (estimulantes permitidos).',
            correct:
              'Realizar exercício e bebidas estimulantes antes da PA invalida a medição — 3º item falso.',
          },
          {
            label: 'Letra D — V, V, V',
            detail: 'Duplicata de combinação que valida todos os itens.',
            correct:
              'Apenas cuidado com braço operado é verdadeiro — demais itens invertem protocolo MS.',
          },
          {
            label: 'Letra E — F, F, F',
            detail: 'Nega o único item verdadeiro (braço operado).',
            correct:
              'Evitar braçadeira em mama/axila operada é conduta correta — 1º item verdadeiro.',
          },
        ],
        footer_rule: 'Só A fecha V,F,F sem negar braço operado',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343845367-1': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA: esfigmomanômetro (manguito + manômetro) ausculta ou palpa braquial',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Equipamentos — PA × outros SV',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Emergência — monitorar pressão sistólica e diastólica do estado hemodinâmico.',
            icon: 'User',
          },
          {
            label: 'Esfigmomanômetro',
            detail:
              'Manguito + manômetro (+ estetoscópio na técnica auscultatória) — mede PA.',
            icon: 'HeartPulse',
          },
          {
            label: 'Termômetro',
            detail: 'Aferição de temperatura — não mede pressão arterial.',
            icon: 'Thermometer',
          },
          {
            label: 'Oxímetro',
            detail: 'SpO₂ e estimativa de FC — não substitui mensuração de PA.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha de equipamento',
            detail: 'Otoscópio e bomba de infusão são distratores de outro contexto clínico.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Sistólica + diastólica = esfigmomanômetro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: equipamento que mede pressão sistólica e diastólica.',
          'Testar A — termômetro: mede temperatura → eliminar.',
          'Testar B — otoscópio: avalia ouvido → eliminar.',
          'Testar C — bomba de infusão: infunde soluções → eliminar.',
          'Testar D — oxímetro: SpO₂/FC estimada → eliminar.',
          'Testar E — esfigmomanômetro: manguito + manômetro para PA → candidata.',
          'Confirmar: só E responde ao enunciado.',
          'Marcar E.',
        ],
        footer_rule: 'PA sistólica/diastólica → esfigmomanômetro → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equipamentos SV',
        meta: slideMeta,
        content: 'CADA SV TEM SEU INSTRUMENTO',
        rows: [
          {
            label: 'Pressão arterial',
            value: 'Esfigmomanômetro (manguito + manômetro)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Gabarito E.',
          },
          {
            label: 'Temperatura',
            value: 'Termômetro (axilar, oral, retal, timpânico)',
            sv_kind: 'temp',
            badge: 'ok',
            exam_hint: 'Alternativa A.',
          },
          {
            label: 'SpO₂',
            value: 'Oxímetro de pulso — complementar',
            sv_kind: 'spo2',
            badge: 'ok',
            exam_hint: 'Alternativa D.',
          },
          {
            label: 'Técnica auscultatória',
            value: 'Estetoscópio + esfigmomanômetro — sons Korotkoff',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'FC por palpação',
            value: 'Relógio + dedos (radial/carótida) — sem manguito',
            sv_kind: 'fc',
            badge: 'ok',
          },
        ],
        footer_rule: 'Associe parâmetro × equipamento antes da prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EQUIPAMENTO PARA PA',
        items: [
          {
            label: 'Letra A — termômetro',
            detail: 'Instrumento exclusivo para temperatura corporal.',
            correct:
              'Termômetro não mede pressão arterial — parâmetro e equipamento incompatíveis.',
          },
          {
            label: 'Letra B — otoscópio',
            detail: 'Usado em avaliação otológica, não hemodinâmica.',
            correct:
              'Otoscópio ilumina conduto auditivo — não aferição de sistólica/diastólica.',
          },
          {
            label: 'Letra C — bomba de infusão',
            detail: 'Equipamento de infusão venosa programada.',
            correct:
              'Bomba de infusão administra fluidos/medicamentos — não mensura PA.',
          },
          {
            label: 'Letra D — oxímetro',
            detail: 'Mede saturação periférica e estima FC.',
            correct:
              'Oxímetro não fornece pressão sistólica/diastólica — outro parâmetro vital.',
          },
        ],
        footer_rule: 'Enunciado cita sistólica/diastólica → só esfigmomanômetro (E)',
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
    console.log(`[handcraft:sv-g03] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g03] total=${ok}`);
}

main();
