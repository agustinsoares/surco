"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function Header({ usuario }) {
  const { cantidadTotal, listo } = useCart();

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
          <Link href="/tienda">Catálogo</Link>
          <Link href="/tienda?cat=indie-rock">Indie Rock</Link>
          <Link href="/tienda?cat=electronica">Electrónica</Link>
          <Link href="/tienda?cat=soul-jazz">Soul &amp; Jazz</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/carrito" className="btn btn-secondary relative">
            🛒 Carrito
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
              Mi cuenta
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
