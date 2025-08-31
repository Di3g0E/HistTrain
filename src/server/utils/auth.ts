import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { env } from "~/server/env";

export interface AuthUser {
  userId: number;
  email: string;
}

export function verifyToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token inválido o expirado",
    });
  }
}

export function requireAuth(token?: string): AuthUser {
  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Token de autenticación requerido",
    });
  }
  
  return verifyToken(token);
}
