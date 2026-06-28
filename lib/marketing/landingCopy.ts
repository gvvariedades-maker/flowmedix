import {
  FREEMIUM_PLAN_LIMITS_COMPACT,
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
} from '@/lib/freemium/constants';

/** Preço mensal AVANT Pro (Stripe). */
export const LANDING_PRECO_PRO = '14,90';

export const LANDING_HERO = {
  badge: 'Feito por técnico aprovado em 10+ concursos dentro das vagas',
  h1Lines: [
    'A maioria do material',
    'foi feito para enfermeiro.',
    'O AVANT foi feito',
    'para você.',
  ] as const,
  h1AccentWord: 'você',
  subheadline:
    'Cada questão, slide e revisão pensados exclusivamente para o cargo de Técnico em Enfermagem. Estudo reverso com NeuroSlides — comece grátis, sem cartão.',
  ctaPrimary: 'Testar grátis agora',
  ctaSecondary: 'Ver como funciona',
  microcopySuffix: 'sem compromisso · sem cartão',
} as const;

export function landingHeroMicrocopy(): string {
  return `${FREEMIUM_PLAN_LIMITS_COMPACT} · ${LANDING_HERO.microcopySuffix}`;
}

export const LANDING_TRUST_CHIPS = [
  'Mais de 5.000 questões reais',
  'EBSERH e prefeituras',
  'Só para Técnico em Enfermagem',
  'NeuroSlides após cada questão',
  `${FREEMIUM_PLAN_LIMITS_COMPACT} · sem cartão`,
] as const;

export const LANDING_PROBLEMA = {
  label: 'O problema real',
  h2: 'Você estuda o material errado sem perceber.',
  cards: [
    {
      title: 'Material de nível superior',
      text: 'Você usa apostilas e plataformas feitas para enfermeiro. Linguagem mais profunda, profundidade além do que a sua banca cobra para o cargo técnico.',
    },
    {
      title: 'Acerta por chute',
      text: 'Você marca a resposta certa mas não consegue repetir o raciocínio na próxima questão do mesmo assunto. O conceito não está fixado.',
    },
    {
      title: 'Lê o gabarito e esquece',
      text: 'Você erra, olha a resposta, fecha o app. O conceito não foi processado. A banca cobra de novo — você erra de novo.',
    },
  ] as const,
} as const;

export const LANDING_COMPARATIVO = {
  label: 'Método antigo vs AVANT',
  h2: 'Por que a apostila não é suficiente',
  apostilaLabel: 'Apostila / PDF',
  avantLabel: 'AVANT',
  apostilaItems: [
    'Linguagem de nível superior — feita para enfermeiro',
    'Você lê tudo sem saber o que a banca cobra para o seu cargo',
    'Sem feedback real — só acerto ou erro',
    'Revisão manual — você decide (ou esquece) quando revisar',
    'Sem diagnóstico — não sabe por que errou',
  ] as const,
  avantItems: [
    'Questões no formato exato da banca para Técnico em Enfermagem',
    'Você estuda o que a sua banca cobra — filtrado por banca/ano/órgão',
    'Gabarito com diagnóstico: foi conceito, interpretação ou pegadinha?',
    'Revisão espaçada automática no momento certo — sem planilha',
    'NeuroSlide visual após cada questão — o conceito fixa',
  ] as const,
} as const;

export const LANDING_METODO = {
  label: 'Como funciona',
  h2: 'Simples como 1, 2, 3, 4',
  sub: 'Questão real, gabarito com diagnóstico, NeuroSlides e revisão no ritmo certo — tudo no mesmo fluxo.',
  ctaFooter: 'Começar agora — grátis',
} as const;

export const LANDING_DEMO = {
  label: 'Demo interativa',
  h2: 'Experimente uma questão real antes de criar conta',
  copy: 'O mesmo player do app: responda, veja o gabarito e percorra os NeuroSlides de estudo reverso. Sem cadastro.',
  chips: 'Questão real de concurso · Gabarito na hora · 4 NeuroSlides incluídos',
  cta: 'Criar conta grátis — continuar estudando',
} as const;

export const LANDING_NEUROSLIDES = {
  label: 'Estudo reverso',
  h2: '4 NeuroSlides depois de cada questão',
  sub: 'A diferença entre ler o gabarito e realmente aprender o conceito.',
  transition: 'Tudo isso já disponível no app →',
  cards: [
    {
      icon: 'network' as const,
      title: 'Mapa Mental',
      text: 'Conecta o que a banca misturou. Você vê a relação entre conceitos que pareciam separados.',
    },
    {
      icon: 'lightbulb' as const,
      title: 'Regra de Ouro',
      text: 'O que lembrar na prova. Uma frase que ancora o conceito certo e elimina a confusão.',
    },
    {
      icon: 'git-branch' as const,
      title: 'Fluxo Lógico',
      text: 'Sequência de decisão passo a passo. Para questões de protocolo, procedimento e prioridade clínica.',
    },
    {
      icon: 'shield-alert' as const,
      title: 'Zona de Perigo',
      text: 'As pegadinhas que derrubam. O que a banca troca, inverte e distorce para confundir.',
    },
  ] as const,
} as const;

export const LANDING_RECURSOS = {
  label: 'Recursos que viram resultado',
  h2: 'Tudo para sair do estudo aleatório',
  features: [
    {
      title: 'Vitrine de questões',
      text: 'Escolha assuntos e comece pelo formato da sua banca. Filtre por banca, ano, órgão e tipo de questão.',
    },
    {
      title: 'Estudo Reverso',
      text: 'Cada questão vira explicação guiada, diagnóstico de erro e revisão automática.',
    },
    {
      title: 'Meu desempenho',
      text: 'Acompanhe evolução e padrões de erro por assunto. Veja onde a banca te derruba.',
    },
    {
      title: 'Plano diário',
      text: 'Revise no ritmo certo — revisão espaçada automática, sem planilha manual.',
    },
  ] as const,
  proParagraph:
    'No plano Pro você também tem: cadernos personalizados, simulados ilimitados, analytics de progresso avançado, desempenho em simulados, missão semanal e biblioteca de NeuroSlides por assunto.',
} as const;

export const LANDING_AUTORIDADE = {
  text: 'Desenvolvido por um Técnico em Enfermagem aprovado em mais de 10 concursos dentro das vagas — um método que transforma erro em aprendizado real, não apenas gabarito.',
  sub: "Técnico para técnico. Não 'equipe de especialistas'.",
} as const;

export const LANDING_PRICING = {
  label: 'Planos',
  h2Prefix: 'Foque no que importa:',
  h2Accent: 'estudar.',
  sub: 'O resto fica por conta do AVANT.',
  proTitle: 'AVANT Pro inclui:',
  proBenefits: [
    'Questões ilimitadas todo dia',
    'Simulados ilimitados',
    'NeuroSlides após cada questão',
    'Plano diário automático',
    'Cadernos personalizados',
    'Analytics de desempenho completo',
    'EBSERH, prefeituras e todas as bancas',
    'Cancela quando quiser — sem fidelidade',
  ] as const,
  proCta: 'Assinar Pro',
  freeCta: 'Criar conta gratuita',
} as const;

export const LANDING_FAQ = {
  title: 'Dúvidas frequentes',
} as const;

export function landingFaqItems(): { q: string; a: string }[] {
  return [
    {
      q: 'Tem plano gratuito?',
      a: `Sim. ${FREEMIUM_PLAN_LIMITS_DESCRIPTION}, sem cartão de crédito. O Pro é R$ ${LANDING_PRECO_PRO}/mês, cancelável quando quiser.`,
    },
    {
      q: 'O que é Estudo Reverso?',
      a: 'É o método do AVANT: você responde a questão primeiro, depois vê o gabarito com diagnóstico do tipo de erro (conceito, interpretação ou pegadinha), depois percorre 4 NeuroSlides que fixam o conteúdo. Você aprende pelo erro, não pelo resumo.',
    },
    {
      q: 'Para qual concurso serve?',
      a: 'EBSERH, prefeituras, concursos estaduais e municipais. Você filtra por banca, ano e órgão. As questões são exclusivamente para o cargo de Técnico em Enfermagem.',
    },
    {
      q: 'Quantas questões tem?',
      a: 'Mais de 5.000 questões reais de concurso, para o cargo de Técnico em Enfermagem. Novas questões são adicionadas regularmente.',
    },
    {
      q: 'O que acontece depois do cadastro?',
      a: 'Você cai direto na vitrine de questões. Uma questão já mostra o método completo: gabarito, diagnóstico e 4 NeuroSlides. Sem tutorial longo.',
    },
  ];
}

export const LANDING_CTA_FINAL = {
  h2Prefix: 'Só deixamos testar porque',
  h2Accent: 'funciona de verdade.',
  subLines: [
    'Uma questão já mostra o método.',
    'Sem cartão, sem compromisso.',
  ] as const,
  proLine: (preco: string) => `Pro por R$ ${preco}/mês — cancelável a qualquer momento.`,
  ctaPrimary: 'Testar grátis agora',
  ctaSecondary: 'Ver planos',
} as const;

export const LANDING_FOOTER = {
  tagline: 'Estudo reverso para Técnico em Enfermagem',
  copyright: '© 2026 AVANT · Todos os direitos reservados',
} as const;

export const LANDING_HEADER = {
  ctaFree: 'Começar grátis',
  ctaPro: 'Assinar Pro',
} as const;
