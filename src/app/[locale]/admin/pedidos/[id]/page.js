import { notFound } from "next/navigation";
import { getEstados, getPedidoConDetalle } from "@/lib/data";
import { formatoFecha, formatoPrecio, numeroPedido } from "@/lib/format";
import EstadoPedidoSelector from "@/components/EstadoPedidoSelector";

export default async function AdminDetallePedidoPage({ params }) {
  const { id } = await params;
  const [pedido, estados] = await Promise.all([getPedidoConDetalle(id), getEstados()]);
  if (!pedido) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-black">Pedido {numeroPedido(pedido.id)}</h1>
      <p className="mb-4" style={{ color: "var(--muted)" }}>
        {formatoFecha(pedido.fecha)}
      </p>

      <div className="mb-4">
        <span className="label">Estado</span>
        <EstadoPedidoSelector pedidoId={pedido.id} estadoActualId={pedido.estado_id} estados={estados} />
      </div>

      <div className="card p-4">
        <ul className="flex flex-col gap-2 text-sm">
          {pedido.lineas.map((l) => (
            <li key={l.producto_id} className="flex justify-between">
              <span>
                {l.unidades} × {l.productos?.nombre} ({l.productos?.autor})
              </span>
              <span>{formatoPrecio(l.precio_unitario * l.unidades)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t pt-3 text-right font-bold" style={{ borderColor: "var(--border)" }}>
          Total: {formatoPrecio(pedido.importe)}
        </p>
      </div>

      {pedido.direccion_envio?.domicilio && (
        <div className="card mt-4 p-4 text-sm">
          <p className="mb-1 font-bold">Dirección de envío</p>
          <p>
            {pedido.direccion_envio.nombre} {pedido.direccion_envio.apellidos}
          </p>
          <p>{pedido.direccion_envio.domicilio}</p>
          <p>
            {pedido.direccion_envio.poblacion}, {pedido.direccion_envio.provincia} ({pedido.direccion_envio.cp})
          </p>
          <p>Tel: {pedido.direccion_envio.telefono}</p>
        </div>
      )}
    </div>
  );
}
