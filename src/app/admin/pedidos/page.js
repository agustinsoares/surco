import Link from "next/link";
import { getEstados, getTodosLosPedidos } from "@/lib/data";
import { formatoFecha, formatoPrecio, numeroPedido } from "@/lib/format";
import { borrarPedido } from "@/lib/actions/admin";
import EstadoPedidoSelector from "@/components/EstadoPedidoSelector";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminPedidosPage() {
  const [pedidos, estados] = await Promise.all([getTodosLosPedidos(), getEstados()]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Pedidos</h1>
      <div className="flex flex-col gap-2">
        {pedidos.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center gap-4 p-3">
            <div className="min-w-[160px]">
              <Link href={`/admin/pedidos/${p.id}`} className="font-semibold">
                {numeroPedido(p.id)}
              </Link>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {p.perfiles?.nombre} {p.perfiles?.apellidos} (@{p.perfiles?.usuario})
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {formatoFecha(p.fecha)}
            </p>
            <p className="font-bold">{formatoPrecio(p.importe)}</p>
            <EstadoPedidoSelector pedidoId={p.id} estadoActualId={p.estado_id} estados={estados} />
            {p.estados?.descripcion === "Cancelado" && (
              <DeleteButton accion={borrarPedido.bind(null, p.id)} confirmMessage={`¿Borrar el pedido ${numeroPedido(p.id)}?`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
