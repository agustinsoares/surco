import { getTodosLosUsuarios } from "@/lib/data";
import UsuarioRow from "@/components/UsuarioRow";

export default async function AdminUsuariosPage() {
  const usuarios = await getTodosLosUsuarios();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Usuarios</h1>
      <div className="flex flex-col gap-2">
        {usuarios.map((u) => (
          <UsuarioRow key={u.id} usuario={u} />
        ))}
      </div>
    </div>
  );
}
