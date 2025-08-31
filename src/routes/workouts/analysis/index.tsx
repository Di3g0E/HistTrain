import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, PieChart, Calendar, TrendingUp, Activity, Clock, Target, Award, Flame } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { MobileMenu } from "~/components/MobileMenu";
import { useTrainingTypesStore } from "~/stores/trainingTypesStore";
import { AuthGuard } from "~/components/AuthGuard";
import { useUserStore } from "~/stores/userStore";

export const Route = createFileRoute("/workouts/analysis/")({
  component: WorkoutAnalysis,
});

function WorkoutAnalysis() {
  const trpc = useTRPC();
  const { getTrainingTypeByName } = useTrainingTypesStore();
  const { token } = useUserStore();
  
  const workoutHistoryQuery = useQuery(
    trpc.getWorkoutHistory.queryOptions({ token: token || "" }, {
      enabled: !!token,
    })
  );
  const goalsQuery = useQuery(
    trpc.getGoals.queryOptions({ token: token || "" }, {
      enabled: !!token,
    })
  );

  // Helper function to calculate goal progress
  const calculateGoalProgress = (goal: any, workouts: any[]) => {
    const goalStart = new Date(goal.startDate);
    const now = new Date();
    
    let periodStart: Date;
    let periodEnd: Date;
    
    if (goal.type === 'weekly') {
      // Get start of current week (Monday)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - daysToMonday);
      periodStart.setHours(0, 0, 0, 0);
      
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
    } else {
      // Monthly goal
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    // Only consider workouts after the goal start date
    const effectiveStart = goalStart > periodStart ? goalStart : periodStart;
    
    const relevantWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= effectiveStart && workoutDate <= periodEnd;
    });
    
    let current = 0;
    if (goal.unit === 'workouts') {
      current = relevantWorkouts.length;
    } else {
      // hours
      current = Math.round(relevantWorkouts.reduce((sum, w) => sum + w.trainingTime, 0) / 60 * 10) / 10;
    }
    
    const percentage = Math.min((current / goal.targetValue) * 100, 100);
    
    return { current, percentage, isCompleted: percentage >= 100 };
  };

  // Helper functions for data processing
  const processWorkoutData = () => {
    if (!workoutHistoryQuery.data?.workouts) return null;

    const workouts = workoutHistoryQuery.data.workouts;
    
    // Training type distribution
    const typeDistribution = workouts.reduce((acc, workout) => {
      acc[workout.trainingType] = (acc[workout.trainingType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly training time
    const monthlyData = workouts.reduce((acc, workout) => {
      const month = new Date(workout.date).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + workout.trainingTime;
      return acc;
    }, {} as Record<string, number>);

    // Weekly pattern (day of week)
    const weeklyPattern = workouts.reduce((acc, workout) => {
      const dayOfWeek = new Date(workout.date).getDay();
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Recent streak calculation
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].date);
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1;
      } else if (i > 0) {
        const prevWorkoutDate = new Date(sortedWorkouts[i - 1].date);
        const daysBetween = Math.floor((prevWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysBetween <= 2) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      typeDistribution,
      monthlyData,
      weeklyPattern,
      currentStreak,
      totalWorkouts: workouts.length,
      totalTime: workouts.reduce((sum, w) => sum + w.trainingTime, 0),
      avgDuration: workouts.length ? Math.round(workouts.reduce((sum, w) => sum + w.trainingTime, 0) / workouts.length) : 0,
      thisMonthWorkouts: workouts.filter(w => {
        const workoutMonth = new Date(w.date).toISOString().slice(0, 7);
        const currentMonth = new Date().toISOString().slice(0, 7);
        return workoutMonth === currentMonth;
      }).length
    };
  };

  const data = processWorkoutData();

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[dayIndex];
  };

  const getTrainingTypeColor = (type: string) => {
    const trainingType = getTrainingTypeByName(type);
    return trainingType?.color || "from-gray-500 to-slate-500";
  };

  const getTrainingTypeIcon = (type: string) => {
    const trainingType = getTrainingTypeByName(type);
    return trainingType?.emoji || "🏃‍♂️";
  };

  if (workoutHistoryQuery.isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div className="flex items-center">
                  <Link 
                    to="/workouts"
                    className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mr-6"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver
                  </Link>
                  <div className="flex items-center">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                    <h1 className="ml-2 text-xl font-bold text-gray-900">Análisis de Entrenamientos</h1>
                  </div>
                </div>
                <MobileMenu currentPath="/workouts/analysis" />
              </div>
            </div>
          </header>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Analizando datos...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (workoutHistoryQuery.error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div className="flex items-center">
                  <Link 
                    to="/workouts"
                    className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mr-6"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver
                  </Link>
                  <div className="flex items-center">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                    <h1 className="ml-2 text-xl font-bold text-gray-900">Análisis de Entrenamientos</h1>
                  </div>
                </div>
                <MobileMenu currentPath="/workouts/analysis" />
              </div>
            </div>
          </header>
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600">Por favor, inténtalo de nuevo más tarde.</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!workoutHistoryQuery.data?.workouts.length) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div className="flex items-center">
                  <Link 
                    to="/workouts"
                    className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mr-6"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver
                  </Link>
                  <div className="flex items-center">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                    <h1 className="ml-2 text-xl font-bold text-gray-900">Análisis de Entrenamientos</h1>
                  </div>
                </div>
                <MobileMenu currentPath="/workouts/analysis" />
              </div>
            </div>
          </header>
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No hay datos para analizar</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Necesitas al menos algunos entrenamientos registrados para ver el análisis visual.
            </p>
            <Link 
              to="/workouts/new"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Activity className="h-5 w-5 mr-2" />
              Añadir entrenamiento
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link 
                  to="/workouts"
                  className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mr-6"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </Link>
                <div className="flex items-center">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                  <h1 className="ml-2 text-xl font-bold text-gray-900">Análisis de Entrenamientos</h1>
                </div>
              </div>
              <MobileMenu currentPath="/workouts/analysis" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Racha Actual</p>
                  <p className="text-2xl font-bold text-orange-600">{data?.currentStreak || 0}</p>
                  <p className="text-xs text-gray-500">días</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Este Mes</p>
                  <p className="text-2xl font-bold text-blue-600">{data?.thisMonthWorkouts || 0}</p>
                  <p className="text-xs text-gray-500">entrenamientos</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo Total</p>
                  <p className="text-2xl font-bold text-green-600">{Math.round((data?.totalTime || 0) / 60)}</p>
                  <p className="text-xs text-gray-500">horas</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">{data?.avgDuration || 0}</p>
                  <p className="text-xs text-gray-500">min/sesión</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Goals Progress */}
          {goalsQuery.data?.goals.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Target className="h-5 w-5 mr-2 text-indigo-600" />
                Progreso de Objetivos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goalsQuery.data.goals.map((goal) => {
                  const progress = calculateGoalProgress(goal, workoutHistoryQuery.data?.workouts || []);
                  const periodText = goal.type === 'weekly' ? 'esta semana' : `este mes`;
                  
                  return (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${progress.isCompleted ? 'bg-green-100' : 'bg-indigo-100'}`}>
                            {progress.isCompleted ? (
                              <Award className="h-5 w-5 text-green-600" />
                            ) : (
                              <Target className="h-5 w-5 text-indigo-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-900">
                              {goal.targetValue} {goal.unit === 'workouts' ? 'entrenamientos' : 'horas'}
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">
                              {goal.type === 'weekly' ? 'Semanal' : 'Mensual'}
                            </p>
                          </div>
                        </div>
                        {progress.isCompleted && (
                          <div className="text-green-600 text-xl">🎉</div>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-gray-600">Progreso {periodText}</span>
                          <span className={`font-medium ${progress.isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>
                            {progress.current} / {goal.targetValue} ({Math.round(progress.percentage)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress.isCompleted ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      {progress.isCompleted && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                          <p className="text-green-700 text-sm font-medium flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            ¡Objetivo completado!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <Link 
                  to="/workouts/goals"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Target className="h-4 w-4 mr-1" />
                  Gestionar objetivos
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Training Type Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                Distribución por Tipo
              </h3>
              <div className="space-y-4">
                {data && Object.entries(data.typeDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => {
                    const percentage = Math.round((count / data.totalWorkouts) * 100);
                    return (
                      <div key={type} className="flex items-center">
                        <span className="text-lg mr-3">{getTrainingTypeIcon(type)}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{type}</span>
                            <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-gradient-to-r ${getTrainingTypeColor(type)} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Weekly Pattern */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                Patrón Semanal
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                  const count = data?.weeklyPattern[day] || 0;
                  const maxCount = Math.max(...Object.values(data?.weeklyPattern || {}));
                  const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={day} className="text-center">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        {getDayName(day)}
                      </div>
                      <div 
                        className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          intensity > 75 ? 'bg-indigo-600 text-white' :
                          intensity > 50 ? 'bg-indigo-400 text-white' :
                          intensity > 25 ? 'bg-indigo-200 text-indigo-800' :
                          intensity > 0 ? 'bg-indigo-100 text-indigo-600' :
                          'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Días más activos: {Object.entries(data?.weeklyPattern || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 2)
                    .map(([day]) => getDayName(parseInt(day)))
                    .join(' y ')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
              Tendencia Mensual de Tiempo de Entrenamiento
            </h3>
            <div className="overflow-x-auto">
              <div className="flex items-end space-x-2 pb-4" style={{ minWidth: '600px' }}>
                {data && Object.entries(data.monthlyData)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, time]) => {
                    const maxTime = Math.max(...Object.values(data.monthlyData));
                    const height = maxTime > 0 ? (time / maxTime) * 200 : 0;
                    
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center">
                        <div className="relative mb-2">
                          <div 
                            className="bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 min-w-[40px]"
                            style={{ height: `${height}px` }}
                          ></div>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
                            {Math.round(time / 60)}h
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 text-center font-medium">
                          {formatMonth(month)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
