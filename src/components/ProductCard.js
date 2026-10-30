"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "./CartContext";
import { formatoPrecio } from "@/lib/format";

export default function ProductCard({ producto }) {
  const t = useTranslations("Shop");
  const { agregar } = useCart();
  const sinStock = producto.existencias <= 0;
  const cardRef = useRef(null);
  // En pantallas táctiles no hay hover: la tarjeta gira con un toque
  const [girada, setGirada] = useState(false);

  useEffect(() => {
    if (!girada) return;
    function cerrarAlTocarAfuera(e) {
      if (!cardRef.current?.contains(e.target)) setGirada(false);
    }
    document.addEventListener("pointerdown", cerrarAlTocarAfuera);
    return () => document.removeEventListener("pointerdown", cerrarAlTocarAfuera);
  }, [girada]);

  return (
    <div ref={cardRef} className={`flip-card aspect-square w-full ${girada ? "is-flipped" : ""}`}>
      <div className="flip-card-inner">
        <div
          className="flip-card-face card"
          onPointerUp={(e) => {
            if (e.pointerType !== "mouse") setGirada(true);
          }}
        >
          <Image
            src={producto.imagen}
            alt={`Portada de ${producto.nombre}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
          {sinStock && (
            <span className="badge absolute left-2 top-2 bg-black/70 text-white">{t("outOfStock")}</span>
          )}
        </div>
        <div className="flip-card-face flip-card-back card text-white">
          <div
            className="absolute inset-0 scale-125 bg-cover bg-center blur-lg saturate-150"
            style={{ backgroundImage: `url(${producto.imagen})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative flex h-full flex-col gap-1 p-3">
            <span className="badge w-fit bg-white/15">{producto.categorias?.descripcion}</span>
            <Link
              href={`/tienda/${producto.id}`}
              className="mt-1 line-clamp-2 font-semibold leading-tight after:absolute after:inset-0"
            >
              {producto.nombre}
            </Link>
            <p className="truncate text-sm text-white/75">{producto.autor}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-1 pt-2">
              <span className="font-bold">{formatoPrecio(producto.precio)}</span>
              <button
                type="button"
                disabled={sinStock}
                onClick={() => agregar(producto, 1)}
                className="btn btn-primary relative z-10 text-xs"
              >
                {sinStock ? t("outOfStockButton") : t("add")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
