// Ficha de zona (RF-009). Pantalla de Rol 4/5: aquí solo está la conexión con los datos.
import { notFound } from "next/navigation";
import { getMetricas, getMunicipio, getMunicipios, getSuelo } from "@/lib/datos";

export async function generateStaticParams() {
  return (await getMunicipios()).map((m) => ({ municipio: m.municipio }));
}

export default async function ZonaPage({ params }: { params: Promise<{ municipio: string }> }) {
  const { municipio } = await params;
  const m = await getMunicipio(municipio);
  if (!m) notFound();

  const [metricas, suelo] = await Promise.all([getMetricas(m.municipio), getSuelo(m.municipio)]);

  // TODO (frontend): FichaZona, Semaforo, FuenteDato, AvisoEjemplo con estos datos.
  return (
    <main>
      <h1>{m.nombre}</h1>
      <pre>{JSON.stringify({ suelo, promedio: metricas?.promedio_1985_2025 ?? null }, null, 2)}</pre>
    </main>
  );
}
