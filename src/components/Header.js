"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "./CartContext";

export default function Header({ usuario }) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { cantidadTotal, listo } = useCart();

  function cambiarIdioma(nuevoLocale) {
    router.replace(pathname, { locale: nuevoLocale });
  }

  return (
    <header className="sticky top-0 z-40 border-b" style={{ borderColor: "var(--border)", background: "rgba(250,247,242,0.9)", backdropFilter: "blur(6px)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white"
            style={{ background: "var(--brand)" }}
          >
            ◎
          </span>
          Surco
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/tienda">{t("catalog")}</Link>
          <Link href="/tienda?cat=indie-rock">{t("indieRock")}</Link>
          <Link href="/tienda?cat=electronica">{t("electronica")}</Link>
          <Link href="/tienda?cat=soul-jazz">{t("soulJazz")}</Link>
          <Link href="/contacto">{t("contact")}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-semibold" role="group" aria-label="Language">
            <button
              type="button"
              onClick={() => cambiarIdioma("es")}
              className="btn btn-secondary px-2 py-1"
              style={locale === "es" ? { background: "var(--brand)", color: "white" } : undefined}
              aria-current={locale === "es"}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => cambiarIdioma("en")}
              className="btn btn-secondary px-2 py-1"
              style={locale === "en" ? { background: "var(--brand)", color: "white" } : undefined}
              aria-current={locale === "en"}
            >
              EN
            </button>
          </div>
          <Link href="/carrito" className="btn btn-secondary relative">
            🛒 {t("cart")}
            {listo && cantidadTotal > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: "var(--brand)" }}
              >
                {cantidadTotal}
              </span>
            )}
          </Link>
          {usuario ? (
            <Link href="/cuenta" className="btn btn-primary">
              {t("myAccount")}
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary">
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
