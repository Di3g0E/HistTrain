import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requireAuth } from "~/server/utils/auth";

export const addWorkout = baseProcedure
  .input(z.object({ 
    token: z.string(),
    trainingTime: z.number().min(1, "Training time must be at least 1 minute"),
    trainingType: z.string().min(1, "Training type is required"),
    date: z.string().datetime(),
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
