/**
 * Sistema de Correção Automática de Erros
 */

import type { Suggestion } from '@/lib/errorSuggestions';

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

/**
 * Aplica uma sugestão de correção ao JSON
 */
export function applySuggestion(
  jsonText: string,
  error: ValidationError,
  suggestion: Suggestion
): string {
  try {
    const parsed = JSON.parse(jsonText);
    const path = error.path;
    
    // Navega até o objeto que precisa ser corrigido
    let current: any = parsed;
    for (let i = 0; i < path.length - 1; i++) {
      if (current && typeof current === 'object') {
        current = current[path[i]];
      } else {
        return jsonText; // Não conseguiu navegar até o objeto
      }
    }
    
    const lastKey = path[path.length - 1];
    
    // Aplica correções baseadas no tipo de sugestão e código de erro
    if (suggestion.type === 'fix') {
      switch (error.code) {
        case 'required':
          // Adiciona campo faltante com valor padrão
          if (path.includes('banca')) {
            current[lastKey] = 'EBSERH'; // Valor padrão
          } else if (path.includes('topico')) {
            current[lastKey] = 'Fundamentos de Enfermagem'; // Valor padrão
          } else if (path.includes('instruction')) {
            current[lastKey] = ''; // String vazia
          } else if (path.includes('content')) {
            current[lastKey] = ''; // String vazia
          } else if (path.includes('steps')) {
            current[lastKey] = []; // Array vazio
          } else if (path.includes('items')) {
            current[lastKey] = []; // Array vazio
          }
          break;
          
        case 'too_small':
          // Adiciona valores mínimos
          if (path.includes('options') && Array.isArray(current[lastKey])) {
            if (current[lastKey].length === 0) {
              current[lastKey].push({
                id: 'A',
                text: 'Opção A',
                is_correct: false,
              });
            }
          } else if (path.includes('steps') && Array.isArray(current[lastKey])) {
            if (current[lastKey].length === 0) {
              current[lastKey].push('Passo 1');
            }
          } else if (path.includes('items') && Array.isArray(current[lastKey])) {
            if (current[lastKey].length === 0) {
              current[lastKey].push({
                label: 'Item 1',
                detail: 'Descrição',
              });
            }
          }
          break;
          
        case 'invalid_type':
          // Converte tipo
          if (error.message.includes('string')) {
            current[lastKey] = String(current[lastKey] || '');
          } else if (error.message.includes('array')) {
            current[lastKey] = Array.isArray(current[lastKey]) ? current[lastKey] : [];
          } else if (error.message.includes('object')) {
            current[lastKey] = typeof current[lastKey] === 'object' ? current[lastKey] : {};
          }
          break;
      }
    }
    
    // Retorna JSON formatado
    return JSON.stringify(parsed, null, 2);
  } catch (err) {
    // Se falhar, retorna o texto original
    return jsonText;
  }
}

/**
 * Aplica múltiplas sugestões de uma vez
 */
export function applyMultipleSuggestions(
  jsonText: string,
  errors: ValidationError[],
  suggestions: Map<number, Suggestion[]>
): string {
  let result = jsonText;
  
  // Aplica sugestões em ordem reversa para não afetar índices
  const sortedIndices = Array.from(suggestions.keys()).sort((a, b) => b - a);
  
  for (const index of sortedIndices) {
    const error = errors[index];
    const errorSuggestions = suggestions.get(index);
    
    if (error && errorSuggestions && errorSuggestions.length > 0) {
      // Pega a primeira sugestão de alta confiança
      const highConfidenceSuggestion = errorSuggestions.find(
        (s) => s.confidence === 'high' && s.type === 'fix'
      );
      
      if (highConfidenceSuggestion) {
        result = applySuggestion(result, error, highConfidenceSuggestion);
      }
    }
  }
  
  return result;
}
