"use client";

import { useState, useTransition } from "react";
import { cambiarEstadoPedido } from "@/lib/actions/admin";

export default function EstadoPedidoSelector({ pedidoId, estadoActualId, estados }) {
  const [valor, setValor] = useState(estadoActualId);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onChange(e) {
    const nuevo = Number(e.target.value);
    setError(null);
    startTransition(async () => {
      const res = await cambiarEstadoPedido(pedidoId, nuevo);
      if (res?.error) {
        setError(res.error);
        setValor(estadoActualId);
      } else {
        setValor(nuevo);
      }
    });
  }

  return (
    <div>
      <select className="input" value={valor} onChange={onChange} disabled={pending}>
        {estados.map((e) => (
          <option key={e.id} value={e.id}>
            {e.descripcion}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs font-semibold" style={{ color: "#b3261e" }}>{error}</p>}
    </div>
  );
}
