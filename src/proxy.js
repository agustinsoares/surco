import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// IMPLEMENTACIÓN LOCAL: solo next-intl decide el locale. Ya no hace falta
// refrescar la sesión en cada request: la sesión local es una cookie firmada
// que se valida al leerla (src/lib/local/auth.js). La versión con Supabase
// quedó comentada al final del archivo.
export async function proxy(request) {
  const response = intlMiddleware(request);
  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|img/).*)"],
};

// ===========================================================================
// IMPLEMENTACIÓN CON SUPABASE (desactivada)
// ---------------------------------------------------------------------------
// Código original que leía/escribía en Supabase. Se dejó comentado para poder
// volver a usarlo: descomentarlo, borrar la implementación local de arriba y
// definir las variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
// (y SUPABASE_SERVICE_ROLE_KEY). Ver docs/datos-supabase.md.
// ===========================================================================
/*
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// 1) next-intl decide el locale (y redirige/reescribe si hace falta).
// 2) Sobre esa misma respuesta, refrescamos la sesión de Supabase (patrón
//    recomendado por @supabase/ssr) para que las cookies de auth viajen
//    actualizadas en cada request.
export async function proxy(request) {
  const response = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|img/).*)"],
};
*/
