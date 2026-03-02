/**
 * Sistema de Export/Import de Questões
 */

import type { QuestaoCompleta } from '@/types/lesson';

/**
 * Exporta questão para JSON
 */
export function exportQuestion(question: QuestaoCompleta, filename?: string): void {
  const json = JSON.stringify(question, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `questao-${question.meta.banca}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta múltiplas questões para JSON
 */
export function exportQuestions(questions: QuestaoCompleta[], filename?: string): void {
  const json = JSON.stringify(questions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `questoes-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Importa questão de arquivo JSON
 */
export async function importQuestion(file: File): Promise<QuestaoCompleta> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const question = JSON.parse(content) as QuestaoCompleta;
        resolve(question);
      } catch (error) {
        reject(new Error('Erro ao parsear JSON: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Valida arquivo antes de importar
 */
export function validateImportFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.endsWith('.json')) {
    return { valid: false, error: 'Arquivo deve ser JSON (.json)' };
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    return { valid: false, error: 'Arquivo muito grande (máximo 5MB)' };
  }
  
  return { valid: true };
}

/**
 * Gera nome de arquivo sugerido baseado na questão
 */
export function generateFilename(question: QuestaoCompleta): string {
  const banca = question.meta.banca.toLowerCase().replace(/\s+/g, '-');
  const topico = question.meta.topico.toLowerCase().replace(/\s+/g, '-');
  const ano = question.meta.ano;
  return `questao-${banca}-${topico}-${ano}.json`;
}
