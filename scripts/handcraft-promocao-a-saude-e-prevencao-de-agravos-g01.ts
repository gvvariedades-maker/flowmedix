#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g01 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g01
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g01';
const SUBTOPICO = 'Promoção à Saúde e Prevenção de Agravos';
const REVIEWED = '2026-07-20';

const LEI_8080_SOURCE = {
  id: 'lei-8080-1990',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 8.080/1990 — Lei Orgânica da Saúde',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
  covers: ['Art. 4º composição do SUS', 'ações e serviços de saúde', 'administração direta e indireta'],
};

const MS_PROMOCAO_SOURCE = {
  id: PROMOCAO_SAUDE_SUS.id,
  tier: 'A' as const,
  issuer: PROMOCAO_SAUDE_SUS.issuer,
  title: PROMOCAO_SAUDE_SUS.title,
  year: PROMOCAO_SAUDE_SUS.year,
  url: PROMOCAO_SAUDE_SUS.url,
  covers: [
    'determinantes sociais',
    'educação em saúde',
    'prevenção de agravos',
    'MEV hipertensão',
    'circunferência abdominal',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'promocao_art4_composicao'
  | 'promocao_educacao_prevencao'
  | 'promocao_principios_direitos'
  | 'promocao_generico';

type Pack = {
  family: 'legis' | 'certo_errado' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  sources?: (typeof LEI_8080_SOURCE | typeof MS_PROMOCAO_SOURCE)[];
  exam_vs_current?: string;
  slides: unknown[];
  topico?: string;
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  const topico = pack.topico ?? String(q.meta.topico ?? 'Enfermagem');
  return {
    ...q.meta,
    topico,
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
    sources: pack.sources ?? [MS_PROMOCAO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\besseproblema\b/gi, 'esse problema')
    .replace(/\bnutrizesou\b/gi, 'nutrizes ou')
    .replace(/alimentação,atividade/gi, 'alimentação, atividade')
    .replace(/eSF\)realizam/gi, 'eSF) realizam')
    .replace(/\boutrasoportunidades\b/gi, 'outras oportunidades')
    .replace(/\btemcomo\b/gi, 'tem como')
    .replace(/implementaçãodependerá/gi, 'implementação dependerá')
    .replace(/\bvidapara\b/gi, 'vida para')
    .replace(/perpetuam esse/gi, 'perpetuam esse ')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfNoise(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfNoise(o.text) })),
  };
}

const SPECS: Record<string, Pack> = {
  'cesgranrio-saude-publica-promocao-a-saude-e-prevencao-de-agravos-premium-pilot': {
    family: 'legis',
    branch: 'promocao_art4_composicao',
    topico: 'Saúde Pública',
    guideline: 'Lei 8.080/1990 Art. 4º — composição do SUS',
    sources: [LEI_8080_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SUS — composição legal (Art. 4º)',
        meta: { topico: 'Saúde Pública', subtopico: SUBTOPICO },
        items: [
          {
            label: 'Lei Orgânica da Saúde',
            detail: 'Lei 8.080/1990 — norma-mãe do SUS. “O que compõe o SUS” remete ao Art. 4º.',
            icon: 'Scale',
          },
          {
            label: 'Art. 4º — núcleo',
            detail: 'SUS = conjunto de ações e serviços de saúde prestados por órgãos e instituições públicas.',
            icon: 'FileText',
          },
          {
            label: 'Ações + serviços',
            detail: 'Par obrigatório. Banca erra trocando por “só hospital”, “só AB” ou “só média/alta”.',
            icon: 'Layers',
          },
          {
            label: 'Três esferas',
            detail: 'União, estados e municípios — alternativa incompleta costuma omitir um ente.',
            icon: 'Landmark',
          },
          {
            label: 'Direta + indireta',
            detail: 'Pegadinha clássica: citar só administração direta exclui autarquias e fundações.',
            icon: 'Building2',
          },
          {
            label: 'Fundações públicas',
            detail: '“Mantidas pelo Poder Público” entram expressamente — exclusão = distrator.',
            icon: 'Library',
          },
        ],
        footer_rule: 'DECORE: ações + serviços | 3 esferas | direta + indireta | fundações',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Saúde Pública', subtopico: SUBTOPICO },
        steps: [
          'Comando: “constitui o Sistema Único de Saúde o conjunto de…” — definição legal, não princípio isolado.',
          'Fonte: Lei Orgânica da Saúde = Lei 8.080/1990 → Art. 4º.',
          'Recuperar 4 blocos: ações e serviços | esferas | direta/indireta | fundações.',
          'Eliminar A — só hospital/referência: recorte hospitalar, falta “ações”.',
          'Eliminar B — só atenção básica com exclusões inventadas.',
          'Eliminar D — média/alta + só direta: corta AB e gestão indireta.',
          'Eliminar E — exclui pesquisa e insumos: limitação não prevista no Art. 4º.',
          'Resta a redação integral: ações e serviços + 3 esferas + direta/indireta + fundações.',
          'Em similares: compare cada alternativa com os 4 blocos do Art. 4º — falta um, está errada.',
        ],
        footer_rule: 'Lei → artigo → 4 blocos → eliminação por recorte',
      },
      {
        type: 'golden_rule',
        slide_title: 'Art. 4º — referência de prova',
        meta: { topico: 'Saúde Pública', subtopico: SUBTOPICO },
        content: 'COMPOSIÇÃO DO SUS — O QUE A BANCA COBRA',
        rows: [
          { label: 'Norma', value: 'Lei 8.080/1990 — Lei Orgânica da Saúde', badge: 'hot' },
          { label: 'Dispositivo', value: 'Art. 4º — define o que constitui o SUS', badge: 'hot' },
          { label: 'Natureza', value: 'Ações e serviços de saúde (par completo)', badge: 'warn' },
          { label: 'Prestadores', value: 'Órgãos e instituições públicas (União, UF, municípios)', badge: 'warn' },
          { label: 'Gestão', value: 'Administração direta e indireta', badge: 'ok' },
          { label: 'Também integram', value: 'Fundações mantidas pelo Poder Público', badge: 'ok' },
          { label: 'Não confundir', value: 'Lei 8.142/90 = controle social — outro foco', badge: 'info' },
          { label: 'Mnemônico', value: 'A-S-E-D-I-F: Ações, Serviços, Esferas, Direta/Indireta, Fundações', badge: 'ok' },
        ],
        footer_rule: 'Literalidade do Art. 4º vale mais que “senso comum” restritivo.',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: { topico: 'Saúde Pública', subtopico: SUBTOPICO },
        content: 'PEGADINHAS — RECORTES DO ART. 4º',
        items: [
          {
            label: 'Letra A — só hospital',
            detail: 'Troca “ações e serviços” por “serviços hospitalares”.',
            correct: 'Art. 4º exige ações e serviços em sentido amplo — não só hospital.',
          },
          {
            label: 'Letra B — só APS',
            detail: 'Limita à atenção básica e inventa exclusões (odonto, conveniadas).',
            correct: 'Composição legal não restringe o SUS à APS.',
          },
          {
            label: 'Letra D — média/alta + só direta',
            detail: 'Corta atenção básica e elimina administração indireta.',
            correct: 'Art. 4º inclui todos os níveis na lógica de ações/serviços e direta + indireta.',
          },
          {
            label: 'Letra E — exclui pesquisa',
            detail: 'Acrescenta limitação de pesquisa e insumos não prevista na lei.',
            correct: 'Gabarito legal não exclui essas ações no setor público de saúde.',
          },
          {
            label: 'Confundir CF com 8.080',
            detail: 'Enunciado cita universalidade/integralidade, mas a pergunta é composição na lei.',
            correct: 'Responda pelo Art. 4º — princípios contextualizam, não substituem a definição.',
          },
          {
            label: 'Marcar a alternativa “menor”',
            detail: 'Instinto de escolher a opção mais curta.',
            correct: 'Cesgranrio prefere redação legal ampla e fiel ao dispositivo.',
          },
        ],
        footer_rule: '4 blocos: A+S · 3E · D+I · FND — recorte = distrator',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-0': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Determinantes sociais — educação individual não basta (MS / Ottawa)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diarreia — educação × estrutura',
        meta: slideMeta,
        items: [
          { label: 'Item C/E', detail: 'MS valida saberes de saúde coletiva — julgar afirmativa sobre diarreia.', icon: 'FileText' },
          { label: 'Educação em saúde', detail: 'Higiene e alimentação são ações individuais importantes.', icon: 'Users' },
          { label: 'Determinantes estruturais', detail: 'Saneamento, água tratada, moradia e renda moldam o risco.', icon: 'Home' },
          { label: 'Promoção × prevenção', detail: 'Promoção atua nos determinantes — não só no comportamento isolado.', icon: 'Layers' },
          { label: 'Pegadinha “suficiente”', detail: 'Banca testa se orientação individual resolve problema estrutural.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Educação ajuda — mas não substitui saneamento e políticas públicas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: orientar higiene e alimentação “é ação suficiente” para mudar condições da diarreia.',
          'Palavra-chave: “suficiente” — exige julgar se educação isolada resolve o problema.',
          'Diarreia tem determinantes estruturais: esgoto, água, moradia, renda (MS / Ottawa).',
          'Educação em higiene é necessária, mas insuficiente sem saneamento básico.',
          'Afirmativa absolutiza a educação individual — contraria promoção à saúde coletiva.',
          'Julgar Errado — letra B.',
          'Em similares: “suficiente” + só comportamento individual em tema estrutural → tendência Errado.',
        ],
        footer_rule: 'Promoção exige ação nos determinantes — não só palestra',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DETERMINANTES DAS DOENÇAS DIARREICAS',
        rows: [
          { label: 'Individual', value: 'Higiene e hábitos alimentares', badge: 'info' },
          { label: 'Ambiental', value: 'Água tratada e esgoto adequado', badge: 'hot' },
          { label: 'Estrutural', value: 'Moradia, renda e saneamento básico', badge: 'hot' },
          { label: 'Educação', value: 'Necessária — mas não suficiente sozinha', badge: 'warn' },
        ],
        footer_rule: 'MS: prevenir diarreia exige saneamento + educação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E DETERMINANTES',
        items: [
          {
            label: 'Marcar Certo',
            detail: 'Parece lógico valorizar higiene e alimentação.',
            correct: 'Educação isolada não altera condições estruturais que perpetuam a diarreia.',
          },
          {
            label: 'Ignorar “suficiente”',
            detail: 'Focar só no conteúdo da orientação e não no absolutismo do termo.',
            correct: 'Cebraspe usa “suficiente” para testar visão ampliada de promoção à saúde.',
          },
          {
            label: 'Confundir com Plano A/B/C',
            detail: 'Transferência: tratamento da diarreia aguda é outro eixo.',
            correct: 'A questão é prevenção estrutural — não manejo clínico do episódio.',
          },
        ],
        footer_rule: 'Educação sim — suficiente sozinha, não',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-1': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Determinantes sociais do processo saúde-doença (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Determinantes sociais da saúde',
        meta: slideMeta,
        items: [
          { label: 'Item C/E', detail: 'Chances de adoecer e morrer variam conforme fatores sociais.', icon: 'Scale' },
          { label: 'Classe social', detail: 'Acesso a recursos, moradia e trabalho influenciam o risco.', icon: 'Users' },
          { label: 'Gênero e raça', detail: 'Exposições e barreiras diferenciadas no processo saúde-doença.', icon: 'Heart' },
          { label: 'Cultura e geração', detail: 'Hábitos, percepções e vulnerabilidades por faixa etária.', icon: 'Globe' },
          { label: 'Equidade', detail: 'SUS busca reduzir desigualdades — não nega que elas existem.', icon: 'Shield' },
        ],
        footer_rule: 'Saúde não é sorte — é socialmente determinada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: adoecimento e morte variam por classe, cultura, raça, geração e gênero.',
          'Conceito: determinantes sociais do processo saúde-doença (OMS / MS).',
          'Desigualdades em saúde são documentadas e orientam políticas públicas.',
          'Negar variação social contraria evidência epidemiológica e diretrizes do SUS.',
          'Afirmativa alinhada ao saber validado do MS em saúde coletiva.',
          'Julgar Certo — letra A.',
          'Em similares: listar fatores sociais de risco em C/E → tendência Certo no MS.',
        ],
        footer_rule: 'Reconhecer desigualdade ≠ aceitá-la — é base da equidade',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DETERMINANTES DO PROCESSO SAÚDE-DOENÇA',
        rows: [
          { label: 'Classe social', value: 'Acesso a recursos e condições de vida', badge: 'hot' },
          { label: 'Gênero e raça', value: 'Exposição a riscos e barreiras específicas', badge: 'ok' },
          { label: 'Cultura', value: 'Hábitos e percepções de autocuidado', badge: 'info' },
          { label: 'Geração', value: 'Vulnerabilidade varia com a idade', badge: 'info' },
        ],
        footer_rule: 'Promoção à saúde atua sobre determinantes — não só no indivíduo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E DESIGUALDADE',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Parece “discriminatório” admitir diferenças entre grupos.',
            correct: 'Reconhecer variação social é premissa científica — base para equidade no SUS.',
          },
          {
            label: 'Confundir com fatalismo',
            detail: 'Transferência: admitir desigualdade não é dizer que é inevitável.',
            correct: 'Políticas públicas existem justamente para reduzir essas diferenças.',
          },
          {
            label: 'Reduzir a genética',
            detail: 'Focar só em biologia ignora classe, cultura e ambiente.',
            correct: 'A afirmativa é sobre determinantes sociais — não herança genética isolada.',
          },
        ],
        footer_rule: 'Negar desigualdade social em saúde = erro conceitual',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-3': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Campanhas MS — abstinência de álcool em grupos de risco',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Álcool — grupos de risco',
        meta: slideMeta,
        items: [
          { label: 'Campanhas de prevenção', detail: 'MS orienta mensagens claras em agravos evitáveis.', icon: 'Megaphone' },
          { label: 'Menores de 18 anos', detail: 'Venda e consumo proibidos — abstinência total.', icon: 'Ban' },
          { label: 'Gestantes e nutrizes', detail: 'Nenhuma dose segura — risco de teratogenia e FASD.', icon: 'Baby' },
          { label: 'Planejamento reprodutivo', detail: 'Mulheres tentando engravidar: evitar álcool em qualquer quantidade.', icon: 'Heart' },
          { label: 'Pegadinha “moderação”', detail: 'Para esses grupos, não há nível seguro de consumo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Grupos de risco: abstinência total — não “moderação”',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: em campanhas, orientar evitar álcool em qualquer quantidade para <18, gestantes, nutrizes e quem tenta engravidar.',
          'MS e OMS: não há nível seguro de álcool na gestação e lactação.',
          'Menores: proibição legal de consumo — mensagem de campanha é abstinência.',
          'Pré-concepção: álcool aumenta risco fetal — orientação é evitar totalmente.',
          'Afirmativa reproduz diretriz de campanhas de prevenção de agravos.',
          'Julgar Certo — letra A.',
          'Em similares: “qualquer quantidade” + gestante/menor → tendência Certo nas campanhas MS.',
        ],
        footer_rule: 'Campanha = mensagem clara de risco zero nesses grupos',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ÁLCOOL — ORIENTAÇÃO EM CAMPANHAS',
        rows: [
          { label: 'Menores de 18', value: 'Abstinência total — vedação legal', badge: 'hot' },
          { label: 'Gestantes', value: 'Nenhuma dose segura — prevenir teratogenia', badge: 'hot' },
          { label: 'Nutrizes', value: 'Evitar álcool — passa ao leite', badge: 'warn' },
          { label: 'Tentando engravidar', value: 'Abstinência para reduzir risco fetal', badge: 'warn' },
        ],
        footer_rule: 'Prevenção primária: zero álcool nos grupos de risco',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E ÁLCOOL',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Parece exagerado proibir “qualquer quantidade”.',
            correct: 'Para gestante, lactante, menor e pré-concepção, a diretriz é abstinência total.',
          },
          {
            label: 'Confundir com adulto saudável',
            detail: 'Transferência: moderação pode ser discutida em outro contexto.',
            correct: 'A questão cita grupos específicos — neles não há nível seguro.',
          },
          {
            label: 'Achar que campanha = liberdade individual',
            detail: 'Mensagem pública prioriza proteção de vulneráveis.',
            correct: 'Campanhas de prevenção reforçam abstinência nesses grupos.',
          },
        ],
        footer_rule: 'Gestante + menor + nutriz = zero álcool na campanha',
      },
    ],
  },

  'cebraspe-cespe-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-4': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Prevenção da obesidade — intervenção multifatorial (MS / OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Obesidade — prevenção multifatorial',
        meta: slideMeta,
        items: [
          { label: 'Campanhas de prevenção', detail: 'Obesidade é doença crônica com múltiplos determinantes.', icon: 'Activity' },
          { label: 'Alimentação', detail: 'Reeducação alimentar e escolhas saudáveis.', icon: 'Apple' },
          { label: 'Atividade física', detail: 'Aumento do gasto energético regular.', icon: 'Dumbbell' },
          { label: 'Comportamento', detail: 'Mudança de hábitos e automonitoramento do peso.', icon: 'Brain' },
          { label: 'Grupo', detail: 'Sessões coletivas reforçam adesão — abordagem promissora.', icon: 'Users' },
        ],
        footer_rule: 'Obesidade: intervenção isolada raramente sustenta resultado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: estratégias promissoras combinam alimentação, atividade, comportamento, peso e grupos.',
          'Evidência MS/OMS: prevenção da obesidade exige abordagem multifatorial.',
          'Componentes listados são pilares clássicos de MEV e promoção da saúde.',
          'Intervenção única (só dieta ou só exercício) tem menor adesão e resultado.',
          'Afirmativa descreve modelo integrado reconhecido em políticas públicas.',
          'Julgar Certo — letra A.',
          'Em similares: “multifatorial” + componentes de MEV em C/E → tendência Certo.',
        ],
        footer_rule: 'Prevenção da obesidade = pacote integrado de ações',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PILARES DA PREVENÇÃO DA OBESIDADE',
        rows: [
          { label: 'Alimentação', value: 'Reeducação e escolhas saudáveis', badge: 'hot' },
          { label: 'Atividade física', value: 'Gasto energético regular', badge: 'hot' },
          { label: 'Comportamento', value: 'Mudança de hábitos e metas', badge: 'ok' },
          { label: 'Monitoramento', value: 'Automonitoramento do peso', badge: 'info' },
          { label: 'Grupo', value: 'Sessões coletivas de apoio', badge: 'info' },
        ],
        footer_rule: 'MEV + grupo + monitoramento = modelo promissor',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E OBESIDADE',
        items: [
          {
            label: 'Marcar Errado',
            detail: 'Parece excessivo listar tantos componentes juntos.',
            correct: 'Evidência aponta intervenção combinada como mais efetiva que ação isolada.',
          },
          {
            label: 'Reduzir a “só emagrecer”',
            detail: 'Transferência: prevenção não é só perda de peso rápida.',
            correct: 'Mudança de comportamento e grupo sustentam o resultado a longo prazo.',
          },
          {
            label: 'Ignorar sessões em grupo',
            detail: 'Achar que grupo é “extra” e não componente essencial.',
            correct: 'Apoio coletivo é estratégia promissora em promoção da saúde.',
          },
        ],
        footer_rule: 'Multifatorial ≠ complicar — é o que funciona',
      },
    ],
  },

  'fgv-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-5': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Circunferência abdominal — risco cardiovascular (MS / SBC)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Circunferência abdominal masculina',
        meta: slideMeta,
        items: [
          { label: 'Dado clínico', detail: 'Homem com circunferência abdominal = 83 cm.', icon: 'Ruler' },
          { label: 'Comando', detail: 'Classificar risco de complicações metabólicas e cardiovasculares.', icon: 'Target' },
          { label: 'Corte masculino', detail: 'Risco aumentado: ≥ 94 cm; muito alto: ≥ 102 cm (MS/SBC).', icon: 'AlertTriangle' },
          { label: '83 cm', detail: 'Abaixo do limiar de 94 cm — não configura risco aumentado.', icon: 'CheckCircle' },
          { label: 'Pegadinha escala', detail: 'FGV usa categorias: normal, baixo, médio, alto, muito alto.', icon: 'BarChart' },
        ],
        footer_rule: 'Homem < 94 cm CA → risco baixo/normal na escala da prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar sexo masculino e medida: circunferência abdominal = 83 cm.',
          'Recuperar corte MS: homens — risco aumentado a partir de 94 cm.',
          '83 cm está abaixo de 94 cm — não entra em faixa de risco elevado.',
          'Eliminar D e E — alto e muito alto exigem medidas bem maiores.',
          'Eliminar C — médio pressupõe proximidade ou ultrapassagem do corte.',
          'Eliminar A — “normal” pode confundir; a banca marca “baixo” como gabarito.',
          'Marcar B — risco baixo de complicações metabólicas e cardiovasculares.',
          'Em similares: homem com CA < 94 cm → risco baixo/normal — não médio/alto.',
        ],
        footer_rule: 'Decore o corte: homem ≥ 94 cm | mulher ≥ 80 cm (risco aumentado)',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CIRCUNFERÊNCIA ABDOMINAL — RISCO',
        rows: [
          { label: 'Homem — aumentado', value: '≥ 94 cm', badge: 'hot' },
          { label: 'Homem — muito alto', value: '≥ 102 cm', badge: 'warn' },
          { label: 'Mulher — aumentado', value: '≥ 80 cm', badge: 'info' },
          { label: 'Mulher — muito alto', value: '≥ 88 cm', badge: 'info' },
          { label: '83 cm (homem)', value: 'Abaixo do corte — risco baixo', badge: 'ok' },
        ],
        footer_rule: 'CA abdominal = marcador de adiposidade visceral e risco CV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CA ABDOMINAL',
        items: [
          {
            label: 'Letra A — normal',
            detail: 'Termo próximo, mas a banca consolida “baixo” para 83 cm.',
            correct: 'Gabarito FGV: B — risco baixo.',
          },
          {
            label: 'Letra C — médio',
            detail: 'Tentação de classificar qualquer medida como intermediária.',
            correct: '83 cm está longe do corte de 94 cm em homem.',
          },
          {
            label: 'Letra D — alto',
            detail: 'Confundir com obesidade central já estabelecida.',
            correct: 'Alto exige CA ≥ 94 cm no homem — 83 cm está abaixo.',
          },
          {
            label: 'Letra E — muito alto',
            detail: 'Reservar para CA ≥ 102 cm — bem acima de 83 cm.',
            correct: 'Muito alto exige circunferência muito superior à medida do caso.',
          },
          {
            label: 'Usar corte feminino',
            detail: 'Transferência: mulher tem limiar 80 cm — não aplicar ao homem.',
            correct: 'Sempre verificar sexo antes do corte de circunferência.',
          },
        ],
        footer_rule: 'Sexo → corte → classificação — nessa ordem',
      },
    ],
  },

  'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-5': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Controle de escorpião — educação em saúde (eSF / MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prevenção de acidentes com escorpião',
        meta: slideMeta,
        items: [
          { label: 'Contexto APS', detail: 'eSF em Taubaté — palestras e educação em saúde sobre escorpião.', icon: 'Home' },
          { label: 'Barreira domiciliar', detail: 'Rodapés fechados e janelas teladas impedem entrada do artrópode.', icon: 'Shield' },
          { label: 'Queimada', detail: 'Destrói habitat e dispersa escorpiões — proibida como controle.', icon: 'Flame' },
          { label: 'Predadores naturais', detail: 'Lagartos, sapos e aves ajudam no controle — não eliminar.', icon: 'Bird' },
          { label: 'Galinhas', detail: 'Agentes biológicos controladores — não afastar do domicílio.', icon: 'Egg' },
        ],
        footer_rule: 'Prevenção = barreira física + preservar predadores',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: orientação correta para controle e manejo de escorpiões em campanha da eSF.',
          'Prevenção domiciliar: vedar frestas — rodapés soltos e janelas sem tela facilitam entrada.',
          'Eliminar A — queimada em terreno baldio dispersa escorpiões e agrava risco.',
          'Eliminar C — lagartos, sapos e aves são aliados no controle biológico.',
          'Eliminar D — galinhas soltas são controladores eficazes — não afastar.',
          'Eliminar E — fossa ventilada não é medida principal contra escorpião.',
          'Marcar B — reparar rodapés e telar janelas no interior do domicílio.',
          'Em similares: educação em zoonoses — barreira física sim; queimada e eliminar predadores, não.',
        ],
        footer_rule: 'Telar + vedar rodapés = prevenção domiciliar de escorpião',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONTROLE DE ESCORPIÃO — ORIENTAÇÕES',
        rows: [
          { label: 'Domicílio', value: 'Rodapés fechados + janelas teladas', badge: 'hot' },
          { label: 'Terreno', value: 'Limpeza sem queimada — evita dispersão', badge: 'warn' },
          { label: 'Predadores', value: 'Preservar lagartos, sapos, aves e galinhas', badge: 'ok' },
          { label: 'Queimada', value: 'Não recomendada — aumenta risco de acidente', badge: 'warn' },
        ],
        footer_rule: 'Educação em saúde: barreira + ecologia — não fogo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCORPIÃO',
        items: [
          {
            label: 'Letra A — queimada',
            detail: 'Parece “limpar” o terreno baldio.',
            correct: 'Queimada dispersa escorpiões para residências — conduta incorreta.',
          },
          {
            label: 'Letra C — eliminar predadores',
            detail: 'Medo de animais peçonhentos leva a eliminar aliados.',
            correct: 'Lagartos e sapos controlam população de escorpiões.',
          },
          {
            label: 'Letra D — afastar galinhas',
            detail: 'Galinha é predadora eficaz de escorpião.',
            correct: 'Em áreas rurais, galinhas soltas ajudam no controle.',
          },
          {
            label: 'Letra E — fossa séptica',
            detail: 'Transferência: saneamento é outro eixo de promoção.',
            correct: 'Ventilar fossa não é medida específica contra escorpião.',
          },
        ],
        footer_rule: 'Não mate o aliado — vede a casa',
      },
    ],
  },

  'cpcon-uepb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-4': {
    family: 'protocolo',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Prevenção primária da HAS — MEV (MS / SBC)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HAS — prevenção primária (MEV)',
        meta: slideMeta,
        items: [
          { label: 'Prevenção primária', detail: 'Controlar fatores de risco antes do diagnóstico de HAS.', icon: 'Shield' },
          { label: 'MEV', detail: 'Mudança do estilo de vida — eixo da educação em saúde.', icon: 'Heart' },
          { label: 'Peso', detail: 'Redução do excesso de peso reduz pressão arterial.', icon: 'Scale' },
          { label: 'Alimentação', detail: 'Padrão saudável — DASH, menos sódio.', icon: 'Apple' },
          { label: 'Atividade física', detail: 'Regular e contínua — não sedentarismo.', icon: 'Activity' },
          { label: 'Álcool', detail: 'Moderação — não eliminação obrigatória na redação MS para MEV geral.', icon: 'Wine' },
        ],
        footer_rule: 'MEV HAS: peso + dieta + exercício + moderar álcool',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ações de modificação do estilo de vida para prevenção da hipertensão.',
          'MEV clássica: redução de peso, alimentação saudável, atividade física regular.',
          'Álcool: MS recomenda moderação — não é foco de “eliminação” neste pacote.',
          'Eliminar C — manter peso elevado contradiz a MEV.',
          'Eliminar E — sedentarismo é fator de risco, não conduta preventiva.',
          'Eliminar B — “alimentação normal” e moderação em cigarros não refletem MEV.',
          'Eliminar A — eliminação do tabagismo é correta, mas álcool em “eliminação” diverge da redação esperada.',
          'Marcar D — redução de peso, alimentação saudável, atividade física e moderação no álcool.',
          'Em similares: MEV HAS = peso + dieta + exercício + moderar álcool (não sedentarismo).',
        ],
        footer_rule: 'Prevenção primária HAS = MEV completa e coerente',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'MEV — PREVENÇÃO DA HAS',
        rows: [
          { label: 'Peso', value: 'Redução se excesso — meta terapêutica', badge: 'hot' },
          { label: 'Alimentação', value: 'Saudável — controle de sódio', badge: 'hot' },
          { label: 'Atividade física', value: 'Regular — evitar sedentarismo', badge: 'ok' },
          { label: 'Álcool', value: 'Moderação no consumo', badge: 'warn' },
          { label: 'Tabagismo', value: 'Cessação — mas redação da prova prioriza D', badge: 'info' },
        ],
        footer_rule: 'Educação em saúde motiva adesão à MEV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MEV HAS',
        items: [
          {
            label: 'Letra A — eliminar tabagismo',
            detail: 'Conduta correta na vida real, mas pacote da questão inclui moderação de álcool.',
            correct: 'Gabarito D combina os quatro pilares na redação da banca.',
          },
          {
            label: 'Letra B — moderação em cigarros',
            detail: 'Tabagismo não se “modera” — deve-se cessar.',
            correct: 'MEV não aceita “moderação” de cigarro como conduta preventiva.',
          },
          {
            label: 'Letra C — manter peso elevado',
            detail: 'Contradiz objetivo de reduzir fatores de risco.',
            correct: 'Redução de peso é pilar da prevenção da HAS.',
          },
          {
            label: 'Letra E — sedentarismo',
            detail: 'Inverte a recomendação de atividade física.',
            correct: 'MEV exige movimento regular — não repouso.',
          },
          {
            label: 'Transferência — só tabagismo',
            detail: 'Em outra banca, focar só em “parar de fumar” pode parecer suficiente.',
            correct: 'MEV da HAS na prova exige pacote completo — peso, dieta, exercício e álcool moderado.',
          },
        ],
        footer_rule: 'Leia o pacote inteiro — um item errado invalida a alternativa',
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
    console.log(`[handcraft:promocao-g01] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g01] total=${ok}`);
}

main();
