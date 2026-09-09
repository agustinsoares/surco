import { notFound } from "next/navigation";
import { getCategorias, getProducto } from "@/lib/data";
import { actualizarProducto } from "@/lib/actions/admin";
import ProductoForm from "@/components/ProductoForm";

export default async function EditarProductoPage({ params }) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([getProducto(id), getCategorias()]);
  if (!producto) notFound();

  const accion = actualizarProducto.bind(null, Number(id));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Editar disco</h1>
      <ProductoForm accion={accion} categorias={categorias} producto={producto} />
    </div>
  );
}
