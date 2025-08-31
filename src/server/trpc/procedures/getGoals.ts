import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requireAuth } from "~/server/utils/auth";

export const getGoals = baseProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { userId } = requireAuth(input.token);
    
    const goals = await db.workoutGoal.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return {
      goals,
    };
  });
