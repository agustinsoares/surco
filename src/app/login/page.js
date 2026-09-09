import LoginForm from "@/components/LoginForm";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next?.toString() || "/cuenta";
  const desactivado = params?.desactivado === "1";

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-black">Iniciar sesión</h1>
      {desactivado && (
        <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Tu cuenta está desactivada. Contactanos si creés que es un error.
        </p>
      )}
      <LoginForm next={next} />
      <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
        ¿No tenés cuenta?{" "}
        <a href="/registro" className="font-semibold" style={{ color: "var(--brand)" }}>
          Registrate
        </a>
      </p>
    </div>
  );
}
