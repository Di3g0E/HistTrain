import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const signUp = baseProcedure
  .input(
    z.object({
      email: z.string().email("Email inválido"),
      password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(128, "La contraseña es demasiado larga")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número"),
      name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es demasiado largo"),
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
