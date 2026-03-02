export default function EstudarLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010409]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-slate-400 text-lg">Carregando questões...</p>
      </div>
    </div>
  );
}
