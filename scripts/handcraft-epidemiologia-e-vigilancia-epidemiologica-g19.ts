/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g19 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g19.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g19';
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
const PRINCIPIOS = {
  id: 'modulo-principios-epidemiologia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Princípios de epidemiologia — incidência e prevalência',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const LISTA = {
  id: 'lista-nacional-notificacao-compulsoria',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Lista Nacional de Notificação Compulsória',
  year: 2020,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
};
const DECRETO = {
  id: 'decreto-7508-2011',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Decreto 7.508/2011 — Região de Saúde',
  year: 2011,
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/decreto/d7508.htm',
};
const SINAN = {
  id: 'sinan-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'SINAN — Ficha de Notificação Individual (violência e agravos)',
  year: 2022,
  url: 'https://portalsinan.saude.gov.br/',
};
const VISA = {
  id: 'lei-8080-vigilancia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Lei 8.080/1990 — vigilância sanitária × epidemiológica',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
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
    file: 'ieses-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Incidência = casos novos em população/período. Prevalência = estoque (novos + antigos) em um momento. Não são sinônimos nem invertidos.',
    sources: [{ ...PRINCIPIOS, covers: ['incidência', 'prevalência', 'medidas de frequência'] }],
    slides: [
      conceptMap(
        'Incidência × prevalência',
        [
          {
            label: 'Para quê',
            detail: 'Medidas de frequência mostram distribuição e dinâmica da doença na população.',
            icon: 'BarChart3',
          },
          {
            label: 'Incidência',
            detail: 'Casos novos em população específica durante um período definido.',
            icon: 'Plus',
          },
          {
            label: 'Prevalência',
            detail: 'Total de casos (novos e antigos) presentes em um dado momento.',
            icon: 'Layers',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Inverter os conceitos ou tratar como sinônimos.',
            icon: 'AlertTriangle',
          },
        ],
        'Novos = incidência · estoque = prevalência',
      ),
      logicFlow(
        [
          'Defina corretamente a diferença entre as duas medidas.',
          'Eliminar “são sinônimos” e “incidência só crônica / prevalência só aguda”.',
          'Eliminar a opção que inverte novos ↔ estoque.',
          'Manter: incidência = novos no período; prevalência = total no momento.',
          'Marcar A.',
          'Em similares: “fluxo de novos” vs “foto do estoque”.',
        ],
        'Novos × estoque → letra A',
      ),
      goldenRule(
        'Duas medidas',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos / população / período.', badge: 'ok' },
          { label: 'Prevalência', value: 'Casos existentes (novos + antigos) no momento.', badge: 'ok' },
          { label: 'Erro clássico', value: 'Inverter ou sinônimo.', badge: 'warn' },
        ],
        'Não troque fluxo por estoque',
      ),
      dangerZone(
        'PEGADINHAS — frequência',
        [
          {
            label: 'Letra B — sinônimos',
            detail: 'Incidência e prevalência são intercambiáveis.',
            correct: 'Medem coisas diferentes — não são sinônimos.',
          },
          {
            label: 'Letra C — crônica/aguda',
            detail: 'Incidência só crônica; prevalência só aguda.',
            correct: 'Ambas servem a vários tipos de condição — não essa divisão.',
          },
          {
            label: 'Letra D — invertido',
            detail: 'Incidência = estoque; prevalência = casos novos.',
            correct: 'Está invertido: novos = incidência; estoque = prevalência.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “prevalência sobe só com casos novos”.',
            correct: 'Prevalência também sobe se a duração da doença aumenta.',
          },
        ],
        'Inverter novos e estoque → distrator',
      ),
    ],
  },
  {
    file: 'igecap-enfermagem-processo-de-enfermagem-1780004452857-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Região de Saúde (Decreto 7.508/2011): agrupamento de municípios limítrofes — não unidade isolada, rede privada nem hospital único.',
    sources: [{ ...DECRETO, covers: ['Região de Saúde', 'municípios limítrofes', 'SUS'] }],
    slides: [
      conceptMap(
        'O que é Região de Saúde?',
        [
          {
            label: 'Definição',
            detail: 'Agrupamento de municípios limítrofes para organizar a atenção no SUS.',
            icon: 'Map',
          },
          {
            label: 'Lógica',
            detail: 'Escala regional de serviços — não um município isolado nem um hospital só.',
            icon: 'Building2',
          },
          {
            label: 'Não é',
            detail: 'Divisão econômica, rede privada ou unidade isolada.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Confundir Região de Saúde com um único hospital de referência.',
            icon: 'AlertTriangle',
          },
        ],
        'Municípios vizinhos = Região de Saúde',
      ),
      logicFlow(
        [
          'Complete: Região de Saúde é…',
          'Eliminar unidade isolada, divisão econômica e rede privada.',
          'Eliminar hospital único.',
          'Manter: agrupamento de municípios limítrofes.',
          'Marcar B.',
          'Em similares: Região de Saúde = território de municípios contíguos.',
        ],
        'Municípios limítrofes → letra B',
      ),
      goldenRule(
        'Região de Saúde',
        'Decore',
        [
          { label: 'É', value: 'Agrupamento de municípios limítrofes.', badge: 'ok' },
          { label: 'Não é', value: 'Hospital único · rede privada · unidade isolada.', badge: 'warn' },
        ],
        'Limítrofes = lado a lado no mapa',
      ),
      dangerZone(
        'PEGADINHAS — Região de Saúde',
        [
          {
            label: 'Letra A — isolada',
            detail: 'Unidade isolada.',
            correct: 'Região agrega municípios — não é unidade isolada.',
          },
          {
            label: 'Letra C — econômica',
            detail: 'Divisão econômica.',
            correct: 'Critério é sanitário/territorial — não divisão econômica.',
          },
          {
            label: 'Letra D — privada',
            detail: 'Rede privada.',
            correct: 'Conceito do SUS público — não rede privada.',
          },
          {
            label: 'Letra E — hospital',
            detail: 'Hospital único.',
            correct: 'Região é território de municípios — não um hospital.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “Região de Saúde = só a capital”.',
            correct: 'Pode incluir vários municípios limítrofes da macrorregião.',
          },
        ],
        'Reduzir região a um prédio → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563608452-7.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'No surto, o TE auxilia identificação de suspeitos, coleta dados para notificação e colabora em prevenção/controle — não isola a comunidade, não prescreve, não ignora casos leves.',
    sources: [{ ...GUIA, covers: ['papel do técnico', 'surto', 'notificação', 'vigilância epidemiológica'] }],
    slides: [
      conceptMap(
        'TE no surto — conduta correta',
        [
          {
            label: 'Cenário',
            detail: 'Surto de gastroenterite viral na comunidade — VE em ação.',
            icon: 'Users',
          },
          {
            label: 'Papel do TE',
            detail: 'Auxiliar identificação de suspeitos, coletar dados para notificação e colaborar na prevenção/controle.',
            icon: 'ClipboardList',
          },
          {
            label: 'Limites',
            detail: 'Não isolar toda a comunidade nem prescrever medicamento.',
            icon: 'Ban',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Notificar só os graves e ignorar casos leves.',
            icon: 'AlertTriangle',
          },
        ],
        'Identificar · notificar · colaborar',
      ),
      logicFlow(
        [
          'Assinale a conduta adequada do Técnico em Enfermagem.',
          'Eliminar isolar todos os moradores e notificar só graves.',
          'Eliminar prescrever tratamento medicamentoso.',
          'Manter: identificar suspeitos, coletar dados e colaborar no controle.',
          'Marcar C.',
          'Em similares: TE alimenta a VE — não assume papel de prescritor.',
        ],
        'Identificar + notificar → letra C',
      ),
      goldenRule(
        'Papel do TE',
        'Decore',
        [
          { label: 'Faz', value: 'Suspeitos · dados de notificação · prevenção/controle.', badge: 'ok' },
          { label: 'Não faz', value: 'Isolar a comunidade · prescrever · só grave.', badge: 'warn' },
        ],
        'Caso leve também informa o surto',
      ),
      dangerZone(
        'PEGADINHAS — TE no surto',
        [
          {
            label: 'Letra A — isolamento total',
            detail: 'Isolar todos os moradores até o fim do surto.',
            correct: 'Medida desproporcional — não é a conduta padrão do TE.',
          },
          {
            label: 'Letra B — só graves',
            detail: 'Notificar apenas casos graves.',
            correct: 'Casos leves também importam para o controle do surto.',
          },
          {
            label: 'Letra D — prescrever',
            detail: 'Prescrever tratamento medicamentoso.',
            correct: 'Prescrição extrapola a atribuição do técnico neste cenário.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “TE não participa da notificação”.',
            correct: 'Coletar dados e auxiliar a notificação é papel central.',
          },
        ],
        'Prescrever ou ignorar leve → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563768972-6.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Cólera: caso suspeito ou confirmado = notificação imediata (até 24 h) pelo profissional/serviço, pelo meio mais rápido disponível — afirmativa correta.',
    sources: [{ ...LISTA, covers: ['cólera', 'notificação imediata', '24 horas'] }],
    slides: [
      conceptMap(
        'Cólera — relógio da notificação',
        [
          {
            label: 'Quem',
            detail: 'Profissional de saúde ou responsável pelo serviço assistencial que atende o paciente.',
            icon: 'UserCheck',
          },
          {
            label: 'O quê',
            detail: 'Todo caso suspeito ou confirmado de cólera.',
            icon: 'AlertCircle',
          },
          {
            label: 'Quando',
            detail: 'Notificação imediata — em até um dia (24 horas), pelo meio mais rápido.',
            icon: 'Zap',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Esperar confirmação laboratorial para só então notificar.',
            icon: 'AlertTriangle',
          },
        ],
        'Suspeito de cólera = imediato',
      ),
      logicFlow(
        [
          'Julgar: cólera suspeita/confirmada → notificação imediata (até 24 h).',
          'Conferir: quem notifica = profissional/serviço que atendeu.',
          'Conferir: meio mais rápido disponível.',
          'Afirmativa alinhada à lista de imediata.',
          'Marcar Certo (A).',
          'Em similares: cólera não espera a semana — é imediata.',
        ],
        'Cólera imediata → Certo',
      ),
      goldenRule(
        'Cólera na lista',
        'Decore',
        [
          { label: 'Prazo', value: 'Imediata — até 24 horas.', badge: 'ok' },
          { label: 'Abrangência', value: 'Suspeito ou confirmado.', badge: 'ok' },
          { label: 'Quem', value: 'Profissional ou responsável pelo serviço.', badge: 'ok' },
        ],
        'Cólera = relógio imediato',
      ),
      dangerZone(
        'PEGADINHAS — cólera C/E',
        [
          {
            label: 'Marcar Errado',
            detail: 'Achar que só confirmado laboratorial notifica.',
            correct: 'Suspeito também entra — a afirmativa está correta.',
          },
          {
            label: 'Prazo semanal',
            detail: 'Tratar cólera como notificação semanal.',
            correct: 'Cólera é imediata — não espera a semana.',
          },
          {
            label: 'Só secretaria',
            detail: 'Só a vigilância municipal notifica, nunca o serviço.',
            correct: 'O serviço que atende também notifica pelo meio mais rápido.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “cólera = notificar só se houver óbito”.',
            correct: 'Caso suspeito/confirmado já dispara a imediata.',
          },
        ],
        'Adiar a cólera → distrator',
      ),
    ],
  },
  {
    file: 'igeduc-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-1.json',
    family: 'certo_errado',
    pedagogical_branch: 'epi_vigilancia_acoes',
    guideline_snapshot:
      'O texto define vigilância EPIDEMIOLÓGICA (conhecer/detectar determinantes e recomendar prevenção/controle). Rotular isso como vigilância SANITÁRIA torna o item Errado.',
    sources: [{ ...VISA, covers: ['vigilância epidemiológica', 'vigilância sanitária', 'Lei 8080'] }],
    slides: [
      conceptMap(
        'VisA × VE — quem é quem',
        [
          {
            label: 'Texto do item',
            detail: 'Conhecer/detectar mudanças em determinantes e recomendar prevenção/controle de agravos.',
            icon: 'BookOpen',
          },
          {
            label: 'Isso é VE',
            detail: 'Vigilância epidemiológica: informação para prevenção e controle de doenças/agravos.',
            icon: 'Activity',
          },
          {
            label: 'VisA',
            detail: 'Regulamentar, controlar e fiscalizar práticas/produtos/serviços que afetam a saúde.',
            icon: 'Scale',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar o rótulo “sanitária” só porque fala em prevenção.',
            icon: 'AlertTriangle',
          },
        ],
        'Definição de VE com nome de VisA',
      ),
      logicFlow(
        [
          'O item chama de vigilância sanitária a definição clássica de VE.',
          'Confrontar: VE = determinantes + prevenção/controle de agravos.',
          'Confrontar: VisA = regulamentar/fiscalizar práticas e produtos.',
          'Rótulo errado → afirmativa falsa.',
          'Marcar Errado (B).',
          'Em similares: leia o verbo — fiscalizar ≠ monitorar agravo.',
        ],
        'Nome trocado → Errado',
      ),
      goldenRule(
        'Dois nomes',
        'Decore',
        [
          { label: 'VE', value: 'Detectar agravos/determinantes → recomendar controle.', badge: 'ok' },
          { label: 'VisA', value: 'Regulamentar · controlar · fiscalizar.', badge: 'ok' },
          { label: 'Armadilha', value: 'Colar definição de VE no rótulo VisA.', badge: 'warn' },
        ],
        'Rótulo errado invalida o item',
      ),
      dangerZone(
        'PEGADINHAS — VisA/VE',
        [
          {
            label: 'Marcar Certo',
            detail: 'Aceitar o texto porque “prevenção” parece VisA.',
            correct: 'O núcleo do texto é VE — o rótulo sanitária está errado.',
          },
          {
            label: 'Só fiscalização',
            detail: 'Achar que VE também é só fiscalizar bar/restaurante.',
            correct: 'Fiscalizar estabelecimento é VisA — outro braço.',
          },
          {
            label: 'Sinônimos',
            detail: 'Tratar VisA e VE como a mesma coisa.',
            correct: 'São componentes distintos da Vigilância em Saúde.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “VisA notifica cólera no SINAN”.',
            correct: 'Fluxo de notificação de agravo é da VE/SINAN.',
          },
        ],
        'Trocar o rótulo dos braços → distrator',
      ),
    ],
  },
  {
    file: 'inaz-do-para-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563800137-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Indicador de mortalidade descreve óbitos (ex.: óbitos por doenças cardíacas em uma cidade). Não é renda, incidência de diabetes nem leitos.',
    sources: [{ ...PRINCIPIOS, covers: ['mortalidade', 'indicadores de saúde', 'óbitos'] }],
    slides: [
      conceptMap(
        'Indicador de mortalidade',
        [
          {
            label: 'Ideia',
            detail: 'Mortalidade fala de óbitos em população/tempo/lugar.',
            icon: 'HeartCrack',
          },
          {
            label: 'Exemplo válido',
            detail: 'Número de óbitos por doenças cardíacas em uma cidade.',
            icon: 'MapPin',
          },
          {
            label: 'Não é',
            detail: 'Renda familiar, incidência de diabetes, crescimento populacional ou leitos.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Misturar mortalidade com oferta de leitos ou renda.',
            icon: 'AlertTriangle',
          },
        ],
        'Mortalidade = óbitos',
      ),
      logicFlow(
        [
          'Qual alternativa descreve o indicador de mortalidade.',
          'Eliminar renda, incidência de diabetes e crescimento populacional.',
          'Eliminar óbitos misturados com disponibilidade de leitos.',
          'Manter: número de óbitos por doenças cardíacas na cidade.',
          'Marcar E.',
          'Em similares: mortalidade conta mortes — não serviço nem renda.',
        ],
        'Óbitos → letra E',
      ),
      goldenRule(
        'Mortalidade em uma linha',
        'Decore',
        [
          { label: 'É', value: 'Óbitos (causa/população/tempo/lugar).', badge: 'ok' },
          { label: 'Não é', value: 'Renda · leitos · incidência · crescimento.', badge: 'warn' },
        ],
        'Se não conta morte, não é mortalidade',
      ),
      dangerZone(
        'PEGADINHAS — mortalidade',
        [
          {
            label: 'Letra A — leitos',
            detail: 'Óbitos + disponibilidade de leitos.',
            correct: 'Leitos são oferta de serviço — não definem mortalidade.',
          },
          {
            label: 'Letra B — renda',
            detail: 'Aumento da renda média das famílias.',
            correct: 'Indicador socioeconômico — não de mortalidade.',
          },
          {
            label: 'Letra C — incidência',
            detail: 'Taxa de incidência de diabetes.',
            correct: 'Incidência mede casos novos — não óbitos.',
          },
          {
            label: 'Letra D — crescimento',
            detail: 'Crescimento populacional acelerado.',
            correct: 'Demografia — não indicador de mortalidade.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “mortalidade = todos os doentes vivos”.',
            correct: 'Doentes vivos apontam morbidade/prevalência — não óbito.',
          },
        ],
        'Trocar óbito por outro indicador → distrator',
      ),
    ],
  },
  {
    file: 'instituto-aocp-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563848614-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Notificação em até 24 h: SRAG associada a Coronavírus. HIV, Chagas crônica, esquistossomose e hanseníase não são o prazo imediato desta chave.',
    sources: [{ ...LISTA, covers: ['SRAG', 'coronavírus', 'notificação imediata', '24 horas'] }],
    slides: [
      conceptMap(
        'Notificar em até 24 h — qual?',
        [
          {
            label: 'Comando',
            detail: 'Doença/agravo com notificação às autoridades em até 24 horas da suspeita ou óbito.',
            icon: 'Clock',
          },
          {
            label: 'Imediata (chave)',
            detail: 'Síndrome Respiratória Aguda Grave associada a Coronavírus.',
            icon: 'Wind',
          },
          {
            label: 'Não imediata aqui',
            detail: 'HIV, Chagas crônica, esquistossomose e hanseníase — outros prazos/fluxos.',
            icon: 'Calendar',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar hanseníase/HIV só porque também são compulsórias.',
            icon: 'AlertTriangle',
          },
        ],
        'Compulsória ≠ mesmo prazo de 24 h',
      ),
      logicFlow(
        [
          'Qual deve ser notificada em até 24 horas.',
          'Eliminar HIV, Chagas crônica, esquistossomose e hanseníase.',
          'Manter SRAG associada a Coronavírus.',
          'Marcar E.',
          'Em similares: leia o relógio — imediata × semanal × outros fluxos.',
        ],
        'SRAG-coronavírus → letra E',
      ),
      goldenRule(
        'Relógio 24 h',
        'Decore',
        [
          { label: '24 h (chave)', value: 'SRAG associada a Coronavírus.', badge: 'ok' },
          { label: 'Outros fluxos', value: 'HIV · Chagas crônica · esquistossomose · hanseníase.', badge: 'warn' },
        ],
        'Imediata não cobre toda a lista',
      ),
      dangerZone(
        'PEGADINHAS — prazo 24 h',
        [
          {
            label: 'Letra A — HIV',
            detail: 'HIV.',
            correct: 'Não é o agravo de notificação em 24 h desta chave.',
          },
          {
            label: 'Letra B — Chagas crônica',
            detail: 'Doença de Chagas Crônica.',
            correct: 'Fluxo diferente — não fecha o prazo de 24 h aqui.',
          },
          {
            label: 'Letra C — esquistossomose',
            detail: 'Esquistossomose.',
            correct: 'Não é a imediata de 24 h nesta lista de opções.',
          },
          {
            label: 'Letra D — hanseníase',
            detail: 'Hanseníase.',
            correct: 'Compulsória típica semanal — não o prazo de 24 h.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “toda SRAG = notificar só após PCR”.',
            correct: 'Suspeita inicial já dispara o relógio imediato.',
          },
        ],
        'Compulsória sem ler o prazo → distrator',
      ),
    ],
  },
  {
    file: 'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-6.json',
    family: 'protocolo',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Violência: Ficha de Notificação Individual no SINAN. Não é SIPNI, SISAB, SIAPS nem “SVS” como sistema de ficha.',
    sources: [{ ...SINAN, covers: ['SINAN', 'Ficha de Notificação Individual', 'violência', 'UPA'] }],
    slides: [
      conceptMap(
        'Violência — qual sistema?',
        [
          {
            label: 'Caso',
            detail: 'UPA: violência física e sexual revelada em ambiente reservado; Ficha de Notificação Individual.',
            icon: 'Shield',
          },
          {
            label: 'Sistema',
            detail: 'SINAN recebe a notificação individual de violência e outros agravos.',
            icon: 'Database',
          },
          {
            label: 'Não confundir',
            detail: 'SIPNI (imunização), SISAB (APS), SIAPS ou sigla SVS genérica.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar SIPNI porque “também é sistema do MS”.',
            icon: 'AlertTriangle',
          },
        ],
        'FNI de violência → SINAN',
      ),
      logicFlow(
        [
          'A notificação da violência foi na Ficha de Notificação Individual.',
          'Eliminar SIAPS, SVS, SIPNI e SISAB.',
          'Manter SINAN.',
          'Marcar A.',
          'Em similares: FNI de agravo/violência aponta SINAN.',
        ],
        'SINAN → letra A',
      ),
      goldenRule(
        'Sistemas em uma linha',
        'Decore',
        [
          { label: 'SINAN', value: 'Notificação individual de agravos/violência.', badge: 'ok' },
          { label: 'SIPNI', value: 'Imunizações.', badge: 'warn' },
          { label: 'SISAB', value: 'Atenção básica / e-SUS APS.', badge: 'warn' },
        ],
        'Ficha de violência não é vacina nem APS',
      ),
      dangerZone(
        'PEGADINHAS — sistema',
        [
          {
            label: 'Letra B — SIAPS',
            detail: 'SIAPS.',
            correct: 'Não é o sistema da Ficha de Notificação Individual de violência.',
          },
          {
            label: 'Letra C — SVS',
            detail: 'SVS.',
            correct: 'SVS é estrutura/secretaria — não o sistema da ficha.',
          },
          {
            label: 'Letra D — SIPNI',
            detail: 'SIPNI.',
            correct: 'SIPNI é imunização — outro sistema.',
          },
          {
            label: 'Letra E — SISAB',
            detail: 'SISAB.',
            correct: 'SISAB/e-SUS APS não substitui o SINAN da violência.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “violência só registra no boletim de ocorrência”.',
            correct: 'Saúde também notifica no SINAN — fluxo paralelo e ético.',
          },
        ],
        'Trocar SINAN por outro sistema → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g19',
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
