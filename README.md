# Surco — tienda de vinilos indie

Proyecto migrado desde una práctica universitaria (Java/JSP + PHP + MySQL) a
**Next.js 16 (App Router) + Supabase**, listo para hostear en **Vercel**.

Catálogo original: posters de fan-art. Reemplazado por vinilos de artistas
independientes (indie rock, electrónica, soul & jazz) para evitar problemas
de copyright y encajar mejor en un portfolio. Las 20 portadas del catálogo
son arte generado, sin ninguna imagen ni marca de terceros.

## Datos: ahora en local (Supabase desactivado)

El proyecto de Supabase del plan gratuito se cancelaba por inactividad, así
que la app ahora guarda todo en una **base local en un archivo JSON**
(`src/lib/local/`). El código de Supabase sigue en el repo, comentado, para
poder volver a usarlo. La lista completa de datos que se usaban en Supabase,
su reemplazo local y cómo revertirlo está en
[`docs/datos-supabase.md`](docs/datos-supabase.md).

Para correrlo:

```bash
cp .env.example .env.local   # completá AUTH_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD
npm install
npm run dev
```

La primera vez se crea `.data/db.json` con el catálogo y la cuenta admin.
Borrar ese archivo resetea la tienda. En Vercel la base vive en `/tmp` y se
reinicia cuando se recicla la instancia (las cuentas y pedidos nuevos no
son permanentes). Las secciones de abajo sobre Supabase quedan como
referencia histórica.

## Ya está hecho

- Proyecto de Supabase creado y con el schema aplicado (tablas, RLS, RPC de
  pedidos y catálogo de 20 vinilos). Nombre del proyecto: **surco**
  (organización `Chocolate Spain`, región `eu-west-1`).
- App completa: catálogo con búsqueda/filtro, carrito (localStorage),
  checkout con validación de pago (solo formato, no hay pasarela real),
  cuenta de usuario (datos, contraseña, historial de pedidos, cancelar
  pedido), contacto, y panel de administración (productos, pedidos con
  cambio de estado, usuarios, mensajes de contacto). Además hay una vista de
  demostración pública del panel admin en `/admin-demo` (con datos de
  ejemplo, de solo lectura) para que cualquiera pueda ver cómo funciona sin
  necesidad de loguearse ni poder modificar nada.
- `npm run build` y `npm run lint` pasan sin errores.
- Lógica de stock/pedidos verificada contra una base Postgres local antes de
  aplicarla en Supabase (creación de pedido atómica, cancelación repone
  stock, reactivar un pedido cancelado vuelve a descontar si hay stock).

## Lo que falta para que quede online (5-10 minutos)

### 1. Subir el código a un repo de GitHub

```bash
cd surco
git add -A
git commit -m "Surco: tienda de vinilos indie"
gh repo create surco --source=. --public --push   # o hacelo desde github.com
```

### 2. Importar el proyecto en Vercel

En [vercel.com/new](https://vercel.com/new), importá el repo. Vercel detecta
Next.js automáticamente, no hace falta tocar nada del build.

### 3. Variables de entorno en Vercel

En **Project Settings → Environment Variables**, cargá estas tres (Production
y Preview):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uqnrtmlzewsjzqygagda.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_BRofJ6Rixj-Dnjlf1uiuAw_EEjPLPdv` |
| `SUPABASE_SERVICE_ROLE_KEY` | la sacás de Supabase → Project Settings → API → "service_role" (secreta, no la subas a git) |

Las dos primeras son públicas (`NEXT_PUBLIC_...`) y están protegidas por Row
Level Security del lado de la base, así que no hay problema en que viajen al
navegador. La `SERVICE_ROLE_KEY` es secreta: solo la usa el server action que
borra un usuario desde el panel admin (`src/lib/actions/admin.js`), nunca
llega al cliente.

### 4. Redeploy

Después de cargar las variables, disparás un redeploy desde el dashboard de
Vercel (o hacés un commit vacío). Con eso ya queda online.

### 5. Crearte un usuario admin

1. Entrá a tu URL de Vercel → `/registro` y creá tu cuenta normal.
2. En Supabase → SQL Editor, corré (reemplazando el email):

```sql
update public.perfiles set admin = true
where id = (select id from auth.users where email = 'TU_EMAIL_AQUI');
```

3. Entrá a `/login` con esa misma cuenta y, ya en `/cuenta`, tocá el botón
   "Acceder al panel admin" (solo aparece si el usuario es admin).

## Estructura

```
src/
  app/            rutas (App Router) — tienda, carrito, checkout, cuenta, admin
  components/     UI + formularios cliente
  lib/
    actions/      Server Actions (auth, pedidos, contacto, admin)
    supabase/     clientes de Supabase (browser, server, admin/service-role)
    data.js       lecturas (Server Components)
supabase/
  schema.sql      schema completo + RLS + RPC + seed (ya aplicado en el proyecto)
scripts/
  generate_covers.py   genera las portadas de vinilo (arte procedural original)
public/img/covers/     las 20 portadas generadas
```

## Decisiones de la migración (vs. el proyecto original)

- **Auth**: reemplaza MD5 sin sal por Supabase Auth (bcrypt). No hay forma de
  migrar las contraseñas viejas — es un catálogo nuevo de todos modos.
- **Carrito**: sigue siendo 100% client-side (localStorage), igual que el
  original.
- **Creación de pedido**: pasó a ser una función RPC atómica en Postgres
  (`crear_pedido`) con `SELECT ... FOR UPDATE` para evitar condiciones de
  carrera en el stock — el proyecto original no tenía eso.
- **Dirección de envío**: ahora se congela en `pedidos.direccion_envio` en
  vez de siempre mirar el perfil actual (el original tenía ese bug/gap).
- **IDOR corregido**: ver/cancelar un pedido ajeno ya no es posible — queda
  garantizado por RLS, no solo por no mostrar el botón en la UI.
- **`usuarios.activo`**: ahora si bloquea el login (antes existía la columna
  pero no se usaba en ningún lado).
- Podés ver el detalle completo de qué se preservó, qué se corrigió y por
  qué en los comentarios de `supabase/schema.sql`.
