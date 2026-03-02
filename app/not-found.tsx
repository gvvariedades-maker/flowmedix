import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010409] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-indigo-400 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-slate-200 mb-4">
            Página Não Encontrada
          </h2>
          <p className="text-slate-400">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/estudar"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Ir para Estudo
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-white/10"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
