"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { crearPedido } from "@/lib/actions/pedidos";
import { formatoPrecio } from "@/lib/format";

const estadoInicial = { error: null };

export default function CheckoutForm({ perfil }) {
  const { lineas, total, listo } = useCart();
  const [metodo, setMetodo] = useState("tarjeta");
  const [state, formAction, pending] = useActionState(crearPedido, estadoInicial);

  if (!listo) return null;

  if (lineas.length === 0) {
    return (
      <p>
        Tu carrito está vacío.{" "}
        <Link href="/tienda" className="font-semibold" style={{ color: "var(--brand)" }}>
          Volvé al catálogo
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="carrito" value={JSON.stringify(lineas)} />

      <section className="card p-4">
        <h2 className="mb-3 font-bold">Resumen</h2>
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
        <p className="text-right font-bold">Total: {formatoPrecio(total)}</p>
      </section>

      <section className="card grid gap-3 p-4 sm:grid-cols-2">
        <h2 className="col-span-full font-bold">Datos de envío</h2>
        <Campo label="Nombre" name="nombre" defaultValue={perfil?.nombre} />
        <Campo label="Apellidos" name="apellidos" defaultValue={perfil?.apellidos} />
        <Campo label="Domicilio" name="domicilio" defaultValue={perfil?.domicilio} className="sm:col-span-2" />
        <Campo label="Población" name="poblacion" defaultValue={perfil?.poblacion} />
        <Campo label="Provincia" name="provincia" defaultValue={perfil?.provincia} />
        <Campo label="Código postal" name="cp" defaultValue={perfil?.cp} pattern="\d{5}" />
        <Campo label="Teléfono" name="telefono" defaultValue={perfil?.telefono} pattern="\d{9}" />
      </section>

      <section className="card p-4">
        <h2 className="mb-3 font-bold">Pago</h2>
        <div className="mb-3 flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="metodoPago" value="tarjeta" checked={metodo === "tarjeta"} onChange={() => setMetodo("tarjeta")} />
            Tarjeta
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="metodoPago"
              value="transferencia"
              checked={metodo === "transferencia"}
              onChange={() => setMetodo("transferencia")}
            />
            Transferencia
          </label>
        </div>

        {metodo === "tarjeta" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo label="Número (16 dígitos)" name="numeroTarjeta" className="sm:col-span-3" placeholder="4111111111111111" />
            <Campo label="Caducidad (MM/AA)" name="caducidad" placeholder="09/29" />
            <Campo label="CVV" name="cvv" placeholder="123" />
          </div>
        ) : (
          <Campo label="IBAN" name="iban" placeholder="ES9121000418450200051332" />
        )}

        <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
          Proyecto de portfolio: no se procesa ningún pago real ni se almacenan datos de tarjeta.
        </p>
      </section>

      {state?.error && <p className="text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary self-end">
        {pending ? "Procesando…" : "Confirmar pedido"}
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
