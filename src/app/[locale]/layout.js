import "../globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUsuarioActual } from "@/lib/data";

export const metadata = {
  title: "Surco — Vinilos de artistas independientes",
  description:
    "Tienda online de vinilos de artistas y bandas independientes. Catálogo, cuenta de usuario y panel de administración.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const usuario = await getUsuarioActual().catch(() => null);

  return (
    <html lang={locale}>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider locale={locale}>
          <CartProvider>
            <Header usuario={usuario} />
            <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-8">{children}</main>
            <Footer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
