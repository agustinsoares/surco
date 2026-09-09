import LoginForm from "@/components/LoginForm";

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const sinPermiso = params?.sinpermiso === "1";

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-black">Acceso administración</h1>
      {sinPermiso && (
        <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Esa cuenta no tiene permisos de administrador.
        </p>
      )}
      <LoginForm next="/admin/productos" />
    </div>
  );
}
