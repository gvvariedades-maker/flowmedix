import { AdminToolSwitcher } from '@/components/admin/AdminToolSwitcher'

export default async function AdminPage() {
  try {
    console.log('[AdminPage] entrando na rota /admin')
    return (
      <div className="relative min-h-screen bg-[#010409] py-10">
        <div className="bg-glow-main w-[520px] h-[520px] absolute top-[-160px] left-[-140px] opacity-30" />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <header className="space-y-3 text-white pb-6">
            <p className="text-xs uppercase tracking-[0.6em] text-clinical-muted">
              Painel Administrativo
            </p>
            <h1 className="text-4xl font-black text-neon-gradient">
              Gerencie simuladores e os novos concursos verticais
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Combine módulos, regras e edições para entregar cronogramas práticos aos alunos, com controles visuais e abas que destacam cada ferramenta.
            </p>
          </header>

          <AdminToolSwitcher />
        </div>
      </div>
    )
  } catch (error) {
    console.error('[AdminPage] erro ao renderizar /admin', error)
    throw error
  }
}

