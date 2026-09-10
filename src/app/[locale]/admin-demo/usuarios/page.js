// Datos de ejemplo fijos (ver nota en pedidos/page.js): nunca se leen
// usuarios reales en la demo pública.
const USUARIOS_DEMO = [
  { usuario: "martal", nombre: "Marta", apellidos: "López", telefono: "600111222", admin: false, activo: true, num_pedidos: 3 },
  { usuario: "jonvik", nombre: "Jon", apellidos: "Vik", telefono: "912345678", admin: false, activo: true, num_pedidos: 1 },
  { usuario: "sreyes", nombre: "Sofía", apellidos: "Reyes", telefono: "699887766", admin: true, activo: true, num_pedidos: 5 },
  { usuario: "erikaas", nombre: "Erik", apellidos: "Aas", telefono: "934567890", admin: false, activo: false, num_pedidos: 0 },
];

export default function AdminDemoUsuariosPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Usuarios</h1>
      <div className="flex flex-col gap-2">
        {USUARIOS_DEMO.map((u) => (
          <div key={u.usuario} className="card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[160px] flex-1">
                <p className="font-semibold">
                  @{u.usuario}{" "}
                  {u.admin && (
                    <span className="badge ml-1" style={{ background: "var(--brand)", color: "white" }}>
                      admin
                    </span>
                  )}
                </p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {u.nombre} {u.apellidos} · {u.telefono}
                </p>
              </div>
              <span
                className="badge"
                style={{
                  background: u.activo ? "#dcf5e3" : "#fbe4e2",
                  color: u.activo ? "#1c6b34" : "#8f2c22",
                }}
              >
                {u.activo ? "Activo" : "Inactivo"}
              </span>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {u.num_pedidos} pedido(s)
              </p>
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary text-xs" disabled title="Deshabilitado en la demo">
                  Editar
                </button>
                <button type="button" className="btn btn-secondary text-xs" disabled title="Deshabilitado en la demo">
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
                {u.num_pedidos === 0 && (
                  <button type="button" className="btn btn-danger text-xs" disabled title="Deshabilitado en la demo">
                    Borrar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
