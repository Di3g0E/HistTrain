import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Clock, Calendar, Activity, Heart, TrendingUp, Settings, Edit, BarChart3, Target } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { MobileMenu } from "~/components/MobileMenu";
import { useTrainingTypesStore } from "~/stores/trainingTypesStore";
import { AuthGuard } from "~/components/AuthGuard";
import { useUserStore } from "~/stores/userStore";

export const Route = createFileRoute("/workouts/")({
  component: WorkoutHistory,
});

function WorkoutHistory() {
  const trpc = useTRPC();
  const { getTrainingTypeByName } = useTrainingTypesStore();
  const { token, user } = useUserStore();
  
  const workoutHistoryQuery = useQuery(
    trpc.getWorkoutHistory.queryOptions({ token: token || "" }, {
      enabled: !!token,
    })
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getTrainingTypeIcon = (type: string) => {
    const trainingType = getTrainingTypeByName(type);
    return trainingType?.emoji || "🏃‍♂️";
  };

  const getTrainingTypeColor = (type: string) => {
    const trainingType = getTrainingTypeByName(type);
    return trainingType?.color || "from-indigo-500 to-purple-500";
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link 
                  to="/"
                  className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mr-6"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </Link>
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  <div className="ml-2">
                    <h1 className="text-xl font-bold text-gray-900">Historial de Entrenamientos</h1>
                    {user && <p className="text-sm text-gray-600">Bienvenido, {user.name}</p>}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/workouts/analysis"
                  className="hidden sm:inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Análisis
                </Link>
                <Link 
                  to="/workouts/goals"
                  className="hidden sm:inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Objetivos
                </Link>
                <Link 
                  to="/workouts/manage-types"
                  className="hidden sm:inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gestionar Tipos
                </Link>
                <Link 
                  to="/workouts/new"
                  className="hidden sm:inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir
                </Link>
                <MobileMenu currentPath="/workouts" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {workoutHistoryQuery.isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando entrenamientos...</p>
              </div>
            </div>
          ) : workoutHistoryQuery.error ? (
            <div className="text-center py-20">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar entrenamientos</h3>
              <p className="text-gray-600">Por favor, inténtalo de nuevo más tarde.</p>
            </div>
          ) : !workoutHistoryQuery.data?.workouts.length ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🏃‍♂️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">¡Empieza tu viaje fitness!</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Aún no tienes entrenamientos registrados. ¡Añade tu primer entrenamiento y comienza a seguir tu progreso!
              </p>
              <Link 
                to="/workouts/new"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Añadir primer entrenamiento
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center">
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <Activity className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Entrenamientos</p>
                      <p className="text-2xl font-bold text-gray-900">{workoutHistoryQuery.data.workouts.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tiempo Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {workoutHistoryQuery.data.workouts.reduce((total, workout) => total + workout.trainingTime, 0)} min
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Promedio por Sesión</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(workoutHistoryQuery.data.workouts.reduce((total, workout) => total + workout.trainingTime, 0) / workoutHistoryQuery.data.workouts.length)} min
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workout Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workoutHistoryQuery.data.workouts.map((workout) => (
                  <div key={workout.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${getTrainingTypeColor(workout.trainingType)}`}></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getTrainingTypeIcon(workout.trainingType)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{workout.trainingType}</h3>
                            <p className="text-sm text-gray-500 capitalize">{formatDate(workout.date)}</p>
                          </div>
                        </div>
                        <Link
                          to="/workouts/$workoutId/edit"
                          params={{ workoutId: workout.id.toString() }}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Link>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-4">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-medium">{workout.trainingTime} minutos</span>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-start">
                          <Heart className="h-4 w-4 mr-2 text-red-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Sensaciones:</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{workout.sensations}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
