/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g16 (8 slugs).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g16.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g16';
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

const VIGILANCIA_MS = {
  id: 'ms-vigilancia-epidemiologica',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de Vigilância em Saúde — notificação e controle de agravos',
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br',
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
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1780001297464-9.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'TE diante de glicemia capilar alterada: registra, orienta conforme protocolo e comunica a equipe — não ajusta dose nem decide conduta terapêutica',
    sources: [
      { ...COFEN_ATRIBUICOES, covers: ['execução sob supervisão', 'registro', 'comunicação à equipe'] },
      { ...PNAB, covers: ['acompanhamento de crônicos', 'ESF'] },
    ],
    slides: [
      conceptMap(
        'Glicemia capilar alterada — conduta do TE',
        [
          {
            label: 'Cenário',
            detail: 'TE mede glicemia capilar de usuário diabético e encontra valor acima do esperado.',
            icon: 'Activity',
          },
          {
            label: 'Conduta-alvo',
            detail: 'Registrar o valor, orientar o usuário conforme protocolo e comunicar a equipe.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Limite do TE',
            detail: 'Não decide conduta terapêutica isolado nem altera esquema medicamentoso.',
            icon: 'ShieldAlert',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir orientar/registrar com decidir tratamento por conta própria.',
            icon: 'AlertTriangle',
          },
        ],
        'Registrar + orientar + comunicar > decidir sozinho',
      ),
      logicFlow(
        [
          'Comando: valor de glicemia capilar acima do esperado — qual conduta do TE?',
          'Registrar o achado e orientar o usuário conforme o protocolo da unidade.',
          'Comunicar a equipe de saúde é etapa obrigatória para avaliação e conduta.',
          'Eliminar: interromper alimentação, alterar dose ou ignorar o resultado isolado.',
          'Correta reúne registro, orientação e comunicação → marcar B.',
          'Em similares: achado alterado sempre sobe para a equipe antes de qualquer conduta terapêutica.',
        ],
        'Portátil: achado alterado → time, não decisão solo',
      ),
      goldenRule(
        'Decore — achado alterado',
        'TRÊS PASSOS',
        [
          { label: 'Fazer', value: 'Registrar o valor e orientar conforme o protocolo vigente.', badge: 'ok' },
          { label: 'Comunicar', value: 'Passar o caso à equipe para avaliação e conduta.', badge: 'ok' },
          { label: 'Evitar', value: 'Ajustar dose ou interromper alimentação por conta própria.', badge: 'warn' },
        ],
        'Decore: quem decide terapia é a equipe, não o TE isolado',
      ),
      dangerZone(
        'PEGADINHAS — achado alterado',
        [
          {
            label: 'Letra A — suspender alimentação',
            detail: 'Interrompe a dieta até normalizar.',
            correct: 'A conduta correta é registrar, orientar e comunicar — não restringir a alimentação por iniciativa própria.',
          },
          {
            label: 'Letra C — ajustar dose',
            detail: 'Modifica a medicação hipoglicemiante.',
            correct: 'Alterar esquema terapêutico é decisão da equipe/prescritor, não do TE isoladamente.',
          },
          {
            label: 'Letra D — desconsiderar o resultado',
            detail: 'Trata o achado como irrelevante.',
            correct: 'Todo achado alterado deve ser registrado e levado à equipe para avaliação.',
          },
          {
            label: 'Transferência',
            detail: '“Achado isolado não muda nada no acompanhamento”.',
            correct: 'Na ESF, qualquer valor fora do esperado é registrado e comunicado antes de seguir o cuidado.',
          },
        ],
        'Decidir sozinho ou ignorar achado → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1780001362784-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'TE no enfrentamento de verminoses: orienta higiene, observa sinais, apoia educação e comunica a equipe — não diagnostica, prescreve ou fiscaliza',
    sources: [
      { ...COFEN_ATRIBUICOES, covers: ['execução sob supervisão', 'apoio educativo'] },
      { ...PNAB, covers: ['saneamento', 'território', 'prevenção de agravos'] },
    ],
    slides: [
      conceptMap(
        'Verminoses — papel do TE',
        [
          {
            label: 'Cenário',
            detail: 'Verminoses frequentes em território com saneamento precário.',
            icon: 'MapPin',
          },
          {
            label: 'Conduta do TE',
            detail: 'Orienta a população, observa sinais clínicos e apoia ações educativas.',
            icon: 'BookOpen',
          },
          {
            label: 'Limite do TE',
            detail: 'Não confirma diagnóstico parasitológico nem prescreve antiparasitário.',
            icon: 'ShieldAlert',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar apoio educativo por diagnóstico, prescrição ou fiscalização legal.',
            icon: 'AlertTriangle',
          },
        ],
        'Orientar e observar > diagnosticar ou prescrever',
      ),
      logicFlow(
        [
          'Comando: atribuição do TE no combate a verminoses no território.',
          'TE orienta a população sobre higiene e observa sinais clínicos no acompanhamento.',
          'Apoiar ações educativas e comunicar a equipe fecham o papel técnico.',
          'Eliminar: confirmar diagnóstico parasitológico, fiscalizar domicílios e prescrever tratamento.',
          'Correta reúne orientação, observação, apoio e comunicação → marcar A.',
          'Em similares: diagnóstico, fiscalização legal e prescrição ficam fora do alcance do TE.',
        ],
        'Portátil: apoio e observação, não laudo',
      ),
      goldenRule(
        'Decore — verminoses',
        'QUATRO VERBOS DO TE',
        [
          { label: 'Orientar', value: 'Medidas de higiene junto à população.', badge: 'ok' },
          { label: 'Observar', value: 'Sinais clínicos durante o acompanhamento.', badge: 'ok' },
          { label: 'Apoiar', value: 'Ações educativas da equipe no território.', badge: 'ok' },
          { label: 'Armadilha', value: 'Diagnosticar, fiscalizar ou prescrever tratamento.', badge: 'warn' },
        ],
        'Decore: laudo e receita não são do TE',
      ),
      dangerZone(
        'PEGADINHAS — verminoses',
        [
          {
            label: 'Letra B — diagnóstico parasitológico',
            detail: 'Interpreta exame e confirma helmintos.',
            correct: 'Confirmação diagnóstica exige profissional habilitado, não o TE.',
          },
          {
            label: 'Letra C — fiscalização/medidas legais',
            detail: 'Aplica sanção sobre saneamento no território.',
            correct: 'Fiscalização e medidas legais são atribuição de outro órgão de gestão, não do TE.',
          },
          {
            label: 'Letra D — prescrição antiparasitária',
            detail: 'Define esquema terapêutico.',
            correct: 'Definir esquema de tratamento é ato exclusivo de profissional prescritor.',
          },
          {
            label: 'Transferência',
            detail: '“TE resolve qualquer etapa do combate ao agravo”.',
            correct: 'No território, o TE apoia e orienta; laudo, receita e fiscalização exigem outra habilitação.',
          },
        ],
        'Assumir laudo, receita ou fiscalização → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1780001362784-2.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'TE em Saúde Coletiva na ESF: participa das ações, executa procedimentos e comunica a equipe — não planeja, delibera ou coordena',
    sources: [
      { ...COFEN_ATRIBUICOES, covers: ['execução sob supervisão'] },
      { ...PNAB, covers: ['equipe multiprofissional', 'território'] },
    ],
    slides: [
      conceptMap(
        'Saúde Coletiva na ESF — papel do TE',
        [
          {
            label: 'Conceito',
            detail: 'Saúde Coletiva na ESF trabalha promoção, prevenção e acompanhamento da população adscrita.',
            icon: 'Users',
          },
          {
            label: 'Papel do TE',
            detail: 'Participa das ações no território, executa procedimentos e comunica informações.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Limite do TE',
            detail: 'Não planeja metas, não delibera recursos e não coordena intersetorialmente.',
            icon: 'ShieldAlert',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar participar/executar por planejar, deliberar ou coordenar.',
            icon: 'AlertTriangle',
          },
        ],
        'Participar e executar > planejar ou deliberar',
      ),
      logicFlow(
        [
          'Comando: atribuição do TE na Enfermagem em Saúde Coletiva da ESF.',
          'TE participa das ações no território e executa procedimentos conforme protocolo.',
          'Comunicar informações relevantes à equipe fecha o papel técnico.',
          'Eliminar: planejar metas com indicadores, deliberar recursos e coordenar de forma intersetorial.',
          'Correta reúne participação, execução e comunicação → marcar A.',
          'Em similares: verbo de gestão (planejar, deliberar, coordenar) no lugar do TE é armadilha.',
        ],
        'Portátil: participar e executar, não gerir',
      ),
      goldenRule(
        'Decore — Saúde Coletiva',
        'TE × GESTÃO',
        [
          { label: 'TE', value: 'Participa, executa e comunica no território.', badge: 'ok' },
          { label: 'Enfermeiro/gestor', value: 'Planeja, delibera e coordena estrategicamente.', badge: 'ok' },
          { label: 'Armadilha', value: 'Verbo de gestão atribuído ao TE.', badge: 'warn' },
        ],
        'Decore: TE executa, gestão coordena',
      ),
      dangerZone(
        'PEGADINHAS — Saúde Coletiva',
        [
          {
            label: 'Letra B — planejar campanhas e indicadores',
            detail: 'Assume metas operacionais e avaliação epidemiológica.',
            correct: 'Planejamento e avaliação de indicadores são atribuição de gestão/enfermagem, não do TE.',
          },
          {
            label: 'Letra C — deliberar recursos e supervisionar',
            detail: 'Decide fluxo e supervisiona formalmente a equipe.',
            correct: 'Gestão de recursos e supervisão formal cabem ao enfermeiro/gestor da unidade.',
          },
          {
            label: 'Letra D — definir prioridades e coordenar',
            detail: 'Assume coordenação intersetorial no território.',
            correct: 'Coordenação estratégica intersetorial exige profissional de nível superior.',
          },
          {
            label: 'Transferência',
            detail: '“TE decide o rumo das ações coletivas”.',
            correct: 'O TE participa e executa; a coordenação estratégica é de outro profissional da equipe.',
          },
        ],
        'Atribuir gestão ao TE → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-atencao-basica-saude-da-familia-1780001362784-3.json',
    family: 'vf',
    pedagogical_branch: 'ab_vigilancia_ads',
    guideline_snapshot:
      'Saúde Coletiva na AB: promoção reduz risco, vigilância identifica/monitora agravos, TE participa de ações educativas (não só técnicas)',
    sources: [
      { ...VIGILANCIA_MS, covers: ['identificação', 'monitoramento', 'controle de agravos'] },
      { ...PNAB, covers: ['promoção da saúde', 'território'] },
    ],
    slides: [
      conceptMap(
        'Saúde Coletiva — afirmativas V/F',
        [
          {
            label: 'Afirmativa I',
            detail: 'Promoção da saúde melhora condições de vida e reduz fatores de risco.',
            icon: 'HeartPulse',
          },
          {
            label: 'Afirmativa II',
            detail: 'Vigilância em saúde identifica, monitora e controla agravos.',
            icon: 'Eye',
          },
          {
            label: 'Afirmativa III',
            detail: 'Diz que o TE não participa de ações educativas — isso é falso.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar III por parecer regra de limite, mas nega o papel educativo real do TE.',
            icon: 'AlertTriangle',
          },
        ],
        'I, II e IV firmes — III inverte o papel do TE',
      ),
      logicFlow(
        [
          'Julgar I, II, III e IV sobre saúde coletiva na ESF.',
          'I verdadeira: promoção melhora condições de vida e reduz fatores de risco.',
          'II verdadeira: vigilância identifica, monitora e controla agravos à saúde.',
          'III falsa: o TE também participa de ações educativas, não só executa procedimentos.',
          'IV verdadeira: as ações consideram território, perfil epidemiológico e necessidades da população.',
          'Sequência V, V, F, V → marcar B.',
          'Em similares: banca tenta restringir demais o papel educativo do TE — desconfie.',
        ],
        'Portátil: I+II+IV firmes, III inverte',
      ),
      goldenRule(
        'Decore — Saúde Coletiva',
        'QUATRO PILARES',
        [
          { label: 'Promoção', value: 'Melhora condições de vida, reduz risco.', badge: 'ok' },
          { label: 'Vigilância', value: 'Identifica, monitora e controla agravos.', badge: 'ok' },
          { label: 'TE', value: 'Participa de ações educativas, não só técnicas.', badge: 'ok' },
          { label: 'Armadilha', value: 'Negar o papel educativo do TE.', badge: 'warn' },
        ],
        'Decore: TE educa, sim',
      ),
      dangerZone(
        'PEGADINHAS — sequência V/F',
        [
          {
            label: 'Letra A — V, V, V, F',
            detail: 'Considera III verdadeira e IV falsa.',
            correct: 'III é falsa (TE participa de educação) e IV é verdadeira (considera território e perfil epidemiológico).',
          },
          {
            label: 'Letra C — V, F, V, V',
            detail: 'Marca II como falsa.',
            correct: 'II é verdadeira: a vigilância de fato identifica e monitora agravos.',
          },
          {
            label: 'Letra D — F, V, F, V',
            detail: 'Marca I como falsa.',
            correct: 'I é verdadeira: promoção reduz fatores de risco e melhora condições de vida.',
          },
          {
            label: 'Transferência',
            detail: '“O TE só executa procedimento técnico, nunca educa”.',
            correct: 'Na rotina da AB, orientar e apoiar ações educativas fazem parte do papel do TE.',
          },
        ],
        'Inverter I, II ou IV → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780001148264-3.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'TE nas viroses: orienta, observa sinais e apoia vigilância de suspeitos — prescrição e diagnóstico etiológico são atos médicos',
    sources: [
      { ...COFEN_ATRIBUICOES, covers: ['execução sob supervisão'] },
      { ...VIGILANCIA_MS, covers: ['vigilância de casos suspeitos', 'notificação'] },
    ],
    slides: [
      conceptMap(
        'Viroses — atribuições do TE',
        [
          {
            label: 'Proposição I',
            detail: 'TE orienta prevenção, observa sinais e comunica a equipe.',
            icon: 'MessageCircle',
          },
          {
            label: 'Proposição II',
            detail: 'Diz que o TE prescreve antiviral e decide esquema sozinho — isso é ato médico.',
            icon: 'Ban',
          },
          {
            label: 'Proposição III',
            detail: 'TE apoia educação, participa da vigilância de suspeitos e registra conforme protocolo.',
            icon: 'FileCheck',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar II ou IV por citarem viroses, mas são atos exclusivos do médico.',
            icon: 'AlertTriangle',
          },
        ],
        'I e III firmes — II e IV dão autonomia indevida',
      ),
      logicFlow(
        [
          'Julgar I, II, III e IV sobre atribuições do TE nas viroses.',
          'I verdadeira: TE orienta a prevenção, observa sinais e comunica a equipe.',
          'II falsa: prescrever antiviral e decidir esquema terapêutico é ato médico, não do TE.',
          'III verdadeira: TE apoia educação, participa da vigilância de suspeitos e registra conforme protocolo.',
          'IV falsa: diagnóstico etiológico e confirmação de caso exigem avaliação médica.',
          'Corretas apenas I e III → marcar D.',
          'Em similares: proposição que dá autonomia diagnóstica ou terapêutica ao TE cai.',
        ],
        'Portátil: I+III firmes, autonomia clínica cai',
      ),
      goldenRule(
        'Decore — viroses',
        'TE × MÉDICO',
        [
          { label: 'TE', value: 'Orienta, observa, apoia educação e vigilância.', badge: 'ok' },
          { label: 'Médico', value: 'Prescreve, define esquema e diagnostica.', badge: 'ok' },
          { label: 'Armadilha', value: 'Dar autonomia diagnóstica ou terapêutica ao TE.', badge: 'warn' },
        ],
        'Decore: laudo e receita ficam com o médico',
      ),
      dangerZone(
        'PEGADINHAS — combinação de proposições',
        [
          {
            label: 'Letra A — III e IV',
            detail: 'Mantém IV, que dá diagnóstico autônomo ao TE.',
            correct: 'IV é falsa: confirmar caso por diagnóstico etiológico exige avaliação médica.',
          },
          {
            label: 'Letra B — I, II e IV',
            detail: 'Inclui II e IV, ambas com autonomia clínica indevida.',
            correct: 'II e IV são falsas: prescrição e diagnóstico são atos exclusivos do médico.',
          },
          {
            label: 'Letra C — II e IV',
            detail: 'As duas dão autonomia clínica ao TE.',
            correct: 'Nenhuma das duas é atribuição do TE — ambas exigem avaliação médica.',
          },
          {
            label: 'Transferência',
            detail: '“Basta observar o sintoma para o TE confirmar a virose”.',
            correct: 'A confirmação diagnóstica sempre passa pela avaliação médica, mesmo com sinais evidentes.',
          },
        ],
        'Dar autonomia clínica ao TE → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780009392850-5.json',
    family: 'vf',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Primeiros socorros: manter funções vitais, avaliar segurança da cena, acionar emergência quando disponível, agir conforme protocolo e limite de atuação',
    sources: [
      { ...COFEN_ATRIBUICOES, covers: ['limites de atuação', 'protocolos institucionais'] },
      { ...PNAB, covers: ['urgência na atenção básica'] },
    ],
    slides: [
      conceptMap(
        'Primeiros socorros — afirmativas V/F',
        [
          {
            label: 'Afirmativa I',
            detail: 'Primeiros socorros mantêm funções vitais e evitam agravamento.',
            icon: 'HeartPulse',
          },
          {
            label: 'Afirmativa II',
            detail: 'Avaliar a segurança da cena antes de agir é etapa fundamental.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Afirmativa III',
            detail: 'Diz que dá para dispensar o serviço de emergência — isso é falso.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar III por parecer "já estou ajudando", mas acionar o serviço continua obrigatório.',
            icon: 'AlertTriangle',
          },
        ],
        'I, II e IV firmes — III dispensa emergência indevidamente',
      ),
      logicFlow(
        [
          'Julgar I, II, III e IV sobre primeiros socorros na Atenção Básica.',
          'I verdadeira: manter as funções vitais e evitar agravamento é objetivo central.',
          'II verdadeira: avaliar a segurança da cena antes de agir é etapa fundamental.',
          'III falsa: prestar o socorro não dispensa acionar o serviço de emergência disponível.',
          'IV verdadeira: o TE segue protocolos e respeita os limites da sua atuação.',
          'Sequência V, V, F, V → marcar A.',
          'Em similares: "dispensa acionar emergência" costuma ser a proposição falsa da banca.',
        ],
        'Portátil: cena segura + emergência sempre acionada',
      ),
      goldenRule(
        'Decore — primeiros socorros',
        'QUATRO PASSOS',
        [
          { label: 'Objetivo', value: 'Manter funções vitais e evitar agravamento.', badge: 'ok' },
          { label: 'Primeiro passo', value: 'Avaliar a segurança da cena.', badge: 'ok' },
          { label: 'Sempre', value: 'Acionar o serviço de emergência quando disponível.', badge: 'ok' },
          { label: 'Limite', value: 'Agir conforme protocolo e atuação do TE.', badge: 'warn' },
        ],
        'Decore: socorrer não substitui acionar emergência',
      ),
      dangerZone(
        'PEGADINHAS — sequência V/F',
        [
          {
            label: 'Letra B — F, F, V, V',
            detail: 'Marca I e II como falsas.',
            correct: 'I e II são verdadeiras: manter funções vitais e avaliar a cena são etapas básicas.',
          },
          {
            label: 'Letra C — V, F, V, F',
            detail: 'Marca II e IV como falsas.',
            correct: 'II e IV são verdadeiras: avaliação de cena e limite de atuação seguem válidos.',
          },
          {
            label: 'Letra D — F, V, V, F',
            detail: 'Marca I e IV como falsas.',
            correct: 'I e IV são verdadeiras: o objetivo do socorro e o limite de atuação do TE se mantêm.',
          },
          {
            label: 'Transferência',
            detail: '"Já estou ajudando, não precisa chamar o serviço de emergência".',
            correct: 'Acionar o serviço de emergência continua obrigatório mesmo durante o socorro inicial.',
          },
        ],
        'Dispensar emergência ou inverter etapa → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780009392850-6.json',
    family: 'vf',
    pedagogical_branch: 'ab_vigilancia_ads',
    guideline_snapshot:
      'Vigilância epidemiológica subsidia prevenção/controle e inclui identificação e notificação de agravos — TE colabora com registro e notificação',
    sources: [
      { ...VIGILANCIA_MS, covers: ['identificação', 'notificação', 'controle de agravos'] },
      { ...PNAB, covers: ['território', 'equipe multiprofissional'] },
    ],
    slides: [
      conceptMap(
        'Vigilância epidemiológica — afirmativas V/F',
        [
          {
            label: 'Afirmativa I',
            detail: 'Vigilância epidemiológica subsidia prevenção e controle de agravos no território.',
            icon: 'Eye',
          },
          {
            label: 'Afirmativa II',
            detail: 'Identificação e notificação de agravos fazem parte da vigilância.',
            icon: 'FileCheck',
          },
          {
            label: 'Afirmativa III',
            detail: 'Diz que a vigilância só coleta dados, sem aplicação prática — isso é falso.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar III por parecer "definição técnica", mas nega a função prática da vigilância.',
            icon: 'AlertTriangle',
          },
        ],
        'I, II e IV firmes — III esvazia a função prática',
      ),
      logicFlow(
        [
          'Julgar I, II, III e IV sobre vigilância epidemiológica na Atenção Básica.',
          'I verdadeira: a vigilância subsidia prevenção e controle de agravos no território.',
          'II verdadeira: identificação e notificação de agravos integram a vigilância.',
          'III falsa: a vigilância vai além da coleta — orienta prevenção e controle na prática.',
          'IV verdadeira: o TE colabora com registro e notificação de casos.',
          'Sequência V, V, F, V → marcar D.',
          'Em similares: "só coleta dados, sem aplicação" é armadilha clássica sobre vigilância.',
        ],
        'Portátil: vigilância orienta ação, não só coleta',
      ),
      goldenRule(
        'Decore — vigilância epidemiológica',
        'FUNÇÃO PRÁTICA',
        [
          { label: 'Subsídio', value: 'Orienta prevenção e controle de agravos.', badge: 'ok' },
          { label: 'Inclui', value: 'Identificação e notificação de casos.', badge: 'ok' },
          { label: 'TE', value: 'Colabora com registro e notificação.', badge: 'ok' },
          { label: 'Armadilha', value: 'Reduzir a vigilância a "só coleta de dados".', badge: 'warn' },
        ],
        'Decore: vigilância orienta ação prática',
      ),
      dangerZone(
        'PEGADINHAS — sequência V/F',
        [
          {
            label: 'Letra A — F, V, V, F',
            detail: 'Marca I e IV como falsas.',
            correct: 'I e IV são verdadeiras: a vigilância subsidia ação e o TE colabora com o registro.',
          },
          {
            label: 'Letra B — F, F, V, V',
            detail: 'Marca I e II como falsas.',
            correct: 'I e II são verdadeiras: subsídio à prevenção e notificação de agravos são funções reais.',
          },
          {
            label: 'Letra C — V, F, V, F',
            detail: 'Marca II e IV como falsas.',
            correct: 'II e IV são verdadeiras: notificação de agravos e colaboração do TE seguem válidas.',
          },
          {
            label: 'Transferência',
            detail: '"Vigilância é só estatística de gabinete".',
            correct: 'Na prática, a vigilância orienta ação direta de prevenção e controle no território.',
          },
        ],
        'Esvaziar a função prática da vigilância → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-processo-de-enfermagem-1780009392850-7.json',
    family: 'conceito',
    pedagogical_branch: 'ab_te_aps',
    guideline_snapshot:
      'Segurança na administração de medicamentos: os cinco certos (paciente, medicamento, dose, via, horário) + registro para rastreabilidade, sem restringir a casos especiais',
    sources: [
      { ...COFEN_ATRIBUICOES, covers: ['segurança do paciente', 'registro de enfermagem'] },
      { ...PNAB, covers: ['administração de medicamentos na AB'] },
    ],
    slides: [
      conceptMap(
        'Administração de medicamentos — segurança',
        [
          {
            label: 'Cenário',
            detail: 'Administração de medicamentos é atividade frequente e crítica do TE na AB.',
            icon: 'Pill',
          },
          {
            label: 'Conduta-alvo',
            detail: 'Conferir paciente, medicamento, dose, via e horário, com registro logo após.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Observação',
            detail: 'Acompanhar reação em qualquer usuário, não só nos casos com histórico de risco.',
            icon: 'Eye',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Restringir conferência ou observação a "casos especiais" ou "final do turno".',
            icon: 'AlertTriangle',
          },
        ],
        'Cinco certos + registro imediato > exceção',
      ),
      logicFlow(
        [
          'Comando: conduta correta na administração de medicamentos pelo TE na AB.',
          'Segurança exige conferir paciente, medicamento, dose, via e horário sempre.',
          'Registro logo após o procedimento garante rastreabilidade e continuidade do cuidado.',
          'Eliminar: registro só ao final do turno, observação só em histórico de risco, conferência só sob suspeita.',
          'Correta reúne os cinco certos com registro imediato → marcar C.',
          'Em similares: restringir segurança a "casos especiais" é o padrão de erro da banca.',
        ],
        'Portátil: os cinco certos valem para todo procedimento',
      ),
      goldenRule(
        'Decore — cinco certos',
        'CONFERÊNCIA SEMPRE',
        [
          { label: 'Cinco certos', value: 'Paciente, medicamento, dose, via e horário.', badge: 'ok' },
          { label: 'Registro', value: 'Logo após o procedimento, não postergado.', badge: 'ok' },
          { label: 'Observação', value: 'Vale para todo usuário, não só histórico de reação.', badge: 'ok' },
          { label: 'Armadilha', value: 'Reduzir a segurança a exceção ou pós-turno.', badge: 'warn' },
        ],
        'Decore: segurança é rotina, não exceção',
      ),
      dangerZone(
        'PEGADINHAS — segurança na administração',
        [
          {
            label: 'Letra A — registro ao final do turno',
            detail: 'Consolida tudo depois.',
            correct: 'A rastreabilidade exige registro logo após cada administração, não consolidado ao final.',
          },
          {
            label: 'Letra B — observação só em histórico de reação',
            detail: 'Restringe o acompanhamento a casos documentados.',
            correct: 'Qualquer usuário pode reagir; a observação não se limita a quem já tem histórico.',
          },
          {
            label: 'Letra D — conferência só sob suspeita de erro',
            detail: 'Checa dados apenas quando há dúvida.',
            correct: 'Os cinco certos devem ser conferidos em toda administração, não só sob suspeita.',
          },
          {
            label: 'Transferência',
            detail: '"Só preciso conferir tudo se acho que vou errar".',
            correct: 'A segurança do paciente exige checagem sistemática em cada administração, sempre.',
          },
        ],
        'Tratar segurança como exceção → distrator',
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
    reviewer: 'pipeline-ab-g16',
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
  console.log(`\nHandcraft g16: ${PATCHES.length} slugs escritos.`);
}

main();
