import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {};

export default async function ModulosPage({}: Props) {
  const supabase = await createServerSupabase();
  
  // Buscar módulos
  const { data: modulesData, error: modulesError } = await supabase
    .from("modulos")
    .select("id, nome")
    .order("ordem", { ascending: true });

  console.log("📦 Módulos encontrados:", modulesData);

  if (modulesError) {
    console.error("❌ Erro ao buscar módulos:", modulesError);
  }

  // Buscar fluxogramas da tabela flowcharts
  // Verificar se há filtro por modulo_id fixo ou antigo
  const { data: flowchartsData, error: flowchartsError } = await supabase
    .from("flowcharts")
    .select("id, title, content, modulo_id")
    .order("created_at", { ascending: false });

  console.log("📊 Fluxogramas encontrados:", flowchartsData);
  console.log("📊 Quantidade de fluxogramas:", flowchartsData?.length || 0);
  console.log("❓ Erro ao buscar fluxogramas:", flowchartsError);

  if (flowchartsError) {
    console.error("❌ Erro ao buscar flowcharts:", flowchartsError);
  }

  // Agrupar fluxogramas por módulo
  const flowchartsByModule = new Map<string, any[]>();
  flowchartsData?.forEach((flowchart: any) => {
    if (flowchart.modulo_id) {
      const existing = flowchartsByModule.get(flowchart.modulo_id) || [];
      existing.push(flowchart);
      flowchartsByModule.set(flowchart.modulo_id, existing);
    }
  });

  console.log("🗂️ Fluxogramas agrupados por módulo:", Array.from(flowchartsByModule.entries()));

  if (modulesError) {
    return (
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Erro ao carregar módulos</CardTitle>
          </CardHeader>
          <CardContent>
            Ocorreu um erro ao buscar os módulos. Confira os logs do servidor.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-white">Meus Módulos</h1>
      <div className="grid gap-4">
        {(modulesData ?? []).map((m: any) => {
          const moduleFlowcharts = flowchartsByModule.get(m.id) || [];
          return (
            <Card key={m.id} className="bg-slate-900 border border-slate-800">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium text-white">{m.nome}</div>
                    <div className="text-sm text-slate-400 mt-1">
                      {moduleFlowcharts.length > 0 
                        ? `${moduleFlowcharts.length} fluxograma(s) disponível(is)`
                        : "Nenhum fluxograma disponível"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {moduleFlowcharts.map((flowchart: any) => (
                    <Link
                      key={flowchart.id}
                      href={`/study/${flowchart.id}`}
                      className="text-sm text-cyan-400 hover:underline"
                    >
                      {flowchart.title || "Fluxograma sem título"}
                    </Link>
                  ))}
                  {moduleFlowcharts.length === 0 && (
                    <span className="text-sm text-slate-500">Sem fluxogramas</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}


