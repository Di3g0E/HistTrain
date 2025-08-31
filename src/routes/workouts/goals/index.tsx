import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Target, Plus, Edit, Trash2, Calendar, Clock, Trophy, CheckCircle } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MobileMenu } from "~/components/MobileMenu";
import { AuthGuard } from "~/components/AuthGuard";
import { useUserStore } from "~/stores/userStore";
import toast from "react-hot-toast";
import { useState } from "react";

export const Route = createFileRoute("/workouts/goals/")({
  component: WorkoutGoals,
});

const goalSchema = z.object({
  type: z.enum(['weekly', 'monthly']),
  targetValue: z.number().min(1, "El valor objetivo debe ser al menos 1"),
  unit: z.enum(['workouts', 'hours']),
  startDate: z.string().min(1, "La fecha de inicio es requerida")
});

type GoalFormData = z.infer<typeof goalSchema>;

function WorkoutGoals() {
  const trpc = useTRPC();
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const { token } = useUserStore();
  
  const goalsQuery = useQuery(
    trpc.getGoals.queryOptions({ token: token || "" }, {
      enabled: !!token,
    })
  );
  const workoutHistoryQuery = useQuery(
    trpc.getWorkoutHistory.queryOptions({ token: token || "" }, {
      enabled: !!token,
    })
  );
  
  const addGoalMutation = useMutation(trpc.addGoal.mutationOptions({
    onSuccess: () => {
      toast.success("¡Objetivo creado exitosamente!");
      goalsQuery.refetch();
      reset();
    },
    onError: (error) => {
      toast.error("Error al crear objetivo: " + error.message);
    }
  }));

  const updateGoalMutation = useMutation(trpc.updateGoal.mutationOptions({
    onSuccess: () => {
      toast.success("¡Objetivo actualizado exitosamente!");
      goalsQuery.refetch();
      setEditingGoal(null);
      reset();
    },
    onError: (error) => {
      toast.error("Error al actualizar objetivo: " + error.message);
    }
  }));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = (data: GoalFormData) => {
    if (!token) {
      toast.error("Error de autenticación");
      return;
    }
    
    const startDate = new Date(data.startDate).toISOString();
    
    if (editingGoal) {
      updateGoalMutation.mutate({
        token,
        id: editingGoal.id,
        ...data,
        startDate
      });
    } else {
      addGoalMutation.mutate({
        token,
        ...data,
        startDate
      });
    }
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setValue('type', goal.type);
    setValue('targetValue', goal.targetValue);
    setValue('unit', goal.unit);
    setValue('startDate', new Date(goal.startDate).toISOString().split('T')[0]);
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    reset({
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const deactivateGoal = (goalId: number) => {
    if (!token) {
      toast.error("Error de autenticación");
      return;
    }
    
    updateGoalMutation.mutate({
      token,
      id: goalId,
      isActive: false
    });
  };

  // Calculate goal progress
  const calculateProgress = (goal: any) => {
    if (!workoutHistoryQuery.data?.workouts) return { current: 0, percentage: 0 };
    
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
    
    const relevantWorkouts = workoutHistoryQuery.data.workouts.filter(workout => {
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
    
    return { current, percentage };
  };

  const getGoalPeriodText = (goal: any) => {
    if (goal.type === 'weekly') {
      return 'esta semana';
    } else {
      const now = new Date();
      return `este mes (${now.toLocaleDateString('es-ES', { month: 'long' })})`;
    }
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
                  to="/workouts"
                  className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors mr-6"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </Link>
                <div className="flex items-center">
                  <Target className="h-6 w-6 text-indigo-600" />
                  <h1 className="ml-2 text-xl font-bold text-gray-900">Objetivos de Entrenamiento</h1>
                </div>
              </div>
              <MobileMenu currentPath="/workouts/goals" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Goal Form */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-indigo-600" />
                {editingGoal ? 'Editar Objetivo' : 'Crear Nuevo Objetivo'}
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Objetivo
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Objetivo
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register('targetValue', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: 4"
                  />
                  {errors.targetValue && (
                    <p className="text-red-500 text-sm mt-1">{errors.targetValue.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad
                  </label>
                  <select
                    {...register('unit')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="workouts">Entrenamientos</option>
                    <option value="hours">Horas</option>
                  </select>
                  {errors.unit && (
                    <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={addGoalMutation.isPending || updateGoalMutation.isPending}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {editingGoal ? 'Actualizar Objetivo' : 'Crear Objetivo'}
                  </button>
                  {editingGoal && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Current Goals */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-indigo-600" />
                Objetivos Actuales
              </h2>

              {goalsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : !goalsQuery.data?.goals.length ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes objetivos activos</p>
                  <p className="text-sm text-gray-400">Crea tu primer objetivo para empezar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goalsQuery.data.goals.map((goal) => {
                    const progress = calculateProgress(goal);
                    const isCompleted = progress.percentage >= 100;
                    
                    return (
                      <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-indigo-100'}`}>
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : goal.type === 'weekly' ? (
                                <Calendar className="h-5 w-5 text-indigo-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-indigo-600" />
                              )}
                            </div>
                            <div className="ml-3">
                              <h3 className="font-medium text-gray-900">
                                {goal.targetValue} {goal.unit === 'workouts' ? 'entrenamientos' : 'horas'} {goal.type === 'weekly' ? 'por semana' : 'por mes'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Desde {new Date(goal.startDate).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(goal)}
                              className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deactivateGoal(goal.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Progreso {getGoalPeriodText(goal)}
                            </span>
                            <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>
                              {progress.current} / {goal.targetValue} ({Math.round(progress.percentage)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isCompleted ? 'bg-green-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                        
                        {isCompleted && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                            <p className="text-green-700 text-sm font-medium flex items-center">
                              <Trophy className="h-4 w-4 mr-1" />
                              ¡Objetivo completado! 🎉
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
