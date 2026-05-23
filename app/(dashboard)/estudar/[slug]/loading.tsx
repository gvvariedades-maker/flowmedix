import { LessonPlayerSkeleton } from '@/components/lesson/LessonPlayerSkeleton';

export default function LoadingQuestao() {
  return (
    <div className="flex flex-1 flex-col min-h-0 w-full bg-[#010409] px-3 py-3 sm:px-4 md:px-6 md:py-6 pb-safe font-sans">
      <div className="flex flex-1 flex-col min-h-0 w-full max-w-6xl mx-auto">
        <LessonPlayerSkeleton />
      </div>
    </div>
  );
}
