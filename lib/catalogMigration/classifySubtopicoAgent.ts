import { CANONICAL_SUBTOPICOS, isCanonicalSubtopico } from '@/lib/catalogMigration/canonicalSubtopicos';
import type { SubtopicoInference } from '@/lib/catalogMigration/inferSubtopicoFromEnunciado';

export type AgentClassifyInput = {
  slug: string;
  instruction: string;
  textFragment?: string;
  optionsPreview?: string;
  currentSubtopico: string;
};

type Rule = {
  test: (input: AgentClassifyInput, blob: string, slug: string) => boolean;
  label: string;
  confidence: number;
  rationale: string;
  /** Se true, só aplica quando currentSubtopico está em catch-all ou bucket genérico. */
  onlyFromCatchAll?: boolean;
};

const CATCH_ALL = new Set([
  'Procedimentos Diversos',
  'Processo de Enfermagem',
  'Segurança do Paciente',
  'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis',
  'Questões Mescladas e Outras Doenças Agudas',
]);

function blobOf(input: AgentClassifyInput): string {
  return `${input.instruction} ${input.textFragment ?? ''} ${input.optionsPreview ?? ''}`.toLowerCase();
}

function slugOf(input: AgentClassifyInput): string {
  return input.slug.toLowerCase();
}

function isSaeCore(blob: string): boolean {
  return (
    /processo de enfermagem|\bsae\b|nanda|diagn[oó]stico de enfermagem|plano de cuidados|anota[cç][aã]o de enfermagem|interven[cç][aã]o de enfermagem|classifica[cç][aã]o de nanda|etapas do pe\b|registro de enfermagem|historia de enfermagem|comunica[cç][aã]o terap[eê]utica|sistematiza[cç][aã]o da assist|dom[ií]nio nanda|taxonomia ii|\bnic\b|\bnocs\b/i.test(
      blob,
    ) && !/transfus[aã]o|dieta|nutri[cç][aã]o|imc|antropometr|invent[aá]rio de estoque/i.test(blob)
  );
}

function isNspCore(blob: string): boolean {
  return /seguran[cç]a do paciente|evento adverso|incidente com paciente|near miss|identifica[cç][aã]o do paciente|notifica[cç][aã]o de incidente|prescri[cç][aã]o segura|checagem de seguran|circula[cç][aã]o segura|cirurgia segura|identifica[cç][aã]o dupla|pulseira de identifica|metas da oms|meta [1-8]:|never event|evento sentinela|queda de paciente|humaniza[cç][aã]o|acolhimento|pnh\b|protocolo de identifica|dispensa[cç][aã]o de medic|lista de verifica[cç][aã]o/i.test(
    blob,
  );
}

const AGENT_RULES: Rule[] = [
  // --- Slug canônico direto (passada profunda) ---
  {
    test: (_i, _b, s) => /curativos-e-manejo-de-feridas|curativos/.test(s),
    label: 'Curativos e Manejo de Feridas',
    confidence: 0.94,
    rationale: 'Slug curativos — tema de feridas/curativos',
  },
  {
    test: (_i, _b, s) => /verificacao-de-sinais-vitais/.test(s),
    label: 'Verificação de Sinais Vitais',
    confidence: 0.94,
    rationale: 'Slug verificação de sinais vitais',
  },
  {
    test: (_i, b, s) =>
      /nocoes-de-fisiologia/.test(s) &&
      /registro de enfermagem|prontu[aá]rio|documenta[cç][aã]o de enfermagem|processo de enfermagem/i.test(b) &&
      !/fisiolog|homeostase|metabolismo celular|histopatolog/i.test(b),
    label: 'Processo de Enfermagem',
    confidence: 0.89,
    rationale: 'Slug fisiologia mas enunciado de registros/SAE',
  },
  {
    test: (_i, _b, s) => /nocoes-de-fisiologia/.test(s),
    label: 'Noções de Fisiologia',
    confidence: 0.93,
    rationale: 'Slug noções de fisiologia',
  },
  {
    test: (_i, _b, s) => /nocoes-de-anatomia/.test(s),
    label: 'Noções de Anatomia',
    confidence: 0.93,
    rationale: 'Slug noções de anatomia',
  },
  {
    test: (_i, _b, s) => /puncao-venosa|puncao_venosa/.test(s),
    label: 'Punção Venosa e Cuidados com Cateteres',
    confidence: 0.93,
    rationale: 'Slug punção venosa/cateteres',
  },
  {
    test: (_i, _b, s) => /promocao-a-saude|prevencao-de-agravos/.test(s),
    label: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.94,
    rationale: 'Slug promoção/prevenção de agravos',
  },
  {
    test: (_i, _b, s) => /urgencias-e-emergencias/.test(s),
    label: 'Urgências e Emergências',
    confidence: 0.93,
    rationale: 'Slug urgências e emergências',
  },
  {
    test: (_i, _b, s) => /atencao-basica|saude-da-familia/.test(s),
    label: 'Atenção Básica / Saúde da Família',
    confidence: 0.91,
    rationale: 'Slug atenção básica/saúde da família',
  },
  {
    test: (_i, _b, s) => /doencas-autoimunes|reumatolog|artrite-reumatoide/.test(s),
    label: 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis',
    confidence: 0.91,
    rationale: 'Slug autoimune/reumatologia — DCNT mescladas',
  },
  {
    test: (_i, _b, s) => /coleta-de-exames/.test(s),
    label: 'Coleta de Exames Laboratoriais',
    confidence: 0.92,
    rationale: 'Slug coleta de exames laboratoriais',
  },
  {
    test: (_i, _b, s) => /oxigenoterapia|cuidados-respiratorios/.test(s),
    label: 'Oxigenoterapia e Cuidados Respiratórios',
    confidence: 0.91,
    rationale: 'Slug oxigenoterapia/cuidados respiratórios',
  },
  {
    test: (_i, _b, s) => /medidas-de-prevencao|precaucoes-de-contato/.test(s),
    label: 'Medidas de Prevenção e Precaução de Contato',
    confidence: 0.9,
    rationale: 'Slug medidas de prevenção/precaução',
  },
  {
    test: (_i, b, s) =>
      /vias-de-administracao/.test(s) &&
      /enema|lavagem intestinal|clister|clisma|retorno colonic/i.test(b),
    label: 'Instalação e Manejo de Sondas',
    confidence: 0.88,
    rationale: 'Vias no slug mas enunciado de enema/lavagem intestinal — sondagem/clister',
  },
  {
    test: (_i, _b, s) => /vias-de-administracao/.test(s),
    label: 'Vias de Administração',
    confidence: 0.92,
    rationale: 'Slug vias de administração',
  },
  {
    test: (_i, b) => /hantav|zoonose|roedor|febre hemorr[aá]gica por roed/i.test(b),
    label: 'Doenças Parasitárias e Zoonoses',
    confidence: 0.9,
    rationale: 'Zoonose/hantavirose — parasitárias e zoonoses',
  },
  {
    test: (_i, b) => /hipoglicem|crise convulsiva|anafilaxia|choque anafil/i.test(b),
    label: 'Urgências e Emergências',
    confidence: 0.9,
    rationale: 'Intercorrência aguda — urgência/emergência',
  },
  {
    test: (_i, b) =>
      /obesidad|ganho de peso|sobrepeso|circunfer[eê]ncia abdominal|indice de massa corporal/i.test(b) &&
      !/artrite|autoimun|reumat|articular cr[oô]nica/i.test(b),
    label: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.88,
    rationale: 'Obesidade/rastreamento metabólico — promoção/prevenção',
  },
  {
    test: (_i, b, s) =>
      /insulina|glicemia|diabetes mellitus tipo|monitorar glicemia/i.test(b) &&
      !/urg[eê]ncia|hipoglicem/i.test(b) &&
      !/processo-de-enfermagem/.test(s) &&
      !/processo de enfermagem|nanda|diagn[oó]stico de enfermagem|plano de cuidados/i.test(b),
    label: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.86,
    rationale: 'Cuidado crônico diabético — promoção/manejo ambulatorial',
  },
  // --- Slug âncora (alta confiança) ---
  {
    test: (_i, _b, s) => /nutricao-aplicada|nutri[cç]ao-aplicada/.test(s),
    label: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.94,
    rationale: 'Slug nutrição aplicada — promoção/prevenção nutricional',
  },
  {
    test: (_i, _b, s) => /semiologia-em-enfermagem|semiologia/.test(s),
    label: 'Verificação de Sinais Vitais',
    confidence: 0.93,
    rationale: 'Slug semiologia — semiologia/SV',
  },
  {
    test: (_i, _b, s) => /exames-complementares|exames-laboratoriais/.test(s),
    label: 'Coleta de Exames Laboratoriais',
    confidence: 0.92,
    rationale: 'Slug exames complementares/laboratoriais — coleta e exames',
  },
  {
    test: (_i, b, s) =>
      /auditoria-e-gestao|auditoria/.test(s) &&
      /[ée]tica|deontolog|direitos e deveres|historia da enfermagem|c[oó]digo de [ée]tica|cofen/i.test(b),
    label: 'História da Enfermagem',
    confidence: 0.91,
    rationale: 'Auditoria/ gestão com foco ético-profissional — História/COFEN',
  },
  {
    test: (_i, _b, s) => /auditoria-e-gestao|auditoria/.test(s),
    label: 'Segurança do Paciente',
    confidence: 0.9,
    rationale: 'Slug auditoria/gestão da qualidade — segurança do paciente',
  },
  {
    test: (_i, _b, s) => /cuidados-paliativos|paliativ/.test(s),
    label: 'Procedimentos Diversos',
    confidence: 0.88,
    rationale: 'Slug cuidados paliativos — procedimento específico (permanece até ramo dedicado)',
    onlyFromCatchAll: false,
  },
  {
    test: (_i, _b, s) => /enfermagem-em-oncologia|oncolog/.test(s),
    label: 'Procedimentos Diversos',
    confidence: 0.86,
    rationale: 'Slug oncologia — cuidado específico sem subtópico canônico',
  },
  {
    test: (_i, _b, s) => /saude-do-idoso|saude-do-homem/.test(s),
    label: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.88,
    rationale: 'Slug ciclo de vida específico — promoção/cuidado preventivo',
  },
  {
    test: (_i, _b, s) => /doencas-cardiovasculares|diabete|hipertensao|metabolicas-cronicas/.test(s),
    label: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.9,
    rationale: 'Slug DCNT metabólica/cardiovascular — prevenção/promoção (enunciado típico)',
  },
  // --- Conteúdo enunciado ---
  {
    test: (_i, b) => /dieta|nutri[cç][aã]o|alimenta[cç][aã]o|imc|antropometr|disfagia|cel[ií]aca|gl[uú]ten/i.test(b),
    label: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.91,
    rationale: 'Tema central: nutrição/dietas/promoção alimentar',
  },
  {
    test: (_i, b) => /transfus[aã]o|hemotransfus|concentrado de hem[aá]ci|reacao transfusional|hemocomponente/i.test(b),
    label: 'Urgências e Emergências',
    confidence: 0.9,
    rationale: 'Reação/intercorrência em transfusão — conduta urgente',
  },
  {
    test: (_i, b) => /invent[aá]rio|estoque de materiais|gest[aã]o de materiais|controle de estoque/i.test(b),
    label: 'Segurança do Paciente',
    confidence: 0.89,
    rationale: 'Gestão de materiais/estoque — qualidade e segurança assistencial',
  },
  {
    test: (_i, b) => /coleta de sangue|material biol[oó]gico|tubo de coleta|tampa de coleta|exame laboratorial|jejum para exame/i.test(b),
    label: 'Coleta de Exames Laboratoriais',
    confidence: 0.91,
    rationale: 'Coleta/preservação de amostras laboratoriais',
  },
  {
    test: (_i, b) => /press[aã]o arterial|temperatura|pulso|respira[cç][aã]o|sinais vitais|aferi[cç][aã]o|spo2|oximetria/i.test(b),
    label: 'Verificação de Sinais Vitais',
    confidence: 0.9,
    rationale: 'Aferição/interpretação de sinais vitais',
  },
  {
    test: (_i, b) => /sonda|gavagem|svd|sng|sondagem/i.test(b),
    label: 'Instalação e Manejo de Sondas',
    confidence: 0.9,
    rationale: 'Sondas digestivas/urinárias',
  },
  {
    test: (_i, b) => /curativo|ferida|les[aã]o cut[aâ]nea|pele integra|lpp|escara/i.test(b),
    label: 'Curativos e Manejo de Feridas',
    confidence: 0.88,
    rationale: 'Curativos e pele integra',
  },
  {
    test: (_i, b) => /pun[cç][aã]o venosa|acesso venoso|cateter venoso|flebite|jelco/i.test(b),
    label: 'Punção Venosa e Cuidados com Cateteres',
    confidence: 0.9,
    rationale: 'Acesso venoso/cateter',
  },
  {
    test: (_i, b) => /vacina|imuniza|imunobiol|calend[aá]rio vacinal/i.test(b),
    label: 'Imunização',
    confidence: 0.92,
    rationale: 'Imunização/vacinas',
  },
  {
    test: (_i, b) => /covid|influenza|sarampo|dengue|tuberculose|meningite/i.test(b),
    label: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.88,
    rationale: 'Doença transmissível específica (viral/epidemiológica)',
  },
  {
    test: (_i, b) =>
      /hiv|aids|s[ií]filis|infe[cç][aã]o sexual|hpv|clam[ií]dia|gonococ|hepatite [abc]\b|infec[cç][oõ]es sexualmente transmis|\bist\b(?!\w)/i.test(
        b,
      ) && !/assist[eê]ncia|consist[eê]ncia|persist/i.test(b),
    label: 'Infecções Sexualmente Transmissíveis (ISTs)',
    confidence: 0.9,
    rationale: 'IST',
  },
  {
    test: (_i, b) => /asma|dpoc|doen[cç]a pulmonar obstrutiva|bronquite cr[oô]nica/i.test(b),
    label: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    confidence: 0.9,
    rationale: 'Asma/DPOC',
  },
  {
    test: (_i, b) => /diabetes mellitus|hipertens[aã]o arterial|\bhas\b|insufici[eê]ncia card[ií]aca|\bicc\b|doen[cç]a renal cr[oô]nica|\bdrc\b|dcnt|doen[cç]as cr[oô]nicas n[aã]o transmis/i.test(b),
    label: 'Promoção à Saúde e Prevenção de Agravos',
    confidence: 0.87,
    rationale: 'DCNT/prevenção/promoção (habitos, rastreamento)',
  },
  {
    test: (_i, b) => /aten[cç][aã]o b[aá]sica|sa[uú]de da fam[ií]lia|esf\b|acs\b|agente comunit[aá]rio/i.test(b),
    label: 'Atenção Básica / Saúde da Família',
    confidence: 0.9,
    rationale: 'APS/ESF',
  },
  {
    test: (_i, b) => /cme|esteriliza[cç][aã]o|central de material|rastreabilidade de material/i.test(b),
    label: 'Enfermagem em Central de Material e Esterilização (CME)',
    confidence: 0.88,
    rationale: 'CME/esterilização',
  },
  {
    test: (_i, b) => /c[aá]lcul|dose|gotas|gts|ml\/h|regra de tr[eê]s|dilui[cç][aã]o/i.test(b),
    label: 'Cálculo de Administração de Medicamentos e Infusões',
    confidence: 0.9,
    rationale: 'Cálculo de medicação/infusão',
  },
  {
    test: (_i, b) => /via oral|via intramuscular|via intravenosa|subcut[aâ]nea|intrad[eé]rmica/i.test(b),
    label: 'Vias de Administração',
    confidence: 0.88,
    rationale: 'Vias de administração',
  },
  {
    test: (_i, b) => /6 certos|administra[cç][aã]o de medic|intera[cç][aã]o medicamentosa/i.test(b),
    label: 'Cuidados na Administração de Medicamentos',
    confidence: 0.88,
    rationale: 'Cuidados na administração de medicamentos',
  },
  {
    test: (_i, b) => /eletrocardiograma|\becg\b|eletrodo.*deriva/i.test(b),
    label: 'Verificação de Sinais Vitais',
    confidence: 0.9,
    rationale: 'ECG/monitorização cardíaca',
  },
  {
    test: (_i, b) => /radiof[aá]rmaco|radia[cç][aã]o ionizante|blindagem.*leito/i.test(b),
    label: 'Segurança do Paciente',
    confidence: 0.89,
    rationale: 'Radiofármacos/radiação — segurança do paciente e ambiente',
  },
  {
    test: (_i, b) => /quimioter[aá]pico|antineopl[aá]sico|mucosite oral/i.test(b),
    label: 'Cuidados na Administração de Medicamentos',
    confidence: 0.88,
    rationale: 'Quimioterápico — cuidados na administração',
  },
  {
    test: (_i, b) => /rcp|reanima[cç][aã]o cardiopulmonar|parada card[ií]aca|suporte avan[cç]ado de vida|\bxabcde\b/i.test(b),
    label: 'Urgências e Emergências',
    confidence: 0.93,
    rationale: 'Urgência/RCP',
  },
  {
    test: (_i, b) => /gestante|parto|puerp[eé]rio|pr[eé]-natal|ginecol/i.test(b),
    label: 'Saúde da Mulher',
    confidence: 0.9,
    rationale: 'Saúde da mulher/gestação',
  },
  {
    test: (_i, b) => /anatomia|f[ií]gado|rim|cor[aç][aã]o|pulm[aã]o|estrutura anat/i.test(b),
    label: 'Noções de Anatomia',
    confidence: 0.86,
    rationale: 'Anatomia',
  },
  {
    test: (_i, b) => /fisiolog|homeostase|metabolismo celular/i.test(b),
    label: 'Noções de Fisiologia',
    confidence: 0.86,
    rationale: 'Fisiologia',
  },
];

export function classifySubtopicoAgent(input: AgentClassifyInput): SubtopicoInference & { source: 'agent' } {
  const blob = blobOf(input);
  const slug = slugOf(input);
  const current = input.currentSubtopico.trim();

  for (const rule of AGENT_RULES) {
    if (!rule.test(input, blob, slug)) continue;
    if (rule.label.trim() === current) {
      return {
        suggested_subtopico: current,
        confidence: 0.95,
        rationale: `${rule.rationale} — já no bucket correto`,
        keep_current: true,
        source: 'agent',
      };
    }
    if (!isCanonicalSubtopico(rule.label)) continue;
    return {
      suggested_subtopico: rule.label,
      confidence: rule.confidence,
      rationale: `Agente: ${rule.rationale}`,
      keep_current: false,
      source: 'agent',
    };
  }

  // Manter SAE legítimo em Processo de Enfermagem
  if (current === 'Processo de Enfermagem' && isSaeCore(blob)) {
    return {
      suggested_subtopico: current,
      confidence: 0.92,
      rationale: 'Agente: enunciado ancorado em SAE/NANDA — permanece em Processo de Enfermagem',
      keep_current: true,
      source: 'agent',
    };
  }

  // Manter NSP legítimo
  if (current === 'Segurança do Paciente' && isNspCore(blob)) {
    return {
      suggested_subtopico: current,
      confidence: 0.92,
      rationale: 'Agente: tema central de segurança do paciente — permanece',
      keep_current: true,
      source: 'agent',
    };
  }

  // Segurança do Paciente bucket mas enunciado é SAE → Processo de Enfermagem
  if (current === 'Segurança do Paciente' && isSaeCore(blob)) {
    return {
      suggested_subtopico: 'Processo de Enfermagem',
      confidence: 0.88,
      rationale: 'Agente: conteúdo SAE em bucket Segurança — mover para Processo de Enfermagem',
      keep_current: false,
      source: 'agent',
    };
  }

  // Processo de Enfermagem bucket mas é NSP
  if (current === 'Processo de Enfermagem' && isNspCore(blob) && !isSaeCore(blob)) {
    return {
      suggested_subtopico: 'Segurança do Paciente',
      confidence: 0.88,
      rationale: 'Agente: conteúdo NSP em bucket SAE — mover para Segurança do Paciente',
      keep_current: false,
      source: 'agent',
    };
  }

  // Procedimentos Diversos — higiene/conforto
  if (
    current === 'Procedimentos Diversos' &&
    /higiene|banho|conforto|len[cç]ol|cabeleireiro|barbear/i.test(blob)
  ) {
    return {
      suggested_subtopico: 'Mobilização e Posicionamento do Paciente',
      confidence: 0.86,
      rationale: 'Agente: higiene/conforto — mobilização e cuidados gerais',
      keep_current: false,
      source: 'agent',
    };
  }

  // Processo de Enfermagem bucket mas slug é segurança/auditoria
  if (
    current === 'Processo de Enfermagem' &&
    (/seguranca-do-paciente|auditoria-e-gestao/.test(slug) || isNspCore(blob)) &&
    !isSaeCore(blob)
  ) {
    return {
      suggested_subtopico: 'Segurança do Paciente',
      confidence: 0.9,
      rationale: 'Agente: slug/conteúdo NSP em bucket SAE — mover para Segurança do Paciente',
      keep_current: false,
      source: 'agent',
    };
  }

  // Segurança do Paciente bucket mas slug é processo-de-enfermagem com SAE
  if (
    current === 'Segurança do Paciente' &&
    /processo-de-enfermagem/.test(slug) &&
    isSaeCore(blob) &&
    !isNspCore(blob)
  ) {
    return {
      suggested_subtopico: 'Processo de Enfermagem',
      confidence: 0.88,
      rationale: 'Agente: slug SAE com conteúdo de processo de enfermagem',
      keep_current: false,
      source: 'agent',
    };
  }

  // DCNT mescladas com promoção explícita
  if (
    current.includes('Doenças Crônicas Não Transmissíveis') &&
    /promo[cç][aã]o|preven[cç][aã]o|estilo de vida|alimenta[cç][aã]o saud[aá]vel/i.test(blob)
  ) {
    return {
      suggested_subtopico: 'Promoção à Saúde e Prevenção de Agravos',
      confidence: 0.88,
      rationale: 'Agente: DCNT com foco promoção/prevenção',
      keep_current: false,
      source: 'agent',
    };
  }

  return {
    suggested_subtopico: current,
    confidence: 0.6,
    rationale: 'Agente: tema ambíguo — manter bucket atual (revisão manual opcional)',
    keep_current: true,
    source: 'agent',
  };
}

export { CANONICAL_SUBTOPICOS, CATCH_ALL };
