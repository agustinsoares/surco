import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUsuarioActual } from "@/lib/data";

export const metadata = {
  title: "Surco — Vinilos de artistas independientes",
  description:
    "Tienda online de vinilos de artistas y bandas independientes. Catálogo, cuenta de usuario y panel de administración.",
};

export default async function RootLayout({ children }) {
  const usuario = await getUsuarioActual().catch(() => null);

  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <CartProvider>
          <Header usuario={usuario} />
          <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-8">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
