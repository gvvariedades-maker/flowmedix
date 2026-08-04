/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g15 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g15.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g15';
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

const CAB_DIABETES = {
  id: 'cab36-diabetes',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Caderno de Atenção Básica nº 36 — Estratégias para o cuidado da pessoa com diabetes mellitus',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/estrategias_cuidado_pessoa_diabetes_mellitus.pdf',
};

const GUIA_VIGILANCIA = {
  id: 'guia-vigilancia-saude',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de Vigilância em Saúde — enteroparasitoses e doenças de transmissão fecal-oral',
  year: 2021,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_vigilancia_saude_5ed.pdf',
};

const COFEN_ETICA = {
  id: 'cofen-564-2017',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Resolução COFEN nº 564/2017 — Código de Ética dos Profissionais de Enfermagem',
  year: 2017,
  url: 'http://www.cofen.gov.br/resolucao-cofen-no-564-2017_59145.html',
};

const SIAB_MANUAL = {
  id: 'siab-fichas-b',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual do Sistema de Informação da Atenção Básica (SIAB) — Fichas B de acompanhamento',
  year: 2003,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/siab.pdf',
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
    file: 'igecap-enfermagem-processo-de-enfermagem-1780004452857-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'TE na APS educa para cortar rota fecal-oral: água/alimento tratado, não hábito "natural"',
    sources: [
      { ...GUIA_VIGILANCIA, covers: ['fecal-oral', 'higiene alimentar', 'educação em saúde'] },
      { ...PNAB, covers: ['ações educativas', 'atenção básica'] },
    ],
    slides: [
      conceptMap(
        'Rota fecal-oral — o que corta',
        [
          {
            label: 'Rota',
            detail: 'Parasitose/infecção entra pela água ou alimento contaminado.',
            icon: 'Droplets',
          },
          {
            label: 'Papel do TE',
            detail: 'Orientação educativa sobre higiene individual e do alimento.',
            icon: 'BookOpen',
          },
          {
            label: 'Barreira',
            detail: 'Água tratada + lavagem adequada fecham a rota de entrada.',
            icon: 'ShieldCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Hábito soa "natural" (água de fonte, andar descalço) mas abre a rota.',
            icon: 'AlertTriangle',
          },
        ],
        'Água/alimento tratado > hábito natural',
      ),
      logicFlow(
        [
          'Comando pede a conduta eficaz de prevenção da doença fecal-oral.',
          'Eliminar consumo de água não tratada só por parecer límpida a olho nu.',
          'Eliminar descarte de resíduo a céu aberto — atrai vetor e contamina o solo.',
          'Eliminar hábito de ficar sem calçado — expõe a parasitose, não fortalece nada.',
          'Eliminar troca de objeto pessoal — abre via de contágio, não aproxima a família.',
          'Higienizar alimento com água tratada fecha a rota de entrada do agravo.',
          'Em similares: aposte na barreira de água/alimento tratado, não no hábito "natural".',
        ],
        'Portátil: barreira de água/alimento',
      ),
      goldenRule(
        'Decore — barreira fecal-oral',
        'QUATRO BARREIRAS',
        [
          { label: 'Água', value: 'Sempre tratada — aparência não garante segurança.', badge: 'ok' },
          { label: 'Alimento', value: 'Higienizar fruta/verdura com água tratada.', badge: 'ok' },
          { label: 'Mãos', value: 'Lavagem após contato com solo/banheiro.', badge: 'ok' },
          { label: 'Resíduo', value: 'Destino sanitário correto, nunca a céu aberto.', badge: 'ok' },
        ],
        'Decore: barreira > hábito popular',
      ),
      dangerZone(
        'PEGADINHAS — prevenção fecal-oral',
        [
          {
            label: 'Letra A — água de fonte límpida',
            detail: 'Confia na aparência da água.',
            correct: 'Aparência não garante ausência de contaminação; só o tratamento elimina o risco.',
          },
          {
            label: 'Letra C — descarte a céu aberto',
            detail: 'Acha que resolve o acúmulo em casa.',
            correct: 'Resíduo exposto atrai vetor e contamina solo/água do território.',
          },
          {
            label: 'Letra D — andar descalço',
            detail: 'Chama de fortalecimento da imunidade.',
            correct: 'Contato direto com solo contaminado favorece penetração de larva.',
          },
          {
            label: 'Letra E — compartilhar objeto pessoal',
            detail: 'Chama de integração familiar.',
            correct: 'Objeto compartilhado é via de contágio, não aproxima a família.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova, o hábito "popular saudável" pode ser o próprio vetor.',
            correct: 'Teste sempre se o hábito fecha ou abre a rota de contaminação.',
          },
        ],
        'Hábito "natural" pode ser o vetor',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968028412-3.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Glicemia alterada: TE registra, orienta conforme protocolo e comunica a equipe — não decide terapia',
    sources: [
      { ...CAB_DIABETES, covers: ['glicemia capilar', 'atribuições', 'comunicação com a equipe'] },
      { ...PNAB, covers: ['equipe multiprofissional', 'protocolo institucional'] },
    ],
    slides: [
      conceptMap(
        'Glicemia alterada — o que o TE faz',
        [
          {
            label: 'Executa',
            detail: 'Realiza a técnica de verificação da glicemia capilar.',
            icon: 'Activity',
          },
          {
            label: 'Registra',
            detail: 'Anota o valor encontrado no prontuário/ficha de acompanhamento.',
            icon: 'FileText',
          },
          {
            label: 'Comunica',
            detail: 'Leva o achado à equipe para avaliação e definição de conduta.',
            icon: 'Share2',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Decidir sozinho o que fazer com o valor alterado, sem passar pela equipe.',
            icon: 'AlertTriangle',
          },
        ],
        'Medir · registrar · comunicar',
      ),
      logicFlow(
        [
          'Comando pede a conduta CORRETA do TE após glicemia capilar fora do parâmetro.',
          'Eliminar suspender a alimentação por iniciativa própria, sem passar pela equipe.',
          'Eliminar ajustar a dose do medicamento — decisão fora da atribuição técnica.',
          'Eliminar ignorar o valor isolado — todo achado fora do parâmetro precisa de registro.',
          'Registrar o valor, seguir o protocolo de orientação e comunicar a equipe fecha o ciclo.',
          'Em similares: o técnico mede e comunica; quem decide a terapia é enfermeiro/médico.',
        ],
        'Portátil: medir → registrar → comunicar',
      ),
      goldenRule(
        'Decore — glicemia alterada',
        'CICLO DO TE',
        [
          { label: 'Fazer', value: 'Registrar valor + orientar conforme protocolo.', badge: 'ok' },
          { label: 'Comunicar', value: 'Levar o achado para avaliação da equipe.', badge: 'ok' },
          { label: 'Não fazer', value: 'Ajustar dose ou decidir conduta terapêutica sozinho.', badge: 'warn' },
        ],
        'Decore: técnico não decide terapia',
      ),
      dangerZone(
        'PEGADINHAS — conduta glicemia',
        [
          {
            label: 'Letra A — suspender alimentação',
            detail: 'Age por conta própria diante do valor alterado.',
            correct: 'Decisão sobre conduta alimentar cabe à equipe, após avaliação do caso.',
          },
          {
            label: 'Letra C — ajustar dose',
            detail: 'Toma decisão terapêutica no lugar da equipe.',
            correct: 'Ajuste de medicação é ato de enfermeiro/médico, não do técnico.',
          },
          {
            label: 'Letra D — desconsiderar resultado',
            detail: 'Trata o achado isolado como irrelevante.',
            correct: 'Todo valor fora do parâmetro precisa ser registrado e levado à equipe.',
          },
          {
            label: 'Transferência',
            detail: 'Em outro sinal alterado, o padrão se repete.',
            correct: 'Medir, registrar e comunicar — nunca tratar por conta própria.',
          },
        ],
        'Decidir terapia sozinho → cai',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968028412-4.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Verminoses: TE orienta, observa e comunica — diagnóstico, fiscalização e prescrição são de outra categoria',
    sources: [
      { ...GUIA_VIGILANCIA, covers: ['verminoses', 'enteroparasitoses', 'atribuições da equipe'] },
      { ...PNAB, covers: ['ações educativas', 'equipe multiprofissional'] },
    ],
    slides: [
      conceptMap(
        'Verminoses — papel do TE',
        [
          {
            label: 'Orienta',
            detail: 'Passa medida de higiene à população no território.',
            icon: 'MessageCircle',
          },
          {
            label: 'Observa e apoia',
            detail: 'Observa sinal clínico e apoia a ação educativa da equipe.',
            icon: 'Eye',
          },
          {
            label: 'Comunica',
            detail: 'Leva o que observou à equipe de saúde.',
            icon: 'Share2',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir observação clínica com interpretar exame ou prescrever remédio.',
            icon: 'AlertTriangle',
          },
        ],
        'Educar e observar ≠ diagnosticar/prescrever',
      ),
      logicFlow(
        [
          'Comando pede a atribuição CORRETA do TE no enfrentamento das verminoses.',
          'Eliminar interpretar exame parasitológico — ato de análise clínica/laboratorial.',
          'Eliminar fiscalizar domicílio e aplicar medida legal — competência de outra área.',
          'Eliminar definir esquema de antiparasitário — ato de prescrição médica.',
          'Orientar higiene, observar sinal, apoiar a ação educativa e comunicar fecha o papel técnico.',
          'Em similares: o TE educa e comunica; diagnóstico e prescrição ficam com outra categoria.',
        ],
        'Portátil: educar/observar, não diagnosticar',
      ),
      goldenRule(
        'Decore — verminoses',
        'PAPEL DO TE',
        [
          { label: 'Fazer', value: 'Orientar higiene, observar sinal, apoiar e comunicar.', badge: 'ok' },
          { label: 'Não fazer', value: 'Interpretar exame, fiscalizar ou prescrever.', badge: 'warn' },
        ],
        'Decore: TE educa, não diagnostica',
      ),
      dangerZone(
        'PEGADINHAS — verminoses',
        [
          {
            label: 'Letra B — diagnóstico parasitológico',
            detail: 'Coloca o TE interpretando exame.',
            correct: 'Interpretar exame laboratorial é atribuição de análise clínica especializada.',
          },
          {
            label: 'Letra C — fiscalizar e aplicar medida legal',
            detail: 'Dá poder de fiscalização ao TE.',
            correct: 'Fiscalização e medida legal do território cabem à vigilância/gestão.',
          },
          {
            label: 'Letra D — prescrever antiparasitário',
            detail: 'Coloca o TE definindo esquema terapêutico.',
            correct: 'Definir esquema de tratamento é ato de prescrição médica.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra parasitose, o mesmo corte se repete.',
            correct: 'TE observa e comunica; diagnóstico e prescrição são de outra categoria.',
          },
        ],
        'Diagnosticar/prescrever → não é do TE',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968028412-6.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Saúde coletiva na ESF: TE participa, executa por protocolo e comunica — planejar/deliberar é gestão',
    sources: [
      { ...PNAB, covers: ['saúde coletiva', 'atribuições', 'equipe multiprofissional'] },
    ],
    slides: [
      conceptMap(
        'Saúde coletiva — papel do TE',
        [
          {
            label: 'Participa',
            detail: 'Entra na ação coletiva realizada no território adscrito.',
            icon: 'Users',
          },
          {
            label: 'Executa',
            detail: 'Segue o procedimento conforme protocolo institucional.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Comunica',
            detail: 'Leva informação relevante para a equipe.',
            icon: 'Share2',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar "executar por protocolo" por planejar, deliberar ou coordenar.',
            icon: 'AlertTriangle',
          },
        ],
        'Executar por protocolo, não decidir sozinho',
      ),
      logicFlow(
        [
          'Comando pede a atribuição CORRETA do TE nas ações coletivas da ESF.',
          'Eliminar montar campanha e avaliar indicador — isso é função de planejamento.',
          'Eliminar decidir sobre recurso e supervisionar formalmente a equipe — é gestão.',
          'Eliminar definir prioridade sanitária e coordenar intersetorial — decisão gerencial.',
          'Participar, seguir protocolo e comunicar fecha o papel técnico no território.',
          'Em similares: verbo de decisão estratégica aponta para outra categoria, não o TE.',
        ],
        'Portátil: executar ≠ decidir/coordenar',
      ),
      goldenRule(
        'Decore — atribuição TE',
        'EXECUTAR, NÃO GERIR',
        [
          { label: 'TE faz', value: 'Participar, executar por protocolo, comunicar.', badge: 'ok' },
          { label: 'Não é do TE', value: 'Planejar, deliberar recurso, coordenar rede.', badge: 'warn' },
        ],
        'Decore: verbo de gestão ≠ TE',
      ),
      dangerZone(
        'PEGADINHAS — saúde coletiva',
        [
          {
            label: 'Letra B — planejar e avaliar indicador',
            detail: 'Dá função de planejamento ao TE.',
            correct: 'Planejar campanha e avaliar indicador cabe a quem coordena o serviço.',
          },
          {
            label: 'Letra C — deliberar recurso',
            detail: 'Dá poder de gestão da unidade ao TE.',
            correct: 'Deliberar recurso e supervisionar formalmente é atribuição gerencial.',
          },
          {
            label: 'Letra D — coordenar intersetorial',
            detail: 'Dá função de coordenação ao TE.',
            correct: 'Definir prioridade e coordenar rede intersetorial é papel de planejamento.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão de atribuição, o mesmo corte se repete.',
            correct: 'Verbo de decisão estratégica sinaliza função diferente da do TE.',
          },
        ],
        'Planejar/deliberar/coordenar → gestão',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968028412-7.json',
    family: 'vf',
    pedagogical_branch: 'ab_vigilancia_ads',
    guideline_snapshot:
      'Saúde coletiva: promoção reduz risco, vigilância monitora agravo, TE também educa, ação considera território',
    sources: [
      { ...GUIA_VIGILANCIA, covers: ['vigilância em saúde', 'promoção', 'controle de agravo'] },
      { ...PNAB, covers: ['território', 'perfil epidemiológico', 'ações educativas'] },
    ],
    slides: [
      conceptMap(
        'I–IV — Enfermagem em saúde coletiva',
        [
          {
            label: 'Formato',
            detail: 'I, II, III e IV para julgar antes de achar a letra com a combinação V/F.',
            icon: 'Target',
          },
          {
            label: 'I — Promoção',
            detail: 'Promoção da saúde melhora condição de vida e reduz fator de risco.',
            icon: 'HeartHandshake',
          },
          {
            label: 'II — Vigilância',
            detail: 'Vigilância em saúde coletiva identifica, monitora e controla agravo.',
            icon: 'Radar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'III tenta limitar o Técnico em Enfermagem só à execução, sem ação educativa.',
            icon: 'AlertTriangle',
          },
        ],
        'Julgue I, II, III e IV antes da letra',
      ),
      logicFlow(
        [
          'Formato: julgar I, II, III e IV isoladamente e só depois achar a letra com a combinação.',
          'I verdadeira: promoção da saúde melhora condição de vida e reduz fator de risco.',
          'II verdadeira: vigilância em saúde coletiva identifica, monitora e controla agravo.',
          'III falsa: o Técnico em Enfermagem também participa de ação educativa em saúde coletiva.',
          'IV verdadeira: a organização dos serviços considera território, perfil epidemiológico e necessidade da população.',
          'Eliminar letra que marque III como verdadeira ou qualquer outra afirmativa como falsa.',
          'Em similares: a afirmativa que restringe o Técnico só à execução costuma ser a falsa.',
        ],
        'Portátil: I-V II-V III-F IV-V',
      ),
      goldenRule(
        'Decore — saúde coletiva',
        'QUATRO EIXOS',
        [
          { label: 'I — Promoção', value: 'Reduz fator de risco da população.', badge: 'ok' },
          { label: 'II — Vigilância', value: 'Identifica, monitora e controla agravo.', badge: 'ok' },
          { label: 'III — Técnico', value: 'Também participa de ação educativa — não só executa.', badge: 'ok' },
          { label: 'IV — Organização', value: 'Considera território, perfil epidemiológico e necessidade.', badge: 'ok' },
        ],
        'Decore: Técnico educa também',
      ),
      dangerZone(
        'PEGADINHAS — combinação V/F',
        [
          {
            label: 'Letra A — V, V, V, F',
            detail: 'Inverte III e IV.',
            correct: 'III é falsa (Técnico também educa) e IV é verdadeira (considera território) — essa letra erra nas duas.',
          },
          {
            label: 'Letra C — V, F, V, V',
            detail: 'Marca a vigilância em saúde coletiva como falsa.',
            correct: 'II é verdadeira: vigilância identifica, monitora e controla agravo à saúde.',
          },
          {
            label: 'Letra D — F, V, F, V',
            detail: 'Marca a promoção da saúde como falsa.',
            correct: 'I é verdadeira: promoção da saúde reduz fator de risco da população.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra banca sobre saúde coletiva, o padrão se repete.',
            correct: 'Julgue I, II, III e IV isoladamente antes de escolher a letra.',
          },
        ],
        'Combinação parcial → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968323839-0.json',
    family: 'certo_errado',
    pedagogical_branch: 'ab_pnab_principios',
    guideline_snapshot:
      'Idoso na Atenção Básica: cuidado geriátrico ocorre na própria UBS e em programa ampliado, por profissional capacitado',
    sources: [{ ...PNAB, covers: ['atenção ao idoso', 'atributos da APS', 'equipe capacitada'] }],
    slides: [
      conceptMap(
        'Idoso na Atenção Básica',
        [
          {
            label: 'Onde',
            detail: 'Cuidado ocorre na própria UBS e também em programa ampliado.',
            icon: 'MapPin',
          },
          {
            label: 'Quem',
            detail: 'Consulta em geriatria feita por profissional capacitado para isso.',
            icon: 'Stethoscope',
          },
          {
            label: 'Foco',
            detail: 'Atender à necessidade do idoso e também da família.',
            icon: 'HeartHandshake',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Achar que geriatria só existe fora da UBS, em serviço especializado.',
            icon: 'AlertTriangle',
          },
        ],
        'UBS + programa ampliado, não só fora dela',
      ),
      logicFlow(
        [
          'Julgue onde e por quem ocorre a assistência geriátrica descrita na afirmação.',
          'A UBS oferece consulta em geriatria, além do programa de atenção ampliada.',
          'O profissional precisa de capacitação adequada para atender bem o idoso.',
          'O objetivo declarado é atender à necessidade do idoso e também da família.',
          'Nenhum ponto da afirmação distorce o cuidado descrito — a assertiva está correta.',
          'Em similares: idoso é atendido na própria UBS e em programa ampliado, não só fora dela.',
        ],
        'Portátil: UBS cuida, não só encaminha',
      ),
      goldenRule(
        'Decore — idoso na AB',
        'ONDE E QUEM',
        [
          { label: 'Onde', value: 'UBS e programa de atenção básica ampliada.', badge: 'ok' },
          { label: 'Quem', value: 'Médico ou enfermeiro capacitados em geriatria.', badge: 'ok' },
          { label: 'Foco', value: 'Necessidade do idoso e também da família.', badge: 'ok' },
        ],
        'Decore: geriatria também na UBS',
      ),
      dangerZone(
        'PEGADINHAS — assistência ao idoso',
        [
          {
            label: 'Letra B — marcar Errado',
            detail: 'Acha que a afirmação restringe demais o cuidado.',
            correct: 'A afirmação já cobre local, profissional capacitado e foco na família — não há erro.',
          },
          {
            label: 'Transferência',
            detail: 'Em item parecido sobre idoso, mude a leitura só se a banca cortar algum desses pontos.',
            correct: 'Desconfie se restringir o cuidado a um único local ou tirar a capacitação exigida.',
          },
        ],
        'Sem restrição indevida → item certo',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968323839-2.json',
    family: 'certo_errado',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'Sigilo do ACS protege de terceiro externo, mas não impede a comunicação com a própria equipe de saúde',
    sources: [
      { ...COFEN_ETICA, covers: ['sigilo profissional', 'comunicação em equipe'] },
      { ...LEI_ACS, covers: ['atribuições ACS', 'território'] },
    ],
    slides: [
      conceptMap(
        'Sigilo do ACS — até onde vai',
        [
          {
            label: 'Dever de sigilo',
            detail: 'Todo profissional de saúde guarda informação de sintoma ou infecção do indivíduo.',
            icon: 'Lock',
          },
          {
            label: 'Comunidade e equipe',
            detail: 'O ACS atua na comunidade, mas o dado circula dentro da equipe de saúde.',
            icon: 'Share2',
          },
          {
            label: 'Compartilhar com critério',
            detail: 'Informação é compartilhada com quem cuida, não com qualquer outra pessoa.',
            icon: 'HeartHandshake',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Ler "impedir compartilhamento" como bloqueio até para a própria equipe.',
            icon: 'AlertTriangle',
          },
        ],
        'Sigilo é de fora, não da equipe',
      ),
      logicFlow(
        [
          'Julgue o dever de sigilo do ACS sobre sintoma ou infecção de indivíduo da comunidade.',
          'Sigilo profissional impede que a informação vá a qualquer outra pessoa fora do cuidado.',
          'Compartilhar o dado com a equipe de saúde é parte do cuidado no território, não uma exceção proibida.',
          'Impedir toda e qualquer troca, mesmo interna, contraria o funcionamento da rede de cuidado.',
          'A afirmação trata a equipe de saúde como "qualquer outra pessoa" — isso está incorreto.',
          'Em similares: sigilo vale para terceiro fora do cuidado; a equipe compartilha o necessário.',
        ],
        'Portátil: sigilo é de fora, não de dentro',
      ),
      goldenRule(
        'Decore — sigilo ACS',
        'DE FORA, NÃO DE DENTRO',
        [
          { label: 'Sigilo protege de', value: 'Terceiro fora do cuidado da comunidade.', badge: 'ok' },
          { label: 'Sigilo não bloqueia', value: 'Comunicação de sintoma/infecção com a equipe de saúde.', badge: 'warn' },
          { label: 'ACS', value: 'Compartilha informação do indivíduo com quem cuida, não com qualquer pessoa.', badge: 'ok' },
        ],
        'Decore: equipe compartilha o necessário',
      ),
      dangerZone(
        'PEGADINHAS — sigilo ACS',
        [
          {
            label: 'Letra A — marcar Certo',
            detail: 'Aceita que o ACS trate a equipe de saúde como "qualquer outra pessoa".',
            correct: 'A afirmação erra ao estender o sigilo até a própria equipe de saúde.',
          },
          {
            label: 'Transferência',
            detail: 'Em item parecido sobre ética/sigilo de outro profissional, o mesmo alerta serve.',
            correct: 'Cuidado com afirmação que transforma sigilo em silêncio total dentro da equipe.',
          },
        ],
        'Sigilo ≠ silêncio com a equipe',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968323839-3.json',
    family: 'certo_errado',
    pedagogical_branch: 'ab_vigilancia_ads',
    guideline_snapshot:
      'Ficha de acompanhamento do diabético é individual, por pessoa — não reunida numa ficha única da família',
    sources: [
      { ...SIAB_MANUAL, covers: ['ficha de acompanhamento', 'registro individual'] },
      { ...CAB_DIABETES, covers: ['acompanhamento do diabético', 'registro'] },
    ],
    slides: [
      conceptMap(
        'Registro do diabético — unidade',
        [
          {
            label: 'Unidade do registro',
            detail: 'Uma ficha por pessoa acompanhada, não por domicílio.',
            icon: 'FileText',
          },
          {
            label: 'Atualização',
            detail: 'Dados atualizados a cada visita ou contato da equipe.',
            icon: 'RefreshCw',
          },
          {
            label: 'Quem entra',
            detail: 'Pessoa com diagnóstico confirmado e também caso suspeito.',
            icon: 'UserCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir com a ficha de cadastro familiar, que reúne todos os moradores.',
            icon: 'AlertTriangle',
          },
        ],
        'Por pessoa, não por família',
      ),
      logicFlow(
        [
          'Julgue como a informação do diabético é organizada no registro descrito.',
          'A ficha de acompanhamento é individual — uma para cada pessoa cadastrada.',
          'A atualização a cada visita está correta e reflete o acompanhamento contínuo.',
          'Reunir os dados de toda a família numa única ficha não corresponde a esse registro.',
          'A parte final da afirmação troca o registro individual pelo formato familiar — está incorreta.',
          'Em similares: registro de agravo específico costuma ser por pessoa, não por domicílio.',
        ],
        'Portátil: agravo = registro individual',
      ),
      goldenRule(
        'Decore — registro do diabético',
        'POR PESSOA',
        [
          { label: 'Unidade', value: 'Uma ficha para cada pessoa acompanhada.', badge: 'ok' },
          { label: 'Frequência', value: 'Atualiza a cada visita da equipe.', badge: 'ok' },
          { label: 'Não é', value: 'Reunião de toda a família numa ficha única.', badge: 'warn' },
        ],
        'Decore: agravo não vira cadastro familiar',
      ),
      dangerZone(
        'PEGADINHAS — Ficha B-DIA',
        [
          {
            label: 'Letra A — marcar Certo',
            detail: 'Aceita reunir a família numa ficha única do agravo.',
            correct: 'A afirmação erra no final: esse registro é individual, não familiar.',
          },
          {
            label: 'Transferência',
            detail: 'Em item parecido sobre outro agravo crônico, o mesmo alerta serve.',
            correct: 'Cuidado ao trocar o registro individual do agravo pelo cadastro familiar do domicílio.',
          },
        ],
        'Registro de agravo ≠ cadastro familiar',
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
    reviewer: 'pipeline-ab-g15',
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
  console.log(`\nHandcraft g15: ${PATCHES.length} slugs escritos.`);
}

main();
