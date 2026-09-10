"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { iniciarSesion } from "@/lib/actions/auth";

export default function LoginForm({ next = "/cuenta" }) {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(iniciarSesion, { error: null });

  return (
    <form action={formAction} className="card flex flex-col gap-3 p-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="email">
          {t("email")}
        </label>
        <input className="input" type="email" id="email" name="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          {t("password")}
        </label>
        <input className="input" type="password" id="password" name="password" required />
      </div>
      {state?.error && <p className="text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t("loggingIn") : t("loginButton")}
      </button>
    </form>
  );
}
