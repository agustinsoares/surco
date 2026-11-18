import { modificarDb, siguienteId } from "./db";

// ---------------------------------------------------------------------------
// Reemplazos de las funciones RPC de Postgres (supabase/schema.sql §3-§5).
// Cada una corre dentro de modificarDb(), así que es atómica: si lanza un
// error no se guarda ningún cambio.
// ---------------------------------------------------------------------------

const idEstado = (db, descripcion) => db.estados.find((e) => e.descripcion === descripcion).id;
const redondear = (n) => Math.round(n * 100) / 100;

// crear_pedido(items, direccion): descuenta stock y devuelve el id del pedido.
export function crearPedido(usuarioId, items, direccion) {
  return modificarDb((db) => {
    if (!usuarioId) throw new Error("Debés iniciar sesión para completar un pedido");

    // Agrupar por producto (en Postgres un duplicado violaba la PK de detalle).
    const unidadesPorProducto = new Map();
    for (const { producto_id, unidades } of items) {
      unidadesPorProducto.set(producto_id, (unidadesPorProducto.get(producto_id) ?? 0) + unidades);
    }

    const lineas = [];
    let total = 0;
    for (const [productoId, unidades] of unidadesPorProducto) {
      const producto = db.productos.find((p) => p.id === productoId);
      if (!producto) continue; // producto inexistente, se ignora
      const cantidad = Math.min(unidades, producto.existencias);
      if (!(cantidad > 0)) continue;
      lineas.push({ producto, cantidad });
      total += producto.precio * cantidad;
    }

    if (lineas.length === 0) throw new Error("No hay stock disponible para los productos del carrito");

    const pedidoId = siguienteId(db.pedidos);
    db.pedidos.push({
      id: pedidoId,
      usuario_id: usuarioId,
      fecha: new Date().toISOString(),
      importe: redondear(total),
      estado_id: idEstado(db, "Pendiente"),
      direccion_envio: direccion,
    });
    for (const { producto, cantidad } of lineas) {
      db.detalle.push({
        pedido_id: pedidoId,
        producto_id: producto.id,
        unidades: cantidad,
        precio_unitario: producto.precio,
      });
      producto.existencias -= cantidad;
    }
    return pedidoId;
  });
}

function reponerStock(db, pedidoId, signo) {
  for (const d of db.detalle.filter((l) => l.pedido_id === pedidoId)) {
    const producto = db.productos.find((p) => p.id === d.producto_id);
    if (producto) producto.existencias += signo * d.unidades;
  }
}

// cancelar_pedido(p_pedido_id): solo el dueño o un admin, y solo si está Pendiente.
export function cancelarPedido(usuarioId, pedidoId) {
  return modificarDb((db) => {
    const pedido = db.pedidos.find((p) => p.id === pedidoId);
    if (!pedido) throw new Error("Pedido no encontrado");
    const esAdmin = !!db.perfiles.find((p) => p.id === usuarioId)?.admin;
    if (pedido.usuario_id !== usuarioId && !esAdmin) {
      throw new Error("No tenés permiso para cancelar este pedido");
    }
    if (pedido.estado_id !== idEstado(db, "Pendiente")) {
      throw new Error("Solo se pueden cancelar pedidos en estado Pendiente");
    }
    pedido.estado_id = idEstado(db, "Cancelado");
    reponerStock(db, pedidoId, +1);
  });
}

// admin_actualizar_estado_pedido(p_pedido_id, p_nuevo_estado_id): al cancelar
// se repone stock; al reactivar desde Cancelado se vuelve a descontar si hay
// stock suficiente.
export function adminActualizarEstadoPedido(usuarioId, pedidoId, nuevoEstadoId) {
  return modificarDb((db) => {
    if (!db.perfiles.find((p) => p.id === usuarioId)?.admin) {
      throw new Error("Solo un administrador puede cambiar el estado de un pedido");
    }
    const pedido = db.pedidos.find((p) => p.id === pedidoId);
    if (!pedido) throw new Error("Pedido no encontrado");
    if (!db.estados.some((e) => e.id === nuevoEstadoId)) throw new Error("Estado inválido");
    const actual = pedido.estado_id;
    if (actual === nuevoEstadoId) return;

    const cancelado = idEstado(db, "Cancelado");

    if (actual === cancelado && nuevoEstadoId !== cancelado) {
      for (const d of db.detalle.filter((l) => l.pedido_id === pedidoId)) {
        const producto = db.productos.find((p) => p.id === d.producto_id);
        if (producto && producto.existencias < d.unidades) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}": disponible ${producto.existencias}, necesario ${d.unidades}`
          );
        }
      }
      reponerStock(db, pedidoId, -1);
    }

    if (nuevoEstadoId === cancelado && actual !== cancelado) {
      reponerStock(db, pedidoId, +1);
    }

    pedido.estado_id = nuevoEstadoId;
  });
}
