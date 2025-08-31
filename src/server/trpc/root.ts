import {
  createCallerFactory,
  createTRPCRouter,
  baseProcedure,
} from "~/server/trpc/main";
import { signUp } from "~/server/trpc/procedures/signUp";
import { signIn } from "~/server/trpc/procedures/signIn";
import { getCurrentUser } from "~/server/trpc/procedures/getCurrentUser";
import { addWorkout } from "~/server/trpc/procedures/addWorkout";
import { getWorkout } from "~/server/trpc/procedures/getWorkout";
import { updateWorkout } from "~/server/trpc/procedures/updateWorkout";
import { getWorkoutHistory } from "~/server/trpc/procedures/getWorkoutHistory";
import { addGoal } from "~/server/trpc/procedures/addGoal";
import { getGoals } from "~/server/trpc/procedures/getGoals";
import { updateGoal } from "~/server/trpc/procedures/updateGoal";

export const appRouter = createTRPCRouter({
  // Authentication procedures
  signUp,
  signIn,
  getCurrentUser,
  
  // Existing procedures
  addWorkout,
  getWorkout,
  updateWorkout,
  getWorkoutHistory,
  addGoal,
  getGoals,
  updateGoal,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
