import { getTranslations } from "next-intl/server";
import { formatoFecha, formatoPrecio, numeroPedido } from "@/lib/format";

// Datos de ejemplo fijos: el panel real muestra pedidos con nombre, dirección
// y teléfono de clientes reales, así que la demo pública nunca lee la base.
const PEDIDOS_DEMO = [
  { id: 1042, fecha: "2026-08-30T10:15:00Z", importe: 46, clienteKey: "pedidoCliente1", estadoKey: "estadoEnviado" },
  { id: 1041, fecha: "2026-08-28T17:40:00Z", importe: 23, clienteKey: "pedidoCliente2", estadoKey: "estadoEntregado" },
  { id: 1040, fecha: "2026-08-27T09:05:00Z", importe: 69, clienteKey: "pedidoCliente3", estadoKey: "estadoPendiente" },
  { id: 1039, fecha: "2026-08-22T14:22:00Z", importe: 23, clienteKey: "pedidoCliente4", estadoKey: "estadoCancelado" },
];

export default async function AdminDemoPedidosPage() {
  const t = await getTranslations("AdminDemo");
  const estadoKeys = ["estadoPendiente", "estadoEnviado", "estadoEntregado", "estadoCancelado"];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">{t("pedidosTitle")}</h1>
      <div className="flex flex-col gap-2">
        {PEDIDOS_DEMO.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center gap-4 p-3">
            <div className="min-w-[160px]">
              <span className="font-semibold">{numeroPedido(p.id)}</span>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {t(p.clienteKey)}
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {formatoFecha(p.fecha)}
            </p>
            <p className="font-bold">{formatoPrecio(p.importe)}</p>
            <select className="input" defaultValue={p.estadoKey} disabled title={t("disabled")}>
              {estadoKeys.map((k) => (
                <option key={k} value={k}>
                  {t(k)}
                </option>
              ))}
            </select>
            {p.estadoKey === "estadoCancelado" && (
              <button type="button" className="btn btn-danger text-xs" disabled title={t("disabled")}>
                {t("delete")}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
