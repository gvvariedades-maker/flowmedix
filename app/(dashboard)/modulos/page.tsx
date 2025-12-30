import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {};

export default async function ModulosPage({}: Props) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("modules")
    .select("id,title,description,interactive_data,is_premium")
    .order("title", { ascending: true });

  console.log("Módulos encontrados:", data);

  if (error) {
    console.error("Supabase modules fetch error:", error);
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
        {(data ?? []).map((m: any) => (
          <Card key={m.id} className="bg-slate-900 border border-slate-800">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-medium text-white">{m.title}</div>
                  <div className="text-sm text-slate-400">
                    {Array.isArray(m.tags) ? m.tags.join(", ") : ""}
                  </div>
                </div>
                <div className="text-sm">
                  {m.is_premium ? (
                    <span className="text-rose-400">Premium</span>
                  ) : (
                    <span className="text-teal-400">Free</span>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href={`/study/${m.id}`}
                  className="text-sm text-cyan-400 hover:underline"
                >
                  Abrir flow
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}


