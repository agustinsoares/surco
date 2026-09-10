import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUsuarioActual } from "@/lib/data";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const t = await getTranslations("Checkout");
  const usuario = await getUsuarioActual();
  const locale = await getLocale();
  if (!usuario) redirect({ href: "/login?next=/checkout", locale });
  if (usuario.perfil && usuario.perfil.activo === false) {
    redirect({ href: "/login?next=/checkout&desactivado=1", locale });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-black">{t("title")}</h1>
      <CheckoutForm perfil={usuario.perfil} />
    </div>
  );
}
