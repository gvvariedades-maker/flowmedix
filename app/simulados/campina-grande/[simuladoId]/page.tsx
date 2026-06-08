import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicSimuladoRunner } from '@/components/public-simulado/PublicSimuladoRunner';
import { loadPublicSimuladoBundle, isPublicSimuladoId } from '@/lib/public-simulado/loadSimulado';
import { serializeLessonPayloadForClient } from '@/lib/estudar/questionPayload';

type PageProps = { params: Promise<{ simuladoId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { simuladoId } = await params;
  if (!isPublicSimuladoId(simuladoId)) return { title: 'Simulado AVANT' };

  try {
    const { manifest } = loadPublicSimuladoBundle(simuladoId);
    return {
      title: `${manifest.titulo} · ${manifest.cidade} ${manifest.uf} | AVANT`,
      description: manifest.descricao,
      openGraph: {
        title: `${manifest.titulo} · IDECAN · ${manifest.cidade}`,
        description: manifest.descricao,
        type: 'website',
        locale: 'pt_BR',
      },
    };
  } catch {
    return { title: 'Simulado AVANT' };
  }
}

export default async function PublicSimuladoPage({ params }: PageProps) {
  const { simuladoId } = await params;
  if (!isPublicSimuladoId(simuladoId)) notFound();

  let bundle;
  try {
    bundle = loadPublicSimuladoBundle(simuladoId);
  } catch {
    notFound();
  }

  const serialized = serializeLessonPayloadForClient(bundle);

  return <PublicSimuladoRunner bundle={serialized} />;
}
