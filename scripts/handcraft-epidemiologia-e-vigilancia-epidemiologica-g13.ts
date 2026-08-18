/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g13 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g13.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g13';
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
const BONITA = {
  id: 'bonita-epidemiologia-basica',
  tier: 'B' as const,
  issuer: 'OMS / Santos',
  title: 'Bonita, Beaglehole, Kjellström — Epidemiologia básica (2.ed.)',
  year: 2010,
  url: 'https://iris.who.int',
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
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Fator psicológico: estresse, desemprego, mudança de turno, relações humanas. Não misture com físico/biológico/químico/acidental.',
    sources: [{ ...BONITA, covers: ['epidemiologia ambiental', 'fatores ambientais', 'psicológico'] }],
    slides: [
      conceptMap(
        'Fator ambiental × exemplo certo',
        [
          { label: 'Tema', detail: 'Epidemiologia ambiental: relações entre ambiente e saúde nas populações.', icon: 'Leaf' },
          { label: 'Psicológico', detail: 'Estresse, desemprego, mudança de turno, relações humanas.', icon: 'Brain' },
          { label: 'Não misture', detail: 'Clima/ruído ≠ acidental; bactérias ≠ físico; tabaco ≠ biológico.', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Colar exemplos de um eixo no rótulo de outro.', icon: 'AlertTriangle' },
        ],
        'Psicológico = estresse/turno/relações',
      ),
      logicFlow(
        [
          'Comando: par fator ambiental + exemplos corretos.',
          'Eliminar acidental com clima/ruído; físico com microrganismos; biológico com químicos.',
          'Eliminar químico com velocidade/drogas.',
          'Manter psicológico: estresse, desemprego, turno, relações humanas.',
          'Marcar D.',
          'Em similares: confira se o rótulo casa com a natureza do exemplo.',
        ],
        'Psicológico correto → letra D',
      ),
      goldenRule(
        'Eixos sem trocar',
        'Decore',
        [
          { label: 'Psicológico', value: 'Estresse · desemprego · turno · relações.', badge: 'ok' },
          { label: 'Armadilha', value: 'Exemplos de outro eixo no rótulo errado.', badge: 'warn' },
        ],
        'Rótulo = natureza do exemplo',
      ),
      dangerZone(
        'PEGADINHAS — fatores ambientais',
        [
          {
            label: 'Letra A — acidental',
            detail: 'Acidental: clima, ruído, radiação, ergonomia.',
            correct: 'Esses exemplos são físicos/ambientais — não “acidental”.',
          },
          {
            label: 'Letra B — físico',
            detail: 'Físico: bactérias, vírus, parasitas.',
            correct: 'Microrganismos são biológicos — não físicos.',
          },
          {
            label: 'Letra C — biológico',
            detail: 'Biológico: tabaco, químicos, poeira, aditivos.',
            correct: 'São químicos/irritantes — não biológicos.',
          },
          {
            label: 'Letra E — químico',
            detail: 'Químico: situações perigosas, velocidade, drogas/álcool.',
            correct: 'Mistura acidental/comportamental — não o eixo químico puro.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “ruído = biológico”.',
            correct: 'Ruído é físico; biológico = agentes vivos.',
          },
        ],
        'Trocar rótulo do eixo → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Inquérito epidemiológico (seccional/amostral) quando dados são inadequados: notificação imprópria/deficiente ou mudança no comportamento epidemiológico da doença.',
    sources: [{ ...GUIA, covers: ['inquérito epidemiológico', 'notificação', 'estudo seccional'] }],
    slides: [
      conceptMap(
        'Quando fazer inquérito?',
        [
          { label: 'O que é', detail: 'Estudo seccional, em geral amostral, quando as informações existentes falham.', icon: 'ClipboardList' },
          { label: 'Motivos-chave', detail: 'Notificação imprópria/deficiente; mudança no comportamento epidemiológico.', icon: 'AlertCircle' },
          { label: 'Não é', detail: '“Baixa necessidade de controle” nem “só eficiência da notificação”.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Dizer que inquérito serve porque a notificação já é perfeita.', icon: 'AlertTriangle' },
        ],
        'Dados fracos ou mudança epi → inquérito',
      ),
      logicFlow(
        [
          'Comando: fatores que levam ao inquérito epidemiológico.',
          'Eliminar “baixa necessidade de controle” e “somente eficiência da notificação”.',
          'Eliminar opções que misturam recuperação de séries/busca inativa como motivo central.',
          'Manter: notificação imprópria/deficiente + mudança no comportamento epidemiológico.',
          'Marcar B.',
          'Em similares: inquérito preenche lacuna de informação — não celebra sistema perfeito.',
        ],
        'Notificação ruim + mudança epi → B',
      ),
      goldenRule(
        'Gatilhos do inquérito',
        'Decore',
        [
          { label: 'Sim', value: 'Notificação deficiente · mudança do comportamento da doença.', badge: 'ok' },
          { label: 'Não', value: 'Sistema já perfeito · “baixa necessidade” de controle.', badge: 'warn' },
        ],
        'Inquérito = informação insuficiente',
      ),
      dangerZone(
        'PEGADINHAS — inquérito',
        [
          {
            label: 'Letra A — baixa necessidade',
            detail: 'Baixa necessidade de medidas de controle.',
            correct: 'Não é motivo clássico para disparar inquérito.',
          },
          {
            label: 'Letra C — séries/busca',
            detail: 'Recuperação de séries históricas e busca inativa.',
            correct: 'Podem ocorrer em VE, mas não são o par cobrado nesta chave.',
          },
          {
            label: 'Letra D — vacinas fáceis',
            detail: 'Facilidade em avaliar coberturas/eficácia vacinal.',
            correct: 'Inquérito surge da insuficiência de dados — não da “facilidade”.',
          },
          {
            label: 'Letra E — só eficiência',
            detail: 'Somente a eficiência do sistema de notificação.',
            correct: 'Absolutiza e inverte: inquérito aparece quando a notificação falha.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: inquérito = coorte prospectiva longa.',
            correct: 'Aqui é seccional/amostral — corte no tempo.',
          },
        ],
        'Negar falha de notificação → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Papel dos estudos: padrão de disseminação + fatores de risco/determinantes + avaliar intervenções (prevenção, tratamento e controle).',
    sources: [{ ...GUIA, covers: ['epidemia', 'fatores de risco', 'intervenção'] }],
    slides: [
      conceptMap(
        'Estudos na identificação de epidemias',
        [
          { label: 'Disseminação', detail: 'Determinar o padrão de disseminação.', icon: 'Share2' },
          { label: 'Risco', detail: 'Identificar fatores de risco e seus determinantes.', icon: 'AlertTriangle' },
          { label: 'Intervenção', detail: 'Avaliar prevenção, tratamento e controle.', icon: 'Shield' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar “risco” por “investigação/associação” ou inverter os verbos.', icon: 'GitCompare' },
        ],
        'Disseminação · risco · intervenção',
      ),
      logicFlow(
        [
          'Montar a tríade correta: disseminação + fatores de risco + avaliação de intervenções.',
          'Eliminar “padrão de tratamento/prevenção” no lugar de disseminação.',
          'Eliminar “fatores de investigação/associação” no lugar de risco.',
          'Manter a sequência da letra D.',
          'Marcar D.',
          'Em similares: risco (exposição) ≠ associação genérica na redação da banca.',
        ],
        'Disseminação + risco + controle → D',
      ),
      goldenRule(
        'Três verbos',
        'Decore',
        [
          { label: '1', value: 'Padrão de disseminação.', badge: 'ok' },
          { label: '2', value: 'Fatores de risco e determinantes.', badge: 'ok' },
          { label: '3', value: 'Intervenções: prevenção, tratamento, controle.', badge: 'ok' },
        ],
        'Não troque risco por “associação”',
      ),
      dangerZone(
        'PEGADINHAS — papel dos estudos',
        [
          {
            label: 'Letra A — fatores de investigação',
            detail: 'Identificação de fatores de investigação.',
            correct: 'A redação correta é fatores de risco — não “investigação”.',
          },
          {
            label: 'Letra B — padrão de tratamento',
            detail: 'Determinação do padrão de tratamento.',
            correct: 'O primeiro eixo é disseminação — não tratamento.',
          },
          {
            label: 'Letra C — padrão de prevenção',
            detail: 'Determinação do padrão de prevenção.',
            correct: 'Inverte: prevenção entra na avaliação da intervenção.',
          },
          {
            label: 'Letra E — fatores de associação',
            detail: 'Identificação de fatores de associação.',
            correct: 'A banca quer fatores de risco — “associação” é distrator semântico.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: só descrever casos sem avaliar intervenção.',
            correct: 'Estudos também avaliam se a ação de controle funciona.',
          },
        ],
        'Trocar uma palavra da tríade → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Medidas de prevalência: úteis para necessidades/planejamento. Taxa de prevalência: útil em início insidioso/gradual. Não confunda com velocidade de incidência.',
    sources: [{ ...GUIA, covers: ['prevalência', 'incidência', 'indicadores'] }],
    slides: [
      conceptMap(
        'Prevalência: medida × taxa',
        [
          { label: 'Lembrete', detail: 'Incidência = casos novos; prevalência = novos + antigos num ponto/período.', icon: 'Layers' },
          { label: 'Medidas', detail: 'Úteis para avaliar necessidades e planejar serviços de saúde.', icon: 'Hospital' },
          { label: 'Taxa', detail: 'Útil em condições de início insidioso e gradual.', icon: 'Timer' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Dizer que prevalência mede a velocidade de novos eventos.', icon: 'AlertTriangle' },
        ],
        'Planejamento + início insidioso',
      ),
      logicFlow(
        [
          'Eliminar opções que atribuem à prevalência a “velocidade de novos eventos” (isso é incidência).',
          'Eliminar “taxa leva em conta tempo livre de doença” como definição desta chave.',
          'Manter: medidas para necessidades/planejamento + taxa útil no início insidioso.',
          'Marcar E.',
          'Em similares: prevalência = estoque; incidência = fluxo de novos.',
        ],
        'Planejamento + insidioso → E',
      ),
      goldenRule(
        'Uso da prevalência',
        'Decore',
        [
          { label: 'Medidas', value: 'Necessidades em saúde e planejamento.', badge: 'ok' },
          { label: 'Taxa', value: 'Útil no início insidioso/gradual.', badge: 'ok' },
          { label: 'Não é', value: 'Velocidade de casos novos (incidência).', badge: 'warn' },
        ],
        'Estoque ≠ velocidade',
      ),
      dangerZone(
        'PEGADINHAS — prevalência',
        [
          {
            label: 'Letra A — velocidade de antigos',
            detail: 'Velocidade com que antigos eventos ocorrem.',
            correct: 'Prevalência não é “velocidade” — e a 2ª parte também falha.',
          },
          {
            label: 'Letra B — velocidade de novos',
            detail: 'Velocidade de novos eventos + taxa útil no insidioso.',
            correct: 'Primeira parte descreve incidência — derruba B.',
          },
          {
            label: 'Letra C — novos + tempo livre',
            detail: 'Velocidade de novos + tempo livre de doença.',
            correct: 'Mistura incidência com ideia de pessoa-tempo — não é a chave.',
          },
          {
            label: 'Letra D — planejamento + tempo livre',
            detail: 'Planejamento ok, mas taxa = tempo livre de doença.',
            correct: 'A 2ª metade erra: a taxa útil aqui é no início insidioso.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: prevalência pontual × período.',
            correct: 'Ambas medem estoque; muda o recorte temporal.',
          },
        ],
        'Colar incidência na prevalência → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Epidemia = crescimento além do esperado; pandemia = âmbito global. Com avanço da vacinação, a chave desta prova: pode tornar-se endemia sazonal.',
    exam_vs_current: 'Chave da prova: endemia sazonal (letra C).',
    sources: [{ ...GUIA, covers: ['epidemia', 'pandemia', 'endemia', 'vacinação'] }],
    slides: [
      conceptMap(
        'Pandemia após vacinação → ?',
        [
          { label: 'Epidemia', detail: 'Crescimento abrupto além do esperado.', icon: 'TrendingUp' },
          { label: 'Pandemia', detail: 'Epidemia de âmbito global.', icon: 'Globe' },
          { label: 'Com vacinação', detail: 'Com o avanço da vacinação, pode transformar-se em endemia sazonal.', icon: 'Syringe' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Manter “pandemia regional/sazonal” como destino.', icon: 'AlertTriangle' },
        ],
        'Vacinação → endemia sazonal',
      ),
      logicFlow(
        [
          'Isolar o efeito do avanço da vacinação sobre uma pandemia.',
          'Eliminar pandemia regional/sazonal (continua pandemia).',
          'Eliminar epidemia regional/sazonal.',
          'Manter endemia sazonal.',
          'Marcar C.',
          'Em similares: endemia = presença habitual; sazonal = pico por estação.',
        ],
        'Endemia sazonal → letra C',
      ),
      goldenRule(
        'Escalas após controle vacinal',
        'Decore',
        [
          { label: 'Antes', value: 'Pandemia = epidemia global.', badge: 'warn' },
          { label: 'Depois', value: 'Endemia sazonal com vacinação avançada.', badge: 'ok' },
        ],
        'Global → habitual sazonal',
      ),
      dangerZone(
        'PEGADINHAS — destino da pandemia',
        [
          {
            label: 'Letra A — pandemia regional',
            detail: 'Uma pandemia regional.',
            correct: 'Continua no rótulo pandemia — não é o destino cobrado.',
          },
          {
            label: 'Letra B — pandemia sazonal',
            detail: 'Uma pandemia sazonal.',
            correct: 'Ainda pandemia; o destino correto é endemia sazonal.',
          },
          {
            label: 'Letra D — epidemia regional',
            detail: 'Uma epidemia regional.',
            correct: 'Não é a transformação apontada pela vacinação nesta questão.',
          },
          {
            label: 'Letra E — epidemia sazonal',
            detail: 'Uma epidemia sazonal.',
            correct: 'Epidemia = excesso; a resposta correta aponta endemia sazonal.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: eliminação × erradicação.',
            correct: 'Escalas diferentes — aqui o foco é endemia após controle vacinal.',
          },
        ],
        'Manter rótulo pandemia → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Relação dose-efeito: comumente, quanto maior a dose, mais grave/intenso o efeito. Não equalize indivíduo e grupo nem doses internas iguais.',
    sources: [{ ...BONITA, covers: ['dose-efeito', 'fatores ambientais', 'epidemiologia ambiental'] }],
    slides: [
      conceptMap(
        'Dose-efeito — a regra',
        [
          { label: 'Faixa', detail: 'Do pequeno desvio fisiológico até doença grave ou morte.', icon: 'Gauge' },
          { label: 'Regra', detail: 'Comumente: maior dose → efeito mais grave ou intenso.', icon: 'TrendingUp' },
          { label: 'Cuidado', detail: 'Indivíduo ≠ sempre o padrão do grupo; dose interna ≠ externa automática.', icon: 'Users' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Dizer que “raramente” a dose aumenta a gravidade.', icon: 'AlertTriangle' },
        ],
        'Maior dose → efeito mais intenso',
      ),
      logicFlow(
        [
          'Comando: conclusão correta da relação dose-efeito.',
          'Eliminar “a mesma para todo o grupo” e “doses internas sempre iguais”.',
          'Eliminar “raramente” e “indivíduo sempre = grupo”.',
          'Manter: comumente, maior dose → efeito mais grave/intenso.',
          'Marcar D.',
          'Em similares: dose-efeito orienta o planejamento do estudo ambiental.',
        ],
        'Maior dose, maior efeito → D',
      ),
      goldenRule(
        'Dose-efeito',
        'Decore',
        [
          { label: 'Comum', value: '↑ dose → ↑ gravidade/intensidade do efeito.', badge: 'ok' },
          { label: 'Não', value: 'Indivíduo = grupo · internas sempre iguais · “raramente”.', badge: 'warn' },
        ],
        'Dose sobe · efeito sobe',
      ),
      dangerZone(
        'PEGADINHAS — dose-efeito',
        [
          {
            label: 'Letra A — mesma no grupo',
            detail: 'Quanto maior a dose, a mesma será observada para todo o grupo.',
            correct: 'O efeito varia entre pessoas — não é idêntico no grupo.',
          },
          {
            label: 'Letra B — internas iguais',
            detail: 'Doses externas diferentes → internas sempre iguais.',
            correct: 'Dose interna pode diferir mesmo com externa diferente.',
          },
          {
            label: 'Letra C — raramente',
            detail: 'Raramente maior dose → efeito mais grave.',
            correct: 'A regra comum é o oposto: maior dose, maior efeito.',
          },
          {
            label: 'Letra E — indivíduo = grupo',
            detail: 'Relação do indivíduo sempre igual à do grupo.',
            correct: 'Curva individual pode diferir da observada no grupo.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: dose-resposta × dose-efeito.',
            correct: 'Efeito = gravidade; resposta pode falar em proporção afetada.',
          },
        ],
        'Negar o aumento do efeito → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563804667-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Potencial de disseminação = transmissibilidade + possibilidade de espalhar por vetores/fontes de infecção, colocando outros sob risco.',
    sources: [{ ...GUIA, covers: ['transmissibilidade', 'disseminação', 'vetores', 'fonte de infecção'] }],
    slides: [
      conceptMap(
        'Potencial de disseminação',
        [
          { label: 'Núcleo', detail: 'Transmissibilidade da doença.', icon: 'Share2' },
          { label: 'Como espalha', detail: 'Vetores e demais fontes de infecção sob risco da coletividade.', icon: 'Bug' },
          { label: 'Não basta', detail: 'Só prevalência alta ou “atuação dos serviços” sem transmissibilidade.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Definir disseminação só por frequência/prevalência.', icon: 'AlertTriangle' },
        ],
        'Transmissibilidade + vetores/fontes',
      ),
      logicFlow(
        [
          'Comando: o que expressa o potencial de disseminação.',
          'Eliminar opções centradas só em prevalência/incidência ou só em serviços.',
          'Eliminar misturas que trocam o eixo por “instrumentos de prevenção” isolados.',
          'Manter: transmissibilidade + disseminação por vetores/fontes sob risco.',
          'Marcar C.',
          'Em similares: potencial de espalhar ≠ magnitude já instalada (prevalência).',
        ],
        'Transmissibilidade + fontes → C',
      ),
      goldenRule(
        'Disseminação em uma linha',
        'Decore',
        [
          { label: 'Potencial', value: 'Transmissibilidade + vetores/fontes de infecção.', badge: 'ok' },
          { label: 'Não confunda', value: 'Só prevalência alta ou só capacidade do serviço.', badge: 'warn' },
        ],
        'Espalhar ≠ já estar frequente',
      ),
      dangerZone(
        'PEGADINHAS — disseminação',
        [
          {
            label: 'Letra A — só prevalência',
            detail: 'Elevada frequência traduzida pela prevalência.',
            correct: 'Frequência descreve magnitude — não o potencial de espalhar.',
          },
          {
            label: 'Letra B — só serviços',
            detail: 'Atuação dos serviços + transmissibilidade.',
            correct: 'Serviço importa no controle; o potencial em si é da doença/cadeia.',
          },
          {
            label: 'Letra D — incidência misturada',
            detail: 'Transmissibilidade + elevada frequência/incidência.',
            correct: 'Sobrecarrega com magnitude; a chave enfatiza vetores/fontes.',
          },
          {
            label: 'Letra E — só instrumentos',
            detail: 'Disponibilidade de instrumentos de prevenção + vetores.',
            correct: 'Instrumentos falam de controle — não definem o potencial sozinhos.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: infectividade × transmissibilidade.',
            correct: 'Infectividade = infectar o hospedeiro; transmissibilidade = passar adiante.',
          },
        ],
        'Trocar potencial por magnitude → distrator',
      ),
    ],
  },
  {
    file: 'furb-enfermagem-processo-de-enfermagem-1780011908736-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'I verdadeira: morbidade ajuda prevenção/controle pela distribuição. II falsa: inverte — incidência = casos novos; prevalência = totalidade/estoque.',
    exam_vs_current: 'Chave: I verdadeira e II falsa (letra C).',
    sources: [{ ...GUIA, covers: ['morbidade', 'incidência', 'prevalência', 'indicadores'] }],
    slides: [
      conceptMap(
        'I e II — onde está o erro',
        [
          { label: 'I', detail: 'Medidas de morbidade são fundamentais para prevenção/controle e distribuição.', icon: 'Check' },
          { label: 'II (erro)', detail: 'Troca os termos: chama totalidade de incidência e novos de prevalência.', icon: 'XCircle' },
          { label: 'Correto', detail: 'Incidência = casos novos; prevalência = totalidade (estoque).', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar II porque “fala de tempo e espaço”.', icon: 'AlertTriangle' },
        ],
        'I certa · II invertida',
      ),
      logicFlow(
        [
          'Avaliar I: morbidade para prevenção/controle via distribuição → Verdadeira.',
          'Avaliar II: totalidade = incidência e novos = prevalência → Falsa (invertido).',
          'Portanto: I verdadeira e II falsa.',
          'Marcar C.',
          'Em similares: se a justificativa inverte incidência/prevalência, mate a II.',
        ],
        'I V · II F → letra C',
      ),
      goldenRule(
        'Gabarito das asserções',
        'Decore',
        [
          { label: 'I', value: 'V — morbidade orienta prevenção/controle.', badge: 'ok' },
          { label: 'II', value: 'F — inverte incidência e prevalência.', badge: 'warn' },
        ],
        'Novos = incidência · estoque = prevalência',
      ),
      dangerZone(
        'PEGADINHAS — asserções',
        [
          {
            label: 'Letra A — I falsa',
            detail: 'I falsa e II verdadeira.',
            correct: 'I é verdadeira; II é que está invertida.',
          },
          {
            label: 'Letra B — ambas V sem nexo',
            detail: 'Ambas verdadeiras, mas II não justifica I.',
            correct: 'II é falsa — não pode ser “verdadeira”.',
          },
          {
            label: 'Letra D — ambas V com nexo',
            detail: 'Ambas verdadeiras e II justifica I.',
            correct: 'II falsa (troca incidência/prevalência) derruba D.',
          },
          {
            label: 'Letra E — ambas F',
            detail: 'I e II falsas.',
            correct: 'I é verdadeira — não marque ambas falsas.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “prevalência = só casos novos”.',
            correct: 'Mesma pegadinha: estoque ≠ fluxo.',
          },
        ],
        'Aceitar II invertida → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g13',
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
