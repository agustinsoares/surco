"use client";

import { useState, useTransition } from "react";

export default function DeleteButton({ accion, confirmMessage = "¿Seguro que querés borrar esto?", label = "Borrar" }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function onClick() {
    if (!confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const res = await accion();
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button type="button" className="btn btn-danger text-xs" disabled={pending} onClick={onClick}>
        {pending ? "Borrando…" : label}
      </button>
      {error && <span className="text-xs font-semibold" style={{ color: "#b3261e" }}>{error}</span>}
    </div>
  );
}
