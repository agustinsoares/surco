// Los datos de catálogo (productos, categorías) viven en español en la base.
// Algunos campos —por ahora, la descripción de cada disco— tienen columnas
// traducidas (descripcion_en, descripcion_nb). Esto resuelve cuál usar según
// el locale activo, con fallback al español si falta la traducción.
export function descripcionLocalizada(producto, locale) {
  if (!producto) return "";
  if (locale === "en" && producto.descripcion_en) return producto.descripcion_en;
  if (locale === "nb" && producto.descripcion_nb) return producto.descripcion_nb;
  return producto.descripcion;
}
