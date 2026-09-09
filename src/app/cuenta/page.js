import { redirect } from "next/navigation";
import { getPedidosDeUsuario, getUsuarioActual } from "@/lib/data";
import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";
import OrderList from "@/components/OrderList";
import { cerrarSesion } from "@/lib/actions/auth";

export default async function CuentaPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login?next=/cuenta");

  const pedidos = await getPedidosDeUsuario(usuario.auth.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Mi cuenta</h1>
        <form action={cerrarSesion}>
          <button type="submit" className="btn btn-secondary">
            Cerrar sesión
          </button>
        </form>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">Mis datos</h2>
        <ProfileForm perfil={usuario.perfil} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Cambiar contraseña</h2>
        <PasswordForm />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Mis pedidos</h2>
        <OrderList pedidos={pedidos} />
      </section>
    </div>
  );
}
