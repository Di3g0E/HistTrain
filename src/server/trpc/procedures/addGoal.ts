import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requireAuth } from "~/server/utils/auth";

export const addGoal = baseProcedure
  .input(z.object({ 
    token: z.string(),
    type: z.enum(['weekly', 'monthly']),
    targetValue: z.number().min(1, "Target value must be at least 1"),
    unit: z.enum(['workouts', 'hours']),
    startDate: z.string().datetime()
  }))
  .mutation(async ({ input }) => {
    const { userId } = requireAuth(input.token);
    
    // Deactivate any existing goals of the same type for this user
    await db.workoutGoal.updateMany({
      where: {
        userId,
        type: input.type,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const goal = await db.workoutGoal.create({
      data: {
        type: input.type,
        targetValue: input.targetValue,
        unit: input.unit,
        startDate: new Date(input.startDate),
        isActive: true,
        userId,
      },
    });
    
    return {
      success: true,
      goalId: goal.id,
    };
  });
