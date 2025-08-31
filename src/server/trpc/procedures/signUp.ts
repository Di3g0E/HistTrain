import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const signUp = baseProcedure
  .input(
    z.object({
      email: z.string().email("Email inválido"),
      password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
      name: z.string().min(1, "El nombre es requerido"),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ya existe un usuario con este email",
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return {
      user,
      message: "Usuario creado exitosamente",
    };
  });
