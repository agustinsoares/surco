"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { actualizarPerfil } from "@/lib/actions/auth";

export default function ProfileForm({ perfil }) {
  const t = useTranslations("Account");
  const [state, formAction, pending] = useActionState(actualizarPerfil, { error: null, success: null });

  return (
    <form action={formAction} className="card grid gap-3 p-5 sm:grid-cols-2">
      <Campo label={t("name")} name="nombre" defaultValue={perfil?.nombre} />
      <Campo label={t("lastName")} name="apellidos" defaultValue={perfil?.apellidos} />
      <Campo label={t("address")} name="domicilio" defaultValue={perfil?.domicilio} className="sm:col-span-2" />
      <Campo label={t("city")} name="poblacion" defaultValue={perfil?.poblacion} />
      <Campo label={t("province")} name="provincia" defaultValue={perfil?.provincia} />
      <Campo label={t("zip")} name="cp" defaultValue={perfil?.cp} />
      <Campo label={t("phone")} name="telefono" defaultValue={perfil?.telefono} />

      {state?.error && <p className="sm:col-span-2 text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}
      {state?.success && <p className="sm:col-span-2 text-sm font-semibold text-green-700">{state.success}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2 justify-self-start">
        {pending ? t("saving") : t("save")}
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
