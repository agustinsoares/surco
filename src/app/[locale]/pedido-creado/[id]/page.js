import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPedidoConDetalle } from "@/lib/data";
import { formatoFecha, formatoPrecio, numeroPedido } from "@/lib/format";
import ClearCartOnMount from "@/components/ClearCartOnMount";

export default async function PedidoCreadoPage({ params }) {
  const { id } = await params;
  const t = await getTranslations("OrderConfirmation");
  const pedido = await getPedidoConDetalle(id);
  if (!pedido) notFound();

  return (
    <div className="mx-auto max-w-xl text-center">
      <ClearCartOnMount />
      <p className="text-5xl">🎉</p>
      <h1 className="mt-3 text-3xl font-black">{t("title")}</h1>
      <p className="mt-2" style={{ color: "var(--muted)" }}>
        {t("orderNumber", { number: numeroPedido(pedido.id), date: formatoFecha(pedido.fecha) })}
      </p>

      <div className="card mt-6 p-4 text-left">
        <ul className="flex flex-col gap-1 text-sm">
          {pedido.lineas.map((l) => (
            <li key={l.producto_id} className="flex justify-between">
              <span>
                {l.unidades} × {l.productos?.nombre}
              </span>
              <span>{formatoPrecio(l.precio_unitario * l.unidades)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t pt-3 text-right font-bold" style={{ borderColor: "var(--border)" }}>
          {t("total", { amount: formatoPrecio(pedido.importe) })}
        </p>
      </div>

      <Link href="/tienda" className="btn btn-primary mt-6 inline-flex">
        {t("continueShopping")}
      </Link>
    </div>
  );
}
