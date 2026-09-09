"use client";

import { useActionState } from "react";
import { actualizarPerfil } from "@/lib/actions/auth";

export default function ProfileForm({ perfil }) {
  const [state, formAction, pending] = useActionState(actualizarPerfil, { error: null, success: null });

  return (
    <form action={formAction} className="card grid gap-3 p-5 sm:grid-cols-2">
      <Campo label="Nombre" name="nombre" defaultValue={perfil?.nombre} />
      <Campo label="Apellidos" name="apellidos" defaultValue={perfil?.apellidos} />
      <Campo label="Domicilio" name="domicilio" defaultValue={perfil?.domicilio} className="sm:col-span-2" />
      <Campo label="Población" name="poblacion" defaultValue={perfil?.poblacion} />
      <Campo label="Provincia" name="provincia" defaultValue={perfil?.provincia} />
      <Campo label="Código postal" name="cp" defaultValue={perfil?.cp} />
      <Campo label="Teléfono" name="telefono" defaultValue={perfil?.telefono} />

      {state?.error && <p className="sm:col-span-2 text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}
      {state?.success && <p className="sm:col-span-2 text-sm font-semibold text-green-700">{state.success}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2 justify-self-start">
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

function Campo({ label, name, defaultValue, className = "" }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input className="input" id={name} name={name} defaultValue={defaultValue} required />
    </div>
  );
}
