'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useCallback, useState } from 'react';
import { LogOut } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);
    if (!error) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-[#EF4444] transition duration-200 hover:bg-[#fee2e2] disabled:opacity-60"
    >
      <LogOut size={18} />
      <span>Sair</span>
    </button>
  );
}






