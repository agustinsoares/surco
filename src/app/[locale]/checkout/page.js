import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUsuarioActual } from "@/lib/data";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const t = await getTranslations("Checkout");
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login?next=/checkout");
  if (usuario.perfil && usuario.perfil.activo === false) {
    redirect("/login?next=/checkout&desactivado=1");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-black">{t("title")}</h1>
      <CheckoutForm perfil={usuario.perfil} />
    </div>
  );
}
