import { getTranslations } from "next-intl/server";
import { getCategorias, getProductos } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default async function TiendaPage({ searchParams }) {
  const t = await getTranslations("Shop");
  const params = await searchParams;
  const q = params?.q?.toString() || "";
  const categoria = params?.cat?.toString() || "";

  const [productos, categorias] = await Promise.all([
    getProductos({ q, categoria }),
    getCategorias(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">{t("title")}</h1>

      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end" action="/tienda">
        <div className="flex-1">
          <label className="label" htmlFor="q">
            {t("searchLabel")}
          </label>
          <input className="input" type="search" id="q" name="q" defaultValue={q} placeholder={t("searchPlaceholder")} />
        </div>
        <div>
          <label className="label" htmlFor="cat">
            {t("categoryLabel")}
          </label>
          <select className="input" id="cat" name="cat" defaultValue={categoria}>
            <option value="">{t("allCategories")}</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.descripcion}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">
          {t("filter")}
        </button>
      </form>

      {productos.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
