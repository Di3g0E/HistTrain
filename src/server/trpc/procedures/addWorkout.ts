import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requireAuth } from "~/server/utils/auth";

export const addWorkout = baseProcedure
  .input(z.object({ 
    token: z.string(),
    trainingTime: z.number().min(1, "Training time must be at least 1 minute"),
    trainingType: z.string().min(1, "Training type is required"),
    date: z.string().datetime().refine((date) => {
      const parsed = new Date(date);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return parsed >= oneYearAgo && parsed <= tomorrow;
    }, "La fecha debe estar entre hace un año y mañana"),
    sensations: z.string().min(1, "Sensations are required")
  }))
  .mutation(async ({ input }) => {
    const { userId } = requireAuth(input.token);
    
    const workout = await db.workout.create({
      data: {
        trainingTime: input.trainingTime,
        trainingType: input.trainingType,
        date: new Date(input.date),
        sensations: input.sensations,
        userId,
      },
    });
    
    return {
      success: true,
      workoutId: workout.id,
    };
  });
