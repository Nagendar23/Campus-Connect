import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, { 
    expiresIn: config.jwt.accessTTL 
  } as any);
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, { 
    expiresIn: config.jwt.refreshTTL 
  } as any);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
}

export function getRefreshTokenExpiry(): Date {
  // Default 7 days
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
