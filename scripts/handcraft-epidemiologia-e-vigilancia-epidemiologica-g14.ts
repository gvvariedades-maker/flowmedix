/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g14 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g14.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g14';
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
const PNAB = {
  id: 'pnab-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Política Nacional de Atenção Básica — territorialização',
  year: 2017,
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
    file: 'furb-enfermagem-processo-de-enfermagem-1780011915153-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Endemia = doença habitualmente presente no grupo/área, dentro do esperado, por tempo ilimitado. Epidemia/surto = excesso; pandemia = escala global.',
    sources: [{ ...GUIA, covers: ['endemia', 'epidemia', 'pandemia', 'surto'] }],
    slides: [
      conceptMap(
        'Doença habitual no território = ?',
        [
          { label: 'Pista', detail: 'Habitualmente presente, dentro do esperado, área determinada, tempo ilimitado.', icon: 'MapPin' },
          { label: 'Termo', detail: 'Endemia.', icon: 'Map' },
          { label: 'Não é', detail: 'Epidemia/surto (excesso), pandemia (global) nem hiperendemia.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar epidemia porque “sempre tem casos”.', icon: 'AlertTriangle' },
        ],
        'Habitual + esperado = endemia',
      ),
      logicFlow(
        [
          'Lacuna: presente de forma habitual, dentro do esperado, área geográfica, tempo ilimitado.',
          'Eliminar epidemia, surto e pandemia.',
          'Eliminar hiperendemia (intensidade elevada — não a definição dada).',
          'Preencher com endemia.',
          'Marcar A.',
          'Em similares: contínuo/esperado = endemia; acima do esperado = epidemia.',
        ],
        'Endemia → letra A',
      ),
      goldenRule(
        'Escalas de ocorrência',
        'Decore',
        [
          { label: 'Endemia', value: 'Habitual · dentro do esperado · território.', badge: 'ok' },
          { label: 'Epidemia/surto', value: 'Acima do esperado.', badge: 'warn' },
          { label: 'Pandemia', value: 'Âmbito global.', badge: 'warn' },
        ],
        'Habitual ≠ excesso',
      ),
      dangerZone(
        'PEGADINHAS — lacuna endemia',
        [
          {
            label: 'Letra B — epidemia',
            detail: 'Epidemia.',
            correct: 'Epidemia é elevação além do esperado — não habitualidade.',
          },
          {
            label: 'Letra C — hiperendemia',
            detail: 'Hiperendemia.',
            correct: 'Fala de intensidade alta — a lacuna descreve endemia clássica.',
          },
          {
            label: 'Letra D — pandemia',
            detail: 'Pandemia.',
            correct: 'Pandemia é escala global — não a presença habitual local.',
          },
          {
            label: 'Letra E — surto',
            detail: 'Surto.',
            correct: 'Surto é excesso súbito/localizado — não o habitual esperado.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão: “endemia = zero casos”.',
            correct: 'Endemia tem casos esperados — zero seria eliminação/ausência.',
          },
        ],
        'Trocar endemia por excesso → distrator',
      ),
    ],
  },
  {
    file: 'gama-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563701860-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Eficácia = resultados esperados em condições controladas/experimentais. Efetividade = mundo real; eficiência = custo/benefício.',
    exam_vs_current:
      'Enunciado fala em eficiência; gabarito marca a definição de eficácia (letra C) — ensinar o gabarito.',
    sources: [{ ...GUIA, covers: ['eficácia', 'eficiência', 'efetividade'] }],
    slides: [
      conceptMap(
        'Três “E” — o que a alternativa C diz',
        [
          { label: 'Eficácia', detail: 'Resultados esperados em condições controladas e experimentais.', icon: 'FlaskConical' },
          { label: 'Efetividade', detail: 'Efeito no mundo real, com variáveis externas.', icon: 'Users' },
          { label: 'Eficiência', detail: 'Relação entre investimento/custo e benefícios obtidos.', icon: 'Gauge' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Trocar os rótulos dos três E nas opções.', icon: 'AlertTriangle' },
        ],
        'Eficácia = ambiente controlado',
      ),
      logicFlow(
        [
          'Ler as opções e isolar qual definição está correta e completa.',
          'Eliminar misturas que deslocam eficiência/efetividade.',
          'Manter: eficácia = resultados esperados em condições controladas/experimentais.',
          'Marcar C.',
          'Em similares: ACS na rua → efetividade; ensaio → eficácia; custo → eficiência.',
        ],
        'Eficácia em condições controladas → C',
      ),
      goldenRule(
        'Mapa dos três E',
        'Decore',
        [
          { label: 'Eficácia', value: 'Ideal / controlado / experimental.', badge: 'ok' },
          { label: 'Efetividade', value: 'Mundo real.', badge: 'warn' },
          { label: 'Eficiência', value: 'Custo × benefício.', badge: 'warn' },
        ],
        'Ideal · real · custo',
      ),
      dangerZone(
        'PEGADINHAS — três E',
        [
          {
            label: 'Letra A — eficiência/custo',
            detail: 'Eficiência como custo-benefício.',
            correct: 'Descreve eficiência; o gabarito aponta a eficácia controlada.',
          },
          {
            label: 'Letra B — efetividade sem custo',
            detail: 'Efetividade independente de custos.',
            correct: 'Redação frouxa; não é a definição cobrada no gabarito.',
          },
          {
            label: 'Letra D — efetividade real',
            detail: 'Efetividade no ambiente real.',
            correct: 'É efetividade — o item marcado é a eficácia controlada.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão: vacina no lab × na comunidade.',
            correct: 'Lab = eficácia; comunidade = efetividade.',
          },
        ],
        'Trocar rótulo do E → distrator',
      ),
    ],
  },
  {
    file: 'gama-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Efetividade = produzir o efeito desejado no mundo real, com fatores externos. Eficácia = ideal; eficiência = custo/resultado.',
    sources: [{ ...GUIA, covers: ['efetividade', 'eficácia', 'eficiência'] }],
    slides: [
      conceptMap(
        'O que é efetividade?',
        [
          { label: 'Definição', detail: 'Capacidade de produzir o efeito desejado em condições do mundo real.', icon: 'Globe' },
          { label: 'Contexto', detail: 'Fatores externos e variáveis podem influenciar o resultado.', icon: 'Cloud' },
          { label: 'Não confunda', detail: 'Eficácia (ideal) e eficiência (custo).', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Responder com a definição de eficácia controlada.', icon: 'AlertTriangle' },
        ],
        'Mundo real = efetividade',
      ),
      logicFlow(
        [
          'Comando: definição de efetividade.',
          'Eliminar eficácia em condições ideais/controladas.',
          'Eliminar eficiência custo-benefício.',
          'Manter: efeito desejado no mundo real com variáveis externas.',
          'Marcar C.',
          'Em similares: se fala em “rua/comunidade”, pense efetividade.',
        ],
        'Efetividade no mundo real → C',
      ),
      goldenRule(
        'Efetividade em uma linha',
        'Decore',
        [
          { label: 'Efetividade', value: 'Efeito desejado no mundo real.', badge: 'ok' },
          { label: 'Eficácia', value: 'Ideal / experimental.', badge: 'warn' },
          { label: 'Eficiência', value: 'Custo × resultado.', badge: 'warn' },
        ],
        'Real ≠ ideal ≠ custo',
      ),
      dangerZone(
        'PEGADINHAS — efetividade',
        [
          {
            label: 'Letra A — eficácia',
            detail: 'Efeito em condições ideais/controladas.',
            correct: 'Isso é eficácia — não efetividade.',
          },
          {
            label: 'Letra B — eficiência',
            detail: 'Relação custo e resultado.',
            correct: 'Isso é eficiência — outro conceito.',
          },
          {
            label: 'Letra D — eficácia sem financeiro',
            detail: 'Alcançar objetivos sem impacto financeiro.',
            correct: 'Mistura rótulos — não define efetividade.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão: campanha de vacinação na USF.',
            correct: 'Impacto na comunidade mede efetividade.',
          },
        ],
        'Colar eficácia no lugar de efetividade → distrator',
      ),
    ],
  },
  {
    file: 'gama-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Territorialização: identificar e analisar características/necessidades de saúde de uma área para orientar intervenções e recursos — não só “abrir posto”.',
    sources: [{ ...PNAB, covers: ['territorialização', 'área de abrangência', 'necessidades de saúde'] }],
    slides: [
      conceptMap(
        'O que é territorialização?',
        [
          { label: 'Processo', detail: 'Identificar e analisar características e necessidades de saúde de uma área.', icon: 'Map' },
          { label: 'Para quê', detail: 'Orientar intervenções e a alocação de recursos de saúde.', icon: 'Target' },
          { label: 'Não reduz a', detail: 'Só construir posto ou só “dividir mapa” sem análise.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Igualar territorialização a abrir UBS em todo canto.', icon: 'AlertTriangle' },
        ],
        'Área → necessidades → intervenção',
      ),
      logicFlow(
        [
          'Comando: conceito de territorialização em saúde pública.',
          'Eliminar só política de infraestrutura e só divisão equitativa sem análise.',
          'Eliminar “estabelecer postos” como sinônimo completo.',
          'Manter: identificação/análise da área para orientar intervenções e recursos.',
          'Marcar A.',
          'Em similares: território vivo = diagnóstico local, não só tijolo.',
        ],
        'Análise da área → letra A',
      ),
      goldenRule(
        'Territorialização',
        'Decore',
        [
          { label: 'Fazer', value: 'Conhecer a área e suas necessidades de saúde.', badge: 'ok' },
          { label: 'Usar para', value: 'Orientar intervenções e recursos.', badge: 'ok' },
        ],
        'Diagnóstico territorial primeiro',
      ),
      dangerZone(
        'PEGADINHAS — territorialização',
        [
          {
            label: 'Letra B — só infraestrutura',
            detail: 'Políticas para construir infraestrutura onde há demanda.',
            correct: 'Pode decorrer do processo — não define territorialização.',
          },
          {
            label: 'Letra C — só divisão',
            detail: 'Dividir o território para atendimento equitativo.',
            correct: 'Abrangência ajuda, mas falta a análise de necessidades.',
          },
          {
            label: 'Letra D — só postos',
            detail: 'Estabelecer postos de saúde em regiões.',
            correct: 'Acesso físico ≠ territorialização completa.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão: microárea do ACS.',
            correct: 'Microárea é ferramenta da territorialização — não o conceito inteiro.',
          },
        ],
        'Reduzir a tijolo/mapa → distrator',
      ),
    ],
  },
  {
    file: 'gama-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'Vigilância ativa: busca proativa de casos, coleta sistemática, visitas, rastreamento de contatos e investigação de surtos. Passiva depende de notificação espontânea.',
    sources: [{ ...GUIA, covers: ['vigilância ativa', 'vigilância passiva', 'investigação de surtos'] }],
    slides: [
      conceptMap(
        'Vigilância ativa — o certo',
        [
          { label: 'Ativa', detail: 'Busca proativa de casos e coleta sistemática de dados.', icon: 'Search' },
          { label: 'Como', detail: 'Visitas domiciliares, rastreamento de contatos, investigação de surtos.', icon: 'Home' },
          { label: 'Objetivo', detail: 'Identificar e controlar rapidamente ameaças à saúde pública.', icon: 'Shield' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Dizer que passiva dispensa notificação de profissionais.', icon: 'AlertTriangle' },
        ],
        'Ativa = ir atrás do caso',
      ),
      logicFlow(
        [
          'Comando: conceito/metodologia correta na Vigilância em Saúde.',
          'Eliminar passiva “sem notificação” e sindrômica “só lab sem sintoma”.',
          'Eliminar ambiental limitada a água/ar sem vetores/socioeconômico.',
          'Manter vigilância ativa com busca proativa e investigação.',
          'Marcar B.',
          'Em similares: passiva espera a notificação; ativa procura o caso.',
        ],
        'Vigilância ativa → letra B',
      ),
      goldenRule(
        'Ativa × passiva',
        'Decore',
        [
          { label: 'Ativa', value: 'Busca proativa · contatos · surtos.', badge: 'ok' },
          { label: 'Passiva', value: 'Depende da notificação que chega ao sistema.', badge: 'warn' },
        ],
        'Proativa ≠ esperar o papel',
      ),
      dangerZone(
        'PEGADINHAS — vigilância',
        [
          {
            label: 'Letra A — passiva distorcida',
            detail: 'Passiva só com relatórios, sem notificação de profissionais.',
            correct: 'Passiva se apoia na notificação — a redação inverte.',
          },
          {
            label: 'Letra C — sindrômica lab',
            detail: 'Sindrômica = só dados laboratoriais detalhados.',
            correct: 'Sindrômica parte de síndromes clínicas — não “só etiologia lab”.',
          },
          {
            label: 'Letra D — ambiental estreita',
            detail: 'Ambiental só água/ar, sem vetores/socioeconômico.',
            correct: 'Ambiental integra riscos amplos — a limitação é falsa.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão: busca ativa de hanseníase/TB.',
            correct: 'É vigilância ativa aplicada a agravos prioritários.',
          },
        ],
        'Passiva sem notificação → distrator',
      ),
    ],
  },
  {
    file: 'gama-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563809836-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Processo saúde-doença: agente, reservatório e hospedeiro + ambiente e determinantes sociais. Não é só biológico nem só o patógeno.',
    sources: [{ ...GUIA, covers: ['processo saúde-doença', 'determinantes sociais', 'agente', 'hospedeiro'] }],
    slides: [
      conceptMap(
        'Elementos do processo saúde-doença',
        [
          { label: 'Tríade clássica', detail: 'Agente etiológico, reservatório e hospedeiro.', icon: 'Link' },
          { label: 'Além disso', detail: 'Ambiente e determinantes sociais também são fundamentais.', icon: 'Home' },
          { label: 'Não absolutize', detail: 'Patógeno sozinho não basta; social não é “irrelevante”.', icon: 'Ban' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Reduzir tudo ao agente etiológico.', icon: 'AlertTriangle' },
        ],
        'Agente + ambiente + social',
      ),
      logicFlow(
        [
          'Comando: alternativa correta sobre elementos do processo saúde-doença.',
          'Eliminar “apenas agente/reservatório/hospedeiro”.',
          'Eliminar “só biológicos” e “só o agente etiológico”.',
          'Manter: incluir ambiente e determinantes sociais.',
          'Marcar B.',
          'Em similares: adoecer é multicausal — biologia + contexto.',
        ],
        'Inclui ambiente e social → B',
      ),
      goldenRule(
        'Modelo ampliado',
        'Decore',
        [
          { label: 'Sim', value: 'Agente · reservatório · hospedeiro · ambiente · social.', badge: 'ok' },
          { label: 'Não', value: 'Só o patógeno · só o biológico.', badge: 'warn' },
        ],
        'Multicausalidade',
      ),
      dangerZone(
        'PEGADINHAS — saúde-doença',
        [
          {
            label: 'Letra A — só tríade',
            detail: 'Apenas agente, reservatório e hospedeiro.',
            correct: 'Faltam ambiente e determinantes sociais.',
          },
          {
            label: 'Letra C — só biológico',
            detail: 'Apenas fatores biológicos; social irrelevante.',
            correct: 'Social/econômico/cultural importam — não são irrelevantes.',
          },
          {
            label: 'Letra D — só agente',
            detail: 'Agente etiológico é condição suficiente.',
            correct: 'Presença do patógeno não basta sozinha para adoecer.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão: determinantes sociais da saúde (DSS).',
            correct: 'DSS entram no processo saúde-doença coletivo.',
          },
        ],
        'Reduzir ao patógeno → distrator',
      ),
    ],
  },
  {
    file: 'ibade-enfermagem-atencao-basica-saude-da-familia-1778968144588-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'I e II verdadeiras: perfil socioeconômico acha vulneráveis; demografia inclui idade/sexo. III falsa: pesquisa domiciliar não é a única fonte em comunidades grandes.',
    sources: [{ ...GUIA, covers: ['dados demográficos', 'socioeconômicos', 'planejamento em saúde'] }],
    slides: [
      conceptMap(
        'Dados para planejar — o que vale',
        [
          { label: 'I', detail: 'Perfil socioeconômico identifica vulneráveis e orienta políticas.', icon: 'Wallet' },
          { label: 'II', detail: 'Demografia inclui estrutura etária e distribuição por sexo.', icon: 'Users' },
          { label: 'III (falsa)', detail: 'Pesquisa domiciliar NÃO é a única forma confiável em grande porte.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Absolutizar “só inquérito domiciliar”.', icon: 'AlertTriangle' },
        ],
        'I e II certas · III falsa',
      ),
      logicFlow(
        [
          'I — socioeconômico → vulneráveis/políticas → Verdadeira.',
          'II — demografia com idade e sexo → Verdadeira.',
          'III — domiciliar como única fonte confiável → Falsa.',
          'Correto: apenas I e II.',
          'Marcar B.',
          'Em similares: há censos, sistemas de informação e registros além do domiciliar.',
        ],
        'Apenas I e II → letra B',
      ),
      goldenRule(
        'Gabarito das assertivas',
        'Decore',
        [
          { label: 'I', value: 'V — socioeconômico acha vulneráveis.', badge: 'ok' },
          { label: 'II', value: 'V — demografia: idade e sexo.', badge: 'ok' },
          { label: 'III', value: 'F — domiciliar não é a única fonte.', badge: 'warn' },
        ],
        'Só I e II — III confunde fonte única com demografia.',
      ),
      dangerZone(
        'PEGADINHAS — coleta demográfica',
        [
          {
            label: 'Letra A — só III',
            detail: 'Apenas III.',
            correct: 'III é falsa; I e II são verdadeiras.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Apenas II e III.',
            correct: 'Carrega III falsa e perde a I verdadeira.',
          },
          {
            label: 'Letra D — só II',
            detail: 'Apenas II.',
            correct: 'I também está correta.',
          },
          {
            label: 'Letra E — só I',
            detail: 'Apenas I.',
            correct: 'II também está correta.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão: “só SINAN basta para demografia”.',
            correct: 'Demografia usa múltiplas fontes — não um sistema só.',
          },
        ],
        'Absolutizar uma fonte → distrator',
      ),
    ],
  },
  {
    file: 'ibade-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563838275-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_cadeia_transmissao',
    guideline_snapshot:
      'Período de latência: da exposição ao agente até se tornar infeccioso. Incubação leva aos sintomas; transmissibilidade é quando pode transmitir.',
    sources: [{ ...GUIA, covers: ['período de latência', 'incubação', 'transmissibilidade'] }],
    slides: [
      conceptMap(
        'Exposição → infeccioso = ?',
        [
          { label: 'Definição', detail: 'Intervalo entre exposição ao agente e tornar-se infeccioso.', icon: 'Timer' },
          { label: 'Nome', detail: 'Período de latência.', icon: 'Moon' },
          { label: 'Não confunda', detail: 'Incubação (até sintomas) nem só “manifestações clínicas”.', icon: 'GitCompare' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar incubação por ser o período mais citado.', icon: 'AlertTriangle' },
        ],
        'Latência = até ficar infeccioso',
      ),
      logicFlow(
        [
          'Isolar: exposição → tornar-se infeccioso.',
          'Eliminar incubação (exposição → sintomas).',
          'Eliminar transmissibilidade, manifestações clínicas e cura.',
          'Manter período de latência.',
          'Marcar D.',
          'Em similares: infeccioso ≠ sintomático — os relógios podem divergir.',
        ],
        'Latência → letra D',
      ),
      goldenRule(
        'Três períodos',
        'Decore',
        [
          { label: 'Latência', value: 'Exposição → infeccioso.', badge: 'ok' },
          { label: 'Incubação', value: 'Exposição → sintomas.', badge: 'warn' },
          { label: 'Transmissibilidade', value: 'Janela em que pode transmitir.', badge: 'warn' },
        ],
        'Infeccioso ≠ sintomático',
      ),
      dangerZone(
        'PEGADINHAS — história natural',
        [
          {
            label: 'Letra A — incubação',
            detail: 'Período de incubação.',
            correct: 'Incubação vai até os sintomas — não até ficar infeccioso.',
          },
          {
            label: 'Letra B — transmissibilidade',
            detail: 'Período de transmissibilidade.',
            correct: 'É a janela de transmissão — não o intervalo exposição→infeccioso.',
          },
          {
            label: 'Letra C — manifestações',
            detail: 'Período de manifestações clínicas.',
            correct: 'Fala de sintomas — outro recorte.',
          },
          {
            label: 'Letra E — cura',
            detail: 'Período de cura.',
            correct: 'Não descreve o intervalo até se tornar infeccioso.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra questão: latência = infecção sem sintomas.',
            correct: 'Também usado assim; aqui o comando ancora exposição→infeccioso.',
          },
        ],
        'Trocar latência por incubação → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g14',
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
