import { getTranslations } from "next-intl/server";
import { formatoFecha } from "@/lib/format";

// Datos de ejemplo fijos (ver nota en pedidos/page.js): nunca se leen
// mensajes de contacto reales en la demo pública.
const CONTACTOS_DEMO = [
  { id: 1, autorKey: "pedidoCliente1", fecha: "2026-08-30T11:00:00Z", mensajeKey: "contacto1Mensaje" },
  { id: 2, autorKey: "pedidoCliente2", fecha: "2026-08-25T09:30:00Z", mensajeKey: "contacto2Mensaje" },
  { id: 3, autorKey: "usuarioEliminado", fecha: "2026-08-18T16:45:00Z", mensajeKey: "contacto3Mensaje" },
];

export default async function AdminDemoContactosPage() {
  const t = await getTranslations("AdminDemo");

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">{t("contactosTitle")}</h1>
      <div className="flex flex-col gap-2">
        {CONTACTOS_DEMO.map((c) => (
          <div key={c.id} className="card p-4">
            <p className="text-sm font-semibold">{t(c.autorKey)}</p>
            <p className="mb-2 text-xs" style={{ color: "var(--muted)" }}>
              {formatoFecha(c.fecha)}
            </p>
            <p>{t(c.mensajeKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
