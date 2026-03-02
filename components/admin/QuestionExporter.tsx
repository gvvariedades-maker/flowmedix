'use client';

import { useRef } from 'react';
import { Download, Upload, FileJson } from 'lucide-react';
import { exportQuestion, importQuestion, validateImportFile, generateFilename } from '@/lib/questionExporter';
import type { QuestaoCompleta } from '@/types/lesson';

interface QuestionExporterProps {
  question: QuestaoCompleta | null;
  onImport: (question: QuestaoCompleta) => void;
}

export function QuestionExporter({ question, onImport }: QuestionExporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!question) {
      alert('Nenhuma questão para exportar');
      return;
    }
    
    const filename = generateFilename(question);
    exportQuestion(question, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImportFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const importedQuestion = await importQuestion(file);
      onImport(importedQuestion);
    } catch (error) {
      alert('Erro ao importar questão: ' + (error as Error).message);
    }

    // Limpa o input para permitir importar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={handleImportClick}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium text-slate-700"
        title="Importar questão de arquivo JSON"
      >
        <Upload className="w-4 h-4" />
        Importar
      </button>

      <button
        onClick={handleExport}
        disabled={!question}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
          question
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
        title="Exportar questão para arquivo JSON"
      >
        <Download className="w-4 h-4" />
        Exportar
      </button>
    </div>
  );
}
