/**
 * Handcraft golden-v1 — epidemiologia-e-vigilancia-epidemiologica-g09 (8/8).
 * Cursor Grok 4.5 — 2026-08-03
 * Run: npx tsx scripts/handcraft-epidemiologia-e-vigilancia-epidemiologica-g09.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const LOTE = 'epidemiologia-e-vigilancia-epidemiologica-g09';
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
  year: 2022,
  url: 'https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria',
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
    file: 'fenix-instituto-enfermagem-processo-de-enfermagem-1780006471061-3.json',
    family: 'conceito',
    pedagogical_branch: 'epi_ocorrencia_agravos',
    guideline_snapshot:
      'Epidemia = elevação de novos casos além do esperado para a área/período. Endemia = estável; pandemia ≠ restrição local.',
    sources: [{ ...GUIA, covers: ['epidemia', 'endemia', 'surto', 'pandemia'] }],
    slides: [
      conceptMap(
        'Aumento acima do esperado = ?',
        [
          { label: 'Cenário', detail: 'Aumento inesperado de novos casos em período curto, acima do padrão histórico da área.', icon: 'TrendingUp' },
          { label: 'Nome', detail: 'Epidemia — elevação além do esperado.', icon: 'Activity' },
          { label: 'Não é', detail: 'Endemia estável, surto “sempre internacional” nem pandemia local/sazonal.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Chamar de pandemia só porque “aumentou muito”.', icon: 'AlertTriangle' },
        ],
        'Acima do esperado = epidemia',
      ),
      logicFlow(
        [
          'Isolar: novos casos + período curto + acima do padrão histórico da área.',
          'Eliminar endemia (distribuição estável e contínua).',
          'Eliminar surto definido como “sempre internacional”.',
          'Eliminar pandemia por “restrição local e sazonal” (definição invertida).',
          'Manter epidemia por elevação além do esperado.',
          'Marcar C.',
          'Em similares: excesso local/temporal = epidemia; multi-nacional = pandemia.',
        ],
        'Elevação além do esperado → C',
      ),
      goldenRule(
        'Quatro escalas',
        'Decore',
        [
          { label: 'Epidemia', value: 'Acima do esperado na área/período.', badge: 'ok' },
          { label: 'Endemia', value: 'Presença estável/contínua.', badge: 'warn' },
          { label: 'Pandemia', value: 'Larga distribuição (várias nações) — não “local”.', badge: 'warn' },
        ],
        'Excesso esperado = epidemia',
      ),
      dangerZone(
        'PEGADINHAS — ocorrência',
        [
          {
            label: 'Letra A — endemia',
            detail: 'Endemia por distribuição estável e contínua.',
            correct: 'Estável/contínua é endemia — aqui há elevação inesperada.',
          },
          {
            label: 'Letra B — surto internacional',
            detail: 'Surto por ocorrência sempre internacional.',
            correct: 'Surto não se define como “sempre internacional”.',
          },
          {
            label: 'Letra D — pandemia local',
            detail: 'Pandemia por restrição local e sazonal.',
            correct: 'Pandemia é larga distribuição — não restrição local.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “muito caso num bairro = pandemia”.',
            correct: 'Bairro/área = surto/epidemia; pandemia exige escala ampla.',
          },
        ],
        'Inverter epidemia e pandemia → distrator',
      ),
    ],
  },
  {
    file: 'fepese-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563626015-9.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Trio limpo: infecção por HTLV, intoxicação exógena e tuberculose. Intrusos: verrugas, diabetes, herpes, clamídia, Hashimoto, Sjogren, ELA.',
    sources: [{ ...LISTA, covers: ['HTLV', 'intoxicação exógena', 'tuberculose', 'lista nacional'] }],
    slides: [
      conceptMap(
        'Apenas compulsórios — qual trio?',
        [
          { label: 'Comando', detail: 'Alternativa com apenas doenças/agravos/eventos de notificação compulsória.', icon: 'ClipboardCheck' },
          { label: 'Trio limpo', detail: 'Infecção por HTLV, intoxicação exógena e tuberculose.', icon: 'CheckCircle2' },
          { label: 'Intrusos típicos', detail: 'Diabetes, herpes zoster, clamídia, Hashimoto, Sjogren, ELA, verrugas.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar trio porque tem dengue/sífilis/FA no meio de intrusos.', icon: 'AlertTriangle' },
        ],
        'Os três precisam estar na lista',
      ),
      logicFlow(
        [
          'Exigir que TODOS os nomes sejam de notificação compulsória.',
          'Eliminar trios com diabetes, herpes, clamídia, Hashimoto, Sjogren, ELA ou verrugas.',
          'Validar HTLV + intoxicação exógena + tuberculose.',
          'Marcar D.',
          'Em similares: um intruso clínico comum derruba o conjunto.',
        ],
        'HTLV + intoxicação + TB → D',
      ),
      goldenRule(
        'Filtro do trio',
        'Decore',
        [
          { label: 'OK', value: 'HTLV · intoxicação exógena · tuberculose.', badge: 'ok' },
          { label: 'Intruso', value: 'Diabetes · herpes · clamídia · autoimunes · ELA.', badge: 'warn' },
        ],
        'Um intruso = alternativa morta',
      ),
      dangerZone(
        'PEGADINHAS — só compulsórios',
        [
          {
            label: 'Letra A — verrugas/diabetes',
            detail: 'Verrugas genitais, diabetes tipo 1 e dengue.',
            correct: 'Verrugas e diabetes derrubam — dengue sozinha não salva o trio.',
          },
          {
            label: 'Letra B — herpes/clamídia',
            detail: 'Violência doméstica, herpes zoster, infecção por clamídia.',
            correct: 'Herpes e clamídia são intrusos nesta chave.',
          },
          {
            label: 'Letra C — Hashimoto/arterite',
            detail: 'Sífilis, Hashimoto, arterite de células gigantes.',
            correct: 'Doenças autoimunes/reumatológicas não fecham a lista.',
          },
          {
            label: 'Letra E — Sjogren/ELA',
            detail: 'Sjogren, febre amarela, esclerose lateral amiotrófica.',
            correct: 'Sjogren e ELA derrubam — FA sozinha não basta.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: candidíase no meio de TB e HTLV.',
            correct: 'Mesma lógica: procure o nome fora da lista nacional.',
          },
        ],
        'Intruso clínico no trio → distrator',
      ),
    ],
  },
  {
    file: 'fepese-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563858390-2.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Imediata: profissional/serviço do 1º atendimento em até 24h pelo meio mais rápido. Suspeita também notifica; não só médico; não divulgar dados pessoais.',
    sources: [{ ...LISTA, covers: ['notificação imediata', '24 horas', 'suspeita'] }],
    slides: [
      conceptMap(
        'Notificação imediata — regra certa',
        [
          { label: 'Quem', detail: 'Profissional de saúde ou responsável pelo serviço do primeiro atendimento.', icon: 'UserCheck' },
          { label: 'Quando', detail: 'Em até 24 horas do atendimento, pelo meio mais rápido disponível.', icon: 'Timer' },
          { label: 'Também suspeita', detail: 'Não espera só a confirmação para notificar.', icon: 'Bell' },
          { label: 'PEGADINHA-ÂNCORA', detail: '“Só médico notifica” ou “divulgar dados pessoais ao público”.', icon: 'AlertTriangle' },
        ],
        '1º atendimento → 24h → meio mais rápido',
      ),
      logicFlow(
        [
          'Comando: afirmação correta sobre notificação compulsória.',
          'Eliminar “só médico; outros opcional”.',
          'Eliminar “só após confirmação” e “30 dias para informar outras esferas”.',
          'Eliminar divulgação de dados pessoais em domínio público.',
          'Manter: imediata em até 24h pelo primeiro atendimento, meio mais rápido.',
          'Marcar E.',
          'Em similares: imediata = 24h; semanal = outro relógio.',
        ],
        'Imediata em 24 horas → E',
      ),
      goldenRule(
        'Checklist da imediata',
        'Decore',
        [
          { label: 'Prazo', value: 'Até 24 horas do primeiro atendimento.', badge: 'ok' },
          { label: 'Como', value: 'Meio mais rápido disponível.', badge: 'ok' },
          { label: 'Não', value: 'Só médico · só confirmado · vazar dados pessoais.', badge: 'warn' },
        ],
        '24h · suspeita · sigilo',
      ),
      dangerZone(
        'PEGADINHAS — regras da compulsória',
        [
          {
            label: 'Letra A — só médico',
            detail: 'Obrigatória só para médicos; outros opcional.',
            correct: 'Outros profissionais e serviços também têm obrigação de notificar.',
          },
          {
            label: 'Letra B — só confirmação',
            detail: 'Notificar apenas após confirmação; suspeita não.',
            correct: 'Suspeita também dispara a notificação compulsória.',
          },
          {
            label: 'Letra C — 30 dias',
            detail: 'Autoridade informa outras esferas em até 30 dias.',
            correct: 'Imediata exige fluxo rápido — 30 dias não é a regra correta desta chave.',
          },
          {
            label: 'Letra D — dados públicos',
            detail: 'Divulgar informações pessoais em domínio público.',
            correct: 'Dados pessoais da notificação não vão para alerta público identificável.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “imediata = 7 dias”.',
            correct: '7 dias é típico de semanal (ex.: dengue casos) — não imediata.',
          },
        ],
        'Restringir quem notifica ou esperar confirmação → distrator',
      ),
    ],
  },
  {
    file: 'fgv-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563642476-1.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Óbito com suspeita de doença pelo vírus Zika = notificação imediata. Hanseníase não é facultativa; dengue inclui suspeita; TB não é “24h” nesta chave.',
    sources: [{ ...LISTA, covers: ['Zika', 'óbito', 'notificação imediata', 'dengue', 'hanseníase'] }],
    slides: [
      conceptMap(
        'Compulsória — qual afirmativa correta?',
        [
          { label: 'Zika', detail: 'Óbito com suspeita de doença pelo vírus Zika → notificação imediata.', icon: 'Zap' },
          { label: 'Hanseníase', detail: 'É compulsória — não facultativa.', icon: 'ClipboardList' },
          { label: 'Dengue', detail: 'Suspeita também notifica — não só confirmados.', icon: 'Bell' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar TB em 24h por confundir com imediata genérica.', icon: 'AlertTriangle' },
        ],
        'Óbito suspeito de Zika = imediata',
      ),
      logicFlow(
        [
          'Eliminar hanseníase facultativa.',
          'Eliminar “só dengue confirmada”.',
          'Eliminar tuberculose “em até 24 horas” como afirmativa correta desta prova.',
          'Manter: óbito com suspeita de Zika = imediata.',
          'Marcar D.',
          'Em similares: óbito + agravo de alto risco → relógio imediato.',
        ],
        'Óbito suspeito Zika imediato → D',
      ),
      goldenRule(
        'Gabarito FGV',
        'Decore',
        [
          { label: 'Correto', value: 'Óbito suspeito de Zika → imediata.', badge: 'ok' },
          { label: 'Falsos', value: 'Hanseníase facultativa · só dengue confirmada · TB=24h.', badge: 'warn' },
        ],
        'Zika no óbito não espera',
      ),
      dangerZone(
        'PEGADINHAS — compulsória FGV',
        [
          {
            label: 'Letra A — hanseníase facultativa',
            detail: 'Hanseníase de notificação facultativa.',
            correct: 'Hanseníase é compulsória — não facultativa.',
          },
          {
            label: 'Letra B — só dengue confirmada',
            detail: 'Apenas casos confirmados de dengue.',
            correct: 'Suspeita de dengue também entra no fluxo de notificação.',
          },
          {
            label: 'Letra C — TB em 24h',
            detail: 'Tuberculose deve ser notificada em até 24 horas.',
            correct: 'Nesta chave a correta é o óbito suspeito de Zika imediato — não a TB.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “Zika em gestante = semanal”.',
            correct: 'Forma/agravo muda o relógio — leia o item exato da lista.',
          },
        ],
        'Afrouxar compulsória → distrator',
      ),
    ],
  },
  {
    file: 'fgv-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563774121-6.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Dengue (caso suspeito/confirmado): notificação compulsória em até 7 dias (semanal). Não é 24h/12h nesta chave.',
    exam_vs_current: 'Chave da prova: até 7 dias (letra B).',
    sources: [{ ...LISTA, covers: ['dengue', 'notificação semanal', '7 dias'] }],
    slides: [
      conceptMap(
        'Dengue — qual o prazo?',
        [
          { label: 'Agravo', detail: 'Caso suspeito ou confirmado de dengue.', icon: 'Thermometer' },
          { label: 'Prazo', detail: 'Notificação compulsória em até 7 dias.', icon: 'Calendar' },
          { label: 'Não é', detail: '5 dias, 10 dias, 12 horas ou 24 horas nesta chave.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar 24h porque “dengue é urgente”.', icon: 'AlertTriangle' },
        ],
        'Dengue → até 7 dias',
      ),
      logicFlow(
        [
          'Isolar o agravo: dengue (suspeito ou confirmado).',
          'Eliminar 5 dias, 10 dias, 12 horas e 24 horas.',
          'Manter: em até 7 dias.',
          'Marcar B.',
          'Em similares: dengue casos = semanal (7 dias); SRAG/coronavírus pode ser imediata.',
        ],
        'Prazo de 7 dias → letra B',
      ),
      goldenRule(
        'Relógio da dengue',
        'Decore',
        [
          { label: 'Dengue', value: 'Até 7 dias.', badge: 'ok' },
          { label: 'Armadilha', value: '24h / 12h por “urgência clínica”.', badge: 'warn' },
        ],
        'Clínica urgente ≠ relógio imediato',
      ),
      dangerZone(
        'PEGADINHAS — prazo dengue',
        [
          {
            label: 'Letra A — 5 dias',
            detail: 'Em até 5 dias.',
            correct: 'A chave desta prova é 7 dias — não 5.',
          },
          {
            label: 'Letra C — 10 dias',
            detail: 'Em até 10 dias.',
            correct: '10 dias ultrapassa o prazo semanal clássico cobrado aqui.',
          },
          {
            label: 'Letra D — 12 horas',
            detail: 'Em até 12 horas.',
            correct: '12h é linguagem de imediata — não o prazo da dengue nesta chave.',
          },
          {
            label: 'Letra E — 24 horas',
            detail: 'Em até 24 horas.',
            correct: '24h = imediata; dengue casos nesta prova = 7 dias.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: óbito por dengue ou forma grave.',
            correct: 'O relógio pode mudar com a forma — leia o item da lista.',
          },
        ],
        'Marcar 24h por hábito → distrator',
      ),
    ],
  },
  {
    file: 'fgv-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563789263-5.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Acidente por animal peçonhento (ex.: ferroada de escorpião marrom): notificação compulsória imediata em até 24 horas.',
    sources: [{ ...LISTA, covers: ['animal peçonhento', 'escorpião', 'notificação imediata'] }],
    slides: [
      conceptMap(
        'Escorpião marrom — prazo',
        [
          { label: 'Evento', detail: 'Acidente com ferroada de escorpião marrom (peçonhento).', icon: 'Bug' },
          { label: 'Prazo', detail: 'Notificação compulsória em até 24 horas.', icon: 'Timer' },
          { label: 'Não é', detail: 'Meio dia, prazo de dois dias, 7 dias ou quinzena nesta chave.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar 7 dias porque “parece semanal”.', icon: 'AlertTriangle' },
        ],
        'Peçonhento → 24 horas',
      ),
      logicFlow(
        [
          'Isolar: acidente peçonhento (escorpião marrom).',
          'Lembrar: agravo de notificação imediata.',
          'Eliminar meio dia, prazo de dois dias, 7 dias e quinzena.',
          'Manter: até 24 horas.',
          'Marcar B.',
          'Em similares: peçonhento = imediata (24h).',
        ],
        'Até 24 horas → letra B',
      ),
      goldenRule(
        'Relógio do peçonhento',
        'Decore',
        [
          { label: 'Escorpião/peçonhento', value: 'Até 24 horas.', badge: 'ok' },
          { label: 'Não marque', value: '7 dias (semanal) nem prazo de quinzena.', badge: 'warn' },
        ],
        'Peçonhento não espera a semana',
      ),
      dangerZone(
        'PEGADINHAS — prazo escorpião',
        [
          {
            label: 'Letra A — meio dia',
            detail: 'Prazo de meio dia após o atendimento.',
            correct: 'A chave clássica de imediata nesta prova é 24 horas — não meio dia.',
          },
          {
            label: 'Letra C — dois dias',
            detail: 'Prazo de dois dias após o atendimento.',
            correct: 'Dois dias atrasa o fluxo imediato cobrado.',
          },
          {
            label: 'Letra D — 7 dias',
            detail: 'Em até 7 dias.',
            correct: '7 dias é semanal — peçonhento é imediato.',
          },
          {
            label: 'Letra E — prazo longo',
            detail: 'Prazo de quinzena após o atendimento.',
            correct: 'Prazo longo demais — incompatível com notificação imediata.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: serpente × escorpião.',
            correct: 'Ambos peçonhentos costumam cair no bolso imediato — confirme a lista.',
          },
        ],
        'Colar prazo semanal no peçonhento → distrator',
      ),
    ],
  },
  {
    file: 'fgv-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563853014-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Sarampo (suspeito ou confirmado) = notificação compulsória imediata. Não é só médico/enfermeiro; não espera quinzena; suspeita notifica.',
    sources: [{ ...LISTA, covers: ['sarampo', 'notificação imediata'] }],
    slides: [
      conceptMap(
        'Sarampo — como notificar',
        [
          { label: 'Regra', detail: 'Casos suspeitos ou confirmados = notificação compulsória imediata.', icon: 'Zap' },
          { label: 'Quem', detail: 'Profissionais de saúde / serviços — não exclusividade médica ou só enfermeiro.', icon: 'Users' },
          { label: 'Suspeita', detail: 'Também notifica — não espera confirmação.', icon: 'Bell' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Marcar prazo de quinzena ou “só confirmado”.', icon: 'AlertTriangle' },
        ],
        'Sarampo suspeito = imediata',
      ),
      logicFlow(
        [
          'Comando: afirmativa correta sobre notificação de sarampo.',
          'Eliminar “só médico” e “só enfermeiro”.',
          'Eliminar prazo longo (quinzena) e “suspeita não notifica”.',
          'Manter: suspeito ou confirmado = compulsória imediata.',
          'Marcar A.',
          'Em similares: sarampo/exantemáticas de eliminação → imediata.',
        ],
        'Sarampo imediato → letra A',
      ),
      goldenRule(
        'Sarampo sem atraso',
        'Decore',
        [
          { label: 'Sarampo', value: 'Suspeito ou confirmado → imediata.', badge: 'ok' },
          { label: 'Não', value: 'Prazo de quinzena · só confirmado · só uma categoria profissional.', badge: 'warn' },
        ],
        'Suspeita já dispara',
      ),
      dangerZone(
        'PEGADINHAS — sarampo',
        [
          {
            label: 'Letra B — só médico',
            detail: 'Compete somente ao médico assistente.',
            correct: 'Outros profissionais/serviços também notificam.',
          },
          {
            label: 'Letra C — só enfermeiro',
            detail: 'Competência exclusiva do enfermeiro.',
            correct: 'Não há exclusividade do enfermeiro na compulsória.',
          },
          {
            label: 'Letra D — prazo longo',
            detail: 'Notificar só após prazo de quinzena do atendimento.',
            correct: 'Sarampo é imediato — prazo longo é atraso grave.',
          },
          {
            label: 'Letra E — suspeita fora',
            detail: 'Não cabe notificação diante de caso suspeito.',
            correct: 'Suspeita de sarampo deve ser notificada.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: rubéola/caxumba no mesmo bloco.',
            correct: 'Confirme o relógio de cada agravo na lista vigente.',
          },
        ],
        'Esperar confirmação ou prazo longo → distrator',
      ),
    ],
  },
  {
    file: 'funatec-enfermagem-epidemiologia-e-vigilancia-epidemiologica-1779563800137-0.json',
    family: 'conceito',
    pedagogical_branch: 'epi_notificacao_compulsoria',
    guideline_snapshot:
      'Apenas imediatas: Covid-19, botulismo, febre amarela, raiva humana. Intrusos: HAS, diabetes, angina, IAM; dengue/tétano podem quebrar o “apenas imediata”.',
    sources: [{ ...LISTA, covers: ['notificação imediata', 'botulismo', 'febre amarela', 'raiva'] }],
    slides: [
      conceptMap(
        'Apenas notificação imediata',
        [
          { label: 'Comando', detail: 'Alternativa com apenas doenças de notificação compulsória imediata.', icon: 'Zap' },
          { label: 'Trio/quarteto limpo', detail: 'Covid-19, botulismo, febre amarela, raiva humana.', icon: 'CheckCircle2' },
          { label: 'Intrusos', detail: 'HAS, diabetes, angina, IAM — e misturas com dengue/tétano nesta chave.', icon: 'XCircle' },
          { label: 'PEGADINHA-ÂNCORA', detail: 'Aceitar conjunto porque tem Covid + um clínico comum.', icon: 'AlertTriangle' },
        ],
        'Covid + botulismo + FA + raiva',
      ),
      logicFlow(
        [
          'Exigir que TODOS sejam de notificação imediata.',
          'Eliminar conjuntos com hipertensão, diabetes, angina ou infarto.',
          'Eliminar misturas que quebram o “apenas imediata” (ex.: dengue no pacote).',
          'Validar Covid-19 + botulismo + febre amarela + raiva humana.',
          'Marcar C.',
          'Em similares: um intruso crônico/cardiológico derruba o conjunto.',
        ],
        'Apenas imediatas → letra C',
      ),
      goldenRule(
        'Filtro “apenas imediata”',
        'Decore',
        [
          { label: 'OK', value: 'Covid-19 · botulismo · FA · raiva humana.', badge: 'ok' },
          { label: 'Quebra', value: 'HAS · diabetes · angina · IAM · dengue no pacote.', badge: 'warn' },
        ],
        'Zero intruso crônico no combo',
      ),
      dangerZone(
        'PEGADINHAS — só imediata',
        [
          {
            label: 'Letra A — HAS/diabetes',
            detail: 'Covid, HAS, diabetes e leptospirose.',
            correct: 'HAS e diabetes não são de notificação imediata neste sentido.',
          },
          {
            label: 'Letra B — diabetes/tétano',
            detail: 'Covid, rubéola, diabetes, tétano.',
            correct: 'Diabetes derruba o conjunto “apenas imediata”.',
          },
          {
            label: 'Letra D — angina/IAM',
            detail: 'Dengue, sarampo, angina, infarto.',
            correct: 'Angina/IAM são intrusos clínicos; o pacote não é só imediata limpa.',
          },
          {
            label: 'Transferência',
            detail: 'Em outra prova: “dengue casos” no meio de FA e raiva.',
            correct: 'Dengue casos costuma ser semanal — quebra o “apenas imediata”.',
          },
        ],
        'Intruso crônico/cardiológico → distrator',
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
    reviewer: 'cursor-grok-4.5-epi-g09',
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
