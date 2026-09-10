"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registrarse } from "@/lib/actions/auth";

export default function RegistroPage() {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(registrarse, { error: null });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-3xl font-black">{t("registerTitle")}</h1>
      <form action={formAction} className="card grid gap-3 p-5 sm:grid-cols-2">
        <Campo label={t("email")} name="email" type="email" className="sm:col-span-2" />
        <Campo label={t("password")} name="password" type="password" className="sm:col-span-2" />
        <Campo label={t("username")} name="usuario" className="sm:col-span-2" required={false} />
        <Campo label={t("name")} name="nombre" />
        <Campo label={t("lastName")} name="apellidos" />
        <Campo label={t("address")} name="domicilio" className="sm:col-span-2" />
        <Campo label={t("city")} name="poblacion" />
        <Campo label={t("province")} name="provincia" />
        <Campo label={t("zip")} name="cp" pattern="\d{5}" />
        <Campo label={t("phone")} name="telefono" pattern="\d{9}" />

        {state?.error && (
          <p className="sm:col-span-2 text-sm font-semibold" style={{ color: "#b3261e" }}>
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2">
          {pending ? t("creatingAccount") : t("createAccount")}
        </button>
      </form>
      <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold" style={{ color: "var(--brand)" }}>
          {t("logIn")}
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
