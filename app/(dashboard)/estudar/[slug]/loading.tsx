export default function LoadingQuestao() {
  return (
    <div className="h-screen bg-[#010409] p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#00f2ff] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium">Carregando questão...</p>
        </div>
      </div>
    </div>
  );
}
