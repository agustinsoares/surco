import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTodosLosProductosAdmin } from "@/lib/data";
import { formatoPrecio } from "@/lib/format";
import { borrarProducto } from "@/lib/actions/admin";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminProductosPage() {
  const productos = await getTodosLosProductosAdmin();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn btn-primary">
          + Nuevo disco
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {productos.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center gap-4 p-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
              <Image src={p.imagen} alt={p.nombre} fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="font-semibold">{p.nombre}</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {p.autor} · {p.categorias?.descripcion}
              </p>
            </div>
            <p className="w-20 font-bold">{formatoPrecio(p.precio)}</p>
            <p className="w-24 text-sm" style={{ color: "var(--muted)" }}>
              Stock: {p.existencias}
            </p>
            <div className="flex items-center gap-2">
              <Link href={`/admin/productos/${p.id}`} className="btn btn-secondary text-xs">
                Editar
              </Link>
              {p.tiene_detalles ? (
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  Con pedidos
                </span>
              ) : (
                <DeleteButton accion={borrarProducto.bind(null, p.id)} confirmMessage={`¿Borrar "${p.nombre}"?`} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
