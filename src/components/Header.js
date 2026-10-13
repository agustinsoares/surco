"use client";

import { useEffect, useRef, useState } from "react";
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

  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef(null);
  const actual = idiomas.find((i) => i.codigo === locale) ?? idiomas[0];

  useEffect(() => {
    if (!abierto) return;
    function cerrarFuera(event) {
      if (!menuRef.current?.contains(event.target)) setAbierto(false);
    }
    function cerrarConEscape(event) {
      if (event.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", cerrarFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("mousedown", cerrarFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierto]);

  function cambiarIdioma(codigo) {
    setAbierto(false);
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
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="input flex items-center gap-2 px-2 py-1"
              style={{ width: "auto" }}
              aria-haspopup="listbox"
              aria-expanded={abierto}
              aria-label={`Idioma: ${actual.etiqueta}`}
              title={actual.etiqueta}
              onClick={() => setAbierto((v) => !v)}
            >
              <Flag codigo={actual.codigo} className="block h-4 w-6 rounded-sm" />
              <span aria-hidden className="text-[10px]">▾</span>
            </button>
            {abierto && (
              <ul
                role="listbox"
                aria-label="Idioma"
                className="card absolute right-0 z-50 mt-1 flex flex-col gap-1 p-1"
              >
                {idiomas.map((i) => (
                  <li key={i.codigo} role="option" aria-selected={i.codigo === locale}>
                    <button
                      type="button"
                      title={i.etiqueta}
                      aria-label={i.etiqueta}
                      onClick={() => cambiarIdioma(i.codigo)}
                      className="flex w-full items-center justify-center rounded px-2 py-1"
                      style={{
                        background: i.codigo === locale ? "var(--border)" : "transparent",
                      }}
                    >
                      <Flag codigo={i.codigo} className="block h-4 w-6 rounded-sm" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
