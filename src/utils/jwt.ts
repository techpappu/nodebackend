import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload { userId: string; role: "USER" | "ADMIN" }

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
