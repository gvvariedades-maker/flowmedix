/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g18 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g18.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g18';
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

const COFEN_ATRIBUICOES = {
  id: 'cofen-atribuicoes-te',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Resolução COFEN — atribuições do Técnico de Enfermagem (execução sob supervisão)',
  year: 2018,
  url: 'http://www.cofen.gov.br/',
};

const LEI_ACS = {
  id: 'lei-11350-2006-acs',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 11.350/2006 — regulamenta as atividades do Agente Comunitário de Saúde',
  year: 2006,
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11350.htm',
};

const MS_SEGURANCA_PACIENTE = {
  id: 'ms-seguranca-paciente-mobilizacao',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Protocolo de Prevenção de Quedas — Programa Nacional de Segurança do Paciente',
  year: 2013,
  url: 'https://www.gov.br/saude/pt-br',
};

const STARFIELD_APS = {
  id: 'starfield-atencao-primaria-2002',
  tier: 'B' as const,
  issuer: 'Barbara Starfield / UNESCO',
  title: 'Atenção Primária: Equilíbrio entre Necessidades de Saúde, Serviços e Tecnologia',
  year: 2002,
  url: 'https://bvsms.saude.gov.br/',
};

const MS_PNH = {
  id: 'ms-pnh-humanizasus',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Política Nacional de Humanização (PNH) — HumanizaSUS',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/politica_nacional_humanizacao_pnh_folheto.pdf',
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
  sources: Array<Record<string, unknown>>;
  slides: unknown[];
};

const PATCHES: Patch[] = [
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780010566816-3.json',
    family: 'vf',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Mobilização e transporte: posicionamento e técnica corretos previnem lesões e riscos ocupacionais — planejamento prévio nunca é dispensável por rapidez',
    sources: [
      { ...COFEN_ATRIBUICOES, covers: ['segurança do paciente', 'boas práticas de mobilização'] },
      { ...MS_SEGURANCA_PACIENTE, covers: ['prevenção de quedas', 'mobilização segura'] },
    ],
    slides: [
      conceptMap(
        'Mobilização e transporte — terreno da questão',
        [
          {
            label: 'Cenário',
            detail: 'Paciente precisa ser transportado e posicionado na rotina de cuidado.',
            icon: 'Move',
          },
          {
            label: 'Objetivo',
            detail: 'Prevenir quedas, lesões e desconforto durante a mobilização.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Cuidado extra',
            detail: 'Respeitar a ergonomia e proteger o próprio profissional no manuseio.',
            icon: 'HeartPulse',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar que a pressa dispensa o planejamento prévio do procedimento.',
            icon: 'AlertTriangle',
          },
        ],
        'Planejar sempre > pressa sem preparo',
      ),
      logicFlow(
        [
          'Julgar quatro afirmativas sobre mobilização e transporte do paciente na rotina de cuidado.',
          'I verdadeira: posicionamento adequado contribui para conforto, prevenção de lesões e segurança.',
          'II verdadeira: o transporte deve considerar as condições clínicas e limitações físicas do paciente.',
          'III verdadeira: técnicas corretas de mobilização reduzem risco de acidentes e lesões ocupacionais.',
          'IV falsa: transporte e posicionamento nunca dispensam planejamento prévio, mesmo sob pressa.',
          'Sequência V, V, V, F → marcar D.',
          'Em similares: "sem planejamento, desde que rápido" é o padrão de erro da banca.',
        ],
        'Portátil: pressa não dispensa planejamento',
      ),
      goldenRule(
        'Decore — mobilização segura',
        'TRÊS PILARES',
        [
          { label: 'Base de suporte', value: 'Pés afastados e joelhos fletidos ao erguer ou posicionar.', badge: 'ok' },
          { label: 'Carga', value: 'Manter o paciente próximo ao centro de gravidade do profissional.', badge: 'ok' },
          { label: 'Planejamento', value: 'Avaliar condição clínica e via de transporte antes de agir.', badge: 'ok' },
        ],
        'Decore: técnica correta protege paciente e profissional',
      ),
      dangerZone(
        'PEGADINHAS — MOBILIZAÇÃO E TRANSPORTE',
        [
          {
            label: 'Letra A — V, F, V, V.',
            detail: 'Marca a afirmativa II como falsa.',
            correct: 'II é verdadeira: considerar condições clínicas e limitações físicas é etapa obrigatória do transporte.',
          },
          {
            label: 'Letra B — F, V, V, F.',
            detail: 'Marca a afirmativa I como falsa.',
            correct: 'I é verdadeira: o posicionamento adequado garante conforto, prevenção de lesões e segurança.',
          },
          {
            label: 'Letra C — F, F, V, V.',
            detail: 'Marca I e II como falsas e IV como verdadeira.',
            correct: 'I e II são verdadeiras, e IV é falsa: planejamento prévio nunca é dispensável.',
          },
          {
            label: 'Transferência',
            detail: '"Se for rápido, dá para pular o planejamento".',
            correct: 'Nenhum procedimento de mobilização dispensa avaliação prévia, mesmo sob pressa.',
          },
        ],
        'Dispensar planejamento por pressa → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-saude-do-idoso-1780001440222-1.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'TE no cuidado ao idoso: observa o estado geral, orienta conforme protocolo e comunica a equipe — não fecha diagnóstico, não ajusta terapêutica nem decide internação isolado',
    sources: [
      { ...COFEN_ATRIBUICOES, covers: ['execução sob supervisão', 'comunicação à equipe'] },
      { ...PNAB, covers: ['cuidado ao idoso', 'equipe multiprofissional'] },
    ],
    slides: [
      conceptMap(
        'Idoso na rotina de cuidado — conduta do TE',
        [
          {
            label: 'Cenário',
            detail: 'TE acompanha idoso e percebe alteração no estado de saúde durante a rotina.',
            icon: 'HeartPulse',
          },
          {
            label: 'Conduta-alvo',
            detail: 'Observar o estado geral, orientar conforme protocolo e comunicar a equipe.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Limite do TE',
            detail: 'Não fecha diagnóstico, não ajusta terapêutica e não decide internação sozinho.',
            icon: 'ShieldAlert',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir observar/orientar com assumir decisão clínica isolada.',
            icon: 'AlertTriangle',
          },
        ],
        'Observar + orientar + comunicar > decidir sozinho',
      ),
      logicFlow(
        [
          'Comando: conduta do TE diante de alteração no estado de saúde do idoso acompanhado.',
          'Observar o estado geral e orientar conforme os protocolos institucionais são passos obrigatórios.',
          'Comunicar a equipe qualquer alteração identificada fecha a conduta correta.',
          'Eliminar: fechar diagnóstico clínico, ajustar terapêutica sozinho ou indicar internação sem avaliação médica.',
          'Correta reúne observação, orientação e comunicação → marcar C.',
          'Em similares: verbo de decisão clínica isolada no lugar do TE é armadilha.',
        ],
        'Portátil: observar e comunicar, não decidir sozinho',
      ),
      goldenRule(
        'Decore — cuidado ao idoso',
        'TRÊS PASSOS DO TE',
        [
          { label: 'Observar', value: 'Estado geral do idoso durante o acompanhamento.', badge: 'ok' },
          { label: 'Orientar', value: 'Conforme os protocolos institucionais vigentes.', badge: 'ok' },
          { label: 'Comunicar', value: 'Qualquer alteração identificada, sempre à equipe.', badge: 'ok' },
        ],
        'Decore: quem fecha diagnóstico e conduta é a equipe',
      ),
      dangerZone(
        'PEGADINHAS — CUIDADO AO IDOSO',
        [
          {
            label: 'Letra A — diagnóstico e encaminhamento',
            detail: 'Assume fechamento diagnóstico e decisão de encaminhamento sozinho.',
            correct: 'Fechar diagnóstico e decidir encaminhamento é atribuição da equipe, não do TE isolado.',
          },
          {
            label: 'Letra B — terapêutica por conta própria',
            detail: 'Modifica esquema terapêutico sem avaliação da equipe.',
            correct: 'Ajustar terapêutica é decisão do prescritor; o TE observa, orienta e comunica.',
          },
          {
            label: 'Letra D — internação sem avaliação',
            detail: 'Decide internação com base só na própria observação.',
            correct: 'Internação exige avaliação médica e discussão em equipe, nunca decisão isolada do TE.',
          },
          {
            label: 'Transferência',
            detail: '"Já percebi a alteração, então já posso decidir a conduta".',
            correct: 'Perceber a alteração aciona comunicação à equipe — a decisão clínica nunca é só do TE.',
          },
        ],
        'Assumir decisão clínica isolada → distrator',
      ),
    ],
  },
  {
    file: 'inaz-do-para-enfermagem-atencao-basica-saude-da-familia-1778968207422-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'ACS na visita domiciliar prioriza risco ambiental e sanitário (saneamento, água potável) — renda, escolaridade e preferências pessoais não são o foco da observação',
    sources: [
      { ...LEI_ACS, covers: ['atividades do ACS', 'visita domiciliar'] },
      { ...PNAB, covers: ['território', 'vigilância em saúde'] },
    ],
    slides: [
      conceptMap(
        'ACS na visita domiciliar — o que observar',
        [
          {
            label: 'Cenário',
            detail: 'ACS realiza visita domiciliar na área adscrita e coleta informações da família.',
            icon: 'Home',
          },
          {
            label: 'Foco correto',
            detail: 'Condições de saneamento básico e acesso à água potável no domicílio.',
            icon: 'Droplet',
          },
          {
            label: 'Fora do escopo',
            detail: 'Renda, posses materiais, desempenho escolar e preferências pessoais dos moradores.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar risco ambiental e sanitário por dado socioeconômico ou pessoal irrelevante.',
            icon: 'AlertTriangle',
          },
        ],
        'Saneamento e água potável > renda ou preferência pessoal',
      ),
      logicFlow(
        [
          'Comando: fator que o ACS deve observar e relatar na visita domiciliar.',
          'Condições de saneamento básico e acesso à água potável impactam diretamente a saúde da família.',
          'Eliminar: preferências pessoais, renda mensal, desempenho escolar e contagem de banheiros.',
          'Nenhum distrator liga o dado coletado a risco sanitário real do domicílio.',
          'Correta aponta saneamento e água potável → marcar A.',
          'Em similares: dado socioeconômico ou pessoal sem relação com risco à saúde é armadilha do ACS.',
        ],
        'Portátil: risco ambiental/sanitário, não dado pessoal',
      ),
      goldenRule(
        'Decore — visita domiciliar do ACS',
        'RISCO NO TERRITÓRIO',
        [
          { label: 'Observar', value: 'Saneamento básico e acesso à água potável no domicílio.', badge: 'ok' },
          { label: 'Relatar', value: 'Condições que impactam a saúde da família à equipe.', badge: 'ok' },
          { label: 'Armadilha', value: 'Confundir com renda, escolaridade ou preferência pessoal.', badge: 'warn' },
        ],
        'Decore: risco sanitário guia a observação do ACS',
      ),
      dangerZone(
        'PEGADINHAS — VISITA DOMICILIAR DO ACS',
        [
          {
            label: 'Letra B — preferência pessoal',
            detail: 'Registra hábito pessoal sem relação com risco sanitário.',
            correct: 'Preferência pessoal sem relação com saúde não é o foco da observação do ACS.',
          },
          {
            label: 'Letra C — renda e posses',
            detail: 'Anota dado econômico da família.',
            correct: 'Renda não é indicador de risco sanitário a ser priorizado na visita domiciliar.',
          },
          {
            label: 'Letra D — desempenho escolar',
            detail: 'Registra rendimento escolar das crianças.',
            correct: 'Desempenho escolar foge do escopo de observação sanitária do ACS na visita.',
          },
          {
            label: 'Letra E — contagem de banheiros',
            detail: 'Conta apenas o número de banheiros da casa.',
            correct: 'A contagem isolada não substitui observar as reais condições de saneamento.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer dado da casa serve para o relatório do ACS".',
            correct: 'O relatório do ACS prioriza risco sanitário e ambiental, não qualquer informação do domicílio.',
          },
        ],
        'Registrar dado sem relação com risco sanitário → distrator',
      ),
    ],
  },
  {
    file: 'inaz-do-para-enfermagem-atencao-basica-saude-da-familia-1778968207422-1.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'Atribuições do ACS: informar sobre consultas/exames e integrar equipe e população são corretas; o contato com as famílias deve ser regular e contínuo, nunca esporádico',
    sources: [
      { ...LEI_ACS, covers: ['atribuições do ACS', 'vínculo com as famílias'] },
      { ...PNAB, covers: ['ações educativas', 'equipe multiprofissional'] },
    ],
    slides: [
      conceptMap(
        'Atribuições do ACS — C ou E',
        [
          {
            label: 'Afirmativa I',
            detail: 'Informar os usuários sobre datas e horários de consultas e exames agendados.',
            icon: 'Calendar',
          },
          {
            label: 'Afirmativa II',
            detail: 'Diz que o contato do ACS com as famílias deve ser esporádico — essa é a armadilha.',
            icon: 'Ban',
          },
          {
            label: 'Afirmativa III',
            detail: 'Desenvolver ações que integrem a equipe de saúde e a população do território.',
            icon: 'Users',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar "contato esporádico" como atribuição correta do ACS.',
            icon: 'AlertTriangle',
          },
        ],
        'I e III certas — II troca vínculo contínuo por esporádico',
      ),
      logicFlow(
        [
          'Julgar as três afirmativas sobre atribuições do ACS no acompanhamento das famílias.',
          'I certa: informar datas e horários de consultas e exames agendados é atribuição do ACS.',
          'II errada: o contato com as famílias deve ser regular e contínuo, não esporádico.',
          'III certa: desenvolver ações de integração entre equipe e população é atribuição do ACS.',
          'Sequência C, E, C → marcar C.',
          'Em similares: "contato esporádico" substitui o vínculo contínuo cobrado pela banca.',
        ],
        'Portátil: vínculo contínuo, nunca esporádico',
      ),
      goldenRule(
        'Decore — vínculo do ACS',
        'ACOMPANHAMENTO CONTÍNUO',
        [
          { label: 'Vínculo', value: 'Contato regular e permanente com as famílias do território.', badge: 'ok' },
          { label: 'Ação educativa', value: 'Integrada ao planejamento da equipe, não isolada.', badge: 'ok' },
          { label: 'Armadilha', value: 'Trocar "contínuo" por "esporádico".', badge: 'warn' },
        ],
        'Decore: esporádico é sempre a pegadinha do ACS',
      ),
      dangerZone(
        'PEGADINHAS — SEQUÊNCIA C/E',
        [
          {
            label: 'Letra A — E-C-C.',
            detail: 'Inverte I e II ao mesmo tempo.',
            correct: 'I e II trocadas: informar consultas é certo, e contato esporádico é errado — não o contrário.',
          },
          {
            label: 'Letra B — C-C-C.',
            detail: 'Marca a afirmativa II como certa.',
            correct: 'II é errada: o contato do ACS com as famílias deve ser regular, não esporádico.',
          },
          {
            label: 'Letra D — E-E-E.',
            detail: 'Marca I e III como erradas.',
            correct: 'I e III são certas: informar consultas e integrar equipe e população são atribuições reais.',
          },
          {
            label: 'Letra E — E-E-C.',
            detail: 'Marca só a afirmativa I como errada.',
            correct: 'I é certa, não errada: informar datas e horários de consultas é atribuição do ACS.',
          },
          {
            label: 'Transferência',
            detail: '"Contato de vez em quando já cumpre o vínculo do ACS".',
            correct: 'O vínculo do ACS com a família exige contato regular e contínuo, nunca esporádico.',
          },
        ],
        'Trocar contínuo por esporádico → distrator',
      ),
    ],
  },
  {
    file: 'inaz-do-para-enfermagem-processo-de-enfermagem-1780011956256-3.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'Atributos da atenção primária: territorialização e perfil epidemiológico subsidiam ações preventivas; coordenação do cuidado articula outros níveis — atuação não se limita à demanda espontânea',
    sources: [
      { ...PNAB, covers: ['territorialização', 'coordenação do cuidado'] },
      { ...STARFIELD_APS, covers: ['atributos da atenção primária', 'primeiro contato'] },
    ],
    slides: [
      conceptMap(
        'Atributos da atenção primária — terreno',
        [
          {
            label: 'Assertiva I',
            detail: 'Territorialização e perfil epidemiológico da população subsidiam ações preventivas.',
            icon: 'MapPin',
          },
          {
            label: 'Assertiva II',
            detail: 'Diz que a atuação se limita à demanda espontânea — essa é a armadilha.',
            icon: 'Ban',
          },
          {
            label: 'Assertiva III',
            detail: 'Coordenação do cuidado articula outros níveis de atenção quando necessário.',
            icon: 'GitBranch',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar que a atenção primária ignora ações programáticas.',
            icon: 'AlertTriangle',
          },
        ],
        'I e III firmes — II reduz a atuação à demanda espontânea',
      ),
      logicFlow(
        [
          'Julgar as três assertivas sobre a atuação territorial na atenção primária.',
          'I correta: territorialização e perfil epidemiológico subsidiam intervenções preventivas.',
          'II incorreta: a atuação inclui ações programáticas, não só demanda espontânea.',
          'III correta: a coordenação do cuidado articula outros níveis quando necessário.',
          'Corretas apenas I e III → marcar D.',
          'Em similares: reduzir a atuação só à demanda espontânea é o padrão de erro da banca.',
        ],
        'Portátil: I e III firmes, demanda espontânea isolada cai',
      ),
      goldenRule(
        'Decore — atributos da atenção primária',
        'DOIS PILARES',
        [
          { label: 'Territorialização', value: 'Conhecer o perfil epidemiológico da população adscrita.', badge: 'ok' },
          { label: 'Coordenação', value: 'Articular com outros níveis de atenção quando necessário.', badge: 'ok' },
          { label: 'Armadilha', value: 'Reduzir a atuação só à demanda espontânea.', badge: 'warn' },
        ],
        'Decore: territorialização + coordenação, nunca só demanda espontânea',
      ),
      dangerZone(
        'PEGADINHAS — COMBINAÇÃO DE ASSERTIVAS',
        [
          {
            label: 'Letra A — apenas I',
            detail: 'Descarta a assertiva III.',
            correct: 'III também é correta: a coordenação do cuidado articula outros níveis quando necessário.',
          },
          {
            label: 'Letra B — apenas II',
            detail: 'Mantém a assertiva sobre demanda espontânea isolada.',
            correct: 'II é incorreta: a atuação territorial inclui ações programáticas, não só demanda espontânea.',
          },
          {
            label: 'Letra C — apenas II e III',
            detail: 'Mantém II, que restringe indevidamente a atuação.',
            correct: 'II é incorreta; apenas I e III descrevem corretamente a atuação territorial.',
          },
          {
            label: 'Letra E — todas corretas',
            detail: 'Aceita II como válida junto das demais.',
            correct: 'II é incorreta: reduzir a atuação à demanda espontânea contraria o perfil programático da APS.',
          },
          {
            label: 'Transferência',
            detail: '"Atender quem chega já cobre toda a atuação territorial".',
            correct: 'A atuação territorial soma territorialização, ações programáticas e coordenação do cuidado.',
          },
        ],
        'Restringir a atuação à demanda espontânea → distrator',
      ),
    ],
  },
  {
    file: 'instituto-access-enfermagem-atencao-basica-saude-da-familia-1778968221218-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'Ferramentas de trabalho do ACS: formulários de cadastro, material educativo e mapas do território — não equipamento clínico, prescrição ou veículo de transporte',
    sources: [
      { ...LEI_ACS, covers: ['instrumentos de trabalho do ACS'] },
      { ...PNAB, covers: ['território', 'cadastro territorial'] },
    ],
    slides: [
      conceptMap(
        'Ferramentas de trabalho do ACS',
        [
          {
            label: 'Cenário',
            detail: 'ACS atua no território com instrumentos próprios do acompanhamento domiciliar.',
            icon: 'Briefcase',
          },
          {
            label: 'Ferramenta real',
            detail: 'Formulários de cadastro, material educativo e mapas do território.',
            icon: 'FileText',
          },
          {
            label: 'Fora do escopo',
            detail: 'Equipamento médico de alta tecnologia, prescrição e veículo de transporte.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar instrumento de cadastro/mapeamento por equipamento clínico ou administrativo.',
            icon: 'AlertTriangle',
          },
        ],
        'Cadastro + mapa + material educativo > equipamento clínico',
      ),
      logicFlow(
        [
          'Comando: ferramentas de trabalho do ACS no acompanhamento do território.',
          'Formulários de cadastro registram as famílias e suas condições de saúde.',
          'Material educativo apoia a orientação da população durante as visitas.',
          'Mapas do território organizam a área adscrita e a microárea de atuação.',
          'Eliminar: equipamento médico de alta tecnologia, prescrição e veículo de transporte.',
          'Correta reúne cadastro, material educativo e mapa → marcar C.',
          'Em similares: instrumento clínico ou administrativo no lugar do ACS é armadilha.',
        ],
        'Portátil: cadastro, mapa e material educativo',
      ),
      goldenRule(
        'Decore — instrumentos do ACS',
        'TRÊS FERRAMENTAS',
        [
          { label: 'Cadastro', value: 'Formulários que registram as famílias do território.', badge: 'ok' },
          { label: 'Educação', value: 'Material educativo para orientação da população.', badge: 'ok' },
          { label: 'Território', value: 'Mapas da área adscrita e da microárea.', badge: 'ok' },
        ],
        'Decore: instrumento de cadastro e mapa, não equipamento clínico',
      ),
      dangerZone(
        'PEGADINHAS — FERRAMENTAS DO ACS',
        [
          {
            label: 'Letra A — equipamento de alta tecnologia',
            detail: 'Atribui instrumento clínico avançado ao ACS.',
            correct: 'Equipamento médico de alta tecnologia não é ferramenta de trabalho do ACS.',
          },
          {
            label: 'Letra B — instrumento de prescrição',
            detail: 'Dá função de prescrição de medicamentos ao ACS.',
            correct: 'Prescrever é ato de profissional habilitado; o ACS trabalha com cadastro e educação.',
          },
          {
            label: 'Letra D — veículo de transporte',
            detail: 'Atribui logística de transporte clínico ao ACS.',
            correct: 'Transporte de pacientes não é ferramenta de trabalho do ACS no território.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer equipamento de saúde serve de ferramenta do ACS".',
            correct: 'As ferramentas do ACS são cadastro, material educativo e mapa — não equipamento clínico.',
          },
        ],
        'Atribuir equipamento clínico ao ACS → distrator',
      ),
    ],
  },
  {
    file: 'instituto-access-geral-atencao-basica-saude-da-familia-1778968207422-8.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'Conhecimento do território pelo ACS identifica recursos disponíveis e necessidades da comunidade, orientando a intervenção direta — não se resume a estatística ou mapeamento de doenças',
    sources: [
      { ...LEI_ACS, covers: ['território', 'diagnóstico comunitário'] },
      { ...PNAB, covers: ['territorialização', 'vigilância em saúde'] },
    ],
    slides: [
      conceptMap(
        'Conhecimento do território — por que importa',
        [
          {
            label: 'Cenário',
            detail: 'ACS usa o conhecimento do território para orientar a atuação diária.',
            icon: 'Map',
          },
          {
            label: 'Função real',
            detail: 'Identificar recursos disponíveis e necessidades específicas da comunidade.',
            icon: 'Search',
          },
          {
            label: 'Fora do escopo',
            detail: 'Reduzir o território a estatística, tratamento médico ou só mapeamento de doenças.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Esvaziar o território como se não influenciasse a intervenção direta.',
            icon: 'AlertTriangle',
          },
        ],
        'Recursos + necessidades da comunidade > estatística isolada',
      ),
      logicFlow(
        [
          'Comando: importância do conhecimento do território para o ACS.',
          'O território revela recursos disponíveis e necessidades específicas da comunidade.',
          'Esse conhecimento orienta a intervenção direta do ACS junto às famílias.',
          'Eliminar: reduzir a fins estatísticos, ao tratamento médico ou só ao mapeamento de doenças.',
          'Correta aponta recursos e necessidades da comunidade → marcar B.',
          'Em similares: esvaziar a função prática do território é o padrão de erro da banca.',
        ],
        'Portátil: território orienta ação, não só estatística',
      ),
      goldenRule(
        'Decore — território do ACS',
        'FUNÇÃO PRÁTICA',
        [
          { label: 'Identifica', value: 'Recursos disponíveis na comunidade.', badge: 'ok' },
          { label: 'Revela', value: 'Necessidades específicas das famílias do território.', badge: 'ok' },
          { label: 'Armadilha', value: 'Reduzir o território a estatística ou mapeamento de doenças.', badge: 'warn' },
        ],
        'Decore: território orienta intervenção direta',
      ),
      dangerZone(
        'PEGADINHAS — TERRITÓRIO DO ACS',
        [
          {
            label: 'Letra A — só fins estatísticos',
            detail: 'Reduz o território a número de gabinete.',
            correct: 'O conhecimento do território orienta a ação prática do ACS, não só estatística.',
          },
          {
            label: 'Letra C — só tratamento médico',
            detail: 'Descarta o papel do território na atuação.',
            correct: 'O território é a base do trabalho do ACS, mesmo sem foco em tratamento médico.',
          },
          {
            label: 'Letra D — só mapear doenças',
            detail: 'Separa o mapeamento da ação prática.',
            correct: 'O mapeamento do território influencia diretamente a intervenção junto às famílias.',
          },
          {
            label: 'Transferência',
            detail: '"Conhecer o território serve só para preencher relatório".',
            correct: 'Conhecer o território orienta a ação prática do ACS na comunidade, não só o registro.',
          },
        ],
        'Esvaziar a função prática do território → distrator',
      ),
    ],
  },
  {
    file: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-7.json',
    family: 'certo_errado',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'PNH: resultados esperados são acesso com equidade, garantia de direitos dos usuários, valorização dos trabalhadores e gestão participativa — expansão de alta complexidade não é o eixo da humanização',
    sources: [{ ...MS_PNH, covers: ['acesso', 'direitos dos usuários', 'gestão participativa'] }],
    slides: [
      conceptMap(
        'Política Nacional de Humanização — terreno EXCETO',
        [
          {
            label: 'Tema',
            detail: 'Resultados esperados da Política Nacional de Humanização (PNH) do SUS.',
            icon: 'Heart',
          },
          {
            label: 'Comando',
            detail: 'A banca pede a alternativa que NÃO é um resultado esperado da PNH.',
            icon: 'SearchX',
          },
          {
            label: 'Eixo real',
            detail: 'PNH foca acesso com equidade, direitos dos usuários, trabalhador e gestão participativa.',
            icon: 'Users',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir "expandir alta complexidade" com humanização do cuidado.',
            icon: 'AlertTriangle',
          },
        ],
        'Achar o resultado que foge do eixo da humanização',
      ),
      logicFlow(
        [
          'Comando: EXCETO — identificar o resultado que NÃO é esperado da PNH.',
          'Redução de filas com base em critérios de risco é resultado real da humanização do acesso.',
          'Garantia dos direitos dos usuários é eixo central da PNH.',
          'Valorização e cuidado aos trabalhadores da saúde integra os resultados esperados.',
          'Gestão participativa de trabalhadores e usuários também é resultado esperado da PNH.',
          'Expandir serviços de alta complexidade não é o eixo da humanização → marcar B.',
          'Em similares: EXCETO troca o foco da humanização por expansão estrutural do sistema.',
        ],
        'Portátil: humanização ≠ expansão de complexidade',
      ),
      goldenRule(
        'Decore — eixos da PNH',
        'QUATRO RESULTADOS ESPERADOS',
        [
          { label: 'Acesso', value: 'Redução de filas e tempo de espera por critério de risco.', badge: 'ok' },
          { label: 'Direitos', value: 'Garantia dos direitos dos usuários do SUS.', badge: 'ok' },
          { label: 'Trabalhador', value: 'Valorização e cuidado aos trabalhadores da saúde.', badge: 'ok' },
          { label: 'Gestão', value: 'Participação de trabalhadores e usuários nas decisões.', badge: 'ok' },
        ],
        'Decore: humanização não é sinônimo de alta complexidade',
      ),
      dangerZone(
        'PEGADINHAS — EXCETO PNH',
        [
          {
            label: 'Letra B — expansão de alta complexidade',
            detail: 'É a exceção pedida pela banca.',
            correct: 'Expandir serviços de alta complexidade amplia estrutura, mas não é o eixo de humanização da PNH.',
          },
          {
            label: 'Letra A — redução de filas',
            detail: 'Parece exceção por citar gestão de fluxo.',
            correct: 'É resultado real da PNH: organizar o acesso por critério de risco humaniza o atendimento.',
          },
          {
            label: 'Letra C — direitos dos usuários',
            detail: 'Parece exceção por soar genérica.',
            correct: 'É eixo central da PNH: os direitos dos usuários orientam toda a política de humanização.',
          },
          {
            label: 'Letra D — valorização do trabalhador',
            detail: 'Parece exceção por falar do profissional, não do usuário.',
            correct: 'É resultado esperado da PNH: cuidar de quem cuida também humaniza o sistema.',
          },
          {
            label: 'Letra E — gestão participativa',
            detail: 'Parece exceção por citar gestão administrativa.',
            correct: 'É resultado real da PNH: a participação nas decisões é parte da humanização da gestão.',
          },
          {
            label: 'Transferência',
            detail: '"Expandir serviço de alta complexidade sempre humaniza o cuidado".',
            correct: 'Expandir alta complexidade melhora estrutura, mas não é o eixo de humanização da PNH.',
          },
        ],
        'Confundir expansão estrutural com humanização → distrator',
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
  meta.content_review = {
    reviewed_at: '2026-08-03',
    reviewer: 'pipeline-ab-g18',
    guideline_snapshot: patch.guideline_snapshot,
    exam_vs_current: 'none',
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
  console.log(`\nHandcraft g18: ${PATCHES.length} slugs escritos.`);
}

main();
