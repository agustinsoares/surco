import { formatoFecha } from "@/lib/format";

// Datos de ejemplo fijos (ver nota en pedidos/page.js): nunca se leen
// mensajes de contacto reales en la demo pública.
const CONTACTOS_DEMO = [
  {
    id: 1,
    autor: "Marta López (@martal)",
    fecha: "2026-08-30T11:00:00Z",
    mensaje: "¿Van a reponer stock de \"Litoral\" de Marola? Se agotó rapidísimo.",
  },
  {
    id: 2,
    autor: "Jon Vik (@jonvik)",
    fecha: "2026-08-25T09:30:00Z",
    mensaje: "Llegó todo perfecto, gracias. ¿Hacen envíos a Noruega también?",
  },
  {
    id: 3,
    autor: "Usuario eliminado",
    fecha: "2026-08-18T16:45:00Z",
    mensaje: "Consulta sobre el estado de mi pedido, no me llegó el mail de confirmación.",
  },
];

export default function AdminDemoContactosPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Mensajes de contacto</h1>
      <div className="flex flex-col gap-2">
        {CONTACTOS_DEMO.map((c) => (
          <div key={c.id} className="card p-4">
            <p className="text-sm font-semibold">{c.autor}</p>
            <p className="mb-2 text-xs" style={{ color: "var(--muted)" }}>
              {formatoFecha(c.fecha)}
            </p>
            <p>{c.mensaje}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
