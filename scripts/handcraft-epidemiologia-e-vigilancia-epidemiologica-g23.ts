/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g23 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g23.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g23';
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
  id: 'portaria-consolidacao-4-2017',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Portaria de Consolidação nº 4/2017 — notificação compulsória',
  year: 2017,
  url: 'https://www.gov.br/saude/pt-br',
};
const PRINCIPIOS = {
  id: 'modulo-principios-epidemiologia-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Princípios de epidemiologia — incidência e morbimortalidade',
  year: 2010,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/modulo_principios_epidemiologia_2.pdf',
};
const AEDES = {
  id: 'controle-aedes-fa-dengue-ms',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Controle de vetores da febre amarela e da dengue — armadilhas e tratamento',
  year: 2009,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/',
};
const BIO = {
  id: 'controle-biologico-pragas',
  tier: 'B' as const,
  issuer: 'Ministério da Saúde / agricultura',
  title: 'Controle biológico — predadores, parasitos e patógenos',
  year: 2010,
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
    file: 'ms-sarmento-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563784564-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Notificação compulsória: obrigatória para médicos, outros profissionais e responsáveis por serviços públicos/privados. Não só médico/enfermeiro; imediata ≠ 48 h; semanal ≠ 72 h.',
    sources: [{ ...LISTA, covers: ['notificação compulsória', 'quem notifica', 'imediata', 'semanal'] }],
    slides: [
      conceptMap(
        'Quem deve notificar?',
        [
          {
            label: 'Obrigação',
            detail: 'Médicos, outros profissionais de saúde ou responsáveis pelos serviços públicos e privados que assistem o paciente.',
            icon: 'Users',
          },
          {
            label: 'Amplitude',
            detail: 'Não se restringe a “só médico e enfermeiro”.',
            icon: 'Expand',
          },
          {
            label: 'Prazos',
            detail: 'Imediata e semanal têm relógios próprios — não invente dois ou três dias.',
            icon: 'Clock',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Estreitar quem notifica ou alongar o prazo imediato.',
            icon: 'AlertTriangle',
          },
        ],
        'Profissional/serviço amplo · prazo certo',
      ),
      logicFlow(
        [
          'Assinale a alternativa correta sobre notificação compulsória.',
          'Eliminar “só médicos e enfermeiros”.',
          'Eliminar imediata em até dois dias e semanal em até três dias.',
          'Manter: médicos, outros profissionais ou responsáveis pelos serviços.',
          'Marcar A.',
          'Em similares: quem assiste notifica — lista de categorias é ampla.',
        ],
        'Quem assiste notifica → letra A',
      ),
      goldenRule(
        'Regras da compulsória',
        'Decore',
        [
          { label: 'Quem', value: 'Médico · outros profissionais · responsável pelo serviço.', badge: 'ok' },
          { label: 'Escopo', value: 'Serviços públicos e privados.', badge: 'ok' },
          { label: 'Não', value: 'Só médico/enfermeiro · prazos inventados.', badge: 'warn' },
        ],
        'Obrigação ampla · relógio da lista',
      ),
      dangerZone(
        'PEGADINHAS — compulsória',
        [
          {
            label: 'Letra B — só médico/enfermeiro',
            detail: 'Obrigatória só para médicos e enfermeiros.',
            correct: 'Outros profissionais e responsáveis pelo serviço também notificam.',
          },
          {
            label: 'Letra C — imediata alongada',
            detail: 'Imediata em até dois dias do atendimento.',
            correct: 'Prazo imediato não é esse “dois dias” nesta chave.',
          },
          {
            label: 'Letra D — semanal alongada',
            detail: 'NCS em até três dias.',
            correct: 'Semanal não se resume a esse prazo inventado.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “serviço privado não notifica”.',
            correct: 'Públicos e privados entram na obrigação.',
          },
        ],
        'Estreitar quem ou alongar prazo → distrator',
      ),
    ],
  },
  {
    file: 'ms-sarmento-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_indicadores',
    guideline_snapshot:
      'Indicadores de morbimortalidade nesta chave: mortalidade materna e infantil. Pacotes com só acidentes/homicídio ou misturas amplas não fecham.',
    sources: [{ ...PRINCIPIOS, covers: ['morbimortalidade', 'mortalidade materna', 'mortalidade infantil'] }],
    slides: [
      conceptMap(
        'Indicadores de morbimortalidade',
        [
          {
            label: 'Ideia',
            detail: 'Medidas sobre atributos do estado de saúde e desempenho do sistema.',
            icon: 'BarChart3',
          },
          {
            label: 'Pacote (chave)',
            detail: 'Mortalidade materna e infantil.',
            icon: 'Heart',
          },
          {
            label: 'Não fecha',
            detail: 'Só violência/acidentes ou misturas sem o núcleo materno-infantil.',
            icon: 'XCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar lista longa de causas externas achando que “mais itens = mais certo”.',
            icon: 'AlertTriangle',
          },
        ],
        'Materna + infantil = morbimortalidade',
      ),
      logicFlow(
        [
          'Quais são indicadores de morbimortalidade nesta prova.',
          'Eliminar pacotes só de acidentes/afogamento/homicídio.',
          'Eliminar misturas que não fecham o núcleo materno-infantil.',
          'Manter mortalidade materna e infantil.',
          'Marcar C.',
          'Em similares: morbimortalidade clássica ancora mãe e criança.',
        ],
        'Materna e infantil → letra C',
      ),
      goldenRule(
        'Morbimortalidade',
        'Decore',
        [
          { label: 'Chave', value: 'Mortalidade materna e infantil.', badge: 'ok' },
          { label: 'Cuidado', value: 'Lista longa de causas externas ≠ resposta automática.', badge: 'warn' },
        ],
        'Dois indicadores clássicos fecham a chave',
      ),
      dangerZone(
        'PEGADINHAS — morbimortalidade',
        [
          {
            label: 'Letra A — + infecções',
            detail: 'Materna, infantil e infecções respiratórias inferiores.',
            correct: 'Acrescenta item que não fecha o pacote desta chave.',
          },
          {
            label: 'Letra B — desnutrição/acidentes',
            detail: 'Desnutrição, acidentes e anomalias congênitas.',
            correct: 'Não é o par materna/infantil pedido.',
          },
          {
            label: 'Letra D — causas externas',
            detail: 'Acidentes, afogamento e homicídio.',
            correct: 'Causas externas — não o núcleo materno-infantil.',
          },
          {
            label: 'Letra E — mistura ampla',
            detail: 'Acidentes, afogamento, diarreicas e prematuridade.',
            correct: 'Mistura ampla — não a alternativa correta desta prova.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “morbimortalidade = só óbitos de idosos”.',
            correct: 'Materna e infantil são recortes centrais de vigilância.',
          },
        ],
        'Trocar mãe/criança por causa externa → distrator',
      ),
    ],
  },
  {
    file: 'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'I verdadeiro: agravo = dano por circunstâncias nocivas (acidentes, intoxicações, violências). II falso: não exige só confirmação. III falso: imediata não é em até 72 h.',
    sources: [{ ...LISTA, covers: ['agravo', 'notificação compulsória', 'suspeita', 'imediata'] }],
    slides: [
      conceptMap(
        'Notificação — o que vale?',
        [
          {
            label: 'I — agravo',
            detail: 'Dano à integridade física/mental por circunstâncias nocivas (acidentes, intoxicações, violências, lesão autoprovocada).',
            icon: 'Shield',
          },
          {
            label: 'II — só confirmado',
            detail: 'Suspeita também dispara notificação.',
            icon: 'XCircle',
          },
          {
            label: 'III — prazo',
            detail: 'Imediata não é “até 72 horas” do primeiro atendimento.',
            icon: 'Clock',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar II porque “confirmação parece mais séria”.',
            icon: 'AlertTriangle',
          },
        ],
        'Só a definição de agravo (I)',
      ),
      logicFlow(
        [
          'I — definição de agravo → correta.',
          'II — só após confirmação → falsa.',
          'III — imediata em até três dias → falsa.',
          'Somente o item I.',
          'Marcar A.',
          'Em similares: suspeita conta; leia o relógio da imediata.',
        ],
        'Somente I → letra A',
      ),
      goldenRule(
        'Gabarito dos itens',
        'Decore',
        [
          { label: 'I', value: 'Certo — definição de agravo.', badge: 'ok' },
          { label: 'II', value: 'Errado — não exige só confirmação.', badge: 'warn' },
          { label: 'III', value: 'Errado — prazo imediato inventado.', badge: 'warn' },
        ],
        'Um item certo · dois com falha',
      ),
      dangerZone(
        'PEGADINHAS — itens',
        [
          {
            label: 'Letra B — I e II',
            detail: 'Somente I e II.',
            correct: 'II é falsa — não combine com I.',
          },
          {
            label: 'Letra C — I e III',
            detail: 'Somente I e III.',
            correct: 'III erra o prazo da imediata.',
          },
          {
            label: 'Letra D — II e III',
            detail: 'Somente II e III.',
            correct: 'Ambos falsos — e perde o I verdadeiro.',
          },
          {
            label: 'Letra E — todos',
            detail: 'Todos os itens.',
            correct: 'II e III caem — não marque todos.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “violência não é agravo de notificação”.',
            correct: 'Violência/maus-tratos entram na definição de agravo.',
          },
        ],
        'Exigir confirmação ou alongar prazo → distrator',
      ),
    ],
  },
  {
    file: 'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Controle biológico: predadores eliminam de forma violenta; parasitos vivem às expensas do hospedeiro; patógenos = microrganismos que causam enfermidade. Sequência 1-2-3.',
    sources: [{ ...BIO, covers: ['controle biológico', 'predadores', 'parasitos', 'patógenos'] }],
    slides: [
      conceptMap(
        'Controle biológico — três papéis',
        [
          {
            label: 'Predadores (1)',
            detail: 'Eliminam a praga de forma violenta — sugam hemolinfa ou consomem tecidos.',
            icon: 'Bug',
          },
          {
            label: 'Parasitos (2)',
            detail: 'Vivem às expensas do corpo do inseto (ex.: nematoides/fungos na chave), levando à morte.',
            icon: 'GitBranch',
          },
          {
            label: 'Patógenos (3)',
            detail: 'Microrganismos (vírus, bactérias, protozoários, fungos) que provocam enfermidades/epizootias.',
            icon: 'Microscope',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Inverter predador com patógeno na numeração.',
            icon: 'AlertTriangle',
          },
        ],
        '1 predador · 2 parasito · 3 patógeno',
      ),
      logicFlow(
        [
          'Casar definições com 1-2-3.',
          'Eliminação violenta → predadores (1).',
          'Viver às expensas do corpo → parasitos (2).',
          'Microrganismos/enfermidades → patógenos (3).',
          'Sequência 1-2-3 → marcar A.',
          'Em similares: quem mata “comendo” ≠ quem infecta como micróbio.',
        ],
        '1-2-3 → letra A',
      ),
      goldenRule(
        'Três organismos',
        'Decore',
        [
          { label: '1 Predadores', value: 'Eliminam comendo/sugando.', badge: 'ok' },
          { label: '2 Parasitos', value: 'Vivem no/à custa do hospedeiro.', badge: 'ok' },
          { label: '3 Patógenos', value: 'Microrganismos que adoecem a praga.', badge: 'ok' },
        ],
        'Ordem da coluna = ordem das lacunas',
      ),
      dangerZone(
        'PEGADINHAS — numeração',
        [
          {
            label: 'Letra B — 3-2-1',
            detail: 'Começa com patógenos na primeira lacuna.',
            correct: 'Primeira lacuna é predador — não patógeno.',
          },
          {
            label: 'Letra C — 2-3-1',
            detail: 'Começa com parasitos.',
            correct: 'Primeira descrição é eliminação violenta = predador.',
          },
          {
            label: 'Letra D — 2-1-3',
            detail: 'Troca predador e parasito.',
            correct: 'Ordem correta das duas primeiras é 1 depois 2.',
          },
          {
            label: 'Letra E — 3-1-2',
            detail: 'Patógeno primeiro.',
            correct: 'Microrganismo fecha a terceira lacuna — não a primeira.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “todo fungo = só predador”.',
            correct: 'Na chave, fungo pode aparecer em parasito/patógeno — leia a definição.',
          },
        ],
        'Inverter a numeração → distrator',
      ),
    ],
  },
  {
    file: 'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563793798-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Armadilha de oviposição atrai FÊMEAS (não machos) para postura. Ovitrampas/larvitrampas = certo. Tratamento focal/perifocal/UBV = certo. Sequência E-C-C.',
    sources: [{ ...AEDES, covers: ['ovitrampa', 'larvitrampa', 'Aedes', 'UBV', 'tratamento focal'] }],
    slides: [
      conceptMap(
        'Combate ao Aedes — C ou E',
        [
          {
            label: '1ª afirmativa',
            detail: 'Errada: armadilha de oviposição não atrai machos para posturar — atrai fêmeas.',
            icon: 'XCircle',
          },
          {
            label: '2ª afirmativa',
            detail: 'Certa: armadilhas dividem-se em ovitrampas e larvitrampas.',
            icon: 'CheckCircle',
          },
          {
            label: '3ª afirmativa',
            detail: 'Certa: químico/biológico via focal, perifocal e aspersão UBV.',
            icon: 'CheckCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Aceitar “machos” na oviposição porque a armadilha “atrai o mosquito”.',
            icon: 'AlertTriangle',
          },
        ],
        'Sequência E · C · C nesta chave',
      ),
      logicFlow(
        [
          '1 — atrair machos para postura → Errada.',
          '2 — ovitrampas e larvitrampas → Certa.',
          '3 — focal, perifocal e UBV → Certa.',
          'Sequência E-C-C.',
          'Marcar B.',
          'Em similares: quem põe ovo é a fêmea hematófaga.',
        ],
        'E-C-C → letra B',
      ),
      goldenRule(
        'Armadilha e combate',
        'Decore',
        [
          { label: 'Oviposição', value: 'Atrai fêmeas — não machos.', badge: 'warn' },
          { label: 'Tipos', value: 'Ovitrampa · larvitrampa.', badge: 'ok' },
          { label: 'Aplicação', value: 'Focal · perifocal · UBV.', badge: 'ok' },
        ],
        'Macho na postura = erro clássico',
      ),
      dangerZone(
        'PEGADINHAS — sequência C/E',
        [
          {
            label: 'Letra A — C-C-E',
            detail: 'Aceita a 1ª e nega a 3ª.',
            correct: '1ª é errada (machos) e 3ª é certa.',
          },
          {
            label: 'Letra C — C-E-E',
            detail: 'Aceita machos e derruba 2 e 3.',
            correct: 'Inverte o veredito das três afirmativas.',
          },
          {
            label: 'Letra D — E-C-E',
            detail: 'Nega o combate focal/UBV.',
            correct: 'A 3ª afirmativa está certa nesta chave.',
          },
          {
            label: 'Letra E — C-E-C',
            detail: 'Aceita machos e nega ovitrampa/larvitrampa.',
            correct: '1ª errada · 2ª certa — não essa sequência.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “ovitrampa atrai só larva já formada”.',
            correct: 'Ovitrampa mira postura de ovos pela fêmea.',
          },
        ],
        'Trocar fêmea por macho → distrator',
      ),
    ],
  },
  {
    file: 'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Portaria Consolidação 4/2017: violência sexual e óbito por varicela = compulsórios. Acidente de moto em passeio NÃO entra como item compulsório nesta chave.',
    sources: [{ ...LISTA, covers: ['violência sexual', 'óbito por varicela', 'notificação compulsória'] }],
    slides: [
      conceptMap(
        'O que entra na compulsória?',
        [
          {
            label: 'I — moto',
            detail: 'Acidente de moto em passeio — não é o evento compulsório desta lista.',
            icon: 'XCircle',
          },
          {
            label: 'II — violência sexual',
            detail: 'Violência sexual — agravo de notificação compulsória.',
            icon: 'Shield',
          },
          {
            label: 'III — óbito varicela',
            detail: 'Óbito por varicela — evento de notificação compulsória.',
            icon: 'AlertCircle',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Notificar todo acidente de trânsito como compulsório nacional.',
            icon: 'AlertTriangle',
          },
        ],
        'II e III · I fora',
      ),
      logicFlow(
        [
          'I — acidente de moto em passeio → fora.',
          'II — violência sexual → entra.',
          'III — óbito por varicela → entra.',
          'Somente II e III.',
          'Marcar D.',
          'Em similares: leia o tipo de evento — nem todo trauma é compulsório.',
        ],
        'Somente II e III → letra D',
      ),
      goldenRule(
        'Gabarito dos itens',
        'Decore',
        [
          { label: 'I', value: 'Fora — moto em passeio.', badge: 'warn' },
          { label: 'II', value: 'Entra — violência sexual.', badge: 'ok' },
          { label: 'III', value: 'Entra — óbito por varicela.', badge: 'ok' },
        ],
        'Dois compulsórios · um fora',
      ),
      dangerZone(
        'PEGADINHAS — lista',
        [
          {
            label: 'Letra A — todos',
            detail: 'Todos os itens.',
            correct: 'I não entra — não marque os três.',
          },
          {
            label: 'Letra B — I e II',
            detail: 'Somente I e II.',
            correct: 'Carrega o acidente de moto e perde o óbito por varicela.',
          },
          {
            label: 'Letra C — I e III',
            detail: 'Somente I e III.',
            correct: 'Inclui I indevido e perde a violência sexual.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “varicela leve sempre é imediata nacional”.',
            correct: 'Aqui o item compulsório destacado é o óbito por varicela.',
          },
        ],
        'Colar acidente comum na lista → distrator',
      ),
    ],
  },
  {
    file: 'objetiva-concursos-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563814158-8.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Casar: notificação compulsória = comunicação obrigatória; agravo = dano por circunstâncias nocivas; doença = enfermidade/estado clínico com dano significativo. Sequência 3-1-2.',
    sources: [{ ...LISTA, covers: ['agravo', 'doença', 'notificação compulsória', 'Portaria 4/2017'] }],
    slides: [
      conceptMap(
        'Três definições — Portaria 4/2017',
        [
          {
            label: 'Notificação (3)',
            detail: 'Comunicação obrigatória de suspeita/confirmação — imediata ou semanal.',
            icon: 'Bell',
          },
          {
            label: 'Agravo (1)',
            detail: 'Dano físico/mental por circunstâncias nocivas (acidentes, violências, intoxicações).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Doença (2)',
            detail: 'Enfermidade ou estado clínico que represente dano significativo.',
            icon: 'HeartPulse',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Começar a sequência pelo agravo porque a definição de violência aparece cedo.',
            icon: 'Shuffle',
          },
        ],
        'Sequência 3 · 1 · 2 na Portaria',
      ),
      logicFlow(
        [
          '1ª lacuna: comunicação obrigatória → notificação (3).',
          '2ª lacuna: dano por circunstâncias nocivas → agravo (1).',
          '3ª lacuna: enfermidade/estado clínico → doença (2).',
          'Sequência 3-1-2.',
          'Marcar B.',
          'Em similares: notificação é o ato; agravo e doença são os objetos.',
        ],
        '3-1-2 → letra B',
      ),
      goldenRule(
        'Três conceitos',
        'Decore',
        [
          { label: '3 Notificação', value: 'Comunicar suspeita/confirmação à autoridade.', badge: 'ok' },
          { label: '1 Agravo', value: 'Dano por circunstâncias nocivas.', badge: 'ok' },
          { label: '2 Doença', value: 'Enfermidade/estado com dano significativo.', badge: 'ok' },
        ],
        'Ato · dano externo · enfermidade',
      ),
      dangerZone(
        'PEGADINHAS — casamento',
        [
          {
            label: 'Letra A — 1-2-3',
            detail: 'Começa pelo agravo.',
            correct: 'A primeira lacuna é a comunicação = notificação (3).',
          },
          {
            label: 'Letra C — 2-3-1',
            detail: 'Começa pela doença.',
            correct: 'Ordem das lacunas é 3 depois 1 depois 2.',
          },
          {
            label: 'Letra D — 2-1-3',
            detail: 'Doença primeiro e notificação por último.',
            correct: 'Inverte ato e objetos — sequência errada.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “agravo = sinônimo exato de doença”.',
            correct: 'Agravo enfatiza dano por circunstância nociva; doença é enfermidade.',
          },
        ],
        'Inverter ato e objeto → distrator',
      ),
    ],
  },
  {
    file: 'objetiva-concursos-enfermagem-processo-de-enfermagem-1780010566816-4.json',
    family: 'conceito',
    pedagogical_branch: 'epi_generico',
    guideline_snapshot:
      'Casos novos em determinado período = incidência. Prevalência = estoque; letalidade = óbitos entre doentes; mortalidade proporcional = outro indicador.',
    sources: [{ ...PRINCIPIOS, covers: ['incidência', 'prevalência', 'letalidade'] }],
    slides: [
      conceptMap(
        'Casos novos no período = ?',
        [
          {
            label: 'Pedido',
            detail: 'Medida do número de casos novos de uma doença em determinado período.',
            icon: 'Plus',
          },
          {
            label: 'Nome',
            detail: 'Incidência.',
            icon: 'TrendingUp',
          },
          {
            label: 'Não confundir',
            detail: 'Prevalência (estoque), letalidade e mortalidade proporcional.',
            icon: 'GitCompare',
          },
          {
            label: 'PEGADINHA-ÂNCORA',
            detail: 'Marcar prevalência porque também “conta casos”.',
            icon: 'AlertTriangle',
          },
        ],
        'Novos no tempo = incidência',
      ),
      logicFlow(
        [
          'Medida de casos novos em um período.',
          'Eliminar prevalência (novos + antigos / momento).',
          'Eliminar letalidade e mortalidade proporcional.',
          'Manter incidência.',
          'Marcar A.',
          'Em similares: “novos” + “período” = incidência.',
        ],
        'Incidência → letra A',
      ),
      goldenRule(
        'Quatro medidas',
        'Decore',
        [
          { label: 'Incidência', value: 'Casos novos / período.', badge: 'ok' },
          { label: 'Prevalência', value: 'Casos existentes (estoque).', badge: 'warn' },
          { label: 'Letalidade', value: 'Óbitos entre os doentes.', badge: 'warn' },
        ],
        'Novos no período não é estoque',
      ),
      dangerZone(
        'PEGADINHAS — medida',
        [
          {
            label: 'Letra B — mortalidade proporcional',
            detail: 'Mortalidade proporcional.',
            correct: 'Fala de óbitos relativos — não de casos novos.',
          },
          {
            label: 'Letra C — letalidade',
            detail: 'Letalidade.',
            correct: 'É mortalidade entre doentes — não incidência.',
          },
          {
            label: 'Letra D — prevalência',
            detail: 'Prevalência.',
            correct: 'Estoque de casos — não só os novos do período.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “incidência ignora o tempo”.',
            correct: 'Incidência exige período definido.',
          },
        ],
        'Trocar novos por estoque/óbito → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g23',
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
