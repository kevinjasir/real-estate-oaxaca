import Link from "next/link";

export default function NoAutorizadoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Cuenta en espera de activación
        </h1>
        <p className="text-gray-600 mb-6">
          Tu cuenta ha sido creada pero aún no está activa. Un administrador
          debe aprobar tu acceso antes de que puedas usar el panel.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Si crees que esto es un error, contacta al administrador del sistema.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
