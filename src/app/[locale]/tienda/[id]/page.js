import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProducto } from "@/lib/data";
import { formatoPrecio } from "@/lib/format";
import { descripcionLocalizada } from "@/lib/content";
import AddToCartForm from "@/components/AddToCartForm";

export default async function ProductoPage({ params }) {
  const { id, locale } = await params;
  const t = await getTranslations("Product");
  const producto = await getProducto(id);
  if (!producto) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="card relative aspect-square overflow-hidden">
        <Image src={producto.imagen} alt={producto.nombre} fill sizes="50vw" className="object-cover" />
      </div>
      <div>
        <span className="badge" style={{ background: "var(--border)", color: "var(--muted)" }}>
          {producto.categorias?.descripcion}
        </span>
        <h1 className="mt-3 text-3xl font-black">{producto.nombre}</h1>
        <p className="mt-1 text-lg" style={{ color: "var(--muted)" }}>
          {producto.autor}
        </p>
        <p className="mt-4 leading-relaxed">{descripcionLocalizada(producto, locale)}</p>
        <p className="mt-6 text-2xl font-bold">{formatoPrecio(producto.precio)}</p>
        <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
          {producto.existencias > 0 ? t("inStock", { count: producto.existencias }) : t("noStock")}
        </p>
        <AddToCartForm producto={producto} />
      </div>
    </div>
  );
}
