import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';

export default function EstudarLoading() {
  return (
    <DashboardMobilePage
      variant="default"
      className="flex min-h-screen items-center justify-center bg-[#010409]"
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="text-lg text-slate-400">Carregando questões...</p>
      </div>
    </DashboardMobilePage>
  );
}
