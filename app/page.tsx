import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona para o dashboard correto (rota em app/(dashboard)/dashboard/page.tsx)
  redirect('/dashboard/dashboard');
}

