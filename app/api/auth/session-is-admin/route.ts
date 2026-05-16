import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';

/**
 * Indica se a sessão atual (cookies) corresponde ao e-mail em ADMIN_EMAIL.
 * Usado no client logo após sign-in para ajustar o redirect default (/planos → /admin).
 */
export async function GET() {
  const session = await getServerSession();
  const admin = isAdminSessionEmail(session?.user?.email);
  return NextResponse.json({ admin });
}
