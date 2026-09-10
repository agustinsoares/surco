import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getPedidoConDetalle, getUsuarioActual } from "@/lib/data";
import { formatoFecha, formatoPrecio, numeroPedido } from "@/lib/format";

export default async function DetallePedidoPage({ params }) {
  const { id } = await params;
  const t = await getTranslations("OrderDetail");
  const usuario = await getUsuarioActual();
  if (!usuario) redirect({ href: `/login?next=/cuenta/pedidos/${id}`, locale: await getLocale() });

  const pedido = await getPedidoConDetalle(id);
  // RLS ya impide traer pedidos ajenos, pero validamos explícito por claridad.
  if (!pedido || (pedido.usuario_id !== usuario.auth.id && !usuario.perfil?.admin)) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-3xl font-black">{t("title", { number: numeroPedido(pedido.id) })}</h1>
      <p className="mb-6" style={{ color: "var(--muted)" }}>
        {formatoFecha(pedido.fecha)} · {pedido.estados?.descripcion}
      </p>

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
          {t("total", { amount: formatoPrecio(pedido.importe) })}
        </p>
      </div>

      {pedido.direccion_envio?.domicilio && (
        <div className="card mt-4 p-4 text-sm">
          <p className="mb-1 font-bold">{t("shippingAddress")}</p>
          <p>
            {pedido.direccion_envio.nombre} {pedido.direccion_envio.apellidos}
          </p>
          <p>{pedido.direccion_envio.domicilio}</p>
          <p>
            {pedido.direccion_envio.poblacion}, {pedido.direccion_envio.provincia} ({pedido.direccion_envio.cp})
          </p>
        </div>
      )}
    </div>
  );
}
