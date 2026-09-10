import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // No forzamos prefijo en el idioma por defecto: "/tienda" es español,
  // "/en/tienda" es inglés. Así no rompemos ningún link ya compartido.
  localePrefix: "as-needed",
});
