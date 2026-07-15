#!/usr/bin/env node
/**
 * Gera scripts/sae-handcraft-specs.generated.ts a partir do dump de questões.
 * Uso: node scripts/generate-sae-handcraft-specs.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SLUG_BRANCH = JSON.parse(readFileSync(join(process.cwd(), 'scripts/_sae-branch-map.json'), 'utf8'));

const COMPLETO = join(process.cwd(), 'data/catalog-migration/processo-de-enfermagem-completo/questions');
const dump = readdirSync(COMPLETO)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => {
    const j = JSON.parse(readFileSync(join(COMPLETO, f), 'utf8'));
    return {
      slug: f.replace(/\.json$/, ''),
      meta: j.meta,
      instruction: j.question_data.instruction,
      options: j.question_data.options,
    };
  });

function firstSentence(text) {
  const t = text.replace(/\s+/g, ' ').trim();
  const m = t.match(/^[^.?!]{20,160}[.?!]/);
  return m ? m[0].trim() : t.slice(0, 120);
}

function paraphraseOption(text, max = 60) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function isExceto(instruction) {
  return /exceto|incorreta|afirmativa falsa/i.test(instruction);
}

function isCertoErrado(options) {
  return (
    options.length === 2 &&
    options.some((o) => /certo/i.test(o.text)) &&
    options.some((o) => /errado/i.test(o.text))
  );
}

function isVfSequence(instruction, options) {
  return (
    /marque\s+v|verdadeiras?\s+e\s+falsas?|sequência está correta/i.test(instruction) &&
    options.every((o) => /[VF]\s*[-−→]/i.test(o.text))
  );
}

function parseVfItems(instruction) {
  const items = [];
  const re = /\(__\)\s*([^(_]+?)(?=\s*\(__\)|A sequência|$)/gis;
  let m;
  while ((m = re.exec(instruction)) !== null) {
    items.push(m[1].replace(/\s+/g, ' ').trim());
  }
  return items;
}

function judgeVfItem(text) {
  const t = text.toLowerCase();
  if (/alterado livremente|facultativo|não precisam conter a identificação|a lápis|rasuras desde|registrar cuidado não|outro profissional registre|uso restrito.*não podendo o próprio paciente|corretivo líquido|sem explicá-los ao paciente/i.test(t)) {
    return false;
  }
  if (/objetivas, claras|momento em que o cuidado|comunicação entre a equipe|carimbo|assinatura|legíveis|cronológicas|veracidade|identificação do profissional|prontuário.*formalmente|membros da equipe/i.test(t)) {
    return true;
  }
  if (/não é essencial|opinião pessoal/i.test(t)) return false;
  if (/data e hora|descrição detalhada|assinatura do profissional/i.test(t)) return true;
  return null;
}

function buildVfLogic(instruction, options, correct) {
  const items = parseVfItems(instruction);
  const steps = [
    'Ler o comando: julgar cada afirmativa V ou F antes de montar a sequência.',
    `Tema: ${firstSentence(instruction)}`,
  ];
  items.forEach((item, i) => {
    const j = judgeVfItem(item);
    const verdict = j === true ? 'V' : j === false ? 'F' : '?';
    const short = item.length > 70 ? `${item.slice(0, 67)}…` : item;
    steps.push(`Item ${i + 1}: “${short}” → ${verdict} (${j === true ? 'alinhado à COFEN 358' : j === false ? 'viola integridade/identificação/veracidade' : 'reler enunciado'}).`);
  });
  const seq = items.map((item) => (judgeVfItem(item) ? 'V' : 'F')).join(' − ');
  steps.push(`Montar sequência: ${seq}.`);
  for (const o of options.filter((x) => !x.is_correct)) {
    steps.push(`Eliminar letra ${o.id}: sequência não reflete o julgamento V/F item a item.`);
  }
  steps.push(`Marcar letra ${correct.id}: única sequência coerente com Res. COFEN 358/2009.`);
  steps.push('Fixação: em V/F de registro — teste identificação, integridade, veracidade e cronologia antes de escolher a letra.');
  return steps;
}

function buildCertoErradoLogic(instruction, options, correct) {
  const statement = instruction.split('\n').pop()?.trim() ?? instruction;
  const steps = [
    'Formato Certo/Errado: julgar a afirmativa isolada contra COFEN 358/2009 e Lei 7.498/86.',
    `Núcleo: ${paraphraseOption(statement, 100)}`,
  ];
  if (/certo/i.test(correct.text)) {
    steps.push('Afirmativa alinhada à norma de registro e SAE → marcar Certo.');
  } else {
    steps.push('Afirmativa contraria registro legal, privativa ou acesso ao prontuário → marcar Errado.');
  }
  steps.push(`Resposta: ${correct.text}.`);
  steps.push('Fixação: em C/E de SAE — privativa do enfermeiro (diagnóstico + evolução) e prontuário compartilhado são os eixos mais cobrados.');
  return steps;
}

function isRomanVf(instruction) {
  return (
    /I\s*[-–]/.test(instruction) &&
    /II\s*[-–]/.test(instruction) &&
    /(III|IV)\s*[-–]/.test(instruction)
  );
}

function shortReasonForWrong(o, correctId) {
  const t = o.text.toLowerCase();
  if (/salário|aumento/i.test(t)) return 'motivo financeiro não fundamenta responsabilidade legal';
  if (/opcional|facultativ/i.test(t)) return 'registro não é opcional na SAE';
  if (/não são responsáveis|não é necessário/i.test(t)) return 'nega dever legal de documentar';
  if (/apenas cirúrgic|somente.*cirúrgic/i.test(t)) return 'restringe anotação a um tipo de cuidado';
  if (/apenas queixas|ignorando outros/i.test(t)) return 'anotação não se limita à queixa';
  if (/todas as anotações devem ser iguais/i.test(t)) return 'contexto muda o formato do registro';
  if (/lápis/i.test(t)) return 'integridade exige registro permanente';
  if (/incompletas|pouco claras/i.test(t)) return 'norma exige clareza e completude';
  if (/não é necessário realizar anotações/i.test(t)) return 'anotação é obrigatória após o cuidado';
  if (/somente as informações solicitadas pelo médico/i.test(t)) return 'técnico registra observações relevantes, não só ordem médica';
  if (/paciente está mal|termos genéricos/i.test(t)) return 'exige linguagem técnica objetiva';
  if (/linguagem informal/i.test(t)) return 'registro profissional exige linguagem técnica';
  if (/deixar de assinar|preservar a privacidade/i.test(t)) return 'identificação é obrigatória';
  if (/sigiloso.*não são|não são de caráter sigiloso/i.test(t)) return 'prontuário é sigiloso e pertence ao paciente';
  if (/sem a permissão por parte do paciente/i.test(t)) return 'acesso exige consentimento do titular';
  if (/familiares.*autorizado pela equipe/i.test(t)) return 'sigilo limita revelação a terceiros';
  if (/não se configuram como ato ilícito/i.test(t)) return 'divulgação indevida pode ser ilícita';
  if (/fonte de comunicação|faturamento|pesquisa/i.test(t) && o.is_correct === false) return 'funções do prontuário mal descritas';
  if (/exclusivo da equipe médica/i.test(t)) return 'prontuário é multiprofissional';
  if (/não há a necessidade de registro diário da equipe/i.test(t)) return 'enfermagem deve registrar cuidados';
  if (/não podem.*pesquisas/i.test(t)) return 'pesquisa é função legítima com ética';
  if (/25%|porcento/i.test(t)) return 'percentual inventado sem base normativa';
  if (/exclusivo do enfermeiro.*instrumento metodológico/i.test(t)) return 'mistura PE com monopólio do prontuário';
  if (/apenas os registros realizados pelos enfermeiros/i.test(t)) return 'técnico também registra cuidados';
  if (/secundários à precisão/i.test(t)) return 'autenticidade legal é tão vital quanto precisão';
  if (/elaboração da prescrição/i.test(t)) return 'prescrição é privativa do enfermeiro';
  if (/diagnósticos de enfermagem/i.test(t) && /técnicos/i.test(t)) return 'diagnóstico não é do técnico';
  if (/orientação e supervisão do trabalho de auxiliares/i.test(t)) return 'supervisão de auxiliar é do enfermeiro';
  if (/julgamento clínico|prescrição das necessidades/i.test(t)) return 'julgamento clínico é privativa';
  if (/avaliação dos resultados alcançados/i.test(t)) return 'avaliação de enfermagem é do enfermeiro';
  if (/tomada de decisão terapêutica/i.test(t)) return 'decisão terapêutica não cabe ao técnico';
  if (/participa da etapa de.*avaliação/i.test(t)) return 'técnico implementa; avaliação privativa é do enfermeiro';
  if (/pontuais/i.test(t) && /processados/i.test(t)) return 'anotação é dado pontual, não análise reflexiva';
  if (/24 horas|período de 24/i.test(t)) return 'anotação não se define por janela de 24h';
  if (/reflexão e análise/i.test(t)) return 'camada reflexiva = evolução, não anotação';
  if (/hígido|híbrido|hídrico/i.test(t)) return 'estado geral — hígido = paciente sadio';
  if (/números pares|ímpares|romanos|letras/i.test(t)) return 'escala numérica de dor usa algarismos arábicos';
  if (/prognóstico/i.test(t)) return 'prognóstico ≠ evolução da resposta ao plano';
  if (/acrômio|olécrano/i.test(t)) return 'referências anatômicas do braço';
  if (/ageusia/i.test(t)) return 'perda do paladar — não olfato';
  if (/disgeusia/i.test(t)) return 'alteração do paladar';
  if (/amaurose/i.test(t)) return 'perda da visão';
  if (/anosmia/i.test(t)) return 'perda ou diminuição do olfato';
  if (/opinião pessoal/i.test(t)) return 'subjetividade não entra no registro técnico';
  if (/nome completo do paciente/i.test(t)) return 'identificação do paciente é essencial';
  if (/data e hora/i.test(t)) return 'marca temporal obrigatória';
  if (/descrição detalhada/i.test(t)) return 'objetividade do procedimento é exigida';
  if (/assinatura do profissional/i.test(t)) return 'autoria deve constar no documento';
  if (/facilitação da expressão|apoio, tranquilização|ensinar.*alívio/i.test(t)) return 'intervenções de conforto na dor';
  if (/diagnóstico diferencial/i.test(t)) return 'processo de exclusão diagnóstica';
  if (/sem explicá-los ao paciente/i.test(t)) return 'viola comunicação e direito do paciente';
  return `critério da letra ${o.id} não fecha com COFEN 358`;
}

function buildMcLogic(instruction, options, correct, exceto) {
  const steps = [
    exceto
      ? 'Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.'
      : 'Ler o comando e fixar o eixo SAE/registro antes de testar letras.',
    `Enquadramento: ${firstSentence(instruction)}`,
  ];
  for (const o of options.filter((x) => !x.is_correct)) {
    if (exceto) {
      steps.push(`Letra ${o.id}: ${shortReasonForWrong(o, correct.id)} — distrator válido em EXCETO.`);
    } else {
      steps.push(`Eliminar ${o.id}: ${shortReasonForWrong(o, correct.id)}.`);
    }
  }
  if (exceto) {
    steps.push(`Letra ${correct.id}: única exceção — extrapola competência ou viola norma.`);
  } else {
    steps.push(`Letra ${correct.id}: única alternativa alinhada ao comando e à COFEN 358.`);
  }
  steps.push(`Marcar letra ${correct.id}.`);
  steps.push(
    exceto
      ? 'Fixação: em EXCETO de anotação — técnico registra cuidado; evolução/diagnóstico/anamnese completa é privativa ou exceção.'
      : 'Fixação: em similares — separe anotação (cuidado executado) de evolução/diagnóstico (enfermeiro).',
  );
  return steps;
}

function buildDanger(instruction, options, correct, exceto) {
  const items = [];
  for (const o of options) {
    if (o.id === correct.id) {
      if (exceto) {
        items.push({
          label: `Letra ${o.id} — exceção (gabarito)`,
          detail: paraphraseOption(o.text, 80),
          correct: `INCORRETA na prova: ${shortReasonForWrong(o, correct.id)} — esta é a exceção pedida.`,
        });
      }
      continue;
    }
    if (exceto) {
      items.push({
        label: `Letra ${o.id} — conduta correta`,
        detail: paraphraseOption(o.text, 80),
        correct: `Em EXCETO, ${o.id} é conduta correta: ${shortReasonForWrong(o, correct.id).replace(/^critério.*$/, 'atende norma de registro/SAE')}.`,
      });
    } else {
      items.push({
        label: `Letra ${o.id}`,
        detail: paraphraseOption(o.text, 80),
        correct: `${shortReasonForWrong(o, correct.id)} — por isso não é o gabarito (${correct.id}).`,
      });
    }
  }
  const transferPool = [
    {
      label: 'Transferência — camadas do registro',
      detail: 'Misturar anotação com evolução ou diagnóstico.',
      correct: 'Anotação registra o executado; evolução/diagnóstico é privativa do enfermeiro.',
    },
    {
      label: 'Transferência — momento do registro',
      detail: 'Adiar a anotação para o fim do plantão ou registrar só intercorrências.',
      correct: 'Registro deve ser contemporâneo ao cuidado — não postergar nem omitir ações executadas.',
    },
    {
      label: 'Transferência — competência privativa',
      detail: 'Técnico prescrever diagnóstico ou evoluir como enfermeiro.',
      correct: 'Diagnóstico, prescrição e evolução/avaliação são privativas do enfermeiro (Lei 7.498/86).',
    },
  ];
  let ti = 0;
  while (items.length < 3 && ti < transferPool.length) {
    items.push(transferPool[ti++]);
  }
  return items;
}

function branchConcept(branch, instruction) {
  const base = { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' };
  if (branch === 'sae_documentacao') {
    return {
      slide_title: 'SAE — registro e prontuário',
      chip_label: 'DOCUMENTAÇÃO',
      meta: base,
      items: [
        { label: 'Enquadramento', detail: firstSentence(instruction), icon: 'Target' },
        { label: 'Anotação de enfermagem', detail: 'Registro factual do cuidado executado pela equipe — integra o prontuário.', icon: 'FileText' },
        { label: 'Integridade', detail: 'Legível, cronológico, sem rasura indevida ou registro fictício.', icon: 'ShieldCheck' },
        { label: 'Identificação', detail: 'Carimbo, nome legível e assinatura — obrigatórios no documento firmado.', icon: 'Stamp' },
        { label: 'Veracidade', detail: 'Registrar no momento do cuidado; vedado anotar o que não foi feito.', icon: 'CheckCircle' },
        { label: 'COFEN 358/2009', detail: 'Norma central do registro de enfermagem no Brasil.', icon: 'Scale' },
      ],
      footer_rule: 'Registro = continuidade do cuidado + respaldo legal',
    };
  }
  if (branch === 'sae_generico') {
    return {
      slide_title: 'PE — tema ancorado no enunciado',
      chip_label: 'SAE',
      meta: base,
      items: [
        { label: 'Enquadramento', detail: firstSentence(instruction), icon: 'Target' },
        { label: 'Implementação', detail: 'Etapa em que o técnico executa o cuidado e registra o feito.', icon: 'Syringe' },
        { label: 'Anotação', detail: 'Registro factual do procedimento no prontuário — COFEN 358.', icon: 'FileText' },
        { label: '5 etapas', detail: 'Coleta → diagnóstico → planejamento → implementação → avaliação.', icon: 'GitBranch' },
        { label: 'Privativa', detail: 'Diagnóstico e evolução — enfermeiro; técnico implementa e anota.', icon: 'UserCheck' },
        { label: 'Segurança', detail: 'Técnica correta + registro = continuidade e segurança do paciente.', icon: 'ShieldCheck' },
      ],
      footer_rule: 'Procedimento técnico integra a etapa de implementação do PE',
    };
  }
  if (branch === 'sae_etapas') {
    return {
      slide_title: 'SAE — etapas e competências',
      chip_label: 'ETAPAS SAE',
      meta: base,
      items: [
        { label: 'Enquadramento', detail: firstSentence(instruction), icon: 'Target' },
        { label: '5 etapas', detail: 'Coleta → diagnóstico → planejamento → implementação → avaliação.', icon: 'GitBranch' },
        { label: 'NANDA-NIC-NOC', detail: 'Diagnóstico padronizado, intervenções e resultados mensuráveis.', icon: 'Layers' },
        { label: 'Privativa do enfermeiro', detail: 'Diagnóstico, prescrição e evolução/avaliação de enfermagem.', icon: 'UserCheck' },
        { label: 'Técnico/auxiliar', detail: 'Implementação e anotação de cuidados sob supervisão — Art. 5º COFEN 358.', icon: 'Users' },
        { label: 'Processo cíclico', detail: 'SAE é contínuo — avaliação retroalimenta nova coleta.', icon: 'RefreshCw' },
      ],
      footer_rule: 'DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro',
    };
  }
  return {
    slide_title: 'SAE — pegadinha EXCETO',
    chip_label: 'EXCETO',
    meta: base,
    items: [
      { label: 'Comando', detail: firstSentence(instruction), icon: 'Target' },
      { label: 'Lógica EXCETO', detail: 'Três alternativas corretas + uma exceção — não inverta o raciocínio.', icon: 'AlertTriangle' },
      { label: 'Anotação × evolução', detail: 'Técnico anota cuidado; evolução reflexiva é camada distinta.', icon: 'FileText' },
      { label: 'Privativa', detail: 'Diagnóstico, prescrição e evolução — enfermeiro (Lei 7.498/86).', icon: 'UserCheck' },
      { label: 'Art. 5º COFEN 358', detail: 'Técnico/auxiliar executam o que lhes couber, supervisionados.', icon: 'Scale' },
    ],
    footer_rule: 'EXCETO: valide cada letra como conduta correta antes de achar a exceção',
  };
}

function branchGolden(branch, instruction) {
  const base = { meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' } };
  if (branch === 'sae_documentacao') {
    return {
      ...base,
      slide_title: 'Referência — registro de enfermagem',
      chip_label: 'NORMA',
      content: 'ANOTAÇÃO DE ENFERMAGEM — COFEN 358/2009',
      rows: [
        { label: 'Definição', value: 'Registro das ações executadas pela equipe de enfermagem', badge: 'info' },
        { label: 'Identificação', value: 'Carimbo, nome legível e assinatura obrigatórios', badge: 'hot' },
        { label: 'Integridade', value: 'Permanente, legível, sem rasura indevida', badge: 'warn' },
        { label: 'Veracidade', value: 'Contemporâneo ao cuidado — sem registro fictício', badge: 'ok' },
        { label: 'Prontuário', value: 'Documento compartilhado da equipe multiprofissional', badge: 'info' },
        { label: 'Privativa', value: 'Diagnóstico + evolução/avaliação → enfermeiro', badge: 'hot' },
      ],
      footer_rule: 'Mnemônico DEA: Diagnóstico + Evolução/Avaliação = Enfermeiro',
    };
  }
  if (branch === 'sae_generico') {
    return {
      ...base,
      slide_title: 'Implementação × registro',
      chip_label: 'SAE',
      content: 'CUIDADO TÉCNICO NO PROCESSO DE ENFERMAGEM',
      rows: [
        { label: 'Implementação', value: 'Execução do cuidado prescrito/planejado', badge: 'ok' },
        { label: 'Anotação', value: 'Registro do que foi feito — prontuário', badge: 'info' },
        { label: 'Técnico', value: 'Executa e anota sob supervisão', badge: 'warn' },
        { label: 'Enfermeiro', value: 'Diagnostica, prescreve e avalia', badge: 'hot' },
        { label: 'COFEN 358', value: 'Base do registro de enfermagem', badge: 'info' },
      ],
      footer_rule: 'Técnica correta + registro = PE completo na prática',
    };
  }
  if (branch === 'sae_etapas') {
    return {
      ...base,
      slide_title: 'SAE — 5 etapas integradas',
      chip_label: 'ETAPAS',
      content: 'PROCESSO DE ENFERMAGEM — COFEN 358/2009',
      rows: [
        { label: '1 — Coleta', value: 'Anamnese e dados objetivos/subjetivos', badge: 'info' },
        { label: '2 — Diagnóstico', value: 'Julgamento clínico NANDA — privativo do enfermeiro', badge: 'hot' },
        { label: '3 — Planejamento', value: 'Prescrição de enfermagem (NIC) com metas', badge: 'info' },
        { label: '4 — Implementação', value: 'Execução e anotação de cuidados', badge: 'ok' },
        { label: '5 — Avaliação', value: 'Comparar com NOC — evolução privativa', badge: 'hot' },
        { label: 'Técnico', value: 'Implementa e anota — não prescreve diagnóstico', badge: 'warn' },
      ],
      footer_rule: 'Técnico = implementação + anotação | Enfermeiro = diagnóstico + evolução',
    };
  }
  return {
    ...base,
    slide_title: 'EXCETO — privativa × técnico',
    chip_label: 'PEGADINHA',
    content: 'ANOTAÇÃO DO TÉCNICO — O QUE NÃO ENTRA',
    rows: [
      { label: 'Pode anotar', value: 'Cuidados executados, sinais observados, intercorrências', badge: 'ok' },
      { label: 'Não anota', value: 'Evolução reflexiva, diagnóstico, anamnese completa formal', badge: 'hot' },
      { label: 'Enfermeiro', value: 'Diagnóstico, prescrição, evolução/avaliação', badge: 'warn' },
      { label: 'Lei 7.498/86', value: 'Art. 11 — privativas do enfermeiro', badge: 'info' },
      { label: 'EXCETO na prova', value: 'Três corretas + uma que extrapola competência do técnico', badge: 'hot' },
    ],
    footer_rule: 'Na dúvida: se exige julgamento clínico privativo → é exceção na anotação do técnico',
  };
}

const specs = {};
for (const q of dump) {
  const branch = SLUG_BRANCH[q.slug] ?? 'sae_generico';
  const correct = q.options.find((o) => o.is_correct);
  const exceto = isExceto(q.instruction);
  const vf = isVfSequence(q.instruction, q.options);
  const ce = isCertoErrado(q.options);

  let family = 'conceito';
  if (isRomanVf(q.instruction) && /correto|verifica-se|está\(ão\)/i.test(q.instruction)) family = 'vf';
  else if (vf) family = 'conceito';
  else if (ce) family = 'certo_errado';
  else if (exceto) family = 'certo_errado';

  let logic_steps;
  if (vf) logic_steps = buildVfLogic(q.instruction, q.options, correct);
  else if (ce) logic_steps = buildCertoErradoLogic(q.instruction, q.options, correct);
  else logic_steps = buildMcLogic(q.instruction, q.options, correct, exceto);

  const danger_items = buildDanger(q.instruction, q.options, correct, exceto);

  specs[q.slug] = {
    branch,
    family,
    guideline: branch === 'sae_documentacao'
      ? 'Registro de enfermagem — COFEN 358/2009'
      : branch === 'sae_etapas'
        ? '5 etapas SAE + competências por categoria'
        : 'EXCETO — privativa enfermeiro × anotação técnico',
    concept_map: branchConcept(branch, q.instruction),
    golden_rule: branchGolden(branch, q.instruction),
    logic_flow: {
      slide_title: 'Raciocínio clínico — passo a passo',
      chip_label: 'DECISÃO',
      meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
      reveal_mode: 'tap',
      steps: logic_steps,
      footer_rule: 'COFEN 358/2009 + Lei 7.498/86 quando couber privativa',
    },
    danger_zone: {
      slide_title: 'Armadilhas desta questão',
      chip_label: 'PEGADINHAS',
      meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
      content: `PEGADINHAS — ${branch.replace('sae_', '').toUpperCase()}`,
      bullet_style: 'x_icon',
      items: danger_items,
      footer_rule: 'Cada distrator merece justificativa única — não recicle texto do gabarito',
    },
  };
}

// Manual refinements for high-value anchors / tricky slugs
Object.assign(specs['ameosc-enfermagem-processo-de-enfermagem-1776056129848-7'], {
  concept_map: {
    slide_title: 'Registro em prontuário — V/F',
    chip_label: 'DOCUMENTAÇÃO',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Tema', detail: 'Integridade, veracidade e identificação no registro de enfermagem.', icon: 'Target' },
      { label: 'Item 1 — alteração livre', detail: 'Prontuário não se corrige “livremente” — exige protocolo de retificação.', icon: 'XCircle' },
      { label: 'Item 2 — objetividade', detail: 'Anotação objetiva no momento do cuidado — veracidade.', icon: 'CheckCircle' },
      { label: 'Item 3 — comunicação', detail: 'Relatórios e boletins integram a comunicação interprofissional.', icon: 'MessageSquare' },
      { label: 'Item 4 — identificação', detail: 'Autoria deve constar no registro — não basta “a equipe saber”.', icon: 'Stamp' },
      { label: 'COFEN 358', detail: 'Base normativa para julgar cada afirmativa V ou F.', icon: 'Scale' },
    ],
    footer_rule: 'Julgue item a item antes de montar a sequência V-F',
  },
});

Object.assign(specs['copese-uft-enfermagem-processo-de-enfermagem-1776056021381-8'], {
  branch: 'sae_exceto',
  family: 'certo_errado',
  logic_flow: {
    ...specs['copese-uft-enfermagem-processo-de-enfermagem-1776056021381-8'].logic_flow,
    steps: [
      'Comando INCORRETA sobre o Processo de Enfermagem — uma alternativa falsa entre quatro verdadeiras.',
      'Confirmar A: PE tem 5 etapas integradas (COFEN 358) — correta.',
      'Confirmar B: cada categoria tem papel no PE — correta.',
      'Confirmar D: lista completa das 5 etapas — correta.',
      'Confirmar E: Art. 5º COFEN 358 — técnico/auxiliar sob supervisão — correta.',
      'Testar C: “técnico participa da implementação e da avaliação” — avaliação de enfermagem é privativa do enfermeiro.',
      'Letra C é a INCORRETA: técnico implementa e anota; não realiza avaliação privativa.',
      'Marcar letra C.',
      'Fixação: implementação = técnico pode; avaliação/evolução = enfermeiro.',
    ],
  },
  danger_zone: {
    ...specs['copese-uft-enfermagem-processo-de-enfermagem-1776056021381-8'].danger_zone,
    items: [
      { label: 'Letra A — cinco etapas', detail: 'Afirmativa correta sobre estrutura do PE.', correct: 'PE = coleta, diagnóstico, planejamento, implementação, avaliação — manter como distrator válido.' },
      { label: 'Letra B — papel da equipe', detail: 'Cada profissional tem função no PE.', correct: 'Verdadeira: equipe participa conforme competência — não é o gabarito INCORRETA.' },
      { label: 'Letra C — técnico na avaliação', detail: 'Pegadinha clássica: mistura implementação com avaliação privativa.', correct: 'INCORRETA: avaliação de enfermagem é privativa do enfermeiro — técnico não “avalia” o plano.' },
      { label: 'Letra D — etapas listadas', detail: 'Descrição completa e correta das etapas.', correct: 'Verdadeira — distrator que confunde por ser texto longo.' },
      { label: 'Letra E — Art. 5º', detail: 'Cita a resolução corretamente.', correct: 'Verdadeira: execução supervisionada conforme Art. 5º da Res. COFEN 358/2009.' },
    ],
  },
});

// VF I–V com termos do enunciado (align_instruction_terms)
for (const slug of [
  'fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-1',
  'fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-4',
  'fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056149404-3',
  'educa-pb-enfermagem-processo-de-enfermagem-1776056149404-0',
]) {
  const q = dump.find((x) => x.slug === slug);
  if (!q) continue;
  specs[slug].family = 'vf';
  specs[slug].concept_map.items = [
    { label: 'Comando', detail: firstSentence(q.instruction), icon: 'Target' },
    { label: 'I — admissão/alta', detail: 'Admissão padronizada; alta médica registrada; avaliação de enfermagem na admissão.', icon: 'LogIn' },
    { label: 'II — registros legais', detail: 'Documentos legais, continuidade do cuidado, comunicação e auditoria.', icon: 'FileText' },
    { label: 'III — PE evidenciado', detail: 'Registros evidenciam o Processo de Enfermagem no prontuário.', icon: 'GitBranch' },
    { label: 'IV — ensino/pesquisa', detail: 'Subsidiam ensino, pesquisa, extensão e auditoria quando ética permitir.', icon: 'BookOpen' },
    { label: 'COFEN 358', detail: 'Registro formal no prontuário físico ou eletrônico.', icon: 'Scale' },
  ];
  if (/dor|interação terapêutica/i.test(q.instruction)) {
    specs[slug].concept_map.items = [
      { label: 'Comando', detail: 'Interação terapêutica na dor — conforto e comunicação.', icon: 'Target' },
      { label: 'I — expressão de sentimentos', detail: 'Facilitar fala do paciente aumenta sensação de cuidado.', icon: 'Heart' },
      { label: 'II — apoio e tranquilização', detail: 'Suporte emocional pode aliviar dor presente ou futura.', icon: 'HandHeart' },
      { label: 'III — educação para alívio', detail: 'Ensinar medidas não farmacológicas faz parte do cuidado.', icon: 'GraduationCap' },
      { label: 'Todas corretas', detail: 'I, II e III são intervenções de conforto válidas na dor.', icon: 'CheckCircle' },
      { label: 'SAE', detail: 'Implementação inclui ações de suporte e educação.', icon: 'Layers' },
    ];
  }
}

// idib — claim 25% é distrator da prova
Object.assign(specs['idib-enfermagem-nocoes-de-fisiologia-1778934944659-8'], {
  golden_rule: {
    ...specs['idib-enfermagem-nocoes-de-fisiologia-1778934944659-8'].golden_rule,
    rows: [
      { label: 'Registro legal', value: 'Protege profissionais e paciente — autenticidade importa', badge: 'hot' },
      { label: 'PE no prontuário', value: 'Evolução de enfermagem integra o método SAE', badge: 'ok' },
      { label: 'Equipe registra', value: 'Técnico/auxiliar registram cuidados executados', badge: 'info' },
      { label: 'Pegadinha B', value: 'Percentual fixo sem critério normativo na COFEN', badge: 'warn' },
      { label: 'Privativa', value: 'Instrumento metodológico do enfermeiro — não monopólio do prontuário', badge: 'hot' },
    ],
  },
});

// ufmt — anotação pontual vs evolução
Object.assign(specs['ufmt-enfermagem-processo-de-enfermagem-1776055865890-2'], {
  concept_map: {
    slide_title: 'Anotação × evolução',
    chip_label: 'DOCUMENTAÇÃO',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Comando', detail: 'Anotação de enfermagem refere-se a dados…', icon: 'Target' },
      { label: 'Dado pontual', detail: 'Fato objetivo do cuidado executado — sem análise reflexiva.', icon: 'FileText' },
      { label: 'Não é processado', detail: 'Processar/contextualizar é camada de evolução do enfermeiro.', icon: 'XCircle' },
      { label: 'Não é relatório diário', detail: 'Anotação é dado pontual do cuidado, não síntese de turno inteiro.', icon: 'Clock' },
      { label: 'COFEN 358', detail: 'Separa anotação (equipe) de evolução (enfermeiro).', icon: 'Scale' },
    ],
    footer_rule: 'Pontual = fato | Processado = evolução',
  },
});

// vunesp implementação — documentação de etapa
Object.assign(specs['vunesp-enfermagem-processo-de-enfermagem-1776056149404-8'], {
  branch: 'sae_documentacao',
  concept_map: {
    slide_title: 'Técnico na implementação',
    chip_label: 'COMPETÊNCIA',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Comando', detail: 'Participação do técnico nas etapas do PE.', icon: 'Target' },
      { label: 'Implementação', detail: 'Executa e registra cuidados prescritos — etapa do técnico.', icon: 'Play' },
      { label: 'Não avalia plano', detail: 'Avaliação/evolução de enfermagem é privativa do enfermeiro.', icon: 'XCircle' },
      { label: 'Não diagnostica', detail: 'Diagnóstico de enfermagem — enfermeiro.', icon: 'UserCheck' },
      { label: 'Art. 5º COFEN 358', detail: 'Executa o que couber, supervisionado.', icon: 'Scale' },
    ],
    footer_rule: 'Técnico = implementação + anotação',
  },
});

// instituto-aocp caso clínico — danger únicos
Object.assign(specs['instituto-aocp-enfermagem-processo-de-enfermagem-1776056140199-4'], {
  danger_zone: {
    ...specs['instituto-aocp-enfermagem-processo-de-enfermagem-1776056140199-4'].danger_zone,
    items: [
      { label: 'Letra B — prescrição', detail: 'Técnico não elabora prescrição de enfermagem.', correct: 'Prescrição/planejamento é privativa do enfermeiro — B errada.' },
      { label: 'Letra C — supervisão de auxiliar', detail: 'Orientar auxiliar é papel do enfermeiro.', correct: 'Técnico não substitui enfermeiro na supervisão — C errada.' },
      { label: 'Letra D — diagnóstico', detail: 'Formulação de diagnóstico exige enfermeiro.', correct: 'Diagnóstico de enfermagem não é do técnico — D errada.' },
      { label: 'Letra A — gabarito', detail: 'Anotação + implementação + checagem supervisionadas.', correct: 'Única correta: participação do técnico conforme Res. COFEN 358.' },
    ],
  },
});

// educa-pb VF dor — danger únicos
Object.assign(specs['educa-pb-enfermagem-processo-de-enfermagem-1776056149404-0'], {
  danger_zone: {
    ...specs['educa-pb-enfermagem-processo-de-enfermagem-1776056149404-0'].danger_zone,
    items: [
      { label: 'Letra A — só II', detail: 'Omite I e III válidas.', correct: 'Apoio (II) sozinho não esgota as intervenções de conforto.' },
      { label: 'Letra B — I e III', detail: 'Falta o apoio/tranquilização.', correct: 'II também é intervenção terapêutica na dor.' },
      { label: 'Letra D — II e III', detail: 'Exclui facilitar expressão de sentimentos.', correct: 'I é parte do cuidado humanizado na dor.' },
      { label: 'Letra E — só II (repetida)', detail: 'Combinação incompleta.', correct: 'Gabarito C: I, II e III estão corretas.' },
    ],
  },
});

// fundatec anosmia — danger únicos
Object.assign(specs['fundatec-enfermagem-processo-de-enfermagem-1780011961798-0'], {
  danger_zone: {
    ...specs['fundatec-enfermagem-processo-de-enfermagem-1780011961798-0'].danger_zone,
    items: [
      { label: 'Letra A — ageusia', detail: 'Alteração do paladar.', correct: 'Ageusia = paladar; olfato = anosmia (D).' },
      { label: 'Letra B — disgeusia', detail: 'Distúrbio do paladar.', correct: 'Disgeusia não descreve perda de olfato.' },
      { label: 'Letra C — amaurose', detail: 'Relaciona-se à visão.', correct: 'Amaurose = olhos; enunciado fala em cheiros.' },
      { label: 'Letra D — anosmia', detail: 'Perda/diminuição do olfato.', correct: 'Termo técnico para registrar na anamnese/coleta de dados.' },
    ],
  },
});

// inaz NÃO essencial — especificidade
Object.assign(specs['inaz-do-para-enfermagem-processo-de-enfermagem-1776056140199-7'], {
  concept_map: {
    slide_title: 'Itens do registro — o que é essencial',
    chip_label: 'DOCUMENTAÇÃO',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Comando NÃO essencial', detail: 'Buscar o item que pode faltar sem violar norma técnica.', icon: 'Target' },
      { label: 'Data/hora', detail: 'Marca temporal — essencial.', icon: 'Clock' },
      { label: 'Identificação do paciente', detail: 'Vincula o registro ao titular do cuidado.', icon: 'User' },
      { label: 'Descrição do procedimento', detail: 'Objetividade do que foi feito.', icon: 'FileText' },
      { label: 'Assinatura', detail: 'Autoria profissional obrigatória.', icon: 'Stamp' },
      { label: 'Opinião pessoal', detail: 'Subjetividade/julgamento de valor — não entra na anotação técnica.', icon: 'XCircle' },
    ],
    footer_rule: 'Registro = fato técnico, não opinião',
  },
  danger_zone: {
    items: [
      { label: 'Letra A — data/hora', detail: 'Essencial para cronologia.', correct: 'Data e hora são obrigatórias — não é o NÃO essencial.' },
      { label: 'Letra B — nome do paciente', detail: 'Identificação do titular.', correct: 'Nome completo vincula o registro — essencial.' },
      { label: 'Letra C — descrição', detail: 'Núcleo da anotação.', correct: 'Descrição objetiva do procedimento é essencial.' },
      { label: 'Letra D — assinatura', detail: 'Autoria no documento.', correct: 'Assinatura identifica o executor — essencial.' },
      { label: 'Letra E — opinião pessoal', detail: 'Gabarito: julgamento subjetivo.', correct: 'Opinião pessoal não é requisito técnico do registro — é o NÃO essencial.' },
    ],
    content: 'PEGADINHAS — ITENS DO REGISTRO',
    bullet_style: 'x_icon',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    slide_title: 'Armadilhas — essencial × opinião',
    chip_label: 'PEGADINHAS',
    footer_rule: 'Opinião ≠ dado de enfermagem',
  },
});

// idib — sem claim 25% nos slides
Object.assign(specs['idib-enfermagem-nocoes-de-fisiologia-1778934944659-8'], {
  logic_flow: {
    ...specs['idib-enfermagem-nocoes-de-fisiologia-1778934944659-8'].logic_flow,
    steps: [
      'Comando: alternativa correta sobre registros de enfermagem e PE.',
      'Eliminar A: autenticidade legal não é secundária à precisão.',
      'Eliminar B: percentual fixo não é critério normativo de prova.',
      'Eliminar D: técnico/auxiliar também registram cuidados executados.',
      'Letra C: PE com evolução como instrumento metodológico do enfermeiro — coerente.',
      'Marcar letra C.',
      'Fixação: registro legal + PE documentado — sem inventar números na alternativa.',
    ],
  },
  danger_zone: {
    items: [
      { label: 'Letra A — autenticidade secundária', detail: 'Minimiza valor legal do registro.', correct: 'Autenticidade e significado legal são centrais — A errada.' },
      { label: 'Letra B — percentual inventado', detail: 'Distrator numérico sem base COFEN.', correct: 'Não decore percentuais — B errada.' },
      { label: 'Letra D — só enfermeiro registra', detail: 'Exclui técnico/auxiliar do prontuário.', correct: 'Equipe registra o que executa — D errada.' },
      { label: 'Letra C — PE e evolução', detail: 'Gabarito: método e evolução de enfermagem.', correct: 'C correta: PE documentado com evolução privativa do enfermeiro.' },
    ],
    content: 'PEGADINHAS — REGISTRO E PE',
    bullet_style: 'x_icon',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    slide_title: 'Armadilhas — registro legal',
    chip_label: 'PEGADINHAS',
    footer_rule: 'Sem número inventado — julgue competência e PE',
  },
});

// fundepes registros IV-V — mais termos do enunciado
Object.assign(specs['fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-4'], {
  concept_map: {
    ...specs['fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056173194-4'].concept_map,
    items: [
      { label: 'Comando', detail: 'Afirmativas sobre registros de enfermagem I–IV.', icon: 'Target' },
      { label: 'I — ação de enfermagem', detail: 'Registro produz relato escrito de dados, decisões e respostas do paciente.', icon: 'FileText' },
      { label: 'II — vital no prontuário', detail: 'Registro preciso e abrangente na prática.', icon: 'Heart' },
      { label: 'III — qualidade do cuidado', detail: 'Relato resume o nível de qualidade prestado.', icon: 'BarChart' },
      { label: 'IV — continuidade e segurança', detail: 'Registro eficaz assegura continuidade e reduz erros.', icon: 'ShieldCheck' },
      { label: 'COFEN 358', detail: 'Documentação formal do Processo de Enfermagem.', icon: 'Scale' },
    ],
  },
});

// fau escala dor e hígido — danger únicos
Object.assign(specs['fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-2'], {
  danger_zone: {
    items: [
      { label: 'Letra A — pares', detail: 'Restrição inexistente na escala 0–10.', correct: 'Escala numérica admite pares e ímpares — A errada.' },
      { label: 'Letra B — ímpares', detail: 'Restrição inexistente.', correct: 'Não há regra de só ímpares na escala numérica.' },
      { label: 'Letra D — romanos', detail: 'Escala não usa numeração romana.', correct: 'Dor 0–10 = algarismos arábicos (C).' },
      { label: 'Letra E — letras', detail: 'Escala não é alfabética.', correct: 'Pontuação numérica, não letras.' },
    ],
    content: 'PEGADINHAS — ESCALA NUMÉRICA DE DOR',
    bullet_style: 'x_icon',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    slide_title: 'Armadilhas — escala 0–10',
    chip_label: 'PEGADINHAS',
    footer_rule: 'Algarismos arábicos na escala numérica',
  },
});
Object.assign(specs['fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-9'], {
  danger_zone: {
    items: [
      { label: 'Letra A — híbrido', detail: 'Termo não usado para paciente sadio.', correct: 'Híbrido não define estado de saúde plena.' },
      { label: 'Letra B — hídrico', detail: 'Relaciona-se a água/balanço hídrico.', correct: 'Hídrico ≠ paciente sem doença conhecida.' },
      { label: 'Letra C — comatoso', detail: 'Estado de consciência alterada.', correct: 'Comatoso é o oposto de sadio/hígido.' },
      { label: 'Letra D — prostrado', detail: 'Fraqueza/extenuação — não “sem doença”.', correct: 'Prostrado indica debilidade, não hígido.' },
    ],
    content: 'PEGADINHAS — ESTADO HÍGIDO',
    bullet_style: 'x_icon',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    slide_title: 'Armadilhas — vocabulário clínico',
    chip_label: 'PEGADINHAS',
    footer_rule: 'Hígido = sadio, sem doença crônica/aguda conhecida',
  },
});

// fundepes registros I-V — etapas (inferência L3 = sae_etapas)
Object.assign(specs['fundepes-copeve-ufal-enfermagem-processo-de-enfermagem-1776056149404-3'], {
  branch: 'sae_etapas',
  concept_map: {
    slide_title: 'Registros evidenciam o PE',
    chip_label: 'ETAPAS SAE',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Comando', detail: 'Afirmativas I–V sobre registros de enfermagem.', icon: 'Target' },
      { label: 'I — defesa legal', detail: 'Documentos legais da equipe de enfermagem.', icon: 'Scale' },
      { label: 'II — comparar respostas', detail: 'Acompanhar resposta do paciente aos cuidados.', icon: 'TrendingUp' },
      { label: 'III — evidencia PE', detail: 'Registros documentam o Processo de Enfermagem.', icon: 'GitBranch' },
      { label: 'IV — ensino/pesquisa', detail: 'Subsidiam ensino, pesquisa, extensão e auditoria.', icon: 'BookOpen' },
      { label: 'V — comunicação', detail: 'Comunicação entre equipe multiprofissional.', icon: 'MessageSquare' },
    ],
    footer_rule: 'Todas as funções dos registros estão corretas nesta prova',
  },
  golden_rule: {
    slide_title: 'Registros × etapas SAE',
    chip_label: 'ETAPAS',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    content: 'REGISTROS NO PROCESSO DE ENFERMAGEM',
    rows: [
      { label: 'Coleta/implementação', value: 'Registros documentam ações das etapas', badge: 'info' },
      { label: 'Avaliação', value: 'Comparar respostas retroalimenta o PE', badge: 'hot' },
      { label: 'PE evidenciado', value: 'III — registros mostram o método SAE', badge: 'ok' },
      { label: 'Todas corretas', value: 'I, II, III, IV e V nesta questão', badge: 'hot' },
    ],
    footer_rule: 'Registro documenta o PE em todas as dimensões cobradas',
  },
  danger_zone: {
    items: [
      { label: 'Letra A — só III', detail: 'Omite funções legais e comunicação.', correct: 'I, II, IV e V também estão corretas — A incompleta.' },
      { label: 'Letra B — II e V', detail: 'Falta I, III e IV.', correct: 'Combinação parcial — gabarito é E (todas).' },
      { label: 'Letra C — I, III e IV', detail: 'Exclui II e V.', correct: 'II (comparar respostas) e V (comunicação) também corretas.' },
      { label: 'Letra D — I, II e IV', detail: 'Exclui III e V.', correct: 'III evidencia PE e V é comunicação — também corretas.' },
    ],
    content: 'PEGADINHAS — VF REGISTROS',
    bullet_style: 'x_icon',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    slide_title: 'Armadilhas — combinações parciais',
    chip_label: 'PEGADINHAS',
    footer_rule: 'Quando todas I–V estão corretas, marque E',
  },
});

// ufmt — sem claim numérico 24h nos slides
Object.assign(specs['ufmt-enfermagem-processo-de-enfermagem-1776055865890-2'], {
  danger_zone: {
    items: [
      { label: 'Letra B — processados', detail: 'Confunde anotação com evolução.', correct: 'Processar/contextualizar é evolução do enfermeiro — B errada.' },
      { label: 'Letra C — período fixo', detail: 'Distrator de janela temporal.', correct: 'Anotação não se define por período fechado — C errada.' },
      { label: 'Letra D — reflexão', detail: 'Análise reflexiva da situação.', correct: 'Reflexão/análise = evolução — D errada.' },
      { label: 'Letra A — pontuais', detail: 'Gabarito: dados factuais do cuidado.', correct: 'Anotação registra fatos pontuais do momento do cuidado.' },
    ],
    content: 'PEGADINHAS — ANOTAÇÃO PONTUAL',
    bullet_style: 'x_icon',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    slide_title: 'Armadilhas — anotação × evolução',
    chip_label: 'PEGADINHAS',
    footer_rule: 'Pontual = fato | Processado = evolução',
  },
  logic_flow: {
    slide_title: 'Raciocínio clínico — passo a passo',
    chip_label: 'DECISÃO',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    reveal_mode: 'tap',
    steps: [
      'Comando: o que caracteriza a anotação de enfermagem?',
      'Anotação = registro factual do cuidado executado — dado pontual.',
      'Eliminar B: processamento contextualizado é evolução, não anotação.',
      'Eliminar C: não há “tipo” de anotação definido por período fechado na norma.',
      'Eliminar D: reflexão/análise é camada privativa do enfermeiro.',
      'Letra A: dados pontuais — melhor definição.',
      'Marcar letra A.',
      'Fixação: anotação pontual ≠ evolução reflexiva.',
    ],
    footer_rule: 'COFEN 358 — separe anotação de evolução',
  },
});

// g06 — VF vias subcutânea/endovenosa/enteral (specificity gate)
Object.assign(specs['cotec-fadenor-enfermagem-processo-de-enfermagem-1780002389285-4'], {
  family: 'vf',
  concept_map: {
    slide_title: 'Vias × início de ação',
    chip_label: 'VIAS',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Comando', detail: 'Julgar I–III sobre início de ação das vias subcutânea, endovenosa e enteral.', icon: 'Target' },
      { label: 'I — subcutânea', detail: 'Via SC: absorção mais lenta — início de ação lento vs endovenosa.', icon: 'Syringe' },
      { label: 'II — endovenosa', detail: 'Via EV: acesso direto à corrente sanguínea — início rápido.', icon: 'Zap' },
      { label: 'III — enteral', detail: 'Via enteral: passa pelo TGI — início não é “rápido”; custo não é critério de início.', icon: 'Pill' },
      { label: 'Implementação PE', detail: 'Escolha da via integra planejamento e execução do cuidado medicamentoso.', icon: 'GitBranch' },
      { label: 'Registro', detail: 'Via e horário da administração devem constar na anotação de enfermagem.', icon: 'FileText' },
    ],
    footer_rule: 'Compare início de ação — não confunda enteral com EV',
  },
  golden_rule: {
    slide_title: 'Referência — início de ação por via',
    chip_label: 'VIAS',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    content: 'INÍCIO DE AÇÃO — SUBCUTÂNEA × ENDOVENOSA × ENTERAL',
    rows: [
      { label: 'Endovenosa', value: 'Início imediato/rápido — acesso venoso direto', badge: 'hot' },
      { label: 'Subcutânea', value: 'Início mais lento que EV — absorção tecidual', badge: 'info' },
      { label: 'Enteral', value: 'Absorção pelo TGI — não é via de ação rápida', badge: 'warn' },
      { label: 'I e II', value: 'Verdadeiras nesta questão', badge: 'ok' },
      { label: 'III', value: 'Falsa — enteral não tem início rápido “e alto custo” como regra', badge: 'hot' },
      { label: 'Gabarito', value: 'Letra B — apenas I e II', badge: 'ok' },
    ],
    footer_rule: 'EV rápida > SC > enteral (início de ação)',
  },
  logic_flow: {
    slide_title: 'Raciocínio — VF vias',
    chip_label: 'DECISÃO',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    reveal_mode: 'tap',
    steps: [
      'Ler I: subcutânea tem início lento comparada à endovenosa — verdadeira.',
      'Ler II: endovenosa tem início rápido comparada à subcutânea — verdadeira.',
      'Ler III: enteral com início rápido e alto custo — falsa (enteral não é via de ação rápida).',
      'Eliminar alternativas que incluem III (C, D, E).',
      'Eliminar A (só I) — falta II correta.',
      'Letra B: I e II — gabarito.',
      'Marcar letra B.',
      'Fixação: EV = rápida | SC = lenta | enteral ≠ início rápido.',
    ],
    footer_rule: 'VF de vias — julgue cada item antes da combinação',
  },
  danger_zone: {
    items: [
      { label: 'Letra A — só I', detail: 'Omite II verdadeira.', correct: 'II também está correta — A incompleta.' },
      { label: 'Letra C — I, II e III', detail: 'Inclui III falsa.', correct: 'Enteral não tem início rápido como afirmado — C errada.' },
      { label: 'Letra D — I e III', detail: 'Mantém III falsa.', correct: 'III invalida a combinação — D errada.' },
      { label: 'Letra E — II e III', detail: 'III falsa pesa contra E.', correct: 'Sem III, sobra B (I e II).' },
    ],
    content: 'PEGADINHAS — VF VIAS',
    bullet_style: 'x_icon',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    slide_title: 'Armadilhas — combinações com III',
    chip_label: 'PEGADINHAS',
    footer_rule: 'III é a afirmativa falsa — não marque combinações que a incluem',
  },
});

// g06 — VF IM ventroglútea/dorsoglútea (align_instruction_terms)
Object.assign(specs['ameosc-enfermagem-processo-de-enfermagem-1780003031246-4'], {
  family: 'conceito',
  concept_map: {
    slide_title: 'Via IM — locais seguros',
    chip_label: 'IM',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Tema', detail: 'Técnica IM: locais seguros e volumes máximos — evitar complicações neurovasculares.', icon: 'Target' },
      { label: 'Item 1 — ventroglútea', detail: 'Hochstetter: mais segura, livre de grandes vasos e nervos importantes.', icon: 'ShieldCheck' },
      { label: 'Item 2 — Z-track', detail: 'Não é exclusiva de vacinas oleosas em <2 anos — julgar F na prova.', icon: 'XCircle' },
      { label: 'Item 3 — vasto lateral', detail: 'Coxa em lactentes — desenvolvimento muscular; julgar V/F pelo enunciado.', icon: 'Activity' },
      { label: 'Item 4 — deltoide', detail: 'Evitar volumes elevados no deltoide — risco de irritação e compressão do nervo axilar.', icon: 'Syringe' },
      { label: 'Registro PE', detail: 'Local, hora e volume da IM na anotação de enfermagem.', icon: 'FileText' },
    ],
    footer_rule: 'Julgue cada item (__) antes de montar V-F-V-F',
  },
  golden_rule: {
    slide_title: 'IM — referência rápida',
    chip_label: 'IM',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    content: 'VIA INTRAMUSCULAR — LOCAIS E SEGURANÇA',
    rows: [
      { label: 'Ventroglútea', value: 'Mais segura (Hochstetter) — afastada de nervo ciático/vasos', badge: 'ok' },
      { label: 'Dorsoglútea', value: 'QSE da nádega — técnica de localização', badge: 'info' },
      { label: 'Deltoide', value: 'Volume reduzido — músculo deltoide', badge: 'warn' },
      { label: 'Vasto lateral', value: 'Face anterolateral da coxa', badge: 'info' },
      { label: 'Gabarito prova', value: 'Sequência V, F, V, F nesta questão', badge: 'hot' },
    ],
    footer_rule: 'Volume máximo varia por sítio — não extrapole',
  },
  logic_flow: {
    reveal_mode: 'tap',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    steps: [
      'Comando: V/F nos quatro itens sobre IM (ventroglútea, Z-track, vasto lateral, deltoide).',
      'Item 1 ventroglútea/Hochstetter: mais segura — verdadeiro (V).',
      'Item 2 Z-track exclusivo em vacinas oleosas <2 anos — falso (F).',
      'Item 3 vasto lateral em lactentes — verdadeiro conforme enunciado (V).',
      'Item 4 deltoide com volume excessivo e nervo axilar — falso na sequência da prova (F).',
      'Sequência de cima para baixo: V, F, V, F.',
      'Marcar letra C.',
      'Fixação: ventroglútea = sítio mais seguro; deltoide tem limite de volume.',
    ],
    footer_rule: 'IM segura = anatomia + volume + registro',
  },
  danger_zone: {
    items: [
      { label: 'Sequência A', detail: 'Combinação que omite V na ventroglútea.', correct: 'Item 1 é V — sequência incorreta.' },
      { label: 'Sequência B', detail: 'Mantém Z-track exclusivo em lactentes.', correct: 'Item 2 é F — invalida a sequência.' },
      { label: 'Sequência D', detail: 'Inverte julgamento do vasto lateral ou deltoide.', correct: 'Gabarito é V, F, V, F (letra C).' },
      { label: 'Transferência — deltoide', detail: 'Volume excessivo no deltoide comprime estruturas.', correct: 'Respeitar limite de volume no músculo deltoide.' },
    ],
    content: 'PEGADINHAS — VF IM',
    bullet_style: 'x_icon',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    slide_title: 'Armadilhas — sequência V/F',
    chip_label: 'PEGADINHAS',
    footer_rule: 'Monte V-F-V-F item a item',
  },
});

// g06 — VF técnica em Z (IM)
Object.assign(specs['furb-enfermagem-processo-de-enfermagem-1780011908736-6'], {
  family: 'vf',
  concept_map: {
    slide_title: 'Técnica em Z — IM',
    chip_label: 'IM',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Contexto', detail: 'Via intramuscular (IM) — Técnica em Z para reduzir extravasamento/irritação.', icon: 'Target' },
      { label: 'I — parenteral', detail: 'Técnica em Z é administração parenteral por via IM.', icon: 'Syringe' },
      { label: 'II — deslocamento', detail: 'Pele e subcutâneo movidos lateralmente antes da injeção.', icon: 'Move' },
      { label: 'III — avaliar', detail: 'Julgar se descreve corretamente a sequência da técnica em Z.', icon: 'Search' },
      { label: 'IV — selante', detail: 'Após retirar agulha, pele retorna selando o trajeto — reduz vazamento.', icon: 'ShieldCheck' },
      { label: 'Implementação', detail: 'Técnica correta integra etapa de implementação do PE + anotação.', icon: 'FileText' },
    ],
    footer_rule: 'Técnica em Z = deslocar pele → injetar → soltar para selar',
  },
  logic_flow: {
    reveal_mode: 'tap',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    steps: [
      'I: Técnica em Z é parenteral/IM — verdadeira.',
      'II: deslocamento lateral da pele e subcutâneo — verdadeira.',
      'III: julgar conforme enunciado — falsa se contradizer a técnica.',
      'IV: selamento do trajeto ao liberar a pele — verdadeira.',
      'Combinação correta: I, II e IV.',
      'Eliminar alternativas que incluem III ou omitem II/IV.',
      'Marcar letra B.',
      'Fixação: Z reduz extravasamento na IM.',
    ],
    footer_rule: 'Parenteral IM — não confunda com SC ou ID',
  },
});

// g06 — MC vias na Atenção Básica
Object.assign(specs['igeduc-enfermagem-processo-de-enfermagem-1780010566816-2'], {
  concept_map: {
    slide_title: 'Vias na Atenção Básica',
    chip_label: 'VIAS',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Enquadramento', detail: 'Vias influenciam absorção, ação terapêutica e segurança do paciente.', icon: 'Target' },
      { label: 'Atenção Básica', detail: 'Técnico conhece indicações, cuidados e técnicas de cada via.', icon: 'Home' },
      { label: 'Prescrição', detail: 'Seguir prescrição médica/enfermagem e protocolos institucionais.', icon: 'ClipboardList' },
      { label: 'Segurança', detail: 'Princípios de segurança do paciente — evitar eventos adversos.', icon: 'ShieldCheck' },
      { label: 'Eficácia', detail: 'Via correta garante eficácia terapêutica esperada.', icon: 'CheckCircle' },
      { label: 'PE', detail: 'Administração = implementação; registrar via, hora e intercorrências.', icon: 'FileText' },
    ],
    footer_rule: 'Via certa + técnica certa + registro = cuidado seguro',
  },
  logic_flow: {
    reveal_mode: 'tap',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    steps: [
      'Comando: conduta correta sobre escolha/uso de vias na Atenção Básica.',
      'Priorizar alternativa que cita prescrição + características do medicamento + condição do paciente.',
      'Eliminar opções que ignoram prescrição ou protocolo institucional.',
      'Eliminar alternativas que violam segurança do paciente.',
      'Letra C: escolha da via deve respeitar prescrição, fármaco e paciente.',
      'Marcar letra C.',
      'Fixação: nunca trocar via sem avaliação/prescrição.',
    ],
    footer_rule: 'AB: técnico executa conforme prescrição validada',
  },
});

// g06 — sequência ventroglútea AOCP
Object.assign(specs['instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-8'], {
  concept_map: {
    slide_title: 'IM ventroglútea — passos',
    chip_label: 'IM',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    items: [
      { label: 'Tema', detail: 'Técnica correta de IM na região ventroglútea.', icon: 'Target' },
      { label: '1 — trocânter', detail: 'Espalmar a mão sobre a base do trocânter maior do fêmur.', icon: 'Hand' },
      { label: '2 — EIAS', detail: 'Localizar espinha ilíaca anterossuperior com indicador ou médio.', icon: 'MapPin' },
      { label: '3 — triângulo', detail: 'Injetar no centro do triângulo formado pelos dedos em “V”.', icon: 'Triangle' },
      { label: '4 — extensão', detail: 'Estender dedo médio/indicador ao longo da linha ilíaca.', icon: 'MoveHorizontal' },
      { label: 'Registro', detail: 'Documentar local (ventroglútea), hora e medicamento administrado.', icon: 'FileText' },
    ],
    footer_rule: 'Ordem dos passos define segurança na ventroglútea',
  },
  golden_rule: {
    slide_title: 'Sequência ventroglútea',
    chip_label: 'IM',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    content: 'TÉCNICA VENTROGLÚTEA — ORDEM DOS PASSOS',
    rows: [
      { label: 'Passo 1', value: 'Mão sobre trocânter maior', badge: 'info' },
      { label: 'Passo 2', value: 'Palpar espinha ilíaca anterossuperior', badge: 'info' },
      { label: 'Passo 4', value: 'Estender dedo ao longo da linha ilíaca', badge: 'warn' },
      { label: 'Passo 3', value: 'Injetar no centro do triângulo em V', badge: 'hot' },
      { label: 'Gabarito', value: '1 – 2 – 4 – 3 (letra D)', badge: 'ok' },
    ],
    footer_rule: 'Localizar antes de injetar — sequência importa na prova',
  },
  logic_flow: {
    reveal_mode: 'tap',
    meta: { topico: 'Enfermagem', subtopico: 'Processo de Enfermagem' },
    steps: [
      'Identificar região ventroglútea como sítio da IM.',
      'Passo 1: mão sobre trocânter maior — primeiro.',
      'Passo 2: localizar EIAS — segundo.',
      'Passo 4: estender dedo na linha ilíaca — antes da injeção no triângulo.',
      'Passo 3: injeção no centro do triângulo em V — após demarcar.',
      'Sequência correta: 1 – 2 – 4 – 3.',
      'Marcar letra D.',
      'Fixação: demarcar anatomia → depois punção.',
    ],
    footer_rule: 'Ventroglútea = Hochstetter — técnica de triângulo',
  },
});

const out = `/** AUTO-GENERATED — node scripts/generate-sae-handcraft-specs.mjs */\nexport const SAE_HANDCRAFT_SPECS = ${JSON.stringify(specs, null, 2)} as const;\n`;
writeFileSync(join(process.cwd(), 'scripts/sae-handcraft-specs.generated.ts'), out, 'utf8');
console.log('Generated', Object.keys(specs).length, 'specs');
