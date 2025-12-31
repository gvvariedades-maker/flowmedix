import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

type EnrollmentRow = {
  id: string;
  exam_id: string | null;
  status?: string | null;
  is_active?: boolean | null;
};

type TopicRow = {
  id: string;
  exam_id: string;
  module_id: string | null;
  topic_name: string | null;
  topic_order: number | null;
};

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

type VerticalExamData = {
  id: string;
  name: string;
  organ: string | null;
  board: string | null;
  raw_content: string | null;
  completionRate: number;
  topics: VerticalTopic[];
};

type ExamRecord = {
  id: string;
  name: string;
  organ: string | null;
  board: string | null;
  raw_content: string | null;
};

const isActiveEnrollment = (record?: EnrollmentRow) => {
  if (!record) return false;
  if (typeof record.is_active === 'boolean') {
    return record.is_active;
  }
  if (record.status) {
    const normalized = record.status.toLowerCase();
    return normalized.includes('active') || normalized.includes('matric');
  }
  return true;
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Middleware já lida com cookies em Server Components.
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;
  const displayName = session.user.email ?? userId;

  const enrollmentResponse = await supabase
    .from('enrollments')
    .select('id, exam_id, status, is_active')
    .eq('user_id', userId);

  if (enrollmentResponse.error) {
    console.error('Erro enrollments:', enrollmentResponse.error.message);
  }

  let activeExamIds = (enrollmentResponse.data ?? [])
    .filter((item) => item.exam_id && isActiveEnrollment(item))
    .map((item) => item.exam_id!) as string[];

  if (!activeExamIds.length) {
    const purchaseResponse = await supabase
      .from('exam_purchases')
      .select('exam_id')
      .eq('user_id', userId);

    if (!purchaseResponse.error && purchaseResponse.data) {
      activeExamIds = purchaseResponse.data
        .map((item) => item.exam_id)
        .filter(Boolean) as string[];
    } else if (purchaseResponse.error) {
      console.error('Erro exam_purchases:', purchaseResponse.error.message);
    }
  }

  activeExamIds = Array.from(new Set(activeExamIds));

  const examsResponse = activeExamIds.length
    ? await supabase
        .from('exams')
        .select('id, name, organ, board, raw_content')
        .in('id', activeExamIds)
        .order('created_at', { ascending: false })
    : { data: [], error: null };

  if (examsResponse.error) {
    console.error('Erro exams:', examsResponse.error.message);
  }

  const topicsResponse = activeExamIds.length
    ? await supabase
        .from('exam_modules')
        .select('id, exam_id, module_id, topic_name, topic_order')
        .in('exam_id', activeExamIds)
        .order('topic_order', { ascending: true })
    : { data: [], error: null };

  if (topicsResponse.error) {
    console.error('Erro exam_modules:', topicsResponse.error.message);
  }

  const moduleIds = Array.from(
    new Set(
      (topicsResponse.data ?? [])
        .map((topic) => topic.module_id)
        .filter(Boolean) as string[]
    )
  );

  const moduleResponse = moduleIds.length
    ? await supabase
        .from('modules')
        .select('id, title')
        .in('id', moduleIds)
    : { data: [], error: null };

  if (moduleResponse.error) {
    console.error('Erro modules:', moduleResponse.error.message);
  }

  const flowchartResponse = moduleIds.length
    ? await supabase
        .from('flowcharts')
        .select('id, module_id')
        .in('module_id', moduleIds)
    : { data: [], error: null };

  if (flowchartResponse.error) {
    console.error('Erro flowcharts:', flowchartResponse.error.message);
  }

  const flowchartIds = flowchartResponse.data?.map((chart) => chart.id) ?? [];
  const progressResponse = flowchartIds.length
    ? await supabase
        .from('user_progress')
        .select('flowchart_id, status')
        .in('flowchart_id', flowchartIds)
        .eq('user_id', userId)
    : { data: [], error: null };

  if (progressResponse.error) {
    console.error('Erro user_progress:', progressResponse.error.message);
  }

  const moduleMap = new Map<string, string>(
    (moduleResponse.data ?? []).map((mod) => [mod.id, mod.title])
  );

  const flowchartsByModule = new Map<string, string[]>();
  (flowchartResponse.data ?? []).forEach((chart) => {
    if (!chart.module_id) {
      return;
    }
    const existing = flowchartsByModule.get(chart.module_id) ?? [];
    existing.push(chart.id);
    flowchartsByModule.set(chart.module_id, existing);
  });

  const completedFlowchartIds = new Set(
    (progressResponse.data ?? [])
      .filter((row) => row.status === 'completed')
      .map((row) => row.flowchart_id)
  );

  const moduleCompletion = new Map<string, boolean>();
  flowchartsByModule.forEach((flowchartIds, moduleId) => {
    const hasCompleted = flowchartIds.some((flowchartId) =>
      completedFlowchartIds.has(flowchartId)
    );
    moduleCompletion.set(moduleId, hasCompleted);
  });

  const topicsByExam = new Map<string, TopicRow[]>();
  (topicsResponse.data ?? []).forEach((topic) => {
    const container = topicsByExam.get(topic.exam_id) ?? [];
    container.push(topic);
    topicsByExam.set(topic.exam_id, container);
  });

  const examOrderMap = new Map<string, ExamRecord>(
    (examsResponse.data ?? []).map((exam) => [
      exam.id,
      {
        id: exam.id,
        name: exam.name,
        organ: exam.organ ?? null,
        board: exam.board ?? null,
        raw_content: exam.raw_content ?? null,
      },
    ])
  );

  const verticalExams: VerticalExamData[] = activeExamIds
    .map((examId) => examOrderMap.get(examId))
    .filter((exam): exam is ExamRecord => Boolean(exam))
    .map((exam) => {
      const topics = (topicsByExam.get(exam.id) ?? []).map((topic) => {
        const moduleId = topic.module_id;
        const moduleTitle = moduleId ? moduleMap.get(moduleId) ?? 'Módulo sem título' : 'Conteúdo livre';
        const completed = moduleId ? moduleCompletion.get(moduleId) ?? false : false;

        return {
          id: topic.id,
          topicName: topic.topic_name ?? moduleTitle,
          modules: moduleId
            ? [
                {
                  id: moduleId,
                  title: moduleTitle,
                  completed,
                },
              ]
            : [],
        };
      });

      const uniqueModuleIds = Array.from(
        new Set(
          topics.flatMap((topic) =>
            topic.modules.map((module) => module.id).filter(Boolean)
          )
        )
      ) as string[];

      const completedModules = uniqueModuleIds.filter(
        (moduleId) => moduleCompletion.get(moduleId) ?? false
      ).length;

      const completionRate =
        uniqueModuleIds.length > 0
          ? Math.round((completedModules / uniqueModuleIds.length) * 100)
          : 0;

      return {
        id: exam.id,
        name: exam.name,
        organ: exam.organ,
        board: exam.board,
        raw_content: exam.raw_content,
        completionRate,
        topics,
      };
    });

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="bg-glow-main top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px]" />
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="glass-panel p-6 bg-slate-900/70 border border-slate-800">
            <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Central Verticalizada</p>
            <h1 className="text-4xl md:text-5xl font-black text-neon-gradient mt-2">
              Bem-vindo(a), {displayName}
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mt-1">
              Acompanhe os editais que você já garante acesso e avance pelas matérias com visual técnico.
            </p>
          </div>
        </header>
        <DashboardClient verticalExams={verticalExams} userEmail={displayName} />
      </div>
    </div>
  );
}