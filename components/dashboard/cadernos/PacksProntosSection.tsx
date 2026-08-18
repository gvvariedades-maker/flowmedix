'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CadernoProntoCard } from '@/components/dashboard/cadernos/CadernoProntoCard';
import { vitrineContainerVariants } from '@/components/vitrine/vitrineMotion';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { requestNotebookActivationRefresh } from '@/lib/cadernos/notebookActivationBridge';
import type { ResolvedPack } from '@/lib/cadernos/resolvePacks';
import { useToast } from '@/lib/toast-context';
import { cn } from '@/lib/utils';

export type PacksProntosSectionProps = {
  packs: ResolvedPack[];
  className?: string;
};

type FromPackResponse = {
  notebookId?: string;
  entrySlug?: string;
  created?: boolean;
  error?: string;
};

/**
 * Clone + deep-link para o player. Guarda in-flight por `pack_id` (duplo clique).
 * Packs já clonados usam `<Link>` no card — este hook só roda no CTA de start.
 */
export function useStartPack() {
  const router = useRouter();
  const { addToast } = useToast();
  const inFlightRef = useRef<Set<string>>(new Set());
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  const startPack = useCallback(
    async (pack: ResolvedPack) => {
      const packId = pack.def.id;
      if (inFlightRef.current.has(packId)) return;
      if (pack.clonedNotebookId) return;
      if (!pack.entrySlug || pack.items.length === 0) return;

      inFlightRef.current.add(packId);
      setLoadingPackId(packId);

      try {
        const res = await fetchWithAuth('/api/notebooks/from-pack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pack_id: packId,
            title: pack.title,
            items: pack.items.map((it) => ({
              modulo_slug: it.modulo_slug,
              titulo_aula: it.titulo_aula,
              topico: it.topico,
            })),
          }),
        });

        const json = (await res.json()) as FromPackResponse;

        if (!res.ok) {
          addToast(
            typeof json.error === 'string' ? json.error : 'Não foi possível iniciar o caderno.',
            'danger',
          );
          return;
        }

        const notebookId = json.notebookId;
        const entrySlug = json.entrySlug ?? pack.entrySlug;
        if (!notebookId || !entrySlug) {
          addToast('Não foi possível abrir a primeira questão.', 'danger');
          return;
        }

        requestNotebookActivationRefresh();
        router.push(`/estudar/${entrySlug}?from=caderno&caderno_id=${notebookId}`);
      } catch {
        addToast('Não foi possível iniciar o caderno.', 'danger');
      } finally {
        inFlightRef.current.delete(packId);
        setLoadingPackId((current) => (current === packId ? null : current));
      }
    },
    [addToast, router],
  );

  return { startPack, loadingPackId };
}

/**
 * Grade de Cadernos prontos — capa tipada + CTA 1 clique (clone ou continuar).
 */
export function PacksProntosSection({ packs, className }: PacksProntosSectionProps) {
  const { startPack, loadingPackId } = useStartPack();

  if (packs.length === 0) return null;

  return (
    <section
      aria-labelledby="cadernos-prontos-heading"
      className={cn('space-y-4', className)}
    >
      <div>
        <h2
          id="cadernos-prontos-heading"
          className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
        >
          Cadernos prontos
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Comece em 1 clique — packs que acompanham o seu catálogo.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        variants={vitrineContainerVariants}
        initial="initial"
        animate="animate"
      >
        {packs.map((pack) => (
          <CadernoProntoCard
            key={pack.def.id}
            pack={pack}
            loading={loadingPackId === pack.def.id}
            onStart={startPack}
          />
        ))}
      </motion.div>
    </section>
  );
}
