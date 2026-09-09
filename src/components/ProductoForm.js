"use client";

import { useActionState } from "react";

const estadoInicial = { error: null };

export default function ProductoForm({ accion, categorias, producto }) {
  const [state, formAction, pending] = useActionState(accion, estadoInicial);

  return (
    <form action={formAction} className="card grid gap-3 p-5 sm:grid-cols-2">
      <Campo label="Nombre del álbum" name="nombre" defaultValue={producto?.nombre} />
      <Campo label="Artista" name="autor" defaultValue={producto?.autor} />
      <div className="sm:col-span-2">
        <label className="label" htmlFor="descripcion">
          Descripción
        </label>
        <textarea className="input" id="descripcion" name="descripcion" rows={3} defaultValue={producto?.descripcion} />
      </div>
      <Campo label="Precio (€)" name="precio" type="number" step="0.01" min="0.01" defaultValue={producto?.precio} />
      <Campo label="Existencias" name="existencias" type="number" min="0" step="1" defaultValue={producto?.existencias} />
      <Campo label="URL de imagen" name="imagen" defaultValue={producto?.imagen} className="sm:col-span-2" />
      <div>
        <label className="label" htmlFor="categoria_id">
          Categoría
        </label>
        <select className="input" id="categoria_id" name="categoria_id" defaultValue={producto?.categoria_id}>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descripcion}
            </option>
          ))}
        </select>
      </div>

      {state?.error && <p className="sm:col-span-2 text-sm font-semibold" style={{ color: "#b3261e" }}>{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2 justify-self-start">
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

function Campo({ label, name, defaultValue, className = "", ...rest }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input className="input" id={name} name={name} defaultValue={defaultValue} required {...rest} />
    </div>
  );
}
