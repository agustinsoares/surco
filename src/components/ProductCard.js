"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";
import { formatoPrecio } from "@/lib/format";

export default function ProductCard({ producto }) {
  const { agregar } = useCart();
  const sinStock = producto.existencias <= 0;

  return (
    <div className="card flex flex-col overflow-hidden">
      <Link href={`/tienda/${producto.id}`} className="relative block aspect-square w-full overflow-hidden bg-black/5">
        <Image
          src={producto.imagen}
          alt={`Portada de ${producto.nombre}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {sinStock && (
          <span className="badge absolute left-2 top-2 bg-black/70 text-white">Agotado</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="badge w-fit" style={{ background: "var(--border)", color: "var(--muted)" }}>
          {producto.categorias?.descripcion}
        </span>
        <Link href={`/tienda/${producto.id}`} className="font-semibold leading-tight">
          {producto.nombre}
        </Link>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {producto.autor}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold">{formatoPrecio(producto.precio)}</span>
          <button
            type="button"
            disabled={sinStock}
            onClick={() => agregar(producto, 1)}
            className="btn btn-primary text-xs"
          >
            {sinStock ? "Sin stock" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
