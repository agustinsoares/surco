"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarse } from "@/lib/actions/auth";

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(registrarse, { error: null });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-3xl font-black">Crear cuenta</h1>
      <form action={formAction} className="card grid gap-3 p-5 sm:grid-cols-2">
        <Campo label="Email" name="email" type="email" className="sm:col-span-2" />
        <Campo label="Contraseña" name="password" type="password" className="sm:col-span-2" />
        <Campo label="Usuario (público)" name="usuario" className="sm:col-span-2" required={false} />
        <Campo label="Nombre" name="nombre" />
        <Campo label="Apellidos" name="apellidos" />
        <Campo label="Domicilio" name="domicilio" className="sm:col-span-2" />
        <Campo label="Población" name="poblacion" />
        <Campo label="Provincia" name="provincia" />
        <Campo label="Código postal" name="cp" pattern="\d{5}" />
        <Campo label="Teléfono" name="telefono" pattern="\d{9}" />

        {state?.error && (
          <p className="sm:col-span-2 text-sm font-semibold" style={{ color: "#b3261e" }}>
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2">
          {pending ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-semibold" style={{ color: "var(--brand)" }}>
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}

function Campo({ label, name, type = "text", className = "", required = true, ...rest }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input className="input" id={name} name={name} type={type} required={required} {...rest} />
    </div>
  );
}
