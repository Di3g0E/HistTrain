import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { requireAuth } from "~/server/utils/auth";
import { TRPCError } from "@trpc/server";

export const updateGoal = baseProcedure
  .input(z.object({ 
    token: z.string(),
    id: z.number(),
    type: z.enum(['weekly', 'monthly']).optional(),
    targetValue: z.number().min(1, "Target value must be at least 1").optional(),
    unit: z.enum(['workouts', 'hours']).optional(),
    startDate: z.string().datetime().optional(),
    isActive: z.boolean().optional()
  }))
  .mutation(async ({ input }) => {
    const { userId } = requireAuth(input.token);
    const { id, token, ...updateData } = input;
    
    // First verify the goal belongs to the user
    const existingGoal = await db.workoutGoal.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!existingGoal) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Objetivo no encontrado",
      });
    }
    
    // Convert startDate if provided
    const processedData = {
      ...updateData,
      ...(updateData.startDate && { startDate: new Date(updateData.startDate) })
    };

    const goal = await db.workoutGoal.update({
      where: { id },
      data: processedData,
    });
    
    return {
      success: true,
      goal,
    };
  });
