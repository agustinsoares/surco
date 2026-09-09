export function formatoPrecio(valor) {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numero ?? 0);
}

export function formatoFecha(valor) {
  if (!valor) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(valor));
}

export function numeroPedido(id) {
  return `SRC-${new Date().getFullYear()}-${String(id).padStart(5, "0")}`;
}
