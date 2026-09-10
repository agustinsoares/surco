"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/CartContext";
import { formatoPrecio } from "@/lib/format";

export default function CarritoPage() {
  const t = useTranslations("Cart");
  const { lineas, modificarCantidad, eliminar, vaciar, total, listo } = useCart();

  if (!listo) return null;

  if (lineas.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-black">{t("empty")}</h1>
        <p className="mt-2" style={{ color: "var(--muted)" }}>
          {t("emptyHint")}
        </p>
        <Link href="/tienda" className="btn btn-primary mt-6 inline-flex">
          {t("goToCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">{t("title")}</h1>
      <div className="flex flex-col gap-4">
        {lineas.map((l) => (
          <div key={l.codigo} className="card flex items-center gap-4 p-3">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
              <Image src={l.imagen} alt={l.nombre} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{l.nombre}</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {l.autor}
              </p>
              <p className="font-bold">{formatoPrecio(l.precio)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-secondary px-3" onClick={() => modificarCantidad(l.codigo, -1)}>
                −
              </button>
              <span className="w-6 text-center">{l.cantidad}</span>
              <button type="button" className="btn btn-secondary px-3" onClick={() => modificarCantidad(l.codigo, 1)}>
                +
              </button>
            </div>
            <button type="button" className="text-sm" style={{ color: "#b3261e" }} onClick={() => eliminar(l.codigo)}>
              {t("remove")}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-3">
        <p className="text-xl font-bold">{t("total", { amount: formatoPrecio(total) })}</p>
        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary" onClick={vaciar}>
            {t("clear")}
          </button>
          <Link href="/checkout" className="btn btn-primary">
            {t("checkout")}
          </Link>
        </div>
      </div>
    </div>
  );
}
