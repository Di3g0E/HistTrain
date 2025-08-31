import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Clock, Calendar, Activity, Heart } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { MobileMenu } from "~/components/MobileMenu";
import { useTrainingTypesStore } from "~/stores/trainingTypesStore";
import { AuthGuard } from "~/components/AuthGuard";
import { useUserStore } from "~/stores/userStore";

export const Route = createFileRoute("/workouts/new/")({
  component: AddWorkout,
});

const workoutSchema = z.object({
  trainingTime: z.number().min(1, "Training time must be at least 1 minute"),
  trainingType: z.string().min(1, "Please select a training type"),
  date: z.string().min(1, "Date is required"),
  sensations: z.string().min(1, "Please describe your sensations"),
});

type WorkoutForm = z.infer<typeof workoutSchema>;

function AddWorkout() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { trainingTypes } = useTrainingTypesStore();
  const { token } = useUserStore();
  
  const addWorkoutMutation = useMutation(trpc.addWorkout.mutationOptions({
    onSuccess: () => {
      toast.success("¡Entrenamiento añadido correctamente!");
      navigate({ to: "/workouts" });
    },
    onError: (error) => {
      toast.error("Error al añadir el entrenamiento");
      console.error(error);
    },
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutForm>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Today's date
    },
  });

  const onSubmit = (data: WorkoutForm) => {
    if (!token) {
      toast.error("Error de autenticación");
      return;
    }
    
    const dateTime = new Date(data.date + 'T12:00:00').toISOString();
    
    addWorkoutMutation.mutate({
      token,
      trainingTime: data.trainingTime,
      trainingType: data.trainingType,
      date: dateTime,
      sensations: data.sensations,
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <Activity className="h-6 w-6 text-indigo-600" />
                  <h1 className="ml-2 text-xl font-bold text-gray-900">Añadir Entrenamiento</h1>
                </div>
              </div>
              <MobileMenu currentPath="/workouts/new" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full mb-4">
                <Plus className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nuevo Entrenamiento</h2>
              <p className="text-gray-600">Registra los detalles de tu sesión de entrenamiento</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Training Time */}
              <div>
                <label htmlFor="trainingTime" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                  Duración del entrenamiento (minutos)
                </label>
                <input
                  id="trainingTime"
                  type="number"
                  min="1"
                  {...register("trainingTime", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="ej. 60"
                />
                {errors.trainingTime && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-4 h-4 mr-1">⚠️</span>
                    {errors.trainingTime.message}
                  </p>
                )}
              </div>

              {/* Training Type */}
              <div>
                <label htmlFor="trainingType" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Activity className="h-4 w-4 mr-2 text-indigo-600" />
                  Tipo de entrenamiento
                </label>
                <select
                  id="trainingType"
                  {...register("trainingType")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Selecciona un tipo</option>
                  {trainingTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.emoji} {type.name}
                    </option>
                  ))}
                </select>
                {errors.trainingType && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-4 h-4 mr-1">⚠️</span>
                    {errors.trainingType.message}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                  Fecha del entrenamiento
                </label>
                <input
                  id="date"
                  type="date"
                  {...register("date")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-4 h-4 mr-1">⚠️</span>
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Sensations */}
              <div>
                <label htmlFor="sensations" className="flex items-center mb-2 text-sm font-medium text-gray-700">
                  <Heart className="h-4 w-4 mr-2 text-indigo-600" />
                  ¿Cómo te sentiste?
                </label>
                <textarea
                  id="sensations"
                  rows={4}
                  {...register("sensations")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe cómo te sentiste durante y después del entrenamiento..."
                />
                {errors.sensations && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-4 h-4 mr-1">⚠️</span>
                    {errors.sensations.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={addWorkoutMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {addWorkoutMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Añadir Entrenamiento
                  </span>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
