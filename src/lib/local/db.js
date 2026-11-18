import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import seed from "./seed.json";
import { hashPassword } from "./password";

// ---------------------------------------------------------------------------
// Base de datos local (reemplaza a Supabase)
// ---------------------------------------------------------------------------
// Toda la información vive en un único archivo JSON con la misma forma que
// las tablas de supabase/schema.sql (estados, categorias, productos,
// perfiles, pedidos, detalle, contacto) más `usuarios`, que reemplaza a
// auth.users (email + hash de la contraseña).
//
// Ubicación del archivo:
//   - LOCAL_DB_PATH si está definida.
//   - En Vercel: /tmp/surco-db.json (el único directorio escribible; se
//     pierde cuando la instancia se recicla y vuelve a arrancar del seed).
//   - En cualquier otro caso: .data/db.json dentro del proyecto (ignorado
//     por git). Borrarlo resetea la tienda al catálogo inicial.
// Si el archivo no existe, se crea a partir de src/lib/local/seed.json.

const DB_PATH =
  process.env.LOCAL_DB_PATH ||
  (process.env.VERCEL ? "/tmp/surco-db.json" : path.join(process.cwd(), ".data", "db.json"));

let cache = null;
// Cola de escrituras: serializa las mutaciones dentro del proceso para que
// dos requests simultáneas no se pisen (equivale al SELECT ... FOR UPDATE
// de las RPC de Postgres).
let cola = Promise.resolve();

function cargarDesdeDisco() {
  if (existsSync(DB_PATH)) {
    return JSON.parse(readFileSync(DB_PATH, "utf8"));
  }
  const inicial = structuredClone(seed);
  sembrarAdmin(inicial);
  guardarEnDisco(inicial);
  return inicial;
}

function guardarEnDisco(db) {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(db, null, 2));
  renameSync(tmp, DB_PATH);
}

// Si están definidas ADMIN_EMAIL y ADMIN_PASSWORD, la base nueva arranca con
// esa cuenta de administrador (reemplaza el "update perfiles set admin =
// true" que había que correr a mano en Supabase).
function sembrarAdmin(db) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const id = crypto.randomUUID();
  const ahora = new Date().toISOString();
  db.usuarios.push({ id, email, password_hash: hashPassword(password), creado_en: ahora });
  db.perfiles.push({
    id,
    usuario: email.split("@")[0],
    nombre: "Admin",
    apellidos: "",
    domicilio: "",
    poblacion: "",
    provincia: "",
    cp: "",
    telefono: "",
    admin: true,
    activo: true,
    creado_en: ahora,
  });
}

// Lectura: devuelve una copia para que nadie modifique la cache por error.
export async function leerDb() {
  await cola;
  if (!cache) cache = cargarDesdeDisco();
  return structuredClone(cache);
}

// Escritura: `fn` recibe la base (mutable) y puede devolver un valor. Si
// lanza un error no se guarda nada (transacción "todo o nada").
export function modificarDb(fn) {
  const tarea = cola.then(() => {
    if (!cache) cache = cargarDesdeDisco();
    const borrador = structuredClone(cache);
    const resultado = fn(borrador);
    guardarEnDisco(borrador);
    cache = borrador;
    return resultado;
  });
  cola = tarea.catch(() => {});
  return tarea;
}

export function siguienteId(filas) {
  return filas.reduce((max, f) => Math.max(max, f.id), 0) + 1;
}
