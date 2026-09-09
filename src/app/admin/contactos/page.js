import { getTodosLosContactos } from "@/lib/data";
import { formatoFecha } from "@/lib/format";

export default async function AdminContactosPage() {
  const contactos = await getTodosLosContactos();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Mensajes de contacto</h1>
      <div className="flex flex-col gap-2">
        {contactos.length === 0 && <p style={{ color: "var(--muted)" }}>No hay mensajes.</p>}
        {contactos.map((c) => (
          <div key={c.id} className="card p-4">
            <p className="text-sm font-semibold">
              {c.perfiles ? `${c.perfiles.nombre} ${c.perfiles.apellidos} (@${c.perfiles.usuario})` : "Usuario eliminado"}
            </p>
            <p className="mb-2 text-xs" style={{ color: "var(--muted)" }}>
              {formatoFecha(c.creado_en)}
            </p>
            <p>{c.mensaje}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
