/**
 * Utilitários para localizar erros no JSON
 */

export interface ErrorLocation {
  line: number;
  column: number;
  path: string[];
  snippet: string;
}

/**
 * Encontra a linha aproximada de um erro no JSON baseado no caminho
 */
export function findErrorLocation(
  jsonText: string,
  errorPath: string[]
): ErrorLocation | null {
  try {
    const lines = jsonText.split('\n');
    let currentLine = 0;
    let pathIndex = 0;
    let found = false;

    // Procura pela chave do caminho no JSON
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Procura pela chave atual do caminho
      if (pathIndex < errorPath.length) {
        const key = errorPath[pathIndex];
        const keyPattern = new RegExp(`["']?${key}["']?\\s*:`, 'i');
        
        if (keyPattern.test(line)) {
          currentLine = i + 1;
          pathIndex++;
          
          // Se encontrou o último elemento do caminho, retorna
          if (pathIndex >= errorPath.length) {
            found = true;
            break;
          }
        }
      }
    }

    if (!found && currentLine === 0) {
      // Fallback: procura pela primeira ocorrência de qualquer chave do caminho
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lastKey = errorPath[errorPath.length - 1];
        if (line.includes(`"${lastKey}"`) || line.includes(`'${lastKey}'`)) {
          currentLine = i + 1;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return null;
    }

    // Extrai snippet da linha
    const snippet = lines[currentLine - 1]?.trim() || '';
    const column = snippet.indexOf(':') + 1 || 1;

    return {
      line: currentLine,
      column,
      path: errorPath,
      snippet: snippet.substring(0, 100), // Limita tamanho do snippet
    };
  } catch (err) {
    return null;
  }
}

/**
 * Encontra todas as localizações de erros no JSON
 */
export function findAllErrorLocations(
  jsonText: string,
  errors: Array<{ path: string[] }>
): Map<number, ErrorLocation> {
  const locations = new Map<number, ErrorLocation>();
  
  errors.forEach((error, index) => {
    const location = findErrorLocation(jsonText, error.path);
    if (location) {
      locations.set(index, location);
    }
  });

  return locations;
}

/**
 * Calcula offset de linha para scroll
 */
export function getLineOffset(lineNumber: number, lineHeight: number = 20): number {
  return (lineNumber - 1) * lineHeight;
}
