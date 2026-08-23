import { redirect } from 'next/navigation';
import { decideAuthenticatedDashboardAccess } from '@/lib/layout/authenticatedDashboardAccess';
import { isE2eBypassEnabled } from '@/lib/e2e/bypass';

const dashboardBypassEnabled = isE2eBypassEnabled('E2E_DASHBOARD_BYPASS');

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (dashboardBypassEnabled) {
    return children;
  }

  const decision = await decideAuthenticatedDashboardAccess();
  if (decision.type === 'redirect') {
    redirect(decision.to);
  }

  return children;
}
