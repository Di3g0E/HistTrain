import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "~/stores/userStore";
import { Plus, History, Activity, TrendingUp, Clock, Calendar, LogIn, UserPlus } from "lucide-react";
import { MobileMenu } from "~/components/MobileMenu";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();

  // Redirect authenticated users to their workouts
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate({ to: "/workouts" });
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading while checking authentication
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">HistTrain</h1>
            </div>
            <nav className="hidden md:flex space-x-4">
              <Link to="/auth/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Registrarse
              </Link>
            </nav>
            <MobileMenu currentPath="/" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Lleva el Control de tu
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Entrenamiento</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Registra tus entrenamientos, sigue tu progreso y construye hábitos fitness duraderos. 
              Desde entrenamiento de fuerza hasta cardio, mantén todo organizado en un lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/auth/signup"
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg font-semibold text-lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Crear Cuenta Gratis
              </Link>
              <Link 
                to="/auth/login"
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg font-semibold text-lg border border-indigo-200"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Todo lo que Necesitas</h3>
            <p className="text-lg text-gray-600">Herramientas simples y poderosas para seguir tu progreso fitness</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full mb-6">
                <Clock className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Registra Duración</h4>
              <p className="text-gray-600">Registra cuánto tiempo entrenaste y construye consistencia</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-6">
                <Activity className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Múltiples Tipos</h4>
              <p className="text-gray-600">Desde entrenamiento de fuerza hasta cardio - registra cualquier tipo</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-6">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Sigue tu Progreso</h4>
              <p className="text-gray-600">Monitorea tus sensaciones y progreso después de cada sesión</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-6">¿Listo para Comenzar tu Viaje?</h3>
          <p className="text-xl text-indigo-100 mb-8">Únete a miles de atletas registrando su progreso</p>
          <Link 
            to="/auth/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg font-semibold text-lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Comenzar Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-indigo-400" />
            <span className="ml-2 text-xl font-bold">HistTrain</span>
          </div>
          <p className="text-gray-400">Sigue tu viaje fitness, un entrenamiento a la vez.</p>
        </div>
      </footer>
    </div>
  );
}
