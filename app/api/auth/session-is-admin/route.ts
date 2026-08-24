import { NextResponse } from 'next/server';
import { getServerUser, createSupabaseServerClient } from '@/lib/supabase/server-auth';
import { isAdminSessionEmail } from '@/lib/constants';
import { getAdminAssuranceLevel, type AdminMfaAssuranceState } from '@/lib/admin/adminAssurance';

/**
 * Indica se a sessão atual (cookies) corresponde a um e-mail administrativo
 * e se o segundo fator (MFA AAL2) já foi verificado.
 *
 * Usado no client logo após sign-in para ajustar o redirect default (/planos → /admin).
 */
export async function GET() {
  const user = await getServerUser();
  const email = user?.email?.toLowerCase();
  const admin = isAdminSessionEmail(email);

  let assuranceState: AdminMfaAssuranceState = 'FAIL_CLOSED';
  if (user?.email && admin) {
    const supabase = await createSupabaseServerClient();
    const assurance = await getAdminAssuranceLevel(supabase);
    assuranceState = assurance.state;
  }

  return NextResponse.json({
    admin,
    mfaVerified: assuranceState === 'AAL2_VERIFIED',
    assuranceState,
  });
}
