import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t py-10 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Surco. Vinilos de artistas independientes.</p>
        <div className="flex gap-5">
          <Link href="/tienda">Catálogo</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/admin/login">Panel admin</Link>
        </div>
      </div>
    </footer>
  );
}
