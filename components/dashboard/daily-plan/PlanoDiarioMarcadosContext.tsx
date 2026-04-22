'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePlanoDiarioMarcados } from './usePlanoDiarioMarcados';

type Ctx = ReturnType<typeof usePlanoDiarioMarcados> | null;

const PlanoDiarioMarcadosContext = createContext<Ctx>(null);

export function PlanoDiarioMarcadosProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const value = usePlanoDiarioMarcados(userId);
  return <PlanoDiarioMarcadosContext.Provider value={value}>{children}</PlanoDiarioMarcadosContext.Provider>;
}

export function usePlanoDiarioMarcadosContext(): NonNullable<Ctx> {
  const ctx = useContext(PlanoDiarioMarcadosContext);
  if (ctx == null) {
    throw new Error('usePlanoDiarioMarcadosContext deve estar dentro de PlanoDiarioMarcadosProvider');
  }
  return ctx;
}
