import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Edit2, Trash2, Settings, Palette } from "lucide-react";
import { useTrainingTypesStore, TrainingType } from "~/stores/trainingTypesStore";
import { MobileMenu } from "~/components/MobileMenu";
import { AuthGuard } from "~/components/AuthGuard";

export const Route = createFileRoute("/workouts/manage-types/")({
  component: ManageTrainingTypes,
});

const trainingTypeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "El nombre es demasiado largo"),
  emoji: z.string().min(1, "El emoji es requerido"),
  color: z.string().min(1, "Selecciona un color"),
});

type TrainingTypeForm = z.infer<typeof trainingTypeSchema>;

const colorOptions = [
  { name: 'Rojo a Rosa', value: 'from-red-500 to-pink-500', preview: 'bg-gradient-to-r from-red-500 to-pink-500' },
  { name: 'Azul a Cian', value: 'from-blue-500 to-cyan-500', preview: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { name: 'Verde a Esmeralda', value: 'from-green-500 to-emerald-500', preview: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { name: 'Amarillo a Naranja', value: 'from-yellow-500 to-orange-500', preview: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
  { name: 'Púrpura a Violeta', value: 'from-purple-500 to-violet-500', preview: 'bg-gradient-to-r from-purple-500 to-violet-500' },
  { name: 'Cian a Azul', value: 'from-cyan-500 to-blue-500', preview: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
  { name: 'Índigo a Púrpura', value: 'from-indigo-500 to-purple-500', preview: 'bg-gradient-to-r from-indigo-500 to-purple-500' },
  { name: 'Rosa a Rosa Fuerte', value: 'from-pink-500 to-rose-500', preview: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { name: 'Naranja a Rojo', value: 'from-orange-500 to-red-500', preview: 'bg-gradient-to-r from-orange-500 to-red-500' },
  { name: 'Gris a Pizarra', value: 'from-gray-500 to-slate-500', preview: 'bg-gradient-to-r from-gray-500 to-slate-500' },
];

function ManageTrainingTypes() {
  const [editingType, setEditingType] = useState<TrainingType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { 
    trainingTypes, 
    addTrainingType, 
    updateTrainingType, 
    deleteTrainingType 
  } = useTrainingTypesStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TrainingTypeForm>({
    resolver: zodResolver(trainingTypeSchema),
  });

  const selectedColor = watch('color');

  const handleAddType = (data: TrainingTypeForm) => {
    addTrainingType(data);
    toast.success("¡Tipo de entrenamiento añadido!");
    reset();
    setShowAddForm(false);
  };

  const handleUpdateType = (data: TrainingTypeForm) => {
    if (editingType) {
      updateTrainingType(editingType.id, data);
      toast.success("¡Tipo de entrenamiento actualizado!");
      setEditingType(null);
      reset();
    }
  };

  const handleEdit = (type: TrainingType) => {
    setEditingType(type);
    setValue('name', type.name);
    setValue('emoji', type.emoji);
    setValue('color', type.color);
    setShowAddForm(false);
  };

  const handleDelete = (type: TrainingType) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${type.name}"?`)) {
      deleteTrainingType(type.id);
      toast.success("Tipo de entrenamiento eliminado");
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setShowAddForm(false);
    reset();
  };

  const onSubmit = editingType ? handleUpdateType : handleAddType;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <Settings className="h-6 w-6 text-indigo-600" />
                  <h1 className="ml-2 text-xl font-bold text-gray-900">Gestionar Tipos de Entrenamiento</h1>
                </div>
              </div>
              <MobileMenu currentPath="/workouts/manage-types" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Add New Type Button */}
          <div className="mb-8">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingType(null);
                reset();
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Nuevo Tipo
            </button>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingType) && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingType ? 'Editar Tipo de Entrenamiento' : 'Añadir Nuevo Tipo'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del tipo
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="ej. Calistenia"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji
                  </label>
                  <input
                    type="text"
                    {...register("emoji")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="🏋️‍♂️"
                  />
                  {errors.emoji && (
                    <p className="mt-1 text-sm text-red-600">{errors.emoji.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color del tema
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {colorOptions.map((color) => (
                      <label
                        key={color.value}
                        className={`relative flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                          selectedColor === color.value ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={color.value}
                          {...register("color")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full ${color.preview} mr-3`}></div>
                        <span className="text-sm">{color.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.color && (
                    <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {editingType ? 'Actualizar' : 'Añadir'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Training Types List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tipos de Entrenamiento</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {trainingTypes.map((type) => (
                <div key={type.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{type.emoji}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <div className="flex items-center mt-1">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${type.color} mr-2`}></div>
                        <span className="text-sm text-gray-500">Color del tema</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(type)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
