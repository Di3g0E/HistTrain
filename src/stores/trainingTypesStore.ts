import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface TrainingType {
  id: string;
  name: string;
  emoji: string;
  color: string; // Tailwind gradient class
}

interface TrainingTypesState {
  trainingTypes: TrainingType[];
  addTrainingType: (trainingType: Omit<TrainingType, 'id'>) => void;
  updateTrainingType: (id: string, updates: Partial<Omit<TrainingType, 'id'>>) => void;
  deleteTrainingType: (id: string) => void;
  getTrainingTypeByName: (name: string) => TrainingType | undefined;
}

const defaultTrainingTypes: TrainingType[] = [
  {
    id: '1',
    name: 'Musculación/Fuerza',
    emoji: '💪',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: '2',
    name: 'Carrera',
    emoji: '🏃‍♂️',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'Fartlek',
    emoji: '🏃‍♀️',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    name: 'Sprints',
    emoji: '⚡',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: '5',
    name: 'Bicicleta',
    emoji: '🚴‍♂️',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: '6',
    name: 'Natación',
    emoji: '🏊‍♂️',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: '7',
    name: 'Yoga',
    emoji: '🧘‍♀️',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: '8',
    name: 'Pilates',
    emoji: '🤸‍♀️',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: '9',
    name: 'CrossFit',
    emoji: '🏋️‍♂️',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: '10',
    name: 'Cardio',
    emoji: '❤️',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: '11',
    name: 'Otro',
    emoji: '🏃‍♂️',
    color: 'from-gray-500 to-slate-500'
  }
];

export const useTrainingTypesStore = create<TrainingTypesState>()(
  persist(
    (set, get) => ({
      trainingTypes: defaultTrainingTypes,
      
      addTrainingType: (trainingType) => {
        set((state) => {
          const newId = uuidv4();
          return {
            trainingTypes: [
              ...state.trainingTypes,
              { ...trainingType, id: newId }
            ]
          };
        });
      },
      
      updateTrainingType: (id, updates) => {
        set((state) => ({
          trainingTypes: state.trainingTypes.map((type) =>
            type.id === id ? { ...type, ...updates } : type
          )
        }));
      },
      
      deleteTrainingType: (id) => {
        set((state) => ({
          trainingTypes: state.trainingTypes.filter((type) => type.id !== id)
        }));
      },
      
      getTrainingTypeByName: (name) => {
        return get().trainingTypes.find((type) => type.name === name);
      }
    }),
    {
      name: 'training-types-store',
    }
  )
);
