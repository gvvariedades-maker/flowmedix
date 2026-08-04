/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g06 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g06.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g06';
const DIR = path.join('data/catalog-migration', LOTE, 'questions');
const SUB = 'Epidemiologia e Vigilância Epidemiológica';
const TOPICO = 'Enfermagem';

const GUIA = {
  id: 'guia-vigilancia-saude-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de Vigilância em Saúde',
  year: 2024,
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
const TB = {
  id: 'protocolo-tuberculose-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual/protocolo de tuberculose — suspeita, isolamento e notificação',
  year: 2019,
  url: 'https://www.gov.br/saude/pt-br',
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
    file: 'educa-pb-enfermagem-processo-de-enfermagem-1780008197597-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação compulsória pode ser de caso suspeito; investigação subsidia medidas de controle oportunas — não esperar só confirmação.',
    sources: [{ ...GUIA, covers: ['notificação compulsória', 'investigação epidemiológica', 'medidas de controle'] }],
    slides: [
      conceptMap(
        'Notificar suspeito e agir a tempo',
        [
          { label: 'Notificação', detail: 'Pode (e deve) ocorrer diante de caso suspeito — não só após confirmação.', icon: 'Bell' },
          { label: 'Investigação', detail: 'Subsidia medidas de controle coletivo oportunas.', icon: 'Search' },
          { label: 'Controle', detail: 'Não fica “preso” ao fim da investigação para começar a agir.', icon: 'Shield' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Só notificar depois do diagnóstico confirmado.', icon: 'AlertTriangle' },
        ],
        'Suspeito → notifica · investiga · controla',
      ),
      logicFlow(
        [
          'Comando: opção correta sobre notificação, investigação e controle.',
          'Eliminar “só após confirmação diagnóstica”.',
          'Eliminar investigação só para diagnóstico individual (sem controle coletivo).',
          'Eliminar controle só após conclusão total da investigação.',
          'Manter: notificação de suspeitos + investigação que subsidia controle oportuno.',
          'Marcar C.',
          'Em similares: VE age na suspeita — não espera o lab fechar tudo.',
        ],
        'Suspeito + controle oportuno → C',
      ),
      goldenRule(
        'Três verbos da VE',
        'Decore',
        [
          { label: 'Notificar', value: 'Também o caso suspeito de interesse em saúde pública.', badge: 'ok' },
          { label: 'Investigar', value: 'Para orientar medidas de controle coletivo.', badge: 'ok' },
          { label: 'Controlar', value: 'Oportuno — não só no “fim” da investigação.', badge: 'warn' },
        ],
        'Suspeita já dispara o fluxo',
      ),
      dangerZone(
        'PEGADINHAS — notificação × controle',
        [
          {
            label: 'Letra A — só após confirmação',
            detail: 'Notificar só depois do diagnóstico confirmado.',
            correct: 'Compulsória inclui suspeitos — esperar confirmação atrasa a VE.',
          },
          {
            label: 'Letra B — só diagnóstico individual',
            detail: 'Investigação só confirma clínica individual, sem controle coletivo.',
            correct: 'Investigação existe para orientar medidas de controle na população.',
          },
          {
            label: 'Letra D — controle só no fim',
            detail: 'Medidas só após conclusão da investigação.',
            correct: 'Controle oportuno pode (e deve) começar enquanto se investiga.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só notifica se o médico assinar CID definitivo”.',
            correct: 'Critério é a definição de caso (inclui suspeito), não o CID fechado.',
          },
        ],
        'Esperar confirmação para notificar → distrator',
      ),
    ],
  },
  {
    file: 'facape-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Tétano neonatal: cordão umbilical / substâncias ou instrumentos não esterilizados. Parceria na sífilis; leite em pó no HIV/HTLV; RN toxo = notificar suspeito.',
    exam_vs_current: 'Conforme guia citado na prova (6ª ed. revisada 2024).',
    sources: [{ ...GUIA, covers: ['tétano neonatal', 'sífilis', 'HIV', 'toxoplasmose', 'notificação'] }],
    slides: [
      conceptMap(
        'Parto e notificação — o que está certo',
        [
          { label: 'Tétano neonatal', detail: 'Pode ocorrer na manipulação do cordão ou com material não esterilizado.', icon: 'Baby' },
          { label: 'Sífilis', detail: 'Tratar gestante e parcerias sexuais.', icon: 'Users' },
          { label: 'HIV/HTLV', detail: 'Não amamentar; bebê tem direito a fórmula pelo SUS.', icon: 'Milk' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Negar notificação de RN/lactente com mãe suspeita de toxoplasmose.', icon: 'AlertTriangle' },
        ],
        'Cordão sujo = risco de tétano neonatal',
      ),
      logicFlow(
        [
          'Comando: alternativa correta no guia de vigilância (parto/notificação).',
          'Eliminar sífilis sem tratar parcerias.',
          'Eliminar HIV/HTLV sem direito a leite em pó no SUS.',
          'Eliminar TR reagente no bebê = sífilis automática (mãe tratada).',
          'Eliminar “não notificar” RN/lactente com mãe suspeita de toxo.',
          'Manter: tétano neonatal por cordão/instrumentos não esterilizados.',
          'Marcar A.',
          'Em similares: cordão + material contaminado = via clássica do tétano neonatal.',
        ],
        'Cordão / material não estéril → A',
      ),
      goldenRule(
        'Checklist do parto',
        'O que a prova cobra',
        [
          { label: 'Tétano neonatal', value: 'Cordão / substâncias / instrumentos não esterilizados.', badge: 'ok' },
          { label: 'Sífilis', value: 'Tratar gestante e parcerias.', badge: 'warn' },
          { label: 'HIV/HTLV + toxo', value: 'Sem amamentar + fórmula SUS; notificar RN suspeito.', badge: 'warn' },
        ],
        'Não afrouxar notificação do RN',
      ),
      dangerZone(
        'PEGADINHAS — parto e VE',
        [
          {
            label: 'Letra B — parceria fora',
            detail: 'Sífilis na gestante sem tratar parcerias.',
            correct: 'Parceria sexual também entra no tratamento/controle.',
          },
          {
            label: 'Letra C — sem fórmula',
            detail: 'HIV/HTLV: não amamenta e bebê sem leite em pó gratuito.',
            correct: 'Há direito a fórmula pelo SUS quando a amamentação é contraindicada.',
          },
          {
            label: 'Letra D — TR = sífilis',
            detail: 'TR reagente no bebê = caso, mesmo mãe tratada.',
            correct: 'Interpretação do RN depende do contexto materno/tratamento — não automatize.',
          },
          {
            label: 'Letra E — não notificar toxo',
            detail: 'RN/lactente <6m com mãe suspeita de toxo não notifica.',
            correct: 'Deve ser notificado como caso suspeito conforme fluxo do guia.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “tétano neonatal = só parto hospitalar”.',
            correct: 'Risco está no cordão/material contaminado — qualquer cenário.',
          },
        ],
        'Negar parceria/fórmula/notificação → distrator',
      ),
    ],
  },
  {
    file: 'facet-enfermagem-atencao-basica-saude-da-familia-1778968039063-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Incidência = casos novos (surtos); prevalência = carga crônica; mortalidade infantil = saneamento/acesso — as três afirmativas corretas para o ACS.',
    sources: [{ ...GUIA, covers: ['incidência', 'prevalência', 'mortalidade infantil', 'ACS'] }],
    slides: [
      conceptMap(
        'Indicadores que o ACS usa',
        [
          { label: 'Incidência', detail: 'Novos casos no período — útil para surto e ação imediata.', icon: 'TrendingUp' },
          { label: 'Prevalência', detail: 'Estoque de casos — carga de crônicas (HAS, diabetes).', icon: 'Layers' },
          { label: 'MI', detail: 'Mortalidade infantil espelha saneamento e acesso à saúde.', icon: 'Home' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Cortar III achando que MI “não é papel do ACS”.', icon: 'AlertTriangle' },
        ],
        'I + II + III corretas',
      ),
      logicFlow(
        [
          'I — incidência = novos casos; ACS identifica surto → Verdadeira.',
          'II — prevalência = carga crônica; direciona acompanhamento → Verdadeira.',
          'III — mortalidade infantil reflete saneamento/acesso; ACS monitora risco → Verdadeira.',
          'Todas as afirmativas estão corretas.',
          'Marcar D.',
          'Em similares: novos = incidência; estoque = prevalência; MI = contexto social.',
        ],
        'Todas corretas → letra D',
      ),
      goldenRule(
        'Três indicadores, três usos',
        'Decore',
        [
          { label: 'Incidência', value: 'Novos casos → surto e prevenção imediata.', badge: 'ok' },
          { label: 'Prevalência', value: 'Carga crônica → acompanhamento.', badge: 'ok' },
          { label: 'MI', value: 'Saneamento + acesso → áreas de risco.', badge: 'ok' },
        ],
        'I · II · III = D',
      ),
      dangerZone(
        'PEGADINHAS — cortar afirmativa',
        [
          {
            label: 'Letra A — só I',
            detail: 'Apenas a afirmativa I.',
            correct: 'II e III também estão corretas.',
          },
          {
            label: 'Letra B — I e III',
            detail: 'Sem a prevalência.',
            correct: 'II (prevalência/crônicas) é correta para o ACS.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Sem a incidência.',
            correct: 'I (incidência/surto) é correta.',
          },
          {
            label: 'Letra E — nenhuma',
            detail: 'Nenhuma afirmativa correta.',
            correct: 'As três afirmativas estão alinhadas ao uso dos indicadores.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “prevalência serve para surto agudo”.',
            correct: 'Surto pede incidência (novos); prevalência fala de estoque.',
          },
        ],
        'Cortar um indicador válido → distrator',
      ),
    ],
  },
  {
    file: 'facet-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563617321-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Suspeita de TB (febre, tosse, sudorese, emagrecimento): isolar, comunicar equipe e registrar/notificar — TE não prescreve nem fecha diagnóstico sozinho.',
    sources: [{ ...TB, covers: ['suspeita de tuberculose', 'isolamento', 'notificação'] }],
    slides: [
      conceptMap(
        'Suspeita de TB na ILPI',
        [
          { label: 'Quadro', detail: 'Febre, tosse produtiva, sudorese noturna, perda de peso.', icon: 'Thermometer' },
          { label: 'Conduta TE', detail: 'Isolar em quarto individual, comunicar equipe, registrar suspeita.', icon: 'DoorClosed' },
          { label: 'Fora do escopo', detail: 'Prescrever exame/tratamento ou fechar diagnóstico sozinho.', icon: 'Ban' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Antibiótico empírico parenteral “para não piorar”.', icon: 'AlertTriangle' },
        ],
        'Isolar · comunicar · registrar suspeita',
      ),
      logicFlow(
        [
          'Reconhecer síndrome compatível com tuberculose pulmonar.',
          'Eliminar prescrição de baciloscopia/tratamento pelo técnico sozinho.',
          'Eliminar antibiótico empírico e “diagnóstico definitivo” antes de comunicar.',
          'Eliminar discussão familiar com tratamento domiciliar independente.',
          'Manter: isolamento + comunicação + registro da suspeita conforme MS.',
          'Marcar A.',
          'Em similares: suspeita de TB = isolar e acionar o fluxo institucional.',
        ],
        'Isolar e comunicar suspeita → A',
      ),
      goldenRule(
        'Conduta do técnico',
        'O que fazer agora',
        [
          { label: 'Fazer', value: 'Quarto individual · comunicar equipe · registrar suspeita.', badge: 'ok' },
          { label: 'Não fazer', value: 'Prescrever · fechar diagnóstico · tratar em casa sozinho.', badge: 'warn' },
        ],
        'Suspeita ≠ receita do técnico',
      ),
      dangerZone(
        'PEGADINHAS — conduta TB',
        [
          {
            label: 'Letra B — prescrever exame',
            detail: 'Prescrever baciloscopia e indicar tratamento.',
            correct: 'Prescrição/indicação terapêutica não é atribuição do técnico isolado.',
          },
          {
            label: 'Letra C — antibiótico empírico',
            detail: 'Antibiótico parenteral de amplo espectro.',
            correct: 'Atrasa o fluxo de TB e foge do protocolo de suspeita.',
          },
          {
            label: 'Letra D — RX antes de comunicar',
            detail: 'Interpretar RX e fechar diagnóstico antes de comunicar.',
            correct: 'Comunicar/isolar não espera “diagnóstico definitivo” do técnico.',
          },
          {
            label: 'Letra E — tratamento domiciliar',
            detail: 'Família + tratamento domiciliar independente.',
            correct: 'Fora do protocolo institucional de vigilância.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só isola se BK positivo”.',
            correct: 'Isolamento respiratório começa na suspeita compatível.',
          },
        ],
        'Prescrever/diagnosticar sozinho → distrator',
      ),
    ],
  },
  {
    file: 'facet-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Prioridades: renda/escolaridade (I) e epi como TB (III) importam. II falsa — crenças/vacinação/medicina tradicional NÃO devem ser desconsideradas.',
    sources: [{ ...GUIA, covers: ['priorização', 'vulnerabilidade', 'tuberculose', 'ACS'] }],
    slides: [
      conceptMap(
        'Prioridades: o que conta (e o que não)',
        [
          {
            label: 'Socioeconômico',
            detail: 'Renda per capita e nível de escolaridade marcam áreas vulneráveis para o ACS.',
            icon: 'Wallet',
          },
          {
            label: 'Epidemiológico',
            detail: 'Alta prevalência de tuberculose pede vigilância ativa e controle da transmissão.',
            icon: 'Activity',
          },
          {
            label: 'Cultural',
            detail: 'Medicina tradicional e crenças sobre vacinação entram na definição de prioridades.',
            icon: 'HeartHandshake',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Desconsiderar indicadores culturais para padronizar ações de saúde.',
            icon: 'AlertTriangle',
          },
        ],
        'I e III certas · II falsa',
      ),
      logicFlow(
        [
          'I — renda per capita e escolaridade orientam vulnerabilidade e promoção/prevenção → Verdadeira.',
          'II — desconsiderar práticas de medicina tradicional e crenças de vacinação → Falsa.',
          'III — alta prevalência de tuberculose direciona vigilância ativa e controle da transmissão → Verdadeira.',
          'Critérios operacionais: socioeconômicos + epidemiológicos; cultura não se apaga.',
          'Correto: apenas as afirmativas I e III.',
          'Marcar B.',
          'Em similares: ACS prioriza com múltiplos indicadores — inclusive culturais.',
        ],
        'Apenas I e III corretas → letra B',
      ),
      goldenRule(
        'Gabarito das prioridades',
        'Decore',
        [
          { label: 'I', value: 'V — renda per capita / escolaridade / vulneráveis.', badge: 'ok' },
          { label: 'II', value: 'F — cultura e vacinação NÃO se desconsideram.', badge: 'warn' },
          { label: 'III', value: 'V — tuberculose / vigilância ativa / transmissão.', badge: 'ok' },
        ],
        'Prioridade: I e III — sem apagar cultura',
      ),
      dangerZone(
        'PEGADINHAS — priorização',
        [
          {
            label: 'Letra A — I e II',
            detail: 'Inclui desconsiderar indicadores culturais.',
            correct: 'II é falsa: medicina tradicional e crenças de vacinação entram no plano.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Carrega a II falsa e perde renda/escolaridade.',
            correct: 'I é verdadeira; II é falsa.',
          },
          {
            label: 'Letra D — todas',
            detail: 'Aceita desconsiderar cultura para padronização.',
            correct: 'II derruba o “todas as afirmativas”.',
          },
          {
            label: 'Letra E — só III',
            detail: 'Apenas a afirmativa III.',
            correct: 'I (renda per capita e escolaridade) também está correta.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só indicador epidemiológico importa para o ACS”.',
            correct: 'Prioridade em saúde coletiva é multi-critério: social + cultural + epi.',
          },
        ],
        'Apagar cultura para padronizar → distrator',
      ),
    ],
  },
  {
    file: 'facet-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Eficácia = ideal/controlado; eficiência = resultado com menos recursos; efetividade = impacto no mundo real (ACS). As três corretas.',
    sources: [{ ...GUIA, covers: ['eficácia', 'eficiência', 'efetividade'] }],
    slides: [
      conceptMap(
        'Eficácia × eficiência × efetividade',
        [
          {
            label: 'Eficácia',
            detail: 'Capacidade de atingir resultados em condições ideais (ensaios clínicos).',
            icon: 'FlaskConical',
          },
          {
            label: 'Eficiência',
            detail: 'Resultados esperados com menos recursos — tempo, pessoal e dinheiro (vacinação em massa).',
            icon: 'Gauge',
          },
          {
            label: 'Efetividade',
            detail: 'Impacto real em situações práticas e cotidianas — ações do ACS na comunidade.',
            icon: 'Users',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar efetividade por eficácia ao avaliar qualidade na saúde coletiva.',
            icon: 'AlertTriangle',
          },
        ],
        'Ideal · recursos · mundo real',
      ),
      logicFlow(
        [
          'Contexto: saúde coletiva — avaliar qualidade e impacto das intervenções.',
          'I — eficácia em condições ideais e controladas (ensaios clínicos) → Verdadeira.',
          'II — eficiência = resultados com menor número de recursos (campanhas de vacinação) → Verdadeira.',
          'III — efetividade = impacto real no cotidiano; critério do ACS na comunidade → Verdadeira.',
          'Todas as afirmativas estão corretas.',
          'Marcar D.',
          'Em similares: ACS na comunidade → efetividade; ensaio clínico → eficácia.',
        ],
        'Todas as afirmativas corretas → letra D',
      ),
      goldenRule(
        'Três “E” em uma linha',
        'Decore',
        [
          { label: 'Eficácia', value: 'Ideal / controlado (ensaio clínico).', badge: 'ok' },
          { label: 'Eficiência', value: 'Menos recursos para o resultado (campanha).', badge: 'ok' },
          { label: 'Efetividade', value: 'Impacto prático na comunidade (ACS).', badge: 'ok' },
        ],
        'I · II · III = todas corretas',
      ),
      dangerZone(
        'PEGADINHAS — os três E',
        [
          {
            label: 'Letra A — sem III',
            detail: 'Apenas I e II.',
            correct: 'III (efetividade no cotidiano do ACS) também está correta.',
          },
          {
            label: 'Letra B — sem I',
            detail: 'Apenas II e III.',
            correct: 'I (eficácia em condições ideais) está correta.',
          },
          {
            label: 'Letra C — sem II',
            detail: 'Apenas I e III.',
            correct: 'II (eficiência de recursos em campanhas) está correta.',
          },
          {
            label: 'Letra E — só II',
            detail: 'Apenas a afirmativa II.',
            correct: 'I e III também estão corretas na saúde coletiva.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “vacina eficaz no ensaio = efetividade garantida na rua”.',
            correct: 'Eficácia ≠ efetividade — o contexto real muda o impacto da intervenção.',
          },
        ],
        'Cortar um dos três E → distrator',
      ),
    ],
  },
  {
    file: 'facet-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563725570-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Objetivo da notificação compulsória: acompanhar ocorrência, tendência, planejar prevenção e conter surtos/epidemias — não só estatística ou indústria.',
    sources: [{ ...LISTA, covers: ['notificação compulsória', 'controle de surtos', 'tendência epidemiológica'] }],
    slides: [
      conceptMap(
        'Para que serve notificar?',
        [
          { label: 'Monitorar', detail: 'Acompanhar ocorrência e tendência das doenças.', icon: 'LineChart' },
          { label: 'Planejar', detail: 'Intervenções preventivas a tempo.', icon: 'ClipboardList' },
          { label: 'Conter', detail: 'Resposta rápida a surtos e epidemias.', icon: 'ShieldAlert' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Notificar “só para estatística”, sem controle.', icon: 'AlertTriangle' },
        ],
        'Tendência + prevenção + contenção',
      ),
      logicFlow(
        [
          'Comando: objetivo principal da notificação compulsória.',
          'Eliminar vacinação automática de todas as populações de risco.',
          'Eliminar “só estatística sem intervenção”.',
          'Eliminar foco em indústria farmacêutica ou só antimicrobianos.',
          'Manter: acompanhar ocorrência/tendência, planejar prevenção e conter surtos.',
          'Marcar B.',
          'Em similares: notificar para agir na saúde pública — não para o marketing do dado.',
        ],
        'Monitorar + prevenir + conter → B',
      ),
      goldenRule(
        'Objetivo em três verbs',
        'Decore',
        [
          { label: 'Ver', value: 'Ocorrência e tendência epidemiológica.', badge: 'ok' },
          { label: 'Planejar', value: 'Intervenções preventivas.', badge: 'ok' },
          { label: 'Conter', value: 'Surtos e epidemias com rapidez.', badge: 'ok' },
        ],
        'Notificar para controlar',
      ),
      dangerZone(
        'PEGADINHAS — objetivo da notificação',
        [
          {
            label: 'Letra A — vacinar automático',
            detail: 'Vacinação automática de todas as populações de risco.',
            correct: 'Notificar informa a ação — não “vacina todo mundo” sozinha.',
          },
          {
            label: 'Letra C — só estatística',
            detail: 'Dados sem intervenção no controle.',
            correct: 'O núcleo é subsidiar controle e prevenção, não só contar.',
          },
          {
            label: 'Letra D — indústria',
            detail: 'Informar agências/indústria farmacêutica.',
            correct: 'Finalidade pública é vigilância e contenção — não a indústria.',
          },
          {
            label: 'Letra E — só antimicrobianos',
            detail: 'Monitorar uso racional de antimicrobianos.',
            correct: 'Pode ser tema relacionado, mas não é o objetivo principal da compulsória.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “SINAN existe para fechar relatório anual”.',
            correct: 'Relatório ajuda; o propósito é detecção e resposta oportuna.',
          },
        ],
        'Estatística sem controle → distrator',
      ),
    ],
  },
  {
    file: 'fau-unicentro-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Taxa de morbidade mede frequência de casos de doença (não morte, nascimento, parto ou cura) na população.',
    sources: [{ ...GUIA, covers: ['morbidade', 'indicadores de saúde'] }],
    slides: [
      conceptMap(
        'Morbidade preenche com…',
        [
          { label: 'Pergunta', detail: 'Taxa de morbidade mede a frequência de casos de ________.', icon: 'HelpCircle' },
          { label: 'Resposta', detail: 'Doença — adoecimento na população.', icon: 'Stethoscope' },
          { label: 'Não é', detail: 'Morte (mortalidade), nascimento, partos ou cura.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Colar “morte” porque parece indicador “pesado”.', icon: 'AlertTriangle' },
        ],
        'Morbidade = doença',
      ),
      logicFlow(
        [
          'Lacuna: taxa de morbidade mede frequência de casos de ___ .',
          'Eliminar morte (isso é mortalidade).',
          'Eliminar nascimento, partos e cura.',
          'Preencher com doença.',
          'Marcar B.',
          'Em similares: morbi = doença; morti = morte.',
        ],
        'Morbidade = doença → letra B',
      ),
      goldenRule(
        'Morbidade vs mortalidade',
        'Decore',
        [
          { label: 'Morbidade', value: 'Frequência de doença.', badge: 'ok' },
          { label: 'Mortalidade', value: 'Frequência de morte.', badge: 'warn' },
        ],
        'Morbi ≠ morti',
      ),
      dangerZone(
        'PEGADINHAS — lacuna da morbidade',
        [
          {
            label: 'Letra A — morte',
            detail: 'Frequência de casos de morte.',
            correct: 'Morte pertence à mortalidade — não à morbidade.',
          },
          {
            label: 'Letra C — nascimento',
            detail: 'Frequência de nascimentos.',
            correct: 'Natalidade/outros indicadores demográficos — não morbidade.',
          },
          {
            label: 'Letra D — partos',
            detail: 'Frequência de partos.',
            correct: 'Não define taxa de morbidade.',
          },
          {
            label: 'Letra E — cura',
            detail: 'Frequência de cura.',
            correct: 'Cura não é o núcleo do indicador de morbidade.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “morbidade = óbitos por doença”.',
            correct: 'Óbito por doença mistura eixos — morbidade conta adoecer.',
          },
        ],
        'Trocar doença por morte → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g06',
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
