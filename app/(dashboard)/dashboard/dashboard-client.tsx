'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

type VerticalModuleSummary = {
  id: string | null;
  title: string;
  completed: boolean;
};

type VerticalTopic = {
  id: string;
  topicName: string;
  modules: VerticalModuleSummary[];
};

export type VerticalExamData = {
  id: string;
  name: string;
  organ: string | null;
  board: string | null;
  raw_content: string | null;
  completionRate: number;
  topics: VerticalTopic[];
};

interface DashboardClientProps {
  userEmail: string;
  verticalExams: VerticalExamData[];
}

export default function DashboardClient({ userEmail, verticalExams }: DashboardClientProps) {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(verticalExams[0]?.id ?? null);

  useEffect(() => {
    if (!selectedExamId && verticalExams.length > 0) {
      setSelectedExamId(verticalExams[0].id);
    }
  }, [verticalExams, selectedExamId]);

  const selectedExam = useMemo(
    () => verticalExams.find((exam) => exam.id === selectedExamId) ?? null,
    [selectedExamId, verticalExams]
  );

  if (!verticalExams.length) {
    return (
      <div className="glass-panel p-8 border border-white/10 text-center space-y-4 bg-slate-900/70 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
        <p className="text-lg font-semibold text-white">Nenhum edital ativo.</p>
        <p className="text-sm text-slate-400">
          Inicie sua preparação agora e conecte-se aos editais verticalizados.
        </p>
        <Link
          href="/modulos"
          className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-clinical-accent text-clinical-dark font-bold transition-all hover:shadow-neon-cyan"
        >
          Explorar módulos disponíveis
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative z-10">
      <div className="glass-panel p-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Dashboard Verticalizado</p>
        <h2 className="text-3xl font-black text-white mt-3">Olá, {userEmail}</h2>
        <p className="text-sm text-clinical-muted">
          Escolha um edital ativo e visualize os tópicos com o checklist técnico atualizado.
        </p>
        {selectedExam && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.5em] text-slate-400">
              <span>Progresso médio</span>
              <span className="text-white font-bold">{selectedExam.completionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-clinical-accent to-emerald-400 transition-all duration-500"
                style={{ width: `${selectedExam.completionRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {verticalExams.map((exam) => (
          <button
            key={exam.id}
            onClick={() => setSelectedExamId(exam.id)}
            className={`glass-panel flex-1 min-w-[220px] border transition-all duration-300 px-5 py-4 text-left ${
              selectedExamId === exam.id
                ? 'border-clinical-accent shadow-[0_0_20px_rgba(0,242,255,0.35)] text-white'
                : 'border-white/5 text-slate-300 hover:border-clinical-accent/60'
            }`}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Edital</p>
            <p className="text-lg font-semibold text-white">{exam.name}</p>
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-clinical-muted">
              {exam.board ?? 'Quadro clínico'}
            </p>
            {exam.organ && <p className="text-sm text-clinical-muted mt-2">{exam.organ}</p>}
          </button>
        ))}
      </div>

      {selectedExam && (
        <div className="space-y-6">
          {selectedExam.topics.length ? (
            selectedExam.topics.map((topic, index) => (
              <div
                key={topic.id}
                className="glass-panel p-6 border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.45)] bg-slate-950/80"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.5em] text-slate-400">
                  <span>Matéria {String(index + 1).padStart(2, '0')}</span>
                  <span className="text-slate-400 text-[0.7rem]">
                    {topic.modules.filter((module) => module.completed).length}/{topic.modules.length}{' '}
                    completos
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-3">{topic.topicName}</h3>
                <div className="mt-4 space-y-3">
                  {topic.modules.map((module) => (
                    <div
                      key={`${topic.id}-${module.id ?? module.title}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full transition-colors ${
                            module.completed ? 'bg-clinical-accent' : 'bg-white/30'
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold transition-colors ${
                            module.completed ? 'text-clinical-accent' : 'text-white'
                          }`}
                        >
                          {module.title}
                        </p>
                      </div>
                      <CheckCircle2
                        className={`text-lg transition-colors ${
                          module.completed ? 'text-clinical-accent' : 'text-white/30'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-6 border border-white/10 text-center text-slate-400">
              Este edital ainda não possui matérias verticalizadas. Em breve liberaremos o mapa técnico.
            </div>
          )}
        </div>
      )}
    </div>
  );
}