/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g21 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g21.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g21';
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

const LEI_ACS = {
  id: 'lei-11350-acs',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 11.350/2006 (alterações Lei nº 13.595/2018) — ACS e ACE',
  year: 2018,
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13595.htm',
};

const CAB_HAS = {
  id: 'cab-37-has',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Caderno de Atenção Básica nº 37 — Estratégias para o cuidado da pessoa com HAS',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/estrategias_cuidado_pessoa_hipertensao_arterial.pdf',
};

const PNH = {
  id: 'pnh-cogestao-2004',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Política Nacional de Humanização (HumanizaSUS) — Clínica Ampliada, Cogestão e Gestão Participativa',
  year: 2004,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/clinica_ampliada_gestao_compartilhada_cogestao.pdf',
};

const PORTARIA_825 = {
  id: 'portaria-825-2016-ad',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria GM/MS nº 825/2016 — Redefine a Atenção Domiciliar no âmbito do SUS (SAD/PMeC)',
  year: 2016,
  url: 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2016/prt0825_04_05_2016.html',
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
    file: 'selecon-enfermagem-atencao-basica-saude-da-familia-1778968207422-2.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Acolhimento: postura ética de escuta ativa que amplia vínculo de confiança e identifica necessidades não explicitadas — distinto de cuidado genérico, anamnese, exame físico ou alta complexidade',
    sources: [
      { ...PNAB, covers: ['acolhimento', 'porta de entrada'] },
      { ...PNH, covers: ['acolhimento', 'escuta ativa', 'vínculo'] },
    ],
    slides: [
      conceptMap(
        'Acolhimento — definição',
        [
          {
            label: 'Cenário',
            detail:
              'Disponibilidade para escutar a queixa, ampliar vínculo de confiança e identificar necessidades não ditas.',
            icon: 'Ear',
          },
          {
            label: 'Conceito-alvo',
            detail: 'Acolhimento: postura ética de escuta ativa, não uma etapa técnica isolada.',
            icon: 'HeartHandshake',
          },
          {
            label: 'Não confundir',
            detail: 'Anamnese coleta dados clínicos; exame físico avalia o corpo; cuidado é termo mais amplo.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que "escuta + vínculo" é sinônimo de anamnese ou exame físico.',
            icon: 'AlertTriangle',
          },
        ],
        'Escuta + vínculo + necessidade não dita = acolhimento',
      ),
      logicFlow(
        [
          'Ler o comando: descreve escuta ativa, vínculo de confiança e identificação de necessidades não explicitadas.',
          'Eliminar "cuidado": termo genérico demais, não nomeia a postura específica descrita.',
          'Eliminar "anamnese": é coleta sistemática de dados clínicos, não postura de escuta ampliada.',
          'Eliminar "exame físico": é avaliação corporal, não escuta e vínculo.',
          'Eliminar "assistência de alta complexidade": não tem relação com escuta na porta de entrada.',
          'Correto: acolhimento → marcar C.',
          'Em similares: "escuta + vínculo + identificar necessidade não dita" sempre aponta para acolhimento.',
        ],
        'Portátil: escuta + vínculo = acolhimento',
      ),
      goldenRule(
        'Decore — acolhimento',
        'ESCUTA + VÍNCULO + RESPONSABILIZAÇÃO',
        [
          { label: 'O que é', value: 'Postura ética de escuta que amplia vínculo e identifica necessidades.', badge: 'ok' },
          { label: 'Não é', value: 'Triagem, anamnese isolada ou exame físico.', badge: 'warn' },
          { label: 'Onde ocorre', value: 'Em todos os pontos da rede de atenção, não só na recepção.', badge: 'ok' },
          { label: 'Armadilha', value: 'Confundir com etapa técnica isolada (anamnese/exame).', badge: 'warn' },
        ],
        'Decore: acolhimento é postura, não procedimento isolado',
      ),
      dangerZone(
        'PEGADINHAS — acolhimento',
        [
          {
            label: 'Letra A — cuidado',
            detail: 'Termo genérico demais para o que o enunciado descreve.',
            correct: '"Cuidado" é amplo; o texto descreve especificamente a postura de acolhimento.',
          },
          {
            label: 'Letra B — anamnese',
            detail: 'Parece "escuta", mas é coleta sistemática de dados.',
            correct: 'Anamnese é etapa técnica de coleta; o texto fala de escuta ampliada e vínculo — isso é acolhimento.',
          },
          {
            label: 'Letra D — exame físico',
            detail: 'Foca no corpo, não na escuta.',
            correct: 'Exame físico avalia o corpo; o texto descreve escuta e vínculo, não avaliação física.',
          },
          {
            label: 'Letra E — assistência de alta complexidade',
            detail: 'Nível de atenção diferente do descrito.',
            correct: 'Alta complexidade é outro nível de atenção; o texto descreve prática de porta de entrada na AB.',
          },
          {
            label: 'Transferência',
            detail: '"Toda escuta na saúde é anamnese".',
            correct: 'Em similares, escuta + vínculo + necessidade não dita apontam para acolhimento, mesmo fora da anamnese clínica.',
          },
        ],
        'Trocar acolhimento por etapa técnica isolada → distrator',
      ),
    ],
  },
  {
    file: 'unesc-enfermagem-atencao-basica-saude-da-familia-1778968357339-7.json',
    family: 'certo_errado',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'ACS tem rotina territorial (diagnóstico, mapeamento, visitas) mesmo sem nível superior; glicemia capilar é procedimento técnico, cabível só em caráter excepcional (Lei 11.350/2006 + PNAB)',
    sources: [
      { ...LEI_ACS, covers: ['atribuições ACS', 'visita domiciliar', 'território'] },
      { ...PNAB, covers: ['ACS', 'diagnóstico territorial', 'procedimento técnico excepcional'] },
    ],
    slides: [
      conceptMap(
        'ACS — atividade territorial x procedimento técnico',
        [
          {
            label: 'Regra geral',
            detail: 'Diagnóstico, mapeamento e visita são rotina do ACS mesmo sem apoio de nível superior.',
            icon: 'Map',
          },
          {
            label: 'Exceção pedida',
            detail: 'Aferir glicemia capilar exige caráter excepcional e encaminhamento — foge do dia a dia.',
            icon: 'Syringe',
          },
          {
            label: 'Base legal',
            detail: 'Lei nº 11.350/2006 (alterada pela Lei nº 13.595/2018) define atribuições e limites do ACS.',
            icon: 'Scale',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que qualquer visita domiciliar sai do escopo do ACS.',
            icon: 'AlertTriangle',
          },
        ],
        'Território é rotina; procedimento técnico é exceção',
      ),
      logicFlow(
        [
          'Comando EXCETO: achar a atividade que NÃO é típica do ACS sem apoio de nível superior.',
          'Letra A (diagnóstico demográfico/sociocultural): instrumento de diagnóstico territorial — típico do ACS.',
          'Letra B (visita domiciliar p/ risco familiar): rotina central do ACS.',
          'Letra C (planejamento/mapeamento institucional): também atribuição típica.',
          'Letra D (visita para acolhimento/acompanhamento da lactante): atribuição típica no puerpério.',
          'Letra E (medição de glicemia capilar em caráter excepcional, com encaminhamento): é procedimento técnico — a exceção pedida → marcar E.',
          'Em similares: EXCETO de ACS aponta procedimento técnico/clínico, não ação territorial ou educativa.',
        ],
        'Portátil: procedimento técnico é a exceção do ACS',
      ),
      goldenRule(
        'Decore — ACS × procedimento técnico',
        'ROTINA DO ACS VERSUS PROCEDIMENTO EXCEPCIONAL',
        [
          { label: 'Faz sempre', value: 'Mapeia o território, cadastra famílias e faz visita periódica sem depender de outro nível.', badge: 'ok' },
          { label: 'Faz raramente', value: 'Testar glicemia só quando necessário, sempre encaminhando o caso.', badge: 'warn' },
          { label: 'Amparo legal', value: 'Lei nº 11.350/2006 e PNAB (Portaria nº 2.436/2017).', badge: 'ok' },
          { label: 'Armadilha', value: 'Achar que visita domiciliar "foge" do escopo do ACS.', badge: 'warn' },
        ],
        'Decore: visita e diagnóstico = rotina; procedimento = exceção',
      ),
      dangerZone(
        'PEGADINHAS — atribuições do ACS',
        [
          {
            label: 'Letra A — diagnóstico demográfico/sociocultural',
            detail: 'Parece técnico, mas é diagnóstico territorial.',
            correct: 'Diagnóstico demográfico/sociocultural é atribuição típica do ACS, não a exceção.',
          },
          {
            label: 'Letra B — visita para identificar risco familiar',
            detail: 'Parece "demais rotina" para estranhar.',
            correct: 'Visita para identificar risco familiar é atribuição central do ACS.',
          },
          {
            label: 'Letra C — planejamento/mapeamento institucional',
            detail: 'Parece função "de gestão".',
            correct: 'Participar do planejamento e mapeamento institucional é atribuição típica do ACS.',
          },
          {
            label: 'Letra D — visita para acolhimento da lactante',
            detail: 'Parece procedimento clínico.',
            correct: 'Acompanhar a lactante em visita domiciliar é atribuição típica, não procedimento invasivo.',
          },
          {
            label: 'Letra E — glicemia capilar excepcional',
            detail: 'É a exceção pedida pelo comando.',
            correct: 'Medir glicemia é procedimento técnico; só cabe ao ACS em caráter excepcional, com encaminhamento — por isso é a exceção.',
          },
          {
            label: 'Transferência',
            detail: '"Toda visita domiciliar é procedimento técnico".',
            correct: 'Em similares, procedimento técnico exige caráter excepcional; visita e diagnóstico territorial são rotina do ACS.',
          },
        ],
        'No EXCETO, distrator = atividade territorial correta do ACS',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968039063-5.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Acolhimento de usuário com transtorno mental na UBS: aferir sinais vitais com escuta ativa e acionar o enfermeiro, sem estigmatizar nem usar contenção como primeira conduta (PNAB + PNH)',
    sources: [
      { ...PNAB, covers: ['acolhimento na UBS', 'atribuições do técnico de enfermagem'] },
      { ...PNH, covers: ['acolhimento', 'clínica ampliada', 'não estigmatização'] },
    ],
    slides: [
      conceptMap(
        'Acolhimento sem estigma na UBS',
        [
          {
            label: 'Cenário',
            detail: 'Usuário do CAPS busca a UBS com queixa física (pressão/dor de cabeça) e sintoma psíquico (vozes de comando).',
            icon: 'Activity',
          },
          {
            label: 'Conduta-alvo',
            detail: 'Aferir sinais vitais + escuta ativa + acionar o enfermeiro para avaliação.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Por quê',
            detail: 'Sintoma físico não pode ser ignorado por causa do histórico psiquiátrico — evita estigma.',
            icon: 'ShieldCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Tratar o caso só como emergência psiquiátrica ou aplicar contenção sem avaliar sinais vitais.',
            icon: 'AlertTriangle',
          },
        ],
        'Avaliar sinais vitais antes de rotular só pela psiquiatria',
      ),
      logicFlow(
        [
          'Ler o cenário: usuário do CAPS com queixa de pressão alta e vozes de comando busca a UBS.',
          'Eliminar SAMU + alerta de emergência psiquiátrica direto: pula a avaliação inicial na própria UBS.',
          'Eliminar evitar tocar + só ligar para o CAPS: nega avaliação clínica básica por estigma.',
          'Eliminar escala psíquica imediata desconsiderando a queixa física: ignora a avaliação clínica.',
          'Eliminar contenção física + só permanecer com psiquiatra: medida restritiva desproporcional nesta etapa.',
          'Correto: aferir sinais vitais + escuta ativa + acionar o enfermeiro → marcar B.',
          'Em similares: acolhimento nunca despreza a queixa física por causa do diagnóstico psiquiátrico.',
        ],
        'Portátil: avaliar primeiro, não restringir primeiro',
      ),
      goldenRule(
        'Decore — acolhimento sem estigma',
        'AVALIAR PRIMEIRO, NÃO RESTRINGIR PRIMEIRO',
        [
          { label: 'Fazer', value: 'Aferir sinais vitais, escutar ativamente, acionar o enfermeiro.', badge: 'ok' },
          { label: 'Evitar', value: 'Pular a avaliação clínica achando que é "só psiquiátrico".', badge: 'warn' },
          { label: 'Evitar', value: 'Contenção física como primeira conduta.', badge: 'warn' },
          { label: 'Base', value: 'PNH (acolhimento/clínica ampliada) + PNAB.', badge: 'ok' },
        ],
        'Decore: queixa física sempre entra na avaliação',
      ),
      dangerZone(
        'PEGADINHAS — acolhimento em saúde mental',
        [
          {
            label: 'Letra A — SAMU + alerta de perigo',
            detail: 'Pula direto para urgência externa.',
            correct: 'Antes de acionar urgência externa, a UBS deve realizar avaliação inicial e escuta do usuário.',
          },
          {
            label: 'Letra C — evitar tocar + só ligar para o CAPS',
            detail: 'Usa o risco de surto para não avaliar.',
            correct: 'Evitar avaliação clínica por medo do surto estigmatiza o usuário; sinais vitais devem ser verificados.',
          },
          {
            label: 'Letra D — escala psíquica imediata, ignorando a fala',
            detail: 'Desconsidera a queixa física relatada.',
            correct: 'A queixa física (pressão, dor de cabeça) precisa ser avaliada antes de qualquer escala psíquica isolada.',
          },
          {
            label: 'Letra E — contenção física + só psiquiatra',
            detail: 'Usa medida restritiva de imediato.',
            correct: 'Contenção física não é a conduta inicial; a prioridade é escuta e avaliação clínica.',
          },
          {
            label: 'Transferência',
            detail: '"Usuário do CAPS = emergência psiquiátrica automática".',
            correct: 'Em similares, sintomas físicos sempre entram na avaliação, independente do histórico em saúde mental.',
          },
        ],
        'Rotular só pela psiquiatria e pular avaliação → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968077998-8.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'Cuidado integral à família na AB: planejamento territorial com dados epidemiológicos e sociais — não só queixa individual, campanha pontual ou encaminhamento (PNAB)',
    sources: [{ ...PNAB, covers: ['integralidade', 'cuidado à família', 'território adscrito'] }],
    slides: [
      conceptMap(
        'Cuidado integral à família',
        [
          {
            label: 'Cenário',
            detail: 'Pergunta pede a conduta correta sobre cuidado integral à família na Atenção Básica.',
            icon: 'Home',
          },
          {
            label: 'Conduta-alvo',
            detail: 'Técnico colabora no planejamento das ações considerando dados epidemiológicos e sociais do território.',
            icon: 'ClipboardList',
          },
          {
            label: 'Por quê',
            detail: 'Cuidado integral olha a família no território, não só o indivíduo doente.',
            icon: 'Users',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Reduzir o cuidado à queixa individual, a campanha pontual ou a encaminhamento externo.',
            icon: 'AlertTriangle',
          },
        ],
        'Território + dados + planejamento contínuo',
      ),
      logicFlow(
        [
          'Comando pede a conduta correta sobre cuidado integral à família.',
          'Eliminar foco só no indivíduo/queixa principal: nega a visão familiar e territorial.',
          'Eliminar cuidado só em períodos de campanha de mobilização: reduz a ação a eventos pontuais.',
          'Eliminar visitas só para casos agudos/urgentes: nega o acompanhamento contínuo e preventivo.',
          'Eliminar encaminhamento para especializada como "principal estratégia": tira a AB do centro do cuidado.',
          'Correto: colaborar no planejamento com dados epidemiológicos e sociais do território → marcar E.',
          'Em similares: cuidado integral à família é planejamento territorial contínuo, não evento isolado.',
        ],
        'Portátil: planejar com dados do território, sempre',
      ),
      goldenRule(
        'Decore — cuidado integral à família',
        'TERRITÓRIO + DADOS + PLANEJAMENTO CONTÍNUO',
        [
          { label: 'Fazer', value: 'Colaborar no planejamento com aspectos epidemiológicos e sociais.', badge: 'ok' },
          { label: 'Evitar', value: 'Focar só na queixa individual ou em campanhas pontuais.', badge: 'warn' },
          { label: 'Evitar', value: 'Tratar o encaminhamento especializado como estratégia principal.', badge: 'warn' },
          { label: 'Base', value: 'PNAB — integralidade e território adscrito.', badge: 'ok' },
        ],
        'Decore: cuidado à família é contínuo e territorial',
      ),
      dangerZone(
        'PEGADINHAS — cuidado integral',
        [
          {
            label: 'Letra A — foco no indivíduo/queixa principal',
            detail: 'Restringe o cuidado à pessoa doente.',
            correct: 'Cuidado integral olha a família e o território, não só a queixa individual.',
          },
          {
            label: 'Letra B — só em campanhas de mobilização',
            detail: 'Reduz o cuidado a eventos pontuais.',
            correct: 'O cuidado à família deve ser contínuo, não restrito a períodos de campanha.',
          },
          {
            label: 'Letra C — visitas só para casos agudos/urgentes',
            detail: 'Ignora o acompanhamento preventivo.',
            correct: 'Visitas domiciliares acompanham a família de forma contínua, não só em crise.',
          },
          {
            label: 'Letra D — encaminhamento como principal estratégia',
            detail: 'Tira a AB do centro do cuidado.',
            correct: 'A AB é protagonista do cuidado; o encaminhamento é complemento, não estratégia principal.',
          },
          {
            label: 'Transferência',
            detail: '"Cuidado de família é só nos surtos de doença".',
            correct: 'Em similares, cuidado integral exige planejamento territorial contínuo, com dados epidemiológicos e sociais.',
          },
        ],
        'Reduzir cuidado a evento isolado → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968094018-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'Grupos por patologia crônica na AB: compartilhar experiências fortalece apoio emocional e adesão — complementa, não substitui, tratamento médico e educação em saúde (PNAB + Caderno HAS)',
    sources: [
      { ...PNAB, covers: ['grupos educativos', 'doenças crônicas'] },
      { ...CAB_HAS, covers: ['adesão ao tratamento', 'educação em saúde em grupo'] },
    ],
    slides: [
      conceptMap(
        'Grupos por patologia — vantagem coletiva',
        [
          {
            label: 'Cenário',
            detail: 'Grupos por patologia (diabetes/hipertensão) na Atenção Básica.',
            icon: 'Users',
          },
          {
            label: 'Vantagem-alvo',
            detail: 'Compartilhamento de experiências fortalece apoio emocional e adesão ao tratamento.',
            icon: 'MessagesSquare',
          },
          {
            label: 'Não confundir',
            detail: 'O grupo não substitui consulta médica nem dispensa educação em saúde.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que o grupo "substitui" alguma parte do cuidado (médico, educação, aspectos físicos).',
            icon: 'AlertTriangle',
          },
        ],
        'Grupo complementa, nunca substitui',
      ),
      logicFlow(
        [
          'Comando pede a vantagem da abordagem coletiva em grupos por patologia crônica.',
          'Eliminar "controle por medicamento, abstendo da educação": grupo é espaço educativo, não só medicamentoso.',
          'Eliminar "suporte psicológico, abdicando do físico": grupo trabalha aspectos físicos e emocionais juntos.',
          'Eliminar "educação em saúde, dispensando acompanhamento médico": grupo complementa, não substitui, o médico.',
          'Eliminar "monitoramento substituindo consultas": grupo não substitui a consulta médica regular.',
          'Correto: compartilhamento de experiências fortalece apoio emocional e adesão → marcar A.',
          'Em similares: grupo por patologia é complemento educativo e emocional, nunca substituto do acompanhamento clínico.',
        ],
        'Portátil: grupo complementa, não substitui',
      ),
      goldenRule(
        'Decore — grupos por patologia',
        'COMPLEMENTA, NÃO SUBSTITUI',
        [
          { label: 'Vantagem', value: 'Compartilhar experiências fortalece apoio emocional e adesão ao tratamento.', badge: 'ok' },
          { label: 'Não substitui', value: 'Consulta médica, educação em saúde nem avaliação física.', badge: 'warn' },
          { label: 'Objetivo', value: 'Empoderar o paciente para o autocuidado.', badge: 'ok' },
          { label: 'Armadilha', value: 'Qualquer opção que "abdica" ou "substitui" outra parte do cuidado.', badge: 'warn' },
        ],
        'Decore: grupo soma, não troca nenhuma parte do cuidado',
      ),
      dangerZone(
        'PEGADINHAS — vantagem do grupo',
        [
          {
            label: 'Letra B — medicamento, abstendo da educação',
            detail: 'Reduz o grupo ao aspecto medicamentoso.',
            correct: 'O grupo por patologia soma abordagem educativa ao tratamento medicamentoso, não abstém dela.',
          },
          {
            label: 'Letra C — psicológico, abdicando do físico',
            detail: 'Separa emocional de físico.',
            correct: 'O grupo trata aspectos físicos e emocionais juntos, sem abdicar de nenhum deles.',
          },
          {
            label: 'Letra D — educação, dispensando acompanhamento médico',
            detail: 'Tira o médico da equação.',
            correct: 'A educação em grupo complementa, mas não dispensa o acompanhamento médico.',
          },
          {
            label: 'Letra E — monitoramento substituindo consultas',
            detail: 'Troca consulta por monitoramento em grupo.',
            correct: 'O grupo apoia o acompanhamento; não substitui as consultas médicas regulares.',
          },
          {
            label: 'Transferência',
            detail: '"Grupo educativo dispensa cuidado individual".',
            correct: 'Em similares, grupo por patologia sempre complementa — nunca substitui — consulta, medicação e avaliação física.',
          },
        ],
        'Achar que o grupo substitui parte do cuidado → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968125784-1.json',
    family: 'conceito',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'PNAB (Portaria nº 2.436/2017) estabelece a Estratégia Saúde da Família (ESF) como estratégia prioritária para expansão e consolidação da Atenção Básica no Brasil',
    sources: [{ ...PNAB, covers: ['ESF', 'estratégia prioritária', 'expansão da AB'] }],
    slides: [
      conceptMap(
        'Estratégia prioritária da AB',
        [
          {
            label: 'Pergunta',
            detail: 'O que a PNAB estabelece como estratégia prioritária para a Atenção Básica.',
            icon: 'HelpCircle',
          },
          {
            label: 'Resposta-chave',
            detail: 'Estratégia Saúde da Família (ESF).',
            icon: 'MapPin',
          },
          {
            label: 'Diferencia',
            detail: 'RAS organiza a rede toda; APS é o nível de atenção; ESF é a estratégia prioritária dentro da AB.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir ESF com RAS, APS, sigla inventada ou iniciativa privada.',
            icon: 'AlertTriangle',
          },
        ],
        'ESF é a estratégia; RAS e APS são outra coisa',
      ),
      logicFlow(
        [
          'Comando pede o termo que completa a definição da PNAB sobre estratégia prioritária.',
          'Eliminar RAS: organiza toda a rede de atenção, não é a estratégia específica da AB.',
          'Eliminar iniciativa privada: contraria o caráter público do SUS previsto na PNAB.',
          'Eliminar NSF-AB: nome inventado, não existe na PNAB.',
          'Eliminar APS: é o nível de atenção; a ESF é a estratégia dentro desse nível.',
          'Correto: Estratégia Saúde da Família (ESF) → marcar C.',
          'Em similares: "estratégia prioritária da AB" sempre aponta para a ESF.',
        ],
        'Portátil: PNAB → ESF é a estratégia prioritária',
      ),
      goldenRule(
        'Decore — estratégia prioritária da AB',
        'ESF = ESTRATÉGIA PRIORITÁRIA (NÃO CONFUNDIR COM APS/RAS)',
        [
          { label: 'ESF', value: 'Estratégia prioritária para expandir e consolidar a AB (PNAB).', badge: 'ok' },
          { label: 'APS', value: 'Nível de atenção em que a ESF atua.', badge: 'ok' },
          { label: 'RAS', value: 'Rede completa que articula todos os níveis, não só a AB.', badge: 'ok' },
          { label: 'Armadilha', value: 'Trocar ESF por termo mais amplo (RAS/APS) ou por sigla inventada.', badge: 'warn' },
        ],
        'Decore: a PNAB nomeia a ESF, não RAS/APS',
      ),
      dangerZone(
        'PEGADINHAS — estratégia prioritária',
        [
          {
            label: 'Letra A — organização da RAS',
            detail: 'Parece abrangente demais para ser a resposta.',
            correct: 'A RAS organiza toda a rede de atenção; a estratégia prioritária específica da AB é a ESF.',
          },
          {
            label: 'Letra B — iniciativa privada',
            detail: 'Contraria o caráter público da política.',
            correct: 'A PNAB é uma política pública do SUS; não define a iniciativa privada como estratégia.',
          },
          {
            label: 'Letra D — NSF-AB',
            detail: 'Soa oficial, mas não existe.',
            correct: 'Esse nome não existe na PNAB; o termo correto é Estratégia Saúde da Família.',
          },
          {
            label: 'Letra E — APS',
            detail: 'Parece sinônimo de ESF.',
            correct: 'APS é o nível de atenção; a estratégia prioritária dentro dele é a ESF.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer sigla parecida serve".',
            correct: 'Em similares, fixe que a PNAB nomeia a ESF, não APS/RAS, como estratégia prioritária.',
          },
        ],
        'Trocar ESF por sigla parecida → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968180610-7.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'PMeC/SAD: equipes EMAD, EMAP e EMAP-R; admissão pede consentimento do usuário; atendimento cobre também casos agudos, não só locomoção impossível (Portaria GM/MS nº 825/2016)',
    sources: [
      { ...PORTARIA_825, covers: ['EMAD', 'EMAP', 'EMAP-R', 'admissão ao SAD'] },
      { ...PNAB, covers: ['atenção domiciliar', 'continuidade do cuidado'] },
    ],
    slides: [
      conceptMap(
        'Programa Melhor em Casa (PMeC)',
        [
          {
            label: 'Cenário',
            detail: 'Pergunta sobre a estrutura e as regras do Programa Melhor em Casa (PMeC/SAD).',
            icon: 'Home',
          },
          {
            label: 'Estrutura-alvo',
            detail: 'Três equipes multiprofissionais trabalham juntas: atenção, apoio geral e apoio para reabilitação.',
            icon: 'Users',
          },
          {
            label: 'Regra de entrada',
            detail: 'O usuário (ou seu responsável) precisa concordar antes de ser admitido no serviço.',
            icon: 'FileCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que o PMeC só serve para quem nunca mais vai conseguir saír de casa, ou que dispensa autorização.',
            icon: 'AlertTriangle',
          },
        ],
        'Três equipes, sempre com autorização de entrada',
      ),
      logicFlow(
        [
          'Comando pede a alternativa correta sobre o Programa Melhor em Casa.',
          'Eliminar "só para dificuldade definitiva de saída de casa": o PMeC também atende situações temporárias/agudas.',
          'Eliminar "execução tripartite com municípios só assessorando MS/Estados": municípios executam o serviço, não só assessoram.',
          'Eliminar "admissão só por solicitação médica, sem concordância": a admissão exige consentimento do usuário/responsável.',
          'Eliminar "assistência restrita a dias úteis, 7h-19h": o SAD deve garantir continuidade e regularidade compatíveis com a necessidade do usuário.',
          'Correto: PMeC é composto por EMAD, EMAP e EMAP-R → marcar C.',
          'Em similares: PMeC/SAD sempre remete a essa composição de equipes e ao consentimento do usuário.',
        ],
        'Portátil: EMAD + EMAP + EMAP-R + consentimento',
      ),
      goldenRule(
        'Decore — Programa Melhor em Casa',
        'TRÊS EQUIPES, UMA REGRA DE ENTRADA',
        [
          { label: 'EMAD', value: 'Time nuclear que presta a atenção domiciliar propriamente dita.', badge: 'ok' },
          { label: 'EMAP', value: 'Time de apoio matricial às equipes que atendem o usuário em casa.', badge: 'ok' },
          { label: 'EMAP-R', value: 'Apoio focado em reabilitação do usuário atendido em domicílio.', badge: 'ok' },
          { label: 'Armadilha', value: 'Achar que dispensa consentimento ou que é só para casos crônicos irreversíveis.', badge: 'warn' },
        ],
        'Decore: entrada sempre passa por autorização do usuário',
      ),
      dangerZone(
        'PEGADINHAS — Programa Melhor em Casa',
        [
          {
            label: 'Letra A — só dificuldade definitiva de saída de casa',
            detail: 'Restringe demais o público-alvo.',
            correct: 'O PMeC também atende situações temporárias que impeçam a ida à unidade, não só casos definitivos.',
          },
          {
            label: 'Letra B — municípios só assessoram MS/Estados',
            detail: 'Inverte os papéis da lógica tripartite.',
            correct: 'Na lógica tripartite, os municípios executam o serviço; MS e Estados dão apoio técnico e financeiro.',
          },
          {
            label: 'Letra D — admissão só por solicitação médica, sem concordância',
            detail: 'Ignora o consentimento do usuário.',
            correct: 'A admissão ao SAD/PMeC exige a concordância prévia do usuário ou responsável legal.',
          },
          {
            label: 'Letra E — assistência só em dias úteis, 7h-19h',
            detail: 'Limita a continuidade do serviço.',
            correct: 'O SAD deve garantir continuidade e regularidade da assistência, compatível com a necessidade do usuário.',
          },
          {
            label: 'Transferência',
            detail: '"Atenção domiciliar dispensa regras formais".',
            correct: 'Em similares, PMeC/SAD segue composição de equipes definida e exige consentimento, como qualquer serviço do SUS.',
          },
        ],
        'Ignorar consentimento ou composição de equipes → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-atencao-basica-saude-da-familia-1778968357339-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'População adscrita: conjunto de pessoas vinculado ao território de uma UBS, base para planejamento estratégico segundo perfil e necessidades locais (PNAB)',
    sources: [{ ...PNAB, covers: ['população adscrita', 'território', 'planejamento estratégico'] }],
    slides: [
      conceptMap(
        'População adscrita',
        [
          {
            label: 'Pergunta',
            detail: 'Termo que designa o conjunto de pessoas do território de uma UBS.',
            icon: 'HelpCircle',
          },
          {
            label: 'Resposta-chave',
            detail: 'População adscrita.',
            icon: 'MapPin',
          },
          {
            label: 'Diferencia',
            detail: 'Microrregião é divisão administrativa; demanda espontânea é quem busca por conta própria.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir população adscrita com termo parecido, mas sem o vínculo formal de território.',
            icon: 'AlertTriangle',
          },
        ],
        'Vínculo formal território-equipe = população adscrita',
      ),
      logicFlow(
        [
          'Comando pede o termo técnico do conjunto de pessoas do território de uma UBS.',
          'Eliminar microrregião: é divisão administrativa/geográfica maior, não o vínculo população-equipe.',
          'Eliminar população comunitária: não é o termo técnico da PNAB.',
          'Eliminar demanda espontânea: refere-se a quem busca o serviço sem agendamento, não ao território todo.',
          'Eliminar comunidade adjacente: termo vago, sem base técnica na PNAB.',
          'Correto: população adscrita → marcar A.',
          'Em similares: "perfil e necessidades do território de uma UBS" sempre aponta para população adscrita.',
        ],
        'Portátil: território de UBS = população adscrita',
      ),
      goldenRule(
        'Decore — população adscrita',
        'VÍNCULO FORMAL TERRITÓRIO-EQUIPE',
        [
          { label: 'O que é', value: 'Pessoas cadastradas/vinculadas ao território de uma UBS.', badge: 'ok' },
          { label: 'Para quê', value: 'Base para planejamento estratégico segundo perfil e necessidades.', badge: 'ok' },
          { label: 'Não confundir', value: 'Microrregião (divisão administrativa) ou demanda espontânea (busca sem agendamento).', badge: 'warn' },
          { label: 'Armadilha', value: 'Usar termo genérico no lugar do termo técnico da PNAB.', badge: 'warn' },
        ],
        'Decore: adscrita = vínculo formal com a equipe',
      ),
      dangerZone(
        'PEGADINHAS — termo técnico',
        [
          {
            label: 'Letra B — microrregião',
            detail: 'Parece termo territorial equivalente.',
            correct: 'Microrregião é divisão administrativa/geográfica; população adscrita é o vínculo direto com a UBS.',
          },
          {
            label: 'Letra C — população comunitária',
            detail: 'Soa parecido, mas não é técnico.',
            correct: 'Esse termo não é o conceito técnico da PNAB; o correto é população adscrita.',
          },
          {
            label: 'Letra D — demanda espontânea',
            detail: 'Confunde com quem busca o serviço sem agendamento.',
            correct: 'Demanda espontânea é quem busca o serviço sem agendamento prévio, não o total do território.',
          },
          {
            label: 'Letra E — comunidade adjacente',
            detail: 'Termo vago sem base na PNAB.',
            correct: 'Não é termo técnico da PNAB; o vínculo formal é chamado de população adscrita.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer termo de população serve".',
            correct: 'Em similares, fixe "população adscrita" como o termo técnico do vínculo território-equipe na PNAB.',
          },
        ],
        'Trocar termo técnico por sinônimo vago → distrator',
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
    reviewer: 'pipeline-ab-g21',
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
  console.log(`\nHandcraft g21: ${PATCHES.length} slugs escritos.`);
}

main();
