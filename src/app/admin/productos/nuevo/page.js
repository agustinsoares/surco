import { getCategorias } from "@/lib/data";
import { crearProducto } from "@/lib/actions/admin";
import ProductoForm from "@/components/ProductoForm";

export default async function NuevoProductoPage() {
  const categorias = await getCategorias();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Nuevo disco</h1>
      <ProductoForm accion={crearProducto} categorias={categorias} />
    </div>
  );
}
