'use client';

import { useState } from 'react';

const TARGET_DATE = new Date(2026, 5, 7);
const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

function getDaysUntilTarget() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(TARGET_DATE.getFullYear(), TARGET_DATE.getMonth(), TARGET_DATE.getDate());

  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / ONE_DAY_IN_MS));
}

export function CountdownDays() {
  const [daysUntilTest] = useState<number>(() => getDaysUntilTarget());

  return (
    <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">
      A prova é em 07/06/2026. Faltam {daysUntilTest} dias.
    </p>
  );
}
