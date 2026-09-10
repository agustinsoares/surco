"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { cambiarPassword } from "@/lib/actions/auth";

export default function PasswordForm() {
  const t = useTranslations("Account");
  const [state, formAction, pending] = useActionState(cambiarPassword, { error: null, success: null });

  return (
    <form action={formAction} className="card flex flex-col gap-3 p-5">
      <div>
        <label className="label" htmlFor="actual">
          {t("currentPassword")}
        </label>
        <input className="input" id="actual" name="actual" type="password" required />
      </div>
      <div>
        <label className="label" htmlFor="nueva">
          {t("newPassword")}
        </label>
        <input className="input" id="nueva" name="nueva" type="password" required />
      </div>
      <div>
        <label className="label" htmlFor="confirmar">
          {t("confirmPassword")}
        </label>
        <input className="input" id="confirmar" name="confirmar" type="password" required />
      </div>
      {state?.error && <p className="text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}
      {state?.success && <p className="text-sm font-semibold text-green-700">{state.success}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        {pending ? t("changingPassword") : t("changePasswordButton")}
      </button>
    </form>
  );
}
