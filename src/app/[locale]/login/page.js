import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({ searchParams }) {
  const t = await getTranslations("Auth");
  const tCheckout = await getTranslations("Checkout");
  const params = await searchParams;
  const next = params?.next?.toString() || "/cuenta";
  const desactivado = params?.desactivado === "1";

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-black">{t("loginTitle")}</h1>
      {desactivado && (
        <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          {tCheckout("disabledAccount")}
        </p>
      )}
      <LoginForm next={next} />
      <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
        {t("noAccount")}{" "}
        <Link href="/registro" className="font-semibold" style={{ color: "var(--brand)" }}>
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
