import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getCurrentUser = baseProcedure
  .input(
    z.object({
      token: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { token } = input;

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: number;
        email: string;
      };

      // Find user in database
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuario no encontrado",
        });
      }

      return { user };
    } catch (error) {
  if (error instanceof jwt.JsonWebTokenError) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token inválido",
    });
  }
  if (error instanceof jwt.TokenExpiredError) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token expirado",
    });
  }
  console.error('Error verificando token:', error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Error interno del servidor",
  });
}
  });
