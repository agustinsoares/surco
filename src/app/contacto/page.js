import Link from "next/link";
import { getUsuarioActual } from "@/lib/data";
import ContactoForm from "@/components/ContactoForm";

export default async function ContactoPage() {
  const usuario = await getUsuarioActual();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-3xl font-black">Contacto</h1>
      {usuario ? (
        <ContactoForm nombre={`${usuario.perfil?.nombre ?? ""} ${usuario.perfil?.apellidos ?? ""}`.trim()} usuario={usuario.perfil?.usuario} />
      ) : (
        <p className="card p-5">
          Iniciá sesión para enviarnos un mensaje.{" "}
          <Link href="/login?next=/contacto" className="font-semibold" style={{ color: "var(--brand)" }}>
            Iniciar sesión
          </Link>
        </p>
      )}
    </div>
  );
}
