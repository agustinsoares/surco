"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "./CartContext";
import Flag from "./Flags";

export default function Header({ usuario }) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { cantidadTotal, listo } = useCart();

  const idiomas = [
    { codigo: "es", etiqueta: "Español" },
    { codigo: "en", etiqueta: "English" },
    { codigo: "nb", etiqueta: "Norsk bokmål" },
  ];

  function cambiarIdioma(codigo) {
    router.replace(pathname, { locale: codigo });
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
          <div className="flex items-center gap-1" role="group" aria-label="Idioma">
            {idiomas.map((i) => (
              <button
                key={i.codigo}
                type="button"
                title={i.etiqueta}
                aria-label={i.etiqueta}
                aria-pressed={i.codigo === locale}
                onClick={() => cambiarIdioma(i.codigo)}
                className="overflow-hidden rounded-sm border"
                style={{
                  borderColor: i.codigo === locale ? "var(--brand)" : "var(--border)",
                  opacity: i.codigo === locale ? 1 : 0.55,
                  outline: i.codigo === locale ? "2px solid var(--brand)" : "none",
                  outlineOffset: 1,
                }}
              >
                <Flag codigo={i.codigo} className="block h-5 w-[30px]" />
              </button>
            ))}
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
