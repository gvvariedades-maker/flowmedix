'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  X, 
  FileX,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Wand2,
  Navigation
} from 'lucide-react';
import { ZodError } from 'zod';
import { generateSuggestions, type Suggestion } from '@/lib/errorSuggestions';
import type { ErrorLocation } from '@/lib/jsonErrorLocator';

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

interface ValidationErrorsPanelProps {
  errors: ValidationError[];
  onClose?: () => void;
  onErrorClick?: (error: ValidationError, location?: ErrorLocation) => void;
  onApplySuggestion?: (errorIndex: number, suggestion: Suggestion) => void;
  jsonData?: any; // Dados JSON para gerar sugestões contextuais
}

export function ValidationErrorsPanel({ 
  errors, 
  onClose,
  onErrorClick,
  onApplySuggestion,
  jsonData
}: ValidationErrorsPanelProps) {
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());
  const [selectedError, setSelectedError] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<Set<number>>(new Set());
  
  // Gera sugestões para todos os erros
  const suggestionsMap = new Map<number, Suggestion[]>();
  errors.forEach((error, index) => {
    const suggestions = generateSuggestions(error, jsonData);
    if (suggestions.length > 0) {
      suggestionsMap.set(index, suggestions);
    }
  });

  const toggleError = (index: number) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedErrors(newExpanded);
  };

  const handleErrorClick = (error: ValidationError, index: number, location?: ErrorLocation) => {
    setSelectedError(index);
    if (onErrorClick) {
      onErrorClick(error, location);
    }
  };

  const toggleSuggestions = (index: number) => {
    const newSet = new Set(showSuggestions);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setShowSuggestions(newSet);
  };

  // Agrupa erros por categoria
  const groupedErrors = errors.reduce((acc, error, index) => {
    const category = error.path[0] || 'root';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...error, index });
    return acc;
  }, {} as Record<string, Array<ValidationError & { index: number }>>);

  if (errors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border-2 border-green-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-bold text-green-900">Validação Bem-Sucedida</h3>
            <p className="text-sm text-green-700">O JSON está válido e pronto para publicação.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border-2 border-red-200 rounded-xl overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="bg-red-100 px-6 py-4 border-b border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-bold text-red-900">
              {errors.length} {errors.length === 1 ? 'Erro Encontrado' : 'Erros Encontrados'}
            </h3>
            <p className="text-xs text-red-700">Corrija os erros abaixo para continuar</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>

      {/* Lista de Erros */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-2">
          {Object.entries(groupedErrors).map(([category, categoryErrors]) => (
            <div key={category} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-2">
                <FileX className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                  {category}
                </span>
                <span className="text-xs text-red-500">
                  ({categoryErrors.length})
                </span>
              </div>
              
              {categoryErrors.map(({ index, path, message, code }) => {
                const isExpanded = expandedErrors.has(index);
                const isSelected = selectedError === index;
                const pathString = path.join(' → ');

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-lg transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-100 shadow-md'
                        : 'border-red-200 bg-white hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => {
                          toggleError(index);
                          handleErrorClick({ path, message, code }, index);
                        }}
                        className="flex-1 px-4 py-3 flex items-start gap-3 text-left"
                      >
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="text-sm font-semibold text-red-900 truncate">
                            {pathString || 'Erro no JSON'}
                          </span>
                        </div>
                        <p className="text-xs text-red-700 line-clamp-2">
                          {message}
                        </p>
                        {code && (
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded">
                            {code}
                          </span>
                        )}
                      </div>
                      
                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-red-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      </button>
                      
                      {/* Botão de Navegação */}
                      <button
                        onClick={() => {
                          handleErrorClick({ path, message, code }, index);
                        }}
                        className="shrink-0 p-2 hover:bg-red-200 rounded-lg transition-colors"
                        title="Navegar para o erro no JSON"
                      >
                        <Navigation className="w-4 h-4 text-red-600" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 pt-2 border-t border-red-200 bg-red-50/50">
                            <div className="space-y-2">
                              <div>
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                  Caminho Completo:
                                </span>
                                <code className="block mt-1 text-xs font-mono bg-white px-2 py-1 rounded border border-red-200 text-red-900">
                                  {path.length > 0 ? path.join('.') : 'root'}
                                </code>
                              </div>
                              
                              <div>
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                  Mensagem:
                                </span>
                                <p className="mt-1 text-xs text-red-800 bg-white px-2 py-1 rounded border border-red-200">
                                  {message}
                                </p>
                              </div>

                              {code && (
                                <div>
                                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                    Código de Erro:
                                  </span>
                                  <code className="block mt-1 text-xs font-mono bg-white px-2 py-1 rounded border border-red-200 text-red-900">
                                    {code}
                                  </code>
                                </div>
                              )}

                              {/* Sugestões de Correção */}
                              {suggestionsMap.has(index) && (
                                <div className="mt-3 pt-3 border-t border-red-200">
                                  <button
                                    onClick={() => toggleSuggestions(index)}
                                    className="w-full flex items-center justify-between text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Wand2 className="w-4 h-4 text-amber-600" />
                                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                                        Sugestões de Correção
                                      </span>
                                      <span className="text-[10px] text-amber-600">
                                        ({suggestionsMap.get(index)?.length || 0})
                                      </span>
                                    </div>
                                    {showSuggestions.has(index) ? (
                                      <ChevronUp className="w-4 h-4 text-amber-600" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-amber-600" />
                                    )}
                                  </button>

                                  <AnimatePresence>
                                    {showSuggestions.has(index) && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 space-y-2"
                                      >
                                        {suggestionsMap.get(index)?.map((suggestion, sugIndex) => (
                                          <div
                                            key={sugIndex}
                                            className={`p-3 rounded-lg border ${
                                              suggestion.type === 'fix'
                                                ? 'bg-amber-50 border-amber-200'
                                                : suggestion.type === 'hint'
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-slate-50 border-slate-200'
                                            }`}
                                          >
                                            <div className="flex items-start gap-2">
                                              <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${
                                                suggestion.type === 'fix'
                                                  ? 'text-amber-600'
                                                  : 'text-blue-600'
                                              }`} />
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className={`text-xs font-bold ${
                                                    suggestion.type === 'fix'
                                                      ? 'text-amber-900'
                                                      : 'text-blue-900'
                                                  }`}>
                                                    {suggestion.type === 'fix' ? 'Correção Sugerida' : 'Dica'}
                                                  </span>
                                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                    suggestion.confidence === 'high'
                                                      ? 'bg-green-100 text-green-700'
                                                      : suggestion.confidence === 'medium'
                                                      ? 'bg-yellow-100 text-yellow-700'
                                                      : 'bg-slate-100 text-slate-600'
                                                  }`}>
                                                    {suggestion.confidence === 'high' ? 'Alta' : suggestion.confidence === 'medium' ? 'Média' : 'Baixa'}
                                                  </span>
                                                </div>
                                                <p className={`text-xs ${
                                                  suggestion.type === 'fix'
                                                    ? 'text-amber-800'
                                                    : 'text-blue-800'
                                                }`}>
                                                  {suggestion.message}
                                                </p>
                                                {suggestion.fix && (
                                                  <div className="mt-2">
                                                    <code className="block text-xs font-mono bg-white px-2 py-1 rounded border border-amber-200 text-amber-900 mb-2">
                                                      {suggestion.fix}
                                                    </code>
                                                    {onApplySuggestion && (
                                                      <button
                                                        onClick={() => onApplySuggestion(index, suggestion)}
                                                        className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-1"
                                                      >
                                                        <Wand2 className="w-3 h-3" />
                                                        Aplicar Correção
                                                      </button>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer com ações */}
      <div className="bg-red-100 px-6 py-3 border-t border-red-200 flex items-center justify-between">
        <p className="text-xs text-red-700">
          💡 Dica: Clique em um erro para ver detalhes completos
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const allExpanded = new Set(errors.map((_, i) => i));
              setExpandedErrors(allExpanded);
            }}
            className="text-xs px-3 py-1.5 bg-white text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Expandir Todos
          </button>
          <button
            onClick={() => setExpandedErrors(new Set())}
            className="text-xs px-3 py-1.5 bg-white text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Recolher Todos
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Helper para formatar erros Zod em formato estruturado
 */
export function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    path: err.path.map(String),
    message: err.message,
    code: err.code,
  }));
}
