/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g18 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g18.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g18';
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
const DTHA = {
  id: 'manual-dtha-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Doenças de Transmissão Hídrica e Alimentar — vigilância de surtos e casos',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/',
};
const PNCD = {
  id: 'pncd-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Programa Nacional de Controle da Dengue — PNCD',
  year: 2002,
  url: 'https://www.gov.br/saude/pt-br',
};
const PRINCIPIOS = {
  id: 'modulo-principios-epidemiologia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Princípios de epidemiologia — endemia e transição',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const DESASTRES = {
  id: 'plano-resposta-emergencias-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Plano de Resposta às Emergências em Saúde Pública',
  year: 2014,
  url: 'https://www.gov.br/saude/pt-br',
};
const MALARIA = {
  id: 'guia-malaria-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Guia de vigilância da malária — entomológica e epidemiológica',
  year: 2020,
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
    file: 'idecan-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1780066977710-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'DTHA: vigilância de surtos + casos individuais de botulismo, febre tifoide, cólera e hepatites virais — não hanseníase, dengue ou diabetes.',
    sources: [{ ...DTHA, covers: ['DTHA', 'botulismo', 'febre tifoide', 'cólera', 'hepatites virais'] }],
    slides: [
      conceptMap(
        'DTHA — surtos e casos individuais',
        [
          {
            label: 'Via',
            detail: 'Doenças de transmissão hídrica e alimentar: água e/ou alimentos contaminados.',
            icon: 'Droplets',
          },
          {
            label: 'Escopo',
            detail: 'Vigilância de surtos de DTHA e de casos individuais selecionados.',
            icon: 'Search',
          },
          {
            label: 'Lista (chave)',
            detail: 'Botulismo, febre tifoide, cólera e hepatites virais.',
            icon: 'ListOrdered',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Misturar hanseníase, dengue, Chagas, HPV ou diabetes no pacote DTHA.',
            icon: 'AlertTriangle',
          },
        ],
        'Hídrica/alimentar — lista certa',
      ),
      logicFlow(
        [
          'Completar: surtos de DTHA e casos individuais de…',
          'Eliminar hanseníase (não é DTHA típica desta lista).',
          'Eliminar dengue/FA e Chagas/HPV/diabetes.',
          'Manter botulismo, febre tifoide, cólera e hepatites virais.',
          'Marcar D.',
          'Em similares: DTHA = ingestão contaminada — não vetor aéreo/sexual/crônica genérica.',
        ],
        'Botulismo·tifoide·cólera·hepatites → D',
      ),
      goldenRule(
        'Pacote DTHA (casos)',
        'Decore',
        [
          { label: 'Individuais', value: 'Botulismo · febre tifoide · cólera · hepatites virais.', badge: 'ok' },
          { label: 'Fora', value: 'Hanseníase · dengue · diabetes · HPV.', badge: 'warn' },
        ],
        'Caso individual DTHA ≠ qualquer agravo',
      ),
      dangerZone(
        'PEGADINHAS — DTHA',
        [
          {
            label: 'Letra A — hanseníase',
            detail: 'Botulismo, hanseníase e cólera.',
            correct: 'Hanseníase não fecha o pacote DTHA desta chave.',
          },
          {
            label: 'Letra B — dengue/FA',
            detail: 'Dengue, hepatites e febre amarela.',
            correct: 'Arboviroses não substituem tifoide/cólera/botulismo aqui.',
          },
          {
            label: 'Letra C — misturado',
            detail: 'Chagas, HPV e diabetes.',
            correct: 'Nenhuma é o núcleo DTHA de casos individuais desta prova.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda hepatite = só vigilância de surto coletivo”.',
            correct: 'Hepatites virais também entram como caso individual no pacote.',
          },
        ],
        'Colar agravo fora da via hídrica → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712294130-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Malária/controle vetorial: ação essencial da VE = identificar áreas de transmissão via vigilância entomológica e epidemiológica.',
    sources: [{ ...MALARIA, covers: ['malária', 'vigilância entomológica', 'áreas de transmissão'] }],
    slides: [
      conceptMap(
        'Malária — ação essencial da VE',
        [
          {
            label: 'Contexto',
            detail: 'VE no SUS é fundamental para controlar doenças infecciosas como a malária.',
            icon: 'Activity',
          },
          {
            label: 'Essencial',
            detail: 'Identificar áreas de transmissão com vigilância entomológica e epidemiológica.',
            icon: 'MapPin',
          },
          {
            label: 'Não é',
            detail: 'Trocar tratamento por “natural”, cortar coleta de dados ou eliminar educação.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Vacinar só a cidade e abandonar a área rural endêmica.',
            icon: 'AlertTriangle',
          },
        ],
        'Entomologia + epidemiologia no território',
      ),
      logicFlow(
        [
          'Aponte a ação essencial da VE no controle da malária.',
          'Eliminar medicamentos naturais no lugar do tratamento.',
          'Eliminar vacinação só urbana, reduzir coleta e eliminar educação.',
          'Manter: áreas de transmissão via entomológica + epidemiológica.',
          'Marcar A.',
          'Em similares: vetor + casos no mapa = núcleo da vigilância.',
        ],
        'Áreas de transmissão → letra A',
      ),
      goldenRule(
        'Dois olhares',
        'Decore',
        [
          { label: 'Entomológica', value: 'Vetor / criadouro / área.', badge: 'ok' },
          { label: 'Epidemiológica', value: 'Casos / tendência / risco.', badge: 'ok' },
          { label: 'Juntas', value: 'Identificam áreas de transmissão.', badge: 'ok' },
        ],
        'Mapear transmissão é ação essencial',
      ),
      dangerZone(
        'PEGADINHAS — malária/VE',
        [
          {
            label: 'Letra B — naturais',
            detail: 'Substituir tratamento médico por medicamentos naturais.',
            correct: 'Não é ação da VE — e não substitui conduta clínica.',
          },
          {
            label: 'Letra C — só urbana',
            detail: 'Vacinação só em áreas urbanas, excluindo rurais.',
            correct: 'Malária exige olhar o território de transmissão — não só a cidade.',
          },
          {
            label: 'Letra D — menos dado',
            detail: 'Reduzir coleta de dados para aliviar sistemas.',
            correct: 'VE precisa de dado — cortar coleta enfraquece o controle.',
          },
          {
            label: 'Letra E — sem educação',
            detail: 'Eliminar campanhas de educação em saúde.',
            correct: 'Educação apoia o controle — não se elimina.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “só lab de gota espessa basta, sem mapa”.',
            correct: 'Caso sem território perde a vigilância de área.',
          },
        ],
        'Desmontar o mapa de transmissão → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-infeccoes-sexualmente-transmissiveis-ists-1778712304760-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'PNCD alinha: multissetorial (lixo/água), mobilização familiar, programas permanentes. NÃO se alinha: “fortalecer VisA” no lugar da VE para predizer/detectar surtos.',
    sources: [{ ...PNCD, covers: ['PNCD', 'controle da dengue', 'mobilização', 'vigilância epidemiológica'] }],
    slides: [
      conceptMap(
        'PNCD — o que NÃO se alinha',
        [
          {
            label: 'Programa',
            detail: 'Programa Nacional de Controle da Dengue — mudança de modelo, aspectos essenciais.',
            icon: 'Flag',
          },
          {
            label: 'Alinha',
            detail: 'Multissetorial (resíduos/água), mobilização familiar e programas permanentes.',
            icon: 'CheckCircle',
          },
          {
            label: 'Desalinha',
            detail: 'Trocar o eixo de predição/detecção por “fortalecer vigilância sanitária”.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir VisA com VE no PNCD.',
            icon: 'AlertTriangle',
          },
        ],
        'Predição/detecção = VE, não VisA',
      ),
      logicFlow(
        [
          'Qual aspecto NÃO se alinha ao PNCD.',
          'Validar A/B/C: resíduos/água, mobilização doméstica, programa permanente.',
          'Isolar D: fortalecimento da vigilância sanitária para predizer/detectar surtos.',
          'Marcar D.',
          'Em similares: detecção precoce de dengue puxa VE — VisA é outro braço.',
        ],
        'VisA no lugar da VE → D',
      ),
      goldenRule(
        'PNCD — eixos',
        'Decore',
        [
          { label: 'Alinha', value: 'Multissetorial · família · permanente.', badge: 'ok' },
          { label: 'Não alinha', value: 'VisA como motor de predição/detecção de surto.', badge: 'warn' },
        ],
        'Nome errado do braço de vigilância',
      ),
      dangerZone(
        'PEGADINHAS — PNCD',
        [
          {
            label: 'Letra A — multissetorial',
            detail: 'Resíduos sólidos e recipientes seguros de água.',
            correct: 'Alinha ao PNCD — não é o desalinhado.',
          },
          {
            label: 'Letra B — mobilização',
            detail: 'Campanhas e responsabilização familiar contra criadouros.',
            correct: 'Eixo clássico do PNCD — não é o desalinhado.',
          },
          {
            label: 'Letra C — permanente',
            detail: 'Programas permanentes (erradicação curto prazo inviável).',
            correct: 'Alinha à lição do PNCD — não é o desalinhado.',
          },
          {
            label: 'Letra D — VisA',
            detail: 'Fortalecer vigilância sanitária para predizer/detectar surtos.',
            correct: 'NÃO se alinha: predição/detecção é eixo da VE, não da VisA.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “PNCD = só fumacê sem mobilização”.',
            correct: 'Modelo novo exige família, lixo/água e programa contínuo.',
          },
        ],
        'Trocar VE por VisA no PNCD → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-outras-questoes-e-questoes-mescladas-sobre-doencas-cronicas-nao-transmissiveis-1778712325916-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Transição epidemiológica: menos infecciosas, mais DCNT → reorganizar o SUS para atenção integral (agudas + crônicas). Não extinguir APS nem só hospital.',
    sources: [{ ...PRINCIPIOS, covers: ['transição epidemiológica', 'DCNT', 'atenção integral', 'SUS'] }],
    slides: [
      conceptMap(
        'Transição epidemiológica — desafio',
        [
          {
            label: 'Fenômeno',
            detail: 'Redução de infecciosas e aumento de doenças crônicas não transmissíveis.',
            icon: 'TrendingUp',
          },
          {
            label: 'Desafio',
            detail: 'Reorganizar o SUS para atenção integral: condições agudas e crônicas.',
            icon: 'Building2',
          },
          {
            label: 'Não fazer',
            detail: 'Matar a APS, só hospitalizar ou achar infecciosas “erradicadas”.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar atenção básica por alta complexidade “porque agora é crônica”.',
            icon: 'AlertTriangle',
          },
        ],
        'Integral = aguda + crônica',
      ),
      logicFlow(
        [
          'Caracterize o desafio da transição no Brasil.',
          'Eliminar substituir APS por alta complexidade e só hospital.',
          'Eliminar reduzir prevenção e cortar financiamento da primária.',
          'Manter: reorganizar SUS para atenção integral aguda+crônica.',
          'Marcar B.',
          'Em similares: transição muda o mix — não apaga a atenção básica.',
        ],
        'Atenção integral → letra B',
      ),
      goldenRule(
        'Resposta do SUS',
        'Decore',
        [
          { label: 'Faz', value: 'Modelo integral · aguda e crônica juntas.', badge: 'ok' },
          { label: 'Não', value: 'Só hospital · fim da APS · fim da prevenção.', badge: 'warn' },
        ],
        'DCNT não cancela a atenção primária',
      ),
      dangerZone(
        'PEGADINHAS — transição',
        [
          {
            label: 'Letra A — só alta complexidade',
            detail: 'Substituir atenção básica por alta complexidade.',
            correct: 'APS continua essencial no cuidado crônico.',
          },
          {
            label: 'Letra C — só hospital',
            detail: 'Priorizar exclusivamente tratamento hospitalar.',
            correct: 'Crônicas vivem na rede — não só na internação.',
          },
          {
            label: 'Letra D — fim prevenção',
            detail: 'Reduzir prevenção porque infecciosas foram erradicadas.',
            correct: 'Infecciosas não sumiram e prevenção segue vital nas DCNT.',
          },
          {
            label: 'Letra E — cortar APS',
            detail: 'Eliminar financiamento da atenção primária.',
            correct: 'Primária é pilar do cuidado crônico no SUS.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “transição = só envelhecimento, sem DCNT”.',
            correct: 'O núcleo é o mix infecciosa↓ / crônica↑ na organização.',
          },
        ],
        'Hospitalizar a transição → distrator',
      ),
    ],
  },
  {
    file: 'idecan-enfermagem-protocolos-e-diretrizes-do-ministerio-da-saude-1778712437306-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Plano de Resposta às Emergências: resposta coordenada, articulação entre esferas do SUS e otimização de recursos — não centralizar só no federal nem só hospital.',
    sources: [{ ...DESASTRES, covers: ['emergências em saúde pública', 'articulação SUS', 'plano de resposta'] }],
    slides: [
      conceptMap(
        'Plano de resposta — objetivo',
        [
          {
            label: 'Cenários',
            detail: 'Surtos, desastres naturais e desassistência pedem resposta rápida e coordenada.',
            icon: 'Siren',
          },
          {
            label: 'Objetivo',
            detail: 'Estratégias coordenadas, articulação entre esferas do SUS e otimização de recursos.',
            icon: 'Network',
          },
          {
            label: 'Protocolos',
            detail: 'Orientam mobilização, comunicação e medidas preventivas/assistenciais adaptáveis.',
            icon: 'FileText',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Centralizar tudo no federal ou engessar o protocolo.',
            icon: 'AlertTriangle',
          },
        ],
        'Articular esferas · otimizar recursos',
      ),
      logicFlow(
        [
          'Marque um objetivo principal do Plano de Resposta.',
          'Eliminar centralização federal exclusiva e só emergência epidemiológica.',
          'Eliminar protocolos inflexíveis e foco só hospitalar.',
          'Manter: resposta coordenada + articulação SUS + recursos.',
          'Marcar B.',
          'Em similares: emergência = federativo — União, estado e município juntos.',
        ],
        'Articulação SUS → letra B',
      ),
      goldenRule(
        'Emergência federativa',
        'Decore',
        [
          { label: 'Objetivo', value: 'Coordenar · articular esferas · otimizar recursos.', badge: 'ok' },
          { label: 'Não', value: 'Só federal · só hospital · protocolo engessado.', badge: 'warn' },
        ],
        'Resposta coordenada entre esferas',
      ),
      dangerZone(
        'PEGADINHAS — emergências',
        [
          {
            label: 'Letra A — só federal',
            detail: 'Centralizar decisões excluindo estados e municípios.',
            correct: 'Plano exige articulação — não exclusão das esferas.',
          },
          {
            label: 'Letra C — só epidemiológica',
            detail: 'Priorizar só emergências epidemiológicas.',
            correct: 'Inclui desastres e desassistência também.',
          },
          {
            label: 'Letra D — rígido',
            detail: 'Protocolos que não podem ser adaptados.',
            correct: 'Gravidade/complexidade pedem adaptação.',
          },
          {
            label: 'Letra E — só hospital',
            detail: 'Focar apenas no atendimento hospitalar.',
            correct: 'Prevenção e controle comunitário entram no plano.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “município age sozinho sem comunicar”.',
            correct: 'Comunicação entre órgãos é eixo do plano.',
          },
        ],
        'Centralizar ou engessar → distrator',
      ),
    ],
  },
  {
    file: 'idib-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778934900821-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Endemia (chave): condição/doença com certa periodicidade em determinada região. Não é pandemia mundial, surto hospitalar nem excesso sobre o esperado.',
    exam_vs_current:
      'Slides ensinam a chave da prova (periodicidade regional). Definição clássica também usa “habitual/esperado”; distratores misturam pandemia/surto/epidemia.',
    sources: [{ ...PRINCIPIOS, covers: ['endemia', 'epidemia', 'pandemia', 'surto'] }],
    slides: [
      conceptMap(
        'Conceito de endemia',
        [
          {
            label: 'Definição (chave)',
            detail: 'Condição clínica ou doença que ocorre com certa periodicidade em determinada região.',
            icon: 'Map',
          },
          {
            label: 'Não é pandemia',
            detail: 'Passar de continente a continente (proporção mundial) = pandemia.',
            icon: 'Globe',
          },
          {
            label: 'Não é surto/epidemia',
            detail: 'Aumento repentino delimitado (hospital/UTI) ou excesso sobre o esperado.',
            icon: 'TrendingUp',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Chamar de endemia o que é surto institucional ou epidemia.',
            icon: 'AlertTriangle',
          },
        ],
        'Periodicidade regional = endemia',
      ),
      logicFlow(
        [
          'Assinale o conceito correto de endemia.',
          'Eliminar A (definição de pandemia).',
          'Eliminar C (surto/institucional) e D (epidemia = excesso).',
          'Manter B: periodicidade em determinada região.',
          'Marcar B.',
          'Em similares: habitual/periódico no território ≠ explosão súbita.',
        ],
        'Periodicidade regional → letra B',
      ),
      goldenRule(
        'Escalas de ocorrência',
        'Decore',
        [
          { label: 'Endemia', value: 'Periodicidade / presença em região.', badge: 'ok' },
          { label: 'Epidemia', value: 'Excede o esperado.', badge: 'warn' },
          { label: 'Surto', value: 'Excesso delimitado (ex.: hospital).', badge: 'warn' },
          { label: 'Pandemia', value: 'Escala ampla / mundial.', badge: 'warn' },
        ],
        'Não troque endemia por excesso',
      ),
      dangerZone(
        'PEGADINHAS — endemia',
        [
          {
            label: 'Letra A — pandemia',
            detail: 'Epidemia que passa de continente a continente.',
            correct: 'Isso define pandemia — não endemia.',
          },
          {
            label: 'Letra C — surto',
            detail: 'Aumento repentino em hospital/UTI/berçário.',
            correct: 'Perfil de surto institucional — não endemia.',
          },
          {
            label: 'Letra D — epidemia',
            detail: 'Casos que excedem claramente a incidência prevista.',
            correct: 'É epidemia — excesso, não periodicidade habitual.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “endemia = zero casos o ano todo”.',
            correct: 'Endemia implica presença contínua/periódica no território.',
          },
        ],
        'Rotular excesso como endemia → distrator',
      ),
    ],
  },
  {
    file: 'idib-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1778934900821-6.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'INCORRETA: restringir VE só a IST/HIV e “hepatites bacterianas”. Competências cobrem compulsórias, imunização e resposta ampla — não só esse recorte.',
    sources: [{ ...GUIA, covers: ['competências da VE', 'notificação compulsória', 'imunização', 'IST'] }],
    slides: [
      conceptMap(
        'Competências da VE — INCORRETA',
        [
          {
            label: 'Finalidade',
            detail: 'Detectar e prevenir agravos transmissíveis, fatores de risco, estudos e normas.',
            icon: 'Shield',
          },
          {
            label: 'Amplas',
            detail: 'Resposta a compulsórias, imunizações e produção de informação no SUS.',
            icon: 'Layers',
          },
          {
            label: 'Falha',
            detail: 'Dizer que ações são relativas SOMENTE a IST/HIV e “hepatites bacterianas”.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar “somente IST” porque IST também está na VE.',
            icon: 'AlertTriangle',
          },
        ],
        'VE não é só IST',
      ),
      logicFlow(
        [
          'Assinale a afirmativa INCORRETA sobre competências.',
          'Validar A: coordenar resposta estadual a compulsórias/riscos.',
          'Validar C/D: gerir/apoiar imunizações e normatizar técnicas.',
          'Isolar B: “somente” IST/HIV e hepatites bacterianas — estreito e impreciso.',
          'Marcar B.',
          'Em similares: “somente + lista curta” costuma ser a INCORRETA.',
        ],
        'Somente IST → letra B',
      ),
      goldenRule(
        'Amplitude da VE',
        'Decore',
        [
          { label: 'Faz', value: 'Compulsórias · imunização · informação SUS.', badge: 'ok' },
          { label: 'INCORRETA', value: 'Restringir SOMENTE a IST/HIV/“hepatites bacterianas”.', badge: 'warn' },
        ],
        '“Somente” estreita demais a VE',
      ),
      dangerZone(
        'PEGADINHAS — competências',
        [
          {
            label: 'Letra A — compulsórias',
            detail: 'Coordenar resposta estadual a agravos de notificação compulsória.',
            correct: 'Cabe à VE estadual planejar, monitorar e divulgar informação no SUS.',
          },
          {
            label: 'Letra B — somente IST',
            detail: 'Ações relativas somente a IST, HIV/Aids e hepatites bacterianas.',
            correct: 'INCORRETA: VE não se limita a esse recorte (nem “hepatites bacterianas”).',
          },
          {
            label: 'Letra C — imunizações',
            detail: 'Gerir/apoiar o Programa de Imunizações no Estado.',
            correct: 'Imunopreveníveis entram no controle/eliminação sob a VE estadual.',
          },
          {
            label: 'Letra D — técnicas',
            detail: 'Planejar, acompanhar e normatizar ações de imunização.',
            correct: 'Normatizar técnicas de vacinação é competência legítima da VE.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE estadual não olha imunopreveníveis”.',
            correct: 'Imunização integra as competências de prevenção/controle.',
          },
        ],
        'Estreitar VE a IST → distrator',
      ),
    ],
  },
  {
    file: 'ieses-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Nesta chave (opções curtas): principal objetivo da VE = controlar doenças transmissíveis — não educação isolada, medicamentos ou nutrição.',
    exam_vs_current:
      'Objetivo amplo da VE inclui mais que transmissíveis; slides ensinam a melhor opção entre as alternativas da prova.',
    sources: [{ ...GUIA, covers: ['objetivo da vigilância epidemiológica', 'doenças transmissíveis'] }],
    slides: [
      conceptMap(
        'Objetivo principal da VE',
        [
          {
            label: 'Contexto',
            detail: 'VE apoia o controle de infecções — inclusive no ambiente hospitalar.',
            icon: 'Hospital',
          },
          {
            label: 'Objetivo (chave)',
            detail: 'Controlar doenças transmissíveis.',
            icon: 'Target',
          },
          {
            label: 'Não é o principal aqui',
            detail: 'Educação isolada, monitorar medicamentos ou avaliar nutrição.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Trocar controle de transmissíveis por tarefa de farmácia/nutrição.',
            icon: 'AlertTriangle',
          },
        ],
        'Controle de transmissíveis',
      ),
      logicFlow(
        [
          'Qual é o principal objetivo da vigilância epidemiológica nesta prova.',
          'Eliminar educação em saúde como objetivo principal isolado.',
          'Eliminar monitorar medicamentos e avaliar nutrição.',
          'Manter: controlar doenças transmissíveis.',
          'Marcar C.',
          'Em similares: entre opções curtas, VE ancora prevenção/controle de transmissíveis.',
        ],
        'Controlar transmissíveis → letra C',
      ),
      goldenRule(
        'Objetivo em uma linha',
        'Decore',
        [
          { label: 'Principal (chave)', value: 'Controlar doenças transmissíveis.', badge: 'ok' },
          { label: 'Apoios', value: 'Educação e dados ajudam — não definem sozinhos.', badge: 'warn' },
        ],
        'Controle é o verbo da VE nesta chave',
      ),
      dangerZone(
        'PEGADINHAS — objetivo',
        [
          {
            label: 'Letra A — educação',
            detail: 'Promover a educação em saúde.',
            correct: 'Importa, mas não é o objetivo principal entre as opções.',
          },
          {
            label: 'Letra B — medicamentos',
            detail: 'Monitorar o uso de medicamentos.',
            correct: 'Não define o objetivo principal da VE.',
          },
          {
            label: 'Letra D — nutrição',
            detail: 'Avaliar a nutrição dos pacientes.',
            correct: 'Fora do núcleo da VE nesta questão.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VE = só estatística sem ação de controle”.',
            correct: 'Dado existe para orientar prevenção e controle.',
          },
        ],
        'Trocar controle por apoio clínico → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g18',
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
