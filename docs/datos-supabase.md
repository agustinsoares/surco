# Datos que usaba Supabase y cómo se manejan ahora en local

El proyecto de Supabase del plan gratuito se pausaba/cancelaba por
inactividad, así que la app pasó a guardar todo en una **base local en un
archivo JSON**. El código que hablaba con Supabase **no se borró**: quedó
comentado al final de cada archivo (ver "Cómo volver a Supabase").

## 1. Tablas

| Tabla (Supabase) | Columnas | Para qué se usa | Dónde se lee / escribe |
|---|---|---|---|
| `estados` | `id`, `descripcion` | Estados de pedido: Pendiente, Enviado, Entregado, Cancelado | `getEstados()` (selector de estado en admin), lógica de pedidos |
| `categorias` | `id`, `slug`, `descripcion` | Indie Rock, Electrónica, Soul & Jazz | `getCategorias()`, filtro del catálogo, formulario de producto |
| `productos` | `id`, `nombre`, `autor`, `descripcion`, `descripcion_en`, `descripcion_nb`, `precio`, `existencias`, `imagen`, `categoria_id`, `creado_en` | Catálogo de 20 vinilos (con traducciones en/nb) | `getProductos()`, `getProducto()`, `getTodosLosProductosAdmin()`; alta/edición/borrado en `actions/admin.js`; stock en pedidos |
| `perfiles` | `id`, `usuario`, `nombre`, `apellidos`, `domicilio`, `poblacion`, `provincia`, `cp`, `telefono`, `admin`, `activo`, `creado_en` | Datos de cada cliente (1:1 con la cuenta) | `getUsuarioActual()`, `getTodosLosUsuarios()`, `esAdmin()`; `actualizarPerfil`, `actualizarUsuarioAdmin`, `toggleActivoUsuario` |
| `pedidos` | `id`, `usuario_id`, `fecha`, `importe`, `estado_id`, `direccion_envio` (JSON) | Cabecera de cada pedido | `getPedidosDeUsuario()`, `getPedidoConDetalle()`, `getTodosLosPedidos()`; `crearPedido`, `cancelarPedido`, `cambiarEstadoPedido`, `borrarPedido` |
| `detalle` | `pedido_id`, `producto_id`, `unidades`, `precio_unitario` | Líneas de cada pedido | `getPedidoConDetalle()`, `getTodosLosProductosAdmin()` (saber si un producto tiene pedidos) |
| `contacto` | `id`, `usuario_id`, `mensaje`, `creado_en` | Mensajes del formulario de contacto | `enviarContacto`, `getTodosLosContactos()` |

## 2. Supabase Auth (`auth.users`)

| Dato | Uso | Reemplazo local |
|---|---|---|
| `email` + contraseña (bcrypt) | Login, registro, cambio de contraseña | Colección `usuarios` (`id`, `email`, `password_hash` con scrypt, `creado_en`) |
| Sesión en cookies (`@supabase/ssr`) | Saber quién está logueado en cada request | Cookie `surco_session` firmada con HMAC (`AUTH_SECRET`) |
| `raw_user_meta_data` + trigger `handle_new_user` | Crear el perfil al registrarse | `signUp()` crea usuario y perfil a la vez |
| `auth.admin.deleteUser` (service role) | Borrar un usuario desde el panel | `deleteUser()` |

## 3. Funciones RPC de Postgres

| RPC | Qué hace | Reemplazo local (`src/lib/local/rpc.js`) |
|---|---|---|
| `crear_pedido(items, direccion)` | Crea pedido + detalle y descuenta stock de forma atómica | `crearPedido()` |
| `cancelar_pedido(p_pedido_id)` | Dueño o admin; solo si está Pendiente; repone stock | `cancelarPedido()` |
| `admin_actualizar_estado_pedido(...)` | Cambia estado; repone stock al cancelar y lo vuelve a descontar al reactivar | `adminActualizarEstadoPedido()` |
| `is_admin()` + políticas RLS | Permisos | `requireAdmin()` en `actions/admin.js` y validaciones en cada acción |

## 4. Variables de entorno

| Antes (Supabase) | Ahora (local) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ya no se usa |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ya no se usa |
| `SUPABASE_SERVICE_ROLE_KEY` | ya no se usa |
| — | `AUTH_SECRET`: secreto para firmar la cookie de sesión (obligatorio en producción) |
| — | `ADMIN_EMAIL` / `ADMIN_PASSWORD`: cuenta admin que se crea al generar la base |
| — | `LOCAL_DB_PATH` (opcional): ruta del archivo JSON |

## 5. Cómo funciona la base local

- `src/lib/local/seed.json`: datos iniciales (estados, categorías y los 20
  productos con sus traducciones). Las tablas de usuarios, pedidos y
  contactos arrancan vacías.
- `src/lib/local/db.js`: la primera vez copia el seed a `.data/db.json`
  (ignorado por git) y a partir de ahí lee y escribe ese archivo. Las
  escrituras se hacen de a una por vez y son "todo o nada".
- Para **resetear** la tienda, borrá `.data/db.json`.
- Para **hacerte admin** sin `ADMIN_EMAIL`/`ADMIN_PASSWORD`, poné
  `"admin": true` en tu perfil dentro de `.data/db.json`.
- **En Vercel** el disco es de solo lectura salvo `/tmp`, así que la base
  vive en `/tmp/surco-db.json`: funciona, pero **los datos nuevos (cuentas,
  pedidos, mensajes) se pierden** cada vez que la instancia se recicla y
  la tienda vuelve al catálogo inicial. Sirve para una demo de portfolio;
  para datos que duren hace falta una base externa.

## 6. Cómo volver a Supabase

1. En `src/lib/data.js`, `src/lib/actions/*.js` y `src/proxy.js`, borrar la
   implementación local y descomentar el bloque
   `IMPLEMENTACIÓN CON SUPABASE (desactivada)` del final.
2. Descomentar `src/lib/supabase/{client,server,admin}.js`.
3. Aplicar `supabase/schema.sql` en un proyecto nuevo y definir las variables
   `NEXT_PUBLIC_SUPABASE_*` y `SUPABASE_SERVICE_ROLE_KEY`.
4. Reactivar el `schedule` de `.github/workflows/supabase-keepalive.yml`.
