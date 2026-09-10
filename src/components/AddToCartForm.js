"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "./CartContext";

export default function AddToCartForm({ producto }) {
  const t = useTranslations("Product");
  const { agregar } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const sinStock = producto.existencias <= 0;

  return (
    <div className="flex items-center gap-3">
      <select
        className="input w-20"
        value={cantidad}
        disabled={sinStock}
        onChange={(e) => setCantidad(Number(e.target.value))}
      >
        {Array.from({ length: Math.min(producto.existencias, 10) || 1 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={sinStock}
        className="btn btn-primary"
        onClick={() => {
          agregar(producto, cantidad);
          setAgregado(true);
          setTimeout(() => setAgregado(false), 1500);
        }}
      >
        {sinStock ? t("outOfStock") : agregado ? t("added") : t("addToCart")}
      </button>
    </div>
  );
}
