'use client';

import { LpPageEditor } from '@/components/admin/lp/LpPageEditor';

export default function NovaLandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <LpPageEditor mode="create" />
    </div>
  );
}
