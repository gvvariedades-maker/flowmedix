import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';

/**
 * Indica se a sessão atual (cookies) corresponde ao e-mail em ADMIN_EMAIL.
 * Usado no client logo após sign-in para ajustar o redirect default (/planos → /admin).
 */
export async function GET() {
  const user = await getServerUser();
  const admin = isAdminSessionEmail(user?.email);
  return NextResponse.json({ admin });
}
