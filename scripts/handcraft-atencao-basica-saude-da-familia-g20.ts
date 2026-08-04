/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g20 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g20.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g20';
const DIR = path.join('data/catalog-migration', LOTE, 'questions');
const SUB = 'Atenção Básica / Saúde da Família';
const TOPICO = 'Enfermagem';

const PNAB = {
  id: 'pnab-2436-2017',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria GM/MS nº 2.436/2017 — Política Nacional de Atenção Básica',
  year: 2017,
  url: 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2436_22_09_2017.html',
};

const COFEN_ETICA = {
  id: 'cofen-564-2017',
  tier: 'A' as const,
  issuer: 'Conselho Federal de Enfermagem (Cofen)',
  title: 'Resolução Cofen nº 564/2017 — Código de Ética dos Profissionais de Enfermagem',
  year: 2017,
  url: 'http://www.cofen.gov.br/resolucao-cofen-no-0564-2017_59145.html',
};

const CAB_HAS = {
  id: 'cab-37-has',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Caderno de Atenção Básica nº 37 — Estratégias para o cuidado da pessoa com HAS',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/estrategias_cuidado_pessoa_hipertensao_arterial.pdf',
};

const LEI_10216 = {
  id: 'lei-10216-2001',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 10.216/2001 — Reforma Psiquiátrica Brasileira',
  year: 2001,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10216.htm',
};

const PNH = {
  id: 'pnh-cogestao-2004',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Política Nacional de Humanização (HumanizaSUS) — Clínica Ampliada, Cogestão e Gestão Participativa',
  year: 2004,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/clinica_ampliada_gestao_compartilhada_cogestao.pdf',
};

type Item = { label: string; detail?: string; icon?: string; correct?: string };
type Row = { label: string; value: string; badge?: string };

function slideMeta() {
  return { topico: TOPICO, subtopico: SUB };
}

function conceptMap(title: string, items: Item[], footer: string) {
  return {
    type: 'concept_map' as const,
    slide_title: title,
    meta: slideMeta(),
    items,
    footer_rule: footer,
  };
}

function logicFlow(steps: string[], footer: string) {
  return {
    type: 'logic_flow' as const,
    reveal_mode: 'tap' as const,
    meta: slideMeta(),
    steps,
    footer_rule: footer,
  };
}

function goldenRule(title: string, content: string, rows: Row[], footer: string) {
  return {
    type: 'golden_rule' as const,
    slide_title: title,
    meta: slideMeta(),
    content,
    rows,
    footer_rule: footer,
  };
}

function dangerZone(content: string, items: Item[], footer: string) {
  return {
    type: 'danger_zone' as const,
    bullet_style: 'x_icon' as const,
    meta: slideMeta(),
    content,
    items,
    footer_rule: footer,
  };
}

type Patch = {
  file: string;
  family: string;
  pedagogical_branch: string;
  guideline_snapshot: string;
  exam_vs_current?: string;
  sources: Array<Record<string, unknown>>;
  slides: unknown[];
};

const PATCHES: Patch[] = [
  {
    file: 'itame-enfermagem-atencao-basica-saude-da-familia-1778968263411-1.json',
    family: 'text_fragment',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Apoio matricial: articulação e corresponsabilização entre equipes por construção compartilhada, com casos definidos por prevalência/demanda',
    sources: [{ ...PNAB, covers: ['apoio matricial', 'matriciamento', 'NASF'] }],
    slides: [
      conceptMap(
        'Apoio matricial — conceito do fragmento',
        [
          {
            label: 'Fragmento do MS',
            detail: 'Apoio matricial é produzir saúde por construção compartilhada entre duas ou mais equipes.',
            icon: 'Quote',
          },
          {
            label: 'Comando',
            detail: 'Avaliar as afirmativas e assinalar a correta sobre matriciamento.',
            icon: 'Search',
          },
          {
            label: 'Enfoque central',
            detail: 'Articulação entre equipes, não hierarquia nem exclusividade de categoria profissional.',
            icon: 'Network',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar "construção compartilhada" por termos que sugerem separação ou restrição.',
            icon: 'AlertTriangle',
          },
        ],
        'Duas ou mais equipes · construção compartilhada',
      ),
      logicFlow(
        [
          'Pergunta pede a alternativa correta sobre matriciamento, com base no conceito do Ministério da Saúde.',
          'Eliminar: dizer que o matriciamento é restrito a algumas categorias contraria a ideia de equipes articuladas.',
          'Eliminar: afirmar que o monitoramento do processo é opcional esvazia o acompanhamento contínuo do apoio matricial.',
          'Eliminar: "estratégia de abjunção dos pontos de atenção" usa um termo que significa separação — o oposto de articulação.',
          'Correto: os casos de matriciamento são elencados pela prevalência ou demanda das equipes de Saúde da Família e das Unidades de Referência → marcar D.',
          'Em similares: desconfie de termos estranhos numa alternativa — costumam esconder o oposto do conceito certo.',
        ],
        'Portátil: termo estranho na alternativa = distrator invertido',
      ),
      goldenRule(
        'Decore — apoio matricial',
        'CONSTRUÇÃO COMPARTILHADA ENTRE EQUIPES',
        [
          { label: 'O que é', value: 'Articulação entre duas ou mais equipes para produzir saúde em conjunto.', badge: 'ok' },
          { label: 'Como escolhe casos', value: 'Prevalência ou demanda das equipes de Saúde da Família e Unidades de Referência.', badge: 'ok' },
          { label: 'Não é', value: 'Hierarquia de encaminhamento nem exclusividade de uma categoria.', badge: 'warn' },
          { label: 'Armadilha', value: 'Palavra estranha ("abjunção") no meio da alternativa.', badge: 'warn' },
        ],
        'Decore: apoio matricial articula, nunca separa',
      ),
      dangerZone(
        'PEGADINHAS — matriciamento',
        [
          {
            label: 'Letra A — restrito a algumas categorias',
            detail: 'Limita o apoio matricial a parte da equipe.',
            correct: 'O apoio matricial articula toda a equipe envolvida no cuidado, não é exclusivo de uma categoria.',
          },
          {
            label: 'Letra B — monitoramento opcional',
            detail: 'Trata o acompanhamento do processo como dispensável.',
            correct: 'O acompanhamento contínuo faz parte do processo de construção compartilhada, não é opcional.',
          },
          {
            label: 'Letra C — estratégia de abjunção',
            detail: 'Usa um termo que significa separar, desunir.',
            correct: 'Apoio matricial busca articulação e corresponsabilização, o oposto de separar pontos de atenção.',
          },
          {
            label: 'Transferência',
            detail: '"Toda palavra difícil na alternativa é só enfeite".',
            correct: 'Em similares, cheque o sentido literal de termos incomuns — geralmente denunciam um distrator.',
          },
        ],
        'Termo com sentido oposto ao conceito → distrator',
      ),
    ],
  },
  {
    file: 'ms-sarmento-enfermagem-atencao-basica-saude-da-familia-1778968263411-8.json',
    family: 'protocolo',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Rastreamento de HAS na Atenção Básica: PA < 120/80 mmHg reavalia em até 2 anos; intervalos menores para faixas mais altas',
    sources: [{ ...CAB_HAS, covers: ['rastreamento de HAS', 'intervalo de reavaliação da PA'] }],
    slides: [
      conceptMap(
        'Rastreamento e diagnóstico da HAS',
        [
          {
            label: 'Condição clínica',
            detail: 'A hipertensão arterial sistêmica é condição clínica multifatorial, com níveis elevados e sustentados de pressão arterial.',
            icon: 'HeartPulse',
          },
          {
            label: 'Por que rastrear',
            detail: 'Associa-se a alterações funcionais e estruturais de órgãos-alvo (coração, encéfalo, rins, vasos sanguíneos) e a alterações metabólicas, com aumento do risco de eventos cardiovasculares — grave problema de saúde pública no Brasil e no mundo.',
            icon: 'Activity',
          },
          {
            label: 'Lógica do protocolo',
            detail: 'Quanto menor a pressão arterial encontrada no rastreamento, mais espaçada a próxima verificação.',
            icon: 'Clock',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar o intervalo de reavaliação de uma faixa de pressão arterial pelo de outra faixa.',
            icon: 'AlertTriangle',
          },
        ],
        'PA ótima → intervalo mais longo de reavaliação',
      ),
      logicFlow(
        [
          'Pergunta pede o intervalo de nova verificação da pressão arterial se o paciente apresentar PA menor que 120/80 mmHg no rastreamento de HAS.',
          'Eliminar: reavaliar a cada três anos é intervalo maior que o preconizado para essa faixa de pressão.',
          'Eliminar: reavaliar a cada um ano é o intervalo usado para pressão arterial limítrofe, não para PA ótima.',
          'Eliminar: reavaliar em uma a duas semanas é conduta para pressão arterial já suspeita ou alterada, não para PA ótima.',
          'Correto: pressão arterial menor que 120/80 mmHg é reavaliada novamente em até dois anos → marcar B.',
          'Em similares: associe cada faixa de pressão arterial ao seu próprio intervalo de rastreamento — não misture as categorias.',
        ],
        'Portátil: PA ótima = reavaliação em até 2 anos',
      ),
      goldenRule(
        'Decore — intervalos de reavaliação da pressão arterial',
        'QUANTO MENOR A PRESSÃO, MAIS ESPAÇADA A REAVALIAÇÃO',
        [
          { label: 'PA < 120/80 mmHg (ótima)', value: 'Reavaliar em até 2 anos.', badge: 'ok' },
          { label: 'PA 120–139/80–89 mmHg (limítrofe)', value: 'Reavaliar em até 1 ano.', badge: 'warn' },
          { label: 'PA ≥ 140/90 mmHg (suspeita/alterada)', value: 'Reavaliar em 1 a 2 semanas.', badge: 'warn' },
          { label: 'Armadilha', value: 'Trocar o intervalo de uma faixa de pressão arterial pelo de outra.', badge: 'warn' },
        ],
        'Decore: pressão baixa = prazo longo; pressão alta = prazo curto',
      ),
      dangerZone(
        'PEGADINHAS — intervalo de reavaliação da PA',
        [
          {
            label: 'Letra A — a cada três anos',
            detail: 'Estica demais o prazo para uma pressão arterial ótima.',
            correct: 'O rastreamento preconiza reavaliação em até dois anos para PA ótima, não três.',
          },
          {
            label: 'Letra C — a cada ano',
            detail: 'Usa o intervalo de outra faixa de pressão arterial.',
            correct: 'Um ano é o intervalo para pressão arterial limítrofe (120–139/80–89 mmHg), não para PA ótima.',
          },
          {
            label: 'Letra D — em uma a duas semanas',
            detail: 'Aplica o prazo de pressão arterial já suspeita a uma PA ótima.',
            correct: 'O prazo curto de 1–2 semanas serve para reavaliar pressão arterial já alterada, não uma PA ótima.',
          },
          {
            label: 'Transferência',
            detail: '"Todo protocolo de pressão arterial usa o mesmo prazo de reavaliação".',
            correct: 'Em similares, o intervalo de reavaliação muda conforme a faixa de pressão arterial encontrada no rastreamento.',
          },
        ],
        'Trocar o intervalo entre faixas de pressão arterial → distrator',
      ),
    ],
  },
  {
    file: 'ms-sarmento-enfermagem-processo-de-enfermagem-1780008219236-2.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Serviço Residencial Terapêutico (SRT): dispositivo substitutivo ao hospital psiquiátrico, moradia em território, cuidado em liberdade e articulação com a RAPS',
    sources: [{ ...LEI_10216, covers: ['Reforma Psiquiátrica', 'Serviço Residencial Terapêutico'] }],
    slides: [
      conceptMap(
        'SRT — dispositivo substitutivo',
        [
          {
            label: 'Contexto',
            detail: 'Serviço Residencial Terapêutico (SRT) na Reforma Psiquiátrica Brasileira.',
            icon: 'Home',
          },
          {
            label: 'Conceito-chave',
            detail: 'Moradia no território para egressos de longa internação psiquiátrica, substitutiva ao hospital.',
            icon: 'MapPin',
          },
          {
            label: 'Princípio',
            detail: 'Cuidado em liberdade, com articulação com a Rede de Atenção Psicossocial (RAPS).',
            icon: 'Link',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Descrever o SRT como vigilância, confinamento ou estrutura isolada da rede.',
            icon: 'AlertTriangle',
          },
        ],
        'Território + liberdade + rede, nunca confinamento',
      ),
      logicFlow(
        [
          'Pergunta pede a alternativa correta sobre o funcionamento do SRT na Reforma Psiquiátrica.',
          'Eliminar: restringir o SRT a crises psiquiátricas agudas com internação temporária contraria a proposta de moradia continuada.',
          'Eliminar: manter vigilância contínua e restringir a circulação externa reproduz lógica manicomial, oposta à Reforma Psiquiátrica.',
          'Eliminar: dizer que o SRT funciona independente da rede de saúde nega a articulação com CAPS e Atenção Básica.',
          'Correto: o SRT é dispositivo substitutivo ao hospital psiquiátrico, com moradia no território e articulação com a RAPS → marcar C.',
          'Em similares: SRT sempre remete a liberdade, território e rede — nunca a confinamento ou isolamento.',
        ],
        'Portátil: SRT = território + liberdade + RAPS',
      ),
      goldenRule(
        'Decore — Serviço Residencial Terapêutico',
        'MORADIA NO TERRITÓRIO, CUIDADO EM LIBERDADE',
        [
          { label: 'O que é', value: 'Moradia no território para egressos de longa internação psiquiátrica.', badge: 'ok' },
          { label: 'Princípio', value: 'Dispositivo substitutivo ao hospital psiquiátrico, cuidado em liberdade.', badge: 'ok' },
          { label: 'Rede', value: 'Articulado com CAPS e demais pontos da RAPS.', badge: 'ok' },
          { label: 'Armadilha', value: 'Tratar o SRT como espaço de vigilância ou isolado da rede.', badge: 'warn' },
        ],
        'Decore: SRT substitui o hospital, não reproduz o confinamento',
      ),
      dangerZone(
        'PEGADINHAS — funcionamento do SRT',
        [
          {
            label: 'Letra A — crise aguda e internação temporária',
            detail: 'Reduz o SRT a um recurso de curto prazo.',
            correct: 'O SRT é moradia continuada para egressos de longa internação, não recurso de crise aguda.',
          },
          {
            label: 'Letra B — vigilância contínua, restringir circulação',
            detail: 'Descreve confinamento dos moradores.',
            correct: 'O SRT preza pela liberdade e autonomia dos moradores, não pelo confinamento.',
          },
          {
            label: 'Letra D — independente da rede de saúde',
            detail: 'Isola o SRT dos demais serviços.',
            correct: 'O SRT precisa se articular com CAPS e Atenção Básica dentro da RAPS, não funciona isolado.',
          },
          {
            label: 'Transferência',
            detail: '"Residência terapêutica é só um abrigo isolado".',
            correct: 'Em similares, lembre que o SRT é peça da rede de saúde mental, não estrutura solta.',
          },
        ],
        'Confinamento ou isolamento da rede → distrator',
      ),
    ],
  },
  {
    file: 'objetiva-concursos-enfermagem-atencao-basica-saude-da-familia-1778968207422-6.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'Cadastro do ACS: um formulário por família, independente do número de moradores, para mapear o território e planejar o cuidado',
    sources: [{ ...PNAB, covers: ['ACS', 'cadastro de famílias', 'território adscrito'] }],
    slides: [
      conceptMap(
        'Cadastro de famílias pelo ACS',
        [
          {
            label: 'Cenário',
            detail: 'Cadastro de famílias, ferramenta básica de trabalho do Agente Comunitário de Saúde.',
            icon: 'ClipboardList',
          },
          {
            label: 'Regra do cadastro',
            detail: 'Um formulário por família, qualquer que seja o número de pessoas na casa.',
            icon: 'Users',
          },
          {
            label: 'Objetivo',
            detail: 'Mapear o território adscrito para planejar o cuidado da equipe.',
            icon: 'MapPin',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que o cadastro é por pessoa ou que só alguns moradores importam.',
            icon: 'AlertTriangle',
          },
        ],
        'Uma família = um formulário, sempre',
      ),
      logicFlow(
        [
          'Pergunta pede a prática correta do ACS ao cadastrar famílias no território.',
          'Eliminar: dizer que as informações da família são irrelevantes contraria a lógica do cadastro territorial.',
          'Eliminar: preencher um formulário por membro da família ignora que a unidade do cadastro é a família, não a pessoa.',
          'Eliminar: cadastrar só no nome do morador mais velho descarta as informações dos demais moradores.',
          'Correto: cada família é cadastrada em um único formulário, independente do número de pessoas da casa → marcar A.',
          'Em similares: o cadastro do ACS é sempre por núcleo familiar, nunca por pessoa isolada.',
        ],
        'Portátil: cadastro do ACS = por família, não por pessoa',
      ),
      goldenRule(
        'Decore — cadastro de famílias',
        'UM FORMULÁRIO POR FAMÍLIA',
        [
          { label: 'Unidade de cadastro', value: 'A família, não a pessoa isolada.', badge: 'ok' },
          { label: 'Regra prática', value: 'Um formulário por família, qualquer que seja o número de moradores.', badge: 'ok' },
          { label: 'Para quê', value: 'Mapear o território e planejar o cuidado da equipe de Saúde da Família.', badge: 'ok' },
          { label: 'Armadilha', value: 'Cadastrar por pessoa ou ignorar moradores "menos importantes".', badge: 'warn' },
        ],
        'Decore: o núcleo familiar inteiro entra no cadastro',
      ),
      dangerZone(
        'PEGADINHAS — cadastro de famílias',
        [
          {
            label: 'Letra B — informações irrelevantes',
            detail: 'Trata os dados da família como dispensáveis.',
            correct: 'O cadastro territorial é a base do planejamento da equipe; as informações da família não são irrelevantes.',
          },
          {
            label: 'Letra C — um formulário por membro',
            detail: 'Cadastra pessoa a pessoa, não a família inteira.',
            correct: 'O cadastro é por família; preencher um formulário por pessoa contraria a lógica territorial.',
          },
          {
            label: 'Letra D — só a pessoa mais velha importa',
            detail: 'Ignora os demais moradores da casa.',
            correct: 'Todos os moradores entram no cadastro da família, não apenas o morador mais velho.',
          },
          {
            label: 'Transferência',
            detail: '"Só o responsável pela casa importa no cadastro".',
            correct: 'Em similares, o cadastro do ACS sempre cobre o núcleo familiar inteiro, não uma pessoa isolada.',
          },
        ],
        'Cadastrar por pessoa em vez de família → distrator',
      ),
    ],
  },
  {
    file: 'objetiva-concursos-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563718396-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Cogestão (PNH): rodas que colocam diferenças em contato para mudar práticas de gestão; cuidado compartilhado e reconhecimento da cidadania do usuário',
    sources: [{ ...PNH, covers: ['cogestão', 'responsabilidade na rede de atenção à saúde'] }],
    slides: [
      conceptMap(
        'Responsabilidade na rede de atenção',
        [
          {
            label: 'Afirmativa I',
            detail: 'O cuidado e a assistência em saúde não se restringem só à equipe de saúde.',
            icon: 'Users',
          },
          {
            label: 'Afirmativa II',
            detail: 'Rodas que colocam diferenças em contato desestabilizam e mudam práticas de gestão — é a cogestão.',
            icon: 'RefreshCw',
          },
          {
            label: 'Afirmativa III',
            detail: 'Reconhecer cada pessoa como cidadã de direitos na produção de saúde.',
            icon: 'ShieldCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que uma afirmativa teórica bem escrita precisa esconder um erro.',
            icon: 'AlertTriangle',
          },
        ],
        'Cuidado compartilhado + cogestão + cidadania',
      ),
      logicFlow(
        [
          'Pergunta pede quais itens estão corretos sobre responsabilidade na rede de atenção à saúde.',
          'Item I verdadeiro: o cuidado é compartilhado, não fica restrito só à equipe de saúde.',
          'Item II verdadeiro: a cogestão usa rodas de conversa entre diferenças para gerar mudanças nas práticas de gestão e atenção.',
          'Item III verdadeiro: reconhecer a pessoa como cidadã de direitos é princípio da produção de saúde.',
          'Os três itens se sustentam juntos → marcar "Todos os itens".',
          'Em similares: texto de cogestão/humanização bem alinhado ao enunciado tende a validar todos os itens listados.',
        ],
        'Portátil: teoria de cogestão coerente → todos os itens corretos',
      ),
      goldenRule(
        'Decore — cogestão e corresponsabilidade',
        'RODAS + CORRESPONSABILIDADE + CIDADANIA',
        [
          { label: 'Cogestão', value: 'Rodas que colocam diferenças em contato para mudar a gestão e a atenção.', badge: 'ok' },
          { label: 'Corresponsabilidade', value: 'O cuidado não é só da equipe, é compartilhado com o usuário.', badge: 'ok' },
          { label: 'Cidadania', value: 'Reconhecer a pessoa como sujeito de direitos na produção de saúde.', badge: 'ok' },
          { label: 'Armadilha', value: 'Marcar um item como errado só por parecer "teórico demais".', badge: 'warn' },
        ],
        'Decore: cogestão nunca é só da equipe técnica',
      ),
      dangerZone(
        'PEGADINHAS — combinação de itens',
        [
          {
            label: 'Letra A — somente o item I',
            detail: 'Deixa de fora cogestão e cidadania.',
            correct: 'Os itens II e III também descrevem corretamente cogestão e reconhecimento da cidadania.',
          },
          {
            label: 'Letra B — somente o item III',
            detail: 'Corta corresponsabilidade e cogestão do conjunto.',
            correct: 'Os itens I e II também estão corretos sobre corresponsabilidade e cogestão.',
          },
          {
            label: 'Letra C — somente os itens I e II',
            detail: 'Deixa de fora o reconhecimento da cidadania.',
            correct: 'O item III também está correto: reconhecer a pessoa como cidadã de direitos é parte da produção de saúde.',
          },
          {
            label: 'Letra D — somente os itens II e III',
            detail: 'Deixa de fora a afirmativa sobre corresponsabilidade.',
            correct: 'O item I também está correto ao afirmar que o cuidado não se restringe só à equipe de saúde.',
          },
          {
            label: 'Transferência',
            detail: '"Toda questão com itens I/II/III tem pelo menos um errado".',
            correct: 'Em similares, confira cada item contra o texto-base antes de supor que existe erro escondido.',
          },
        ],
        'Marcar item errado sem confrontar o texto → distrator',
      ),
    ],
  },
  {
    file: 'quadrix-enfermagem-processo-de-enfermagem-1776056181857-7.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Comunicação com o paciente: explicações claras, no nível de compreensão do paciente, incentivando dúvidas e diálogo (Código de Ética Cofen)',
    sources: [{ ...COFEN_ETICA, covers: ['comunicação com o paciente', 'informação em saúde'] }],
    slides: [
      conceptMap(
        'Comunicação adequada ao paciente',
        [
          {
            label: 'Cenário',
            detail: 'Informação em saúde é fundamental para o cuidado integral do paciente.',
            icon: 'MessageCircle',
          },
          {
            label: 'Conduta correta',
            detail: 'Explicações claras, no nível de compreensão do paciente, incentivando dúvidas.',
            icon: 'MessagesSquare',
          },
          {
            label: 'Por que importa',
            detail: 'Fortalece a autonomia e a adesão do paciente ao cuidado.',
            icon: 'HeartHandshake',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir "boa comunicação" com jargão técnico ou com delegar tudo ao enfermeiro.',
            icon: 'AlertTriangle',
          },
        ],
        'Clara + acessível + com espaço para dúvidas',
      ),
      logicFlow(
        [
          'Pergunta pede a atitude que representa prática adequada do técnico ao informar o paciente.',
          'Eliminar: informar só sobre o procedimento e pedir para o enfermeiro explicar o resto foge do dever de comunicação do técnico.',
          'Eliminar: evitar explicar detalhes para não causar ansiedade nega o direito do paciente à informação.',
          'Eliminar: usar termos técnicos complexos para mostrar conhecimento dificulta a compreensão do paciente.',
          'Eliminar: delegar totalmente ao enfermeiro tira a responsabilidade do técnico na comunicação.',
          'Correto: explicações claras, no nível do paciente, incentivando dúvidas e o diálogo → marcar A.',
          'Em similares: comunicação adequada é sempre clara, acessível e aberta a perguntas.',
        ],
        'Portátil: comunicação boa = clara + acessível + com diálogo',
      ),
      goldenRule(
        'Decore — comunicação com o paciente',
        'CLARA + ACESSÍVEL + COM DIÁLOGO',
        [
          { label: 'Linguagem', value: 'Clara e adequada ao nível de compreensão do paciente.', badge: 'ok' },
          { label: 'Postura', value: 'Incentivar dúvidas e diálogo, não só informar.', badge: 'ok' },
          { label: 'Responsabilidade', value: 'O técnico também comunica; não delega tudo ao enfermeiro.', badge: 'ok' },
          { label: 'Armadilha', value: 'Jargão técnico ou informação incompleta "para não assustar".', badge: 'warn' },
        ],
        'Decore: informar bem é dever de toda a equipe',
      ),
      dangerZone(
        'PEGADINHAS — comunicação com o paciente',
        [
          {
            label: 'Letra B — informa só o procedimento, delega ao enfermeiro',
            detail: 'Passa a explicação inteira para outro profissional.',
            correct: 'O técnico também tem papel na comunicação; delegar tudo ao enfermeiro foge da prática adequada.',
          },
          {
            label: 'Letra C — evitar explicar detalhes',
            detail: 'Omite informação por medo de causar ansiedade.',
            correct: 'Omitir detalhes "para não assustar" nega o direito do paciente à informação sobre seu cuidado.',
          },
          {
            label: 'Letra D — termos técnicos complexos',
            detail: 'Usa jargão para parecer mais competente.',
            correct: 'Linguagem complexa demais dificulta a compreensão do paciente, o oposto da comunicação adequada.',
          },
          {
            label: 'Letra E — delegar totalmente ao enfermeiro',
            detail: 'Retira do técnico qualquer papel na orientação.',
            correct: 'A comunicação com o paciente é responsabilidade compartilhada da equipe, incluindo o técnico.',
          },
          {
            label: 'Transferência',
            detail: '"Quanto mais técnico o vocabulário, melhor a comunicação".',
            correct: 'Em similares, prática adequada é sempre linguagem acessível, clara e aberta ao diálogo com o paciente.',
          },
        ],
        'Jargão ou silêncio no lugar de diálogo → distrator',
      ),
    ],
  },
  {
    file: 'reis-e-reis-enfermagem-atencao-basica-saude-da-familia-1778968357339-1.json',
    family: 'certo_errado',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Auxiliar/técnico de enfermagem na Saúde da Família: procedimentos, educação em saúde e insumos da USF; apoio à saúde bucal é de outra equipe',
    sources: [
      { ...PNAB, covers: ['atribuições da equipe de Saúde da Família', 'saúde bucal na USF'] },
      { ...COFEN_ETICA, covers: ['limites do exercício profissional do técnico de enfermagem'] },
    ],
    slides: [
      conceptMap(
        'Atribuições na Saúde da Família — ache a exceção',
        [
          {
            label: 'Padrão dos itens',
            detail: 'Procedimentos regulamentados, educação em saúde e gestão de insumos são atribuições de enfermagem.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'O que quebra o padrão',
            detail: 'Apoiar ACD e ACS nas ações de saúde bucal pertence à equipe de saúde bucal, não à de enfermagem.',
            icon: 'GitCompare',
          },
          {
            label: 'Comando',
            detail: 'A pergunta pede a alternativa que NÃO é atribuição do auxiliar/técnico de enfermagem.',
            icon: 'Search',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que qualquer apoio dentro da USF é sempre atribuição da equipe de enfermagem.',
            icon: 'AlertTriangle',
          },
        ],
        'Exceto: ache o item de outra categoria profissional',
      ),
      logicFlow(
        [
          'Pergunta pede a alternativa que NÃO é atribuição do auxiliar/técnico de enfermagem na Saúde da Família (exceto).',
          'Testar letra A: participar da assistência básica realizando procedimentos regulamentados é atribuição típica de enfermagem — mantém.',
          'Testar letra C: realizar educação em saúde a grupos e famílias em risco é atribuição típica de enfermagem — mantém.',
          'Testar letra D: participar do gerenciamento de insumos da USF é atribuição típica de enfermagem — mantém.',
          'Testar letra B: apoiar ACD e ACS nas ações de saúde bucal foge do escopo de enfermagem, pertence à equipe de saúde bucal — é a exceção.',
          'Marcar letra B como a alternativa que não é atribuição do auxiliar/técnico de enfermagem.',
          'Em similares: em questões "exceto", ache o item de categoria profissional diferente escondido entre atribuições corretas.',
        ],
        'Portátil: exceto = ache a categoria profissional trocada',
      ),
      goldenRule(
        'Decore — atribuições de enfermagem na USF',
        'PROCEDIMENTO + EDUCAÇÃO + GESTÃO DE INSUMOS',
        [
          { label: 'Atribuições de enfermagem', value: 'Procedimentos regulamentados, educação em saúde, gestão de insumos da USF.', badge: 'ok' },
          { label: 'Fora do escopo', value: 'Apoiar especificamente ACD/ACS em saúde bucal é atribuição de outra equipe.', badge: 'warn' },
          { label: 'Estratégia "exceto"', value: 'Ache o item de categoria profissional diferente das demais.', badge: 'ok' },
          { label: 'Armadilha', value: 'Achar que "apoiar" qualquer colega da USF é sempre atribuição de enfermagem.', badge: 'warn' },
        ],
        'Decore: saúde bucal tem equipe própria, não é enfermagem',
      ),
      dangerZone(
        'PEGADINHAS — encontrar a exceção',
        [
          {
            label: 'Letra A — procedimentos regulamentados',
            detail: 'Descreve a rotina assistencial da equipe.',
            correct: 'Essa é atribuição típica de enfermagem na USF, por isso não é a exceção pedida.',
          },
          {
            label: 'Letra B — apoiar ACD/ACS em saúde bucal',
            detail: 'É a alternativa apontada pelo gabarito como exceção.',
            correct: 'Correto: apoiar saúde bucal é atribuição da equipe bucal, não do auxiliar/técnico de enfermagem.',
          },
          {
            label: 'Letra C — educação em saúde a grupos',
            detail: 'Descreve ação educativa planejada com a equipe.',
            correct: 'Essa também é atribuição de enfermagem, não é a alternativa que quebra o padrão.',
          },
          {
            label: 'Letra D — gerenciamento de insumos',
            detail: 'Descreve rotina de organização da unidade.',
            correct: 'Gerenciar insumos da USF é atribuição de enfermagem, não é a exceção da questão.',
          },
          {
            label: 'Transferência',
            detail: '"Toda atividade dentro da USF é atribuição de enfermagem".',
            correct: 'Em similares, separe atribuições de enfermagem das de saúde bucal e de outras categorias profissionais.',
          },
        ],
        'Confundir apoio a outra equipe com atribuição própria → distrator',
      ),
    ],
  },
  {
    file: 'selecon-enfermagem-atencao-basica-saude-da-familia-1778968125784-2.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Função do técnico de enfermagem na Atenção Básica: procedimentos regulamentados na UBS; consulta de enfermagem é atribuição privativa do enfermeiro (Lei 7.498/86)',
    sources: [
      { ...COFEN_ETICA, covers: ['atribuições do técnico de enfermagem', 'ato privativo do enfermeiro'] },
      { ...PNAB, covers: ['atenção básica', 'integralidade do cuidado'] },
    ],
    slides: [
      conceptMap(
        'Função do técnico na Atenção Básica',
        [
          {
            label: 'Cenário',
            detail: 'Atenção básica integra promoção, prevenção, diagnóstico, tratamento e reabilitação.',
            icon: 'Activity',
          },
          {
            label: 'Função do técnico',
            detail: 'Participar das atividades de atenção realizando procedimentos regulamentados na UBS.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Limite do escopo',
            detail: 'Alta complexidade, cuidados cirúrgicos e consulta de enfermagem não são atribuições do técnico.',
            icon: 'ShieldAlert',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Atribuir ao técnico funções privativas do enfermeiro ou de outro nível de complexidade.',
            icon: 'AlertTriangle',
          },
        ],
        'Procedimento regulamentado, não ato privativo',
      ),
      logicFlow(
        [
          'Pergunta pede a função correta do técnico de enfermagem na atenção básica.',
          'Eliminar: prestar assistência de alta complexidade foge do nível de atuação da UBS.',
          'Eliminar: realizar cuidados pré, trans e pós-operatórios pertence ao contexto cirúrgico, não à rotina da UBS.',
          'Eliminar: realizar consulta de enfermagem é atribuição privativa do enfermeiro (Lei 7.498/86).',
          'Correto: participar das atividades de atenção realizando procedimentos regulamentados no exercício da profissão na UBS → marcar A.',
          'Em similares: técnico executa procedimentos regulamentados; consulta e alta complexidade ficam fora do seu escopo.',
        ],
        'Portátil: técnico executa; consulta é privativa do enfermeiro',
      ),
      goldenRule(
        'Decore — escopo do técnico na UBS',
        'PROCEDIMENTO REGULAMENTADO, NÃO ATO PRIVATIVO',
        [
          { label: 'Faz', value: 'Procedimentos regulamentados de enfermagem na rotina da UBS.', badge: 'ok' },
          { label: 'Não faz', value: 'Consulta de enfermagem — atribuição privativa do enfermeiro (Lei 7.498/86).', badge: 'warn' },
          { label: 'Não faz', value: 'Assistência de alta complexidade ou cuidados cirúrgicos especializados.', badge: 'warn' },
          { label: 'Armadilha', value: 'Expandir o escopo do técnico para funções privativas do enfermeiro.', badge: 'warn' },
        ],
        'Decore: consulta e alta complexidade ficam fora do escopo técnico',
      ),
      dangerZone(
        'PEGADINHAS — função do técnico na UBS',
        [
          {
            label: 'Letra B — assistência de alta complexidade',
            detail: 'Extrapola o nível de atenção da UBS.',
            correct: 'A UBS trabalha com atenção básica; alta complexidade foge do escopo do técnico nesse nível de atenção.',
          },
          {
            label: 'Letra C — cuidados pré, trans e pós-operatórios',
            detail: 'Descreve rotina de contexto cirúrgico.',
            correct: 'Esses cuidados pertencem ao ambiente cirúrgico, não à rotina de procedimentos da UBS.',
          },
          {
            label: 'Letra D — consulta de enfermagem',
            detail: 'Atribui ao técnico um ato do enfermeiro.',
            correct: 'Consulta de enfermagem é atribuição privativa do enfermeiro, não do técnico (Lei 7.498/86).',
          },
          {
            label: 'Transferência',
            detail: '"O técnico pode fazer tudo que o enfermeiro faz".',
            correct: 'Em similares, lembre do limite legal: consulta e atos privativos são exclusivos do enfermeiro.',
          },
        ],
        'Atribuir ato privativo ao técnico → distrator',
      ),
    ],
  },
];

function applyPatch(patch: Patch) {
  const filePath = path.join(DIR, patch.file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const questao = JSON.parse(raw) as Record<string, unknown>;
  const meta = { ...(questao.meta as Record<string, unknown>) };
  meta.content_standard = 'golden-v1';
  meta.family = patch.family;
  meta.pedagogical_branch = patch.pedagogical_branch;
  meta.subtopico = SUB;
  meta.content_review = {
    reviewed_at: '2026-08-03',
    reviewer: 'pipeline-ab-g20',
    guideline_snapshot: patch.guideline_snapshot,
    exam_vs_current: patch.exam_vs_current ?? 'none',
  };
  meta.sources = patch.sources;
  questao.meta = meta;
  questao.reverse_study_slides = patch.slides;
  delete (questao as { study_slides?: unknown }).study_slides;
  fs.writeFileSync(filePath, `${JSON.stringify(questao, null, 2)}\n`, 'utf8');
  console.log(`[ok] ${patch.file} → ${patch.family}/${patch.pedagogical_branch}`);
}

function main() {
  if (!fs.existsSync(DIR)) {
    throw new Error(`Lote dir missing: ${DIR}`);
  }
  for (const patch of PATCHES) {
    applyPatch(patch);
  }
  console.log(`\nHandcraft g20: ${PATCHES.length} slugs escritos.`);
}

main();
