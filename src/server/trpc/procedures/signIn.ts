import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const signIn = baseProcedure
  .input(
    z.object({
      email: z.string().email("Email inválido"),
      password: z.string().min(1, "La contraseña es requerida"),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password } = input;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Email o contraseña incorrectos",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Email o contraseña incorrectos",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      message: "Inicio de sesión exitoso",
    };
  });
