import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getUsuarioActual } from "@/lib/data";
import ContactoForm from "@/components/ContactoForm";

export default async function ContactoPage() {
  const t = await getTranslations("Contact");
  const usuario = await getUsuarioActual();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-3xl font-black">{t("title")}</h1>
      {usuario ? (
        <ContactoForm nombre={`${usuario.perfil?.nombre ?? ""} ${usuario.perfil?.apellidos ?? ""}`.trim()} usuario={usuario.perfil?.usuario} />
      ) : (
        <p className="card p-5">
          {t("loginPrompt")}{" "}
          <Link href="/login?next=/contacto" className="font-semibold" style={{ color: "var(--brand)" }}>
            {t("login")}
          </Link>
        </p>
      )}
    </div>
  );
}
