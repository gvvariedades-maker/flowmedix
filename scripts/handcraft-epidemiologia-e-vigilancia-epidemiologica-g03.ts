/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g03 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g03.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g03';
const DIR = path.join('data/catalog-migration', LOTE, 'questions');
const SUB = 'Epidemiologia e Vigilância Epidemiológica';
const TOPICO = 'Enfermagem';

const GUIA = {
  id: 'guia-vigilancia-saude-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de Vigilância em Saúde',
  year: 2022,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_vigilancia_saude_5ed_2022.pdf',
};
const LISTA = {
  id: 'lista-nacional-notificacao-compulsoria',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Lista Nacional de Notificação Compulsória',
  year: 2020,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
};
const LEI8080 = {
  id: 'lei-8080-1990',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei n. 8.080/1990 — vigilância epidemiológica',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
};
const RSI = {
  id: 'regulamento-sanitario-internacional',
  tier: 'A' as const,
  issuer: 'OMS / MS',
  title: 'Regulamento Sanitário Internacional — notificação e medidas de isolamento/quarentena',
  year: 2005,
  url: 'https://www.gov.br/anvisa/pt-br/assuntos/paf/regulamento-sanitario-internacional',
};

type Item = { label: string; detail?: string; icon?: string; correct?: string };
type Row = { label: string; value: string; badge?: string };

const slideMeta = () => ({ topico: TOPICO, subtopico: SUB });
const conceptMap = (title: string, items: Item[], footer: string) => ({
  type: 'concept_map' as const,
  slide_title: title,
  meta: slideMeta(),
  items,
  footer_rule: footer,
});
const logicFlow = (steps: string[], footer: string) => ({
  type: 'logic_flow' as const,
  reveal_mode: 'tap' as const,
  meta: slideMeta(),
  steps,
  footer_rule: footer,
});
const goldenRule = (title: string, content: string, rows: Row[], footer: string) => ({
  type: 'golden_rule' as const,
  slide_title: title,
  subject: 'Enfermagem',
  meta: slideMeta(),
  content,
  rows,
  footer_rule: footer,
});
const dangerZone = (content: string, items: Item[], footer: string) => ({
  type: 'danger_zone' as const,
  bullet_style: 'x_icon' as const,
  meta: slideMeta(),
  content,
  items,
  footer_rule: footer,
});

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
    file: 'avancasp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Critérios MS para incluir agravo na lista de notificação: magnitude, gravidade, severidade, transcendência (e risco à saúde pública). Invulnerabilidade NÃO é critério.',
    sources: [{ ...LISTA, covers: ['critérios de inclusão na lista', 'magnitude', 'transcendência'] }],
    slides: [
      conceptMap(
        'Critérios para entrar na lista — EXCETO',
        [
          { label: 'Comando', detail: 'Aspectos considerados para incorporar doença/agravo à lista nacional — salvo um.', icon: 'ClipboardList' },
          { label: 'Critérios reais', detail: 'Magnitude, gravidade, severidade e transcendência entram no rol do MS.', icon: 'CheckCircle2' },
          { label: 'Risco coletivo', detail: 'Potencial de surto/epidemia, causa desconhecida ou mudança de padrão clínico-epidemiológico.', icon: 'Activity' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Colocar um termo “bonito” que não é critério oficial (invulnerabilidade).', icon: 'AlertTriangle' },
        ],
        'EXCETO: ache o nome que NÃO é critério de inclusão',
      ),
      logicFlow(
        [
          'Comando EXCETO: qual aspecto NÃO entra nos critérios do MS.',
          'Manter magnitude, gravidade, severidade e transcendência como critérios válidos.',
          'Isolar invulnerabilidade — não é critério de inclusão na lista.',
          'Marcar E.',
          'Em similares: em EXCETO de lista, elimine o termo inventado/fora do rol oficial.',
        ],
        'EXCETO → invulnerabilidade fora do rol',
      ),
      goldenRule(
        'Rol oficial × intruso',
        'Decore o que entra',
        [
          { label: 'Entram', value: 'Magnitude · gravidade · severidade · transcendência.', badge: 'ok' },
          { label: 'Também pesa', value: 'Risco de surto, causa desconhecida, mudança de padrão.', badge: 'ok' },
          { label: 'Não entra', value: 'Invulnerabilidade (termo fora do critério MS).', badge: 'warn' },
        ],
        'Invulnerabilidade = intruso',
      ),
      dangerZone(
        'PEGADINHAS — critérios da lista',
        [
          {
            label: 'Letra A — magnitude',
            detail: 'Aponta magnitude como o EXCETO.',
            correct: 'Magnitude é critério válido de inclusão — não é o salvo.',
          },
          {
            label: 'Letra B — gravidade',
            detail: 'Aponta gravidade como o EXCETO.',
            correct: 'Gravidade faz parte do rol oficial do MS.',
          },
          {
            label: 'Letra C — severidade',
            detail: 'Aponta severidade como o EXCETO.',
            correct: 'Severidade também é aspecto considerado na inclusão.',
          },
          {
            label: 'Letra D — transcendência',
            detail: 'Aponta transcendência como o EXCETO.',
            correct: 'Transcendência é critério clássico — o intruso é invulnerabilidade.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: troca invulnerabilidade por “imunidade coletiva” como falso critério.',
            correct: 'Pergunte: esse termo aparece no rol MS de inclusão na lista?',
          },
        ],
        'Marcar critério verdadeiro como EXCETO → distrator',
      ),
    ],
  },
  {
    file: 'avancasp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Indicador de saúde = medida quantitativa (ex.: taxa de mortalidade). Avaliar processo, impacto ou investigar risco/agente são ações/objetos — não o exemplo de indicador pedido.',
    sources: [{ ...GUIA, covers: ['indicadores de saúde', 'mortalidade'] }],
    slides: [
      conceptMap(
        'O que é (e não é) indicador de saúde',
        [
          { label: 'Pergunta', detail: 'Exemplo de indicador usado na descrição das condições de saúde da população.', icon: 'BarChart3' },
          { label: 'Indicador', detail: 'Medida numérica que resume um fenômeno (taxas, coeficientes, proporções).', icon: 'Hash' },
          { label: 'Não é indicador', detail: 'Avaliar processo, impacto do saneamento ou investigar risco/agente — são ações.', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar o indicador pela atividade de investigação/avaliação.', icon: 'AlertTriangle' },
        ],
        'Indicador = número; investigação = ação',
      ),
      logicFlow(
        [
          'Comando pede exemplo de indicador de saúde.',
          'Eliminar opções que descrevem avaliação ou investigação (processo, saneamento, risco, agente).',
          'Manter a taxa de mortalidade — medida clássica de indicador.',
          'Marcar E.',
          'Em similares: se a alternativa não traz taxa/coeficiente/proporção, desconfie.',
        ],
        'Taxa de mortalidade = indicador',
      ),
      goldenRule(
        'Filtro rápido',
        'Como reconhecer o indicador',
        [
          { label: 'Sim', value: 'Taxa de mortalidade (e similares: incidência, prevalência).', badge: 'ok' },
          { label: 'Não', value: 'Avaliação de processo/impacto ou investigação de risco/agente.', badge: 'warn' },
          { label: 'Pergunta-teste', value: 'Isso é um número sintetizador ou uma ação de estudo?', badge: 'ok' },
        ],
        'Número sintetizador = indicador',
      ),
      dangerZone(
        'PEGADINHAS — indicador × ação',
        [
          {
            label: 'Letra A — processo saúde-doença',
            detail: 'Avaliação do processo saúde-doença.',
            correct: 'É objeto/ação de análise — não um indicador numérico.',
          },
          {
            label: 'Letra B — impacto do saneamento',
            detail: 'Avaliação do impacto do saneamento básico.',
            correct: 'Avaliar impacto é atividade; o indicador seria, por exemplo, uma taxa associada.',
          },
          {
            label: 'Letra C — fatores de risco',
            detail: 'Investigação de fatores de risco.',
            correct: 'Investigar risco é função/atividade, não o exemplo de indicador.',
          },
          {
            label: 'Letra D — agentes etiológicos',
            detail: 'Investigação de agentes etiológicos.',
            correct: 'Investigação etiológica ≠ indicador de saúde da população.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “coeficiente de incidência” versus “rastrear contato”.',
            correct: 'Coeficiente/taxa = indicador; rastrear = ação.',
          },
        ],
        'Trocar indicador por ação → distrator',
      ),
    ],
  },
  {
    file: 'cebraspe-cespe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Morbidade = comportamento das doenças na população (prevalência/incidência). Endemia ≠ epidemia; vacinação de bloqueio ≠ nacional; investigação também no suspeito; agravo ≠ só DCNTs.',
    sources: [{ ...GUIA, covers: ['morbidade', 'endemia', 'investigação epidemiológica'] }],
    slides: [
      conceptMap(
        'Saúde coletiva — conceitos que a banca troca',
        [
          { label: 'Comando', detail: 'Assinalar a opção correta sobre assistência em saúde coletiva (MS).', icon: 'BookOpen' },
          { label: 'Morbidade', detail: 'Comportamento das doenças na população — ligada a incidência e prevalência.', icon: 'Activity' },
          { label: 'Ocorrência', detail: 'Endemia = presença habitual; epidemia = excesso acima do esperado.', icon: 'Map' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar endemia por epidemia ou bloquear vacina “no país todo”.', icon: 'AlertTriangle' },
        ],
        'Separe morbidade, ocorrência e momento da investigação',
      ),
      logicFlow(
        [
          'Eliminar: agravo só como DCNT não transmissível (definição estreita demais).',
          'Eliminar: endemia descrita como aumento muito acima do esperado (isso é epidemia).',
          'Eliminar: vacinação de bloqueio como cobertura nacional de todos os suscetíveis.',
          'Eliminar: investigação só após confirmação (suspeito também dispara investigação).',
          'Validar: morbidade ligada a prevalência e incidência na população.',
          'Marcar B.',
          'Em similares: se a frase troca endemia↔epidemia, mate a alternativa.',
        ],
        'Morbidade + incidência/prevalência → B',
      ),
      goldenRule(
        'Âncoras Cebraspe',
        'O que guardar',
        [
          { label: 'Morbidade', value: 'Doença na população → incidência e prevalência.', badge: 'ok' },
          { label: 'Endemia', value: 'Presença habitual em área — não o pico epidêmico.', badge: 'warn' },
          { label: 'Investigação', value: 'Pode começar no caso suspeito.', badge: 'ok' },
        ],
        'Não troque endemia por epidemia',
      ),
      dangerZone(
        'PEGADINHAS — saúde coletiva',
        [
          {
            label: 'Letra A — agravo = só DCNT',
            detail: 'Agravo só como hipertensão/diabetes.',
            correct: 'A definição de agravo na saúde coletiva não se reduz a DCNTs não transmissíveis.',
          },
          {
            label: 'Letra C — endemia = pico',
            detail: 'Endemia como aumento muito acima do esperado e sem limite regional.',
            correct: 'Isso descreve epidemia/pandemia — não endemia.',
          },
          {
            label: 'Letra D — bloqueio nacional',
            detail: 'Vacinação de bloqueio em toda a população suscetível do país.',
            correct: 'Bloqueio é estratégia local/ao redor do caso — não vacinação nacional ampla.',
          },
          {
            label: 'Letra E — só após confirmação',
            detail: 'Investigação só depois de confirmar o caso.',
            correct: 'A investigação epidemiológica também se inicia perante suspeita.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “surto = endemia localizada”.',
            correct: 'Cheque a escala: habitual × excesso × área.',
          },
        ],
        'Trocar rótulo de ocorrência → distrator',
      ),
    ],
  },
  {
    file: 'cebraspe-cespe-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-6.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'RSI/MS: casos suspeitos ou confirmados de doenças que possam exigir isolamento ou quarentena são de notificação compulsória às autoridades sanitárias. Item CERTO.',
    sources: [
      { ...RSI, covers: ['isolamento', 'quarentena', 'notificação'] },
      { ...LISTA, covers: ['notificação compulsória', 'caso suspeito'] },
    ],
    slides: [
      conceptMap(
        'Certo/Errado — RSI e notificação',
        [
          { label: 'Item', detail: 'Suspeitos ou confirmados de doenças com possível isolamento/quarentena → notificação compulsória.', icon: 'Scale' },
          { label: 'Âncora RSI', detail: 'Regulamento Sanitário Internacional orienta comunicação rápida desses eventos.', icon: 'Globe' },
          { label: 'Suspeito conta', detail: 'A obrigação não espera só o caso confirmado.', icon: 'Bell' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Julgar ERRADO porque “só confirmado notifica”.', icon: 'AlertTriangle' },
        ],
        'Suspeito + risco de isolamento/quarentena → notifica',
      ),
      logicFlow(
        [
          'Ler o item: suspeitos ou confirmados com possível isolamento/quarentena.',
          'Confrontar com RSI/lista: esses eventos exigem notificação às autoridades.',
          'Não exigir confirmação laboratorial para negar o item.',
          'Conclusão: o item está certo.',
          'Marcar A.',
          'Em similares: se o texto une suspeito + medida de contenção internacional, tende a CERTO.',
        ],
        'Item alinhado ao RSI → Certo',
      ),
      goldenRule(
        'Filtro Certo/Errado',
        'Quando marcar Certo',
        [
          { label: 'Gatilho', value: 'Suspeito ou confirmado + isolamento/quarentena possíveis.', badge: 'ok' },
          { label: 'Ação', value: 'Notificação compulsória às autoridades sanitárias.', badge: 'ok' },
          { label: 'Armadilha', value: 'Exigir confirmação para “salvar” o Errado.', badge: 'warn' },
        ],
        'Suspeito também notifica',
      ),
      dangerZone(
        'PEGADINHAS — Certo/Errado',
        [
          {
            label: 'Letra B — Errado',
            detail: 'Julga o item falso.',
            correct: 'O enunciado reproduz obrigação sanitária válida — a resposta é Certo.',
          },
          {
            label: 'Transferência',
            detail: 'Em outro C/E: “só notifica depois do isolamento instaurado”.',
            correct: 'Notificação e medida de contenção caminham juntas — não espere a medida para comunicar.',
          },
        ],
        'Negar o suspeito → distrator',
      ),
    ],
  },
  {
    file: 'cetrede-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Lei 8.080/1990: vigilância epidemiológica = conjunto de ações para conhecer/detectar/prevenir mudanças nos determinantes, visando recomendar/adotar prevenção e controle.',
    sources: [{ ...LEI8080, covers: ['definição de vigilância epidemiológica', 'prevenção', 'controle'] }],
    slides: [
      conceptMap(
        'Complete a definição legal',
        [
          { label: 'Fonte', detail: 'Texto adaptado da Lei 8.080/1990 (planalto).', icon: 'ScrollText' },
          { label: 'Lacuna 1', detail: 'Nome do conjunto de ações (conhecer, detectar, prevenir mudanças).', icon: 'Search' },
          { label: 'Lacunas 2–3', detail: 'Finalidade: recomendar e adotar medidas de ___ e ___.', icon: 'Shield' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar epidemiológica por sanitária/ambiental ou inverter prevenção/controle.', icon: 'AlertTriangle' },
        ],
        'VE + prevenção + controle',
      ),
      logicFlow(
        [
          'Ler a definição: conhecimento/detecção/prevenção de mudanças nos determinantes.',
          'Primeira lacuna = vigilância epidemiológica (não sanitária/ambiental).',
          'Finalidade = prevenção e controle das doenças/agravos.',
          'Eliminar toxicológica e combinações sem relação com a lei.',
          'Marcar A.',
          'Em similares: se a frase cita determinantes de saúde e medidas, é VE.',
        ],
        'vigilância epidemiológica / prevenção / controle',
      ),
      goldenRule(
        'Três peças da lacuna',
        'Decore a ordem',
        [
          { label: 'Nome', value: 'Vigilância epidemiológica.', badge: 'ok' },
          { label: 'Finalidade', value: 'Prevenção e controle.', badge: 'ok' },
          { label: 'Não confundir', value: 'Vigilância sanitária ou ambiental no lugar da epidemiológica.', badge: 'warn' },
        ],
        'VE → prevenção + controle',
      ),
      dangerZone(
        'PEGADINHAS — lacunas da lei',
        [
          {
            label: 'Letra B — sanitária',
            detail: 'vigilância sanitária / controle / acompanhamento.',
            correct: 'O texto legal descreve vigilância epidemiológica — não sanitária.',
          },
          {
            label: 'Letra C — ambiental',
            detail: 'vigilância ambiental / prevenção / controle.',
            correct: 'Ambiental não é o preenchimento da definição de VE da 8.080.',
          },
          {
            label: 'Letra D — toxicológica',
            detail: 'assistência toxicológica / controle / prevenção.',
            correct: 'Fora do conceito legal de vigilância epidemiológica.',
          },
          {
            label: 'Letra E — mistura',
            detail: 'saúde do trabalhador/criança + toxicológica + VE.',
            correct: 'Combinação inventada — não completa as lacunas da lei.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “promoção e reabilitação” no lugar de prevenção/controle.',
            correct: 'A finalidade clássica na definição é prevenção e controle.',
          },
        ],
        'Trocar o nome da vigilância → distrator',
      ),
    ],
  },
  {
    file: 'cetrede-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Cólera: notificação imediata (até 24h) às três esferas — Ministério da Saúde, Secretaria Estadual e Secretaria Municipal.',
    sources: [{ ...LISTA, covers: ['cólera', 'notificação imediata', 'esferas de governo'] }],
    slides: [
      conceptMap(
        'Cólera — para quem e em quanto tempo',
        [
          { label: 'Agravo', detail: 'Casos de cólera na lista de notificação compulsória.', icon: 'Droplets' },
          { label: 'Relógio', detail: 'Imediata — até 24 horas.', icon: 'Clock' },
          { label: 'Destino', detail: 'Municipal + estadual + Ministério da Saúde.', icon: 'Building2' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Deixar só o município ou trocar imediata por semanal.', icon: 'AlertTriangle' },
        ],
        '24h e as três esferas',
      ),
      logicFlow(
        [
          'Objeto: periodicidade e destinatários da notificação de cólera.',
          'Eliminar opções semanais (município e/ou estado).',
          'Eliminar imediata só para município ou só município+estado.',
          'Manter imediata 24h para MS + SES + SMS.',
          'Marcar E.',
          'Em similares: cólera = imediata e sobe as três esferas.',
        ],
        'Cólera → imediata 24h → três esferas',
      ),
      goldenRule(
        'Relógio e destino',
        'Decore o combo',
        [
          { label: 'Quando', value: 'Imediatamente, em até 24 horas.', badge: 'ok' },
          { label: 'Para quem', value: 'Ministério da Saúde + SES + SMS.', badge: 'ok' },
          { label: 'Armadilha', value: 'Semanal ou só uma/duas secretarias.', badge: 'warn' },
        ],
        '24h · MS · Estado · Município',
      ),
      dangerZone(
        'PEGADINHAS — notificação da cólera',
        [
          {
            label: 'Letra A — semanal só município',
            detail: 'Semanalmente só para a SMS.',
            correct: 'Cólera não é semanal e não para só no município.',
          },
          {
            label: 'Letra B — semanal estado+município',
            detail: 'Semanalmente para SES e SMS.',
            correct: 'Periodicidade errada e falta o Ministério da Saúde.',
          },
          {
            label: 'Letra C — imediata só município',
            detail: 'Imediata 24h só para a SMS.',
            correct: 'O relógio está certo, mas faltam estado e Ministério.',
          },
          {
            label: 'Letra D — imediata sem MS',
            detail: 'Imediata 24h para SES e SMS.',
            correct: 'Falta notificar também o Ministério da Saúde.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “febre amarela só para o município”.',
            correct: 'Agravo imediato costuma exigir as esferas previstas na lista — leia o destino.',
          },
        ],
        'Cortar esfera ou trocar por semanal → distrator',
      ),
    ],
  },
  {
    file: 'cetrede-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Intoxicações exógenas: notificação compulsória; exposição a substâncias químicas (agrotóxicos, medicamentos, produtos domésticos/industriais, etc.) com clínica e/ou lab compatíveis.',
    sources: [{ ...LISTA, covers: ['intoxicações exógenas', 'notificação compulsória'] }],
    slides: [
      conceptMap(
        'Complete a lacuna — intoxicação notificável',
        [
          { label: 'Definição', detail: 'Exposição a substâncias químicas com sinais/sintomas e/ou alterações laboratoriais compatíveis.', icon: 'FlaskConical' },
          { label: 'Contexto', detail: 'Evento de notificação compulsória relevante para agentes de combate às endemias.', icon: 'Bell' },
          { label: 'Exemplos de exposição', detail: 'Agrotóxicos, medicamentos, produtos domésticos, industriais, plantas, alimentos.', icon: 'List' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar exógena por endógena ou por acidente com peçonhentos.', icon: 'AlertTriangle' },
        ],
        'Exógena = de fora → notifica',
      ),
      logicFlow(
        [
          'Ler a definição: exposição a substâncias químicas externas + clínica/lab.',
          'Eliminar acidentes de altura e câncer de pele (fora da definição).',
          'Eliminar intoxicações endógenas (origem interna — não é o termo).',
          'Eliminar acidentes com animais peçonhentos (outro evento).',
          'Preencher com intoxicações exógenas.',
          'Marcar D.',
          'Em similares: química de fora + notificação → intoxicação exógena.',
        ],
        'Lacuna = intoxicações exógenas',
      ),
      goldenRule(
        'Exógena × vizinhos',
        'Decore o termo',
        [
          { label: 'Exógena', value: 'Substância química externa + clínica/lab → notifica.', badge: 'ok' },
          { label: 'Não é', value: 'Endógena · queda de altura · câncer de pele · peçonhentos.', badge: 'warn' },
        ],
        'Exógena = exposição química externa',
      ),
      dangerZone(
        'PEGADINHAS — lacuna da intoxicação',
        [
          {
            label: 'Letra A — alturas',
            detail: 'Acidentes de alturas.',
            correct: 'Não corresponde à definição de exposição química com intoxicação.',
          },
          {
            label: 'Letra B — endógenas',
            detail: 'Intoxicações endógenas.',
            correct: 'Endógena não é o termo da definição (exposição a substâncias externas).',
          },
          {
            label: 'Letra C — câncer de pele',
            detail: 'Cânceres de pele.',
            correct: 'Fora do conceito de intoxicação por substância química descrita.',
          },
          {
            label: 'Letra E — peçonhentos',
            detail: 'Acidentes com animais peçonhentos.',
            correct: 'É outro agravo notificável — não preenche esta lacuna.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “intoxicação alimentar” genérica sem o termo exógena.',
            correct: 'Ancore na palavra exógena + lista de substâncias químicas.',
          },
        ],
        'Trocar exógena por vizinho → distrator',
      ),
    ],
  },
  {
    file: 'cetrede-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Funções da VE: coleta de dados (e ciclo contínuo de análise, interpretação, recomendação e disseminação). Geoprocessamento/prognóstico/não divulgação não são a função-base pedida.',
    sources: [{ ...GUIA, covers: ['funções da vigilância epidemiológica', 'coleta de dados'] }],
    slides: [
      conceptMap(
        'Funções da vigilância epidemiológica',
        [
          { label: 'Ciclo', detail: 'Funções específicas e intercomplementares em modo contínuo.', icon: 'RefreshCw' },
          { label: 'Objetivo', detail: 'Conhecer o comportamento do agravo e disparar intervenção a tempo.', icon: 'Target' },
          { label: 'Base do ciclo', detail: 'Coleta de dados alimenta análise, recomendação e disseminação.', icon: 'Database' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar coleta por geoprocessamento ou “não divulgar”.', icon: 'AlertTriangle' },
        ],
        'Sem coleta não há ciclo de VE',
      ),
      logicFlow(
        [
          'Comando: função da vigilância epidemiológica.',
          'Eliminar geoprocessamento isolado e análise só de dados geoprocessados.',
          'Eliminar “medidas prognósticas” e a não divulgação de informações.',
          'Manter coleta de dados — função clássica do ciclo.',
          'Marcar B.',
          'Em similares: a função mais básica do ciclo costuma ser coletar.',
        ],
        'Função-base = coleta de dados',
      ),
      goldenRule(
        'Ciclo em uma linha',
        'O que não esquecer',
        [
          { label: 'Coletar', value: 'Entrada contínua de dados do agravo.', badge: 'ok' },
          { label: 'Segue', value: 'Analisar → recomendar → disseminar → intervir.', badge: 'ok' },
          { label: 'Não é', value: 'Omitir informação pertinente.', badge: 'warn' },
        ],
        'Coleta abre o ciclo',
      ),
      dangerZone(
        'PEGADINHAS — funções da VE',
        [
          {
            label: 'Letra A — geoprocessamento',
            detail: 'Geoprocessamento de dados coletados.',
            correct: 'Pode apoiar, mas não é a função-base cobrada — a coleta vem antes.',
          },
          {
            label: 'Letra C — só geoanalise',
            detail: 'Análise e interpretação dos dados geoprocessados.',
            correct: 'Recorta demais o ciclo; a alternativa correta é a coleta.',
          },
          {
            label: 'Letra D — prognóstico',
            detail: 'Recomendação das medidas prognósticas apropriadas.',
            correct: 'A VE recomenda medidas de prevenção/controle — “prognósticas” desloca o foco.',
          },
          {
            label: 'Letra E — não divulgar',
            detail: 'A não divulgação de informações pertinentes.',
            correct: 'Disseminar informação pertinente é parte do ciclo — não ocultar.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só notificar” no lugar de coletar/analisar.',
            correct: 'Notificar é peça; o ciclo começa na coleta sistemática.',
          },
        ],
        'Substituir coleta por ferramenta/omissão → distrator',
      ),
    ],
  },
];

function applyPatch(patch: Patch) {
  const filePath = path.join(DIR, patch.file);
  const questao = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  const meta = { ...(questao.meta as Record<string, unknown>) };
  meta.content_standard = 'golden-v1';
  meta.family = patch.family;
  meta.pedagogical_branch = patch.pedagogical_branch;
  meta.subtopico = SUB;
  meta.topico = TOPICO;
  meta.content_review = {
    reviewed_at: '2026-08-03',
    reviewer: 'cursor-grok-4.5-epi-g03',
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
  if (!fs.existsSync(DIR)) throw new Error(`missing ${DIR}`);
  for (const patch of PATCHES) applyPatch(patch);
  console.log(`\nHandcraft ${LOTE}: ${PATCHES.length} slugs (Cursor Grok 4.5).`);
}

main();
