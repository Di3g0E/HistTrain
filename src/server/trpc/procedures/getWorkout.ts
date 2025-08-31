import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requireAuth } from "~/server/utils/auth";
import { TRPCError } from "@trpc/server";

export const getWorkout = baseProcedure
  .input(z.object({ 
    token: z.string(),
    id: z.number().int().positive("Workout ID must be a positive integer"),
  }))
  .query(async ({ input }) => {
    const { userId } = requireAuth(input.token);
    
    const workout = await db.workout.findFirst({
      where: {
        id: input.id,
        userId,
      },
    });
    
    if (!workout) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entrenamiento no encontrado",
      });
    }
    
    return workout;
  });
