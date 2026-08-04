/**
 * Handcraft golden-v1 — atencao-basica-saude-da-familia-g22 (3 slugs, lote final).
 * Run: npx tsx scripts/handcraft-atencao-basica-saude-da-familia-g22.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'atencao-basica-saude-da-familia-g22';
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

const PNPS = {
  id: 'pnps-2446-2014',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria GM/MS nº 2.446/2014 — Política Nacional de Promoção da Saúde',
  year: 2014,
  url: 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2014/prt2446_11_11_2014.html',
};

const ANVISA_IRAS_CIRURGICA = {
  id: 'anvisa-iras-cirurgica-2017',
  tier: 'A' as const,
  issuer: 'Anvisa',
  title: 'Medidas de Prevenção de Infecção Relacionada à Assistência à Saúde — Sítio Cirúrgico',
  year: 2017,
  url: 'https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/publicacoes/medidas-de-prevencao-de-infeccao-relacionada-a-assistencia-a-saude.pdf',
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
    file: 'vunesp-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563685104-4.json',
    family: 'conceito',
    pedagogical_branch: 'ab_acs_territorio',
    guideline_snapshot:
      'Trabalho em equipe na ESF: médico, técnico de enfermagem e ACS atuam juntos no cuidado; a base desse trabalho é a colaboração entre profissionais e usuários',
    sources: [{ ...PNAB, covers: ['trabalho em equipe', 'atributos da atenção básica', 'agente comunitário de saúde'] }],
    slides: [
      conceptMap(
        'Trabalho em equipe na ESF — o que sustenta a parceria',
        [
          {
            label: 'Cenário',
            detail: 'Paciente recém-diagnosticado diabético é acompanhado pelo médico, pelo técnico de enfermagem e pelo agente comunitário de saúde.',
            icon: 'Users',
          },
          {
            label: 'O que cada um faz',
            detail: 'Comunicam exames, orientam autocuidado e viabilizam recursos da comunidade para o enfrentamento da situação.',
            icon: 'HeartHandshake',
          },
          {
            label: 'Ideia-chave',
            detail: 'Para o trabalho em equipe ocorrer de fato, é preciso colaboração entre profissionais e usuários dos serviços.',
            icon: 'Handshake',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar "colaboração" por palavras parecidas, mas de sentido diferente (sororidade, identificação, conformidade, gratidão).',
            icon: 'AlertTriangle',
          },
        ],
        'Equipe + família + comunidade = trabalho colaborativo',
      ),
      logicFlow(
        [
          'Pergunta pede o que é imprescindível para o trabalho em equipe ocorrer de fato entre profissionais e usuários.',
          'Eliminar: "sororidade" é solidariedade entre mulheres, não descreve a parceria de uma equipe multiprofissional.',
          'Eliminar: "identificação" é reconhecer-se com algo ou alguém, não a ação conjunta de trabalhar junto.',
          'Eliminar: "conformidade" é aceitar ou concordar passivamente, o oposto de construir o cuidado em conjunto.',
          'Eliminar: "gratidão" é sentimento de reconhecimento, não descreve o processo de atuação conjunta da equipe.',
          'Correto: o trabalho em equipe depende de colaboração entre profissionais e usuários → marcar C.',
          'Em similares: quando a pergunta pedir o que sustenta o trabalho em equipe, busque a palavra que significa "agir junto", não sentimento nem aceitação passiva.',
        ],
        'Portátil: trabalho em equipe = colaboração, não sentimento',
      ),
      goldenRule(
        'Decore — o que sustenta o trabalho em equipe',
        'COLABORAÇÃO ENTRE PROFISSIONAIS E USUÁRIOS',
        [
          { label: 'Base do trabalho em equipe', value: 'Colaboração — agir junto, não sentimento isolado.', badge: 'ok' },
          { label: 'Quem participa', value: 'Profissionais de saúde e usuários dos serviços de saúde.', badge: 'ok' },
          { label: 'Objetivo', value: 'Promoção e recuperação da saúde com apoio da comunidade.', badge: 'ok' },
          { label: 'Armadilha', value: 'Confundir colaboração com sororidade, identificação, conformidade ou gratidão.', badge: 'warn' },
        ],
        'Decore: colaboração é ação conjunta, não sentimento',
      ),
      dangerZone(
        'PEGADINHAS — o que sustenta o trabalho em equipe',
        [
          {
            label: 'Letra A — sororidade',
            detail: 'Descreve solidariedade entre mulheres.',
            correct: 'Sororidade é laço de solidariedade entre mulheres, não a colaboração multiprofissional que sustenta o trabalho em equipe.',
          },
          {
            label: 'Letra B — identificação',
            detail: 'Descreve reconhecer-se com algo ou alguém.',
            correct: 'Identificação é reconhecer-se com algo, não o ato de colaborar ativamente no cuidado.',
          },
          {
            label: 'Letra D — conformidade',
            detail: 'Descreve aceitação passiva.',
            correct: 'Conformidade é aceitar passivamente, o oposto de colaborar construindo o cuidado em conjunto.',
          },
          {
            label: 'Letra E — gratidão',
            detail: 'Descreve sentimento de reconhecimento.',
            correct: 'Gratidão é sentimento de reconhecimento, não o processo de trabalho conjunto entre equipe e usuários.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer palavra positiva sobre a relação com o paciente serve de resposta".',
            correct: 'Em similares, busque o termo que signifique ação conjunta (colaboração), não sentimentos ou posturas passivas.',
          },
        ],
        'Palavra parecida mas de sentido diferente de "colaboração" → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-enfermagem-em-centro-cirurgico-1777103852550-0.json',
    family: 'conceito',
    pedagogical_branch: 'ab_esf_composicao',
    guideline_snapshot:
      'Tricotomia pré-operatória: evitar de rotina; se indicada, realizar no hospital, no período mais próximo possível do procedimento cirúrgico, nunca no domicílio',
    sources: [{ ...ANVISA_IRAS_CIRURGICA, covers: ['tricotomia', 'prevenção de infecção de sítio cirúrgico'] }],
    slides: [
      conceptMap(
        'Tricotomia pré-operatória — quando e onde fazer',
        [
          {
            label: 'Situação',
            detail: 'Paciente da equipe de saúde da família será submetido a herniorrafia umbilical e tem dúvida sobre remoção de pelos do abdome.',
            icon: 'HelpCircle',
          },
          {
            label: 'Recomendação atual',
            detail: 'Tricotomia só se indicada, realizada no período mais próximo possível do horário da cirurgia.',
            icon: 'Clock',
          },
          {
            label: 'Onde fazer',
            detail: 'No hospital — nunca no domicílio, seja na noite anterior ou na manhã da internação.',
            icon: 'Building2',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Alternativas que colocam a tricotomia em casa, distante do horário da cirurgia.',
            icon: 'AlertTriangle',
          },
        ],
        'Tricotomia: só se indicada, no hospital, o mais próximo da cirurgia',
      ),
      logicFlow(
        [
          'Pergunta pede a orientação correta do técnico de enfermagem sobre remoção de pelos antes da herniorrafia umbilical.',
          'Eliminar: fazer em casa, na noite anterior, com barbeador — fora do hospital e distante do horário da cirurgia.',
          'Eliminar: fazer em casa, durante o banho da manhã, com barbeador — ainda no domicílio, contraria a recomendação de realizar no hospital.',
          'Eliminar: usar creme depilatório em casa na noite anterior — muda a técnica, mas mantém o erro do local (domicílio) e do momento (véspera).',
          'Eliminar: prazo intermediário, em casa ou hospital, com barbeador ou creme — mistura local certo e errado, ainda distante do "mais próximo possível".',
          'Correto: tricotomia, se indicada, realizada no hospital, no período mais próximo possível do procedimento cirúrgico → marcar D.',
          'Em similares: cirurgia eletiva pede tricotomia só se necessária, feita no hospital, o mais perto possível do horário da cirurgia — nunca em casa.',
        ],
        'Portátil: tricotomia = se indicada, no hospital, imediatamente antes',
      ),
      goldenRule(
        'Decore — tricotomia pré-operatória',
        'SE INDICADA, NO HOSPITAL, O MAIS PRÓXIMO DA CIRURGIA',
        [
          { label: 'Onde', value: 'No hospital, nunca no domicílio.', badge: 'ok' },
          { label: 'Quando', value: 'No período mais próximo possível do horário do procedimento cirúrgico.', badge: 'ok' },
          { label: 'Por quê', value: 'Reduz o tempo entre microlesões da pele e a incisão, prevenindo infecção do sítio cirúrgico.', badge: 'ok' },
          { label: 'Armadilha', value: 'Alternativas que deslocam a tricotomia para casa ou para a véspera da cirurgia.', badge: 'warn' },
        ],
        'Decore: tricotomia no hospital, na hora certa, evita infecção',
      ),
      dangerZone(
        'PEGADINHAS — local e momento da tricotomia',
        [
          {
            label: 'Letra A — barbeador em casa, na noite anterior',
            detail: 'Coloca o procedimento no domicílio, na véspera.',
            correct: 'A tricotomia deve ser feita no hospital, não em casa na noite anterior à internação.',
          },
          {
            label: 'Letra B — barbeador em casa, na manhã, antes de saír',
            detail: 'Ainda descreve o procedimento no domicílio.',
            correct: 'Continua sendo feita no domicílio; a recomendação é realizar no hospital, não em casa antes de saír.',
          },
          {
            label: 'Letra C — creme depilatório em casa, na noite anterior',
            detail: 'Troca a técnica, mas mantém o local errado.',
            correct: 'Troca a técnica de remoção, mas mantém o erro do local: o procedimento deve ocorrer no hospital, não em casa.',
          },
          {
            label: 'Letra E — prazo intermediário, em casa ou hospital',
            detail: 'Mistura local certo e errado, e o prazo é longo.',
            correct: 'Mistura locais e prazos que não seguem a recomendação de realizar no hospital, o mais próximo possível da cirurgia.',
          },
          {
            label: 'Transferência',
            detail: '"Qualquer técnica de remoção de pelos serve, desde que feita antes da cirurgia".',
            correct: 'Em similares, o que importa não é só a técnica, mas o local (hospital) e o momento (o mais próximo possível do procedimento).',
          },
        ],
        'Tricotomia em casa ou distante do horário da cirurgia → distrator',
      ),
    ],
  },
  {
    file: 'vunesp-enfermagem-processo-de-enfermagem-1780001742844-3.json',
    family: 'conceito',
    pedagogical_branch: 'ab_generico',
    guideline_snapshot:
      'Promoção da saúde (PNPS): ações voltadas para qualidade de vida e autonomia das pessoas, distintas de ações de prevenção secundária ou tratamento ligadas a uma doença específica',
    sources: [{ ...PNPS, covers: ['promoção da saúde', 'ações da atenção básica', 'níveis de prevenção'] }],
    slides: [
      conceptMap(
        'Promoção da saúde x prevenção de doenças — ache a ação certa',
        [
          {
            label: 'Cenário',
            detail: 'Equipe da atenção básica planeja atividades de promoção da saúde; cada membro sugere uma ação.',
            icon: 'CalendarCheck',
          },
          {
            label: 'O que é promoção da saúde',
            detail: 'Ações voltadas para qualidade de vida e autonomia das pessoas, sem foco numa doença específica.',
            icon: 'Sparkles',
          },
          {
            label: 'O que NÃO é promoção',
            detail: 'Monitorar doença já diagnosticada, triar sintomáticos, coletar exames periódicos ou orientar medicamentos — ações ligadas a uma doença específica.',
            icon: 'ClipboardX',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir ações de vigilância ou tratamento de doença específica com promoção da saúde.',
            icon: 'AlertTriangle',
          },
        ],
        'Promoção da saúde: qualidade de vida, não doença específica',
      ),
      logicFlow(
        [
          'Pergunta pede a ação de promoção da saúde que o técnico de enfermagem pode propor na atenção básica.',
          'Eliminar: monitorar casos de doença crônica já diagnosticada é ação de acompanhamento clínico, não de promoção da saúde.',
          'Eliminar: realizar triagem de pessoas sintomáticas é ação de prevenção secundária (rastreamento), ligada a uma doença específica.',
          'Eliminar: coletar exames periódicos para detecção precoce também é prevenção secundária, focada em achar doença, não em promover saúde.',
          'Eliminar: orientar sobre uso correto de medicamentos prescritos é ação de tratamento, ligada a uma terapêutica já definida.',
          'Correto: melhorar a qualidade de vida da pessoa com sequela é ação de promoção da saúde, voltada para autonomia e bem-estar → marcar C.',
          'Em similares: promoção da saúde busca qualidade de vida e autonomia; ações amarradas a uma doença específica pertencem à prevenção ou ao tratamento.',
        ],
        'Portátil: promoção = qualidade de vida; doença específica = prevenção/tratamento',
      ),
      goldenRule(
        'Decore — o que é ação de promoção da saúde',
        'QUALIDADE DE VIDA E AUTONOMIA, NÃO DOENÇA ESPECÍFICA',
        [
          { label: 'Promoção da saúde', value: 'Ações voltadas para qualidade de vida, autonomia e bem-estar das pessoas.', badge: 'ok' },
          { label: 'Prevenção secundária', value: 'Triagem, rastreamento e exames para detecção precoce de doença.', badge: 'warn' },
          { label: 'Tratamento', value: 'Orientação e acompanhamento ligados a uma terapêutica já definida.', badge: 'warn' },
          { label: 'Armadilha', value: 'Achar que toda ação de saúde na atenção básica é promoção da saúde.', badge: 'warn' },
        ],
        'Decore: promoção da saúde não tem doença no centro da ação',
      ),
      dangerZone(
        'PEGADINHAS — ação de promoção da saúde',
        [
          {
            label: 'Letra A — monitorar doença crônica já diagnosticada',
            detail: 'Foca no acompanhamento de uma doença.',
            correct: 'Monitorar doença já diagnosticada é acompanhamento clínico, não ação de promoção da saúde.',
          },
          {
            label: 'Letra B — triagem de sintomáticos',
            detail: 'Foca em rastrear uma doença específica.',
            correct: 'Triagem de pessoas sintomáticas é rastreamento (prevenção secundária), ligado a uma doença, não promoção da saúde.',
          },
          {
            label: 'Letra D — coleta de exames periódicos',
            detail: 'Foca em detectar doença precocemente.',
            correct: 'Coletar exames para detecção precoce também é prevenção secundária, focada em achar doença, não em promover saúde.',
          },
          {
            label: 'Letra E — orientar uso de medicamentos',
            detail: 'Foca numa terapêutica já definida.',
            correct: 'Orientar sobre medicamentos prescritos é ação de tratamento, não de promoção da saúde.',
          },
          {
            label: 'Transferência',
            detail: '"Toda atividade de saúde na atenção básica é promoção da saúde".',
            correct: 'Em similares, separe ações de promoção (qualidade de vida/autonomia) das de prevenção ou tratamento de doença específica.',
          },
        ],
        'Ação amarrada a uma doença específica → não é promoção da saúde',
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
    reviewer: 'pipeline-ab-g22',
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
  console.log(`\nHandcraft g22: ${PATCHES.length} slugs escritos.`);
}

main();
