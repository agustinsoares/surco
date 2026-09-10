import { Link } from "@/i18n/navigation";

// Vista pública de demostración del panel admin: mismo look & feel que el
// panel real (src/app/[locale]/admin/), pero sin autenticación y sin ninguna
// acción que escriba en la base. Pedidos, usuarios y contactos usan datos de
// ejemplo fijos (no son personas reales); productos sí lee el catálogo real
// porque no es información sensible.
export default function AdminDemoLayout({ children }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="card p-3 text-sm" style={{ background: "#fff7e6", borderColor: "#f0d9a8" }}>
        <strong>Vista de demostración.</strong> Así se ve el panel de administración. Los
        datos de pedidos, usuarios y contactos son de ejemplo y ningún botón guarda
        cambios reales.{" "}
        <Link href="/login" className="font-semibold" style={{ color: "var(--brand)" }}>
          Iniciar sesión
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <aside className="card h-fit p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Panel admin (demo)
          </p>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link href="/admin-demo/productos">Productos</Link>
            <Link href="/admin-demo/pedidos">Pedidos</Link>
            <Link href="/admin-demo/usuarios">Usuarios</Link>
            <Link href="/admin-demo/contactos">Contactos</Link>
          </nav>
          <Link href="/" className="btn btn-secondary mt-6 w-full text-center text-xs">
            Volver al sitio
          </Link>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
