import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Hash de contraseñas con scrypt (sal aleatoria por usuario). Reemplaza al
// bcrypt que usaba Supabase Auth. Formato guardado: "scrypt$<sal>$<hash>".
export function hashPassword(password) {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(password, sal, 64).toString("hex");
  return `scrypt$${sal}$${hash}`;
}

export function verificarPassword(password, guardado) {
  const [algoritmo, sal, hash] = (guardado || "").split("$");
  if (algoritmo !== "scrypt" || !sal || !hash) return false;
  const esperado = Buffer.from(hash, "hex");
  const calculado = scryptSync(password, sal, esperado.length);
  return timingSafeEqual(esperado, calculado);
}
