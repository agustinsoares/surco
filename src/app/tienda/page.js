import { getCategorias, getProductos } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default async function TiendaPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q?.toString() || "";
  const categoria = params?.cat?.toString() || "";

  const [productos, categorias] = await Promise.all([
    getProductos({ q, categoria }),
    getCategorias(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">Catálogo</h1>

      <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end" action="/tienda">
        <div className="flex-1">
          <label className="label" htmlFor="q">
            Buscar por nombre
          </label>
          <input className="input" type="search" id="q" name="q" defaultValue={q} placeholder="Ej. Marea" />
        </div>
        <div>
          <label className="label" htmlFor="cat">
            Categoría
          </label>
          <select className="input" id="cat" name="cat" defaultValue={categoria}>
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.descripcion}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">
          Filtrar
        </button>
      </form>

      {productos.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No encontramos discos con ese criterio.</p>
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
