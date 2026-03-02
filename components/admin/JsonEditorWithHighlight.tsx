'use client';

import { useEffect, useRef, useState } from 'react';
import { findErrorLocation, type ErrorLocation } from '@/lib/jsonErrorLocator';

interface JsonEditorWithHighlightProps {
  value: string;
  onChange: (value: string) => void;
  errorLines?: Set<number>;
  selectedLine?: number | null;
  onLineClick?: (line: number) => void;
  placeholder?: string;
  className?: string;
}

export function JsonEditorWithHighlight({
  value,
  onChange,
  errorLines = new Set(),
  selectedLine = null,
  onLineClick,
  placeholder,
  className = '',
}: JsonEditorWithHighlightProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(20);

  // Sincroniza scroll entre textarea e números de linha
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    
    if (!textarea || !lineNumbers) return;

    const handleScroll = () => {
      lineNumbers.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, []);

  // Calcula altura da linha
  useEffect(() => {
    if (textareaRef.current) {
      const style = window.getComputedStyle(textareaRef.current);
      const height = parseFloat(style.lineHeight) || 20;
      setLineHeight(height);
    }
  }, []);

  const lines = value.split('\n');
  const lineCount = lines.length;

  // Scroll para linha específica
  const scrollToLine = (lineNumber: number) => {
    if (textareaRef.current) {
      const line = Math.max(1, Math.min(lineNumber, lineCount));
      const offset = (line - 1) * lineHeight;
      textareaRef.current.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
      
      // Destaca a linha temporariamente
      if (onLineClick) {
        onLineClick(line);
      }
    }
  };

  // Scroll automático quando selectedLine muda
  useEffect(() => {
    if (selectedLine !== null && selectedLine > 0) {
      const line = Math.max(1, Math.min(selectedLine, lineCount));
      const offset = (line - 1) * lineHeight;
      if (textareaRef.current) {
        textareaRef.current.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedLine, lineCount, lineHeight]);

  return (
    <div className={`relative flex ${className}`}>
      {/* Números de linha */}
      <div
        ref={lineNumbersRef}
        className="shrink-0 w-12 bg-slate-100 border-r border-slate-200 overflow-hidden text-right pr-3 py-6 font-mono text-xs text-slate-400 select-none"
        style={{ lineHeight: `${lineHeight}px` }}
      >
        {lines.map((_, index) => {
          const lineNum = index + 1;
          const hasError = errorLines.has(lineNum);
          const isSelected = selectedLine === lineNum;
          
          return (
            <div
              key={index}
              className={`${
                isSelected
                  ? 'bg-indigo-100 text-indigo-700 font-bold'
                  : hasError
                  ? 'bg-red-100 text-red-600 font-bold'
                  : 'text-slate-400'
              } cursor-pointer hover:bg-slate-200 transition-colors`}
              onClick={() => scrollToLine(lineNum)}
              style={{ height: `${lineHeight}px` }}
            >
              {lineNum}
            </div>
          );
        })}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 font-mono text-xs resize-none outline-none bg-transparent"
        spellCheck={false}
        style={{
          lineHeight: `${lineHeight}px`,
          padding: '24px',
        }}
      />

      {/* Overlay para highlight de linhas com erro e linha selecionada */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '48px',
          top: '24px',
          right: 0,
          bottom: '24px',
        }}
      >
        {/* Highlight de linha selecionada */}
        {selectedLine && (
          <div
            className="absolute bg-indigo-100/50 border-l-4 border-indigo-500 animate-pulse"
            style={{
              top: `${(selectedLine - 1) * lineHeight}px`,
              height: `${lineHeight}px`,
              width: '100%',
            }}
          />
        )}
        
        {/* Highlight de linhas com erro */}
        {Array.from(errorLines)
          .filter((lineNum) => lineNum !== selectedLine)
          .map((lineNum) => (
            <div
              key={lineNum}
              className="absolute bg-red-100/30 border-l-4 border-red-500"
              style={{
                top: `${(lineNum - 1) * lineHeight}px`,
                height: `${lineHeight}px`,
                width: '100%',
              }}
            />
          ))}
      </div>
    </div>
  );
}
