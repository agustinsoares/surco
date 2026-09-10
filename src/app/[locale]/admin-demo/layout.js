import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Vista pública de demostración del panel admin: mismo look & feel que el
// panel real (src/app/[locale]/admin/), pero sin autenticación y sin ninguna
// acción que escriba en la base. Pedidos, usuarios y contactos usan datos de
// ejemplo fijos (no son personas reales); productos sí lee el catálogo real
// porque no es información sensible. A diferencia del panel real (que queda
// en español, es una herramienta interna), esta demo sí traduce, porque está
// pensada para cualquier visitante del portfolio.
export default async function AdminDemoLayout({ children }) {
  const t = await getTranslations("AdminDemo");

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-3 text-sm" style={{ background: "#fff7e6", borderColor: "#f0d9a8" }}>
        <strong>{t("banner")}</strong>{" "}
        <Link href="/login" className="font-semibold" style={{ color: "var(--brand)" }}>
          {t("login")}
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <aside className="card h-fit p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            {t("sidebarTitle")}
          </p>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link href="/admin-demo/productos">{t("navProductos")}</Link>
            <Link href="/admin-demo/pedidos">{t("navPedidos")}</Link>
            <Link href="/admin-demo/usuarios">{t("navUsuarios")}</Link>
            <Link href="/admin-demo/contactos">{t("navContactos")}</Link>
          </nav>
          <Link href="/" className="btn btn-secondary mt-6 w-full text-center text-xs">
            {t("backToSite")}
          </Link>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
