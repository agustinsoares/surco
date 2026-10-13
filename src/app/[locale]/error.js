"use client";

import { useTranslations } from "next-intl";

export default function Error({ reset }) {
  const t = useTranslations("Error");

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p style={{ color: "var(--muted)" }}>{t("message")}</p>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>
        {t("retry")}
      </button>
    </div>
  );
}
