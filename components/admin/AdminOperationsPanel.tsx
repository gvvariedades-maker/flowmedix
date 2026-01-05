'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Check, Link, Plus, UserCheck } from 'lucide-react';
import { Exam, Flowchart, ExamTopic, ExamContent } from '@/types/database';

type ToastMessage = {
  type: 'success' | 'error';
  message: string;
};

interface AdminOperationsPanelProps {
  exams: Exam[];
  flowcharts: Flowchart[];
  examTopics: ExamTopic[];
  examContents: ExamContent[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AdminOperationsPanel({
  exams,
  flowcharts,
  examTopics,
  examContents,
}: AdminOperationsPanelProps) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL/Anon Key obrigatórios para o painel admin.');
  }

  const supabaseClient = useMemo(
    () => createBrowserClient(supabaseUrl, supabaseAnonKey),
    []
  );

  const [localExams, setLocalExams] = useState<Exam[]>(exams);
  const [localTopics, setLocalTopics] = useState<ExamTopic[]>(examTopics);
  const [localContents, setLocalContents] = useState<ExamContent[]>(examContents);

  const [examName, setExamName] = useState('');
  const [examOrgan, setExamOrgan] = useState('');
  const [examBoard, setExamBoard] = useState('');
  const [examRaw, setExamRaw] = useState('');
  const [examLoading, setExamLoading] = useState(false);

  const [topicExamId, setTopicExamId] = useState(localExams[0]?.id ?? '');
  const [topicName, setTopicName] = useState('');
  const [topicLoading, setTopicLoading] = useState(false);

  const [contentTopicId, setContentTopicId] = useState(localTopics[0]?.id ?? '');
  const [contentFlowchartId, setContentFlowchartId] = useState(
    flowcharts[0]?.id ?? ''
  );
  const [contentLoading, setContentLoading] = useState(false);

  const [enrollExamId, setEnrollExamId] = useState(localExams[0]?.id ?? '');
  const [enrollUserInput, setEnrollUserInput] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const topicsForSelectedExam = useMemo(
    () => localTopics.filter((topic) => topic.exam_id === topicExamId),
    [localTopics, topicExamId]
  );

  const contentsForSelectedExam = useMemo(() => {
    const topicIds = new Set(topicsForSelectedExam.map((topic) => topic.id));
    return localContents.filter((content) => topicIds.has(content.exam_topic_id));
  }, [localContents, topicsForSelectedExam]);

  const flowchartMap = useMemo(() => {
    const map = new Map<string, Flowchart>();
    flowcharts.forEach((flowchart) => {
      map.set(flowchart.id, flowchart);
    });
    return map;
  }, [flowcharts]);

  useEffect(() => {
    if (!topicExamId && localExams.length) {
      setTopicExamId(localExams[0].id);
    }
    if (!enrollExamId && localExams.length) {
      setEnrollExamId(localExams[0].id);
    }
  }, [localExams, topicExamId, enrollExamId]);

  useEffect(() => {
    if (!contentTopicId && topicsForSelectedExam.length) {
      setContentTopicId(topicsForSelectedExam[0].id);
    }
  }, [topicsForSelectedExam, contentTopicId]);

  useEffect(() => {
    if (!contentFlowchartId && flowcharts.length) {
      setContentFlowchartId(flowcharts[0].id);
    }
  }, [flowcharts, contentFlowchartId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleToast = (message: string, type: ToastMessage['type']) => {
    setToast({ message, type });
  };

  const handleCreateExam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = examName.trim();
    if (!trimmedName) {
      handleToast('Informe o nome do concurso antes de salvar.', 'error');
      return;
    }

    setExamLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('exams')
        .insert({
          name: trimmedName,
          organ: examOrgan.trim() || null,
          board: examBoard.trim() || null,
          raw_content: examRaw.trim() || null,
        })
        .select('id, name, organ, board, raw_content')
        .single();

      if (error || !data) {
        throw error ?? new Error('Falha ao criar o concurso.');
      }

      setLocalExams((prev) => [...prev, data]);
      setExamName('');
      setExamOrgan('');
      setExamBoard('');
      setExamRaw('');
      setTopicExamId(data.id);
      setEnrollExamId(data.id);
      handleToast('Concurso criado com sucesso.', 'success');
    } catch (err: any) {
      handleToast(err?.message ?? 'Erro ao salvar o concurso.', 'error');
    } finally {
      setExamLoading(false);
    }
  };

  const handleAddTopic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!topicExamId) {
      handleToast('Selecione um concurso antes de criar a matéria.', 'error');
      return;
    }
    const trimmedTopic = topicName.trim();
    if (!trimmedTopic) {
      handleToast('Informe o nome da matéria.', 'error');
      return;
    }

    setTopicLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('exam_topics')
        .insert({
          exam_id: topicExamId,
          topic_name: trimmedTopic,
        })
        .select('id, exam_id, topic_name')
        .single();

      if (error || !data) {
        throw error ?? new Error('Não foi possível salvar a matéria.');
      }

      setLocalTopics((prev) => [...prev, data]);
      setTopicName('');
      setContentTopicId(data.id);
      handleToast('Matéria adicionada ao edital.', 'success');
    } catch (err: any) {
      handleToast(err?.message ?? 'Erro ao salvar a matéria.', 'error');
    } finally {
      setTopicLoading(false);
    }
  };

  const handleLinkFlowchart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contentTopicId || !contentFlowchartId) {
      handleToast('Escolha um tópico e um fluxograma para vincular.', 'error');
      return;
    }

    setContentLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('exam_contents')
        .insert({
          exam_topic_id: contentTopicId,
          flowchart_id: contentFlowchartId,
        })
        .select('id, exam_topic_id, flowchart_id')
        .single();

      if (error || !data) {
        throw error ?? new Error('Não foi possível vincular o fluxograma.');
      }

      setLocalContents((prev) => [...prev, data]);
      handleToast('Fluxograma vinculado ao tópico.', 'success');
    } catch (err: any) {
      handleToast(err?.message ?? 'Erro ao vincular o fluxograma.', 'error');
    } finally {
      setContentLoading(false);
    }
  };

  const resolveUserId = async (value: string) => {
    const normalized = value.trim();
    if (!normalized.includes('@')) {
      return normalized;
    }
    const response = await fetch('/api/admin/resolve-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? 'Não foi possível resolver o e-mail.');
    }

    const data = await response.json();
    if (!data?.userId) {
      throw new Error('Usuário não encontrado para o e-mail informado.');
    }

    return data.userId as string;
  };

  const handleEnrollStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUser = enrollUserInput.trim();
    if (!trimmedUser || !enrollExamId) {
      handleToast('Informe os dados do aluno e o edital.', 'error');
      return;
    }

    setEnrollLoading(true);
    try {
      const resolvedUserId = await resolveUserId(trimmedUser);
      const { error } = await supabaseClient
        .from('enrollments')
        .insert({
          user_id: resolvedUserId,
          exam_id: enrollExamId,
        });

      if (error) {
        throw error;
      }

      setEnrollUserInput('');
      handleToast('Aluno matriculado com sucesso.', 'success');
    } catch (err: any) {
      handleToast(err?.message ?? 'Erro ao cadastrar matrícula.', 'error');
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Editais</p>
          <p className="text-3xl font-black text-white">{localExams.length}</p>
          <p className="text-sm text-clinical-muted">concursos registrados</p>
        </div>
        <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Matérias</p>
          <p className="text-3xl font-black text-white">{localTopics.length}</p>
          <p className="text-sm text-clinical-muted">disciplinas verticalizadas</p>
        </div>
        <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Fluxogramas</p>
          <p className="text-3xl font-black text-white">{flowcharts.length}</p>
          <p className="text-sm text-clinical-muted">instâncias disponíveis</p>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      <form
        onSubmit={handleCreateExam}
        className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_35px_70px_rgba(2,6,23,0.6)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Criar concurso</p>
            <h2 className="text-2xl font-black text-white">Novo edital</h2>
            <p className="text-sm text-clinical-muted">
              Cadastre um concurso e deixe pronto para receber tópicos e fluxogramas.
            </p>
          </div>
          <Plus className="h-8 w-8 text-clinical-accent" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-clinical-muted">
            <span>Nome do concurso</span>
            <input
              value={examName}
              onChange={(event) => setExamName(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
              placeholder="Prefeitura de São Paulo - Saúde"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-clinical-muted">
            <span>Órgão</span>
            <input
              value={examOrgan}
              onChange={(event) => setExamOrgan(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
              placeholder="Secretaria Municipal"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-clinical-muted">
            <span>Banca</span>
            <input
              value={examBoard}
              onChange={(event) => setExamBoard(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
              placeholder="Banca Visionária"
            />
          </label>
        </div>

        <label className="mt-6 flex flex-col gap-2 text-sm text-clinical-muted">
          <span>Conteúdo programático (opcional)</span>
          <textarea
            value={examRaw}
            onChange={(event) => setExamRaw(event.target.value)}
            className="min-h-[140px] rounded-3xl border border-slate-800 bg-[#05070b] p-4 text-sm text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
            placeholder="1. SUS e políticas públicas..."
          />
        </label>

        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={examLoading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-clinical-accent bg-clinical-accent px-5 py-3 text-sm font-bold uppercase tracking-[0.4em] text-clinical-dark transition hover:shadow-neon-cyan disabled:opacity-50"
          >
            {examLoading ? 'Criando concurso...' : 'Salvar concurso'}
          </button>
          <span className="text-xs uppercase tracking-[0.4em] text-clinical-muted">
            {localExams.length} editais ativos
          </span>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleAddTopic}
          className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Matérias</p>
              <h2 className="text-2xl font-black text-white">Gerenciar tópicos</h2>
            </div>
            <Check className="h-8 w-8 text-clinical-accent" />
          </div>
          <div className="mt-5 space-y-4">
            <label className="flex flex-col gap-2 text-sm text-clinical-muted">
              <span>Selecione o edital</span>
              <select
                value={topicExamId}
                onChange={(event) => setTopicExamId(event.target.value)}
                className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent"
              >
                <option value="">Sem editais</option>
                {localExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-clinical-muted">
              <span>Nome da matéria</span>
              <input
                value={topicName}
                onChange={(event) => setTopicName(event.target.value)}
                className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
                placeholder="SUS | Legislação"
              />
            </label>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <button
              type="submit"
              disabled={topicLoading || !topicExamId}
              className="rounded-2xl border border-clinical-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:shadow-neon-cyan disabled:opacity-50"
            >
              {topicLoading ? 'Salvando...' : 'Adicionar matéria'}
            </button>
            <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">
              {topicsForSelectedExam.length} tópicos neste edital
            </p>
          </div>
          <div className="mt-5 space-y-3 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-300">
            {topicsForSelectedExam.length === 0 ? (
              <p>Nenhuma matéria cadastrada para o edital selecionado.</p>
            ) : (
              topicsForSelectedExam.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between">
                  <span>{topic.topic_name ?? 'Matéria sem nome'}</span>
                  <span className="text-[0.65rem] uppercase tracking-[0.4em] text-clinical-muted">
                    {topic.id.slice(0, 4).toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </form>

        <form
          onSubmit={handleLinkFlowchart}
          className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Vínculos</p>
              <h2 className="text-2xl font-black text-white">Conectar fluxogramas</h2>
            </div>
            <Link className="h-8 w-8 text-clinical-accent" />
          </div>
          <div className="mt-5 space-y-4">
            <label className="flex flex-col gap-2 text-sm text-clinical-muted">
              <span>Tópico</span>
              <select
                value={contentTopicId}
                onChange={(event) => setContentTopicId(event.target.value)}
                className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent"
              >
                <option value="">Nenhum tópico disponível</option>
                {localTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.topic_name ? `${topic.topic_name}` : 'Tópico sem nome'}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-clinical-muted">
              <span>Fluxograma</span>
              <select
                value={contentFlowchartId}
                onChange={(event) => setContentFlowchartId(event.target.value)}
                className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent"
              >
                <option value="">Selecione um fluxograma</option>
                {flowcharts.map((chart) => (
                  <option key={chart.id} value={chart.id}>
                    {chart.title ?? chart.id.slice(0, 12)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <button
              type="submit"
              disabled={contentLoading || !contentTopicId || !contentFlowchartId}
              className="rounded-2xl border border-clinical-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:shadow-neon-cyan disabled:opacity-50"
            >
              {contentLoading ? 'Vinculando...' : 'Vincular ao tópico'}
            </button>
            <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">
              {contentsForSelectedExam.length} fluxogramas oscilando
            </p>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            {topicsForSelectedExam.map((topic) => {
              const linked = localContents.filter(
                (content) => content.exam_topic_id === topic.id
              );
              if (!linked.length) {
                return (
                  <div key={topic.id} className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {topic.topic_name ?? 'Matéria sem nome'}
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.4em] text-clinical-muted">
                      sem fluxograma
                    </span>
                  </div>
                );
              }
              return (
                <div key={topic.id} className="flex flex-col gap-1 rounded-2xl border border-white/5 p-3">
                  <span className="text-sm font-semibold text-white">
                    {topic.topic_name ?? 'Matéria sem nome'}
                  </span>
                  <div className="flex flex-wrap gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-clinical-accent">
                    {linked.map((content) => {
                      const flowchart = flowchartMap.get(content.flowchart_id);
                      return (
                        <span
                          key={content.id}
                          className="rounded-full border border-clinical-accent/40 px-3 py-1"
                        >
                          {flowchart?.title ?? content.flowchart_id.slice(0, 6)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </form>
      </div>

      <form
        onSubmit={handleEnrollStudent}
        className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Matrículas</p>
            <h2 className="text-2xl font-black text-white">Gerenciar alunos</h2>
          </div>
          <UserCheck className="h-8 w-8 text-clinical-accent" />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-clinical-muted">
            <span>Aluno (UUID ou e-mail)</span>
            <input
              value={enrollUserInput}
              onChange={(event) => setEnrollUserInput(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent focus:ring-4 focus:ring-clinical-accent/20"
              placeholder="c6b8a09b-4fd3-4d18-9b73-123456789abc"
            />
            <span className="text-xs text-clinical-muted">
              O e-mail será convertido em UUID automaticamente.
            </span>
          </label>
          <label className="flex flex-col gap-2 text-sm text-clinical-muted">
            <span>Tipo de edital</span>
            <select
              value={enrollExamId}
              onChange={(event) => setEnrollExamId(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-[#070b11] px-4 py-3 text-white outline-none focus:border-clinical-accent"
            >
              <option value="">Selecione o concurso</option>
              {localExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button
            type="submit"
            disabled={enrollLoading || !enrollExamId || !enrollUserInput.trim()}
            className="rounded-2xl border border-clinical-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:shadow-neon-cyan disabled:opacity-50"
          >
            {enrollLoading ? 'Matriculando...' : 'Salvar matrícula'}
          </button>
          <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">
            {enrollLoading ? 'Processando...' : 'Inserções instantâneas'}
          </p>
        </div>
      </form>
    </div>
  );
}

