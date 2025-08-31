import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requireAuth } from "~/server/utils/auth";
import { TRPCError } from "@trpc/server";

export const updateWorkout = baseProcedure
  .input(z.object({ 
    token: z.string(),
    id: z.number().int().positive("Workout ID must be a positive integer"),
    trainingTime: z.number().min(1, "Training time must be at least 1 minute"),
    trainingType: z.string().min(1, "Training type is required"),
    date: z.string().datetime(),
    sensations: z.string().min(1, "Sensations are required")
  }))
  .mutation(async ({ input }) => {
    const { userId } = requireAuth(input.token);
    
    // First verify the workout belongs to the user
    const existingWorkout = await db.workout.findFirst({
      where: {
        id: input.id,
        userId,
      },
    });
    
    if (!existingWorkout) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entrenamiento no encontrado",
      });
    }
    
    const workout = await db.workout.update({
      where: {
        id: input.id,
      },
      data: {
        trainingTime: input.trainingTime,
        trainingType: input.trainingType,
        date: new Date(input.date),
        sensations: input.sensations,
      },
    });
    
    return {
      success: true,
      workoutId: workout.id,
    };
  });
