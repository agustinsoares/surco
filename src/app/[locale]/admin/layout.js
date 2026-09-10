import { getLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getUsuarioActual } from "@/lib/data";
import { cerrarSesion } from "@/lib/actions/auth";

export default async function AdminLayout({ children }) {
  const usuario = await getUsuarioActual();
  const locale = await getLocale();
  if (!usuario) redirect({ href: "/login?next=/admin/productos", locale });
  if (!usuario.perfil?.admin) redirect({ href: "/cuenta?sinpermiso=1", locale });

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="card h-fit p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          Panel admin
        </p>
        <nav className="flex flex-col gap-1 text-sm font-medium">
          <Link href="/admin/productos">Productos</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
          <Link href="/admin/usuarios">Usuarios</Link>
          <Link href="/admin/contactos">Contactos</Link>
        </nav>
        <form action={cerrarSesion} className="mt-6">
          <button type="submit" className="btn btn-secondary w-full text-xs">
            Cerrar sesión
          </button>
        </form>
      </aside>
      <div>{children}</div>
    </div>
  );
}
