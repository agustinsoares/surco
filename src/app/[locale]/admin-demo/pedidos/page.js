import { formatoFecha, formatoPrecio, numeroPedido } from "@/lib/format";

// Datos de ejemplo fijos: el panel real muestra pedidos con nombre, dirección
// y teléfono de clientes reales, así que la demo pública nunca lee la base.
const ESTADOS_DEMO = ["Pendiente", "Enviado", "Entregado", "Cancelado"];

const PEDIDOS_DEMO = [
  { id: 1042, fecha: "2026-08-30T10:15:00Z", importe: 46, cliente: "Marta López (@martal)", estado: "Enviado" },
  { id: 1041, fecha: "2026-08-28T17:40:00Z", importe: 23, cliente: "Jon Vik (@jonvik)", estado: "Entregado" },
  { id: 1040, fecha: "2026-08-27T09:05:00Z", importe: 69, cliente: "Sofía Reyes (@sreyes)", estado: "Pendiente" },
  { id: 1039, fecha: "2026-08-22T14:22:00Z", importe: 23, cliente: "Erik Aas (@erikaas)", estado: "Cancelado" },
];

export default function AdminDemoPedidosPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Pedidos</h1>
      <div className="flex flex-col gap-2">
        {PEDIDOS_DEMO.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center gap-4 p-3">
            <div className="min-w-[160px]">
              <span className="font-semibold">{numeroPedido(p.id)}</span>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {p.cliente}
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {formatoFecha(p.fecha)}
            </p>
            <p className="font-bold">{formatoPrecio(p.importe)}</p>
            <select className="input" defaultValue={p.estado} disabled title="Deshabilitado en la demo">
              {ESTADOS_DEMO.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            {p.estado === "Cancelado" && (
              <button type="button" className="btn btn-danger text-xs" disabled title="Deshabilitado en la demo">
                Borrar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
