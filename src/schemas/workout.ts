import { z } from "zod";

export const workoutSchema = z.object({
  trainingTime: z.number()
    .min(1, "El tiempo debe ser mayor a 0")
    .max(480, "El tiempo no puede exceder 8 horas"),
  trainingType: z.string()
    .min(1, "Tipo de entrenamiento requerido")
    .max(50, "Tipo de entrenamiento muy largo"),
  sensations: z.string()
    .min(5, "Describe brevemente tus sensaciones")
    .max(500, "Descripción muy larga"),
  date: z.string().datetime().refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return parsed >= oneYearAgo && parsed <= tomorrow;
  }, "La fecha debe estar entre hace un año y mañana"),
});

export const goalSchema = z.object({
  type: z.enum(['weekly', 'monthly']),
  targetValue: z.number().min(1, "Target value must be at least 1").max(50, "Valor objetivo muy alto"),
  unit: z.enum(['workouts', 'hours']),
  startDate: z.string().datetime().refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    return parsed >= oneYearAgo && parsed <= oneYearFromNow;
  }, "La fecha debe estar entre hace un año y dentro de un año"),
});
