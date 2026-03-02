/**
 * Sistema de Sugestões de Correção Automática
 */

export interface Suggestion {
  type: 'fix' | 'hint' | 'warning';
  message: string;
  fix?: string; // Código sugerido para substituir
  confidence: 'high' | 'medium' | 'low';
}

interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

/**
 * Gera sugestões de correção baseadas no erro
 */
export function generateSuggestions(error: ValidationError, jsonData?: any): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const path = error.path.join('.');
  const lastKey = error.path[error.path.length - 1];

  // Sugestões baseadas no código de erro
  switch (error.code) {
    case 'invalid_type':
      if (error.message.includes('string')) {
        suggestions.push({
          type: 'fix',
          message: `O campo "${lastKey}" deve ser uma string. Adicione aspas ao redor do valor.`,
          confidence: 'high',
        });
      } else if (error.message.includes('array')) {
        suggestions.push({
          type: 'fix',
          message: `O campo "${lastKey}" deve ser um array. Use colchetes [].`,
          confidence: 'high',
        });
      } else if (error.message.includes('object')) {
        suggestions.push({
          type: 'fix',
          message: `O campo "${lastKey}" deve ser um objeto. Use chaves {}.`,
          confidence: 'high',
        });
      }
      break;

    case 'too_small':
      if (path.includes('options') && error.message.includes('alternativa')) {
        suggestions.push({
          type: 'fix',
          message: 'Adicione pelo menos uma alternativa no array "options".',
          confidence: 'high',
        });
      } else if (path.includes('steps') && error.message.includes('passo')) {
        suggestions.push({
          type: 'fix',
          message: 'Adicione pelo menos um passo no array "steps".',
          confidence: 'high',
        });
      } else if (path.includes('items') && error.message.includes('item')) {
        suggestions.push({
          type: 'fix',
          message: 'Adicione pelo menos um item no array "items".',
          confidence: 'high',
        });
      } else if (error.message.includes('caracteres')) {
        const match = error.message.match(/(\d+)/);
        if (match) {
          suggestions.push({
            type: 'hint',
            message: `O campo deve ter no mínimo ${match[1]} caracteres.`,
            confidence: 'medium',
          });
        }
      }
      break;

    case 'too_big':
      if (error.message.includes('caracteres')) {
        const match = error.message.match(/(\d+)/);
        if (match) {
          suggestions.push({
            type: 'hint',
            message: `Reduza o tamanho do campo para no máximo ${match[1]} caracteres.`,
            confidence: 'medium',
          });
        }
      }
      break;

    case 'invalid_string':
      if (error.message.includes('ícone')) {
        suggestions.push({
          type: 'hint',
          message: 'Use um ícone válido do Lucide React. Exemplos: Sparkles, Bolt, Shield, AlertCircle.',
          confidence: 'high',
        });
      }
      break;

    case 'required':
      if (path.includes('meta.banca')) {
        suggestions.push({
          type: 'fix',
          message: 'Adicione o campo "banca" em "meta". Exemplo: "banca": "EBSERH"',
          confidence: 'high',
        });
      } else if (path.includes('meta.topico')) {
        suggestions.push({
          type: 'fix',
          message: 'Adicione o campo "topico" em "meta". Exemplo: "topico": "Fundamentos de Enfermagem"',
          confidence: 'high',
        });
      } else if (path.includes('instruction')) {
        suggestions.push({
          type: 'fix',
          message: 'Adicione o campo "instruction" em "question_data".',
          confidence: 'high',
        });
      } else if (path.includes('content')) {
        suggestions.push({
          type: 'fix',
          message: `Adicione o campo "content" no slide. Este campo é obrigatório para slides do tipo "${jsonData?.type || 'golden_rule'}".`,
          confidence: 'high',
        });
      } else if (path.includes('steps')) {
        suggestions.push({
          type: 'fix',
          message: 'Adicione o campo "steps" como um array de strings. Exemplo: "steps": ["Passo 1", "Passo 2"]',
          confidence: 'high',
        });
      }
      break;

    case 'custom':
      // Erros customizados específicos
      if (error.message.includes('type') || error.message.includes('layout_type')) {
        suggestions.push({
          type: 'fix',
          message: 'Adicione o campo "type" ao slide. Valores válidos: concept_map, logic_flow, golden_rule, danger_zone, syllable_scanner, versus_arena',
          confidence: 'high',
        });
      }
      break;
  }

  // Sugestões baseadas no caminho do erro
  if (path.includes('reverse_study_slides') && path.includes('type')) {
    suggestions.push({
      type: 'hint',
      message: 'Certifique-se de que o slide tem um campo "type" válido.',
      confidence: 'medium',
    });
  }

  if (path.includes('reverse_study_slides') && path.includes('items') && path.includes('concept_map')) {
    suggestions.push({
      type: 'hint',
      message: 'Para concept_map, você pode usar "items" ou "concepts". Certifique-se de que pelo menos um deles está presente.',
      confidence: 'medium',
    });
  }

  // Sugestões genéricas se não houver sugestões específicas
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'hint',
      message: `Verifique se o campo "${lastKey}" está presente e tem o formato correto.`,
      confidence: 'low',
    });
  }

  return suggestions;
}

/**
 * Gera sugestões para múltiplos erros
 */
export function generateAllSuggestions(
  errors: ValidationError[],
  jsonData?: any
): Map<number, Suggestion[]> {
  const allSuggestions = new Map<number, Suggestion[]>();

  errors.forEach((error, index) => {
    // Tenta encontrar o objeto relacionado ao erro no JSON
    let relatedData: any = jsonData;
    for (const key of error.path) {
      if (relatedData && typeof relatedData === 'object') {
        relatedData = relatedData[key];
      } else {
        break;
      }
    }

    const suggestions = generateSuggestions(error, relatedData || jsonData);
    if (suggestions.length > 0) {
      allSuggestions.set(index, suggestions);
    }
  });

  return allSuggestions;
}
