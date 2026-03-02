/**
 * Sistema de Templates e Geradores de Questões
 * 
 * Templates pré-configurados para facilitar criação de questões
 */

import type { QuestaoCompleta } from '@/types/lesson';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'enfermagem' | 'legislacao' | 'matematica' | 'geral';
  banca: string;
  template: QuestaoCompleta;
}

/**
 * Template básico para questões de Fundamentos de Enfermagem
 */
export const templateEnfermagemBasico: QuestaoCompleta = {
  meta: {
    banca: 'EBSERH',
    ano: '2024',
    orgao: 'Hospital Universitário',
    prova: 'Técnico de Enfermagem',
    topico: 'Fundamentos de Enfermagem',
    subtopico: 'Sistematização da Assistência de Enfermagem (SAE)',
  },
  question_data: {
    instruction: 'Analise o caso e identifique a etapa correta da Sistematização da Assistência de Enfermagem.',
    text_fragment: '',
    options: [
      { id: 'A', text: 'Coleta de dados (Histórico de Enfermagem).', is_correct: false },
      { id: 'B', text: 'Diagnóstico de Enfermagem.', is_correct: false },
      { id: 'C', text: 'Planejamento da assistência.', is_correct: true },
      { id: 'D', text: 'Implementação das intervenções.', is_correct: false },
      { id: 'E', text: 'Avaliação dos resultados.', is_correct: false },
    ],
  },
  reverse_study_slides: [
    {
      type: 'concept_map',
      subject: 'Fundamentos de Enfermagem',
      meta: {
        topico: 'SAE',
        subtopico: 'Etapas do Processo de Enfermagem',
      },
      items: [
        {
          icon: 'FileSearch',
          label: 'Coleta de Dados',
          detail: 'Histórico e exame físico do paciente',
        },
        {
          icon: 'Stethoscope',
          label: 'Diagnóstico',
          detail: 'Identificação das necessidades humanas',
        },
        {
          icon: 'Target',
          label: 'Planejamento',
          detail: 'Definição de objetivos e intervenções',
        },
      ],
    },
    {
      type: 'logic_flow',
      subject: 'Fundamentos de Enfermagem',
      steps: [
        'Identifique a etapa descrita no enunciado',
        'Relacione com as fases da SAE',
        'Verifique a sequência lógica do processo',
        'Assinale a alternativa correta',
      ],
    },
    {
      type: 'golden_rule',
      subject: 'Fundamentos de Enfermagem',
      content: 'A SAE segue as 5 etapas: Coleta de dados, Diagnóstico, Planejamento, Implementação e Avaliação. Respeite a ordem do processo.',
    },
    {
      type: 'danger_zone',
      subject: 'Fundamentos de Enfermagem',
      content: 'Cuidado para não confundir Diagnóstico de Enfermagem com Diagnóstico Médico. O DE usa linguagem padronizada (NANDA).',
      items: [
        { label: 'Diagnóstico Enfermagem', detail: 'Necessidades humanas (NANDA)' },
        { label: 'Diagnóstico Médico', detail: 'Doença/patologia' },
        { label: 'Problema colaborativo', detail: 'Monitoramento conjunto' },
      ],
      footer_rule: 'Sempre utilize a taxonomia NANDA para diagnósticos de enfermagem.',
    },
  ],
};

/**
 * Template para questões de Legislação em Enfermagem (COFEN/COREN)
 */
export const templateLegislacaoEnfermagem: QuestaoCompleta = {
  meta: {
    banca: 'EBSERH',
    ano: '2024',
    orgao: 'Hospital',
    prova: 'Técnico de Enfermagem',
    topico: 'Legislação em Enfermagem',
    subtopico: 'COFEN/COREN',
  },
  question_data: {
    instruction: 'Assinale a alternativa correta sobre atribuições do Técnico de Enfermagem conforme a Lei 7.498/86.',
    text_fragment: '',
    options: [
      { id: 'A', text: 'Prescrever medicamentos.', is_correct: false },
      { id: 'B', text: 'Executar atividades de nível médio delegadas pelo enfermeiro.', is_correct: true },
      { id: 'C', text: 'Elaborar diagnósticos de enfermagem.', is_correct: false },
      { id: 'D', text: 'Coordenar a equipe de enfermagem.', is_correct: false },
      { id: 'E', text: 'Realizar consulta de enfermagem.', is_correct: false },
    ],
  },
  reverse_study_slides: [
    {
      type: 'concept_map',
      subject: 'Legislação em Enfermagem',
      items: [
        { icon: 'Scale', label: 'Lei 7.498/86', detail: 'Regulamentação do exercício da enfermagem' },
        { icon: 'Shield', label: 'COFEN', detail: 'Conselho Federal de Enfermagem' },
        { icon: 'MapPin', label: 'COREN', detail: 'Conselho Regional de Enfermagem' },
      ],
    },
    {
      type: 'golden_rule',
      subject: 'Legislação em Enfermagem',
      content: 'O Técnico de Enfermagem executa atividades de nível médio, delegadas pelo enfermeiro. O enfermeiro planeja e supervisiona.',
    },
  ],
};

/**
 * Template para questões de Matemática (conteúdo comum em concursos)
 */
export const templateMatematicaBasico: QuestaoCompleta = {
  meta: {
    banca: 'EBSERH',
    ano: '2024',
    orgao: 'Hospital',
    prova: 'Técnico de Enfermagem',
    topico: 'Matemática',
    subtopico: 'Cálculos e Dosagens',
  },
  question_data: {
    instruction: 'Resolva a equação e assinale a alternativa correta.',
    text_fragment: '',
    options: [
      { id: 'A', text: 'x = 5', is_correct: false },
      { id: 'B', text: 'x = 10', is_correct: true },
      { id: 'C', text: 'x = 15', is_correct: false },
      { id: 'D', text: 'x = 20', is_correct: false },
      { id: 'E', text: 'x = 25', is_correct: false },
    ],
  },
  reverse_study_slides: [
    {
      type: 'logic_flow',
      subject: 'Matemática',
      steps: [
        'Identifique os termos da equação',
        'Isole a variável',
        'Aplique as operações inversas',
        'Verifique a solução',
      ],
    },
    {
      type: 'golden_rule',
      subject: 'Matemática',
      content: 'Em equações, sempre aplique a mesma operação em ambos os lados para manter a igualdade.',
    },
  ],
};

/**
 * Biblioteca de templates (foco exclusivo em Técnico de Enfermagem)
 */
export const templates: Template[] = [
  {
    id: 'enfermagem-basico',
    name: 'Fundamentos de Enfermagem',
    description: 'Template para questões de Fundamentos de Enfermagem com slides completos (SAE, procedimentos)',
    category: 'enfermagem',
    banca: 'EBSERH',
    template: templateEnfermagemBasico,
  },
  {
    id: 'legislacao-enfermagem',
    name: 'Legislação em Enfermagem',
    description: 'Template para questões de COFEN/COREN e Lei 7.498/86',
    category: 'legislacao',
    banca: 'EBSERH',
    template: templateLegislacaoEnfermagem,
  },
  {
    id: 'matematica-basico',
    name: 'Matemática - Básico',
    description: 'Template para questões de Matemática (conteúdo comum em concursos)',
    category: 'matematica',
    banca: 'EBSERH',
    template: templateMatematicaBasico,
  },
];

/**
 * Obter template por ID
 */
export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

/**
 * Obter templates por categoria
 */
export function getTemplatesByCategory(category: Template['category']): Template[] {
  return templates.filter((t) => t.category === category);
}

/**
 * Obter templates por banca
 */
export function getTemplatesByBanca(banca: string): Template[] {
  return templates.filter((t) => t.banca === banca);
}

/**
 * Criar questão a partir de template
 */
export function createQuestionFromTemplate(
  templateId: string,
  overrides: Partial<QuestaoCompleta> = {}
): QuestaoCompleta {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template não encontrado: ${templateId}`);
  }

  // Deep merge do template com overrides
  return {
    ...template.template,
    ...overrides,
    meta: {
      ...template.template.meta,
      ...overrides.meta,
    },
    question_data: {
      ...template.template.question_data,
      ...overrides.question_data,
    },
    reverse_study_slides: overrides.reverse_study_slides || template.template.reverse_study_slides,
  };
}

/**
 * Validar e limpar template
 */
export function cleanTemplate(template: Partial<QuestaoCompleta>): QuestaoCompleta {
  // Remove campos vazios e garante estrutura mínima
  const cleaned: QuestaoCompleta = {
    meta: {
      banca: template.meta?.banca || 'EBSERH',
      ano: template.meta?.ano || new Date().getFullYear().toString(),
      orgao: template.meta?.orgao || 'Hospital',
      prova: template.meta?.prova || 'Técnico de Enfermagem',
      topico: template.meta?.topico || 'Fundamentos de Enfermagem',
      subtopico: template.meta?.subtopico || template.meta?.topico || 'SAE',
    },
    question_data: {
      instruction: template.question_data?.instruction || '',
      text_fragment: template.question_data?.text_fragment || '',
      options: template.question_data?.options || [],
    },
    reverse_study_slides: template.reverse_study_slides || [],
  };

  return cleaned;
}
