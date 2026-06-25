import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';

export type SoftLensHintProfile =
  | 'calc'
  | 'via'
  | 'ist'
  | 'sae'
  | 'adolescent'
  | 'farmaco'
  | 'trabalho'
  | 'none';

const CALC_FORBIDDEN = /u-100|gotas|microgota|insulina|20-60-3|gts\/min/i;

export function resolveSoftLensExamHint(
  row: GoldenRuleRow,
  profile: SoftLensHintProfile = 'none',
): string {
  if (row.exam_hint?.trim()) return row.exam_hint.trim();
  if (profile === 'none') return neutralExamHint(row);

  const inferred = inferExamHintByProfile(row, profile);
  if (profile !== 'calc' && CALC_FORBIDDEN.test(inferred)) {
    return neutralExamHint(row);
  }
  return inferred;
}

export function resolveSoftLensFixation(
  row: GoldenRuleRow,
  profile: SoftLensHintProfile,
  index: number,
  total: number,
): string {
  if (row.fixation?.trim()) return row.fixation.trim();
  return inferFixationByProfile(row, profile, index, total);
}

function neutralExamHint(row: GoldenRuleRow): string {
  return 'Relacione esta linha com o enunciado e elimine alternativas incompatíveis antes de marcar.';
}

function inferExamHintByProfile(row: GoldenRuleRow, profile: SoftLensHintProfile): string {
  switch (profile) {
    case 'calc':
      return inferCalcExamHint(row);
    case 'via':
      return inferViaExamHint(row);
    case 'ist':
      return inferIstExamHint(row);
    case 'sae':
      return inferSaeExamHint(row);
    case 'adolescent':
      return inferAdolescentExamHint(row);
    case 'farmaco':
      return inferFarmacoExamHint(row);
    case 'trabalho':
      return inferTrabalhoExamHint(row);
    default:
      return neutralExamHint(row);
  }
}

function inferCalcExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/letra a|10 ui/.test(text)) {
    return 'Pegadinha clássica: mantém o nome U-100, mas troca 100 por 10 UI/mL. A banca testa se você decorou a concentração real.';
  }
  if (/letra c|35/.test(text)) {
    return 'Valor inventado para confundir quem lembra 60 mas não a relação gota ↔ microgota (3).';
  }
  if (/letra d|10 micro/.test(text)) {
    return 'Outro número redondo errado — macrogota equivale a 3 microgotas, não 10.';
  }
  if (/mnemônico|20-60-3/.test(text)) {
    return 'Use este trio antes de qualquer conta de infusão: identifique o equipo e aplique a constante certa.';
  }
  if (/gts\/min|infusão/.test(text)) {
    return 'Depois de decorar 20-60-3, toda conta de gts/min começa escolhendo macrogota (20) ou microgota (60).';
  }
  if (/20 gotas|macrogota/.test(text)) {
    return 'Constante mais cobrada em equivalência pura — base do gabarito nesta prova.';
  }
  if (/60 micro/.test(text)) {
    return 'Equipo de microgotas — três vezes mais gotas por mL que o macrogota.';
  }
  if (/3 micro/.test(text)) {
    return 'Relação fixa: cada macrogota vale três microgotas em prova.';
  }
  if (/u-100|insulina/.test(text)) {
    return 'Insulina padrão de mercado: 100 unidades por 1 mL — não confunda com seringa graduada em UI.';
  }
  if (/gabarito|verdadeira/.test(text)) {
    return 'Esta linha é o núcleo do gabarito — equivalência ou dose que a banca considera correta.';
  }
  return neutralExamHint(row);
}

function inferViaExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/^i\b|absorção rápida|absorcao rapida|lenta.*sc|mais lenta/.test(text)) {
    return 'Pegadinha clássica: IM absorve mais rápido que SC — não inverta velocidade entre vias.';
  }
  if (/ventroglúteo|ventrogluteo|nervo ciático|nervo ciatico|menos recomendado/.test(text)) {
    return 'Ventroglúteo é sítio seguro e indicado — banca usa medo anatômico para inverter o conceito.';
  }
  if (/volume|3\s*ml|dose grande|grande quantidade/.test(text)) {
    return 'SC admite volume pequeno — grande volume ou absorção rápida não combinam com tecido subcutâneo.';
  }
  if (/irritação|gordurosa|adiposo|aderência|facilitada/.test(text)) {
    return 'Cuidados reais de SC: tecido adiposo, absorção gradual e adesão ao tratamento.';
  }
  if (/palpar|marcos ósseos|marcos osseos|dor|posição/.test(text)) {
    return 'Técnica IM: palpar músculo, marcos ósseos e conforto do paciente são itens de prova.';
  }
  if (/verdadeira|gabarito|resposta final|combinação/.test(text)) {
    return 'Núcleo do gabarito — confirme julgando cada afirmativa I–IV antes da letra.';
  }
  if (/^ii\b|^iii\b|^iv\b/.test(text) || /afirmativa/.test(text)) {
    return 'Julgue o item pelo conteúdo clínico da via — absorção, volume e indicação.';
  }
  if (/letra/.test(text) && /falsa/.test(text)) {
    return 'Alternativa distratora: inclui afirmativa falsa ou omite item verdadeiro do gabarito.';
  }
  if (/letra/.test(text) && /verdadeira/.test(text)) {
    return 'Combinação correta — só as afirmativas verdadeiras entram no gabarito.';
  }
  return neutralExamHint(row);
}

function inferIstExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/sexo sem camisinha|relação sexual desprotegida/.test(text)) {
    return 'Fator clássico de risco IST — relação sem barreira mecânica aumenta a chance de transmissão.';
  }
  if (/parceiro|exposição indireta/.test(text)) {
    return 'A II cobra parceria de risco: o perigo não é só o seu comportamento, mas o do parceiro com terceiros.';
  }
  if (/agulha pessoal|uso individual|compartilhamento/.test(text)) {
    return 'Pegadinha da III: uso pessoal não configura risco parenteral — a banca quer compartilhamento de material.';
  }
  if (/trilho sexual|preservativo/.test(text)) {
    return 'Contexto de prevenção — não confunda com cura ou com afirmativa falsa sobre uso pessoal de agulha.';
  }
  if (/i e ii apenas|resposta final|gabarito/.test(text)) {
    return 'Gabarito: marque a combinação que exclui afirmativas falsas sobre risco de IST.';
  }
  return neutralExamHint(row);
}

function inferAdolescentExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/privacidade|escuta qualificada/.test(text)) {
    return 'Pilar central do cuidado ao adolescente — consulta com espaço reservado e acolhimento sem julgamento.';
  }
  if (/sigilo absoluto|sem critério|quebrar sempre/.test(text)) {
    return 'Pegadinha ética: sigilo não é absoluto nem inexistente — avalie risco grave e legislação (ECA).';
  }
  if (/gravidez|pré-natal|pre-natal|alto risco/.test(text)) {
    return 'Gestação na adolescência exige vínculo precoce ao pré-natal — complicações materno-fetais são mais frequentes.';
  }
  if (/autonomia|consentimento|responsável obrigatório|responsavel obrigatorio/.test(text)) {
    return 'Adolescente tem autonomia progressiva — nem toda consulta exige presença dos pais.';
  }
  if (/contracep|hpv|orientação sexual|orientacao sexual/.test(text)) {
    return 'Saúde sexual e reprodutiva integra o cuidado — orientação faz parte da atuação do técnico.';
  }
  if (/gabarito|i e ii|resposta final/.test(text)) {
    return 'Gabarito: marque só as afirmativas verdadeiras sobre escuta, gravidez e limites do sigilo.';
  }
  return neutralExamHint(row);
}

function inferFarmacoExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/farmacocinética|farmacocinetica|cinética|cinetica|\badme\b/.test(text)) {
    return 'Cinética = o organismo processa o fármaco (absorção, distribuição, metabolismo, excreção).';
  }
  if (/farmacodinâmica|farmacodinamica|dinâmica|dinamica|mecanismo/.test(text)) {
    return 'Dinâmica = o fármaco age no organismo — mecanismo de ação e efeito terapêutico ou adverso.';
  }
  if (/meia-vida|meia vida|50%|100%|eliminar/.test(text)) {
    return 'Pegadinha clássica: meia-vida é queda de 50% da concentração — nunca eliminação total (100%).';
  }
  if (/gabarito|i e ii|resposta final|verdadeira/.test(text)) {
    return 'Gabarito: marque só as definições corretas — III costuma errar a meia-vida.';
  }
  if (/^i\b|^ii\b|^iii\b/.test(text) || /afirmativa/.test(text)) {
    return 'Julgue cada afirmativa pela definição — não misture cinética com dinâmica.';
  }
  return neutralExamHint(row);
}

function inferTrabalhoExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/nr-?32|norma regulamentadora/.test(text)) {
    return 'NR-32 cobre todos os trabalhadores em serviços de saúde — não só médicos ou enfermeiros.';
  }
  if (/vacina|hepatite|influenza/.test(text)) {
    return 'Vacinação ocupacional é estratégia clássica de prevenção — hepatite B é a mais cobrada.';
  }
  if (/perfuro|material biológico|pós-exposição|pos-exposicao|pep/.test(text)) {
    return 'Pegadinha clássica: lavar não basta — notificar, exames e profilaxia são obrigatórios.';
  }
  if (/epi|equipamento de proteção|equipamento de protecao/.test(text)) {
    return 'EPI é fornecido pelo empregador quando o risco não é eliminado na fonte — não é opcional.';
  }
  if (/cat\b|comunicação de acidente|comunicacao de acidente/.test(text)) {
    return 'Acidente com material biológico = acidente de trabalho — CAT em até 1 dia útil.';
  }
  if (/ergonôm|ergonom|ler|dort|levantamento/.test(text)) {
    return 'NR-32 inclui risco ergonômico — levantamento manual e postura inadequada são cobrados.';
  }
  if (/gabarito|i e ii|resposta final|verdadeira/.test(text)) {
    return 'Gabarito: marque só as afirmativas corretas — III costuma minimizar acidente ocupacional.';
  }
  if (/^i\b|^ii\b|^iii\b/.test(text) || /afirmativa/.test(text)) {
    return 'Julgue cada afirmativa pela NR-32 e protocolo de exposição — não misture com biossegurança genérica.';
  }
  return neutralExamHint(row);
}

function inferSaeExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/anotação|diagnóstico|nanda|nic|noc|sae/.test(text)) {
    return 'Processo de enfermagem: etapas SAE têm ordem e responsabilidade técnica definidas.';
  }
  if (/verdadeira|gabarito/.test(text)) {
    return 'Critério do gabarito nesta questão de SAE — relacione com a etapa do processo.';
  }
  return neutralExamHint(row);
}

function inferFixationByProfile(
  row: GoldenRuleRow,
  profile: SoftLensHintProfile,
  index: number,
  total: number,
): string {
  const emphasis = row.emphasis ?? 'default';
  if (emphasis === 'success') {
    return 'Priorize esta linha na hora da prova — é o gabarito ou o critério decisivo.';
  }
  if (emphasis === 'alert') {
    return 'Marque mentalmente como distrator — a banca repete este erro em outras questões.';
  }
  if (emphasis === 'highlight') {
    if (profile === 'calc') {
      return 'Decore primeiro — esta constante aparece em infusão e equivalência.';
    }
    if (profile === 'via') {
      return 'Fixe absorção, volume e sítio antes de olhar as combinações A–E.';
    }
    if (profile === 'adolescent') {
      return 'Fixe escuta, sigilo ponderado e pré-natal antes das combinações A–E.';
    }
    if (profile === 'farmaco') {
      return 'Fixe cinética (ADME), dinâmica (ação) e meia-vida (50%) antes das combinações A–E.';
    }
    if (profile === 'trabalho') {
      return 'Fixe NR-32, vacina ocupacional e fluxo pós-exposição antes das combinações A–E.';
    }
    return 'Decore primeiro — item central cobrado nesta prova.';
  }
  if (index === total - 1) {
    if (profile === 'calc') {
      return 'Última lente: feche o raciocínio e volte ao enunciado com o trio na cabeça.';
    }
    return 'Última lente: volte ao enunciado e confira o gabarito.';
  }
  return `Lente ${index + 1} de ${total} — avance só quando esta relação estiver automática.`;
}

/** Test helper: detecta vazamento de dicas de Cálculos em perfis não-calc. */
export function softLensHintLeaksCalcProfile(hint: string, profile: SoftLensHintProfile): boolean {
  return profile !== 'calc' && CALC_FORBIDDEN.test(hint);
}
