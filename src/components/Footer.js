import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-16 border-t py-10 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} Surco. {t("rights")}
        </p>
        <div className="flex gap-5">
          <Link href="/tienda">{t("catalog")}</Link>
          <Link href="/contacto">{t("contact")}</Link>
          <Link href="/admin-demo">{t("adminPanel")}</Link>
        </div>
      </div>
    </footer>
  );
}
