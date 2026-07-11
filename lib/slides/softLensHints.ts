import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';

export type SoftLensHintProfile =
  | 'calc'
  | 'via'
  | 'ist'
  | 'sae'
  | 'adolescent'
  | 'farmaco'
  | 'trabalho'
  | 'respiratorio'
  | 'urgencias'
  | 'urgencias_trauma'
  | 'urgencias_avc'
  | 'urgencias_choque'
  | 'urgencias_engasgo'
  | 'urgencias_pediatric'
  | 'urgencias_manchester'
  | 'urgencias_protocol'
  | 'urgencias_exceto'
  | 'cam_exceto'
  | 'cam_documentacao'
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
    case 'respiratorio':
      return inferRespiratorioExamHint(row);
    case 'urgencias':
      return inferUrgenciasExamHint(row);
    case 'urgencias_trauma':
      return inferUrgenciasTraumaExamHint(row);
    case 'urgencias_avc':
      return inferUrgenciasAvcExamHint(row);
    case 'urgencias_choque':
      return inferUrgenciasChoqueExamHint(row);
    case 'urgencias_engasgo':
      return inferUrgenciasEngasgoExamHint(row);
    case 'urgencias_pediatric':
      return inferUrgenciasPediatricExamHint(row);
    case 'urgencias_manchester':
      return inferUrgenciasManchesterExamHint(row);
    case 'urgencias_protocol':
      return inferUrgenciasProtocolExamHint(row);
    case 'urgencias_exceto':
      return inferUrgenciasExcetoExamHint(row);
    case 'cam_exceto':
      return inferCamExcetoExamHint(row);
    case 'cam_documentacao':
      return inferCamDocumentacaoExamHint(row);
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

function inferRespiratorioExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/88.?92|spo2|sato2|retentor|hipercapnia/.test(text)) {
    return 'Pegadinha clássica DPOC: alvo 88–92% — não forçar ≥95% como em paciente sem retenção crônica.';
  }
  if (/\bdpoc\b|enfisema|bronquite cr[oô]nica/.test(text)) {
    return 'DPOC: O₂ titulado em baixo fluxo — hiperóxia indiscriminada é erro frequente em prova.';
  }
  if (/\basma\b|beta[\s-]?2|salbutamol|resgate|broncoespasmo/.test(text)) {
    return 'Asma: broncodilatador de resgate na crise — não confundir com corticoide de manutenção.';
  }
  if (/gasometria|pao2|paco2|arterial/.test(text)) {
    return 'Oximetria de pulso ≠ gasometria — SpO₂ não mede PaO₂/PaCO₂ diretamente.';
  }
  if (/espacador|espaçador|inalador|pico de fluxo|peak flow/.test(text)) {
    return 'Técnica inalatória e dispositivos são cobrados na APS — espaçador melhora deposição.';
  }
  if (/tabag|cessa[cç][aã]o/.test(text)) {
    return 'Tabagismo ativo piora asma e DPOC — orientação faz parte do cuidado na atenção básica.';
  }
  if (/gabarito|i e ii|resposta final|verdadeira/.test(text)) {
    return 'Gabarito: marque só as afirmativas corretas — III costuma inverter alvo de SpO₂ ou técnica de O₂.';
  }
  if (/^i\b|^ii\b|^iii\b/.test(text) || /afirmativa/.test(text)) {
    return 'Julgue cada afirmativa pelo PCDT — separe asma (resgate) de DPOC (O₂ titulado).';
  }
  return neutralExamHint(row);
}

function inferUrgenciasExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/30:2|propor[cç][aã]o/i.test(text)) {
    return 'Eixo central do SBV com 2 socorristas — 30 compressões : 2 ventilações sem via aérea avançada.';
  }
  if (/100.?120|frequ[eê]ncia|batimento/i.test(text)) {
    return 'Pegadinha clássica: 80–100/min é protocolo antigo — AHA 2020 cobra 100–120 compressões/min.';
  }
  if (/5.?6\s*cm|profundidade|4\s*cm/i.test(text)) {
    return 'Adulto: pelo menos 5 cm até 6 cm com retorno completo do tórax — 4 cm subestima.';
  }
  if (/pulso|2\s*min|ciclo/i.test(text)) {
    return 'Não parar a cada ciclo 30:2 — verificar pulso após ~2 min de RCP contínua.';
  }
  if (/dea|desfibril|choque/i.test(text)) {
    return 'DEA assim que disponível — não atrasar por “terminar ciclos” manuais.';
  }
  if (/alternar|compressor|fadiga/i.test(text)) {
    return 'Trocar quem comprime a cada ~2 min para manter qualidade — não a cada 5 min.';
  }
  if (/um socorrista|cont[ií]nuas/i.test(text)) {
    return 'Sozinho: compressões contínuas; ventilar se treinado — não é o foco do 30:2.';
  }
  if (/gabarito|verdadeira|letra/i.test(text)) {
    return 'Cruze cada parâmetro com a alternativa — números trocados são a pegadinha típica.';
  }
  return neutralExamHint(row);
}

function inferUrgenciasTraumaExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/hemorragia|torniquete|compress[aã]o/i.test(text)) {
    return 'Hemorragia de membro: compressão direta; torniquete no membro se massiva — nunca no pescoço.';
  }
  if (/fratura|imobiliza|tra[cç][aã]o/i.test(text)) {
    return 'Fratura: imobilizar na posição encontrada — tração vigorosa agrava lesão vascular/nervosa.';
  }
  if (/corpo estranho|objeto|retirar/i.test(text)) {
    return 'Objeto encravado: estabilizar e transportar — retirada no local pode descontrolar sangramento.';
  }
  if (/queimadura|[áa]gua corrente|gelo|manteiga|caseir/i.test(text)) {
    return 'Queimadura: água corrente em temperatura ambiente — proibir gelo, pasta e substâncias caseiras.';
  }
  if (/xabcde|^x\b|exsanguin/i.test(text)) {
    return 'X vem antes de A–E: controle de hemorragia exsanguinante é prioridade no trauma.';
  }
  if (/meta|estabilizar|samu|transporte/i.test(text)) {
    return 'Pré-hospitalar = não piorar — estabilizar até suporte avançado chegar.';
  }
  return neutralExamHint(row);
}

function inferUrgenciasAvcExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/face|sorriso|assimetria/i.test(text)) {
    return 'Face: sorriso assimétrico ou queda labial — primeiro eixo da Escala de Cincinnati.';
  }
  if (/bra[cç]o|arms|mmss/i.test(text)) {
    return 'Braços: elevar MMSS e observar queda ou fraqueza unilateral.';
  }
  if (/fala|speech|disartria|afasia/i.test(text)) {
    return 'Fala: repetir frase simples — disartria ou afasia indicam suspeita de AVC.';
  }
  if (/192|samu|tempo|positivo/i.test(text)) {
    return 'Qualquer item alterado → acionar emergência — tempo é cérebro.';
  }
  if (/fast\b/i.test(text)) {
    return 'FAST = Face · Arms · Speech · Time — paralelo internacional ao Cincinnati.';
  }
  if (/glasgow|ssvv|men[ií]ngea|iam/i.test(text)) {
    return 'Pegadinha: Glasgow, SSVV e tríade meníngea não compõem Cincinnati.';
  }
  return neutralExamHint(row);
}

function inferUrgenciasChoqueExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/passo 1|n[aã]o tocar|interromper|desligar|seguran[cç]a/i.test(text)) {
    return 'Choque elétrico: 1ª conduta é segurança da cena — interromper corrente antes de tocar.';
  }
  if (/isolante|energizada|fonte/i.test(text)) {
    return 'Socorrista não pode virar segunda vítima — afastar com material isolante se necessário.';
  }
  if (/rcp|respira[cç][aã]o|consci[eê]ncia/i.test(text)) {
    return 'ABC só após cena segura — RCP prematura em vítima energizada eletrocuta quem toca.';
  }
  if (/hipovol[eê]m|taquicardia|fria|fluido/i.test(text)) {
    return 'Em outra questão “choque” = hipoperfusão — aqui é acidente elétrico, não reposição volêmica.';
  }
  if (/arritmia|queimadura/i.test(text)) {
    return 'Lesão elétrica pode causar arritmia e queimaduras — monitorar e transportar.';
  }
  return neutralExamHint(row);
}

function inferUrgenciasEngasgoExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/sinal universal|pesco[cç]o|garganta/i.test(text)) {
    return 'Sinal universal: vítima leva as mãos ao pescoço — não confundir com local da manobra.';
  }
  if (/heimlich|abdominal/i.test(text)) {
    return 'Adulto consciente: compressões abdominais — socorrista age no abdome, vítima aponta o pescoço.';
  }
  if (/gestante|obeso|interescapular|tor[aá]cic/i.test(text)) {
    return 'Gestante/obeso: OVACE — golpes interescapulares + compressões torácicas.';
  }
  if (/inconsciente|rcp/i.test(text)) {
    return 'Inconsciente: iniciar RCP e checar boca antes de ventilar.';
  }
  if (/lactente|beb[eê]|costas/i.test(text)) {
    return 'Lactente: 5 tapas nas costas + 5 compressões torácicas — não Heimlich abdominal.';
  }
  return neutralExamHint(row);
}

function inferUrgenciasPediatricExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/15:2|propor[cç][aã]o.*2 socorristas/i.test(text)) {
    return 'Pediatria com 2 socorristas: 15:2 — não transferir 30:2 do adulto.';
  }
  if (/30:2.*1 socorrista|um socorrista/i.test(text)) {
    return 'Com um socorrista treinado, pediatria também usa 30:2 — mas a prova cobra 15:2 com dois.';
  }
  if (/ter[cç]o|1\/3|profundidade/i.test(text)) {
    return 'Profundidade pediátrica ≈ um terço do diâmetro AP — metade do tórax é pegadinha.';
  }
  if (/adulto|contraste|5.?6\s*cm/i.test(text)) {
    return 'Adulto = 30:2 + 5–6 cm — não aplicar na pediatria sem adaptar proporção e profundidade.';
  }
  if (/100.?120|frequ[eê]ncia|retorno/i.test(text)) {
    return 'Igual ao adulto: 100–120/min com retorno total do tórax entre compressões.';
  }
  return neutralExamHint(row);
}

function inferUrgenciasManchesterExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/vermelh/i.test(text)) {
    return 'Vermelho = imediato/emergência — prioridade máxima na triagem de massa.';
  }
  if (/amarel/i.test(text)) {
    return 'Amarelo = urgente/retardado — monitorar sinais e reavaliar; não dispensar vigilância.';
  }
  if (/verde/i.test(text)) {
    return 'Verde = leve/ambulante — menor prioridade; não confundir com transporte rápido.';
  }
  if (/azul/i.test(text)) {
    return 'Azul = não urgente — nunca instabilidade crítica (isso é vermelho).';
  }
  if (/preto|[óo]bito|expectante/i.test(text)) {
    return 'Preto = óbito ou expectante em triagem de vítimas múltiplas.';
  }
  return neutralExamHint(row);
}

function inferUrgenciasProtocolExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/verdadeira|falsa|v\/f|sequ[eê]ncia/i.test(text)) {
    return 'Julgue cada item antes de combinar letras — a banca inverte V/F ou troca a ordem.';
  }
  if (/epinefrina|adrenalina|im\b|intramuscular|coxa/i.test(text)) {
    return 'Anafilaxia: epinefrina IM na coxa é 1ª linha — IV só em PCR/choque refratário.';
  }
  if (/convuls|boca|objeto|imobiliz/i.test(text)) {
    return 'Crise: proteger cabeça, não introduzir objetos na boca, não imobilizar à força.';
  }
  if (/queimadura|pasta|gelo|manteiga|água corrente/i.test(text)) {
    return 'Primeiro socorro: água corrente por tempo adequado — vetar pasta caseira e gelo direto.';
  }
  return neutralExamHint(row);
}

function inferUrgenciasExcetoExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/exceto|incorreta|n[aã]o\s+[eé]/i.test(text)) {
    return 'EXCETO: cada distrator descreve conduta correta — só a letra gabarito é a exceção.';
  }
  if (/imobiliz|fratura|reposicion|for[cç]ar/i.test(text)) {
    return 'Trauma: imobilizar sem forçar alinhamento — microvariação de cláusula é pegadinha clássica.';
  }
  return neutralExamHint(row);
}

function inferCamExcetoExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/exceto|incorreta|n[aã]o\s+[eé]/i.test(text)) {
    return 'EXCETO preparo: quatro letras descrevem cuidado correto — só a exceção é o gabarito.';
  }
  if (/via oral|fisiol[oó]gica|vo\s*\+\s*sf|diluir.*oral/i.test(text)) {
    return 'Pegadinha clássica: VO não usa SF como veículo — mistura preparo com administração errada.';
  }
  if (/prescri[cç][aã]o|higieniza|lavar as m[aã]os|sala de medica/i.test(text)) {
    return 'Condutas corretas no preparo — banca usa uma alternativa absurda como exceção.';
  }
  return neutralExamHint(row);
}

function inferCamDocumentacaoExamHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/ap[oó]s administrar|somente ap[oó]s|certo\s*6/i.test(text)) {
    return 'Registro certo: documentar depois da dose administrada — horário, dose, via e identificação.';
  }
  if (/antes de administrar|antecipad|preparad/i.test(text)) {
    return 'Pegadinha: preparo na sala não autoriza registro antecipado — II costuma ser falsa.';
  }
  if (/posterg|plant[aã]o|lembrar a hora/i.test(text)) {
    return 'Registro não pode esperar o fim do plantão — memória não substitui prontuário.';
  }
  if (/gabarito|combina[cç][aã]o|i, apenas/i.test(text)) {
    return 'Julgue I–III antes da letra — só I é verdadeira nesta âncora.';
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
    if (profile === 'respiratorio') {
      return 'Fixe SpO₂ 88–92% (DPOC), O₂ titulado e resgate asma antes das combinações A–E.';
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
