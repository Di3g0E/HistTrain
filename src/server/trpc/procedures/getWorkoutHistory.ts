import { z } from "zod";
import { requireAuth } from "~/server/utils/auth";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getWorkoutHistory = baseProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { userId } = requireAuth(input.token);
    
    const workouts = await db.workout.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return {
      workouts,
    };
  });
