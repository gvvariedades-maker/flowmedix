import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAdminSessionEmail } from '@/lib/constants';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';
import { getActiveProInfoForUser, isUserPro } from '@/lib/freemium';
import { getServerSession } from '@/lib/supabase/server-auth';
import { AssinaturaClient } from './AssinaturaClient';

export const metadata: Metadata = {
  title: 'Minha assinatura | AVANT',
  description: 'Gerencie seu plano AVANT Pro, forma de pagamento ou cancelamento.',
};

export default async function AssinaturaPage() {
  if (isE2eBypassEnabled('E2E_DASHBOARD_BYPASS')) {
    return (
      <AssinaturaClient
        isPro={false}
        proSource={null}
        proExpiresAt={null}
        isAdmin={false}
      />
    );
  }

  const session = await getServerSession();
  if (!session?.user?.id) redirect('/login');

  const email = session.user.email ?? null;
  const isAdmin = isAdminSessionEmail(email);

  const [userIsPro, proInfo] = await Promise.all([
    isUserPro(session.user.id),
    getActiveProInfoForUser(session.user.id),
  ]);

  const isPro = isAdmin || userIsPro;

  return (
    <AssinaturaClient
      isPro={isPro}
      proSource={isPro && !isAdmin ? proInfo.proSource : null}
      proExpiresAt={isPro && !isAdmin ? proInfo.proExpiresAt : null}
      isAdmin={isAdmin}
    />
  );
}
