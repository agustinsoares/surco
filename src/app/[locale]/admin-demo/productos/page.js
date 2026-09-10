import Image from "next/image";
import { getTodosLosProductosAdmin } from "@/lib/data";
import { formatoPrecio } from "@/lib/format";

// Productos sí es catálogo real (no es información sensible), pero acá se
// muestra en modo lectura: sin link de edición funcional y sin borrar.
export default async function AdminDemoProductosPage() {
  const productos = await getTodosLosProductosAdmin();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Productos</h1>
        <button type="button" className="btn btn-primary" disabled title="Deshabilitado en la demo">
          + Nuevo disco
        </button>
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
              <button type="button" className="btn btn-secondary text-xs" disabled title="Deshabilitado en la demo">
                Editar
              </button>
              <button type="button" className="btn btn-danger text-xs" disabled title="Deshabilitado en la demo">
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
