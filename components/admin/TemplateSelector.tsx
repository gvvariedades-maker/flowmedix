'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  ChevronDown, 
  Search,
  Sparkles,
  Calculator,
  Scale,
  BookOpen
} from 'lucide-react';
import { templates, type Template, createQuestionFromTemplate } from '@/lib/templates';
import type { QuestaoCompleta } from '@/types/lesson';

interface TemplateSelectorProps {
  onSelectTemplate: (question: QuestaoCompleta) => void;
  onClose?: () => void;
}

const categoryIcons = {
  enfermagem: BookOpen,
  legislacao: Scale,
  matematica: Calculator,
  geral: FileText,
};

const categoryColors = {
  enfermagem: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  legislacao: 'bg-amber-100 text-amber-700 border-amber-300',
  matematica: 'bg-blue-100 text-blue-700 border-blue-300',
  geral: 'bg-slate-100 text-slate-700 border-slate-300',
};

export function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.banca.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const handleSelectTemplate = (template: Template) => {
    const question = createQuestionFromTemplate(template.id);
    onSelectTemplate(question);
    if (onClose) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border-2 border-slate-200 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Selecionar Template</h2>
              <p className="text-sm text-indigo-100">Escolha um template para começar</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        {/* Busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Templates */}
      <div className="max-h-[500px] overflow-y-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nenhum template encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category];
              const colorClass = categoryColors[template.category];
              const isExpanded = expandedTemplate === template.id;

              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`border-2 rounded-lg overflow-hidden transition-all ${
                    isExpanded ? 'border-indigo-500 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <div className="p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {Icon && <Icon className="w-5 h-5 text-slate-600" />}
                          <h3 className="font-bold text-slate-900">{template.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${colorClass}`}>
                            {template.banca}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Categoria: {template.category}</span>
                          <span>
                            {template.template.reverse_study_slides.length} slides
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-slate-600 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleSelectTemplate(template)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                        >
                          Usar Template
                        </button>
                      </div>
                    </div>

                    {/* Preview expandido */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-slate-200"
                        >
                          <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">
                              Estrutura do Template:
                            </h4>
                            <div className="space-y-2 text-xs text-slate-600">
                              <div>
                                <strong>Meta:</strong> {template.template.meta.banca} - {template.template.meta.topico}
                              </div>
                              <div>
                                <strong>Slides:</strong>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {template.template.reverse_study_slides.map((slide, idx) => (
                                    <li key={idx}>{slide.type}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
