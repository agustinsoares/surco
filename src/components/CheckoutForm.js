"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "./CartContext";
import { crearPedido } from "@/lib/actions/pedidos";
import { formatoPrecio } from "@/lib/format";

const estadoInicial = { error: null };

export default function CheckoutForm({ perfil }) {
  const t = useTranslations("Checkout");
  const { lineas, total, listo } = useCart();
  const [metodo, setMetodo] = useState("tarjeta");
  const [state, formAction, pending] = useActionState(crearPedido, estadoInicial);

  if (!listo) return null;

  if (lineas.length === 0) {
    return (
      <p>
        {t("emptyCart")}{" "}
        <Link href="/tienda" className="font-semibold" style={{ color: "var(--brand)" }}>
          {t("backToCatalog")}
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="carrito" value={JSON.stringify(lineas)} />

      <section className="card p-4">
        <h2 className="mb-3 font-bold">{t("summary")}</h2>
        <ul className="mb-3 flex flex-col gap-1 text-sm">
          {lineas.map((l) => (
            <li key={l.codigo} className="flex justify-between">
              <span>
                {l.cantidad} × {l.nombre}
              </span>
              <span>{formatoPrecio(l.precio * l.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="text-right font-bold">{t("total", { amount: formatoPrecio(total) })}</p>
      </section>

      <section className="card grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="col-span-full font-bold">{t("shippingData")}</h2>
        <Campo label={t("name")} name="nombre" defaultValue={perfil?.nombre} />
        <Campo label={t("lastName")} name="apellidos" defaultValue={perfil?.apellidos} />
        <Campo label={t("address")} name="domicilio" defaultValue={perfil?.domicilio} className="sm:col-span-2" />
        <Campo label={t("city")} name="poblacion" defaultValue={perfil?.poblacion} />
        <Campo label={t("province")} name="provincia" defaultValue={perfil?.provincia} />
        <Campo label={t("zip")} name="cp" defaultValue={perfil?.cp} pattern="\d{5}" />
        <Campo label={t("phone")} name="telefono" defaultValue={perfil?.telefono} pattern="\d{9}" />
      </section>

      <section className="card p-4">
        <h2 className="mb-3 font-bold">{t("payment")}</h2>
        <div className="mb-3 flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="metodoPago" value="tarjeta" checked={metodo === "tarjeta"} onChange={() => setMetodo("tarjeta")} />
            {t("card")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="metodoPago"
              value="transferencia"
              checked={metodo === "transferencia"}
              onChange={() => setMetodo("transferencia")}
            />
            {t("transfer")}
          </label>
        </div>

        {metodo === "tarjeta" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo label={t("cardNumber")} name="numeroTarjeta" className="sm:col-span-3" placeholder="4111111111111111" />
            <Campo label={t("expiry")} name="caducidad" placeholder="09/29" />
            <Campo label={t("cvv")} name="cvv" placeholder="123" />
          </div>
        ) : (
          <Campo label={t("iban")} name="iban" placeholder="ES9121000418450200051332" />
        )}

        <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
          {t("paymentNote")}
        </p>
      </section>

      {state?.error && <p className="text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary self-end">
        {pending ? t("processing") : t("confirm")}
      </button>
    </form>
  );
}

function Campo({ label, name, defaultValue, className = "", ...rest }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input className="input" id={name} name={name} defaultValue={defaultValue} required {...rest} />
    </div>
  );
}
