import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProductos } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const productos = await getProductos();
  const destacados = productos.slice(0, 4);

  return (
    <div className="flex flex-col gap-16">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <span className="badge" style={{ background: "var(--brand)", color: "white" }}>
            {t("badge")}
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
            {t("subtitle")}
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/tienda" className="btn btn-primary">
              {t("viewCatalog")}
            </Link>
            <Link href="/contacto" className="btn btn-secondary">
              {t("contactUs")}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {destacados.map((p) => (
            <div key={p.id} className="card relative aspect-square overflow-hidden">
              <Image src={p.imagen} alt={p.nombre} fill sizes="25vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("newArrivals")}</h2>
          <Link href="/tienda" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productos.slice(0, 8).map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
