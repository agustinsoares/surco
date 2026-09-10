import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getPedidosDeUsuario, getUsuarioActual } from "@/lib/data";
import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";
import OrderList from "@/components/OrderList";
import { cerrarSesion } from "@/lib/actions/auth";

export default async function CuentaPage({ searchParams }) {
  const t = await getTranslations("Account");
  const usuario = await getUsuarioActual();
  if (!usuario) redirect({ href: "/login?next=/cuenta", locale: await getLocale() });

  const params = await searchParams;
  const sinPermiso = params?.sinpermiso === "1";
  const pedidos = await getPedidosDeUsuario(usuario.auth.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{t("title")}</h1>
        <div className="flex items-center gap-2">
          {usuario.perfil?.admin && (
            <Link href="/admin/productos" className="btn btn-primary">
              {t("adminAccess")}
            </Link>
          )}
          <form action={cerrarSesion}>
            <button type="submit" className="btn btn-secondary">
              {t("logout")}
            </button>
          </form>
        </div>
      </div>

      {sinPermiso && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{t("noAdminPermission")}</p>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">{t("myData")}</h2>
        <ProfileForm perfil={usuario.perfil} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">{t("changePassword")}</h2>
        <PasswordForm />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">{t("myOrders")}</h2>
        <OrderList pedidos={pedidos} />
      </section>
    </div>
  );
}
