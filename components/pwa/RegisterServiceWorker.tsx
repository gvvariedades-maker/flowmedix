'use client';

import { useEffect } from 'react';
import { registerAvantServiceWorker } from '@/lib/pwa/registerServiceWorker';

export function RegisterServiceWorker() {
  useEffect(() => {
    registerAvantServiceWorker();
  }, []);

  return null;
}
