"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cancelarPedido } from "@/lib/actions/pedidos";
import { formatoFecha, formatoPrecio, numeroPedido } from "@/lib/format";

export default function OrderList({ pedidos }) {
  const [pendienteId, setPendienteId] = useState(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  if (pedidos.length === 0) {
    return <p style={{ color: "var(--muted)" }}>Todavía no hiciste ningún pedido.</p>;
  }

  function onCancelar(id) {
    setError(null);
    setPendienteId(id);
    startTransition(async () => {
      const res = await cancelarPedido(id);
      if (res?.error) setError(res.error);
      setPendienteId(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm font-semibold" style={{ color: "#b3261e" }}>{error}</p>}
      {pedidos.map((p) => {
        const estado = p.estados?.descripcion;
        return (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{numeroPedido(p.id)}</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {formatoFecha(p.fecha)} · {formatoPrecio(p.importe)}
              </p>
            </div>
            <span
              className="badge"
              style={{
                background: estado === "Cancelado" ? "#fbe4e2" : estado === "Entregado" ? "#dcf5e3" : "var(--border)",
                color: estado === "Cancelado" ? "#8f2c22" : estado === "Entregado" ? "#1c6b34" : "var(--muted)",
              }}
            >
              {estado}
            </span>
            <div className="flex gap-2">
              <Link href={`/cuenta/pedidos/${p.id}`} className="btn btn-secondary text-xs">
                Ver pedido
              </Link>
              {estado === "Pendiente" && (
                <button
                  type="button"
                  className="btn btn-danger text-xs"
                  disabled={pending && pendienteId === p.id}
                  onClick={() => onCancelar(p.id)}
                >
                  {pending && pendienteId === p.id ? "Cancelando…" : "Cancelar"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
