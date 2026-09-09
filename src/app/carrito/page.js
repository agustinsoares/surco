"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatoPrecio } from "@/lib/format";

export default function CarritoPage() {
  const { lineas, modificarCantidad, eliminar, vaciar, total, listo } = useCart();

  if (!listo) return null;

  if (lineas.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-black">Tu carrito está vacío</h1>
        <p className="mt-2" style={{ color: "var(--muted)" }}>
          Todavía no agregaste ningún disco.
        </p>
        <Link href="/tienda" className="btn btn-primary mt-6 inline-flex">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">Tu carrito</h1>
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
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-end gap-3">
        <p className="text-xl font-bold">Total: {formatoPrecio(total)}</p>
        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary" onClick={vaciar}>
            Vaciar carrito
          </button>
          <Link href="/checkout" className="btn btn-primary">
            Formalizar pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
