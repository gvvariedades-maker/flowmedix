#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — seguranca-do-paciente-g03 (9 slugs — eventos adversos).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Segurança do Paciente';
const BRANCH = 'sp_eventos_adversos';
const REVIEWED = '2026-06-30';
const OMS_SOURCE = {
  id: 'oms-taxonomia-nsp',
  tier: 'A' as const,
  issuer: 'OMS / Ministério da Saúde',
  title: 'Taxonomia de eventos — PNSP Portaria 529/2013',
  year: 2013,
  covers: ['evento adverso', 'incidente', 'quase-erro', 'risco', 'notificação'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = { family: 'conceito' | 'vf' | 'protocolo' | 'legis'; slides: unknown[] };

function metaBase(q: Q, family: string, guideline: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    content_standard: 'golden-v1',
    family,
    pedagogical_branch: BRANCH,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: guideline,
      exam_vs_current: 'none',
    },
    sources: [OMS_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'com-exam-pref-bauru-enfermagem-seguranca-do-paciente-1777102918981-5': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Taxonomia NSP',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Incidente', detail: 'Evento que pode ou resultou em dano — nem sempre há lesão.', icon: 'AlertCircle' },
          { label: 'Evento adverso', detail: 'Incidente que resultou em dano à saúde do paciente.', icon: 'XCircle' },
          { label: 'Gestão de risco', detail: 'Processo sistêmico — não é o incidente com dano.', icon: 'Shield' },
          { label: 'Gabarito', detail: 'Letra C — evento adverso.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Dano à saúde diferencia evento adverso de incidente genérico',
      },
      {
        type: 'golden_rule',
        slide_title: 'Definições-chave',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'EVENTO ADVERSO',
        rows: [
          { label: 'Incidente', value: 'Pode ou não gerar dano', badge: 'ok' },
          { label: 'Evento adverso', value: 'Incidente + dano ao paciente', badge: 'hot', emphasis: 'highlight' },
          { label: 'Gestão de risco', value: 'Prevenção sistêmica', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra C', badge: 'hot' },
        ],
        footer_rule: 'Morte pode ser desfecho de evento adverso — não é a definição',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Pergunta: incidente que resulta em danos à saúde.',
          'Incidente sozinho (B) não exige dano.',
          'Evento adverso = incidente + dano.',
          'Eliminar gestão de risco e morte como definição.',
          'Marcar letra C.',
        ],
        footer_rule: 'Segurança do paciente = reduzir dano desnecessário no cuidado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — TAXONOMIA',
        items: [
          { label: 'Letra A — gestão de risco', detail: 'É processo de prevenção, não o evento com dano.', correct: 'Evento adverso é o desfecho clínico — não a gestão.' },
          { label: 'Letra B — incidente', detail: 'Incidente abrange near miss e evento sem dano.', correct: 'Falta o elemento dano exigido no enunciado.' },
          { label: 'Letra D — morte', detail: 'Morte pode decorrer de evento adverso.', correct: 'Definição pedida é evento adverso, não desfecho específico.' },
        ],
        footer_rule: 'Banca cobra definição OMS/PNSP literal',
      },
    ],
  },

  'cpcon-uepb-enfermagem-seguranca-do-paciente-1777102918981-8': {
    family: 'legis',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PNSP — participação',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Paciente e família', detail: 'Agentes ativos na segurança — objetivo da PNSP.', icon: 'Users' },
          { label: 'Equipe multiprofissional', detail: 'Responsabilidade compartilhada — não só médico/enfermagem.', icon: 'HeartHandshake' },
          { label: 'Notificação', detail: 'Profissionais assistenciais participam de danos e incidentes.', icon: 'Bell' },
          { label: 'Gabarito', detail: 'Letra A — envolver paciente e familiar.', icon: 'CheckCircle' },
        ],
        footer_rule: 'PNSP ≠ violência hospitalar apenas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Política Nacional',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PNSP',
        rows: [
          { label: 'Participação', value: 'Paciente e familiares envolvidos', badge: 'hot' },
          { label: 'Responsabilidade', value: 'Multiprofissional', badge: 'ok' },
          { label: 'Violência', value: 'Não é escopo único da PNSP', badge: 'warn' },
          { label: 'Gabarito', value: 'Letra A', badge: 'hot' },
        ],
        footer_rule: 'Engajamento do usuário é pilar da cultura de segurança',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Comando: afirmativa CORRETA sobre PNSP.',
          'A: envolver pacientes e familiares → manter.',
          'B: excluir paciente/familiar → eliminar.',
          'C: só consciência do paciente → eliminar.',
          'D: enfermagem fora de incidentes → eliminar.',
          'E: só violência hospitalar → eliminar.',
          'Marcar letra A.',
        ],
        footer_rule: 'Cultura de segurança inclui notificação e aprendizado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — PNSP',
        items: [
          { label: 'Letra B — sem envolvimento familiar', detail: 'Exclui paciente da equipe de segurança.', correct: 'PNSP prevê participação ativa de paciente e família.' },
          { label: 'Letra C — só o paciente', detail: 'Transfere responsabilidade exclusiva ao usuário.', correct: 'Segurança é determin coletiva da assistência.' },
          { label: 'Letra D — só gestores', detail: 'Retira enfermagem da notificação de incidentes.', correct: 'Profissionais assistenciais notificam e aprendem com eventos.' },
          { label: 'Letra E — só violência', detail: 'Reduz PNSP a um único tipo de risco.', correct: 'Abrange medicação, cirurgia, quedas, infecção etc.' },
        ],
        footer_rule: 'Distratores negam participação do usuário',
      },
    ],
  },

  'fcm-enfermagem-seguranca-do-paciente-1779563443877-3': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Incidente × dano',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Evento adverso', detail: 'Incidente que resultou em dano ao paciente.', icon: 'XCircle' },
          { label: 'Quase-erro', detail: 'Não atingiu o paciente.', icon: 'ShieldCheck' },
          { label: 'Sem dano', detail: 'Atingiu o paciente, mas sem lesão.', icon: 'MinusCircle' },
          { label: 'Gabarito', detail: 'Letra B — resultou em dano.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Âncora do lote — definição mais recorrente',
      },
      {
        type: 'golden_rule',
        slide_title: 'Classificação',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: '3 NÍVEIS',
        rows: [
          { label: 'Quase-erro', value: 'Não atingiu paciente', badge: 'ok' },
          { label: 'Sem dano', value: 'Atingiu sem lesão', badge: 'ok' },
          { label: 'Evento adverso', value: 'Dano ao paciente', badge: 'hot', emphasis: 'highlight' },
          { label: 'Gabarito', value: 'Letra B', badge: 'hot' },
        ],
        footer_rule: 'Família no incidente não define a classificação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Comando: evento adverso é o incidente que…',
          'B: resultou em dano → manter.',
          'C: não atingiu paciente → quase-erro.',
          'D: atingiu sem dano → incidente sem lesão.',
          'A: envolveu família → irrelevante.',
          'Marcar letra B.',
        ],
        footer_rule: 'Palavra-chave: dano',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — CLASSIFICAÇÃO',
        items: [
          { label: 'Letra C — não atingiu paciente', detail: 'Descreve quase-erro.', correct: 'Evento adverso exige que o erro tenha alcançado o paciente com dano.' },
          { label: 'Letra D — sem dano', detail: 'Incidente sem lesão.', correct: 'Falta o dano que caracteriza evento adverso.' },
          { label: 'Letra A — envolveu família', detail: 'Presença familiar não classifica o incidente.', correct: 'Critério é dano ao paciente, não quem estava presente.' },
        ],
        footer_rule: 'Não confunda near miss com evento adverso',
      },
    ],
  },

  'furb-enfermagem-processo-de-enfermagem-1780011887822-7': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lacuna — definição',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Lacuna', detail: 'Incidentes que resultam em dano ao paciente pelo cuidado.', icon: 'FileText' },
          { label: 'Doença de base', detail: 'Complicação da assistência — não da doença primária.', icon: 'Stethoscope' },
          { label: 'Near miss', detail: 'Não atingiu o paciente — não preenche a lacuna.', icon: 'ShieldCheck' },
          { label: 'Gabarito', detail: 'Letra B — eventos adversos.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Lesão pelo cuidado = evento adverso',
      },
      {
        type: 'golden_rule',
        slide_title: 'Preencher lacuna',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'EVENTOS ADVERSOS',
        rows: [
          { label: 'Definição', value: 'Incidente + dano pelo cuidado', badge: 'hot' },
          { label: '≠ Risco', value: 'Probabilidade futura', badge: 'warn' },
          { label: '≠ Near miss', value: 'Sem atingir paciente', badge: 'warn' },
          { label: 'Gabarito', value: 'Letra B', badge: 'hot' },
        ],
        footer_rule: 'Pode prolongar internação ou gerar incapacidade na alta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Texto define: incidentes com dano pelo cuidado, não pela doença de base.',
          'Eventos adversos encaixam na definição.',
          'Risco/dano/near miss não são o termo técnico pedido.',
          'Marcar letra B.',
        ],
        footer_rule: 'Qualidade em saúde exige análise de eventos adversos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — LACUNA',
        items: [
          { label: 'Letra A — riscos', detail: 'Risco é probabilidade, não evento ocorrido.', correct: 'Lacuna pede incidentes que já causaram dano.' },
          { label: 'Letra E — near miss', detail: 'Near miss não gera dano ao paciente.', correct: 'Texto exige dano decorrente da assistência.' },
          { label: 'Letra C — danos', detail: 'Dano é o desfecho, não a categoria do incidente.', correct: 'Termo técnico = eventos adversos.' },
        ],
        footer_rule: 'Fenômenos é termo genérico — eliminar',
      },
    ],
  },

  'furb-enfermagem-seguranca-do-paciente-1777102918981-7': {
    family: 'vf',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'NSP — Portaria 529',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'I — notificação cidadã', detail: 'Falsa — Portaria 529: notificação por cidadão não é obrigatória.', icon: 'XCircle' },
          { label: 'II — NSP articulador', detail: 'Verdadeira — Núcleos articulam riscos e ações de qualidade.', icon: 'CheckCircle' },
          { label: 'III — notificação voluntária', detail: 'Falsa — serviços devem notificar eventos adversos ao SNVS.', icon: 'XCircle' },
          { label: 'IV — plano de segurança', detail: 'Verdadeira — NSP elabora plano desde admissão até alta ou óbito.', icon: 'CheckCircle' },
        ],
        footer_rule: 'RDC 36/Anvisa e Portaria MS 529/2013 estruturam os NSP',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgamento I–IV',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'NSP',
        rows: [
          { label: 'I', value: 'F — cidadão não obrigado', badge: 'warn' },
          { label: 'II', value: 'V — articulador NSP', badge: 'ok' },
          { label: 'III', value: 'F — notificação institucional', badge: 'warn' },
          { label: 'IV', value: 'V — plano promoção/proteção/mitigação', badge: 'ok' },
          { label: 'Estabelecimentos', value: 'NSP em cada serviço de saúde', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra C — II e IV', badge: 'hot' },
        ],
        footer_rule: 'Dados dos notificadores são confidenciais — SNVS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'NSPs previstos na Portaria MS 529/2013 e RDC 36/Anvisa.',
          'Afirmativa I: notificação cidadã obrigatória → F.',
          'Afirmativa II: NSP articulador de riscos → V.',
          'Afirmativa III: notificação voluntária ao NSP → F.',
          'Afirmativa IV: plano de segurança do serviço → V.',
          'Corretas II e IV — letra C.',
        ],
        footer_rule: 'Sistema Nacional de Vigilância Sanitária guarda dados confidenciais',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — NSP I–IV',
        items: [
          { label: 'Letra A — I e II', detail: 'Inclui I falsa.', correct: 'Cidadão pode notificar, mas não é obrigatório no texto.' },
          { label: 'Letra B — todas', detail: 'Aceita I e III incorretas.', correct: 'Só II e IV são verdadeiras.' },
          { label: 'Letra E — III e IV', detail: 'III nega dever de notificar.', correct: 'Serviço deve notificar eventos — III é falsa.' },
        ],
        footer_rule: 'III confunde voluntariedade com omissão institucional',
      },
    ],
  },

  'idcap-enfermagem-seguranca-do-paciente-1777102742836-0': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Termos trocados',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Terminologias NSP', detail: 'Técnico de Enfermagem usa termos padronizados na comunicação com equipe e paciente.', icon: 'MessageSquare' },
          { label: 'Risco', detail: 'Probabilidade de um evento particular atingir o indivíduo — gabarito D.', icon: 'TrendingUp' },
          { label: 'Erro', detail: 'Falha não intencional na execução — não é dano (letra B).', icon: 'AlertTriangle' },
          { label: 'Dano', detail: 'Prejuízo à função/estrutura — não é erro (letra C).', icon: 'XCircle' },
          { label: 'Evento adverso', detail: 'Incidente que resultou em dano — não só potencial (letra E).', icon: 'ShieldAlert' },
        ],
        footer_rule: 'Prática segura exige vocabulário comum entre profissionais',
      },
      {
        type: 'golden_rule',
        slide_title: 'Glossário NSP',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'RISCO',
        rows: [
          { label: 'Risco', value: 'Probabilidade do evento', badge: 'hot' },
          { label: 'Erro', value: 'Falha na execução', badge: 'ok' },
          { label: 'Dano', value: 'Lesão/prejuízo', badge: 'ok' },
          { label: 'Evento adverso', value: 'Incidente + dano', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra D', badge: 'hot' },
        ],
        footer_rule: 'Comunicação clara evita falhas na equipe',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Técnico de Enfermagem deve dominar terminologias de segurança do paciente.',
          'Qual definição está correta na comunicação assistencial?',
          'D: risco = probabilidade de evento atingir indivíduo → manter.',
          'B/C trocam erro e dano; E confunde evento adverso.',
          'Marcar letra D.',
        ],
        footer_rule: 'Leia cada alternativa como definição literal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — GLOSSÁRIO',
        items: [
          { label: 'Letra B — dano como erro', detail: 'Define dano com texto de erro.', correct: 'Erro = falha na execução do plano.' },
          { label: 'Letra C — erro como dano', detail: 'Define erro com texto de lesão corporal.', correct: 'Dano = prejuízo à função ou estrutura.' },
          { label: 'Letra E — evento adverso potencial', detail: 'Fala em “pode ocasionar” sem dano ocorrido.', correct: 'Evento adverso exige dano ao paciente.' },
        ],
        footer_rule: 'Incidente (A) é termo guarda-chuva — não era a definição pedida',
      },
    ],
  },

  'instituto-consulplan-enfermagem-seguranca-do-paciente-1777102678563-1': {
    family: 'legis',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Portaria 529/2013',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'PNSP', detail: 'Programa Nacional de Segurança do Paciente — 2013.', icon: 'Shield' },
          { label: 'Evento adverso', detail: 'Incidente que resulta em dano ao paciente.', icon: 'XCircle' },
          { label: 'Incidente (D)', detail: 'Pode ou não resultar em dano — definição mais ampla.', icon: 'AlertCircle' },
          { label: 'Gabarito', detail: 'Letra B — Portaria 529.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Diferença: dano ao paciente',
      },
      {
        type: 'golden_rule',
        slide_title: 'Definição legal',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PORTARIA 529',
        rows: [
          { label: 'Evento adverso', value: 'Incidente + dano', badge: 'hot', emphasis: 'highlight' },
          { label: 'Letra D', value: 'Definição de incidente', badge: 'warn' },
          { label: 'Letra C', value: 'Desfecho grave — não definição', badge: 'warn' },
          { label: 'Gabarito', value: 'Letra B', badge: 'hot' },
        ],
        footer_rule: 'Memorize: evento adverso = incidente com dano',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Portaria 529 define evento adverso.',
          'B: incidente com dano ao paciente → manter.',
          'D: texto de incidente genérico → eliminar.',
          'A/C: definições incompletas → eliminar.',
          'Marcar letra B.',
        ],
        footer_rule: 'Legislação brasileira alinhada à OMS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — PORTARIA',
        items: [
          { label: 'Letra D — incidente amplo', detail: 'Inclui “poderia resultar” sem exigir dano.', correct: 'Evento adverso exige dano efetivo ao paciente.' },
          { label: 'Letra C — morte ou incapacidade', detail: 'Descreve gravidade, não definição legal.', correct: 'Qualquer dano caracteriza evento adverso.' },
          { label: 'Letra A — comprometimento função', detail: 'É aspecto do dano, não definição completa.', correct: 'Definição oficial = incidente + dano.' },
        ],
        footer_rule: 'Não troque incidente por evento adverso na prova',
      },
    ],
  },

  'omni-enfermagem-seguranca-do-paciente-1779563467322-2': {
    family: 'conceito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Probabilidade',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Risco', detail: 'Probabilidade de um incidente ocorrer na assistência.', icon: 'TrendingUp' },
          { label: 'Incidente', detail: 'Evento que ocorreu — não probabilidade.', icon: 'AlertCircle' },
          { label: 'Evento adverso', detail: 'Incidente com dano — desfecho, não chance.', icon: 'XCircle' },
          { label: 'Gabarito', detail: 'Letra B — risco.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Enunciado curto — palavra-chave: probabilidade',
      },
      {
        type: 'golden_rule',
        slide_title: '4 conceitos',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'RISCO',
        rows: [
          { label: 'Risco', value: 'Probabilidade de incidente', badge: 'hot' },
          { label: 'Incidente', value: 'Ocorrência', badge: 'ok' },
          { label: 'Evento adverso', value: 'Incidente + dano', badge: 'ok' },
          { label: 'Dano', value: 'Prejuízo à saúde', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra B', badge: 'hot' },
        ],
        footer_rule: 'Gestão de risco reduz probabilidade antes do incidente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          '“Probabilidade de um incidente ocorrer” = risco.',
          'Eliminar dano, incidente e evento adverso.',
          'Marcar letra B.',
        ],
        footer_rule: 'Definição direta — sem pegadinha de classificação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — PROBABILIDADE',
        items: [
          { label: 'Letra A — dano', detail: 'Dano é consequência, não probabilidade.', correct: 'Risco antecede o incidente.' },
          { label: 'Letra C — incidente', detail: 'Incidente já ocorreu.', correct: 'Probabilidade = risco futuro.' },
          { label: 'Letra D — evento adverso', detail: 'Exige dano consumado.', correct: 'Risco mede chance antes do dano.' },
        ],
        footer_rule: 'Mesma lógica da questão IDCAP — risco = probabilidade',
      },
    ],
  },

  'univali-enfermagem-seguranca-do-paciente-1777102821787-4': {
    family: 'protocolo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Notificar incidente',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        items: [
          { label: 'Erro de medicação', detail: 'Incidente com potencial de evento adverso.', icon: 'Pill' },
          { label: 'NSP', detail: 'Núcleo de Segurança do Paciente — receptor da notificação.', icon: 'Building2' },
          { label: 'Cultura de segurança', detail: 'Notificar sem punição retributiva — aprender com o erro.', icon: 'Heart' },
          { label: 'Gabarito', detail: 'Letra C — notificar imediatamente.', icon: 'CheckCircle' },
        ],
        footer_rule: 'Testemunha também tem dever de notificar',
      },
      {
        type: 'golden_rule',
        slide_title: 'Conduta de Maria',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'NOTIFICAR JÁ',
        rows: [
          { label: 'Enfermeiro', value: 'Comunicar imediatamente', badge: 'hot' },
          { label: 'NSP', value: 'Registrar incidente', badge: 'ok' },
          { label: 'Paciente', value: 'Monitorar e tratar se necessário', badge: 'ok' },
          { label: 'Gabarito', value: 'Letra C', badge: 'hot' },
        ],
        footer_rule: 'Omisão perpetua risco para outros pacientes',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        steps: [
          'Maria presencia medicação errada.',
          'C: notificar enfermeiro e NSP → manter.',
          'A: só alertar colega em segredo → eliminar.',
          'B: esperar reação → eliminar.',
          'D: ignorar → eliminar.',
          'Marcar letra C.',
        ],
        footer_rule: 'Notificação imediata permite intervenção precoce',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Enfermagem', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — CONDUTA',
        items: [
          { label: 'Letra A — discrição só com colega', detail: 'Não aciona equipe nem NSP.', correct: 'Incidente exige notificação institucional imediata.' },
          { label: 'Letra B — aguardar reação', detail: 'Atraso aumenta dano potencial.', correct: 'Intervir e notificar assim que presenciar o erro.' },
          { label: 'Letra D — ignorar', detail: 'Responsabilidade ética é de toda a equipe.', correct: 'Cultura de segurança valoriza quem notifica.' },
        ],
        footer_rule: 'Medicação errada pode virar evento adverso grave',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir('seguranca-do-paciente-g03');
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const out = {
      meta: metaBase(raw, pack.family, 'OMS/PNSP — taxonomia de incidentes e eventos adversos'),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, JSON.stringify(out, null, 2) + '\n', 'utf8');
    ok++;
    console.log(`[handcraft:g03] OK ${slug}`);
  }
  console.log(`[handcraft:g03] total=${ok}`);
}

main();
