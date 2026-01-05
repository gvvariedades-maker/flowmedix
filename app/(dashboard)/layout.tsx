'use client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-slate-950">
      <main className="w-full">{children}</main>
    </div>
  )
}

