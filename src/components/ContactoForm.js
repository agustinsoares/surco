"use client";

import { useActionState } from "react";
import { enviarContacto } from "@/lib/actions/contacto";

export default function ContactoForm({ nombre, usuario }) {
  const [state, formAction, pending] = useActionState(enviarContacto, { error: null, success: null });

  return (
    <form action={formAction} className="card flex flex-col gap-3 p-5">
      <div>
        <label className="label">Usuario</label>
        <input className="input" value={usuario} readOnly />
      </div>
      <div>
        <label className="label">Nombre</label>
        <input className="input" value={nombre} readOnly />
      </div>
      <div>
        <label className="label" htmlFor="mensaje">
          Mensaje
        </label>
        <textarea className="input" id="mensaje" name="mensaje" rows={5} required />
      </div>
      {state?.error && <p className="text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}
      {state?.success && <p className="text-sm font-semibold text-green-700">{state.success}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
