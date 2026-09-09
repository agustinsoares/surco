"use client";

import { useActionState, useState, useTransition } from "react";
import { actualizarUsuarioAdmin, borrarUsuario, toggleActivoUsuario } from "@/lib/actions/admin";
import DeleteButton from "./DeleteButton";

export default function UsuarioRow({ usuario }) {
  const [editando, setEditando] = useState(false);
  const accion = actualizarUsuarioAdmin.bind(null, usuario.id);
  const [state, formAction, pending] = useActionState(accion, { error: null, success: null });
  const [pendingToggle, startTransition] = useTransition();

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[160px] flex-1">
          <p className="font-semibold">
            @{usuario.usuario} {usuario.admin && <span className="badge ml-1" style={{ background: "var(--brand)", color: "white" }}>admin</span>}
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {usuario.nombre} {usuario.apellidos} · {usuario.telefono}
          </p>
        </div>
        <span className="badge" style={{ background: usuario.activo ? "#dcf5e3" : "#fbe4e2", color: usuario.activo ? "#1c6b34" : "#8f2c22" }}>
          {usuario.activo ? "Activo" : "Inactivo"}
        </span>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {usuario.num_pedidos} pedido(s)
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary text-xs" onClick={() => setEditando((v) => !v)}>
            {editando ? "Cerrar" : "Editar"}
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            disabled={pendingToggle}
            onClick={() => startTransition(() => toggleActivoUsuario(usuario.id, usuario.activo))}
          >
            {usuario.activo ? "Desactivar" : "Activar"}
          </button>
          {usuario.num_pedidos === 0 && (
            <DeleteButton accion={borrarUsuario.bind(null, usuario.id)} confirmMessage={`¿Borrar a @${usuario.usuario}?`} />
          )}
        </div>
      </div>

      {editando && (
        <form action={formAction} className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2" style={{ borderColor: "var(--border)" }}>
          <div>
            <label className="label">Nombre</label>
            <input className="input" name="nombre" defaultValue={usuario.nombre} required />
          </div>
          <div>
            <label className="label">Apellidos</label>
            <input className="input" name="apellidos" defaultValue={usuario.apellidos} required />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" name="telefono" defaultValue={usuario.telefono} required />
          </div>
          <label className="flex items-center gap-2 self-end text-sm">
            <input type="checkbox" name="admin" defaultChecked={usuario.admin} /> Es administrador
          </label>
          {state?.error && <p className="sm:col-span-2 text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}
          {state?.success && <p className="sm:col-span-2 text-sm font-semibold text-green-700">{state.success}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2 justify-self-start">
            {pending ? "Guardando…" : "Guardar"}
          </button>
        </form>
      )}
    </div>
  );
}
